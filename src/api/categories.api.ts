/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                  Categories API Client                                           │
 * │                                                                                                  │
 * │  Description: API client functions for category management with hierarchical structure.         │
 * │               Supports parent-child relationships and multi-language names.                     │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import { apiClient } from './client';
import { ApiResponse } from '@/types/api';

// Category interfaces
export interface CategoryCreateRequest {
  name_en: string;
  name_si?: string;
  name_ta?: string;
  parent_id?: number;
  sort_order?: number;
  is_negotiable_default?: boolean;
  icon?: string;
  color?: string;
  description?: string;
}

export interface CategoryUpdateRequest {
  name_en?: string;
  name_si?: string;
  name_ta?: string;
  parent_id?: number;
  sort_order?: number;
  is_negotiable_default?: boolean;
  icon?: string;
  color?: string;
  description?: string;
}

export interface CategoryResponse {
  id: number;
  name_en: string;
  name_si?: string;
  name_ta?: string;
  parent_id?: number;
  sort_order: number;
  is_negotiable_default: boolean;
  icon?: string;
  color?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  parent?: {
    id: number;
    name_en: string;
    name_si?: string;
    name_ta?: string;
  };
  children: Array<{
    id: number;
    name_en: string;
    name_si?: string;
    name_ta?: string;
    sort_order: number;
    product_count: number;
  }>;
  product_count: number;
}

export interface CategorySearchParams {
  include_children?: boolean;
  parent_id?: number;
}

// API functions
export const categoriesApi = {
  // Get categories with optional hierarchical structure
  getCategories: async (params?: CategorySearchParams): Promise<ApiResponse<CategoryResponse[]>> => {
    const queryParams = new URLSearchParams();
    
    if (params?.include_children !== undefined) queryParams.append('include_children', params.include_children.toString());
    if (params?.parent_id !== undefined) queryParams.append('parent_id', params.parent_id.toString());
    
    const endpoint = `/categories${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<CategoryResponse[]>(endpoint);
  },

  // Get complete category tree structure
  getCategoryTree: async (): Promise<ApiResponse<CategoryResponse[]>> => {
    return apiClient.get<CategoryResponse[]>('/categories/tree');
  },

  // Get single category by ID
  getCategory: async (id: number): Promise<ApiResponse<CategoryResponse>> => {
    return apiClient.get<CategoryResponse>(`/categories/${id}`);
  },

  // Create new category
  createCategory: async (category: CategoryCreateRequest): Promise<ApiResponse<CategoryResponse>> => {
    return apiClient.post<CategoryResponse>('/categories', category);
  },

  // Update existing category
  updateCategory: async (id: number, category: CategoryUpdateRequest): Promise<ApiResponse<CategoryResponse>> => {
    return apiClient.put<CategoryResponse>(`/categories/${id}`, category);
  },

  // Delete category
  deleteCategory: async (id: number): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.delete<{ message: string }>(`/categories/${id}`);
  }
};

export default categoriesApi;