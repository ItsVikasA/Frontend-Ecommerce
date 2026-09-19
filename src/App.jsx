import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { ToastProvider } from './components/ToastContainer.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import Signup from './pages/Signup.jsx';
import Login  from './pages/Login.jsx';
import Home   from './pages/Home.jsx';
import './App.css';

/**
 * Root router.
 *
 * <p>Route map:
 * <ul>
 *   <li>{@code /}        → redirects to /login (default landing)</li>
 *   <li>{@code /signup}  → Signup page (public)</li>
 *   <li>{@code /login}   → Login  page (public)</li>
 *   <li>{@code /home}    → Home page (protected - requires JWT token)</li>
 *   <li>{@code *}        → 404 catch-all for unmatched paths</li>
 * </ul>
 */
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <BrowserRouter>
            <ThemeToggle />
            <Routes>
              <Route path="/"       element={<Navigate to="/login" replace />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login"  element={<Login />} />
              <Route path="/home"   element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="*"       element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

function NotFound() {
  return (
    <div className="scaffold-shell">
      <div className="scaffold-card">
        <h1>404</h1>
        <p className="scaffold-sub">Page not found.</p>
      </div>
    </div>
  );
}

export default App;
