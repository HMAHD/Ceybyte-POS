/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                  Helper Mode Interface                                           │
 * │                                                                                                  │
 * │  Description: Simplified interface for helper users with restricted access.                      │
 * │               Only allows basic sales operations with minimal UI complexity.                     │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import LocalizedText from '@/components/LocalizedText';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const HelperModeInterface: React.FC = () => {
  const { user, logout } = useAuth();
  const { t, formatCurrency } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <LocalizedText as="h1" className="text-xl font-semibold text-gray-900">
                {t('pos.pointOfSale')}
              </LocalizedText>
              <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                <LocalizedText>{t('auth.helperMode', 'Helper Mode')}</LocalizedText>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Product Search */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>
                  <LocalizedText>{t('pos.productSearch')}</LocalizedText>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  type="text"
                  placeholder={t('pos.scanBarcode')}
                />
                
                <div className="text-center text-muted-foreground text-sm">
                  <LocalizedText>{t('pos.scanBarcodeHint', 'Scan barcode or search product')}</LocalizedText>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Shopping Cart */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>
                  <LocalizedText>{t('pos.cart')}</LocalizedText>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center text-muted-foreground py-8">
                  <LocalizedText>{t('pos.emptyCart', 'Cart is empty')}</LocalizedText>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <LocalizedText>{t('common.total')}</LocalizedText>
                    <span>{formatCurrency(0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>
                  <LocalizedText>{t('pos.payment')}</LocalizedText>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button disabled className="w-full" variant="secondary">
                  <LocalizedText>{t('pos.cash')}</LocalizedText>
                </Button>
                
                <Button disabled className="w-full" variant="secondary">
                  <LocalizedText>{t('pos.card')}</LocalizedText>
                </Button>
                
                <div className="text-xs text-muted-foreground text-center">
                  <LocalizedText>{t('pos.addItemsFirst', 'Add items to cart first')}</LocalizedText>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Helper Instructions */}
        <Alert className="mt-8">
          <AlertDescription>
            <LocalizedText as="h3" className="text-lg font-medium mb-2">
              {t('auth.helperInstructions', 'Helper Mode Instructions')}
            </LocalizedText>
            <ul className="text-sm space-y-1">
              <li>• <LocalizedText>{t('auth.helperInstruction1', 'Scan product barcodes to add items')}</LocalizedText></li>
              <li>• <LocalizedText>{t('auth.helperInstruction2', 'Process cash payments only')}</LocalizedText></li>
              <li>• <LocalizedText>{t('auth.helperInstruction3', 'Call supervisor for discounts or returns')}</LocalizedText></li>
              <li>• <LocalizedText>{t('auth.helperInstruction4', 'Use F12 for quick cash sale')}</LocalizedText></li>
            </ul>
          </AlertDescription>
        </Alert>
      </main>
    </div>
  );
};

export default HelperModeInterface;