---
sidebar_position: 1
---

# Database Overview

## Overview

Databases are the backbone of data persistence in MLOps platforms. This guide covers the different types of databases and how to select the right one for your use case.

## Relational vs Non-Relational

### Relational Databases (SQL)

**Characteristics:**
- Structured schema with tables and relationships
- ACID transactions (Atomicity, Consistency, Isolation, Durability)
- Complex queries with JOINs
- Vertical scaling (scale up)

**Best For:**
- Structured metadata
- Complex queries
- Transactions requiring consistency
- Data with clear relationships

**Examples:**
- PostgreSQL
- MySQL
- Oracle Database

### Non-Relational Databases (NoSQL)

**Characteristics:**
- Flexible schema (document, key-value, graph)
- Eventually consistent
- Horizontal scaling (scale out)
- High throughput and availability

**Types:**
- **Document** - MongoDB, CouchDB
- **Key-Value** - Redis, DynamoDB
- **Column Family** - Cassandra, HBase
- **Graph** - Neo4j, ArangoDB

## Database Selection Guide

| Category | Use Case | Best Options | Scaling | Consistency |
|----------|----------|--------------|---------|-------------|
| **Structured Metadata** | ML experiment tracking, configuration storage | PostgreSQL, MySQL | Vertical | Strong |
| **Flexible Schema** | Variable experiment metadata, configs | MongoDB, DynamoDB | Horizontal | Eventual |
| **High Performance Caching** | Session storage, model cache, feature cache | Redis, Memcached | Horizontal | Immediate |
| **Time-Series Data** | Metrics, logs, training progress | InfluxDB, Prometheus | Horizontal | Eventual |
| **Graph Data** | Model relationships, dependency tracking | Neo4j, ArangoDB | Vertical | Strong |
| **High Concurrency** | Distributed training state | Cassandra, DynamoDB | Horizontal | Eventual |

## Architecture Patterns

### Single Database
```
Application → Database
```
Simple, good for small deployments
- Easy to manage
- Single point of failure
- Scaling limitations

### Multi-Database Pattern
```
Application → PostgreSQL (metadata)
            → Redis (cache)
            → InfluxDB (metrics)
            → MongoDB (logs)
```
Optimized for different access patterns
- Each database optimized for its use case
- Increased operational complexity
- Better scalability and performance

### Read Replicas
```
Application → Master (write)
            ↓
            Replica 1 (read)
            Replica 2 (read)
            Replica 3 (read)
```
Distribute read load
- Reduces write bottleneck
- Eventual consistency considerations
- Replication lag management

## Data Consistency Models

### Strong Consistency
- All reads see the latest data
- Used by: PostgreSQL, MySQL
- Trade-off: Slower writes, higher latency

### Eventual Consistency
- Reads may return stale data temporarily
- Data will be consistent eventually
- Used by: MongoDB, Cassandra, DynamoDB
- Trade-off: Faster availability, possible inconsistency windows

## Best Practices

### Schema Design
- Normalize SQL databases to reduce redundancy
- Denormalize NoSQL documents for fast access
- Use indexes for frequently queried fields
- Plan for growth and scaling

### Performance Optimization
```sql
-- Use indexes for frequently queried columns
CREATE INDEX idx_experiment_id ON runs(experiment_id);

-- Partition large tables
CREATE TABLE metrics (
  run_id UUID,
  timestamp TIMESTAMP,
  metric_name VARCHAR(255),
  value FLOAT
) PARTITION BY RANGE (timestamp);
```

### High Availability Setup
- Master-Replica replication
- Multi-region deployment
- Automated failover
- Regular backups

### Backup and Recovery

**Backup Strategy:**
```bash
# PostgreSQL backup
pg_dump -h localhost -U user -d database > backup.sql

# Restore from backup
psql -h localhost -U user -d database < backup.sql

# MongoDB backup
mongodump --uri "mongodb://localhost:27017" --out /backups

# MongoDB restore
mongorestore --uri "mongodb://localhost:27017" /backups
```

**Recovery Plan:**
1. Determine RPO (Recovery Point Objective) - acceptable data loss
2. Determine RTO (Recovery Time Objective) - acceptable downtime
3. Test recovery procedures regularly
4. Document recovery steps
5. Maintain backup redundancy (geographic distribution)

**Recommended Backup Schedule:**
- Full backup: Daily or weekly
- Incremental backup: Hourly
- WAL (Write-Ahead Logs): Continuous for databases supporting it
- Test recovery: Monthly

### Connection Management

```python
# Connection pooling for PostgreSQL
from sqlalchemy import create_engine

engine = create_engine(
    'postgresql://user:password@localhost/mlflow',
    pool_size=20,  # Max 20 connections
    max_overflow=40,  # Up to 40 overflow connections
    pool_pre_ping=True,  # Test connection before using
    pool_recycle=3600  # Recycle connections every hour
)

# Connection pooling for MongoDB
from pymongo import MongoClient

client = MongoClient(
    'mongodb://localhost:27017',
    maxPoolSize=50,
    minPoolSize=10,
    serverSelectionTimeoutMS=5000
)
```

## Monitoring Database Health

### Key Metrics to Track
```promql
# Query latency
histogram_quantile(0.95, rate(db_query_duration_seconds_bucket[5m]))

# Connection count
db_connections_active

# Cache hit ratio
db_cache_hits / (db_cache_hits + db_cache_misses)

# Replication lag
replication_lag_seconds

# Disk usage
db_disk_used_bytes / db_disk_total_bytes
```

### Health Checks
```python
# PostgreSQL health check
import psycopg2

def check_postgres_health():
    try:
        conn = psycopg2.connect("dbname=mlflow user=mlflow")
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        cursor.close()
        conn.close()
        return True
    except:
        return False

# MongoDB health check
from pymongo import MongoClient

def check_mongodb_health():
    try:
        client = MongoClient('mongodb://localhost:27017', serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        return True
    except:
        return False
```

## Migration Strategies

### Zero-Downtime Migration
```bash
# 1. Run old and new databases in parallel
# 2. Dual-write to both databases
# 3. Validate data consistency
# 4. Switch reads to new database
# 5. Monitor for issues
# 6. Switch writes to new database
# 7. Retire old database
```

## Disaster Recovery

### RTO/RPO Goals

| Service | RTO | RPO | Strategy |
|---------|-----|-----|----------|
| **MLflow metadata** | 1 hour | 15 minutes | Sync replication + hourly backups |
| **Training data** | 4 hours | 1 hour | Multi-region replication |
| **Model artifacts** | 24 hours | 6 hours | Backup to S3 cross-region |

### Recovery Procedures

```bash
# Test database recovery
1. Provision new database instance
2. Restore from backup
3. Validate data integrity
4. Point application to new database
5. Monitor for issues
6. Update DNS/configuration
7. Decommission old database
```

## Further Reading

- [PostgreSQL Guide](/docs/tools/postgres)
- [MySQL Guide](/docs/tools/mysql)
- [MongoDB Guide](/docs/tools/mongodb)
- [Redis Guide](/docs/tools/redis)
- [Cassandra Guide](/docs/tools/cassandra)
- [DynamoDB Guide](/docs/tools/dynamodb)
- [InfluxDB Guide](/docs/tools/influxdb)
- [Prometheus Guide](/docs/tools/prometheus)
- [InfluxDB Documentation](./influxdb.md)
- [Prometheus Documentation](./prometheus.md)
