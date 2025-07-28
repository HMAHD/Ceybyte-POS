/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                  Power Management Hook                                           │
 * │                                                                                                  │
 * │  Description: Custom hook for power management features including auto-save and safe mode.       │
 * │               Provides utilities for transaction state management during power events.           │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import { useCallback, useEffect, useRef } from 'react';
import { usePower, TransactionState } from '@/contexts/PowerContext';

interface AutoSaveOptions {
  sessionId: string;
  transactionType: 'sale' | 'return' | 'hold';
  customerId?: number;
  interval?: number; // milliseconds, default 5000 (5 seconds)
  enabled?: boolean;
}

interface UsePowerManagementReturn {
  autoSave: (data: any, lastAction?: string) => void;
  startAutoSave: (options: AutoSaveOptions) => void;
  stopAutoSave: () => void;
  saveNow: (data: any, lastAction?: string) => Promise<void>;
  safeMode: boolean;
  canStartNewTransaction: boolean;
  upsStatus: string;
  batteryLevel: number;
}

export const usePowerManagement = (): UsePowerManagementReturn => {
  const { saveTransactionState, safeMode, upsInfo } = usePower();
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveOptionsRef = useRef<AutoSaveOptions | null>(null);
  const lastSaveDataRef = useRef<string>('');

  // Auto-save function
  const autoSave = useCallback((data: any, lastAction?: string) => {
    if (!autoSaveOptionsRef.current) return;

    const options = autoSaveOptionsRef.current;
    
    // Only save if data has changed to avoid unnecessary saves
    const dataString = JSON.stringify(data);
    if (dataString === lastSaveDataRef.current) return;
    
    lastSaveDataRef.current = dataString;

    const transactionState: TransactionState = {
      sessionId: options.sessionId,
      transactionData: data,
      transactionType: options.transactionType,
      customerId: options.customerId,
      lastAction: lastAction || 'auto_save',
    };

    saveTransactionState(transactionState).catch(error => {
      console.error('Auto-save failed:', error);
    });
  }, [saveTransactionState]);

  // Save immediately
  const saveNow = useCallback(async (data: any, lastAction?: string) => {
    if (!autoSaveOptionsRef.current) return;

    const options = autoSaveOptionsRef.current;
    const transactionState: TransactionState = {
      sessionId: options.sessionId,
      transactionData: data,
      transactionType: options.transactionType,
      customerId: options.customerId,
      lastAction: lastAction || 'manual_save',
    };

    try {
      await saveTransactionState(transactionState);
      lastSaveDataRef.current = JSON.stringify(data);
    } catch (error) {
      console.error('Manual save failed:', error);
      throw error;
    }
  }, [saveTransactionState]);

  // Start auto-save with options
  const startAutoSave = useCallback((options: AutoSaveOptions) => {
    // Stop existing auto-save if running
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
    }

    autoSaveOptionsRef.current = options;

    if (options.enabled !== false) {
      const interval = options.interval || 5000; // Default 5 seconds
      
      autoSaveIntervalRef.current = setInterval(() => {
        // Auto-save will be triggered by components calling autoSave()
        // This interval just ensures we have a heartbeat for monitoring
      }, interval);
    }
  }, []);

  // Stop auto-save
  const stopAutoSave = useCallback(() => {
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
      autoSaveIntervalRef.current = null;
    }
    autoSaveOptionsRef.current = null;
    lastSaveDataRef.current = '';
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, []);

  // Determine if new transactions can be started
  const canStartNewTransaction = !safeMode && upsInfo.status !== 'critical';

  return {
    autoSave,
    startAutoSave,
    stopAutoSave,
    saveNow,
    safeMode,
    canStartNewTransaction,
    upsStatus: upsInfo.status,
    batteryLevel: upsInfo.batteryLevel,
  };
};

export default usePowerManagement;