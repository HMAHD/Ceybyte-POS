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
      <ProtectedRoute requiredPermission='sales'>
        <MainLayout selectedKey='dashboard'>
          <DashboardPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/pos',
    element: (
      <ProtectedRoute requiredPermission='sales'>
        <MainLayout selectedKey='pos'>
          <POSPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/products',
    element: (
      <ProtectedRoute requiredPermission='inventory'>
        <MainLayout selectedKey='products'>
          <ProductsPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/customers',
    element: (
      <ProtectedRoute requiredPermission='customers'>
        <MainLayout selectedKey='customers'>
          <CustomersPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/suppliers',
    element: (
      <ProtectedRoute requiredPermission='suppliers'>
        <MainLayout selectedKey='suppliers'>
          <SuppliersPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/reports',
    element: (
      <ProtectedRoute requiredPermission='reports'>
        <MainLayout selectedKey='reports'>
          <ReportsPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute requiredPermission='settings'>
        <MainLayout selectedKey='settings'>
          <SettingsPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
]);

export default router;
