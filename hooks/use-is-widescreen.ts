import * as React from 'react';

/**
 * Hook to detect widescreen displays (landscape orientation with sufficient width)
 * Returns true for widescreen (sidebar layout), false for vertical/narrow displays (top navbar)
 *
 * Detection logic:
 * - Width >= 1024px AND aspect ratio >= 1.2 (landscape) = widescreen
 * - Otherwise = vertical/narrow display
 */
export function useIsWidescreen() {
  const [isWidescreen, setIsWidescreen] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const checkWidescreen = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspectRatio = width / height;

      // Widescreen: minimum width 1024px AND landscape orientation (aspect ratio > 1.2)
      // This ensures vertical monitors (even if wide) show top navbar
      const isWide = width >= 1024 && aspectRatio >= 1.2;

      setIsWidescreen(isWide);
    };

    // Initial check
    checkWidescreen();

    // Listen for resize and orientation changes
    window.addEventListener('resize', checkWidescreen);
    window.addEventListener('orientationchange', checkWidescreen);

    return () => {
      window.removeEventListener('resize', checkWidescreen);
      window.removeEventListener('orientationchange', checkWidescreen);
    };
  }, []);

  return !!isWidescreen;
}
