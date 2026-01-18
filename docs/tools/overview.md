---
sidebar_position: 1
---

# Tools Overview

The MLOps Platform integrates several industry-standard tools and technologies to provide a complete ML infrastructure solution. This documentation covers machine learning tools, infrastructure components, data management systems, and communication layers.

## Core Tool Stack

| Tool | Purpose | Port | Version | Category |
|------|---------|------|---------|----------|
| **MLflow** | Experiment tracking & model registry | 5000 | 2.x | ML Tools |
| **PostgreSQL** | Metadata database | 5432 | 14+ | Databases |
| **MinIO** | S3-compatible object storage | 9000/9001 | Latest | Object Storage |
| **Redis** | In-memory caching & queuing | 6379 | 7+ | Caching/Queues |
| **Docker** | Container runtime | - | 20.10+ | Infrastructure |
| **Kubernetes** | Orchestration & scaling | - | 1.24+ | Infrastructure |
| **Nginx** | Reverse proxy & load balancer | 80/443 | Latest | Networking |
| **Helm** | Kubernetes package manager | - | 3.x | Infrastructure |

---

## Machine Learning Tools

### MLflow

MLflow is the experiment tracking and model registry system. It provides:
- **Experiment tracking** - Log parameters, metrics, and artifacts
- **Model registry** - Version and stage ML models
- **Model serving** - Deploy models via REST API
- **Integrated metadata storage** - Uses PostgreSQL backend

**Access:** http://localhost:5000  
**Use Case:** Track all training experiments, compare models, manage model lifecycle

**Example:**
```python
import mlflow

with mlflow.start_run():
    mlflow.log_param("learning_rate", 0.001)
    mlflow.log_metric("accuracy", 0.95)
    mlflow.sklearn.log_model(model, "model")
```

📖 **Full Documentation:** [MLflow Guide](./mlflow.md)

### NVIDIA GPU Support

NVIDIA GPU acceleration for training and inference:
- **CUDA Toolkit** - GPU compute platform
- **cuDNN** - Deep neural network library
- **GPU monitoring** - Track GPU utilization
- **Multi-GPU training** - Distributed training support

**Setup in Docker:**
```dockerfile
FROM nvidia/cuda:12.1.1-runtime-ubuntu22.04
RUN pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

**Kubernetes GPU Configuration:**
```yaml
resources:
  limits:
    nvidia.com/gpu: 2
```

**Monitor GPUs:**
```bash
nvidia-smi
# or
watch -n 1 nvidia-smi
```

### Run:AI (Optional)

Run:AI provides advanced GPU scheduling and resource management:
- **GPU virtualization** - Share GPUs across multiple jobs
- **Job scheduling** - Intelligent workload placement
- **Resource quotas** - Fair allocation across teams
- **Job prioritization** - Priority-based execution

---

## Infrastructure & Orchestration

### Docker

Docker containerizes applications for consistency and portability:
- **Image building** - Create reproducible environments
- **Container orchestration** - Run multiple services
- **Network management** - Service-to-service communication
- **Volume management** - Persistent storage

**Common Commands:**
```bash
# Build image
docker build -f Dockerfile -t myapp:latest .

# Run container
docker run -it -p 8000:8000 myapp:latest

# View logs
docker logs -f container_name

# Stop/Remove
docker stop container_name
docker rm container_name
```

📖 **Full Documentation:** [Docker Guide](./docker.md)

### Kubernetes

Kubernetes orchestrates containerized workloads:
- **Pod management** - Run containerized applications
- **Service discovery** - Automatic DNS and load balancing
- **Scaling** - Horizontal pod autoscaling (HPA)
- **Namespace isolation** - Multi-team environments
- **Persistent volumes** - Stateful data management

**Key Resources:**
```yaml
# Deployment - Manage replicated pods
apiVersion: apps/v1
kind: Deployment
metadata:
  name: training-job
spec:
  replicas: 3
  selector:
    matchLabels:
      app: training

# Service - Expose pods
apiVersion: v1
kind: Service
metadata:
  name: mlflow-service
spec:
  ports:
  - port: 5000
    targetPort: 5000
  selector:
    app: mlflow
```

📖 **Full Documentation:** [Kubernetes Guide](./kubernetes.md)

---

## Data Management

### Object Storage

#### MinIO (S3-Compatible)

MinIO provides S3-compatible object storage:
- **Artifact storage** - Store training artifacts and models
- **S3 compatibility** - Works with boto3 and AWS SDK
- **Multi-tenancy** - Bucket-based isolation
- **Versioning** - Object version history

**Access:** http://localhost:9001 (Console)  
**Port:** 9000 (API)

**Python Example:**
```python
from minio import Minio

client = Minio('localhost:9000', 
               access_key='minioadmin',
               secret_key='minioadmin')

# Upload file
client.fput_object('mlops', 'models/bert.pkl', '/path/to/model.pkl')

# Download file
client.fget_object('mlops', 'models/bert.pkl', '/local/path.pkl')
```

📖 **Full Documentation:** [MinIO Guide](./minio.md)

#### AWS S3

For production cloud deployments:
- **Scalable storage** - Unlimited capacity
- **Access control** - Fine-grained IAM policies
- **Versioning** - Object version management
- **Lifecycle policies** - Auto-archive and expiration

**Connection:**
```python
import boto3

s3 = boto3.client('s3',
    aws_access_key_id='YOUR_KEY',
    aws_secret_access_key='YOUR_SECRET',
    region_name='us-east-1'
)

# Upload
s3.upload_file('local_file.pkl', 'bucket', 'models/model.pkl')

# Download
s3.download_file('bucket', 'models/model.pkl', 'local_file.pkl')
```

### Databases

The platform supports multiple database types for different use cases:

#### SQL Databases
- **PostgreSQL** - Primary metadata store for MLflow
- **MySQL** - Alternative RDBMS option
- Best for: Structured data, transactions, complex queries

#### NoSQL Databases
- **MongoDB** - Document database for flexible schemas
- **DynamoDB** - AWS serverless database
- Best for: Unstructured data, variable schemas, scalability

#### Caching & In-Memory
- **Redis** - Ultra-fast caching and message queuing
- **Memcached** - Distributed memory caching
- Best for: Session storage, cache layers, real-time data

#### Time-Series
- **InfluxDB** - Time-series metrics database
- **Prometheus** - Monitoring and alerting with metrics
- Best for: Metrics collection, performance monitoring

📖 **Full Documentation:** [Databases Guide](./databases.md)

---

## Message Queues & Event Streaming

Message queues enable asynchronous, decoupled communication:

### RabbitMQ

Robust message broker with flexible routing:
- **Message persistence** - Durable queue storage
- **Routing** - Direct, fanout, topic, and header-based routing
- **Management UI** - Web-based administration
- **Clustering** - High availability and load balancing

**Use Cases:** Job queuing, notifications, task distribution

**Example:**
```python
import pika

connection = pika.BlockingConnection(
    pika.ConnectionParameters('rabbitmq')
)
channel = connection.channel()
channel.queue_declare(queue='training_jobs', durable=True)

# Publish
channel.basic_publish(exchange='', routing_key='training_jobs',
                     body='{"model": "bert", "dataset": "wiki"}')

# Consume
def callback(ch, method, properties, body):
    print(f"Processing: {body}")
    ch.basic_ack(delivery_tag=method.delivery_tag)

channel.basic_consume(queue='training_jobs', on_message_callback=callback)
channel.start_consuming()
```

### Apache Kafka

High-throughput distributed event streaming:
- **Event streaming** - Publish-subscribe at scale
- **Partitioning** - Parallel processing across partitions
- **Consumer groups** - Scalable consumer coordination
- **Message replay** - Retain and replay messages

**Use Cases:** High-volume inference requests, real-time features, data pipelines

**Example:**
```python
from kafka import KafkaProducer, KafkaConsumer
import json

# Producer
producer = KafkaProducer(bootstrap_servers=['localhost:9092'],
                        value_serializer=lambda v: json.dumps(v).encode())
producer.send('inference_requests', {'model': 'bert', 'input': 'text'})

# Consumer
consumer = KafkaConsumer('inference_requests',
                        bootstrap_servers=['localhost:9092'],
                        group_id='inference_workers',
                        value_deserializer=lambda m: json.loads(m.decode()))
for message in consumer:
    print(f"Got: {message.value}")
```

### Redis Streams

Lightweight queuing with persistence:
- **Stream persistence** - Messages stored until consumed
- **Consumer groups** - Multiple consumers per topic
- **Acknowledgment** - Guaranteed processing
- **Low overhead** - Built into Redis

**Use Cases:** Lightweight job queues, real-time data pipelines

**Example:**
```python
import redis

r = redis.Redis(host='redis', port=6379)

# Add to stream
r.xadd('training_jobs', {'model': 'bert', 'dataset': 'wiki'})

# Create consumer group
r.xgroup_create('training_jobs', 'workers', id='0', mkstream=True)

# Consume
messages = r.xreadgroup({'training_jobs': '>'}, 'workers', 'worker_1')
```

📖 **Full Documentation:** [Message Queues Guide](./message-queues.md)

---

## Tools by Role

### For Researchers
- **MLflow** - Track experiments and manage models
- **Docker** - Run isolated training environments
- **Jupyter Notebooks** - Interactive development
- **NVIDIA GPU** - GPU-accelerated training
- **PostgreSQL** - Reliable data storage

### For Data Engineers
- **Apache Kafka** - Data pipeline streaming
- **PostgreSQL / MongoDB** - Data storage
- **MinIO / S3** - Data lake storage
- **Redis** - Caching and transformation pipelines
- **Message Queues** - Event-driven pipelines

### For Platform Engineers
- **Kubernetes** - Deploy and scale infrastructure
- **Helm** - Manage complex deployments
- **Docker** - Build custom containers
- **PostgreSQL / DynamoDB** - Infrastructure databases
- **Monitoring** - Prometheus, logs, metrics

### For ML Engineers
- **MLflow** - Model tracking and serving
- **RabbitMQ / Kafka** - Model serving queues
- **Redis** - Model caching
- **MinIO / S3** - Model artifact storage
- **Kubernetes** - Model deployment

---

## Quick Start Examples

### Local Development

```bash
# Start all services
docker compose up -d

# Check service health
docker compose ps

# Access MLflow
open http://localhost:5000

# Access MinIO Console
open http://localhost:9001

# Connect to PostgreSQL
psql -h localhost -U mlflow -d mlflow
```

### Submit Training Job via RabbitMQ

```python
import pika
import json

def submit_training_job(model_name, dataset):
    credentials = pika.PlainCredentials('mlops', 'password')
    connection = pika.BlockingConnection(
        pika.ConnectionParameters('rabbitmq', credentials=credentials)
    )
    channel = connection.channel()
    channel.queue_declare(queue='training_jobs', durable=True)
    
    job = {
        'model': model_name,
        'dataset': dataset,
        'hyperparams': {'batch_size': 32}
    }
    
    channel.basic_publish(
        exchange='',
        routing_key='training_jobs',
        body=json.dumps(job),
        properties=pika.BasicProperties(delivery_mode=2)
    )
    print(f"Job submitted: {model_name}")
```

### Stream Inference Requests via Kafka

```python
from kafka import KafkaProducer
import json
from datetime import datetime

producer = KafkaProducer(
    bootstrap_servers=['localhost:9092'],
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

# Submit inference request
request = {
    'model_id': 'bert-v2',
    'input': 'Analyze this text...',
    'timestamp': str(datetime.now())
}

producer.send('inference_requests', request)
print("Inference request sent")
```

---

## Detailed Documentation for Each Tool

### Core ML & Tracking
- [MLflow](./mlflow.md) - Experiment tracking & model registry
- [PostgreSQL](./postgres.md) - Metadata storage

### Infrastructure
- [Docker](./docker.md) - Container runtime
- [Kubernetes](./kubernetes.md) - Container orchestration

### Data & Storage
- [MinIO](./minio.md) - S3-compatible object storage
- [Databases](./databases.md) - SQL, NoSQL, Caching solutions

### Communication & Messaging
- [Message Queues](./message-queues.md) - RabbitMQ, Kafka, Redis Streams
