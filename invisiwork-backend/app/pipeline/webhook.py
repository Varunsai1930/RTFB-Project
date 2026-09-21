"""
InvisiWork Backend — Pipeline Ingest Webhook

POST /api/pipeline/ingest — Server-to-server endpoint for Google Apps Script.
Authenticated via X-Pipeline-Secret header (NOT JWT).

Flow:
    1. Verify secret header
    2. Validate payload (email, date, category, duration_min)
    3. Look up user by email
    4. Check for duplicates (same user, date, category, duration within 5 min)
    5. Classify activity → work_type
    6. Insert activity document with source: "google_form"
    7. Invalidate metrics cache for the affected ISO week
    8. Return 201 with activity_id and work_type
"""

from datetime import datetime, timezone, timedelta

from flask import request, jsonify, current_app
from bson import ObjectId

from app.pipeline import pipeline_bp
from app import extensions
from app.activities.classifier import classify_activity, ALL_CATEGORIES
from app.activities.models import create_activity


@pipeline_bp.route("/ingest", methods=["POST"])
def ingest():
    """Accept a form submission from Google Apps Script and create an activity.

    Authentication: X-Pipeline-Secret header must match PIPELINE_SECRET env var.
    This is a server-to-server call, not a user-facing JWT-protected route.

    Request body (JSON):
        email (str):        Developer's registered email address.
        date (str):         Activity date in YYYY-MM-DD or ISO format.
        category (str):     One of the 15 known activity categories.
        duration_min (int): Duration in minutes (1–480).
        description (str):  Optional free-text description.

    Returns:
        201: { activity_id, work_type }
        200: { duplicate: true } — if duplicate detected
        400: Missing required fields
        401: Invalid or missing pipeline secret
        404: Email not found in users collection
        422: Invalid category or duration
    """
    # ── 1. Verify X-Pipeline-Secret ──────────────────────────────────────
    secret = request.headers.get("X-Pipeline-Secret", "")
    expected = current_app.config.get("PIPELINE_SECRET", "")

    if not expected:
        return jsonify({
            "error": "server_misconfigured",
            "message": "PIPELINE_SECRET is not configured on the server"
        }), 500

    if secret != expected:
        return jsonify({
            "error": "unauthorized",
            "message": "Invalid or missing X-Pipeline-Secret header"
        }), 401

    # ── 2. Validate payload ──────────────────────────────────────────────
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "bad_request", "message": "Request body must be JSON"}), 400

    required = ["email", "date", "category", "duration_min"]
    missing = [f for f in required if not data.get(f) and data.get(f) != 0]
    if missing:
        return jsonify({
            "error": "bad_request",
            "message": f"Missing required fields: {', '.join(missing)}"
        }), 400

    email = str(data["email"]).strip().lower()
    category = str(data["category"]).strip()
    description = str(data.get("description", "")).strip()

    # Validate category against known categories
    if category not in ALL_CATEGORIES:
        # Case-insensitive check
        match = None
        for cat in ALL_CATEGORIES:
            if cat.lower() == category.lower():
                match = cat
                break
        if match:
            category = match
        else:
            return jsonify({
                "error": "invalid_category",
                "message": f"Unknown category: '{category}'. Must be one of: {sorted(ALL_CATEGORIES)}"
            }), 422

    # Validate duration
    try:
        duration_min = int(data["duration_min"])
        if not (1 <= duration_min <= 480):
            raise ValueError
    except (ValueError, TypeError):
        return jsonify({
            "error": "invalid_duration",
            "message": "duration_min must be an integer between 1 and 480"
        }), 422

    # Parse date
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

    # ── 3. Look up user by email ─────────────────────────────────────────
    user = extensions.mongo_db.users.find_one({"email": email})
    if not user:
        return jsonify({
            "error": "user_not_found",
            "message": f"No registered user with email: {email}"
        }), 404

    user_id = str(user["_id"])

    # ── 4. Duplicate detection ───────────────────────────────────────────
    # If same user, date, category, duration was ingested in the last 5 minutes → skip
    five_min_ago = datetime.now(timezone.utc) - timedelta(minutes=5)
    existing = extensions.mongo_db.activities.find_one({
        "user_id": ObjectId(user_id),
        "date": date_obj,
        "category": category,
        "duration_min": duration_min,
        "source": "google_form",
        "created_at": {"$gte": five_min_ago}
    })

    if existing:
        return jsonify({
            "duplicate": True,
            "activity_id": str(existing["_id"]),
            "message": "Duplicate activity detected, skipping insertion"
        }), 200

    # ── 5. Classify ──────────────────────────────────────────────────────
    work_type = classify_activity(category)

    # ── 6. Insert activity ───────────────────────────────────────────────
    activity = create_activity(
        user_id=user_id,
        date_obj=date_obj,
        category=category,
        work_type=work_type,
        duration_min=duration_min,
        description=description,
        source="google_form"
    )

    # ── 7. Invalidate metrics cache for this week ────────────────────────
    _invalidate_week_cache(user_id, date_obj)

    # ── 8. Return success ────────────────────────────────────────────────
    return jsonify({
        "activity_id": activity["activity_id"],
        "work_type": work_type,
    }), 201


def _invalidate_week_cache(user_id: str, activity_date: datetime):
    """Delete the metrics cache entry for the ISO week containing activity_date.

    This forces recomputation on the next /metrics/current request,
    ensuring the new activity is reflected in the user's scores.

    Args:
        user_id: String ObjectId of the developer.
        activity_date: The date of the activity being ingested.
    """
    # Find Monday of the ISO week
    start = activity_date.replace(hour=0, minute=0, second=0, microsecond=0)
    monday = start - timedelta(days=start.weekday())

    extensions.mongo_db.metrics_cache.delete_one({
        "user_id": ObjectId(user_id),
        "week_start": monday
    })
