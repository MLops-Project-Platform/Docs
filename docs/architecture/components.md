---
sidebar_position: 1
---

# Component Details

## Component Interaction Flow

### Training Experiment Flow

```
1. Researcher writes code with MLflow tracking
                │
                ▼
2. Code connects to MLflow Tracking Server
                │
      ┌─────────┴─────────┐
      ▼                   ▼
3a. Metrics logged    3b. Artifacts saved
   (to PostgreSQL)      (to MinIO)
      │                   │
      └─────────┬─────────┘
                ▼
4. Run marked complete in MLflow
                │
                ▼
5. Researcher views results in MLflow UI
```

## Data Flow Diagram

```
┌──────────────────────────┐
│   Researcher's Code      │
│  (experiment tracking)   │
└────────────┬─────────────┘
             │
             │ HTTP/HTTPS
             ▼
┌──────────────────────────────────────┐
│      MLflow Tracking API             │
│    (Listening on port 5000)          │
└──────────┬─────────────────────────┬─┘
           │                         │
      (SQL)│                    (S3) │
           ▼                         ▼
    ┌────────────────┐    ┌──────────────────────┐
    │  PostgreSQL    │    │    MinIO S3 Storage  │
    │   Database     │    │   (Artifacts Bucket) │
    └────────────────┘    └──────────────────────┘
```

## Component Dependencies

```
mlops-research-template
  └── depends on → MLflow Server (Running)
                     └── depends on → PostgreSQL
                     └── depends on → MinIO
                     └── depends on → Nginx
```

## Storage Architecture

### PostgreSQL Tables
```
experiments/
  ├── experiment_id
  ├── name
  ├── lifecycle_stage
  └── ...

runs/
  ├── run_id
  ├── experiment_id
  ├── start_time
  ├── status
  └── ...

metrics/
  ├── run_id
  ├── key
  ├── value
  ├── timestamp
  └── ...

artifacts/
  ├── run_id
  ├── path
  └── ...
```

### MinIO Buckets
```
mlflow-artifacts/
  ├── {experiment_id}/
  │   ├── {run_id}/
  │   │   ├── artifacts/
  │   │   │   ├── model.pkl
  │   │   │   ├── plots/
  │   │   │   └── logs/
  │   │   └── params.json
```

---

See [Data Flow](./data-flow.md) for detailed flow information.
