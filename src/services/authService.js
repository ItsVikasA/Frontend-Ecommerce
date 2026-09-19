import api from './api.js';

/**
 * services/authService.js
 *
 * Auth endpoint wrappers. Every call goes through the shared axios
 * instance in {@link api.js}, so JWT injection, error normalisation, and
 * 401 auto-logout happen automatically.
 *
 * @see api.js
 */

// -----------------------------------------------------------------------------
//  signup
// -----------------------------------------------------------------------------

/**
 * POST /auth/signup — register a new user.
 *
 * @param {object} payload
 * @param {string} payload.username         — 3-50 chars, alphanumeric + underscore
 * @param {string} payload.password         — 8-128 chars
 * @param {string} payload.confirmPassword  — must equal password
 * @param {string} payload.email            — RFC 5321 valid, max 255 chars
 * @param {string} payload.phone            — 7-15 digits, optional leading '+'
 *
 * @returns {Promise<{id:number, username:string, email:string, phone:string, createdAt:string}>}
 *          Safe user projection (never contains password).
 *
 * @throws {Error} normalised by the response interceptor:
 *   - `.message`     — user-facing string
 *   - `.status`      — HTTP status (400 validation, 409 duplicate, 500 server)
 *   - `.fieldErrors` — object of field → message, present on 400 validation errors
 */
export async function signup(payload) {
    const { data } = await api.post('/auth/signup', payload);
    return data;
}

// -----------------------------------------------------------------------------
//  login
// -----------------------------------------------------------------------------

/**
 * POST /auth/login — verify credentials and receive a JWT.
 *
 * @param {object} payload
 * @param {string} payload.username
 * @param {string} payload.password
 *
 * @returns {Promise<{token:string, tokenType:string, username:string, expiresIn:number}>}
 *          {@code expiresIn} is in seconds (OAuth 2.0 convention).
 *
 * @throws {Error} normalised by the response interceptor:
 *   - 400 → `.message = "Validation failed"`, `.fieldErrors` populated
 *   - 401 → `.message = "Invalid username or password"` (NOT auto-redirected;
 *           handled by the login page's own error banner)
 *   - 500 → `.message = "Internal server error"`
 */
export async function login(payload) {
    const { data } = await api.post('/auth/login', payload);
    return data;
}
