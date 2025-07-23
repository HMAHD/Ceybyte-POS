/*
 * ╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                        CEYBYTE POS                                               ║
 * ║                                                                                                  ║
 * ║                                      Permission Hook                                             ║
 * ║                                                                                                  ║
 * ║  Description: React hook for checking user permissions and role-based access control.           ║
 * ║               Provides easy-to-use functions for UI permission checks.                          ║
 * ║                                                                                                  ║
 * ║  Author: Akash Hasendra                                                                          ║
 * ║  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   ║
 * ║  License: MIT License with Sri Lankan Business Terms                                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PermissionService, UserRole } from '@/utils/permissions';

export interface UsePermissionsReturn {
  // Basic permission checks
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  
  // Role checks
  isOwner: boolean;
  isCashier: boolean;
  isHelper: boolean;
  
  // Route and feature access
  canAccessRoute: (route: string) => boolean;
  canPerformAction: (action: string) => boolean;
  shouldShowMenuItem: (menuItem: string) => boolean;
  
  // UI helpers
  canCreateSale: boolean;
  canEditSale: boolean;
  canDeleteSale: boolean;
  canApplyDiscount: boolean;
  canProcessRefund: boolean;
  canManageInventory: boolean;
  canManageCustomers: boolean;
  canViewReports: boolean;
  canAccessSettings: boolean;
  canManageUsers: boolean;
  canOpenCashDrawer: boolean;
  
  // User info
  userRole: UserRole | null;
  userPermissions: string[];
  roleName: string;
  restrictedFeatures: string[];
}

export const usePermissions = (): UsePermissionsReturn => {
  const { user } = useAuth();
  
  const userRole = user?.role as UserRole | null;
  
  const permissions = useMemo(() => {
    if (!userRole) {
      return {
        hasPermission: () => false,
        hasAnyPermission: () => false,
        hasAllPermissions: () => false,
        isOwner: false,
        isCashier: false,
        isHelper: false,
        canAccessRoute: () => false,
        canPerformAction: () => false,
        shouldShowMenuItem: () => false,
        canCreateSale: false,
        canEditSale: false,
        canDeleteSale: false,
        canApplyDiscount: false,
        canProcessRefund: false,
        canManageInventory: false,
        canManageCustomers: false,
        canViewReports: false,
        canAccessSettings: false,
        canManageUsers: false,
        canOpenCashDrawer: false,
        userRole: null,
        userPermissions: [],
        roleName: '',
        restrictedFeatures: [],
      };
    }

    return {
      // Basic permission checks
      hasPermission: (permission: string) => 
        PermissionService.hasPermission(userRole, permission),
      
      hasAnyPermission: (permissions: string[]) => 
        PermissionService.hasAnyPermission(userRole, permissions),
      
      hasAllPermissions: (permissions: string[]) => 
        PermissionService.hasAllPermissions(userRole, permissions),
      
      // Role checks
      isOwner: userRole === 'owner',
      isCashier: userRole === 'cashier',
      isHelper: userRole === 'helper',
      
      // Route and feature access
      canAccessRoute: (route: string) => 
        PermissionService.canAccessRoute(userRole, route),
      
      canPerformAction: (action: string) => 
        PermissionService.canPerformAction(userRole, action),
      
      shouldShowMenuItem: (menuItem: string) => 
        PermissionService.shouldShowMenuItem(userRole, menuItem),
      
      // Common UI permission checks
      canCreateSale: PermissionService.hasPermission(userRole, 'sales_create'),
      canEditSale: PermissionService.hasPermission(userRole, 'sales_edit'),
      canDeleteSale: PermissionService.hasPermission(userRole, 'sales_delete'),
      canApplyDiscount: PermissionService.hasPermission(userRole, 'sales_discount'),
      canProcessRefund: PermissionService.hasPermission(userRole, 'sales_refund'),
      canManageInventory: PermissionService.hasAnyPermission(userRole, [
        'inventory_create', 'inventory_edit', 'inventory_delete'
      ]),
      canManageCustomers: PermissionService.hasAnyPermission(userRole, [
        'customers_create', 'customers_edit', 'customers_delete'
      ]),
      canViewReports: PermissionService.hasAnyPermission(userRole, [
        'reports_basic', 'reports_advanced', 'reports_financial'
      ]),
      canAccessSettings: PermissionService.hasPermission(userRole, 'settings_view'),
      canManageUsers: PermissionService.hasPermission(userRole, 'users_view'),
      canOpenCashDrawer: PermissionService.hasPermission(userRole, 'cash_drawer'),
      
      // User info
      userRole,
      userPermissions: PermissionService.getUserPermissions(userRole),
      roleName: PermissionService.getRoleName(userRole),
      restrictedFeatures: PermissionService.getRestrictedFeatures(userRole),
    };
  }, [userRole]);

  return permissions;
};

export default usePermissions;