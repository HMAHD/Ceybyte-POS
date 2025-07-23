/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                   Application Routes                                             │
 * │                                                                                                  │
 * │  Description: React Router configuration for CeybytePOS application.                             │
 * │               Defines all application routes and their corresponding components.                  │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardPage from '@/pages/Dashboard';
import POSPage from '@/pages/POS';
import ProductsPage from '@/pages/Products';
import CustomersPage from '@/pages/Customers';
import SuppliersPage from '@/pages/Suppliers';
import UsersPage from '@/pages/Users';
import ReportsPage from '@/pages/Reports';
import SettingsPage from '@/pages/Settings';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to='/dashboard' replace />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute requiredPermissions={['sales_view']}>
        <MainLayout selectedKey='dashboard'>
          <DashboardPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/pos',
    element: (
      <ProtectedRoute requiredPermissions={['sales_view']}>
        <MainLayout selectedKey='pos'>
          <POSPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/products',
    element: (
      <ProtectedRoute requiredPermissions={['inventory_view']}>
        <MainLayout selectedKey='products'>
          <ProductsPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/customers',
    element: (
      <ProtectedRoute requiredPermissions={['customers_view']}>
        <MainLayout selectedKey='customers'>
          <CustomersPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/suppliers',
    element: (
      <ProtectedRoute requiredPermissions={['suppliers_view']}>
        <MainLayout selectedKey='suppliers'>
          <SuppliersPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/users',
    element: (
      <ProtectedRoute requiredRole='owner'>
        <MainLayout selectedKey='users'>
          <UsersPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/reports',
    element: (
      <ProtectedRoute requiredPermissions={['reports_basic']}>
        <MainLayout selectedKey='reports'>
          <ReportsPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute requiredPermissions={['settings_view']}>
        <MainLayout selectedKey='settings'>
          <SettingsPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
]);

export default router;
