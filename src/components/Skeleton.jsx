import './Skeleton.css';

/**
 * Skeleton Loader Component
 * Shows placeholder while content is loading
 */
function Skeleton({ variant = 'text', width, height, count = 1 }) {
    const skeletons = Array.from({ length: count }, (_, i) => i);

    const style = {
        width: width || (variant === 'text' ? '100%' : undefined),
        height: height || getDefaultHeight(variant),
    };

    return (
        <div className="skeleton-container">
            {skeletons.map((i) => (
                <div
                    key={i}
                    className={`skeleton skeleton-${variant}`}
                    style={style}
                    aria-busy="true"
                    aria-label="Loading content"
                />
            ))}
        </div>
    );
}

function getDefaultHeight(variant) {
    switch (variant) {
        case 'text':
            return '1rem';
        case 'title':
            return '1.5rem';
        case 'button':
            return '2.5rem';
        case 'avatar':
            return '3rem';
        case 'card':
            return '10rem';
        default:
            return '1rem';
    }
}

export default Skeleton;
