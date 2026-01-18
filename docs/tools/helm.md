---
sidebar_position: 6
---

# Helm Charts & Package Management

## Overview

Helm is the package manager for Kubernetes, simplifying deployment and management of applications through reusable templates called charts.

## Core Concepts

### Helm Chart Structure
```
mlops-chart/
├── Chart.yaml           # Chart metadata
├── values.yaml          # Default configuration values
├── values-dev.yaml      # Dev environment overrides
├── values-qa.yaml       # QA environment overrides
├── values-prod.yaml     # Production environment overrides
├── templates/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   └── ingress.yaml
└── charts/              # Dependency charts
    └── postgres/
```

### Chart.yaml
```yaml
apiVersion: v2
name: mlops-platform
description: MLOps Platform Helm Chart
type: application
version: 1.0.0
appVersion: "1.0"
home: https://github.com/MLops-Project-Platform/mlops-helm-charts
keywords:
  - mlops
  - ml
  - training
maintainers:
  - name: MLOps Team
    email: team@mlops.com
dependencies:
  - name: postgresql
    version: "12.0"
    repository: "https://charts.bitnami.com/bitnami"
  - name: minio
    version: "12.0"
    repository: "https://charts.bitnami.com/bitnami"
```

## Values Files

### Default values.yaml
```yaml
# Replica counts
replicaCount: 3

# Image configuration
image:
  repository: mlops/platform
  pullPolicy: IfNotPresent
  tag: "latest"

# Service configuration
service:
  type: LoadBalancer
  port: 5000
  targetPort: 5000

# Resource limits
resources:
  limits:
    cpu: 4
    memory: 8Gi
  requests:
    cpu: 2
    memory: 4Gi

# Storage
persistence:
  enabled: true
  storageClass: default
  size: 100Gi

# Autoscaling
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
```

### Environment-specific overrides
```bash
# Deploy to development
helm install mlops ./mlops-chart -f values-dev.yaml -n mlops-dev

# Deploy to QA
helm install mlops ./mlops-chart -f values-qa.yaml -n mlops-qa

# Deploy to production
helm install mlops ./mlops-chart -f values-prod.yaml -n mlops-prod
```

## Common Helm Commands

### Install Chart
```bash
# Install with default values
helm install mlops ./mlops-chart -n mlops-prod --create-namespace

# Install with custom values
helm install mlops ./mlops-chart -f values-prod.yaml -n mlops-prod

# Install from repository
helm repo add mlops https://charts.mlops.com
helm install mlops mlops/mlops-platform
```

### Upgrade Chart
```bash
# Upgrade with new values
helm upgrade mlops ./mlops-chart -f values-prod.yaml -n mlops-prod

# Upgrade specific value
helm upgrade mlops ./mlops-chart \
  --set image.tag=v2.0 \
  -n mlops-prod

# Dry run to preview changes
helm upgrade mlops ./mlops-chart --dry-run --debug
```

### Manage Releases
```bash
# List releases
helm list -n mlops-prod

# Check release history
helm history mlops -n mlops-prod

# Rollback to previous version
helm rollback mlops 1 -n mlops-prod

# Uninstall release
helm uninstall mlops -n mlops-prod
```

### Debug Charts
```bash
# Render templates
helm template mlops ./mlops-chart

# Validate chart
helm lint ./mlops-chart

# Get chart values
helm get values mlops -n mlops-prod

# Inspect chart
helm show chart mlops-chart
```

## Templating

### Template Functions
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ include "mlops.fullname" . }}
  labels:
    {{- include "mlops.labels" . | nindent 4 }}
data:
  app.yaml: |
    {{- toYaml .Values.appConfig | nindent 4 }}
```

### Conditional Rendering
```yaml
{{- if .Values.persistence.enabled }}
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: {{ include "mlops.fullname" . }}-pvc
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: {{ .Values.persistence.storageClass }}
  resources:
    requests:
      storage: {{ .Values.persistence.size }}
{{- end }}
```

### Loops
```yaml
env:
{{- range $key, $value := .Values.env }}
  - name: {{ $key }}
    value: {{ $value | quote }}
{{- end }}
```

## Repository Management

### Add Repository
```bash
# Add Bitnami charts
helm repo add bitnami https://charts.bitnami.com/bitnami

# Add custom repository
helm repo add mlops https://charts.mlops.com

# List repositories
helm repo list

# Update repositories
helm repo update
```

### Search Charts
```bash
# Search in repositories
helm search repo postgresql

# Search hub
helm search hub mlops

# Show chart details
helm show chart mlops/mlops-platform
```

## Dependency Management

### Chart.yaml Dependencies
```yaml
dependencies:
  - name: postgresql
    version: "12.0"
    repository: "https://charts.bitnami.com/bitnami"
    condition: postgresql.enabled
  - name: redis
    version: "17.0"
    repository: "https://charts.bitnami.com/bitnami"
    condition: redis.enabled
```

### Manage Dependencies
```bash
# Update chart dependencies
helm dependency update ./mlops-chart

# List dependencies
helm dependency list ./mlops-chart

# Build dependencies
helm dependency build ./mlops-chart
```

## Best Practices

1. **Version Control** - Store charts in Git
2. **Chart Testing** - Use `helm test` to validate
3. **Values Organization** - Use separate files per environment
4. **Documentation** - Include README and examples
5. **Semantic Versioning** - Follow semver for chart versions
6. **Default Values** - Provide sensible defaults
7. **Namespace Isolation** - Use namespaces for environment separation

## Helm Hooks

Execute commands at specific points in release lifecycle:

```yaml
apiVersion: v1
kind: Pod
metadata:
  annotations:
    "helm.sh/hook": pre-install
    "helm.sh/hook-weight": "5"
spec:
  containers:
  - name: setup
    image: mlops/setup:latest
  restartPolicy: Never
```

## Testing Charts

```bash
# Validate chart syntax
helm lint ./mlops-chart

# Test chart templates
helm template test ./mlops-chart

# Run chart tests
helm test mlops -n mlops-prod
```

## Further Reading

- [Helm Official Documentation](https://helm.sh/docs/)
- [Helm Best Practices](https://helm.sh/docs/chart_best_practices/)
- [Bitnami Charts](https://github.com/bitnami/charts)
