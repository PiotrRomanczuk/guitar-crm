import { QueryClient } from '@tanstack/react-query';

export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache data for 5 minutes before considering it stale
        staleTime: 1000 * 60 * 5,
        // Retry failed requests once
        retry: 1,
        // Don't retry on 4xx errors (client errors)
        retryOnMount: true,
      },
      mutations: {
        // Retry failed mutations once
        retry: 1,
      },
    },
  });
};

export const queryClient = createQueryClient();
