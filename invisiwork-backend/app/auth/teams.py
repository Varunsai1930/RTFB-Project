from __future__ import annotations

"""
InvisiWork Backend — Team Document Schema Helpers

Provides helper functions for creating teams and joining via team codes.

Team document schema:
    {
        "_id":         ObjectId,
        "name":        String,
        "code":        String (unique, 6-char uppercase),
        "manager_id":  String (user_id of the manager who created it),
        "created_at":  ISODate
    }
"""

import random
import string
from datetime import datetime, timezone

from app.extensions import mongo_db


def _generate_code(length: int = 6) -> str:
    """Generate a random uppercase alphanumeric team code."""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))


def create_team(name: str, manager_id: str) -> dict:
    """Create a new team with a unique join code.

    Args:
        name: Display name of the team.
        manager_id: The user_id (string) of the manager creating the team.

    Returns:
        The inserted team document dict.
    """
    # Generate a unique code (retry on collision)
    for _ in range(10):
        code = _generate_code()
        if not mongo_db.teams.find_one({"code": code}):
            break

    team_doc = {
        "name": name.strip(),
        "code": code,
        "manager_id": manager_id,
        "created_at": datetime.now(timezone.utc),
    }

    result = mongo_db.teams.insert_one(team_doc)
    team_doc["_id"] = result.inserted_id

    return _safe_team(team_doc)


def find_team_by_code(code: str) -> dict | None:
    """Look up a team by its join code (case-insensitive).

    Args:
        code: The 6-character team code.

    Returns:
        Team document dict or None if not found.
    """
    return mongo_db.teams.find_one({"code": code.strip().upper()})


def find_team_by_manager(manager_id: str) -> dict | None:
    """Find the team owned by a specific manager.

    Args:
        manager_id: The user_id of the manager.

    Returns:
        Team document dict or None.
    """
    return mongo_db.teams.find_one({"manager_id": manager_id})


def get_team_members(team_code: str) -> list:
    """Get all users who belong to a team (by team code).

    Args:
        team_code: The team's join code.

    Returns:
        List of user dicts (without password hashes).
    """
    users = mongo_db.users.find(
        {"team_id": team_code.strip().upper()},
        {"password_hash": 0}
    )
    result = []
    for u in users:
        u["_id"] = str(u["_id"])
        result.append(u)
    return result


def _safe_team(team_doc: dict) -> dict:
    """Return a JSON-safe copy of a team document."""
    return {
        "team_id": str(team_doc["_id"]),
        "name": team_doc["name"],
        "code": team_doc["code"],
        "manager_id": team_doc["manager_id"],
        "created_at": team_doc["created_at"].isoformat() if team_doc.get("created_at") else None,
    }
