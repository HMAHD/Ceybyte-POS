/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                   Translation Hook                                              │
 * │                                                                                                  │
 * │  Description: Custom hook for translations with type safety and additional utilities.           │
 * │               Extends react-i18next with formatting and language-specific features.             │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                  │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import { useTranslation as useI18nTranslation } from 'react-i18next';
import { type SupportedLanguage } from '../i18n';
import { formatCurrency, formatDate, formatTime, formatDateTime } from '../utils/formatting';

// Type for translation keys (you can extend this based on your translation structure)
type TranslationKey = string;

export interface UseTranslationReturn {
  // Core translation function
  t: (key: TranslationKey, options?: any) => string;
  
  // Language management
  language: SupportedLanguage;
  changeLanguage: (language: SupportedLanguage) => void;
  
  // Formatting utilities with current language
  formatCurrency: (amount: number, options?: Parameters<typeof formatCurrency>[2]) => string;
  formatDate: (date: Date | string, format?: Parameters<typeof formatDate>[1]) => string;
  formatTime: (date: Date | string, format?: Parameters<typeof formatTime>[1]) => string;
  formatDateTime: (
    date: Date | string, 
    dateFormat?: Parameters<typeof formatDateTime>[1],
    timeFormat?: Parameters<typeof formatDateTime>[2]
  ) => string;
  
  // Language-specific utilities
  isRTL: boolean;
  direction: 'ltr' | 'rtl';
  
  // Common translations with type safety
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    search: string;
    loading: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    yes: string;
    no: string;
    ok: string;
    close: string;
    back: string;
    next: string;
    previous: string;
    refresh: string;
    clear: string;
    reset: string;
    submit: string;
    confirm: string;
    total: string;
    subtotal: string;
    discount: string;
    tax: string;
    amount: string;
    quantity: string;
    price: string;
    date: string;
    time: string;
    name: string;
    description: string;
    status: string;
    active: string;
    inactive: string;
  };
}

export function useTranslation(): UseTranslationReturn {
  const { t, i18n } = useI18nTranslation();
  
  const currentLanguage = i18n.language as SupportedLanguage;
  
  // Language-specific formatting functions
  const formatCurrencyWithLang = (
    amount: number, 
    options?: Parameters<typeof formatCurrency>[2]
  ) => formatCurrency(amount, currentLanguage, options);
  
  const formatDateWithLang = (
    date: Date | string, 
    format?: Parameters<typeof formatDate>[1]
  ) => formatDate(date, format, currentLanguage);
  
  const formatTimeWithLang = (
    date: Date | string, 
    format?: Parameters<typeof formatTime>[1]
  ) => formatTime(date, format, currentLanguage);
  
  const formatDateTimeWithLang = (
    date: Date | string,
    dateFormat?: Parameters<typeof formatDateTime>[1],
    timeFormat?: Parameters<typeof formatDateTime>[2]
  ) => formatDateTime(date, dateFormat, timeFormat, currentLanguage);
  
  // Language direction (for future RTL support if needed)
  const isRTL = false; // None of our supported languages are RTL currently
  const direction: 'ltr' | 'rtl' = isRTL ? 'rtl' : 'ltr';
  
  // Common translations for easy access
  const common = {
    save: t('common.save'),
    cancel: t('common.cancel'),
    delete: t('common.delete'),
    edit: t('common.edit'),
    add: t('common.add'),
    search: t('common.search'),
    loading: t('common.loading'),
    error: t('common.error'),
    success: t('common.success'),
    warning: t('common.warning'),
    info: t('common.info'),
    yes: t('common.yes'),
    no: t('common.no'),
    ok: t('common.ok'),
    close: t('common.close'),
    back: t('common.back'),
    next: t('common.next'),
    previous: t('common.previous'),
    refresh: t('common.refresh'),
    clear: t('common.clear'),
    reset: t('common.reset'),
    submit: t('common.submit'),
    confirm: t('common.confirm'),
    total: t('common.total'),
    subtotal: t('common.subtotal'),
    discount: t('common.discount'),
    tax: t('common.tax'),
    amount: t('common.amount'),
    quantity: t('common.quantity'),
    price: t('common.price'),
    date: t('common.date'),
    time: t('common.time'),
    name: t('common.name'),
    description: t('common.description'),
    status: t('common.status'),
    active: t('common.active'),
    inactive: t('common.inactive'),
  };
  
  return {
    t,
    language: currentLanguage,
    changeLanguage: (language: SupportedLanguage) => i18n.changeLanguage(language),
    formatCurrency: formatCurrencyWithLang,
    formatDate: formatDateWithLang,
    formatTime: formatTimeWithLang,
    formatDateTime: formatDateTimeWithLang,
    isRTL,
    direction,
    common,
  };
}

export default useTranslation;