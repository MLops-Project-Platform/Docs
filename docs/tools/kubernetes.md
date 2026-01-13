---
sidebar_position: 6
---

# Kubernetes

## What is Kubernetes?

Kubernetes (K8s) is an open-source container orchestration platform for automating deployment, scaling, and management of containerized applications.

## Role in MLOps Platform

Kubernetes provides:
- **Production Deployment** - Scale MLOps platform across multiple nodes
- **High Availability** - Automatic failover and recovery
- **Resource Management** - Efficient CPU/memory allocation
- **Auto-scaling** - Scale based on demand
- **Network Management** - Service discovery and load balancing

## Core Concepts

### Pod
Smallest deployable unit containing one or more containers.

### Deployment
Manages replicas of pods, handles rolling updates.

### Service
Exposes pods as network endpoints, enables load balancing.

### StatefulSet
For stateful apps like databases that need stable identities.

### ConfigMap
Store non-sensitive configuration data.

### Secret
Store sensitive data (passwords, tokens).

## MLOps on Kubernetes

### Namespace Organization

```yaml
# Separate namespaces for different concerns
- mlops-platform (core services)
- mlops-training (training jobs)
- mlops-monitoring (observability)
```

### Core Services

```
mlops-platform/
├── mlflow (Deployment)
├── postgres (StatefulSet)
├── minio (StatefulSet)
└── nginx (Deployment)
```

### Training Jobs

```
mlops-training/
├── Training Job 1 (Pod)
├── Training Job 2 (Pod)
└── Training Job N (Pod)
```

## Helm Charts

We provide Helm charts for simplified Kubernetes deployment:

```bash
# Install MLOps platform
helm install mlops ./mlops-helm-charts \
  --namespace mlops-platform \
  --create-namespace
```

See [Helm Charts Repository](../repositories/mlops-helm-charts.md).

## Deployment Example

### Create Namespace

```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: mlops-platform
```

### Deploy MLflow

```yaml
# mlflow-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mlflow
  namespace: mlops-platform
spec:
  replicas: 2
  selector:
    matchLabels:
      app: mlflow
  template:
    metadata:
      labels:
        app: mlflow
    spec:
      containers:
      - name: mlflow
        image: ghcr.io/mlflow/mlflow:latest
        ports:
        - containerPort: 5000
        env:
        - name: MLFLOW_BACKEND_STORE_URI
          value: postgresql://mlflow:password@postgres:5432/mlflow
        - name: MLFLOW_DEFAULT_ARTIFACT_ROOT
          value: s3://mlflow-artifacts
        - name: AWS_ACCESS_KEY_ID
          valueFrom:
            secretKeyRef:
              name: minio-credentials
              key: access-key
        - name: AWS_SECRET_ACCESS_KEY
          valueFrom:
            secretKeyRef:
              name: minio-credentials
              key: secret-key
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
```

### Expose Service

```yaml
# mlflow-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: mlflow
  namespace: mlops-platform
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 5000
    protocol: TCP
  selector:
    app: mlflow
```

## Common kubectl Commands

```bash
# Cluster Info
kubectl get nodes
kubectl get namespaces
kubectl cluster-info

# Deployments
kubectl get deployments -n mlops-platform
kubectl describe deployment mlflow -n mlops-platform
kubectl logs -f deployment/mlflow -n mlops-platform

# Pods
kubectl get pods -n mlops-platform
kubectl exec -it pod/mlflow-xxxxx -n mlops-platform -- bash

# Services
kubectl get svc -n mlops-platform
kubectl port-forward svc/mlflow 5000:80 -n mlops-platform

# Scaling
kubectl scale deployment mlflow --replicas=3 -n mlops-platform

# Updates
kubectl set image deployment/mlflow mlflow=mlflow:2.0 -n mlops-platform
kubectl rollout status deployment/mlflow -n mlops-platform
kubectl rollout undo deployment/mlflow -n mlops-platform
```

## Monitoring and Logging

### Check Pod Status

```bash
kubectl get pods -n mlops-platform -o wide
```

### View Pod Logs

```bash
# Current logs
kubectl logs pod/mlflow-xxxxx -n mlops-platform

# Follow logs
kubectl logs -f pod/mlflow-xxxxx -n mlops-platform

# Previous logs (after restart)
kubectl logs --previous pod/mlflow-xxxxx -n mlops-platform
```

### Resource Usage

```bash
kubectl top nodes
kubectl top pods -n mlops-platform
```

## Troubleshooting

### Pod Won't Start

```bash
# Check events
kubectl describe pod mlflow-xxxxx -n mlops-platform

# Check logs
kubectl logs pod/mlflow-xxxxx -n mlops-platform

# Check resource limits
kubectl top pods -n mlops-platform
```

### Service Not Accessible

```bash
# Check service
kubectl get svc mlflow -n mlops-platform

# Check endpoints
kubectl get endpoints mlflow -n mlops-platform

# Test connectivity
kubectl run -it --rm debug --image=alpine --restart=Never -- \
  wget -O- http://mlflow:80
```

### Persistent Volume Issues

```bash
# List PVCs
kubectl get pvc -n mlops-platform

# Check PV status
kubectl get pv

# Describe PVC for errors
kubectl describe pvc postgres-data -n mlops-platform
```

## Security Best Practices

✅ **Do:**
- Use network policies
- Enable RBAC
- Use secrets for sensitive data
- Set resource limits
- Use image pull policies
- Regular backups

❌ **Don't:**
- Store secrets in ConfigMaps
- Run containers as root
- Use latest image tags
- Expose sensitive APIs
- Skip resource limits

---

See [Kubernetes Deployment Guide](../deployment/kubernetes.md) for detailed setup instructions.
