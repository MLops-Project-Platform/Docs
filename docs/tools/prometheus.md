---
sidebar_position: 2
---

# Prometheus

## Overview

Prometheus is an open-source monitoring and alerting system with a powerful time-series database. It's perfect for collecting metrics from Kubernetes clusters and ML infrastructure.

## Key Features

- **Pull-Based** - Scrapes metrics from targets
- **PromQL** - Powerful query language for metrics
- **Time-Series Database** - Efficient metric storage
- **Alerting** - Built-in alertmanager integration
- **Service Discovery** - Auto-discovery of targets
- **Multi-dimensional** - Labels for organization

## Architecture

```
Exporters (Node, GPU, Custom)
        ↓
    Prometheus (scrape + store)
        ↓
    Alertmanager (routing)
        ↓
    Notification channels (Slack, PagerDuty, etc.)
```

## Installation

### Docker Compose
```yaml
version: '3.8'
services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:9090/-/healthy"]
      interval: 30s
      timeout: 10s
      retries: 5

  alertmanager:
    image: prom/alertmanager:latest
    ports:
      - "9093:9093"
    volumes:
      - ./alertmanager.yml:/etc/alertmanager/alertmanager.yml
      - alertmanager_data:/alertmanager

volumes:
  prometheus_data:
  alertmanager_data:
```

## Configuration

### prometheus.yml
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'mlops-prod'
    environment: 'production'

alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - 'alertmanager:9093'

rule_files:
  - 'alert_rules.yml'
  - 'recording_rules.yml'

scrape_configs:
  # Prometheus itself
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  # Node exporter (server metrics)
  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']

  # NVIDIA GPU metrics
  - job_name: 'gpu'
    static_configs:
      - targets: ['gpu-exporter:9445']

  # Custom training metrics
  - job_name: 'training'
    scrape_interval: 5s
    static_configs:
      - targets: ['training-app:8000']

  # Kubernetes service discovery
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
      - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        regex: ([^:]+)(?::\d+)?;(\d+)
        replacement: $1:$2
        target_label: __address__
```

## Metrics Collection

### Python Application Metrics
```python
from prometheus_client import Counter, Histogram, Gauge, start_http_server
import time

# Counter: monotonically increasing
training_steps = Counter(
    'training_steps_total',
    'Total training steps',
    ['experiment_id', 'model_name']
)

# Gauge: can go up or down
gpu_memory_usage = Gauge(
    'gpu_memory_mb',
    'GPU memory usage in MB',
    ['gpu_id', 'experiment_id']
)

# Histogram: observe value distributions
training_loss = Histogram(
    'training_loss',
    'Training loss distribution',
    ['experiment_id'],
    buckets=(0.001, 0.01, 0.1, 0.5, 1.0, 2.0)
)

# Start metrics server on port 8000
start_http_server(8000)

# Record metrics during training
for epoch in range(100):
    loss = 0.5 / (epoch + 1)
    
    training_steps.labels(experiment_id='exp_001', model_name='bert').inc()
    training_loss.labels(experiment_id='exp_001').observe(loss)
    gpu_memory_usage.labels(gpu_id='0', experiment_id='exp_001').set(4096)
    
    time.sleep(1)
```

### GPU Metrics Exporter
```python
import subprocess
import time
from prometheus_client import Gauge, start_http_server

# GPU memory gauge
gpu_memory = Gauge('nvidia_gpu_memory_used_mb', 'GPU memory used', ['gpu_id'])
gpu_utilization = Gauge('nvidia_gpu_utilization_percent', 'GPU utilization', ['gpu_id'])

def collect_gpu_metrics():
    while True:
        try:
            # nvidia-smi query
            result = subprocess.run([
                'nvidia-smi',
                '--query-gpu=index,memory.used,utilization.gpu',
                '--format=csv,noheader'
            ], capture_output=True, text=True)
            
            for line in result.stdout.strip().split('\n'):
                gpu_id, memory, utilization = line.split(',')
                gpu_memory.labels(gpu_id=gpu_id.strip()).set(memory.strip().split()[0])
                gpu_utilization.labels(gpu_id=gpu_id.strip()).set(utilization.strip().split()[0])
        
        except Exception as e:
            print(f"Error collecting GPU metrics: {e}")
        
        time.sleep(15)

start_http_server(9445)

import threading
thread = threading.Thread(target=collect_gpu_metrics, daemon=True)
thread.start()

# Keep running
while True:
    time.sleep(1)
```

## Querying with PromQL

### Basic Queries
```promql
# Last value
training_loss{experiment_id="exp_001"}

# Range (last hour)
training_loss{experiment_id="exp_001"}[1h]

# Rate (per second over 5 minutes)
rate(training_steps_total[5m])

# Increase (total increase over period)
increase(training_steps_total[1h])
```

### Aggregations
```promql
# Sum across all GPU IDs
sum(gpu_memory_mb) by (experiment_id)

# Average GPU utilization
avg(nvidia_gpu_utilization_percent) by (gpu_id)

# Percentiles
histogram_quantile(0.95, training_loss)

# Count of distinct experiments
count(count by (experiment_id)(training_steps_total))
```

### Advanced Queries
```promql
# Loss derivative (rate of change)
deriv(training_loss{experiment_id="exp_001"}[5m])

# Top 5 experiments by total steps
topk(5, sum by (experiment_id) (training_steps_total))

# GPU memory growth rate
rate(gpu_memory_mb{gpu_id="0"}[1h])

# Experiments with slow loss decrease
rate(training_loss{experiment_id=~"exp_.*"}[10m]) > 0.001
```

## Alerting

### Alert Rules
```yaml
# alert_rules.yml
groups:
  - name: training_alerts
    interval: 30s
    rules:
      # Alert on high loss
      - alert: HighTrainingLoss
        expr: training_loss > 1.0
        for: 5m
        annotations:
          summary: "High training loss for {{ $labels.experiment_id }}"
          description: "Loss is {{ $value }}"

      # Alert on GPU memory high
      - alert: HighGPUMemory
        expr: gpu_memory_mb > 15000
        for: 2m
        annotations:
          summary: "High GPU memory on {{ $labels.gpu_id }}"
          description: "GPU memory: {{ $value }}MB"

      # Alert on training stalled
      - alert: TrainingStalled
        expr: rate(training_steps_total[5m]) == 0
        for: 10m
        annotations:
          summary: "Training stalled for {{ $labels.experiment_id }}"
          description: "No training steps in last 5 minutes"

      # Alert on low accuracy
      - alert: LowModelAccuracy
        expr: training_accuracy < 0.5
        for: 30m
        annotations:
          summary: "Low accuracy for {{ $labels.experiment_id }}"
          description: "Accuracy: {{ $value }}"
```

### AlertManager Configuration
```yaml
# alertmanager.yml
global:
  resolve_timeout: 5m

route:
  receiver: 'default'
  group_by: ['alertname', 'experiment_id']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h

  # Routing rules
  routes:
    - match:
        alertname: TrainingStalled
      receiver: 'critical'
      group_wait: 5s
      repeat_interval: 30m

    - match:
        severity: warning
      receiver: 'warnings'

receivers:
  - name: 'default'
    slack_configs:
      - api_url: 'YOUR_SLACK_WEBHOOK'
        channel: '#mlops-alerts'

  - name: 'critical'
    slack_configs:
      - api_url: 'YOUR_SLACK_WEBHOOK'
        channel: '#mlops-critical'
    pagerduty_configs:
      - service_key: 'YOUR_PAGERDUTY_KEY'

  - name: 'warnings'
    email_configs:
      - to: 'team@example.com'
        from: 'alerts@example.com'
        smarthost: 'smtp.example.com:587'
```

## Recording Rules

### Pre-computed Aggregations
```yaml
# recording_rules.yml
groups:
  - name: training_metrics
    interval: 1m
    rules:
      # Pre-compute average loss per experiment
      - record: training:loss:avg
        expr: avg(training_loss) by (experiment_id)

      # Pre-compute training throughput
      - record: training:throughput:rate5m
        expr: rate(training_steps_total[5m])

      # Pre-compute GPU usage average per node
      - record: gpu:memory:avg:node
        expr: avg(gpu_memory_mb) by (node_id)

      # Pre-compute accuracy trend
      - record: training:accuracy:1h_avg
        expr: avg_over_time(training_accuracy[1h])
```

## Kubernetes Integration

### Prometheus on Kubernetes
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
      - job_name: 'kubernetes-apiservers'
        kubernetes_sd_configs:
          - role: endpoints
        scheme: https
        tls_config:
          ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prometheus
spec:
  replicas: 1
  selector:
    matchLabels:
      app: prometheus
  template:
    metadata:
      labels:
        app: prometheus
    spec:
      serviceAccountName: prometheus
      containers:
      - name: prometheus
        image: prom/prometheus:latest
        ports:
        - containerPort: 9090
        volumeMounts:
        - name: config
          mountPath: /etc/prometheus
        - name: storage
          mountPath: /prometheus
        args:
          - '--config.file=/etc/prometheus/prometheus.yml'
          - '--storage.tsdb.path=/prometheus'
      volumes:
      - name: config
        configMap:
          name: prometheus-config
      - name: storage
        emptyDir: {}
```

## Monitoring Training Jobs

```python
from prometheus_client import Counter, Histogram, Gauge, start_http_server

# Custom metrics for ML training
model_training_epochs = Counter(
    'model_training_epochs_total',
    'Total epochs completed',
    ['experiment_id', 'model_name', 'dataset']
)

training_duration_seconds = Histogram(
    'training_duration_seconds',
    'Training duration',
    ['experiment_id'],
    buckets=(60, 300, 900, 1800, 3600, 7200)
)

model_best_accuracy = Gauge(
    'model_best_accuracy',
    'Best validation accuracy',
    ['experiment_id', 'model_name']
)

batch_processing_time = Histogram(
    'batch_processing_ms',
    'Batch processing time in milliseconds',
    ['experiment_id', 'batch_size'],
    buckets=(10, 50, 100, 500, 1000)
)

# Use in training
for epoch in range(num_epochs):
    for batch in dataloader:
        start = time.time()
        
        # Training
        output = model(batch)
        loss = criterion(output, batch.labels)
        loss.backward()
        optimizer.step()
        
        # Record metrics
        batch_processing_time.labels(
            experiment_id=exp_id,
            batch_size=len(batch)
        ).observe((time.time() - start) * 1000)
    
    model_training_epochs.labels(
        experiment_id=exp_id,
        model_name='bert',
        dataset='dataset_v1'
    ).inc()
    
    # Validation
    accuracy = validate()
    model_best_accuracy.labels(
        experiment_id=exp_id,
        model_name='bert'
    ).set(accuracy)
```

## Best Practices

1. **Use appropriate labels** - Keep cardinality reasonable
2. **Set retention** - 30 days typical for live metrics
3. **Use recording rules** - Pre-compute expensive queries
4. **Alert on symptoms** - Not causes (e.g., high temperature > hardware failure)
5. **Monitor cardinality** - Prevent metric explosion
6. **Use relabeling** - Filter unnecessary targets
7. **Document dashboards** - Explain metrics

## Further Reading

- [Prometheus Documentation](https://prometheus.io/docs/)
- [PromQL Operators](https://prometheus.io/docs/prometheus/latest/querying/operators/)
- [Best Practices](https://prometheus.io/docs/practices/naming/)
- [Client Libraries](https://prometheus.io/docs/instrumenting/clientlibs/)
