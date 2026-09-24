import axios from 'axios';
import { clearToken, getToken } from '../utils/tokenUtils.js';

/**
 * services/api.js
 *
 * Enhanced axios instance with automatic retry logic for failed requests.
 *
 * Features:
 * - JWT authentication via Authorization header
 * - Automatic retry on network/timeout errors (3 attempts with exponential backoff)
 * - Auto-logout on 401 for protected endpoints
 * - Normalized error handling
 */

// API Base URL - reads from environment variable or defaults to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second base delay
const RETRY_STATUS_CODES = [408, 429, 500, 502, 503, 504]; // Retryable HTTP status codes

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15_000,          // 15s timeout (increased for retry logic)
    withCredentials: false,
    headers: {
        'Content-Type': 'application/json',
        'Accept':       'application/json'
    }
});

// -----------------------------------------------------------------------------
//  Retry Logic with Exponential Backoff
// -----------------------------------------------------------------------------

/**
 * Determines if a request should be retried
 */
function shouldRetry(error) {
    if (!error.config) return false;
    
    // Don't retry if max attempts reached
    const currentRetry = error.config.__retryCount || 0;
    if (currentRetry >= MAX_RETRIES) return false;
    
    // Don't retry POST requests for auth endpoints (avoid duplicate signups)
    if (error.config.method === 'post' && isAuthEndpoint(error.config)) {
        return false;
    }
    
    // Retry on network errors
    if (!error.response) return true;
    
    // Retry on specific status codes
    if (RETRY_STATUS_CODES.includes(error.response.status)) return true;
    
    return false;
}

/**
 * Delays execution for exponential backoff
 */
function delay(retryCount) {
    const exponentialDelay = RETRY_DELAY * Math.pow(2, retryCount);
    return new Promise(resolve => setTimeout(resolve, exponentialDelay));
}

// -----------------------------------------------------------------------------
//  Request interceptor - inject JWT if we have one
// -----------------------------------------------------------------------------

api.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// -----------------------------------------------------------------------------
//  Response interceptor - error handling with retry + auto-logout
// -----------------------------------------------------------------------------

/**
 * True if the failing request was the login or signup call itself.
 */
function isAuthEndpoint(config) {
    const url = (config && config.url) || '';
    return url.includes('/auth/login') || url.includes('/auth/signup');
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const config = error.config;
        
        // ---- Retry Logic ----
        if (shouldRetry(error)) {
            config.__retryCount = (config.__retryCount || 0) + 1;
            
            console.log(`Retrying request (${config.__retryCount}/${MAX_RETRIES}):`, config.url);
            
            await delay(config.__retryCount - 1);
            
            return api.request(config);
        }
        
        // ---- Auto-logout on 401 for protected calls ----
        if (error.response && error.response.status === 401 && !isAuthEndpoint(config)) {
            clearToken();
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }

        // ---- Normalize error shape for the caller ----
        let message;
        if (error.response && error.response.data && error.response.data.message) {
            message = error.response.data.message;
        } else if (error.code === 'ECONNABORTED') {
            message = 'Request timed out. Please check your connection and try again.';
        } else if (!error.response) {
            // Network error - show helpful message
            if (error.message.includes('Network Error')) {
                message = 'Network error. Please check your internet connection.';
            } else {
                message = `Cannot reach the server. Please check if the backend is running.`;
            }
        } else if (error.response.status === 500) {
            message = 'Server error. Please try again later.';
        } else if (error.response.status === 503) {
            message = 'Service temporarily unavailable. Please try again.';
        } else {
            message = error.message || 'Request failed';
        }

        const normalized = new Error(message);
        normalized.status         = error.response ? error.response.status : undefined;
        normalized.fieldErrors    = error.response && error.response.data
                                        ? error.response.data.fieldErrors
                                        : undefined;
        normalized.originalError  = error;
        normalized.isNetworkError = !error.response;
        normalized.retryCount     = config.__retryCount || 0;

        return Promise.reject(normalized);
    }
);

export default api;
