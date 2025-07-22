/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                    Network Context Provider                                      │
 * │                                                                                                  │
 * │  Description: React context for managing network configuration state and connection status.     │
 * │               Provides network management functionality across the application.                  │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { NetworkConfiguration, ConnectionStatus, ConnectionTestResult } from '@/types/network';
import { getNetworkConfig, saveNetworkConfig, isFirstRun, testConnection } from '@/utils/networkConfig';

interface NetworkContextType {
  config: NetworkConfiguration;
  isFirstRun: boolean;
  connectionStatus: ConnectionStatus;
  isConnecting: boolean;
  lastConnectionTest: ConnectionTestResult | null;
  updateConfig: (config: NetworkConfiguration) => void;
  testNetworkConnection: () => Promise<ConnectionTestResult>;
  setOfflineMode: (offline: boolean) => void;
  refreshConnectionStatus: () => Promise<void>;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

interface NetworkProviderProps {
  children: ReactNode;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
  const [config, setConfig] = useState<NetworkConfiguration>(getNetworkConfig());
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(config.connectionStatus);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastConnectionTest, setLastConnectionTest] = useState<ConnectionTestResult | null>(null);
  const [firstRun, setFirstRun] = useState(isFirstRun());

  useEffect(() => {
    // Load initial configuration
    const initialConfig = getNetworkConfig();
    setConfig(initialConfig);
    setConnectionStatus(initialConfig.connectionStatus);
    setFirstRun(isFirstRun());

    // Set up periodic connection monitoring for client terminals
    if (initialConfig.terminalType === 'client' && initialConfig.isConfigured && !initialConfig.offlineMode) {
      const interval = setInterval(() => {
        refreshConnectionStatus();
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, []);

  const updateConfig = (newConfig: NetworkConfiguration) => {
    setConfig(newConfig);
    setConnectionStatus(newConfig.connectionStatus);
    saveNetworkConfig(newConfig);
    
    if (newConfig.isConfigured) {
      setFirstRun(false);
    }
  };

  const testNetworkConnection = async (): Promise<ConnectionTestResult> => {
    setIsConnecting(true);
    
    try {
      const result = await testConnection(config);
      setLastConnectionTest(result);
      setConnectionStatus(result.status);
      
      // Update config with new connection status
      const updatedConfig = {
        ...config,
        connectionStatus: result.status,
        lastConnectionTest: result.timestamp,
      };
      updateConfig(updatedConfig);
      
      return result;
    } catch (error) {
      const errorResult: ConnectionTestResult = {
        success: false,
        status: 'error',
        message: 'Connection test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
      
      setLastConnectionTest(errorResult);
      setConnectionStatus('error');
      
      return errorResult;
    } finally {
      setIsConnecting(false);
    }
  };

  const setOfflineMode = (offline: boolean) => {
    const updatedConfig = {
      ...config,
      offlineMode: offline,
      connectionStatus: offline ? 'disconnected' as ConnectionStatus : config.connectionStatus,
    };
    updateConfig(updatedConfig);
  };

  const refreshConnectionStatus = async () => {
    if (config.terminalType === 'client' && config.isConfigured && !config.offlineMode) {
      await testNetworkConnection();
    }
  };

  const value: NetworkContextType = {
    config,
    isFirstRun: firstRun,
    connectionStatus,
    isConnecting,
    lastConnectionTest,
    updateConfig,
    testNetworkConnection,
    setOfflineMode,
    refreshConnectionStatus,
  };

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = (): NetworkContextType => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};