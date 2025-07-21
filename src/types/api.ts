// API-related type definitions

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SearchParams {
  query?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductSearchParams extends SearchParams {
  categoryId?: number;
  supplierId?: number;
  inStock?: boolean;
  negotiable?: boolean;
}

export interface CustomerSearchParams extends SearchParams {
  areaVillage?: string;
  hasCredit?: boolean;
  overdue?: boolean;
}

export interface SalesReportParams {
  startDate: Date;
  endDate: Date;
  customerId?: number;
  paymentMethod?: string;
  userId?: number;
}

export interface PrinterConfig {
  name: string;
  type: 'thermal' | 'inkjet' | 'laser';
  width: 58 | 80;
  characterSet: string;
  density: number;
}

export interface WhatsAppMessage {
  to: string;
  message: string;
  type: 'receipt' | 'reminder' | 'greeting' | 'report';
}
