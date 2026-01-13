---
sidebar_position: 4
---

# MinIO (S3 Storage)

## What is MinIO?

MinIO is a high-performance, S3-compatible object storage server. It provides an Amazon S3-like interface for storing artifacts, models, and data.

## Role in MLOps Platform

MinIO stores:
- **Model artifacts** - Trained models in various formats
- **Training artifacts** - Plots, logs, datasets
- **Experiment data** - Data files generated during runs
- **Large files** - Models too big for database

## Key Concepts

### Buckets
Container for objects, similar to S3 buckets.

```bash
# Create bucket
mc mb minio/mlflow-artifacts

# List buckets
mc ls minio

# Remove bucket
mc rb minio/mlflow-artifacts
```

### Objects
Individual files stored in buckets.

```bash
# Upload file
mc cp model.pkl minio/mlflow-artifacts/model.pkl

# Download file
mc cp minio/mlflow-artifacts/model.pkl ./

# List objects
mc ls minio/mlflow-artifacts
```

## Configuration

### Environment Variables

```bash
# Endpoint URL
MLFLOW_S3_ENDPOINT_URL=http://minio:9000

# AWS credentials (for S3 access)
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin123

# Default artifact root
MLFLOW_DEFAULT_ARTIFACT_ROOT=s3://mlflow-artifacts
```

### docker-compose Configuration

```yaml
minio:
  image: minio/minio:latest
  environment:
    MINIO_ROOT_USER: minioadmin
    MINIO_ROOT_PASSWORD: minioadmin123
  ports:
    - "9000:9000"      # API port
    - "9001:9001"      # Console port
  volumes:
    - minio_data:/data
  command: server /data --console-address ":9001"
```

## Access Methods

### Via Python (boto3)

```python
import boto3

# Create S3 client pointing to MinIO
s3_client = boto3.client(
    's3',
    endpoint_url='http://localhost:9000',
    aws_access_key_id='minioadmin',
    aws_secret_access_key='minioadmin123'
)

# Upload file
s3_client.put_object(
    Bucket='mlflow-artifacts',
    Key='model.pkl',
    Body=open('model.pkl', 'rb')
)

# Download file
s3_client.download_file(
    'mlflow-artifacts',
    'model.pkl',
    'downloaded_model.pkl'
)

# List objects
response = s3_client.list_objects_v2(Bucket='mlflow-artifacts')
for obj in response['Contents']:
    print(obj['Key'])
```

### Via MinIO Console

1. Open http://localhost:9001
2. Login with `minioadmin` / `minioadmin123`
3. Browse buckets and objects visually

### Via MinIO Client (mc)

```bash
# Configure MinIO alias
mc alias set minio http://localhost:9000 minioadmin minioadmin123

# List buckets
mc ls minio

# Upload file
mc cp model.pkl minio/mlflow-artifacts/

# Download file
mc cp minio/mlflow-artifacts/model.pkl ./

# Remove file
mc rm minio/mlflow-artifacts/model.pkl
```

## Common Operations

### Create Bucket for Experiment

```python
import boto3

s3_client = boto3.client(
    's3',
    endpoint_url='http://localhost:9000',
    aws_access_key_id='minioadmin',
    aws_secret_access_key='minioadmin123'
)

# Create new bucket for specific experiment
bucket_name = 'experiment-2024-01'
s3_client.create_bucket(Bucket=bucket_name)
```

### Set Bucket Policy

```bash
# Make bucket public (for sharing)
mc policy set public minio/mlflow-artifacts
```

### Monitor Bucket Usage

```bash
# Check bucket size
mc du minio/mlflow-artifacts

# List with details
mc ls --recursive minio/mlflow-artifacts/
```

## Integration with MLflow

MLflow automatically stores artifacts in MinIO when configured:

```python
import mlflow

# Configure MLflow with MinIO
mlflow.set_tracking_uri("http://localhost:5000")

with mlflow.start_run():
    # Log metrics
    mlflow.log_metric("accuracy", 0.95)
    
    # Save and log model (auto-uploaded to MinIO)
    mlflow.sklearn.log_model(model, "model")
    
    # Log artifact file (auto-uploaded to MinIO)
    mlflow.log_artifact("plot.png")
```

## Backup and Disaster Recovery

### Backup Bucket Data

```bash
# Using mc mirror
mc mirror minio/mlflow-artifacts ./backup/

# Create backup bucket
mc mb minio/backup
mc mirror minio/mlflow-artifacts minio/backup
```

### Restore Bucket Data

```bash
# Mirror from backup
mc mirror ./backup minio/mlflow-artifacts

# Or from another bucket
mc mirror minio/backup minio/mlflow-artifacts
```

## Performance Optimization

### Upload Optimization

```python
# Use multipart upload for large files
import boto3

s3_client = boto3.client(
    's3',
    endpoint_url='http://localhost:9000',
    aws_access_key_id='minioadmin',
    aws_secret_access_key='minioadmin123'
)

# Upload with parallel parts
from boto3.s3.transfer import TransferConfig

config = TransferConfig(
    multipart_threshold=1024 * 25,  # 25 MB
    max_concurrency=10,
    multipart_chunksize=1024 * 25,
    use_threads=True
)

s3_client.upload_file(
    'large_file.pkl',
    'mlflow-artifacts',
    'large_file.pkl',
    Config=config
)
```

### Connection Pooling

```python
import boto3
from botocore.config import Config

# Configure with connection pooling
config = Config(
    max_pool_connections=50,
    retries={'max_attempts': 3}
)

s3_client = boto3.client(
    's3',
    endpoint_url='http://localhost:9000',
    aws_access_key_id='minioadmin',
    aws_secret_access_key='minioadmin123',
    config=config
)
```

## Troubleshooting

### Can't Connect to MinIO

```bash
# Check if MinIO is running
docker compose ps minio

# Check logs
docker compose logs minio

# Test connection
curl -u minioadmin:minioadmin123 http://localhost:9000/minio/health/live
```

### Authentication Issues

```bash
# Verify credentials
mc alias set test-minio http://localhost:9000 \
  minioadmin minioadmin123
mc ls test-minio

# Reset credentials
docker compose down
# Remove volume if needed
docker compose down -v
docker compose up -d
```

### Disk Space Issues

```bash
# Check MinIO disk usage
docker compose exec minio \
  du -sh /data

# Clean up old objects
mc rm --recursive --force minio/old-bucket
```

---

See [Researcher Guide](../researcher-guide/training.md) for practical artifact logging examples.
