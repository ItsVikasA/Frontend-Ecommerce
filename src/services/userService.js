import api from './api.js';

/**
 * services/userService.js
 *
 * User-info endpoint wrappers. Every call is authenticated — the request
 * interceptor in {@link api.js} attaches the current JWT automatically.
 *
 * @see api.js
 */

// -----------------------------------------------------------------------------
//  getMe
// -----------------------------------------------------------------------------

/**
 * GET /users/me — the currently authenticated user's profile.
 *
 * Backend resolves identity from the JWT subject; no id is sent.
 *
 * @returns {Promise<{id:number, username:string, email:string, phone:string, createdAt:string}>}
 *
 * @throws {Error} normalised by the response interceptor:
 *   - 401 (missing/expired JWT) → axios interceptor clears storage and
 *                                  force-redirects to /login before this
 *                                  rejection is even seen by the caller.
 *   - Other statuses / network errors propagate normally.
 */
export async function getMe() {
    const { data } = await api.get('/users/me');
    return data;
}

// -----------------------------------------------------------------------------
//  getById
// -----------------------------------------------------------------------------

/**
 * GET /users/{id} — fetch a user by primary key. Requires authentication.
 *
 * @param {number|string} id
 * @returns {Promise<{id:number, username:string, email:string, phone:string, createdAt:string}>}
 *
 * @throws {Error} normalised — 404 if no user has that id.
 */
export async function getById(id) {
    const { data } = await api.get(`/users/${id}`);
    return data;
}
