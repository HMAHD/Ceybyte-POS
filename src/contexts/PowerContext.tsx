/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                    Power Management Context                                      │
 * │                                                                                                  │
 * │  Description: React context for power management, UPS monitoring, and transaction auto-save.     │
 * │               Provides real-time power status and safe mode functionality.                       │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { message } from 'antd';
import { useTranslation } from '@/hooks/useTranslation';

export interface UPSInfo {
  status: 'online' | 'on_battery' | 'low_battery' | 'critical' | 'not_detected';
  batteryLevel: number;
  estimatedRuntime: number;
  voltage: number;
  model: string;
  isCharging: boolean;
  lastUpdate: string;
  safeMode: boolean;
  monitoringActive: boolean;
}

export interface TransactionState {
  sessionId: string;
  transactionData: any;
  transactionType: string;
  customerId?: number;
  lastAction?: string;
}

export interface PowerContextType {
  upsInfo: UPSInfo;
  safeMode: boolean;
  isMonitoring: boolean;
  startMonitoring: () => Promise<void>;
  stopMonitoring: () => Promise<void>;
  saveTransactionState: (state: TransactionState) => Promise<void>;
  getPendingTransactions: () => Promise<TransactionState[]>;
  markTransactionRecovered: (sessionId: string, successful: boolean, notes?: string) => Promise<void>;
  refreshUPSStatus: () => Promise<void>;
}

const PowerContext = createContext<PowerContextType | undefined>(undefined);

export const usePower = () => {
  const context = useContext(PowerContext);
  if (context === undefined) {
    throw new Error('usePower must be used within a PowerProvider');
  }
  return context;
};

interface PowerProviderProps {
  children: React.ReactNode;
}

export const PowerProvider: React.FC<PowerProviderProps> = ({ children }) => {
  const { t } = useTranslation();
  const [upsInfo, setUpsInfo] = useState<UPSInfo>({
    status: 'not_detected',
    batteryLevel: 0,
    estimatedRuntime: 0,
    voltage: 0,
    model: '',
    isCharging: false,
    lastUpdate: new Date().toISOString(),
    safeMode: false,
    monitoringActive: false,
  });
  
  const [safeMode, setSafeMode] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const monitoringIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // API call helper
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000${endpoint}`, {
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
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  };

  // Refresh UPS status from backend
  const refreshUPSStatus = useCallback(async () => {
    try {
      const response = await apiCall('/api/power/ups/status');
      if (response.success) {
        const newUpsInfo: UPSInfo = {
          status: response.data.status,
          batteryLevel: response.data.battery_level,
          estimatedRuntime: response.data.estimated_runtime,
          voltage: response.data.voltage,
          model: response.data.model,
          isCharging: response.data.is_charging,
          lastUpdate: response.data.last_update,
          safeMode: response.data.safe_mode_active,
          monitoringActive: response.data.monitoring_active,
        };
        
        setUpsInfo(newUpsInfo);
        setSafeMode(response.data.safe_mode_active);
        
        // Show safe mode notifications
        if (response.data.safe_mode_active && !safeMode) {
          message.warning(t('power.safeModeActivated', 'Safe mode activated - Low battery detected'));
        } else if (!response.data.safe_mode_active && safeMode) {
          message.success(t('power.safeModeDeactivated', 'Safe mode deactivated - Power restored'));
        }
      }
    } catch (error) {
      console.error('Failed to refresh UPS status:', error);
      // Set offline status on error
      setUpsInfo(prev => ({
        ...prev,
        status: 'not_detected',
        monitoringActive: false,
      }));
    }
  }, [safeMode, t]);

  // Start power monitoring
  const startMonitoring = useCallback(async () => {
    try {
      const response = await apiCall('/api/power/monitoring/start', {
        method: 'POST',
      });
      
      if (response.success) {
        setIsMonitoring(true);
        
        // Start periodic status updates
        if (monitoringIntervalRef.current) {
          clearInterval(monitoringIntervalRef.current);
        }
        
        monitoringIntervalRef.current = setInterval(refreshUPSStatus, 30000); // Every 30 seconds
        
        // Initial status check
        await refreshUPSStatus();
        
        message.success(t('power.monitoringStarted', 'Power monitoring started'));
      }
    } catch (error) {
      console.error('Failed to start power monitoring:', error);
      message.error(t('power.monitoringStartFailed', 'Failed to start power monitoring'));
    }
  }, [refreshUPSStatus, t]);

  // Stop power monitoring
  const stopMonitoring = useCallback(async () => {
    try {
      const response = await apiCall('/api/power/monitoring/stop', {
        method: 'POST',
      });
      
      if (response.success) {
        setIsMonitoring(false);
        
        // Clear intervals
        if (monitoringIntervalRef.current) {
          clearInterval(monitoringIntervalRef.current);
          monitoringIntervalRef.current = null;
        }
        
        if (autoSaveIntervalRef.current) {
          clearInterval(autoSaveIntervalRef.current);
          autoSaveIntervalRef.current = null;
        }
        
        message.info(t('power.monitoringStopped', 'Power monitoring stopped'));
      }
    } catch (error) {
      console.error('Failed to stop power monitoring:', error);
      message.error(t('power.monitoringStopFailed', 'Failed to stop power monitoring'));
    }
  }, [t]);

  // Save transaction state for recovery
  const saveTransactionState = useCallback(async (state: TransactionState) => {
    try {
      const response = await apiCall('/api/power/transaction/save', {
        method: 'POST',
        body: JSON.stringify({
          session_id: state.sessionId,
          transaction_data: state.transactionData,
          transaction_type: state.transactionType,
          customer_id: state.customerId,
          last_action: state.lastAction,
        }),
      });
      
      if (!response.success) {
        console.error('Failed to save transaction state:', response.error);
      }
    } catch (error) {
      console.error('Error saving transaction state:', error);
    }
  }, []);

  // Get pending transactions for recovery
  const getPendingTransactions = useCallback(async (): Promise<TransactionState[]> => {
    try {
      const response = await apiCall('/api/power/transaction/pending');
      
      if (response.success) {
        return response.data.map((item: any) => ({
          sessionId: item.session_id,
          transactionData: item.transaction_data,
          transactionType: item.transaction_type,
          customerId: item.customer_id,
          lastAction: item.last_action,
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error getting pending transactions:', error);
      return [];
    }
  }, []);

  // Mark transaction as recovered
  const markTransactionRecovered = useCallback(async (sessionId: string, successful: boolean, notes?: string) => {
    try {
      const response = await apiCall('/api/power/transaction/recover', {
        method: 'POST',
        body: JSON.stringify({
          session_id: sessionId,
          successful,
          notes,
        }),
      });
      
      if (response.success) {
        message.success(t('power.transactionRecovered', 'Transaction recovery completed'));
      }
    } catch (error) {
      console.error('Error marking transaction as recovered:', error);
      message.error(t('power.transactionRecoveryFailed', 'Failed to mark transaction as recovered'));
    }
  }, [t]);

  // Auto-save current transaction state
  const autoSaveCurrentTransaction = useCallback(() => {
    // This would be called by components that have active transactions
    // For now, we'll implement a basic version that saves to localStorage as backup
    try {
      const currentTransaction = localStorage.getItem('currentTransaction');
      if (currentTransaction) {
        const transactionData = JSON.parse(currentTransaction);
        const state: TransactionState = {
          sessionId: `session_${Date.now()}`,
          transactionData,
          transactionType: 'sale',
          lastAction: 'auto_save',
        };
        
        saveTransactionState(state);
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [saveTransactionState]);

  // Initialize power monitoring on mount
  useEffect(() => {
    startMonitoring();
    
    return () => {
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
      }
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [startMonitoring]);

  // Set up auto-save when monitoring is active
  useEffect(() => {
    if (isMonitoring) {
      // Auto-save every 10 seconds when monitoring is active
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
      
      autoSaveIntervalRef.current = setInterval(autoSaveCurrentTransaction, 10000);
    } else {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
        autoSaveIntervalRef.current = null;
      }
    }
    
    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [isMonitoring, autoSaveCurrentTransaction]);

  const contextValue: PowerContextType = {
    upsInfo,
    safeMode,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    saveTransactionState,
    getPendingTransactions,
    markTransactionRecovered,
    refreshUPSStatus,
  };

  return (
    <PowerContext.Provider value={contextValue}>
      {children}
    </PowerContext.Provider>
  );
};

export default PowerProvider;