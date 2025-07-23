/*
 * ╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                        CEYBYTE POS                                               ║
 * ║                                                                                                  ║
 * ║                                      Permission Gate Component                                   ║
 * ║                                                                                                  ║
 * ║  Description: Component that conditionally renders children based on user permissions.          ║
 * ║               Provides fine-grained access control for UI elements.                             ║
 * ║                                                                                                  ║
 * ║  Author: Akash Hasendra                                                                          ║
 * ║  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   ║
 * ║  License: MIT License with Sri Lankan Business Terms                                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import React, { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { UserRole } from '@/utils/permissions';

interface PermissionGateProps {
  children: ReactNode;
  
  // Permission-based access
  requiredPermissions?: string[];
  anyPermission?: boolean; // If true, user needs ANY of the permissions; if false, needs ALL
  
  // Role-based access
  allowedRoles?: UserRole[];
  blockedRoles?: UserRole[];
  
  // Action-based access
  requiredAction?: string;
  
  // Menu item access
  menuItem?: string;
  
  // Route access
  route?: string;
  
  // Fallback content when access is denied
  fallback?: ReactNode;
  
  // Invert the logic (show when user DOESN'T have permission)
  invert?: boolean;
}

const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  requiredPermissions = [],
  anyPermission = true,
  allowedRoles = [],
  blockedRoles = [],
  requiredAction,
  menuItem,
  route,
  fallback = null,
  invert = false,
}) => {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canPerformAction,
    shouldShowMenuItem,
    canAccessRoute,
    userRole,
  } = usePermissions();

  let hasAccess = true;

  // Check role-based access
  if (allowedRoles.length > 0) {
    hasAccess = hasAccess && userRole ? allowedRoles.includes(userRole) : false;
  }

  if (blockedRoles.length > 0) {
    hasAccess = hasAccess && userRole ? !blockedRoles.includes(userRole) : false;
  }

  // Check permission-based access
  if (requiredPermissions.length > 0) {
    if (anyPermission) {
      hasAccess = hasAccess && hasAnyPermission(requiredPermissions);
    } else {
      hasAccess = hasAccess && hasAllPermissions(requiredPermissions);
    }
  }

  // Check action-based access
  if (requiredAction) {
    hasAccess = hasAccess && canPerformAction(requiredAction);
  }

  // Check menu item access
  if (menuItem) {
    hasAccess = hasAccess && shouldShowMenuItem(menuItem);
  }

  // Check route access
  if (route) {
    hasAccess = hasAccess && canAccessRoute(route);
  }

  // Apply invert logic if specified
  if (invert) {
    hasAccess = !hasAccess;
  }

  // Render children if user has access, otherwise render fallback
  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

// Convenience components for common use cases
export const OwnerOnly: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGate allowedRoles={['owner']} fallback={fallback}>
    {children}
  </PermissionGate>
);

export const CashierOrOwner: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGate allowedRoles={['owner', 'cashier']} fallback={fallback}>
    {children}
  </PermissionGate>
);

export const HelperRestricted: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGate blockedRoles={['helper']} fallback={fallback}>
    {children}
  </PermissionGate>
);

export const CanManageInventory: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGate 
    requiredPermissions={['inventory_create', 'inventory_edit', 'inventory_delete']} 
    anyPermission={true}
    fallback={fallback}
  >
    {children}
  </PermissionGate>
);

export const CanApplyDiscount: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGate requiredPermissions={['sales_discount']} fallback={fallback}>
    {children}
  </PermissionGate>
);

export const CanViewReports: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGate 
    requiredPermissions={['reports_basic', 'reports_advanced', 'reports_financial']} 
    anyPermission={true}
    fallback={fallback}
  >
    {children}
  </PermissionGate>
);

export const CanManageUsers: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGate requiredPermissions={['users_view']} fallback={fallback}>
    {children}
  </PermissionGate>
);

export default PermissionGate;