"""
InvisiWork Backend — Metrics Calculator

Pure functions for computing the three core metrics:
  - IWR (Invisible Work Ratio): percentage of work hours spent on invisible tasks
  - BCS (Burnout Correlation Score): composite burnout risk indicator
  - PII (Personal Impact Index): balanced contribution score

All functions are pure — no database calls, no side effects.
Each takes a list of activity dicts and returns a numeric score.
"""


def compute_iwr(activities: list) -> float:
    """Compute the Invisible Work Ratio.

    IWR = (Invisible Work Hours / Total Work Hours) × 100

    Args:
        activities: List of activity dicts, each with at least:
                    { 'work_type': 'visible'|'invisible', 'duration_min': int }

    Returns:
        Float 0–100, rounded to 2 decimal places.
        Returns 0.0 if total hours is zero.

    Thresholds (applied by caller, not here):
        > 60 = elevated, > 75 = critical
    """
    total_min = sum(a["duration_min"] for a in activities)
    if total_min == 0:
        return 0.0

    invisible_min = sum(
        a["duration_min"] for a in activities if a["work_type"] == "invisible"
    )
    return round((invisible_min / total_min) * 100, 2)


def compute_bcs(activities: list, iwr: float) -> float:
    """Compute the Burnout Correlation Score.

    BCS is a 0–100 composite of three components:

    Component A — IWR Weight (40% of BCS):
        Maps IWR linearly: IWR 0 → 0 points, IWR 100 → 40 points.

    Component B — Overwork Penalty (35% of BCS):
        Penalizes hours exceeding a 40-hour reference week.
        ≤ 40h: 0 pts | 41–50h: 0–20 pts linearly | > 50h: 20–35 pts (capped)

    Component C — Activity Concentration (25% of BCS):
        Detects when a developer spends > 80% of invisible hours in a single
        invisible category (single point of failure risk).
        > 80%: 25 pts | 60–80%: 12 pts | < 60%: 0 pts

    Args:
        activities: List of activity dicts with 'work_type', 'duration_min',
                    and 'category' fields.
        iwr: Pre-computed IWR value (0–100).

    Returns:
        Float 0–100, rounded to 2 decimal places.

    Thresholds (applied by caller):
        < 40 = Low Risk (green), 40–70 = Moderate (yellow), > 70 = High Risk (red)
    """
    # ── Component A: IWR Weight (40%) ────────────────────────────────────
    component_a = (iwr / 100) * 40

    # ── Component B: Overwork Penalty (35%) ──────────────────────────────
    total_hours = sum(a["duration_min"] for a in activities) / 60

    if total_hours <= 40:
        component_b = 0.0
    elif total_hours <= 50:
        # Linear scale from 0 to 20 over the 40–50 hour range
        component_b = ((total_hours - 40) / 10) * 20
    else:
        # Linear scale from 20 to 35 over the 50–65 hour range, capped at 35
        component_b = 20 + ((total_hours - 50) / 15) * 15
        component_b = min(component_b, 35.0)

    # ── Component C: Activity Concentration (25%) ────────────────────────
    invisible_activities = [a for a in activities if a["work_type"] == "invisible"]
    total_invisible_min = sum(a["duration_min"] for a in invisible_activities)

    component_c = 0.0
    if total_invisible_min > 0:
        # Count hours per invisible category
        category_hours = {}
        for a in invisible_activities:
            cat = a.get("category", "unknown")
            category_hours[cat] = category_hours.get(cat, 0) + a["duration_min"]

        # Find the maximum single-category concentration
        max_category_min = max(category_hours.values()) if category_hours else 0
        concentration = max_category_min / total_invisible_min

        if concentration > 0.80:
            component_c = 25.0
        elif concentration >= 0.60:
            component_c = 12.0

    bcs = component_a + component_b + component_c
    return round(max(0, min(100, bcs)), 2)


def compute_pii(activities: list, iwr: float, bcs: float) -> float:
    """Compute the Personal Impact Index.

    PII is a 0–100 composite contribution score that rewards balanced work
    across visible and invisible tasks, and penalizes burnout risk.

    Component A — Volume Score (40%):
        (total_hours / 40) × 40, capped at 40.

    Component B — Balance Score (40%):
        Ideal IWR is 30–55.
        IWR in [30, 55]: 40 pts (full marks).
        IWR < 30: linear scale from 0 (IWR=0) to 40 (IWR=30).
        IWR > 55: linear scale from 40 (IWR=55) to 0 (IWR=100).

    Component C — Sustainability Score (20%):
        20 - (BCS / 100 × 20). Higher burnout risk reduces PII.

    Args:
        activities: List of activity dicts with 'duration_min'.
        iwr: Pre-computed IWR value (0–100).
        bcs: Pre-computed BCS value (0–100).

    Returns:
        Float 0–100, rounded to 2 decimal places.
    """
    total_hours = sum(a["duration_min"] for a in activities) / 60

    # ── Component A: Volume Score (40%) ──────────────────────────────────
    component_a = min((total_hours / 40) * 40, 40)

    # ── Component B: Balance Score (40%) ─────────────────────────────────
    if 30 <= iwr <= 55:
        component_b = 40.0
    elif iwr < 30:
        # Linear scale: IWR 0 → 0 pts, IWR 30 → 40 pts
        component_b = (iwr / 30) * 40
    else:
        # Linear scale: IWR 55 → 40 pts, IWR 100 → 0 pts
        component_b = ((100 - iwr) / 45) * 40

    # ── Component C: Sustainability Score (20%) ──────────────────────────
    component_c = 20 - (bcs / 100 * 20)

    pii = component_a + component_b + component_c
    return round(max(0, min(100, pii)), 2)


def compute_all_metrics(activities: list) -> dict:
    """Orchestrator that computes all three metrics in dependency order.

    Calls compute_iwr(), then compute_bcs() (which needs IWR), then
    compute_pii() (which needs both IWR and BCS).

    Args:
        activities: List of activity dicts, each with at least:
                    { 'work_type': 'visible'|'invisible',
                      'duration_min': int,
                      'category': str }

    Returns:
        Dict with keys: iwr, bcs, pii, total_hours, invisible_hours, visible_hours.
        All hour values are floats (converted from minutes).
    """
    if not activities:
        return {
            "iwr": 0.0,
            "bcs": 0.0,
            "pii": 0.0,
            "total_hours": 0.0,
            "invisible_hours": 0.0,
            "visible_hours": 0.0,
        }

    total_min = sum(a["duration_min"] for a in activities)
    invisible_min = sum(
        a["duration_min"] for a in activities if a["work_type"] == "invisible"
    )
    visible_min = total_min - invisible_min

    iwr = compute_iwr(activities)
    bcs = compute_bcs(activities, iwr)
    pii = compute_pii(activities, iwr, bcs)

    return {
        "iwr": iwr,
        "bcs": bcs,
        "pii": pii,
        "total_hours": round(total_min / 60, 2),
        "invisible_hours": round(invisible_min / 60, 2),
        "visible_hours": round(visible_min / 60, 2),
        "total_activities": len(activities),
    }
