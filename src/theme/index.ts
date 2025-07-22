/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                    Theme System Configuration                                    │
 * │                                                                                                  │
 * │  Description: Main theme configuration system for CeybytePOS with Ant Design integration.        │
 * │               Provides theme presets, dynamic switching, and persistence.                        │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import type { ThemeConfig } from 'antd';
import { theme } from 'antd';

export type ThemePreset = 'classic-blue' | 'dark-mode' | 'high-contrast' | 'colorful' | 'custom';

export interface CustomThemeConfig extends ThemeConfig {
  name: string;
  description: string;
  preset: ThemePreset;
}

// Theme presets for retail POS
export const themePresets: Record<ThemePreset, CustomThemeConfig> = {
  'classic-blue': {
    name: 'Classic Blue',
    description: 'Professional blue theme for business environments',
    preset: 'classic-blue',
    token: {
      colorPrimary: '#1890ff',
      colorSuccess: '#52c41a',
      colorWarning: '#faad14',
      colorError: '#f5222d',
      colorInfo: '#1890ff',
      colorTextBase: '#000000',
      colorBgBase: '#ffffff',
      fontSize: 14,
      fontFamily: 'Segoe UI, Roboto, "Noto Sans", sans-serif',
      borderRadius: 6,
      controlHeight: 40,
    },
    components: {
      Button: {
        controlHeight: 48,
        fontSize: 16,
        fontWeight: 500,
      },
      Input: {
        controlHeight: 44,
        fontSize: 16,
      },
      Table: {
        headerBg: '#fafafa',
        rowHoverBg: '#f5f5f5',
      },
      Card: {
        headerBg: '#fafafa',
      },
    },
  },

  'dark-mode': {
    name: 'Dark Mode',
    description: 'Dark theme for shops with bright lighting',
    preset: 'dark-mode',
    algorithm: theme.darkAlgorithm,
    token: {
      colorPrimary: '#1890ff',
      fontSize: 14,
      fontFamily: 'Segoe UI, Roboto, "Noto Sans", sans-serif',
      borderRadius: 6,
      controlHeight: 40,
    },
    components: {
      Button: {
        controlHeight: 48,
        fontSize: 16,
        fontWeight: 500,
      },
      Input: {
        controlHeight: 44,
        fontSize: 16,
      },
    },
  },

  'high-contrast': {
    name: 'High Contrast',
    description: 'High contrast theme for better visibility',
    preset: 'high-contrast',
    token: {
      colorPrimary: '#0050b3',
      colorSuccess: '#389e0d',
      colorWarning: '#d48806',
      colorError: '#cf1322',
      colorTextBase: '#000000',
      colorBgBase: '#ffffff',
      fontSize: 16,
      fontFamily: 'Segoe UI, Roboto, "Noto Sans", sans-serif',
      borderRadius: 4,
      controlHeight: 44,
      lineWidth: 2,
    },
    components: {
      Button: {
        controlHeight: 52,
        fontSize: 18,
        fontWeight: 600,
        borderWidth: 2,
      },
      Input: {
        controlHeight: 48,
        fontSize: 18,
        borderWidth: 2,
      },
      Table: {
        headerBg: '#f0f0f0',
        rowHoverBg: '#e6f7ff',
      },
    },
  },

  'colorful': {
    name: 'Colorful',
    description: 'Modern colorful theme with vibrant accents',
    preset: 'colorful',
    token: {
      colorPrimary: '#722ed1',
      colorSuccess: '#52c41a',
      colorWarning: '#fa8c16',
      colorError: '#f5222d',
      colorInfo: '#13c2c2',
      colorTextBase: '#262626',
      colorBgBase: '#ffffff',
      fontSize: 14,
      fontFamily: 'Segoe UI, Roboto, "Noto Sans", sans-serif',
      borderRadius: 8,
      controlHeight: 40,
    },
    components: {
      Button: {
        controlHeight: 48,
        fontSize: 16,
        fontWeight: 500,
        borderRadius: 8,
      },
      Input: {
        controlHeight: 44,
        fontSize: 16,
        borderRadius: 8,
      },
      Card: {
        borderRadius: 12,
      },
    },
  },

  'custom': {
    name: 'Custom',
    description: 'Customizable theme for personal preferences',
    preset: 'custom',
    token: {
      colorPrimary: '#1890ff',
      fontSize: 14,
      fontFamily: 'Segoe UI, Roboto, "Noto Sans", sans-serif',
      borderRadius: 6,
      controlHeight: 40,
    },
    components: {
      Button: {
        controlHeight: 48,
        fontSize: 16,
      },
      Input: {
        controlHeight: 44,
        fontSize: 16,
      },
    },
  },
};

// Default theme
export const defaultTheme = themePresets['classic-blue'];

// Theme storage key
export const THEME_STORAGE_KEY = 'ceybyte-pos-theme';

// Get theme from localStorage
export const getStoredTheme = (): CustomThemeConfig => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultTheme, ...parsed };
    }
  } catch (error) {
    console.error('Error loading stored theme:', error);
  }
  return defaultTheme;
};

// Save theme to localStorage
export const saveTheme = (theme: CustomThemeConfig): void => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
  } catch (error) {
    console.error('Error saving theme:', error);
  }
};

// Create custom theme
export const createCustomTheme = (
  basePreset: ThemePreset,
  customizations: Partial<ThemeConfig>
): CustomThemeConfig => {
  const base = themePresets[basePreset];
  return {
    ...base,
    name: 'Custom Theme',
    preset: 'custom',
    ...customizations,
    token: {
      ...base.token,
      ...customizations.token,
    },
    components: {
      ...base.components,
      ...customizations.components,
    },
  };
};