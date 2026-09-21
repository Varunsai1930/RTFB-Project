"""
InvisiWork Backend — Auth Utilities

JWT token generation, decoding, and route protection decorators.

- generate_token(): Creates signed JWTs with configurable expiry.
- decode_token(): Verifies and decodes a JWT.
- require_auth: Decorator that enforces valid JWT on protected routes.
- require_manager: Decorator that enforces manager role after auth.

Token payload contains ONLY: sub (user_id), role, name, type, iat, exp.
No email, no password hash — ever.
"""

from datetime import datetime, timedelta, timezone
from functools import wraps

import jwt
from flask import request, jsonify, g, current_app


def generate_token(user_id: str, role: str, name: str, token_type: str = "access") -> str:
    """Generate a signed JWT token.

    Args:
        user_id: The user's MongoDB ObjectId as a string (becomes 'sub' claim).
        role: User role ('developer' or 'manager').
        name: User display name.
        token_type: Either 'access' or 'refresh'.

    Returns:
        Encoded JWT string.
    """
    now = datetime.now(timezone.utc)

    if token_type == "access":
        expiry_minutes = current_app.config["JWT_ACCESS_EXPIRY_MINUTES"]
        exp = now + timedelta(minutes=expiry_minutes)
    elif token_type == "refresh":
        expiry_days = current_app.config["JWT_REFRESH_EXPIRY_DAYS"]
        exp = now + timedelta(days=expiry_days)
    else:
        raise ValueError(f"Invalid token_type: {token_type}")

    payload = {
        "sub": user_id,
        "role": role,
        "name": name,
        "type": token_type,
        "iat": now,
        "exp": exp,
    }

    return jwt.encode(
        payload,
        current_app.config["JWT_SECRET_KEY"],
        algorithm="HS256",
    )


def decode_token(token: str) -> dict:
    """Decode and verify a JWT token.

    Args:
        token: The encoded JWT string.

    Returns:
        Decoded payload dict.

    Raises:
        jwt.ExpiredSignatureError: If the token has expired.
        jwt.InvalidTokenError: If the token is malformed or signature is invalid.
    """
    return jwt.decode(
        token,
        current_app.config["JWT_SECRET_KEY"],
        algorithms=["HS256"],
    )


def require_auth(f):
    """Decorator that protects a route with JWT authentication.

    Extracts the Authorization header, decodes the Bearer token, and sets
    flask.g.current_user to the decoded payload. Returns 401 JSON on failure.

    Usage:
        @app.route('/api/protected')
        @require_auth
        def my_route():
            user_id = g.current_user['sub']
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        # 1. Extract Authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return (
                jsonify({"error": "token_missing", "message": "Authorization header is required"}),
                401,
            )

        # 2. Strip "Bearer " prefix
        parts = auth_header.split(" ")
        if len(parts) != 2 or parts[0] != "Bearer":
            return (
                jsonify({"error": "token_invalid", "message": "Authorization header must be: Bearer <token>"}),
                401,
            )

        token = parts[1]

        # 3. Decode and verify
        try:
            payload = decode_token(token)
        except jwt.ExpiredSignatureError:
            return (
                jsonify({"error": "token_expired", "message": "Token has expired"}),
                401,
            )
        except jwt.InvalidTokenError:
            return (
                jsonify({"error": "token_invalid", "message": "Token is invalid"}),
                401,
            )

        # 4. Set current user on flask.g
        g.current_user = payload
        return f(*args, **kwargs)

    return decorated


def require_manager(f):
    """Decorator that restricts a route to manager-role users only.

    Must be used AFTER @require_auth so that g.current_user is available.

    Usage:
        @app.route('/api/manager/team')
        @require_auth
        @require_manager
        def manager_route():
            ...

    Returns 403 JSON if the authenticated user is not a manager.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        if g.current_user.get("role") != "manager":
            return (
                jsonify({"error": "forbidden", "message": "Manager access required"}),
                403,
            )
        return f(*args, **kwargs)

    return decorated
