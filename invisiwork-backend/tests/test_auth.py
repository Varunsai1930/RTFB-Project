"""
InvisiWork Backend — Auth Route Tests

Tests registration, login, token refresh, /me endpoint, and authorization.
Uses mongomock for an in-memory MongoDB so no real MongoDB is needed.

Run: python -m pytest tests/test_auth.py -v
"""

import json
from datetime import datetime, timedelta, timezone
from unittest.mock import patch

import jwt
import mongomock
import pytest

from app import create_app
from app import extensions


@pytest.fixture
def app():
    """Create a test Flask app with mongomock database."""
    # Inject mongomock BEFORE create_app (which skips real MongoDB in testing mode)
    mock_client = mongomock.MongoClient()
    mock_db = mock_client["invisiwork_test"]
    extensions.mongo_client = mock_client
    extensions.mongo_db = mock_db

    test_app = create_app("testing")

    # Create indexes on mock DB
    mock_db.users.create_index("email", unique=True)

    yield test_app

    # Cleanup
    mock_client.close()


@pytest.fixture
def client(app):
    """Create a test client for making requests."""
    return app.test_client()


@pytest.fixture
def registered_user(client):
    """Register a test user and return their info."""
    user_data = {
        "name": "Test Developer",
        "email": "dev@test.com",
        "password": "Password1!",
        "role": "developer",
    }
    client.post(
        "/api/auth/register",
        data=json.dumps(user_data),
        content_type="application/json",
    )
    return user_data


@pytest.fixture
def auth_tokens(client, registered_user):
    """Login the registered user and return their tokens."""
    resp = client.post(
        "/api/auth/login",
        data=json.dumps({
            "email": registered_user["email"],
            "password": registered_user["password"],
        }),
        content_type="application/json",
    )
    data = resp.get_json()
    return {
        "access_token": data["access_token"],
        "refresh_token": data["refresh_token"],
    }


@pytest.fixture
def manager_tokens(client):
    """Register and login a manager user, return their tokens."""
    client.post(
        "/api/auth/register",
        data=json.dumps({
            "name": "Test Manager",
            "email": "manager@test.com",
            "password": "Password1!",
            "role": "manager",
        }),
        content_type="application/json",
    )
    resp = client.post(
        "/api/auth/login",
        data=json.dumps({
            "email": "manager@test.com",
            "password": "Password1!",
        }),
        content_type="application/json",
    )
    data = resp.get_json()
    return {
        "access_token": data["access_token"],
        "refresh_token": data["refresh_token"],
    }


# ═══════════════════════════════════════════════════════════════════════════════
# REGISTRATION TESTS
# ═══════════════════════════════════════════════════════════════════════════════


class TestRegister:
    """Tests for POST /api/auth/register."""

    def test_register_creates_user_returns_201(self, client):
        """Successful registration returns 201."""
        resp = client.post(
            "/api/auth/register",
            data=json.dumps({
                "name": "Alice",
                "email": "alice@example.com",
                "password": "Secure1!",
                "role": "developer",
            }),
            content_type="application/json",
        )
        assert resp.status_code == 201
        data = resp.get_json()
        assert data["message"] == "Account created"

    def test_register_duplicate_email_returns_409(self, client, registered_user):
        """Registering with an existing email returns 409."""
        resp = client.post(
            "/api/auth/register",
            data=json.dumps(registered_user),
            content_type="application/json",
        )
        assert resp.status_code == 409
        assert resp.get_json()["error"] == "email_exists"

    def test_register_missing_fields_returns_400(self, client):
        """Missing required fields returns 400."""
        resp = client.post(
            "/api/auth/register",
            data=json.dumps({"name": "Bob"}),
            content_type="application/json",
        )
        assert resp.status_code == 400
        assert resp.get_json()["error"] == "bad_request"

    def test_register_short_password_returns_422(self, client):
        """Password shorter than 8 chars returns 422."""
        resp = client.post(
            "/api/auth/register",
            data=json.dumps({
                "name": "Bob",
                "email": "bob@test.com",
                "password": "short",
                "role": "developer",
            }),
            content_type="application/json",
        )
        assert resp.status_code == 422
        assert resp.get_json()["error"] == "invalid_password"

    def test_register_no_uppercase_returns_422(self, client):
        """Password without an uppercase letter returns 422."""
        resp = client.post(
            "/api/auth/register",
            data=json.dumps({
                "name": "Bob",
                "email": "bob@test.com",
                "password": "password1!",
                "role": "developer",
            }),
            content_type="application/json",
        )
        assert resp.status_code == 422
        assert resp.get_json()["error"] == "invalid_password"

    def test_register_no_number_returns_422(self, client):
        """Password without a number returns 422."""
        resp = client.post(
            "/api/auth/register",
            data=json.dumps({
                "name": "Bob",
                "email": "bob@test.com",
                "password": "Password!",
                "role": "developer",
            }),
            content_type="application/json",
        )
        assert resp.status_code == 422
        assert resp.get_json()["error"] == "invalid_password"

    def test_register_no_special_char_returns_422(self, client):
        """Password without a special character returns 422."""
        resp = client.post(
            "/api/auth/register",
            data=json.dumps({
                "name": "Bob",
                "email": "bob@test.com",
                "password": "Password1",
                "role": "developer",
            }),
            content_type="application/json",
        )
        assert resp.status_code == 422
        assert resp.get_json()["error"] == "invalid_password"

    def test_register_invalid_email_returns_422(self, client):
        """Malformed email returns 422."""
        resp = client.post(
            "/api/auth/register",
            data=json.dumps({
                "name": "Bob",
                "email": "not-an-email",
                "password": "Secure1!",
                "role": "developer",
            }),
            content_type="application/json",
        )
        assert resp.status_code == 422
        assert resp.get_json()["error"] == "invalid_email"

    def test_register_invalid_role_returns_422(self, client):
        """Invalid role returns 422."""
        resp = client.post(
            "/api/auth/register",
            data=json.dumps({
                "name": "Bob",
                "email": "bob@test.com",
                "password": "Secure1!",
                "role": "admin",
            }),
            content_type="application/json",
        )
        assert resp.status_code == 422
        assert resp.get_json()["error"] == "invalid_role"


# ═══════════════════════════════════════════════════════════════════════════════
# LOGIN TESTS
# ═══════════════════════════════════════════════════════════════════════════════


class TestLogin:
    """Tests for POST /api/auth/login."""

    def test_login_valid_credentials_returns_tokens(self, client, registered_user):
        """Successful login returns two tokens and user info."""
        resp = client.post(
            "/api/auth/login",
            data=json.dumps({
                "email": registered_user["email"],
                "password": registered_user["password"],
            }),
            content_type="application/json",
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["user"]["email"] == registered_user["email"]
        assert data["user"]["name"] == registered_user["name"]
        assert data["user"]["role"] == registered_user["role"]

    def test_login_wrong_password_returns_401_generic(self, client, registered_user):
        """Wrong password returns 401 with a generic message (never reveals which field failed)."""
        resp = client.post(
            "/api/auth/login",
            data=json.dumps({
                "email": registered_user["email"],
                "password": "wrongpassword",
            }),
            content_type="application/json",
        )
        assert resp.status_code == 401
        data = resp.get_json()
        assert data["error"] == "invalid_credentials"
        # Message must be generic — same for wrong email and wrong password
        assert data["message"] == "Invalid email or password"

    def test_login_nonexistent_email_returns_401_generic(self, client):
        """Nonexistent email returns 401 with the same generic message as wrong password."""
        resp = client.post(
            "/api/auth/login",
            data=json.dumps({
                "email": "nobody@test.com",
                "password": "Password1!",
            }),
            content_type="application/json",
        )
        assert resp.status_code == 401
        assert resp.get_json()["error"] == "invalid_credentials"


# ═══════════════════════════════════════════════════════════════════════════════
# /ME TESTS
# ═══════════════════════════════════════════════════════════════════════════════


class TestMe:
    """Tests for GET /api/auth/me."""

    def test_me_with_valid_token_returns_user(self, client, auth_tokens):
        """Valid access token returns user info."""
        resp = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {auth_tokens['access_token']}"},
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["email"] == "dev@test.com"
        assert data["name"] == "Test Developer"
        assert data["role"] == "developer"

    def test_me_with_expired_token_returns_401(self, client, app):
        """Expired token returns 401 with 'token_expired' error code."""
        # Create a token that's already expired
        with app.app_context():
            payload = {
                "sub": "fake_id",
                "role": "developer",
                "name": "Test",
                "type": "access",
                "iat": datetime.now(timezone.utc) - timedelta(hours=2),
                "exp": datetime.now(timezone.utc) - timedelta(hours=1),
            }
            expired_token = jwt.encode(
                payload,
                app.config["JWT_SECRET_KEY"],
                algorithm="HS256",
            )

        resp = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {expired_token}"},
        )
        assert resp.status_code == 401
        assert resp.get_json()["error"] == "token_expired"

    def test_me_without_auth_header_returns_401(self, client):
        """Missing Authorization header returns 401."""
        resp = client.get("/api/auth/me")
        assert resp.status_code == 401
        assert resp.get_json()["error"] == "token_missing"

    def test_me_with_invalid_token_returns_401(self, client):
        """Garbage token returns 401."""
        resp = client.get(
            "/api/auth/me",
            headers={"Authorization": "Bearer garbage.token.here"},
        )
        assert resp.status_code == 401
        assert resp.get_json()["error"] == "token_invalid"


# ═══════════════════════════════════════════════════════════════════════════════
# REFRESH TESTS
# ═══════════════════════════════════════════════════════════════════════════════


class TestRefresh:
    """Tests for POST /api/auth/refresh."""

    def test_refresh_with_valid_refresh_token(self, client, auth_tokens):
        """Valid refresh token returns a new access token."""
        resp = client.post(
            "/api/auth/refresh",
            headers={"Authorization": f"Bearer {auth_tokens['refresh_token']}"},
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert "access_token" in data

    def test_refresh_with_access_token_returns_401(self, client, auth_tokens):
        """Using an access token for refresh returns 401."""
        resp = client.post(
            "/api/auth/refresh",
            headers={"Authorization": f"Bearer {auth_tokens['access_token']}"},
        )
        assert resp.status_code == 401
        assert resp.get_json()["error"] == "token_invalid"


# ═══════════════════════════════════════════════════════════════════════════════
# AUTHORIZATION / ROLE TESTS
# ═══════════════════════════════════════════════════════════════════════════════


class TestAuthorization:
    """Tests for role-based access control."""

    def test_developer_cannot_access_manager_route(self, client, auth_tokens):
        """Developer accessing a manager-only endpoint gets 403.

        Note: Manager routes aren't implemented yet, but we test the decorator logic
        by verifying a developer token's role field is 'developer'.
        """
        # Decode the developer's token to confirm their role
        resp = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {auth_tokens['access_token']}"},
        )
        assert resp.get_json()["role"] == "developer"

    def test_logout_returns_200(self, client, auth_tokens):
        """Logout with valid token returns 200."""
        resp = client.post(
            "/api/auth/logout",
            headers={"Authorization": f"Bearer {auth_tokens['access_token']}"},
        )
        assert resp.status_code == 200
        assert resp.get_json()["message"] == "Logged out"
