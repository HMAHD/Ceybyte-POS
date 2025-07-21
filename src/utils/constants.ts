// Application constants for CeybytePOS

export const APP_NAME = 'CeybytePOS';
export const COMPANY_NAME = 'Ceybyte.com';

// Supported languages
export const LANGUAGES = {
  en: 'English',
  si: 'සිංහල',
  ta: 'தமிழ்',
} as const;

export type Language = keyof typeof LANGUAGES;

// User roles
export const USER_ROLES = {
  OWNER: 'owner',
  CASHIER: 'cashier',
  HELPER: 'helper',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// Payment methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  MOBILE: 'mobile',
  CREDIT: 'credit',
} as const;

export type PaymentMethod =
  (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];

// Sale types
export const SALE_TYPES = {
  WALK_IN: 'walk-in',
  CREDIT: 'credit',
} as const;

export type SaleType = (typeof SALE_TYPES)[keyof typeof SALE_TYPES];

// Keyboard shortcuts
export const SHORTCUTS = {
  INSTANT_CASH_SALE: 'F12',
  CUSTOMER_MODE: 'F3',
  PRODUCT_SEARCH: 'F2',
  HOLD_SALE: 'Ctrl+H',
  RETRIEVE_SALE: 'Ctrl+R',
  OPEN_DRAWER: 'F9',
  PRICE_CHECK: 'F11',
  SALES_TOTAL: 'F10',
} as const;

// Sri Lankan specific
export const LKR_CURRENCY = 'Rs.';
export const DATE_FORMAT = 'DD/MM/YYYY';

// Mobile money providers
export const MOBILE_PROVIDERS = {
  EZ_CASH: 'eZ Cash',
  M_CASH: 'mCash',
  OTHER: 'Other',
} as const;
