import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../services/authService.js';
import { useToast } from '../components/ToastContainer.jsx';
import OnboardingTour from '../components/OnboardingTour.jsx';
import Spinner from '../components/Spinner.jsx';
import './Signup.css';

// -----------------------------------------------------------------------------
//  Validation - mirrors backend bean-validation rules from SignupRequest.java
//  so the frontend blocks exactly what the backend would reject.
// -----------------------------------------------------------------------------

const USERNAME_PATTERN = /^[A-Za-z0-9_]+$/;
const PHONE_PATTERN    = /^\+\d{2}\d{10}$/; // +XX followed by 10 digits
const EMAIL_PATTERN    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Format phone number as user types: +XX XXXXXXXXXX
 */
function formatPhoneNumber(value) {
    // Remove all non-digits except leading +
    const cleaned = value.replace(/[^\d+]/g, '');
    
    // Ensure it starts with +
    if (!cleaned.startsWith('+')) {
        if (cleaned.length === 0) return '';
        return '+' + cleaned;
    }
    
    // Limit to +XX (country code) + 10 digits = 13 characters total
    const limited = cleaned.slice(0, 13);
    
    // Format as +XX XXXXXXXXXX
    if (limited.length <= 3) {
        return limited;
    }
    
    const countryCode = limited.slice(0, 3); // +XX
    const restDigits = limited.slice(3);
    
    return `${countryCode} ${restDigits}`;
}

// Password strength checker
function calculatePasswordStrength(password) {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    const checks = {
        length: password.length >= 8,
        hasLower: /[a-z]/.test(password),
        hasUpper: /[A-Z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[^A-Za-z0-9]/.test(password)
    };
    
    if (checks.length) strength += 20;
    if (checks.hasLower) strength += 20;
    if (checks.hasUpper) strength += 20;
    if (checks.hasNumber) strength += 20;
    if (checks.hasSpecial) strength += 20;
    
    if (password.length >= 12) strength += 10;
    if (password.length >= 16) strength += 10;
    
    if (strength <= 40) return { strength, label: 'Weak', color: '#ef4444' };
    if (strength <= 60) return { strength, label: 'Fair', color: '#f59e0b' };
    if (strength <= 80) return { strength, label: 'Good', color: '#3b82f6' };
    return { strength, label: 'Strong', color: '#10b981' };
}

/**
 * @param {object} form - the current form values
 * @returns {object} an object of field-name → error message; empty if all valid
 */
function validate(form, field = null) {
    const errors = {};

    // Username
    if (!field || field === 'username') {
        if (!form.username.trim()) {
            errors.username = 'Username is required';
        } else if (form.username.length < 3 || form.username.length > 50) {
            errors.username = 'Username must be between 3 and 50 characters';
        } else if (!USERNAME_PATTERN.test(form.username)) {
            errors.username = 'Only letters, digits, and underscores allowed';
        }
    }

    // Email
    if (!field || field === 'email') {
        if (!form.email.trim()) {
            errors.email = 'Email is required';
        } else if (!EMAIL_PATTERN.test(form.email)) {
            errors.email = 'Please enter a valid email address';
        } else if (form.email.length > 255) {
            errors.email = 'Email must not exceed 255 characters';
        }
    }

    // Phone
    if (!field || field === 'phone') {
        // Remove spaces for validation
        const phoneDigits = form.phone.replace(/\s/g, '');
        
        if (!form.phone.trim()) {
            errors.phone = 'Phone is required';
        } else if (!phoneDigits.startsWith('+')) {
            errors.phone = 'Phone must start with + and country code';
        } else if (phoneDigits.length < 13) {
            errors.phone = 'Phone must be +XX (country code) followed by 10 digits';
        } else if (!PHONE_PATTERN.test(phoneDigits)) {
            errors.phone = 'Invalid phone format. Use: +XX XXXXXXXXXX';
        }
    }

    // Password
    if (!field || field === 'password') {
        if (!form.password) {
            errors.password = 'Password is required';
        } else if (form.password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
        } else if (form.password.length > 128) {
            errors.password = 'Password must not exceed 128 characters';
        }
    }

    // Confirm password
    if (!field || field === 'confirmPassword') {
        if (!form.confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
        } else if (form.confirmPassword !== form.password) {
            errors.confirmPassword = 'Passwords do not match';
        }
    }

    return errors;
}

// -----------------------------------------------------------------------------
//  Reusable form field with live validation and password visibility toggle
// -----------------------------------------------------------------------------

function Field({ id, name, label, type, value, onChange, onBlur, error, success, autoComplete, required, showPasswordToggle, onTogglePassword, showPassword, placeholder }) {
    const errorId = `${id}-error`;
    const successId = `${id}-success`;
    
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
                    onBlur={onBlur}
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    className={`auth-input${error ? ' auth-input-error' : ''}${success ? ' auth-input-success' : ''}`}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? errorId : success ? successId : undefined}
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
            {success && !error && (
                <span id={successId} className="auth-field-success" role="status">
                    {success}
                </span>
            )}
        </div>
    );
}

// Password strength indicator component
function PasswordStrength({ password }) {
    const { strength, label, color } = calculatePasswordStrength(password);
    
    if (!password) return null;
    
    return (
        <div className="password-strength">
            <div className="password-strength-bar">
                <div 
                    className="password-strength-fill" 
                    style={{ width: `${strength}%`, backgroundColor: color }}
                />
            </div>
            <div className="password-strength-label" style={{ color }}>
                {label}
            </div>
        </div>
    );
}

// -----------------------------------------------------------------------------
//  Signup page
// -----------------------------------------------------------------------------

function Signup() {
    const navigate = useNavigate();
    const toast = useToast();

    const [form, setForm] = useState({
        username:        '',
        email:           '',
        phone:           '',
        password:        '',
        confirmPassword: ''
    });
    const [errors, setErrors]           = useState({});
    const [touched, setTouched]         = useState({});
    const [submitError, setSubmitError] = useState(null);
    const [submitting, setSubmitting]   = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);

    // Define onboarding tour steps for Signup page
    const tourSteps = [
        {
            target: null,
            title: 'Welcome to Sign Up',
            content: 'Creating an account is quick and easy. Let us walk you through the registration process!',
            position: 'center',
        },
        {
            target: '#username',
            title: 'Choose a Username',
            content: 'Pick a unique username (3-50 characters). Only letters, numbers, and underscores are allowed.',
            position: 'bottom',
        },
        {
            target: '#email',
            title: 'Enter Your Email',
            content: 'Provide a valid email address. We\'ll use this for account recovery and important notifications.',
            position: 'bottom',
        },
        {
            target: '#phone',
            title: 'Phone Number',
            content: 'Enter your phone number in +XX XXXXXXXXXX format (e.g., +91 1234567890). It will auto-format as you type!',
            position: 'bottom',
        },
        {
            target: '#password',
            title: 'Create a Strong Password',
            content: 'Your password must be at least 8 characters. Watch the strength indicator below to make it stronger!',
            position: 'bottom',
        },
        {
            target: '.auth-password-toggle',
            title: 'Show/Hide Password',
            content: 'Click the eye icon to toggle password visibility. Helpful for checking what you typed!',
            position: 'left',
        },
        {
            target: '#confirmPassword',
            title: 'Confirm Password',
            content: 'Re-enter your password to make sure it matches. This helps prevent typos.',
            position: 'bottom',
        },
        {
            target: '.theme-toggle',
            title: 'Theme Toggle',
            content: 'Prefer dark mode? Click here to switch between light and dark themes anytime.',
            position: 'left',
        },
        {
            target: null,
            title: 'Ready to Register',
            content: 'Fill in the form and click "Sign up" to create your account. See you on the other side!',
            position: 'center',
        },
    ];

    // Show onboarding tour on first visit
    useEffect(() => {
        const hasSeenSignupTour = localStorage.getItem('hasSeenSignupTour');
        if (!hasSeenSignupTour) {
            setTimeout(() => {
                setShowOnboarding(true);
            }, 600);
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Special handling for phone number formatting
        let processedValue = value;
        if (name === 'phone') {
            processedValue = formatPhoneNumber(value);
        }
        
        setForm(prev => ({ ...prev, [name]: processedValue }));
        
        // Live validation for touched fields
        if (touched[name]) {
            const fieldErrors = validate({ ...form, [name]: processedValue }, name);
            setErrors(prev => {
                const next = { ...prev };
                if (fieldErrors[name]) {
                    next[name] = fieldErrors[name];
                } else {
                    delete next[name];
                }
                return next;
            });
        }
        
        if (submitError) setSubmitError(null);
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        
        // Validate on blur
        const fieldErrors = validate(form, name);
        setErrors(prev => {
            const next = { ...prev };
            if (fieldErrors[name]) {
                next[name] = fieldErrors[name];
            } else {
                delete next[name];
            }
            return next;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError(null);

        // Mark all as touched
        setTouched({
            username: true,
            email: true,
            phone: true,
            password: true,
            confirmPassword: true
        });

        const validationErrors = validate(form);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;

        setSubmitting(true);
        try {
            // Remove spaces from phone before sending to backend
            const submitData = {
                ...form,
                phone: form.phone.replace(/\s/g, '')
            };
            
            await signup(submitData);
            toast.success('Account created successfully!');
            navigate('/login', {
                replace: true,
                state: { signupSuccess: true, username: form.username }
            });
        } catch (err) {
            if (err && err.fieldErrors) {
                setErrors(err.fieldErrors);
            }
            const errorMessage = (err && err.message) || 'Signup failed. Please try again.';
            setSubmitError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleOnboardingClose = () => {
        setShowOnboarding(false);
        localStorage.setItem('hasSeenSignupTour', 'true');
    };

    const handleRestartTour = () => {
        setShowOnboarding(true);
    };

    const getFieldSuccess = (fieldName) => {
        if (!touched[fieldName] || errors[fieldName] || !form[fieldName]) return null;
        
        const successMessages = {
            username: form.username.length >= 3 ? '✓ Looks good' : null,
            email: EMAIL_PATTERN.test(form.email) ? '✓ Valid email' : null,
            phone: PHONE_PATTERN.test(form.phone.replace(/\s/g, '')) ? '✓ Valid phone' : null,
            password: form.password.length >= 8 ? '✓ Meets requirements' : null,
            confirmPassword: form.password === form.confirmPassword ? '✓ Passwords match' : null
        };
        
        return successMessages[fieldName];
    };

    return (
        <div className="auth-shell">
            <button
                type="button"
                className="auth-tour-btn"
                onClick={handleRestartTour}
                title="Show signup guide"
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
            </button>

            <form className="auth-card" onSubmit={handleSubmit} noValidate>
                <h1 className="auth-title">Create your account</h1>
                <p className="auth-subtitle">Sign up to get started.</p>

                {submitError && (
                    <div className="auth-error-banner" role="alert">
                        {submitError}
                    </div>
                )}

                <Field
                    id="username" 
                    name="username" 
                    label="Username" 
                    type="text"
                    value={form.username} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.username ? errors.username : null}
                    success={getFieldSuccess('username')}
                    autoComplete="username" 
                    placeholder="john_doe"
                    required
                />

                <Field
                    id="email" 
                    name="email" 
                    label="Email" 
                    type="email"
                    value={form.email} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email ? errors.email : null}
                    success={getFieldSuccess('email')}
                    autoComplete="email" 
                    placeholder="john@example.com"
                    required
                />

                <Field
                    id="phone" 
                    name="phone" 
                    label="Phone" 
                    type="tel"
                    value={form.phone} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.phone ? errors.phone : null}
                    success={getFieldSuccess('phone')}
                    autoComplete="tel" 
                    placeholder="+91 1234567890"
                    required
                />
                {!touched.phone && !form.phone && (
                    <div style={{ fontSize: '0.75rem', color: '#757575', marginTop: '-0.5rem', marginBottom: '0.5rem' }}>
                        Format: +XX (country code) followed by 10 digits
                    </div>
                )}

                <Field
                    id="password" 
                    name="password" 
                    label="Password" 
                    type="password"
                    value={form.password} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.password ? errors.password : null}
                    success={getFieldSuccess('password')}
                    autoComplete="new-password" 
                    placeholder="Min. 8 characters"
                    required
                    showPasswordToggle
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                />
                
                {form.password && <PasswordStrength password={form.password} />}

                <Field
                    id="confirmPassword" 
                    name="confirmPassword" 
                    label="Confirm password" 
                    type="password"
                    value={form.confirmPassword} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.confirmPassword ? errors.confirmPassword : null}
                    success={getFieldSuccess('confirmPassword')}
                    autoComplete="new-password" 
                    placeholder="Re-enter password"
                    required
                    showPasswordToggle
                    showPassword={showConfirmPassword}
                    onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                />

                <button
                    type="submit"
                    className="auth-submit"
                    disabled={submitting}
                >
                    {submitting ? (
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <Spinner size="small" />
                            Signing up…
                        </span>
                    ) : 'Sign up'}
                </button>

                <p className="auth-switch">
                    Already have an account?{' '}
                    <Link to="/login" className="auth-link">Login</Link>
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

export default Signup;
