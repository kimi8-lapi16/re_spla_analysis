import { OpenAPI } from '../api';

/**
 * Configure OpenAPI client
 * Set base URL and credentials for API requests
 */
export function configureApiClient() {
  // Set base URL from environment variable or default to localhost
  OpenAPI.BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  // Enable credentials (cookies) for authentication
  OpenAPI.WITH_CREDENTIALS = true;
  OpenAPI.CREDENTIALS = 'include';

  // Set token resolver for Bearer authentication
  // This will be called automatically for endpoints that require authentication
  OpenAPI.TOKEN = async () => {
    // You can get the token from localStorage, sessionStorage, or any state management
    const token = localStorage.getItem('accessToken');
    return token || '';
  };
}
