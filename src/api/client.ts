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
import { mockAuthService } from '@/utils/mockAuth';

const API_BASE_URL = 'http://127.0.0.1:8000';
const USE_MOCK_API = true; // Set to false when Python API is running

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Use mock API for development when real API is not available
    if (USE_MOCK_API) {
      return this.handleMockRequest<T>(endpoint, options);
    }

    const url = `${this.baseURL}${endpoint}`;

    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authentication header if token exists
    const token = localStorage.getItem('ceybyte-pos-token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API request failed:', error);

      // Fallback to mock API if real API fails
      console.log('Falling back to mock API...');
      return this.handleMockRequest<T>(endpoint, options);
    }
  }

  private async handleMockRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body as string) : null;

    try {
      // Handle authentication endpoints
      if (endpoint === '/auth/login' && method === 'POST') {
        const result = await mockAuthService.login(
          body.username,
          body.password
        );
        return result as ApiResponse<T>;
      }

      if (endpoint === '/auth/pin-login' && method === 'POST') {
        const result = await mockAuthService.pinLogin(body.username, body.pin);
        return result as ApiResponse<T>;
      }

      if (endpoint === '/auth/me' && method === 'GET') {
        const token = localStorage.getItem('ceybyte-pos-token');
        if (!token) {
          return {
            success: false,
            error: 'No token provided',
          };
        }
        const result = await mockAuthService.verifyUser(token);
        return result as ApiResponse<T>;
      }

      if (endpoint === '/health' && method === 'GET') {
        const result = await mockAuthService.healthCheck();
        return result as ApiResponse<T>;
      }

      // Default mock response for other endpoints
      return {
        success: true,
        data: {} as T,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Mock API error',
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
