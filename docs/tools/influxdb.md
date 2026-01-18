---
sidebar_position: 1
---

# InfluxDB

## Overview

InfluxDB is a time-series database optimized for storing and querying time-stamped data. It's ideal for tracking training metrics, GPU usage, and system performance in MLOps.

## Key Features

- **Time-Series Optimized** - Efficient compression of time-stamped data
- **High Write Throughput** - Handle millions of data points/second
- **Flexible Retention** - Auto-delete old data based on policies
- **InfluxQL & Flux** - Powerful query languages
- **Built-in Aggregation** - Fast downsampling
- **Clustering** - Enterprise clustering available

## Use Cases in MLOps

### Training Metrics Collection
```python
from influxdb_client import InfluxDBClient
from influxdb_client.client.write_api import SYNCHRONOUS
from datetime import datetime
import time

# Setup client
client = InfluxDBClient(url="http://localhost:8086", token="your_token", org="mlops")
write_api = client.write_api(write_options=SYNCHRONOUS)

# Write training metrics
def log_training_metrics(experiment_id, epoch, loss, accuracy, lr):
    point = f"""training_metrics,experiment_id={experiment_id},epoch={epoch} \
loss={loss},accuracy={accuracy},learning_rate={lr} {int(time.time() * 1e9)}"""
    
    write_api.write(bucket="mlops", record=point)

# Log during training
for epoch in range(1, 11):
    loss = 0.1 * (10 - epoch) / 10
    accuracy = 0.5 + epoch * 0.05
    log_training_metrics('exp_001', epoch, loss, accuracy, 0.001)
    time.sleep(1)
```

## Installation

### Docker
```yaml
version: '3.8'
services:
  influxdb:
    image: influxdb:2.6
    environment:
      INFLUXDB_DB: mlops
      INFLUXDB_ADMIN_USER: admin
      INFLUXDB_ADMIN_PASSWORD: password
      INFLUXDB_HTTP_AUTH_ENABLED: "true"
    ports:
      - "8086:8086"
    volumes:
      - influxdb_data:/var/lib/influxdb2
    healthcheck:
      test: ["CMD", "influx", "ping"]
      interval: 30s
      timeout: 10s
      retries: 5

volumes:
  influxdb_data:
```

## Writing Data

### Line Protocol
```python
from influxdb_client import InfluxDBClient
from influxdb_client.client.write_api import SYNCHRONOUS
import time

client = InfluxDBClient(url="http://localhost:8086", token="your_token", org="mlops")
write_api = client.write_api(write_options=SYNCHRONOUS)

# Line protocol: measurement,tag1=val1,tag2=val2 field1=val1,field2=val2 timestamp
point = "gpu_usage,experiment_id=exp_001,gpu_id=0 usage=85.5,memory=2048 " + str(int(time.time() * 1e9))

write_api.write(bucket="mlops", record=point)
```

### Batch Writing
```python
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS, ASYNCHRONOUS
import time

client = InfluxDBClient(url="http://localhost:8086", token="your_token", org="mlops")
write_api = client.write_api(write_options=ASYNCHRONOUS)

# Create multiple points
points = []
for i in range(100):
    point = Point("system_metrics") \
        .tag("experiment_id", "exp_001") \
        .tag("node", "worker-1") \
        .field("cpu_usage", 45.2 + i) \
        .field("memory_mb", 2048 + i * 10) \
        .field("disk_io", 1.5 + i * 0.01) \
        .time(int(time.time() * 1e9) + i * 1e9)
    
    points.append(point)

# Write batch
write_api.write(bucket="mlops", records=points)
```

## Querying Data

### Flux Language
```python
from influxdb_client import InfluxDBClient

client = InfluxDBClient(url="http://localhost:8086", token="your_token", org="mlops")
query_api = client.query_api()

# Query last 24 hours
query = """
from(bucket:"mlops")
  |> range(start: -24h)
  |> filter(fn: (r) => r._measurement == "training_metrics")
  |> filter(fn: (r) => r.experiment_id == "exp_001")
  |> filter(fn: (r) => r._field == "accuracy")
"""

result = query_api.query(org="mlops", query=query)

for table in result:
    for record in table.records:
        print(f"{record.time}: {record.values['_value']}")
```

### Aggregation
```python
query = """
from(bucket:"mlops")
  |> range(start: -7d)
  |> filter(fn: (r) => r._measurement == "training_metrics")
  |> aggregateWindow(every: 1h, fn: mean)
"""

# Group by experiment
query = """
from(bucket:"mlops")
  |> range(start: -24h)
  |> filter(fn: (r) => r._measurement == "training_metrics")
  |> group(columns: ["experiment_id"])
  |> aggregateWindow(every: 10m, fn: mean)
"""

# Calculate derivative (rate of change)
query = """
from(bucket:"mlops")
  |> range(start: -24h)
  |> filter(fn: (r) => r._measurement == "training_metrics")
  |> filter(fn: (r) => r._field == "loss")
  |> derivative(unit: 1m)
"""
```

## Data Retention

### Retention Policies
```bash
# Create bucket with 30-day retention
influx bucket create --name mlops --retention 30d

# Infinite retention
influx bucket create --name archives --retention 0
```

### Downsampling (Continuous Aggregates)
```python
query = """
import "influxdata/influxdb/tasks"

option task = {
  name: "downsample-training-metrics",
  every: 1h,
  offset: 0m,
}

from(bucket: "mlops")
  |> range(start: -1h, stop: now())
  |> filter(fn: (r) => r._measurement == "training_metrics")
  |> aggregateWindow(every: 1h, fn: mean, createEmpty: false)
  |> to(bucket: "mlops_downsampled")
"""
```

## Time-Series Operations

### Moving Averages
```python
query = """
from(bucket:"mlops")
  |> range(start: -24h)
  |> filter(fn: (r) => r._measurement == "training_metrics")
  |> filter(fn: (r) => r._field == "loss")
  |> movingAverage(n: 10)
"""

# Exponential moving average
query = """
from(bucket:"mlops")
  |> range(start: -24h)
  |> filter(fn: (r) => r._measurement == "training_metrics")
  |> filter(fn: (r) => r._field == "loss")
  |> exponentialMovingAverage(n: 10)
"""
```

### Percentiles
```python
query = """
from(bucket:"mlops")
  |> range(start: -24h)
  |> filter(fn: (r) => r._measurement == "training_metrics")
  |> filter(fn: (r) => r._field == "loss")
  |> quantile(q: 0.95)
"""

# Multiple percentiles
query = """
from(bucket:"mlops")
  |> range(start: -24h)
  |> filter(fn: (r) => r._measurement == "training_metrics")
  |> filter(fn: (r) => r._field == "accuracy")
  |> group(columns: ["experiment_id"])
  |> quantile(q: 0.5, method: "interpolated")
"""
```

## Advanced Features

### Alerting
```python
import requests

alert_rule = {
    "name": "High GPU Usage",
    "description": "Alert when GPU usage exceeds 90%",
    "every": "5m",
    "offset": "0s",
    "statusMessageTemplate": "GPU usage: {{ .values.usage }}",
    "tags": ["gpu", "warning"],
    "taskID": "task_id_here"
}

# Create alert via API
headers = {"Authorization": f"Token your_token"}
response = requests.post(
    "http://localhost:8086/api/v2/checks",
    json=alert_rule,
    headers=headers
)
```

### Custom Functions
```python
query = """
from(bucket: "mlops")
  |> range(start: -24h)
  |> filter(fn: (r) => r._measurement == "training_metrics")
  |> map(fn: (r) => ({r with _value: r._value * 1.1}))
"""
```

## Monitoring with InfluxDB

```python
from influxdb_client import InfluxDBClient, Point
import psutil
import time

client = InfluxDBClient(url="http://localhost:8086", token="your_token", org="mlops")
write_api = client.write_api(write_options=ASYNCHRONOUS)

def collect_system_metrics():
    while True:
        point = Point("system_metrics") \
            .field("cpu_percent", psutil.cpu_percent(interval=1)) \
            .field("memory_percent", psutil.virtual_memory().percent) \
            .field("disk_percent", psutil.disk_usage('/').percent) \
            .field("process_count", len(psutil.pids()))
        
        write_api.write(bucket="mlops", record=point)
        time.sleep(10)

# Run collection
import threading
thread = threading.Thread(target=collect_system_metrics, daemon=True)
thread.start()
```

## Best Practices

1. **Use tags for dimensions** - Experiment ID, GPU ID (indexed)
2. **Use fields for metrics** - Accuracy, loss, memory (not indexed)
3. **Batch writes** - Reduce network overhead
4. **Set retention policies** - Manage disk space
5. **Use downsampling** - For long-term storage
6. **Index strategically** - Common filter dimensions only
7. **Query efficiently** - Use time ranges and filters

## Performance Tuning

```bash
# InfluxDB configuration (influxdb.conf or env vars)
[data]
  cache-max-memory-bytes = 1073741824  # 1GB
  max-series-db = 2000000

[http]
  max-body-size = 536870912  # 512MB for batch writes

[storage]
  max-index-log-file-size = 10485760  # 10MB
```

## Troubleshooting

```bash
# Check database health
curl -i http://localhost:8086/health

# Get buckets
influx bucket list --token your_token

# Query from CLI
influx query --file query.flux

# Check InfluxDB version
influx version

# Backup database
influxd backup /path/to/backup

# Restore database
influxd restore /path/to/backup
```

## Further Reading

- [InfluxDB Documentation](https://docs.influxdata.com/influxdb/)
- [Flux Language Reference](https://docs.influxdata.com/flux/latest/)
- [Python Client Library](https://github.com/influxdata/influxdb-client-python)
- [Time-Series Best Practices](https://docs.influxdata.com/influxdb/latest/best-practices/)
