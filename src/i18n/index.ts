/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                 Internationalization Setup                                       │
 * │                                                                                                  │
 * │  Description: i18next configuration for multi-language support.                                  │
 * │               Supports English, Sinhala, and Tamil with local storage persistence.               │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslations from './locales/en.json';
import siTranslations from './locales/si.json';
import taTranslations from './locales/ta.json';

// Language configuration
export const SUPPORTED_LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    rtl: false,
  },
  si: {
    code: 'si',
    name: 'Sinhala',
    nativeName: 'සිංහල',
    flag: '🇱🇰',
    rtl: false,
  },
  ta: {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    flag: '🇱🇰',
    rtl: false,
  },
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

// i18next configuration
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // Language resources
    resources: {
      en: {
        translation: enTranslations,
      },
      si: {
        translation: siTranslations,
      },
      ta: {
        translation: taTranslations,
      },
    },

    // Language detection configuration
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'ceybyte-pos-language',
      caches: ['localStorage'],
    },

    // Fallback language
    fallbackLng: 'en',

    // Default namespace
    defaultNS: 'translation',

    // Interpolation settings
    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // Development settings
    debug: import.meta.env.DEV,

    // React specific settings
    react: {
      useSuspense: false,
    },
  });

export default i18n;
