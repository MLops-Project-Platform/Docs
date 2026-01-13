---
sidebar_position: 2
---

# Setup Guide

Get your development environment ready to run ML experiments with the MLOps Platform.

## Prerequisites

Before starting, ensure you have:

```bash
# Check Python version (3.8+)
python --version

# Check Docker
docker --version
docker compose --version

# Check Git
git --version
```

Install missing tools from:
- Python: https://www.python.org/downloads/
- Docker: https://docs.docker.com/get-docker/
- Git: https://git-scm.com/downloads

## Step 1: Clone the Research Template

```bash
git clone https://github.com/MLops-Project-Platform/mlops-research-template.git
cd mlops-research-template
```

## Step 2: Set Up Python Environment

### Using venv (Recommended)

```bash
# Create virtual environment
python -m venv .venv

# Activate
source .venv/bin/activate              # Mac/Linux
# or
.venv\Scripts\activate                 # Windows (PowerShell)
# or
.venv\Scripts\activate.bat             # Windows (Command Prompt)

# Verify activation (should show .venv in prompt)
```

### Using Conda (Alternative)

```bash
conda create -n mlops python=3.10
conda activate mlops
```

## Step 3: Install Dependencies

```bash
# Upgrade pip
pip install --upgrade pip

# Install project dependencies
pip install -r requirements.txt
```

Default dependencies include:
- scikit-learn
- pandas
- numpy
- matplotlib
- mlflow
- pyyaml

Add more as needed:

```bash
pip install new-package
pip freeze > requirements.txt
```

## Step 4: Start the MLOps Platform

In a separate terminal:

```bash
# Navigate to platform
cd ../mlops-platform/docker-compose

# Start services
docker compose up -d

# Verify services are running
docker compose ps
```

You should see:
- ✅ mlflow (healthy)
- ✅ postgres (healthy)
- ✅ minio (healthy)
- ✅ nginx (healthy)

### Troubleshooting Platform Start

```bash
# Check logs
docker compose logs mlflow

# Check if ports are available
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # Mac/Linux

# Restart services
docker compose restart

# Full reset (warning: loses data)
docker compose down -v
docker compose up -d
```

## Step 5: Verify MLflow Connection

### Method 1: Browser Check

Open http://localhost:5000 in your browser. You should see the MLflow UI with:
- Experiments tab
- Models tab
- Runs tab

### Method 2: Python Test

In your research project, create a test script:

```python
# test_mlflow.py
import mlflow

# Set tracking URI
mlflow.set_tracking_uri("http://localhost:5000")

# Test connection
print("Testing MLflow connection...")

try:
    # Get experiments
    experiments = mlflow.search_experiments()
    print(f"✅ Connected! Found {len(experiments)} experiments")
except Exception as e:
    print(f"❌ Connection failed: {e}")
    print("Make sure MLflow is running: docker compose up -d")
```

Run the test:

```bash
cd mlops-research-template
python test_mlflow.py
```

## Step 6: Run Smoke Test

Verify everything works end-to-end:

```bash
cd mlops-platform
python smoke_test.py
```

Expected output:

```
Running smoke test...
Creating test experiment...
Starting training run...
Logging metrics...
Logging artifacts...
✅ Smoke test passed!
```

## Step 7: Configure Your Project

### Edit Configuration File

Open `configs/default.yaml`:

```yaml
# Example configuration for your first experiment
model:
  name: "random_forest"
  params:
    n_estimators: 100
    max_depth: 10
    random_state: 42

training:
  test_size: 0.2
  random_state: 42

mlflow:
  tracking_uri: "http://localhost:5000"
  experiment_name: "my_first_experiment"
  run_name: "baseline"
```

### Create Environment Variables (Optional)

Create `.env` file in project root:

```bash
# .env
MLFLOW_TRACKING_URI=http://localhost:5000
MLFLOW_EXPERIMENT_NAME=my_first_experiment
```

Load in your code:

```python
import os
from dotenv import load_dotenv

load_dotenv()
mlflow_uri = os.getenv('MLFLOW_TRACKING_URI')
```

## Step 8: Your First Experiment

Create a simple training script:

```python
# src/simple_train.py
import mlflow
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

# Set MLflow
mlflow.set_tracking_uri("http://localhost:5000")
mlflow.set_experiment("first_experiment")

# Load data
X, y = load_iris(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Start run
with mlflow.start_run(run_name="first_run"):
    # Log parameters
    mlflow.log_param("n_estimators", 100)
    mlflow.log_param("max_depth", 10)
    
    # Train model
    model = RandomForestClassifier(n_estimators=100, max_depth=10)
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    # Log metrics
    mlflow.log_metric("accuracy", accuracy)
    
    # Log model
    mlflow.sklearn.log_model(model, "model")
    
    print(f"✅ Run complete! Accuracy: {accuracy:.4f}")

print("\nView results at: http://localhost:5000")
```

Run it:

```bash
python src/simple_train.py
```

Check results:

```bash
# Open in browser
open http://localhost:5000

# Or check with Python
from mlflow.tracking import MlflowClient
client = MlflowClient("http://localhost:5000")
experiments = client.search_experiments()
print(f"Experiments: {[e.name for e in experiments]}")
```

## Useful Commands

### Environment Management

```bash
# List installed packages
pip list

# Show specific package info
pip show mlflow

# Upgrade package
pip install --upgrade mlflow

# Uninstall
pip uninstall mlflow

# Deactivate virtual environment
deactivate
```

### MLflow Platform

```bash
# View logs
docker compose logs -f mlflow

# Stop platform
docker compose stop

# Start platform
docker compose start

# Full restart
docker compose down && docker compose up -d

# Clean up (removes data)
docker compose down -v
```

### Git

```bash
# Check status
git status

# Stage changes
git add .

# Commit
git commit -m "Initial setup"

# View logs
git log --oneline
```

## Quick Reference

| Task | Command |
|------|---------|
| Activate environment | `source .venv/bin/activate` |
| Install package | `pip install package-name` |
| Start MLOps platform | `docker compose up -d` |
| View MLflow UI | http://localhost:5000 |
| Run training | `python src/train.py` |
| Stop platform | `docker compose stop` |

## Troubleshooting

### Python Environment Issues

```bash
# Verify correct Python is used
which python
python --version

# Reinstall packages
pip install -r requirements.txt --force-reinstall
```

### MLflow Connection Issues

```bash
# Check MLflow is running
docker compose ps mlflow

# Check logs
docker compose logs mlflow

# Test connection manually
curl http://localhost:5000
```

### Port Conflicts

```bash
# Find what's using port 5000
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # Mac/Linux

# Change port in docker-compose.yml
services:
  mlflow:
    ports:
      - "5001:5000"  # Use 5001 instead
```

## Next Steps

✅ Environment is set up!

Now:
1. Read [Training Guide](./training.md) to write your first training code
2. Learn [Experiment Tracking](./tracking-experiments.md) best practices
3. Check [Best Practices](./best-practices.md) for professional development

---

Questions? Check [Getting Started Overview](../getting-started/overview.md) or ask in the discussions!
