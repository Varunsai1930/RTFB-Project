"""
InvisiWork Backend — Metrics Routes

Endpoints:
    GET /api/metrics/current — Get or compute current week's metrics
    GET /api/metrics/history — Get last N weeks of metrics
"""

from datetime import datetime, timezone, timedelta
from flask import request, jsonify, g
from bson import ObjectId

from app.metrics import metrics_bp
from app.metrics.calculator import compute_all_metrics
from app.auth.utils import require_auth
from app.extensions import mongo_db
from app.activities.models import get_activities

def get_iso_week_bounds(target_date: datetime = None):
    """Return the Monday (start) and Sunday (end) of the ISO week containing target_date."""
    if not target_date:
        target_date = datetime.now(timezone.utc)
        
    start_of_day = target_date.replace(hour=0, minute=0, second=0, microsecond=0)
    monday = start_of_day - timedelta(days=start_of_day.weekday())
    sunday = monday + timedelta(days=6, hours=23, minutes=59, seconds=59)
    return monday, sunday

def _format_metric_doc(doc: dict) -> dict:
    return {
        "iwr": doc.get("iwr", 0.0),
        "bcs": doc.get("bcs", 0.0),
        "pii": doc.get("pii", 0.0),
        "total_hours": doc.get("total_hours", 0.0),
        "invisible_hours": doc.get("invisible_hours", 0.0),
        "visible_hours": doc.get("visible_hours", 0.0),
        "total_activities": doc.get("total_activities", 0),
        "week_start": doc["week_start"].isoformat() if isinstance(doc.get("week_start"), datetime) else doc.get("week_start"),
        "computed_at": doc.get("computed_at", datetime.now(timezone.utc)).isoformat() if isinstance(doc.get("computed_at", datetime.now(timezone.utc)), datetime) else doc.get("computed_at")
    }

@metrics_bp.route("/current", methods=["GET"])
@require_auth
def get_current_metrics():
    """Get or compute metrics for the current ISO week."""
    user_id = g.current_user["sub"]
    now = datetime.now(timezone.utc)
    monday, sunday = get_iso_week_bounds(now)
    
    # 1. Check cache
    cached = mongo_db.metrics_cache.find_one({
        "user_id": ObjectId(user_id),
        "week_start": monday
    })
    
    if cached and cached.get("computed_at"):
        computed_at = cached["computed_at"]
        if computed_at.tzinfo is None:
            computed_at = computed_at.replace(tzinfo=timezone.utc)
            
        age = now - computed_at
        if age < timedelta(hours=1):
            return jsonify(_format_metric_doc(cached)), 200

    # 2. Fetch activities & compute
    # get_activities returns (activities_list, total_count)
    activities, _ = get_activities(user_id, start_date=monday, end_date=sunday, limit=500)
    
    computed = compute_all_metrics(activities)
    
    # 3. Upsert into cache
    doc_fields = {
        **computed,
        "computed_at": now
    }
    
    mongo_db.metrics_cache.update_one(
        {"user_id": ObjectId(user_id), "week_start": monday},
        {"$set": doc_fields},
        upsert=True
    )
    
    # Add week_start to response format
    doc_fields["week_start"] = monday
    return jsonify(_format_metric_doc(doc_fields)), 200


@metrics_bp.route("/history", methods=["GET"])
@require_auth
def get_metrics_history():
    """Get metrics for the past N weeks including the current week.

    For each week, if a cached entry exists it is returned directly.
    If no cache exists but the user has activities for that week,
    metrics are computed on-the-fly and cached for future reads.
    Only weeks with genuinely no activities return zeroed records.
    """
    user_id = g.current_user["sub"]
    
    try:
        weeks = int(request.args.get("weeks", 8))
        if weeks < 1 or weeks > 52:
            return jsonify({"error": "invalid_weeks", "message": "weeks must be between 1 and 52"}), 400
    except ValueError:
        return jsonify({"error": "invalid_pagination", "message": "weeks param must be integer"}), 400

    now = datetime.now(timezone.utc)
    current_monday, _ = get_iso_week_bounds(now)
    
    # Generate list of past N mondays
    expected_mondays = [current_monday - timedelta(weeks=i) for i in range(weeks)]
    oldest_monday = expected_mondays[-1]
    
    # Fetch all cache entries for this user since oldest_monday
    cursor = mongo_db.metrics_cache.find({
        "user_id": ObjectId(user_id),
        "week_start": {"$gte": oldest_monday}
    })
    
    cache_map = {}
    for doc in cursor:
        week_st = doc.get("week_start")
        if week_st and week_st.tzinfo is None:
            week_st = week_st.replace(tzinfo=timezone.utc)
            doc["week_start"] = week_st
        cache_map[week_st] = doc
    
    history = []
    # Build array from oldest to newest
    for monday in reversed(expected_mondays):
        if monday in cache_map:
            history.append(_format_metric_doc(cache_map[monday]))
        else:
            # Cache miss — compute from activities for this week
            sunday = monday + timedelta(days=6, hours=23, minutes=59, seconds=59)
            activities, _ = get_activities(user_id, start_date=monday, end_date=sunday, limit=500)
            
            if activities:
                # Compute and cache for future reads
                computed = compute_all_metrics(activities)
                mongo_db.metrics_cache.update_one(
                    {"user_id": ObjectId(user_id), "week_start": monday},
                    {"$set": {**computed, "computed_at": now}},
                    upsert=True
                )
                computed["week_start"] = monday
                computed["computed_at"] = now
                history.append(_format_metric_doc(computed))
            else:
                # Genuinely no activities this week — return zeros
                history.append(_format_metric_doc({
                    "week_start": monday,
                    "computed_at": now
                }))

    return jsonify({"history": history}), 200

