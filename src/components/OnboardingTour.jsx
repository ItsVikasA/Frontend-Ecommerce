import { useState, useEffect } from 'react';
import './OnboardingTour.css';

/**
 * Onboarding Tour Component
 * 
 * Guides new users through the application features with a step-by-step tour.
 * Tour is shown once per user and can be skipped or restarted.
 * 
 * @param {boolean} isOpen - Whether the tour is active
 * @param {Function} onClose - Callback when tour is completed or skipped
 * @param {Array} steps - Array of tour steps with target, title, content, and position
 */
function OnboardingTour({ isOpen, onClose, steps = [] }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [highlightStyle, setHighlightStyle] = useState({});

    useEffect(() => {
        if (!isOpen || steps.length === 0) return;

        const updateHighlight = () => {
            const step = steps[currentStep];
            if (!step.target) {
                setHighlightStyle({});
                return;
            }

            const element = document.querySelector(step.target);
            if (!element) {
                setHighlightStyle({});
                return;
            }

            const rect = element.getBoundingClientRect();
            setHighlightStyle({
                top: `${rect.top + window.scrollY}px`,
                left: `${rect.left + window.scrollX}px`,
                width: `${rect.width}px`,
                height: `${rect.height}px`,
            });

            // Scroll element into view
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        };

        updateHighlight();
        window.addEventListener('resize', updateHighlight);
        return () => window.removeEventListener('resize', updateHighlight);
    }, [isOpen, currentStep, steps]);

    if (!isOpen || steps.length === 0) return null;

    const step = steps[currentStep];
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === steps.length - 1;

    const handleNext = () => {
        if (isLastStep) {
            onClose();
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSkip = () => {
        onClose();
    };

    // Calculate tooltip position
    const getTooltipStyle = () => {
        if (!step.target) {
            // Center the tooltip if no target
            return {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
            };
        }

        const element = document.querySelector(step.target);
        if (!element) return {};

        const rect = element.getBoundingClientRect();
        const tooltipOffset = 20;
        const position = step.position || 'bottom';

        switch (position) {
            case 'top':
                return {
                    top: `${rect.top + window.scrollY - tooltipOffset}px`,
                    left: `${rect.left + window.scrollX + rect.width / 2}px`,
                    transform: 'translate(-50%, -100%)',
                };
            case 'bottom':
                return {
                    top: `${rect.bottom + window.scrollY + tooltipOffset}px`,
                    left: `${rect.left + window.scrollX + rect.width / 2}px`,
                    transform: 'translate(-50%, 0)',
                };
            case 'left':
                return {
                    top: `${rect.top + window.scrollY + rect.height / 2}px`,
                    left: `${rect.left + window.scrollX - tooltipOffset}px`,
                    transform: 'translate(-100%, -50%)',
                };
            case 'right':
                return {
                    top: `${rect.top + window.scrollY + rect.height / 2}px`,
                    left: `${rect.right + window.scrollX + tooltipOffset}px`,
                    transform: 'translate(0, -50%)',
                };
            default:
                return {
                    top: `${rect.bottom + window.scrollY + tooltipOffset}px`,
                    left: `${rect.left + window.scrollX + rect.width / 2}px`,
                    transform: 'translate(-50%, 0)',
                };
        }
    };

    return (
        <>
            {/* Overlay */}
            <div className="onboarding-overlay" onClick={handleSkip} />

            {/* Highlight box around target element */}
            {step.target && highlightStyle.width && (
                <div className="onboarding-highlight" style={highlightStyle} />
            )}

            {/* Tooltip */}
            <div className="onboarding-tooltip" style={getTooltipStyle()}>
                <div className="onboarding-tooltip-header">
                    <h3 className="onboarding-tooltip-title">{step.title}</h3>
                    <button
                        type="button"
                        className="onboarding-tooltip-close"
                        onClick={handleSkip}
                        aria-label="Close tour"
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="2" y1="2" x2="14" y2="14" />
                            <line x1="14" y1="2" x2="2" y2="14" />
                        </svg>
                    </button>
                </div>

                <div className="onboarding-tooltip-content">
                    {step.content}
                </div>

                <div className="onboarding-tooltip-footer">
                    <div className="onboarding-progress">
                        <span className="onboarding-step-counter">
                            {currentStep + 1} of {steps.length}
                        </span>
                        <div className="onboarding-progress-dots">
                            {steps.map((_, index) => (
                                <span
                                    key={index}
                                    className={`onboarding-progress-dot ${
                                        index === currentStep ? 'active' : ''
                                    } ${index < currentStep ? 'completed' : ''}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="onboarding-actions">
                        {!isFirstStep && (
                            <button
                                type="button"
                                className="onboarding-btn onboarding-btn-secondary"
                                onClick={handlePrevious}
                            >
                                Previous
                            </button>
                        )}
                        {!isLastStep && (
                            <button
                                type="button"
                                className="onboarding-btn onboarding-btn-ghost"
                                onClick={handleSkip}
                            >
                                Skip Tour
                            </button>
                        )}
                        <button
                            type="button"
                            className="onboarding-btn onboarding-btn-primary"
                            onClick={handleNext}
                        >
                            {isLastStep ? 'Finish' : 'Next'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default OnboardingTour;
