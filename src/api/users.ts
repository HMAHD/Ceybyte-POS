/*
 * ╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                        CEYBYTE POS                                               ║
 * ║                                                                                                  ║
 * ║                                    User Management API                                           ║
 * ║                                                                                                  ║
 * ║  Description: API client for user management operations including CRUD operations,               ║
 * ║               role management, and user authentication features.                                 ║
 * ║                                                                                                  ║
 * ║  Author: Akash Hasendra                                                                          ║
 * ║  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   ║
 * ║  License: MIT License with Sri Lankan Business Terms                                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import { apiClient } from './client';
import { ApiResponse } from '@/types/api';

// User Types
export interface User {
  id: number;
  username: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'owner' | 'cashier' | 'helper';
  role_name: string;
  permissions: string[];
  preferred_language: 'en' | 'si' | 'ta';
  is_active: boolean;
  last_login?: string;
  last_activity?: string;
  created_at: string;
  updated_at?: string;
  notes?: string;
  has_pin: boolean;
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  per_page: number;
}

export interface CreateUserRequest {
  username: string;
  name: string;
  email?: string;
  phone?: string;
  password: string;
  pin?: string;
  role: 'owner' | 'cashier' | 'helper';
  preferred_language?: 'en' | 'si' | 'ta';
  notes?: string;
  is_active?: boolean;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  pin?: string;
  role?: 'owner' | 'cashier' | 'helper';
  preferred_language?: 'en' | 'si' | 'ta';
  notes?: string;
  is_active?: boolean;
}

export interface UserRole {
  name: string;
  permissions: string[];
}

export interface UserRoles {
  [key: string]: UserRole;
}

export interface UserFilters {
  search?: string;
  role?: string;
  is_active?: boolean;
  page?: number;
  per_page?: number;
}

class UsersAPI {
  /**
   * Get list of users with optional filtering
   */
  async getUsers(
    filters: UserFilters = {}
  ): Promise<ApiResponse<UserListResponse>> {
    const params = new URLSearchParams();

    if (filters.search) params.append('search', filters.search);
    if (filters.role) params.append('role', filters.role);
    if (filters.is_active !== undefined)
      params.append('is_active', filters.is_active.toString());
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.per_page)
      params.append('per_page', filters.per_page.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/users?${queryString}` : '/users';

    return apiClient.get<UserListResponse>(endpoint);
  }

  /**
   * Get specific user by ID
   */
  async getUser(userId: number): Promise<ApiResponse<User>> {
    return apiClient.get<User>(`/users/${userId}`);
  }

  /**
   * Create new user
   */
  async createUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
    return apiClient.post<User>('/users', userData);
  }

  /**
   * Update existing user
   */
  async updateUser(
    userId: number,
    userData: UpdateUserRequest
  ): Promise<ApiResponse<User>> {
    return apiClient.put<User>(`/users/${userId}`, userData);
  }

  /**
   * Reset user password
   */
  async resetUserPassword(
    userId: number,
    newPassword: string
  ): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>(
      `/users/${userId}/reset-password`,
      {
        new_password: newPassword,
      }
    );
  }

  /**
   * Toggle user active/inactive status
   */
  async toggleUserStatus(
    userId: number
  ): Promise<ApiResponse<{ message: string; is_active: boolean }>> {
    return apiClient.post<{ message: string; is_active: boolean }>(
      `/users/${userId}/toggle-status`
    );
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(userId: number): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete<{ message: string }>(`/users/${userId}`);
  }

  /**
   * Get available user roles and permissions
   */
  async getAvailableRoles(): Promise<ApiResponse<UserRoles>> {
    return apiClient.get<UserRoles>('/users/roles/available');
  }

  /**
   * Search users by name or username
   */
  async searchUsers(query: string): Promise<ApiResponse<UserListResponse>> {
    return this.getUsers({ search: query, per_page: 20 });
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: string): Promise<ApiResponse<UserListResponse>> {
    return this.getUsers({ role, per_page: 100 });
  }

  /**
   * Get active users only
   */
  async getActiveUsers(): Promise<ApiResponse<UserListResponse>> {
    return this.getUsers({ is_active: true, per_page: 100 });
  }

  /**
   * Get inactive users only
   */
  async getInactiveUsers(): Promise<ApiResponse<UserListResponse>> {
    return this.getUsers({ is_active: false, per_page: 100 });
  }

  /**
   * Validate username availability
   */
  async validateUsername(username: string): Promise<boolean> {
    try {
      const response = await this.searchUsers(username);
      if (response.success && response.data && response.data.users) {
        // Check if exact username match exists
        const exactMatch = response.data.users.find(
          user => user.username.toLowerCase() === username.toLowerCase()
        );
        return !exactMatch; // Return true if username is available
      }
      return true; // If no data or no users array, consider username available
    } catch (error) {
      console.error('Error validating username:', error);
      // On error, assume username is available to not block user creation
      return true;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byRole: { [key: string]: number };
  }> {
    try {
      const response = await this.getUsers({ per_page: 1000 });

      if (!response.success || !response.data) {
        return { total: 0, active: 0, inactive: 0, byRole: {} };
      }

      const users = response.data.users;
      const stats = {
        total: users.length,
        active: users.filter(u => u.is_active).length,
        inactive: users.filter(u => !u.is_active).length,
        byRole: {} as { [key: string]: number },
      };

      // Count by role
      users.forEach(user => {
        stats.byRole[user.role] = (stats.byRole[user.role] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error getting user stats:', error);
      return { total: 0, active: 0, inactive: 0, byRole: {} };
    }
  }
}

// Export singleton instance
export const usersAPI = new UsersAPI();
export default usersAPI;
