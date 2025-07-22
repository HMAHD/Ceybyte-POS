/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                   Formatting Utilities                                           │
 * │                                                                                                  │
 * │  Description: Currency and date formatting utilities for Sri Lankan formats.                     │
 * │               Supports multi-language number and date formatting.                                │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import { type SupportedLanguage } from '../i18n';

// Sri Lankan currency configuration
export const CURRENCY_CONFIG = {
  code: 'LKR',
  symbol: 'Rs.',
  symbolSi: 'රු.',
  symbolTa: 'ரூ.',
  decimals: 2,
  thousandsSeparator: ',',
  decimalSeparator: '.',
} as const;

// Date format configurations for different languages
export const DATE_FORMATS = {
  en: {
    short: 'MM/dd/yyyy',
    medium: 'MMM dd, yyyy',
    long: 'MMMM dd, yyyy',
    full: 'EEEE, MMMM dd, yyyy',
  },
  si: {
    short: 'yyyy/MM/dd',
    medium: 'yyyy MMM dd',
    long: 'yyyy MMMM dd',
    full: 'yyyy MMMM dd, EEEE',
  },
  ta: {
    short: 'dd/MM/yyyy',
    medium: 'dd MMM yyyy',
    long: 'dd MMMM yyyy',
    full: 'EEEE, dd MMMM yyyy',
  },
} as const;

/**
 * Format currency amount for display
 */
export function formatCurrency(
  amount: number,
  language: SupportedLanguage = 'en',
  options: {
    showSymbol?: boolean;
    showDecimals?: boolean;
    compact?: boolean;
  } = {}
): string {
  const { showSymbol = true, showDecimals = true, compact = false } = options;

  // Handle compact formatting for large numbers
  if (compact && Math.abs(amount) >= 1000) {
    const units = ['', 'K', 'M', 'B'];
    let unitIndex = 0;
    let compactAmount = amount;

    while (Math.abs(compactAmount) >= 1000 && unitIndex < units.length - 1) {
      compactAmount /= 1000;
      unitIndex++;
    }

    const formattedAmount = compactAmount.toFixed(unitIndex > 0 ? 1 : 0);
    const symbol = getSymbolForLanguage(language);

    return showSymbol
      ? `${symbol} ${formattedAmount}${units[unitIndex]}`
      : `${formattedAmount}${units[unitIndex]}`;
  }

  // Format the number with proper separators
  const decimals = showDecimals ? CURRENCY_CONFIG.decimals : 0;
  const formattedNumber = formatNumber(amount, decimals, language);

  if (!showSymbol) {
    return formattedNumber;
  }

  const symbol = getSymbolForLanguage(language);
  return `${symbol} ${formattedNumber}`;
}

/**
 * Get currency symbol for language
 */
function getSymbolForLanguage(language: SupportedLanguage): string {
  switch (language) {
    case 'si':
      return CURRENCY_CONFIG.symbolSi;
    case 'ta':
      return CURRENCY_CONFIG.symbolTa;
    default:
      return CURRENCY_CONFIG.symbol;
  }
}

/**
 * Format number with proper separators
 */
export function formatNumber(
  number: number,
  decimals: number = 2,
  language: SupportedLanguage = 'en'
): string {
  // Use browser's Intl.NumberFormat for proper localization
  const locale = getLocaleForLanguage(language);

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
}

/**
 * Get locale string for language
 */
function getLocaleForLanguage(language: SupportedLanguage): string {
  switch (language) {
    case 'si':
      return 'si-LK';
    case 'ta':
      return 'ta-LK';
    default:
      return 'en-LK';
  }
}

/**
 * Format date for display
 */
export function formatDate(
  date: Date | string,
  format: 'short' | 'medium' | 'long' | 'full' = 'medium',
  language: SupportedLanguage = 'en'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const locale = getLocaleForLanguage(language);

  // Map format types to Intl.DateTimeFormat options
  const formatOptions: Record<string, Intl.DateTimeFormatOptions> = {
    short: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    },
    medium: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    },
    long: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
    full: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    },
  };

  return new Intl.DateTimeFormat(locale, formatOptions[format]).format(dateObj);
}

/**
 * Format time for display
 */
export function formatTime(
  date: Date | string,
  format: '12h' | '24h' = '12h',
  language: SupportedLanguage = 'en'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Time';
  }

  const locale = getLocaleForLanguage(language);

  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: format === '12h',
  };

  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}

/**
 * Format date and time together
 */
export function formatDateTime(
  date: Date | string,
  dateFormat: 'short' | 'medium' | 'long' = 'medium',
  timeFormat: '12h' | '24h' = '12h',
  language: SupportedLanguage = 'en'
): string {
  const formattedDate = formatDate(date, dateFormat, language);
  const formattedTime = formatTime(date, timeFormat, language);

  return `${formattedDate} ${formattedTime}`;
}

/**
 * Parse currency string to number
 */
export function parseCurrency(currencyString: string): number {
  // Remove currency symbols and separators
  const cleanString = currencyString
    .replace(/[Rs\.රු\.ரூ\.,\s]/g, '')
    .replace(/[^\d.-]/g, '');

  const number = parseFloat(cleanString);
  return isNaN(number) ? 0 : number;
}

/**
 * Format percentage
 */
export function formatPercentage(
  value: number,
  decimals: number = 1,
  language: SupportedLanguage = 'en'
): string {
  const locale = getLocaleForLanguage(language);

  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

/**
 * Format quantity based on unit settings
 */
export function formatQuantity(
  quantity: number,
  allowDecimals: boolean = true,
  decimalPlaces: number = 2
): string {
  if (!allowDecimals) {
    return Math.floor(quantity).toString();
  }

  return quantity.toFixed(decimalPlaces);
}

/**
 * Get relative time (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelativeTime(
  date: Date | string,
  language: SupportedLanguage = 'en'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  const locale = getLocaleForLanguage(language);

  // Use Intl.RelativeTimeFormat for proper localization
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (Math.abs(diffDays) >= 1) {
    return rtf.format(diffDays, 'day');
  } else if (Math.abs(diffHours) >= 1) {
    return rtf.format(diffHours, 'hour');
  } else if (Math.abs(diffMinutes) >= 1) {
    return rtf.format(diffMinutes, 'minute');
  } else {
    return rtf.format(diffSeconds, 'second');
  }
}

/**
 * Format file size
 */
export function formatFileSize(
  bytes: number,
  language: SupportedLanguage = 'en'
): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  const formattedSize = formatNumber(size, unitIndex === 0 ? 0 : 1, language);
  return `${formattedSize} ${units[unitIndex]}`;
}
