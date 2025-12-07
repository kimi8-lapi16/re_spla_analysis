import axios from "axios";
import { OpenAPI } from "../api";
import { setupAxiosInterceptor } from "./axios-interceptor";
import { useAuthStore } from "../store/authStore";

/**
 * Configure OpenAPI client
 * Set base URL and credentials for API requests
 * @param onLogout - Callback function to call when refresh token fails
 */
export function configureApiClient(onLogout: () => void) {
  // Set base URL from environment variable or default to localhost
  OpenAPI.BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  // Enable credentials (cookies) for authentication
  OpenAPI.WITH_CREDENTIALS = true;
  OpenAPI.CREDENTIALS = "include";

  // Set token resolver for Bearer authentication
  // This will be called automatically for endpoints that require authentication
  OpenAPI.TOKEN = async () => {
    const token = useAuthStore.getState().accessToken;
    return token || "";
  };

  // Create axios instance with interceptor
  const axiosInstance = axios.create();
  setupAxiosInterceptor(axiosInstance, onLogout);

  // Make axios instance available globally for OpenAPI client
  (globalThis as any).__AXIOS_INSTANCE__ = axiosInstance;
}
