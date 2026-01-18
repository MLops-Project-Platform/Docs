---
sidebar_position: 2
---

# MySQL

## Overview

MySQL is a popular open-source relational database system. It offers a good balance between performance, reliability, and ease of use, making it suitable as an alternative metadata backend for MLOps platforms.

## Key Features

- **ACID Compliance** - With InnoDB engine
- **Replication** - Master-slave and master-master replication
- **Partitioning** - Horizontal table partitioning
- **Full-text Search** - Built-in full-text indexing
- **JSON Support** - Native JSON data type
- **Performance** - Optimized for read-heavy workloads

## Use Cases in MLOps

### Metadata Storage
```sql
-- Store experiment metadata
CREATE TABLE experiments (
  experiment_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  artifact_location VARCHAR(500),
  lifecycle_stage VARCHAR(50)
);

-- Store training runs
CREATE TABLE runs (
  run_id VARCHAR(255) PRIMARY KEY,
  experiment_id INT NOT NULL,
  user_id VARCHAR(255),
  status VARCHAR(50),
  start_time BIGINT,
  end_time BIGINT,
  artifact_uri VARCHAR(500),
  FOREIGN KEY (experiment_id) REFERENCES experiments(experiment_id)
);

-- Store metrics
CREATE TABLE metrics (
  run_id VARCHAR(255) NOT NULL,
  metric_key VARCHAR(255) NOT NULL,
  metric_value FLOAT,
  timestamp BIGINT,
  step INT DEFAULT 0,
  PRIMARY KEY (run_id, metric_key, timestamp),
  FOREIGN KEY (run_id) REFERENCES runs(run_id)
);
```

## Installation

### Docker
```yaml
mysql:
  image: mysql:8.0
  environment:
    MYSQL_ROOT_PASSWORD: root_password
    MYSQL_DATABASE: mlflow
    MYSQL_USER: mlflow
    MYSQL_PASSWORD: mlflow_password
  ports:
    - "3306:3306"
  volumes:
    - mysql_data:/var/lib/mysql
```

### Connection
```python
import mysql.connector

connection = mysql.connector.connect(
    host='localhost',
    user='mlflow',
    password='mlflow_password',
    database='mlflow',
    port=3306
)

cursor = connection.cursor()
cursor.execute("SELECT * FROM experiments")
results = cursor.fetchall()
cursor.close()
connection.close()
```

## Performance Optimization

### Indexing
```sql
-- Create indexes for frequently queried columns
CREATE INDEX idx_experiment_name ON experiments(name);
CREATE INDEX idx_run_status ON runs(status);
CREATE INDEX idx_metrics_timestamp ON metrics(timestamp);

-- Composite index for common queries
CREATE INDEX idx_run_experiment ON runs(experiment_id, status);
```

### Query Optimization
```sql
-- Use EXPLAIN to analyze queries
EXPLAIN SELECT * FROM metrics WHERE run_id = 'run_123' AND timestamp > 1000;

-- Use appropriate data types
ALTER TABLE metrics MODIFY metric_value DECIMAL(10, 6);

-- Archive old data
INSERT INTO metrics_archive SELECT * FROM metrics WHERE timestamp < DATE_SUB(NOW(), INTERVAL 1 YEAR);
DELETE FROM metrics WHERE timestamp < DATE_SUB(NOW(), INTERVAL 1 YEAR);
```

### Connection Pooling
```python
from mysql.connector import pooling

connection_pool = pooling.MySQLConnectionPool(
    pool_name="mlops_pool",
    pool_size=5,
    host='localhost',
    user='mlflow',
    password='mlflow_password',
    database='mlflow'
)

connection = connection_pool.get_connection()
```

## Replication Setup

### Master-Slave Replication
```sql
-- On Master
CREATE USER 'replication'@'%' IDENTIFIED BY 'password';
GRANT REPLICATION SLAVE ON *.* TO 'replication'@'%';

SHOW MASTER STATUS;
-- Note: File and Position values

-- On Slave
CHANGE MASTER TO
  MASTER_HOST='master_ip',
  MASTER_USER='replication',
  MASTER_PASSWORD='password',
  MASTER_LOG_FILE='mysql-bin.000001',
  MASTER_LOG_POS=154;

START SLAVE;
SHOW SLAVE STATUS\G
```

## Backup and Recovery

### mysqldump Backup
```bash
# Full backup
mysqldump -h localhost -u mlflow -p --all-databases > backup_full.sql

# Specific database
mysqldump -h localhost -u mlflow -p mlflow > backup_mlflow.sql

# With compression
mysqldump -h localhost -u mlflow -p mlflow | gzip > backup_mlflow.sql.gz

# Restore from backup
mysql -h localhost -u mlflow -p mlflow < backup_mlflow.sql

# Restore from compressed backup
gunzip < backup_mlflow.sql.gz | mysql -h localhost -u mlflow -p mlflow
```

### Binary Log Backup
```bash
# Enable binary logging
# Add to my.cnf:
# log_bin=mysql-bin
# server-id=1

# Flush logs to create new binary log file
mysqladmin -u root flush-logs

# Show binary logs
SHOW BINARY LOGS;

# Restore point-in-time recovery
mysqlbinlog mysql-bin.000001 | mysql -u root
```

## High Availability

### MySQL Cluster
```sql
-- Install NDB cluster engine
-- Configure cluster config.ini

-- Create cluster database
CREATE DATABASE ndbcluster ENGINE=NDBCLUSTER;
```

### InnoDB Replication
```sql
-- Enable binary logging for replication
SET GLOBAL binlog_format = 'ROW';

-- Monitor replication status
SHOW PROCESSLIST;
SHOW BINARY LOGS;
```

## Monitoring

### Health Checks
```python
def health_check():
    try:
        conn = mysql.connector.connect(
            host='localhost',
            user='mlflow',
            password='mlflow_password',
            database='mlflow'
        )
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"Health check failed: {e}")
        return False
```

### Key Metrics
```sql
-- Check current connections
SHOW PROCESSLIST;
SHOW STATUS LIKE 'Threads%';

-- Monitor slow queries
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

-- Check buffer pool efficiency
SHOW STATUS LIKE 'Innodb_buffer_pool%';

-- Monitor replication lag
SHOW SLAVE STATUS\G
```

## Best Practices

1. **Use InnoDB** - Better for ACID transactions
2. **Regular backups** - Daily full + hourly incremental
3. **Monitoring** - Track slow queries and connections
4. **Replication** - For high availability
5. **Partitioning** - For large tables
6. **Connection pooling** - Efficient resource management
7. **Upgrade regularly** - Stay current with security patches

## Troubleshooting

### Connection Issues
```bash
# Check if MySQL is running
mysql -h localhost -u root -p -e "SELECT 1"

# Check port availability
netstat -an | grep 3306

# Check logs
tail -f /var/log/mysql/error.log
```

### Performance Issues
```sql
-- Find slow queries
SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 10;

-- Check table size
SELECT table_name, ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.tables
WHERE table_schema = 'mlflow'
ORDER BY size_mb DESC;

-- Rebuild table
OPTIMIZE TABLE metrics;
```

### Replication Lag
```sql
-- Check replica status
SHOW SLAVE STATUS\G

-- If slave is lagging, restart it
STOP SLAVE;
START SLAVE;

-- Skip problematic events if needed
SET GLOBAL SQL_SLAVE_SKIP_COUNTER = 1;
START SLAVE;
```

## Further Reading

- [MySQL Official Documentation](https://dev.mysql.com/doc/)
- [InnoDB Storage Engine](https://dev.mysql.com/doc/refman/8.0/en/innodb-storage-engine.html)
- [MySQL Replication](https://dev.mysql.com/doc/refman/8.0/en/replication.html)
