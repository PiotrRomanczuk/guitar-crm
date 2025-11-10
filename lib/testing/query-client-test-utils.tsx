/**
 * Testing utilities for TanStack Query
 * Provides helpers for rendering components with QueryClient in tests
 */

'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render as rtlRender, RenderOptions } from '@testing-library/react';

/**
 * Create a fresh QueryClient for testing
 * Disable retries and set staleTime to 0 for instant stale queries in tests
 */
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * Wrapper component for test rendering with QueryProvider
 */
function QueryWrapper({ children }: { children: ReactNode }) {
  const testQueryClient = createTestQueryClient();

  return <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>;
}

/**
 * Custom render function that includes QueryProvider
 * Usage: render(<MyComponent />, { wrapper: QueryWrapper })
 */
function renderWithClient(ui: ReactNode, options?: Omit<RenderOptions, 'wrapper'>) {
  return rtlRender(ui, { wrapper: QueryWrapper, ...options });
}

export { renderWithClient, QueryWrapper, createTestQueryClient };
