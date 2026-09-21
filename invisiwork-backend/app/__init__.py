"""
InvisiWork Backend — Flask Application Factory

Creates and configures the Flask application. Registers blueprints, initializes
extensions, creates MongoDB indexes, and sets up global error handlers.
"""

import os
import logging

from flask import Flask, jsonify
from pymongo import MongoClient, ASCENDING, DESCENDING

from app.config import config_by_name
from app import extensions



def _create_indexes():
    """Create MongoDB indexes (idempotent). Called on startup and by test fixtures."""
    db = extensions.mongo_db
    db.users.create_index("email", unique=True)
    db.activities.create_index([("user_id", ASCENDING), ("date", DESCENDING)])
    db.metrics_cache.create_index(
        [("user_id", ASCENDING), ("week_start", DESCENDING)]
    )
    db.teams.create_index("code", unique=True)


def create_app(config_name=None):
    """Create and configure the Flask application.

    Args:
        config_name: One of 'development', 'testing', 'production'.
                     Defaults to FLASK_ENV environment variable or 'development'.

    Returns:
        Configured Flask application instance.
    """
    if config_name is None:
        config_name = os.environ.get("FLASK_ENV", "development")

    app = Flask(__name__)
    app.config.from_object(config_by_name[config_name])

    # ── Logging ──────────────────────────────────────────────────────────
    logging.basicConfig(
        level=logging.DEBUG if app.config["DEBUG"] else logging.INFO,
        format="[%(asctime)s] %(levelname)s in %(module)s: %(message)s",
    )

    # ── Initialize extensions ────────────────────────────────────────────
    # CORS
    extensions.cors.init_app(
        app,
        origins=app.config["CORS_ORIGINS"],
        methods=["GET", "POST", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
    )

    # MongoDB — skip connection in testing mode (test fixtures inject mongomock)
    if not app.config["TESTING"]:
        extensions.mongo_client = MongoClient(app.config["MONGO_URI"])
        db_name = app.config["MONGO_URI"].rsplit("/", 1)[-1].split("?")[0]
        extensions.mongo_db = extensions.mongo_client[db_name]
        _create_indexes()

    # Store app reference for deferred index creation in tests
    app._create_indexes = _create_indexes

    # ── Register blueprints ──────────────────────────────────────────────
    from app.auth import auth_bp
    from app.activities import activities_bp
    from app.metrics import metrics_bp
    from app.admin import admin_bp
    from app.manager import manager_bp
    from app.pipeline import pipeline_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(activities_bp, url_prefix="/api/activities")
    app.register_blueprint(metrics_bp, url_prefix="/api/metrics")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(manager_bp, url_prefix="/api/manager")
    app.register_blueprint(pipeline_bp, url_prefix="/api/pipeline")

    # ── Start background scheduler (Phase 2 — polling fallback) ──────────
    from app.pipeline.scheduler import init_scheduler
    init_scheduler(app)


    # ── Global error handlers ────────────────────────────────────────────
    @app.errorhandler(Exception)
    def handle_unexpected(e):
        """Catch all unhandled exceptions. Log the error, return a safe JSON response."""
        app.logger.error(f"Unhandled exception: {str(e)}")
        return (
            jsonify(
                {"error": "server_error", "message": "An unexpected error occurred"}
            ),
            500,
        )

    @app.errorhandler(404)
    def handle_not_found(e):
        """Return JSON instead of HTML for 404 errors."""
        return (
            jsonify({"error": "not_found", "message": "Resource not found"}),
            404,
        )

    @app.errorhandler(405)
    def handle_method_not_allowed(e):
        """Return JSON instead of HTML for 405 errors."""
        return (
            jsonify(
                {"error": "method_not_allowed", "message": "Method not allowed"}
            ),
            405,
        )

    # ── Health check endpoint ────────────────────────────────────────────
    @app.route("/api/health", methods=["GET"])
    def health_check():
        """Simple health check for monitoring and frontend connectivity tests."""
        return jsonify({"status": "ok", "service": "invisiwork-backend"}), 200

    app.logger.info(f"InvisiWork backend initialized [{config_name}]")
    return app
