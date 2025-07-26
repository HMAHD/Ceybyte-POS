/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                   WhatsApp API Client                                            │
 * │                                                                                                  │
 * │  Description: API client for WhatsApp Business integration functionality                        │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                  │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import type { 
  ApiResponse, 
  WhatsAppConfig, 
  WhatsAppMessage, 
  BulkMessageRequest 
} from '@/types/api';

const API_BASE = 'http://127.0.0.1:8000/api/whatsapp';

export const whatsappApi = {
  // Configuration
  async getConfig(): Promise<ApiResponse<WhatsAppConfig | null>> {
    try {
      const response = await fetch(`${API_BASE}/config`);
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.detail || 'Failed to get config' };
      }
    } catch (error) {
      console.error('WhatsApp config fetch error:', error);
      return { success: false, error: 'Network error' };
    }
  },

  async saveConfig(config: Omit<WhatsAppConfig, 'id'>): Promise<ApiResponse<WhatsAppConfig>> {
    try {
      const response = await fetch(`${API_BASE}/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.detail || 'Failed to save config' };
      }
    } catch (error) {
      console.error('WhatsApp config save error:', error);
      return { success: false, error: 'Network error' };
    }
  },

  // Messaging
  async sendReceipt(saleId: number, phone?: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE}/send-receipt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sale_id: saleId,
          phone,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.detail || 'Failed to send receipt' };
      }
    } catch (error) {
      console.error('WhatsApp receipt send error:', error);
      return { success: false, error: 'Network error' };
    }
  },

  async sendDailyReport(reportDate?: string): Promise<ApiResponse<any>> {
    try {
      const url = reportDate 
        ? `${API_BASE}/send-daily-report?report_date=${reportDate}`
        : `${API_BASE}/send-daily-report`;
        
      const response = await fetch(url, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.detail || 'Failed to send daily report' };
      }
    } catch (error) {
      console.error('WhatsApp daily report send error:', error);
      return { success: false, error: 'Network error' };
    }
  },

  async sendReminder(customerId: number, messageTemplate?: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE}/send-reminder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customerId,
          message_template: messageTemplate,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.detail || 'Failed to send reminder' };
      }
    } catch (error) {
      console.error('WhatsApp reminder send error:', error);
      return { success: false, error: 'Network error' };
    }
  },

  async sendBulkMessage(request: BulkMessageRequest): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE}/send-bulk-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.detail || 'Failed to send bulk message' };
      }
    } catch (error) {
      console.error('WhatsApp bulk message send error:', error);
      return { success: false, error: 'Network error' };
    }
  },

  async sendBackupNotification(backupFilePath: string, description?: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE}/send-backup-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          backup_file_path: backupFilePath,
          description,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.detail || 'Failed to send backup notification' };
      }
    } catch (error) {
      console.error('WhatsApp backup notification send error:', error);
      return { success: false, error: 'Network error' };
    }
  },

  // Message history
  async getMessageHistory(customerId?: number, limit: number = 50): Promise<ApiResponse<WhatsAppMessage[]>> {
    try {
      const params = new URLSearchParams();
      if (customerId) params.append('customer_id', customerId.toString());
      params.append('limit', limit.toString());
      
      const response = await fetch(`${API_BASE}/messages?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.detail || 'Failed to get message history' };
      }
    } catch (error) {
      console.error('WhatsApp message history fetch error:', error);
      return { success: false, error: 'Network error' };
    }
  },

  // Customer data for bulk messaging
  async getCustomersWithWhatsApp(area?: string, village?: string): Promise<ApiResponse<any>> {
    try {
      const params = new URLSearchParams();
      if (area) params.append('area', area);
      if (village) params.append('village', village);
      
      const response = await fetch(`${API_BASE}/customers-with-whatsapp?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data: data.customers, message: `${data.total} customers found` };
      } else {
        return { success: false, error: data.detail || 'Failed to get customers' };
      }
    } catch (error) {
      console.error('WhatsApp customers fetch error:', error);
      return { success: false, error: 'Network error' };
    }
  },

  async getAreas(): Promise<ApiResponse<string[]>> {
    try {
      const response = await fetch(`${API_BASE}/areas`);
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data: data.areas };
      } else {
        return { success: false, error: data.detail || 'Failed to get areas' };
      }
    } catch (error) {
      console.error('WhatsApp areas fetch error:', error);
      return { success: false, error: 'Network error' };
    }
  },

  async getVillages(area?: string): Promise<ApiResponse<string[]>> {
    try {
      const params = area ? `?area=${encodeURIComponent(area)}` : '';
      const response = await fetch(`${API_BASE}/villages${params}`);
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data: data.villages };
      } else {
        return { success: false, error: data.detail || 'Failed to get villages' };
      }
    } catch (error) {
      console.error('WhatsApp villages fetch error:', error);
      return { success: false, error: 'Network error' };
    }
  },

  // Test connection
  async testConnection(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE}/test-connection`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.detail || 'Connection test failed' };
      }
    } catch (error) {
      console.error('WhatsApp connection test error:', error);
      return { success: false, error: 'Network error' };
    }
  },
};