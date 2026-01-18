---
sidebar_position: 9
---

# Monitoring & Observability

## Overview

Comprehensive monitoring of the MLOps platform includes **metrics**, **logs**, and **traces** across infrastructure, services, and machine learning pipelines.

## Three Pillars of Observability

### 1. Metrics
Quantifiable measurements at specific points in time:
- CPU, memory, disk usage
- Request rate, latency, errors
- GPU utilization
- Model inference latency

### 2. Logs
Detailed event records with context:
- Application logs
- System logs
- Access logs
- Error traces

### 3. Traces
Request flow tracking across distributed systems:
- End-to-end request latency
- Service dependencies
- Bottleneck identification

## Prometheus & Grafana

### Prometheus Setup

**prometheus.yaml:**
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'kubernetes-apiservers'
    kubernetes_sd_configs:
    - role: endpoints
    scheme: https
    tls_config:
      ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
    bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token

  - job_name: 'kubernetes-nodes'
    kubernetes_sd_configs:
    - role: node
    scheme: https
    tls_config:
      ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
    bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token

  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
    - role: pod
    relabel_configs:
    - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
      action: keep
      regex: true

  - job_name: 'mlflow'
    static_configs:
    - targets: ['mlflow:5000']

  - job_name: 'gpu-metrics'
    static_configs:
    - targets: ['gpu-exporter:9400']
```

### Prometheus Helm Chart
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install prometheus prometheus-community/kube-prometheus-stack \
  -n monitoring \
  --create-namespace
```

### PromQL Queries

```promql
# CPU usage percentage
(1 - avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m]))) * 100

# Memory usage
node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes

# Pod restart count
rate(kube_pod_container_status_restarts_total[15m])

# GPU utilization
nvidia_gpu_sm_clock_target

# Model inference latency (95th percentile)
histogram_quantile(0.95, rate(model_inference_duration_seconds_bucket[5m]))

# Request error rate
rate(http_requests_total{status=~"5.."}[1m])
```

### Grafana Dashboards

**Docker Compose to add Grafana:**
```yaml
prometheus:
  image: prom/prometheus:latest
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml
  ports:
    - "9090:9090"

grafana:
  image: grafana/grafana:latest
  ports:
    - "3000:3000"
  environment:
    GF_SECURITY_ADMIN_PASSWORD: admin
  volumes:
    - grafana_storage:/var/lib/grafana
```

**Dashboard Configuration:**
```json
{
  "dashboard": {
    "title": "MLOps Platform",
    "panels": [
      {
        "title": "CPU Usage",
        "targets": [
          {
            "expr": "rate(node_cpu_seconds_total[5m])"
          }
        ]
      },
      {
        "title": "GPU Utilization",
        "targets": [
          {
            "expr": "nvidia_gpu_sm_clock_target"
          }
        ]
      },
      {
        "title": "Model Latency (p95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(model_inference_duration_seconds_bucket[5m]))"
          }
        ]
      }
    ]
  }
}
```

## Log Management

### ELK Stack (Elasticsearch, Logstash, Kibana)

**Docker Compose:**
```yaml
elasticsearch:
  image: docker.elastic.co/elasticsearch/elasticsearch:8.0.0
  environment:
    - discovery.type=single-node
    - xpack.security.enabled=false
  ports:
    - "9200:9200"

logstash:
  image: docker.elastic.co/logstash/logstash:8.0.0
  volumes:
    - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
  ports:
    - "5000:5000"

kibana:
  image: docker.elastic.co/kibana/kibana:8.0.0
  ports:
    - "5601:5601"
  depends_on:
    - elasticsearch
```

**Logstash Configuration:**
```
input {
  tcp {
    port => 5000
    codec => json
  }
}

filter {
  if [type] == "pod" {
    mutate {
      add_field => { "kubernetes" => "%{[kubernetes.namespace_name]}" }
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "logs-%{+YYYY.MM.dd}"
  }
}
```

### Fluentd Integration

**Fluentd DaemonSet:**
```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluentd
  namespace: logging
spec:
  selector:
    matchLabels:
      app: fluentd
  template:
    metadata:
      labels:
        app: fluentd
    spec:
      containers:
      - name: fluentd
        image: fluent/fluentd-kubernetes-daemonset:v1
        volumeMounts:
        - name: varlog
          mountPath: /var/log
        - name: varlibdockercontainers
          mountPath: /var/lib/docker/containers
          readOnly: true
        env:
        - name: FLUENT_ELASTICSEARCH_HOST
          value: "elasticsearch"
        - name: FLUENT_ELASTICSEARCH_PORT
          value: "9200"
      volumes:
      - name: varlog
        hostPath:
          path: /var/log
      - name: varlibdockercontainers
        hostPath:
          path: /var/lib/docker/containers
```

### Graylog Alternative

**Docker Compose:**
```yaml
mongodb:
  image: mongo:4.4
  environment:
    MONGO_INITDB_ROOT_USERNAME: root
    MONGO_INITDB_ROOT_PASSWORD: root

elasticsearch:
  image: docker.elastic.co/elasticsearch/elasticsearch:7.10.0
  environment:
    - discovery.type=single-node

graylog:
  image: graylog/graylog:4.0
  environment:
    GRAYLOG_PASSWORD_SECRET: "lengthAtLeast16Chars"
    GRAYLOG_ROOT_PASSWORD_SHA2: "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918"
  ports:
    - "9000:9000"  # Web interface
    - "12201:12201/udp"  # GELF protocol
```

## Alerting Strategies

### Prometheus Alerting Rules

**alert-rules.yaml:**
```yaml
groups:
- name: MLOps Alerts
  interval: 30s
  rules:
  - alert: HighCPUUsage
    expr: (1 - avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m]))) * 100 > 80
    for: 5m
    annotations:
      summary: "High CPU usage detected"
      description: "CPU usage is {{ $value }}%"

  - alert: GPUMemoryExceeded
    expr: nvidia_gpu_memory_used_mb / nvidia_gpu_memory_total_mb > 0.9
    for: 2m
    annotations:
      summary: "GPU memory usage is high"
      description: "GPU {{ $labels.gpu_uuid }} is at {{ $value }}% capacity"

  - alert: ModelInferenceLatency
    expr: histogram_quantile(0.95, rate(model_inference_duration_seconds_bucket[5m])) > 1
    for: 5m
    annotations:
      summary: "High model inference latency"
      description: "P95 latency is {{ $value }} seconds"

  - alert: TrainingJobFailed
    expr: training_job_status{status="failed"} > 0
    for: 1m
    annotations:
      summary: "Training job failed"
      description: "Training job {{ $labels.job_id }} has failed"
```

### Alert Notification Channels

**Slack Integration:**
```yaml
global:
  resolve_timeout: 5m

route:
  receiver: 'slack'
  group_by: ['alertname', 'cluster']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h

receivers:
- name: 'slack'
  slack_configs:
  - api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'
    channel: '#mlops-alerts'
    text: 'Alert: {{ .GroupLabels.alertname }}'
```

## Application Metrics

### Instrument MLflow with Prometheus

```python
from prometheus_client import Counter, Histogram, Gauge
import time

# Define metrics
training_jobs = Counter(
    'mlops_training_jobs_total',
    'Total training jobs',
    ['status']
)

training_duration = Histogram(
    'mlops_training_duration_seconds',
    'Training job duration',
    buckets=[60, 300, 600, 1800, 3600, 7200]
)

model_accuracy = Gauge(
    'mlops_model_accuracy',
    'Model accuracy on test set',
    ['model_name', 'version']
)

# Use metrics in code
@training_duration.time()
def train_model(config):
    try:
        # Training logic
        accuracy = model.evaluate(test_data)
        model_accuracy.labels(
            model_name=config['name'],
            version=config['version']
        ).set(accuracy)
        training_jobs.labels(status='success').inc()
    except Exception as e:
        training_jobs.labels(status='failed').inc()
        raise
```

## Distributed Tracing

### Jaeger Setup

```bash
docker run -d --name jaeger \
  -e COLLECTOR_ZIPKIN_HOST_PORT=:9411 \
  -p 5775:5775/udp \
  -p 6831:6831/udp \
  -p 6832:6832/udp \
  -p 5778:5778 \
  -p 16686:16686 \
  -p 14268:14268 \
  -p 14250:14250 \
  -p 9411:9411 \
  jaegertracing/all-in-one:latest
```

### Instrument Code with OpenTelemetry

```python
from opentelemetry import trace, metrics
from opentelemetry.exporter.jaeger import JaegerExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

jaeger_exporter = JaegerExporter(agent_host_name="localhost", agent_port=6831)
trace.set_tracer_provider(TracerProvider())
trace.get_tracer_provider().add_span_processor(
    BatchSpanProcessor(jaeger_exporter)
)

tracer = trace.get_tracer(__name__)

with tracer.start_as_current_span("training") as span:
    span.set_attribute("model.name", "bert")
    span.set_attribute("dataset.size", 10000)
    
    # Training code
    train_model(config)
```

## Monitoring Best Practices

1. **Set meaningful thresholds** - Alert on business metrics
2. **Use correlation** - Link metrics, logs, and traces
3. **Monitor the monitor** - Ensure monitoring is healthy
4. **Automate response** - Use alerts to trigger actions
5. **Aggregate data** - Summarize metrics at multiple levels
6. **Retain historical data** - Keep data for trend analysis

## Further Reading

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [ELK Stack Guide](https://www.elastic.co/what-is/elk-stack)
- [Jaeger Documentation](https://www.jaegertracing.io/docs/)
