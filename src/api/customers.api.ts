/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                   Customer API Client                                            │
 * │                                                                                                  │
 * │  Description: API client functions for customer operations including credit management,         │
 * │               customer search, and credit limit checking.                                        │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import { apiClient } from './client';
import { ApiResponse } from '@/types/api';

// Customer interfaces
export interface CustomerResponse {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  area_village: string;
  credit_limit: number;
  current_balance: number;
  payment_terms_days: number;
  whatsapp_opt_in: boolean;
  preferred_language: 'en' | 'si' | 'ta';
  last_payment_date?: string;
  days_overdue: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerCreateRequest {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  area_village: string;
  credit_limit?: number;
  payment_terms_days?: number;
  whatsapp_opt_in?: boolean;
  preferred_language?: 'en' | 'si' | 'ta';
}

export interface CustomerUpdateRequest extends Partial<CustomerCreateRequest> {
  is_active?: boolean;
}

export interface CustomerCreditInfo {
  customer_id: number;
  credit_limit: number;
  current_balance: number;
  available_credit: number;
  days_overdue: number;
  last_payment_date?: string;
  payment_terms_days: number;
}

export interface CustomerSearchParams {
  skip?: number;
  limit?: number;
  search?: string;
  area_village?: string;
  has_credit?: boolean;
  overdue_only?: boolean;
  active_only?: boolean;
}

export interface CustomerPaymentRequest {
  customer_id: number;
  amount: number;
  payment_method: 'cash' | 'card' | 'mobile';
  reference?: string;
  notes?: string;
}

// API functions
export const customersApi = {
  // Get customers with optional filtering
  getCustomers: async (params?: CustomerSearchParams): Promise<ApiResponse<CustomerResponse[]>> => {
    const queryParams = new URLSearchParams();
    
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.area_village) queryParams.append('area_village', params.area_village);
    if (params?.has_credit !== undefined) queryParams.append('has_credit', params.has_credit.toString());
    if (params?.overdue_only !== undefined) queryParams.append('overdue_only', params.overdue_only.toString());
    if (params?.active_only !== undefined) queryParams.append('active_only', params.active_only.toString());
    
    const endpoint = `/customers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<CustomerResponse[]>(endpoint);
  },

  // Get single customer by ID
  getCustomer: async (id: number): Promise<ApiResponse<CustomerResponse>> => {
    return apiClient.get<CustomerResponse>(`/customers/${id}`);
  },

  // Create new customer
  createCustomer: async (customer: CustomerCreateRequest): Promise<ApiResponse<CustomerResponse>> => {
    return apiClient.post<CustomerResponse>('/customers', customer);
  },

  // Update customer
  updateCustomer: async (id: number, customer: CustomerUpdateRequest): Promise<ApiResponse<CustomerResponse>> => {
    return apiClient.put<CustomerResponse>(`/customers/${id}`, customer);
  },

  // Delete customer (soft delete)
  deleteCustomer: async (id: number): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.delete<{ message: string }>(`/customers/${id}`);
  },

  // Get customer credit information
  getCustomerCredit: async (id: number): Promise<ApiResponse<CustomerCreditInfo>> => {
    return apiClient.get<CustomerCreditInfo>(`/customers/${id}/credit`);
  },

  // Check if customer can make credit purchase
  checkCreditLimit: async (customerId: number, amount: number): Promise<ApiResponse<{
    can_purchase: boolean;
    available_credit: number;
    would_exceed_by?: number;
    requires_approval?: boolean;
  }>> => {
    return apiClient.post<{
      can_purchase: boolean;
      available_credit: number;
      would_exceed_by?: number;
      requires_approval?: boolean;
    }>(`/customers/${customerId}/credit/check`, { amount });
  },

  // Record customer payment
  recordPayment: async (payment: CustomerPaymentRequest): Promise<ApiResponse<{
    id: number;
    customer_id: number;
    amount: number;
    payment_method: string;
    reference?: string;
    notes?: string;
    new_balance: number;
    created_at: string;
  }>> => {
    return apiClient.post(`/customers/payments`, payment);
  },

  // Get customer payment history
  getPaymentHistory: async (customerId: number, params?: {
    skip?: number;
    limit?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<ApiResponse<Array<{
    id: number;
    amount: number;
    payment_method: string;
    reference?: string;
    notes?: string;
    balance_after: number;
    created_at: string;
  }>>> => {
    const queryParams = new URLSearchParams();
    
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    
    const endpoint = `/customers/${customerId}/payments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get(endpoint);
  },

  // Get customer transaction history (sales + payments)
  getTransactionHistory: async (customerId: number, params?: {
    skip?: number;
    limit?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<ApiResponse<Array<{
    id: number;
    type: 'sale' | 'payment';
    amount: number;
    description: string;
    balance_after: number;
    created_at: string;
    reference?: string;
  }>>> => {
    const queryParams = new URLSearchParams();
    
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    
    const endpoint = `/customers/${customerId}/transactions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get(endpoint);
  },

  // Search customers by name or phone
  searchCustomers: async (query: string): Promise<ApiResponse<CustomerResponse[]>> => {
    return apiClient.get<CustomerResponse[]>(`/customers/search?q=${encodeURIComponent(query)}`);
  },

  // Get customers by area/village
  getCustomersByArea: async (areaVillage: string): Promise<ApiResponse<CustomerResponse[]>> => {
    return apiClient.get<CustomerResponse[]>(`/customers/area/${encodeURIComponent(areaVillage)}`);
  },

  // Get overdue customers
  getOverdueCustomers: async (): Promise<ApiResponse<Array<CustomerResponse & {
    overdue_amount: number;
    days_overdue: number;
  }>>> => {
    return apiClient.get('/customers/overdue');
  }
};

export default customersApi;