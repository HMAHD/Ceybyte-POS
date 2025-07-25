/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                Units of Measure API Client                                       │
 * │                                                                                                  │
 * │  Description: API client functions for unit of measure management.                               │
 * │               Supports decimal precision settings and unit conversions.                         │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import { apiClient } from './client';
import { ApiResponse } from '@/types/api';

// Unit interfaces
export interface UnitCreateRequest {
  name: string;
  abbreviation: string;
  allow_decimals?: boolean;
  decimal_places?: number;
  base_unit_id?: number;
  conversion_factor?: number;
  symbol?: string;
}

export interface UnitUpdateRequest {
  name?: string;
  abbreviation?: string;
  allow_decimals?: boolean;
  decimal_places?: number;
  base_unit_id?: number;
  conversion_factor?: number;
  symbol?: string;
}

export interface UnitResponse {
  id: number;
  name: string;
  abbreviation: string;
  allow_decimals: boolean;
  decimal_places: number;
  base_unit_id?: number;
  conversion_factor: number;
  symbol?: string;
  created_at: string;
  updated_at: string;
  base_unit?: {
    id: number;
    name: string;
    abbreviation: string;
  };
  product_count: number;
}

// API functions
export const unitsApi = {
  // Get all units of measure
  getUnits: async (): Promise<ApiResponse<UnitResponse[]>> => {
    return apiClient.get<UnitResponse[]>('/units');
  },

  // Get single unit by ID
  getUnit: async (id: number): Promise<ApiResponse<UnitResponse>> => {
    return apiClient.get<UnitResponse>(`/units/${id}`);
  },

  // Create new unit
  createUnit: async (unit: UnitCreateRequest): Promise<ApiResponse<UnitResponse>> => {
    return apiClient.post<UnitResponse>('/units', unit);
  },

  // Update existing unit
  updateUnit: async (id: number, unit: UnitUpdateRequest): Promise<ApiResponse<UnitResponse>> => {
    return apiClient.put<UnitResponse>(`/units/${id}`, unit);
  },

  // Delete unit
  deleteUnit: async (id: number): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.delete<{ message: string }>(`/units/${id}`);
  },

  // Seed default units
  seedDefaultUnits: async (): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.post<{ message: string }>('/units/seed');
  }
};

export default unitsApi;