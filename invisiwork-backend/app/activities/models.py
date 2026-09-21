from __future__ import annotations

"""
InvisiWork Backend — Activity Document Schema Helpers

Provides helper functions for logging, querying, and deleting activity documents in MongoDB.
No ORM — just simple dict helpers following the schema:

    {
        "_id":           ObjectId,
        "user_id":       ObjectId (ref: users._id, indexed),
        "date":          ISODate (indexed),
        "category":      String,
        "work_type":     "visible" | "invisible",
        "duration_min":  Number,
        "description":   String,
        "source":        "manual" | "google_form",
        "created_at":    ISODate
    }
"""

from datetime import datetime, timezone
from typing import Optional, Tuple, List

from bson import ObjectId

from app import extensions


def create_activity(
    user_id: str,
    date_obj: datetime,
    category: str,
    work_type: str,
    duration_min: int,
    description: str = "",
    source: str = "manual",
) -> dict:
    """Insert a new activity document into MongoDB.

    Args:
        user_id: String ObjectId of the developer.
        date_obj: Datetime object for when the work occurred.
        category: Activity category string.
        work_type: 'visible' or 'invisible'.
        duration_min: Integer duration in minutes.
        description: Optional free text description.
        source: 'manual' (UI) or 'google_form' (Phase 2 webhook).

    Returns:
        The inserted activity document safely formatted for API responses.
    """
    doc = {
        "user_id": ObjectId(user_id),
        "date": date_obj,
        "category": category,
        "work_type": work_type,
        "duration_min": duration_min,
        "description": description.strip(),
        "source": source,
        "created_at": datetime.now(timezone.utc),
    }

    result = extensions.mongo_db.activities.insert_one(doc)
    doc["_id"] = result.inserted_id

    return _safe_activity(doc)


def get_activities(
    user_id: str,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = 50,
    offset: int = 0
) -> Tuple[List[dict], int]:
    """Retrieve activities for a user, with optional date range filtering.

    Args:
        user_id: String ObjectId of the developer.
        start_date: Optional start of date range (inclusive).
        end_date: Optional end of date range (inclusive).
        limit: Max number of documents to return.
        offset: Number of documents to skip.

    Returns:
        A tuple of (list of safely formatted activities, total count matching query).
    """
    query = {"user_id": ObjectId(user_id)}

    if start_date or end_date:
        date_filter = {}
        if start_date:
            date_filter["$gte"] = start_date
        if end_date:
            date_filter["$lte"] = end_date
        query["date"] = date_filter

    # Count total across the whole query before applying limit/offset
    total_count = extensions.mongo_db.activities.count_documents(query)

    cursor = (
        extensions.mongo_db.activities.find(query)
        .sort("created_at", -1)  # Descending: most recently logged first
        .skip(offset)
        .limit(limit)
    )

    activities = [_safe_activity(doc) for doc in cursor]

    return activities, total_count


def find_activity_by_id(activity_id: str) -> Optional[dict]:
    """Retrieve a single activity document by ID.

    Args:
        activity_id: String ObjectId of the activity.

    Returns:
        Safely formatted activity or None if not found.
    """
    if not ObjectId.is_valid(activity_id):
        return None
        
    doc = extensions.mongo_db.activities.find_one({"_id": ObjectId(activity_id)})
    if doc:
        return _safe_activity(doc)
    return None


def get_raw_activity_by_id(activity_id: str) -> Optional[dict]:
    """Retrieve a single activity document exactly as stored in DB.

    Useful when internal ID checks or DB-level manipulations are required.
    """
    if not ObjectId.is_valid(activity_id):
        return None
        
    return extensions.mongo_db.activities.find_one({"_id": ObjectId(activity_id)})


def delete_activity(activity_id: str) -> bool:
    """Delete an activity document by ID.

    Args:
        activity_id: String ObjectId of the activity.

    Returns:
        True if an item was deleted, False otherwise.
    """
    if not ObjectId.is_valid(activity_id):
        return False
        
    result = extensions.mongo_db.activities.delete_one({"_id": ObjectId(activity_id)})
    return result.deleted_count > 0


def _safe_activity(doc: dict) -> dict:
    """Format an activity document for JSON API responses.

    Converts ObjectIds to strings and datetimes to ISO strings.
    """
    return {
        "activity_id": str(doc["_id"]),
        "user_id": str(doc["user_id"]),
        "date": doc["date"].isoformat() if isinstance(doc["date"], datetime) else doc["date"],
        "category": doc["category"],
        "work_type": doc["work_type"],
        "duration_min": doc["duration_min"],
        "description": doc.get("description", ""),
        "source": doc.get("source", "manual"),
        "created_at": doc["created_at"].isoformat() if isinstance(doc["created_at"], datetime) else doc["created_at"],
    }
