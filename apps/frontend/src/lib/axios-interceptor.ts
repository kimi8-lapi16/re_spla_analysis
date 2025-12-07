import axios, { AxiosError } from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { AuthService } from "../api";
import { useAuthStore } from "../store/authStore";

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });

  failedQueue = [];
};

/**
 * Setup axios interceptor for automatic token refresh on 401 errors
 * @param axiosInstance - The axios instance to setup interceptors on
 * @param onLogout - Callback function to call when refresh fails (should handle logout)
 */
export function setupAxiosInterceptor(
  axiosInstance: AxiosInstance,
  onLogout: () => void,
) {
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // If error is not 401 or request already retried, reject immediately
      if (error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }

      // Skip refresh for login and refresh endpoints
      if (
        originalRequest.url?.includes("/auth/login") ||
        originalRequest.url?.includes("/auth/refresh")
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue requests while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the token
        const { accessToken } = await AuthService.authControllerRefresh();

        // Store new access token
        useAuthStore.getState().setAccessToken(accessToken);

        // Process queued requests
        processQueue();

        // Retry the original request with new token
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        processQueue(refreshError as Error);
        useAuthStore.getState().clearAccessToken();
        onLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    },
  );
}

/**
 * Create and configure axios instance with interceptor
 * @param onLogout - Callback function to call when refresh fails
 * @returns Configured axios instance
 */
export function createAxiosWithInterceptor(onLogout: () => void): AxiosInstance {
  const instance = axios.create();
  setupAxiosInterceptor(instance, onLogout);
  return instance;
}
