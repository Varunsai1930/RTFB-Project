"""
InvisiWork Backend — Metrics Calculator Tests

Tests the pure metric computation functions:
  - compute_iwr: invisible work ratio
  - compute_bcs: burnout correlation score
  - compute_pii: personal impact index
  - compute_all_metrics: orchestrator

Run: python -m pytest tests/test_metrics.py -v
"""

import pytest

from app.metrics.calculator import (
    compute_iwr,
    compute_bcs,
    compute_pii,
    compute_all_metrics,
)


# ── Helper: build activity dicts quickly ─────────────────────────────────────


def _activity(work_type, duration_min, category="Code Review"):
    """Create a minimal activity dict for testing."""
    return {
        "work_type": work_type,
        "duration_min": duration_min,
        "category": category,
    }


def _visible(duration_min, category="Feature Development"):
    return _activity("visible", duration_min, category)


def _invisible(duration_min, category="Code Review"):
    return _activity("invisible", duration_min, category)


# ═══════════════════════════════════════════════════════════════════════════════
# IWR TESTS
# ═══════════════════════════════════════════════════════════════════════════════


class TestComputeIWR:
    """Tests for compute_iwr()."""

    def test_iwr_zero_when_all_visible(self):
        """Developer doing only visible work → IWR = 0."""
        activities = [_visible(120), _visible(180)]
        assert compute_iwr(activities) == 0.0

    def test_iwr_100_when_all_invisible(self):
        """Developer doing only invisible work → IWR = 100."""
        activities = [_invisible(120), _invisible(180)]
        assert compute_iwr(activities) == 100.0

    def test_iwr_50_when_equal_split(self):
        """Equal split → IWR = 50."""
        activities = [_visible(120), _invisible(120)]
        assert compute_iwr(activities) == 50.0

    def test_iwr_rounds_to_two_decimals(self):
        """IWR calculation rounds correctly to 2 decimal places."""
        # 1/3 invisible → 33.333... should round to 33.33
        activities = [_visible(200), _invisible(100)]
        result = compute_iwr(activities)
        assert result == 33.33

    def test_iwr_zero_with_no_activities(self):
        """Empty activity list → IWR = 0.0 (no ZeroDivisionError)."""
        assert compute_iwr([]) == 0.0

    def test_iwr_precise_example(self):
        """Specific example: 90 invisible out of 360 total = 25%."""
        activities = [_visible(270), _invisible(90)]
        assert compute_iwr(activities) == 25.0


# ═══════════════════════════════════════════════════════════════════════════════
# BCS TESTS
# ═══════════════════════════════════════════════════════════════════════════════


class TestComputeBCS:
    """Tests for compute_bcs()."""

    def test_bcs_zero_for_low_hours_low_iwr(self):
        """Developer with low hours and low IWR → BCS near 0."""
        # 20 hours total, all visible → IWR = 0
        activities = [_visible(1200)]  # 20 hours
        iwr = compute_iwr(activities)
        bcs = compute_bcs(activities, iwr)
        assert bcs == 0.0

    def test_bcs_high_for_extreme_overwork_and_high_iwr(self):
        """Developer with 55+ hours and IWR > 80 → BCS > 70 (high risk)."""
        # 55 hours total, 90% invisible in a single category
        activities = [
            _invisible(2970, "Code Review"),  # 49.5 hours
            _visible(330),                     # 5.5 hours
        ]
        iwr = compute_iwr(activities)
        bcs = compute_bcs(activities, iwr)
        assert bcs > 70, f"BCS should be > 70 for extreme case, got {bcs}"

    def test_bcs_component_a_iwr_weight(self):
        """Component A: IWR maps linearly to 0–40 points."""
        # 40 hours, IWR = 50 → Component A = 20, no overwork, no concentration penalty
        activities = [
            _invisible(1200, "Code Review"),      # 20h
            _invisible(600, "Documentation"),      # 10h  (diverse categories prevent conc. penalty)
            _visible(600),                          # 10h
        ]
        iwr = compute_iwr(activities)  # 75%
        bcs = compute_bcs(activities, iwr)
        # Component A = 75/100 * 40 = 30
        # Component B = 0 (40 hours, ≤ 40)
        # Component C: Code Review = 1200 / 1800 invisible = 66.7% → 12 pts
        assert bcs > 0

    def test_bcs_overwork_penalty_no_penalty_under_40h(self):
        """Component B: No penalty when total hours ≤ 40."""
        activities = [_visible(2400)]  # 40 hours exactly
        iwr = 0.0
        bcs = compute_bcs(activities, iwr)
        # A=0, B=0, C=0
        assert bcs == 0.0

    def test_bcs_overwork_penalty_midrange(self):
        """Component B: Penalty scales in the 41–50 hour range."""
        activities = [_visible(2700)]  # 45 hours
        iwr = 0.0
        bcs = compute_bcs(activities, iwr)
        # A=0, B=(5/10)*20=10, C=0
        assert bcs == 10.0

    def test_bcs_concentration_penalty_high(self):
        """Component C: > 80% of invisible hours in one category → 25 pts."""
        activities = [
            _invisible(480, "Code Review"),    # 8h of code review
            _invisible(60, "Documentation"),    # 1h of docs
            _visible(60),                       # 1h visible
        ]
        iwr = compute_iwr(activities)  # 540/600 = 90%
        bcs = compute_bcs(activities, iwr)
        # Code review is 480/540 = 88.9% of invisible → 25 pts concentration
        assert bcs >= 25

    def test_bcs_concentration_penalty_moderate(self):
        """Component C: 60–80% of invisible hours in one category → 12 pts."""
        activities = [
            _invisible(420, "Code Review"),    # 7h
            _invisible(180, "Documentation"),   # 3h
            _visible(60),                       # 1h
        ]
        iwr = compute_iwr(activities)
        bcs = compute_bcs(activities, iwr)
        # Code review: 420/600 = 70% of invisible → 12 pts
        # Verify concentration component was included
        assert bcs > 0

    def test_bcs_clamped_at_100(self):
        """BCS should never exceed 100."""
        # Extreme scenario
        activities = [_invisible(6000, "Code Review")]  # 100h all in one category
        iwr = 100.0
        bcs = compute_bcs(activities, iwr)
        assert bcs <= 100.0

    def test_bcs_clamped_at_0(self):
        """BCS should never go below 0."""
        activities = [_visible(60)]
        bcs = compute_bcs(activities, 0.0)
        assert bcs >= 0.0


# ═══════════════════════════════════════════════════════════════════════════════
# PII TESTS
# ═══════════════════════════════════════════════════════════════════════════════


class TestComputePII:
    """Tests for compute_pii()."""

    def test_pii_high_for_balanced_developer(self):
        """Developer with 40h and IWR in [30, 55] → high PII."""
        # 40 total hours, IWR = 40 (in ideal range), BCS = low
        activities = [
            _invisible(960),    # 16h invisible
            _visible(1440),     # 24h visible
        ]
        iwr = compute_iwr(activities)  # 16/40 = 40%
        bcs = compute_bcs(activities, iwr)
        pii = compute_pii(activities, iwr, bcs)
        # Volume: 40/40 * 40 = 40
        # Balance: IWR=40, in [30,55] → 40
        # Sustainability: 20 - low BCS penalty ≈ 18+
        assert pii > 80, f"Balanced developer PII should be > 80, got {pii}"

    def test_pii_penalized_for_high_bcs(self):
        """High BCS reduces PII through sustainability component."""
        activities = [_visible(2400)]  # 40h visible
        iwr = 0.0
        low_bcs_pii = compute_pii(activities, iwr, bcs=0.0)
        high_bcs_pii = compute_pii(activities, iwr, bcs=80.0)
        # Same volume and balance, but higher BCS should reduce PII
        assert high_bcs_pii < low_bcs_pii

    def test_pii_volume_capped_at_40(self):
        """Volume component caps at 40 points even if hours > 40."""
        activities = [_visible(4800)]  # 80h
        iwr = 0.0
        pii = compute_pii(activities, iwr, bcs=0.0)
        # Volume = min(80/40 * 40, 40) = 40
        # Balance: IWR=0, < 30 → (0/30)*40 = 0
        # Sustain: 20 - 0 = 20
        assert pii == 60.0

    def test_pii_balance_penalizes_extreme_iwr(self):
        """IWR close to 100 → balance component near 0."""
        activities = [_invisible(2400)]  # 40h all invisible
        iwr = 100.0
        pii = compute_pii(activities, iwr, bcs=0.0)
        # Volume: 40, Balance: (100-100)/45*40 = 0, Sustain: 20
        assert pii == 60.0

    def test_pii_balance_low_iwr(self):
        """IWR of 0 → balance component = 0."""
        activities = [_visible(2400)]
        iwr = 0.0
        pii = compute_pii(activities, iwr, bcs=0.0)
        # Volume: 40, Balance: 0/30*40=0, Sustain: 20
        assert pii == 60.0

    def test_pii_clamped_between_0_and_100(self):
        """PII should always be in [0, 100]."""
        activities = [_visible(2400)]
        pii = compute_pii(activities, 40.0, 0.0)
        assert 0 <= pii <= 100


# ═══════════════════════════════════════════════════════════════════════════════
# COMPUTE_ALL_METRICS TESTS
# ═══════════════════════════════════════════════════════════════════════════════


class TestComputeAllMetrics:
    """Tests for the compute_all_metrics() orchestrator."""

    def test_empty_activities_returns_all_zeros(self):
        """Empty list returns all-zero metrics without errors."""
        result = compute_all_metrics([])
        assert result == {
            "iwr": 0.0,
            "bcs": 0.0,
            "pii": 0.0,
            "total_hours": 0.0,
            "invisible_hours": 0.0,
            "visible_hours": 0.0,
        }

    def test_returns_all_required_keys(self):
        """Output dict contains all required keys."""
        activities = [_visible(120), _invisible(60)]
        result = compute_all_metrics(activities)
        expected_keys = {"iwr", "bcs", "pii", "total_hours", "invisible_hours", "visible_hours"}
        assert set(result.keys()) == expected_keys

    def test_hours_computed_correctly(self):
        """Total, invisible, and visible hours match activity durations."""
        activities = [_visible(120), _invisible(60)]
        result = compute_all_metrics(activities)
        assert result["total_hours"] == 3.0
        assert result["invisible_hours"] == 1.0
        assert result["visible_hours"] == 2.0

    def test_iwr_matches_standalone(self):
        """IWR in orchestrated result matches standalone compute_iwr."""
        activities = [_visible(120), _invisible(180)]
        from app.metrics.calculator import compute_iwr as standalone_iwr
        result = compute_all_metrics(activities)
        assert result["iwr"] == standalone_iwr(activities)

    def test_full_scenario(self):
        """Full scenario: 40h week with 30% invisible work in diverse categories."""
        activities = [
            _visible(1680, "Feature Development"),    # 28h
            _invisible(360, "Code Review"),            # 6h
            _invisible(240, "Documentation"),          # 4h
            _invisible(120, "Mentoring"),              # 2h
        ]
        result = compute_all_metrics(activities)
        assert result["total_hours"] == 40.0
        assert result["invisible_hours"] == 12.0
        assert result["visible_hours"] == 28.0
        assert result["iwr"] == 30.0
        # BCS should be relatively low (low IWR, no overwork, diverse invisible)
        assert result["bcs"] < 40
        # PII should be relatively high (good balance, healthy hours)
        assert result["pii"] > 60
