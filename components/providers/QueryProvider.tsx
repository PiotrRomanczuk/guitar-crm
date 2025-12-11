'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { createQueryClient } from '@/lib/query-client';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => {
    console.log('[QueryProvider] Creating new QueryClient');
    return createQueryClient();
  });

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
