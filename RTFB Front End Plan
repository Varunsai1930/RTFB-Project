═══════════════════════════════════════════════════════════════════════════════
INVISIWORK — COMPLETE FRONTEND BUILD BRIEF
SINGLE-SHOT VIBE CODING PROMPT — PASTE DIRECTLY, BUILD EVERYTHING
═══════════════════════════════════════════════════════════════════════════════

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 1 — PROJECT IDENTITY & PURPOSE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Build the complete frontend for InvisiWork — an Invisible Work Analytics System for
software engineering teams. This is not a prototype. This is production-quality,
copy-paste-ready, fully functional code for every page, every component, every
interaction, every animation.

THE PROBLEM THIS SOLVES:
Developers spend enormous amounts of time on invisible work — code reviews, debugging,
mentoring teammates, knowledge sharing, documentation, handling production incidents,
learning new technologies — that never appears in sprint boards, commit logs, or
performance reviews. Traditional productivity metrics (commits, story points, tickets
closed) capture only visible output. The developers who hold teams together through
invisible work appear less productive than they are, receive unfair evaluations, and
burn out at higher rates. InvisiWork makes this invisible work visible, measurable,
and recognized.

TWO USER TYPES:
1. Developers — log daily activities, view personal metrics dashboards, track their own
   Invisible Work Ratio (IWR) and Burnout Correlation Score (BCS).
2. Managers / Team Leads — access team-wide analytics, compare effort distribution
   across all developers, identify burnout risk early, get a fair picture of real
   contribution.

A System Scheduler actor also exists conceptually — represented in the UI as
"Last updated: just now" auto-refresh micro-labels wherever live data would appear.

CORE CUSTOM METRICS (use these exact names and definitions everywhere in the UI):
- IWR (Invisible Work Ratio): Percentage of total logged hours spent on invisible work.
  Formula: (Invisible Work Hours / Total Work Hours) × 100.
  Thresholds: IWR > 60% = elevated (yellow indicator), IWR > 75% = critical (red).
- BCS (Burnout Correlation Score): 0–100 composite score. Below 40 = Low Risk (green),
  40–70 = Moderate (yellow), above 70 = High Risk (red). Higher = more burnout risk.
- PII (Personal Impact Index): Developer's overall contribution score factoring both
  visible and invisible effort. Score out of 100.

WORK CLASSIFICATION:
- VISIBLE WORK: Feature Development, Bug Fix (ticket-tracked), Formal Testing/QA
- INVISIBLE WORK: Code Review, Debugging (non-ticket), Peer Help, Mentoring,
  Knowledge Sharing, Documentation, Production Incident Response, Learning/Research,
  Refactoring, Infrastructure, Meetings, Planning

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 2 — TECH STACK (ABSOLUTE HARD CONSTRAINTS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ENFORCE EVERY RULE BELOW WITHOUT EXCEPTION:

- Pure HTML5, CSS3, ES6+ Vanilla JavaScript only.
- ZERO frameworks: no React, no Vue, no Angular, no Svelte, no Preact, no Alpine.
- ZERO CSS frameworks: no Bootstrap, no Tailwind, no Bulma, no Foundation.
  All styling hand-crafted using CSS custom properties, Flexbox, and CSS Grid.
- NO jQuery. NO external UI libraries of any kind.
- Font: Inter from Google Fonts CDN only. Import in base.css:
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
- Plotly.js CDN for all charts: https://cdn.plot.ly/plotly-latest.min.js
  Load it in every HTML page that renders charts.
- ALL data is hardcoded mock JavaScript objects in mock-data.js — zero API calls,
  zero fetch(), zero XMLHttpRequest. The frontend is fully self-contained.
- Fully responsive: mobile-first CSS, then tablet (min-width: 768px),
  then desktop (min-width: 1024px) breakpoints.
- ES6 modules (type="module" on script tags). Use const/let only. Zero var.
- All event listeners attached in JS files. Zero inline onclick/onchange in HTML.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 3 — COMPLETE DESIGN SYSTEM (css/variables.css)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generate css/variables.css as the single source of truth for every design token.
Every other CSS file imports or references these only — zero hardcoded hex values
anywhere outside variables.css.

:root {
  /* Color — Light Mode */
  --color-bg:              #f5f5f0;
  --color-bg-secondary:    #eeede8;
  --color-card:            #ffffff;
  --color-card-tint:       #f0fdf9;
  --color-primary:         #2bbfa4;
  --color-primary-dark:    #22a08a;
  --color-primary-light:   #f0fdf9;
  --color-primary-border:  #2bbfa4;
  --color-primary-glow:    rgba(43, 191, 164, 0.15);
  --color-text:            #1a1a1a;
  --color-text-muted:      #6b7280;
  --color-text-light:      #9ca3af;
  --color-border:          #e5e7eb;
  --color-shadow:          rgba(0, 0, 0, 0.08);
  --color-shadow-deep:     rgba(0, 0, 0, 0.16);
  --color-overlay:         rgba(0, 0, 0, 0.3);

  /* Status Colors */
  --color-success:         #10b981;
  --color-success-bg:      #d1fae5;
  --color-warning:         #f59e0b;
  --color-warning-bg:      #fef3c7;
  --color-danger:          #ef4444;
  --color-danger-bg:       #fee2e2;
  --color-info:            #3b82f6;
  --color-info-bg:         #dbeafe;

  /* Badge Color Pairs */
  --badge-review-bg:       #ccfbf1;
  --badge-review-text:     #0f766e;
  --badge-mentoring-bg:    #dbeafe;
  --badge-mentoring-text:  #1d4ed8;
  --badge-docs-bg:         #ffedd5;
  --badge-docs-text:       #c2410c;
  --badge-meeting-bg:      #f3e8ff;
  --badge-meeting-text:    #7e22ce;
  --badge-planning-bg:     #fef9c3;
  --badge-planning-text:   #a16207;
  --badge-other-bg:        #f3f4f6;
  --badge-other-text:      #374151;
  --badge-debug-bg:        #fce7f3;
  --badge-debug-text:      #be185d;
  --badge-infra-bg:        #e0f2fe;
  --badge-infra-text:      #0369a1;

  /* Typography */
  --font-family:           'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-size-xs:          0.75rem;
  --font-size-sm:          0.875rem;
  --font-size-base:        1rem;
  --font-size-lg:          1.125rem;
  --font-size-xl:          1.25rem;
  --font-size-2xl:         1.5rem;
  --font-size-3xl:         1.875rem;
  --font-size-4xl:         2.25rem;
  --font-weight-normal:    400;
  --font-weight-medium:    500;
  --font-weight-semibold:  600;
  --font-weight-bold:      700;
  --font-weight-extrabold: 800;
  --line-height-tight:     1.25;
  --line-height-base:      1.5;
  --line-height-relaxed:   1.75;

  /* Spacing (4px base unit) */
  --space-1:  0.25rem;
  --space-2:  0.5rem;
  --space-3:  0.75rem;
  --space-4:  1rem;
  --space-5:  1.25rem;
  --space-6:  1.5rem;
  --space-8:  2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-20: 5rem;
  --space-24: 6rem;

  /* Border Radius */
  --radius-sm:   6px;
  --radius-md:   12px;
  --radius-lg:   16px;
  --radius-xl:   24px;
  --radius-pill: 999px;

  /* Transitions */
  --transition-base:  0.2s ease;
  --transition-slow:  0.3s ease;
  --transition-spring: 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

  /* Shadows */
  --shadow-sm:  0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md:  0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04);
  --shadow-lg:  0 8px 24px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06);
  --shadow-xl:  0 16px 40px rgba(0,0,0,0.16), 0 8px 16px rgba(0,0,0,0.08);

  /* Navbar */
  --navbar-height: 64px;

  /* Z-index scale */
  --z-dropdown:  100;
  --z-panel:     200;
  --z-overlay:   300;
  --z-modal:     400;
  --z-toast:     500;
}

/* DARK MODE — Toggle by adding .dark to <body> */
body.dark {
  --color-bg:              #0f172a;
  --color-bg-secondary:    #0a1020;
  --color-card:            #1e293b;
  --color-card-tint:       #162032;
  --color-primary:         #2bbfa4;
  --color-primary-dark:    #22a08a;
  --color-primary-light:   #162032;
  --color-primary-border:  #2bbfa4;
  --color-text:            #f1f5f9;
  --color-text-muted:      #94a3b8;
  --color-text-light:      #64748b;
  --color-border:          #334155;
  --color-shadow:          rgba(0, 0, 0, 0.3);
  --color-shadow-deep:     rgba(0, 0, 0, 0.5);
  --color-overlay:         rgba(0, 0, 0, 0.6);
}

/* Global color transitions for dark mode switching */
*, *::before, *::after {
  transition: background-color var(--transition-slow),
              color var(--transition-slow),
              border-color var(--transition-slow);
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 4 — EXACT FILE & FOLDER STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generate this exact structure with every file fully implemented:

invisiwork/
├── index.html               ← Landing page
├── get-started.html         ← Onboarding / sign-up flow
├── dashboard.html           ← Main team/activity dashboard (highest priority)
├── personal-dashboard.html  ← Developer personal metrics
├── weekly-summary.html      ← Weekly activity summary
│
├── css/
│   ├── variables.css        ← ALL CSS custom properties (light + dark) — source of truth
│   ├── base.css             ← Reset, typography, Inter font import, body defaults
│   ├── components.css       ← Reusable: cards, buttons, badges, inputs, tables, modals
│   ├── navbar.css           ← Navbar, dropdown, mobile drawer styles
│   ├── skeleton.css         ← Shimmer skeleton loading animation
│   ├── landing.css          ← Landing page only styles
│   ├── dashboard.css        ← Main dashboard styles
│   ├── personal.css         ← Personal dashboard styles
│   └── weekly.css           ← Weekly summary styles
│
├── js/
│   ├── theme.js             ← Dark mode toggle + localStorage persistence
│   ├── navbar.js            ← Navbar scroll, dropdown, mobile drawer logic
│   ├── mock-data.js         ← ALL hardcoded data (developers, activities, metrics)
│   ├── dashboard.js         ← Main dashboard logic
│   ├── personal.js          ← Personal dashboard + chart rendering
│   ├── weekly.js            ← Weekly summary + week navigation + table sorting
│   ├── onboarding.js        ← Get-started form validation + animation
│   └── utils.js             ← countUp(), formatDuration(), skeleton show/hide, toast

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 5 — GLOBAL COMPONENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

── 5A. NAVBAR (navbar.css + navbar.js — identical on all pages with role variants) ──

Structure: <nav class="navbar"> with height exactly 64px, background var(--color-card),
box-shadow: 0 1px 0 var(--color-border).

LEFT SIDE:
  <div class="navbar__brand">
    SVG eye icon (24×24, stroke var(--color-primary), strokeWidth 2) + wordmark
    "InvisiWork" in font-weight 700, color var(--color-text). Clicking navigates to
    index.html. Eye SVG: a simple open eye shape with a pupil circle — draw in pure SVG.

RIGHT SIDE — Landing page variant (index.html):
  Dark mode toggle button (sun/moon SVG icon, outlined, no background) +
  "Sign In" button with class .btn--outline (border 1.5px solid var(--color-border),
  color var(--color-text), background transparent, hover: border-color var(--color-primary),
  color var(--color-primary)).

RIGHT SIDE — App pages variant (dashboard, personal, weekly):
  Dark mode toggle + nav links row + user avatar.

NAV LINKS (app pages only):
  "Dashboard" (with dropdown chevron icon), "Reports", "Team" — all anchors,
  font-weight 500, color var(--color-text-muted), hover: color var(--color-primary).
  Active link: color var(--color-primary) + 2px solid underline offset 4px below.

DASHBOARD DROPDOWN:
  Trigger: hover (desktop) or click (mobile) on "Dashboard" nav link.
  Dropdown panel: position absolute, top 100% of nav link, left 0, min-width 220px,
  background var(--color-card), border-radius var(--radius-md), border 1px solid
  var(--color-border), box-shadow var(--shadow-lg), z-index var(--z-dropdown).

  Entry animation: transform translateY(-8px) → translateY(0), opacity 0 → 1,
  transition 0.25s ease. Use visibility + opacity technique (not display:none) so
  transition works.

  Two items in panel:
    Item 1: "📊 Personal Dashboard" → href personal-dashboard.html
    Item 2: "📅 Weekly Summary"     → href weekly-summary.html
  Each item: padding 12px 16px, display flex, align-items center, gap 10px,
  font-size var(--font-size-sm), color var(--color-text), border-radius 6px,
  hover: background var(--color-primary-light), border-left 3px solid var(--color-primary),
  color var(--color-primary). Transition: all 0.15s ease.

USER AVATAR (app pages, right side):
  Circle 36px diameter, background linear-gradient(135deg, var(--color-primary), #1a9980),
  color white, font-weight 600, font-size var(--font-size-sm). Show initials "AK" (Alex
  Kumar, the mock developer). To the right: "Alex Kumar" in font-size var(--font-size-sm),
  font-weight 500 — hide below 768px.

SCROLL BEHAVIOR (navbar.js):
  On window scroll, if scrollY > 10: add class .navbar--scrolled to <nav>.
  .navbar--scrolled: box-shadow 0 4px 12px rgba(0,0,0,0.08), backdrop-filter blur(8px).
  Remove class when scrollY ≤ 10. Use requestAnimationFrame for performance.

MOBILE NAVBAR (below 768px):
  Hide nav links + user name. Show hamburger button (three horizontal lines SVG, 20px,
  color var(--color-text), no background, no border).
  On hamburger click: toggle .navbar__drawer — a full-width panel that slides down
  from below the navbar (max-height 0 → 400px, overflow hidden, transition 0.3s ease).
  Drawer background: var(--color-card), padding 16px, border-top 1px solid var(--color-border).
  Inside drawer: all nav links stacked vertically, 44px touch targets.
  Dashboard accordion inside drawer: tapping "Dashboard" expands to show Personal Dashboard
  and Weekly Summary links with teal left-accent, indented 16px.

── 5B. BASE STYLES (base.css) ──

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: var(--font-family); background: var(--color-bg);
  color: var(--color-text); line-height: var(--line-height-base);
  font-size: var(--font-size-base); -webkit-font-smoothing: antialiased; }
a { color: inherit; text-decoration: none; }
img { max-width: 100%; display: block; }
button { cursor: pointer; font-family: inherit; }
Page min-height: 100vh. Main content area: padding-top var(--navbar-height).

── 5C. REUSABLE COMPONENTS (components.css) ──

CARDS:
  .card { background var(--color-card); border-radius var(--radius-md);
  border 1px solid var(--color-border); box-shadow var(--shadow-sm);
  padding var(--space-6); }
  .card:hover { transform translateY(-2px); box-shadow var(--shadow-md);
  transition var(--transition-base); }
  .card--teal { background var(--color-card-tint); border-color var(--color-primary-border); }
  .card--featured { border-left 3px solid var(--color-primary); }

BUTTONS:
  .btn { display inline-flex; align-items center; gap var(--space-2);
  padding 10px 20px; border-radius var(--radius-pill); font-weight var(--font-weight-semibold);
  font-size var(--font-size-sm); border none; transition var(--transition-base);
  white-space nowrap; }
  .btn--primary { background var(--color-primary); color #fff; }
  .btn--primary:hover { background var(--color-primary-dark); }
  .btn--primary:active { transform scale(0.97); }
  .btn--outline { background transparent; border 1.5px solid var(--color-border);
  color var(--color-text); }
  .btn--outline:hover { border-color var(--color-primary); color var(--color-primary); }
  .btn--ghost { background transparent; color var(--color-primary); }
  .btn--ghost:hover { background var(--color-primary-light); }
  .btn--lg { padding 14px 28px; font-size var(--font-size-base); }
  .btn--full { width 100%; justify-content center; }

BADGES:
  .badge { display inline-flex; align-items center; padding 3px 10px;
  border-radius var(--radius-pill); font-size var(--font-size-xs);
  font-weight var(--font-weight-semibold); white-space nowrap; }
  .badge--review { background var(--badge-review-bg); color var(--badge-review-text); }
  .badge--mentoring { background var(--badge-mentoring-bg); color var(--badge-mentoring-text); }
  .badge--docs { background var(--badge-docs-bg); color var(--badge-docs-text); }
  .badge--meeting { background var(--badge-meeting-bg); color var(--badge-meeting-text); }
  .badge--planning { background var(--badge-planning-bg); color var(--badge-planning-text); }
  .badge--debug { background var(--badge-debug-bg); color var(--badge-debug-text); }
  .badge--infra { background var(--badge-infra-bg); color var(--badge-infra-text); }
  .badge--other { background var(--badge-other-bg); color var(--badge-other-text); }

INPUTS:
  .input { width 100%; padding 12px 14px; border 1.5px solid var(--color-border);
  border-radius var(--radius-sm); font-size var(--font-size-base); font-family inherit;
  background var(--color-card); color var(--color-text);
  transition border-color 0.2s ease, box-shadow 0.2s ease; outline none; }
  .input:focus { border-color var(--color-primary);
  box-shadow 0 0 0 3px var(--color-primary-glow); }
  .input.error { border-color var(--color-danger); }
  .input.error:focus { box-shadow 0 0 0 3px rgba(239,68,68,0.15); }

SHAKE ANIMATION:
  @keyframes shake {
    0%, 100% { transform translateX(0); }
    20% { transform translateX(-6px); }
    40% { transform translateX(6px); }
    60% { transform translateX(-4px); }
    80% { transform translateX(4px); }
  }
  .shake { animation shake 0.4s ease; }

── 5D. SKELETON LOADING (skeleton.css + utils.js) ──

Skeleton shimmer:
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  .skeleton {
    background: linear-gradient(90deg,
      var(--color-border) 25%,
      var(--color-bg-secondary) 50%,
      var(--color-border) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite linear;
    border-radius: var(--radius-sm);
  }

In utils.js, implement:
  showSkeletons(containerEl) — replaces content with appropriate skeleton shapes
  hideSkeletons(containerEl) — removes skeletons, fades in real content

Every page that uses skeletons: on DOMContentLoaded, show skeletons immediately.
After exactly 1200ms (setTimeout), call hideSkeletons() — fade real content in
(opacity 0 → 1 over 400ms, class .content-ready transition).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 6 — MOCK DATA (js/mock-data.js)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Export a single MOCK object as a JS module. Include all of the following:

export const MOCK = {

  currentUser: {
    id: 'dev_001',
    name: 'Alex Kumar',
    initials: 'AK',
    email: 'alex.kumar@techcorp.io',
    role: 'developer',
    team: 'Platform Engineering',
    joinedDate: '2024-01-15',
    streak: 12,
    isTopContributor: true
  },

  kpis: {
    todayTasks: 7,
    todayTasksDelta: '+2 from yesterday',
    weekHours: 18.5,
    weekHoursAvg: '4.2h avg/day',
    reviewsDone: 12,
    reviewsDelta: '+3 this week',
    impactScore: 94,
    impactLabel: 'Top 10% this month',
    iwr: 78,
    bcs: 34,
    pii: 82,
    weekTarget: 40,
    weekLogged: 18.5
  },

  recentActivities: [
    { id: 1, category: 'review',    label: 'Code Review', description: 'Reviewed PR #847 — Auth service refactor',        timeAgo: '2h ago',   duration: '1h 30m', type: 'invisible' },
    { id: 2, category: 'mentoring', label: 'Mentoring',   description: 'Helped Priya debug the Redis cache issue',        timeAgo: '4h ago',   duration: '45m',    type: 'invisible' },
    { id: 3, category: 'debug',     label: 'Debugging',   description: 'Traced and resolved payment gateway timeout bug', timeAgo: '5h ago',   duration: '2h',     type: 'invisible' },
    { id: 4, category: 'docs',      label: 'Docs',        description: 'Wrote onboarding guide for new API endpoints',   timeAgo: 'Yesterday',duration: '1h',     type: 'invisible' },
    { id: 5, category: 'meeting',   label: 'Meeting',     description: 'Sprint planning — Q2 roadmap review',             timeAgo: 'Yesterday',duration: '1h 30m', type: 'invisible' },
    { id: 6, category: 'review',    label: 'Code Review', description: 'Reviewed frontend component library updates',    timeAgo: '2 days ago',duration: '1h',    type: 'invisible' }
  ],

  quickStats: {
    topCategoryThisWeek: 'Code Review',
    topCategoryBadge: 'review',
    motivationalInsight: "You're in the top 15% of your team this week 🚀",
    weeklyProgressPercent: 46
  },

  piiBreakdown: [
    { category: 'Code Review',    value: 32, badge: 'review'    },
    { category: 'Mentoring',      value: 18, badge: 'mentoring' },
    { category: 'Documentation',  value: 15, badge: 'docs'      },
    { category: 'Debugging',      value: 20, badge: 'debug'     },
    { category: 'Meetings',       value: 10, badge: 'meeting'   },
    { category: 'Planning',       value: 5,  badge: 'planning'  }
  ],

  weeks: {
    current: {
      label: 'Mar 17 – Mar 23, 2025',
      stats: { totalHours: 18.5, totalActivities: 24, mostActiveDay: 'Wednesday', topCategory: 'Code Review' },
      dailyHours: [2.5, 4.0, 5.5, 3.0, 2.0, 1.5, 0],
      highlight: 'This week you completed 8 code reviews — that\'s in the top 15% of your team. 🎉',
      activities: [
        { date: 'Mon Mar 17', category: 'review',    label: 'Code Review',   description: 'Auth service PR review',            duration: '1h 30m' },
        { date: 'Mon Mar 17', category: 'mentoring', label: 'Mentoring',     description: 'Helped Priya with Redis debugging',  duration: '45m'    },
        { date: 'Tue Mar 18', category: 'debug',     label: 'Debugging',     description: 'Payment gateway timeout fix',        duration: '2h'     },
        { date: 'Tue Mar 18', category: 'review',    label: 'Code Review',   description: 'Component library PR',               duration: '1h'     },
        { date: 'Wed Mar 19', category: 'docs',      label: 'Documentation', description: 'API onboarding guide',               duration: '1h'     },
        { date: 'Wed Mar 19', category: 'meeting',   label: 'Meeting',       description: 'Sprint planning session',            duration: '1h 30m' },
        { date: 'Wed Mar 19', category: 'review',    label: 'Code Review',   description: 'Database migration script review',   duration: '1h'     },
        { date: 'Thu Mar 20', category: 'planning',  label: 'Planning',      description: 'Architecture design for Q2 feature', duration: '2h'     },
        { date: 'Thu Mar 20', category: 'mentoring', label: 'Mentoring',     description: 'Code walkthrough for new hire',      duration: '1h'     },
        { date: 'Fri Mar 21', category: 'review',    label: 'Code Review',   description: 'CI/CD pipeline config review',       duration: '45m'    },
        { date: 'Fri Mar 21', category: 'debug',     label: 'Debugging',     description: 'Flaky test investigation',           duration: '1h 15m' }
      ]
    },
    prev1: {
      label: 'Mar 10 – Mar 16, 2025',
      stats: { totalHours: 22.0, totalActivities: 28, mostActiveDay: 'Tuesday', topCategory: 'Debugging' },
      dailyHours: [3.0, 5.5, 4.0, 4.5, 3.0, 2.0, 0],
      highlight: 'Strong debugging week — you resolved 5 production incidents. That\'s exceptional. 💪',
      activities: [
        { date: 'Mon Mar 10', category: 'review',   label: 'Code Review', description: 'Weekly PR batch review',          duration: '2h'    },
        { date: 'Tue Mar 11', category: 'debug',    label: 'Debugging',   description: 'Production incident #2201',       duration: '3h'    },
        { date: 'Tue Mar 11', category: 'mentoring',label: 'Mentoring',   description: 'Onboarding session — new hire',   duration: '1h'    },
        { date: 'Wed Mar 12', category: 'docs',     label: 'Docs',        description: 'Runbook update for infra team',   duration: '1h 30m'},
        { date: 'Thu Mar 13', category: 'meeting',  label: 'Meeting',     description: 'Cross-team sync',                 duration: '1h'    },
        { date: 'Fri Mar 14', category: 'review',   label: 'Code Review', description: 'Security audit PR review',        duration: '2h'    }
      ]
    },
    prev2: {
      label: 'Mar 3 – Mar 9, 2025',
      stats: { totalHours: 15.5, totalActivities: 19, mostActiveDay: 'Thursday', topCategory: 'Meetings' },
      dailyHours: [1.5, 2.0, 3.0, 5.0, 2.5, 1.5, 0],
      highlight: 'High meeting load this week. Consider blocking deep-work time next week to rebalance.',
      activities: [
        { date: 'Mon Mar 3',  category: 'meeting',  label: 'Meeting',     description: 'Monthly all-hands',              duration: '2h'    },
        { date: 'Wed Mar 5',  category: 'planning', label: 'Planning',    description: 'Q2 roadmap planning session',     duration: '3h'    },
        { date: 'Thu Mar 6',  category: 'review',   label: 'Code Review', description: 'Feature branch review',          duration: '1h'    },
        { date: 'Thu Mar 6',  category: 'mentoring',label: 'Mentoring',   description: 'Architecture discussion',         duration: '2h'    },
        { date: 'Fri Mar 7',  category: 'docs',     label: 'Docs',        description: 'Team wiki updates',              duration: '1h'    }
      ]
    }
  },

  statsCounter: {
    hoursTracked: 12400,
    teamsActive: 320,
    reviewsLogged: 48000
  }
};

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 7 — PAGE 1: LANDING PAGE (index.html + landing.css)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HTML head: link variables.css, base.css, components.css, navbar.css, landing.css.
Script tags (type="module"): theme.js, navbar.js.
Inline script at bottom of body: run countUpStats() after 600ms.

── HERO SECTION ──

Container: max-width 1100px, margin auto, padding 80px 24px 60px, text-align center.

PAGE LOAD STAGGER ANIMATION:
All sections start with opacity 0 + transform translateY(16px). JS adds .animate-in
class after DOMContentLoaded with increasing delays: hero (0ms), stats-row (200ms),
features (400ms), cta-section (600ms).
.animate-in { opacity 1; transform translateY(0); transition opacity 0.6s ease,
transform 0.6s ease; }

PILL BADGE (top of hero):
<span class="hero__pill">👁 Free for teams up to 10</span>
Styles: display inline-flex, padding 6px 16px, border-radius var(--radius-pill),
border 1.5px solid var(--color-primary), background var(--color-primary-light),
color var(--color-primary), font-size var(--font-size-sm), font-weight 600,
margin-bottom var(--space-6).

HEADLINE:
<h1 class="hero__title">
  <span class="hero__title--dark">Your invisible work,</span><br>
  <span class="hero__title--teal">finally visible.</span>
</h1>
Font-size: clamp(2.5rem, 5vw, 4rem). Font-weight 800. Line-height 1.15.
--dark span: color var(--color-text). --teal span: color var(--color-primary).
Margin-bottom var(--space-5).

SUBTEXT:
<p class="hero__sub">Track code reviews, mentoring, docs, and every contribution
that never makes it into a ticket.</p>
Max-width 520px, margin 0 auto var(--space-8), color var(--color-text-muted),
font-size var(--font-size-lg), line-height var(--line-height-relaxed).

CTA ROW:
<div class="hero__cta">
  <a href="get-started.html" class="btn btn--primary btn--lg">Get Started →</a>
  <span class="hero__cta-note">No credit card required</span>
</div>
Display flex, align-items center, justify-content center, gap var(--space-4), flex-wrap wrap.
.hero__cta-note: color var(--color-text-muted), font-size var(--font-size-sm).

── STATS ROW ──

<section class="stats-row">
  <p class="stats-row__label">Trusted by engineering teams worldwide</p>
  Three stat cards in a row.
</section>

.stats-row__label: color var(--color-text-muted), font-size var(--font-size-sm),
text-align center, margin-bottom var(--space-6), position relative.
Add a decorative horizontal rule on each side: ::before and ::after pseudo-elements,
height 1px, background var(--color-border), flex-grow 1 — use flex layout on the label.
Wrap in <div class="stats-row__label-wrap" style="display:flex;align-items:center;gap:16px;max-width:600px;margin:0 auto 24px">

Stat cards grid: display grid, grid-template-columns repeat(3, 1fr), gap var(--space-5),
max-width 800px, margin 0 auto. Tablet: stays 3 cols. Mobile: 1fr.

Each stat card (.stat-card): class card, text-align center, padding var(--space-8).
  <div class="stat-card__value" data-target="12400">0</div>
    → font-size var(--font-size-3xl), font-weight 800, color var(--color-text)
  <div class="stat-card__suffix">+ Hours tracked</div>
    → color var(--color-text-muted), font-size var(--font-size-sm), margin-top var(--space-2)

countUpStats() in landing.js inline script (or utils.js): for each .stat-card__value,
read data-target, animate from 0 to target over 1500ms using easeOutQuart easing.
Display with commas (toLocaleString()).

── FEATURES SECTION ──

<section class="features">
  <h2 class="features__title">Built for the work nobody tracks</h2>
  <p class="features__sub">Everything your team contributes, finally in one place.</p>
  <div class="features__grid">...</div>
</section>

.features: max-width 1100px, margin 0 auto, padding 80px 24px.
.features__title: text-align center, font-size clamp(1.75rem, 3vw, 2.5rem), font-weight 800, margin-bottom var(--space-3).
.features__sub: text-align center, color var(--color-text-muted), margin-bottom var(--space-12).
.features__grid: display grid, grid-template-columns repeat(3, 1fr), gap var(--space-6).
Tablet: 1fr 1fr + third card full-width. Mobile: 1fr.

CARD 1 — Track Everything (standard layout):
  Icon centered top (clipboard with check, SVG, 40px, teal).
  <h3>Track Everything</h3> margin 16px 0 8px, centered.
  <p> description text centered, muted.

CARD 2 — Team Visibility (featured card, card--teal, card--featured):
  Slightly more padding. border-left 3px solid var(--color-primary).
  Icon + title on same row inline at top (flex, gap 12px, align-items center).
  <h3>Team Visibility</h3> then <p> description below.
  Small "⭐ Featured" badge top-right absolute inside card.

CARD 3 — Impact Metrics (icon-left-of-title layout):
  Icon and h3 on same row at top (flex, gap 10px, align-items flex-start, icon 32px).
  Description below.

All feature card icons: pure inline SVG, stroke var(--color-primary), strokeWidth 1.5,
fill none, size 40px (Card 1), 36px (Card 3).

── CTA SECTION ──

<section class="cta-section">
  <h2>Ready to make your work count?</h2>
  <p>Join hundreds of engineering teams already tracking their invisible contributions.</p>
  <a href="get-started.html" class="btn btn--primary btn--lg">Start Tracking →</a>
</section>

.cta-section: background var(--color-primary-light), border-radius var(--radius-xl),
border 1px solid var(--color-primary-border), padding var(--space-20) var(--space-8),
text-align center, margin var(--space-8) var(--space-6).
h2: font-size clamp(1.5rem, 3vw, 2.25rem), font-weight 800, margin-bottom var(--space-3).
p: color var(--color-text-muted), margin-bottom var(--space-8).

── FOOTER ──

<footer class="footer">
  <div class="footer__inner">
    <div class="footer__brand">eye SVG + "InvisiWork"</div>
    <p class="footer__tagline">Built for teams that value all contributions.</p>
  </div>
</footer>

.footer: border-top 1px solid var(--color-border), padding var(--space-8) var(--space-6),
background var(--color-card).
.footer__inner: max-width 1100px, margin 0 auto, display flex, justify-content space-between,
align-items center, flex-wrap wrap, gap var(--space-4).
.footer__tagline: color var(--color-text-muted), font-size var(--font-size-sm).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 8 — PAGE 2: ONBOARDING (get-started.html + onboarding.js)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

No navbar. Minimal centered layout. Background var(--color-bg).

LOGO: centered at top, 32px padding-top. Eye SVG + "InvisiWork" in same style as navbar.
href="index.html".

STEP INDICATOR:
<div class="steps">
  <div class="step step--active"><span class="step__dot"></span><span>Account</span></div>
  <div class="step__line"></div>
  <div class="step"><span class="step__dot"></span><span>Your Team</span></div>
  <div class="step__line"></div>
  <div class="step"><span class="step__dot"></span><span>First Log</span></div>
</div>

.steps: display flex, align-items center, justify-content center, gap 0, margin 40px 0 32px.
.step: display flex, flex-direction column, align-items center, gap 8px,
  font-size var(--font-size-xs), font-weight 600, color var(--color-text-muted).
.step__dot: width 28px, height 28px, border-radius 50%, background var(--color-border),
  border 2px solid var(--color-border), display block.
.step--active .step__dot: background var(--color-primary), border-color var(--color-primary).
.step--active span (text): color var(--color-primary).
.step__line: flex 1, height 2px, background var(--color-border), min-width 48px.

WHITE CARD:
max-width 440px, margin 0 auto, padding var(--space-10) var(--space-8), class card.

INSIDE CARD:
  <h1>Let's get you set up</h1> — font-size var(--font-size-2xl), font-weight 800,
  margin-bottom var(--space-2).
  <p>Enter your work email to create your free account.</p> — muted, margin-bottom var(--space-8).
  <label for="email">Work Email</label> — font-size var(--font-size-sm), font-weight 500,
  display block, margin-bottom var(--space-2).
  <input id="email" type="email" class="input" placeholder="alex@yourcompany.io">
  <p class="error-msg" id="email-error" style="display:none">
    Please enter a valid work email address.
  </p>
  gap of var(--space-4)
  <label for="name">Full Name</label>
  <input id="name" type="text" class="input" placeholder="Alex Kumar">
  <button id="create-btn" class="btn btn--primary btn--full btn--lg" style="margin-top:24px">
    Create Account →
  </button>
  <p style="text-align:center;margin-top:16px;font-size:0.875rem;color:var(--color-text-muted)">
    Already have an account? <a href="dashboard.html" style="color:var(--color-primary)">Sign in</a>
  </p>

ONBOARDING JS (onboarding.js):
  On #create-btn click:
    1. Prevent default.
    2. Validate email with regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
       If invalid: show #email-error, add .error class to input, add .shake class to input
       (remove shake after 400ms with setTimeout). Return.
    3. If valid: Hide error. Replace button innerHTML with spinner:
       <span class="spinner"></span> Loading...
       Spinner: CSS animation — .spinner { display inline-block; width 16px; height 16px;
       border 2px solid rgba(255,255,255,0.3); border-top-color white;
       border-radius 50%; animation spin 0.7s linear infinite; }
       @keyframes spin { to { transform rotate(360deg); } }
    4. After 800ms: window.location.href = 'dashboard.html'

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 9 — PAGE 3: MAIN DASHBOARD (dashboard.html + dashboard.css + dashboard.js)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

THIS IS THE HIGHEST PRIORITY PAGE. Build it with full completeness and polish.
CSS link order: variables.css, base.css, components.css, navbar.css, skeleton.css,
dashboard.css. Scripts: theme.js, navbar.js, mock-data.js (type="module"), dashboard.js.

── WELCOME HEADER ──

<section class="welcome-header">
  <div class="welcome-header__left">
    <h1>Welcome back, there 👋</h1>
    <p>Here's an overview of your invisible work this week.</p>
  </div>
  <div class="welcome-header__right">
    <span class="badge badge--review" style="font-size:0.8rem;padding:6px 14px">
      ⭐ Top contributor
    </span>
    <p class="last-updated">🕐 Last updated: just now</p>
  </div>
</section>

.welcome-header: display flex, justify-content space-between, align-items flex-start,
flex-wrap wrap, gap var(--space-4), padding var(--space-8) var(--space-6) var(--space-6),
max-width 1400px, margin 0 auto.
h1: font-size clamp(1.5rem, 2.5vw, 2rem), font-weight 800.
p (sub): color var(--color-text-muted), font-size var(--font-size-base), margin-top var(--space-1).
.last-updated: color var(--color-text-light), font-size var(--font-size-xs), margin-top var(--space-2).

── SKELETON LOADING ──

On DOMContentLoaded in dashboard.js: all content sections start with class .skeleton-wrap
and child .skeleton elements visible. After 1200ms: JS removes skeleton-wrap, adds
.content-loaded class to parent (opacity 0 → 1 transition 400ms ease).

── KPI CARDS ROW ──

<section class="kpi-row" id="kpi-section">
  Four cards as .card with additional .kpi-card class.
</section>

.kpi-row: display grid, grid-template-columns 1fr 1fr 1fr 1.3fr, gap var(--space-5),
max-width 1400px, margin 0 auto, padding 0 var(--space-6) var(--space-6).
Tablet (max-width 1024px): grid-template-columns 1fr 1fr.
Mobile (max-width 640px): grid-template-columns 1fr.

CARD STRUCTURE (each):
<div class="card kpi-card" data-animate>
  <div class="kpi-card__header">
    <span class="kpi-card__icon">SVG icon</span>
    <span class="kpi-card__label">Today's Tasks</span>
  </div>
  <div class="kpi-card__value" data-countup data-target="7">7</div>
  <div class="kpi-card__sub">+2 from yesterday</div>
</div>

CARD 1 (Today's Tasks): icon = clipboard SVG (teal stroke), value = 7, delta = "+2 from yesterday".
CARD 2 (This Week): icon = clock SVG (amber stroke — #f59e0b), value = "18.5h" (no countup, just render),
  sub = "4.2h avg/day".
CARD 3 (Reviews Done): icon = eye SVG (purple stroke — #7c3aed), value = 12, delta = "+3 this week".
CARD 4 (Impact Score — featured): class="card kpi-card kpi-card--featured card--teal",
  background linear-gradient(135deg, var(--color-primary-light), var(--color-card)),
  border: 1.5px solid var(--color-primary), slightly wider via grid span.
  icon = trending-up arrow SVG (green — #10b981), value = 94, sub = "Top 10% this month".
  Inside card also show: <span class="badge" style="background:#dcfce7;color:#166534">
    ⭐ Top 10%</span> positioned top-right (absolute).

.kpi-card: padding var(--space-6).
.kpi-card__header: display flex, align-items center, gap var(--space-3), margin-bottom var(--space-4).
.kpi-card__icon: 40px × 40px, border-radius var(--radius-sm), background var(--color-primary-light),
  display flex, align-items center, justify-content center.
.kpi-card__label: font-size var(--font-size-sm), font-weight 600, color var(--color-text-muted).
.kpi-card__value: font-size clamp(1.75rem, 3vw, 2.5rem), font-weight 800, color var(--color-text).
.kpi-card__sub: font-size var(--font-size-xs), color var(--color-text-muted), margin-top var(--space-1).

COUNT-UP on KPI values (dashboard.js): after skeleton clears, run countUp() from utils.js
on each [data-countup] element. Animate 0 → target over 800ms, easeOutQuart.

── TWO-COLUMN MAIN AREA ──

<div class="dashboard__main">
  <section class="activity-feed card" id="activity-feed">...</section>
  <aside class="quick-stats card" id="quick-stats">...</aside>
</div>

.dashboard__main: display grid, grid-template-columns 2fr 1fr, gap var(--space-5),
max-width 1400px, margin 0 auto, padding 0 var(--space-6) var(--space-8).
Tablet + Mobile (max-width 900px): grid-template-columns 1fr.

── ACTIVITY FEED ──

HEADER:
<div class="feed__header">
  <h2>Recent Activity</h2>
  <a href="#" class="btn btn--ghost" style="font-size:0.875rem">View all</a>
</div>
Display flex, justify-content space-between, align-items center, margin-bottom var(--space-5).

ACTIVITY LIST: <ul id="activity-list" class="activity-list">

Each row rendered via JS from MOCK.recentActivities:
<li class="activity-item">
  <span class="badge badge--{category}">{label}</span>
  <span class="activity-item__desc">{description}</span>
  <span class="activity-item__meta">
    <span class="activity-item__time">{timeAgo}</span>
    <span class="activity-item__duration">{duration}</span>
  </span>
</li>

.activity-item: display flex, align-items center, gap var(--space-4), padding var(--space-4) var(--space-3),
border-radius var(--radius-sm), transition background var(--transition-base).
hover: background var(--color-bg).
.activity-item__desc: flex 1, font-size var(--font-size-sm), color var(--color-text).
.activity-item__meta: display flex, flex-direction column, align-items flex-end, gap 2px.
.activity-item__time: font-size var(--font-size-xs), color var(--color-text-muted).
.activity-item__duration: font-size var(--font-size-xs), color var(--color-text-muted), font-weight 500.

EMPTY STATE (shown when activity array is empty):
<div class="empty-state" id="empty-state" style="display:none">
  <svg ...> centered teal clipboard icon, 80px </svg>
  <h3>No activity logged yet</h3>
  <p>Use the Log Work button to track your first invisible contribution.</p>
  <button class="btn btn--primary" id="empty-log-btn">Log Your First Activity →</button>
</div>
.empty-state: text-align center, padding var(--space-16) var(--space-8), color var(--color-text-muted).
h3: color var(--color-text), font-weight 700, margin var(--space-4) 0 var(--space-2).
p: margin-bottom var(--space-6).
JS: if MOCK.recentActivities.length === 0, show #empty-state, hide list. Else reverse.

NEW ITEM SLIDE-DOWN ANIMATION:
When JS prepends a new activity after Quick Log submit:
New item starts: opacity 0, transform translateY(-16px), max-height 0.
Animate to: opacity 1, transform translateY(0), max-height 80px over 300ms ease.

── QUICK STATS PANEL (right sidebar) ──

<aside class="quick-stats card">
  <h3 style="font-weight:700;margin-bottom:16px">This Week</h3>
  
  <!-- Progress bar: hours logged vs target -->
  <div class="qs__progress-section">
    <div class="qs__progress-header">
      <span>Hours Logged</span>
      <span class="qs__progress-value">18.5h / 40h</span>
    </div>
    <div class="qs__progress-track">
      <div class="qs__progress-fill" style="width:46%"></div>
    </div>
  </div>

  <!-- Top category badge -->
  <div class="qs__section">
    <p class="qs__label">Top Category</p>
    <span class="badge badge--review">Code Review</span>
  </div>

  <!-- Motivational insight -->
  <div class="qs__insight">
    <p>You're in the top 15% of your team this week 🚀</p>
  </div>

  <!-- IWR quick indicator -->
  <div class="qs__section">
    <p class="qs__label">Invisible Work Ratio</p>
    <div class="qs__iwr">
      <span class="qs__iwr-value">78%</span>
      <span class="qs__iwr-badge" style="background:#fef9c3;color:#a16207;padding:2px 10px;
        border-radius:999px;font-size:0.75rem;font-weight:600">Elevated</span>
    </div>
    <div class="qs__progress-track" style="margin-top:8px">
      <div class="qs__progress-fill" style="width:78%;background:#f59e0b"></div>
    </div>
  </div>

  <!-- CTA to personal dashboard -->
  <a href="personal-dashboard.html" class="btn btn--outline btn--full"
     style="margin-top:20px;font-size:0.875rem">
    View Full Analytics →
  </a>
</aside>

.qs__progress-track: height 8px, background var(--color-border), border-radius var(--radius-pill),
  overflow hidden, margin-top 8px.
.qs__progress-fill: height 100%, background var(--color-primary), border-radius var(--radius-pill),
  transition width 0.8s ease.
.qs__insight: background var(--color-primary-light), border-radius var(--radius-sm),
  padding var(--space-4), border-left 3px solid var(--color-primary),
  font-size var(--font-size-sm), color var(--color-text), margin var(--space-5) 0.
.qs__label: font-size var(--font-size-xs), font-weight 600, color var(--color-text-muted),
  text-transform uppercase, letter-spacing 0.05em, margin-bottom var(--space-2).
.qs__iwr: display flex, align-items center, gap var(--space-3).
.qs__iwr-value: font-size var(--font-size-xl), font-weight 800, color var(--color-text).

── FLOATING LOG WORK BUTTON ──

<button id="float-log-btn" class="float-btn">
  <svg>+ icon</svg> Log Work
</button>

.float-btn: position fixed, bottom 2rem, right 2rem, z-index var(--z-panel),
  background var(--color-primary), color white, border none, border-radius var(--radius-pill),
  padding 14px 24px, font-size var(--font-size-base), font-weight 600,
  display flex, align-items center, gap var(--space-2),
  box-shadow 0 4px 20px rgba(43, 191, 164, 0.4), cursor pointer,
  transition var(--transition-base).
.float-btn:hover: background var(--color-primary-dark), transform scale(1.04),
  box-shadow 0 6px 24px rgba(43,191,164,0.5).

── QUICK LOG SLIDE-IN PANEL ──

<div id="panel-overlay" class="panel-overlay"></div>
<aside id="quick-log-panel" class="quick-log-panel">
  <div class="qlp__header">
    <h3>Quick Log</h3>
    <button id="close-panel-btn" class="qlp__close" aria-label="Close">
      × (24px SVG or HTML entity)
    </button>
  </div>

  <div class="qlp__body">
    <p class="qlp__section-label">Category</p>
    <div class="qlp__category-grid" id="category-grid">
      6 buttons: Code Review, Mentoring, Debugging, Documentation, Meeting, Planning
    </div>
    
    <p class="qlp__section-label" style="margin-top:20px">Description</p>
    <textarea id="log-desc" class="input" rows="3"
      placeholder="Briefly describe what you did..."></textarea>
    <p id="log-desc-error" class="error-msg" style="display:none;color:var(--color-danger);
       font-size:0.8rem;margin-top:4px">Description is required.</p>
    
    <p class="qlp__section-label" style="margin-top:16px">Duration (minutes)</p>
    <input id="log-duration" type="number" class="input" value="30" min="5" max="480">
    
    <button id="log-submit-btn" class="btn btn--primary btn--full"
            style="margin-top:24px">Log Work →</button>
  </div>
</aside>

CATEGORY GRID STYLES:
.qlp__category-grid: display grid, grid-template-columns 1fr 1fr, gap var(--space-3).
Each button: padding 12px 10px, border 1.5px solid var(--color-border),
  border-radius var(--radius-sm), background var(--color-card), font-size var(--font-size-sm),
  font-weight 500, cursor pointer, transition var(--transition-base), text-align center.
button:hover: border-color var(--color-primary), color var(--color-primary), background var(--color-primary-light).
button.selected: background var(--color-primary), color white, border-color var(--color-primary).

PANEL ANIMATION:
.quick-log-panel: position fixed, top 0, right 0, height 100vh, width 380px,
  background var(--color-card), box-shadow var(--shadow-xl), z-index var(--z-panel),
  transform translateX(100%), transition transform var(--transition-slow),
  overflow-y auto, border-left 1px solid var(--color-border).
.quick-log-panel.open: transform translateX(0).
Mobile (max-width 640px): width 100vw.

.panel-overlay: position fixed, inset 0, background var(--color-overlay),
  z-index calc(var(--z-panel) - 1), opacity 0, pointer-events none,
  transition opacity var(--transition-slow).
.panel-overlay.open: opacity 1, pointer-events all.

PANEL JS LOGIC:
  openPanel(): add .open to panel + overlay, document.body style overflowY = 'hidden'.
  closePanel(): remove .open, restore overflow.
  #float-log-btn click → openPanel().
  #close-panel-btn click → closePanel().
  #panel-overlay click → closePanel().
  #empty-log-btn click → openPanel().
  Escape key → closePanel().

  Category selection: clicking a button adds .selected, removes from siblings.
  
  #log-submit-btn click:
    1. Validate: description must not be empty. If empty: show error, shake textarea.
    2. If valid: close panel.
    3. Show toast: "✅ Work logged successfully!"
    4. Build new activity item from selected category + description + duration.
    5. Prepend to #activity-list with slide-down animation.
    6. Increment Today's Tasks KPI value by 1 (update DOM).
    7. Hide empty state if visible.

── TOAST NOTIFICATIONS ──

<div id="toast-container" class="toast-container"></div>

.toast-container: position fixed, bottom 2rem, right 6.5rem (to not overlap float-btn on desktop),
  z-index var(--z-toast), display flex, flex-direction column, gap var(--space-3).
Mobile: right 1rem, bottom 6rem.

Each toast (created by JS):
<div class="toast">
  <div class="toast__body">
    <span class="toast__icon">✅</span>
    <span class="toast__msg">Work logged successfully!</span>
  </div>
  <div class="toast__progress"></div>
</div>

.toast: background var(--color-card), border-radius var(--radius-md),
  border-left 4px solid var(--color-primary), box-shadow var(--shadow-lg),
  padding var(--space-4) var(--space-5), min-width 280px, overflow hidden,
  transform translateX(120%), opacity 0, transition transform 0.3s ease, opacity 0.3s ease.
.toast.show: transform translateX(0), opacity 1.
.toast.hide: transform translateX(120%), opacity 0.
.toast__body: display flex, align-items center, gap var(--space-3), margin-bottom var(--space-2).
.toast__msg: font-size var(--font-size-sm), font-weight 500, color var(--color-text).

PROGRESS BAR:
.toast__progress: height 3px, background var(--color-border), position relative.
::after: position absolute, left 0, top 0, height 100%, background var(--color-primary),
  width 100%, animation toastProgress 3s linear forwards.
@keyframes toastProgress { from { width 100% } to { width 0% } }

showToast(msg, type='success') in utils.js:
  Create toast element, append to container.
  requestAnimationFrame → add .show class.
  After 3000ms: add .hide, after 300ms: remove from DOM.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 10 — PAGE 4: PERSONAL DASHBOARD (personal-dashboard.html + personal.css + personal.js)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Skeleton loading on page load (1200ms, same pattern as dashboard).

PAGE HEADER:
<section class="page-header">
  <div>
    <h1>Personal Analytics</h1>
    <p>Your invisible work metrics — Week of Mar 17–23, 2025</p>
  </div>
  <a href="dashboard.html" class="btn btn--outline">← Back to Dashboard</a>
</section>

── TOP METRICS ROW (3 gauges/score cards) ──

<div class="metrics-top-row">
  IWR Card | BCS Card | PII Card
</div>

.metrics-top-row: display grid, grid-template-columns repeat(3, 1fr), gap var(--space-5),
max-width 1400px, margin 0 auto var(--space-6), padding 0 var(--space-6).
Tablet: 1fr 1fr (third card full). Mobile: 1fr.

IWR CARD — Circular SVG Gauge:
Score: 78/100. Label: "Invisible Work Ratio"
SVG circle gauge using stroke-dasharray / stroke-dashoffset technique:
  Container: card, text-align center, padding var(--space-8).
  SVG: viewBox="0 0 120 120", width 120px, height 120px, display block, margin auto.
  Background circle: cx=60, cy=60, r=50, fill=none, stroke=var(--color-border), strokeWidth=10.
  Progress circle: cx=60, cy=60, r=50, fill=none, stroke=var(--color-primary), strokeWidth=10,
    strokeLinecap=round, strokeDasharray="314", strokeDashoffset="69" (= 314 * (1 - 0.78)),
    transform="rotate(-90 60 60)".
  Center text: positioned absolutely over SVG — <div class="gauge-center">
    <span class="gauge-value">78</span><span class="gauge-percent">%</span>
  </div>
  On load: animate strokeDashoffset from 314 → 69 over 1200ms using JS requestAnimationFrame.
  Label below SVG: "Invisible Work Ratio", muted, font-size sm.
  Threshold indicator below label: "⚠️ Elevated" badge (yellow).

BCS CARD — Burnout Correlation Score:
Score: 34/100. Risk level: "Low Risk" (green — score < 40).
  Display: large number 34 in font-weight 800, size 3xl.
  Below it: risk level badge. Below that: horizontal bar (progress bar style, 34% filled, green).
  Below bar: three threshold markers: "Low <40" | "Moderate 40–70" | "High >70"
  in small muted labels aligned under the bar.
  Color logic in JS: if score < 40 → fill green + "Low Risk" badge (green bg).
  40–70 → yellow fill + "Moderate" badge. >70 → red fill + "High Risk" badge.

PII CARD — Personal Impact Index:
Score: 82/100.
  Large score display + label "Personal Impact Index".
  Below: breakdown bars for top 3 contributing categories:
  Each row: badge + label, CSS bar (var(--color-primary) fill, width = contribution%), % value right.
  Bars animate width 0 → final value on load.

── ACTIVITY BREAKDOWN CHART (CSS Horizontal Bars) ──

<section class="breakdown-section card">
  <h2>Activity Breakdown</h2>
  <p class="muted">This week's effort distribution by category</p>
  <div id="breakdown-chart" class="breakdown-chart">
    One row per MOCK.piiBreakdown entry.
  </div>
</section>

Each row:
<div class="breakdown-row">
  <span class="badge badge--{badge}">{category}</span>
  <div class="breakdown-bar-track">
    <div class="breakdown-bar-fill" style="width:0%" data-width="{value}%"></div>
  </div>
  <span class="breakdown-pct">{value}%</span>
</div>

.breakdown-row: display flex, align-items center, gap var(--space-4), padding var(--space-3) 0.
badge: min-width 120px.
.breakdown-bar-track: flex 1, height 10px, background var(--color-border), border-radius var(--radius-pill), overflow hidden.
.breakdown-bar-fill: height 100%, background var(--color-primary), border-radius var(--radius-pill),
  width 0%, transition width 1s ease. JS sets width on load after 200ms delay.
.breakdown-pct: font-size var(--font-size-sm), font-weight 600, color var(--color-text), min-width 36px, text-align right.

── WORK DISTRIBUTION DONUT CHART (Plotly) ──

<section class="donut-section card">
  <h2>Work Category Distribution</h2>
  <div id="donut-chart" style="height:360px;"></div>
</section>

In personal.js, after Plotly loads, render:
  Plotly.newPlot('donut-chart', [{
    type: 'pie', hole: 0.55,
    labels: piiBreakdown.map(d => d.category),
    values: piiBreakdown.map(d => d.value),
    marker: { colors: ['#2bbfa4','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#ec4899'] },
    textinfo: 'label+percent', hoverinfo: 'label+value+percent'
  }], {
    paper_bgcolor: 'transparent', plot_bgcolor: 'transparent',
    font: { color: getComputedStyle(document.body).getPropertyValue('--color-text').trim(),
            family: 'Inter' },
    margin: { t: 20, b: 20, l: 20, r: 20 }, showlegend: true,
    legend: { orientation: 'h', y: -0.15 }
  }, { responsive: true, displayModeBar: false });

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 11 — PAGE 5: WEEKLY SUMMARY (weekly-summary.html + weekly.css + weekly.js)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Skeleton loading on page load. Load Plotly.js CDN in <head>.

── WEEK SELECTOR ──

<div class="week-selector">
  <button id="prev-week-btn" class="btn btn--ghost">← Previous</button>
  <span id="week-label" class="week-selector__label">Mar 17 – Mar 23, 2025</span>
  <button id="next-week-btn" class="btn btn--ghost">Next →</button>
</div>

.week-selector: display flex, align-items center, justify-content center, gap var(--space-6),
padding var(--space-6), max-width 500px, margin 0 auto var(--space-6).
.week-selector__label: font-weight 700, font-size var(--font-size-lg), color var(--color-text).

Week state in weekly.js: let weekIndex = 0 (0=current, 1=prev1, 2=prev2). Clamp 0–2.
On prev click: weekIndex = Math.min(2, weekIndex+1), renderWeek().
On next click: weekIndex = Math.max(0, weekIndex-1), renderWeek().
Next button disabled/muted when weekIndex === 0. Prev button disabled when weekIndex === 2.
renderWeek(): updates all content areas from MOCK.weeks[weekKeys[weekIndex]].

── WEEKLY STATS ROW ──

Four stat cards: Total Hours | Total Activities | Most Active Day | Top Category.
Grid: 4 cols desktop, 2 cols tablet, 1 col mobile.
Render from current week data.

── DAY-BY-DAY BAR CHART (Plotly) ──

<div id="daily-chart" style="height:320px;"></div>

Render with Plotly:
  type 'bar', x: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
  y: MOCK.weeks.current.dailyHours,
  marker: { color: ['#2bbfa4','#2bbfa4','#2bbfa4','#2bbfa4','#2bbfa4','#94a3b8','#94a3b8'] }.
  Highlight today's bar (index of current day) with a slightly brighter teal or gold color.
  paper_bgcolor/plot_bgcolor transparent. Font Inter, color from CSS var.
  yaxis: title 'Hours'. xaxis: title 'Day'. Margin t:20, b:40.
  Bar animation: use Plotly's transition on re-render (animate: true, transition: {duration:500}).

── ACTIVITY TABLE ──

<div class="table-wrap">
  <table class="activity-table" id="activity-table">
    <thead>
      <tr>
        <th data-col="date" class="sortable">Date <span class="sort-icon"></span></th>
        <th data-col="category" class="sortable">Category <span class="sort-icon"></span></th>
        <th data-col="description" class="sortable">Description <span class="sort-icon"></span></th>
        <th data-col="duration" class="sortable">Duration <span class="sort-icon"></span></th>
      </tr>
    </thead>
    <tbody id="table-body"></tbody>
  </table>
</div>

TABLE STYLES:
.table-wrap: overflow-x auto, border-radius var(--radius-md), border 1px solid var(--color-border).
.activity-table: width 100%, border-collapse collapse.
th: padding var(--space-4) var(--space-5), background var(--color-bg),
  text-align left, font-size var(--font-size-xs), font-weight 700, text-transform uppercase,
  letter-spacing 0.05em, color var(--color-text-muted), position sticky, top 0.
th.sortable: cursor pointer.
th.sortable:hover: color var(--color-primary).
th.sort-asc .sort-icon::after { content: ' ↑'; color var(--color-primary); }
th.sort-desc .sort-icon::after { content: ' ↓'; color var(--color-primary); }
td: padding var(--space-4) var(--space-5), font-size var(--font-size-sm), border-bottom 1px solid var(--color-border).
tr:nth-child(even) td: background var(--color-bg).
tr:hover td: background var(--color-primary-light), transition background 0.15s ease.

SORT LOGIC (weekly.js):
  let sortState = { col: null, dir: 'asc' }.
  On th click: if same col, toggle dir. Else set col, dir='asc'.
  Sort MOCK.weeks[current].activities array by clicked col. Re-render tbody.
  Update sort-icon class on th elements.

── WEEKLY HIGHLIGHT CARD ──

<div class="highlight-card card card--featured">
  <p>🎉 {MOCK.weeks.current.highlight}</p>
</div>

.highlight-card: border-left 4px solid var(--color-primary), background var(--color-primary-light),
padding var(--space-5) var(--space-6), font-weight 500, font-size var(--font-size-base),
color var(--color-text), margin var(--space-6) var(--space-6) var(--space-8).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 12 — DARK MODE (js/theme.js)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

theme.js must be loaded on every page. Logic:

const DARK_KEY = 'invisiwork-theme';
const isDark = () => document.body.classList.contains('dark');

function applyTheme(dark) {
  document.body.classList.toggle('dark', dark);
  // Update toggle button icon: sun SVG if dark, moon SVG if light
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  btn.innerHTML = dark ? SUN_SVG : MOON_SVG;
  btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
}

On DOMContentLoaded:
  const saved = localStorage.getItem(DARK_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved !== null ? saved === 'dark' : prefersDark);

#theme-toggle button click:
  const next = !isDark();
  localStorage.setItem(DARK_KEY, next ? 'dark' : 'light');
  applyTheme(next);

SUN_SVG and MOON_SVG: inline SVG strings, 20×20, stroke currentColor, fill none, strokeWidth 2.
Sun: circle + 8 radial lines. Moon: crescent shape.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 13 — UTILITY FUNCTIONS (js/utils.js)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Export these functions:

countUp(el, target, duration = 800):
  Uses requestAnimationFrame. Easing: easeOutQuart = (t) => 1 - Math.pow(1-t, 4).
  Updates el.textContent each frame. If target > 999, use toLocaleString().

formatDuration(minutes):
  Returns "1h 30m" format. If < 60: "45m". If exact hours: "2h".

getBadgeClass(category):
  Maps category string → badge class name. Handle all 8 badge types.

showToast(message, type = 'success'):
  Creates and appends toast to #toast-container as described in Part 9.

showSkeletons(): replaces content sections with shimmer skeleton blocks.
hideSkeletons(callback): transitions real content in, then calls callback.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 14 — MICRO-INTERACTIONS (APPLY UNIVERSALLY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CARD HOVER (all .card): transition transform 0.2s ease, box-shadow 0.2s ease.
  hover → transform translateY(-2px), box-shadow var(--shadow-md).

BUTTON INTERACTIONS:
  All .btn: transition background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease.
  :active → transform scale(0.97).
  .btn--primary:hover → background var(--color-primary-dark).

INPUT FOCUS GLOW:
  transition border-color 0.2s ease, box-shadow 0.2s ease.
  :focus → border-color var(--color-primary), box-shadow 0 0 0 3px var(--color-primary-glow).

PAGE ENTRY STAGGER:
  On every page, select all main content sections.
  Each section starts: opacity 0, transform translateY(16px).
  JS adds .stagger-in class in sequence with 150ms intervals per section.
  .stagger-in: opacity 1, transform translateY(0), transition opacity 0.5s ease, transform 0.5s ease.

DARK MODE TOGGLE:
  All color properties transition: transition background-color 0.3s ease, color 0.3s ease,
  border-color 0.3s ease (already in variables.css global rule).

LINK HOVER:
  Nav links: color transition 0.2s ease.
  Activity feed "View all": opacity transition.

SKELETON TO CONTENT:
  Content wrapper starts opacity 0. After 1200ms, transition to opacity 1 over 400ms.
  class .skeleton-hidden: opacity 0, pointer-events none.
  class .skeleton-visible: opacity 1, pointer-events auto.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 15 — CROSS-PAGE CONSISTENCY REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Every .html file must link CSS in this order:
   variables.css → base.css → components.css → navbar.css → skeleton.css → [page].css

2. Every .html file must import JS in this order (type="module"):
   theme.js → navbar.js → mock-data.js → utils.js → [page].js

3. Plotly CDN: load in <head> with defer only on pages that use charts (dashboard,
   personal-dashboard, weekly-summary).

4. #toast-container div: present in every app page's HTML body.

5. All SVG icons: pure inline SVG, no external icon libraries, no icon fonts.
   Consistent style: fill none, stroke currentColor or specific color, strokeWidth 1.5,
   strokeLinecap round, strokeLinejoin round. viewBox "0 0 24 24".

6. Every interactive element (buttons, links, inputs): focus-visible outline with
   box-shadow 0 0 0 3px var(--color-primary-glow), outline none.

7. Skip-to-content link (accessibility): first element in body on every page.
   <a href="#main-content" class="skip-link">Skip to main content</a>
   .skip-link: position absolute, transform translateY(-100%), focus: translateY(0).

8. All pages: <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <meta name="description" content="InvisiWork — Track invisible developer work...">
   <title>InvisiWork | [Page Name]</title>

9. Responsive images/SVGs: all max-width 100%.

10. No page scrolls horizontally on any viewport size. overflow-x hidden on body.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 16 — BUILD ORDER (EXECUTE IN EXACT SEQUENCE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Build every file completely before moving to the next step:

STEP 1:  css/variables.css     — complete design token system, light + dark mode vars
STEP 2:  css/base.css          — reset, Inter import, global body defaults
STEP 3:  css/components.css    — all reusable component classes
STEP 4:  css/navbar.css        — navbar, dropdown, mobile drawer styles
STEP 5:  css/skeleton.css      — shimmer keyframes and skeleton utility classes
STEP 6:  js/utils.js           — countUp, showToast, skeleton helpers, getBadgeClass
STEP 7:  js/theme.js           — dark mode toggle + localStorage persistence
STEP 8:  js/navbar.js          — scroll behavior, dropdown, mobile drawer
STEP 9:  js/mock-data.js       — complete MOCK data object
STEP 10: index.html            — landing page (full)
STEP 11: css/landing.css       — landing-specific styles
STEP 12: get-started.html      — onboarding page (full)
STEP 13: js/onboarding.js      — form validation + spinner + redirect
STEP 14: dashboard.html        — main dashboard (full HTML structure)
STEP 15: css/dashboard.css     — main dashboard styles
STEP 16: js/dashboard.js       — full dashboard logic (skeleton, countup, feed, panel, toast)
STEP 17: personal-dashboard.html — personal dashboard HTML
STEP 18: css/personal.css      — personal dashboard styles
STEP 19: js/personal.js        — gauges, breakdown bars, Plotly donut
STEP 20: weekly-summary.html   — weekly summary HTML
STEP 21: css/weekly.css        — weekly summary styles
STEP 22: js/weekly.js          — week navigation, Plotly bar chart, sortable table

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 17 — ABSOLUTE QUALITY STANDARDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. EVERY file must be complete. No placeholder comments like "// TODO" or
   "<!-- add content here -->". Every section, every function, fully implemented.

2. EVERY CSS file must reference ONLY CSS variables from variables.css. Zero
   hardcoded hex colors, zero hardcoded pixel values that aren't part of a
   component's specific measurement.

3. EVERY JS file uses ES6 modules. All functions used across files are exported
   and imported explicitly.

4. ZERO console.error logs in production path. All error paths handled silently or
   with user-visible feedback (toast/inline error).

5. ALL animations use GPU-composited properties: transform and opacity only.
   Never animate width, height, top, left, margin, or padding directly (exception:
   CSS bar chart width for illustrative effect — use transform scaleX instead
   if possible, else accept the exception).

6. RESPONSIVE: test mentally at 375px (iPhone SE), 768px (iPad), 1280px (desktop).
   Nothing overlaps. Nothing overflows. Nothing is unreadable.

7. DARK MODE: every single element must look correct in dark mode. No white cards
   on dark bg without override. No invisible text. Test every component.

8. ACCESSIBILITY: all interactive elements have :focus-visible outlines. All images
   have alt attributes. All SVGs have aria-hidden="true" or aria-label. All form
   inputs have associated <label> elements.

9. Plotly charts: transparent backgrounds always. Font family Inter always.
   Font color derived from CSS variable via JS getComputedStyle, not hardcoded.
   All charts: responsive:true, displayModeBar:false in config.

10. The final product must feel like it was designed by a product designer and
    engineered by a senior frontend developer. Pixel-perfect. Polished. Fast.
    Every interaction has feedback. No dead ends.

═══════════════════════════════════════════════════════════════════════════════
START WITH STEP 1. Build every file completely before advancing.
This is InvisiWork. Make every line count.
═══════════════════════════════════════════════════════════════════════════════