/* ═══════════════════════════════════════════════════════════════
   INVISIWORK — AUTH GUARD
   Protects pages with JWT token validation and role-based routing.
   Include this script on any page that requires authentication.
   ═══════════════════════════════════════════════════════════════ */

import { hasToken, apiFetch, clearTokens } from './api-client.js';

async function guardRoute() {
  if (!hasToken()) {
    window.location.replace('/get-started.html');
    return;
  }
  
  try {
    const user = await apiFetch('/auth/me');
    
    // Store globally for quick UI population
    window.invisiworkUser = user;
    
    // Notify other modules (navbar, dashboard) that real user data is ready
    window.dispatchEvent(new Event('invisiwork:user-loaded'));
    
    // Role-based routing logic
    const currentPath = window.location.pathname;
    
    if (user.role === 'manager') {
      if (currentPath.endsWith('dashboard.html') && !currentPath.endsWith('manager-dashboard.html')) {
        window.location.replace('/manager-dashboard.html');
      }
      if (currentPath.endsWith('personal-dashboard.html')) {
        window.location.replace('/manager-dashboard.html');
      }
    } else if (user.role === 'developer') {
      if (currentPath.endsWith('manager-dashboard.html')) {
        window.location.replace('/dashboard.html');
      }
    }
  } catch (e) {
    console.warn('[AuthGuard] Session invalid:', e);
    clearTokens();
    window.location.replace('/get-started.html');
  }
}

guardRoute();
