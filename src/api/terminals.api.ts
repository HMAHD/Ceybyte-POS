/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                    Terminal API Client                                           │
 * │                                                                                                  │
 * │  Description: API client for terminal management, network discovery,                             │
 * │               and multi-terminal synchronization operations.                                     │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import type {
  Terminal,
  TerminalConfig,
  TerminalUpdate,
  SyncRequest,
  NetworkTestRequest,
  TerminalDiscoveryResult,
  InitializeTerminalResponse,
  GetTerminalResponse,
  SyncTerminalResponse,
  NetworkTestResponse,
  DiagnosticsResponse,
  OfflineDataResponse,
  TerminalApiResponse,
  SyncStatusInfo,
} from '@/types/terminal';

const API_BASE_URL = 'http://localhost:8000/api/terminals';

// Helper function for API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
}

// Terminal management APIs
export const initializeTerminal = async (
  config: TerminalConfig
): Promise<InitializeTerminalResponse> => {
  return apiRequest<InitializeTerminalResponse>('/initialize', {
    method: 'POST',
    body: JSON.stringify(config),
  });
};

export const discoverTerminals = async (): Promise<TerminalDiscoveryResult> => {
  return apiRequest<TerminalDiscoveryResult>('/discover');
};

export const getTerminal = async (
  terminalId: string
): Promise<GetTerminalResponse> => {
  return apiRequest<GetTerminalResponse>(`/${terminalId}`);
};

export const updateTerminal = async (
  terminalId: string,
  updateData: TerminalUpdate
): Promise<TerminalApiResponse> => {
  return apiRequest<TerminalApiResponse>(`/${terminalId}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  });
};

export const removeTerminal = async (
  terminalId: string
): Promise<TerminalApiResponse> => {
  return apiRequest<TerminalApiResponse>(`/${terminalId}`, {
    method: 'DELETE',
  });
};

// Network and connectivity APIs
export const sendHeartbeat = async (): Promise<TerminalApiResponse> => {
  return apiRequest<TerminalApiResponse>('/heartbeat', {
    method: 'POST',
  });
};

export const testNetworkConnectivity = async (
  request: NetworkTestRequest
): Promise<NetworkTestResponse> => {
  return apiRequest<NetworkTestResponse>('/test-network', {
    method: 'POST',
    body: JSON.stringify(request),
  });
};

export const runNetworkDiagnostics = async (): Promise<DiagnosticsResponse> => {
  return apiRequest<DiagnosticsResponse>('/diagnostics/network');
};

// Synchronization APIs
export const syncTerminalData = async (
  terminalId: string,
  forceSync: boolean = false
): Promise<SyncTerminalResponse> => {
  const request: SyncRequest = {
    terminal_id: terminalId,
    force_sync: forceSync,
  };

  return apiRequest<SyncTerminalResponse>('/sync', {
    method: 'POST',
    body: JSON.stringify(request),
  });
};

export const getSyncStatus = async (
  terminalId: string
): Promise<{ success: boolean; sync_status: SyncStatusInfo }> => {
  return apiRequest<{ success: boolean; sync_status: SyncStatusInfo }>(
    `/${terminalId}/sync-status`
  );
};

// Offline cache APIs
export const initializeOfflineCache = async (): Promise<TerminalApiResponse> => {
  return apiRequest<TerminalApiResponse>('/offline-cache/initialize', {
    method: 'POST',
  });
};

export const getOfflineData = async (
  tableName: string
): Promise<OfflineDataResponse> => {
  return apiRequest<OfflineDataResponse>(`/offline-cache/${tableName}`);
};

// Utility functions for terminal management
export const isTerminalOnline = (terminal: Terminal): boolean => {
  return terminal.status === 'online' && terminal.is_online;
};

export const needsSync = (terminal: Terminal): boolean => {
  return (
    terminal.sync_status === 'pending' ||
    terminal.sync_status === 'failed' ||
    terminal.pending_sync_count > 0
  );
};

export const getTerminalStatusColor = (status: string): string => {
  switch (status) {
    case 'online':
      return 'green';
    case 'offline':
      return 'red';
    case 'maintenance':
      return 'orange';
    case 'error':
      return 'red';
    default:
      return 'default';
  }
};

export const getSyncStatusColor = (status: string): string => {
  switch (status) {
    case 'synced':
      return 'green';
    case 'pending':
      return 'orange';
    case 'failed':
      return 'red';
    case 'conflict':
      return 'purple';
    default:
      return 'default';
  }
};

// Terminal monitoring utilities
export const startHeartbeatMonitor = (intervalMs: number = 30000): number => {
  return window.setInterval(async () => {
    try {
      await sendHeartbeat();
    } catch (error) {
      console.error('Heartbeat failed:', error);
    }
  }, intervalMs);
};

export const stopHeartbeatMonitor = (intervalId: number): void => {
  clearInterval(intervalId);
};

// Network connectivity monitoring
export const monitorNetworkConnectivity = async (
  networkPath?: string,
  terminalType: string = 'client'
): Promise<boolean> => {
  try {
    const response = await testNetworkConnectivity({
      network_path: networkPath,
      terminal_type: terminalType,
    });

    return (
      response.success &&
      response.connectivity.network_available &&
      response.connectivity.main_computer_reachable
    );
  } catch (error) {
    console.error('Network connectivity check failed:', error);
    return false;
  }
};

// Batch operations
export const syncAllTerminals = async (
  terminals: Terminal[],
  forceSync: boolean = false
): Promise<{ success: number; failed: number; results: any[] }> => {
  const results = [];
  let success = 0;
  let failed = 0;

  for (const terminal of terminals) {
    try {
      const result = await syncTerminalData(terminal.terminal_id, forceSync);
      if (result.success) {
        success++;
      } else {
        failed++;
      }
      results.push({ terminal_id: terminal.terminal_id, result });
    } catch (error) {
      failed++;
      results.push({
        terminal_id: terminal.terminal_id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return { success, failed, results };
};

// Terminal configuration helpers
export const generateTerminalId = (type: string = 'pos'): string => {
  const prefix = type.toUpperCase();
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

export const validateTerminalConfig = (
  config: TerminalConfig
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!config.terminal_name || config.terminal_name.trim().length < 3) {
    errors.push('Terminal name must be at least 3 characters long');
  }

  if (!config.terminal_type || !['pos', 'admin', 'mobile'].includes(config.terminal_type)) {
    errors.push('Invalid terminal type');
  }

  if (!config.app_version) {
    errors.push('App version is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// Error handling utilities
export const handleTerminalApiError = (error: any): string => {
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

// Local storage utilities for terminal configuration
const TERMINAL_CONFIG_KEY = 'ceybyte-pos-terminal-config';

export const saveTerminalConfig = (config: TerminalConfig): void => {
  try {
    localStorage.setItem(TERMINAL_CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save terminal config:', error);
  }
};

export const loadTerminalConfig = (): TerminalConfig | null => {
  try {
    const stored = localStorage.getItem(TERMINAL_CONFIG_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to load terminal config:', error);
    return null;
  }
};

export const clearTerminalConfig = (): void => {
  try {
    localStorage.removeItem(TERMINAL_CONFIG_KEY);
  } catch (error) {
    console.error('Failed to clear terminal config:', error);
  }
};