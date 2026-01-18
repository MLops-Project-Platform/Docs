---
sidebar_position: 4
---

# Databases

## Overview

Databases are critical components in an MLOps platform, serving different purposes from metadata storage to feature stores and experiment tracking. This guide covers SQL, NoSQL, and caching solutions commonly used in ML workflows.

## SQL Databases

### PostgreSQL

PostgreSQL is a powerful, open-source relational database system. In the MLOps Platform, it serves as the primary metadata backend for MLflow.

**Use Cases:**
- Experiment tracking metadata (MLflow)
- Structured data storage
- Complex queries with transactions
- ACID compliance required

**Key Features:**
- ACID transactions
- Complex JOIN operations
- Full-text search
- JSON/JSONB support
- Extensibility with custom types

**Connection:**
```yaml
Database: mlflow
Host: postgres (or localhost:5432)
User: mlflow
Password: [configured in secrets]
```

**Key Tables in MLflow:**
- `experiments` - Experiment metadata
- `runs` - Training runs and their status
- `metrics` - Performance metrics during training
- `params` - Hyperparameters
- `tags` - Custom metadata tags

### MySQL

MySQL is a popular relational database option offering similar functionality to PostgreSQL.

**Use Cases:**
- Alternative to PostgreSQL
- Existing infrastructure integration
- Web application databases
- High-concurrency read-heavy workloads

**Key Features:**
- Fast read operations
- InnoDB for ACID transactions
- Replication support
- Good for web applications

**In MLOps Context:**
Can be used as an alternative metadata backend for MLflow or for storing training datasets and metadata.

## NoSQL Databases

### MongoDB

MongoDB is a document-oriented NoSQL database ideal for flexible schema requirements.

**Use Cases:**
- Unstructured experiment metadata
- Feature store configuration
- Dynamic schema requirements
- High write throughput scenarios

**Key Features:**
- Flexible JSON-like documents
- Horizontal scalability (sharding)
- Aggregation pipeline for complex queries
- Full-text search capabilities
- Transaction support (4.0+)

**Integration Points:**
- Storing run configurations with variable schemas
- Caching feature metadata
- Logging experiment artifacts metadata

**Connection Example:**
```python
from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017/')
db = client['mlops_db']
experiments = db['experiments']
```

### DynamoDB (AWS)

DynamoDB is a fully managed NoSQL service from AWS.

**Use Cases:**
- Serverless ML applications
- Auto-scaling metadata storage
- Cloud-native deployments
- Pay-per-request pricing model

**Key Features:**
- Fully managed service
- Automatic scaling
- Global tables for multi-region
- Consistent performance at scale

## Caching Layer

### Redis

Redis is an in-memory data structure store used for caching and real-time operations.

**Use Cases:**
- Experiment run caching
- Model serving caches
- Feature caching
- Session management
- Real-time metrics aggregation

**Key Features:**
- Sub-millisecond latency
- Multiple data structures (strings, lists, sets, hashes, sorted sets)
- Pub/Sub messaging
- Persistence options (RDB, AOF)
- Cluster support for high availability

**Integration in MLOps:**
```python
import redis

# Connect to Redis
r = redis.Redis(host='redis', port=6379, db=0)

# Cache a model prediction result
r.setex('prediction:model_v1:input_123', 3600, prediction_result)

# Get cached result
cached = r.get('prediction:model_v1:input_123')
```

**Common Use Cases:**
- Cache frequently accessed models
- Store recent experiment metrics
- Rate limiting for model serving
- Session storage for web dashboards

### Memcached

Memcached is a distributed memory caching system.

**Use Cases:**
- High-concurrency caching needs
- Simple key-value caching
- Load balancing across cache nodes

**Key Features:**
- Simple key-value interface
- Multi-threaded
- Consistent hashing for distribution
- No persistence (data loss on restart)

## Time-Series Databases

### InfluxDB

InfluxDB is optimized for time-series data like metrics collected during training.

**Use Cases:**
- Real-time metrics collection
- Training job performance monitoring
- Time-series experiment data
- GPU/CPU utilization tracking

**Key Features:**
- Optimized for time-series data
- High-throughput writes
- Downsampling capabilities
- Built-in retention policies
- InfluxQL query language

**Integration:**
```python
from influxdb import InfluxDBClient

client = InfluxDBClient(host='localhost', port=8086)

# Write metric data
json_body = [
    {
        "measurement": "training_metrics",
        "tags": {
            "run_id": "run_123",
            "model": "bert_v1"
        },
        "fields": {
            "loss": 0.45,
            "accuracy": 0.92
        }
    }
]
client.write_points(json_body)
```

### Prometheus

Prometheus is a monitoring and alerting system with a time-series database.

**Use Cases:**
- Infrastructure monitoring
- ML pipeline health checks
- Model serving metrics
- Alert generation

**Key Features:**
- Pull-based metric collection
- Dimensional data model
- Flexible query language (PromQL)
- Built-in alerting
- Scrape targets configuration

## Database Selection Guide

| Database | Structured | Flexible Schema | Transactions | Caching | Time-Series | Use in MLOps |
|----------|-----------|-----------------|--------------|---------|-------------|--------------|
| PostgreSQL | ✅ | ⚠️ (JSONB) | ✅ | ❌ | ⚠️ | Metadata, Experiment tracking |
| MySQL | ✅ | ⚠️ | ✅ | ❌ | ⚠️ | Alternative metadata |
| MongoDB | ❌ | ✅ | ✅ (4.0+) | ❌ | ❌ | Flexible metadata |
| Redis | ❌ | ✅ | ⚠️ | ✅ | ❌ | Caching, Sessions |
| InfluxDB | ✅ | ❌ | ❌ | ❌ | ✅ | Metrics collection |
| Prometheus | ✅ | ❌ | ❌ | ⚠️ | ✅ | Monitoring |
| DynamoDB | ❌ | ✅ | ⚠️ | ❌ | ❌ | Cloud-native metadata |

## Best Practices

### Data Organization
- **Hot data** → Redis/Memcached
- **Operational data** → PostgreSQL/MySQL
- **Flexible metadata** → MongoDB
- **Metrics** → InfluxDB/Prometheus
- **Long-term storage** → Data warehouse/Object storage

### Performance Optimization
```python
# Batch writes to reduce latency
batch_metrics = []
for metric in metrics:
    batch_metrics.append(metric)
    if len(batch_metrics) >= 100:
        db.write_batch(batch_metrics)
        batch_metrics = []
```

### High Availability
- Use database replication
- Implement connection pooling
- Set up read replicas for scalability
- Monitor database health metrics

### Backup and Recovery
- Daily automated backups
- Test recovery procedures
- Maintain backup retention policies
- Document recovery procedures

## Monitoring and Maintenance

### Key Metrics to Track
- Query response time
- Connection pool utilization
- Disk usage and growth
- Replication lag (for replicated databases)
- Cache hit ratio (for Redis/Memcached)

### Regular Maintenance
- Index optimization
- Vacuum/analyze operations (PostgreSQL)
- Log rotation
- Connection cleanup
- Storage capacity planning

## Further Reading

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Redis Documentation](https://redis.io/documentation)
- [InfluxDB Documentation](https://docs.influxdata.com/)
- [Prometheus Documentation](https://prometheus.io/docs/)
