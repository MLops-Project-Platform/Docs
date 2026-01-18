---
sidebar_position: 2
---

# Apache Cassandra

## Overview

Apache Cassandra is a distributed NoSQL database designed for high availability and scalability. It's excellent for time-series data and massive-scale deployments in MLOps systems.

## Key Features

- **Distributed Architecture** - No single point of failure
- **High Availability** - Replication across multiple nodes
- **Linear Scalability** - Add nodes to increase capacity
- **Tunable Consistency** - Balance consistency and availability
- **Columnar Storage** - Efficient compression and queries

## Use Cases in MLOps

### Time-Series Training Metrics
```python
from cassandra.cluster import Cluster
from cassandra import ConsistencyLevel
from datetime import datetime

# Connect to Cassandra
cluster = Cluster(['127.0.0.1'])
session = cluster.connect('mlops')

# Create keyspace
session.execute("""
    CREATE KEYSPACE IF NOT EXISTS mlops
    WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 3}
""")

# Create metrics table
session.execute("""
    CREATE TABLE IF NOT EXISTS metrics (
        experiment_id TEXT,
        run_id TEXT,
        timestamp TIMESTAMP,
        metric_name TEXT,
        metric_value FLOAT,
        PRIMARY KEY ((experiment_id, run_id), timestamp, metric_name)
    ) WITH CLUSTERING ORDER BY (timestamp DESC)
""")

# Insert metric
session.execute(
    "INSERT INTO metrics (experiment_id, run_id, timestamp, metric_name, metric_value) VALUES (%s, %s, %s, %s, %s)",
    ('exp_1', 'run_123', datetime.now(), 'accuracy', 0.95)
)
```

## Installation

### Docker Compose
```yaml
version: '3.8'
services:
  cassandra:
    image: cassandra:4.0
    environment:
      CASSANDRA_CLUSTER_NAME: "mlops-cluster"
      CASSANDRA_NUM_TOKENS: 256
      CASSANDRA_RPC_ADDRESS: 0.0.0.0
    ports:
      - "9042:9042"
      - "9160:9160"
    volumes:
      - cassandra_data:/var/lib/cassandra
    healthcheck:
      test: ["CMD", "nodetool", "status"]
      interval: 30s
      timeout: 10s
      retries: 5

volumes:
  cassandra_data:
```

## Data Modeling

### Partition Key Strategy
```python
# Good: Data access pattern is clear (query by experiment)
session.execute("""
    CREATE TABLE metrics_by_experiment (
        experiment_id TEXT,
        run_id TEXT,
        timestamp TIMESTAMP,
        accuracy FLOAT,
        loss FLOAT,
        PRIMARY KEY (experiment_id, run_id, timestamp)
    )
""")

# Cluster key determines sort order
# Results automatically sorted by (run_id, timestamp)
```

### Denormalization for Performance
```python
# Denormalize for single query access
session.execute("""
    CREATE TABLE model_summary (
        experiment_id TEXT,
        run_id TEXT,
        model_name TEXT,
        accuracy FLOAT,
        loss FLOAT,
        created_at TIMESTAMP,
        PRIMARY KEY (experiment_id, run_id)
    )
""")

# Store both summary and detailed metrics
session.execute("""
    INSERT INTO model_summary (experiment_id, run_id, model_name, accuracy, loss, created_at)
    VALUES (%s, %s, %s, %s, %s, %s)
    USING TIMESTAMP %s
""", ('exp_1', 'run_123', 'bert', 0.95, 0.05, datetime.now(), int(datetime.now().timestamp() * 1000000)))
```

## Querying

```python
from cassandra.query import SimpleStatement

# Basic query
query = "SELECT * FROM metrics WHERE experiment_id = %s"
rows = session.execute(query, ['exp_1'])

for row in rows:
    print(f"{row.timestamp}: {row.metric_name} = {row.metric_value}")

# Query with consistency level
statement = SimpleStatement(
    "SELECT * FROM metrics WHERE experiment_id = %s",
    consistency_level=ConsistencyLevel.LOCAL_QUORUM
)
rows = session.execute(statement, ['exp_1'])

# Range queries
query = "SELECT * FROM metrics WHERE experiment_id = %s AND run_id = %s AND timestamp > %s"
rows = session.execute(query, ['exp_1', 'run_123', datetime(2024, 1, 1)])
```

## Replication and Consistency

### Configure Replication
```python
# Create keyspace with replication
session.execute("""
    CREATE KEYSPACE IF NOT EXISTS mlops
    WITH replication = {
        'class': 'NetworkTopologyStrategy',
        'dc1': 3,
        'dc2': 2
    }
""")

# Verify replication
result = session.execute("DESCRIBE KEYSPACE mlops")
```

### Consistency Levels
```python
from cassandra import ConsistencyLevel

# Strong consistency
write_statement = SimpleStatement(
    "INSERT INTO metrics ...",
    consistency_level=ConsistencyLevel.ALL  # Wait for all replicas
)

# Eventual consistency  
read_statement = SimpleStatement(
    "SELECT * FROM metrics ...",
    consistency_level=ConsistencyLevel.ONE  # Return first replica
)

# Balanced approach
balanced = SimpleStatement(
    query,
    consistency_level=ConsistencyLevel.LOCAL_QUORUM
)
```

## Monitoring

```bash
# Check node status
nodetool status

# View cluster info
nodetool info

# Compaction stats
nodetool compactionstats

# Disk usage
nodetool diskusage

# Repair (maintain consistency)
nodetool repair mlops
```

### Python Monitoring
```python
from cassandra.cluster import Cluster
from cassandra.policies import DCAwareRoundRobinPolicy

cluster = Cluster(
    ['node1', 'node2', 'node3'],
    load_balancing_policy=DCAwareRoundRobinPolicy(local_dc='dc1')
)

# Check cluster health
def check_cluster_health(cluster):
    metadata = cluster.metadata
    print(f"Cluster name: {metadata.cluster_name}")
    print(f"Partitioner: {metadata.partitioner}")
    
    for host in metadata.all_hosts():
        print(f"Host {host.address}: {host.status}")
```

## Backup and Recovery

```bash
# Snapshot backup
nodetool snapshot -t $(date +%s) mlops

# Backup configuration
cd /var/lib/cassandra/data/mlops/metrics-*/snapshots
tar -czf /backups/metrics_snapshot.tar.gz

# Restore from snapshot
nodetool clearsnapshots
# Copy snapshot files back
# Run repair
nodetool repair mlops
```

### Incremental Backup
```bash
# Enable commitlog backups
# Edit cassandra.yaml: commitlog_sync: periodic

# Backup commitlog
cp /var/lib/cassandra/commitlog/* /backups/commitlog_backup/

# Use backup tools (Cassandra-specific)
cassandra-backup --backup-dir /backups
```

## Performance Tuning

```python
from cassandra.cluster import Cluster, ExecutionProfile
from cassandra.policies import TokenAwarePolicy, RoundRobinPolicy

# Configure cluster for performance
cluster = Cluster(
    ['node1', 'node2', 'node3'],
    load_balancing_policy=TokenAwarePolicy(RoundRobinPolicy())
)

# Use prepared statements
prepared = session.prepare("""
    INSERT INTO metrics (experiment_id, run_id, timestamp, metric_name, metric_value)
    VALUES (?, ?, ?, ?, ?)
""")

# Batch insert
from cassandra.concurrent import execute_concurrent_with_args

queries = [
    (prepared, ('exp_1', 'run_123', datetime.now(), 'accuracy', 0.95)),
    (prepared, ('exp_1', 'run_123', datetime.now(), 'loss', 0.05)),
]

execute_concurrent_with_args(session, queries)
```

## Best Practices

1. **Think in Queries** - Design schema based on how you'll query
2. **Denormalize** - Duplicate data for query performance
3. **Use Prepared Statements** - Reduce parsing overhead
4. **Batch Inserts** - Use batch API for multiple operations
5. **Monitor Compaction** - Keep disk space optimal
6. **Tune Consistency** - Use appropriate consistency levels per use case

## Troubleshooting

```bash
# Check node status
nodetool status

# View logs
tail -f /var/log/cassandra/system.log

# Check Java heap
jps -l

# Fix poor performance
nodetool repair
nodetool cleanup
nodetool compact
```

## Further Reading

- [Cassandra Documentation](https://cassandra.apache.org/doc/)
- [Cassandra Data Modeling](https://www.datastax.com/developers/data-modeling-best-practices)
- [Python Driver](https://github.com/datastax/python-driver)
