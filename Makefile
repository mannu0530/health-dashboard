.PHONY: help install build up down logs clean test lint format deploy-k8s deploy-docker

# Default target
help:
	@echo "Health Dashboard - Available Commands:"
	@echo ""
	@echo "Development:"
	@echo "  install     - Install dependencies for frontend and backend"
	@echo "  build       - Build Docker images"
	@echo "  up          - Start all services with Docker Compose"
	@echo "  down        - Stop all services"
	@echo "  logs        - View logs from all services"
	@echo "  clean       - Remove all containers, images, and volumes"
	@echo ""
	@echo "Code Quality:"
	@echo "  test        - Run tests for frontend and backend"
	@echo "  lint        - Run linting for frontend and backend"
	@echo "  format      - Format code for frontend and backend"
	@echo ""
	@echo "Deployment:"
	@echo "  deploy-k8s  - Deploy to Kubernetes cluster"
	@echo "  deploy-docker - Deploy with Docker Compose production"
	@echo ""
	@echo "Utilities:"
	@echo "  db-backup   - Create database backup"
	@echo "  db-restore  - Restore database from backup"
	@echo "  health-check - Check health of all services"

# Development commands
install:
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "Installing backend dependencies..."
	cd backend && pip install -r requirements.txt

build:
	@echo "Building Docker images..."
	docker-compose build

build-fast:
	@echo "Building Docker images with BuildKit optimizations..."
	DOCKER_BUILDKIT=1 docker-compose build --parallel

build-frontend:
	@echo "Building frontend image with optimizations..."
	DOCKER_BUILDKIT=1 docker build --target production -t health-dashboard-frontend:latest ./frontend

build-backend:
	@echo "Building backend image with optimizations..."
	DOCKER_BUILDKIT=1 docker build --target production -t health-dashboard-backend:latest ./backend

build-backend-dev:
	@echo "Building backend image for development..."
	DOCKER_BUILDKIT=1 docker build -t health-dashboard-backend:dev ./backend

build-backend-prod:
	@echo "Building backend image for production..."
	DOCKER_BUILDKIT=1 docker build --target production -t health-dashboard-backend:production ./backend

up:
	@echo "Starting Health Dashboard services..."
	docker-compose up -d

down:
	@echo "Stopping Health Dashboard services..."
	docker-compose down

logs:
	@echo "Viewing logs..."
	docker-compose logs -f

clean:
	@echo "Cleaning up Docker resources..."
	docker-compose down -v --rmi all
	docker system prune -f

# Code quality commands
test:
	@echo "Running frontend tests..."
	cd frontend && npm test -- --watchAll=false
	@echo "Running backend tests..."
	cd backend && pytest tests/ -v

lint:
	@echo "Linting frontend code..."
	cd frontend && npm run lint
	@echo "Linting backend code..."
	cd backend && black --check .
	cd backend && isort --check-only .
	cd backend && flake8 .

format:
	@echo "Formatting frontend code..."
	cd frontend && npm run lint:fix
	@echo "Formatting backend code..."
	cd backend && black .
	cd backend && isort .

# Deployment commands
deploy-k8s:
	@echo "Deploying to Kubernetes..."
	kubectl apply -f infrastructure/kubernetes/namespace.yml
	kubectl apply -f infrastructure/kubernetes/configmaps.yml
	kubectl apply -f infrastructure/kubernetes/secrets.yml
	kubectl apply -f infrastructure/kubernetes/database-deployment.yml
	kubectl apply -f infrastructure/kubernetes/redis-deployment.yml
	kubectl apply -f infrastructure/kubernetes/monitoring-deployment.yml
	kubectl apply -f infrastructure/kubernetes/backend-deployment.yml
	kubectl apply -f infrastructure/kubernetes/frontend-deployment.yml
	kubectl apply -f infrastructure/kubernetes/ingress.yml
	@echo "Kubernetes deployment completed!"

deploy-docker:
	@echo "Deploying with Docker Compose production..."
	docker-compose -f docker-compose.production.yml up -d

# Utility commands
db-backup:
	@echo "Creating database backup..."
	docker-compose exec postgres pg_dump -U postgres health_dashboard > backup_$(shell date +%Y%m%d_%H%M%S).sql

db-restore:
	@echo "Restoring database from backup..."
	@read -p "Enter backup filename: " backup_file; \
	docker-compose exec -T postgres psql -U postgres health_dashboard < $$backup_file

health-check:
	@echo "Checking service health..."
	@echo "Frontend: $$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health || echo "unreachable")"
	@echo "Backend: $$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health || echo "unreachable")"
	@echo "Database: $$(docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1 && echo "healthy" || echo "unhealthy")"
	@echo "Redis: $$(docker-compose exec -T redis redis-cli ping > /dev/null 2>&1 && echo "healthy" || echo "unhealthy")"

# Production commands
prod-build:
	@echo "Building production images..."
	docker build -t health-dashboard/backend:latest ./backend
	docker build -t health-dashboard/frontend:latest ./frontend

prod-push:
	@echo "Pushing production images..."
	docker push health-dashboard/backend:latest
	docker push health-dashboard/frontend:latest

# Monitoring commands
monitor:
	@echo "Opening monitoring dashboards..."
	@echo "Prometheus: http://localhost:9090"
	@echo "Grafana: http://localhost:3001 (admin/admin)"

# Database commands
db-shell:
	@echo "Opening database shell..."
	docker-compose exec postgres psql -U postgres -d health_dashboard

db-migrate:
	@echo "Running database migrations..."
	docker-compose exec backend alembic upgrade head

# Logs for specific services
logs-backend:
	@echo "Viewing backend logs..."
	docker-compose logs -f backend

logs-frontend:
	@echo "Viewing frontend logs..."
	docker-compose logs -f frontend

logs-db:
	@echo "Viewing database logs..."
	docker-compose logs -f postgres

# Quick development setup
dev-setup: install build up
	@echo "Development environment setup complete!"
	@echo "Access your application at:"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend:  http://localhost:8000"
	@echo "  API Docs: http://localhost:8000/docs"

# Production setup
prod-setup: prod-build prod-push deploy-docker
	@echo "Production deployment complete!"

# Kubernetes management
k8s-status:
	@echo "Checking Kubernetes deployment status..."
	kubectl get pods -n health-dashboard
	kubectl get services -n health-dashboard
	kubectl get ingress -n health-dashboard

k8s-logs:
	@echo "Viewing Kubernetes logs..."
	kubectl logs -f deployment/health-dashboard-backend -n health-dashboard

k8s-shell:
	@echo "Opening shell in backend pod..."
	kubectl exec -it deployment/health-dashboard-backend -n health-dashboard -- /bin/bash
