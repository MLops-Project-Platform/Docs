---
sidebar_position: 3
---

# Training Guide

Learn how to write, organize, and execute training code that integrates with the MLOps Platform.

## Training Script Structure

### Basic Template

```python
# src/train.py
import yaml
import argparse
import mlflow
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

def load_config(config_path):
    """Load YAML configuration file."""
    with open(config_path, 'r') as f:
        return yaml.safe_load(f)

def train(config):
    """Main training function."""
    # Load data
    X, y = load_iris(return_X_y=True)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=config['training']['test_size'],
        random_state=config['training']['random_state']
    )
    
    # Set MLflow experiment
    mlflow.set_tracking_uri(config['mlflow']['tracking_uri'])
    mlflow.set_experiment(config['mlflow']['experiment_name'])
    
    with mlflow.start_run(run_name=config['mlflow']['run_name']):
        # Log hyperparameters
        for param_name, param_value in config['model']['params'].items():
            mlflow.log_param(param_name, param_value)
        
        # Train model
        model = RandomForestClassifier(**config['model']['params'])
        model.fit(X_train, y_train)
        
        # Evaluate
        y_pred = model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        # Log metrics
        mlflow.log_metric("accuracy", accuracy)
        
        # Log model
        mlflow.sklearn.log_model(model, "model")
        
        return accuracy

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--config', default='configs/default.yaml')
    args = parser.parse_args()
    
    config = load_config(args.config)
    accuracy = train(config)
    print(f"Model accuracy: {accuracy:.4f}")

if __name__ == "__main__":
    main()
```

### Configuration File

```yaml
# configs/default.yaml
model:
  name: "random_forest"
  params:
    n_estimators: 100
    max_depth: 10
    min_samples_split: 2
    min_samples_leaf: 1
    random_state: 42

training:
  test_size: 0.2
  validation_split: 0.1
  random_state: 42

mlflow:
  tracking_uri: "http://localhost:5000"
  experiment_name: "iris_classification"
  run_name: "baseline"
```

## Running Training

### Basic Execution

```bash
# With default config
python src/train.py

# With custom config
python src/train.py --config configs/custom.yaml

# From notebook
import subprocess
subprocess.run(["python", "src/train.py"])
```

### Using Different Configs

Create experiment-specific configs:

```yaml
# configs/experiment_v1.yaml
model:
  name: "random_forest"
  params:
    n_estimators: 50
    max_depth: 5

# configs/experiment_v2.yaml
model:
  name: "random_forest"
  params:
    n_estimators: 200
    max_depth: 20
```

Run experiments:

```bash
python src/train.py --config configs/experiment_v1.yaml
python src/train.py --config configs/experiment_v2.yaml
```

## Logging Metrics

### Simple Metrics

```python
import mlflow

with mlflow.start_run():
    # Single metric
    mlflow.log_metric("accuracy", 0.95)
    
    # Multiple calls (different epochs)
    for epoch in range(10):
        loss = train_epoch()
        mlflow.log_metric("loss", loss, step=epoch)
```

### Multiple Metrics at Once

```python
metrics = {
    "accuracy": 0.95,
    "precision": 0.93,
    "recall": 0.94,
    "f1": 0.935
}
mlflow.log_metrics(metrics)
```

### Metrics Over Time

```python
import mlflow

with mlflow.start_run():
    for epoch in range(100):
        train_loss = train_epoch()
        val_loss = validate()
        
        # Log with step (for graphs)
        mlflow.log_metric("train_loss", train_loss, step=epoch)
        mlflow.log_metric("val_loss", val_loss, step=epoch)
```

## Logging Parameters

### Single Parameter

```python
mlflow.log_param("learning_rate", 0.001)
```

### Multiple Parameters

```python
# Dictionary of parameters
hyperparams = {
    "learning_rate": 0.001,
    "batch_size": 32,
    "epochs": 100,
    "optimizer": "adam"
}
mlflow.log_params(hyperparams)
```

### Parameters from Config

```python
def log_config_params(config):
    """Log all model parameters from config."""
    model_params = config.get('model', {}).get('params', {})
    for param_name, param_value in model_params.items():
        mlflow.log_param(param_name, param_value)

# In training
log_config_params(config)
```

## Logging Artifacts

### Save and Log Models

```python
import pickle
import mlflow

with mlflow.start_run():
    # Train model...
    
    # Save to file
    with open('model.pkl', 'wb') as f:
        pickle.dump(model, f)
    
    # Log to MLflow
    mlflow.log_artifact('model.pkl')
    
    # Or use MLflow serialization
    mlflow.sklearn.log_model(model, "model")
```

### Log Plots and Visualizations

```python
import matplotlib.pyplot as plt
import mlflow

with mlflow.start_run():
    # Create plot
    plt.figure(figsize=(10, 6))
    plt.plot(train_losses, label='Train')
    plt.plot(val_losses, label='Validation')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.legend()
    
    # Save
    plt.savefig('loss_curve.png', dpi=100, bbox_inches='tight')
    plt.close()
    
    # Log to MLflow
    mlflow.log_artifact('loss_curve.png')
```

### Log Directories

```python
import mlflow

with mlflow.start_run():
    # Log all files in directory
    mlflow.log_artifacts('reports/')  # Logs all files in reports/
    
    # Organize with subdirectories
    mlflow.log_artifacts('plots/', artifact_path='visualizations')
```

### Log Text and Tables

```python
import mlflow
import pandas as pd

with mlflow.start_run():
    # Log text file
    with open('summary.txt', 'w') as f:
        f.write("Model Summary\n")
        f.write(f"Accuracy: {accuracy:.4f}\n")
    mlflow.log_artifact('summary.txt')
    
    # Log pandas DataFrame as artifact
    results_df = pd.DataFrame({
        'metric': ['accuracy', 'precision', 'recall'],
        'value': [0.95, 0.93, 0.94]
    })
    results_df.to_csv('results.csv', index=False)
    mlflow.log_artifact('results.csv')
```

## Dataset Handling

### Load Data from Local Files

```python
import pandas as pd

def load_data(data_path):
    """Load CSV data."""
    df = pd.read_csv(data_path)
    return df

# In training
data = load_data('data/train.csv')
X = data.drop('target', axis=1)
y = data['target']
```

### Use Built-in Datasets

```python
from sklearn.datasets import load_iris, load_wine
import pandas as pd

# Load built-in dataset
X, y = load_iris(return_X_y=True)

# Convert to DataFrame for easier handling
import numpy as np
feature_names = ['sepal_length', 'sepal_width', 'petal_length', 'petal_width']
df = pd.DataFrame(X, columns=feature_names)
df['target'] = y
```

### Download External Data

```python
import urllib.request

def download_data(url, filename):
    """Download data from URL."""
    print(f"Downloading {url}...")
    urllib.request.urlretrieve(url, filename)
    return filename

# In training
data_file = download_data(
    'https://example.com/data.csv',
    'data/external_data.csv'
)
df = pd.read_csv(data_file)
```

## Advanced Patterns

### Custom Metrics

```python
import mlflow
from sklearn.metrics import precision_recall_curve
import numpy as np

with mlflow.start_run():
    # Log custom metrics
    precision, recall, thresholds = precision_recall_curve(y_true, y_pred)
    
    mlflow.log_metric("max_precision", np.max(precision))
    mlflow.log_metric("max_recall", np.max(recall))
```

### Nested Runs

```python
import mlflow

with mlflow.start_run(run_name="parent_run"):
    mlflow.log_param("version", "v1")
    
    # Child run 1
    with mlflow.start_run(nested=True, run_name="experiment_1"):
        mlflow.log_metric("accuracy", 0.90)
    
    # Child run 2
    with mlflow.start_run(nested=True, run_name="experiment_2"):
        mlflow.log_metric("accuracy", 0.95)
```

### Tagging Runs

```python
import mlflow

with mlflow.start_run():
    # Add tags for organization
    mlflow.set_tag("data_version", "v2.0")
    mlflow.set_tag("author", "alice")
    mlflow.set_tag("status", "completed")
    
    # Multiple tags
    mlflow.set_tags({
        "team": "ml-research",
        "project": "iris-classification",
        "branch": "main"
    })
```

## Error Handling

### Try-Catch Pattern

```python
import mlflow

with mlflow.start_run():
    try:
        # Training code
        model = train()
        metrics = evaluate(model)
        mlflow.log_metrics(metrics)
        
    except Exception as e:
        mlflow.set_tag("status", "failed")
        mlflow.set_tag("error", str(e))
        print(f"Training failed: {e}")
        raise
    
    finally:
        # Cleanup if needed
        mlflow.set_tag("finished", True)
```

### Validation

```python
import mlflow

def validate_data(X, y):
    """Validate data before training."""
    assert len(X) > 0, "Data cannot be empty"
    assert len(X) == len(y), "X and y must have same length"
    return True

with mlflow.start_run():
    validate_data(X, y)
    # Proceed with training
```

## Jupyter Notebook Training

### In Notebooks

```python
# In Jupyter cell
import mlflow
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

# Load and prepare data
from sklearn.datasets import load_iris
X, y = load_iris(return_X_y=True)

mlflow.set_tracking_uri("http://localhost:5000")
mlflow.set_experiment("notebook_experiments")

# Train
with mlflow.start_run(run_name="notebook_run"):
    model = RandomForestClassifier(n_estimators=100)
    model.fit(X[:100], y[:100])
    
    # Evaluate
    score = model.score(X[100:], y[100:])
    mlflow.log_metric("accuracy", score)
    
    print(f"Accuracy: {score:.4f}")
    print("Run logged to MLflow!")
```

### Share Notebooks

```bash
# Commit notebook to git
git add notebook.ipynb
git commit -m "Add training notebook"
```

## Best Practices

✅ **Do:**
- Use configuration files for all parameters
- Log all hyperparameters
- Log multiple metrics
- Version your code with git
- Use meaningful run names
- Tag important runs
- Log final model

❌ **Don't:**
- Hard-code parameters
- Skip logging
- Run without tracking
- Use uncommitted code
- Mix unrelated experiments
- Lose track of good results

---

Next: [Experiment Tracking →](./tracking-experiments.md)
