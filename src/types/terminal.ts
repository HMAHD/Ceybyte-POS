/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                    Terminal Types                                                │
 * │                                                                                                  │
 * │  Description: TypeScript types for terminal management, multi-terminal networking,               │
 * │               and synchronization in the POS system.                                            │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

export type TerminalStatus = 'online' | 'offline' | 'maintenance' | 'error';
export type SyncStatus = 'synced' | 'pending' | 'failed' | 'conflict';
export type TerminalType = 'pos' | 'admin' | 'mobile';

export interface Terminal {
  terminal_id: string;
  terminal_name: string;
  display_name?: string;
  terminal_type: TerminalType;
  is_main_terminal: boolean;
  
  // Network information
  ip_address?: string;
  mac_address?: string;
  hostname?: string;
  
  // Hardware information
  hardware_id?: string;
  cpu_info?: string;
  memory_gb?: number;
  storage_gb?: number;
  
  // Software information
  os_version?: string;
  app_version?: string;
  last_update_check?: string;
  
  // Terminal status
  status: TerminalStatus;
  last_seen?: string;
  last_heartbeat?: string;
  
  // Sync information
  last_sync_time?: string;
  sync_status: SyncStatus;
  pending_sync_count: number;
  
  // Configuration
  configuration?: Record<string, any>;
  
  // Printer configuration
  printer_name?: string;
  printer_type?: string;
  printer_width_mm?: number;
  
  // UPS information
  ups_connected: boolean;
  ups_battery_level?: number;
  ups_status?: string;
  
  // Performance metrics
  avg_response_time_ms?: number;
  error_count_24h?: number;
  
  // Location information
  location?: string;
  description?: string;
  
  // Computed properties
  uptime_status: string;
  sync_status_display: string;
  is_online: boolean;
}

export interface TerminalConfig {
  terminal_id?: string;
  terminal_name: string;
  display_name?: string;
  terminal_type: TerminalType;
  is_main_terminal: boolean;
  app_version: string;
  network_path?: string;
}

export interface TerminalUpdate {
  terminal_name?: string;
  display_name?: string;
  status?: TerminalStatus;
  configuration?: Record<string, any>;
}

export interface SyncRequest {
  terminal_id: string;
  force_sync: boolean;
}

export interface SyncResult {
  success: boolean;
  synced_tables: string[];
  conflicts_resolved: number;
  errors: string[];
  sync_time: string;
  records_synced: number;
  message?: string;
}

export interface SyncStatusInfo {
  terminal_id: string;
  sync_status: SyncStatus;
  last_sync_time?: string;
  pending_sync_count: number;
  needs_sync: boolean;
  sync_status_display: string;
}

export interface NetworkConnectivity {
  network_available: boolean;
  main_computer_reachable: boolean;
  shared_folder_accessible: boolean;
  database_accessible: boolean;
  latency_ms?: number;
  error_message?: string;
}

export interface NetworkTestRequest {
  network_path?: string;
  terminal_type: string;
}

export interface NetworkDiagnostics {
  timestamp: string;
  network_connectivity: NetworkConnectivity;
  terminal_count: number;
  system_info: {
    platform: string;
    network_interfaces: string;
  };
}

export interface OfflineTransaction {
  id: string;
  type: 'sale' | 'customer_update' | 'product_update' | 'payment';
  data: Record<string, any>;
  queued_at: string;
  sync_status: 'pending' | 'synced' | 'failed';
  retry_count: number;
  last_retry?: string;
  error_message?: string;
}

export interface ConflictResolution {
  conflict_id: string;
  table_name: string;
  record_id: string;
  local_data: Record<string, any>;
  remote_data: Record<string, any>;
  local_timestamp: string;
  remote_timestamp: string;
  resolution_strategy: 'last_write_wins' | 'manual' | 'merge';
  resolved: boolean;
  winner?: 'local' | 'remote' | 'merged';
}

export interface TerminalHeartbeat {
  terminal_id: string;
  timestamp: string;
  status: TerminalStatus;
  performance_metrics?: {
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
    response_time_ms: number;
  };
  ups_info?: {
    connected: boolean;
    battery_level?: number;
    status?: string;
  };
}

export interface TerminalDiscoveryResult {
  success: boolean;
  terminals: Terminal[];
  count: number;
  error?: string;
}

export interface TerminalApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// API Response types
export interface InitializeTerminalResponse extends TerminalApiResponse {
  terminal_id: string;
}

export interface GetTerminalResponse extends TerminalApiResponse {
  terminal: Terminal;
}

export interface SyncTerminalResponse extends TerminalApiResponse {
  sync_result?: SyncResult;
}

export interface NetworkTestResponse extends TerminalApiResponse {
  connectivity: NetworkConnectivity;
}

export interface DiagnosticsResponse extends TerminalApiResponse {
  diagnostics: NetworkDiagnostics;
}

export interface OfflineDataResponse extends TerminalApiResponse {
  data: Record<string, any>[];
  count: number;
}

// Configuration constants
export const TERMINAL_STATUS_COLORS = {
  online: 'green',
  offline: 'red',
  maintenance: 'orange',
  error: 'red',
} as const;

export const SYNC_STATUS_COLORS = {
  synced: 'green',
  pending: 'orange',
  failed: 'red',
  conflict: 'purple',
} as const;

export const DEFAULT_HEARTBEAT_INTERVAL = 30000; // 30 seconds
export const DEFAULT_SYNC_INTERVAL = 60000; // 1 minute
export const MAX_RETRY_COUNT = 3;
export const OFFLINE_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours