---
sidebar_position: 4
---

# Tracking Experiments

Master the art of tracking, managing, and comparing your machine learning experiments.

## MLflow Tracking Basics

### What Gets Tracked

```python
import mlflow

# All of these are tracked in MLflow:
with mlflow.start_run():
    # Parameters - configuration values
    mlflow.log_param("learning_rate", 0.001)
    
    # Metrics - performance values
    mlflow.log_metric("accuracy", 0.95)
    
    # Artifacts - files (models, plots, etc)
    mlflow.log_artifact("model.pkl")
```

### Accessing the MLflow UI

Open http://localhost:5000 in your browser:

```
Left Sidebar:
├── Experiments          (View all experiments)
├── Models              (View registered models)
└── Compare             (Compare multiple runs)

Main View:
├── Experiment name & description
├── List of runs
└── Run details (metrics, parameters, artifacts)
```

## Experiments

### Create Experiment

```python
import mlflow

# Set active experiment (creates if doesn't exist)
mlflow.set_experiment("my_first_experiment")

# Or explicitly create
from mlflow.tracking import MlflowClient
client = MlflowClient()
exp = client.create_experiment(
    "my_experiment",
    artifact_location="./artifacts"  # Optional
)
```

### List Experiments

```python
from mlflow.tracking import MlflowClient

client = MlflowClient("http://localhost:5000")
experiments = client.list_experiments()

for exp in experiments:
    print(f"{exp.name} (ID: {exp.experiment_id})")
```

### Delete Experiment

```python
client.delete_experiment(experiment_id)

# Or restore deleted
client.restore_experiment(experiment_id)
```

## Runs

### Start and End Runs

```python
import mlflow

# Start run (automatically assigned ID)
with mlflow.start_run():
    # Your code here
    pass

# Or manually manage lifecycle
run = mlflow.start_run()
run_id = run.info.run_id

# Do work...

mlflow.end_run()
```

### Named Runs

```python
# Descriptive run names help identify experiments
with mlflow.start_run(run_name="v1_baseline_lr0.001"):
    # Training code
    pass
```

### Get Run Information

```python
from mlflow.tracking import MlflowClient

client = MlflowClient()
run = client.get_run(run_id)

print(f"Status: {run.info.status}")
print(f"Start time: {run.info.start_time}")
print(f"Duration: {run.info.end_time - run.info.start_time}")
```

## Parameters

### Logging Parameters

```python
import mlflow

with mlflow.start_run():
    # Single parameter
    mlflow.log_param("model", "random_forest")
    mlflow.log_param("n_estimators", 100)
    
    # Multiple parameters
    params = {
        "max_depth": 10,
        "min_samples_split": 2,
        "random_state": 42
    }
    mlflow.log_params(params)
```

### Querying Parameters

```python
client = MlflowClient()

# Get specific run
run = client.get_run(run_id)

# Access parameters
params = run.data.params
print(f"Learning rate: {params.get('learning_rate')}")
```

## Metrics

### Logging Metrics

```python
import mlflow

with mlflow.start_run():
    # Single metric
    mlflow.log_metric("accuracy", 0.95)
    
    # With step (for tracking progression)
    for epoch in range(10):
        loss = train_epoch()
        mlflow.log_metric("loss", loss, step=epoch)
    
    # Multiple metrics
    mlflow.log_metrics({
        "accuracy": 0.95,
        "precision": 0.93,
        "recall": 0.94
    })
```

### Time Series Metrics

```python
import mlflow

with mlflow.start_run():
    # Track over epochs
    losses = []
    for epoch in range(100):
        loss = train_epoch(epoch)
        losses.append(loss)
        mlflow.log_metric("train_loss", loss, step=epoch)
        
        if epoch % 10 == 0:
            val_loss = validate(epoch)
            mlflow.log_metric("val_loss", val_loss, step=epoch)
```

### Query Metrics

```python
client = MlflowClient()
run = client.get_run(run_id)

# Get metric history
metric_history = client.get_metric_history(run_id, "accuracy")
for metric in metric_history:
    print(f"Step {metric.step}: {metric.value}")
```

## Artifacts

### Log Files

```python
import mlflow

with mlflow.start_run():
    # Save file then log
    with open('model.pkl', 'wb') as f:
        pickle.dump(model, f)
    
    mlflow.log_artifact('model.pkl')
```

### Log Directories

```python
# Log entire directory
mlflow.log_artifacts('models/')  # All files in models/

# With artifact path (creates subdirectory)
mlflow.log_artifacts('plots/', artifact_path='visualizations')
```

### Log Visualizations

```python
import matplotlib.pyplot as plt
import mlflow

with mlflow.start_run():
    # Create visualization
    plt.figure(figsize=(10, 6))
    plt.plot(data)
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.title('Training Progress')
    
    # Save and log
    plt.savefig('plot.png')
    mlflow.log_artifact('plot.png')
    plt.close()
```

### Download Artifacts

```python
client = MlflowClient()

# List artifacts
artifacts = client.list_artifacts(run_id)
for artifact in artifacts:
    print(f"{artifact.path} ({'file' if artifact.is_dir == False else 'dir'})")

# Download artifact
artifact = client.download_artifacts(run_id, 'model.pkl')
```

## Model Registry

### Register Model

```python
import mlflow

with mlflow.start_run():
    # Train model...
    
    # Register model
    mlflow.sklearn.log_model(
        model,
        "model",
        registered_model_name="iris_classifier"
    )
```

### Manage Versions

```python
from mlflow.tracking import MlflowClient

client = MlflowClient()

# Get registered model
model = client.get_registered_model("iris_classifier")
print(f"Versions: {len(model.latest_versions)}")

# Get specific version
version = client.get_model_version("iris_classifier", 1)
print(f"Status: {version.status}")
```

### Stage Transitions

```python
client = MlflowClient()

# Move version to different stage
client.transition_model_version_stage(
    name="iris_classifier",
    version=1,
    stage="Staging"  # or "Production"
)

# Get production model
prod_versions = client.get_latest_versions("iris_classifier", stages=["Production"])
if prod_versions:
    print(f"Production version: {prod_versions[0].version}")
```

### Load Model from Registry

```python
import mlflow

# Load production version
model = mlflow.sklearn.load_model(
    "models:/iris_classifier/Production"
)

# Use model
predictions = model.predict(X_test)
```

## Searching Experiments

### Search Runs

```python
from mlflow.tracking import MlflowClient

client = MlflowClient()

# Get all runs in experiment
runs = client.search_runs(experiment_ids=["0"])

# Search with filter
best_runs = client.search_runs(
    experiment_ids=["0"],
    filter_string="metrics.accuracy >= 0.9",
    order_by=["metrics.accuracy DESC"],
    max_results=5
)

for run in best_runs:
    print(f"Run: {run.info.run_name}, Accuracy: {run.data.metrics['accuracy']}")
```

### Filter String Syntax

```python
# Filter by metric
"metrics.accuracy > 0.95"

# Filter by parameter
"params.learning_rate = 0.001"

# Filter by tag
"tags.status = 'completed'"

# Complex filters
"metrics.accuracy > 0.9 AND params.model = 'rf'"
```

## Comparing Runs

### In the UI

1. Go to Experiments tab
2. Select runs to compare (checkboxes)
3. Click "Compare"
4. View side-by-side:
   - Parameters
   - Metrics
   - Artifacts

### Programmatically

```python
from mlflow.tracking import MlflowClient

client = MlflowClient()

# Get runs
run1 = client.get_run(run_id_1)
run2 = client.get_run(run_id_2)

# Compare parameters
print("Run 1 params:", run1.data.params)
print("Run 2 params:", run2.data.params)

# Compare metrics
print("Run 1 accuracy:", run1.data.metrics['accuracy'])
print("Run 2 accuracy:", run2.data.metrics['accuracy'])
```

## Tags

### Set Tags

```python
import mlflow

with mlflow.start_run():
    # Single tag
    mlflow.set_tag("model_type", "random_forest")
    mlflow.set_tag("team", "ml-research")
    
    # Multiple tags
    mlflow.set_tags({
        "author": "alice",
        "version": "v1.0",
        "status": "completed"
    })
```

### Filter by Tags

```python
client = MlflowClient()

# Search runs with specific tag
runs = client.search_runs(
    experiment_ids=["0"],
    filter_string="tags.status = 'completed'"
)
```

## Best Practices

✅ **Do:**
- Use meaningful experiment names
- Log all relevant parameters
- Log multiple metrics for comparison
- Use tags for organization
- Version your models
- Document your approach
- Keep experiments focused

❌ **Don't:**
- Create too many experiments
- Log irrelevant metrics
- Forget to log parameters
- Mix unrelated runs
- Leave runs without names
- Ignore poor results
- Skip documentation

## Debugging Failed Runs

### Check Run Status

```python
client = MlflowClient()
run = client.get_run(run_id)

print(f"Status: {run.info.status}")
print(f"Lifecycle: {run.info.lifecycle_stage}")

if run.info.status == "FAILED":
    print("Check logs and artifacts for errors")
```

### View Artifacts for Clues

```bash
# In MLflow UI: Click run → Artifacts tab
# Or in terminal:
client.download_artifacts(run_id, '.')
```

---

Next: [Best Practices →](./best-practices.md)
