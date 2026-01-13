---
sidebar_position: 3
---

# Production Setup

Complete production-ready deployment of the MLOps Platform.

## Pre-deployment Checklist

### Infrastructure
- [ ] Kubernetes cluster (HA setup with 3+ nodes)
- [ ] Storage class configured
- [ ] Ingress controller installed
- [ ] TLS certificates ready
- [ ] Monitoring system (Prometheus/ELK)
- [ ] Logging system configured

### Security
- [ ] Network policies configured
- [ ] RBAC roles defined
- [ ] Secrets management (HashiCorp Vault/AWS Secrets Manager)
- [ ] Container registry authenticated
- [ ] Image scanning enabled

### DNS & SSL
- [ ] DNS records configured
- [ ] SSL certificates valid
- [ ] Certificate renewal automated
- [ ] Wildcard certificates if needed

### Backups
- [ ] Database backup strategy
- [ ] Artifact storage backup
- [ ] Configuration backups
- [ ] Disaster recovery plan

## Full Stack Deployment

### 1. Namespace and RBAC

```yaml
# production/01-namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: mlops-production
  labels:
    environment: production

---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: mlops-admin
  namespace: mlops-production

---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: mlops-admin
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: admin
subjects:
- kind: ServiceAccount
  name: mlops-admin
  namespace: mlops-production
```

### 2. Secrets Management

```yaml
# production/02-secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: mlflow-db-credentials
  namespace: mlops-production
type: Opaque
stringData:
  username: mlflow
  password: "your-secure-password-here"
  connection-string: "postgresql://mlflow:your-secure-password-here@postgres:5432/mlflow"

---
apiVersion: v1
kind: Secret
metadata:
  name: minio-credentials
  namespace: mlops-production
type: Opaque
stringData:
  access-key: "your-access-key"
  secret-key: "your-secret-key"

---
apiVersion: v1
kind: Secret
metadata:
  name: docker-registry-credentials
  namespace: mlops-production
type: docker-registry
data:
  .dockerconfigjson: # base64 encoded docker config
```

### 3. ConfigMaps

```yaml
# production/03-configmaps.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: mlflow-config
  namespace: mlops-production
data:
  mlflow.conf: |
    [mlflow]
    tracking_uri = http://mlflow:5000
    backend_store_uri = postgresql://mlflow@postgres:5432/mlflow
    default_artifact_root = s3://mlflow-artifacts

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: postgres-init
  namespace: mlops-production
data:
  init.sql: |
    CREATE USER IF NOT EXISTS mlflow;
    CREATE DATABASE IF NOT EXISTS mlflow;
    GRANT ALL PRIVILEGES ON DATABASE mlflow TO mlflow;
```

### 4. PostgreSQL StatefulSet (HA)

```yaml
# production/04-postgres.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: mlops-production
spec:
  serviceName: postgres
  replicas: 3
  
  selector:
    matchLabels:
      app: postgres
  
  template:
    metadata:
      labels:
        app: postgres
    
    spec:
      affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
          - labelSelector:
              matchExpressions:
              - key: app
                operator: In
                values:
                - postgres
            topologyKey: kubernetes.io/hostname
      
      containers:
      - name: postgres
        image: postgres:14-alpine
        
        ports:
        - containerPort: 5432
        
        env:
        - name: PGDATA
          value: /var/lib/postgresql/data/pgdata
        
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: mlflow-db-credentials
              key: username
        
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mlflow-db-credentials
              key: password
        
        - name: POSTGRES_DB
          value: mlflow
        
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        
        volumeMounts:
        - name: data
          mountPath: /var/lib/postgresql/data
        
        livenessProbe:
          exec:
            command:
            - /bin/sh
            - -c
            - pg_isready -U mlflow
          initialDelaySeconds: 30
          periodSeconds: 10
  
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 100Gi

---
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: mlops-production
spec:
  clusterIP: None
  selector:
    app: postgres
  ports:
  - port: 5432
```

### 5. MinIO StatefulSet (HA)

```yaml
# production/05-minio.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: minio
  namespace: mlops-production
spec:
  serviceName: minio
  replicas: 4
  
  selector:
    matchLabels:
      app: minio
  
  template:
    metadata:
      labels:
        app: minio
    
    spec:
      affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
          - labelSelector:
              matchExpressions:
              - key: app
                operator: In
                values:
                - minio
            topologyKey: kubernetes.io/hostname
      
      containers:
      - name: minio
        image: minio/minio:latest
        
        args:
        - server
        - http://minio-{0...3}.minio:9000/data
        
        ports:
        - containerPort: 9000
          name: api
        - containerPort: 9001
          name: console
        
        env:
        - name: MINIO_ROOT_USER
          valueFrom:
            secretKeyRef:
              name: minio-credentials
              key: access-key
        
        - name: MINIO_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: minio-credentials
              key: secret-key
        
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
        
        volumeMounts:
        - name: data
          mountPath: /data
        
        livenessProbe:
          httpGet:
            path: /minio/health/live
            port: api
          initialDelaySeconds: 10
          periodSeconds: 10
  
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 500Gi

---
apiVersion: v1
kind: Service
metadata:
  name: minio
  namespace: mlops-production
spec:
  clusterIP: None
  selector:
    app: minio
  ports:
  - port: 9000
    name: api
  - port: 9001
    name: console
```

### 6. MLflow Deployment (HA)

```yaml
# production/06-mlflow.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mlflow
  namespace: mlops-production
spec:
  replicas: 3
  
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  
  selector:
    matchLabels:
      app: mlflow
  
  template:
    metadata:
      labels:
        app: mlflow
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "5000"
    
    spec:
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - mlflow
              topologyKey: kubernetes.io/hostname
      
      containers:
      - name: mlflow
        image: ghcr.io/mlflow/mlflow:latest
        
        ports:
        - containerPort: 5000
        
        env:
        - name: MLFLOW_BACKEND_STORE_URI
          valueFrom:
            secretKeyRef:
              name: mlflow-db-credentials
              key: connection-string
        
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
        
        - name: MLFLOW_S3_ENDPOINT_URL
          value: http://minio:9000
        
        - name: AWS_S3_ALLOW_UNSAFE_RENAME
          value: "true"
        
        command:
        - mlflow
        - server
        - --backend-store-uri=$(MLFLOW_BACKEND_STORE_URI)
        - --default-artifact-root=$(MLFLOW_DEFAULT_ARTIFACT_ROOT)
        - --host=0.0.0.0
        - --port=5000
        
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        
        livenessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
        
        readinessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 10
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: mlflow
  namespace: mlops-production
spec:
  type: LoadBalancer
  selector:
    app: mlflow
  ports:
  - port: 80
    targetPort: 5000
    name: http
```

### 7. Ingress with TLS

```yaml
# production/07-ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: mlops-ingress
  namespace: mlops-production
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  
  tls:
  - hosts:
    - mlflow.example.com
    - docs.example.com
    - minio.example.com
    secretName: mlops-tls
  
  rules:
  - host: mlflow.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: mlflow
            port:
              number: 80
  
  - host: docs.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: mlops-docs
            port:
              number: 3000
  
  - host: minio.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: minio
            port:
              number: 9001
```

## Deployment

### Apply in Order

```bash
cd production

kubectl apply -f 01-namespace.yaml
kubectl apply -f 02-secrets.yaml
kubectl apply -f 03-configmaps.yaml
kubectl apply -f 04-postgres.yaml
kubectl apply -f 05-minio.yaml

# Wait for postgres and minio to be ready
kubectl wait --for=condition=Ready pod \
  -l app=postgres \
  -n mlops-production \
  --timeout=300s

# Then deploy mlflow
kubectl apply -f 06-mlflow.yaml
kubectl apply -f 07-ingress.yaml
```

### Verify

```bash
# Check all resources
kubectl get all -n mlops-production

# Check ingress
kubectl get ingress -n mlops-production

# View logs
kubectl logs -f deployment/mlflow -n mlops-production
```

## Monitoring and Alerting

Create monitoring stack monitoring for production health.

---

See [Container Management](../tools/docker.md) and [Kubernetes Guide](../tools/kubernetes.md) for more details.
