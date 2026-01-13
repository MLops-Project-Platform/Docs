---
sidebar_position: 5
---

# Best Practices

Professional approaches to ML research and experimentation.

## Code Organization

### Project Structure

```
mlops-research-project/
├── configs/                    # All configuration files
│   ├── default.yaml           # Default settings
│   ├── experiment_v1.yaml     # Variant configurations
│   └── experiment_v2.yaml
│
├── src/                        # Source code
│   ├── __init__.py
│   ├── train.py               # Main training script
│   ├── models.py              # Model definitions
│   ├── preprocessing.py       # Data preprocessing
│   ├── evaluation.py          # Evaluation metrics
│   └── utils.py               # Utility functions
│
├── notebooks/                  # Jupyter notebooks
│   ├── 01_data_exploration.ipynb
│   ├── 02_model_experiments.ipynb
│   └── 03_results_analysis.ipynb
│
├── data/                       # Data directory (gitignored)
│   ├── raw/                   # Original data
│   ├── processed/             # Preprocessed data
│   └── splits/                # Train/test splits
│
├── artifacts/                  # Local artifacts (gitignored)
│   ├── models/
│   ├── plots/
│   └── logs/
│
├── tests/                      # Unit tests
│   ├── test_preprocessing.py
│   └── test_models.py
│
├── requirements.txt            # Dependencies
├── .gitignore                 # Git ignore rules
├── README.md                  # Project documentation
└── setup.py                   # Package setup (optional)
```

### .gitignore

```
# Data
data/
*.csv
*.json

# Models and artifacts
artifacts/
models/
*.pkl
*.h5

# Environment
.venv/
env/
*.egg-info/

# Python
__pycache__/
*.pyc
.pytest_cache/

# Jupyter
.ipynb_checkpoints/

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
.env
```

## Configuration Management

### Configuration File Best Practices

```yaml
# configs/experiment.yaml
# Clear, hierarchical configuration

# Model hyperparameters
model:
  type: "random_forest"  # Easy to identify
  params:
    n_estimators: 100    # All params in one place
    max_depth: 10
    min_samples_split: 2
    random_state: 42
  
# Data handling
data:
  train_size: 0.8
  test_size: 0.2
  random_state: 42
  preprocessing:
    normalize: true
    remove_outliers: true

# Training configuration
training:
  epochs: 100
  batch_size: 32
  validation_split: 0.2
  early_stopping:
    enabled: true
    patience: 10

# MLflow tracking
mlflow:
  tracking_uri: "http://localhost:5000"
  experiment_name: "baseline_experiments"
  run_name: "rf_100trees_maxdepth10"
  tags:
    - "baseline"
    - "production_candidate"
```

### Load Configuration Safely

```python
import yaml
from typing import Dict, Any

def load_config(config_path: str) -> Dict[str, Any]:
    """Load and validate configuration."""
    try:
        with open(config_path, 'r') as f:
            config = yaml.safe_load(f)
    except FileNotFoundError:
        raise FileNotFoundError(f"Config not found: {config_path}")
    except yaml.YAMLError as e:
        raise ValueError(f"Invalid YAML in {config_path}: {e}")
    
    return config

def get_config_value(config: Dict, key_path: str, default=None) -> Any:
    """Get nested config value safely."""
    keys = key_path.split('.')
    value = config
    for key in keys:
        if isinstance(value, dict):
            value = value.get(key)
        else:
            return default
    return value if value is not None else default

# Usage
config = load_config('configs/default.yaml')
learning_rate = get_config_value(config, 'training.learning_rate', 0.001)
```

## Experiment Design

### Clear Naming Convention

```python
# Good: Descriptive names
with mlflow.start_run(run_name="baseline_rf_100trees_depth10"):
    pass

with mlflow.start_run(run_name="tuning_rf_grid_search_lr_range"):
    pass

# Bad: Unclear names
with mlflow.start_run(run_name="run_1"):
    pass

with mlflow.start_run(run_name="test"):
    pass
```

### Systematic Hyperparameter Tuning

```python
import mlflow
from itertools import product

# Define parameter ranges
param_grid = {
    'n_estimators': [50, 100, 200],
    'max_depth': [5, 10, 15],
    'learning_rate': [0.01, 0.1]
}

# Generate combinations
param_combinations = [
    dict(zip(param_grid.keys(), values))
    for values in product(*param_grid.values())
]

mlflow.set_experiment("hyperparameter_tuning")

best_score = 0
best_params = None

# Train all combinations
for params in param_combinations:
    run_name = "_".join([f"{k}_{v}" for k, v in params.items()])
    
    with mlflow.start_run(run_name=run_name):
        # Log all parameters
        mlflow.log_params(params)
        
        # Train
        model = train_model(params)
        score = evaluate(model)
        
        # Log metrics
        mlflow.log_metric("accuracy", score)
        
        # Track best
        if score > best_score:
            best_score = score
            best_params = params

print(f"Best params: {best_params} with accuracy {best_score}")
```

## Reproducibility

### Set Seeds

```python
import random
import numpy as np
import tensorflow as tf

def set_seed(seed: int):
    """Set all random seeds for reproducibility."""
    random.seed(seed)
    np.random.seed(seed)
    tf.random.set_seed(seed)

# Use in training
SEED = 42
set_seed(SEED)

with mlflow.start_run():
    mlflow.log_param("random_seed", SEED)
    # Training code
```

### Version Everything

```python
import mlflow
from src import __version__

with mlflow.start_run():
    # Code version
    mlflow.set_tag("code_version", __version__)
    
    # Data version
    mlflow.set_tag("data_version", "v2.0")
    
    # Library versions
    mlflow.set_tag("sklearn_version", sklearn.__version__)
    mlflow.set_tag("python_version", sys.version)
    
    # Git info (if using git)
    import subprocess
    git_hash = subprocess.check_output(
        ['git', 'rev-parse', 'HEAD']
    ).decode('utf-8').strip()
    mlflow.set_tag("git_commit", git_hash)
```

### Commit Before Running

```bash
# Ensure clean working directory
git status

# Commit changes
git add -A
git commit -m "Add experiment configuration"

# Then run experiment
python src/train.py
```

## Collaboration

### Meaningful Tagging

```python
import mlflow

with mlflow.start_run():
    mlflow.set_tags({
        "author": "alice",
        "team": "ml-research",
        "project": "customer_churn",
        "status": "completed",
        "reviewed": False,
        "production_ready": False
    })
```

### Documentation

```python
import mlflow

def train_model(config):
    """
    Train model with comprehensive logging.
    
    Args:
        config: Dictionary with training configuration
        
    Returns:
        tuple: (model, metrics)
    
    Logs to MLflow:
        - All hyperparameters
        - Training metrics (loss, accuracy)
        - Validation metrics
        - Model artifact
        - Summary report
    """
    with mlflow.start_run():
        mlflow.log_params(config)
        
        # Training logic...
        model = train()
        metrics = evaluate(model)
        
        mlflow.log_metrics(metrics)
        mlflow.sklearn.log_model(model, "model")
        
        return model, metrics
```

### Share Results

```python
# Create summary report
summary = f"""
# Experiment Results

## Configuration
- Model: Random Forest
- Parameters: {config}

## Results
- Accuracy: {accuracy:.4f}
- Precision: {precision:.4f}
- Recall: {recall:.4f}

## Next Steps
- Try gradient boosting
- Increase data size
- Feature engineering
"""

# Log to MLflow
mlflow.log_text(summary, "summary.md")
```

## Performance Optimization

### Efficient Logging

```python
import mlflow
from collections import defaultdict

# Don't log too frequently
# ❌ Bad: Logs every iteration
for i in range(1000000):
    mlflow.log_metric("loss", loss, step=i)

# ✅ Good: Batch logging
metrics_buffer = defaultdict(list)
for i in range(1000000):
    metrics_buffer['loss'].append(loss)
    
    # Flush every N steps
    if i % 100 == 0:
        for metric_name, values in metrics_buffer.items():
            for step, value in enumerate(values, start=i-100):
                mlflow.log_metric(metric_name, value, step=step)
        metrics_buffer.clear()
```

### Memory Efficient Evaluation

```python
# Don't store all predictions
# ❌ Bad: Loads entire dataset
all_predictions = []
for batch in data_loader:
    predictions = model.predict(batch)
    all_predictions.extend(predictions)
accuracy = calculate_accuracy(all_predictions, all_labels)

# ✅ Good: Running metrics
total_correct = 0
total_samples = 0
for batch in data_loader:
    predictions = model.predict(batch)
    total_correct += count_correct(predictions, batch.labels)
    total_samples += len(batch)

accuracy = total_correct / total_samples
mlflow.log_metric("accuracy", accuracy)
```

## Error Handling

### Robust Training Loop

```python
import mlflow
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def safe_train(config: dict):
    """Train with error handling and cleanup."""
    with mlflow.start_run():
        try:
            logger.info("Starting training...")
            mlflow.log_params(config)
            
            # Training code
            model = train_model(config)
            metrics = evaluate(model)
            
            mlflow.log_metrics(metrics)
            mlflow.sklearn.log_model(model, "model")
            
            mlflow.set_tag("status", "completed")
            logger.info("Training completed successfully")
            
        except ValueError as e:
            logger.error(f"Invalid configuration: {e}")
            mlflow.set_tag("status", "failed")
            mlflow.set_tag("error_type", "validation_error")
            raise
            
        except Exception as e:
            logger.error(f"Unexpected error: {e}", exc_info=True)
            mlflow.set_tag("status", "failed")
            mlflow.set_tag("error_type", "unexpected_error")
            raise
            
        finally:
            # Cleanup
            logger.info("Cleaning up resources")
```

## Testing

### Unit Tests

```python
# tests/test_preprocessing.py
import unittest
from src.preprocessing import normalize_data

class TestPreprocessing(unittest.TestCase):
    def test_normalize_data(self):
        """Test data normalization."""
        data = [1, 2, 3, 4, 5]
        normalized = normalize_data(data)
        
        self.assertAlmostEqual(normalized.mean(), 0)
        self.assertAlmostEqual(normalized.std(), 1)

if __name__ == '__main__':
    unittest.main()
```

Run tests:

```bash
# Run all tests
python -m pytest tests/

# Run specific test
python -m pytest tests/test_preprocessing.py::TestPreprocessing::test_normalize_data

# With coverage
pip install pytest-cov
pytest --cov=src tests/
```

## Version Control

### Commit Messages

```bash
# ❌ Bad
git commit -m "updates"

# ✅ Good
git commit -m "Add RandomForest baseline with hyperparameter tuning

- Implement baseline RF model
- Add hyperparameter grid search
- Log all metrics to MLflow
- Achieve 94.3% accuracy on test set"
```

### Branch Strategy

```bash
# Main experiments
git branch feature/baseline-rf
git branch feature/hyperparameter-tuning
git branch feature/feature-engineering

# Work on feature
git checkout feature/baseline-rf
git commit -m "Add RF baseline"
git push origin feature/baseline-rf

# Create pull request for review
```

---

Following these practices will make your research more:
- **Reproducible** - Others can replicate your results
- **Shareable** - Colleagues can understand your work
- **Professional** - Ready for production deployment
- **Efficient** - Minimal wasted effort and time

Happy researching! 🚀
