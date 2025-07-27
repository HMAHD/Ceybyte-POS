/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                   Dashboard API Client                                           │
 * │                                                                                                  │
 * │  Description: API client functions for dashboard data including business analytics,             │
 * │               cash flow tracking, alerts, and reporting functionality.                          │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import { apiClient } from './client';
import { ApiResponse } from '@/types/api';

// Dashboard data interfaces
export interface DashboardStats {
  today_sales: number;
  today_costs: number;
  today_profit: number;
  today_transactions: number;
  cash_in_drawer: number;
  pending_receivables: number;
  pending_payables: number;
  low_stock_items: number;
}

export interface CashFlowEntry {
  timestamp: string;
  type: 'sale' | 'payment_received' | 'payment_made' | 'expense';
  amount: number;
  description: string;
  running_balance: number;
}

export interface AlertItem {
  id: string;
  type: 'low_stock' | 'overdue_payment' | 'system' | 'cash_drawer';
  severity: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  action_required: boolean;
  created_at: string;
}

export interface SalesTrend {
  date: string;
  sales_amount: number;
  transaction_count: number;
  profit: number;
}

export interface PaymentMethodBreakdown {
  method: string;
  count: number;
  amount: number;
  percentage: number;
}

export interface TopProduct {
  product_id: number;
  product_name: string;
  quantity_sold: number;
  revenue: number;
  profit: number;
}

export interface CashDrawerStatus {
  opening_balance: number;
  current_balance: number;
  total_cash_sales: number;
  total_cash_received: number;
  total_cash_paid: number;
  last_opened: string;
  is_balanced: boolean;
}

export interface MonthlyReport {
  month: string;
  total_sales: number;
  total_profit: number;
  transaction_count: number;
  average_sale_value: number;
  top_selling_products: TopProduct[];
  payment_breakdown: PaymentMethodBreakdown[];
}

// API functions
export const dashboardApi = {
  // Get main dashboard statistics
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    return apiClient.get<DashboardStats>('/dashboard/stats');
  },

  // Get cash flow entries
  getCashFlow: async (hours: number = 8): Promise<ApiResponse<CashFlowEntry[]>> => {
    return apiClient.get<CashFlowEntry[]>(`/dashboard/cash-flow?hours=${hours}`);
  },

  // Get system alerts
  getAlerts: async (severity?: string): Promise<ApiResponse<AlertItem[]>> => {
    const endpoint = `/dashboard/alerts${severity ? `?severity=${severity}` : ''}`;
    return apiClient.get<AlertItem[]>(endpoint);
  },

  // Get sales trend data
  getSalesTrend: async (days: number = 7): Promise<ApiResponse<SalesTrend[]>> => {
    return apiClient.get<SalesTrend[]>(`/dashboard/sales-trend?days=${days}`);
  },

  // Get cash drawer status
  getCashDrawerStatus: async (): Promise<ApiResponse<CashDrawerStatus>> => {
    return apiClient.get<CashDrawerStatus>('/dashboard/cash-drawer');
  },

  // Open cash drawer
  openCashDrawer: async (openingBalance: number): Promise<ApiResponse<{ message: string; opening_balance: number; opened_at: string }>> => {
    return apiClient.post<{ message: string; opening_balance: number; opened_at: string }>('/dashboard/cash-drawer/open', {
      opening_balance: openingBalance
    });
  },

  // Close cash drawer
  closeCashDrawer: async (closingBalance: number): Promise<ApiResponse<{ 
    message: string; 
    closing_balance: number; 
    expected_balance: number; 
    variance: number; 
    closed_at: string 
  }>> => {
    return apiClient.post('/dashboard/cash-drawer/close', {
      closing_balance: closingBalance
    });
  },

  // Get monthly report
  getMonthlyReport: async (month?: string): Promise<ApiResponse<MonthlyReport>> => {
    const endpoint = `/dashboard/monthly-report${month ? `?month=${month}` : ''}`;
    return apiClient.get<MonthlyReport>(endpoint);
  },

  // Export to Excel
  exportToExcel: async (
    reportType: 'daily' | 'monthly' | 'custom',
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<{ message: string; report_type: string; download_url: string }>> => {
    const params = new URLSearchParams({ report_type: reportType });
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    return apiClient.post<{ message: string; report_type: string; download_url: string }>(
      `/dashboard/export/excel?${params.toString()}`
    );
  }
};

export default dashboardApi;