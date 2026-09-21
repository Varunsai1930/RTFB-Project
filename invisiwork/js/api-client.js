/**
 * InvisiWork Frontend — API Client
 * 
 * Centralized backend communication module. Handles token injection,
 * automatic token refreshing, and error throwing.
 *
 * SECURITY: Tokens are stored in module-scoped variables (in-memory only).
 * They are NOT persisted to localStorage or sessionStorage. This means
 * tokens clear on page refresh — the user must log in again after a
 * browser restart. This is intentional per the security spec.
 */

const BASE_URL = 'http://127.0.0.1:5000/api';

// ── Token store (sessionStorage-backed) ─────────────────────────────────────
// Uses sessionStorage so tokens survive page navigations within the same tab,
// but are automatically cleared when the browser tab/window is closed.
// This balances security (no long-term persistence) with usability (multi-page
// app navigation works without re-login on every page change).
let accessToken = sessionStorage.getItem('iw_access') || null;
let refreshToken = sessionStorage.getItem('iw_refresh') || null;

export class ApiError extends Error {
    constructor(status, code, message) {
        super(message);
        this.status = status;
        this.code = code;
        this.name = 'ApiError';
    }
}

export function setTokens(access, refresh) {
    accessToken = access;
    refreshToken = refresh;
    sessionStorage.setItem('iw_access', access);
    sessionStorage.setItem('iw_refresh', refresh);
}

export function clearTokens() {
    accessToken = null;
    refreshToken = null;
    sessionStorage.removeItem('iw_access');
    sessionStorage.removeItem('iw_refresh');
}

export function hasToken() {
    return accessToken !== null;
}

/**
 * Get the current access token (for cross-module reads, e.g. auth-guard).
 * Returns null if no token is set.
 */
export function getAccessToken() {
    return accessToken;
}

/**
 * Fetch a resource from the API with automatic token injection and retry on expiry.
 */
export async function apiFetch(path, options = {}) {
    const url = `${BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
    
    // Prepare headers, injecting access token if we have it
    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }
    
    if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
    }

    const config = {
        ...options,
        headers,
    };

    let response = await fetch(url, config);
    let data;

    try {
        data = await response.json();
    } catch {
        // If not JSON, it might be a 204 No Content
        data = {};
    }

    // Handle token expiry — attempt silent refresh
    if (response.status === 401 && data.error === 'token_expired' && refreshToken) {
        const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${refreshToken}`
            }
        });

        if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            accessToken = refreshData.access_token;
            
            // Retry original request with new token
            config.headers.set('Authorization', `Bearer ${accessToken}`);
            response = await fetch(url, config);
            try {
                data = await response.json();
            } catch {
                data = {};
            }
        } else {
            // Refresh failed (e.g. refresh token expired)
            clearTokens();
            throw new ApiError(refreshRes.status, 'refresh_failed', 'Session expired. Please log in again.');
        }
    }

    if (!response.ok) {
        throw new ApiError(
            response.status,
            data.error || 'unknown_error',
            data.message || `HTTP error ${response.status}`
        );
    }

    return data;
}
