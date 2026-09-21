/* ═══════════════════════════════════════════════════════════════
   INVISIWORK — MOCK DATA
   FIX #5 — Each week object now has its own `metrics` block
   with IWR, BCS and PII values so the Reports page can show
   different numbers when the user changes the date range.
   ═══════════════════════════════════════════════════════════════ */

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
    { id: 1, category: 'review', label: 'Code Review', description: 'Reviewed PR #847 — Auth service refactor', timeAgo: '2h ago', duration: '1h 30m', type: 'invisible' },
    { id: 2, category: 'mentoring', label: 'Mentoring', description: 'Helped Priya debug the Redis cache issue', timeAgo: '4h ago', duration: '45m', type: 'invisible' },
    { id: 3, category: 'debug', label: 'Debugging', description: 'Traced and resolved payment gateway timeout bug', timeAgo: '5h ago', duration: '2h', type: 'invisible' },
    { id: 4, category: 'docs', label: 'Docs', description: 'Wrote onboarding guide for new API endpoints', timeAgo: 'Yesterday', duration: '1h', type: 'invisible' },
    { id: 5, category: 'meeting', label: 'Meeting', description: 'Sprint planning — Q2 roadmap review', timeAgo: 'Yesterday', duration: '1h 30m', type: 'invisible' },
    { id: 6, category: 'review', label: 'Code Review', description: 'Reviewed frontend component library updates', timeAgo: '2 days ago', duration: '1h', type: 'invisible' }
  ],

  quickStats: {
    topCategoryThisWeek: 'Code Review',
    topCategoryBadge: 'review',
    motivationalInsight: "You're in the top 15% of your team this week 🚀",
    weeklyProgressPercent: 46
  },

  piiBreakdown: [
    { category: 'Code Review', value: 32, badge: 'review' },
    { category: 'Mentoring', value: 18, badge: 'mentoring' },
    { category: 'Documentation', value: 15, badge: 'docs' },
    { category: 'Debugging', value: 20, badge: 'debug' },
    { category: 'Meetings', value: 10, badge: 'meeting' },
    { category: 'Planning', value: 5, badge: 'planning' }
  ],

  weeks: {
    current: {
      label: 'Mar 17 – Mar 23, 2025',
      stats: { totalHours: 18.5, totalActivities: 24, mostActiveDay: 'Wednesday', topCategory: 'Code Review' },
      dailyHours: [2.5, 4.0, 5.5, 3.0, 2.0, 1.5, 0],
      highlight: 'This week you completed 8 code reviews — that\'s in the top 15% of your team. 🎉',

      /* ── FIX #5: Per-week metrics for Reports page ── */
      metrics: {
        iwr: 78,  // high invisible work — lots of reviews + mentoring
        bcs: 34,  // low burnout risk
        pii: 82   // high impact
      },

      activities: [
        { date: 'Mon Mar 17', category: 'review', label: 'Code Review', description: 'Auth service PR review', duration: '1h 30m' },
        { date: 'Mon Mar 17', category: 'mentoring', label: 'Mentoring', description: 'Helped Priya with Redis debugging', duration: '45m' },
        { date: 'Tue Mar 18', category: 'debug', label: 'Debugging', description: 'Payment gateway timeout fix', duration: '2h' },
        { date: 'Tue Mar 18', category: 'review', label: 'Code Review', description: 'Component library PR', duration: '1h' },
        { date: 'Wed Mar 19', category: 'docs', label: 'Documentation', description: 'API onboarding guide', duration: '1h' },
        { date: 'Wed Mar 19', category: 'meeting', label: 'Meeting', description: 'Sprint planning session', duration: '1h 30m' },
        { date: 'Wed Mar 19', category: 'review', label: 'Code Review', description: 'Database migration script review', duration: '1h' },
        { date: 'Thu Mar 20', category: 'planning', label: 'Planning', description: 'Architecture design for Q2 feature', duration: '2h' },
        { date: 'Thu Mar 20', category: 'mentoring', label: 'Mentoring', description: 'Code walkthrough for new hire', duration: '1h' },
        { date: 'Fri Mar 21', category: 'review', label: 'Code Review', description: 'CI/CD pipeline config review', duration: '45m' },
        { date: 'Fri Mar 21', category: 'debug', label: 'Debugging', description: 'Flaky test investigation', duration: '1h 15m' }
      ]
    },

    prev1: {
      label: 'Mar 10 – Mar 16, 2025',
      stats: { totalHours: 22.0, totalActivities: 28, mostActiveDay: 'Tuesday', topCategory: 'Debugging' },
      dailyHours: [3.0, 5.5, 4.0, 4.5, 3.0, 2.0, 0],
      highlight: 'Strong debugging week — you resolved 5 production incidents. That\'s exceptional. 💪',

      /* ── FIX #5: Higher hours → higher BCS (more burnout risk) ── */
      metrics: {
        iwr: 65,  // slightly lower — more visible debugging work
        bcs: 58,  // moderate burnout risk — heavier week (22h)
        pii: 74   // good but not as high as current week
      },

      activities: [
        { date: 'Mon Mar 10', category: 'review', label: 'Code Review', description: 'Weekly PR batch review', duration: '2h' },
        { date: 'Tue Mar 11', category: 'debug', label: 'Debugging', description: 'Production incident #2201', duration: '3h' },
        { date: 'Tue Mar 11', category: 'mentoring', label: 'Mentoring', description: 'Onboarding session — new hire', duration: '1h' },
        { date: 'Wed Mar 12', category: 'docs', label: 'Docs', description: 'Runbook update for infra team', duration: '1h 30m' },
        { date: 'Thu Mar 13', category: 'meeting', label: 'Meeting', description: 'Cross-team sync', duration: '1h' },
        { date: 'Fri Mar 14', category: 'review', label: 'Code Review', description: 'Security audit PR review', duration: '2h' }
      ]
    },

    prev2: {
      label: 'Mar 3 – Mar 9, 2025',
      stats: { totalHours: 15.5, totalActivities: 19, mostActiveDay: 'Thursday', topCategory: 'Meetings' },
      dailyHours: [1.5, 2.0, 3.0, 5.0, 2.5, 1.5, 0],
      highlight: 'High meeting load this week. Consider blocking deep-work time next week to rebalance.',

      /* ── FIX #5: Meeting-heavy week → lower IWR + PII, elevated BCS ── */
      metrics: {
        iwr: 52,  // mostly meetings — lower invisible work ratio
        bcs: 71,  // high burnout risk — meetings are draining
        pii: 55   // lower impact — less hands-on technical work
      },

      activities: [
        { date: 'Mon Mar 3', category: 'meeting', label: 'Meeting', description: 'Monthly all-hands', duration: '2h' },
        { date: 'Wed Mar 5', category: 'planning', label: 'Planning', description: 'Q2 roadmap planning session', duration: '3h' },
        { date: 'Thu Mar 6', category: 'review', label: 'Code Review', description: 'Feature branch review', duration: '1h' },
        { date: 'Thu Mar 6', category: 'mentoring', label: 'Mentoring', description: 'Architecture discussion', duration: '2h' },
        { date: 'Fri Mar 7', category: 'docs', label: 'Docs', description: 'Team wiki updates', duration: '1h' }
      ]
    }
  },

  statsCounter: {
    hoursTracked: 12400,
    teamsActive: 320,
    reviewsLogged: 48000
  },

  teamMembers: [
    { id: 'dev_001', name: 'Alex Kumar', initials: 'AK', role: 'Senior Developer', iwr: 78, impactScore: 94, hoursThisWeek: 18.5, isTopContributor: true },
    { id: 'dev_002', name: 'Priya Sharma', initials: 'PS', role: 'Backend Engineer', iwr: 62, impactScore: 88, hoursThisWeek: 22.0, isTopContributor: false },
    { id: 'dev_003', name: 'Marcus Chen', initials: 'MC', role: 'Frontend Engineer', iwr: 55, impactScore: 76, hoursThisWeek: 16.5, isTopContributor: false },
    { id: 'dev_004', name: 'Sara Williams', initials: 'SW', role: 'DevOps Engineer', iwr: 70, impactScore: 82, hoursThisWeek: 20.0, isTopContributor: true },
    { id: 'dev_005', name: 'Leo Nguyen', initials: 'LN', role: 'QA Engineer', iwr: 48, impactScore: 71, hoursThisWeek: 14.0, isTopContributor: false },
    { id: 'dev_006', name: 'Emma Rodriguez', initials: 'ER', role: 'Full Stack Developer', iwr: 65, impactScore: 85, hoursThisWeek: 19.5, isTopContributor: false }
  ],

  projects: [
    {
      id: 'proj_001', name: 'Auth Service Refactor', status: 'in-progress', priority: 'high',
      progress: 72, dueDate: 'Apr 10, 2025',
      description: 'Migrate authentication from monolith to microservice with OAuth2 and JWT support.',
      assignees: ['AK', 'PS', 'MC'],
      milestones: [
        { name: 'API Design', done: true },
        { name: 'Token Service', done: true },
        { name: 'OAuth Integration', done: true },
        { name: 'Migration Scripts', done: false },
        { name: 'Load Testing', done: false }
      ],
      recentActivity: '2h ago — PR #847 reviewed by Alex'
    },
    {
      id: 'proj_002', name: 'Payment Gateway v2', status: 'in-progress', priority: 'critical',
      progress: 45, dueDate: 'Apr 25, 2025',
      description: 'Complete rewrite of the payment processing pipeline with Stripe and PayPal support.',
      assignees: ['PS', 'SW'],
      milestones: [
        { name: 'Architecture Design', done: true },
        { name: 'Stripe Integration', done: true },
        { name: 'PayPal Integration', done: false },
        { name: 'Error Handling', done: false },
        { name: 'PCI Compliance Audit', done: false }
      ],
      recentActivity: '5h ago — Timeout bug resolved by Priya'
    },
    {
      id: 'proj_003', name: 'Component Library v3', status: 'review', priority: 'medium',
      progress: 88, dueDate: 'Mar 31, 2025',
      description: 'Upgrade the shared component library with new design tokens, a11y improvements, and tree-shaking.',
      assignees: ['MC', 'ER'],
      milestones: [
        { name: 'Design Tokens', done: true },
        { name: 'Core Components', done: true },
        { name: 'Accessibility Audit', done: true },
        { name: 'Documentation', done: true },
        { name: 'Final QA', done: false }
      ],
      recentActivity: '1d ago — Final QA started by Leo'
    },
    {
      id: 'proj_004', name: 'CI/CD Pipeline Overhaul', status: 'in-progress', priority: 'high',
      progress: 60, dueDate: 'Apr 15, 2025',
      description: 'Rebuild CI/CD pipelines with GitHub Actions, container-based builds, and automated staging deploys.',
      assignees: ['SW', 'LN'],
      milestones: [
        { name: 'Pipeline Migration', done: true },
        { name: 'Container Builds', done: true },
        { name: 'Auto-Deploy Staging', done: true },
        { name: 'Rollback System', done: false },
        { name: 'Monitoring Alerts', done: false }
      ],
      recentActivity: '3h ago — Pipeline config reviewed by Sara'
    },
    {
      id: 'proj_005', name: 'API Documentation Portal', status: 'completed', priority: 'low',
      progress: 100, dueDate: 'Mar 20, 2025',
      description: 'Self-hosted API docs portal with interactive examples, auth flows, and versioning support.',
      assignees: ['AK', 'ER'],
      milestones: [
        { name: 'OpenAPI Spec', done: true },
        { name: 'Interactive Examples', done: true },
        { name: 'Auth Flow Docs', done: true },
        { name: 'Versioning', done: true },
        { name: 'Deploy', done: true }
      ],
      recentActivity: '5d ago — Deployed to production'
    }
  ]
};