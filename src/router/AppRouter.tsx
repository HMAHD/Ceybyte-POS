/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                    Application Router                                            │
 * │                                                                                                  │
 * │  Description: Main application router with role-based route protection and navigation.           │
 * │               Handles all routing logic for the POS system.                                      │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { LoadingSpinner } from '@/components/LoadingStates';

// Page Components (placeholders for now)
const DashboardPage = React.lazy(() => import('@/pages/DashboardPage'));
const POSPage = React.lazy(() => import('@/pages/POSPage'));
const ProductsPage = React.lazy(() => import('@/pages/ProductsPage'));
const CustomersPage = React.lazy(() => import('@/pages/CustomersPage'));
const SuppliersPage = React.lazy(() => import('@/pages/SuppliersPage'));
const ReportsPage = React.lazy(() => import('@/pages/ReportsPage'));
const SettingsPage = React.lazy(() => import('@/pages/SettingsPage'));

const AppRouter: React.FC = () => {
  const { } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Dashboard Route */}
        <Route
          path="/"
          element={
            <ProtectedRoute requiredPermission="dashboard">
              <MainLayout selectedKey="dashboard">
                <React.Suspense fallback={<LoadingSpinner tip="Loading Dashboard..." />}>
                  <DashboardPage />
                </React.Suspense>
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* POS Route */}
        <Route
          path="/pos"
          element={
            <ProtectedRoute requiredPermission="sales">
              <MainLayout selectedKey="pos">
                <React.Suspense fallback={<LoadingSpinner tip="Loading POS..." />}>
                  <POSPage />
                </React.Suspense>
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Products Route */}
        <Route
          path="/products"
          element={
            <ProtectedRoute requiredPermission="inventory">
              <MainLayout selectedKey="products">
                <React.Suspense fallback={<LoadingSpinner tip="Loading Products..." />}>
                  <ProductsPage />
                </React.Suspense>
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Customers Route */}
        <Route
          path="/customers"
          element={
            <ProtectedRoute requiredPermission="customers">
              <MainLayout selectedKey="customers">
                <React.Suspense fallback={<LoadingSpinner tip="Loading Customers..." />}>
                  <CustomersPage />
                </React.Suspense>
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Suppliers Route */}
        <Route
          path="/suppliers"
          element={
            <ProtectedRoute requiredPermission="suppliers">
              <MainLayout selectedKey="suppliers">
                <React.Suspense fallback={<LoadingSpinner tip="Loading Suppliers..." />}>
                  <SuppliersPage />
                </React.Suspense>
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Reports Route */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute requiredPermission="reports">
              <MainLayout selectedKey="reports">
                <React.Suspense fallback={<LoadingSpinner tip="Loading Reports..." />}>
                  <ReportsPage />
                </React.Suspense>
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Settings Route */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute requiredPermission="settings">
              <MainLayout selectedKey="settings">
                <React.Suspense fallback={<LoadingSpinner tip="Loading Settings..." />}>
                  <SettingsPage />
                </React.Suspense>
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Redirect unknown routes to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;