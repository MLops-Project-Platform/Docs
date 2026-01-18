---
sidebar_position: 1
---

# MongoDB

## Overview

MongoDB is a document-oriented NoSQL database that stores data in flexible JSON-like documents. It's ideal for storing variable schema data in MLOps platforms.

## Key Features

- **Flexible Schema** - Documents can have different structures
- **Horizontal Scaling** - Sharding for distributing data
- **Indexing** - Fast queries on any field
- **Aggregation Pipeline** - Complex data transformation
- **Transactions** - ACID transactions since v4.0

## Use Cases in MLOps

### Flexible Experiment Metadata
```python
from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017/')
db = client['mlops']
experiments = db['experiments']

# Store experiments with flexible schema
experiment = {
    'name': 'bert-classifier',
    'version': 'v1.0',
    'config': {
        'batch_size': 32,
        'learning_rate': 0.001,
        'architecture': 'transformer',
        'layers': 12,
        'hidden_size': 768,
        'custom_param_1': 'value1',
        'custom_param_2': 42
    },
    'tags': ['nlp', 'classification'],
    'created_at': datetime.now(),
    'status': 'completed'
}

result = experiments.insert_one(experiment)
```

## Installation

### Docker
```yaml
mongodb:
  image: mongo:5.0
  environment:
    MONGO_INITDB_ROOT_USERNAME: admin
    MONGO_INITDB_ROOT_PASSWORD: password
  ports:
    - "27017:27017"
  volumes:
    - mongodb_data:/data/db
```

## Basic Operations

### CRUD Operations
```python
from pymongo import MongoClient
from datetime import datetime

client = MongoClient('mongodb://localhost:27017/')
db = client['mlops']
runs = db['runs']

# Create
run = {
    'run_id': 'run_123',
    'experiment_id': 'exp_1',
    'status': 'completed',
    'metrics': {
        'accuracy': 0.95,
        'loss': 0.05
    },
    'created_at': datetime.now()
}
result = runs.insert_one(run)

# Read
run = runs.find_one({'run_id': 'run_123'})

# Update
runs.update_one(
    {'run_id': 'run_123'},
    {'$set': {'status': 'archived', 'updated_at': datetime.now()}}
)

# Delete
runs.delete_one({'run_id': 'run_123'})
```

## Indexing

```python
# Create indexes for performance
runs.create_index('run_id')
runs.create_index('experiment_id')
runs.create_index('status')

# Compound index
runs.create_index([('experiment_id', 1), ('created_at', -1)])

# Text index
experiments.create_index([('name', 'text'), ('description', 'text')])

# List indexes
print(runs.list_indexes())
```

## Aggregation Pipeline

```python
# Complex aggregation
pipeline = [
    {'$match': {'status': 'completed'}},
    {'$group': {
        '_id': '$experiment_id',
        'avg_accuracy': {'$avg': '$metrics.accuracy'},
        'count': {'$sum': 1}
    }},
    {'$sort': {'avg_accuracy': -1}},
    {'$limit': 10}
]

results = list(runs.aggregate(pipeline))
```

## Transactions

```python
from pymongo import MongoClient
from pymongo.errors import OperationFailure

client = MongoClient('mongodb://localhost:27017/')

with client.start_session() as session:
    with session.start_transaction():
        try:
            experiments.insert_one({'name': 'exp1'}, session=session)
            runs.insert_one({'experiment_id': 'exp1'}, session=session)
            # If we reach here, transaction commits
        except OperationFailure:
            # Transaction rolls back on error
            raise
```

## Monitoring

```python
# Connection health check
def check_mongodb_health():
    try:
        client = MongoClient('mongodb://localhost:27017/', serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        return True
    except Exception as e:
        print(f"MongoDB health check failed: {e}")
        return False

# Get server stats
stats = db.command('dbStats')
print(f"Database size: {stats['dataSize']} bytes")
print(f"Number of collections: {stats['collections']}")

# Get collection stats
col_stats = db.command('collStats', 'runs')
print(f"Document count: {col_stats['count']}")
print(f"Average document size: {col_stats['avgObjSize']} bytes")
```

## Backup and Recovery

```bash
# Backup
mongodump --uri "mongodb://admin:password@localhost:27017" \
  --out /backups/mlops_backup

# Restore
mongorestore --uri "mongodb://admin:password@localhost:27017" \
  /backups/mlops_backup

# Backup specific database
mongodump --uri "mongodb://admin:password@localhost:27017/mlops" \
  --out /backups/mlops_db

# Backup with compression
mongodump --uri "mongodb://admin:password@localhost:27017" \
  --archive=/backups/mlops_backup.archive --gzip
```

## Best Practices

1. **Use ObjectId** - Let MongoDB generate unique IDs
2. **Avoid unbounded arrays** - Can cause memory issues
3. **Index strategically** - Only index frequently queried fields
4. **Use aggregation pipeline** - Instead of client-side processing
5. **Connection pooling** - Reuse connections
6. **Monitor disk usage** - Prevent unexpected full disk

## Troubleshooting

```bash
# Check MongoDB logs
tail -f /var/log/mongodb/mongod.log

# Connect to MongoDB CLI
mongosh "mongodb://admin:password@localhost:27017"

# Check database size
db.stats()

# Kill slow operations
db.currentOp()
db.killOp(<opid>)
```

## Further Reading

- [MongoDB Official Documentation](https://docs.mongodb.com/)
- [MongoDB Aggregation Framework](https://docs.mongodb.com/manual/aggregation/)
- [MongoDB Transactions](https://docs.mongodb.com/manual/transactions/)
