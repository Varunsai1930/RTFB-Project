/* ═══════════════════════════════════════════════════════════════
   INVISIWORK — WEEKLY SUMMARY JS
   Week navigation, Plotly bar chart, sortable activity table.
   Tries real backend API first, falls back silently to mock data.
   ═══════════════════════════════════════════════════════════════ */

import { apiFetch } from './api-client.js';
import { MOCK } from './mock-data.js';
import { getBadgeClass, formatDuration, initStagger } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  // ── State ──────────────────────────────────────────────────────
  // weekOffset: 0 = current week, 1 = last week, 2 = two weeks ago, etc.
  let weekOffset = 0;
  const MAX_WEEKS_BACK = 2;

  // Whether we're using real API data or mock fallback
  let usingMockData = false;

  // DOM refs
  const prevBtn = document.getElementById('prev-week-btn');
  const nextBtn = document.getElementById('next-week-btn');
  const weekLabel = document.getElementById('week-label');
  const statHours = document.getElementById('stat-hours');
  const statActivities = document.getElementById('stat-activities');
  const statActiveDay = document.getElementById('stat-active-day');
  const statTopCat = document.getElementById('stat-top-cat');
  const tableBody = document.getElementById('table-body');
  const highlightText = document.getElementById('highlight-text');
  const statsSkeleton = document.getElementById('stats-skeleton');
  const statsContent = document.getElementById('stats-content');

  // Sort state
  let sortState = { col: null, dir: 'asc' };

  // Current week's activities (for sorting)
  let currentActivities = [];

  /* ══════════════════════════════════════════
     SKELETON → CONTENT TRANSITION
  ══════════════════════════════════════════ */
  setTimeout(() => {
    if (statsSkeleton) {
      statsSkeleton.classList.add('hide');
      setTimeout(() => statsSkeleton.style.display = 'none', 400);
    }
    if (statsContent) statsContent.classList.add('visible');

    initStagger('.stagger-section', 150);

    // Initial load
    loadWeekData();

  }, 1200);


  /* ══════════════════════════════════════════
     WEEK NAVIGATION
  ══════════════════════════════════════════ */
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      weekOffset = Math.min(MAX_WEEKS_BACK, weekOffset + 1);
      updateButtons();
      loadWeekData();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      weekOffset = Math.max(0, weekOffset - 1);
      updateButtons();
      loadWeekData();
    });
  }

  function updateButtons() {
    if (nextBtn) nextBtn.disabled = weekOffset === 0;
    if (prevBtn) prevBtn.disabled = weekOffset === MAX_WEEKS_BACK;
  }


  /* ══════════════════════════════════════════
     DATA LOADING — API first, mock fallback
  ══════════════════════════════════════════ */
  async function loadWeekData() {
    try {
      // Calculate the ISO week string for the target week
      const isoWeek = getISOWeekString(weekOffset);
      const weekBounds = getWeekBounds(weekOffset);

      // Fetch activities for this specific week
      const activitiesRes = await apiFetch(`/activities?week=${isoWeek}&limit=200`);
      const activities = activitiesRes.activities || [];

      usingMockData = false;

      // Build the week data from real API response
      const weekData = buildWeekDataFromActivities(activities, weekBounds);
      renderWeek(weekData);

    } catch (error) {
      // ── MOCK FALLBACK (Principle 2) ────────────────────────────
      console.warn('[InvisiWork] API unavailable, using mock data:', error.message);
      usingMockData = true;
      renderWeekFromMock();
    }
  }

  /**
   * Get ISO week string (e.g. "2026-W16") for a given week offset from today.
   */
  function getISOWeekString(offset) {
    const d = new Date();
    d.setDate(d.getDate() - (offset * 7));

    // Calculate ISO week number
    const jan4 = new Date(d.getFullYear(), 0, 4);
    const dayOfYear = Math.floor((d - new Date(d.getFullYear(), 0, 1)) / 86400000) + 1;
    const weekNum = Math.ceil((dayOfYear + jan4.getDay() - 1) / 7);

    return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
  }

  /**
   * Get the Monday–Sunday date range label for a given week offset.
   */
  function getWeekBounds(offset) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayOfWeek = today.getDay();
    // Monday = 0 offset, Sunday = 6 offset
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset - (offset * 7));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return {
      label: `${fmt(monday)} – ${fmt(sunday)}, ${monday.getFullYear()}`,
      monday,
      sunday
    };
  }

  /**
   * Build a normalized week data object from real API activities.
   */
  function buildWeekDataFromActivities(activities, weekBounds) {
    const totalMin = activities.reduce((sum, a) => sum + (a.duration_min || 0), 0);
    const totalHours = Math.round(totalMin / 60 * 10) / 10;

    // Daily hours breakdown (Mon=0 ... Sun=6)
    const dailyMinutes = [0, 0, 0, 0, 0, 0, 0];
    const dayCounts = {};
    const categoryCounts = {};

    for (const a of activities) {
      const d = new Date(a.date);
      const dayIndex = d.getDay() === 0 ? 6 : d.getDay() - 1; // Mon=0, Sun=6
      dailyMinutes[dayIndex] += a.duration_min || 0;

      const dayName = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][dayIndex];
      dayCounts[dayName] = (dayCounts[dayName] || 0) + (a.duration_min || 0);

      const cat = a.category || 'Other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + (a.duration_min || 0);
    }

    const dailyHours = dailyMinutes.map(m => Math.round(m / 60 * 10) / 10);

    // Most active day
    let mostActiveDay = 'N/A';
    let maxDayMin = 0;
    for (const [day, mins] of Object.entries(dayCounts)) {
      if (mins > maxDayMin) { maxDayMin = mins; mostActiveDay = day; }
    }

    // Top category
    let topCategory = 'N/A';
    let maxCatMin = 0;
    for (const [cat, mins] of Object.entries(categoryCounts)) {
      if (mins > maxCatMin) { maxCatMin = mins; topCategory = cat; }
    }

    // Build highlight text
    let highlight = '';
    if (activities.length === 0) {
      highlight = 'No activities logged this week. Start tracking your invisible work!';
    } else {
      highlight = `You logged ${activities.length} activities for a total of ${totalHours}h this week. Top category: ${topCategory}.`;
    }

    // Format activities for the table
    const tableActivities = activities.map(a => ({
      date: new Date(a.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      category: a.category || 'Other',
      label: a.category || 'Other',
      description: a.description || 'No description',
      duration: formatDuration(a.duration_min || 0),
      duration_min: a.duration_min || 0
    }));

    return {
      label: weekBounds.label,
      stats: {
        totalHours,
        totalActivities: activities.length,
        mostActiveDay,
        topCategory
      },
      dailyHours,
      highlight,
      activities: tableActivities
    };
  }


  /* ══════════════════════════════════════════
     RENDER — from API data
  ══════════════════════════════════════════ */
  function renderWeek(week) {
    if (!week) return;

    // Update label
    if (weekLabel) weekLabel.textContent = week.label;

    // Update stats
    if (statHours) statHours.textContent = week.stats.totalHours + 'h';
    if (statActivities) statActivities.textContent = week.stats.totalActivities;
    if (statActiveDay) statActiveDay.textContent = week.stats.mostActiveDay;
    if (statTopCat) statTopCat.textContent = week.stats.topCategory;

    // Update highlight
    if (highlightText) highlightText.textContent = '🎉 ' + week.highlight;

    // Store for sorting
    currentActivities = week.activities;

    // Render table
    renderTable(week.activities);

    // Render chart
    renderDailyChart(week.dailyHours);

    // Reset sort
    sortState = { col: null, dir: 'asc' };
    clearSortIcons();
  }


  /* ══════════════════════════════════════════
     RENDER — from mock data (fallback)
  ══════════════════════════════════════════ */
  function renderWeekFromMock() {
    const weekKeys = ['current', 'prev1', 'prev2'];
    const week = MOCK.weeks[weekKeys[weekOffset]];
    if (!week) return;

    if (weekLabel) weekLabel.textContent = week.label;
    if (statHours) statHours.textContent = week.stats.totalHours + 'h';
    if (statActivities) statActivities.textContent = week.stats.totalActivities;
    if (statActiveDay) statActiveDay.textContent = week.stats.mostActiveDay;
    if (statTopCat) statTopCat.textContent = week.stats.topCategory;
    if (highlightText) highlightText.textContent = '🎉 ' + week.highlight;

    currentActivities = week.activities;
    renderTable(week.activities);
    renderDailyChart(week.dailyHours);

    sortState = { col: null, dir: 'asc' };
    clearSortIcons();
  }


  /* ══════════════════════════════════════════
     PLOTLY BAR CHART
     Retry every 500ms if Plotly CDN hasn't
     finished loading yet (slow networks).
  ══════════════════════════════════════════ */
  function renderDailyChart(dailyHours) {
    const el = document.getElementById('daily-chart');
    if (!el) return;

    if (typeof Plotly === 'undefined') {
      setTimeout(() => renderDailyChart(dailyHours), 500);
      return;
    }

    const textColor = getComputedStyle(document.body).getPropertyValue('--color-text').trim();
    const bgColor = 'transparent';
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Color bars: weekdays teal, weekend muted — read from CSS vars
    const cs = getComputedStyle(document.body);
    const teal = cs.getPropertyValue('--color-chart-1').trim() || '#2bbfa4';
    const muted = cs.getPropertyValue('--color-chart-muted').trim() || '#94a3b8';
    const colors = dailyHours.map((_, i) => i < 5 ? teal : muted);

    const data = [{
      type: 'bar',
      x: days,
      y: dailyHours,
      marker: { color: colors },
      hoverinfo: 'x+y',
      textposition: 'none'
    }];

    const layout = {
      paper_bgcolor: bgColor,
      plot_bgcolor: bgColor,
      font: { color: textColor, family: 'Inter' },
      margin: { t: 20, b: 40, l: 50, r: 20 },
      yaxis: {
        title: 'Hours',
        gridcolor: 'rgba(128,128,128,0.15)',
        zeroline: false
      },
      xaxis: {
        title: 'Day'
      },
      bargap: 0.3
    };

    Plotly.newPlot(el, data, layout, {
      responsive: true,
      displayModeBar: false
    });
  }


  /* ══════════════════════════════════════════
     ACTIVITY TABLE
  ══════════════════════════════════════════ */
  function renderTable(activities) {
    if (!tableBody) return;

    tableBody.innerHTML = activities.map(act => `
      <tr>
        <td>${act.date}</td>
        <td><span class="badge ${getBadgeClass(act.category)}">${act.label}</span></td>
        <td>${act.description}</td>
        <td>${act.duration}</td>
      </tr>
    `).join('');
  }


  /* ══════════════════════════════════════════
     TABLE SORTING
  ══════════════════════════════════════════ */
  const ths = document.querySelectorAll('.activity-table th.sortable');

  ths.forEach(th => {
    th.addEventListener('click', () => {
      const col = th.getAttribute('data-col');

      if (sortState.col === col) {
        sortState.dir = sortState.dir === 'asc' ? 'desc' : 'asc';
      } else {
        sortState.col = col;
        sortState.dir = 'asc';
      }

      const sorted = [...currentActivities].sort((a, b) => {
        let valA, valB;

        switch (col) {
          case 'date':
            valA = a.date;
            valB = b.date;
            break;
          case 'category':
            valA = (a.label || a.category || '').toLowerCase();
            valB = (b.label || b.category || '').toLowerCase();
            break;
          case 'description':
            valA = (a.description || '').toLowerCase();
            valB = (b.description || '').toLowerCase();
            break;
          case 'duration':
            valA = a.duration_min != null ? a.duration_min : parseDuration(a.duration || '');
            valB = b.duration_min != null ? b.duration_min : parseDuration(b.duration || '');
            break;
          default:
            return 0;
        }

        if (valA < valB) return sortState.dir === 'asc' ? -1 : 1;
        if (valA > valB) return sortState.dir === 'asc' ? 1 : -1;
        return 0;
      });

      renderTable(sorted);
      updateSortIcons(col);
    });
  });

  function parseDuration(str) {
    let total = 0;
    const hourMatch = str.match(/(\d+)h/);
    const minMatch = str.match(/(\d+)m/);
    if (hourMatch) total += parseInt(hourMatch[1], 10) * 60;
    if (minMatch) total += parseInt(minMatch[1], 10);
    return total;
  }

  function updateSortIcons(activeCol) {
    ths.forEach(th => {
      th.classList.remove('sort-asc', 'sort-desc');
      if (th.getAttribute('data-col') === activeCol) {
        th.classList.add(sortState.dir === 'asc' ? 'sort-asc' : 'sort-desc');
      }
    });
  }

  function clearSortIcons() {
    ths.forEach(th => th.classList.remove('sort-asc', 'sort-desc'));
  }


  /* ══════════════════════════════════════════
     THEME CHANGE → RE-RENDER CHART
  ══════════════════════════════════════════ */
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      setTimeout(() => loadWeekData(), 400);
    });
  }

});