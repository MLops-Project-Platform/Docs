---
sidebar_position: 2
---

# Kubernetes Deployment

Deploy the MLOps Platform documentation to Kubernetes.

## Prerequisites

- Kubernetes cluster (1.20+)
- kubectl configured
- Helm 3.x (optional)
- Container registry access (Docker Hub, ACR, ECR, etc.)

## Using kubectl

### Create Namespace

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: mlops-docs
```

Apply:

```bash
kubectl apply -f k8s/namespace.yaml
```

### Create Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mlops-docs
  namespace: mlops-docs
  labels:
    app: mlops-docs
spec:
  replicas: 3
  
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  
  selector:
    matchLabels:
      app: mlops-docs
  
  template:
    metadata:
      labels:
        app: mlops-docs
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "3000"
    
    spec:
      serviceAccountName: mlops-docs
      
      securityContext:
        fsGroup: 1001
      
      containers:
      - name: docs
        image: your-registry/mlops-docs:1.0
        imagePullPolicy: IfNotPresent
        
        ports:
        - name: http
          containerPort: 3000
          protocol: TCP
        
        env:
        - name: NODE_ENV
          value: production
        
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        
        livenessProbe:
          httpGet:
            path: /
            port: http
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        
        readinessProbe:
          httpGet:
            path: /
            port: http
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 2
        
        securityContext:
          runAsNonRoot: true
          runAsUser: 1001
          allowPrivilegeEscalation: false
          capabilities:
            drop:
              - ALL
```

Apply:

```bash
kubectl apply -f k8s/deployment.yaml
```

### Create Service

```yaml
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: mlops-docs
  namespace: mlops-docs
  labels:
    app: mlops-docs
spec:
  type: LoadBalancer
  
  ports:
  - port: 80
    targetPort: http
    protocol: TCP
    name: http
  
  selector:
    app: mlops-docs
```

Apply:

```bash
kubectl apply -f k8s/service.yaml
```

### Create Ingress

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: mlops-docs
  namespace: mlops-docs
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  
  tls:
  - hosts:
    - docs.mlops.example.com
    secretName: mlops-docs-tls
  
  rules:
  - host: docs.mlops.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: mlops-docs
            port:
              number: 80
```

Apply:

```bash
kubectl apply -f k8s/ingress.yaml
```

### Create Service Account (Optional)

```yaml
# k8s/serviceaccount.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: mlops-docs
  namespace: mlops-docs
```

## Using Helm

### Create Helm Chart

```bash
mkdir -p mlops-docs-chart
cd mlops-docs-chart
```

### Chart.yaml

```yaml
apiVersion: v2
name: mlops-docs
description: MLOps Platform Documentation
type: application
version: 1.0.0
appVersion: "1.0"

keywords:
  - documentation
  - mlops
  - docusaurus

home: https://github.com/MLops-Project-Platform
source:
  - https://github.com/MLops-Project-Platform

maintainers:
  - name: MLOps Team
    email: team@mlops.example.com
```

### values.yaml

```yaml
replicaCount: 3

image:
  registry: your-registry
  repository: mlops-docs
  tag: "1.0"
  pullPolicy: IfNotPresent

imagePullSecrets: []

service:
  type: LoadBalancer
  port: 80
  targetPort: 3000

ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
  
  hosts:
    - host: docs.mlops.example.com
      paths:
        - path: /
          pathType: Prefix
  
  tls:
    - secretName: mlops-docs-tls
      hosts:
        - docs.mlops.example.com

resources:
  requests:
    memory: "128Mi"
    cpu: "100m"
  limits:
    memory: "512Mi"
    cpu: "500m"

autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 80
  targetMemoryUtilizationPercentage: 80

nodeSelector: {}

tolerations: []

affinity: {}

nodeAffinity:
  preferredDuringSchedulingIgnoredDuringExecution:
    - weight: 100
      preference:
        matchExpressions:
          - key: node-type
            operator: In
            values:
              - documentation
```

### templates/deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "mlops-docs.fullname" . }}
  labels:
    {{- include "mlops-docs.labels" . | nindent 4 }}
spec:
  {{- if not .Values.autoscaling.enabled }}
  replicas: {{ .Values.replicaCount }}
  {{- end }}
  selector:
    matchLabels:
      {{- include "mlops-docs.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      labels:
        {{- include "mlops-docs.selectorLabels" . | nindent 8 }}
    spec:
      containers:
      - name: {{ .Chart.Name }}
        image: "{{ .Values.image.registry }}/{{ .Values.image.repository }}:{{ .Values.image.tag }}"
        imagePullPolicy: {{ .Values.image.pullPolicy }}
        ports:
        - name: http
          containerPort: 3000
          protocol: TCP
        livenessProbe:
          httpGet:
            path: /
            port: http
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: http
          initialDelaySeconds: 10
          periodSeconds: 5
        resources:
          {{- toYaml .Values.resources | nindent 12 }}
```

### Install with Helm

```bash
# Install
helm install mlops-docs ./mlops-docs-chart \
  --namespace mlops-docs \
  --create-namespace

# Verify
helm list -n mlops-docs

# Upgrade
helm upgrade mlops-docs ./mlops-docs-chart -n mlops-docs

# Uninstall
helm uninstall mlops-docs -n mlops-docs
```

## Verification

### Check Deployment Status

```bash
# Check pods
kubectl get pods -n mlops-docs

# Check services
kubectl get svc -n mlops-docs

# Check ingress
kubectl get ingress -n mlops-docs

# Describe deployment
kubectl describe deployment mlops-docs -n mlops-docs
```

### View Logs

```bash
# All pod logs
kubectl logs -l app=mlops-docs -n mlops-docs -f

# Specific pod
kubectl logs pod/mlops-docs-xxxxx -n mlops-docs -f
```

### Port Forwarding (Testing)

```bash
# Forward to local port
kubectl port-forward svc/mlops-docs 3000:80 -n mlops-docs

# Access at http://localhost:3000
```

## Scaling

### Manual Scaling

```bash
# Scale replicas
kubectl scale deployment mlops-docs --replicas=5 -n mlops-docs

# Verify
kubectl get pods -n mlops-docs -w
```

### Auto-scaling

```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: mlops-docs
  namespace: mlops-docs
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: mlops-docs
  
  minReplicas: 2
  maxReplicas: 10
  
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## Monitoring

### Prometheus Metrics

```yaml
# k8s/servicemonitor.yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: mlops-docs
  namespace: mlops-docs
spec:
  selector:
    matchLabels:
      app: mlops-docs
  
  endpoints:
  - port: http
    interval: 30s
    path: /metrics
```

### View Metrics

```bash
# Port forward to prometheus
kubectl port-forward -n prometheus svc/prometheus 9090:9090

# Access http://localhost:9090
```

## Troubleshooting

### Pod Won't Start

```bash
# Check pod status
kubectl describe pod mlops-docs-xxxxx -n mlops-docs

# View logs
kubectl logs mlops-docs-xxxxx -n mlops-docs

# Check image pull
kubectl get events -n mlops-docs
```

### Service Not Accessible

```bash
# Check service
kubectl get svc mlops-docs -n mlops-docs

# Check endpoints
kubectl get endpoints mlops-docs -n mlops-docs

# Test pod
kubectl exec -it mlops-docs-xxxxx -n mlops-docs -- wget localhost:3000
```

### Ingress Issues

```bash
# Check ingress
kubectl describe ingress mlops-docs -n mlops-docs

# Check ingress controller
kubectl get pods -n ingress-nginx

# Check certificate
kubectl get certificate -n mlops-docs
```

## Advanced: GitOps with ArgoCD

```yaml
# argocd-app.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: mlops-docs
  namespace: argocd
spec:
  project: default
  
  source:
    repoURL: https://github.com/MLops-Project-Platform/mlops-helm-charts
    targetRevision: main
    path: charts/docs
  
  destination:
    server: https://kubernetes.default.svc
    namespace: mlops-docs
  
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
    - CreateNamespace=true
```

---

Next: [Production Setup →](./production-setup.md)
