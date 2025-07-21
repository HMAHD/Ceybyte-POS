// Data model interfaces for CeybytePOS

import {
  Language,
  UserRole,
  PaymentMethod,
  SaleType,
} from '../utils/constants';

export interface Product {
  id: number;
  names: {
    en: string;
    si: string;
    ta: string;
  };
  barcode: string;
  categoryId: number;
  supplierId: number;
  pricing: {
    cost: number;
    selling: number;
    isNegotiable: boolean;
    minPrice?: number;
  };
  inventory: {
    unit: string;
    allowDecimals: boolean;
    currentStock: number;
    reorderLevel: number;
  };
  timestamps: {
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface Customer {
  id: number;
  name: string;
  contact: {
    phone: string;
    email?: string;
    address?: string;
    areaVillage: string;
  };
  credit: {
    limit: number;
    currentBalance: number;
    paymentTerms: number;
    lastPayment?: Date;
    daysOverdue: number;
  };
  preferences: {
    whatsappOptIn: boolean;
    preferredLanguage: Language;
  };
  createdAt: Date;
}

export interface Supplier {
  id: number;
  name: string;
  contactPerson: string;
  phone: string;
  paymentTermsDays: number;
  visitSchedule: string;
  currentBalance: number;
  createdAt: Date;
}

export interface SaleItem {
  id: number;
  productId: number;
  product?: Product;
  quantity: number;
  unitPrice: number;
  originalPrice: number;
  discountAmount: number;
  lineTotal: number;
}

export interface Sale {
  id: number;
  customerId?: number;
  customer?: Customer;
  userId: number;
  terminalId: number;
  type: SaleType;
  items: SaleItem[];
  totals: {
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
  };
  payment: {
    method: PaymentMethod;
    reference?: string;
    amountTendered?: number;
    change?: number;
  };
  metadata: {
    isHelperSale: boolean;
    helperName?: string;
    whatsappSent: boolean;
  };
  createdAt: Date;
}

export interface User {
  id: number;
  username: string;
  name: string;
  role: UserRole;
  pin?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

export interface Terminal {
  id: number;
  name: string;
  ipAddress: string;
  isMain: boolean;
  lastSync: Date;
  status: 'online' | 'offline';
}

export interface Category {
  id: number;
  name: string;
  parentId?: number;
  children?: Category[];
  isNegotiableDefault: boolean;
}

export interface UnitOfMeasure {
  id: number;
  name: string;
  abbreviation: string;
  allowDecimals: boolean;
  decimalPlaces: number;
}
