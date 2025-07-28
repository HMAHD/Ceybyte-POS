/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                               Mobile Payment Integration Component                               │
 * │                                                                                                  │
 * │  Description: Sri Lankan mobile payment provider integration including eZ Cash, mCash,         │
 * │               PayHere, HELAPay, LankaQR, and GovPay with transaction processing.               │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Smartphone, 
  CreditCard, 
  QrCode, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Wallet,
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react';
import { getMobilePaymentProviders, type MobilePaymentProvider } from '@/api/sri-lankan-features.api';
import { formatCurrency } from '@/utils/formatting';

interface PaymentTransaction {
  id: string;
  provider: string;
  amount: number;
  phone: string;
  reference: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
}

export const MobilePayments: React.FC = () => {
  const { t } = useTranslation();
  const [providers, setProviders] = useState<MobilePaymentProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<MobilePaymentProvider | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);

  useEffect(() => {
    loadProviders();
    loadMockTransactions();
  }, []);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const response = await getMobilePaymentProviders();
      if (response.success && response.data) {
        setProviders(response.data.filter(p => p.is_active));
      } else {
        setError(response.error || 'Failed to load payment providers');
      }
    } catch (err) {
      setError('Network error while loading payment providers');
      console.error('Error loading providers:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMockTransactions = () => {
    // Mock transaction data for demonstration
    const mockTransactions: PaymentTransaction[] = [
      {
        id: 'TXN001',
        provider: 'ez_cash',
        amount: 2500,
        phone: '0771234567',
        reference: 'EZ123456789',
        status: 'completed',
        timestamp: new Date(Date.now() - 3600000)
      },
      {
        id: 'TXN002',
        provider: 'mcash',
        amount: 1800,
        phone: '0759876543',
        reference: 'MC987654321',
        status: 'completed',
        timestamp: new Date(Date.now() - 7200000)
      },
      {
        id: 'TXN003',
        provider: 'payhere',
        amount: 5000,
        phone: '0712345678',
        reference: 'PH456789123',
        status: 'pending',
        timestamp: new Date(Date.now() - 300000)
      }
    ];
    setTransactions(mockTransactions);
  };

  const processPayment = async () => {
    if (!selectedProvider || !paymentAmount || !customerPhone) {
      setError('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (amount < selectedProvider.min_amount || amount > selectedProvider.max_amount) {
      setError(`Amount must be between ${formatCurrency(selectedProvider.min_amount)} and ${formatCurrency(selectedProvider.max_amount)}`);
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newTransaction: PaymentTransaction = {
        id: `TXN${Date.now()}`,
        provider: selectedProvider.id,
        amount,
        phone: customerPhone,
        reference: `${selectedProvider.id.toUpperCase()}${Math.random().toString(36).substr(2, 9)}`,
        status: Math.random() > 0.1 ? 'completed' : 'failed', // 90% success rate
        timestamp: new Date()
      };

      setTransactions(prev => [newTransaction, ...prev]);
      
      if (newTransaction.status === 'completed') {
        setPaymentAmount('');
        setCustomerPhone('');
        setSelectedProvider(null);
      } else {
        setError('Payment failed. Please try again.');
      }
    } catch (err) {
      setError('Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  const getProviderIcon = (providerId: string) => {
    switch (providerId) {
      case 'ez_cash':
      case 'mcash':
        return <Smartphone className="h-6 w-6" />;
      case 'payhere':
        return <CreditCard className="h-6 w-6" />;
      case 'lankaqr':
        return <QrCode className="h-6 w-6" />;
      case 'govpay':
        return <Shield className="h-6 w-6" />;
      default:
        return <Wallet className="h-6 w-6" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatPhoneNumber = (phone: string) => {
    // Format Sri Lankan phone numbers
    if (phone.startsWith('0')) {
      return `+94 ${phone.substring(1)}`;
    }
    return phone;
  };

  const totalTransactions = transactions.length;
  const completedTransactions = transactions.filter(t => t.status === 'completed').length;
  const totalAmount = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('mobile_payments.title')}</h1>
          <p className="text-muted-foreground">{t('mobile_payments.description')}</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {t('mobile_payments.sri_lankan_providers')}
        </Badge>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="payment" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            {t('mobile_payments.process_payment')}
          </TabsTrigger>
          <TabsTrigger value="providers" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            {t('mobile_payments.providers')}
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            {t('mobile_payments.transaction_history')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payment" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  {t('mobile_payments.new_payment')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('mobile_payments.select_provider')}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {providers.slice(0, 6).map((provider) => (
                      <Button
                        key={provider.id}
                        variant={selectedProvider?.id === provider.id ? "default" : "outline"}
                        className="h-16 flex flex-col items-center gap-1"
                        onClick={() => setSelectedProvider(provider)}
                      >
                        {getProviderIcon(provider.id)}
                        <span className="text-xs">{provider.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {selectedProvider && (
                  <>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        {getProviderIcon(selectedProvider.id)}
                        <span className="font-medium">{selectedProvider.name}</span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>{t('mobile_payments.fee')}: {selectedProvider.fee_percentage}%</p>
                        <p>{t('mobile_payments.limits')}: {formatCurrency(selectedProvider.min_amount)} - {formatCurrency(selectedProvider.max_amount)}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">{t('mobile_payments.amount')}</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        className="text-right"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">{t('mobile_payments.customer_phone')}</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="077 123 4567"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                      />
                    </div>

                    {paymentAmount && (
                      <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{t('mobile_payments.amount')}</span>
                          <span>{formatCurrency(parseFloat(paymentAmount) || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>{t('mobile_payments.fee')} ({selectedProvider.fee_percentage}%)</span>
                          <span>{formatCurrency((parseFloat(paymentAmount) || 0) * selectedProvider.fee_percentage / 100)}</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-2">
                          <span>{t('mobile_payments.total')}</span>
                          <span>{formatCurrency((parseFloat(paymentAmount) || 0) * (1 + selectedProvider.fee_percentage / 100))}</span>
                        </div>
                      </div>
                    )}

                    <Button 
                      onClick={processPayment} 
                      disabled={processing || !paymentAmount || !customerPhone}
                      className="w-full"
                    >
                      {processing ? t('mobile_payments.processing') : t('mobile_payments.process_payment')}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Statistics */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-blue-700">
                    {t('mobile_payments.todays_stats')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{completedTransactions}</div>
                      <p className="text-xs text-gray-600">{t('mobile_payments.completed')}</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{formatCurrency(totalAmount)}</div>
                      <p className="text-xs text-gray-600">{t('mobile_payments.total_amount')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    {t('mobile_payments.recent_transactions')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {transactions.slice(0, 3).map((transaction) => {
                      const provider = providers.find(p => p.id === transaction.provider);
                      return (
                        <div key={transaction.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            {provider && getProviderIcon(provider.id)}
                            <div>
                              <div className="text-sm font-medium">{formatCurrency(transaction.amount)}</div>
                              <div className="text-xs text-gray-600">{formatPhoneNumber(transaction.phone)}</div>
                            </div>
                          </div>
                          <Badge className={`text-xs ${getStatusColor(transaction.status)}`}>
                            {getStatusIcon(transaction.status)}
                            <span className="ml-1">{t(`mobile_payments.status.${transaction.status}`)}</span>
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {providers.map((provider) => (
              <Card key={provider.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {getProviderIcon(provider.id)}
                    <div>
                      <h3 className="font-semibold">{provider.name}</h3>
                      {provider.name_si && (
                        <p className="text-sm text-gray-600 font-sinhala">{provider.name_si}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('mobile_payments.fee')}</span>
                      <span className="font-medium">{provider.fee_percentage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('mobile_payments.min_amount')}</span>
                      <span className="font-medium">{formatCurrency(provider.min_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('mobile_payments.max_amount')}</span>
                      <span className="font-medium">{formatCurrency(provider.max_amount)}</span>
                    </div>
                  </div>
                  <Badge 
                    variant={provider.is_active ? "default" : "secondary"} 
                    className="mt-3 w-full justify-center"
                  >
                    {provider.is_active ? t('mobile_payments.active') : t('mobile_payments.inactive')}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {t('mobile_payments.transaction_history')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.map((transaction) => {
                  const provider = providers.find(p => p.id === transaction.provider);
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {provider && getProviderIcon(provider.id)}
                        <div>
                          <div className="font-medium">{transaction.reference}</div>
                          <div className="text-sm text-gray-600">
                            {provider?.name} • {formatPhoneNumber(transaction.phone)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {transaction.timestamp.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-lg">{formatCurrency(transaction.amount)}</div>
                        <Badge className={`text-xs ${getStatusColor(transaction.status)}`}>
                          {getStatusIcon(transaction.status)}
                          <span className="ml-1">{t(`mobile_payments.status.${transaction.status}`)}</span>
                        </Badge>
                      </div>
                    </div>
                  );
                })}
                {transactions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    {t('mobile_payments.no_transactions')}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};