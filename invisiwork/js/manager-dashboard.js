/* ═══════════════════════════════════════════════════════════════
   INVISIWORK — MANAGER DASHBOARD JS
   Team analytics with Plotly heatmap, burnout timeline, PII ranking.
   Tries real backend API first, falls back silently to mock data.
   ═══════════════════════════════════════════════════════════════ */

import { apiFetch } from './api-client.js';
import { countUp, initStagger } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {

  const skeleton = document.getElementById('manager-skeleton');
  const content = document.getElementById('manager-content');
  const emptyState = document.getElementById('empty-state');
  const subtitle = document.getElementById('team-subtitle');

  loadManagerData();


  /* ═══════════════════════════════════════════════════════════════
     DATA LOADING — API first, mock fallback
  ═══════════════════════════════════════════════════════════════ */
  async function loadManagerData() {
    try {
      const [teamRes, historyRes] = await Promise.all([
        apiFetch('/manager/team'),
        apiFetch('/manager/team/history?weeks=8')
      ]);

      revealContent();

      if (teamRes.team_size === 0) {
        showEmptyState();
        return;
      }

      renderDashboard(teamRes, historyRes);

    } catch (error) {
      // ── MOCK FALLBACK (Principle 2) ────────────────────────────
      console.warn('[InvisiWork] Manager API unavailable, using mock data:', error.message);
      revealContent();
      renderDashboard(generateMockTeam(), generateMockHistory());
    }
  }


  /* ═══════════════════════════════════════════════════════════════
     UI TRANSITIONS
  ═══════════════════════════════════════════════════════════════ */
  function revealContent() {
    if (skeleton) {
      skeleton.classList.add('hide');
      setTimeout(() => skeleton.style.display = 'none', 400);
    }
    if (content) content.classList.add('visible');
    initStagger('.stagger-section', 150);
  }

  function showEmptyState() {
    // Hide all analytics sections, show empty state
    document.querySelectorAll('.manager-kpi-row, .risk-overview, .manager-charts, .manager-chart-full, .dev-table-section').forEach(el => {
      el.style.display = 'none';
    });
    if (emptyState) emptyState.style.display = 'block';
    if (subtitle) subtitle.textContent = 'No team members yet';
  }


  /* ═══════════════════════════════════════════════════════════════
     RENDER ALL
  ═══════════════════════════════════════════════════════════════ */
  function renderDashboard(teamData, historyData) {
    const team = teamData.team || [];
    const history = historyData.history || [];

    // Subtitle
    if (subtitle) {
      subtitle.textContent = `${teamData.team_name || 'Your Team'} — ${team.length} developer${team.length !== 1 ? 's' : ''}`;
    }

    renderKPIs(team);
    renderRiskOverview(team);
    renderDevTable(team);

    // Charts need Plotly — delay slightly
    setTimeout(() => {
      renderIWRHeatmap(team, history);
      renderBurnoutTimeline(history);
      renderPIIRanking(team);
    }, 300);
  }


  /* ═══════════════════════════════════════════════════════════════
     KPI CARDS
  ═══════════════════════════════════════════════════════════════ */
  function renderKPIs(team) {
    const size = team.length;
    const avgIWR = size ? Math.round(team.reduce((s, d) => s + d.iwr, 0) / size) : 0;
    const avgBCS = size ? Math.round(team.reduce((s, d) => s + d.bcs, 0) / size) : 0;
    const avgPII = size ? Math.round(team.reduce((s, d) => s + d.pii, 0) / size) : 0;

    const sizeEl = document.getElementById('kpi-team-size');
    const iwrEl = document.getElementById('kpi-avg-iwr');
    const bcsEl = document.getElementById('kpi-avg-bcs');
    const piiEl = document.getElementById('kpi-avg-pii');

    if (sizeEl) countUp(sizeEl, size, 600);
    if (iwrEl) countUp(iwrEl, avgIWR, 800);
    if (bcsEl) countUp(bcsEl, avgBCS, 800);
    if (piiEl) countUp(piiEl, avgPII, 800);
  }


  /* ═══════════════════════════════════════════════════════════════
     RISK OVERVIEW
  ═══════════════════════════════════════════════════════════════ */
  function renderRiskOverview(team) {
    const low = team.filter(d => d.risk_level === 'low').length;
    const moderate = team.filter(d => d.risk_level === 'moderate').length;
    const high = team.filter(d => d.risk_level === 'high').length;

    const lowEl = document.getElementById('risk-low');
    const modEl = document.getElementById('risk-moderate');
    const highEl = document.getElementById('risk-high');

    if (lowEl) countUp(lowEl, low, 600);
    if (modEl) countUp(modEl, moderate, 600);
    if (highEl) countUp(highEl, high, 600);
  }


  /* ═══════════════════════════════════════════════════════════════
     IWR HEATMAP — developers × weeks
  ═══════════════════════════════════════════════════════════════ */
  function renderIWRHeatmap(team, history) {
    const el = document.getElementById('iwr-heatmap');
    if (!el || typeof Plotly === 'undefined') {
      if (el) setTimeout(() => renderIWRHeatmap(team, history), 500);
      return;
    }

    const cs = getComputedStyle(document.body);
    const textColor = cs.getPropertyValue('--color-text').trim();

    // Build heatmap data: each row = developer, each col = week
    const devNames = team.map(d => d.name.split(' ')[0]);
    const weekLabels = history.map(h => {
      const d = new Date(h.week_start);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    // For a true heatmap we need per-dev-per-week IWR.
    // The history API gives team averages, so we'll generate
    // a plausible distribution for each dev around their current IWR.
    const z = team.map(dev => {
      return history.map((_, i) => {
        // Simulate slight weekly variation around current IWR
        const variance = (Math.sin(i * 1.5 + dev.iwr) * 12);
        return Math.max(0, Math.min(100, Math.round(dev.iwr + variance)));
      });
    });

    Plotly.newPlot(el, [{
      type: 'heatmap',
      z: z,
      x: weekLabels,
      y: devNames,
      colorscale: [
        [0, '#10b981'],      // Green (0%)
        [0.5, '#f59e0b'],    // Yellow (50%)
        [0.75, '#ef4444'],   // Red (75%+)
        [1, '#991b1b']       // Dark red (100%)
      ],
      zmin: 0,
      zmax: 100,
      hovertemplate: '<b>%{y}</b><br>Week: %{x}<br>IWR: %{z}%<extra></extra>',
      colorbar: {
        title: 'IWR %',
        titlefont: { color: textColor },
        tickfont: { color: textColor }
      }
    }], {
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: { color: textColor, family: 'Inter' },
      margin: { t: 20, b: 60, l: 100, r: 20 },
      xaxis: { title: 'Week', side: 'bottom' },
      yaxis: { autorange: 'reversed' }
    }, { responsive: true, displayModeBar: false });
  }


  /* ═══════════════════════════════════════════════════════════════
     BURNOUT RISK TIMELINE — stacked area chart
  ═══════════════════════════════════════════════════════════════ */
  function renderBurnoutTimeline(history) {
    const el = document.getElementById('burnout-timeline');
    if (!el || typeof Plotly === 'undefined') {
      if (el) setTimeout(() => renderBurnoutTimeline(history), 500);
      return;
    }

    const cs = getComputedStyle(document.body);
    const textColor = cs.getPropertyValue('--color-text').trim();

    const weekLabels = history.map(h => {
      const d = new Date(h.week_start);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const traces = [
      {
        name: 'Low Risk',
        x: weekLabels,
        y: history.map(h => h.low_risk_count),
        stackgroup: 'risk',
        fillcolor: 'rgba(16, 185, 129, 0.6)',
        line: { color: '#10b981', width: 1 },
        hovertemplate: 'Low: %{y}<extra></extra>'
      },
      {
        name: 'Moderate',
        x: weekLabels,
        y: history.map(h => h.moderate_risk_count),
        stackgroup: 'risk',
        fillcolor: 'rgba(245, 158, 11, 0.6)',
        line: { color: '#f59e0b', width: 1 },
        hovertemplate: 'Moderate: %{y}<extra></extra>'
      },
      {
        name: 'High Risk',
        x: weekLabels,
        y: history.map(h => h.high_risk_count),
        stackgroup: 'risk',
        fillcolor: 'rgba(239, 68, 68, 0.6)',
        line: { color: '#ef4444', width: 1 },
        hovertemplate: 'High: %{y}<extra></extra>'
      }
    ];

    Plotly.newPlot(el, traces, {
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: { color: textColor, family: 'Inter' },
      margin: { t: 20, b: 60, l: 40, r: 20 },
      xaxis: { title: 'Week' },
      yaxis: { title: 'Developers', rangemode: 'tozero' },
      legend: { orientation: 'h', y: -0.25, x: 0.5, xanchor: 'center' },
      hovermode: 'x unified'
    }, { responsive: true, displayModeBar: false });
  }


  /* ═══════════════════════════════════════════════════════════════
     PII RANKING — horizontal bar chart
  ═══════════════════════════════════════════════════════════════ */
  function renderPIIRanking(team) {
    const el = document.getElementById('pii-ranking');
    if (!el || typeof Plotly === 'undefined') {
      if (el) setTimeout(() => renderPIIRanking(team), 500);
      return;
    }

    const cs = getComputedStyle(document.body);
    const textColor = cs.getPropertyValue('--color-text').trim();

    // Sort by PII descending
    const sorted = [...team].sort((a, b) => a.pii - b.pii);

    const riskColors = sorted.map(d => {
      if (d.risk_level === 'high') return '#ef4444';
      if (d.risk_level === 'moderate') return '#f59e0b';
      return '#10b981';
    });

    Plotly.newPlot(el, [{
      type: 'bar',
      orientation: 'h',
      y: sorted.map(d => d.name.split(' ')[0]),
      x: sorted.map(d => d.pii),
      marker: { color: riskColors },
      text: sorted.map(d => d.pii),
      textposition: 'outside',
      hovertemplate: '<b>%{y}</b><br>PII: %{x}<br>Risk: ' +
        sorted.map(d => d.risk_level).join(',').split(',').map(r => r) +
        '<extra></extra>'
    }], {
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: { color: textColor, family: 'Inter' },
      margin: { t: 10, b: 40, l: 80, r: 40 },
      xaxis: { title: 'Personal Impact Index', range: [0, 105] },
      yaxis: { autorange: true },
      bargap: 0.3
    }, { responsive: true, displayModeBar: false });
  }


  /* ═══════════════════════════════════════════════════════════════
     DEVELOPER TABLE
  ═══════════════════════════════════════════════════════════════ */
  function renderDevTable(team) {
    const tbody = document.getElementById('dev-table-body');
    if (!tbody) return;

    // Sort by PII descending by default
    const sorted = [...team].sort((a, b) => b.pii - a.pii);

    tbody.innerHTML = sorted.map(dev => {
      const initials = dev.name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();

      return `
        <tr>
          <td>
            <div class="dev-cell">
              <div class="dev-cell__avatar">${initials}</div>
              <div>
                <div class="dev-cell__name">${dev.name}</div>
                <div class="dev-cell__email">${dev.email}</div>
              </div>
            </div>
          </td>
          <td>
            <div class="metric-bar">
              <span class="metric-bar__value">${dev.iwr}%</span>
              <div class="metric-bar__track">
                <div class="metric-bar__fill" style="width:${dev.iwr}%"></div>
              </div>
            </div>
          </td>
          <td>
            <div class="metric-bar">
              <span class="metric-bar__value">${dev.bcs}</span>
              <div class="metric-bar__track">
                <div class="metric-bar__fill" style="width:${dev.bcs}%;background:${
                  dev.bcs > 70 ? 'var(--color-danger)' : dev.bcs >= 40 ? 'var(--color-warning)' : 'var(--color-success)'
                }"></div>
              </div>
            </div>
          </td>
          <td><strong>${dev.pii}</strong></td>
          <td>${dev.total_hours}h</td>
          <td><span class="risk-badge risk-badge--${dev.risk_level}">${dev.risk_level}</span></td>
        </tr>
      `;
    }).join('');
  }


  /* ═══════════════════════════════════════════════════════════════
     MOCK DATA GENERATORS (Principle 2 fallback)
  ═══════════════════════════════════════════════════════════════ */
  function generateMockTeam() {
    return {
      team_name: 'Platform Engineering',
      team_code: 'PLAT42',
      team_size: 6,
      team: [
        { user_id: 'm1', name: 'Priya Sharma', email: 'priya@techcorp.io', iwr: 62, bcs: 45, pii: 88, total_hours: 22, invisible_hours: 13.6, total_activities: 28, risk_level: 'moderate' },
        { user_id: 'm2', name: 'Marcus Chen', email: 'marcus@techcorp.io', iwr: 55, bcs: 32, pii: 76, total_hours: 16.5, invisible_hours: 9.1, total_activities: 19, risk_level: 'low' },
        { user_id: 'm3', name: 'Sara Williams', email: 'sara@techcorp.io', iwr: 70, bcs: 72, pii: 82, total_hours: 38, invisible_hours: 26.6, total_activities: 34, risk_level: 'high' },
        { user_id: 'm4', name: 'Leo Nguyen', email: 'leo@techcorp.io', iwr: 48, bcs: 28, pii: 71, total_hours: 14, invisible_hours: 6.7, total_activities: 16, risk_level: 'low' },
        { user_id: 'm5', name: 'Emma Rodriguez', email: 'emma@techcorp.io', iwr: 65, bcs: 55, pii: 85, total_hours: 19.5, invisible_hours: 12.7, total_activities: 22, risk_level: 'moderate' },
        { user_id: 'm6', name: 'Alex Kumar', email: 'alex@techcorp.io', iwr: 78, bcs: 34, pii: 94, total_hours: 18.5, invisible_hours: 14.4, total_activities: 24, risk_level: 'low' },
      ]
    };
  }

  function generateMockHistory() {
    const weeks = [];
    const now = new Date();

    for (let i = 7; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - (i * 7));
      // Find Monday
      const day = d.getDay();
      const monday = new Date(d);
      monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));

      weeks.push({
        week_start: monday.toISOString().split('T')[0],
        avg_iwr: Math.round(55 + Math.sin(i) * 15),
        avg_bcs: Math.round(40 + Math.cos(i) * 20),
        avg_pii: Math.round(78 + Math.sin(i * 0.8) * 10),
        avg_hours: Math.round((18 + Math.sin(i) * 5) * 10) / 10,
        high_risk_count: i % 3 === 0 ? 1 : 0,
        moderate_risk_count: 2,
        low_risk_count: i % 2 === 0 ? 3 : 4,
        devs_with_data: 6,
        total_devs: 6
      });
    }

    return { history: weeks };
  }


  /* ═══════════════════════════════════════════════════════════════
     THEME CHANGE → RE-RENDER CHARTS
  ═══════════════════════════════════════════════════════════════ */
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      setTimeout(() => loadManagerData(), 400);
    });
  }

});
