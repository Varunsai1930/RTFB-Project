"""
InvisiWork Backend — Activity Routes

Endpoints:
    POST   /api/activities       — Log a new activity
    GET    /api/activities       — List activities (with optional ?week filter)
    GET    /api/activities/<id>  — Get a single activity
    DELETE /api/activities/<id>  — Delete an activity
"""

from datetime import datetime, timezone, timedelta
from flask import request, jsonify, g

from app.activities import activities_bp
from app.activities.classifier import classify_activity, ALL_CATEGORIES
from app.activities.models import (
    create_activity,
    get_activities,
    find_activity_by_id,
    delete_activity,
    get_raw_activity_by_id
)
from app.auth.utils import require_auth
from app.extensions import mongo_db
from bson import ObjectId


def _invalidate_metrics_cache(user_id_str: str, activity_date: datetime):
    """Delete the metrics cache entry for the week containing activity_date."""
    # Find Monday at 00:00:00 of the activity's week
    monday = activity_date.replace(hour=0, minute=0, second=0, microsecond=0)
    monday -= timedelta(days=monday.weekday())
    
    mongo_db.metrics_cache.delete_many({
        "user_id": ObjectId(user_id_str),
        "week_start": monday
    })


@activities_bp.route("", methods=["POST"])
@require_auth
def log_activity():
    """Log a new activity.

    Request body:
        { category: str, duration_min: int, date: str (YYYY-MM-DD), description?: str }

    Returns:
        201: { activity_id, work_type, message }
        400: Missing/invalid fields
        422: Invalid category or duration
    """
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "bad_request", "message": "Request body must be JSON"}), 400

    required = ["category", "duration_min", "date"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({
            "error": "bad_request",
            "message": f"Missing required fields: {', '.join(missing)}"
        }), 400

    category = str(data["category"]).strip()
    
    # The classifier determines work_type: known visible categories → "visible",
    # everything else (known invisible + custom/unknown) → "invisible".
    work_type = classify_activity(category)

    try:
        duration_min = int(data["duration_min"])
        if not (1 <= duration_min <= 480):
            raise ValueError
    except ValueError:
        return jsonify({
            "error": "invalid_duration",
            "message": "duration_min must be an integer between 1 and 480"
        }), 422

    try:
        date_str = str(data["date"])
        if "T" in date_str:
            date_obj = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        else:
            date_obj = datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    except ValueError:
        return jsonify({
            "error": "invalid_date",
            "message": "Date must be valid ISO format or YYYY-MM-DD"
        }), 422

    description = data.get("description", "")

    user_id = g.current_user["sub"]
    
    activity = create_activity(
        user_id=user_id,
        date_obj=date_obj,
        category=category,
        work_type=work_type,
        duration_min=duration_min,
        description=description,
        source="manual"
    )

    _invalidate_metrics_cache(user_id, date_obj)

    return jsonify({
        "activity_id": activity["activity_id"],
        "work_type": work_type,
        "message": "Activity logged"
    }), 201


@activities_bp.route("", methods=["GET"])
@require_auth
def list_activities():
    """List activities for the current user.

    Query params:
        week: ISO week (e.g., 2025-W14)
        limit: int (default 50)
        offset: int (default 0)
    """
    user_id = g.current_user["sub"]
    week_param = request.args.get("week")
    
    try:
        limit = int(request.args.get("limit", 50))
        offset = int(request.args.get("offset", 0))
    except ValueError:
        return jsonify({"error": "invalid_pagination", "message": "limit and offset must be integers"}), 400

    start_date = None
    end_date = None

    if week_param:
        try:
            # Parse ISO week, e.g., "2025-W14". -1 gets Monday of that week.
            monday = datetime.strptime(f"{week_param}-1", "%G-W%V-%u").replace(tzinfo=timezone.utc)
            start_date = monday
            end_date = monday + timedelta(days=6, hours=23, minutes=59, seconds=59)
        except ValueError:
            return jsonify({
                "error": "invalid_week",
                "message": "Week must be in YYYY-WNN format (e.g. 2025-W14)"
            }), 400

    activities, total_count = get_activities(
        user_id=user_id,
        start_date=start_date,
        end_date=end_date,
        limit=limit,
        offset=offset
    )

    return jsonify({
        "activities": activities,
        "total": total_count
    }), 200


@activities_bp.route("/<activity_id>", methods=["GET"])
@require_auth
def get_activity(activity_id):
    """Get a single activity."""
    activity = find_activity_by_id(activity_id)
    if not activity:
        return jsonify({"error": "not_found", "message": "Activity not found"}), 404

    # Authorization
    if activity["user_id"] != g.current_user["sub"] and g.current_user.get("role") != "manager":
        return jsonify({"error": "forbidden", "message": "Access denied"}), 403

    return jsonify(activity), 200


@activities_bp.route("/<activity_id>", methods=["DELETE"])
@require_auth
def delete_activity_route(activity_id):
    """Delete an activity."""
    activity_doc = get_raw_activity_by_id(activity_id)
    if not activity_doc:
        return jsonify({"error": "not_found", "message": "Activity not found"}), 404

    # Authorization
    user_id = g.current_user["sub"]
    if str(activity_doc["user_id"]) != user_id and g.current_user.get("role") != "manager":
        return jsonify({"error": "forbidden", "message": "Access denied"}), 403

    success = delete_activity(activity_id)
    if not success:
        return jsonify({"error": "not_found", "message": "Activity not found"}), 404

    _invalidate_metrics_cache(str(activity_doc["user_id"]), activity_doc["date"])

    return jsonify({"message": "Activity deleted"}), 200
