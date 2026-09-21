/* ═══════════════════════════════════════════════════════════════
   INVISIWORK — ONBOARDING JS
   Wires up the login and registration forms to the backend API.
   ═══════════════════════════════════════════════════════════════ */

import { apiFetch, setTokens, ApiError } from './api-client.js';

document.addEventListener('DOMContentLoaded', () => {

  const params = new URLSearchParams(window.location.search);
  const isSignIn = params.get('mode') === 'signin';

  const createBtn = document.getElementById('create-btn');
  const emailInput = document.getElementById('email');
  const emailError = document.getElementById('email-error');
  const passwordInput = document.getElementById('password');
  const passwordError = document.getElementById('password-error');
  const nameInput = document.getElementById('name');
  const nameError = document.getElementById('name-error');
  const nameField = document.getElementById('name-field');
  const roleInput = document.getElementById('role');
  const roleField = document.getElementById('role-field');
  const stepsEl = document.querySelector('.steps');
  const cardTitle = document.querySelector('.onboarding__card h1');
  const cardSub = document.querySelector('.onboarding__sub');
  const switchLink = document.getElementById('switch-mode-link');
  const switchText = document.getElementById('switch-mode-text');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!createBtn || !emailInput) return;

  if (isSignIn) {
    if (cardTitle) cardTitle.textContent = 'Welcome back';
    if (cardSub) cardSub.textContent = 'Enter your details to sign back in.';
    if (nameField) nameField.style.display = 'none';
    if (roleField) roleField.style.display = 'none';
    createBtn.textContent = 'Sign In →';
    if (stepsEl) stepsEl.style.display = 'none';
    const passwordHint = document.getElementById('password-hint');
    if (passwordHint) passwordHint.style.display = 'none';
    if (switchText) switchText.textContent = "Don't have an account?";
    if (switchLink) {
      switchLink.textContent = 'Sign up';
      switchLink.href = 'get-started.html';
    }
  }

  createBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    let hasError = false;

    const emailVal = emailInput.value.trim();
    if (!emailRegex.test(emailVal)) {
      showFieldError(emailInput, emailError, 'Please enter a valid email.');
      hasError = true;
    } else clearFieldError(emailInput, emailError);

    const passwordVal = passwordInput ? passwordInput.value : '';
    if (!isSignIn) {
      // ── Full password-strength check for signup ──
      const pwErrors = [];
      if (passwordVal.length < 8) pwErrors.push('at least 8 characters');
      if (!/[A-Z]/.test(passwordVal)) pwErrors.push('one uppercase letter');
      if (!/[0-9]/.test(passwordVal)) pwErrors.push('one number');
      if (!/[!@#$%^&*()_+\-=\[\]{}|;:'",.<>?/\\`~]/.test(passwordVal)) pwErrors.push('one special character');
      if (pwErrors.length) {
        showFieldError(passwordInput, passwordError, 'Password must contain: ' + pwErrors.join(', ') + '.');
        hasError = true;
      } else clearFieldError(passwordInput, passwordError);
    } else {
      // Sign-in: just ensure something was entered
      if (!passwordVal) {
        showFieldError(passwordInput, passwordError, 'Please enter your password.');
        hasError = true;
      } else clearFieldError(passwordInput, passwordError);
    }

    let nameVal = '';
    let roleVal = 'developer';

    if (!isSignIn) {
      nameVal = nameInput ? nameInput.value.trim() : '';
      if (!nameVal || nameVal.length < 2) {
        showFieldError(nameInput, nameError, 'Please enter your full name.');
        hasError = true;
      } else clearFieldError(nameInput, nameError);

      roleVal = roleInput ? roleInput.value : 'developer';
    }

    if (hasError) return;

    createBtn.disabled = true;
    const oldHtml = createBtn.innerHTML;
    createBtn.innerHTML = '<span class="spinner"></span> Loading...';
    clearGlobalError();

    try {
      if (isSignIn) {
        const payload = { email: emailVal, password: passwordVal };
        const data = await apiFetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        
        setTokens(data.access_token, data.refresh_token);
        window.invisiworkUser = data.user;
        
        window.location.href = data.user.role === 'manager' ? 'manager-dashboard.html' : 'dashboard.html';

      } else {
        const payload = { name: nameVal, email: emailVal, password: passwordVal, role: roleVal };
        await apiFetch('/auth/register', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        
        // Auto-login after successful registration
        const loginData = await apiFetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: emailVal, password: passwordVal })
        });
        
        setTokens(loginData.access_token, loginData.refresh_token);
        window.invisiworkUser = loginData.user;
        
        // After signup: managers go to dashboard, developers go to join-team page
        if (loginData.user.role === 'manager') {
          window.location.href = 'manager-dashboard.html';
        } else {
          window.location.href = 'join-team.html';
        }
      }
    } catch (e) {
      createBtn.disabled = false;
      createBtn.innerHTML = oldHtml;
      
      if (e instanceof ApiError) {
        if (e.status === 401) {
          showGlobalError('Invalid email or password.');
          showFieldError(emailInput, null, '');
          showFieldError(passwordInput, null, '');
        } else if (e.status === 409) {
          showGlobalError('An account with this email already exists.');
          showFieldError(emailInput, null, '');
        } else {
          showGlobalError(e.message || 'An error occurred. Please try again.');
        }
      } else {
        showGlobalError('Could not connect to server. Please try again.');
      }
    }
  });

  if (emailInput) emailInput.addEventListener('input', () => clearFieldError(emailInput, emailError));
  if (passwordInput) passwordInput.addEventListener('input', () => clearFieldError(passwordInput, passwordError));
  if (nameInput) nameInput.addEventListener('input', () => clearFieldError(nameInput, nameError));

  function showFieldError(inputEl, errorEl, message) {
    if (!inputEl) return;
    inputEl.classList.add('error', 'shake');
    setTimeout(() => inputEl.classList.remove('shake'), 400);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }
  }

  function clearFieldError(inputEl, errorEl) {
    if (!inputEl) return;
    inputEl.classList.remove('error');
    if (errorEl) errorEl.style.display = 'none';
  }

  function showGlobalError(message) {
    // Append a generic error if none exists
    let globalError = document.getElementById('global-error');
    if (!globalError) {
      globalError = document.createElement('div');
      globalError.id = 'global-error';
      globalError.style.color = 'var(--color-danger)';
      globalError.style.marginTop = 'var(--space-4)';
      globalError.style.fontSize = 'var(--font-size-sm)';
      globalError.style.textAlign = 'center';
      
      const formNode = document.getElementById('create-btn');
      formNode.parentNode.insertBefore(globalError, formNode);
    }
    globalError.textContent = message;
  }

  function clearGlobalError() {
    const globalError = document.getElementById('global-error');
    if (globalError) globalError.textContent = '';
  }

});