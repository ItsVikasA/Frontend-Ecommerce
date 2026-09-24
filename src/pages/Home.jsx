import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe } from '../services/userService.js';
import { clearToken, getUsername } from '../utils/tokenUtils.js';
import { useToast } from '../components/ToastContainer.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import OnboardingTour from '../components/OnboardingTour.jsx';
import Spinner from '../components/Spinner.jsx';
import ImageGallery from '../components/ImageGallery.jsx';
import './Home.css';

/**
 * Home page.
 *
 * Renders "Welcome, <username>" and a Logout button. Also calls
 * {@code GET /users/me} on mount for two reasons:
 *   1. Re-verify that the stored JWT is still valid (the endpoint is protected).
 *   2. Refresh the profile data in case it changed server-side.
 *
 * Display strategy (Option C from STEP 1):
 *   - Instant render from the cached username in localStorage — no flash of
 *     empty state.
 *   - Once the /users/me response lands, richer profile data (email, phone,
 *     member-since) fades in.
 *
 * Route-level protection is added in STEP 19 via ProtectedRoute. STEP 20
 * covers logout in more detail (this file already implements a working one).
 */
function Home() {
    const navigate = useNavigate();
    const toast = useToast();

    // Instant "Welcome, <username>" from cache.
    const [profile, setProfile] = useState(() => {
        const cached = getUsername();
        return cached ? { username: cached } : null;
    });
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(null);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);

    // Define onboarding tour steps
    const tourSteps = [
        {
            target: null, // No specific target, centered
            title: 'Welcome to Your Dashboard',
            content: 'Let\'s take a quick tour to help you get started. This will only take a minute.',
            position: 'center',
        },
        {
            target: '.home-welcome',
            title: 'Your Profile',
            content: 'This is your personalized welcome section. Your username is displayed here.',
            position: 'bottom',
        },
        {
            target: '.home-logout',
            title: 'Logout Button',
            content: 'Click here whenever you want to securely log out of your account. Don\'t worry, we\'ll ask for confirmation first!',
            position: 'bottom',
        },
        {
            target: '.home-profile',
            title: 'Account Information',
            content: 'Here you can view your account details including email, phone number, and when you joined.',
            position: 'top',
        },
        {
            target: '.theme-toggle',
            title: 'Dark Mode Toggle',
            content: 'Switch between light and dark themes based on your preference. Try clicking it!',
            position: 'left',
        },
        {
            target: null,
            title: 'You\'re All Set',
            content: 'That\'s it! You now know the basics. Explore the app and enjoy your experience. You can restart this tour anytime from settings.',
            position: 'center',
        },
    ];

    // On mount: refresh profile from the backend, which also verifies the JWT.
    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const me = await getMe();
                if (cancelled) return;
                setProfile(me);
                setError(null);

                // Check if this is the user's first time (show onboarding)
                const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
                if (!hasSeenOnboarding) {
                    // Small delay to let the page load first
                    setTimeout(() => {
                        setShowOnboarding(true);
                    }, 800);
                }
            } catch (err) {
                if (cancelled) return;
                // Once real API is wired (STEP 17), a 401 will trigger the
                // axios response interceptor to auto-clear + redirect. Any
                // *other* failure surfaces here.
                setError((err && err.message) || 'Failed to load your profile.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, []);

    const handleLogout = () => {
        clearToken();
        toast.success('Logged out successfully');
        navigate('/login', { replace: true });
    };

    const handleOnboardingClose = () => {
        setShowOnboarding(false);
        localStorage.setItem('hasSeenOnboarding', 'true');
        toast.success('Tour completed! Welcome aboard!');
    };

    const handleRestartTour = () => {
        setShowOnboarding(true);
    };

    return (
        <div className="home-container">
            {/* Top Navigation Bar */}
            <nav className="home-navbar">
                <h1 className="home-welcome">
                    Welcome, <span className="home-username">{profile?.username || '…'}</span>
                </h1>
                <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
                    <button
                        type="button"
                        className="home-tour-btn"
                        onClick={handleRestartTour}
                        title="Restart tour"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                    </button>
                    <button
                        type="button"
                        className="home-logout"
                        onClick={() => setShowLogoutDialog(true)}
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <div className="home-main">
                {/* Profile Sidebar */}
                <aside className="home-sidebar">
                    <div className="home-card">
                        <h2 className="sidebar-title">Profile Information</h2>
                        
                        {loading && (
                            <div className="home-status">
                                <Spinner text="Loading…" />
                            </div>
                        )}

                        {error && (
                            <div className="home-error" role="alert">
                                {error}
                            </div>
                        )}

                        {profile && !loading && !error && (
                            <dl className="home-profile">
                                {profile.email && (
                                    <div className="home-profile-row">
                                        <dt className="home-profile-label">Email</dt>
                                        <dd className="home-profile-value">{profile.email}</dd>
                                    </div>
                                )}
                                {profile.phone && (
                                    <div className="home-profile-row">
                                        <dt className="home-profile-label">Phone</dt>
                                        <dd className="home-profile-value">{profile.phone}</dd>
                                    </div>
                                )}
                                {profile.createdAt && (
                                    <div className="home-profile-row">
                                        <dt className="home-profile-label">Member since</dt>
                                        <dd className="home-profile-value">
                                            {new Date(profile.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        )}
                    </div>
                </aside>

                {/* Gallery Content */}
                <main className="home-content-area">
                    <ImageGallery showOnlyCakes={false} />
                </main>
            </div>
            
            <ConfirmDialog
                isOpen={showLogoutDialog}
                onClose={() => setShowLogoutDialog(false)}
                onConfirm={handleLogout}
                title="Logout"
                message="Are you sure you want to logout?"
                confirmText="Logout"
                cancelText="Cancel"
            />

            <OnboardingTour
                isOpen={showOnboarding}
                onClose={handleOnboardingClose}
                steps={tourSteps}
            />
        </div>
    );
}

export default Home;
