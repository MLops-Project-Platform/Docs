---
sidebar_position: 7
---

# ArgoCD - GitOps for Kubernetes

## Overview

ArgoCD is a declarative, GitOps continuous deployment tool for Kubernetes. It synchronizes your cluster with Git repositories to maintain desired state.

## Core Concepts

### GitOps Workflow
```
Git Repository (Source of Truth)
         ↓
    ArgoCD
         ↓
Kubernetes Cluster (Actual State)
         ↓
    Monitoring
         ↓
If Drift Detected → Sync
```

### Application CRD
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: mlops-platform
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/MLops-Project-Platform/mlops-deployment
    targetRevision: main
    path: helm/mlops
    helm:
      values: |
        replicaCount: 3
  destination:
    server: https://kubernetes.default.svc
    namespace: mlops-prod
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
    - CreateNamespace=true
```

## Installation

### Install ArgoCD
```bash
# Create namespace
kubectl create namespace argocd

# Install ArgoCD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for deployment
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=argocd-server -n argocd --timeout=300s

# Port forward to access UI
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Get initial admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

## Application Management

### Create Application via CLI
```bash
argocd login localhost:8080 --username admin

argocd app create mlops-platform \
  --repo https://github.com/MLops-Project-Platform/mlops-deployment \
  --revision main \
  --path helm/mlops \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace mlops-prod
```

### Create Application from YAML
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: mlops-platform
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/MLops-Project-Platform/mlops-deployment
    targetRevision: main
    path: helm/mlops
  destination:
    server: https://kubernetes.default.svc
    namespace: mlops-prod
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

### Sync Applications
```bash
# Manual sync
argocd app sync mlops-platform

# Sync with info
argocd app sync mlops-platform --info

# Sync specific resource
argocd app sync mlops-platform --resource deployment:mlflow

# Refresh application status
argocd app refresh mlops-platform
```

## Multi-Environment Setup

### App of Apps Pattern
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: mlops-root
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/MLops-Project-Platform/mlops-deployment
    targetRevision: main
    path: argocd/apps
  destination:
    server: https://kubernetes.default.svc
    namespace: argocd
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

### Directory Structure
```
mlops-deployment/
├── argocd/
│   └── apps/
│       ├── dev.yaml
│       ├── qa.yaml
│       └── prod.yaml
├── helm/
│   └── mlops/
│       ├── Chart.yaml
│       ├── values-dev.yaml
│       ├── values-qa.yaml
│       └── values-prod.yaml
└── k8s/
    ├── base/
    │   └── kustomization.yaml
    └── overlays/
        ├── dev/
        ├── qa/
        └── prod/
```

### Environment-specific Applications
```yaml
# dev.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: mlops-dev
  namespace: argocd
spec:
  source:
    repoURL: https://github.com/MLops-Project-Platform/mlops-deployment
    targetRevision: dev
    path: helm/mlops
    helm:
      valuesFiles:
      - values-dev.yaml
  destination:
    namespace: mlops-dev

---
# qa.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: mlops-qa
  namespace: argocd
spec:
  source:
    repoURL: https://github.com/MLops-Project-Platform/mlops-deployment
    targetRevision: qa
    path: helm/mlops
    helm:
      valuesFiles:
      - values-qa.yaml
  destination:
    namespace: mlops-qa

---
# prod.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: mlops-prod
  namespace: argocd
spec:
  source:
    repoURL: https://github.com/MLops-Project-Platform/mlops-deployment
    targetRevision: main
    path: helm/mlops
    helm:
      valuesFiles:
      - values-prod.yaml
  destination:
    namespace: mlops-prod
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
    - PruneLast=true
```

## Notifications

### GitHub Integration
```bash
# Create GitHub OAuth token
# Add webhook to ArgoCD in GitHub settings

# Configure ArgoCD notification
kubectl create secret generic argocd-notifications-secret \
  --from-literal=github-token=<token> \
  -n argocd
```

### Slack Notifications
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-notifications-cm
  namespace: argocd
data:
  slack.yaml: |
    token: $slack-token
  template.yaml: |
    - name: app-deployed
      message: "Application {{.app.metadata.name}} deployed successfully"
  trigger.yaml: |
    - name: on-app-deployed
      - when: app.status.operationState.phase in ['Succeeded']
        oncePer: app.status.operationState.startedAt
        send: [app-deployed]
```

## RBAC and Access Control

### Create Project with RBAC
```yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: mlops-team
  namespace: argocd
spec:
  sourceRepos:
  - https://github.com/MLops-Project-Platform/*
  destinations:
  - namespace: 'mlops-*'
    server: https://kubernetes.default.svc
  clusterResourceBlacklist:
  - group: ''
    kind: ResourceQuota
  - group: ''
    kind: NetworkPolicy
```

## Advanced Features

### Kustomize Integration
```bash
argocd app create mlops-kustomize \
  --repo https://github.com/MLops-Project-Platform/mlops-deployment \
  --revision main \
  --path k8s/overlays/prod \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace mlops-prod
```

### Helm Values Override
```bash
argocd app set mlops-platform \
  --helm-set-string image.tag=v2.0 \
  --helm-set replicaCount=5
```

### Health Assessment
```bash
argocd app wait mlops-platform --health
```

## Troubleshooting

### Check Application Status
```bash
argocd app get mlops-platform
argocd app logs mlops-platform
```

### Sync Status
```bash
argocd app sync mlops-platform --info
argocd app wait mlops-platform --sync
```

### View Diff
```bash
argocd app diff mlops-platform
```

## Best Practices

1. **Git as Source of Truth** - All configuration in Git
2. **Automated Sync** - Enable `automated.prune` and `selfHeal`
3. **GitOps Workflow** - Create PRs for infrastructure changes
4. **Application of Applications** - Use App of Apps pattern for multi-env
5. **RBAC** - Implement proper access control
6. **Notifications** - Set up alerts for sync failures
7. **Backups** - Backup ArgoCD configuration and CRDs

## Further Reading

- [ArgoCD Official Documentation](https://argo-cd.readthedocs.io/)
- [GitOps Best Practices](https://codefresh.io/gitops/)
- [ArgoCD Patterns](https://github.com/argoproj-labs/argocd-patterns)
