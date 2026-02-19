'use client';

import { useCallback } from 'react';

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'error';

const patterns: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
  success: [10, 50, 20],
  error: [30, 50, 30, 50, 30],
};

/**
 * Provides haptic feedback via navigator.vibrate() on supported devices.
 * Falls back to no-op on unsupported browsers (iOS Safari doesn't support
 * vibrate API, but this is future-proof for PWA and Android).
 */
export function useHaptic() {
  const vibrate = useCallback((pattern: HapticPattern = 'light') => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(patterns[pattern]);
    }
  }, []);

  return vibrate;
}
