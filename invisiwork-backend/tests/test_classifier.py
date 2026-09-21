"""
InvisiWork Backend — Classifier Tests

Tests the classify_activity() pure function to ensure all categories
are correctly classified, unrecognized categories default to invisible, and
case-insensitive matching works.

Run: python -m pytest tests/test_classifier.py -v
"""

import pytest

from app.activities.classifier import (
    classify_activity,
    ALL_CATEGORIES,
    VISIBLE_CATEGORIES,
    INVISIBLE_CATEGORIES,
)


class TestClassifyActivity:
    """Tests for the classify_activity() function."""

    # ── Visible categories ───────────────────────────────────────────────

    def test_feature_development_is_visible(self):
        assert classify_activity("Feature Development") == "visible"

    def test_bug_fix_is_visible(self):
        assert classify_activity("Bug Fix") == "visible"

    def test_formal_testing_qa_is_visible(self):
        assert classify_activity("Formal Testing / QA") == "visible"

    # ── Invisible categories ─────────────────────────────────────────────

    def test_code_review_is_invisible(self):
        assert classify_activity("Code Review") == "invisible"

    def test_debugging_non_ticket_is_invisible(self):
        assert classify_activity("Debugging (non-ticket)") == "invisible"

    def test_peer_help_is_invisible(self):
        assert classify_activity("Peer Help") == "invisible"

    def test_mentoring_is_invisible(self):
        assert classify_activity("Mentoring") == "invisible"

    def test_knowledge_sharing_is_invisible(self):
        assert classify_activity("Knowledge Sharing") == "invisible"

    def test_documentation_is_invisible(self):
        assert classify_activity("Documentation") == "invisible"

    def test_production_incident_response_is_invisible(self):
        assert classify_activity("Production Incident Response") == "invisible"

    def test_learning_research_is_invisible(self):
        assert classify_activity("Learning / Research") == "invisible"

    def test_refactoring_is_invisible(self):
        assert classify_activity("Refactoring") == "invisible"

    def test_infrastructure_is_invisible(self):
        assert classify_activity("Infrastructure") == "invisible"

    def test_meetings_is_invisible(self):
        assert classify_activity("Meetings") == "invisible"

    def test_planning_is_invisible(self):
        assert classify_activity("Planning") == "invisible"

    # ── All categories covered ───────────────────────────────────────────

    def test_all_categories_count(self):
        """Verify we have exactly 15 known categories (3 visible + 12 invisible)."""
        assert len(ALL_CATEGORIES) == 15

    def test_visible_count(self):
        assert len(VISIBLE_CATEGORIES) == 3

    def test_invisible_count(self):
        assert len(INVISIBLE_CATEGORIES) == 12

    # ── Case insensitive matching ────────────────────────────────────────

    def test_lowercase_input(self):
        assert classify_activity("bug fix") == "visible"

    def test_uppercase_input(self):
        assert classify_activity("CODE REVIEW") == "invisible"

    def test_mixed_case_input(self):
        assert classify_activity("Feature DEVELOPMENT") == "visible"

    def test_extra_whitespace_stripped(self):
        assert classify_activity("  Mentoring  ") == "invisible"

    # ── Unknown categories default to invisible ────────────────────────────

    def test_unknown_category_defaults_to_invisible(self):
        """Unrecognized categories safely default to invisible work."""
        assert classify_activity("Cooking Lunch") == "invisible"

    def test_empty_string_defaults_to_invisible(self):
        assert classify_activity("") == "invisible"

    def test_similar_but_wrong_category_defaults_to_invisible(self):
        """Partial matches should not be accepted as visible."""
        assert classify_activity("Feature") == "invisible"

    def test_custom_other_category_defaults_to_invisible(self):
        """Frontend 'Other' category from custom input must work."""
        assert classify_activity("Other") == "invisible"

    # ── Every category in ALL_CATEGORIES classifies without error ────────

    def test_all_categories_classify_successfully(self):
        """Exhaustive test: every category in ALL_CATEGORIES returns a valid work type."""
        for category in ALL_CATEGORIES:
            result = classify_activity(category)
            assert result in ("visible", "invisible"), (
                f"Category '{category}' returned unexpected type '{result}'"
            )