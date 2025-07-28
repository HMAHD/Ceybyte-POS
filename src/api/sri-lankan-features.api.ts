/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                              Sri Lankan Features API Client                                      │
 * │                                                                                                  │
 * │  Description: Frontend API client for Sri Lankan specific business features including           │
 * │               festival calendar, VAT calculations, mobile payments, and delivery tracking.      │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

// API Base URL
const API_BASE_URL = '/api/sri-lankan';

// Types
export interface Festival {
  id: number;
  name: string;
  name_si?: string;
  name_ta?: string;
  date: string;
  type: string;
  category?: string;
  is_public_holiday: boolean;
  is_poya_day: boolean;
  expected_sales_impact?: string;
  greeting_message_en?: string;
  greeting_message_si?: string;
  greeting_message_ta?: string;
  days_until: number;
}

export interface Delivery {
  id: number;
  delivery_number: string;
  sale_id: number;
  customer_id: number;
  scheduled_date: string;
  delivery_address: string;
  delivery_area?: string;
  driver_name?: string;
  vehicle_number?: string;
  status: string;
  delivery_fee: number;
}

export interface VATCalculation {
  subtotal: number;
  vat_amount: number;
  total: number;
  vat_rate: number;
}

export interface MobilePaymentProvider {
  id: string;
  name: string;
  name_si?: string;
  name_ta?: string;
  logo_url?: string;
  is_active: boolean;
  fee_percentage: number;
  min_amount: number;
  max_amount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Festival Calendar API
export const getFestivals = async (params?: {
  year?: number;
  upcoming_days?: number;
  type?: string;
}): Promise<ApiResponse<Festival[]>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.year) queryParams.append('year', params.year.toString());
    if (params?.upcoming_days) queryParams.append('upcoming_days', params.upcoming_days.toString());
    if (params?.type) queryParams.append('type', params.type);

    const response = await fetch(`${API_BASE_URL}/festivals?${queryParams}`);
    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.detail || 'Failed to fetch festivals' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching festivals:', error);
    return { success: false, error: 'Network error while fetching festivals' };
  }
};

export const getTodaysFestivals = async (): Promise<ApiResponse<Festival[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/festivals/today`);
    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.detail || 'Failed to fetch today\'s festivals' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching today\'s festivals:', error);
    return { success: false, error: 'Network error while fetching today\'s festivals' };
  }
};

export const getPoyaDays = async (year?: number): Promise<ApiResponse<Festival[]>> => {
  try {
    const queryParams = new URLSearchParams();
    if (year) queryParams.append('year', year.toString());

    const response = await fetch(`${API_BASE_URL}/festivals/poya-days?${queryParams}`);
    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.detail || 'Failed to fetch Poya days' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching Poya days:', error);
    return { success: false, error: 'Network error while fetching Poya days' };
  }
};

export const initializeFestivalsForYear = async (year: number): Promise<ApiResponse<{
  message: string;
  year: number;
  festivals_created?: number;
  existing_count?: number;
  action: 'created' | 'skipped';
}>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/festivals/initialize-year/${year}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.detail || 'Failed to initialize festivals' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error initializing festivals:', error);
    return { success: false, error: 'Network error while initializing festivals' };
  }
};

export const autoUpdateFestivals = async (): Promise<ApiResponse<{
  message: string;
  results: Array<{
    year: number;
    action: 'created' | 'exists';
    count: number;
  }>;
  timestamp: string;
}>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/festivals/auto-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.detail || 'Failed to auto-update festivals' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error auto-updating festivals:', error);
    return { success: false, error: 'Network error while auto-updating festivals' };
  }
};

// Business Day Check
export const checkBusinessDay = async (date?: string): Promise<ApiResponse<{
  date: string;
  is_business_day: boolean;
  is_weekend: boolean;
  day_of_week: string;
}>> => {
  try {
    const queryParams = new URLSearchParams();
    if (date) queryParams.append('check_date', date);

    const response = await fetch(`${API_BASE_URL}/business-day-check?${queryParams}`);
    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.detail || 'Failed to check business day' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error checking business day:', error);
    return { success: false, error: 'Network error while checking business day' };
  }
};

// VAT Calculation API
export const calculateVAT = async (amount: number, vatRate: number = 18.0): Promise<ApiResponse<VATCalculation>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/vat/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        vat_rate: vatRate,
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.detail || 'Failed to calculate VAT' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error calculating VAT:', error);
    return { success: false, error: 'Network error while calculating VAT' };
  }
};

export const getVATRates = async (): Promise<ApiResponse<{
  standard_rate: number;
  reduced_rates: Array<{
    category: string;
    rate: number;
  }>;
  effective_date: string;
  currency: string;
}>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/vat/rates`);
    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.detail || 'Failed to fetch VAT rates' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching VAT rates:', error);
    return { success: false, error: 'Network error while fetching VAT rates' };
  }
};

// Mobile Payment Providers
export const getMobilePaymentProviders = async (): Promise<ApiResponse<MobilePaymentProvider[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/mobile-payments/providers`);
    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.detail || 'Failed to fetch payment providers' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching payment providers:', error);
    return { success: false, error: 'Network error while fetching payment providers' };
  }
};

// Delivery Tracking API
export const createDelivery = async (deliveryData: {
  sale_id: number;
  customer_id: number;
  scheduled_date: string;
  delivery_address: string;
  delivery_area?: string;
  delivery_village?: string;
  contact_person?: string;
  contact_phone?: string;
  driver_name?: string;
  driver_phone?: string;
  vehicle_number?: string;
  vehicle_type?: string;
  delivery_fee?: number;
  special_instructions?: string;
}): Promise<ApiResponse<Delivery>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/deliveries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deliveryData),
    });
    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.detail || 'Failed to create delivery' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error creating delivery:', error);
    return { success: false, error: 'Network error while creating delivery' };
  }
};

export const getDeliveries = async (params?: {
  status?: string;
  area?: string;
  date_from?: string;
  date_to?: string;
}): Promise<ApiResponse<Delivery[]>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.area) queryParams.append('area', params.area);
    if (params?.date_from) queryParams.append('date_from', params.date_from);
    if (params?.date_to) queryParams.append('date_to', params.date_to);

    const response = await fetch(`${API_BASE_URL}/deliveries?${queryParams}`);
    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.detail || 'Failed to fetch deliveries' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching deliveries:', error);
    return { success: false, error: 'Network error while fetching deliveries' };
  }
};

export const updateDeliveryStatus = async (deliveryId: number, status: string): Promise<ApiResponse<{
  message: string;
  status: string;
}>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/deliveries/${deliveryId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.detail || 'Failed to update delivery status' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error updating delivery status:', error);
    return { success: false, error: 'Network error while updating delivery status' };
  }
};

// Customer Area Management
export const getCustomerAreas = async (): Promise<ApiResponse<{ areas: string[] }>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/customers/areas`);
    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.detail || 'Failed to fetch customer areas' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching customer areas:', error);
    return { success: false, error: 'Network error while fetching customer areas' };
  }
};

export const getCustomersByArea = async (area: string): Promise<ApiResponse<Array<{
  id: number;
  name: string;
  phone?: string;
  address?: string;
  current_balance: number;
  credit_limit: number;
}>>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/customers/by-area/${encodeURIComponent(area)}`);
    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.detail || 'Failed to fetch customers by area' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching customers by area:', error);
    return { success: false, error: 'Network error while fetching customers by area' };
  }
};

// Festival Notifications and Greetings
export const getFestivalReminders = async (): Promise<ApiResponse<{
  reminders: Array<{
    festival_id: number;
    festival_name: string;
    date: string;
    days_until: number;
    type: string;
    message: string;
    expected_impact?: string;
  }>;
}>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/festival-reminders`);
    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.detail || 'Failed to fetch festival reminders' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching festival reminders:', error);
    return { success: false, error: 'Network error while fetching festival reminders' };
  }
};

export const getFestivalGreeting = async (
  festivalId: number,
  language: 'en' | 'si' | 'ta' = 'en'
): Promise<ApiResponse<{
  festival_name: string;
  greeting_message: string;
  language: string;
  date: string;
}>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/greetings/festival/${festivalId}?language=${language}`);
    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.detail || 'Failed to fetch festival greeting' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching festival greeting:', error);
    return { success: false, error: 'Network error while fetching festival greeting' };
  }
};