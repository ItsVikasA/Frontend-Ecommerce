import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login } from '../services/authService.js';
import { setToken, setUsername } from '../utils/tokenUtils.js';
import { useToast } from '../components/ToastContainer.jsx';
import OnboardingTour from '../components/OnboardingTour.jsx';
import Spinner from '../components/Spinner.jsx';
import './Login.css';

// -----------------------------------------------------------------------------
//  Validation - mirrors backend LoginRequest.java which only enforces @NotBlank.
//  Character-class / length rules are signup-time concerns.
// -----------------------------------------------------------------------------

function validate(form) {
    const errors = {};
    if (!form.username.trim()) errors.username = 'Username is required';
    if (!form.password)        errors.password = 'Password is required';
    return errors;
}

// -----------------------------------------------------------------------------
//  Reusable form field with password visibility toggle
// -----------------------------------------------------------------------------

function Field({ id, name, label, type, value, onChange, error, autoComplete, required, showPasswordToggle, onTogglePassword, showPassword, placeholder }) {
    const errorId = `${id}-error`;
    return (
        <div className="auth-field">
            <label htmlFor={id} className="auth-label">
                {label}{required && <span className="auth-required" aria-hidden="true"> *</span>}
            </label>
            <div className="auth-input-wrapper">
                <input
                    id={id}
                    name={name}
                    type={showPasswordToggle && showPassword ? 'text' : type}
                    value={value}
                    onChange={onChange}
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    className={`auth-input${error ? ' auth-input-error' : ''}`}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? errorId : undefined}
                    required={required}
                />
                {showPasswordToggle && (
                    <button
                        type="button"
                        className="auth-password-toggle"
                        onClick={onTogglePassword}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? (
                            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                <line x1="1" y1="1" x2="23" y2="23"></line>
                            </svg>
                        ) : (
                            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        )}
                    </button>
                )}
            </div>
            {error && (
                <span id={errorId} className="auth-field-error" role="alert">
                    {error}
                </span>
            )}
        </div>
    );
}

// -----------------------------------------------------------------------------
//  Login page
// -----------------------------------------------------------------------------

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const toast = useToast();

    const [form, setForm]                 = useState({ username: '', password: '' });
    const [errors, setErrors]             = useState({});
    const [submitError, setSubmitError]   = useState(null);
    const [submitting, setSubmitting]     = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);

    // Define onboarding tour steps for Login page
    const tourSteps = [
        {
            target: null,
            title: 'Welcome to Login',
            content: 'Let\'s quickly show you how to access your account. This will only take a moment!',
            position: 'center',
        },
        {
            target: '#username',
            title: 'Username Field',
            content: 'Enter the username you created during signup. It\'s case-sensitive, so make sure to type it exactly as registered.',
            position: 'bottom',
        },
        {
            target: '#password',
            title: 'Password Field',
            content: 'Enter your secure password here. Click the eye icon to show/hide your password as you type.',
            position: 'bottom',
        },
        {
            target: '.auth-password-toggle',
            title: 'Show/Hide Password',
            content: 'Click this eye icon to toggle password visibility. Useful for checking your typing!',
            position: 'left',
        },
        {
            target: '.theme-toggle',
            title: 'Theme Toggle',
            content: 'Switch between light and dark themes. Your preference will be saved automatically.',
            position: 'left',
        },
        {
            target: '.auth-switch',
            title: 'New User?',
            content: 'Don\'t have an account yet? Click the "Sign up" link to create one.',
            position: 'top',
        },
        {
            target: null,
            title: 'Ready to Go',
            content: 'You\'re all set! Enter your credentials and click Login to access your account.',
            position: 'center',
        },
    ];

    // If we arrived from a successful signup, show a toast notification once
    // and clear it from the history state so a page refresh doesn't re-show it.
    useEffect(() => {
        if (location.state && location.state.signupSuccess) {
            toast.success(`Welcome ${location.state.username}! Please log in.`);
            navigate(location.pathname, { replace: true, state: {} });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state, location.pathname, navigate]);

    // Check if user wants to see the login tour
    useEffect(() => {
        const hasSeenLoginTour = localStorage.getItem('hasSeenLoginTour');
        if (!hasSeenLoginTour) {
            // Show tour after a brief delay
            setTimeout(() => {
                setShowOnboarding(true);
            }, 600);
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
        if (submitError) setSubmitError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError(null);

        const validationErrors = validate(form);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;

        setSubmitting(true);
        try {
            const auth = await login(form);
            setToken(auth.token);
            setUsername(auth.username);
            toast.success('Login successful!');
            navigate('/home', { replace: true });
        } catch (err) {
            if (err && err.fieldErrors) setErrors(err.fieldErrors);
            const errorMessage = (err && err.message) || 'Login failed. Please try again.';
            setSubmitError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleOnboardingClose = () => {
        setShowOnboarding(false);
        localStorage.setItem('hasSeenLoginTour', 'true');
    };

    const handleRestartTour = () => {
        setShowOnboarding(true);
    };

    return (
        <div className="auth-shell">
            <button
                type="button"
                className="auth-tour-btn"
                onClick={handleRestartTour}
                title="Show login guide"
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
            </button>

            <form className="auth-card" onSubmit={handleSubmit} noValidate>
                <h1 className="auth-title">Welcome back</h1>
                <p className="auth-subtitle">Log in to continue.</p>

                {submitError && (
                    <div className="auth-error-banner" role="alert">
                        {submitError}
                    </div>
                )}

                <Field
                    id="username" name="username" label="Username" type="text"
                    value={form.username} onChange={handleChange} error={errors.username}
                    autoComplete="username" placeholder="Enter your username" required
                />

                <Field
                    id="password" name="password" label="Password" type="password"
                    value={form.password} onChange={handleChange} error={errors.password}
                    autoComplete="current-password" placeholder="Enter your password" required
                    showPasswordToggle
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                />

                <button
                    type="submit"
                    className="auth-submit"
                    disabled={submitting}
                >
                    {submitting ? (
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <Spinner size="small" />
                            Logging in…
                        </span>
                    ) : 'Login'}
                </button>

                <p className="auth-switch">
                    New user?{' '}
                    <Link to="/signup" className="auth-link">Sign up</Link>
                </p>
            </form>

            <OnboardingTour
                isOpen={showOnboarding}
                onClose={handleOnboardingClose}
                steps={tourSteps}
            />
        </div>
    );
}

export default Login;
