import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UsersService } from "../api";
import type { CreateUser, UpdateUser } from "../api";

/**
 * Hook for fetching current user data
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: () => UsersService.userControllerGetMe(),
  });
}

/**
 * Hook for updating current user
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUser) => UsersService.userControllerUpdateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
}

/**
 * Hook for creating a new user account
 *
 * @example
 * ```tsx
 * const { mutate: createUser, isPending, isError, error } = useCreateUser();
 *
 * const handleSignup = () => {
 *   createUser(
 *     {
 *       name: 'John Doe',
 *       email: 'john@example.com',
 *       password: 'securePassword123',
 *     },
 *     {
 *       onSuccess: (data) => {
 *         // Store access token
 *         localStorage.setItem('accessToken', data.accessToken);
 *         // Navigate to dashboard
 *       },
 *       onError: (error) => {
 *         console.error('Signup failed:', error);
 *       },
 *     }
 *   );
 * };
 * ```
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: CreateUser) => UsersService.userControllerCreateUser(userData),
    onSuccess: () => {
      // Token is stored by the caller (SignupPage component)
      // Invalidate and refetch user-related queries
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}
