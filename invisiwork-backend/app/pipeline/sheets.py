"""
InvisiWork Backend — Google Sheets API Client

Authenticates with a service account and reads rows from a Google Sheet.
Used by the polling scheduler (scheduler.py) as a backup ingestion path
when the webhook trigger from Google Apps Script fails.

Requires:
    - google-auth
    - google-api-python-client
    - A service account JSON key file path set in GOOGLE_SERVICE_ACCOUNT_JSON env

Functions:
    get_sheets_service()         — Returns an authenticated Sheets API resource.
    read_rows_from(id, start)    — Reads rows from start_row onward.
"""

import os
import logging

logger = logging.getLogger(__name__)

# Lazy import — these packages may not be installed in Phase 1
_sheets_available = True
try:
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
except ImportError:
    _sheets_available = False
    logger.info("Google Sheets SDK not installed. Sheets polling will be disabled.")


SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]

# Expected column order in the Google Sheet (maps to activity fields)
COLUMN_MAP = {
    0: "email",
    1: "date",
    2: "category",
    3: "duration_min",
    4: "description",
}


def is_available() -> bool:
    """Check if the Google Sheets SDK is installed and credentials are configured.

    Returns:
        True if sheets.py can authenticate and read sheets.
    """
    if not _sheets_available:
        return False
    cred_path = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON", "")
    return bool(cred_path) and os.path.isfile(cred_path)


def get_sheets_service():
    """Create and return an authenticated Google Sheets API service.

    Authenticates using the service account JSON file at the path
    specified by the GOOGLE_SERVICE_ACCOUNT_JSON environment variable.

    Returns:
        A Google Sheets API service resource (v4).

    Raises:
        FileNotFoundError: If the service account JSON file doesn't exist.
        RuntimeError: If google-auth libraries are not installed.
    """
    if not _sheets_available:
        raise RuntimeError(
            "Google Sheets SDK is not installed. "
            "Run: pip install google-auth google-api-python-client"
        )

    cred_path = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON", "")
    if not cred_path or not os.path.isfile(cred_path):
        raise FileNotFoundError(
            f"Service account JSON not found at: {cred_path}. "
            "Set GOOGLE_SERVICE_ACCOUNT_JSON in your .env file."
        )

    credentials = service_account.Credentials.from_service_account_file(
        cred_path, scopes=SCOPES
    )

    service = build("sheets", "v4", credentials=credentials, cache_discovery=False)
    return service


def read_rows_from(spreadsheet_id: str, start_row: int) -> list:
    """Read rows from start_row onward in the first sheet.

    Maps columns to activity fields based on COLUMN_MAP.
    Skips rows with missing required fields (email, date, category, duration).

    Args:
        spreadsheet_id: The Google Sheets spreadsheet ID.
        start_row: The 1-indexed row to start reading from.
                   Row 1 is typically headers, so data starts at row 2.

    Returns:
        A list of dicts, each with keys: email, date, category,
        duration_min (as int), description. Ready for the ingest logic.
    """
    service = get_sheets_service()

    # Read from start_row to row 10000 (more than enough for a daily form)
    range_str = f"Sheet1!A{start_row}:E10000"

    result = service.spreadsheets().values().get(
        spreadsheetId=spreadsheet_id,
        range=range_str,
        valueRenderOption="FORMATTED_VALUE"
    ).execute()

    rows = result.get("values", [])
    parsed = []

    for i, row in enumerate(rows):
        if len(row) < 4:
            logger.warning(f"Skipping row {start_row + i}: insufficient columns ({len(row)})")
            continue

        try:
            entry = {
                "email": str(row[0]).strip().lower(),
                "date": str(row[1]).strip(),
                "category": str(row[2]).strip(),
                "duration_min": int(row[3]),
                "description": str(row[4]).strip() if len(row) > 4 else "",
            }

            # Validate required fields are non-empty
            if not entry["email"] or not entry["date"] or not entry["category"]:
                logger.warning(f"Skipping row {start_row + i}: empty required field")
                continue

            parsed.append(entry)

        except (ValueError, IndexError) as e:
            logger.warning(f"Skipping row {start_row + i}: {e}")
            continue

    logger.info(f"Read {len(parsed)} valid rows from sheet (starting at row {start_row})")
    return parsed
