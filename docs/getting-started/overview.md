---
sidebar_position: 1
---

# Overview

Welcome to the MLOps Platform Documentation! This is a comprehensive guide for researchers, engineers, and operations teams working with our enterprise MLOps infrastructure.

## About

**Almog Levinshtein** | Head of MLops & DevOps / Solution Architect at DRS Rada

- 📧 [almog.levinshtein@gmail.com](mailto:almog.levinshtein@gmail.com)
- 📱 [+972 52-473-6511](tel:0524736511)
- 💼 [LinkedIn Profile](https://www.linkedin.com/in/almog-nachshon/)

This MLOps Platform documentation has been developed as part of a comprehensive infrastructure solution for enterprise machine learning operations.

## MLOps Lifecycle

![MLOps Lifecycle](pathname:///img/mlops.webp)

## What is MLOps Platform?

The MLOps Platform is a complete, open-source infrastructure for managing machine learning workflows at scale. It combines:

- **Experiment Tracking** (MLflow)
- **Model Registry** (MLflow)
- **Artifact Storage** (MinIO S3)
- **Metadata Management** (PostgreSQL)
- **Container Orchestration** (Docker & Kubernetes)
- **Infrastructure as Code** (Helm Charts)

## Quick Links

- 🚀 [Quick Start](./quick-start.md)
- 🏗️ [Architecture Overview](../architecture/overview.md)
- 📚 [Repositories Guide](../repositories/overview.md)
- 🔧 [Tools & Components](../tools/overview.md)
- 👨‍🔬 [Researcher Guide](../researcher-guide/overview.md)

## Documentation Structure

### For Researchers
Start with the [Researcher Guide](../researcher-guide/overview.md) to learn how to set up your environment and run training experiments.

### For DevOps/Platform Engineers
See [Deployment Guide](../deployment/docker.md) for Docker and Kubernetes deployment options.

### For All Contributors
Check [Contributing Guide](../development/contributing.md) for development workflows.

## Key Features

✅ **End-to-End ML Lifecycle Management**
- Experiment tracking and comparison
- Model versioning and registry
- Artifact management

✅ **Production-Ready Infrastructure**
- Docker containerization
- Kubernetes orchestration
- High-availability setup

✅ **Developer-Friendly**
- Local POC with docker-compose
- Simple Python API for tracking
- Clear configuration management

✅ **Scalable Architecture**
- PostgreSQL for metadata
- MinIO for distributed artifact storage
- Kubernetes for distributed computing

## Architecture at a Glance

```
┌─────────────────────────────────────────┐
│      Research/Experiment Code            │
│   (mlops-research-template)              │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      MLflow Tracking Server              │
│  (Experiment Logging & Model Registry)   │
└──────────────┬──────────────────────────┘
               │
      ┌────────┴────────┐
      ▼                 ▼
┌──────────────┐   ┌──────────────────┐
│  PostgreSQL  │   │    MinIO (S3)    │
│  (Metadata)  │   │  (Artifacts)     │
└──────────────┘   └──────────────────┘
```

## Repositories Overview

| Repository | Purpose |
|-----------|---------|
| **mlops-platform** | Core infrastructure (Docker Compose, Kubernetes configs) |
| **mlops-research-template** | Template for ML research/training projects |
| **mlops-helm-charts** | Kubernetes deployment via Helm |
| **documentation** | This documentation site |

## Getting Help

- 📖 Browse the documentation
- 🐛 [Report issues on GitHub](https://github.com/MLops-Project-Platform)
- 💬 [Start a discussion](https://github.com/MLops-Project-Platform/discussions)

---

**Next Step:** [Quick Start Guide →](./quick-start.md)
