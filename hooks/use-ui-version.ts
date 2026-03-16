'use client';

import { useState, useCallback } from 'react';

const UI_VERSION_COOKIE = 'strummy-ui-version';

type UIVersion = 'v1' | 'v2';

function getCookieValue(): UIVersion {
  if (typeof document === 'undefined') return 'v1';
  const match = document.cookie.match(new RegExp(`${UI_VERSION_COOKIE}=([^;]+)`));
  return match?.[1] === 'v2' ? 'v2' : 'v1';
}

/**
 * Client-side hook to read and toggle the UI version cookie.
 */
export function useUIVersion() {
  const [version, setVersion] = useState<UIVersion>(getCookieValue);

  const toggle = useCallback(() => {
    const next: UIVersion = version === 'v1' ? 'v2' : 'v1';
    document.cookie = `${UI_VERSION_COOKIE}=${next};path=/;max-age=${60 * 60 * 24 * 365}`;
    setVersion(next);
    window.location.reload();
  }, [version]);

  return { version, toggle, isV2: version === 'v2' };
}
