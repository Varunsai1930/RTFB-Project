"""
InvisiWork Backend — Manager API Routes

Team-wide analytics for managers. All routes are protected by
@require_auth and @require_manager decorators.

Endpoints:
    GET /api/manager/team           — List team developers with current-week metrics
    GET /api/manager/team/history   — Aggregated team metrics over past N weeks
    GET /api/manager/developer/<id> — Drill-down into one developer's data
"""

from datetime import datetime, timezone, timedelta

from flask import request, jsonify, g
from bson import ObjectId

from app.manager import manager_bp
from app.auth.utils import require_auth, require_manager
from app.extensions import mongo_db
from app.metrics.calculator import compute_all_metrics
from app.activities.models import get_activities


def _get_iso_week_bounds(target_date: datetime = None):
    """Return the Monday 00:00 and Sunday 23:59 of the ISO week containing target_date.

    Args:
        target_date: The reference date. Defaults to now (UTC).

    Returns:
        Tuple of (monday_datetime, sunday_datetime).
    """
    if not target_date:
        target_date = datetime.now(timezone.utc)

    start = target_date.replace(hour=0, minute=0, second=0, microsecond=0)
    monday = start - timedelta(days=start.weekday())
    sunday = monday + timedelta(days=6, hours=23, minutes=59, seconds=59)
    return monday, sunday


def _risk_level(bcs: float) -> str:
    """Derive burnout risk level from BCS score.

    Args:
        bcs: Burnout Correlation Score (0-100).

    Returns:
        'low', 'moderate', or 'high'.
    """
    if bcs < 40:
        return "low"
    elif bcs <= 70:
        return "moderate"
    else:
        return "high"


def _get_or_compute_metrics(user_id: str, monday: datetime, sunday: datetime) -> dict:
    """Fetch cached metrics for a user/week, or compute fresh if missing.

    Args:
        user_id: String ObjectId of the developer.
        monday: Start of ISO week (Monday 00:00).
        sunday: End of ISO week (Sunday 23:59).

    Returns:
        Dict with iwr, bcs, pii, total_hours, invisible_hours, visible_hours,
        total_activities keys.
    """
    cached = mongo_db.metrics_cache.find_one({
        "user_id": ObjectId(user_id),
        "week_start": monday
    })

    if cached:
        return {
            "iwr": cached.get("iwr", 0.0),
            "bcs": cached.get("bcs", 0.0),
            "pii": cached.get("pii", 0.0),
            "total_hours": cached.get("total_hours", 0.0),
            "invisible_hours": cached.get("invisible_hours", 0.0),
            "visible_hours": cached.get("visible_hours", 0.0),
            "total_activities": cached.get("total_activities", 0),
        }

    # Cache miss — compute fresh
    activities, _ = get_activities(user_id, start_date=monday, end_date=sunday, limit=500)
    computed = compute_all_metrics(activities)

    # Upsert into cache for future reads
    now = datetime.now(timezone.utc)
    mongo_db.metrics_cache.update_one(
        {"user_id": ObjectId(user_id), "week_start": monday},
        {"$set": {**computed, "computed_at": now}},
        upsert=True
    )

    return computed


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/manager/team
# ─────────────────────────────────────────────────────────────────────────────

@manager_bp.route("/team", methods=["GET"])
@require_auth
@require_manager
def get_team():
    """Return all developers in the manager's team with current-week metrics.

    Each developer entry includes: user_id, name, email, iwr, bcs, pii,
    total_hours, and risk_level (derived from BCS).

    Returns:
        200: { team: [...], team_size: int }
        401: Missing or invalid token
        403: Not a manager
    """
    manager_id = g.current_user["sub"]

    # Find the team this manager owns
    team = mongo_db.teams.find_one({"manager_id": manager_id})

    if not team:
        # Manager has no team yet — return empty array
        return jsonify({"team": [], "team_size": 0}), 200

    team_code = team.get("code")
    team_name = team.get("name", "My Team")

    # Find all developers in this team
    developers = list(mongo_db.users.find(
        {"team_id": team_code, "role": "developer"},
        {"password_hash": 0}
    ))

    now = datetime.now(timezone.utc)
    monday, sunday = _get_iso_week_bounds(now)

    result = []
    for dev in developers:
        dev_id = str(dev["_id"])
        metrics = _get_or_compute_metrics(dev_id, monday, sunday)

        result.append({
            "user_id": dev_id,
            "name": dev.get("name", ""),
            "email": dev.get("email", ""),
            "iwr": round(metrics.get("iwr", 0), 1),
            "bcs": round(metrics.get("bcs", 0), 1),
            "pii": round(metrics.get("pii", 0), 1),
            "total_hours": round(metrics.get("total_hours", 0), 1),
            "invisible_hours": round(metrics.get("invisible_hours", 0), 1),
            "total_activities": metrics.get("total_activities", 0),
            "risk_level": _risk_level(metrics.get("bcs", 0)),
        })

    return jsonify({
        "team": result,
        "team_name": team_name,
        "team_code": team_code,
        "team_size": len(result),
    }), 200


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/manager/team/history?weeks=8
# ─────────────────────────────────────────────────────────────────────────────

@manager_bp.route("/team/history", methods=["GET"])
@require_auth
@require_manager
def get_team_history():
    """Return aggregated team metrics per week for the last N weeks.

    For each week, returns the average IWR, BCS, PII across all team
    members, plus risk level distribution counts.

    Query params:
        weeks (int): Number of weeks to look back. Default 8, max 52.

    Returns:
        200: { history: [...] }
        400: Invalid weeks parameter
        401/403: Auth errors
    """
    manager_id = g.current_user["sub"]

    # Validate weeks param
    try:
        weeks = int(request.args.get("weeks", 8))
        if weeks < 1 or weeks > 52:
            return jsonify({"error": "invalid_weeks", "message": "weeks must be between 1 and 52"}), 400
    except ValueError:
        return jsonify({"error": "invalid_pagination", "message": "weeks param must be integer"}), 400

    # Find team
    team = mongo_db.teams.find_one({"manager_id": manager_id})
    if not team:
        return jsonify({"history": []}), 200

    team_code = team.get("code")

    # Get all developer user_ids in this team
    dev_docs = list(mongo_db.users.find(
        {"team_id": team_code, "role": "developer"},
        {"_id": 1}
    ))
    dev_ids = [doc["_id"] for doc in dev_docs]

    if not dev_ids:
        return jsonify({"history": []}), 200

    now = datetime.now(timezone.utc)
    current_monday, _ = _get_iso_week_bounds(now)

    history = []

    for i in range(weeks):
        week_monday = current_monday - timedelta(weeks=i)
        week_label = week_monday.strftime("%Y-%m-%d")

        # Fetch metrics_cache entries for all devs for this week
        cached_docs = list(mongo_db.metrics_cache.find({
            "user_id": {"$in": dev_ids},
            "week_start": week_monday
        }))

        if cached_docs:
            iwrs = [d.get("iwr", 0) for d in cached_docs]
            bcss = [d.get("bcs", 0) for d in cached_docs]
            piis = [d.get("pii", 0) for d in cached_docs]
            hours = [d.get("total_hours", 0) for d in cached_docs]

            avg_iwr = round(sum(iwrs) / len(iwrs), 1)
            avg_bcs = round(sum(bcss) / len(bcss), 1)
            avg_pii = round(sum(piis) / len(piis), 1)
            avg_hours = round(sum(hours) / len(hours), 1)

            high_risk = sum(1 for b in bcss if b > 70)
            moderate_risk = sum(1 for b in bcss if 40 <= b <= 70)
            low_risk = sum(1 for b in bcss if b < 40)
        else:
            avg_iwr = avg_bcs = avg_pii = avg_hours = 0.0
            high_risk = moderate_risk = low_risk = 0

        history.append({
            "week_start": week_label,
            "avg_iwr": avg_iwr,
            "avg_bcs": avg_bcs,
            "avg_pii": avg_pii,
            "avg_hours": avg_hours,
            "high_risk_count": high_risk,
            "moderate_risk_count": moderate_risk,
            "low_risk_count": low_risk,
            "devs_with_data": len(cached_docs),
            "total_devs": len(dev_ids),
        })

    # Return oldest-first ordering
    history.reverse()

    return jsonify({"history": history}), 200


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/manager/developer/<user_id>
# ─────────────────────────────────────────────────────────────────────────────

@manager_bp.route("/developer/<user_id>", methods=["GET"])
@require_auth
@require_manager
def get_developer_detail(user_id):
    """Return detailed view of a single developer — 8 weeks of metrics + 50 activities.

    The developer must belong to the manager's team. Returns 403 otherwise.

    Args:
        user_id: The developer's MongoDB ObjectId as a string (URL param).

    Returns:
        200: { user, metrics_history, recent_activities }
        403: Developer not in manager's team
        404: Developer not found
    """
    manager_id = g.current_user["sub"]

    # Validate ObjectId format
    if not ObjectId.is_valid(user_id):
        return jsonify({"error": "invalid_id", "message": "Invalid user ID format"}), 400

    # Find developer
    developer = mongo_db.users.find_one(
        {"_id": ObjectId(user_id)},
        {"password_hash": 0}
    )

    if not developer:
        return jsonify({"error": "not_found", "message": "Developer not found"}), 404

    # Verify developer is in the manager's team
    team = mongo_db.teams.find_one({"manager_id": manager_id})
    if not team:
        return jsonify({"error": "forbidden", "message": "You don't have a team"}), 403

    team_code = team.get("code")
    if developer.get("team_id") != team_code:
        return jsonify({"error": "forbidden", "message": "Developer is not in your team"}), 403

    # Build user info
    user_info = {
        "user_id": str(developer["_id"]),
        "name": developer.get("name", ""),
        "email": developer.get("email", ""),
        "role": developer.get("role", ""),
        "team_id": developer.get("team_id", ""),
        "created_at": developer["created_at"].isoformat() if developer.get("created_at") else None,
    }

    # Fetch last 8 weeks of metrics
    now = datetime.now(timezone.utc)
    current_monday, _ = _get_iso_week_bounds(now)

    metrics_history = []
    for i in range(8):
        week_monday = current_monday - timedelta(weeks=i)
        week_sunday = week_monday + timedelta(days=6, hours=23, minutes=59, seconds=59)
        metrics = _get_or_compute_metrics(user_id, week_monday, week_sunday)

        metrics_history.append({
            "week_start": week_monday.strftime("%Y-%m-%d"),
            "iwr": round(metrics.get("iwr", 0), 1),
            "bcs": round(metrics.get("bcs", 0), 1),
            "pii": round(metrics.get("pii", 0), 1),
            "total_hours": round(metrics.get("total_hours", 0), 1),
            "risk_level": _risk_level(metrics.get("bcs", 0)),
        })

    # Oldest-first
    metrics_history.reverse()

    # Fetch last 50 activities
    activities, _ = get_activities(user_id, limit=50)

    return jsonify({
        "user": user_info,
        "metrics_history": metrics_history,
        "recent_activities": activities,
    }), 200
