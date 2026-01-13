# Quick Reference Guide

## 🚀 Getting Started (Choose One)

### Option 1: Local Development (Recommended)
```bash
cd e:\Projects\MLops-Project-Platform\Docs
npm install
npm start
# Opens http://localhost:3000 automatically
```

### Option 2: Docker Compose (Easiest)
```bash
cd e:\Projects\MLops-Project-Platform\Docs
docker compose up -d
# Access http://localhost:3000
```

### Option 3: Docker Build & Run
```bash
cd e:\Projects\MLops-Project-Platform\Docs
docker build -t mlops-docs:1.0 .
docker run -d -p 3000:3000 mlops-docs:1.0
```

### Option 4: Kubernetes Deployment
```bash
cd e:\Projects\MLops-Project-Platform\Docs
kubectl apply -f k8s/
# Wait 30-60 seconds, then check status:
kubectl get all -n mlops-docs
```

## 📚 Documentation Areas

### For Researchers
- Start: `docs/researcher-guide/overview.md`
- Setup: `docs/researcher-guide/setup.md`
- Training: `docs/researcher-guide/training.md`
- Tracking: `docs/researcher-guide/tracking-experiments.md`

### For DevOps
- Docker: `docs/deployment/docker.md`
- Kubernetes: `docs/deployment/kubernetes.md`
- Production: `docs/deployment/production-setup.md`

### Tool Documentation
- MLflow: `docs/tools/mlflow.md`
- PostgreSQL: `docs/tools/postgres.md`
- MinIO: `docs/tools/minio.md`
- Kubernetes: `docs/tools/kubernetes.md`

## 🐳 Docker Commands

```bash
# Build image
docker build -t mlops-docs:1.0 .

# Run container
docker run -d -p 3000:3000 mlops-docs:1.0

# Using docker-compose
docker compose up -d          # Start
docker compose down           # Stop
docker compose logs -f        # View logs
docker compose ps             # Status

# Stop and remove
docker stop <container-id>
docker rm <container-id>
docker rmi mlops-docs:1.0
```

## ☸️ Kubernetes Commands

```bash
# Deploy
kubectl apply -f k8s/

# Check status
kubectl get all -n mlops-docs
kubectl get pods -n mlops-docs
kubectl get svc -n mlops-docs
kubectl get ingress -n mlops-docs

# View logs
kubectl logs deployment/mlops-docs -n mlops-docs -f

# Port forward for local access
kubectl port-forward svc/mlops-docs 3000:80 -n mlops-docs

# Scale
kubectl scale deployment mlops-docs --replicas=5 -n mlops-docs

# Update image
kubectl set image deployment/mlops-docs docs=your-registry/mlops-docs:2.0 -n mlops-docs

# Delete deployment
kubectl delete -f k8s/
```

## 📝 Documentation Development

```bash
# Install dependencies
npm install

# Start dev server
npm start

# Build for production
npm run build

# Serve production build
npm run serve

# Check for issues
npm run docusaurus clear
```

## 🔧 Quick Fixes

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

### Docker Issues
```bash
# Clear cache
docker system prune -a

# Rebuild without cache
docker build --no-cache -t mlops-docs:1.0 .

# Check Docker logs
docker logs mlops-docs
```

### Kubernetes Issues
```bash
# Describe pod for errors
kubectl describe pod <pod-name> -n mlops-docs

# Check events
kubectl get events -n mlops-docs

# Pod logs
kubectl logs <pod-name> -n mlops-docs -f

# Check resource usage
kubectl top pods -n mlops-docs
```

## 📍 Access Points

| Service | Local Dev | Docker | K8s |
|---------|-----------|--------|-----|
| **Docs** | http://localhost:3000 | http://localhost:3000 | LoadBalancer/Ingress |

## 📦 File Structure Reference

```
Docs/
├── docs/                    # Documentation pages
├── k8s/                     # Kubernetes manifests
├── Dockerfile              # Production
├── Dockerfile.dev          # Development
├── docker-compose.yml      # Compose setup
├── package.json            # NPM config
├── docusaurus.config.js    # Main config
├── sidebars.js             # Navigation
└── README.md               # Full guide
```

## 🌐 Push to Docker Hub

```bash
# Login
docker login

# Tag image
docker tag mlops-docs:1.0 username/mlops-docs:1.0
docker tag mlops-docs:1.0 username/mlops-docs:latest

# Push
docker push username/mlops-docs:1.0
docker push username/mlops-docs:latest
```

## 🎯 Deployment Checklist

- [ ] Read README.md in Docs folder
- [ ] Install npm dependencies: `npm install`
- [ ] Test locally: `npm start`
- [ ] Build Docker image: `docker build -t mlops-docs:1.0 .`
- [ ] Test Docker: `docker run -p 3000:3000 mlops-docs:1.0`
- [ ] Update K8s image references in `k8s/02-deployment.yaml`
- [ ] Deploy to K8s: `kubectl apply -f k8s/`
- [ ] Verify: `kubectl get all -n mlops-docs`
- [ ] Check ingress: `kubectl get ingress -n mlops-docs`

## 📖 Documentation Features

✅ 27 comprehensive pages
✅ Complete researcher guide
✅ All tools documented
✅ Architecture diagrams
✅ Deployment guides
✅ Best practices
✅ Troubleshooting
✅ Contributing guide

## 💡 Tips

1. **Always test locally first** with `npm start`
2. **Use docker-compose** for quickest setup
3. **Read the README.md** for complete information
4. **Check logs** when things don't work
5. **Scale gradually** in Kubernetes production
6. **Document your changes** in the markdown files
7. **Keep images updated** regularly

## 🆘 Need Help?

- Check docs/getting-started/overview.md
- Read docs/deployment/docker.md for Docker help
- Read docs/deployment/kubernetes.md for K8s help
- Check SETUP_SUMMARY.md for complete summary
- Review README.md for comprehensive guide

---

**Happy Deploying!** 🚀

All files are in: `e:\Projects\MLops-Project-Platform\Docs`
