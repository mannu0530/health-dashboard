# Health Dashboard Deployment Guide

This guide covers deploying the Health Dashboard application using Docker and Kubernetes.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development with Docker](#local-development-with-docker)
3. [Production Deployment with Docker](#production-deployment-with-docker)
4. [Kubernetes Deployment](#kubernetes-deployment)
5. [Environment Configuration](#environment-configuration)
6. [Monitoring Setup](#monitoring-setup)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- Docker 20.10+
- Docker Compose 2.0+
- kubectl 1.25+
- Helm 3.8+ (for Kubernetes)
- Git

### Required Accounts
- GitHub account (for CI/CD)
- Container registry access
- Cloud provider account (AWS, GCP, Azure)

## Local Development with Docker

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd Health-Dashboard
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```bash
# Database
POSTGRES_DB=health_dashboard
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password

# Redis
REDIS_PASSWORD=redis123

# Application
SECRET_KEY=your-secret-key-change-in-production
JWT_SECRET_KEY=your-jwt-secret-key-change-in-production

# Environment
ENVIRONMENT=development
```

### 3. Start Services
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 4. Access Applications
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (admin/admin)

### 5. Database Initialization
The database will be automatically initialized when the backend starts. You can also manually run:
```bash
docker-compose exec backend python -m alembic upgrade head
```

## Production Deployment with Docker

### 1. Build Production Images
```bash
# Build backend
docker build -t health-dashboard/backend:latest ./backend

# Build frontend
docker build -t health-dashboard/frontend:latest ./frontend
```

### 2. Production Environment
Create a `.env.production` file:
```bash
# Database
POSTGRES_DB=health_dashboard
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<strong-password>

# Redis
REDIS_PASSWORD=<strong-redis-password>

# Application
SECRET_KEY=<strong-secret-key>
JWT_SECRET_KEY=<strong-jwt-secret-key>

# Environment
ENVIRONMENT=production
ALLOWED_HOSTS=health-dashboard.com,www.health-dashboard.com,api.health-dashboard.com

# Monitoring
GRAFANA_ADMIN_PASSWORD=<strong-grafana-password>
```

### 3. Deploy Production
```bash
# Deploy with production compose file
docker-compose -f docker-compose.production.yml --env-file .env.production up -d

# Scale services
docker-compose -f docker-compose.production.yml up -d --scale backend=3 --scale frontend=3
```

## Kubernetes Deployment

### 1. Cluster Setup
Ensure you have a Kubernetes cluster running with:
- Ingress controller (NGINX)
- Cert-manager (for SSL certificates)
- Storage class for persistent volumes

### 2. Namespace Creation
```bash
kubectl apply -f infrastructure/kubernetes/namespace.yml
```

### 3. Secrets Configuration
Update the secrets file with your actual values:
```bash
# Encode your secrets
echo -n "your-secret-key" | base64
echo -n "your-jwt-secret-key" | base64
echo -n "your-postgres-password" | base64
echo -n "your-redis-password" | base64
echo -n "your-grafana-password" | base64

# Update infrastructure/kubernetes/secrets.yml
```

### 4. Deploy Infrastructure
```bash
# Deploy database and Redis
kubectl apply -f infrastructure/kubernetes/database-deployment.yml
kubectl apply -f infrastructure/kubernetes/redis-deployment.yml

# Deploy monitoring
kubectl apply -f infrastructure/kubernetes/monitoring-deployment.yml

# Deploy applications
kubectl apply -f infrastructure/kubernetes/backend-deployment.yml
kubectl apply -f infrastructure/kubernetes/frontend-deployment.yml

# Deploy ingress
kubectl apply -f infrastructure/kubernetes/ingress.yml
```

### 5. Verify Deployment
```bash
# Check pods
kubectl get pods -n health-dashboard

# Check services
kubectl get services -n health-dashboard

# Check ingress
kubectl get ingress -n health-dashboard

# View logs
kubectl logs -f deployment/health-dashboard-backend -n health-dashboard
```

## Environment Configuration

### Development
- `ENVIRONMENT=development`
- `DEBUG=true`
- `DATABASE_ECHO=true`
- `LOG_LEVEL=DEBUG`

### Staging
- `ENVIRONMENT=staging`
- `DEBUG=true`
- `DATABASE_ECHO=false`
- `LOG_LEVEL=INFO`

### Production
- `ENVIRONMENT=production`
- `DEBUG=false`
- `DATABASE_ECHO=false`
- `LOG_LEVEL=WARNING`

## Monitoring Setup

### 1. Prometheus Configuration
Prometheus will automatically scrape metrics from:
- Backend API (port 8000)
- Frontend (port 80)
- Self-monitoring (port 9090)

### 2. Grafana Dashboards
Access Grafana and import the following dashboards:
- System Overview
- Application Metrics
- Database Performance
- Infrastructure Health

### 3. Alerting Rules
Configure alerting rules for:
- High CPU/Memory usage
- Database connection issues
- API response time degradation
- Service availability

## CI/CD Pipeline

### 1. GitHub Actions Setup
The CI/CD pipeline includes:
- Code quality checks
- Security scanning
- Automated testing
- Docker image building
- Multi-environment deployment

### 2. Required Secrets
Set these secrets in your GitHub repository:
- `SNYK_TOKEN` - Snyk security scanning
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key

### 3. Deployment Triggers
- **Push to develop**: Deploy to staging
- **Push to main**: Deploy to production
- **Release**: Trigger production deployment

## Scaling and Performance

### 1. Horizontal Pod Autoscaling
The application includes HPA configurations:
- Backend: 3-10 replicas based on CPU/Memory
- Frontend: 3-10 replicas based on CPU/Memory

### 2. Resource Limits
- Backend: 1Gi memory, 1 CPU
- Frontend: 512Mi memory, 0.5 CPU
- Database: 1Gi memory, 1 CPU
- Redis: 512Mi memory, 0.5 CPU

### 3. Performance Optimization
- Enable Redis caching
- Database connection pooling
- CDN for static assets
- Load balancing across replicas

## Security Considerations

### 1. Network Security
- Use Network Policies to restrict pod communication
- Enable TLS/SSL for all external traffic
- Implement rate limiting on ingress

### 2. Container Security
- Run containers as non-root users
- Use read-only root filesystems where possible
- Regular security scanning of images
- Keep base images updated

### 3. Access Control
- Implement RBAC for Kubernetes
- Use service accounts with minimal permissions
- Secure API endpoints with JWT authentication
- Regular secret rotation

## Backup and Recovery

### 1. Database Backups
```bash
# Create backup
docker-compose exec postgres pg_dump -U postgres health_dashboard > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U postgres health_dashboard < backup.sql
```

### 2. Persistent Volume Backups
- Regular snapshots of persistent volumes
- Cross-region replication for critical data
- Automated backup scheduling

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Check database status
docker-compose exec postgres pg_isready -U postgres

# Check logs
docker-compose logs postgres
```

#### 2. Application Startup Issues
```bash
# Check application logs
docker-compose logs backend
docker-compose logs frontend

# Check health endpoints
curl http://localhost:8000/health
curl http://localhost:3000/health
```

#### 3. Kubernetes Issues
```bash
# Check pod status
kubectl describe pod <pod-name> -n health-dashboard

# Check events
kubectl get events -n health-dashboard

# Check resource usage
kubectl top pods -n health-dashboard
```

### Debug Commands
```bash
# Port forwarding for debugging
kubectl port-forward service/health-dashboard-backend-service 8000:8000 -n health-dashboard

# Access container shell
kubectl exec -it <pod-name> -n health-dashboard -- /bin/bash

# View application logs
kubectl logs -f <pod-name> -n health-dashboard
```

## Support and Maintenance

### 1. Regular Maintenance
- Weekly security updates
- Monthly performance reviews
- Quarterly disaster recovery testing

### 2. Monitoring and Alerting
- Set up monitoring dashboards
- Configure alerting rules
- Regular log analysis

### 3. Documentation Updates
- Keep deployment guides updated
- Document configuration changes
- Maintain runbooks for common issues

## Next Steps

1. **Customize Configuration**: Update environment-specific settings
2. **Set Up Monitoring**: Configure Grafana dashboards and alerts
3. **Implement CI/CD**: Set up GitHub Actions for automated deployment
4. **Security Hardening**: Implement additional security measures
5. **Performance Tuning**: Optimize based on monitoring data
6. **Disaster Recovery**: Implement backup and recovery procedures

For additional support, refer to the project documentation or create an issue in the repository.
