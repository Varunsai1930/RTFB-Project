"""
InvisiWork Backend — Auth Routes

Endpoints:
    POST /api/auth/register  — Create a new user account
    POST /api/auth/login     — Authenticate and receive JWT tokens
    POST /api/auth/refresh   — Refresh an expired access token
    POST /api/auth/logout    — Log out (client-side token discard)
    GET  /api/auth/me        — Get current user profile from token
"""

import re
from flask import request, jsonify, g

from pymongo.errors import DuplicateKeyError

from app.auth import auth_bp
from app.auth.models import (
    create_user,
    find_user_by_email,
    find_user_by_id,
    update_last_login,
    verify_password,
    _safe_user,
)
from app.auth.utils import generate_token, decode_token, require_auth
from app.extensions import mongo_db

import jwt as pyjwt


# ── Email validation regex ───────────────────────────────────────────────────
EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")


@auth_bp.route("/register", methods=["POST"])
def register():
    """Register a new user account.

    Request body:
        { name: str, email: str, password: str, role: str, team_id?: str }

    Returns:
        201: { message: "Account created" }
        400: Missing required fields
        409: Email already exists
        422: Invalid field values (email format, password length, role)
    """
    data = request.get_json(silent=True)
    if not data:
        return (
            jsonify({"error": "bad_request", "message": "Request body must be JSON"}),
            400,
        )

    # ── Validate required fields ─────────────────────────────────────────
    required = ["name", "email", "password", "role"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return (
            jsonify({
                "error": "bad_request",
                "message": f"Missing required fields: {', '.join(missing)}",
            }),
            400,
        )

    name = data["name"].strip()
    email = data["email"].strip().lower()
    password = data["password"]
    role = data["role"].strip().lower()

    # ── Validate email format ────────────────────────────────────────────
    if not EMAIL_REGEX.match(email):
        return (
            jsonify({"error": "invalid_email", "message": "Invalid email format"}),
            422,
        )

    # ── Validate password strength ──────────────────────────────────────
    pw_errors = []
    if len(password) < 8:
        pw_errors.append("at least 8 characters")
    if not re.search(r"[A-Z]", password):
        pw_errors.append("one uppercase letter")
    if not re.search(r"[0-9]", password):
        pw_errors.append("one number")
    if not re.search(r"[!@#$%^&*()_+\-=\[\]{}|;:'\",.<>?/\\`~]", password):
        pw_errors.append("one special character")
    if pw_errors:
        return (
            jsonify({
                "error": "invalid_password",
                "message": f"Password must contain: {', '.join(pw_errors)}",
            }),
            422,
        )

    # ── Validate role ────────────────────────────────────────────────────
    if role not in ("developer", "manager"):
        return (
            jsonify({
                "error": "invalid_role",
                "message": "Role must be 'developer' or 'manager'",
            }),
            422,
        )

    # ── Validate team_id for developers ──────────────────────────────────
    team_id = data.get("team_id")
    if role == "developer" and team_id:
        # Verify the team_id corresponds to a manager account
        manager = find_user_by_id(team_id)
        if not manager or manager.get("role") != "manager":
            return (
                jsonify({
                    "error": "invalid_team",
                    "message": "Invalid team ID — must be a valid manager account",
                }),
                422,
            )

    # ── Create user ──────────────────────────────────────────────────────
    try:
        create_user(name=name, email=email, password=password, role=role, team_id=team_id)
    except DuplicateKeyError:
        return (
            jsonify({
                "error": "email_exists",
                "message": "An account with this email already exists",
            }),
            409,
        )

    return jsonify({"message": "Account created"}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    """Authenticate a user and return JWT tokens.

    Request body:
        { email: str, password: str }

    Returns:
        200: { access_token, refresh_token, user: { name, email, role } }
        400: Missing required fields
        401: Invalid credentials (generic message — never reveal which field is wrong)
    """
    data = request.get_json(silent=True)
    if not data:
        return (
            jsonify({"error": "bad_request", "message": "Request body must be JSON"}),
            400,
        )

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return (
            jsonify({
                "error": "bad_request",
                "message": "Email and password are required",
            }),
            400,
        )

    # ── Find user by email ───────────────────────────────────────────────
    user = find_user_by_email(email)
    if not user:
        return (
            jsonify({
                "error": "invalid_credentials",
                "message": "Invalid email or password",
            }),
            401,
        )

    # ── Verify password ──────────────────────────────────────────────────
    if not verify_password(user["password_hash"], password):
        return (
            jsonify({
                "error": "invalid_credentials",
                "message": "Invalid email or password",
            }),
            401,
        )

    # ── Generate tokens ──────────────────────────────────────────────────
    user_id_str = str(user["_id"])
    access_token = generate_token(user_id_str, user["role"], user["name"], "access")
    refresh_token = generate_token(user_id_str, user["role"], user["name"], "refresh")

    # ── Update last login ────────────────────────────────────────────────
    update_last_login(user["_id"])

    return (
        jsonify({
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "name": user["name"],
                "email": user["email"],
                "role": user["role"],
            },
        }),
        200,
    )


@auth_bp.route("/refresh", methods=["POST"])
def refresh():
    """Refresh an expired access token using a valid refresh token.

    Headers:
        Authorization: Bearer <refresh_token>

    Returns:
        200: { access_token }
        401: Invalid or expired refresh token, or token is not a refresh type
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return (
            jsonify({"error": "token_missing", "message": "Authorization header is required"}),
            401,
        )

    parts = auth_header.split(" ")
    if len(parts) != 2 or parts[0] != "Bearer":
        return (
            jsonify({"error": "token_invalid", "message": "Authorization header must be: Bearer <token>"}),
            401,
        )

    token = parts[1]

    try:
        payload = decode_token(token)
    except pyjwt.ExpiredSignatureError:
        return (
            jsonify({"error": "token_expired", "message": "Refresh token has expired"}),
            401,
        )
    except pyjwt.InvalidTokenError:
        return (
            jsonify({"error": "token_invalid", "message": "Invalid refresh token"}),
            401,
        )

    # ── Confirm this is a refresh token ──────────────────────────────────
    if payload.get("type") != "refresh":
        return (
            jsonify({"error": "token_invalid", "message": "Token is not a refresh token"}),
            401,
        )

    # ── Issue new access token ───────────────────────────────────────────
    new_access_token = generate_token(
        payload["sub"], payload["role"], payload["name"], "access"
    )

    return jsonify({"access_token": new_access_token}), 200


@auth_bp.route("/logout", methods=["POST"])
@require_auth
def logout():
    """Log out the current user.

    In Phase 1, this is a no-op on the server side. The frontend discards
    both tokens from memory. Token blocklist is a Phase 3 hardening task.

    Returns:
        200: { message: "Logged out" }
    """
    return jsonify({"message": "Logged out"}), 200


@auth_bp.route("/me", methods=["GET"])
@require_auth
def me():
    """Get the current authenticated user's profile.

    Decodes the access token and returns the user info.

    Returns:
        200: { user_id, name, email, role }
        401: Invalid or expired token
    """
    user = find_user_by_id(g.current_user["sub"])
    if not user:
        return (
            jsonify({"error": "not_found", "message": "User not found"}),
            404,
        )

    return (
        jsonify({
            "user_id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "team_id": user.get("team_id"),
        }),
        200,
    )


# ── Team Endpoints ───────────────────────────────────────────────────────────

@auth_bp.route("/create-team", methods=["POST"])
@require_auth
def create_team_route():
    """Create a new team. Only managers can create teams.

    Request body:
        { name: str }

    Returns:
        201: { team_id, name, code, manager_id }
        400: Missing team name
        403: Only managers can create teams
        409: Manager already has a team
    """
    if g.current_user.get("role") != "manager":
        return (
            jsonify({"error": "forbidden", "message": "Only managers can create teams"}),
            403,
        )

    data = request.get_json(silent=True)
    if not data or not data.get("name"):
        return (
            jsonify({"error": "bad_request", "message": "Team name is required"}),
            400,
        )

    from app.auth.teams import create_team, find_team_by_manager

    # Check if manager already has a team
    existing = find_team_by_manager(g.current_user["sub"])
    if existing:
        from app.auth.teams import _safe_team
        return (
            jsonify({
                "error": "team_exists",
                "message": "You already have a team",
                "team": _safe_team(existing),
            }),
            409,
        )

    team = create_team(name=data["name"], manager_id=g.current_user["sub"])
    return jsonify(team), 201


@auth_bp.route("/join-team", methods=["POST"])
@require_auth
def join_team_route():
    """Join a team using a team code.

    Request body:
        { code: str }

    Returns:
        200: { message, team_name, team_code }
        400: Missing code
        404: Invalid team code
        409: Already in a team
    """
    data = request.get_json(silent=True)
    if not data or not data.get("code"):
        return (
            jsonify({"error": "bad_request", "message": "Team code is required"}),
            400,
        )

    code = data["code"].strip().upper()
    user_id = g.current_user["sub"]

    # Check if already in a team
    user = find_user_by_id(user_id)
    if user and user.get("team_id"):
        return (
            jsonify({"error": "already_in_team", "message": "You are already in a team"}),
            409,
        )

    from app.auth.teams import find_team_by_code

    team = find_team_by_code(code)
    if not team:
        return (
            jsonify({"error": "invalid_code", "message": "Invalid team code. Please check and try again."}),
            404,
        )

    # Update user's team_id to the team code
    from bson import ObjectId
    oid = ObjectId(user_id) if isinstance(user_id, str) else user_id
    mongo_db.users.update_one(
        {"_id": oid},
        {"$set": {"team_id": team["code"]}}
    )

    return jsonify({
        "message": "Successfully joined team",
        "team_name": team["name"],
        "team_code": team["code"],
    }), 200


@auth_bp.route("/my-team", methods=["GET"])
@require_auth
def my_team_route():
    """Get the current user's team info.

    Returns:
        200: { team_name, team_code, manager_name, members: [...] }
        404: User is not in any team
    """
    user = find_user_by_id(g.current_user["sub"])
    if not user or not user.get("team_id"):
        return (
            jsonify({"error": "no_team", "message": "You are not in any team yet"}),
            404,
        )

    from app.auth.teams import find_team_by_code, get_team_members

    team = find_team_by_code(user["team_id"])
    if not team:
        return (
            jsonify({"error": "team_not_found", "message": "Team not found"}),
            404,
        )

    manager = find_user_by_id(team["manager_id"])
    members = get_team_members(team["code"])

    return jsonify({
        "team_name": team["name"],
        "team_code": team["code"],
        "manager_name": manager["name"] if manager else "Unknown",
        "members": [{"name": m["name"], "email": m["email"], "role": m.get("role")} for m in members],
    }), 200

