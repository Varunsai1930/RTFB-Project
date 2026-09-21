"""
InvisiWork Backend — Pipeline Tests

Tests the POST /api/pipeline/ingest endpoint with:
- Valid payloads creating activities
- Missing/wrong X-Pipeline-Secret returns 401
- Unknown email returns 404
- Invalid category returns 422
- Duplicate detection returns 200 with { duplicate: true }
- Missing required fields return 400

Run: python -m pytest tests/test_pipeline.py -v
"""

import pytest
from datetime import datetime, timezone, timedelta
from unittest.mock import patch

from bson import ObjectId

from app import create_app
from app import extensions


# ── Fixtures ─────────────────────────────────────────────────────────────────

@pytest.fixture
def app():
    """Create a test Flask app with mongomock database."""
    import mongomock
    client = mongomock.MongoClient()
    db = client["invisiwork_test"]
    extensions.mongo_client = client
    extensions.mongo_db = db

    app = create_app("testing")

    # Override config for pipeline
    app.config["PIPELINE_SECRET"] = "test-secret-12345"

    # Create indexes
    app._create_indexes()

    yield app


@pytest.fixture
def client(app):
    """Test client for making HTTP requests."""
    return app.test_client()


@pytest.fixture
def seed_user(app):
    """Insert a test developer user into the database."""
    user_id = ObjectId()
    extensions.mongo_db.users.insert_one({
        "_id": user_id,
        "name": "Test Developer",
        "email": "dev@example.com",
        "role": "developer",
        "team_id": "TEAM1",
        "password_hash": b"fakehash",
        "created_at": datetime.now(timezone.utc),
    })
    return str(user_id)


# ── Helper ───────────────────────────────────────────────────────────────────

def _valid_payload():
    """Return a valid ingest payload."""
    return {
        "email": "dev@example.com",
        "date": "2025-03-18",
        "category": "Code Review",
        "duration_min": 45,
        "description": "Reviewed auth module PR",
    }


def _headers(secret="test-secret-12345"):
    """Return headers with the pipeline secret."""
    return {
        "Content-Type": "application/json",
        "X-Pipeline-Secret": secret,
    }


# ── Tests ────────────────────────────────────────────────────────────────────

class TestPipelineIngest:
    """Tests for POST /api/pipeline/ingest."""

    def test_valid_payload_creates_activity_returns_201(self, client, seed_user):
        """A valid payload should insert an activity and return 201."""
        resp = client.post(
            "/api/pipeline/ingest",
            json=_valid_payload(),
            headers=_headers(),
        )
        assert resp.status_code == 201
        data = resp.get_json()
        assert "activity_id" in data
        assert data["work_type"] == "invisible"

    def test_created_activity_has_google_form_source(self, client, seed_user):
        """Activities ingested via pipeline should have source 'google_form'."""
        client.post(
            "/api/pipeline/ingest",
            json=_valid_payload(),
            headers=_headers(),
        )
        activity = extensions.mongo_db.activities.find_one({"source": "google_form"})
        assert activity is not None
        assert activity["category"] == "Code Review"

    def test_visible_category_returns_visible_work_type(self, client, seed_user):
        """A visible category should be classified as visible."""
        payload = _valid_payload()
        payload["category"] = "Feature Development"
        resp = client.post(
            "/api/pipeline/ingest",
            json=payload,
            headers=_headers(),
        )
        assert resp.status_code == 201
        assert resp.get_json()["work_type"] == "visible"

    def test_missing_secret_returns_401(self, client, seed_user):
        """Request without X-Pipeline-Secret should return 401."""
        resp = client.post(
            "/api/pipeline/ingest",
            json=_valid_payload(),
            headers={"Content-Type": "application/json"},
        )
        assert resp.status_code == 401
        assert resp.get_json()["error"] == "unauthorized"

    def test_wrong_secret_returns_401(self, client, seed_user):
        """Request with wrong X-Pipeline-Secret should return 401."""
        resp = client.post(
            "/api/pipeline/ingest",
            json=_valid_payload(),
            headers=_headers("wrong-secret"),
        )
        assert resp.status_code == 401

    def test_unknown_email_returns_404(self, client, seed_user):
        """Email not found in users collection should return 404."""
        payload = _valid_payload()
        payload["email"] = "nobody@example.com"
        resp = client.post(
            "/api/pipeline/ingest",
            json=payload,
            headers=_headers(),
        )
        assert resp.status_code == 404
        assert resp.get_json()["error"] == "user_not_found"

    def test_invalid_category_returns_422(self, client, seed_user):
        """Unknown category should return 422 (pipeline enforces strict categories)."""
        payload = _valid_payload()
        payload["category"] = "Cooking Lunch"
        resp = client.post(
            "/api/pipeline/ingest",
            json=payload,
            headers=_headers(),
        )
        assert resp.status_code == 422
        assert resp.get_json()["error"] == "invalid_category"

    def test_missing_required_field_returns_400(self, client, seed_user):
        """Missing a required field should return 400."""
        payload = _valid_payload()
        del payload["category"]
        resp = client.post(
            "/api/pipeline/ingest",
            json=payload,
            headers=_headers(),
        )
        assert resp.status_code == 400
        assert "category" in resp.get_json()["message"]

    def test_invalid_duration_returns_422(self, client, seed_user):
        """Duration outside 1-480 range should return 422."""
        payload = _valid_payload()
        payload["duration_min"] = 0
        resp = client.post(
            "/api/pipeline/ingest",
            json=payload,
            headers=_headers(),
        )
        assert resp.status_code == 422
        assert resp.get_json()["error"] == "invalid_duration"

    def test_duplicate_detection_returns_200(self, client, seed_user):
        """Posting the same activity twice within 5 minutes should return duplicate."""
        client.post(
            "/api/pipeline/ingest",
            json=_valid_payload(),
            headers=_headers(),
        )
        # Second identical request
        resp = client.post(
            "/api/pipeline/ingest",
            json=_valid_payload(),
            headers=_headers(),
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["duplicate"] is True

    def test_case_insensitive_category_match(self, client, seed_user):
        """Category matching should be case-insensitive."""
        payload = _valid_payload()
        payload["category"] = "code review"  # lowercase
        resp = client.post(
            "/api/pipeline/ingest",
            json=payload,
            headers=_headers(),
        )
        assert resp.status_code == 201

    def test_invalidates_metrics_cache(self, client, seed_user):
        """Ingesting an activity should clear the metrics cache for that week."""
        # Seed a metrics cache entry for the test week
        monday = datetime(2025, 3, 17, tzinfo=timezone.utc)
        extensions.mongo_db.metrics_cache.insert_one({
            "user_id": ObjectId(seed_user),
            "week_start": monday,
            "iwr": 50.0,
            "computed_at": datetime.now(timezone.utc),
        })

        # Ingest an activity on 2025-03-18 (Tuesday of that week)
        client.post(
            "/api/pipeline/ingest",
            json=_valid_payload(),
            headers=_headers(),
        )

        # Cache should be gone
        cached = extensions.mongo_db.metrics_cache.find_one({
            "user_id": ObjectId(seed_user),
            "week_start": monday,
        })
        assert cached is None

    def test_no_json_body_returns_400(self, client, seed_user):
        """Request without JSON body should return 400."""
        resp = client.post(
            "/api/pipeline/ingest",
            data="not json",
            headers=_headers(),
        )
        assert resp.status_code == 400
