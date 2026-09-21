/* ═══════════════════════════════════════════════════════════════
   INVISIWORK — PROFILE JS
   Edit/save personal info, copy credentials, password toggle,
   preference toggles, dark mode sync.

   KEY ARCHITECTURE:
   populateProfile() is the single function responsible for reading
   localStorage and updating EVERY element on the page — sidebar
   card (name, initials, role, team), form fields, credentials
   section, logout email, email copy button, and navbar.

   The save handler writes to localStorage then calls populateProfile()
   again. This means there is zero duplicated DOM update logic and
   every surface on the page stays in sync automatically.
   ═══════════════════════════════════════════════════════════════ */

import { apiFetch } from './api-client.js';
import { showToast, initStagger } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {

  // Populate every element on the page from saved profile / MOCK defaults
  populateProfile();

  // Stagger animations
  setTimeout(() => {
    initStagger('.stagger-section', 150);
  }, 200);

  // Sync dark mode toggle with current theme state
  syncDarkModeToggle();


  /* ══════════════════════════════════════════
     POPULATE PROFILE — REST API INTEGRATED
  ══════════════════════════════════════════ */
  async function populateProfile() {
    try {
      const user = await apiFetch('/auth/me');
      const saved = JSON.parse(localStorage.getItem('invisiwork-profile') || '{}');
      
      const userName = saved.name || user.name || 'Unknown User';
      const userEmail = saved.email || user.email || '';
      const userRoleRaw = saved.role || user.role || 'developer';
      const userRole = userRoleRaw.charAt(0).toUpperCase() + userRoleRaw.slice(1);
      
      // If team is null, set placeholder
      const userTeam = saved.team || user.team_id || 'No Team Assigned';

      // ── Profile sidebar card ──
      const elInitials = document.getElementById('profile-initials');
      const elName = document.getElementById('profile-display-name');
      const elRole = document.getElementById('profile-sidebar-role');
      const elTeamText = document.getElementById('profile-sidebar-team-text');

      if (elInitials) {
        const parts = userName.trim().split(' ').filter(Boolean);
        elInitials.textContent = parts.map(p => p.charAt(0).toUpperCase()).slice(0, 2).join('');
      }
      if (elName) elName.textContent = userName;
      if (elRole) elRole.textContent = userRole;
      if (elTeamText) elTeamText.textContent = userTeam;

      // ── Personal information form fields ──
      const fName = document.getElementById('profile-name');
      const fEmail = document.getElementById('profile-email');
      const fRole = document.getElementById('profile-role');
      const fTeam = document.getElementById('profile-team');
      if (fName) fName.value = userName;
      if (fEmail) fEmail.value = userEmail;
      if (fRole) fRole.value = userRole;
      if (fTeam) fTeam.value = userTeam;

      // ── Credentials section ──
      const elUserId = document.getElementById('cred-user-id');
      const elCredEmail = document.getElementById('cred-email');
      const elJoined = document.getElementById('cred-joined');
      if (elUserId) elUserId.textContent = user.user_id || 'ID_PENDING';
      if (elCredEmail) elCredEmail.textContent = userEmail;
      if (elJoined) {
        elJoined.textContent = "Just joined"; // Not stored explicitly in /me response yet
      }

      // ── Logout section email ──
      const elLogoutEmail = document.getElementById('logout-email');
      if (elLogoutEmail) elLogoutEmail.textContent = userEmail;

      // ── Email copy button — keep data-copy attribute in sync ──
      const elCopyEmail = document.getElementById('copy-email-btn');
      if (elCopyEmail) elCopyEmail.setAttribute('data-copy', userEmail);

      // ── Navbar avatar + name ──
      const navAvatar = document.querySelector('.navbar__avatar');
      const navName = document.querySelector('.navbar__user-name');
      if (navAvatar) {
        const parts = userName.trim().split(' ').filter(Boolean);
        navAvatar.textContent = parts.map(p => p.charAt(0).toUpperCase()).slice(0, 2).join('');
      }
      if (navName) navName.textContent = userName;
      
    } catch (e) {
      console.error('Failed to load profile from backend:', e);
    }
  }


  /* ══════════════════════════════════════════
     EDIT PERSONAL INFO WITH REAL-TIME PREVIEW
  ══════════════════════════════════════════ */
  const editBtn = document.getElementById('edit-personal-btn');
  const saveBtn = document.getElementById('save-personal-btn');
  const cancelBtn = document.getElementById('cancel-personal-btn');
  const actionsDiv = document.getElementById('personal-actions');
  const personalFields = ['profile-name', 'profile-email', 'profile-role', 'profile-team'];

  let originalValues = {};

  // For live preview
  const fNameInput = document.getElementById('profile-name');
  const fRoleInput = document.getElementById('profile-role');
  const fTeamInput = document.getElementById('profile-team');

  function updatePreview() {
    const elInitials = document.getElementById('profile-initials');
    const elName = document.getElementById('profile-display-name');
    const elRole = document.getElementById('profile-sidebar-role');
    const elTeamText = document.getElementById('profile-sidebar-team-text');

    const nm = fNameInput ? fNameInput.value.trim() : '';
    const rl = fRoleInput ? fRoleInput.value.trim() : '';
    const tm = fTeamInput ? fTeamInput.value.trim() : '';

    if (elName) elName.textContent = nm;
    if (elInitials) {
      const parts = nm.split(' ').filter(Boolean);
      elInitials.textContent = parts.map(p => p.charAt(0).toUpperCase()).slice(0, 2).join('');
    }
    if (elRole) elRole.textContent = rl;
    if (elTeamText) elTeamText.textContent = tm;
  }

  // Bind live preview events
  if (fNameInput) fNameInput.addEventListener('input', updatePreview);
  if (fRoleInput) fRoleInput.addEventListener('input', updatePreview);
  if (fTeamInput) fTeamInput.addEventListener('input', updatePreview);

  if (editBtn) {
    editBtn.addEventListener('click', () => {
      personalFields.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          originalValues[id] = el.value;
          el.disabled = false;
        }
      });
      if (actionsDiv) actionsDiv.style.display = 'flex';
      editBtn.style.display = 'none';

      const first = document.getElementById('profile-name');
      if (first) first.focus();
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      // 1. Lock all fields and hide actions row
      personalFields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = true;
      });
      if (actionsDiv) actionsDiv.style.display = 'none';
      if (editBtn) editBtn.style.display = '';

      // 2. Read current form values
      const newName = fNameInput ? fNameInput.value.trim() : '';
      const newEmail = document.getElementById('profile-email') ? document.getElementById('profile-email').value.trim() : '';
      const newRole = fRoleInput ? fRoleInput.value.trim() : '';
      const newTeam = fTeamInput ? fTeamInput.value.trim() : '';

      // 3. Write to localStorage — single source of truth
      localStorage.setItem('invisiwork-profile', JSON.stringify({
        name: newName, email: newEmail, role: newRole, team: newTeam
      }));

      // 4. Update the complete UI natively
      populateProfile();

      // Show toast
      showToast('Profile updated successfully!', 'success');
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      personalFields.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.value = originalValues[id] || '';
          el.disabled = true;
        }
      });
      if (actionsDiv) actionsDiv.style.display = 'none';
      if (editBtn) editBtn.style.display = '';
      
      // Re-populate from localStorage to discard the live preview changes
      populateProfile();
    });
  }


  /* ══════════════════════════════════════════
     COPY TO CLIPBOARD
  ══════════════════════════════════════════ */
  const copyBtns = document.querySelectorAll('.profile-copy-btn');
  copyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.getAttribute('data-copy');
      if (!text) return;

      navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard!', 'success');

        const originalHTML = btn.innerHTML;
        btn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg> Copied!`;
        btn.style.color = 'var(--color-success)';

        setTimeout(() => {
          btn.innerHTML = originalHTML;
          btn.style.color = '';
        }, 1500);
      });
    });
  });


  /* ══════════════════════════════════════════
     PASSWORD TOGGLE
  ══════════════════════════════════════════ */
  const togglePwBtn = document.getElementById('toggle-password-btn');
  const pwDisplay = document.getElementById('cred-password');
  const togglePwText = document.getElementById('toggle-password-text');
  let passwordVisible = false;
  const mockPassword = 'S3cur3P@ss!';

  if (togglePwBtn && pwDisplay) {
    togglePwBtn.addEventListener('click', () => {
      passwordVisible = !passwordVisible;
      if (passwordVisible) {
        pwDisplay.textContent = mockPassword;
        pwDisplay.classList.remove('profile-credential__value--masked');
        if (togglePwText) togglePwText.textContent = 'Hide';
      } else {
        pwDisplay.textContent = '••••••••••';
        pwDisplay.classList.add('profile-credential__value--masked');
        if (togglePwText) togglePwText.textContent = 'Show';
      }
    });
  }


  /* ══════════════════════════════════════════
     CHANGE PASSWORD (mock)
  ══════════════════════════════════════════ */
  const changePwBtn = document.getElementById('change-password-btn');
  if (changePwBtn) {
    changePwBtn.addEventListener('click', () => {
      showToast('Password change email sent!', 'info');
    });
  }


  /* ══════════════════════════════════════════
     DELETE ACCOUNT (mock)
  ══════════════════════════════════════════ */
  const deleteBtn = document.getElementById('delete-account-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      showToast('Account deletion is disabled in demo mode.', 'error');
    });
  }


  /* ══════════════════════════════════════════
     LOG OUT
  ══════════════════════════════════════════ */
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('invisiwork-auth');
      localStorage.removeItem('invisiwork-theme');
      // Keep invisiwork-profile and invisiwork-activities so returning
      // users see familiar data on their next sign-in.

      showToast('Logging you out…', 'info');

      logoutBtn.disabled = true;
      logoutBtn.innerHTML = `
        <svg class="btn-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10"></circle>
        </svg>
        Signing out…
      `;

      setTimeout(() => {
        window.location.href = 'get-started.html';
      }, 1500);
    });
  }


  /* ══════════════════════════════════════════
     DARK MODE PREFERENCE TOGGLE SYNC
  ══════════════════════════════════════════ */
  function syncDarkModeToggle() {
    const darkToggle = document.getElementById('pref-dark-mode');
    if (!darkToggle) return;

    darkToggle.checked = document.documentElement.classList.contains('dark');

    darkToggle.addEventListener('change', () => {
      const themeBtn = document.getElementById('theme-toggle');
      if (themeBtn) themeBtn.click();
    });

    const observer = new MutationObserver(() => {
      darkToggle.checked = document.documentElement.classList.contains('dark');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }

});