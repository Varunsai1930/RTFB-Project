"""
InvisiWork Backend — Pipeline Blueprint

Provides the Google Sheets → MongoDB data pipeline for Phase 2.
Includes the webhook ingest endpoint and Sheets polling scheduler.

Endpoints:
    POST /api/pipeline/ingest — Accept form submission data via webhook
"""

from flask import Blueprint

pipeline_bp = Blueprint("pipeline", __name__)

from app.pipeline import webhook  # noqa: E402, F401
