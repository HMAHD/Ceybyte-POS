/*
 * ╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                        CEYBYTE POS                                               ║
 * ║                                                                                                  ║
 * ║                                      API Client Module                                           ║
 * ║                                                                                                  ║
 * ║  Description: HTTP client for communicating with the Python FastAPI backend.                     ║
 * ║               Provides methods for GET, POST, PUT, DELETE requests with error handling.          ║
 * ║                                                                                                  ║
 * ║  Author: Akash Hasendra                                                                          ║
 * ║  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   ║
 * ║  License: MIT License with Sri Lankan Business Terms                                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import { ApiResponse } from '@/types/api';

const API_BASE_URL = 'http://127.0.0.1:8000';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // PIN-based authentication doesn't require tokens for most operations
    // Only add auth headers for endpoints that specifically require them
    if (endpoint.includes('/auth/') && !endpoint.includes('/pin-auth/')) {
      const token = localStorage.getItem('ceybyte-pos-token');
      if (token && token !== 'null' && token !== 'undefined' && token.length > 10) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...(options.headers || {}),
        },
      });

      if (!response.ok) {
        // If it's an auth error, clear any old tokens
        if (response.status === 401) {
          localStorage.removeItem('ceybyte-pos-token');
          // For PIN auth, we don't need to do anything special
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API request failed:', error);

      // If it's an auth error, don't fallback to mock
      if (error instanceof Error && error.message.includes('401')) {
        return {
          success: false,
          error: 'Authentication required',
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Health check
  async healthCheck(): Promise<
    ApiResponse<{ status: string; service: string }>
  > {
    return this.get('/health');
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
