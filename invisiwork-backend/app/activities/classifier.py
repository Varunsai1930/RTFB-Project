"""
InvisiWork Backend — Activity Work-Type Classifier

Core domain logic for classifying developer activities as "visible" or "invisible" work.
This is a pure function with no side effects — takes a category string, returns a work type.

Visible work: tasks that produce directly observable output (features, bug fixes, QA).
Invisible work: essential tasks that sustain team health but are often unrecognized
                (code review, mentoring, documentation, incident response, etc.).
"""

# ── Category Definitions ─────────────────────────────────────────────────────

VISIBLE_CATEGORIES = {
    "Feature Development",
    "Bug Fix",
    "Formal Testing / QA",
}

INVISIBLE_CATEGORIES = {
    "Code Review",
    "Debugging (non-ticket)",
    "Peer Help",
    "Mentoring",
    "Knowledge Sharing",
    "Documentation",
    "Production Incident Response",
    "Learning / Research",
    "Refactoring",
    "Infrastructure",
    "Meetings",
    "Planning",
}

# Combined set of all valid categories, exported for route validation
ALL_CATEGORIES = VISIBLE_CATEGORIES | INVISIBLE_CATEGORIES

# Lookup maps keyed by lowercase for case-insensitive matching
_VISIBLE_LOWER = {c.strip().lower() for c in VISIBLE_CATEGORIES}
_INVISIBLE_LOWER = {c.strip().lower() for c in INVISIBLE_CATEGORIES}


def classify_activity(category: str) -> str:
    """Classify an activity category as 'visible' or 'invisible' work.

    Args:
        category: The activity category string. Matched case-insensitively
                  after stripping leading/trailing whitespace.

    Returns:
        'visible' if the category is recognized as visible work.
        'invisible' if the category is recognized as invisible work,
                    OR if the category is unrecognized (safe default —
                    invisible work is by definition underrecognized,
                    so unknown categories map to invisible).
    """
    normalized = category.strip().lower()

    if normalized in _VISIBLE_LOWER:
        return "visible"

    # Known invisible categories OR any custom/unrecognized category
    return "invisible"

