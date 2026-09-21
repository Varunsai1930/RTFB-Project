"""
InvisiWork Backend — Metrics Blueprint

Provides endpoints for current and historical metrics (IWR, BCS, PII).
"""

from flask import Blueprint

metrics_bp = Blueprint("metrics", __name__)

# Import routes to register them with the blueprint
from app.metrics import routes  # noqa: F401, E402
