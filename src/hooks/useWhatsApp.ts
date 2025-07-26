/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                   WhatsApp Integration Hook                                      │
 * │                                                                                                  │
 * │  Description: React hook for WhatsApp integration functionality                                 │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                  │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import { useState, useEffect, useCallback } from 'react';
import { whatsappApi } from '@/api/whatsapp.api';
import type { WhatsAppConfig } from '@/types/api';

export const useWhatsApp = () => {
  const [config, setConfig] = useState<WhatsAppConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  // Load WhatsApp configuration
  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      const response = await whatsappApi.getConfig();
      
      if (response.success && response.data) {
        setConfig(response.data);
        setIsConfigured(true);
      } else {
        setConfig(null);
        setIsConfigured(false);
      }
    } catch (error) {
      console.error('Error loading WhatsApp config:', error);
      setConfig(null);
      setIsConfigured(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Send receipt via WhatsApp
  const sendReceipt = useCallback(async (saleId: number, phone?: string) => {
    if (!isConfigured) {
      return { success: false, error: 'WhatsApp not configured' };
    }

    try {
      const response = await whatsappApi.sendReceipt(saleId, phone);
      return response;
    } catch (error) {
      console.error('Error sending WhatsApp receipt:', error);
      return { success: false, error: 'Failed to send receipt' };
    }
  }, [isConfigured]);

  // Send customer reminder
  const sendReminder = useCallback(async (customerId: number, template?: string) => {
    if (!isConfigured) {
      return { success: false, error: 'WhatsApp not configured' };
    }

    try {
      const response = await whatsappApi.sendReminder(customerId, template);
      return response;
    } catch (error) {
      console.error('Error sending WhatsApp reminder:', error);
      return { success: false, error: 'Failed to send reminder' };
    }
  }, [isConfigured]);

  // Send daily report
  const sendDailyReport = useCallback(async (reportDate?: string) => {
    if (!isConfigured) {
      return { success: false, error: 'WhatsApp not configured' };
    }

    try {
      const response = await whatsappApi.sendDailyReport(reportDate);
      return response;
    } catch (error) {
      console.error('Error sending daily report:', error);
      return { success: false, error: 'Failed to send daily report' };
    }
  }, [isConfigured]);

  // Send bulk message
  const sendBulkMessage = useCallback(async (message: string, area?: string, village?: string) => {
    if (!isConfigured) {
      return { success: false, error: 'WhatsApp not configured' };
    }

    try {
      const response = await whatsappApi.sendBulkMessage({
        message,
        area_filter: area,
        village_filter: village,
      });
      return response;
    } catch (error) {
      console.error('Error sending bulk message:', error);
      return { success: false, error: 'Failed to send bulk message' };
    }
  }, [isConfigured]);

  // Test WhatsApp connection
  const testConnection = useCallback(async () => {
    try {
      const response = await whatsappApi.testConnection();
      return response;
    } catch (error) {
      console.error('Error testing WhatsApp connection:', error);
      return { success: false, error: 'Failed to test connection' };
    }
  }, []);

  // Check if auto-send receipts is enabled
  const shouldAutoSendReceipts = useCallback(() => {
    return config?.auto_send_receipts || false;
  }, [config]);

  // Check if daily reports are enabled
  const isDailyReportsEnabled = useCallback(() => {
    return config?.daily_reports_enabled || false;
  }, [config]);

  // Check if customer reminders are enabled
  const isCustomerRemindersEnabled = useCallback(() => {
    return config?.customer_reminders_enabled || false;
  }, [config]);

  return {
    config,
    loading,
    isConfigured,
    loadConfig,
    sendReceipt,
    sendReminder,
    sendDailyReport,
    sendBulkMessage,
    testConnection,
    shouldAutoSendReceipts,
    isDailyReportsEnabled,
    isCustomerRemindersEnabled,
  };
};