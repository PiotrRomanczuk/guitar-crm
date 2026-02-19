'use client';

/**
 * Font Provider
 *
 * Manages dynamic font switching across the application.
 * Persists user's font choice to localStorage.
 *
 * Enable/disable this feature via DYNAMIC_FONT_SWITCHING in fonts.config.ts
 */

import { createContext, useContext, useLayoutEffect, useState, type ReactNode } from 'react';
import { ACTIVE_FONT_SCHEME, FONT_SCHEMES, DYNAMIC_FONT_SWITCHING } from './fonts.config';
import { getFontVariableClassesForScheme } from './index';

type FontContextType = {
  currentScheme: string;
  setScheme: (scheme: string) => void;
  availableSchemes: typeof FONT_SCHEMES;
  isDynamicSwitchingEnabled: boolean;
};

const FontContext = createContext<FontContextType>({
  currentScheme: ACTIVE_FONT_SCHEME,
  setScheme: () => {},
  availableSchemes: FONT_SCHEMES,
  isDynamicSwitchingEnabled: DYNAMIC_FONT_SWITCHING,
});

const STORAGE_KEY = 'strummy-font-scheme';

export function FontProvider({ children }: { children: ReactNode }) {
  const [currentScheme, setCurrentScheme] = useState<string>(() => {
    // Initialize from localStorage if available (SSR-safe)
    if (DYNAMIC_FONT_SWITCHING && typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && FONT_SCHEMES[saved]) {
        return saved;
      }
    }
    return ACTIVE_FONT_SCHEME;
  });

  // Update body classes when scheme changes (use layoutEffect to avoid flicker)
  useLayoutEffect(() => {
    if (!DYNAMIC_FONT_SWITCHING || typeof window === 'undefined') return;

    const body = document.body;

    // Remove all existing font classes
    Object.keys(FONT_SCHEMES).forEach(schemeKey => {
      const classes = getFontVariableClassesForScheme(schemeKey).split(' ');
      classes.forEach(className => body.classList.remove(className));
    });

    // Add new font classes
    const newClasses = getFontVariableClassesForScheme(currentScheme).split(' ');
    newClasses.forEach(className => body.classList.add(className));

  }, [currentScheme]);

  const setScheme = (scheme: string) => {
    if (!FONT_SCHEMES[scheme]) {
      console.warn(`Font scheme "${scheme}" not found`);
      return;
    }

    setCurrentScheme(scheme);

    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, scheme);
    }
  };

  return (
    <FontContext.Provider
      value={{
        currentScheme,
        setScheme,
        availableSchemes: FONT_SCHEMES,
        isDynamicSwitchingEnabled: DYNAMIC_FONT_SWITCHING,
      }}
    >
      {children}
    </FontContext.Provider>
  );
}

/**
 * Hook to access font switching functionality
 */
export function useFonts() {
  const context = useContext(FontContext);
  if (!context) {
    throw new Error('useFonts must be used within FontProvider');
  }
  return context;
}
