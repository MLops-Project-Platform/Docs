---
sidebar_position: 1
---

# Researcher Guide Overview

This guide is designed for data scientists and ML researchers working with the MLOps Platform. It covers everything you need to set up your environment, run experiments, and track your work.

## Who This Guide Is For

👥 **Ideal for:**
- Data Scientists running ML experiments
- ML Researchers exploring new approaches
- ML Engineers building and training models
- Anyone using the platform for ML work

📋 **Prerequisites:**
- Basic Python knowledge
- Understanding of ML concepts
- Familiarity with command line
- Docker basics (helpful but not required)

## What You'll Learn

### Getting Started
- Setting up your development environment
- Connecting to the MLOps platform
- Running your first experiment

### Training
- Writing trackable training code
- Organizing experiments
- Managing hyperparameters
- Handling data and artifacts

### Experiment Tracking
- Logging metrics and parameters
- Organizing experiments
- Comparing runs
- Managing models

### Best Practices
- Code organization
- Configuration management
- Reproducibility
- Collaboration

## The Researcher Workflow

```
1. Set Up Environment
   └─> Create project from template
   └─> Install dependencies
   └─> Activate MLflow tracking

2. Develop & Train
   └─> Write training script
   └─> Configure hyperparameters
   └─> Run experiments
   └─> Log metrics & artifacts

3. Monitor & Analyze
   └─> View experiments in MLflow UI
   └─> Compare run results
   └─> Analyze performance

4. Iterate & Improve
   └─> Adjust hyperparameters
   └─> Try different approaches
   └─> Test improvements

5. Finalize & Register
   └─> Select best model
   └─> Register in model registry
   └─> Document approach
```

## Quick Navigation

- 🚀 [Setup Guide](./setup.md) - Get your environment ready
- 🏋️ [Training Guide](./training.md) - Write and run training code
- 📊 [Experiment Tracking](./tracking-experiments.md) - Track your work
- ✅ [Best Practices](./best-practices.md) - Do it right from the start

## Environment Overview

### Local Development Setup

```
Your Laptop/Workstation
├── MLOps Research Code
│   ├── src/train.py
│   ├── configs/
│   └── requirements.txt
│
└── Connects to:
    MLOps Platform (Docker Compose)
    ├── MLflow Server (port 5000)
    ├── PostgreSQL Database
    └── MinIO Storage
```

### File Organization

```
mlops-research-template/
├── configs/           # Configuration files
│   └── default.yaml
├── src/               # Training code
│   ├── train.py
│   └── utils.py
├── notebooks/         # Jupyter notebooks (optional)
├── data/              # Local data (gitignored)
└── models/            # Saved models (gitignored)
```

## Key Concepts

### Experiment
A collection of related training runs. For example: "Neural Network Baseline" or "Random Forest Hyperparameter Tuning".

### Run
A single training execution. Each run logs parameters, metrics, and artifacts.

### Artifact
A file generated during training: models, plots, logs, datasets.

### Metric
A numeric value tracked during training: accuracy, loss, F1-score.

### Parameter
A hyperparameter configuration: learning rate, batch size, algorithm choice.

## Tools You'll Use

| Tool | Purpose | Access |
|------|---------|--------|
| **MLflow** | Track experiments & manage models | http://localhost:5000 |
| **Python** | Write training scripts | Command line |
| **YAML** | Configure experiments | Text editor |
| **Docker** | Run MLOps platform | Command line |
| **Git** | Version control | Command line |

## Getting Help

Throughout this guide, you'll see:
- 💡 **Tips** - Helpful suggestions
- ⚠️ **Warnings** - Things to watch out for
- ✅ **Best Practices** - Recommended approaches
- ❌ **Common Mistakes** - What to avoid

## Common Questions

**Q: Do I need to understand Kubernetes?**
A: No! For research, you just need to understand the local Docker setup.

**Q: Where is my data stored?**
A: Locally in PostgreSQL (metadata) and MinIO S3 (artifacts/models).

**Q: Can I access experiments from different machines?**
A: Yes! If they connect to the same MLflow server (port 5000).

**Q: What if I mess up the platform?**
A: Easy! Just restart with `docker compose down` and `docker compose up -d`.

## Next Steps

1. **New to MLOps?** Start with [Setup Guide](./setup.md)
2. **Ready to train?** Go to [Training Guide](./training.md)
3. **Need examples?** Check [Experiment Tracking](./tracking-experiments.md)
4. **Want mastery?** Read [Best Practices](./best-practices.md)

---

Let's get started! 🚀
