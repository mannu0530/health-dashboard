from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from fastapi import Request
import time

# Define Prometheus metrics
REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total number of HTTP requests',
    ['method', 'endpoint', 'status']
)

REQUEST_DURATION = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration in seconds',
    ['method', 'endpoint']
)

ACTIVE_CONNECTIONS = Gauge(
    'http_active_connections',
    'Number of active HTTP connections'
)

def setup_monitoring():
    """Setup monitoring and metrics collection"""
    # This function can be extended to setup additional monitoring
    # like health checks, custom metrics, etc.
    pass

def get_metrics():
    """Get Prometheus metrics"""
    return generate_latest()

def record_request_metrics(request: Request, status_code: int, duration: float):
    """Record request metrics for Prometheus"""
    endpoint = request.url.path
    method = request.method
    
    REQUEST_COUNT.labels(method=method, endpoint=endpoint, status=status_code).inc()
    REQUEST_DURATION.labels(method=method, endpoint=endpoint).observe(duration)

def increment_active_connections():
    """Increment active connections counter"""
    ACTIVE_CONNECTIONS.inc()

def decrement_active_connections():
    """Decrement active connections counter"""
    ACTIVE_CONNECTIONS.dec()
