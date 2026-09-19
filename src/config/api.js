/**
 * API Base URL Configuration
 * 
 * Uses environment variable VITE_API_URL if available,
 * otherwise defaults to local development URL.
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

export default API_BASE_URL;
