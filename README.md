# Health Dashboard

A comprehensive health monitoring and analytics dashboard built with React frontend, Python FastAPI backend, and full CI/CD pipeline integration.

## 🏗️ Architecture

- **Frontend**: React 18 with TypeScript, Material-UI, and Chart.js
- **Backend**: Python FastAPI with SQLAlchemy and PostgreSQL
- **Authentication**: JWT-based with role-based access control
- **Containerization**: Docker with multi-stage builds
- **CI/CD**: GitHub Actions with automated testing and deployment
- **Infrastructure**: Kubernetes manifests and Terraform configurations

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ and npm
- Python 3.11+
- kubectl (for Kubernetes deployment)
- Terraform (for infrastructure provisioning)

### Local Development
```bash
# Clone the repository
git clone <your-repo-url>
cd Health-Dashboard

# Start with Docker Compose
docker-compose up -d

# Or run locally
cd frontend && npm install && npm start
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload
```

### Production Deployment
```bash
# Docker-based deployment
docker-compose -f docker-compose.production.yml up -d

# Kubernetes deployment
kubectl apply -f infrastructure/kubernetes/

# Infrastructure provisioning with Terraform
cd infrastructure/terraform
terraform init && terraform apply
```

## 📋 Features

- **Real-time Health Monitoring**: System metrics, application health, and performance indicators
- **Role-based Access Control**: Management, DevOps, QA, Dev, and other user roles
- **Interactive Dashboards**: Customizable widgets and charts
- **Alert Management**: Configurable thresholds and notifications
- **API Documentation**: Auto-generated OpenAPI/Swagger docs
- **Multi-environment Support**: Development, staging, and production configurations

## 🔐 User Roles & Permissions

- **Management**: Full access to all dashboards and reports
- **DevOps**: Infrastructure monitoring, deployment status, and system health
- **QA**: Test results, quality metrics, and performance data
- **Dev**: Application metrics, error logs, and development insights
- **Others**: Limited access based on assigned permissions

## 🛠️ Technology Stack

### Frontend
- React 18 + TypeScript
- Material-UI (MUI) v5
- Chart.js for data visualization
- React Router for navigation
- Axios for API communication

### Backend
- Python 3.11+
- FastAPI framework
- SQLAlchemy ORM
- PostgreSQL database
- Redis for caching
- Celery for background tasks

### Infrastructure
- Docker & Docker Compose
- Kubernetes manifests
- Terraform for IaC
- Nginx for reverse proxy
- Prometheus + Grafana for monitoring

### CI/CD
- GitHub Actions
- Automated testing
- Security scanning
- Multi-environment deployment
- Infrastructure as Code

## 📁 Project Structure

```
Health-Dashboard/
├── frontend/                 # React frontend application
├── backend/                  # Python FastAPI backend
├── infrastructure/           # Infrastructure configurations
│   ├── docker/              # Docker configurations
│   ├── kubernetes/          # K8s manifests
│   └── terraform/           # Terraform IaC
├── ci-cd/                   # CI/CD pipeline configurations
└── docs/                    # Documentation
```

## 🔄 CI/CD Pipeline

The project includes automated CI/CD pipelines with:
- Automated testing (unit, integration, e2e)
- Security vulnerability scanning
- Docker image building and pushing
- Multi-environment deployment
- Infrastructure provisioning
- Monitoring and alerting setup

## 📊 Monitoring & Observability

- Application performance monitoring
- Infrastructure metrics
- Log aggregation and analysis
- Real-time alerting
- Custom dashboard creation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in the `docs/` folder
- Review the troubleshooting guide

## 🔗 Links

- [Frontend Documentation](./frontend/README.md)
- [Backend API Documentation](./backend/README.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Infrastructure Guide](./docs/INFRASTRUCTURE.md)
