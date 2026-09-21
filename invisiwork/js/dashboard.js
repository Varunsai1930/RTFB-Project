/* ═══════════════════════════════════════════════════════════════
   INVISIWORK — DASHBOARD JS 
   Integrated with Backend REST API.
   Falls back silently to mock data when the backend is unavailable.
   ═══════════════════════════════════════════════════════════════ */

import { apiFetch } from './api-client.js';
import { MOCK } from './mock-data.js';
import { countUp, showToast, getBadgeClass, formatDuration, initStagger } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {

  /* ═══════════════════════════════════════════════════════════════
     INITIAL DATA FETCH — with mock fallback (Principle 2)
  ═══════════════════════════════════════════════════════════════ */
  async function loadDashboardData() {
    try {
      const welcomeEl = document.querySelector('.welcome-header__left h1');

      // Run fetches concurrently
      const [metricsRes, activitiesRes, userRes] = await Promise.all([
        apiFetch('/metrics/current'),
        apiFetch('/activities?limit=50'),
        apiFetch('/auth/me')
      ]);
      
      // Update welcome greeting from the real backend user
      if (welcomeEl && userRes && userRes.name) {
        const firstName = userRes.name.trim().split(' ')[0] || 'User';
        welcomeEl.textContent = `Welcome back, ${firstName} 👋`;
      }
      
      // Also update the global user object for navbar and other modules
      window.invisiworkUser = userRes;
      window.dispatchEvent(new Event('invisiwork:user-loaded'));

      // Render KPIs and Feeds
      const allActivities = activitiesRes.activities || [];
      renderMetrics(metricsRes, allActivities);
      // Show only the top 5 most recent in the feed list
      renderActivities(allActivities.slice(0, 5));
      
    } catch (error) {
      // ── MOCK FALLBACK (Principle 2) ────────────────────────────
      // Silently fall back to mock data. Never show an error toast.
      // Log a console.warn (not error) so a developer knows the API
      // is down, but the end user sees nothing broken.
      console.warn('[InvisiWork] API unavailable, using mock data:', error.message);
      renderMockFallback();
    }
  }

  /**
   * Render the dashboard using hardcoded mock data when the API is unreachable.
   * This ensures the frontend always works, even without a running backend.
   */
  function renderMockFallback() {
    hideSkeletons();

    const welcomeEl = document.querySelector('.welcome-header__left h1');
    if (welcomeEl) {
      welcomeEl.textContent = `Welcome back, ${MOCK.currentUser.name.split(' ')[0]} 👋`;
    }

    // Render KPIs from mock
    const mockMetrics = {
      iwr: MOCK.kpis.iwr,
      total_hours: MOCK.kpis.weekHours,
      invisible_hours: MOCK.kpis.weekHours * (MOCK.kpis.iwr / 100),
      total_activities: MOCK.kpis.reviewsDone
    };

    // Map mock activities to the same shape the API returns
    const mockActivities = MOCK.recentActivities.map(a => ({
      category: a.label,
      description: a.description,
      duration_min: parseMockDuration(a.duration),
      date: new Date().toISOString(),
      created_at: new Date().toISOString()
    }));

    renderMetrics(mockMetrics, mockActivities);
    renderActivities(mockActivities.slice(0, 5));

    // Set mock user globally
    window.invisiworkUser = {
      name: MOCK.currentUser.name,
      email: MOCK.currentUser.email,
      role: MOCK.currentUser.role
    };
    window.dispatchEvent(new Event('invisiwork:user-loaded'));
  }

  /**
   * Parse a mock duration string like "1h 30m" into minutes.
   */
  function parseMockDuration(str) {
    let total = 0;
    const h = str.match(/(\d+)h/);
    const m = str.match(/(\d+)m/);
    if (h) total += parseInt(h[1], 10) * 60;
    if (m) total += parseInt(m[1], 10);
    return total || 30;
  }
  
  // If auth-guard finishes after initial load, update the welcome greeting
  window.addEventListener('invisiwork:user-loaded', () => {
    const welcomeEl = document.querySelector('.welcome-header__left h1');
    const user = window.invisiworkUser;
    if (welcomeEl && user && user.name) {
      const firstName = user.name.trim().split(' ')[0] || 'User';
      welcomeEl.textContent = `Welcome back, ${firstName} 👋`;
    }
  });

  function hideSkeletons() {
    const kpiSkeleton = document.getElementById('kpi-skeleton');
    const kpiContent = document.getElementById('kpi-content');
    const feedSkeleton = document.getElementById('feed-skeleton');
    const feedContent = document.getElementById('feed-content');

    if (kpiSkeleton) { kpiSkeleton.classList.add('hide'); setTimeout(() => kpiSkeleton.style.display = 'none', 400); }
    if (feedSkeleton) { feedSkeleton.classList.add('hide'); setTimeout(() => feedSkeleton.style.display = 'none', 400); }

    if (kpiContent) kpiContent.classList.add('visible');
    if (feedContent) feedContent.classList.add('visible');
    
    initStagger('.stagger-section', 150);
  }

  function renderMetrics(metrics, activities) {
    hideSkeletons();

    const iwr = Math.round(metrics.iwr || 0);
    const totalHours = Number((metrics.total_hours || 0).toFixed(1));
    const invHours = Number((metrics.invisible_hours || 0).toFixed(1));

    const iwrEl = document.getElementById('iwr-val');
    if (iwrEl) countUp(iwrEl, iwr, 800);

    const totalEl = document.getElementById('total-hours-val');
    if (totalEl) totalEl.textContent = totalHours + 'h';
    
    const qsHours = document.getElementById('qs-hours-value');
    if (qsHours) qsHours.textContent = `${totalHours}h / 40h`;

    const invEl = document.getElementById('invisible-hours-val');
    if (invEl) invEl.textContent = invHours + 'h';

    // "Today's Tasks" — count activities whose date matches today (local time)
    const now = new Date();
    const todayLocal = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    const todayCount = activities.filter(a => {
        // a.date is ISO string like "2026-04-11T00:00:00+00:00" — extract just YYYY-MM-DD
        return (a.date || '').substring(0, 10) === todayLocal;
    }).length;
    
    const tasksEl = document.getElementById('today-tasks-val');
    if (tasksEl) countUp(tasksEl, todayCount, 800);

    // "Total Activities" done this week
    const reviewsEl = document.getElementById('reviews-val');
    const totalWeeklyActivities = metrics.total_activities || 0;
    if (reviewsEl) countUp(reviewsEl, totalWeeklyActivities, 800);

    // Update Progress Bars
    const iwrProgress = document.getElementById('iwr-progress');
    if (iwrProgress) iwrProgress.style.width = iwr + '%';

    const hoursProgress = document.getElementById('hours-progress');
    if (hoursProgress) {
        const percent = Math.min(100, Math.round((totalHours / 40.0) * 100));
        hoursProgress.style.width = percent + '%';
    }
  }

  function renderActivities(activities) {
    const activityList = document.getElementById('activity-list');
    const emptyState = document.getElementById('empty-state');

    if (!activityList) return;

    if (activities.length === 0) {
      activityList.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    activityList.style.display = '';

    activityList.innerHTML = activities.map(activity => {
      let label = activity.category;
      label = label.charAt(0).toUpperCase() + label.slice(1);
      
      const durationStr = formatDuration(activity.duration_min);

      // Use created_at for time display (more accurate than date for "just now")
      const loggedAt = new Date(activity.created_at || activity.date);
      let timeAgoStr = loggedAt.toLocaleDateString();
      const diffMs = Date.now() - loggedAt.getTime();
      if (diffMs < 60 * 1000) {
        timeAgoStr = 'Just now';
      } else if (diffMs < 60 * 60 * 1000) {
        timeAgoStr = Math.floor(diffMs / 60000) + 'm ago';
      } else if (diffMs < 24 * 60 * 60 * 1000) {
        timeAgoStr = 'Today';
      }

      return `
      <li class="activity-item">
        <span class="badge ${getBadgeClass(activity.category)}">${label}</span>
        <span class="activity-item__desc">${activity.description || 'No description provided.'}</span>
        <span class="activity-item__meta">
          <span class="activity-item__time">${timeAgoStr}</span>
          <span class="activity-item__duration">${durationStr}</span>
        </span>
      </li>
    `}).join('');
  }

  // Initial Boot
  loadDashboardData();

  /* ══════════════════════════════════════════
     QUICK LOG PANEL
  ══════════════════════════════════════════ */
  const floatBtn = document.getElementById('float-log-btn');
  const panel = document.getElementById('quick-log-panel');
  const overlay = document.getElementById('panel-overlay');
  const closeBtn = document.getElementById('close-panel-btn');
  const categoryGrid = document.getElementById('category-grid');
  const logDesc = document.getElementById('log-desc');
  const logDescError = document.getElementById('log-desc-error');
  const logDuration = document.getElementById('log-duration');
  const logSubmitBtn = document.getElementById('log-submit-btn');
  const emptyLogBtn = document.getElementById('empty-log-btn');
  const customCategoryWrap = document.getElementById('custom-category-wrap');
  const customCategoryInput = document.getElementById('custom-category-input');

  let selectedCategory = null;

  function openPanel() {
    if (panel) panel.classList.add('open');
    if (overlay) overlay.classList.add('open');
    document.body.style.overflowY = 'hidden';
  }

  function closePanel() {
    if (panel) panel.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflowY = '';
  }

  if (floatBtn) floatBtn.addEventListener('click', openPanel);
  if (closeBtn) closeBtn.addEventListener('click', closePanel);
  if (overlay) overlay.addEventListener('click', closePanel);
  if (emptyLogBtn) emptyLogBtn.addEventListener('click', openPanel);

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePanel();
  });

  // Category selection
  if (categoryGrid) {
    const catButtons = categoryGrid.querySelectorAll('button');
    catButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        catButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedCategory = btn.getAttribute('data-category');

        if (selectedCategory === 'custom' && customCategoryWrap) {
          customCategoryWrap.style.display = 'block';
          if (customCategoryInput) customCategoryInput.focus();
        } else if (customCategoryWrap) {
          customCategoryWrap.style.display = 'none';
        }
      });
    });
  }

  // Submit log
  if (logSubmitBtn) {
    logSubmitBtn.addEventListener('click', async () => {
      const desc = logDesc ? logDesc.value.trim() : '';

      // Validate description
      if (!desc) {
        if (logDescError) logDescError.style.display = 'block';
        if (logDesc) {
          logDesc.classList.add('error', 'shake');
          setTimeout(() => logDesc.classList.remove('shake'), 400);
        }
        return;
      }

      // Clear errors
      if (logDescError) logDescError.style.display = 'none';
      if (logDesc) logDesc.classList.remove('error');

      const cat = selectedCategory || 'review';
      
      // Map frontend shortcodes to exact Backend category strict strings
      const categoryMap = {
        'review': 'Code Review',
        'mentoring': 'Mentoring',
        'debug': 'Debugging (non-ticket)',
        'docs': 'Documentation',
        'meeting': 'Meetings',
        'planning': 'Planning'
      };

      let parsedCat = categoryMap[cat];
      
      // If custom, use their input. Backend will reject if it's not in the predefined list,
      // but for now we'll pass it exactly as they typed it.
      if (cat === 'custom') {
        const customInput = customCategoryInput ? customCategoryInput.value.trim() : '';
        parsedCat = customInput || 'Other'; 
      }
      const duration = logDuration ? parseInt(logDuration.value, 10) || 30 : 30;

      // Disable button while saving
      logSubmitBtn.disabled = true;
      logSubmitBtn.textContent = 'Saving...';

      try {
        await apiFetch('/activities', {
            method: 'POST',
            body: JSON.stringify({
                category: parsedCat,
                description: desc,
                duration_min: duration,
                date: new Date().toISOString().split('T')[0]
            })
        });

        // Close panel
        closePanel();

        // Show toast
        showToast('Work logged successfully!', 'success');

        // Re-fetch data to update dashboard
        loadDashboardData();

        // Reset form
        if (logDesc) logDesc.value = '';
        if (logDuration) logDuration.value = '30';
        if (categoryGrid) categoryGrid.querySelectorAll('button').forEach(b => b.classList.remove('selected'));
        if (customCategoryWrap) customCategoryWrap.style.display = 'none';
        if (customCategoryInput) customCategoryInput.value = '';
        selectedCategory = null;

      } catch(e) {
          showToast('Failed to log work: ' + e.message, 'error');
      } finally {
          logSubmitBtn.disabled = false;
          logSubmitBtn.textContent = 'Save Activity';
      }
    }); // submit btn listener
  }

  // Clear description error on input
  if (logDesc) {
    logDesc.addEventListener('input', () => {
      if (logDesc.classList.contains('error')) {
        logDesc.classList.remove('error');
        if (logDescError) logDescError.style.display = 'none';
      }
    });
  }

});