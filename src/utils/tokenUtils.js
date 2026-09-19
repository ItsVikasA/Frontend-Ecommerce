/**
 * utils/tokenUtils.js
 *
 * The single owner of client-side token storage. No other file in the app
 * touches `localStorage.auth_*` directly — everyone goes through these
 * exports. That way, changing the storage strategy (e.g. sessionStorage,
 * memory, HttpOnly cookies) is a one-file edit.
 *
 * STEP 15 (this step) — ships basic get/set/clear helpers.
 * STEP 18            — will add {@link isTokenExpired} that decodes the JWT
 *                       payload and compares `exp` against `Date.now()`.
 */

const TOKEN_KEY    = 'auth_token';
const USERNAME_KEY = 'auth_username';

// -----------------------------------------------------------------------------
//  Token
// -----------------------------------------------------------------------------

/** Persist a JWT in localStorage. */
export function setToken(token) {
    if (typeof token === 'string' && token.length > 0) {
        localStorage.setItem(TOKEN_KEY, token);
    }
}

/** Return the persisted JWT or `null` if there is none. */
export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

/** Remove all auth-related keys. Called on logout and on 401 responses. */
export function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
}

// -----------------------------------------------------------------------------
//  Username (cached for instant Home-page render — see STEP 1, Option C)
// -----------------------------------------------------------------------------

/** Persist the username that was echoed back in the login response. */
export function setUsername(username) {
    if (typeof username === 'string' && username.length > 0) {
        localStorage.setItem(USERNAME_KEY, username);
    }
}

/** Return the persisted username or `null` if there is none. */
export function getUsername() {
    return localStorage.getItem(USERNAME_KEY);
}
