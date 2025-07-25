/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                   Products API Client                                            │
 * │                                                                                                  │
 * │  Description: API client functions for product management operations.                            │
 * │               Handles CRUD operations, search, and barcode functionality.                       │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import { apiClient } from './client';
import { ApiResponse } from '@/types/api';

// Product interfaces
export interface ProductCreateRequest {
  name_en: string;
  name_si?: string;
  name_ta?: string;
  sku?: string;
  barcode?: string;
  internal_code?: string;
  category_id?: number;
  unit_of_measure_id: number;
  supplier_id?: number;
  cost_price: number;
  selling_price: number;
  wholesale_price?: number;
  special_price?: number;
  is_negotiable: boolean;
  min_selling_price?: number;
  markup_percentage?: number;
  current_stock: number;
  minimum_stock: number;
  maximum_stock?: number;
  reorder_level?: number;
  is_active: boolean;
  is_service: boolean;
  track_inventory: boolean;
  allow_negative_stock: boolean;
  tax_rate: number;
  tax_inclusive: boolean;
  description?: string;
  short_description?: string;
}

export interface ProductUpdateRequest {
  name_en?: string;
  name_si?: string;
  name_ta?: string;
  sku?: string;
  barcode?: string;
  internal_code?: string;
  category_id?: number;
  unit_of_measure_id?: number;
  supplier_id?: number;
  cost_price?: number;
  selling_price?: number;
  wholesale_price?: number;
  special_price?: number;
  is_negotiable?: boolean;
  min_selling_price?: number;
  markup_percentage?: number;
  current_stock?: number;
  minimum_stock?: number;
  maximum_stock?: number;
  reorder_level?: number;
  is_active?: boolean;
  is_service?: boolean;
  track_inventory?: boolean;
  allow_negative_stock?: boolean;
  tax_rate?: number;
  tax_inclusive?: boolean;
  description?: string;
  short_description?: string;
}

export interface ProductResponse {
  id: number;
  name_en: string;
  name_si?: string;
  name_ta?: string;
  sku?: string;
  barcode?: string;
  internal_code?: string;
  category_id?: number;
  unit_of_measure_id: number;
  supplier_id?: number;
  cost_price: number;
  selling_price: number;
  wholesale_price?: number;
  special_price?: number;
  is_negotiable: boolean;
  min_selling_price?: number;
  markup_percentage?: number;
  current_stock: number;
  minimum_stock: number;
  maximum_stock?: number;
  reorder_level?: number;
  is_active: boolean;
  is_service: boolean;
  track_inventory: boolean;
  allow_negative_stock: boolean;
  tax_rate: number;
  tax_inclusive: boolean;
  description?: string;
  short_description?: string;
  created_at: string;
  updated_at: string;
  category?: {
    id: number;
    name_en: string;
    name_si?: string;
    name_ta?: string;
  };
  unit_of_measure?: {
    id: number;
    name: string;
    abbreviation: string;
    allow_decimals: boolean;
    decimal_places: number;
  };
  supplier?: {
    id: number;
    name: string;
    contact_person: string;
  };
}

export interface ProductSearchParams {
  skip?: number;
  limit?: number;
  search?: string;
  category_id?: number;
  supplier_id?: number;
  is_active?: boolean;
  low_stock_only?: boolean;
}

// API functions
export const productsApi = {
  // Get products with optional filtering
  getProducts: async (params?: ProductSearchParams): Promise<ApiResponse<ProductResponse[]>> => {
    const queryParams = new URLSearchParams();
    
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category_id !== undefined) queryParams.append('category_id', params.category_id.toString());
    if (params?.supplier_id !== undefined) queryParams.append('supplier_id', params.supplier_id.toString());
    if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
    if (params?.low_stock_only !== undefined) queryParams.append('low_stock_only', params.low_stock_only.toString());
    
    const endpoint = `/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<ProductResponse[]>(endpoint);
  },

  // Get single product by ID
  getProduct: async (id: number): Promise<ApiResponse<ProductResponse>> => {
    return apiClient.get<ProductResponse>(`/products/${id}`);
  },

  // Get product by barcode
  getProductByBarcode: async (barcode: string): Promise<ApiResponse<ProductResponse>> => {
    return apiClient.get<ProductResponse>(`/products/barcode/${barcode}`);
  },

  // Create new product
  createProduct: async (product: ProductCreateRequest): Promise<ApiResponse<ProductResponse>> => {
    return apiClient.post<ProductResponse>('/products', product);
  },

  // Update existing product
  updateProduct: async (id: number, product: ProductUpdateRequest): Promise<ApiResponse<ProductResponse>> => {
    return apiClient.put<ProductResponse>(`/products/${id}`, product);
  },

  // Delete product (soft delete)
  deleteProduct: async (id: number): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.delete<{ message: string }>(`/products/${id}`);
  },

  // Generate barcode for product
  generateBarcode: async (id: number): Promise<ApiResponse<{ barcode: string; message: string }>> => {
    return apiClient.post<{ barcode: string; message: string }>(`/products/${id}/generate-barcode`);
  }
};

export default productsApi;