from __future__ import annotations

"""
InvisiWork Backend — User Document Schema Helpers

Provides helper functions for creating and querying user documents in MongoDB.
No ORM — just dict helpers following the document schema:

    {
        "_id":           ObjectId,
        "email":         String (unique, indexed),
        "password_hash": String (bcrypt),
        "name":          String,
        "role":          "developer" | "manager",
        "team_id":       String (optional),
        "created_at":    ISODate,
        "last_login":    ISODate
    }
"""

from datetime import datetime, timezone

import bcrypt

from app.extensions import mongo_db


def create_user(name: str, email: str, password: str, role: str, team_id: str = None) -> dict:
    """Create a new user document and insert it into MongoDB.

    Args:
        name: Display name of the user.
        email: Unique email address (will be lowercased).
        password: Plain-text password (will be hashed with bcrypt, cost factor 12).
        role: Either 'developer' or 'manager'.
        team_id: Optional team identifier (manager's user_id for developers).

    Returns:
        The inserted user document dict (without password_hash).

    Raises:
        pymongo.errors.DuplicateKeyError: If email already exists.
    """
    password_hash = bcrypt.hashpw(
        password.encode("utf-8"), bcrypt.gensalt(rounds=12)
    ).decode("utf-8")

    now = datetime.now(timezone.utc)

    user_doc = {
        "email": email.strip().lower(),
        "password_hash": password_hash,
        "name": name.strip(),
        "role": role,
        "team_id": team_id,
        "created_at": now,
        "last_login": None,
    }

    result = mongo_db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id

    # Return a safe copy (no password hash)
    return _safe_user(user_doc)


def find_user_by_email(email: str) -> dict | None:
    """Look up a user document by email address.

    Args:
        email: Email to search for (case-insensitive).

    Returns:
        Full user document dict (including password_hash) or None if not found.
    """
    return mongo_db.users.find_one({"email": email.strip().lower()})


def find_user_by_id(user_id) -> dict | None:
    """Look up a user document by its MongoDB ObjectId.

    Args:
        user_id: ObjectId or string representation of the user's _id.

    Returns:
        Full user document dict or None if not found.
    """
    from bson import ObjectId

    if isinstance(user_id, str):
        user_id = ObjectId(user_id)

    return mongo_db.users.find_one({"_id": user_id})


def update_last_login(user_id) -> None:
    """Update the user's last_login timestamp to now.

    Args:
        user_id: ObjectId of the user.
    """
    from bson import ObjectId

    if isinstance(user_id, str):
        user_id = ObjectId(user_id)

    mongo_db.users.update_one(
        {"_id": user_id},
        {"$set": {"last_login": datetime.now(timezone.utc)}},
    )


def verify_password(stored_hash: str, password: str) -> bool:
    """Verify a plain-text password against a bcrypt hash.

    Args:
        stored_hash: The bcrypt hash from the user document.
        password: The plain-text password to verify.

    Returns:
        True if the password matches, False otherwise.
    """
    return bcrypt.checkpw(
        password.encode("utf-8"), stored_hash.encode("utf-8")
    )


def _safe_user(user_doc: dict) -> dict:
    """Return a copy of the user document without sensitive fields.

    Strips password_hash and converts _id to string for JSON serialization.

    Args:
        user_doc: Raw MongoDB user document.

    Returns:
        Sanitized user dict safe for API responses.
    """
    return {
        "user_id": str(user_doc["_id"]),
        "name": user_doc["name"],
        "email": user_doc["email"],
        "role": user_doc["role"],
        "team_id": user_doc.get("team_id"),
        "created_at": user_doc["created_at"].isoformat() if user_doc.get("created_at") else None,
    }
