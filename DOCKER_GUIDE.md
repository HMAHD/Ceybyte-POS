# CeybytePOS Docker Guide

## Overview

This guide covers the complete Docker setup for CeybytePOS, including both development and production environments.

## Quick Start

### Prerequisites

- Docker Desktop installed
- Docker Compose installed
- Git (for cloning the repository)

### Development Environment

```bash
# Linux/Mac
./scripts/docker-setup.sh dev

# Windows
scripts\docker-setup.bat dev
```

### Production Environment

```bash
# Linux/Mac
./scripts/docker-setup.sh prod

# Windows
scripts\docker-setup.bat prod
```

## Architecture

### Services

1. **ceybyte-api** - Python FastAPI backend
2. **ceybyte-frontend** - React frontend with Nginx
3. **ceybyte-dev** - Development frontend with hot reload
4. **ceybyte-backup** - Automated database backup service

### Network

- **ceybyte-network** - Bridge network for service communication
- **ceybyte-dev-network** - Development network

### Volumes

- **api_data** - Persistent database storage
- **api_dev_data** - Development database storage

## Configuration Files

### Docker Files

- `Dockerfile` - Production frontend build
- `Dockerfile.dev` - Development frontend with hot reload
- `src-tauri/python-api/Dockerfile` - Python API container
- `docker-compose.yml` - Production orchestration
- `docker-compose.dev.yml` - Development orchestration

### Configuration

- `docker/nginx.conf` - Nginx configuration for frontend
- `docker/env-config.sh` - Runtime environment configuration
- `.dockerignore` - Files excluded from build context

## Environment Variables

### Frontend Variables

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=CeybytePOS
VITE_COMPANY_NAME=Ceybyte.com
```

### Backend Variables

```env
DATABASE_URL=sqlite:///./data/ceybyte_pos.db
JWT_SECRET_KEY=your-secret-key-here
CORS_ORIGINS=http://localhost:3000,http://localhost:80
```

## Commands

### Setup Scripts

```bash
# Linux/Mac
./scripts/docker-setup.sh [command]

# Windows
scripts\docker-setup.bat [command]
```

### Available Commands

- `dev` - Start development environment
- `prod` - Start production environment
- `stop` - Stop all services
- `restart` - Restart services
- `logs [service]` - Show logs
- `cleanup` - Clean up Docker resources
- `status` - Show service status
- `help` - Show help message

### Manual Docker Commands

```bash
# Production
docker-compose up -d
docker-compose down
docker-compose logs -f

# Development
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml logs -f

# Build from scratch
docker-compose build --no-cache
docker-compose up -d
```

## Development Workflow

### 1. Start Development Environment

```bash
./scripts/docker-setup.sh dev
```

This starts:
- Frontend with hot reload on http://localhost:3000
- API with auto-reload on http://localhost:8000
- Database admin on http://localhost:8080

### 2. Code Changes

- Frontend changes are automatically reflected (hot reload)
- Backend changes trigger automatic restart
- Database changes persist in development volume

### 3. Debugging

```bash
# View logs
docker-compose -f docker-compose.dev.yml logs -f

# View specific service logs
docker-compose -f docker-compose.dev.yml logs -f ceybyte-api-dev

# Access container shell
docker exec -it ceybyte-pos-api-dev sh
docker exec -it ceybyte-pos-frontend-dev sh
```

## Production Deployment

### 1. Environment Setup

Create `.env` file with production values:

```env
JWT_SECRET_KEY=your-secure-production-key
VITE_API_BASE_URL=https://your-domain.com/api
VITE_APP_NAME=CeybytePOS
VITE_COMPANY_NAME=Your Company
DATABASE_URL=sqlite:///./data/ceybyte_pos.db
CORS_ORIGINS=https://your-domain.com
```

### 2. Start Production

```bash
./scripts/docker-setup.sh prod
```

This starts:
- Optimized frontend build served by Nginx on port 80
- Production API on port 8000
- Automated backup service

### 3. SSL/HTTPS Setup

For production, add SSL termination:

```yaml
# Add to docker-compose.yml
services:
  nginx-proxy:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl
      - ./nginx-ssl.conf:/etc/nginx/conf.d/default.conf
```

## Backup and Restore

### Automated Backups

The backup service automatically:
- Creates daily database backups
- Stores backups in `./backups/` directory
- Removes backups older than 7 days

### Manual Backup

```bash
# Create backup
docker exec ceybyte-pos-api cp /app/data/ceybyte_pos.db /app/data/backup_$(date +%Y%m%d).db

# Copy backup to host
docker cp ceybyte-pos-api:/app/data/backup_$(date +%Y%m%d).db ./backups/
```

### Restore from Backup

```bash
# Stop services
docker-compose down

# Replace database file
cp ./backups/backup_20250122.db ./data/ceybyte_pos.db

# Start services
docker-compose up -d
```

## Monitoring and Logs

### Health Checks

All services include health checks:
- Frontend: HTTP check on port 80
- API: HTTP check on /health endpoint
- Automatic restart on health check failure

### Log Management

```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f ceybyte-api

# Follow logs with timestamps
docker-compose logs -f -t

# Limit log output
docker-compose logs --tail=100 -f
```

### Resource Monitoring

```bash
# View resource usage
docker stats

# View service status
docker-compose ps

# View system resource usage
docker system df
```

## Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   # Check what's using the port
   netstat -tulpn | grep :8000
   
   # Change port in docker-compose.yml
   ports:
     - "8001:8000"  # Use different host port
   ```

2. **Permission issues**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER ./data
   chmod -R 755 ./data
   ```

3. **Database locked**
   ```bash
   # Stop all services
   docker-compose down
   
   # Remove lock files
   rm -f ./data/*.db-shm ./data/*.db-wal
   
   # Restart
   docker-compose up -d
   ```

4. **Build failures**
   ```bash
   # Clean build
   docker-compose down
   docker system prune -f
   docker-compose build --no-cache
   docker-compose up -d
   ```

### Debug Mode

Enable debug mode for development:

```yaml
# In docker-compose.dev.yml
environment:
  - DEBUG=true
  - FASTAPI_ENV=development
```

### Container Access

```bash
# Access API container
docker exec -it ceybyte-pos-api sh

# Access frontend container
docker exec -it ceybyte-pos-frontend sh

# Run commands in container
docker exec ceybyte-pos-api python init_db.py
```

## Security Considerations

### Production Security

1. **Change default secrets**
   - Generate secure JWT secret key
   - Use environment-specific passwords

2. **Network security**
   - Use custom Docker networks
   - Limit exposed ports
   - Implement SSL/TLS

3. **Container security**
   - Run as non-root user
   - Use minimal base images
   - Regular security updates

### Environment Isolation

- Separate development and production environments
- Use different database files
- Isolated Docker networks
- Environment-specific configurations

## Performance Optimization

### Production Optimizations

1. **Multi-stage builds** - Smaller final images
2. **Nginx caching** - Static asset caching
3. **Gzip compression** - Reduced bandwidth
4. **Health checks** - Automatic recovery
5. **Resource limits** - Prevent resource exhaustion

### Development Optimizations

1. **Volume mounts** - Fast code changes
2. **Hot reload** - Instant feedback
3. **Parallel builds** - Faster startup
4. **Cached layers** - Reduced build time

## Scaling

### Horizontal Scaling

```yaml
# Scale frontend instances
docker-compose up -d --scale ceybyte-frontend=3

# Load balancer configuration needed
```

### Database Scaling

For production scaling, consider:
- PostgreSQL instead of SQLite
- Database connection pooling
- Read replicas
- Backup strategies

## Maintenance

### Regular Tasks

1. **Update images**
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

2. **Clean up resources**
   ```bash
   docker system prune -f
   docker volume prune -f
   ```

3. **Monitor logs**
   ```bash
   docker-compose logs --since=24h
   ```

4. **Backup verification**
   ```bash
   # Test backup restore
   cp ./backups/latest.db ./data/test.db
   ```

This Docker setup provides a complete, production-ready environment for CeybytePOS with proper development workflow support.