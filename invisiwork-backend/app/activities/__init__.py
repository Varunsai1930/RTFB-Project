"""
InvisiWork Backend — Activities Blueprint

Provides endpoints for logging, retrieving, and deleting developer activities.
"""

from flask import Blueprint

activities_bp = Blueprint("activities", __name__)

# Import routes to register them with the blueprint
from app.activities import routes  # noqa: F401, E402
