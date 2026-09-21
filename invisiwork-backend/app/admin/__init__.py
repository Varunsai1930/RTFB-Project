"""
InvisiWork Backend — Admin Routes

Provides read-only admin endpoints for viewing user and team data.
These are intended for supervisor demos and internal use.
All routes require authentication and manager role.

Endpoints:
    GET /api/admin/users       — List all users (no passwords)
    GET /api/admin/teams       — List all teams with member counts
    GET /api/admin/export/csv  — Download all users as CSV
"""

from datetime import datetime
import csv
import io

from flask import Blueprint, jsonify, make_response

from app.extensions import mongo_db
from app.auth.utils import require_auth, require_manager

admin_bp = Blueprint("admin", __name__)


@admin_bp.route("/users", methods=["GET"])
@require_auth
@require_manager
def list_users():
    """Return all users without sensitive fields.

    Requires: Valid JWT + manager role.

    Returns:
        200: { users: [...], total: int }
        401: Missing or invalid token
        403: Not a manager
    """
    users = list(mongo_db.users.find({}, {"password_hash": 0}))

    result = []
    for u in users:
        result.append({
            "user_id": str(u["_id"]),
            "name": u.get("name", ""),
            "email": u.get("email", ""),
            "role": u.get("role", ""),
            "team_id": u.get("team_id", None),
            "created_at": u["created_at"].isoformat() if u.get("created_at") else None,
            "last_login": u["last_login"].isoformat() if u.get("last_login") else None,
        })

    return jsonify({"users": result, "total": len(result)}), 200


@admin_bp.route("/teams", methods=["GET"])
@require_auth
@require_manager
def list_teams():
    """Return all teams with member counts.

    Requires: Valid JWT + manager role.

    Returns:
        200: { teams: [...], total: int }
        401: Missing or invalid token
        403: Not a manager
    """
    teams = list(mongo_db.teams.find({}))

    result = []
    for t in teams:
        member_count = mongo_db.users.count_documents({"team_id": t["code"]})
        manager = mongo_db.users.find_one(
            {"_id": __import__("bson").ObjectId(t["manager_id"])},
            {"password_hash": 0}
        )
        result.append({
            "team_id": str(t["_id"]),
            "name": t.get("name", ""),
            "code": t.get("code", ""),
            "manager_name": manager["name"] if manager else "Unknown",
            "manager_email": manager["email"] if manager else "",
            "member_count": member_count,
            "created_at": t["created_at"].isoformat() if t.get("created_at") else None,
        })

    return jsonify({"teams": result, "total": len(result)}), 200


@admin_bp.route("/export/csv", methods=["GET"])
@require_auth
@require_manager
def export_users_csv():
    """Export all users as a downloadable CSV file.

    Requires: Valid JWT + manager role.

    Returns:
        200: CSV file download
        401: Missing or invalid token
        403: Not a manager
    """
    users = list(mongo_db.users.find({}, {"password_hash": 0}))

    output = io.StringIO()
    writer = csv.writer(output)

    # Header row
    writer.writerow([
        "User ID", "Name", "Email", "Role", "Team Code",
        "Created At", "Last Login"
    ])

    for u in users:
        writer.writerow([
            str(u["_id"]),
            u.get("name", ""),
            u.get("email", ""),
            u.get("role", ""),
            u.get("team_id", ""),
            u["created_at"].strftime("%Y-%m-%d %H:%M:%S") if u.get("created_at") else "",
            u["last_login"].strftime("%Y-%m-%d %H:%M:%S") if u.get("last_login") else "",
        ])

    response = make_response(output.getvalue())
    response.headers["Content-Disposition"] = f"attachment; filename=invisiwork_users_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    response.headers["Content-Type"] = "text/csv"
    return response
