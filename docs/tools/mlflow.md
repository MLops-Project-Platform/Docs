---
sidebar_position: 2
---

# MLflow

## What is MLflow?

MLflow is an open-source platform for managing the complete machine learning lifecycle including experimentation, reproducibility, and deployment.

## Key Features

### 1. Experiment Tracking
Log and compare machine learning experiments with metrics, parameters, and artifacts.

```python
import mlflow

# Start experiment tracking
with mlflow.start_run():
    # Log parameters
    mlflow.log_param("learning_rate", 0.001)
    mlflow.log_param("epochs", 100)
    
    # Log metrics
    mlflow.log_metric("accuracy", 0.95)
    mlflow.log_metric("loss", 0.05)
    
    # Log artifacts (files)
    mlflow.log_artifact("model.pkl")
```

### 2. Model Registry
Version and manage models with clear staging (Development, Staging, Production).

```python
# Register a model
mlflow.sklearn.log_model(
    model, 
    artifact_path="models",
    registered_model_name="my_model"
)

# Promote to production
from mlflow.tracking import MlflowClient
client = MlflowClient()
client.transition_model_version_stage(
    name="my_model",
    version=2,
    stage="Production"
)
```

### 3. Experiment Comparison
Visually compare multiple runs in the web UI.

## Architecture

```
MLflow Server
├── Tracking Server (REST API)
├── Model Registry (Model versioning)
├── UI (Web interface)
└── Backend Store (PostgreSQL)
```

## Configuration

### Environment Variables

```bash
MLFLOW_TRACKING_URI=http://localhost:5000
MLFLOW_BACKEND_STORE_URI=postgresql://mlflow:mlflow@postgres:5432/mlflow
MLFLOW_DEFAULT_ARTIFACT_ROOT=s3://mlflow-artifacts
```

### S3 Configuration (MinIO)

```python
import os

os.environ['MLFLOW_S3_ENDPOINT_URL'] = 'http://minio:9000'
os.environ['AWS_ACCESS_KEY_ID'] = 'minioadmin'
os.environ['AWS_SECRET_ACCESS_KEY'] = 'minioadmin123'
```

## Common Tasks

### Set Experiment

```python
mlflow.set_experiment("my_experiment")

with mlflow.start_run():
    # Your training code here
    pass
```

### Query Experiments

```python
from mlflow.tracking import MlflowClient

client = MlflowClient()

# Get all experiments
experiments = client.list_experiments()

# Get experiment by name
exp = client.get_experiment_by_name("my_experiment")
print(exp.experiment_id)
```

### Search Runs

```python
# Find best run by metric
best_run = client.search_runs(
    experiment_ids=[exp_id],
    order_by=["metrics.accuracy DESC"]
)[0]

print(f"Best accuracy: {best_run.data.metrics['accuracy']}")
```

## API Reference

| Function | Purpose |
|----------|---------|
| `mlflow.set_experiment()` | Set active experiment |
| `mlflow.start_run()` | Start a new run |
| `mlflow.end_run()` | End current run |
| `mlflow.log_param()` | Log parameter |
| `mlflow.log_metric()` | Log metric |
| `mlflow.log_artifact()` | Log file artifact |
| `mlflow.log_model()` | Register and log model |

## UI Navigation

### Experiments Tab
- View all experiments
- Compare runs side-by-side
- Filter by metric ranges

### Models Tab
- Browse registered models
- View model versions
- Check staged transitions
- Deploy models

### Runs Tab
- View run details
- Download artifacts
- Compare parameter sets

## Best Practices

✅ **Do:**
- Log hyperparameters explicitly
- Use meaningful experiment names
- Commit code before logging runs
- Tag important runs
- Version your models

❌ **Don't:**
- Log too frequently (use batching)
- Store raw data as artifacts
- Ignore run status
- Mix unrelated runs in one experiment

## Troubleshooting

### Can't connect to MLflow
```bash
# Check if server is running
curl http://localhost:5000

# Check logs
docker compose logs mlflow
```

### S3/MinIO not working
```bash
# Test MinIO connection
curl -u minioadmin:minioadmin123 http://localhost:9000

# Check environment variables
env | grep AWS
```

---

See [Researcher Guide](../researcher-guide/overview.md) for practical examples.
