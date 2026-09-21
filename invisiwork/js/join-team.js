/* ═══════════════════════════════════════════════════════════════
   INVISIWORK — JOIN TEAM JS
   Handles the team code submission after signup.
   ═══════════════════════════════════════════════════════════════ */

import { apiFetch, hasToken, ApiError } from './api-client.js';

document.addEventListener('DOMContentLoaded', () => {

  // If not authenticated, redirect to login
  if (!hasToken()) {
    window.location.replace('get-started.html');
    return;
  }

  const joinBtn = document.getElementById('join-btn');
  const codeInput = document.getElementById('team-code');
  const codeError = document.getElementById('code-error');
  const globalError = document.getElementById('global-error');
  const formState = document.getElementById('form-state');
  const successState = document.getElementById('success-state');
  const teamNameDisplay = document.getElementById('team-name-display');
  const continueBtn = document.getElementById('continue-btn');

  if (!joinBtn || !codeInput) return;

  // Auto-uppercase as user types
  codeInput.addEventListener('input', () => {
    codeInput.value = codeInput.value.toUpperCase();
    clearError();
  });

  joinBtn.addEventListener('click', async () => {
    const code = codeInput.value.trim();

    if (!code || code.length < 4) {
      showError('Please enter a valid team code (at least 4 characters).');
      codeInput.classList.add('error', 'shake');
      setTimeout(() => codeInput.classList.remove('shake'), 400);
      return;
    }

    joinBtn.disabled = true;
    const oldHtml = joinBtn.innerHTML;
    joinBtn.innerHTML = '<span class="spinner"></span> Joining...';
    clearError();

    try {
      const data = await apiFetch('/auth/join-team', {
        method: 'POST',
        body: JSON.stringify({ code: code })
      });

      // Show success state
      formState.style.display = 'none';
      successState.style.display = 'block';
      teamNameDisplay.textContent = data.team_name;

    } catch (e) {
      joinBtn.disabled = false;
      joinBtn.innerHTML = oldHtml;

      if (e instanceof ApiError) {
        if (e.status === 404) {
          showError('Invalid team code. Please check with your manager and try again.');
          codeInput.classList.add('error');
        } else if (e.status === 409) {
          showError('You are already in a team.');
        } else {
          showError(e.message || 'Something went wrong. Please try again.');
        }
      } else {
        showError('Could not connect to server. Please try again.');
      }
    }
  });

  // Allow Enter key to submit
  codeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      joinBtn.click();
    }
  });

  // Continue button → go to dashboard
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      window.location.href = 'dashboard.html';
    });
  }

  function showError(message) {
    if (globalError) globalError.textContent = message;
    if (codeError) {
      codeError.textContent = message;
      codeError.style.display = 'block';
    }
  }

  function clearError() {
    if (globalError) globalError.textContent = '';
    if (codeError) codeError.style.display = 'none';
    codeInput.classList.remove('error');
  }

});
