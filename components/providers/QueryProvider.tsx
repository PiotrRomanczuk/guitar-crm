'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { createQueryClient } from '@/lib/query-client';

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = createQueryClient();

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
