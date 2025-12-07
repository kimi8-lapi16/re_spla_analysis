import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthService } from "../api";
import type { LoginDto } from "../api";
import { useAuthStore } from "../store/authStore";

/**
 * Hook for user login
 *
 * @example
 * ```tsx
 * const { mutate: login, isPending, isError, error } = useLogin();
 *
 * const handleLogin = () => {
 *   login(
 *     { email: 'user@example.com', password: 'password123' },
 *     {
 *       onSuccess: (data) => {
 *         // Store access token
 *         localStorage.setItem('accessToken', data.accessToken);
 *         // Navigate to dashboard
 *       },
 *       onError: (error) => {
 *         console.error('Login failed:', error);
 *       },
 *     }
 *   );
 * };
 * ```
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginDto) => AuthService.authControllerLogin(credentials),
    onSuccess: () => {
      // Token is stored by the caller (LoginPage component)
      // Invalidate and refetch user-related queries
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

/**
 * Hook for user logout
 *
 * @example
 * ```tsx
 * const { mutate: logout } = useLogout();
 *
 * const handleLogout = () => {
 *   logout();
 * };
 * ```
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const clearAccessToken = useAuthStore((state) => state.clearAccessToken);

  return useMutation({
    mutationFn: async () => {
      // Clear access token
      clearAccessToken();
      // TODO: Call refresh token revocation endpoint if available
    },
    onSuccess: () => {
      // Clear all queries
      queryClient.clear();
    },
  });
}

/**
 * Hook for refreshing access token
 *
 * @example
 * ```tsx
 * const { mutateAsync: refresh } = useRefreshToken();
 *
 * const handleRefresh = async () => {
 *   try {
 *     const { accessToken } = await refresh();
 *     // New token is automatically stored by the interceptor
 *   } catch (error) {
 *     console.error('Refresh failed:', error);
 *   }
 * };
 * ```
 */
export function useRefreshToken() {
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  return useMutation({
    mutationFn: () => AuthService.authControllerRefresh(),
    onSuccess: (data) => {
      // Store new access token
      setAccessToken(data.accessToken);
    },
  });
}
