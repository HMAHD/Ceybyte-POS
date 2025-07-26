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
  id: number;
  recipient_phone: string;
  recipient_name?: string;
  message_type: string;
  message_content: string;
  status: string;
  error_message?: string;
  sent_at?: Date;
  created_at: Date;
}

export interface WhatsAppConfig {
  id?: number;
  api_url: string;
  api_token: string;
  business_phone: string;
  business_name: string;
  auto_send_receipts: boolean;
  daily_reports_enabled: boolean;
  customer_reminders_enabled: boolean;
  backup_sharing_enabled: boolean;
  daily_report_time: string;
  owner_phone?: string;
  receipt_template?: string;
  reminder_template?: string;
  greeting_template?: string;
}

export interface BulkMessageRequest {
  message: string;
  area_filter?: string;
  village_filter?: string;
}
