import { QueryClient } from '@tanstack/react-query';

/**
 * Create and configure React Query client
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: how long data is considered fresh (5 minutes)
      staleTime: 5 * 60 * 1000,
      // Cache time: how long unused data stays in cache (10 minutes)
      gcTime: 10 * 60 * 1000,
      // Retry failed requests (3 times with exponential backoff)
      retry: 3,
      // Refetch on window focus
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Retry failed mutations (1 time)
      retry: 1,
    },
  },
});
