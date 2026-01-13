---
sidebar_position: 2
---

# Data Flow

## Complete Request/Response Flow

### User Creates Experiment Run

```
┌─────────────────────────────────┐
│ Researcher Code                 │
│                                 │
│ import mlflow                   │
│ with mlflow.start_run():        │
│   mlflow.log_metric('acc', 0.9) │
│   mlflow.log_artifact(...)      │
└────────────────┬────────────────┘
                 │
                 │ POST /api/2.0/mlflow/runs/create
                 ▼
         ┌───────────────────┐
         │  MLflow Server    │
         │   (port 5000)     │
         └───────┬───────────┘
                 │
        ┌────────┴────────┐
        │                 │
   (SQL)│            (PUT)│
        ▼                 ▼
    ┌─────────────┐   ┌──────────────┐
    │ PostgreSQL  │   │  MinIO (S3)  │
    │ Transaction │   │  PUT object  │
    └─────────────┘   └──────────────┘
        │                 │
        └────────┬────────┘
                 │
                 ▼
         ┌───────────────────┐
         │ Response OK (200) │
         │ with run_id       │
         └───────────────────┘
```

### Viewing Results in UI

```
┌──────────────────────┐
│  MLflow Web UI       │
│  (http://loc:5000)   │
└──────┬───────────────┘
       │
       │ GET /api/2.0/mlflow/experiments/list
       ▼
┌──────────────────────────┐
│   MLflow Server          │
│   (port 5000)            │
└──────┬───────────────────┘
       │
       │ SELECT * FROM experiments
       ▼
┌──────────────────────────┐
│   PostgreSQL             │
│   Returns experiment IDs │
└──────┬───────────────────┘
       │
       │ JSON Response
       ▼
┌──────────────────────────┐
│   Browser renders table  │
│   of experiments         │
└──────────────────────────┘
```

### Artifact Download Flow

```
┌──────────────────────┐
│ Researcher requests  │
│ model artifact       │
└──────┬───────────────┘
       │
       │ GET /api/2.0/mlflow/artifacts/download
       ▼
┌──────────────────────────┐
│   MLflow Server          │
│   (port 5000)            │
└──────┬───────────────────┘
       │
       │ GET mlflow-artifacts/{run_id}/model.pkl
       ▼
┌──────────────────────────┐
│   MinIO (S3)             │
│   Returns object         │
└──────┬───────────────────┘
       │
       │ Binary data
       ▼
┌──────────────────────────┐
│ Researcher receives      │
│ model file locally       │
└──────────────────────────┘
```

## Sequence Diagram: Complete Training Run

```
Researcher    MLflow    PostgreSQL    MinIO
    │           │           │          │
    │ start_run │           │          │
    ├──────────>│ INSERT run│          │
    │           ├──────────>│          │
    │           │<──────────┤          │
    │           │ run_id    │          │
    │<──────────┤           │          │
    │           │           │          │
    │ log_param │           │          │
    ├──────────>│ INSERT    │          │
    │           ├──────────>│          │
    │           │<──────────┤          │
    │<──────────┤           │          │
    │           │           │          │
    │ log_metric│           │          │
    ├──────────>│ INSERT    │          │
    │           ├──────────>│          │
    │           │<──────────┤          │
    │<──────────┤           │          │
    │           │           │          │
    │ save artifact          │          │
    ├──────────>│           │ PUT obj  │
    │           ├──────────────────────>│
    │           │           │ success  │
    │           │<──────────────────────┤
    │<──────────┤           │          │
    │           │           │          │
    │ end_run   │           │          │
    ├──────────>│ UPDATE    │          │
    │           ├──────────>│          │
    │           │<──────────┤          │
    │<──────────┤           │          │
```

---

Understanding these flows helps in debugging issues and optimizing the system. See [Components](./components.md) for more details.
