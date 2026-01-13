---
sidebar_position: 2
---

# Quick Start

Get the MLOps Platform up and running in 5 minutes!

## Prerequisites

- Docker & Docker Compose installed
- Python 3.8+ (for researcher work)
- Git

## Step 1: Clone and Navigate

```bash
# Clone the platform repository
git clone https://github.com/MLops-Project-Platform/mlops-platform.git
cd mlops-platform/docker-compose
```

## Step 2: Start the Platform

```bash
docker compose up -d
```

This starts:
- MLflow Tracking Server
- PostgreSQL (metadata backend)
- MinIO S3 (artifact storage)
- Nginx (reverse proxy)

## Step 3: Access the Services

| Service | URL | Credentials |
|---------|-----|-------------|
| **MLflow UI** | http://localhost:5000 | No auth required |
| **MinIO Console** | http://localhost:9001 | `minioadmin` / `minioadmin123` |

## Step 4: Run Your First Experiment

### Option A: Using docker-compose (easiest)

```bash
# Check the smoke test
cd ..
python smoke_test.py
```

### Option B: Local Python Setup

```bash
# Clone the research template
git clone https://github.com/MLops-Project-Platform/mlops-research-template.git
cd mlops-research-template

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run training (make sure MLflow is running at http://localhost:5000)
python src/train.py
```

## Step 5: View Your Experiment

1. Open http://localhost:5000
2. Click on **Experiments** in the sidebar
3. You should see your training run with logged metrics and artifacts

## Common Commands

```bash
# View logs
docker compose logs -f mlflow

# Stop services
docker compose down

# Remove volumes (warning: deletes all data)
docker compose down -v

# Rebuild containers
docker compose build
```

## Next Steps

- 📚 [Learn about Tools & Components](../tools/overview.md)
- 👨‍🔬 [Complete Researcher Guide](../researcher-guide/overview.md)
- 🚀 [Deploy to Kubernetes](../deployment/kubernetes.md)

---

**Stuck?** Check the [Architecture](../architecture/overview.md) page or the detailed [Repositories Guide](../repositories/overview.md).
