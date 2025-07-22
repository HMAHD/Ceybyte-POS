/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                    Network Configuration Types                                   │
 * │                                                                                                  │
 * │  Description: TypeScript types for network configuration, terminal setup,                        │
 * │               and multi-terminal POS system management.                                          │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

export type TerminalType = 'main' | 'client';

export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error'
  | 'testing';

export interface NetworkConfiguration {
  terminalType: TerminalType;
  terminalId: string;
  terminalName: string;
  isConfigured: boolean;
  mainComputerPath?: string;
  sharedFolderPath?: string;
  databasePath?: string;
  lastConnectionTest?: Date;
  connectionStatus: ConnectionStatus;
  offlineMode: boolean;
}

export interface ConnectionTestResult {
  success: boolean;
  status: ConnectionStatus;
  message: string;
  details?: string;
  timestamp: Date;
  latency?: number;
}

export interface NetworkSetupStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  optional: boolean;
  instructions: string[];
  troubleshooting?: string[];
}

export interface MainComputerSetup {
  databaseInitialized: boolean;
  fileSharingEnabled: boolean;
  sharedFolderCreated: boolean;
  firewallConfigured: boolean;
  networkDiscoveryEnabled: boolean;
}

export interface ClientComputerSetup {
  mainComputerPath: string;
  connectionTested: boolean;
  databaseAccessible: boolean;
  syncEnabled: boolean;
}

export interface NetworkDiagnostics {
  networkConnectivity: boolean;
  mainComputerReachable: boolean;
  sharedFolderAccessible: boolean;
  databaseConnectable: boolean;
  firewallBlocking: boolean;
  permissions: boolean;
  lastDiagnosticRun: Date;
}

export const DEFAULT_NETWORK_CONFIG: NetworkConfiguration = {
  terminalType: 'main',
  terminalId: '',
  terminalName: '',
  isConfigured: false,
  connectionStatus: 'disconnected',
  offlineMode: false,
};

export const NETWORK_STORAGE_KEY = 'ceybyte-pos-network-config';
