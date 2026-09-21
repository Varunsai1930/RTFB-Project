"""
InvisiWork Backend — Manager Blueprint

Provides team-wide analytics endpoints for manager-role users.
All routes require @require_auth + @require_manager.

Endpoints:
    GET /api/manager/team              — Team member list with current metrics
    GET /api/manager/team/history      — Aggregated team metrics per week
    GET /api/manager/developer/<id>    — Single developer drill-down
"""

from flask import Blueprint

manager_bp = Blueprint("manager", __name__)

from app.manager import routes  # noqa: E402, F401
