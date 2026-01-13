---
sidebar_position: 3
---

# mlops-research-template

**Repository:** `MLops-Project-Platform/mlops-research-template`

A standardized template for ML research and training projects. Use this to build and track your experiments with the MLOps platform.

## Purpose

mlops-research-template provides:
- Project structure for ML experiments
- Configuration management system
- MLflow integration for tracking
- Reproducible training pipeline
- Best practices for ML code

## Repository Structure

```
mlops-research-template/
├── pyproject.toml          # Project metadata & dependencies
├── README.md               # Project documentation
├── requirements.txt        # Python dependencies
│
├── src/                    # Source code
│   ├── __init__.py
│   └── train.py            # Main training script
│
├── configs/                # Configuration files
│   └── default.yaml        # Default configuration
│
└── .gitignore
```

## When to Use

✅ **Use this template for:**
- ML research and experimentation
- Training models
- Hyperparameter tuning
- Benchmarking approaches
- Proof of concepts

❌ **Don't use this for:**
- Infrastructure setup (use mlops-platform)
- Infrastructure deployment (use mlops-helm-charts)
- Production serving (separate service needed)

## Quick Start

### 1. Clone Template

```bash
git clone https://github.com/MLops-Project-Platform/mlops-research-template.git
cd mlops-research-template
```

### 2. Set Up Environment

```bash
# Create virtual environment
python -m venv .venv

# Activate
source .venv/bin/activate        # Mac/Linux
# or
.venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt
```

### 3. Start MLflow Platform

In another terminal:

```bash
cd ../mlops-platform/docker-compose
docker compose up -d
```

### 4. Run Training

```bash
# Make sure MLflow is running at http://localhost:5000
python src/train.py

# Or with custom config
python src/train.py --config configs/custom.yaml
```

### 5. View Results

Open http://localhost:5000 in browser to see your experiments.

## Configuration System

### Default Configuration

`configs/default.yaml`:

```yaml
# Model parameters
model:
  name: "logistic_regression"
  params:
    C: 1.0
    max_iter: 1000

# Training parameters
training:
  test_size: 0.2
  random_state: 42
  validation_split: 0.1

# MLflow tracking
mlflow:
  tracking_uri: "http://localhost:5000"
  experiment_name: "ml-research"
  run_name: "baseline"
```

### Custom Configuration

Create `configs/custom.yaml`:

```yaml
# Override default values
model:
  name: "svm"
  params:
    C: 0.1
    kernel: "rbf"

training:
  test_size: 0.25
  random_state: 123
```

Run with custom config:

```bash
python src/train.py --config configs/custom.yaml
```

## Training Script Structure

### Basic Training Script

`src/train.py`:

```python
import mlflow
import yaml
import argparse
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score

def load_config(config_path):
    """Load configuration from YAML file."""
    with open(config_path, 'r') as f:
        return yaml.safe_load(f)

def train():
    """Main training function."""
    parser = argparse.ArgumentParser()
    parser.add_argument('--config', default='configs/default.yaml')
    args = parser.parse_args()
    
    # Load configuration
    config = load_config(args.config)
    
    # Set MLflow tracking URI
    mlflow.set_tracking_uri(config['mlflow']['tracking_uri'])
    mlflow.set_experiment(config['mlflow']['experiment_name'])
    
    with mlflow.start_run(run_name=config['mlflow']['run_name']):
        # Load data
        data = load_iris()
        X = data.data
        y = data.target
        
        # Train/test split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y,
            test_size=config['training']['test_size'],
            random_state=config['training']['random_state']
        )
        
        # Log parameters
        model_params = config['model']['params']
        for param_name, param_value in model_params.items():
            mlflow.log_param(param_name, param_value)
        
        # Train model
        model = RandomForestClassifier(**model_params)
        model.fit(X_train, y_train)
        
        # Evaluate
        y_pred = model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred, average='weighted')
        recall = recall_score(y_test, y_pred, average='weighted')
        
        # Log metrics
        mlflow.log_metric("accuracy", accuracy)
        mlflow.log_metric("precision", precision)
        mlflow.log_metric("recall", recall)
        
        # Log model
        mlflow.sklearn.log_model(model, "model")
        
        print(f"Model accuracy: {accuracy:.4f}")

if __name__ == "__main__":
    train()
```

## Experiment Tracking Patterns

### Pattern 1: Simple Metrics Logging

```python
import mlflow

with mlflow.start_run():
    # Your training code
    accuracy = train_and_evaluate()
    
    # Log metrics
    mlflow.log_metric("accuracy", accuracy)
```

### Pattern 2: With Parameters

```python
import mlflow

hyperparams = {
    "learning_rate": 0.001,
    "batch_size": 32,
    "epochs": 100
}

with mlflow.start_run():
    # Log hyperparameters
    mlflow.log_params(hyperparams)
    
    # Training
    model = train(hyperparams)
    metrics = evaluate(model)
    
    # Log results
    mlflow.log_metrics(metrics)
```

### Pattern 3: With Artifacts

```python
import mlflow

with mlflow.start_run():
    # Training
    metrics = train_model()
    
    # Save artifacts
    mlflow.log_metric("val_loss", metrics['val_loss'])
    
    # Log model
    mlflow.sklearn.log_model(model, "model")
    
    # Log plot
    plt.savefig('plot.png')
    mlflow.log_artifact('plot.png')
```

## MLflow Integration

### Basic Integration

```python
import mlflow

# Set tracking server
mlflow.set_tracking_uri("http://localhost:5000")

# Set experiment
mlflow.set_experiment("my_experiment")

# Start run
with mlflow.start_run():
    # Your code here
    pass
```

### Advanced Integration

```python
import mlflow
from mlflow.tracking import MlflowClient

# Initialize client
client = MlflowClient("http://localhost:5000")

# Get or create experiment
try:
    exp_id = client.get_experiment_by_name("my_exp").experiment_id
except:
    exp_id = client.create_experiment("my_exp")

# Create run
with mlflow.start_run(experiment_id=exp_id, run_name="my_run"):
    # Log complex data
    mlflow.log_dict({"config": config}, "config.json")
    mlflow.log_text("training complete", "status.txt")
    mlflow.log_model(model, "model")
```

## Dependencies

The template includes standard ML/data science libraries:

```
scikit-learn>=1.0.0    # ML algorithms
pandas>=1.3.0          # Data manipulation
numpy>=1.21.0          # Numerical computing
matplotlib>=3.4.0      # Plotting
pyyaml>=5.4.0          # Configuration
mlflow>=1.28.0         # Experiment tracking
```

Add more in `requirements.txt`:

```bash
pip install new-package
pip freeze > requirements.txt
```

## Best Practices

✅ **Do:**
- Use configuration files for all hyperparameters
- Log all important parameters and metrics
- Use meaningful experiment names
- Commit code before running experiments
- Document your approach
- Use version control properly

❌ **Don't:**
- Hard-code parameters
- Skip logging important metrics
- Mix unrelated experiments
- Leave uncommitted changes
- Use non-deterministic random seeds

## Extending the Template

### Add Custom Preprocessing

Create `src/preprocessing.py`:

```python
def preprocess_data(X, y):
    """Custom preprocessing pipeline."""
    # Your preprocessing logic
    return X_processed, y_processed
```

Use in training:

```python
from src.preprocessing import preprocess_data

X, y = preprocess_data(X, y)
```

### Add Evaluation Module

Create `src/evaluation.py`:

```python
def evaluate_model(model, X_test, y_test):
    """Comprehensive evaluation."""
    predictions = model.predict(X_test)
    return {
        "accuracy": accuracy_score(y_test, predictions),
        "precision": precision_score(y_test, predictions),
        "recall": recall_score(y_test, predictions),
    }
```

## Troubleshooting

### Can't Connect to MLflow

```bash
# Check if MLflow is running
curl http://localhost:5000

# Check environment variable
echo $MLFLOW_TRACKING_URI

# Set explicitly in code
mlflow.set_tracking_uri("http://localhost:5000")
```

### Dependencies Not Found

```bash
# Reinstall dependencies
pip install -r requirements.txt

# Check installation
pip show mlflow
```

### Permission Errors

```bash
# Use virtual environment
source .venv/bin/activate

# Check permissions
ls -la src/
```

---

See [Researcher Guide](../researcher-guide/overview.md) for detailed training examples.
