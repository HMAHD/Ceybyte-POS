/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                    Cash Flow Card Component                                      │
 * │                                                                                                  │
 * │  Description: Displays cash flow tracking with money in vs money out and running balance.      │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                  │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect } from 'react';
import { Card, List, Typography, Statistic, Row, Col, Spin, Alert } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from '@/hooks/useTranslation';
import LocalizedText from '@/components/LocalizedText';
import { dashboardApi, CashFlowEntry } from '@/api/dashboard.api';

const { Title, Text } = Typography;

const CashFlowCard: React.FC = () => {
  const { t, formatCurrency } = useTranslation();
  const [cashFlow, setCashFlow] = useState<CashFlowEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCashFlow = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardApi.getCashFlow(8);
      
      if (response.success && response.data) {
        setCashFlow(response.data);
      } else {
        setError(response.error || 'Failed to load cash flow data');
      }
    } catch (err) {
      console.error('Cash flow loading error:', err);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCashFlow();
  }, []);

  const calculateTotals = () => {
    const moneyIn = cashFlow
      .filter(entry => entry.amount > 0)
      .reduce((sum, entry) => sum + entry.amount, 0);
    
    const moneyOut = cashFlow
      .filter(entry => entry.amount < 0)
      .reduce((sum, entry) => sum + Math.abs(entry.amount), 0);
    
    const currentBalance = cashFlow.length > 0 ? cashFlow[cashFlow.length - 1].running_balance : 0;
    
    return { moneyIn, moneyOut, currentBalance };
  };

  const { moneyIn, moneyOut, currentBalance } = calculateTotals();

  const getTransactionIcon = (_type: string, amount: number) => {
    if (amount > 0) {
      return <ArrowUpOutlined style={{ color: '#52c41a' }} />;
    } else {
      return <ArrowDownOutlined style={{ color: '#f5222d' }} />;
    }
  };

  const getTransactionColor = (amount: number) => {
    return amount > 0 ? '#52c41a' : '#f5222d';
  };

  if (loading) {
    return (
      <Card className="ceybyte-card h-full">
        <div className="flex items-center justify-center h-64">
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="ceybyte-card h-full">
        <Alert
          message="Error Loading Cash Flow"
          description={error}
          type="error"
          action={
            <button
              onClick={loadCashFlow}
              className="text-blue-600 hover:text-blue-800"
            >
              <ReloadOutlined /> Retry
            </button>
          }
        />
      </Card>
    );
  }

  return (
    <Card 
      className="ceybyte-card h-full"
      title={
        <div className="flex items-center justify-between">
          <Title level={4} className="mb-0">
            <LocalizedText>{t('dashboard.cashFlow', 'Cash Flow')}</LocalizedText>
          </Title>
          <button
            onClick={loadCashFlow}
            className="text-gray-500 hover:text-gray-700"
          >
            <ReloadOutlined />
          </button>
        </div>
      }
    >
      {/* Summary Stats */}
      <Row gutter={16} className="mb-4">
        <Col span={8}>
          <Statistic
            title={<LocalizedText>{t('dashboard.moneyIn', 'Money In')}</LocalizedText>}
            value={moneyIn}
            formatter={value => formatCurrency(Number(value))}
            valueStyle={{ color: '#52c41a', fontSize: '18px', fontWeight: 'bold' }}
            prefix={<ArrowUpOutlined />}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title={<LocalizedText>{t('dashboard.moneyOut', 'Money Out')}</LocalizedText>}
            value={moneyOut}
            formatter={value => formatCurrency(Number(value))}
            valueStyle={{ color: '#f5222d', fontSize: '18px', fontWeight: 'bold' }}
            prefix={<ArrowDownOutlined />}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title={<LocalizedText>{t('dashboard.currentBalance', 'Current Balance')}</LocalizedText>}
            value={currentBalance}
            formatter={value => formatCurrency(Number(value))}
            valueStyle={{ 
              color: currentBalance >= 0 ? '#52c41a' : '#f5222d', 
              fontSize: '18px', 
              fontWeight: 'bold' 
            }}
          />
        </Col>
      </Row>

      {/* Transaction List */}
      <div className="max-h-64 overflow-y-auto">
        <List
          size="small"
          dataSource={cashFlow.slice(-10)} // Show last 10 transactions
          renderItem={(item) => (
            <List.Item className="px-0">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  {getTransactionIcon(item.type, item.amount)}
                  <div>
                    <Text strong>{item.description}</Text>
                    <br />
                    <Text type="secondary" className="text-xs">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </Text>
                  </div>
                </div>
                <div className="text-right">
                  <div 
                    className="font-semibold"
                    style={{ color: getTransactionColor(item.amount) }}
                  >
                    {item.amount > 0 ? '+' : ''}{formatCurrency(item.amount)}
                  </div>
                  <Text type="secondary" className="text-xs">
                    Balance: {formatCurrency(item.running_balance)}
                  </Text>
                </div>
              </div>
            </List.Item>
          )}
        />
      </div>
    </Card>
  );
};

export default CashFlowCard;