// ===========================================
// Theme Builder Component
// Custom color theme configuration with live preview
// ===========================================

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Save, RotateCcw, Eye, Palette, Check } from 'lucide-react';
import { scaleVariants, fadeVariants } from '../../utils/animations';

// Theme colors type
export interface ThemeColors {
  primary: string;
  primaryForeground: string;
  accent: string;
  accentForeground: string;
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  ring: string;
}

// Default theme
const DEFAULT_THEME: ThemeColors = {
  primary: '#3b82f6',
  primaryForeground: '#ffffff',
  accent: '#8b5cf6',
  accentForeground: '#ffffff',
  background: '#ffffff',
  foreground: '#0f172a',
  muted: '#f1f5f9',
  mutedForeground: '#64748b',
  border: '#e2e8f0',
  ring: '#3b82f6',
};

// Predefined color palettes
const PRESET_PALETTES = [
  {
    name: 'Plava',
    colors: {
      primary: '#3b82f6',
      accent: '#8b5cf6',
    },
  },
  {
    name: 'Zelena',
    colors: {
      primary: '#22c55e',
      accent: '#14b8a6',
    },
  },
  {
    name: 'Narančasta',
    colors: {
      primary: '#f97316',
      accent: '#f59e0b',
    },
  },
  {
    name: 'Roza',
    colors: {
      primary: '#ec4899',
      accent: '#f472b6',
    },
  },
  {
    name: 'Tamna',
    colors: {
      primary: '#6366f1',
      accent: '#a855f7',
    },
  },
];

// Storage key
const THEME_STORAGE_KEY = 'restohub-theme';

export interface ThemeBuilderProps {
  onThemeChange?: (theme: ThemeColors) => void;
  onClose?: () => void;
}

// Color picker component
interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-slate-700 w-24">{label}</label>
      <div className="relative flex-1">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-10 rounded-lg border border-slate-200 cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-20 px-2 py-1 text-sm border border-slate-200 rounded"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

// Generate CSS variables from theme
function generateCSSVariables(theme: ThemeColors): string {
  return `
    --color-primary: ${theme.primary};
    --color-primary-foreground: ${theme.primaryForeground};
    --color-accent: ${theme.accent};
    --color-accent-foreground: ${theme.accentForeground};
    --color-background: ${theme.background};
    --color-foreground: ${theme.foreground};
    --color-muted: ${theme.muted};
    --color-muted-foreground: ${theme.mutedForeground};
    --color-border: ${theme.border};
    --color-ring: ${theme.ring};
  `.trim();
}

export function ThemeBuilder({ onThemeChange, onClose }: ThemeBuilderProps) {
  const [theme, setTheme] = useState<ThemeColors>(() => {
    // Try to load from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return DEFAULT_THEME;
        }
      }
    }
    return DEFAULT_THEME;
  });
  const [previewMode, setPreviewMode] = useState(false);

  // Apply theme to document
  useEffect(() => {
    const cssVars = generateCSSVariables(theme);
    const root = document.documentElement;
    
    // Parse and apply CSS variables
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-primary-foreground', theme.primaryForeground);
    root.style.setProperty('--color-accent', theme.accent);
    root.style.setProperty('--color-accent-foreground', theme.accentForeground);
    
    onThemeChange?.(theme);
  }, [theme, onThemeChange]);

  // Save theme to localStorage
  const saveTheme = useCallback(() => {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
  }, [theme]);

  // Reset to default
  const resetTheme = useCallback(() => {
    setTheme(DEFAULT_THEME);
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(DEFAULT_THEME));
  }, []);

  // Apply preset palette
  const applyPreset = useCallback((preset: typeof PRESET_PALETTES[0]) => {
    setTheme((prev) => ({
      ...prev,
      ...preset.colors,
    }));
  }, []);

  // Update single color
  const updateColor = useCallback((key: keyof ThemeColors, value: string) => {
    setTheme((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Generate complementary colors
  const generateComplementary = useCallback(() => {
    // Simple complementary generation
    setTheme((prev) => ({
      ...prev,
      accent: prev.primary, // Swap
      primary: prev.accent, // Swap
    }));
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      variants={fadeVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl m-4 overflow-hidden"
        variants={scaleVariants}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Palette className="w-5 h-5 text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-800">Theme Builder</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Preview Panel */}
          <div className="md:w-1/2 p-6 border-r border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-slate-700">Live Preview</h3>
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
              >
                <Eye size={16} />
                {previewMode ? 'Hide Preview' : 'Show Preview'}
              </button>
            </div>

            {/* Preview Card */}
            <div
              className="p-6 rounded-xl space-y-4 transition-colors"
              style={{
                backgroundColor: previewMode ? theme.background : undefined,
              }}
            >
              <div
                className="w-full h-12 rounded-lg flex items-center justify-center font-semibold"
                style={{
                  backgroundColor: theme.primary,
                  color: theme.primaryForeground,
                }}
              >
                Primary Button
              </div>

              <div
                className="w-full h-12 rounded-lg flex items-center justify-center font-semibold"
                style={{
                  backgroundColor: theme.accent,
                  color: theme.accentForeground,
                }}
              >
                Accent Button
              </div>

              <div
                className="p-4 rounded-lg border-2"
                style={{
                  borderColor: theme.border,
                  backgroundColor: theme.muted,
                }}
              >
                <p
                  className="text-sm"
                  style={{ color: theme.mutedForeground }}
                >
                  Muted text sample
                </p>
                <p
                  className="text-sm font-medium mt-1"
                  style={{ color: theme.foreground }}
                >
                  Regular text sample
                </p>
              </div>

              <div className="flex gap-2">
                <div
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: theme.primary }}
                />
                <div
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: theme.accent }}
                />
                <div
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: theme.ring }}
                />
              </div>
            </div>

            {/* Preset Palettes */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-slate-700 mb-3">Preset Palettes</h4>
              <div className="grid grid-cols-5 gap-2">
                {PRESET_PALETTES.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
                    title={preset.name}
                  >
                    <div className="flex gap-0.5">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: preset.colors.primary }}
                      />
                      <div
                        className="w-4 h-4 rounded-full -ml-1"
                        style={{ backgroundColor: preset.colors.accent }}
                      />
                    </div>
                    <span className="text-xs text-slate-500">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Color Settings */}
          <div className="md:w-1/2 p-6">
            <h3 className="font-medium text-slate-700 mb-4">Color Settings</h3>

            <div className="space-y-4">
              <ColorPicker
                label="Primary"
                value={theme.primary}
                onChange={(v) => updateColor('primary', v)}
              />

              <ColorPicker
                label="Accent"
                value={theme.accent}
                onChange={(v) => updateColor('accent', v)}
              />

              <ColorPicker
                label="Background"
                value={theme.background}
                onChange={(v) => updateColor('background', v)}
              />

              <ColorPicker
                label="Foreground"
                value={theme.foreground}
                onChange={(v) => updateColor('foreground', v)}
              />

              <ColorPicker
                label="Muted"
                value={theme.muted}
                onChange={(v) => updateColor('muted', v)}
              />

              <ColorPicker
                label="Border"
                value={theme.border}
                onChange={(v) => updateColor('border', v)}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-200">
              <motion.button
                onClick={saveTheme}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Save size={16} />
                Save Theme
              </motion.button>

              <motion.button
                onClick={generateComplementary}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ↔ Swap
              </motion.button>

              <motion.button
                onClick={resetTheme}
                className="p-2 border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Reset to default"
              >
                <RotateCcw size={16} />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Hook for using theme
export function useTheme() {
  const [theme, setTheme] = useState<ThemeColors>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return DEFAULT_THEME;
        }
      }
    }
    return DEFAULT_THEME;
  });

  useEffect(() => {
    const cssVars = generateCSSVariables(theme);
    const root = document.documentElement;
    
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-primary-foreground', theme.primaryForeground);
    root.style.setProperty('--color-accent', theme.accent);
    root.style.setProperty('--color-accent-foreground', theme.accentForeground);
  }, [theme]);

  const saveTheme = useCallback((newTheme: ThemeColors) => {
    setTheme(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(newTheme));
  }, []);

  const resetTheme = useCallback(() => {
    setTheme(DEFAULT_THEME);
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(DEFAULT_THEME));
  }, []);

  return { theme, setTheme: saveTheme, resetTheme, DEFAULT_THEME };
}

export default ThemeBuilder;
