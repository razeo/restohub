// ===========================================
// Theme Toggle Component
// ===========================================

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ThemeToggle({ 
  size = 'md', 
  showLabel = false,
  className = '' 
}: ThemeToggleProps) {
  const { theme, toggleTheme, isDark } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle animation
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [theme]);

  // Size mappings
  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex items-center justify-center
        rounded-xl bg-slate-100 dark:bg-slate-800
        hover:bg-slate-200 dark:hover:bg-slate-700
        transition-all duration-300 ease-in-out
        ${sizeClasses[size]}
        ${className}
      `}
      title={isDark ? 'Prebaci na svijetlu temu' : 'Prebaci na tamnu temu'}
      aria-label={isDark ? 'Prebaci na svijetlu temu' : 'Prebaci na tamnu temu'}
    >
      {/* Sun icon (shows in dark mode) */}
      <Sun
        size={iconSizes[size]}
        className={`
          absolute transition-all duration-300 ease-in-out
          ${isDark 
            ? 'opacity-100 rotate-0 scale-100 text-amber-400' 
            : 'opacity-0 -rotate-90 scale-50 text-amber-400'
          }
        `}
      />

      {/* Moon icon (shows in light mode) */}
      <Moon
        size={iconSizes[size]}
        className={`
          transition-all duration-300 ease-in-out
          ${isDark 
            ? 'opacity-0 rotate-90 scale-50 text-blue-400' 
            : 'opacity-100 rotate-0 scale-100 text-blue-600'
          }
        `}
      />

      {/* Background glow effect */}
      <div
        className={`
          absolute inset-0 rounded-xl
          bg-gradient-to-br from-blue-500/10 to-amber-500/10
          transition-opacity duration-300
          ${isAnimating ? 'opacity-100' : 'opacity-0'}
        `}
      />

      {/* Label */}
      {showLabel && (
        <span className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          {isDark ? 'Tamna' : 'Svijetla'}
        </span>
      )}
    </button>
  );
}

/**
 * Compact theme toggle for header use
 */
export function ThemeToggleCompact() {
  return <ThemeToggle size="sm" className="h-9 w-9" />;
}

/**
 * Theme toggle with label for settings
 */
export function ThemeToggleWithLabel() {
  return <ThemeToggle size="md" showLabel className="w-full justify-start" />;
}
