import { Navigate } from 'react-router-dom';
import { getToken } from '../utils/tokenUtils.js';

/**
 * ProtectedRoute wrapper.
 *
 * Guards routes that require authentication. If the user has a JWT token
 * in localStorage, renders the child component. Otherwise, redirects to /login.
 *
 * Usage in App.jsx:
 *   <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
 *
 * Note: This performs a simple token presence check. The backend validates
 * token validity on every protected API call. If the token is expired or
 * invalid, the axios interceptor (in api.js) will catch the 401 response,
 * clear the token, and redirect to login.
 */
function ProtectedRoute({ children }) {
    const token = getToken();

    if (!token) {
        // No token found — redirect to login
        return <Navigate to="/login" replace />;
    }

    // Token exists — render the protected component
    return children;
}

export default ProtectedRoute;
