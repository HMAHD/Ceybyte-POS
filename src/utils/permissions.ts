/*
 * ╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                        CEYBYTE POS                                               ║
 * ║                                                                                                  ║
 * ║                                    Role-Based Access Control                                     ║
 * ║                                                                                                  ║
 * ║  Description: Simplified permission system with three roles: Owner, Cashier, Helper.            ║
 * ║               Provides utilities for checking permissions and controlling UI access.             ║
 * ║                                                                                                  ║
 * ║  Author: Akash Hasendra                                                                          ║
 * ║  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   ║
 * ║  License: MIT License with Sri Lankan Business Terms                                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
 */

export type UserRole = 'owner' | 'cashier' | 'helper';

export interface Permission {
  key: string;
  name: string;
  description: string;
}

export interface RolePermissions {
  role: UserRole;
  name: string;
  permissions: string[];
}

// Define all available permissions
export const PERMISSIONS: Record<string, Permission> = {
  // Sales permissions
  SALES_VIEW: { key: 'sales_view', name: 'View Sales', description: 'Access sales screen' },
  SALES_CREATE: { key: 'sales_create', name: 'Create Sales', description: 'Make new sales' },
  SALES_EDIT: { key: 'sales_edit', name: 'Edit Sales', description: 'Modify existing sales' },
  SALES_DELETE: { key: 'sales_delete', name: 'Delete Sales', description: 'Cancel/delete sales' },
  SALES_DISCOUNT: { key: 'sales_discount', name: 'Apply Discounts', description: 'Give price discounts' },
  SALES_REFUND: { key: 'sales_refund', name: 'Process Refunds', description: 'Handle returns and refunds' },

  // Inventory permissions
  INVENTORY_VIEW: { key: 'inventory_view', name: 'View Inventory', description: 'View product lists' },
  INVENTORY_CREATE: { key: 'inventory_create', name: 'Add Products', description: 'Add new products' },
  INVENTORY_EDIT: { key: 'inventory_edit', name: 'Edit Products', description: 'Modify product details' },
  INVENTORY_DELETE: { key: 'inventory_delete', name: 'Delete Products', description: 'Remove products' },
  INVENTORY_PRICE: { key: 'inventory_price', name: 'Change Prices', description: 'Update product prices' },

  // Customer permissions
  CUSTOMERS_VIEW: { key: 'customers_view', name: 'View Customers', description: 'Access customer lists' },
  CUSTOMERS_CREATE: { key: 'customers_create', name: 'Add Customers', description: 'Register new customers' },
  CUSTOMERS_EDIT: { key: 'customers_edit', name: 'Edit Customers', description: 'Update customer details' },
  CUSTOMERS_DELETE: { key: 'customers_delete', name: 'Delete Customers', description: 'Remove customers' },
  CUSTOMERS_CREDIT: { key: 'customers_credit', name: 'Manage Credit', description: 'Handle customer credit' },

  // Supplier permissions
  SUPPLIERS_VIEW: { key: 'suppliers_view', name: 'View Suppliers', description: 'Access supplier lists' },
  SUPPLIERS_CREATE: { key: 'suppliers_create', name: 'Add Suppliers', description: 'Register new suppliers' },
  SUPPLIERS_EDIT: { key: 'suppliers_edit', name: 'Edit Suppliers', description: 'Update supplier details' },
  SUPPLIERS_DELETE: { key: 'suppliers_delete', name: 'Delete Suppliers', description: 'Remove suppliers' },

  // Report permissions
  REPORTS_BASIC: { key: 'reports_basic', name: 'Basic Reports', description: 'View basic sales reports' },
  REPORTS_ADVANCED: { key: 'reports_advanced', name: 'Advanced Reports', description: 'View detailed analytics' },
  REPORTS_FINANCIAL: { key: 'reports_financial', name: 'Financial Reports', description: 'View profit/loss reports' },

  // Settings permissions
  SETTINGS_VIEW: { key: 'settings_view', name: 'View Settings', description: 'Access system settings' },
  SETTINGS_EDIT: { key: 'settings_edit', name: 'Edit Settings', description: 'Modify system configuration' },

  // User management permissions
  USERS_VIEW: { key: 'users_view', name: 'View Users', description: 'Access user management' },
  USERS_CREATE: { key: 'users_create', name: 'Create Users', description: 'Add new users' },
  USERS_EDIT: { key: 'users_edit', name: 'Edit Users', description: 'Modify user details' },
  USERS_DELETE: { key: 'users_delete', name: 'Delete Users', description: 'Remove users' },

  // System permissions
  SYSTEM_BACKUP: { key: 'system_backup', name: 'System Backup', description: 'Create and restore backups' },
  SYSTEM_ADMIN: { key: 'system_admin', name: 'System Admin', description: 'Full system administration' },

  // Cash management
  CASH_DRAWER: { key: 'cash_drawer', name: 'Cash Drawer', description: 'Open cash drawer manually' },
  CASH_MANAGEMENT: { key: 'cash_management', name: 'Cash Management', description: 'Handle cash operations' },
};

// Define role-based permissions
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  owner: {
    role: 'owner',
    name: 'Owner',
    permissions: [
      // Full system access
      'sales_view', 'sales_create', 'sales_edit', 'sales_delete', 'sales_discount', 'sales_refund',
      'inventory_view', 'inventory_create', 'inventory_edit', 'inventory_delete', 'inventory_price',
      'customers_view', 'customers_create', 'customers_edit', 'customers_delete', 'customers_credit',
      'suppliers_view', 'suppliers_create', 'suppliers_edit', 'suppliers_delete',
      'reports_basic', 'reports_advanced', 'reports_financial',
      'settings_view', 'settings_edit',
      'users_view', 'users_create', 'users_edit', 'users_delete',
      'system_backup', 'system_admin',
      'cash_drawer', 'cash_management',
    ],
  },
  cashier: {
    role: 'cashier',
    name: 'Cashier',
    permissions: [
      // Sales and basic inventory access
      'sales_view', 'sales_create', 'sales_edit', 'sales_discount',
      'inventory_view',
      'customers_view', 'customers_create', 'customers_edit', 'customers_credit',
      'reports_basic',
      'cash_drawer', 'cash_management',
    ],
  },
  helper: {
    role: 'helper',
    name: 'Helper',
    permissions: [
      // Only sales screen access
      'sales_view', 'sales_create',
      'inventory_view', // Read-only for product lookup
      'customers_view', // Read-only for customer selection
    ],
  },
};

// Utility functions for permission checking
export class PermissionService {
  /**
   * Check if a user has a specific permission
   */
  static hasPermission(userRole: UserRole, permission: string): boolean {
    const rolePermissions = ROLE_PERMISSIONS[userRole];
    return rolePermissions ? rolePermissions.permissions.includes(permission) : false;
  }

  /**
   * Check if a user has any of the specified permissions
   */
  static hasAnyPermission(userRole: UserRole, permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(userRole, permission));
  }

  /**
   * Check if a user has all of the specified permissions
   */
  static hasAllPermissions(userRole: UserRole, permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(userRole, permission));
  }

  /**
   * Get all permissions for a user role
   */
  static getUserPermissions(userRole: UserRole): string[] {
    const rolePermissions = ROLE_PERMISSIONS[userRole];
    return rolePermissions ? rolePermissions.permissions : [];
  }

  /**
   * Get role display name
   */
  static getRoleName(userRole: UserRole): string {
    const rolePermissions = ROLE_PERMISSIONS[userRole];
    return rolePermissions ? rolePermissions.name : userRole;
  }

  /**
   * Check if user can access a specific route/page
   */
  static canAccessRoute(userRole: UserRole, route: string): boolean {
    const routePermissions: Record<string, string[]> = {
      '/dashboard': ['sales_view'],
      '/sales': ['sales_view'],
      '/products': ['inventory_view'],
      '/customers': ['customers_view'],
      '/suppliers': ['suppliers_view'],
      '/reports': ['reports_basic'],
      '/reports/advanced': ['reports_advanced'],
      '/reports/financial': ['reports_financial'],
      '/settings': ['settings_view'],
      '/users': ['users_view'],
      '/backup': ['system_backup'],
    };

    const requiredPermissions = routePermissions[route];
    if (!requiredPermissions) {
      return true; // Allow access if no specific permissions required
    }

    return this.hasAnyPermission(userRole, requiredPermissions);
  }

  /**
   * Check if user can perform a specific action
   */
  static canPerformAction(userRole: UserRole, action: string): boolean {
    const actionPermissions: Record<string, string[]> = {
      'create_sale': ['sales_create'],
      'edit_sale': ['sales_edit'],
      'delete_sale': ['sales_delete'],
      'apply_discount': ['sales_discount'],
      'process_refund': ['sales_refund'],
      'add_product': ['inventory_create'],
      'edit_product': ['inventory_edit'],
      'delete_product': ['inventory_delete'],
      'change_price': ['inventory_price'],
      'add_customer': ['customers_create'],
      'edit_customer': ['customers_edit'],
      'delete_customer': ['customers_delete'],
      'manage_credit': ['customers_credit'],
      'open_cash_drawer': ['cash_drawer'],
      'manage_users': ['users_view'],
      'system_settings': ['settings_edit'],
      'create_backup': ['system_backup'],
    };

    const requiredPermissions = actionPermissions[action];
    if (!requiredPermissions) {
      return true; // Allow action if no specific permissions required
    }

    return this.hasAnyPermission(userRole, requiredPermissions);
  }

  /**
   * Get restricted features for a role
   */
  static getRestrictedFeatures(userRole: UserRole): string[] {
    const restrictions: Record<UserRole, string[]> = {
      owner: [], // No restrictions for owner
      cashier: [
        'Delete sales transactions',
        'Delete products',
        'Advanced reports',
        'User management',
        'System settings',
        'Backup management',
      ],
      helper: [
        'Price changes',
        'Discounts',
        'Returns/refunds',
        'Add/edit products',
        'Add/edit customers',
        'All reports',
        'Settings',
        'User management',
        'Cash drawer (manual)',
        'Delete anything',
      ],
    };

    return restrictions[userRole] || [];
  }

  /**
   * Check if a navigation menu item should be visible
   */
  static shouldShowMenuItem(userRole: UserRole, menuItem: string): boolean {
    const menuPermissions: Record<string, string[]> = {
      'dashboard': ['sales_view'],
      'sales': ['sales_view'],
      'products': ['inventory_view'],
      'customers': ['customers_view'],
      'suppliers': ['suppliers_view'],
      'reports': ['reports_basic'],
      'settings': ['settings_view'],
      'users': ['users_view'],
      'sessions': ['users_view'], // Same as users - owner only
      'backup': ['system_backup'],
    };

    const requiredPermissions = menuPermissions[menuItem];
    if (!requiredPermissions) {
      return true; // Show menu item if no specific permissions required
    }

    return this.hasAnyPermission(userRole, requiredPermissions);
  }
}

export default PermissionService;