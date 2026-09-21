"""
InvisiWork Backend — Pipeline Polling Scheduler

Backup ingestion path using APScheduler. Polls the linked Google Sheet
at a configurable interval, processes new rows since the last checkpoint,
and runs them through the same ingest logic as the webhook.

The last-processed row number is tracked in MongoDB (system_state collection)
for persistence across server restarts.

Functions:
    init_scheduler(app) — Starts the APScheduler background job.
    poll_new_sheet_rows() — Reads and processes new sheet rows.
"""

import os
import logging
from datetime import datetime, timezone, timedelta

from bson import ObjectId

logger = logging.getLogger(__name__)

# Lazy import APScheduler — may not be installed in Phase 1
_scheduler_available = True
try:
    from apscheduler.schedulers.background import BackgroundScheduler
except ImportError:
    _scheduler_available = False
    logger.info("APScheduler not installed. Sheet polling will be disabled.")


# Module-level reference to the Flask app (set during init_scheduler)
_flask_app = None


def init_scheduler(app):
    """Initialize and start the background polling scheduler.

    Only starts if:
        - APScheduler is installed
        - Google Sheets SDK is available and configured
        - App is not in testing mode
        - PIPELINE_SECRET and SHEETS_SPREADSHEET_ID are configured

    Args:
        app: The Flask application instance.
    """
    global _flask_app
    _flask_app = app

    if app.config.get("TESTING"):
        logger.info("Scheduler disabled in testing mode.")
        return

    if not _scheduler_available:
        logger.info("APScheduler not installed. Polling disabled.")
        return

    # Check if sheets module is available
    from app.pipeline import sheets
    if not sheets.is_available():
        logger.info("Google Sheets not configured. Polling disabled.")
        return

    spreadsheet_id = app.config.get("SHEETS_SPREADSHEET_ID", "")
    if not spreadsheet_id:
        logger.info("SHEETS_SPREADSHEET_ID not set. Polling disabled.")
        return

    interval = app.config.get("SHEETS_POLL_INTERVAL_SECONDS", 300)

    scheduler = BackgroundScheduler()
    scheduler.add_job(
        poll_new_sheet_rows,
        "interval",
        seconds=interval,
        id="sheets_poll",
        replace_existing=True,
        max_instances=1,
    )
    scheduler.start()
    logger.info(f"Sheet polling scheduler started (interval: {interval}s)")


def poll_new_sheet_rows():
    """Read new rows from Google Sheets and process them through ingest logic.

    Tracks the last-processed row number in the system_state MongoDB collection.
    Processes rows sequentially, updating the checkpoint after each successful batch.

    This function runs inside an APScheduler job, so it needs its own Flask app context.
    """
    if not _flask_app:
        logger.error("Flask app not initialized. Cannot poll sheets.")
        return

    with _flask_app.app_context():
        from app.extensions import mongo_db
        from app.pipeline import sheets
        from app.activities.classifier import classify_activity
        from app.activities.models import create_activity

        spreadsheet_id = _flask_app.config.get("SHEETS_SPREADSHEET_ID", "")
        if not spreadsheet_id:
            return

        # Get last-processed row from system_state
        state = mongo_db.system_state.find_one({"key": "sheets_last_row"})
        last_row = state["value"] if state else 1  # Start from row 1 (headers)

        # Data rows start after headers (row 2)
        start_row = max(last_row + 1, 2)

        try:
            rows = sheets.read_rows_from(spreadsheet_id, start_row)
        except Exception as e:
            logger.error(f"Failed to read sheets: {e}")
            return

        if not rows:
            logger.debug("No new rows to process.")
            return

        processed = 0
        for i, row_data in enumerate(rows):
            try:
                _process_row(row_data, mongo_db)
                processed += 1
            except Exception as e:
                logger.warning(f"Error processing row {start_row + i}: {e}")
                continue

        # Update checkpoint
        new_last_row = start_row + len(rows) - 1
        mongo_db.system_state.update_one(
            {"key": "sheets_last_row"},
            {"$set": {"value": new_last_row, "updated_at": datetime.now(timezone.utc)}},
            upsert=True,
        )

        logger.info(f"Processed {processed}/{len(rows)} new sheet rows. Checkpoint: row {new_last_row}")


def _process_row(row_data: dict, db):
    """Process a single row from the Google Sheet — mirrors webhook ingest logic.

    Args:
        row_data: Dict with email, date, category, duration_min, description.
        db: The MongoDB database instance.

    Raises:
        ValueError: If the user is not found or category is invalid.
    """
    from app.activities.classifier import classify_activity
    from app.activities.models import create_activity

    email = row_data["email"]
    category = row_data["category"]
    duration_min = row_data["duration_min"]
    description = row_data.get("description", "")

    # Parse date
    date_str = row_data["date"]
    if "T" in date_str:
        date_obj = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
    else:
        date_obj = datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)

    # Look up user
    user = db.users.find_one({"email": email})
    if not user:
        raise ValueError(f"No registered user with email: {email}")

    user_id = str(user["_id"])

    # Duplicate check (same as webhook)
    five_min_ago = datetime.now(timezone.utc) - timedelta(minutes=5)
    existing = db.activities.find_one({
        "user_id": ObjectId(user_id),
        "date": date_obj,
        "category": category,
        "duration_min": duration_min,
        "source": "google_form",
        "created_at": {"$gte": five_min_ago}
    })

    if existing:
        logger.debug(f"Duplicate detected for {email}, skipping.")
        return

    # Classify and insert
    work_type = classify_activity(category)
    create_activity(
        user_id=user_id,
        date_obj=date_obj,
        category=category,
        work_type=work_type,
        duration_min=duration_min,
        description=description,
        source="google_form",
    )

    # Invalidate metrics cache for this week
    start = date_obj.replace(hour=0, minute=0, second=0, microsecond=0)
    monday = start - timedelta(days=start.weekday())
    db.metrics_cache.delete_one({
        "user_id": ObjectId(user_id),
        "week_start": monday,
    })
