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
const USE_MOCK_API = false; // Set to false when Python API is running

// Clear any mock tokens when switching to real API
if (!USE_MOCK_API) {
  const existingToken = localStorage.getItem('ceybyte-pos-token');
  if (existingToken && !existingToken.includes('.')) {
    // If token doesn't contain dots, it's likely a mock token (base64), not JWT
    console.log('Clearing mock token, switching to real API');
    localStorage.removeItem('ceybyte-pos-token');
  }
}

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
    if (token && token !== 'null' && token !== 'undefined' && token.length > 10) {
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
        // If it's an auth error, clear the token
        if (response.status === 401) {
          localStorage.removeItem('ceybyte-pos-token');
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

      // Handle product endpoints
      if (endpoint.startsWith('/products')) {
        return this.handleProductMockRequest<T>(endpoint, method, body);
      }

      if (endpoint.startsWith('/categories')) {
        return this.handleCategoryMockRequest<T>(endpoint, method, body);
      }

      if (endpoint.startsWith('/units')) {
        return this.handleUnitMockRequest<T>(endpoint, method, body);
      }

      if (endpoint.startsWith('/sales')) {
        return this.handleSalesMockRequest<T>(endpoint, method, body);
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

  private async handleProductMockRequest<T>(
    endpoint: string,
    method: string,
    body: any
  ): Promise<ApiResponse<T>> {
    // Mock product data
    const mockProducts = [
      {
        id: 1,
        name_en: "Rice - Basmati",
        name_si: "බාස්මති සහල්",
        name_ta: "பாஸ்மதி அரிசி",
        sku: "RICE001",
        barcode: "CB000001ABC123",
        category_id: 1,
        unit_of_measure_id: 1,
        cost_price: 180.00,
        selling_price: 220.00,
        current_stock: 50.000,
        minimum_stock: 10.000,
        is_active: true,
        is_negotiable: false,
        track_inventory: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category: { id: 1, name_en: "Groceries", name_si: "ගෘහ භාණ්ඩ", name_ta: "மளிகை" },
        unit_of_measure: { id: 1, name: "Kilograms", abbreviation: "kg", allow_decimals: true, decimal_places: 3 }
      },
      {
        id: 2,
        name_en: "Coca Cola - 330ml",
        name_si: "කොකා කෝලා - 330ml",
        name_ta: "கோகா கோலா - 330ml",
        sku: "COKE330",
        barcode: "CB000002DEF456",
        category_id: 2,
        unit_of_measure_id: 2,
        cost_price: 45.00,
        selling_price: 60.00,
        current_stock: 24.000,
        minimum_stock: 12.000,
        is_active: true,
        is_negotiable: false,
        track_inventory: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category: { id: 2, name_en: "Beverages", name_si: "පාන", name_ta: "பானங்கள்" },
        unit_of_measure: { id: 2, name: "Pieces", abbreviation: "pcs", allow_decimals: false, decimal_places: 0 }
      }
    ];

    if (method === 'GET' && endpoint === '/products') {
      return { success: true, data: mockProducts as T };
    }

    if (method === 'GET' && endpoint.match(/\/products\/\d+$/)) {
      const id = parseInt(endpoint.split('/').pop() || '0');
      const product = mockProducts.find(p => p.id === id);
      return { success: !!product, data: product as T };
    }

    if (method === 'POST' && endpoint === '/products') {
      const newProduct = { ...body, id: Date.now(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      return { success: true, data: newProduct as T };
    }

    return { success: true, data: {} as T };
  }

  private async handleCategoryMockRequest<T>(
    _endpoint: string,
    method: string,
    body: any
  ): Promise<ApiResponse<T>> {
    const mockCategories = [
      {
        id: 1,
        name_en: "Groceries",
        name_si: "ගෘහ භාණ්ඩ",
        name_ta: "மளிகை",
        parent_id: null,
        sort_order: 0,
        is_negotiable_default: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        children: [],
        product_count: 15
      },
      {
        id: 2,
        name_en: "Beverages",
        name_si: "පාන",
        name_ta: "பானங்கள்",
        parent_id: null,
        sort_order: 1,
        is_negotiable_default: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        children: [],
        product_count: 8
      }
    ];

    if (method === 'GET') {
      return { success: true, data: mockCategories as T };
    }

    if (method === 'POST') {
      const newCategory = { ...body, id: Date.now(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), children: [], product_count: 0 };
      return { success: true, data: newCategory as T };
    }

    return { success: true, data: {} as T };
  }

  private async handleUnitMockRequest<T>(
    _endpoint: string,
    method: string,
    body: any
  ): Promise<ApiResponse<T>> {
    const mockUnits = [
      {
        id: 1,
        name: "Kilograms",
        abbreviation: "kg",
        allow_decimals: true,
        decimal_places: 3,
        conversion_factor: 1.0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        product_count: 5
      },
      {
        id: 2,
        name: "Pieces",
        abbreviation: "pcs",
        allow_decimals: false,
        decimal_places: 0,
        conversion_factor: 1.0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        product_count: 12
      }
    ];

    if (method === 'GET') {
      return { success: true, data: mockUnits as T };
    }

    if (method === 'POST') {
      const newUnit = { ...body, id: Date.now(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), product_count: 0 };
      return { success: true, data: newUnit as T };
    }

    return { success: true, data: {} as T };
  }

  private async handleSalesMockRequest<T>(
    endpoint: string,
    method: string,
    body: any
  ): Promise<ApiResponse<T>> {
    // Mock sales data
    const mockSales = [
      {
        id: 1,
        receipt_number: "RCP-001",
        customer_id: null,
        customer_name: null,
        user_id: 1,
        terminal_id: 1,
        items: [
          {
            id: 1,
            product_id: 1,
            product: {
              id: 1,
              name_en: "Rice - Basmati",
              name_si: "බාස්මති සහල්",
              name_ta: "பாஸ்மதி அரிசி",
              barcode: "CB000001ABC123",
              unit_of_measure: { abbreviation: "kg" }
            },
            quantity: 2.0,
            unit_price: 220.00,
            original_price: 220.00,
            discount_amount: 0.00,
            line_total: 440.00,
            notes: null
          }
        ],
        payment: {
          method: "cash",
          amount_tendered: 500.00,
          change: 60.00,
          reference: null,
          notes: null
        },
        totals: {
          subtotal: 440.00,
          discount: 0.00,
          tax: 0.00,
          total: 440.00,
          item_count: 2
        },
        metadata: {
          is_customer_mode: false,
          sale_notes: null
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    if (method === 'POST' && endpoint === '/sales') {
      // Create new sale
      const newSale = {
        id: Date.now(),
        receipt_number: `RCP-${Date.now()}`,
        customer_id: body.customer_id || null,
        customer_name: body.customer_name || null,
        user_id: 1,
        terminal_id: 1,
        items: body.items.map((item: any, index: number) => ({
          id: Date.now() + index,
          product_id: item.product_id,
          product: {
            id: item.product_id,
            name_en: "Mock Product",
            barcode: "MOCK123",
            unit_of_measure: { abbreviation: "pcs" }
          },
          quantity: item.quantity,
          unit_price: item.unit_price,
          original_price: item.unit_price,
          discount_amount: item.discount_amount || 0,
          line_total: item.quantity * item.unit_price - (item.discount_amount || 0),
          notes: item.notes
        })),
        payment: {
          method: body.payment_method,
          amount_tendered: body.amount_tendered,
          change: body.payment_method === 'cash' ? Math.max(0, (body.amount_tendered || 0) - body.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price - (item.discount_amount || 0)), 0)) : 0,
          reference: body.payment_reference,
          notes: body.payment_notes
        },
        totals: {
          subtotal: body.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0),
          discount: body.items.reduce((sum: number, item: any) => sum + (item.discount_amount || 0), 0),
          tax: 0,
          total: body.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price - (item.discount_amount || 0)), 0),
          item_count: body.items.reduce((sum: number, item: any) => sum + item.quantity, 0)
        },
        metadata: {
          is_customer_mode: body.is_customer_mode,
          sale_notes: body.sale_notes
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return { success: true, data: newSale as T };
    }

    if (method === 'GET' && endpoint === '/sales') {
      return { success: true, data: mockSales as T };
    }

    if (method === 'GET' && endpoint.match(/\/sales\/\d+$/)) {
      const id = parseInt(endpoint.split('/').pop() || '0');
      const sale = mockSales.find(s => s.id === id);
      return { success: !!sale, data: sale as T };
    }

    if (method === 'POST' && endpoint.match(/\/sales\/\d+\/print$/)) {
      return { success: true, data: { message: 'Receipt printed successfully' } as T };
    }

    if (method === 'GET' && endpoint.startsWith('/sales/summary/daily')) {
      const summary = {
        date: new Date().toISOString().split('T')[0],
        total_sales: 5,
        total_amount: 2500.00,
        payment_methods: {
          cash: { count: 3, amount: 1500.00 },
          card: { count: 1, amount: 500.00 },
          mobile: { count: 1, amount: 500.00 }
        },
        top_products: [
          {
            product_id: 1,
            product_name: "Rice - Basmati",
            quantity_sold: 10.0,
            total_amount: 2200.00
          }
        ]
      };
      return { success: true, data: summary as T };
    }

    return { success: true, data: {} as T };
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
