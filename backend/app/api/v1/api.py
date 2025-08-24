from fastapi import APIRouter

from app.api.v1.endpoints import auth

api_router = APIRouter()

# Include authentication routes
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])

# TODO: Add more route modules as they are implemented
# api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
# api_router.include_router(system_health.router, prefix="/system-health", tags=["system-health"])
# api_router.include_router(performance.router, prefix="/performance", tags=["performance"])
# api_router.include_router(alerts.router, prefix="/alerts", tags=["alerts"])
# api_router.include_router(monitoring.router, prefix="/monitoring", tags=["monitoring"])
