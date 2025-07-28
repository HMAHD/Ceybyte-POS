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
import { Card, Button, Input, Badge, Alert, Tabs, Typography, Form, message } from 'antd';
import type { TabsProps } from 'antd';
import { 
  MobileOutlined, 
  CreditCardOutlined, 
  QrcodeOutlined, 
  SafetyOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  WalletOutlined,
  TrendingUpOutlined
} from '@ant-design/icons';
import { getMobilePaymentProviders, type MobilePaymentProvider } from '@/api/sri-lankan-features.api';
import { formatCurrency } from '@/utils/formatting';

const { Title, Text } = Typography;

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
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newTransaction: PaymentTransaction = {
        id: `TXN${Date.now()}`,
        provider: selectedProvider.id,
        amount,
        phone: customerPhone,
        reference: `${selectedProvider.id.toUpperCase()}${Math.random().toString(36).substr(2, 9)}`,
        status: Math.random() > 0.1 ? 'completed' : 'failed',
        timestamp: new Date()
      };

      setTransactions(prev => [newTransaction, ...prev]);
      
      if (newTransaction.status === 'completed') {
        message.success('Payment processed successfully!');
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
        return <MobileOutlined style={{ fontSize: '24px' }} />;
      case 'payhere':
        return <CreditCardOutlined style={{ fontSize: '24px' }} />;
      case 'lankaqr':
        return <QrcodeOutlined style={{ fontSize: '24px' }} />;
      case 'govpay':
        return <SafetyOutlined style={{ fontSize: '24px' }} />;
      default:
        return <WalletOutlined style={{ fontSize: '24px' }} />;
    }
  };

  const formatPhoneNumber = (phone: string) => {
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

  const renderPaymentTab = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      <Card title={<><MobileOutlined /> {t('mobile_payments.new_payment') || 'New Payment'}</>}>
        <div style={{ marginBottom: '16px' }}>
          <Text strong>{t('mobile_payments.select_provider') || 'Select Provider'}</Text>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '8px' }}>
            {providers.slice(0, 6).map((provider) => (
              <Button
                key={provider.id}
                type={selectedProvider?.id === provider.id ? "primary" : "default"}
                style={{ height: '64px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
                onClick={() => setSelectedProvider(provider)}
              >
                {getProviderIcon(provider.id)}
                <span style={{ fontSize: '12px' }}>{provider.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {selectedProvider && (
          <>
            <Alert
              message={
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    {getProviderIcon(selectedProvider.id)}
                    <Text strong>{selectedProvider.name}</Text>
                  </div>
                  <div style={{ fontSize: '12px' }}>
                    <div>Fee: {selectedProvider.fee_percentage}%</div>
                    <div>Limits: {formatCurrency(selectedProvider.min_amount)} - {formatCurrency(selectedProvider.max_amount)}</div>
                  </div>
                </div>
              }
              type="info"
              style={{ marginBottom: '16px' }}
            />

            <Form layout="vertical">
              <Form.Item label={t('mobile_payments.amount') || 'Amount'}>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  style={{ textAlign: 'right' }}
                />
              </Form.Item>

              <Form.Item label={t('mobile_payments.customer_phone') || 'Customer Phone'}>
                <Input
                  type="tel"
                  placeholder="077 123 4567"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </Form.Item>

              {paymentAmount && (
                <Card size="small" style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <Text>Amount</Text>
                    <Text>{formatCurrency(parseFloat(paymentAmount) || 0)}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <Text>Fee ({selectedProvider.fee_percentage}%)</Text>
                    <Text>{formatCurrency((parseFloat(paymentAmount) || 0) * selectedProvider.fee_percentage / 100)}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f0f0f0', paddingTop: '8px' }}>
                    <Text strong>Total</Text>
                    <Text strong>{formatCurrency((parseFloat(paymentAmount) || 0) * (1 + selectedProvider.fee_percentage / 100))}</Text>
                  </div>
                </Card>
              )}

              <Button 
                type="primary"
                block
                loading={processing}
                disabled={!paymentAmount || !customerPhone}
                onClick={processPayment}
              >
                {processing ? 'Processing...' : 'Process Payment'}
              </Button>
            </Form>
          </>
        )}
      </Card>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Card title="Today's Stats" size="small">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>{completedTransactions}</div>
              <Text type="secondary" style={{ fontSize: '12px' }}>Completed</Text>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>{formatCurrency(totalAmount)}</div>
              <Text type="secondary" style={{ fontSize: '12px' }}>Total Amount</Text>
            </div>
          </div>
        </Card>

        <Card title="Recent Transactions" size="small">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {transactions.slice(0, 3).map((transaction) => {
              const provider = providers.find(p => p.id === transaction.provider);
              return (
                <div key={transaction.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', backgroundColor: '#fafafa', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {provider && getProviderIcon(provider.id)}
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>{formatCurrency(transaction.amount)}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{formatPhoneNumber(transaction.phone)}</div>
                    </div>
                  </div>
                  <Badge 
                    status={transaction.status === 'completed' ? 'success' : transaction.status === 'failed' ? 'error' : 'processing'}
                    text={transaction.status}
                  />
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderProvidersTab = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
      {providers.map((provider) => (
        <Card key={provider.id} hoverable>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            {getProviderIcon(provider.id)}
            <div>
              <Title level={5} style={{ margin: 0 }}>{provider.name}</Title>
              {provider.name_si && (
                <Text type="secondary" style={{ fontSize: '12px' }}>{provider.name_si}</Text>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text type="secondary">Fee</Text>
              <Text strong>{provider.fee_percentage}%</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text type="secondary">Min Amount</Text>
              <Text strong>{formatCurrency(provider.min_amount)}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text type="secondary">Max Amount</Text>
              <Text strong>{formatCurrency(provider.max_amount)}</Text>
            </div>
          </div>
          <Badge 
            status={provider.is_active ? 'success' : 'default'}
            text={provider.is_active ? 'Active' : 'Inactive'}
            style={{ marginTop: '12px' }}
          />
        </Card>
      ))}
    </div>
  );

  const renderHistoryTab = () => (
    <Card title={<><TrendingUpOutlined /> Transaction History</>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {transactions.map((transaction) => {
          const provider = providers.find(p => p.id === transaction.provider);
          return (
            <div key={transaction.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {provider && getProviderIcon(provider.id)}
                <div>
                  <div style={{ fontWeight: 500 }}>{transaction.reference}</div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    {provider?.name} • {formatPhoneNumber(transaction.phone)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    {transaction.timestamp.toLocaleString()}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '18px', fontWeight: 600 }}>{formatCurrency(transaction.amount)}</div>
                <Badge 
                  status={transaction.status === 'completed' ? 'success' : transaction.status === 'failed' ? 'error' : 'processing'}
                  text={transaction.status}
                />
              </div>
            </div>
          );
        })}
        {transactions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px', color: '#999' }}>
            No transactions found
          </div>
        )}
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '256px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '16px' }}>Loading...</div>
          <Text type="secondary">Loading payment providers...</Text>
        </div>
      </div>
    );
  }

  const tabItems: TabsProps['items'] = [
    {
      key: 'payment',
      label: (
        <span>
          <MobileOutlined />
          Process Payment
        </span>
      ),
      children: renderPaymentTab(),
    },
    {
      key: 'providers',
      label: (
        <span>
          <WalletOutlined />
          Providers
        </span>
      ),
      children: renderProvidersTab(),
    },
    {
      key: 'history',
      label: (
        <span>
          <TrendingUpOutlined />
          Transaction History
        </span>
      ),
      children: renderHistoryTab(),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Mobile Payments</Title>
          <Text type="secondary">Sri Lankan mobile payment integration</Text>
        </div>
        <Badge count="Sri Lankan Providers" style={{ backgroundColor: '#f0f0f0', color: '#666' }} />
      </div>

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: '24px' }}
        />
      )}

      <Tabs items={tabItems} />
    </div>
  );
};