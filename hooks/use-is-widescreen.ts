import * as React from 'react';

type LayoutMode = 'widescreen' | 'tablet' | 'mobile';

/**
 * Hook to detect display layout mode for responsive navigation.
 *
 * Detection logic:
 * - Width >= 1024px AND aspect ratio >= 1.2 = widescreen (full sidebar)
 * - Width >= 768px (tablet range, e.g. iPad portrait/landscape) = tablet (collapsed sidebar)
 * - Otherwise = mobile (horizontal nav + bottom nav)
 */
export function useLayoutMode(): LayoutMode {
  const [mode, setMode] = React.useState<LayoutMode>('mobile');

  React.useEffect(() => {
    const check = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspectRatio = width / height;

      if (width >= 1024 && aspectRatio >= 1.2) {
        setMode('widescreen');
      } else if (width >= 768) {
        setMode('tablet');
      } else {
        setMode('mobile');
      }
    };

    check();

    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', check);

    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('orientationchange', check);
    };
  }, []);

  return mode;
}

/**
 * @deprecated Use `useLayoutMode()` instead for finer-grained layout control.
 * Kept for backward compatibility — returns true for widescreen OR tablet.
 */
export function useIsWidescreen() {
  const mode = useLayoutMode();
  return mode === 'widescreen' || mode === 'tablet';
}
