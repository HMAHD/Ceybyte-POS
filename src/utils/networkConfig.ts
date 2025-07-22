/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                    Network Configuration Utilities                              │
 * │                                                                                                  │
 * │  Description: Utilities for managing network configuration, connection testing,                 │
 * │               and multi-terminal setup for POS systems.                                         │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import type {
  NetworkConfiguration,
  ConnectionTestResult,
  NetworkSetupStep,
  MainComputerSetup,
  ClientComputerSetup,
  NetworkDiagnostics,
  TerminalType,
  ConnectionStatus,
} from '@/types/network';
import { DEFAULT_NETWORK_CONFIG, NETWORK_STORAGE_KEY } from '@/types/network';

// Network configuration management
export const getNetworkConfig = (): NetworkConfiguration => {
  try {
    const stored = localStorage.getItem(NETWORK_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_NETWORK_CONFIG, ...parsed };
    }
  } catch (error) {
    console.error('Error loading network configuration:', error);
  }
  return DEFAULT_NETWORK_CONFIG;
};

export const saveNetworkConfig = (config: NetworkConfiguration): void => {
  try {
    localStorage.setItem(NETWORK_STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Error saving network configuration:', error);
  }
};

export const isFirstRun = (): boolean => {
  const config = getNetworkConfig();
  return !config.isConfigured;
};

// Terminal ID generation
export const generateTerminalId = (type: TerminalType): string => {
  const prefix = type === 'main' ? 'MAIN' : 'CLIENT';
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Connection testing (mock implementation - would use Tauri APIs in real app)
export const testConnection = async (config: NetworkConfiguration): Promise<ConnectionTestResult> => {
  const startTime = Date.now();
  
  try {
    // Simulate connection test delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (config.terminalType === 'main') {
      // Test main computer setup
      return {
        success: true,
        status: 'connected',
        message: 'Main computer setup successful',
        details: 'Database initialized and file sharing enabled',
        timestamp: new Date(),
        latency: Date.now() - startTime,
      };
    } else {
      // Test client connection to main computer
      if (!config.mainComputerPath) {
        return {
          success: false,
          status: 'error',
          message: 'Main computer path not specified',
          details: 'Please enter the network path to the main computer',
          timestamp: new Date(),
        };
      }

      // Simulate network path validation
      const isValidPath = config.mainComputerPath.match(/^\\\\[\w-]+\\[\w-]+$/);
      if (!isValidPath) {
        return {
          success: false,
          status: 'error',
          message: 'Invalid network path format',
          details: 'Path should be in format \\\\COMPUTER-NAME\\SHARED-FOLDER',
          timestamp: new Date(),
        };
      }

      return {
        success: true,
        status: 'connected',
        message: 'Successfully connected to main computer',
        details: `Connected to ${config.mainComputerPath}`,
        timestamp: new Date(),
        latency: Date.now() - startTime,
      };
    }
  } catch (error) {
    return {
      success: false,
      status: 'error',
      message: 'Connection test failed',
      details: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date(),
    };
  }
};

// Network setup steps
export const getMainComputerSetupSteps = (): NetworkSetupStep[] => [
  {
    id: 'database-init',
    title: 'Initialize Database',
    description: 'Set up the main SQLite database for the POS system',
    completed: false,
    optional: false,
    instructions: [
      'Database will be automatically created in the application folder',
      'Initial tables and sample data will be set up',
      'Database backup location will be configured',
    ],
  },
  {
    id: 'file-sharing',
    title: 'Enable File Sharing',
    description: 'Configure Windows file sharing for network access',
    completed: false,
    optional: false,
    instructions: [
      'Open Control Panel > Network and Sharing Center',
      'Click "Change advanced sharing settings"',
      'Enable "Turn on file and printer sharing"',
      'Enable "Turn on network discovery"',
    ],
    troubleshooting: [
      'If sharing is blocked, check Windows Firewall settings',
      'Ensure the network is set to "Private" not "Public"',
      'Run as Administrator if permission issues occur',
    ],
  },
  {
    id: 'shared-folder',
    title: 'Create Shared Folder',
    description: 'Set up a shared folder for database access',
    completed: false,
    optional: false,
    instructions: [
      'Create a folder named "POS" in C:\\',
      'Right-click the folder and select "Properties"',
      'Go to "Sharing" tab and click "Advanced Sharing"',
      'Check "Share this folder" and set share name to "POS"',
      'Click "Permissions" and ensure "Everyone" has "Full Control"',
    ],
    troubleshooting: [
      'If permissions fail, try adding specific user accounts',
      'Check that the folder is not in a restricted location',
      'Restart the computer if sharing doesn\'t work immediately',
    ],
  },
  {
    id: 'firewall',
    title: 'Configure Firewall',
    description: 'Allow POS application through Windows Firewall',
    completed: false,
    optional: true,
    instructions: [
      'Open Windows Defender Firewall',
      'Click "Allow an app or feature through Windows Defender Firewall"',
      'Click "Change Settings" then "Allow another app"',
      'Browse and select the CeybytePOS application',
      'Ensure both "Private" and "Public" are checked',
    ],
  },
];

export const getClientComputerSetupSteps = (): NetworkSetupStep[] => [
  {
    id: 'network-path',
    title: 'Enter Network Path',
    description: 'Specify the path to the main computer',
    completed: false,
    optional: false,
    instructions: [
      'Enter the network path in format: \\\\MAIN-PC\\POS',
      'Replace "MAIN-PC" with the actual computer name',
      'The shared folder name should be "POS"',
    ],
    troubleshooting: [
      'Find computer name: Right-click "This PC" > Properties',
      'Ensure both computers are on the same network',
      'Try using IP address instead: \\\\192.168.1.100\\POS',
    ],
  },
  {
    id: 'test-connection',
    title: 'Test Connection',
    description: 'Verify connection to the main computer',
    completed: false,
    optional: false,
    instructions: [
      'Click "Test Connection" button',
      'Wait for connection verification',
      'Check that database is accessible',
    ],
    troubleshooting: [
      'Ensure main computer is powered on and connected',
      'Check that file sharing is enabled on main computer',
      'Verify network connectivity between computers',
    ],
  },
  {
    id: 'sync-setup',
    title: 'Configure Sync',
    description: 'Set up data synchronization with main computer',
    completed: false,
    optional: false,
    instructions: [
      'Sync settings will be configured automatically',
      'Initial data download will begin',
      'Offline mode will be enabled as backup',
    ],
  },
];

// Network diagnostics
export const runNetworkDiagnostics = async (config: NetworkConfiguration): Promise<NetworkDiagnostics> => {
  // Mock implementation - would use actual network checks in real app
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    networkConnectivity: true,
    mainComputerReachable: config.terminalType === 'main' || !!config.mainComputerPath,
    sharedFolderAccessible: true,
    databaseConnectable: true,
    firewallBlocking: false,
    permissions: true,
    lastDiagnosticRun: new Date(),
  };
};

// Validation utilities
export const validateNetworkPath = (path: string): { valid: boolean; message?: string } => {
  if (!path) {
    return { valid: false, message: 'Network path is required' };
  }

  if (!path.startsWith('\\\\')) {
    return { valid: false, message: 'Path must start with \\\\' };
  }

  const pathRegex = /^\\\\[\w.-]+\\[\w.-]+$/;
  if (!pathRegex.test(path)) {
    return { valid: false, message: 'Invalid path format. Use \\\\COMPUTER-NAME\\FOLDER-NAME' };
  }

  return { valid: true };
};

export const validateTerminalName = (name: string): { valid: boolean; message?: string } => {
  if (!name) {
    return { valid: false, message: 'Terminal name is required' };
  }

  if (name.length < 3) {
    return { valid: false, message: 'Terminal name must be at least 3 characters' };
  }

  if (name.length > 50) {
    return { valid: false, message: 'Terminal name must be less than 50 characters' };
  }

  const nameRegex = /^[a-zA-Z0-9\s-_]+$/;
  if (!nameRegex.test(name)) {
    return { valid: false, message: 'Terminal name can only contain letters, numbers, spaces, hyphens, and underscores' };
  }

  return { valid: true };
};