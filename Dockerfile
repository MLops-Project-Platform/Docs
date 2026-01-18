# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy documentation source
COPY . .

# Build static site
RUN npm run build

# Production stage - lightweight server
FROM node:22-alpine

WORKDIR /app

# Install http-server for serving static files
RUN npm install -g http-server

# Copy built artifacts from builder stage
COPY --from=builder /app/build ./build

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 3000

# Health check to ensure container is running
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

# Serve static documentation site
CMD ["http-server", "build", "-p", "3000", "--cors", "-c-1"]
