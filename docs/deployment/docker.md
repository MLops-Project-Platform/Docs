---
sidebar_position: 1
---

# Docker Deployment Guide

Deploy the MLOps Platform documentation with Docusaurus using Docker.

## Overview

This guide uses the official Docusaurus Docker deployment approach to containerize and deploy your documentation.

## Docker Image

### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy documentation source
COPY . .

# Build static site
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy built artifacts from builder
COPY --from=builder /app/build ./build

# Install http-server to serve static files
RUN npm install -g http-server

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

# Serve documentation
CMD ["http-server", "build", "-p", "3000", "--cors", "-c-1"]
```

Save as: `Dockerfile`

### .dockerignore

```
node_modules
npm-debug.log
build
.git
.gitignore
README.md
.DS_Store
.vscode
.idea
*.swp
*.swo
*~
```

Save as: `.dockerignore`

## Building and Running

### Build Image

```bash
# Navigate to Docs directory
cd e:\Projects\MLops-Project-Platform\Docs

# Build image
docker build -t mlops-docs:1.0 .

# Verify build
docker image ls | grep mlops-docs
```

### Run Container Locally

```bash
# Run container
docker run -d \
  --name mlops-docs \
  -p 3000:3000 \
  mlops-docs:1.0

# Check status
docker ps | grep mlops-docs

# View logs
docker logs mlops-docs

# Access documentation
# Open http://localhost:3000 in browser
```

### Container Management

```bash
# Stop container
docker stop mlops-docs

# Start container
docker start mlops-docs

# View logs
docker logs -f mlops-docs

# Remove container
docker rm mlops-docs

# Remove image
docker rmi mlops-docs:1.0
```

## Docker Compose

For local development, use docker-compose:

### docker-compose.yml

```yaml
version: '3.8'

services:
  docs:
    build:
      context: .
      dockerfile: Dockerfile
    
    container_name: mlops-docs
    
    ports:
      - "3000:3000"
    
    environment:
      NODE_ENV: production
    
    volumes:
      - ./docs:/app/docs              # Mount docs for live editing
      - ./sidebars.js:/app/sidebars.js
      - ./docusaurus.config.js:/app/docusaurus.config.js
    
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    
    restart: unless-stopped
```

### Run with Docker Compose

```bash
# Start services
docker compose up -d

# View logs
docker compose logs -f docs

# Stop services
docker compose down

# Remove volumes
docker compose down -v
```

## Development Workflow

### Live Development

```bash
# Start with volume mounts (for live reload)
docker run -d \
  --name mlops-docs-dev \
  -p 3000:3000 \
  -v $(pwd)/docs:/app/docs \
  -v $(pwd)/sidebars.js:/app/sidebars.js \
  mlops-docs:1.0
```

Or use the development Dockerfile:

```dockerfile
# Dockerfile.dev
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:

```bash
docker build -f Dockerfile.dev -t mlops-docs:dev .

docker run -d \
  --name mlops-docs-dev \
  -p 3000:3000 \
  -v $(pwd):/app \
  mlops-docs:dev
```

## Deployment

### Push to Docker Hub

```bash
# Login
docker login

# Tag image
docker tag mlops-docs:1.0 your-username/mlops-docs:1.0
docker tag mlops-docs:1.0 your-username/mlops-docs:latest

# Push
docker push your-username/mlops-docs:1.0
docker push your-username/mlops-docs:latest

# Verify
docker pull your-username/mlops-docs:latest
```

### Push to Container Registry (Azure ACR)

```bash
# Login to ACR
az acr login --name myregistry

# Tag image
docker tag mlops-docs:1.0 myregistry.azurecr.io/mlops-docs:1.0

# Push
docker push myregistry.azurecr.io/mlops-docs:1.0

# Verify
az acr repository list --name myregistry
```

### Push to Container Registry (AWS ECR)

```bash
# Get login token
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com

# Tag image
docker tag mlops-docs:1.0 123456789012.dkr.ecr.us-east-1.amazonaws.com/mlops-docs:1.0

# Push
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/mlops-docs:1.0
```

## Advanced Configuration

### Multi-stage Build

For optimized images:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build with optimizations
RUN npm run build && \
    npm prune --production

# Production stage - smaller base image
FROM node:18-alpine

WORKDIR /app

# Copy only necessary files
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["node", "-e", "require('http-server').createServer({root: './build'}).listen(3000)"]
```

### Environment-specific Configuration

```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  docs:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - .:/app
    command: npm start

# docker-compose.prod.yml
version: '3.8'
services:
  docs:
    image: mlops-docs:1.0
    ports:
      - "3000:3000"
    restart: always
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/"]
      interval: 30s
      timeout: 10s
      retries: 3
```

Use with:

```bash
docker compose -f docker-compose.dev.yml up
docker compose -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
docker build --no-cache -t mlops-docs:1.0 .

# Check Node version
docker run node:18-alpine node --version
```

### Port Already in Use

```bash
# Use different port
docker run -p 3001:3000 mlops-docs:1.0

# Or stop other container
docker ps
docker stop <container-id>
```

### Out of Memory

```bash
# Run with memory limits
docker run -m 1g mlops-docs:1.0

# Or increase Docker memory allocation
# Docker Desktop → Preferences → Resources
```

### Health Check Failing

```bash
# Check container logs
docker logs mlops-docs

# Test manually
docker exec mlops-docs wget --quiet --tries=1 --spider http://localhost:3000/

# Remove health check for debugging
# Temporarily remove HEALTHCHECK from Dockerfile
```

## Performance Optimization

### Image Size

```bash
# Check image size
docker image ls | grep mlops-docs

# Use alpine base images (smaller)
# Use multi-stage builds (removes build dependencies)
# Minimize layers
```

### Build Performance

```bash
# Use BuildKit for faster builds
DOCKER_BUILDKIT=1 docker build -t mlops-docs:1.0 .

# Use .dockerignore to exclude unnecessary files
```

## Security Best Practices

✅ **Do:**
- Use specific version tags (not latest)
- Run as non-root user
- Scan images for vulnerabilities
- Use secrets for sensitive data
- Regular updates

❌ **Don't:**
- Store credentials in images
- Use latest tags in production
- Run as root
- Ignore security warnings

### Example: Run as Non-root

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

COPY --chown=nodejs:nodejs . .

USER nodejs

EXPOSE 3000

CMD ["npm", "start"]
```

---

Next: [Kubernetes Deployment →](./kubernetes.md)
