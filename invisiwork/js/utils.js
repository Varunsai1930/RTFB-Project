/* ═══════════════════════════════════════════════════════════════
   INVISIWORK — UTILITY FUNCTIONS
   countUp, showToast, skeleton helpers, getBadgeClass, formatDuration
   ═══════════════════════════════════════════════════════════════ */

/**
 * Animate a numeric count-up on an element.
 * @param {HTMLElement} el - Element whose textContent to animate
 * @param {number} target - Target number
 * @param {number} duration - Animation duration in ms (default 800)
 */
export function countUp(el, target, duration = 800) {
  const start = performance.now();
  const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

  const step = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOutQuart(progress);
    const current = Math.round(eased * target);

    el.textContent = target > 999 ? current.toLocaleString() : current;

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
}

/**
 * Format a duration in minutes to a readable string.
 * @param {number} minutes
 * @returns {string} e.g. "1h 30m", "45m", "2h"
 */
export function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Map a category string to its badge CSS class.
 * @param {string} category
 * @returns {string} Badge class name (e.g. "badge--review")
 */
export function getBadgeClass(category) {
  const map = {
    'review':       'badge--review',
    'code review':  'badge--review',
    'mentoring':    'badge--mentoring',
    'docs':         'badge--docs',
    'documentation':'badge--docs',
    'meeting':      'badge--meeting',
    'planning':     'badge--planning',
    'debug':        'badge--debug',
    'debugging':    'badge--debug',
    'infra':        'badge--infra',
    'infrastructure':'badge--infra',
    'other':        'badge--other'
  };
  return map[category.toLowerCase()] || 'badge--other';
}

/**
 * Show a toast notification.
 * @param {string} message - Text to display
 * @param {string} type - 'success' | 'error' | 'info' (default 'success')
 */
export function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const iconMap = {
    success: '✅',
    error: '❌',
    info: 'ℹ️'
  };

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <div class="toast__body">
      <span class="toast__icon">${iconMap[type] || iconMap.success}</span>
      <span class="toast__msg">${message}</span>
    </div>
    <div class="toast__progress"></div>
  `;

  container.appendChild(toast);

  // Trigger enter animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Auto-dismiss after 3s
  setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hide');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

/**
 * Show skeleton loading placeholders inside a container.
 * @param {HTMLElement} containerEl
 * @param {number} count - Number of skeleton rows to show (default 4)
 */
export function showSkeletons(containerEl, count = 4) {
  if (!containerEl) return;
  const skeletonWrap = containerEl.querySelector('.skeleton-wrap');
  const contentWrap = containerEl.querySelector('.content-wrap');

  if (skeletonWrap) {
    skeletonWrap.classList.remove('hide');
    skeletonWrap.style.display = '';
  }
  if (contentWrap) {
    contentWrap.classList.remove('visible');
  }
}

/**
 * Hide skeleton loading and reveal real content.
 * @param {HTMLElement} containerEl
 * @param {Function} callback - Called after transition
 */
export function hideSkeletons(containerEl, callback) {
  if (!containerEl) return;
  const skeletonWrap = containerEl.querySelector('.skeleton-wrap');
  const contentWrap = containerEl.querySelector('.content-wrap');

  if (skeletonWrap) {
    skeletonWrap.classList.add('hide');
    setTimeout(() => {
      skeletonWrap.style.display = 'none';
    }, 400);
  }
  if (contentWrap) {
    contentWrap.classList.add('visible');
  }

  if (callback) {
    setTimeout(callback, 400);
  }
}

/**
 * Initialize stagger-in animations for page sections.
 * @param {string} selector - CSS selector for sections to stagger
 * @param {number} delay - Delay between each section in ms (default 150)
 */
export function initStagger(selector = '.stagger-section', delay = 150) {
  const sections = document.querySelectorAll(selector);
  sections.forEach((section, index) => {
    setTimeout(() => {
      section.classList.add('stagger-in');
    }, index * delay);
  });
}
