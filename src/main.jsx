import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

/**
 * React entry point.
 *
 * `createRoot` is React 18/19's concurrent-mode root API. StrictMode
 * intentionally double-invokes some lifecycles in development to surface
 * side-effect bugs — this has zero cost in production builds.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
