---
sidebar_position: 3
---

# MLOps Workflow Guide

This guide explains how to work with the MLOps platform, including configuring models and deploying to different environments using Git-based workflows.

## Overview

The MLOps platform uses a **branch-based deployment strategy** where different Git branches correspond to different environments:

- **`main` branch** → **Production** environment
- **`qa` branch** → **QA/Staging** environment  
- **`dev` or feature branches** → **Development** environment

## Working with MLOps: Step-by-Step

### Step 1: Configure Your Model

Each model's configuration is defined in a `config.yaml` file that researchers edit to specify:
- Model architecture and hyperparameters
- Training dataset location
- Output paths and artifact storage
- Compute resources (CPU, GPU, memory)
- MLflow tracking parameters

**Example config.yaml structure:**
```yaml
# Model Configuration
model:
  name: bert-sentiment-classifier
  version: v2.1
  architecture: transformers
  pretrained: bert-base-uncased

# Training Configuration
training:
  batch_size: 32
  learning_rate: 0.001
  epochs: 10
  optimizer: adam
  loss_function: cross_entropy

# Data Configuration
data:
  train_path: s3://mlops/datasets/sentiment/train
  val_path: s3://mlops/datasets/sentiment/val
  test_path: s3://mlops/datasets/sentiment/test
  preprocessing: true

# Compute Resources
resources:
  gpu: 1
  memory_gb: 16
  cpu_cores: 8

# MLflow Tracking
mlflow:
  experiment_name: sentiment-analysis
  artifact_location: s3://mlops/artifacts
  tags:
    project: nlp
    team: research
```

**Where to find configs:**
```
mlops-research-template/
├── configs/
│   ├── default.yaml          # Default configuration
│   ├── bert-model.yaml       # BERT-specific config
│   ├── gpt-model.yaml        # GPT-specific config
│   └── custom-model.yaml     # Custom model config
└── src/
    └── train.py              # Training script
```

### Step 2: Edit Configuration for Your Model

1. **Navigate to the config file:**
   ```bash
   cd mlops-research-template/configs
   cat default.yaml
   ```

2. **Edit the configuration:**
   ```bash
   # Copy and customize
   cp default.yaml my-experiment.yaml
   
   # Edit hyperparameters
   nano my-experiment.yaml
   ```

3. **Common parameters to adjust:**
   - `batch_size` - Memory usage vs training speed
   - `learning_rate` - Model convergence
   - `epochs` - Training duration
   - `gpu` - Number of GPUs to use
   - `experiment_name` - For MLflow tracking
   - Data paths - Different datasets or versions

### Step 3: Push to the Appropriate Branch

The deployment environment is determined by which branch you push to. Choose based on your needs:

#### **Push to `dev` or Feature Branch** → **Development Environment**

Use for:
- Initial experimentation
- Testing new model architectures
- Debugging code issues
- Local validation

**Commands:**
```bash
# Create feature branch
git checkout -b feature/my-new-model

# Make changes to config
nano configs/my-experiment.yaml

# Commit changes
git add configs/my-experiment.yaml
git commit -m "Add BERT configuration for sentiment analysis"

# Push to feature branch
git push origin feature/my-new-model
```

**What happens:**
- Training runs in **dev environment**
- Uses dev datasets and compute resources
- Results logged to dev MLflow instance
- No impact on production systems

---

#### **Create Pull Request to `qa` Branch** → **QA/Staging Environment**

Use for:
- Validating models on production-like data
- Performance testing before release
- Cross-team review and approval
- Integration testing

**Workflow:**
```bash
# Push to feature branch (if not already done)
git push origin feature/my-new-model

# Create Pull Request in GitHub/GitLab
# Title: "Add BERT sentiment classifier"
# Description:
# - Model: BERT-base for sentiment analysis
# - Accuracy: 92% on validation set
# - Config: configs/bert-sentiment.yaml
# - Tests: All unit tests passing
```

**PR Checklist:**
- [ ] Configuration is valid and tested
- [ ] Model performance meets requirements
- [ ] MLflow experiment tracking is set up
- [ ] No breaking changes to pipeline
- [ ] Documentation is updated

**Approve and Merge:**
```bash
# After review approval, merge to qa
git checkout qa
git pull origin qa
git merge --no-ff feature/my-new-model
git push origin qa
```

**What happens:**
- Training runs in **QA environment**
- Uses production-like datasets
- Uses dedicated QA compute resources
- Results logged to QA MLflow instance
- Staging model endpoints deployed
- Can be accessed by stakeholders for validation

---

#### **Create Pull Request to `main` Branch** → **Production Environment**

Use for:
- Releasing tested, approved models
- Production deployments
- Final validation before live serving

**Requirements before merging to main:**
- ✅ Merged and tested in `qa` branch
- ✅ Performance validated on production data
- ✅ All stakeholders approved
- ✅ Deployment documentation complete
- ✅ Rollback plan documented

**Workflow:**
```bash
# Ensure latest qa changes
git checkout main
git pull origin main

# Create PR from qa to main
# (In GitHub/GitLab interface)
# Title: "Release BERT sentiment classifier v2.1"
# Release Notes:
# - Production-ready model
# - 92.5% accuracy on test set
# - Handles 1000 requests/sec
# - Backward compatible
```

**Final Merge:**
```bash
# After final approval
git checkout main
git pull origin main
git merge --no-ff qa
git tag -a v2.1 -m "Release BERT sentiment classifier v2.1"
git push origin main
git push origin v2.1
```

**What happens:**
- Training runs in **production environment**
- Uses production datasets
- Uses full production compute resources
- Model endpoints become available to end users
- Automatic scaling enabled
- Monitoring and alerting activated

---

## Complete Workflow Example

Here's a complete example of developing and releasing a new model:

### Phase 1: Development (on `dev` branch)

```bash
# Start from dev
git checkout dev
git pull origin dev

# Create feature branch
git checkout -b feature/xlnet-classifier

# Edit configuration
cp configs/default.yaml configs/xlnet-classifier.yaml
# ... edit config with new hyperparameters ...

# Commit
git add configs/xlnet-classifier.yaml
git commit -m "XLNet classifier: batch=16, lr=0.0001, epochs=15"

# Push
git push origin feature/xlnet-classifier

# Monitor in dev MLflow
# - Navigate to http://dev-mlflow.company.com
# - Watch experiment run
# - Validate accuracy and metrics
```

### Phase 2: QA Testing (merge to `qa`)

```bash
# Create pull request feature/xlnet-classifier → qa
# Wait for review and approval

# Merge to qa
git checkout qa
git pull origin qa
git merge feature/xlnet-classifier
git push origin qa

# Monitor in QA MLflow
# - http://qa-mlflow.company.com
# - Run on production-like dataset
# - Validate performance at scale
# - A/B test if needed
```

### Phase 3: Production Release (merge to `main`)

```bash
# Create pull request qa → main
# Include:
# - Performance metrics
# - Comparison with previous model
# - Load testing results
# - Team approval from stakeholders

# After approval, merge to main
git checkout main
git pull origin main
git merge qa
git tag -a v3.0 -m "XLNet classifier production release"
git push origin main --tags

# Monitor in Production MLflow
# - http://mlflow.company.com
# - Model automatically deployed
# - Serves live traffic
# - Monitor latency and accuracy
```

---

## Configuration Best Practices

### 1. **Version Your Configs**

```yaml
# Always include version
model:
  name: xlnet-classifier
  version: v3.0
  config_version: 1.0
  
metadata:
  created_date: 2024-01-18
  author: research-team
  description: "XLNet with fine-tuned hyperparameters"
```

### 2. **Use Environment Variables**

```yaml
# Use references instead of hardcoded values
data:
  train_path: ${DATA_PATH}/train
  val_path: ${DATA_PATH}/val
  
training:
  batch_size: ${BATCH_SIZE:-32}  # Default 32
  learning_rate: ${LEARNING_RATE:-0.001}
```

### 3. **Document Changes**

```bash
# Always use descriptive commit messages
git commit -m "Increase batch size from 16 to 32 for faster convergence
  
- Previous accuracy: 90.2%
- Expected accuracy: 91.5%
- Training time reduction: 30%
- Hardware requirement: 16GB GPU"
```

### 4. **Test Before Merging**

```bash
# Run local validation
python src/train.py --config configs/xlnet-classifier.yaml --test

# Verify config syntax
python -c "import yaml; yaml.safe_load(open('configs/xlnet-classifier.yaml'))"

# Check for required fields
python scripts/validate_config.py configs/xlnet-classifier.yaml
```

---

## Environment Details

### Development Environment
- **Branch:** `dev` or any feature branch
- **Dataset:** Reduced dataset (10% of production)
- **Compute:** Shared dev GPU cluster
- **MLflow:** Dev instance (short retention)
- **Deployment:** Not deployed
- **Use Case:** Rapid iteration, experimentation

### QA/Staging Environment
- **Branch:** `qa`
- **Dataset:** Full production dataset
- **Compute:** Dedicated QA GPU cluster
- **MLflow:** QA instance (30-day retention)
- **Deployment:** Staging endpoints
- **Use Case:** Pre-production testing, validation

### Production Environment
- **Branch:** `main`
- **Dataset:** Live production data
- **Compute:** Production GPU cluster (auto-scaling)
- **MLflow:** Production instance (permanent retention)
- **Deployment:** Live endpoints
- **Use Case:** Serving real traffic, revenue-generating

---

## Troubleshooting

### Issue: Changes not appearing in environment

**Solution:**
```bash
# Verify you pushed to correct branch
git branch -v

# Check remote branches
git branch -r

# Ensure branch is up to date
git pull origin <branch-name>
```

### Issue: Configuration validation fails

**Solution:**
```bash
# Validate YAML syntax
python -m yaml configs/my-config.yaml

# Check required fields
grep -E "^(model|training|data|resources):" configs/my-config.yaml

# Run validation script
python scripts/validate_config.py configs/my-config.yaml
```

### Issue: Model not deploying to environment

**Solution:**
```bash
# Check CI/CD pipeline status
# In GitHub: Actions tab → check workflow logs

# View deployment logs
kubectl logs -f deployment/model-server -n mlops

# Check if config was merged correctly
git log --oneline <branch-name> | head -5
```

---

## Summary: Branch to Environment Mapping

| Branch | Environment | Purpose | Dataset | Deployment |
|--------|-------------|---------|---------|-----------|
| `feature/*` or `dev` | Development | Experimentation | Sample | None |
| `qa` | QA/Staging | Validation | Full | Staging |
| `main` | Production | Release | Live | Live |

## Next Steps

1. **Clone the research template:**
   ```bash
   git clone https://github.com/MLops-Project-Platform/mlops-research-template.git
   cd mlops-research-template
   ```

2. **Create your config:**
   ```bash
   cp configs/default.yaml configs/my-model.yaml
   # Edit as needed
   ```

3. **Push to appropriate branch:**
   ```bash
   git add configs/my-model.yaml
   git commit -m "Add my-model configuration"
   git push origin feature/my-model
   ```

4. **Monitor in MLflow:**
   - Dev: `http://localhost:5000` (local)
   - QA: Check your team's QA MLflow URL
   - Production: Check your team's production MLflow URL

---

## Additional Resources

- [MLflow Documentation](/docs/tools/mlflow)
- [Research Template Guide](/docs/researcher-guide/overview)
- [Git Branching Strategy](/docs/development/contributing)
