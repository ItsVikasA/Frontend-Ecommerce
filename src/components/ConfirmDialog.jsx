import { useEffect } from 'react';
import './ConfirmDialog.css';

/**
 * Confirmation Dialog Component
 * Modal dialog for confirming critical actions (logout, delete, etc.)
 */
function ConfirmDialog({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = 'Confirm Action', 
    message = 'Are you sure?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'default' // 'default' or 'danger'
}) {
    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            className="confirm-dialog-backdrop" 
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
        >
            <div className="confirm-dialog">
                <div className="confirm-dialog-header">
                    <h2 id="dialog-title" className="confirm-dialog-title">{title}</h2>
                    <button
                        className="confirm-dialog-close"
                        onClick={onClose}
                        aria-label="Close dialog"
                    >
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
                
                <div className="confirm-dialog-body">
                    <p className="confirm-dialog-message">{message}</p>
                </div>
                
                <div className="confirm-dialog-footer">
                    <button
                        className="confirm-dialog-button confirm-dialog-button-cancel"
                        onClick={onClose}
                    >
                        {cancelText}
                    </button>
                    <button
                        className={`confirm-dialog-button confirm-dialog-button-confirm ${variant === 'danger' ? 'danger' : ''}`}
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDialog;
