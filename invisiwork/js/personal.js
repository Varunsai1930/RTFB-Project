/* ═══════════════════════════════════════════════════════════════
   INVISIWORK — PERSONAL DASHBOARD JS
   Gauge animations, breakdown bars, Plotly donut chart.
   Tries real backend API first, falls back silently to mock data.
   ═══════════════════════════════════════════════════════════════ */

import { apiFetch } from './api-client.js';
import { MOCK } from './mock-data.js';
import { countUp, getBadgeClass, initStagger } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  const metricsSkeleton = document.getElementById('metrics-skeleton');
  const metricsContent = document.getElementById('metrics-content');

  loadPersonalData();

  /* ═══════════════════════════════════════════════════════════════
     DATA LOADING — API first, mock fallback (Principle 2)
  ═══════════════════════════════════════════════════════════════ */
  async function loadPersonalData() {
    try {
      // Fetch real metrics and activities from the backend
      const [metricsRes, activitiesRes] = await Promise.all([
        apiFetch('/metrics/current'),
        apiFetch('/activities?limit=200')
      ]);

      const activities = activitiesRes.activities || [];

      // Build breakdown from real activity data
      const breakdown = buildBreakdownFromActivities(activities);

      // Compose data object in a normalized shape
      const data = {
        iwr: metricsRes.iwr || 0,
        bcs: metricsRes.bcs || 0,
        pii: metricsRes.pii || 0,
        breakdown: breakdown
      };

      renderPersonalDashboard(data);

    } catch (error) {
      // ── MOCK FALLBACK (Principle 2) ────────────────────────────
      console.warn('[InvisiWork] API unavailable, using mock data:', error.message);

      const data = {
        iwr: MOCK.kpis.iwr,
        bcs: MOCK.kpis.bcs,
        pii: MOCK.kpis.pii,
        breakdown: MOCK.piiBreakdown
      };

      renderPersonalDashboard(data);
    }
  }

  /**
   * Build a category breakdown from real activity data.
   * Groups activities by category, computes percentage of total duration.
   */
  function buildBreakdownFromActivities(activities) {
    if (!activities || activities.length === 0) return MOCK.piiBreakdown;

    const categoryMap = {};
    let totalMin = 0;

    for (const a of activities) {
      const cat = a.category || 'Other';
      const dur = a.duration_min || 0;
      categoryMap[cat] = (categoryMap[cat] || 0) + dur;
      totalMin += dur;
    }

    if (totalMin === 0) return MOCK.piiBreakdown;

    // Map category names to badge shortcodes
    const badgeMap = {
      'Code Review': 'review',
      'Mentoring': 'mentoring',
      'Documentation': 'docs',
      'Debugging (non-ticket)': 'debug',
      'Meetings': 'meeting',
      'Planning': 'planning',
      'Peer Help': 'mentoring',
      'Knowledge Sharing': 'docs',
      'Infrastructure': 'infra',
      'Production Incident Response': 'debug',
      'Learning / Research': 'docs',
      'Refactoring': 'infra',
      'Feature Development': 'other',
      'Bug Fix': 'other',
      'Formal Testing / QA': 'other'
    };

    return Object.entries(categoryMap)
      .map(([category, minutes]) => ({
        category,
        value: Math.round((minutes / totalMin) * 100),
        badge: badgeMap[category] || 'other'
      }))
      .sort((a, b) => b.value - a.value);
  }

  /* ═══════════════════════════════════════════════════════════════
     RENDER — Uses the same data shape from API or mock
  ═══════════════════════════════════════════════════════════════ */
  function renderPersonalDashboard(data) {
    // Show skeleton for 1200ms, then reveal content
    setTimeout(() => {
      if (metricsSkeleton) {
        metricsSkeleton.classList.add('hide');
        setTimeout(() => metricsSkeleton.style.display = 'none', 400);
      }
      if (metricsContent) metricsContent.classList.add('visible');

      initStagger('.stagger-section', 150);

      animateIWRGauge(data.iwr);
      animateBCS(data.bcs);
      animatePII(data.pii, data.breakdown);
      renderBreakdownBars(data.breakdown);
      setTimeout(() => renderDonut(data.breakdown), 300);

    }, 1200);
  }


  /* ══════════════════════════════════════════
     IWR CIRCULAR GAUGE
  ══════════════════════════════════════════ */
  function animateIWRGauge(target) {
    const arc = document.getElementById('iwr-arc');
    const valEl = document.getElementById('iwr-gauge-val');
    if (!arc || !valEl) return;

    const circumference = 314;           // 2 * π * 50 ≈ 314
    const targetOffset = circumference * (1 - target / 100);

    const duration = 1200;
    const start = performance.now();
    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);

      const currentOffset = circumference - (circumference - targetOffset) * eased;
      arc.setAttribute('stroke-dashoffset', currentOffset);
      valEl.textContent = Math.round(eased * target);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        // Update IWR badge dynamically based on actual value
        const iwrBadge = document.querySelector('.metric-card--gauge .metric-card__badge');
        if (iwrBadge) {
          if (target <= 40) {
            iwrBadge.textContent = '✅ Normal';
            iwrBadge.style.background = 'var(--color-success-bg)';
            iwrBadge.style.color = 'var(--color-success-text)';
          } else if (target <= 70) {
            iwrBadge.textContent = '⚠️ Moderate';
            iwrBadge.style.background = 'var(--color-warning-bg)';
            iwrBadge.style.color = 'var(--color-warning-text)';
          } else {
            iwrBadge.textContent = '🔴 Elevated';
            iwrBadge.style.background = 'var(--color-danger-bg)';
            iwrBadge.style.color = 'var(--color-danger-text)';
          }
        }
      }
    };

    requestAnimationFrame(step);
  }


  /* ══════════════════════════════════════════
     BCS — BURNOUT CORRELATION SCORE
  ══════════════════════════════════════════ */
  function animateBCS(score) {
    const valEl = document.getElementById('bcs-val');
    const barEl = document.getElementById('bcs-bar');
    if (!valEl) return;

    countUp(valEl, score, 800);

    if (barEl) {
      setTimeout(() => {
        barEl.style.width = score + '%';

        // Color logic
        if (score < 40) {
          barEl.style.background = 'var(--color-success)';
        } else if (score <= 70) {
          barEl.style.background = 'var(--color-warning)';
        } else {
          barEl.style.background = 'var(--color-danger)';
        }
      }, 200);
    }

    // Update BCS badge based on actual score
    const bcsBadge = document.querySelector('.metric-card--score .metric-card__badge');
    if (bcsBadge) {
      if (score < 40) {
        bcsBadge.textContent = 'Low Risk';
        bcsBadge.className = 'metric-card__badge metric-card__badge--success';
        bcsBadge.style.cssText = ''; // clear any prior inline overrides
      } else if (score <= 70) {
        bcsBadge.textContent = 'Moderate Risk';
        bcsBadge.className = 'metric-card__badge';
        bcsBadge.style.background = 'var(--color-warning-bg)';
        bcsBadge.style.color = 'var(--color-warning-text)';
      } else {
        bcsBadge.textContent = 'High Risk';
        bcsBadge.className = 'metric-card__badge';
        bcsBadge.style.background = 'var(--color-danger-bg)';
        bcsBadge.style.color = 'var(--color-danger-text)';
      }
    }
  }


  /* ══════════════════════════════════════════
     PII — PERSONAL IMPACT INDEX
  ══════════════════════════════════════════ */
  function animatePII(score, breakdown) {
    const valEl = document.getElementById('pii-val');
    const container = document.getElementById('pii-top-bars');
    if (!valEl) return;

    countUp(valEl, score, 800);

    // Top 3 categories
    if (container && breakdown && breakdown.length > 0) {
      const top3 = [...breakdown].sort((a, b) => b.value - a.value).slice(0, 3);

      container.innerHTML = top3.map(item => `
        <div class="pii-row">
          <span class="badge ${getBadgeClass(item.badge)}">${item.category}</span>
          <div class="pii-bar-track">
            <div class="pii-bar-fill" data-width="${item.value}%"></div>
          </div>
          <span class="pii-pct">${item.value}%</span>
        </div>
      `).join('');

      // Animate bars
      setTimeout(() => {
        container.querySelectorAll('.pii-bar-fill').forEach(bar => {
          bar.style.width = bar.getAttribute('data-width');
        });
      }, 300);
    }
  }


  /* ══════════════════════════════════════════
     ACTIVITY BREAKDOWN BARS
  ══════════════════════════════════════════ */
  function renderBreakdownBars(breakdown) {
    const chart = document.getElementById('breakdown-chart');
    if (!chart || !breakdown) return;

    chart.innerHTML = breakdown.map(item => `
      <div class="breakdown-row">
        <span class="badge ${getBadgeClass(item.badge)}">${item.category}</span>
        <div class="breakdown-bar-track">
          <div class="breakdown-bar-fill" data-width="${item.value}%"></div>
        </div>
        <span class="breakdown-pct">${item.value}%</span>
      </div>
    `).join('');

    // Animate bars after 200ms
    setTimeout(() => {
      chart.querySelectorAll('.breakdown-bar-fill').forEach(bar => {
        bar.style.width = bar.getAttribute('data-width');
      });
    }, 200);
  }


  /* ══════════════════════════════════════════
     PLOTLY DONUT CHART
     Retry every 500ms if Plotly CDN hasn't
     finished loading yet (slow networks).
  ══════════════════════════════════════════ */
  function renderDonut(breakdown) {
    const el = document.getElementById('donut-chart');
    if (!el) return;

    if (typeof Plotly === 'undefined') {
      setTimeout(() => renderDonut(breakdown), 500);
      return;
    }

    const data = breakdown || MOCK.piiBreakdown;
    const textColor = getComputedStyle(document.body).getPropertyValue('--color-text').trim();

    Plotly.newPlot(el, [{
      type: 'pie',
      hole: 0.55,
      labels: data.map(d => d.category),
      values: data.map(d => d.value),
      marker: {
        colors: [
          getComputedStyle(document.body).getPropertyValue('--color-chart-1').trim() || '#2bbfa4',
          getComputedStyle(document.body).getPropertyValue('--color-chart-2').trim() || '#3b82f6',
          getComputedStyle(document.body).getPropertyValue('--color-chart-3').trim() || '#f59e0b',
          getComputedStyle(document.body).getPropertyValue('--color-chart-4').trim() || '#ef4444',
          getComputedStyle(document.body).getPropertyValue('--color-chart-5').trim() || '#8b5cf6',
          getComputedStyle(document.body).getPropertyValue('--color-chart-6').trim() || '#ec4899'
        ]
      },
      textinfo: 'label+percent',
      hoverinfo: 'label+value+percent',
      textfont: { family: 'Inter', size: 12 }
    }], {
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: {
        color: textColor,
        family: 'Inter'
      },
      margin: { t: 20, b: 20, l: 20, r: 20 },
      showlegend: true,
      legend: { orientation: 'h', y: -0.15 }
    }, {
      responsive: true,
      displayModeBar: false
    });
  }

  // Re-render donut on theme change
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      // The breakdown data is captured in the closure of the last render
      // Re-trigger a full data load to re-render correctly
      setTimeout(() => loadPersonalData(), 400);
    });
  }

});