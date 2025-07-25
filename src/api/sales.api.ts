/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                     Sales API Client                                             │
 * │                                                                                                  │
 * │  Description: API client functions for sales operations including sale creation,                │
 * │               payment processing, and receipt generation.                                        │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import { apiClient } from './client';
import { ApiResponse } from '@/types/api';

// Sale interfaces
export interface SaleItemRequest {
  product_id: number;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
  notes?: string;
}

export interface SaleCreateRequest {
  customer_id?: number;
  customer_name?: string;
  items: SaleItemRequest[];
  payment_method: 'cash' | 'card' | 'mobile' | 'credit';
  amount_tendered?: number;
  payment_reference?: string;
  payment_notes?: string;
  sale_notes?: string;
  is_customer_mode: boolean;
}

export interface SaleResponse {
  id: number;
  receipt_number: string;
  customer_id?: number;
  customer_name?: string;
  user_id: number;
  terminal_id: number;
  items: SaleItemResponse[];
  payment: {
    method: string;
    amount_tendered?: number;
    change?: number;
    reference?: string;
    notes?: string;
  };
  totals: {
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    item_count: number;
  };
  metadata: {
    is_customer_mode: boolean;
    sale_notes?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface SaleItemResponse {
  id: number;
  product_id: number;
  product: {
    id: number;
    name_en: string;
    name_si?: string;
    name_ta?: string;
    barcode?: string;
    unit_of_measure?: {
      abbreviation: string;
    };
  };
  quantity: number;
  unit_price: number;
  original_price: number;
  discount_amount: number;
  line_total: number;
  notes?: string;
}

export interface SalesSearchParams {
  skip?: number;
  limit?: number;
  start_date?: string;
  end_date?: string;
  customer_id?: number;
  payment_method?: string;
  user_id?: number;
  terminal_id?: number;
}

// API functions
export const salesApi = {
  // Create new sale
  createSale: async (sale: SaleCreateRequest): Promise<ApiResponse<SaleResponse>> => {
    return apiClient.post<SaleResponse>('/sales', sale);
  },

  // Get sales with optional filtering
  getSales: async (params?: SalesSearchParams): Promise<ApiResponse<SaleResponse[]>> => {
    const queryParams = new URLSearchParams();
    
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.customer_id !== undefined) queryParams.append('customer_id', params.customer_id.toString());
    if (params?.payment_method) queryParams.append('payment_method', params.payment_method);
    if (params?.user_id !== undefined) queryParams.append('user_id', params.user_id.toString());
    if (params?.terminal_id !== undefined) queryParams.append('terminal_id', params.terminal_id.toString());
    
    const endpoint = `/sales${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<SaleResponse[]>(endpoint);
  },

  // Get single sale by ID
  getSale: async (id: number): Promise<ApiResponse<SaleResponse>> => {
    return apiClient.get<SaleResponse>(`/sales/${id}`);
  },

  // Get sale by receipt number
  getSaleByReceipt: async (receiptNumber: string): Promise<ApiResponse<SaleResponse>> => {
    return apiClient.get<SaleResponse>(`/sales/receipt/${receiptNumber}`);
  },

  // Void/cancel sale (if allowed)
  voidSale: async (id: number, reason: string): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.post<{ message: string }>(`/sales/${id}/void`, { reason });
  },

  // Print receipt
  printReceipt: async (id: number): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.post<{ message: string }>(`/sales/${id}/print`);
  },

  // Get daily sales summary
  getDailySummary: async (date?: string): Promise<ApiResponse<{
    date: string;
    total_sales: number;
    total_amount: number;
    payment_methods: Record<string, { count: number; amount: number }>;
    top_products: Array<{
      product_id: number;
      product_name: string;
      quantity_sold: number;
      total_amount: number;
    }>;
  }>> => {
    const endpoint = `/sales/summary/daily${date ? `?date=${date}` : ''}`;
    return apiClient.get(endpoint);
  }
};

export default salesApi;