---
sidebar_position: 1
---

# Redis

## Overview

Redis is an in-memory data structure store used for caching, session storage, and real-time analytics. It provides exceptional performance and flexibility for MLOps caching layers.

## Key Features

- **In-Memory** - Ultra-fast operations (microsecond latency)
- **Multiple Data Types** - Strings, Lists, Sets, Sorted Sets, Hashes, Streams
- **Persistence Options** - RDB snapshots or AOF logs
- **Replication** - Master-slave replication for HA
- **Cluster Mode** - Horizontal scaling across nodes
- **TTL Support** - Auto-expiration of keys

## Use Cases in MLOps

### Caching Training Metrics
```python
import redis
import json

r = redis.Redis(host='localhost', port=6379, db=0)

# Cache experiment metrics
experiment_id = 'exp_001'
metrics = {
    'accuracy': 0.95,
    'loss': 0.05,
    'f1_score': 0.93
}

# Cache with 1-hour expiration
r.setex(f'metrics:{experiment_id}', 3600, json.dumps(metrics))

# Retrieve from cache
cached = r.get(f'metrics:{experiment_id}')
if cached:
    metrics = json.loads(cached)
```

### Session Management
```python
import redis

r = redis.Redis(host='localhost', port=6379, db=0)

# Store user session
session_data = {
    'user_id': 'user_123',
    'experiment_id': 'exp_001',
    'login_time': '2024-01-15T10:30:00'
}

# Session expires in 1 hour
r.hset(f'session:user_123', mapping={
    'user_id': 'user_123',
    'experiment_id': 'exp_001',
    'login_time': '2024-01-15T10:30:00'
})
r.expire(f'session:user_123', 3600)

# Check session
if r.exists(f'session:user_123'):
    session = r.hgetall(f'session:user_123')
```

## Installation

### Docker
```yaml
version: '3.8'
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  redis_data:
```

### Redis Cluster Setup
```yaml
version: '3.8'
services:
  redis-1:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --cluster-enabled yes --cluster-config-file nodes.conf --cluster-node-timeout 5000 --appendonly yes
    
  redis-2:
    image: redis:7-alpine
    ports:
      - "6380:6379"
    command: redis-server --cluster-enabled yes --cluster-config-file nodes.conf --cluster-node-timeout 5000 --appendonly yes
    
  redis-3:
    image: redis:7-alpine
    ports:
      - "6381:6379"
    command: redis-server --cluster-enabled yes --cluster-config-file nodes.conf --cluster-node-timeout 5000 --appendonly yes
```

## Data Structures

### Strings
```python
import redis

r = redis.Redis(host='localhost', port=6379)

# Simple key-value
r.set('model_version', '1.0')
version = r.get('model_version').decode('utf-8')

# Increment/Decrement
r.incr('request_count')  # Atomic counter
r.decr('remaining_quota')

# Append
r.append('logs', 'new log entry\n')

# Get and set with expiration
r.setex('temp_token', 300, 'token_abc123')  # 5 minutes

# Multiple operations
r.mset({
    'model_name': 'bert',
    'version': '2.0',
    'accuracy': '0.95'
})

values = r.mget('model_name', 'version', 'accuracy')
```

### Lists
```python
# Job queue
r.rpush('job_queue', 'job_1', 'job_2', 'job_3')  # Push to tail
job = r.lpop('job_queue')  # Pop from head (FIFO)

# Blocking operations (wait for jobs)
job = r.blpop('job_queue', timeout=30)  # Wait max 30 seconds

# List operations
r.llen('job_queue')  # Queue length
r.lrange('job_queue', 0, -1)  # Get all elements
```

### Sets
```python
# Tag management
r.sadd('exp_001:tags', 'nlp', 'classification', 'bert')
r.sadd('exp_002:tags', 'nlp', 'generation', 'gpt')

# Common tags
common = r.sinter('exp_001:tags', 'exp_002:tags')  # Intersection

# All tags
all_tags = r.sunion('exp_001:tags', 'exp_002:tags')  # Union

# Check membership
if r.sismember('exp_001:tags', 'nlp'):
    print("Experiment uses NLP")
```

### Sorted Sets
```python
# Leaderboard (experiments by accuracy)
r.zadd('accuracy_leaderboard', {
    'exp_001': 0.95,
    'exp_002': 0.92,
    'exp_003': 0.98
})

# Top 3 experiments
top_3 = r.zrange('accuracy_leaderboard', -3, -1, withscores=True)

# Experiments with accuracy > 0.9
good = r.zrangebyscore('accuracy_leaderboard', 0.9, 0.99)

# Add to leaderboard
r.zincrby('accuracy_leaderboard', 0.01, 'exp_001')  # Improve score
```

### Hashes
```python
# Store structured data
r.hset('exp_001', mapping={
    'name': 'BERT Classifier',
    'accuracy': '0.95',
    'loss': '0.05',
    'created_at': '2024-01-15'
})

# Get field
name = r.hget('exp_001', 'name')

# Get all fields
exp = r.hgetall('exp_001')

# Increment field
r.hincrby('exp_001', 'epoch', 1)
```

## Persistence

### RDB (Snapshots)
```python
import redis

r = redis.Redis(host='localhost', port=6379)

# Trigger snapshot
r.bgsave()  # Background save

# Force synchronous save
r.save()  # Blocks until done

# Check last save time
last_save = r.lastsave()
```

### AOF (Append-Only File)
```bash
# In redis.conf or container command
redis-server --appendonly yes --appendfsync everysec

# Rewrite AOF file
redis-cli BGREWRITEAOF

# Verify AOF file
redis-check-aof /var/lib/redis/appendonly.aof
```

## Replication

### Master-Slave Setup
```bash
# Master node (default configuration)
redis-server --port 6379

# Slave node
redis-server --port 6380 --replicaof localhost 6379

# Verify replication
redis-cli -p 6380 INFO replication
```

### Python Connection with Replication
```python
import redis

# Connect to master (write)
master = redis.Redis(host='master', port=6379)

# Connect to replica (read)
replica = redis.Redis(host='replica', port=6380)

# Write to master
master.set('key', 'value')

# Read from replica (eventually consistent)
value = replica.get('key')
```

## Clustering

### Redis Cluster Operations
```python
from redis.cluster import RedisCluster

# Connect to cluster
rc = RedisCluster(startup_nodes=[
    {"host": "127.0.0.1", "port": "6379"},
    {"host": "127.0.0.1", "port": "6380"},
    {"host": "127.0.0.1", "port": "6381"}
])

# Data automatically distributed
rc.set('key1', 'value1')
value = rc.get('key1')

# Cluster info
print(rc.cluster_info())
print(rc.cluster_nodes())
```

## Pub/Sub

### Message Publishing
```python
import redis
import threading

r = redis.Redis(host='localhost', port=6379)

# Subscriber
def subscriber():
    pubsub = r.pubsub()
    pubsub.subscribe('training_updates')
    
    for message in pubsub.listen():
        if message['type'] == 'message':
            print(f"Received: {message['data']}")

# Publisher
def publisher():
    for i in range(5):
        r.publish('training_updates', f'Epoch {i+1} completed')

# Run in threads
sub_thread = threading.Thread(target=subscriber)
pub_thread = threading.Thread(target=publisher)
sub_thread.start()
pub_thread.start()
```

## Streams

### Event Streaming
```python
import redis
from datetime import datetime

r = redis.Redis(host='localhost', port=6379)

# Add event to stream
event_id = r.xadd('training_events', {
    'experiment_id': 'exp_001',
    'event': 'epoch_completed',
    'epoch': '5',
    'loss': '0.05',
    'timestamp': str(datetime.now())
})

# Read stream
events = r.xrange('training_events')
for event_id, data in events:
    print(f"{event_id}: {data}")

# Read specific range
recent = r.xrange('training_events', '-', '+', count=10)

# Consumer group (for processing)
r.xgroup_create('training_events', 'processor_group', '$', mkstream=True)

# Read as consumer
messages = r.xreadgroup({'training_events': '>'}, 'processor_group', 'processor_1', count=1)

# Acknowledge processing
r.xack('training_events', 'processor_group', event_id)
```

## Monitoring

```python
import redis

r = redis.Redis(host='localhost', port=6379)

# Server info
info = r.info()
print(f"Used memory: {info['used_memory_human']}")
print(f"Connected clients: {info['connected_clients']}")
print(f"Total commands: {info['total_commands_processed']}")

# Monitor commands
def monitor():
    for cmd in r.monitor():
        print(f"[{cmd[0]}] {cmd[1]}")

# Client info
clients = r.client_list()

# Key space stats
dbsize = r.dbsize()
keys_by_pattern = r.keys('exp_*')
```

## Best Practices

1. **Use connection pooling** - Reuse connections
2. **Pipeline operations** - Batch commands
3. **Implement TTL** - Prevent unbounded memory growth
4. **Monitor memory** - Use maxmemory policies
5. **Use appropriate data types** - Match use case
6. **Enable persistence** - Combine RDB + AOF
7. **Setup replication** - For reliability

## Troubleshooting

```bash
# Check Redis connectivity
redis-cli ping

# Monitor commands in real-time
redis-cli MONITOR

# Check memory usage
redis-cli INFO memory

# Find large keys
redis-cli --bigkeys

# Check slow log
redis-cli SLOWLOG GET 10

# Clear database
redis-cli FLUSHDB
```

## Further Reading

- [Redis Documentation](https://redis.io/documentation)
- [Redis Commands](https://redis.io/commands/)
- [Redis Cluster Specification](https://redis.io/topics/cluster-spec)
- [Python Redis Client](https://github.com/redis/redis-py)
