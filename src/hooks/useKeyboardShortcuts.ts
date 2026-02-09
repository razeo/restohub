// ===========================================
// Keyboard Shortcuts Hook
// ===========================================

import { useEffect, useCallback, useRef } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description?: string;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  preventDefault?: boolean;
}

/**
 * Hook for managing global keyboard shortcuts
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardShortcutsOptions = {}
) {
  const { enabled = true, preventDefault = true } = options;
  const shortcutsRef = useRef(shortcuts);

  // Keep shortcuts ref updated
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Don't trigger shortcuts when typing in input fields
    const target = event.target as HTMLElement;
    const isInputField = target.tagName === 'INPUT' || 
                         target.tagName === 'TEXTAREA' || 
                         target.tagName === 'SELECT' ||
                         target.isContentEditable;

    if (isInputField && event.key !== 'Escape') return;

    for (const shortcut of shortcutsRef.current) {
      const ctrlMatch = shortcut.ctrl ? event.ctrlKey : !event.ctrlKey && !shortcut.ctrl;
      const metaMatch = shortcut.meta ? event.metaKey : !event.metaKey && !shortcut.meta;
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey && !shortcut.shift;
      const altMatch = shortcut.alt ? event.altKey : !event.altKey && !shortcut.alt;

      if (
        event.key.toLowerCase() === shortcut.key.toLowerCase() &&
        ctrlMatch &&
        metaMatch &&
        shiftMatch &&
        altMatch
      ) {
        if (preventDefault) {
          event.preventDefault();
          event.stopPropagation();
        }
        
        shortcut.action();
        return;
      }
    }
  }, [enabled, preventDefault]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Return helper functions
  return {
    registerShortcut: (shortcut: KeyboardShortcut) => {
      shortcutsRef.current = [...shortcutsRef.current, shortcut];
    },
    unregisterShortcut: (key: string) => {
      shortcutsRef.current = shortcutsRef.current.filter(s => s.key !== key);
    },
  };
}

/**
 * Pre-defined common shortcuts for RestoHub
 */
export const RESTOHUB_SHORTCUTS: KeyboardShortcut[] = [
  {
    key: '/',
    ctrl: true,
    action: () => {
      // Focus search - dispatch custom event
      window.dispatchEvent(new CustomEvent('restohub:open-search'));
    },
    description: 'Open search',
  },
  {
    key: 'e',
    ctrl: true,
    action: () => {
      window.dispatchEvent(new CustomEvent('restohub:navigate', { detail: 'employees' }));
    },
    description: 'Go to Employees',
  },
  {
    key: 's',
    ctrl: true,
    action: () => {
      window.dispatchEvent(new CustomEvent('restohub:navigate', { detail: 'schedule' }));
    },
    description: 'Go to Schedule',
  },
  {
    key: 'd',
    ctrl: true,
    action: () => {
      window.dispatchEvent(new CustomEvent('restohub:toggle-theme'));
    },
    description: 'Toggle dark mode',
  },
  {
    key: 'Escape',
    action: () => {
      // Close modals/panels - dispatch custom event
      window.dispatchEvent(new CustomEvent('restohub:close-modal'));
    },
    description: 'Close modals/panels',
  },
  {
    key: 's',
    ctrl: true,
    shift: true,
    action: () => {
      window.dispatchEvent(new CustomEvent('restohub:navigate', { detail: 'shifts' }));
    },
    description: 'Go to Shifts',
  },
];

/**
 * Hook for using RestoHub's default keyboard shortcuts
 */
export function useRestoHubShortcuts(options?: UseKeyboardShortcutsOptions) {
  return useKeyboardShortcuts(RESTOHUB_SHORTCUTS, options);
}

/**
 * Hook to listen for RestoHub navigation events
 */
export function useRestoHubNavigation(onNavigate: (page: string) => void) {
  useEffect(() => {
    const handleNavigate = (e: CustomEvent) => {
      onNavigate(e.detail);
    };

    window.addEventListener('restohub:navigate', handleNavigate as EventListener);
    return () => window.removeEventListener('restohub:navigate', handleNavigate as EventListener);
  }, [onNavigate]);
}

/**
 * Hook to listen for theme toggle events
 */
export function useThemeToggleEvent(onToggle: () => void) {
  useEffect(() => {
    const handleToggle = () => onToggle();
    window.addEventListener('restohub:toggle-theme', handleToggle);
    return () => window.removeEventListener('restohub:toggle-theme', handleToggle);
  }, [onToggle]);
}

/**
 * Hook to listen for close modal events
 */
export function useCloseModalEvent(onClose: () => void) {
  useEffect(() => {
    const handleClose = () => onClose();
    window.addEventListener('restohub:close-modal', handleClose);
    return () => window.removeEventListener('restohub:close-modal', handleClose);
  }, [onClose]);
}

/**
 * Hook to listen for search open events
 */
export function useOpenSearchEvent(onOpen: () => void) {
  useEffect(() => {
    const handleOpen = () => onOpen();
    window.addEventListener('restohub:open-search', handleOpen);
    return () => window.removeEventListener('restohub:open-search', handleOpen);
  }, [onOpen]);
}
