/* ═══════════════════════════════════════════════════════════════
   INVISIWORK — TEAM DASHBOARD JS
   Skeleton loading, project cards, member cards, filter chips
   ═══════════════════════════════════════════════════════════════ */

import { MOCK } from './mock-data.js';
import { initStagger, showToast } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {

  const statsSkeleton = document.getElementById('team-stats-skeleton');
  const statsContent = document.getElementById('team-stats-content');
  const projectsGrid = document.getElementById('projects-grid');
  const membersGrid = document.getElementById('members-grid');

  // Skeleton → Content transition
  setTimeout(() => {
    if (statsSkeleton) {
      statsSkeleton.classList.add('hide');
      setTimeout(() => statsSkeleton.style.display = 'none', 400);
    }
    if (statsContent) statsContent.classList.add('visible');

    initStagger('.stagger-section', 150);

    renderProjects('all');
    renderMembers();

    // Animate progress bars after cards are in DOM
    setTimeout(animateProgressBars, 300);

  }, 1200);


  /* ══════════════════════════════════════════
     FILTER CHIPS
  ══════════════════════════════════════════ */
  const filterChips = document.querySelectorAll('.filter-chip');
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('filter-chip--active'));
      chip.classList.add('filter-chip--active');

      const filter = chip.getAttribute('data-filter');
      renderProjects(filter);
      setTimeout(animateProgressBars, 100);
    });
  });

  /* ══════════════════════════════════════════
     INVITE MEMBER FEATURE (Mock UI Action)
  ══════════════════════════════════════════ */
  const inviteBtn = document.getElementById('invite-member-btn');
  if (inviteBtn) {
    inviteBtn.addEventListener('click', () => {
      showToast('Invite link copied to clipboard!', 'success');
    });
  }

  /* ══════════════════════════════════════════
     EVENT DELEGATION FOR MILESTONE CLICKS
     (single listener on the grid, works for
      all dynamically rendered milestones)
  ══════════════════════════════════════════ */
  if (projectsGrid) {
    projectsGrid.addEventListener('click', (e) => {
      // Find the closest milestone item that was clicked
      const milestoneEl = e.target.closest('.milestone-item--clickable');
      if (!milestoneEl) return;

      const projId = milestoneEl.getAttribute('data-proj');
      const msIdx = parseInt(milestoneEl.getAttribute('data-ms'), 10);

      // Find the project in MOCK data
      const proj = MOCK.projects.find(p => p.id === projId);
      if (!proj || !proj.milestones[msIdx]) return;

      // Toggle milestone done state
      proj.milestones[msIdx].done = !proj.milestones[msIdx].done;

      // Recalculate progress based on milestones
      const totalMs = proj.milestones.length;
      const doneMs = proj.milestones.filter(m => m.done).length;
      proj.progress = Math.round((doneMs / totalMs) * 100);

      // Update status based on progress
      if (proj.progress === 100) {
        proj.status = 'completed';
      } else if (proj.status === 'completed') {
        proj.status = 'in-progress';
      }

      // Update the card in-place
      const card = projectsGrid.querySelector(`[data-project-id="${projId}"]`);
      if (card) {
        updateProjectCard(card, proj);
      }
      // Checks by pressing space or by enter
      projectsGrid.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          const milestoneEl = e.target.closest('.milestone-item--clickable');
          if (milestoneEl) {
            e.preventDefault();
            milestoneEl.click();
          }
        }
      });

      // Show feedback
      const msName = proj.milestones[msIdx].name;
      const action = proj.milestones[msIdx].done ? 'completed' : 'unchecked';
      showToast(`"${msName}" ${action}`, 'success');
    });
  }


  /* ══════════════════════════════════════════
     RENDER PROJECT CARDS
  ══════════════════════════════════════════ */
  function renderProjects(filter) {
    if (!projectsGrid) return;

    const projects = filter === 'all'
      ? MOCK.projects
      : MOCK.projects.filter(p => p.status === filter);

    if (projects.length === 0) {
      projectsGrid.innerHTML = `
        <div class="card" style="padding:var(--space-10);text-align:center;grid-column:1/-1">
          <p style="color:var(--color-text-muted);font-size:var(--font-size-base)">No projects match this filter.</p>
        </div>
      `;
      return;
    }

    projectsGrid.innerHTML = projects.map(proj => {
      const statusLabel = getStatusLabel(proj.status);
      const statusClass = getStatusClass(proj.status);
      const progressColor = getProgressColor(proj.progress, proj.priority);
      const milestonesHTML = buildMilestonesHTML(proj);
      const assigneesHTML = proj.assignees.map(initials =>
        `<span class="project-card__assignee">${initials}</span>`
      ).join('');

      return `
        <div class="card project-card" data-project-id="${proj.id}">
          <div class="project-card__top">
            <div>
              <div class="project-card__name">${proj.name}</div>
              <div class="project-card__priority">
                <span class="priority-dot priority-dot--${proj.priority}"></span>
                ${proj.priority.charAt(0).toUpperCase() + proj.priority.slice(1)} Priority
              </div>
            </div>
            <span class="status-badge ${statusClass}">${statusLabel}</span>
          </div>

          <p class="project-card__desc">${proj.description}</p>

          <div class="project-card__progress">
            <div class="project-card__progress-header">
              <span>Progress</span>
              <span class="project-card__progress-pct">${proj.progress}%</span>
            </div>
            <div class="project-card__progress-track">
              <div class="project-card__progress-fill ${progressColor}" data-progress="${proj.progress}"></div>
            </div>
          </div>

          <div class="project-card__milestones">
            ${milestonesHTML}
          </div>

          <div class="project-card__footer">
            <div class="project-card__assignees">
              ${assigneesHTML}
            </div>
            <span class="project-card__due">📅 Due: ${proj.dueDate}</span>
          </div>

          <div class="project-card__activity">${proj.recentActivity}</div>
        </div>
      `;
    }).join('');
  }


  /* ── Build milestone checklist HTML ── */
  function buildMilestonesHTML(proj) {
    return proj.milestones.map((m, mIdx) => `
      <div class="milestone-item milestone-item--clickable" data-proj="${proj.id}" data-ms="${mIdx}" role="checkbox" aria-checked="${m.done}" tabindex="0">
        <span class="milestone-check ${m.done ? 'milestone-check--done' : 'milestone-check--pending'}">
          ${m.done
        ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
        : '<span class="milestone-check__empty"></span>'}
        </span>
        <span class="milestone-label ${m.done ? 'milestone-label--done' : ''}">${m.name}</span>
      </div>
    `).join('');
  }


  /* ── Update a single card without full re-render ── */
  function updateProjectCard(card, proj) {
    // Update progress bar
    const pctEl = card.querySelector('.project-card__progress-pct');
    const fillEl = card.querySelector('.project-card__progress-fill');
    if (pctEl) pctEl.textContent = proj.progress + '%';
    if (fillEl) {
      fillEl.style.width = proj.progress + '%';
      fillEl.className = 'project-card__progress-fill ' + getProgressColor(proj.progress, proj.priority);
    }

    // Update status badge
    const badge = card.querySelector('.status-badge');
    if (badge) {
      badge.textContent = getStatusLabel(proj.status);
      badge.className = 'status-badge ' + getStatusClass(proj.status);
    }

    // Update milestones
    const msContainer = card.querySelector('.project-card__milestones');
    if (msContainer) {
      msContainer.innerHTML = buildMilestonesHTML(proj);
    }

    // At end of updateProjectCard():
    const activeFilter = document.querySelector('.filter-chip--active')?.getAttribute('data-filter');
    if (activeFilter && activeFilter !== 'all' && proj.status !== activeFilter) {
      card.style.display = 'none';
    }
  }


  function getStatusLabel(status) {
    const map = {
      'in-progress': 'In Progress',
      'review': 'In Review',
      'completed': 'Completed'
    };
    return map[status] || status;
  }

  function getStatusClass(status) {
    return `status-badge--${status}`;
  }

  function getProgressColor(progress, priority) {
    if (progress === 100) return 'progress-fill--green';
    if (priority === 'critical') return 'progress-fill--red';
    if (progress < 50) return 'progress-fill--amber';
    return 'progress-fill--blue';
  }

  function animateProgressBars() {
    const bars = document.querySelectorAll('.project-card__progress-fill');
    bars.forEach(bar => {
      const target = bar.getAttribute('data-progress');
      bar.style.width = target + '%';
    });
  }


  /* ══════════════════════════════════════════
     RENDER TEAM MEMBERS
     Uses real profile data to represent the active user
  ══════════════════════════════════════════ */
  function renderMembers() {
    if (!membersGrid) return;
    
    // We will dynamically combine the MOCK members with the actual Real User
    // Use window.invisiworkUser populated by auth-guard
    const realUser = window.invisiworkUser || JSON.parse(localStorage.getItem('invisiwork-profile') || '{}');
    let realName = realUser.name || 'Current User';
    let realRoleRaw = realUser.role || 'developer';
    let realRole = realRoleRaw.charAt(0).toUpperCase() + realRoleRaw.slice(1);
    
    const parts = realName.trim().split(' ').filter(Boolean);
    let realInitials = parts.map(p => p.charAt(0).toUpperCase()).slice(0, 2).join('');
    
    // Base the mock visualization list off existing mocks
    let finalMembers = [...MOCK.teamMembers];
    
    // We assume MOCK.currentUser.id ("currentUser") is the slot for the authenticated person
    const activeSlotIndex = finalMembers.findIndex(m => m.id === MOCK.currentUser.id);
    if (activeSlotIndex !== -1) {
       finalMembers[activeSlotIndex] = {
           ...finalMembers[activeSlotIndex],
           name: realName,
           initials: realInitials,
           role: realRole
       };
    } else {
       // If that slot is missing, unshift the current realtime user
       finalMembers.unshift({
           id: "liveUser",
           name: realName,
           initials: realInitials,
           role: realRole,
           isTopContributor: true,
           hoursThisWeek: 12.5,
           impactScore: 88,
           iwr: 92
       });
    }

    membersGrid.innerHTML = finalMembers.map(member => {
      return `
        <div class="card member-card">
          <div class="member-card__avatar">${member.initials}</div>
          <div class="member-card__name">${member.name}</div>
          <div class="member-card__role">${member.role}</div>
          ${member.isTopContributor ? '<div class="member-card__badge"><span class="badge badge--review" style="font-size:0.7rem;padding:4px 10px">⭐ Top Contributor</span></div>' : ''}
          <div class="member-card__stats">
            <div class="member-card__stat">
              <span class="member-card__stat-val">${member.hoursThisWeek}h</span>
              <span class="member-card__stat-label">Hours</span>
            </div>
            <div class="member-card__stat">
              <span class="member-card__stat-val">${member.impactScore}</span>
              <span class="member-card__stat-label">Impact</span>
            </div>
            <div class="member-card__stat">
              <span class="member-card__stat-val">${member.iwr}%</span>
              <span class="member-card__stat-label">IWR</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

});
