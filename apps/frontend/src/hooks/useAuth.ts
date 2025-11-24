import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthService } from '../api';
import type { LoginDto } from '../api';

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
    onSuccess: (data) => {
      // Store access token in localStorage
      localStorage.setItem('accessToken', data.accessToken);

      // Invalidate and refetch user-related queries
      queryClient.invalidateQueries({ queryKey: ['user'] });
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

  return useMutation({
    mutationFn: async () => {
      // Clear access token
      localStorage.removeItem('accessToken');
      // TODO: Call refresh token revocation endpoint if available
    },
    onSuccess: () => {
      // Clear all queries
      queryClient.clear();
    },
  });
}
