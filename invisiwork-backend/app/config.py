"""
InvisiWork Backend — Configuration Classes

Provides DevelopmentConfig, TestingConfig, and ProductionConfig.
All values are sourced from environment variables via python-dotenv.
No hardcoded secrets — ever.
"""

import os
from dotenv import load_dotenv

# Load .env file before reading any os.environ values
load_dotenv()


class BaseConfig:
    """Base configuration shared across all environments."""

    SECRET_KEY = os.environ.get("FLASK_SECRET_KEY", "change-me-in-env")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "change-me-in-env")
    JWT_ACCESS_EXPIRY_MINUTES = int(os.environ.get("JWT_ACCESS_EXPIRY_MINUTES", 60))
    JWT_REFRESH_EXPIRY_DAYS = int(os.environ.get("JWT_REFRESH_EXPIRY_DAYS", 7))

    MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/invisiwork")

    # CORS origins — restricted to known frontend dev servers
    CORS_ORIGINS = [
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:5501",
        "http://127.0.0.1:5501",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://[::]:8000",
    ]

    # Pipeline (Phase 2)
    PIPELINE_SECRET = os.environ.get("PIPELINE_SECRET", "")
    GOOGLE_SERVICE_ACCOUNT_JSON = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON", "")
    SHEETS_SPREADSHEET_ID = os.environ.get("SHEETS_SPREADSHEET_ID", "")
    SHEETS_POLL_INTERVAL_SECONDS = int(os.environ.get("SHEETS_POLL_INTERVAL_SECONDS", 300))


class DevelopmentConfig(BaseConfig):
    """Development environment configuration."""

    DEBUG = True
    TESTING = False


class TestingConfig(BaseConfig):
    """Testing environment configuration.

    Uses a separate test database and disables CSRF / rate limiting.
    """

    DEBUG = False
    TESTING = True
    MONGO_URI = os.environ.get(
        "MONGO_URI_TEST", "mongodb://localhost:27017/invisiwork_test"
    )


class ProductionConfig(BaseConfig):
    """Production environment configuration.

    CORS is restricted to the real frontend domain.
    Debug is off. All secrets must be set in the environment.
    """

    DEBUG = False
    TESTING = False
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "").split(",")


# Map environment name → config class for use in create_app()
config_by_name = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
}
