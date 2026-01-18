---
sidebar_position: 8
---

# NVIDIA GPU Scheduling

## Overview

NVIDIA GPU scheduling in Kubernetes enables efficient allocation and utilization of GPU resources across training workloads and inference services.

## GPU Types

### Full GPU Access
Allocate entire GPU to a single pod:
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: training-job-full-gpu
spec:
  containers:
  - name: trainer
    image: mlops/trainer:cuda-11.8
    resources:
      limits:
        nvidia.com/gpu: 1  # Request 1 full GPU
    env:
    - name: CUDA_VISIBLE_DEVICES
      value: "0"
```

**Use Case:**
- Large-scale model training
- Memory-intensive workloads
- Minimal context switching needed

### Fractional GPU (MIG - Multi-Instance GPU)
Share a single GPU across multiple pods:
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: inference-fractional-gpu
spec:
  containers:
  - name: server
    image: mlops/inference:latest
    resources:
      limits:
        nvidia.com/gpu: "0.5"  # Request 50% of GPU
```

**Supported on:**
- NVIDIA A100, A30, A10G
- Requires NVIDIA MIG mode enabled

**Benefits:**
- Cost efficiency for inference
- Better resource utilization
- Multiple models per GPU

**Limitations:**
- Not supported on older GPUs
- Requires MIG partitioning setup
- Lower performance than full GPU

## GPU Device Plugin Installation

### Install NVIDIA Device Plugin
```bash
# Install NVIDIA Device Plugin
kubectl apply -f https://raw.githubusercontent.com/NVIDIA/k8s-device-plugin/v0.14.0/nvidia-device-plugin.yml

# Verify installation
kubectl get nodes -L nvidia.com/gpu

# Check available GPUs
kubectl describe node <node-name> | grep nvidia.com/gpu
```

### Check GPU Status
```bash
# View GPU allocation
kubectl get nodes -o custom-columns=NAME:.metadata.name,GPUS:.status.allocatable.nvidia\\.com/gpu

# Detailed GPU info
kubectl describe node gpu-node-1 | grep -A 5 "nvidia.com"
```

## MIG (Multi-Instance GPU) Setup

### Enable MIG Mode
```bash
# SSH to GPU node
ssh user@gpu-node

# Enable MIG mode (requires root)
sudo nvidia-smi -mig 1

# Verify MIG is enabled
nvidia-smi -L

# Create MIG profiles
sudo nvidia-smi -mig c.1g.6gb,c.1g.6gb,c.1g.6gb  # 3x 1g.6gb profiles
```

### MIG GPU Resource Mapping
```yaml
# Define MIG resources in device plugin config
apiVersion: v1
kind: ConfigMap
metadata:
  name: nvidia-device-plugin-configs
  namespace: kube-system
data:
  any: |
    version: v1
    sharing:
      timeSlicing:
        replicas: 4
      mig:
        strategy: mixed
        devices:
          all: "1g.6gb"
```

## GPU Resource Requests

### Training Jobs (Full GPU)
```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: bert-training
spec:
  template:
    spec:
      containers:
      - name: trainer
        image: mlops/trainer:cuda-11.8
        command: ["python", "train.py"]
        resources:
          requests:
            nvidia.com/gpu: 1
            memory: "16Gi"
            cpu: "8"
          limits:
            nvidia.com/gpu: 1
            memory: "16Gi"
            cpu: "8"
      restartPolicy: Never
  backoffLimit: 3
```

### Inference (Fractional GPU)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: model-serving
spec:
  replicas: 3
  selector:
    matchLabels:
      app: model-server
  template:
    metadata:
      labels:
        app: model-server
    spec:
      containers:
      - name: inference
        image: mlops/inference:latest
        resources:
          requests:
            nvidia.com/gpu: "0.25"  # 25% of GPU
            memory: "4Gi"
            cpu: "2"
          limits:
            nvidia.com/gpu: "0.25"
            memory: "4Gi"
            cpu: "2"
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - model-server
              topologyKey: kubernetes.io/hostname
```

### Multi-GPU Training
```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: distributed-training
spec:
  template:
    spec:
      containers:
      - name: trainer
        image: mlops/trainer:cuda-11.8
        env:
        - name: NVIDIA_VISIBLE_DEVICES
          value: "all"
        - name: CUDA_VISIBLE_DEVICES
          value: "0,1"  # Use GPUs 0 and 1
        resources:
          requests:
            nvidia.com/gpu: 2
            memory: "32Gi"
            cpu: "16"
          limits:
            nvidia.com/gpu: 2
            memory: "32Gi"
            cpu: "16"
      restartPolicy: Never
```

## GPU Affinity and Node Selection

### Request Specific GPU Type
```yaml
spec:
  nodeSelector:
    nvidia.com/gpu-memory: "40gb"  # Request A100 or similar
  containers:
  - name: trainer
    resources:
      limits:
        nvidia.com/gpu: 1
```

### Pod Affinity (Collocate on same node)
```yaml
spec:
  affinity:
    podAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchExpressions:
          - key: app
            operator: In
            values:
            - training-worker
        topologyKey: kubernetes.io/hostname
```

### Pod Anti-Affinity (Spread across nodes)
```yaml
spec:
  affinity:
    podAntiAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        podAffinityTerm:
          labelSelector:
            matchExpressions:
            - key: app
              operator: In
              values:
              - model-server
          topologyKey: kubernetes.io/hostname
```

## GPU Monitoring

### Monitor GPU Usage
```bash
# SSH to GPU node
ssh user@gpu-node

# Real-time GPU monitoring
watch -n 1 nvidia-smi

# Monitor in container
kubectl exec -it pod-name -- nvidia-smi
```

### Prometheus GPU Metrics
```yaml
apiVersion: v1
kind: Service
metadata:
  name: gpu-exporter
  namespace: monitoring
spec:
  selector:
    app: gpu-exporter
  ports:
  - port: 9400
    name: metrics
```

### Check GPU Process Info
```bash
nvidia-smi --query-compute-apps=pid,process_name,gpu_memory_usage --format=csv

nvidia-smi pmon -c 1  # Show process monitoring
```

## CUDA and cuDNN Setup

### Base Docker Image with CUDA
```dockerfile
FROM nvidia/cuda:11.8.0-runtime-ubuntu22.04

# Install dependencies
RUN apt-get update && apt-get install -y \
    python3.10 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install PyTorch with CUDA support
RUN pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# Install TensorFlow with CUDA support
RUN pip install tensorflow[and-cuda]

WORKDIR /app
COPY . .

ENTRYPOINT ["python3", "train.py"]
```

### Verify CUDA in Container
```bash
# Check CUDA availability
python -c "import torch; print(torch.cuda.is_available())"

# List visible GPUs
python -c "import torch; print(torch.cuda.device_count())"

# Check CUDA version
nvidia-smi
```

## Best Practices

1. **Always specify resource limits** - Prevent GPU over-allocation
2. **Use MIG for inference** - Cost-effective serving
3. **Use full GPUs for training** - Better performance
4. **Monitor GPU utilization** - Track efficiency
5. **Set appropriate timeouts** - Prevent hanging jobs
6. **Use node selectors** - Target specific GPU types
7. **Implement pod affinity** - Optimize placement

## Troubleshooting

### GPU not detected
```bash
# Check device plugin status
kubectl get daemonset -n kube-system | grep gpu

# Check logs
kubectl logs -n kube-system -l k8s-app=nvidia-device-plugin

# Verify device plugin is running
kubectl describe daemonset nvidia-device-plugin -n kube-system
```

### GPU allocation errors
```bash
# Check node GPU resources
kubectl describe node gpu-node-1 | grep nvidia.com

# Check pod events
kubectl describe pod training-job | grep -A 5 Events

# Check for pending pods
kubectl get pods -o wide | grep Pending
```

## Further Reading

- [NVIDIA Device Plugin](https://github.com/NVIDIA/k8s-device-plugin)
- [NVIDIA MIG User Guide](https://docs.nvidia.com/datacenter/tesla/mig-user-guide/)
- [CUDA Installation Guide](https://docs.nvidia.com/cuda/cuda-installation-guide-linux/)
