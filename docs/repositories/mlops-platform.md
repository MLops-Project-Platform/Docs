---
sidebar_position: 2
---

# mlops-platform

**Repository:** `MLops-Project-Platform/mlops-platform`

The core MLOps infrastructure containing everything needed to run the ML tracking and artifact management system.

## Purpose

mlops-platform provides:
- MLflow tracking server infrastructure
- PostgreSQL database backend
- MinIO S3 artifact storage
- Docker Compose setup for local development
- Kubernetes configurations for production
- Docker images for all services

## Repository Structure

```
mlops-platform/
├── Makefile                  # Build and deployment commands
├── README.md                 # Quick start guide
├── smoke_test.py            # Basic functionality test
│
├── docker-compose/          # Local development setup
│   ├── docker-compose.yml   # Service definitions
│   └── nginx-mlflow.conf    # Nginx configuration
│
├── kubernetes/              # K8s configurations
│   ├── base/                # Base configurations
│   │   ├── 00-namespace.yaml
│   │   ├── 01-secrets.yaml
│   │   ├── minio.yaml
│   │   ├── mlflow.yaml
│   │   ├── postgres.yaml
│   │   ├── training-job.yaml
│   │   └── training/job.yaml
│   └── kustomization.yaml   # Kustomize configuration
│
├── MLflow/                  # MLflow service
│   ├── Dockerfile.mlflow    # MLflow container
│   └── requirements.txt      # Python dependencies
│
└── training-runtime/        # Training job container
    ├── Dockerfile           # Training container
    └── requirements.txt      # Training dependencies
```

## Getting Started

### 1. Prerequisites

```bash
# Required
- Docker & Docker Compose 20.10+
- Python 3.8+
- Git

# Optional (for Kubernetes)
- kubectl 1.24+
- Helm 3.x
```

### 2. Quick Start (Docker Compose)

```bash
# Navigate to project
cd mlops-platform

# Start all services
cd docker-compose
docker compose up -d

# Verify services
docker compose ps

# Run smoke test
cd ..
python smoke_test.py
```

### 3. Access Services

```bash
# MLflow UI
http://localhost:5000

# MinIO Console
http://localhost:9001
  User: minioadmin
  Password: minioadmin123
```

## Services Overview

### MLflow Tracking Server
- **Image:** `python:3.10`
- **Port:** 5000
- **Role:** Central ML tracking system
- **Storage:** PostgreSQL (metadata), MinIO (artifacts)

### PostgreSQL
- **Image:** `postgres:14`
- **Port:** 5432
- **Role:** Metadata backend
- **Data:** Stored in named volume `postgres_data`

### MinIO
- **Image:** `minio/minio:latest`
- **Ports:** 9000 (API), 9001 (Console)
- **Role:** S3-compatible artifact storage
- **Data:** Stored in named volume `minio_data`

### Nginx
- **Image:** `nginx:latest`
- **Port:** 80
- **Role:** Reverse proxy, load balancing

## Common Operations

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f mlflow
docker compose logs -f postgres
docker compose logs -f minio
```

### Access Services

```bash
# MLflow shell
docker compose exec mlflow bash

# PostgreSQL shell
docker compose exec postgres psql -U mlflow -d mlflow

# MinIO shell
docker compose exec minio bash
```

### Database Management

```bash
# Backup database
docker compose exec postgres pg_dump -U mlflow mlflow > backup.sql

# List databases
docker compose exec postgres psql -U mlflow -l

# Connect to DB
docker compose exec postgres psql -U mlflow -d mlflow
```

### MinIO Operations

```bash
# Access MinIO container
docker compose exec minio sh

# List buckets
mc ls minio

# Create bucket
mc mb minio/my-bucket
```

## Configuration

### Environment Variables

Create `.env` file in `docker-compose/` directory:

```bash
# PostgreSQL
POSTGRES_USER=mlflow
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=mlflow

# MinIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=your_secure_password

# MLflow
MLFLOW_TRACKING_URI=http://mlflow:5000
MLFLOW_BACKEND_STORE_URI=postgresql://mlflow:your_secure_password@postgres:5432/mlflow
```

### Customize Services

Edit `docker-compose.yml`:

```yaml
# Example: Change ports
mlflow:
  ports:
    - "5001:5000"  # Host:Container
```

## Kubernetes Deployment

### Using kubectl

```bash
# Create namespace
kubectl create namespace mlops-platform

# Apply configurations
kubectl apply -f kubernetes/base/00-namespace.yaml
kubectl apply -f kubernetes/base/01-secrets.yaml
kubectl apply -f kubernetes/base/postgres.yaml
kubectl apply -f kubernetes/base/minio.yaml
kubectl apply -f kubernetes/base/mlflow.yaml
```

### Using Helm

See [mlops-helm-charts](./mlops-helm-charts.md) for detailed Helm deployment.

## Smoke Test

The repository includes a smoke test to verify basic functionality:

```bash
python smoke_test.py
```

This test:
1. Creates a connection to MLflow
2. Creates a new experiment
3. Logs metrics and artifacts
4. Verifies data was stored
5. Reports success/failure

## Troubleshooting

### Port Conflicts

```bash
# Change port in docker-compose.yml
services:
  mlflow:
    ports:
      - "5001:5000"  # Use different host port
```

### Services Won't Start

```bash
# Check logs
docker compose logs mlflow

# Validate configuration
docker compose config

# Rebuild images
docker compose build --no-cache
```

### Data Persistence

Volumes are used to persist data:
- `postgres_data` - PostgreSQL database
- `minio_data` - MinIO storage

To keep data after restart, don't use `docker compose down -v`.

## Production Considerations

### Security

- Change default MinIO credentials
- Use secrets management for PostgreSQL
- Enable authentication on MLflow
- Use TLS/HTTPS
- Network policies and firewalls

### Performance

- Tune PostgreSQL parameters
- Configure MinIO for high availability
- Use horizontal scaling for MLflow
- Add caching layer (Redis)
- Monitor resource usage

### Backups

```bash
# Automated backup strategy
# 1. Regular PostgreSQL dumps
# 2. MinIO bucket mirroring
# 3. Off-site storage
```

---

See [Quick Start](../getting-started/quick-start.md) for hands-on examples.
