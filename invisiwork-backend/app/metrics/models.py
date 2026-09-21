"""
InvisiWork Backend — Metrics Cache Document Schema Helpers

Provides helper functions for reading and writing the metrics_cache collection
in MongoDB. No ORM — just simple dict helpers following the schema:

    {
        "_id":              ObjectId,
        "user_id":          ObjectId (ref: users._id, indexed),
        "week_start":       ISODate  (Monday 00:00 of the ISO week, indexed),
        "iwr":              Number   (Invisible Work Ratio, 0-100),
        "bcs":              Number   (Burnout Correlation Score, 0-100),
        "pii":              Number   (Personal Impact Index, 0-100),
        "total_hours":      Number,
        "invisible_hours":  Number,
        "visible_hours":    Number,
        "total_activities": Number,
        "computed_at":      ISODate  (last computation timestamp)
    }

Compound unique index: (user_id, week_start) — created in app/__init__.py.
"""

from datetime import datetime, timezone, timedelta
from typing import Optional, List

from bson import ObjectId

from app.extensions import mongo_db


def get_cached_metrics(user_id: str, week_start: datetime) -> Optional[dict]:
    """Retrieve a cached metrics document for a user and week.

    Args:
        user_id: String ObjectId of the user.
        week_start: Monday 00:00 datetime of the target ISO week.

    Returns:
        Safely formatted metrics dict, or None if not cached.
    """
    doc = mongo_db.metrics_cache.find_one({
        "user_id": ObjectId(user_id),
        "week_start": week_start
    })

    if doc:
        return _safe_metrics(doc)
    return None


def upsert_metrics(user_id: str, week_start: datetime, metrics: dict) -> dict:
    """Insert or update a metrics cache entry for a user and week.

    Args:
        user_id: String ObjectId of the user.
        week_start: Monday 00:00 datetime of the target ISO week.
        metrics: Dict with iwr, bcs, pii, total_hours, invisible_hours,
                 visible_hours, total_activities keys.

    Returns:
        Safely formatted metrics dict after upsert.
    """
    now = datetime.now(timezone.utc)

    doc_fields = {
        "iwr": metrics.get("iwr", 0.0),
        "bcs": metrics.get("bcs", 0.0),
        "pii": metrics.get("pii", 0.0),
        "total_hours": metrics.get("total_hours", 0.0),
        "invisible_hours": metrics.get("invisible_hours", 0.0),
        "visible_hours": metrics.get("visible_hours", 0.0),
        "total_activities": metrics.get("total_activities", 0),
        "computed_at": now,
    }

    mongo_db.metrics_cache.update_one(
        {"user_id": ObjectId(user_id), "week_start": week_start},
        {"$set": doc_fields},
        upsert=True
    )

    doc_fields["user_id"] = ObjectId(user_id)
    doc_fields["week_start"] = week_start
    return _safe_metrics(doc_fields)


def get_metrics_range(user_id: str, oldest_monday: datetime) -> List[dict]:
    """Retrieve all cached metrics for a user from oldest_monday to now.

    Args:
        user_id: String ObjectId of the user.
        oldest_monday: Earliest Monday to include.

    Returns:
        List of safely formatted metrics dicts, ordered by week_start ascending.
    """
    cursor = mongo_db.metrics_cache.find({
        "user_id": ObjectId(user_id),
        "week_start": {"$gte": oldest_monday}
    }).sort("week_start", 1)

    return [_safe_metrics(doc) for doc in cursor]


def is_cache_fresh(doc: dict, max_age_hours: int = 1) -> bool:
    """Check if a cached metrics document is fresh enough to serve directly.

    Args:
        doc: A metrics cache document (raw or safe format).
        max_age_hours: Maximum age in hours before cache is considered stale.

    Returns:
        True if the cache entry was computed within max_age_hours.
    """
    computed_at = doc.get("computed_at")
    if not computed_at:
        return False

    if isinstance(computed_at, str):
        computed_at = datetime.fromisoformat(computed_at)

    if computed_at.tzinfo is None:
        computed_at = computed_at.replace(tzinfo=timezone.utc)

    age = datetime.now(timezone.utc) - computed_at
    return age < timedelta(hours=max_age_hours)


def _safe_metrics(doc: dict) -> dict:
    """Format a metrics cache document for JSON API responses.

    Converts ObjectIds to strings and datetimes to ISO strings.
    """
    result = {
        "iwr": doc.get("iwr", 0.0),
        "bcs": doc.get("bcs", 0.0),
        "pii": doc.get("pii", 0.0),
        "total_hours": doc.get("total_hours", 0.0),
        "invisible_hours": doc.get("invisible_hours", 0.0),
        "visible_hours": doc.get("visible_hours", 0.0),
        "total_activities": doc.get("total_activities", 0),
    }

    if "user_id" in doc:
        result["user_id"] = str(doc["user_id"])

    week_start = doc.get("week_start")
    if isinstance(week_start, datetime):
        result["week_start"] = week_start.isoformat()
    elif week_start:
        result["week_start"] = week_start

    computed_at = doc.get("computed_at")
    if isinstance(computed_at, datetime):
        result["computed_at"] = computed_at.isoformat()
    elif computed_at:
        result["computed_at"] = computed_at

    return result
