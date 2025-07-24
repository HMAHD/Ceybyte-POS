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

  private async handleUserMockEndpoints<T>(
    endpoint: string,
    method: string,
    body: any
  ): Promise<ApiResponse<T>> {
    // Get existing mock users from localStorage
    const getMockUsers = () => {
      const stored = localStorage.getItem('ceybyte-mock-users');
      if (stored) {
        return JSON.parse(stored);
      }
      // Default mock users
      const defaultUsers = [
        {
          id: 1,
          username: 'admin',
          name: 'System Administrator',
          email: 'admin@ceybyte.com',
          phone: '+94771234567',
          role: 'owner',
          is_active: true,
          has_pin: true,
          preferred_language: 'en',
          last_login: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 2,
          username: 'cashier',
          name: 'Main Cashier',
          email: 'cashier@ceybyte.com',
          phone: '+94777654321',
          role: 'cashier',
          is_active: true,
          has_pin: false,
          preferred_language: 'en',
          last_login: new Date(Date.now() - 86400000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 3,
          username: 'helper',
          name: 'Sales Helper',
          email: null,
          phone: null,
          role: 'helper',
          is_active: true,
          has_pin: false,
          preferred_language: 'si',
          last_login: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      localStorage.setItem('ceybyte-mock-users', JSON.stringify(defaultUsers));
      return defaultUsers;
    };

    const saveMockUsers = (users: any[]) => {
      localStorage.setItem('ceybyte-mock-users', JSON.stringify(users));
    };

    try {
      console.log('🎯 Mock User API - Endpoint:', endpoint, 'Method:', method);
      
      // GET /users - List users with filtering
      if (endpoint.startsWith('/users') && method === 'GET' && !endpoint.includes('/users/')) {
        const users = getMockUsers();
        console.log('📋 Returning users:', users.length, 'users found');
        return {
          success: true,
          data: {
            users,
            total: users.length,
            page: 1,
            per_page: 20,
          } as T,
        };
      }

      // POST /users - Create new user
      if (endpoint === '/users' && method === 'POST') {
        const users = getMockUsers();
        const newUser = {
          id: Math.max(...users.map((u: any) => u.id)) + 1,
          username: body.username,
          name: body.name,
          email: body.email || null,
          phone: body.phone || null,
          role: body.role,
          is_active: body.is_active !== false,
          has_pin: !!body.pin,
          preferred_language: body.preferred_language || 'en',
          last_login: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        users.push(newUser);
        saveMockUsers(users);
        
        console.log('Mock: Created new user:', newUser);
        return {
          success: true,
          data: newUser as T,
        };
      }

      // PUT /users/:id - Update user
      if (endpoint.match(/^\/users\/\d+$/) && method === 'PUT') {
        const userId = parseInt(endpoint.split('/')[2]);
        const users = getMockUsers();
        const userIndex = users.findIndex((u: any) => u.id === userId);
        
        if (userIndex === -1) {
          return {
            success: false,
            error: 'User not found',
          };
        }

        users[userIndex] = {
          ...users[userIndex],
          ...body,
          updated_at: new Date().toISOString(),
        };
        saveMockUsers(users);
        
        return {
          success: true,
          data: users[userIndex] as T,
        };
      }

      // DELETE /users/:id - Delete user
      if (endpoint.match(/^\/users\/\d+$/) && method === 'DELETE') {
        const userId = parseInt(endpoint.split('/')[2]);
        const users = getMockUsers();
        const filteredUsers = users.filter((u: any) => u.id !== userId);
        saveMockUsers(filteredUsers);
        
        return {
          success: true,
          data: { message: 'User deleted successfully' } as T,
        };
      }

      // Default fallback
      return {
        success: false,
        error: 'Mock endpoint not implemented',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Mock user API error',
      };
    }
  }

  private async handleMockRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body as string) : null;

    console.log('🔧 Mock API Request:', { endpoint, method, body });

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

      // Handle user management endpoints
      if (endpoint.startsWith('/users')) {
        return this.handleUserMockEndpoints<T>(endpoint, method, body);
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
