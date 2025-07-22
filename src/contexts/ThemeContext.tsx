/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                    Theme Context Provider                                        │
 * │                                                                                                  │
 * │  Description: React context for managing theme state, switching, and persistence.                │
 * │               Provides theme management functionality across the application.                    │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { ThemeConfig } from 'antd';
import {
  CustomThemeConfig,
  ThemePreset,
  themePresets,
  defaultTheme,
  getStoredTheme,
  saveTheme,
  createCustomTheme,
} from '@/theme';

interface ThemeContextType {
  currentTheme: CustomThemeConfig;
  setTheme: (preset: ThemePreset) => void;
  setCustomTheme: (customizations: Partial<ThemeConfig>) => void;
  availableThemes: Record<ThemePreset, CustomThemeConfig>;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<CustomThemeConfig>(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load theme from localStorage on mount
    const storedTheme = getStoredTheme();
    setCurrentTheme(storedTheme);
    setIsLoading(false);
  }, []);

  const setTheme = (preset: ThemePreset) => {
    const newTheme = themePresets[preset];
    setCurrentTheme(newTheme);
    saveTheme(newTheme);
  };

  const setCustomTheme = (customizations: Partial<ThemeConfig>) => {
    const customTheme = createCustomTheme(currentTheme.preset, customizations);
    setCurrentTheme(customTheme);
    saveTheme(customTheme);
  };

  const value: ThemeContextType = {
    currentTheme,
    setTheme,
    setCustomTheme,
    availableThemes: themePresets,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};