"""
InvisiWork Backend — Auth Blueprint

Provides endpoints for user registration, login, token refresh, logout, and profile.
"""

from flask import Blueprint

auth_bp = Blueprint("auth", __name__)

# Import routes to register them with the blueprint
from app.auth import routes  # noqa: F401, E402
