---
sidebar_position: 3
---

# PostgreSQL

## What is PostgreSQL?

PostgreSQL is a powerful, open-source relational database system that serves as the metadata backend for MLflow.

## Role in MLOps Platform

PostgreSQL stores:
- **Experiment metadata** - Experiment names, descriptions, tags
- **Run information** - Run IDs, start/end times, statuses
- **Metrics** - Training metrics with timestamps
- **Parameters** - Hyperparameters used in runs
- **Tags** - Custom tags for organizing runs
- **Model Registry** - Model names, versions, stages

## Database Schema

### Key Tables

```sql
-- Experiments
experiments
├── experiment_id (primary key)
├── name
├── artifact_location
├── lifecycle_stage
└── creation_time

-- Runs
runs
├── run_id (primary key)
├── experiment_id (foreign key)
├── user_id
├── status
├── start_time
├── end_time
└── artifact_uri

-- Metrics
metrics
├── run_id (foreign key)
├── key
├── value
├── timestamp
└── step

-- Parameters
params
├── run_id (foreign key)
├── key
└── value

-- Models
registered_models
├── name (primary key)
├── description
└── creation_timestamp

model_versions
├── name
├── version
├── stage (e.g., 'Staging', 'Production')
├── creation_timestamp
└── source
```

## Configuration

### Environment Variables

```bash
# Connection string
MLFLOW_BACKEND_STORE_URI=postgresql://mlflow:password@postgres:5432/mlflow

# Username for database
POSTGRES_USER=mlflow

# Password (change in production!)
POSTGRES_PASSWORD=mlflow

# Database name
POSTGRES_DB=mlflow
```

### docker-compose Configuration

```yaml
postgres:
  image: postgres:14
  environment:
    POSTGRES_USER: mlflow
    POSTGRES_PASSWORD: mlflow
    POSTGRES_DB: mlflow
  ports:
    - "5432:5432"
  volumes:
    - postgres_data:/var/lib/postgresql/data
```

## Common Operations

### Connect to Database

```bash
# From host machine
psql -h localhost -U mlflow -d mlflow -W

# From within container
docker compose exec postgres psql -U mlflow -d mlflow
```

### Useful Queries

```sql
-- Count experiments
SELECT COUNT(*) FROM experiments;

-- Count runs per experiment
SELECT experiment_id, COUNT(*) as run_count
FROM runs
GROUP BY experiment_id;

-- Get latest 10 runs
SELECT run_id, status, start_time
FROM runs
ORDER BY start_time DESC
LIMIT 10;

-- Find best accuracy
SELECT runs.run_id, metrics.value
FROM runs
JOIN metrics ON runs.run_id = metrics.run_id
WHERE metrics.key = 'accuracy'
ORDER BY metrics.value DESC
LIMIT 5;

-- List all models in production
SELECT name, version
FROM model_versions
WHERE stage = 'Production';
```

## Backup and Recovery

### Backup Database

```bash
# Using pg_dump
docker compose exec postgres pg_dump -U mlflow mlflow > backup.sql

# Using docker volume backup
docker run --rm -v mlops-postgres_postgres_data:/data \
  -v $(pwd):/backup \
  ubuntu tar czf /backup/postgres_backup.tar.gz /data
```

### Restore Database

```bash
# From SQL dump
psql -U mlflow -d mlflow < backup.sql

# From volume backup
docker volume rm mlops-postgres_postgres_data
docker run --rm -v mlops-postgres_postgres_data:/data \
  -v $(pwd):/backup \
  ubuntu tar xzf /backup/postgres_backup.tar.gz -C /
```

## Performance Optimization

### Indexing

```sql
-- Add indexes for common queries
CREATE INDEX idx_runs_experiment_id 
  ON runs(experiment_id);

CREATE INDEX idx_metrics_run_id 
  ON metrics(run_id);

CREATE INDEX idx_metrics_key_value 
  ON metrics(key, value);
```

### Query Optimization

```sql
-- Use ANALYZE to optimize query planner
ANALYZE;

-- Check index usage
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public';
```

## Monitoring

### Check Database Size

```sql
SELECT pg_size_pretty(pg_database_size('mlflow')) AS size;
```

### Monitor Connections

```sql
SELECT count(*) as total_connections 
FROM pg_stat_activity;
```

### Check Active Queries

```sql
SELECT pid, usename, query, query_start 
FROM pg_stat_activity 
WHERE state = 'active';
```

## Troubleshooting

### Connection Issues

```bash
# Check if PostgreSQL is running
docker compose ps postgres

# Check logs
docker compose logs postgres

# Test connection
docker compose exec postgres \
  pg_isready -h localhost -U mlflow
```

### Disk Space Issues

```bash
# Check table sizes
SELECT schemaname, tablename, 
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

# Vacuum and analyze
VACUUM ANALYZE;
```

---

See [Architecture](../architecture/overview.md) for how PostgreSQL fits in the system.
