// ===========================================
// Theme Hook
// ===========================================

import { useEffect, useCallback } from 'react';
import { useTheme, Theme } from '../contexts/ThemeContext';

/**
 * Hook for using theme in components with additional utilities
 */
export function useThemeHook() {
  const { theme, toggleTheme, setTheme } = useTheme();

  // Check if dark mode is active
  const isDark = theme === 'dark';

  // Toggle theme with callback
  const toggle = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  // Apply theme class to an element
  const applyThemeToElement = useCallback((element: HTMLElement | null) => {
    if (!element) return;
    
    if (theme === 'dark') {
      element.classList.add('dark');
    } else {
      element.classList.remove('dark');
    }
  }, [theme]);

  // Get theme-aware class names
  const getThemedClass = useCallback((lightClass: string, darkClass: string) => {
    return isDark ? darkClass : lightClass;
  }, [isDark]);

  // Sync theme with system
  const syncWithSystem = useCallback(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
  }, [setTheme]);

  return {
    theme,
    isDark,
    toggleTheme: toggle,
    setTheme,
    applyThemeToElement,
    getThemedClass,
    syncWithSystem,
  };
}

// Hook for components that need to know when theme changes
export function useThemeChange(callback: (theme: Theme) => void) {
  const { theme } = useTheme();

  useEffect(() => {
    callback(theme);
  }, [theme, callback]);
}
