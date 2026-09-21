PROJECT CONTEXT:
InvisiWork is a full-stack invisible work tracking app built with Flask (Python) backend + Vanilla HTML/CSS/JS frontend + MongoDB. The system tracks developer activities, classifies them as "visible" or "invisible" work, and computes three metrics: IWR (Invisible Work Ratio), BCS (Burnout Correlation Score), and PII (Personal Impact Index).
PROBLEM BEING SOLVED:
The app was originally framed as "invisible work only" but we want developers to log ALL their work — both visible and invisible. The backend already handles both (classifier returns "visible" or "invisible", every activity document has a work_type field). The gap is entirely in the frontend UI/UX.

CHANGES REQUIRED — IMPLEMENT ALL OF THESE:

CHANGE 1 — dashboard.html: Replace the Quick Log Panel body
Find the <div class="qlp__body"> section inside <aside id="quick-log-panel"> and replace its entire contents with:

Two tabs at the top: "👁 Invisible Work" (active by default) and "✅ Visible Work"
Each tab shows its own category section
Invisible tab categories (12 total, exact strings matching backend): Code Review, Mentoring, Debugging (non-ticket), Documentation, Meetings, Planning, Peer Help, Knowledge Sharing, Production Incident Response, Learning / Research, Refactoring, Infrastructure
Visible tab categories (3 total): Feature Development, Bug Fix, Formal Testing / QA
A small hint text under each tab describing the work type
After selecting a category, show an auto-indicator pill that says either "👁 This will be tracked as Invisible Work" or "✅ This will be tracked as Visible Work"
Add a Date input field (type="date", defaulting to today) so users can log past work
Keep Description textarea and Duration number input
Keep the submit button, rename it "Log Work →"
Remove the old custom category input entirely
Each category button must have data-category="EXACT_BACKEND_STRING" — no shortcodes

Also change:

Welcome message <p> from "Here's an overview of your invisible work this week." → "Here's your work overview for this week — visible and invisible."
Quick Log panel header <h3> from "Quick Log" → "Log Work"


CHANGE 2 — dashboard.css: Add new CSS rules
Add these new style blocks (append after the existing .qlp__close styles):
css/* Work Type Tabs */
.qlp__type-tabs {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
  border-bottom: 2px solid var(--color-border);
  padding-bottom: 0;
}
.qlp__type-tab {
  flex: 1;
  padding: 10px var(--space-3);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  cursor: pointer;
  color: var(--color-text-muted);
  font-family: var(--font-family);
  transition: color var(--transition-base), border-color var(--transition-base);
  border-radius: 0;
}
.qlp__type-tab--invisible.qlp__type-tab--active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}
.qlp__type-tab--visible.qlp__type-tab--active {
  color: #10b981;
  border-bottom-color: #10b981;
}
.qlp__type-tab:hover { color: var(--color-text); }
.qlp__section-hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-bottom: var(--space-3);
  line-height: 1.5;
}
.qlp__work-type-indicator {
  margin-top: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-align: center;
}
.qlp__work-type-indicator--invisible {
  background: var(--color-primary-light);
  color: var(--color-primary);
  border: 1px solid var(--color-primary-border);
}
.qlp__work-type-indicator--visible {
  background: var(--color-success-bg);
  color: var(--color-success-text);
  border: 1px solid var(--color-success);
}

CHANGE 3 — dashboard.js: Rewrite the Quick Log Panel logic block
Find the entire /* QUICK LOG PANEL */ section (from const floatBtn to the end of the logDesc input listener) and replace with this logic:
javascript// Panel open/close (keep existing openPanel/closePanel/Escape logic)

// Client-side classifier mirror — matches backend exactly
const VISIBLE_CATEGORIES = new Set([
  'Feature Development', 'Bug Fix', 'Formal Testing / QA'
]);
function getWorkType(cat) {
  return VISIBLE_CATEGORIES.has(cat) ? 'visible' : 'invisible';
}

let selectedCategory = null;

// Default date to today
const logDate = document.getElementById('log-date');
if (logDate) logDate.value = new Date().toISOString().split('T')[0];

// Tab switching
document.querySelectorAll('.qlp__type-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.qlp__type-tab').forEach(t => t.classList.remove('qlp__type-tab--active'));
    tab.classList.add('qlp__type-tab--active');
    const type = tab.dataset.type;
    document.getElementById('invisible-cats').style.display = type === 'invisible' ? 'block' : 'none';
    document.getElementById('visible-cats').style.display = type === 'visible' ? 'block' : 'none';
    selectedCategory = null;
    document.querySelectorAll('.qlp__category-grid button').forEach(b => b.classList.remove('selected'));
    document.getElementById('work-type-indicator').style.display = 'none';
  });
});

// Category selection via event delegation
panel.addEventListener('click', (e) => {
  const btn = e.target.closest('.qlp__category-grid button');
  if (!btn) return;
  document.querySelectorAll('.qlp__category-grid button').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedCategory = btn.dataset.category;
  const wt = getWorkType(selectedCategory);
  const indicator = document.getElementById('work-type-indicator');
  const label = document.getElementById('work-type-label');
  indicator.style.display = 'block';
  indicator.className = 'qlp__work-type-indicator qlp__work-type-indicator--' + wt;
  label.textContent = wt === 'invisible'
    ? '👁 This will be tracked as Invisible Work'
    : '✅ This will be tracked as Visible Work';
});

// Submit — sends exact category string, no mapping needed
logSubmitBtn.addEventListener('click', async () => {
  if (!selectedCategory) { showToast('Please select a category first.', 'error'); return; }
  const desc = logDesc.value.trim();
  if (!desc) { /* show error */ return; }
  const duration = parseInt(logDuration.value, 10) || 30;
  const dateVal = logDate.value || new Date().toISOString().split('T')[0];
  logSubmitBtn.disabled = true;
  logSubmitBtn.textContent = 'Saving...';
  try {
    await apiFetch('/activities', {
      method: 'POST',
      body: JSON.stringify({ category: selectedCategory, description: desc, duration_min: duration, date: dateVal })
    });
    closePanel();
    showToast('Work logged successfully!', 'success');
    loadDashboardData();
    // reset form fields
  } catch(e) { showToast('Failed: ' + e.message, 'error'); }
  finally { logSubmitBtn.disabled = false; logSubmitBtn.textContent = 'Log Work →'; }
});

CHANGE 4 — utils.js: Expand getBadgeClass() map
Replace the existing const map = { ... } inside getBadgeClass() with this complete map:
javascriptconst map = {
  'review': 'badge--review',
  'code review': 'badge--review',
  'mentoring': 'badge--mentoring',
  'peer help': 'badge--mentoring',
  'knowledge sharing': 'badge--mentoring',
  'docs': 'badge--docs',
  'documentation': 'badge--docs',
  'learning / research': 'badge--docs',
  'meeting': 'badge--meeting',
  'meetings': 'badge--meeting',
  'planning': 'badge--planning',
  'debug': 'badge--debug',
  'debugging': 'badge--debug',
  'debugging (non-ticket)': 'badge--debug',
  'production incident response': 'badge--debug',
  'infra': 'badge--infra',
  'infrastructure': 'badge--infra',
  'refactoring': 'badge--infra',
  'feature development': 'badge--feature',
  'bug fix': 'badge--bugfix',
  'formal testing / qa': 'badge--qa',
  'other': 'badge--other'
};

CHANGE 5 — variables.css: Add 3 new badge token pairs
Find --badge-other-text: #374151; and add immediately after it:
css/* Visible work badges */
--badge-feature-bg: #dcfce7;
--badge-feature-text: #15803d;
--badge-bugfix-bg: #fce7f3;
--badge-bugfix-text: #9d174d;
--badge-qa-bg: #e0f2fe;
--badge-qa-text: #0369a1;

CHANGE 6 — components.css: Add 3 new badge CSS classes
Find .badge--other { ... } and add immediately after it:
css.badge--feature {
  background: var(--badge-feature-bg);
  color: var(--badge-feature-text);
}
.badge--bugfix {
  background: var(--badge-bugfix-bg);
  color: var(--badge-bugfix-text);
}
.badge--qa {
  background: var(--badge-qa-bg);
  color: var(--badge-qa-text);
}

CHANGE 7 — personal.js: Fix two getBadgeClass() calls
There are two places in personal.js that call getBadgeClass(item.badge). Change both to getBadgeClass(item.category) — one is inside animatePII() (PII top bars) and one is inside renderBreakdownBars().

DO NOT CHANGE:

Any backend Python files (classifier.py, models.py, routes.py, webhook.py, calculator.py)
MongoDB schema or indexes
The metrics calculations (IWR, BCS, PII formulas)
Any other HTML pages (personal-dashboard.html, reports.html, weekly-summary.html, etc.)
The auth-guard.js, api-client.js, theme.js, or navbar.js files