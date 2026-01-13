---
sidebar_position: 3
---

# Architecture

## System Overview

The MLOps Platform consists of multiple integrated components:

```
┌─────────────────────────────────────────────────────────┐
│                    User Layer                           │
│  ┌──────────────┐          ┌──────────────┐             │
│  │   Researcher │          │   DataScience│             │
│  │   (Python)   │          │    Team      │             │
│  └──────┬───────┘          └──────┬───────┘             │
└─────────┼──────────────────────────┼────────────────────┘
          │                          │
          ▼                          ▼
┌─────────────────────────────────────────────────────────┐
│              Application Layer                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │     MLflow Tracking Server (Port 5000)           │   │
│  │  - Experiment Tracking                           │   │
│  │  - Model Registry & Versioning                   │   │
│  │  - Run Management                                │   │
│  └────────┬──────────────────────────┬──────────────┘   │
└───────────┼──────────────────────────┼──────────────────┘
            │                          │
      ┌─────▼─────┐            ┌───────▼────────┐
      │            │            │                │
      ▼            ▼            ▼                ▼
┌──────────────────────────────────────────────────────┐
│              Data & Storage Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │  PostgreSQL  │  │   MinIO S3   │  │   Nginx   │  │
│  │  (Metadata)  │  │ (Artifacts)  │  │  (Proxy)  │  │
│  └──────────────┘  └──────────────┘  └───────────┘  │
└──────────────────────────────────────────────────────┘
```

## Component Breakdown

### MLflow Tracking Server
**Purpose:** Central hub for all ML experiment tracking and model versioning

**Features:**
- Log metrics, parameters, and artifacts
- Compare experiments side-by-side
- Register and version models
- Track model lineage

**Port:** 5000

### PostgreSQL
**Purpose:** Metadata backend for MLflow

**Stores:**
- Experiment information
- Run metadata
- Model registry details
- Tags and parameters

**Port:** 5432 (internal)

### MinIO (S3-compatible)
**Purpose:** Distributed artifact and model storage

**Features:**
- S3-compatible API
- Multi-bucket support
- Web console for management
- High availability ready

**Ports:** 9000 (API), 9001 (Console)

### Nginx
**Purpose:** Reverse proxy and load balancing

**Handles:**
- Request routing
- TLS termination
- Load distribution

**Port:** 80/443

## Deployment Modes

### Development (Local)
```
docker compose up
```
Single-machine setup for development and testing

### Production (Kubernetes)
```
helm install mlops ./mlops-helm-charts
```
Highly available, scalable Kubernetes deployment

### Hybrid
Mix local development with cloud deployment

---

See [Components Deep Dive](./components.md) for detailed information.
