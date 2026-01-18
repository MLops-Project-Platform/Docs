---
sidebar_position: 10
---

# CI/CD Pipelines

## Overview

CI/CD (Continuous Integration/Continuous Deployment) automates testing, building, and deploying of machine learning models and infrastructure.

## CI/CD Pipeline Stages

```
Code Push → Build → Test → Deploy to Dev → Deploy to QA → Deploy to Prod
```

### Stage 1: Build
- Compile code
- Build Docker images
- Run unit tests
- Code quality checks

### Stage 2: Test
- Integration tests
- End-to-end tests
- Performance tests
- Security scanning

### Stage 3: Deploy (Dev)
- Deploy to development environment
- Run smoke tests
- Log results to MLflow

### Stage 4: Deploy (QA)
- Manual approval required
- Deploy to staging environment
- Run load tests
- Validate performance

### Stage 5: Deploy (Production)
- Final approval gate
- Deploy to production
- Monitor for issues
- Rollback plan ready

## GitHub Actions

### Workflow Structure

**.github/workflows/mlops-pipeline.yaml:**
```yaml
name: MLOps CI/CD Pipeline

on:
  push:
    branches: [main, qa, dev]
  pull_request:
    branches: [main, qa, dev]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      image-tag: ${{ steps.meta.outputs.tags }}
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.10'
    
    - name: Install dependencies
      run: |
        pip install -r requirements.txt
        pip install pytest pytest-cov pylint
    
    - name: Lint code
      run: pylint src/
    
    - name: Run unit tests
      run: pytest tests/ -v --cov=src
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        files: ./coverage.xml
    
    - name: Build Docker image
      uses: docker/build-push-action@v4
      with:
        context: .
        push: false
        tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
        outputs: type=docker,dest=/tmp/image.tar
    
    - name: Load Docker image
      run: docker load --input /tmp/image.tar

  test:
    needs: build
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Run integration tests
      run: |
        docker-compose -f docker-compose.test.yml up --abort-on-container-exit
    
    - name: Run security scan
      run: |
        pip install bandit
        bandit -r src/

  deploy-dev:
    needs: [build, test]
    if: github.ref == 'refs/heads/dev'
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to Dev
      run: |
        kubectl apply -f k8s/dev/ --kubeconfig=${{ secrets.KUBECONFIG_DEV }}
    
    - name: Wait for deployment
      run: |
        kubectl rollout status deployment/mlops-platform -n mlops-dev

  deploy-qa:
    needs: [build, test]
    if: github.ref == 'refs/heads/qa'
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: https://qa.mlops.company.com
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to QA
      run: |
        kubectl apply -f k8s/qa/ --kubeconfig=${{ secrets.KUBECONFIG_QA }}
    
    - name: Run smoke tests
      run: |
        pytest tests/smoke/ -v
    
    - name: Notify deployment
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        text: 'QA deployment complete'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}

  deploy-prod:
    needs: [build, test]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://mlops.company.com
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to Production
      run: |
        kubectl apply -f k8s/prod/ --kubeconfig=${{ secrets.KUBECONFIG_PROD }}
    
    - name: Health check
      run: |
        curl -f https://mlops.company.com/health || exit 1
    
    - name: Notify team
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        text: 'Production deployment complete: ${{ github.sha }}'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Model Training CI/CD

**.github/workflows/model-training.yaml:**
```yaml
name: Model Training Pipeline

on:
  workflow_dispatch:
    inputs:
      config:
        description: 'Training config file'
        required: true
        default: 'configs/default.yaml'
      environment:
        description: 'Deployment environment'
        required: true
        type: choice
        options:
          - dev
          - qa
          - prod

jobs:
  train:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.10'
    
    - name: Install dependencies
      run: pip install -r requirements.txt
    
    - name: Validate config
      run: python scripts/validate_config.py ${{ github.event.inputs.config }}
    
    - name: Start training job
      env:
        MLFLOW_TRACKING_URI: ${{ secrets.MLFLOW_URI }}
        AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
        AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      run: |
        python src/train.py \
          --config ${{ github.event.inputs.config }} \
          --environment ${{ github.event.inputs.environment }}
    
    - name: Check model performance
      run: python scripts/check_performance.py
    
    - name: Register model
      if: success()
      run: python scripts/register_model.py ${{ github.event.inputs.environment }}
    
    - name: Send notification
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        text: 'Training completed for ${{ github.event.inputs.config }}'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## GitLab CI/CD

### .gitlab-ci.yml Configuration

```yaml
stages:
  - build
  - test
  - deploy-dev
  - deploy-qa
  - deploy-prod

variables:
  REGISTRY: gitlab.com
  IMAGE_NAME: $CI_PROJECT_NAME
  IMAGE_TAG: $CI_COMMIT_SHA

build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t $REGISTRY/$CI_PROJECT_NAMESPACE/$IMAGE_NAME:$IMAGE_TAG .
    - docker push $REGISTRY/$CI_PROJECT_NAMESPACE/$IMAGE_NAME:$IMAGE_TAG
  only:
    - dev
    - qa
    - main

test:
  stage: test
  image: python:3.10
  script:
    - pip install -r requirements.txt
    - pip install pytest pytest-cov
    - pytest tests/ -v --cov=src
  coverage: '/TOTAL.*\s+(\d+%)$/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage.xml

deploy_dev:
  stage: deploy-dev
  image: bitnami/kubectl:latest
  script:
    - kubectl apply -f k8s/dev/ --kubeconfig=$KUBE_CONFIG_DEV
    - kubectl rollout status deployment/mlops-platform -n mlops-dev
  only:
    - dev
  environment:
    name: development
    kubernetes:
      namespace: mlops-dev

deploy_qa:
  stage: deploy-qa
  image: bitnami/kubectl:latest
  script:
    - kubectl apply -f k8s/qa/ --kubeconfig=$KUBE_CONFIG_QA
    - kubectl rollout status deployment/mlops-platform -n mlops-qa
  only:
    - qa
  environment:
    name: staging
    kubernetes:
      namespace: mlops-qa
  when: manual

deploy_prod:
  stage: deploy-prod
  image: bitnami/kubectl:latest
  script:
    - kubectl apply -f k8s/prod/ --kubeconfig=$KUBE_CONFIG_PROD
    - kubectl rollout status deployment/mlops-platform -n mlops-prod
  only:
    - main
  environment:
    name: production
    kubernetes:
      namespace: mlops-prod
  when: manual
```

## Jenkins Pipeline

### Jenkinsfile

```groovy
pipeline {
    agent any
    
    environment {
        REGISTRY = 'docker.io'
        IMAGE_NAME = 'mlops/platform'
        IMAGE_TAG = "${BUILD_NUMBER}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build') {
            steps {
                script {
                    sh '''
                        docker build -t ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} .
                    '''
                }
            }
        }
        
        stage('Test') {
            steps {
                script {
                    sh '''
                        docker run --rm ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} pytest tests/
                    '''
                }
            }
        }
        
        stage('Push Image') {
            when {
                branch 'dev'
            }
            steps {
                script {
                    sh '''
                        docker push ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
                    '''
                }
            }
        }
        
        stage('Deploy to Dev') {
            when {
                branch 'dev'
            }
            steps {
                script {
                    sh '''
                        kubectl apply -f k8s/dev/ --kubeconfig=${KUBECONFIG_DEV}
                    '''
                }
            }
        }
        
        stage('Deploy to QA') {
            when {
                branch 'qa'
            }
            input {
                message "Deploy to QA?"
                ok "Deploy"
            }
            steps {
                script {
                    sh '''
                        kubectl apply -f k8s/qa/ --kubeconfig=${KUBECONFIG_QA}
                    '''
                }
            }
        }
        
        stage('Deploy to Prod') {
            when {
                branch 'main'
            }
            input {
                message "Deploy to Production?"
                ok "Deploy"
            }
            steps {
                script {
                    sh '''
                        kubectl apply -f k8s/prod/ --kubeconfig=${KUBECONFIG_PROD}
                    '''
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            slackSend(
                color: 'good',
                message: "Pipeline succeeded: ${env.JOB_NAME} ${env.BUILD_NUMBER}"
            )
        }
        failure {
            slackSend(
                color: 'danger',
                message: "Pipeline failed: ${env.JOB_NAME} ${env.BUILD_NUMBER}"
            )
        }
    }
}
```

## Best Practices

1. **Automate everything** - Code compilation, testing, deployment
2. **Fast feedback** - Run tests in parallel
3. **Environment parity** - Dev, QA, Prod should be similar
4. **Approval gates** - Require review before production
5. **Rollback capability** - Always plan rollback
6. **Monitoring** - Alert on pipeline failures
7. **Secrets management** - Use vaults for credentials
8. **Audit trail** - Log all deployments

## Troubleshooting

### Pipeline Failures

```bash
# Check workflow logs
gh workflow view <workflow-id> --log

# Retry failed job
gh run rerun <run-id>

# View specific job logs
gh run view <run-id> --log --json logs
```

### Deployment Issues

```bash
# Check Kubernetes logs
kubectl logs -f deployment/mlops-platform

# Describe deployment
kubectl describe deployment mlops-platform

# Check events
kubectl get events --sort-by='.lastTimestamp'
```

## Further Reading

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitLab CI/CD](https://docs.gitlab.com/ee/ci/)
- [Jenkins Documentation](https://www.jenkins.io/doc/)
