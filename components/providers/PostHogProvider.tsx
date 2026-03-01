'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { ReactNode, useEffect } from 'react';

export function PostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

    if (!key) return;

    posthog.init(key, {
      api_host: host || '/ingest',
      capture_pageview: false, // We capture manually for App Router
      capture_pageleave: true,
      person_profiles: 'identified_only',
    });
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
