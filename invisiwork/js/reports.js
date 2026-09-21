/* ═══════════════════════════════════════════════════════════════
   INVISIWORK — REPORTS JS
   FIX #5 — IWR/BCS/PII metric cards now re-render with the
   correct per-week values when the period selector changes.
   ═══════════════════════════════════════════════════════════════ */

import { MOCK } from './mock-data.js';
import { countUp, showToast, initStagger } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {

    /* ── DOM refs ── */
    const metricsSkeleton = document.getElementById('metrics-skeleton');
    const metricsContent = document.getElementById('metrics-content');
    const tableSkeleton = document.getElementById('table-skeleton');
    const tableContent = document.getElementById('table-content');
    const periodSelect = document.getElementById('period-select');
    const exportBtn = document.getElementById('export-pdf-btn');
    const memberSearch = document.getElementById('member-search');

    /* ── State ── */
    let selectedPeriod = 'current';
    let sortState = { col: null, dir: 'asc' };
    let searchQuery = '';


    /* ══════════════════════════════════════════
       SKELETON → CONTENT TRANSITION
    ══════════════════════════════════════════ */
    setTimeout(() => {
        if (metricsSkeleton) {
            metricsSkeleton.classList.add('hide');
            setTimeout(() => metricsSkeleton.style.display = 'none', 400);
        }
        if (tableSkeleton) {
            tableSkeleton.classList.add('hide');
            setTimeout(() => tableSkeleton.style.display = 'none', 400);
        }

        if (metricsContent) metricsContent.classList.add('visible');
        if (tableContent) tableContent.classList.add('visible');

        initStagger('.stagger-section', 150);

        renderMetricCards();
        renderTable();
        setTimeout(renderTrendChart, 300);

    }, 1200);


    /* ══════════════════════════════════════════
       PERIOD SELECTOR
       FIX #5 — Changing the period now re-renders
       both the chart AND the metric cards with the
       values for that specific week.
    ══════════════════════════════════════════ */
    if (periodSelect) {
        periodSelect.addEventListener('change', () => {
            selectedPeriod = periodSelect.value;
            renderMetricCards(); // FIX #5 — was missing before
            setTimeout(renderTrendChart, 100);
        });
    }


    /* ══════════════════════════════════════════
       IWR / BCS / PII METRIC CARDS
       FIX #5 — Now reads from the selected week's
       `metrics` block instead of always using the
       flat MOCK.kpis object.
    ══════════════════════════════════════════ */
    function getWeekMetrics() {
        return MOCK.weeks[selectedPeriod]?.metrics || MOCK.kpis;
    }

    function renderMetricCards() {
        const metrics = getWeekMetrics();
        renderIWR(metrics.iwr);
        renderBCS(metrics.bcs);
        renderPII(metrics.pii);
    }

    /* ── IWR ── */
    function renderIWR(val) {
        const valEl = document.getElementById('rpt-iwr-val');
        const barEl = document.getElementById('rpt-iwr-bar');
        const badgeEl = document.getElementById('rpt-iwr-badge');
        if (!valEl) return;

        // Reset bar to 0 first so the animation re-plays on period change
        if (barEl) barEl.style.width = '0%';

        countUp(valEl, val, 800);

        setTimeout(() => {
            if (barEl) barEl.style.width = val + '%';

            if (badgeEl) {
                if (val <= 40) {
                    badgeEl.textContent = '✅ Normal';
                    badgeEl.style.background = 'var(--color-success-bg)';
                    badgeEl.style.color = 'var(--color-success-text)';
                } else if (val <= 70) {
                    badgeEl.textContent = '⚠️ Moderate';
                    badgeEl.style.background = 'var(--color-warning-bg)';
                    badgeEl.style.color = 'var(--color-warning-text)';
                } else {
                    badgeEl.textContent = '🔴 Elevated';
                    badgeEl.style.background = 'var(--color-danger-bg)';
                    badgeEl.style.color = 'var(--color-danger-text)';
                }
            }
        }, 200);
    }

    /* ── BCS ── */
    function renderBCS(val) {
        const valEl = document.getElementById('rpt-bcs-val');
        const barEl = document.getElementById('rpt-bcs-bar');
        const badgeEl = document.getElementById('rpt-bcs-badge');
        if (!valEl) return;

        if (barEl) barEl.style.width = '0%';

        countUp(valEl, val, 800);

        setTimeout(() => {
            if (barEl) {
                barEl.style.width = val + '%';
                barEl.style.background = val < 40
                    ? 'var(--color-success)'
                    : val <= 70
                        ? 'var(--color-warning)'
                        : 'var(--color-danger)';
            }

            if (badgeEl) {
                if (val < 40) {
                    badgeEl.textContent = 'Low Risk';
                    badgeEl.style.background = 'var(--color-success-bg)';
                    badgeEl.style.color = 'var(--color-success-text)';
                } else if (val <= 70) {
                    badgeEl.textContent = 'Moderate Risk';
                    badgeEl.style.background = 'var(--color-warning-bg)';
                    badgeEl.style.color = 'var(--color-warning-text)';
                } else {
                    badgeEl.textContent = 'High Risk';
                    badgeEl.style.background = 'var(--color-danger-bg)';
                    badgeEl.style.color = 'var(--color-danger-text)';
                }
            }
        }, 200);
    }

    /* ── PII ── */
    function renderPII(val) {
        const valEl = document.getElementById('rpt-pii-val');
        const barEl = document.getElementById('rpt-pii-bar');
        const badgeEl = document.getElementById('rpt-pii-badge');
        if (!valEl) return;

        if (barEl) barEl.style.width = '0%';

        countUp(valEl, val, 800);

        setTimeout(() => {
            if (barEl) barEl.style.width = val + '%';

            if (badgeEl) {
                if (val >= 80) {
                    badgeEl.textContent = '🏆 High Impact';
                    badgeEl.style.background = 'var(--color-success-bg)';
                    badgeEl.style.color = 'var(--color-success-text)';
                } else if (val >= 50) {
                    badgeEl.textContent = '📈 Growing';
                    badgeEl.style.background = 'var(--color-info-bg)';
                    badgeEl.style.color = 'var(--color-info-text)';
                } else {
                    badgeEl.textContent = '⚠️ Low';
                    badgeEl.style.background = 'var(--color-warning-bg)';
                    badgeEl.style.color = 'var(--color-warning-text)';
                }
            }
        }, 200);
    }


    /* ══════════════════════════════════════════
       WEEKLY HOURS TREND LINE CHART (Plotly)
       Selected period line is highlighted.
       All 3 weeks always visible for comparison.
    ══════════════════════════════════════════ */
    function renderTrendChart() {
        const el = document.getElementById('trend-chart');
        if (!el) return;

        if (typeof Plotly === 'undefined') {
            setTimeout(renderTrendChart, 500);
            return;
        }

        const cs = getComputedStyle(document.body);
        const textColor = cs.getPropertyValue('--color-text').trim();
        const bgColor = cs.getPropertyValue('--color-card').trim() || '#fff';
        const borderColor = cs.getPropertyValue('--color-border').trim() || '#e5e7eb';
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        const weeks = [
            { key: 'current', label: 'Mar 17–23', color: cs.getPropertyValue('--color-chart-1').trim() || '#2bbfa4' },
            { key: 'prev1', label: 'Mar 10–16', color: cs.getPropertyValue('--color-chart-2').trim() || '#3b82f6' },
            { key: 'prev2', label: 'Mar 3–9', color: cs.getPropertyValue('--color-chart-5').trim() || '#a78bfa' }
        ];

        const traces = weeks.map(w => {
            const isSelected = w.key === selectedPeriod;
            return {
                type: 'scatter',
                mode: 'lines+markers',
                name: w.label,
                x: days,
                y: MOCK.weeks[w.key].dailyHours,
                line: {
                    color: w.color,
                    width: isSelected ? 3 : 1.5,
                    dash: isSelected ? 'solid' : 'dot'
                },
                marker: {
                    color: w.color,
                    size: isSelected ? 8 : 5
                },
                opacity: isSelected ? 1 : 0.4,
                hovertemplate: `<b>${w.label}</b><br>%{x}: %{y}h<extra></extra>`
            };
        });

        const layout = {
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'transparent',
            font: { color: textColor, family: 'Inter', size: 12 },
            margin: { t: 10, b: 40, l: 50, r: 20 },
            xaxis: {
                title: 'Day',
                gridcolor: 'rgba(128,128,128,0.1)',
                zeroline: false
            },
            yaxis: {
                title: 'Hours',
                gridcolor: 'rgba(128,128,128,0.1)',
                zeroline: false,
                rangemode: 'tozero'
            },
            legend: {
                orientation: 'h',
                y: -0.2,
                x: 0.5,
                xanchor: 'center'
            },
            hovermode: 'x unified',
            hoverlabel: {
                bgcolor: bgColor,
                font: { color: textColor, family: 'Inter', size: 12 },
                bordercolor: borderColor
            }
        };

        Plotly.newPlot(el, traces, layout, {
            responsive: true,
            displayModeBar: false
        });

        renderLegendChips(weeks);
    }

    function renderLegendChips(weeks) {
        const legendEl = document.getElementById('trend-legend');
        if (!legendEl) return;
        legendEl.innerHTML = weeks.map(w => `
      <div class="legend-item">
        <span class="legend-dot" style="background:${w.color}"></span>
        <span>${w.label}</span>
      </div>
    `).join('');
    }


    /* ══════════════════════════════════════════
       TEAM MEMBER COMPARISON TABLE
       Sortable by any column, searchable by name/role
    ══════════════════════════════════════════ */
    function renderTable() {
        const tbody = document.getElementById('team-table-body');
        if (!tbody) return;

        // Check for saved profile name for current user
        const savedProfile = JSON.parse(localStorage.getItem('invisiwork-profile') || 'null');

        let members = MOCK.teamMembers.filter(m =>
            m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
            // Also search by saved name if it's the current user
            (m.id === MOCK.currentUser.id && savedProfile?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
        );

        if (sortState.col) {
            members = [...members].sort((a, b) => {
                let valA, valB;
                switch (sortState.col) {
                    case 'name': valA = a.name.toLowerCase(); valB = b.name.toLowerCase(); break;
                    case 'role': valA = a.role.toLowerCase(); valB = b.role.toLowerCase(); break;
                    case 'hours': valA = a.hoursThisWeek; valB = b.hoursThisWeek; break;
                    case 'impact': valA = a.impactScore; valB = b.impactScore; break;
                    case 'iwr': valA = a.iwr; valB = b.iwr; break;
                    default: return 0;
                }
                if (valA < valB) return sortState.dir === 'asc' ? -1 : 1;
                if (valA > valB) return sortState.dir === 'asc' ? 1 : -1;
                return 0;
            });
        }

        if (members.length === 0) {
            tbody.innerHTML = `
        <tr>
          <td colspan="6" class="reports-table__empty">
            No members match "<strong>${searchQuery}</strong>"
          </td>
        </tr>
      `;
            return;
        }

        tbody.innerHTML = members.map(m => {
            // Use saved profile name/initials for the current user
            let displayName = m.name;
            let displayInitials = m.initials;
            if (m.id === MOCK.currentUser.id && savedProfile?.name) {
                displayName = savedProfile.name;
                const parts = savedProfile.name.trim().split(' ');
                displayInitials = parts.map(p => p.charAt(0).toUpperCase()).slice(0, 2).join('');
            }

            const iwrClass = m.iwr <= 40 ? 'iwr-pill--normal'
                : m.iwr <= 70 ? 'iwr-pill--moderate'
                    : 'iwr-pill--elevated';
            const iwrLabel = m.iwr <= 40 ? 'Normal'
                : m.iwr <= 70 ? 'Moderate'
                    : 'Elevated';

            return `
        <tr>
          <td>
            <div class="member-cell">
              <div class="member-cell__avatar">${displayInitials}</div>
              <div>
                <div class="member-cell__name">${displayName}</div>
                ${m.isTopContributor
                    ? '<span class="top-badge">⭐ Top Contributor</span>'
                    : ''}
              </div>
            </div>
          </td>
          <td>${m.role}</td>
          <td><strong>${m.hoursThisWeek}h</strong></td>
          <td>
            <div class="impact-cell">
              <span class="impact-cell__score">${m.impactScore}</span>
              <div class="impact-cell__track">
                <div class="impact-cell__fill" style="width:${m.impactScore}%"></div>
              </div>
            </div>
          </td>
          <td>
            <span class="iwr-pill ${iwrClass}">${m.iwr}% — ${iwrLabel}</span>
          </td>
          <td>${m.isTopContributor
                    ? '<span class="top-badge">⭐ Top</span>'
                    : '<span style="color:var(--color-text-muted);font-size:var(--font-size-xs)">—</span>'
                }</td>
        </tr>
      `;
        }).join('');
    }

    if (memberSearch) {
        memberSearch.addEventListener('input', () => {
            searchQuery = memberSearch.value.trim();
            renderTable();
        });
    }

    const ths = document.querySelectorAll('.reports-table th.sortable');
    ths.forEach(th => {
        th.addEventListener('click', () => {
            const col = th.getAttribute('data-col');
            if (sortState.col === col) {
                sortState.dir = sortState.dir === 'asc' ? 'desc' : 'asc';
            } else {
                sortState.col = col;
                sortState.dir = 'asc';
            }
            ths.forEach(t => t.classList.remove('sort-asc', 'sort-desc'));
            th.classList.add(sortState.dir === 'asc' ? 'sort-asc' : 'sort-desc');
            renderTable();
        });
    });


    /* ══════════════════════════════════════════
       EXPORT TO PDF (mock)
    ══════════════════════════════════════════ */
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            exportBtn.disabled = true;
            exportBtn.classList.add('btn--loading');
            const originalHTML = exportBtn.innerHTML;
            exportBtn.innerHTML = `<span class="spinner"></span> Generating…`;

            setTimeout(() => {
                exportBtn.disabled = false;
                exportBtn.classList.remove('btn--loading');
                exportBtn.innerHTML = originalHTML;
                showToast('PDF report exported successfully!', 'success');
            }, 2000);
        });
    }


    /* ══════════════════════════════════════════
       THEME CHANGE → RE-RENDER CHART
    ══════════════════════════════════════════ */
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            setTimeout(renderTrendChart, 400);
        });
    }

});