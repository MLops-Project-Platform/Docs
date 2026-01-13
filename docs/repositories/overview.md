---
sidebar_position: 1
---

# Repositories Overview

The MLOps Platform consists of four main repositories, each serving a specific purpose in the ML lifecycle.

## Repository Structure

```
MLops-Project-Platform/
├── mlops-platform           (Core Infrastructure)
├── mlops-research-template  (Research/Training)
├── mlops-helm-charts        (Kubernetes Deployment)
└── documentation            (This Documentation)
```

## Quick Reference

| Repository | Purpose | Audience | Deployment |
|-----------|---------|----------|-----------|
| **mlops-platform** | Core MLOps infrastructure | DevOps, Platform Eng | Docker Compose, K8s |
| **mlops-research-template** | ML research template | Data Scientists | Local Python, Docker |
| **mlops-helm-charts** | Kubernetes deployment | DevOps, SRE | Helm/Kubernetes |
| **documentation** | Complete guide | Everyone | Web (Docusaurus) |

## Understanding the Workflows

### Researcher Workflow

```
1. Clone mlops-research-template
   ↓
2. Set up local environment
   ↓
3. Run mlops-platform locally (docker-compose)
   ↓
4. Write training code
   ↓
5. Log to MLflow
   ↓
6. View results in MLflow UI
```

### Production Workflow

```
1. Development in mlops-research-template
   ↓
2. Deploy infrastructure with mlops-helm-charts
   ↓
3. Run training in mlops-platform K8s cluster
   ↓
4. Monitor and manage with MLflow
   ↓
5. Deploy models to production
```

## Repository Relationships

```
mlops-research-template
  ├── Depends on: mlops-platform (must be running)
  │
  └── Outputs: Models & Artifacts
              ↓
              Stored in mlops-platform
              
mlops-platform
  ├── Can run: Docker Compose (local dev)
  │
  └── Can deploy via: mlops-helm-charts
  
mlops-helm-charts
  └── Deploys: mlops-platform to Kubernetes
```

---

Detailed documentation for each repository:
- [mlops-platform](./mlops-platform.md)
- [mlops-research-template](./mlops-research-template.md)
- [mlops-helm-charts](./mlops-helm-charts.md)
