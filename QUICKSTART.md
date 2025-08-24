# Health Dashboard - Quick Start Guide

Get up and running with the Health Dashboard in minutes!

## 🚀 Quick Start (5 minutes)

### 1. Prerequisites
- Docker & Docker Compose
- Git
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### 2. Clone and Setup
```bash
git clone <your-repo-url>
cd Health-Dashboard

# Quick development setup
make dev-setup
```

### 3. Access Your Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin)

### 4. Demo Credentials
Use these credentials to test different user roles:

| Role | Username | Password |
|------|----------|----------|
| Management | admin | admin123 |
| DevOps | devops | devops123 |
| QA | qa | qa123 |
| Dev | dev | dev123 |

## 🛠️ Development Commands

```bash
# Start services
make up

# View logs
make logs

# Stop services
make down

# Run tests
make test

# Code quality
make lint
make format

# Clean up
make clean
```

## 🏗️ Project Structure

```
Health-Dashboard/
├── frontend/                 # React 18 + TypeScript
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── store/          # Redux store & slices
│   │   ├── services/       # API services
│   │   └── types/          # TypeScript definitions
│   └── public/             # Static assets
├── backend/                 # Python FastAPI
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── core/           # Configuration & database
│   │   ├── models/         # Database models
│   │   ├── schemas/        # Pydantic schemas
│   │   └── services/       # Business logic
│   └── tests/              # Test suite
├── infrastructure/          # Infrastructure as Code
│   ├── docker/             # Docker configurations
│   ├── kubernetes/         # K8s manifests
│   └── terraform/          # Terraform IaC
├── ci-cd/                  # CI/CD pipelines
└── docs/                   # Documentation
```

## 🔐 Authentication & Authorization

The application implements role-based access control (RBAC) with the following roles:

- **Management**: Full access to all features
- **DevOps**: Infrastructure monitoring, alerts, system health
- **QA**: Test results, quality metrics, performance data
- **Dev**: Application metrics, error logs, development insights
- **Others**: Limited access based on permissions

## 📊 Features

### Core Features
- Real-time health monitoring
- Interactive dashboards with charts
- Role-based access control
- JWT authentication
- API documentation (OpenAPI/Swagger)

### Monitoring & Observability
- Prometheus metrics collection
- Grafana dashboards
- Health checks
- Performance monitoring
- Alert management

### Security
- JWT token authentication
- Role-based permissions
- Secure password hashing
- CORS configuration
- Rate limiting

## 🐳 Docker Development

### Start All Services
```bash
docker-compose up -d
```

### View Service Status
```bash
docker-compose ps
```

### Check Service Health
```bash
make health-check
```

### View Logs
```bash
# All services
make logs

# Specific service
make logs-backend
make logs-frontend
make logs-db
```

## ☸️ Kubernetes Deployment

### Prerequisites
- Kubernetes cluster (1.25+)
- kubectl configured
- Ingress controller (NGINX)
- Cert-manager (for SSL)

### Deploy to Kubernetes
```bash
make deploy-k8s
```

### Check Deployment Status
```bash
make k8s-status
```

### View Kubernetes Logs
```bash
make k8s-logs
```

## 🔄 CI/CD Pipeline

The project includes a comprehensive GitHub Actions workflow:

- **Code Quality**: Linting, type checking, security scanning
- **Testing**: Unit tests, integration tests, coverage reports
- **Security**: Vulnerability scanning, dependency analysis
- **Build**: Docker image building and pushing
- **Deploy**: Multi-environment deployment
- **Monitoring**: Performance testing, health checks

## 📈 Monitoring & Metrics

### Prometheus Metrics
- HTTP request counts and durations
- Application performance metrics
- Database connection metrics
- Custom business metrics

### Grafana Dashboards
- System overview
- Application performance
- Database health
- Infrastructure metrics

### Health Checks
- Application health endpoints
- Database connectivity
- Redis availability
- Service dependencies

## 🚨 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using the port
lsof -i :8000
lsof -i :3000

# Kill the process or change ports in docker-compose.yml
```

#### 2. Database Connection Issues
```bash
# Check database status
make health-check

# View database logs
make logs-db

# Restart database
docker-compose restart postgres
```

#### 3. Frontend Build Issues
```bash
# Clear node modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

#### 4. Backend Import Errors
```bash
# Check Python path
cd backend
export PYTHONPATH=$PYTHONPATH:$(pwd)

# Install dependencies
pip install -r requirements.txt
```

### Debug Commands
```bash
# Check service health
make health-check

# View specific service logs
make logs-backend
make logs-frontend

# Access database shell
make db-shell

# Run database migrations
make db-migrate
```

## 🔧 Configuration

### Environment Variables
Key configuration options in `.env`:

```bash
# Database
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/health_dashboard

# Redis
REDIS_URL=redis://localhost:6379/0

# Security
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret-key

# Environment
ENVIRONMENT=development
LOG_LEVEL=INFO
```

### Customization
- **Frontend**: Modify `frontend/src/config/` for app settings
- **Backend**: Update `backend/app/core/config.py` for API settings
- **Database**: Edit `infrastructure/kubernetes/database-deployment.yml`
- **Monitoring**: Configure `infrastructure/kubernetes/monitoring-deployment.yml`

## 📚 Next Steps

1. **Explore the Code**: Review the component structure and API endpoints
2. **Customize Dashboards**: Modify the dashboard components for your needs
3. **Add New Metrics**: Implement custom Prometheus metrics
4. **Extend Authentication**: Add OAuth providers or custom auth logic
5. **Deploy to Production**: Use the production Docker Compose or Kubernetes manifests
6. **Set Up CI/CD**: Configure GitHub Actions for your repository

## 🆘 Getting Help

- **Documentation**: Check the `docs/` folder for detailed guides
- **Issues**: Create an issue in the repository
- **Code**: Review the source code and comments
- **Community**: Join the project discussions

## 🎯 Development Tips

- Use `make help` to see all available commands
- Check `docker-compose logs` for service issues
- Use the health check endpoints to verify service status
- Monitor resource usage with `docker stats`
- Use the Makefile shortcuts for common operations

Happy coding! 🚀
