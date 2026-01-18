---
sidebar_position: 3
---

# Amazon DynamoDB

## Overview

Amazon DynamoDB is a fully managed NoSQL database service offered by AWS. It provides automatic scaling, built-in security, and serverless operation - ideal for MLOps platforms running on AWS.

## Key Features

- **Fully Managed** - No infrastructure management required
- **Auto-scaling** - Automatically adjusts capacity
- **Global Tables** - Multi-region replication
- **Point-in-Time Recovery** - Restore to any point in time
- **Encryption** - At-rest and in-transit encryption
- **Pay-per-request** - Or provisioned capacity

## Use Cases in MLOps

### Experiment Metadata Storage
```python
import boto3
from datetime import datetime
import json

# Create DynamoDB resource
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table = dynamodb.Table('mlops-experiments')

# Create experiment record
experiment = {
    'experiment_id': 'exp_001',
    'name': 'bert-fine-tuning',
    'version': '1.0',
    'created_at': int(datetime.now().timestamp()),
    'status': 'completed',
    'config': {
        'batch_size': 32,
        'learning_rate': 0.001,
        'epochs': 10
    },
    'metrics': {
        'accuracy': 0.95,
        'f1_score': 0.93,
        'loss': 0.05
    }
}

# Put item
response = table.put_item(Item=experiment)

# Retrieve experiment
response = table.get_item(Key={'experiment_id': 'exp_001'})
experiment = response['Item']
```

## Setup

### Infrastructure as Code
```python
import boto3

# Create DynamoDB table
dynamodb = boto3.client('dynamodb', region_name='us-east-1')

# Experiments table
dynamodb.create_table(
    TableName='mlops-experiments',
    KeySchema=[
        {'AttributeName': 'experiment_id', 'KeyType': 'HASH'},
        {'AttributeName': 'created_at', 'KeyType': 'RANGE'}
    ],
    AttributeDefinitions=[
        {'AttributeName': 'experiment_id', 'AttributeType': 'S'},
        {'AttributeName': 'created_at', 'AttributeType': 'N'},
        {'AttributeName': 'status', 'AttributeType': 'S'}
    ],
    BillingMode='PAY_PER_REQUEST',  # Auto-scaling
    GlobalSecondaryIndexes=[
        {
            'IndexName': 'status-created_at-index',
            'KeySchema': [
                {'AttributeName': 'status', 'KeyType': 'HASH'},
                {'AttributeName': 'created_at', 'KeyType': 'RANGE'}
            ],
            'Projection': {'ProjectionType': 'ALL'}
        }
    ],
    Tags=[
        {'Key': 'Environment', 'Value': 'production'},
        {'Key': 'Application', 'Value': 'mlops'}
    ]
)
```

### CloudFormation Template
```yaml
AWSTemplateFormatVersion: '2010-09-09'
Resources:
  ExperimentsTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: mlops-experiments
      BillingMode: PAY_PER_REQUEST
      StreamSpecification:
        StreamViewType: NEW_AND_OLD_IMAGES
      AttributeDefinitions:
        - AttributeName: experiment_id
          AttributeType: S
        - AttributeName: created_at
          AttributeType: N
        - AttributeName: status
          AttributeType: S
      KeySchema:
        - AttributeName: experiment_id
          KeyType: HASH
        - AttributeName: created_at
          KeyType: RANGE
      GlobalSecondaryIndexes:
        - IndexName: status-created_at-index
          KeySchema:
            - AttributeName: status
              KeyType: HASH
            - AttributeName: created_at
              KeyType: RANGE
          Projection:
            ProjectionType: ALL
      PointInTimeRecoverySpecification:
        PointInTimeRecoveryEnabled: true
      Tags:
        - Key: Application
          Value: mlops
```

## Query Operations

### Basic CRUD
```python
import boto3
from datetime import datetime

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table = dynamodb.Table('mlops-experiments')

# Create
experiment = {
    'experiment_id': 'exp_002',
    'created_at': int(datetime.now().timestamp()),
    'name': 'vit-classifier',
    'status': 'running'
}
table.put_item(Item=experiment)

# Read
response = table.get_item(
    Key={
        'experiment_id': 'exp_002',
        'created_at': 1700000000
    }
)
item = response.get('Item')

# Update
table.update_item(
    Key={
        'experiment_id': 'exp_002',
        'created_at': 1700000000
    },
    UpdateExpression='SET #status = :status, #updated = :updated',
    ExpressionAttributeNames={
        '#status': 'status',
        '#updated': 'updated_at'
    },
    ExpressionAttributeValues={
        ':status': 'completed',
        ':updated': int(datetime.now().timestamp())
    }
)

# Delete
table.delete_item(
    Key={
        'experiment_id': 'exp_002',
        'created_at': 1700000000
    }
)
```

### Query and Scan
```python
from boto3.dynamodb.conditions import Key, Attr

# Query by partition key
response = table.query(
    KeyConditionExpression=Key('experiment_id').eq('exp_002')
)

# Query with range key
response = table.query(
    KeyConditionExpression=Key('experiment_id').eq('exp_002') & 
                          Key('created_at').between(1700000000, 1700100000)
)

# Query using GSI
response = table.query(
    IndexName='status-created_at-index',
    KeyConditionExpression=Key('status').eq('completed'),
    ScanIndexForward=False  # Descending order
)

# Scan with filter
response = table.scan(
    FilterExpression=Attr('metrics.accuracy').gt(0.9) & 
                    Attr('status').eq('completed')
)

# Process results
for item in response['Items']:
    print(f"{item['experiment_id']}: {item['metrics']['accuracy']}")
```

## Advanced Features

### Batch Operations
```python
# Batch write
with table.batch_writer(batch_size=25) as batch:
    for i in range(100):
        batch.put_item(Item={
            'experiment_id': f'exp_{i}',
            'created_at': int(datetime.now().timestamp()),
            'status': 'pending'
        })

# Batch get
dynamodb_client = boto3.client('dynamodb', region_name='us-east-1')
response = dynamodb_client.batch_get_item(
    RequestItems={
        'mlops-experiments': {
            'Keys': [
                {'experiment_id': {'S': 'exp_001'}, 'created_at': {'N': '1700000000'}},
                {'experiment_id': {'S': 'exp_002'}, 'created_at': {'N': '1700000001'}}
            ]
        }
    }
)
```

### DynamoDB Streams
```python
# Enable streams and process changes
def process_stream_record(record):
    if record['eventName'] == 'INSERT':
        item = record['dynamodb']['NewImage']
        print(f"New experiment: {item['experiment_id']['S']}")
    elif record['eventName'] == 'MODIFY':
        old = record['dynamodb']['OldImage']
        new = record['dynamodb']['NewImage']
        print(f"Updated: {old} -> {new}")

# Lambda handler
def lambda_handler(event, context):
    for record in event['Records']:
        process_stream_record(record)
    return {'statusCode': 200}
```

### Global Tables (Multi-Region)
```python
# Create global table
dynamodb_client = boto3.client('dynamodb', region_name='us-east-1')

dynamodb_client.create_global_table(
    GlobalTableName='mlops-experiments',
    ReplicationGroup=[
        {'RegionName': 'us-east-1'},
        {'RegionName': 'eu-west-1'},
        {'RegionName': 'ap-southeast-1'}
    ]
)

# Data automatically replicates across regions
```

## Monitoring and Performance

### CloudWatch Metrics
```python
import boto3

cloudwatch = boto3.client('cloudwatch', region_name='us-east-1')

# Get table metrics
response = cloudwatch.get_metric_statistics(
    Namespace='AWS/DynamoDB',
    MetricName='ConsumedReadCapacityUnits',
    Dimensions=[{'Name': 'TableName', 'Value': 'mlops-experiments'}],
    StartTime=datetime(2024, 1, 1),
    EndTime=datetime(2024, 1, 31),
    Period=3600,
    Statistics=['Sum', 'Average']
)

for datapoint in response['Datapoints']:
    print(f"{datapoint['Timestamp']}: {datapoint['Sum']} RCU")
```

### Enable TTL (Auto-expiration)
```python
dynamodb_client = boto3.client('dynamodb', region_name='us-east-1')

dynamodb_client.update_time_to_live(
    TableName='mlops-experiments',
    TimeToLiveSpecification={
        'AttributeName': 'expiration_time',
        'Enabled': True
    }
)

# Store with TTL
table.put_item(Item={
    'experiment_id': 'exp_temp',
    'created_at': int(datetime.now().timestamp()),
    'expiration_time': int(datetime.now().timestamp()) + 86400  # Expires in 24 hours
})
```

## Best Practices

1. **Choose right key design** - Ensure even distribution
2. **Use GSI wisely** - Each index has a cost
3. **Enable Point-in-Time Recovery** - For production tables
4. **Monitor RCU/WCU** - Avoid throttling
5. **Batch operations** - Reduce API calls
6. **Use TTL** - Auto-delete old data
7. **Enable encryption** - For sensitive data

## Comparison: On-Demand vs Provisioned

| Aspect | On-Demand | Provisioned |
|--------|-----------|-------------|
| Scaling | Automatic, instant | Manual or auto-scaling |
| Cost | Per request | Fixed + usage |
| Best for | Unpredictable workloads | Predictable, steady workloads |
| Latency | Slightly higher | Lower, consistent |

## Further Reading

- [DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
- [Boto3 DynamoDB Guide](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/dynamodb.html)
