/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                    Design System Configuration                                   │
 * │                                                                                                  │
 * │  Description: Comprehensive design system with Ceybyte branding, color schemes,                  │
 * │               typography, spacing, and component standards for consistent UI.                    │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

// Ceybyte Brand Colors
export const CEYBYTE_COLORS = {
  // Primary Brand Colors
  primary: {
    50: '#e6f3ff',
    100: '#b3d9ff',
    200: '#80bfff',
    300: '#4da6ff',
    400: '#1a8cff',
    500: '#0066cc', // Main Ceybyte Blue
    600: '#0052a3',
    700: '#003d7a',
    800: '#002952',
    900: '#001429',
  },

  // Secondary Colors
  secondary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },

  // Success Colors (for positive actions, profits)
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  // Warning Colors (for alerts, low stock)
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Error Colors (for errors, negative values)
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Neutral Colors (for text, backgrounds)
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
};

// Typography Scale
export const TYPOGRAPHY = {
  fontFamily: {
    primary: '"Segoe UI", "Roboto", "Noto Sans", sans-serif',
    sinhala: '"Nirmala UI", "Iskoola Pota", sans-serif',
    tamil: '"Latha", "Tamil Sangam MN", sans-serif',
    mono: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
  },

  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
  },

  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Spacing Scale (based on 4px grid)
export const SPACING = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px',
  40: '160px',
  48: '192px',
  56: '224px',
  64: '256px',
};

// Border Radius
export const BORDER_RADIUS = {
  none: '0',
  xs: '2px',
  sm: '4px',
  base: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  '3xl': '24px',
  full: '9999px',
  
  // Component specific
  card: '12px',
  button: '8px',
  input: '6px',
  modal: '16px',
};

// Modern Shadows
export const SHADOWS = {
  // Subtle shadows
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  
  // Colored shadows
  primary: '0 10px 15px -3px rgba(0, 102, 204, 0.1), 0 4px 6px -2px rgba(0, 102, 204, 0.05)',
  success: '0 10px 15px -3px rgba(34, 197, 94, 0.1), 0 4px 6px -2px rgba(34, 197, 94, 0.05)',
  warning: '0 10px 15px -3px rgba(245, 158, 11, 0.1), 0 4px 6px -2px rgba(245, 158, 11, 0.05)',
  error: '0 10px 15px -3px rgba(239, 68, 68, 0.1), 0 4px 6px -2px rgba(239, 68, 68, 0.05)',
  
  // Inner shadows
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  innerLg: 'inset 0 4px 8px 0 rgba(0, 0, 0, 0.12)',
  
  // Glass morphism
  glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
};

// Component Sizes (for consistent sizing across components)
export const COMPONENT_SIZES = {
  // Button heights
  button: {
    small: '32px',
    medium: '40px',
    large: '48px',
    xlarge: '56px',
  },

  // Input heights
  input: {
    small: '32px',
    medium: '40px',
    large: '48px',
  },

  // Icon sizes
  icon: {
    xs: '12px',
    sm: '16px',
    base: '20px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
  },

  // Layout dimensions
  sidebar: {
    collapsed: '64px',
    expanded: '240px',
  },

  header: {
    height: '64px',
  },

  footer: {
    height: '48px',
  },
};

// Breakpoints for responsive design
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px', // Minimum supported resolution
  xl: '1280px',
  '2xl': '1536px',
};

// Z-Index Scale
export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
  toast: 1070,
};

// Modern Gradients
export const GRADIENTS = {
  // Brand gradients
  primary: 'linear-gradient(135deg, #0066cc 0%, #0052a3 100%)',
  primaryLight: 'linear-gradient(135deg, #4da6ff 0%, #1a8cff 100%)',
  primarySubtle: 'linear-gradient(135deg, #e6f3ff 0%, #b3d9ff 100%)',
  
  // Status gradients
  success: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
  successLight: 'linear-gradient(135deg, #86efac 0%, #4ade80 100%)',
  warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  
  // Neutral gradients
  glass: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
  surface: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
  dark: 'linear-gradient(135deg, #262626 0%, #171717 100%)',
  
  // Special gradients
  rainbow: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  ocean: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  sunset: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
};

// Animation Durations and Easings
export const ANIMATION = {
  duration: {
    fastest: '100ms',
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slowest: '800ms',
  },

  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  // Modern micro-interactions
  hover: {
    scale: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    lift: 'transform 0.2s ease-out, box-shadow 0.2s ease-out',
    glow: 'box-shadow 0.3s ease-out',
  },
  
  // Loading animations
  pulse: 'animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  spin: 'animation: spin 1s linear infinite',
  bounce: 'animation: bounce 1s infinite',
};

// Glass Morphism Effects
export const GLASS = {
  backdrop: 'backdrop-filter: blur(16px) saturate(180%)',
  background: 'rgba(255, 255, 255, 0.25)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  shadow: SHADOWS.glass,
};

// POS-Specific Design Tokens
export const POS_TOKENS = {
  // Touch-friendly sizes for POS terminals
  touchTarget: {
    minimum: '44px',
    comfortable: '48px',
    large: '56px',
  },

  // Status colors for POS operations
  status: {
    online: CEYBYTE_COLORS.success[500],
    offline: CEYBYTE_COLORS.neutral[400],
    error: CEYBYTE_COLORS.error[500],
    warning: CEYBYTE_COLORS.warning[500],
    processing: CEYBYTE_COLORS.primary[500],
  },

  // Currency display
  currency: {
    positive: CEYBYTE_COLORS.success[600],
    negative: CEYBYTE_COLORS.error[600],
    neutral: CEYBYTE_COLORS.neutral[700],
  },

  // Priority levels
  priority: {
    high: CEYBYTE_COLORS.error[500],
    medium: CEYBYTE_COLORS.warning[500],
    low: CEYBYTE_COLORS.success[500],
  },
};

// Keyboard Shortcuts
export const KEYBOARD_SHORTCUTS = {
  // Global shortcuts
  quickSale: 'F12',
  customerMode: 'F3',
  productSearch: 'F2',
  settings: 'F9',
  help: 'F1',

  // Sale shortcuts
  holdSale: 'Ctrl+H',
  retrieveSale: 'Ctrl+R',
  completeSale: 'Enter',
  cancelSale: 'Escape',

  // Navigation shortcuts
  dashboard: 'Ctrl+1',
  products: 'Ctrl+2',
  customers: 'Ctrl+3',
  reports: 'Ctrl+4',

  // System shortcuts
  logout: 'Ctrl+L',
  switchUser: 'Ctrl+U',
  offlineMode: 'Ctrl+O',
};

// Export design system as a complete object
export const DESIGN_SYSTEM = {
  colors: CEYBYTE_COLORS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  shadows: SHADOWS,
  componentSizes: COMPONENT_SIZES,
  breakpoints: BREAKPOINTS,
  zIndex: Z_INDEX,
  animation: ANIMATION,
  posTokens: POS_TOKENS,
  keyboardShortcuts: KEYBOARD_SHORTCUTS,
};
