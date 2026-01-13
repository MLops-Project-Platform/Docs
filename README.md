# MLOps Platform Documentation

Complete documentation site for the MLOps Platform built with Docusaurus.

## Overview

This documentation covers:
- 📖 Complete API and architecture guides
- 👨‍🔬 Researcher guide for ML experiments
- 🔧 Tool-specific documentation (MLflow, PostgreSQL, MinIO, Kubernetes)
- 📚 Repository information and setup guides
- 🚀 Deployment guides (Docker, Kubernetes, Production)

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Open http://localhost:3000 in browser
```

### Build Static Site

```bash
# Build for production
npm run build

# Serve static build locally
npm run serve
```

### Docker Deployment

```bash
# Build Docker image
docker build -t mlops-docs:1.0 .

# Run container
docker run -d -p 3000:3000 mlops-docs:1.0

# Or use docker-compose
docker compose up -d
```

### Kubernetes Deployment

```bash
# Apply all K8s manifests
kubectl apply -f k8s/

# Or use Helm
helm install mlops-docs ./charts/

# Verify deployment
kubectl get all -n mlops-docs
```

## Documentation Structure

```
docs/
├── getting-started/          # Getting started guides
│   ├── overview.md
│   ├── quick-start.md
│   └── architecture.md
│
├── repositories/             # Repository documentation
│   ├── overview.md
│   ├── mlops-platform.md
│   ├── mlops-research-template.md
│   └── mlops-helm-charts.md
│
├── tools/                    # Tool-specific guides
│   ├── overview.md
│   ├── mlflow.md
│   ├── postgres.md
│   ├── minio.md
│   ├── docker.md
│   └── kubernetes.md
│
├── researcher-guide/         # Complete researcher guide
│   ├── overview.md
│   ├── setup.md
│   ├── training.md
│   ├── tracking-experiments.md
│   └── best-practices.md
│
├── architecture/             # System architecture
│   ├── overview.md
│   ├── components.md
│   └── data-flow.md
│
├── deployment/              # Deployment guides
│   ├── docker.md
│   ├── kubernetes.md
│   └── production-setup.md
│
└── development/             # Development guides
    ├── contributing.md
    └── local-setup.md
```

## Configuration Files

### docusaurus.config.js

Main Docusaurus configuration with:
- Site metadata
- Navigation structure
- Theme settings
- Plugin configuration

### sidebars.js

Documentation sidebar structure defining:
- Documentation categories
- Document ordering
- Nested navigation

### package.json

NPM dependencies and scripts:
- Docusaurus core and preset
- Node modules
- Build and development commands

## Deployment Options

### Option 1: Docker Compose (Local/Development)

```bash
docker compose up -d
# Access at http://localhost:3000
```

### Option 2: Docker (Single Container)

```bash
docker build -t mlops-docs:1.0 .
docker run -p 3000:3000 mlops-docs:1.0
```

### Option 3: Kubernetes (Production)

```bash
# Create namespace and deploy
kubectl apply -f k8s/

# Or use Helm
helm install mlops-docs ./charts/ -n mlops-docs
```

### Option 4: Static Hosting (GitHub Pages, Netlify, etc.)

```bash
# Build static site
npm run build

# Deploy the 'build' directory
# GitHub Pages: push to gh-pages branch
# Netlify: connect repository
```

## File Structure

```
.
├── docs/                          # Documentation source files
├── src/                           # Custom components and CSS
│   ├── css/custom.css
│   └── components/
├── static/                        # Static assets (images, logos)
├── docusaurus.config.js           # Main configuration
├── sidebars.js                    # Sidebar structure
├── package.json                   # NPM dependencies
│
├── Dockerfile                     # Production image
├── Dockerfile.dev                 # Development image
├── docker-compose.yml             # Docker Compose setup
│
├── k8s/                           # Kubernetes manifests
│   ├── 00-namespace.yaml
│   ├── 01-secrets.yaml
│   ├── 02-deployment.yaml
│   ├── 03-service.yaml
│   ├── 04-ingress.yaml
│   ├── 05-rbac.yaml
│   └── 06-hpa.yaml
│
└── README.md                      # This file
```

## Key Features

### Complete Coverage

✅ All repositories documented
✅ Tools and components explained
✅ Full researcher guide
✅ Architecture documentation
✅ Deployment guides
✅ Development guides

### Multiple Deployment Options

✅ Local development with npm
✅ Docker containerization
✅ Kubernetes orchestration
✅ Static site hosting

### Production Ready

✅ Security best practices
✅ High availability configuration
✅ Auto-scaling setup
✅ Health checks and monitoring
✅ TLS/HTTPS support

## Contributing

### Edit Documentation

1. Edit markdown files in `docs/`
2. Follow existing formatting
3. Build locally to test: `npm start`
4. Commit and push changes
5. Create pull request

### Add New Page

1. Create markdown file in appropriate `docs/` subdirectory
2. Add entry to `sidebars.js`
3. Test with `npm start`
4. Verify formatting and links

### Formatting Guide

```markdown
---
sidebar_position: 1
---

# Page Title

Content here.

## Section Title

More content.

### Subsection

Details.
```

## Common Tasks

### View Documentation Locally

```bash
npm start
# Opens http://localhost:3000
```

### Build for Production

```bash
npm run build
# Creates 'build' directory with static files
```

### Update Dependencies

```bash
npm update
npm audit fix
```

### Check for Broken Links

```bash
npm run build  # Build first
# Check build output for broken link warnings
```

## Troubleshooting

### Port 3000 Already in Use

```bash
# Use different port
npm start -- --port 3001

# Or kill process using port 3000
lsof -i :3000
kill -9 <PID>
```

### Out of Memory During Build

```bash
# Increase Node memory
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

### Docker Build Fails

```bash
# Clear Docker cache
docker build --no-cache -t mlops-docs:1.0 .

# Or clean up Docker
docker system prune -a
```

### Kubernetes Deployment Issues

```bash
# Check pod status
kubectl get pods -n mlops-docs

# View pod logs
kubectl logs -f deployment/mlops-docs -n mlops-docs

# Describe pod for errors
kubectl describe pod <pod-name> -n mlops-docs
```

## Performance

### Image Size

- Production image: ~150MB
- Build stage image: ~500MB (discarded after build)
- Build cache optimized with multi-stage Dockerfile

### Load Times

- Static pages: <100ms
- Search: <500ms
- Mobile friendly: Optimized for all devices

## Security

### Best Practices Implemented

- Non-root user in Docker images
- Read-only filesystem where possible
- No hardcoded secrets
- Security headers configured
- HTTPS/TLS support
- Network policies in Kubernetes

## Monitoring

### Kubernetes Monitoring

```bash
# Check deployment status
kubectl get deployment mlops-docs -n mlops-docs

# View resource usage
kubectl top pods -n mlops-docs

# Check health
kubectl get hpa -n mlops-docs
```

### Docker Monitoring

```bash
# Check container stats
docker stats mlops-docs

# View logs
docker logs -f mlops-docs
```

## Support

### Getting Help

- 📖 Read the documentation
- 🐛 [Open a GitHub issue](https://github.com/MLops-Project-Platform/issues)
- 💬 [Start a discussion](https://github.com/MLops-Project-Platform/discussions)

### Resources

- [Docusaurus Documentation](https://docusaurus.io/)
- [MLOps Platform GitHub](https://github.com/MLops-Project-Platform)
- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)

## Version

**Documentation Version:** 1.0  
**Last Updated:** January 13, 2026  
**Docusaurus Version:** 3.0+

## License

This documentation is part of the MLOps Platform project. See LICENSE for details.

---

**Happy Learning!** 🚀

For questions or contributions, please open an issue or PR on [GitHub](https://github.com/MLops-Project-Platform).
