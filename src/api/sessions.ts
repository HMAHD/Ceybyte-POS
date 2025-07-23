/*
 * ╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                        CEYBYTE POS                                               ║
 * ║                                                                                                  ║
 * ║                                   Session Management API                                         ║
 * ║                                                                                                  ║
 * ║  Description: API client for session management operations including active session tracking,   ║
 * ║               login history, audit logs, and session control features.                          ║
 * ║                                                                                                  ║
 * ║  Author: Akash Hasendra                                                                          ║
 * ║  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   ║
 * ║  License: MIT License with Sri Lankan Business Terms                                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import { apiClient } from './client';
import { ApiResponse } from '@/types/api';

// Session Types
export interface SessionInfo {
  id: number;
  user_id: number;
  username: string;
  user_name: string;
  user_role: string;
  terminal_name?: string;
  ip_address?: string;
  user_agent?: string;
  login_time: string;
  last_activity?: string;
  is_active: boolean;
  session_duration?: number; // in minutes
  location?: string;
}

export interface SessionListResponse {
  sessions: SessionInfo[];
  total: number;
  active_count: number;
  page: number;
  per_page: number;
}

export interface LoginHistoryEntry {
  id: number;
  user_id: number;
  username: string;
  user_name: string;
  login_time: string;
  logout_time?: string;
  session_duration?: number; // in minutes
  terminal_name?: string;
  ip_address?: string;
  login_method: string; // 'password' or 'pin'
  logout_reason?: string; // 'manual', 'timeout', 'forced', 'system'
}

export interface LoginHistoryResponse {
  history: LoginHistoryEntry[];
  total: number;
  page: number;
  per_page: number;
}

export interface AuditLogEntry {
  id: number;
  user_id?: number;
  username?: string;
  event_type: string;
  description: string;
  severity: string;
  ip_address?: string;
  user_agent?: string;
  terminal_name?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface AuditLogResponse {
  logs: AuditLogEntry[];
  total: number;
  page: number;
  per_page: number;
}

export interface SessionStats {
  active_sessions: number;
  today_sessions: number;
  failed_logins_today: number;
  average_session_duration_minutes: number;
  sessions_by_role: Record<string, number>;
  timestamp: string;
}

export interface SessionFilters {
  page?: number;
  per_page?: number;
  user_id?: number;
  terminal?: string;
}

export interface LoginHistoryFilters {
  page?: number;
  per_page?: number;
  user_id?: number;
  days?: number;
}

export interface AuditLogFilters {
  page?: number;
  per_page?: number;
  event_type?: string;
  user_id?: number;
  severity?: string;
  days?: number;
}

export interface ForceLogoutRequest {
  session_ids: number[];
  reason: string;
}

class SessionsAPI {
  /**
   * Get active sessions
   */
  async getActiveSessions(
    filters: SessionFilters = {}
  ): Promise<ApiResponse<SessionListResponse>> {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.per_page) params.append('per_page', filters.per_page.toString());
    if (filters.user_id) params.append('user_id', filters.user_id.toString());
    if (filters.terminal) params.append('terminal', filters.terminal);

    const queryString = params.toString();
    const endpoint = queryString ? `/sessions/active?${queryString}` : '/sessions/active';

    return apiClient.get<SessionListResponse>(endpoint);
  }

  /**
   * Get login/logout history
   */
  async getLoginHistory(
    filters: LoginHistoryFilters = {}
  ): Promise<ApiResponse<LoginHistoryResponse>> {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.per_page) params.append('per_page', filters.per_page.toString());
    if (filters.user_id) params.append('user_id', filters.user_id.toString());
    if (filters.days) params.append('days', filters.days.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/sessions/history?${queryString}` : '/sessions/history';

    return apiClient.get<LoginHistoryResponse>(endpoint);
  }

  /**
   * Get audit logs
   */
  async getAuditLogs(
    filters: AuditLogFilters = {}
  ): Promise<ApiResponse<AuditLogResponse>> {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.per_page) params.append('per_page', filters.per_page.toString());
    if (filters.event_type) params.append('event_type', filters.event_type);
    if (filters.user_id) params.append('user_id', filters.user_id.toString());
    if (filters.severity) params.append('severity', filters.severity);
    if (filters.days) params.append('days', filters.days.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/sessions/audit-logs?${queryString}` : '/sessions/audit-logs';

    return apiClient.get<AuditLogResponse>(endpoint);
  }

  /**
   * Get session statistics
   */
  async getSessionStats(): Promise<ApiResponse<SessionStats>> {
    return apiClient.get<SessionStats>('/sessions/stats');
  }

  /**
   * Force logout sessions
   */
  async forceLogoutSessions(
    request: ForceLogoutRequest
  ): Promise<ApiResponse<{ message: string; logged_out_sessions: number }>> {
    return apiClient.post<{ message: string; logged_out_sessions: number }>(
      '/sessions/force-logout',
      request
    );
  }

  /**
   * Clean up old sessions
   */
  async cleanupOldSessions(
    days: number = 90
  ): Promise<ApiResponse<{ message: string; deleted_count: number; cutoff_date: string }>> {
    return apiClient.delete<{ message: string; deleted_count: number; cutoff_date: string }>(
      `/sessions/cleanup?days=${days}`
    );
  }

  /**
   * Get session info for specific user
   */
  async getUserSessions(userId: number): Promise<ApiResponse<SessionListResponse>> {
    return this.getActiveSessions({ user_id: userId });
  }

  /**
   * Get recent activity for dashboard
   */
  async getRecentActivity(): Promise<ApiResponse<AuditLogResponse>> {
    return this.getAuditLogs({ page: 1, per_page: 10, days: 1 });
  }

  /**
   * Get security events
   */
  async getSecurityEvents(): Promise<ApiResponse<AuditLogResponse>> {
    return this.getAuditLogs({ 
      severity: 'warning', 
      page: 1, 
      per_page: 20, 
      days: 7 
    });
  }

  /**
   * Get failed login attempts
   */
  async getFailedLogins(): Promise<ApiResponse<AuditLogResponse>> {
    return this.getAuditLogs({
      event_type: 'login_failed',
      page: 1,
      per_page: 50,
      days: 7
    });
  }
}

// Export singleton instance
export const sessionsAPI = new SessionsAPI();
export default sessionsAPI;