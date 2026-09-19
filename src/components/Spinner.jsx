import './Spinner.css';

/**
 * Spinner Component
 * Minimalistic loading spinner
 */
function Spinner({ size = 'medium', text = null }) {
    return (
        <div className="spinner-wrapper">
            <div className={`spinner spinner-${size}`} role="status" aria-label="Loading">
                <div className="spinner-circle"></div>
            </div>
            {text && <p className="spinner-text">{text}</p>}
        </div>
    );
}

export default Spinner;
