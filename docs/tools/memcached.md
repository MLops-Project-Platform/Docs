---
sidebar_position: 2
---

# Memcached

## Overview

Memcached is a simple, high-performance, distributed memory caching system. It's lightweight and ideal for reducing database load in MLOps platforms.

## Key Features

- **Simple Protocol** - Easy to implement and debug
- **Distributed** - Works across multiple servers
- **LRU Eviction** - Automatic cleanup of old data
- **No Persistence** - Cache only (data loss on restart)
- **Ultra-fast** - Microsecond latency operations

## Use Cases in MLOps

### Caching Model Predictions
```python
import memcache

mc = memcache.Client(['127.0.0.1:11211'])

# Cache prediction result
prediction = {
    'model_id': 'model_1',
    'input_hash': 'hash_abc123',
    'prediction': 0.95,
    'confidence': 0.99
}

# Cache for 1 hour (3600 seconds)
mc.set(f'pred:hash_abc123', prediction, 3600)

# Retrieve from cache
cached_pred = mc.get(f'pred:hash_abc123')
if cached_pred:
    return cached_pred
```

## Installation

### Docker
```yaml
version: '3.8'
services:
  memcached:
    image: memcached:1.6-alpine
    ports:
      - "11211:11211"
    command: memcached -m 256 -c 1024
    # -m 256: 256MB memory
    # -c 1024: max 1024 concurrent connections
```

### Docker Compose with Multiple Instances
```yaml
version: '3.8'
services:
  memcached1:
    image: memcached:1.6-alpine
    ports:
      - "11211:11211"
    command: memcached -m 512

  memcached2:
    image: memcached:1.6-alpine
    ports:
      - "11212:11211"
    command: memcached -m 512

  memcached3:
    image: memcached:1.6-alpine
    ports:
      - "11213:11211"
    command: memcached -m 512
```

## Basic Operations

### Python Client
```python
import memcache

# Connect to single server
mc = memcache.Client(['127.0.0.1:11211'])

# Set value (expires in 3600 seconds)
mc.set('key', 'value', 3600)

# Get value
value = mc.get('key')

# Delete
mc.delete('key')

# Increment (for counters)
mc.incr('request_count')

# Decrement
mc.decr('remaining_quota')

# Get multiple values
values = mc.get_multi(['key1', 'key2', 'key3'])

# Set multiple values
mc.set_multi({
    'key1': 'value1',
    'key2': 'value2',
    'key3': 'value3'
}, time=3600)

# Append to existing key
mc.append('log', '\nnew entry')

# Get and delete
value = mc.gets('key')
if value:
    mc.delete('key')
```

## Distributed Caching

### Consistent Hashing
```python
import memcache

# Multiple memcached servers (consistent hashing)
mc = memcache.Client([
    '127.0.0.1:11211',
    '127.0.0.1:11212',
    '127.0.0.1:11213'
])

# Data automatically distributed across servers
# Same key always goes to same server (consistent hashing)
mc.set('user_session_123', {'user_id': 123}, 3600)

# Even if one server fails, others keep working
# Remaining data stays on its server
```

### Cache-Aside Pattern
```python
def get_model_config(model_id):
    # Try cache first
    cache_key = f'model_config:{model_id}'
    cached = mc.get(cache_key)
    
    if cached:
        return cached
    
    # Cache miss - fetch from database
    config = db.get_model_config(model_id)
    
    # Store in cache
    mc.set(cache_key, config, 3600)
    
    return config

# Usage
config = get_model_config('bert_v1')
```

## Performance Tuning

### Connection Pooling
```python
import memcache

# Reuse connection pool
class CacheManager:
    _instance = None
    _client = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    @property
    def client(self):
        if self._client is None:
            self._client = memcache.Client(
                ['127.0.0.1:11211'],
                max_pool_size=10
            )
        return self._client

# Usage
cache = CacheManager()
cache.client.set('key', 'value')
```

### Batch Operations
```python
# Use get_multi and set_multi for better performance
keys = [f'key_{i}' for i in range(1000)]

# Batch get
values = mc.get_multi(keys)

# Process values
# ...

# Batch set
data = {f'key_{i}': f'value_{i}' for i in range(1000)}
mc.set_multi(data, time=3600)
```

## Monitoring

### Health Check
```python
import memcache

def check_memcached_health():
    try:
        mc = memcache.Client(['127.0.0.1:11211'], timeout=2)
        mc.set('health_check', 'ok', 10)
        result = mc.get('health_check')
        mc.delete('health_check')
        return result == b'ok'
    except Exception as e:
        print(f"Memcached health check failed: {e}")
        return False

# Periodic health check
import schedule
schedule.every(30).seconds.do(check_memcached_health)
```

### Statistics
```bash
# Connect to memcached and get stats
telnet localhost 11211

# Type these commands
stats
stats slabs
stats items
quit

# Or use memcached-tool (included with memcached)
memcached-tool localhost:11211 dump
```

### Python Monitoring
```python
import memcache
import socket

def get_memcached_stats(host, port):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((host, port))
    s.sendall(b'stats\r\n')
    
    stats = {}
    while True:
        data = s.recv(1024)
        if not data:
            break
        
        for line in data.decode().split('\n'):
            if line.startswith('STAT'):
                parts = line.split()
                stats[parts[1]] = parts[2]
    
    s.close()
    return stats

stats = get_memcached_stats('localhost', 11211)
print(f"Current bytes: {stats.get('bytes')}")
print(f"Items: {stats.get('curr_items')}")
```

## Best Practices

1. **Use appropriate TTL** - Don't cache everything forever
2. **Implement fallback** - Handle cache misses gracefully
3. **Monitor hit rate** - Track cache effectiveness
4. **Use consistent hashing** - For distributed caching
5. **Batch operations** - Reduce network overhead
6. **Clear cache on updates** - Keep consistency
7. **Plan capacity** - Avoid memory exhaustion

## Memcached vs Redis

| Feature | Memcached | Redis |
|---------|-----------|-------|
| Data Types | Strings only | Multiple types |
| Persistence | None | RDB + AOF |
| Replication | No | Master-slave |
| Clustering | Consistent hashing | Cluster mode |
| Use Case | Simple caching | Complex data |
| Speed | Ultra-fast | Very fast |

## Troubleshooting

```bash
# Check if memcached is running
netstat -an | grep 11211

# Verify connectivity
echo "stats" | nc localhost 11211

# Monitor connections
watch 'echo stats | nc localhost 11211 | grep curr_conn'

# Check memory usage
echo "stats" | nc localhost 11211 | grep bytes

# Restart memcached
systemctl restart memcached
```

## Further Reading

- [Memcached Documentation](https://memcached.org/about)
- [Python Memcache Client](https://github.com/pinterest/pymemcache)
- [Memcached Command Reference](https://github.com/memcached/memcached/wiki/Commands)
