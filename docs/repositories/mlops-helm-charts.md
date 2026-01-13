---
sidebar_position: 4
---

# mlops-helm-charts

**Repository:** `MLops-Project-Platform/mlops-helm-charts`

Helm charts for deploying the MLOps Platform to Kubernetes in a production-ready manner.

## Purpose

mlops-helm-charts provides:
- Pre-configured Helm charts for all services
- Kubernetes manifests with best practices
- High availability configuration
- Easy customization through values files
- Production deployment patterns
- Rolling updates and rollback support

## Repository Structure

```
mlops-helm-charts/
├── application.yaml         # Kustomize application definition
├── README.md               # Deployment guide
│
├── charts/
│   ├── mlflow/             # MLflow Helm chart
│   │   ├── Chart.yaml
│   │   ├── values.yaml
│   │   ├── values-prod.yaml
│   │   └── templates/
│   │       ├── deployment.yaml
│   │       ├── service.yaml
│   │       ├── configmap.yaml
│   │       ├── secret.yaml
│   │       └── ingress.yaml
│   │
│   ├── postgres/           # PostgreSQL Helm chart
│   │   ├── Chart.yaml
│   │   ├── values.yaml
│   │   └── templates/
│   │
│   ├── minio/              # MinIO Helm chart
│   │   ├── Chart.yaml
│   │   ├── values.yaml
│   │   └── templates/
│   │
│   └── trainer-job/        # Training job chart
│       ├── Chart.yaml
│       ├── values.yaml
│       └── templates/job.yaml
│
└── docs/                   # Deployment documentation
```

## Helm Basics

### What is Helm?

Helm is a package manager for Kubernetes that uses "charts" - templated Kubernetes manifests with customizable values.

### Key Concepts

- **Chart:** A package of Kubernetes configurations
- **Values:** Configuration parameters for a chart
- **Release:** An instance of a chart deployed in a cluster
- **Template:** Kubernetes manifest with variable substitution

## Quick Start

### 1. Prerequisites

```bash
# Install Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Verify
helm version

# Install kubectl
kubectl version --client

# Kubernetes cluster access
kubectl cluster-info
```

### 2. Add Helm Repository

```bash
# Add the MLOps charts repository
helm repo add mlops-platform https://github.com/MLops-Project-Platform/mlops-helm-charts

# Update repo
helm repo update
```

### 3. Create Namespace

```bash
kubectl create namespace mlops-platform
```

### 4. Install MLOps Stack

```bash
# Using default values
helm install mlops mlops-platform/mlops-stack \
  --namespace mlops-platform

# Using production values
helm install mlops mlops-platform/mlops-stack \
  --namespace mlops-platform \
  -f values-production.yaml

# With custom values
helm install mlops ./charts/mlflow \
  --namespace mlops-platform \
  --set mlflow.replicas=3 \
  --set postgres.storageSize=50Gi
```

### 5. Verify Installation

```bash
# Check Helm releases
helm list -n mlops-platform

# Check deployed resources
kubectl get all -n mlops-platform

# Check pods
kubectl get pods -n mlops-platform -o wide
```

## Chart Configuration

### MLflow Chart

`charts/mlflow/values.yaml`:

```yaml
replicaCount: 2

image:
  repository: ghcr.io/mlflow/mlflow
  tag: "2.0"
  pullPolicy: IfNotPresent

service:
  type: LoadBalancer
  port: 80
  targetPort: 5000

ingress:
  enabled: true
  className: nginx
  hosts:
    - host: mlflow.example.com
      paths:
        - path: /
          pathType: Prefix

resources:
  requests:
    memory: "512Mi"
    cpu: "250m"
  limits:
    memory: "1Gi"
    cpu: "500m"

autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 5
  targetCPUUtilizationPercentage: 80

persistence:
  enabled: true
  storageClass: "standard"
  size: "10Gi"
```

### PostgreSQL Chart

```yaml
postgresql:
  auth:
    username: mlflow
    password: "your-secure-password"
    database: mlflow
  
  primary:
    persistence:
      size: 20Gi
  
  metrics:
    enabled: true
```

### MinIO Chart

```yaml
minio:
  rootUser: minioadmin
  rootPassword: "your-secure-password"
  
  buckets:
    - name: mlflow-artifacts
      policy: public
  
  persistence:
    size: 50Gi
  
  replicas: 3  # For high availability
```

## Common Operations

### List Releases

```bash
helm list -n mlops-platform

# With more details
helm list -n mlops-platform -o wide
```

### View Deployed Values

```bash
# Get effective values
helm get values mlops -n mlops-platform

# Get full manifest
helm get manifest mlops -n mlops-platform
```

### Upgrade Release

```bash
# Upgrade with new values
helm upgrade mlops ./charts/mlflow \
  -n mlops-platform \
  --set mlflow.replicas=3

# Upgrade from values file
helm upgrade mlops mlops-platform/mlops-stack \
  -n mlops-platform \
  -f new-values.yaml
```

### Rollback

```bash
# View release history
helm history mlops -n mlops-platform

# Rollback to previous
helm rollback mlops -n mlops-platform

# Rollback to specific revision
helm rollback mlops 3 -n mlops-platform
```

### Uninstall

```bash
# Remove release (keeps PVCs)
helm uninstall mlops -n mlops-platform

# Remove everything including PVCs
helm uninstall mlops -n mlops-platform
kubectl delete pvc --all -n mlops-platform
```

## Values Files

### Development Values

`values-dev.yaml`:

```yaml
mlflow:
  replicas: 1
  resources:
    requests:
      memory: "256Mi"
      cpu: "100m"

postgres:
  persistence:
    size: 5Gi

minio:
  persistence:
    size: 10Gi
  replicas: 1
```

### Production Values

`values-prod.yaml`:

```yaml
mlflow:
  replicas: 3
  autoscaling:
    minReplicas: 3
    maxReplicas: 10
  resources:
    requests:
      memory: "1Gi"
      cpu: "500m"
    limits:
      memory: "2Gi"
      cpu: "1000m"

postgres:
  primary:
    persistence:
      size: 100Gi
  replication:
    enabled: true
    replicas: 3

minio:
  replicas: 3
  persistence:
    size: 200Gi

ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
  hosts:
    - host: mlops.company.com
      paths:
        - path: /
```

## Customization

### Custom Values File

Create `my-values.yaml`:

```yaml
# Override any values from charts
mlflow:
  replicas: 3

postgres:
  auth:
    password: "my-secure-password"

minio:
  persistence:
    size: 100Gi
```

Install with custom values:

```bash
helm install mlops ./charts/mlflow \
  -f my-values.yaml \
  -n mlops-platform
```

### Using Secrets

Store sensitive values separately:

```bash
# Create secret for credentials
kubectl create secret generic mlops-credentials \
  --from-literal=postgres-password="secret123" \
  --from-literal=minio-password="secret456" \
  -n mlops-platform

# Reference in values.yaml
postgres:
  auth:
    existingSecret: mlops-credentials
    secretKeys:
      adminPasswordKey: postgres-password
```

## Advanced Features

### High Availability

Enable replicas and persistence:

```yaml
mlflow:
  replicaCount: 3
  podDisruptionBudget:
    enabled: true
    minAvailable: 2

postgres:
  replicas: 3
  
minio:
  replicas: 3
```

### Resource Limits and Requests

```yaml
mlflow:
  resources:
    requests:
      memory: "512Mi"
      cpu: "250m"
    limits:
      memory: "1Gi"
      cpu: "500m"
```

### Auto-scaling

```yaml
mlflow:
  autoscaling:
    enabled: true
    minReplicas: 2
    maxReplicas: 10
    targetCPUUtilizationPercentage: 70
    targetMemoryUtilizationPercentage: 80
```

### Monitoring and Logging

```yaml
prometheus:
  enabled: true
  scrapeInterval: 30s

logging:
  enabled: true
  level: INFO
```

## Troubleshooting

### Check Release Status

```bash
# Helm release status
helm status mlops -n mlops-platform

# Kubernetes resources
kubectl get all -n mlops-platform
```

### View Logs

```bash
# MLflow logs
kubectl logs deployment/mlflow -n mlops-platform -f

# Specific pod
kubectl logs pod/mlflow-xxx -n mlops-platform -f
```

### Debug Values

```bash
# Show processed values
helm template mlops ./charts/mlflow \
  -f my-values.yaml > debug-manifest.yaml

# Check manifest
kubectl apply -f debug-manifest.yaml --dry-run=client
```

### Connection Issues

```bash
# Port forward to test
kubectl port-forward svc/mlflow 5000:80 -n mlops-platform

# Access locally
curl http://localhost:5000
```

## Best Practices

✅ **Do:**
- Use separate values files for dev/staging/prod
- Pin image tags (don't use latest)
- Set resource requests and limits
- Use persistent volumes for data
- Enable authentication
- Monitor and log
- Regular backups

❌ **Don't:**
- Hard-code values in charts
- Use latest image tags
- Skip resource limits
- Store secrets in values files
- Deploy without testing
- Ignore backup strategy

---

See [Deployment Guide](../deployment/kubernetes.md) for detailed production setup.
