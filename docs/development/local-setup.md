---
sidebar_position: 2
---

# Local Development Setup

Set up a complete development environment for the MLOps Platform.

## System Requirements

- 16GB RAM minimum
- 50GB disk space
- Docker & Docker Compose
- Python 3.8+
- Git
- A code editor (VS Code, PyCharm, etc.)

## Installation

### 1. Install Prerequisites

#### Docker

```bash
# Windows/Mac: Download Docker Desktop
# https://www.docker.com/products/docker-desktop

# Linux:
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

#### Python

```bash
# https://www.python.org/downloads/

# Verify installation
python --version  # Should be 3.8+
```

#### Git

```bash
# https://git-scm.com/downloads

# Verify installation
git --version
```

### 2. Clone Repositories

```bash
# Create workspace directory
mkdir ~/mlops-workspace
cd ~/mlops-workspace

# Clone all repositories
git clone https://github.com/MLops-Project-Platform/mlops-platform.git
git clone https://github.com/MLops-Project-Platform/mlops-research-template.git
git clone https://github.com/MLops-Project-Platform/mlops-helm-charts.git
git clone https://github.com/MLops-Project-Platform/documentation.git

# Navigate to platform
cd mlops-platform
```

### 3. Start Development Environment

```bash
# Terminal 1: Start MLOps platform
cd docker-compose
docker compose up -d

# Verify services
docker compose ps
```

### 4. Development Project Setup

```bash
# Terminal 2: Set up research project
cd ../mlops-research-template

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Mac/Linux
# or
.venv\Scripts\activate      # Windows

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt  # For development
```

### 5. Verify Setup

```bash
# Test MLflow connection
python test_mlflow.py

# Run tests
pytest

# Run code quality checks
flake8 src/
black --check src/
mypy src/
```

## IDE Setup

### VS Code

1. Install extensions:
   - Python
   - Pylance
   - Docker
   - YAML
   - Markdown All in One

2. Create `.vscode/settings.json`:

```json
{
  "python.defaultInterpreterPath": "${workspaceFolder}/.venv/bin/python",
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": true,
  "python.linting.flake8Enabled": true,
  "python.formatting.provider": "black",
  "editor.formatOnSave": true,
  "editor.rulers": [80, 120],
  "[python]": {
    "editor.defaultFormatter": "ms-python.python"
  }
}
```

### PyCharm

1. File → Open → Select project root
2. Configure Python interpreter:
   - Settings → Project → Python Interpreter
   - Add → Existing Environment
   - Select `.venv/bin/python`

3. Enable code inspections:
   - Settings → Editor → Inspections
   - Enable all relevant checks

## Development Workflow

### Daily Development

```bash
# 1. Activate environment
cd mlops-research-template
source .venv/bin/activate

# 2. Check platform is running
docker compose ps  # From mlops-platform directory

# 3. Pull latest changes
git pull origin main

# 4. Create feature branch
git checkout -b feature/my-feature

# 5. Make changes and test
# ... edit code ...
pytest

# 6. Run quality checks
black src/
flake8 src/
mypy src/

# 7. Commit changes
git add .
git commit -m "Add my feature"

# 8. Push and create PR
git push origin feature/my-feature
```

### Database Development

```bash
# Connect to PostgreSQL
docker compose exec postgres psql -U mlflow -d mlflow

# Run migrations
docker compose exec postgres psql -U mlflow -d mlflow < migration.sql

# View data
docker compose exec postgres psql -U mlflow -d mlflow -c \
  "SELECT * FROM experiments;"
```

### MinIO Development

```bash
# Access MinIO CLI
docker compose exec minio mc ls minio

# Upload test file
docker compose exec minio mc cp /tmp/test.txt minio/mlflow-artifacts/

# Monitor buckets
docker compose exec minio mc du minio/mlflow-artifacts
```

## Debugging

### Debug Python Code

**VS Code:**
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: Current File",
      "type": "python",
      "request": "launch",
      "program": "${file}",
      "console": "integratedTerminal",
      "justMyCode": true,
      "env": {
        "MLFLOW_TRACKING_URI": "http://localhost:5000"
      }
    }
  ]
}
```

**Command Line:**
```bash
python -m pdb src/train.py
```

### Debug Docker Containers

```bash
# View logs
docker compose logs mlflow

# Follow logs
docker compose logs -f mlflow

# Execute command in container
docker compose exec mlflow bash

# Inspect container
docker inspect mlops-mlflow-1
```

## Testing

### Unit Tests

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_models.py

# Run specific test
pytest tests/test_models.py::TestRandomForest::test_fit

# With verbose output
pytest -v

# With coverage
pytest --cov=src --cov-report=html
# Open htmlcov/index.html
```

### Integration Tests

```bash
# Run integration tests (requires running platform)
pytest tests/integration/

# Run with logging
pytest --log-cli-level=DEBUG
```

### Test Coverage

```bash
# Generate coverage report
pytest --cov=src --cov-report=html --cov-report=term

# View coverage
open htmlcov/index.html
```

## Code Quality

### Linting

```bash
# Check code style
flake8 src/

# Check type hints
mypy src/

# Check complexity
pylint src/

# Security check
bandit -r src/
```

### Formatting

```bash
# Format code
black src/

# Check formatting
black --check src/

# Sort imports
isort src/
```

### Pre-commit Hooks

```bash
# Install hooks
pre-commit install

# Run on all files
pre-commit run --all-files

# Skip hooks (not recommended)
git commit --no-verify
```

## Performance Profiling

```python
# profile.py
import cProfile
import pstats
from src.train import train_model

profiler = cProfile.Profile()
profiler.enable()

# Run your code
train_model()

profiler.disable()
stats = pstats.Stats(profiler)
stats.sort_stats('cumulative')
stats.print_stats()
```

Run profiler:

```bash
python profile.py
```

## Documentation Development

### Preview Documentation

```bash
cd documentation

npm install
npm start

# Open http://localhost:3000
```

### Add Documentation

1. Create markdown file in `docs/`
2. Add to sidebar in `sidebars.js`
3. Preview locally
4. Commit and push

## Troubleshooting

### Port Conflicts

```bash
# Find what's using the port
lsof -i :5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Kill process
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows
```

### Memory Issues

```bash
# Check Docker resource usage
docker stats

# Increase Docker memory limit
# Docker Desktop → Settings → Resources
```

### Database Issues

```bash
# Restart PostgreSQL
docker compose restart postgres

# Reset database (warning: loses data)
docker compose down -v
docker compose up -d postgres
```

## Useful Commands

### Docker Compose

```bash
# Start services
docker compose up -d

# Stop services
docker compose stop

# Restart service
docker compose restart mlflow

# View logs
docker compose logs -f mlflow

# Execute command
docker compose exec mlflow bash

# Clean up (warning: removes data)
docker compose down -v
```

### Git

```bash
# Check status
git status

# View branches
git branch -a

# Update from upstream
git fetch upstream
git rebase upstream/main

# Force push (use carefully)
git push --force-with-lease

# View changes
git diff
git log --oneline -10
```

### Python

```bash
# Check Python version
python --version

# Create virtual environment
python -m venv .venv

# Activate environment
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# List packages
pip list

# Check for security issues
pip audit
```

---

Happy developing! 🚀
