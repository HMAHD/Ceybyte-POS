/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                   Dashboard Interface                                            │
 * │                                                                                                  │
 * │  Description: Main dashboard interface for owner and cashier users.                              │
 * │               Provides access to all POS features based on user permissions.                     │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import LocalizedText from '@/components/LocalizedText';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/api/client';
import { APP_NAME, COMPANY_NAME } from '@/utils/constants';

export const DashboardInterface: React.FC = () => {
  const { user, logout, hasPermission } = useAuth();
  const { t, formatCurrency, formatDateTime } = useTranslation();
  const [apiStatus, setApiStatus] = useState<string>('Checking...');

  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      const response = await apiClient.healthCheck();
      if (response.success && response.data) {
        setApiStatus(`${response.data.service} - ${response.data.status}`);
      } else {
        setApiStatus('API connection failed');
      }
    } catch (error) {
      console.error('API Error:', error);
      setApiStatus('API not available');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <LocalizedText as="h1" className="text-xl font-semibold text-gray-900">
                {APP_NAME}
              </LocalizedText>
              <span className="ml-3 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                <LocalizedText>{user?.role}</LocalizedText>
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <LanguageSwitcher variant="compact" />
              
              <div className="flex items-center space-x-2">
                <LocalizedText className="text-sm text-gray-600">
                  {user?.name}
                </LocalizedText>
                <Button
                  onClick={logout}
                  variant="ghost"
                  size="sm"
                >
                  <LocalizedText>{t('auth.logout')}</LocalizedText>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <LocalizedText as="h2" className="text-2xl font-bold text-gray-900 mb-2">
            {t('dashboard.welcome', `Welcome, ${user?.name}`)}
          </LocalizedText>
          <LocalizedText className="text-gray-600">
            {formatDateTime(new Date())}
          </LocalizedText>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>
                <LocalizedText>{t('dashboard.todaySales')}</LocalizedText>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LocalizedText as="p" className="text-2xl font-bold">
                {formatCurrency(0)}
              </LocalizedText>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>
                <LocalizedText>{t('dashboard.todayProfit')}</LocalizedText>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LocalizedText as="p" className="text-2xl font-bold text-green-600">
                {formatCurrency(0)}
              </LocalizedText>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>
                <LocalizedText>{t('dashboard.lowStockItems')}</LocalizedText>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LocalizedText as="p" className="text-2xl font-bold text-orange-600">
                0
              </LocalizedText>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>
                <LocalizedText>{t('dashboard.pendingPayments')}</LocalizedText>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LocalizedText as="p" className="text-2xl font-bold text-red-600">
                {formatCurrency(0)}
              </LocalizedText>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">
                <LocalizedText>{t('pos.newSale')}</LocalizedText>
              </CardTitle>
              <CardDescription>
                <LocalizedText>{t('pos.startNewSale', 'Start a new sale transaction')}</LocalizedText>
              </CardDescription>
            </CardHeader>
          </Card>

          {hasPermission('inventory') && (
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">
                  <LocalizedText>{t('navigation.products')}</LocalizedText>
                </CardTitle>
                <CardDescription>
                  <LocalizedText>{t('products.manageProducts', 'Manage product inventory')}</LocalizedText>
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">
                <LocalizedText>{t('navigation.customers')}</LocalizedText>
              </CardTitle>
              <CardDescription>
                <LocalizedText>{t('customers.manageCustomers', 'Manage customer accounts')}</LocalizedText>
              </CardDescription>
            </CardHeader>
          </Card>

          {hasPermission('suppliers') && (
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">
                  <LocalizedText>{t('navigation.suppliers')}</LocalizedText>
                </CardTitle>
                <CardDescription>
                  <LocalizedText>{t('suppliers.manageSuppliers', 'Manage supplier accounts')}</LocalizedText>
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {hasPermission('reports') && (
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">
                  <LocalizedText>{t('navigation.reports')}</LocalizedText>
                </CardTitle>
                <CardDescription>
                  <LocalizedText>{t('reports.viewReports', 'View sales and business reports')}</LocalizedText>
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {hasPermission('settings') && (
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">
                  <LocalizedText>{t('navigation.settings')}</LocalizedText>
                </CardTitle>
                <CardDescription>
                  <LocalizedText>{t('settings.systemSettings', 'Configure system settings')}</LocalizedText>
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>
              <LocalizedText>{t('dashboard.systemStatus', 'System Status')}</LocalizedText>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <LocalizedText className="text-sm">
                  {t('dashboard.apiStatus', 'API Status')}
                </LocalizedText>
                <span className="text-sm font-medium text-green-600">
                  {apiStatus}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <LocalizedText className="text-sm">
                  {t('dashboard.userRole', 'User Role')}
                </LocalizedText>
                <span className="text-sm font-medium text-blue-600">
                  <LocalizedText>{user?.role}</LocalizedText>
                </span>
              </div>
            </div>
          
          <div className="pt-4 border-t">
            <LocalizedText className="text-xs text-muted-foreground">
              Powered by {COMPANY_NAME} - {t('dashboard.authenticationActive', 'Authentication Active')}
            </LocalizedText>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default DashboardInterface;