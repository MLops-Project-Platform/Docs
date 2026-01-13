---
sidebar_position: 5
---

# Docker

## What is Docker?

Docker is a containerization platform that packages applications with all their dependencies into isolated containers, ensuring consistency across development, testing, and production environments.

## Role in MLOps Platform

Docker is used for:
- **Development** - Local testing with exact production environment
- **Distribution** - Ship code and dependencies together
- **MLflow Server** - Run MLflow in container
- **Training Jobs** - Containerized training workloads
- **Custom Services** - Any additional microservices

## Key Concepts

### Images
Blueprint for containers. Contains application code and dependencies.

### Containers
Running instance of an image. Isolated from host system.

### docker-compose
Tool for defining and running multi-container applications.

## Local Development

### Start Platform

```bash
cd mlops-platform/docker-compose
docker compose up -d
```

This starts:
- MLflow tracking server
- PostgreSQL database
- MinIO object storage
- Nginx reverse proxy

### View Status

```bash
# List running containers
docker compose ps

# View container logs
docker compose logs -f mlflow

# View specific service logs
docker compose logs mlflow postgres minio
```

### Enter Container

```bash
# Access MLflow container
docker compose exec mlflow bash

# Access PostgreSQL container
docker compose exec postgres bash

# Access MinIO container
docker compose exec minio bash
```

## Working with Images

### Build Custom Image

```dockerfile
FROM python:3.10

WORKDIR /app

# Copy requirements
COPY requirements.txt .

# Install dependencies
RUN pip install -r requirements.txt

# Copy application code
COPY . .

# Define entry point
CMD ["python", "train.py"]
```

Build the image:

```bash
docker build -t my-mlops-trainer:1.0 .
```

### Push to Registry

```bash
# Tag for registry
docker tag my-mlops-trainer:1.0 myregistry.azurecr.io/my-mlops-trainer:1.0

# Login to registry (e.g., Azure Container Registry)
az acr login --name myregistry

# Push image
docker push myregistry.azurecr.io/my-mlops-trainer:1.0
```

### List Images

```bash
# List all images
docker image ls

# List with filter
docker image ls --filter "reference=*mlops*"

# Get image details
docker image inspect my-mlops-trainer:1.0
```

## docker-compose Configuration

### Example: MLflow Service

```yaml
version: '3.8'

services:
  mlflow:
    image: python:3.10
    container_name: mlflow-server
    
    environment:
      MLFLOW_BACKEND_STORE_URI: postgresql://mlflow:mlflow@postgres:5432/mlflow
      MLFLOW_DEFAULT_ARTIFACT_ROOT: s3://mlflow-artifacts
      AWS_ACCESS_KEY_ID: minioadmin
      AWS_SECRET_ACCESS_KEY: minioadmin123
    
    ports:
      - "5000:5000"
    
    depends_on:
      - postgres
      - minio
    
    command: |
      bash -c "pip install mlflow &&
               mlflow server --backend-store-uri postgresql://mlflow:mlflow@postgres:5432/mlflow \
                            --default-artifact-root s3://mlflow-artifacts \
                            --host 0.0.0.0 --port 5000"

  postgres:
    image: postgres:14
    container_name: mlflow-postgres
    
    environment:
      POSTGRES_USER: mlflow
      POSTGRES_PASSWORD: mlflow
      POSTGRES_DB: mlflow
    
    ports:
      - "5432:5432"
    
    volumes:
      - postgres_data:/var/lib/postgresql/data

  minio:
    image: minio/minio:latest
    container_name: mlflow-minio
    
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin123
    
    ports:
      - "9000:9000"
      - "9001:9001"
    
    volumes:
      - minio_data:/data
    
    command: server /data --console-address ":9001"

volumes:
  postgres_data:
  minio_data:
```

## Common Docker Commands

```bash
# Container Management
docker compose up              # Start services
docker compose up -d           # Start in background
docker compose down            # Stop services
docker compose restart         # Restart services
docker compose logs -f         # View logs (follow)

# Cleanup
docker compose down -v         # Remove volumes too
docker system prune            # Remove unused resources

# Debugging
docker compose ps              # List services
docker compose exec <svc> bash # Enter container
docker compose logs <svc>      # View service logs
docker compose inspect <svc>   # Show configuration
```

## Best Practices

✅ **Do:**
- Use specific version tags (not latest)
- Keep images small and efficient
- Layer properly for caching
- Use .dockerignore file
- Run as non-root user
- Health checks

❌ **Don't:**
- Use latest tag in production
- Store credentials in images
- Run containers as root
- Create huge layers
- Ignore security warnings

## Performance Optimization

### Multi-stage Build

```dockerfile
# Build stage
FROM python:3.10 as builder

WORKDIR /app
COPY requirements.txt .
RUN pip install --user -r requirements.txt

# Final stage (smaller image)
FROM python:3.10-slim

COPY --from=builder /root/.local /root/.local
COPY . /app

ENV PATH=/root/.local/bin:$PATH
WORKDIR /app

CMD ["python", "train.py"]
```

### Caching Optimization

```dockerfile
# Put frequently changing lines last
FROM python:3.10

WORKDIR /app

# Install dependencies first (cached)
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy code last (changes frequently)
COPY . .

CMD ["python", "train.py"]
```

## Troubleshooting

### Out of Disk Space

```bash
# Check disk usage
docker system df

# Clean up
docker system prune -a  # Remove unused images

# Remove specific image
docker rmi <image-id>
```

### Port Already in Use

```bash
# Check what's using port
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # Mac/Linux

# Change port in docker-compose.yml
ports:
  - "5001:5000"  # Host:Container
```

### Container Won't Start

```bash
# Check logs
docker compose logs mlflow

# Check image
docker image inspect <image>

# Validate configuration
docker compose config
```

---

See [Training Guide](../researcher-guide/training.md) for containerizing training code.
