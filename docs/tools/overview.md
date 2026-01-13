---
sidebar_position: 1
---

# Tools Overview

The MLOps Platform integrates several industry-standard tools and technologies to provide a complete ML infrastructure solution.

## Tool Stack

| Tool | Purpose | Port | Version |
|------|---------|------|---------|
| **MLflow** | Experiment tracking & model registry | 5000 | 2.x |
| **PostgreSQL** | Metadata database | 5432 | 14+ |
| **MinIO** | S3-compatible object storage | 9000/9001 | Latest |
| **Docker** | Container runtime | - | 20.10+ |
| **Kubernetes** | Orchestration | - | 1.24+ |
| **Nginx** | Reverse proxy | 80/443 | Latest |
| **Helm** | Kubernetes package manager | - | 3.x |

## Tools by Role

### For Researchers
- **MLflow** - Track experiments and manage models
- **Docker** - Run isolated training environments
- **Python** - Write training scripts

### For Platform Engineers
- **Kubernetes** - Deploy and scale infrastructure
- **Helm** - Manage complex deployments
- **Docker** - Build custom containers

### For All
- **PostgreSQL** - Reliable data persistence
- **MinIO** - Scalable artifact storage
- **Nginx** - Handle production traffic

## Quick Reference

### Accessing Tools Locally

```bash
# MLflow UI
curl http://localhost:5000

# MinIO Console
curl http://localhost:9001

# PostgreSQL
psql -h localhost -U mlflow -d mlflow
```

### Docker Commands

```bash
# View running containers
docker compose ps

# View logs
docker compose logs -f [service]

# Restart a service
docker compose restart [service]

# Access a container shell
docker compose exec [service] bash
```

---

Detailed documentation for each tool:
- [MLflow](./mlflow.md)
- [PostgreSQL](./postgres.md)
- [MinIO](./minio.md)
- [Docker](./docker.md)
- [Kubernetes](./kubernetes.md)
