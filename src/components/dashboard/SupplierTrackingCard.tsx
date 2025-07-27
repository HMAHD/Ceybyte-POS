/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                               Supplier Tracking Card Component                                   │
 * │                                                                                                  │
 * │  Description: Supplier payment tracking with overdue payments alerts and visit reminders.      │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                  │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect } from 'react';
import { Card, List, Typography, Button, Spin, Alert, Badge, Tag } from 'antd';
import { 
  UserOutlined, 
  ReloadOutlined, 
  CalendarOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useTranslation } from '@/hooks/useTranslation';
import LocalizedText from '@/components/LocalizedText';

const { Title, Text } = Typography;

interface SupplierAlert {
  id: number;
  supplier_name: string;
  type: 'overdue_payment' | 'visit_reminder' | 'payment_due';
  amount?: number;
  days_overdue?: number;
  next_visit_date?: string;
  last_visit_date?: string;
  priority: 'high' | 'medium' | 'low';
  message: string;
}

const SupplierTrackingCard: React.FC = () => {
  const { t, formatCurrency } = useTranslation();
  const [supplierAlerts, setSupplierAlerts] = useState<SupplierAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data generator for supplier alerts
  const generateMockSupplierAlerts = (): SupplierAlert[] => {
    return [
      {
        id: 1,
        supplier_name: "ABC Distributors",
        type: "overdue_payment",
        amount: 45000,
        days_overdue: 5,
        priority: "high",
        message: "Payment overdue by 5 days"
      },
      {
        id: 2,
        supplier_name: "Fresh Foods Ltd",
        type: "visit_reminder",
        next_visit_date: "2025-01-28",
        last_visit_date: "2025-01-21",
        priority: "medium",
        message: "Scheduled visit tomorrow"
      },
      {
        id: 3,
        supplier_name: "Lanka Beverages",
        type: "payment_due",
        amount: 28500,
        priority: "medium",
        message: "Payment due in 2 days"
      },
      {
        id: 4,
        supplier_name: "Spice World",
        type: "overdue_payment",
        amount: 12000,
        days_overdue: 12,
        priority: "high",
        message: "Payment overdue by 12 days"
      }
    ];
  };

  const loadSupplierAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockData = generateMockSupplierAlerts();
      setSupplierAlerts(mockData);
    } catch (err) {
      console.error('Supplier alerts loading error:', err);
      setError('Failed to load supplier data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSupplierAlerts();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'processing';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'overdue_payment':
        return <ExclamationCircleOutlined style={{ color: '#f5222d' }} />;
      case 'visit_reminder':
        return <CalendarOutlined style={{ color: '#1890ff' }} />;
      case 'payment_due':
        return <ClockCircleOutlined style={{ color: '#faad14' }} />;
      default:
        return <UserOutlined />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'overdue_payment':
        return t('dashboard.overduePayment', 'Overdue Payment');
      case 'visit_reminder':
        return t('dashboard.visitReminder', 'Visit Reminder');
      case 'payment_due':
        return t('dashboard.paymentDue', 'Payment Due');
      default:
        return t('dashboard.notification', 'Notification');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString();
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
          message="Error Loading Supplier Data"
          description={error}
          type="error"
          action={
            <button
              onClick={loadSupplierAlerts}
              className="text-blue-600 hover:text-blue-800"
            >
              <ReloadOutlined /> Retry
            </button>
          }
        />
      </Card>
    );
  }

  const overdueCount = supplierAlerts.filter(alert => alert.type === 'overdue_payment').length;
  const visitCount = supplierAlerts.filter(alert => alert.type === 'visit_reminder').length;

  return (
    <Card
      className="ceybyte-card h-full"
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserOutlined />
            <Title level={4} className="mb-0">
              <LocalizedText>{t('dashboard.supplierTracking', 'Supplier Tracking')}</LocalizedText>
            </Title>
            <div className="flex space-x-1">
              {overdueCount > 0 && <Badge count={overdueCount} />}
              {visitCount > 0 && <Badge count={visitCount} color="blue" />}
            </div>
          </div>
          <button
            onClick={loadSupplierAlerts}
            className="text-gray-500 hover:text-gray-700"
          >
            <ReloadOutlined />
          </button>
        </div>
      }
      actions={[
        <Button 
          key="manage" 
          type="primary" 
          icon={<UserOutlined />}
          size="small"
        >
          <LocalizedText>{t('dashboard.manageSuppliers', 'Manage Suppliers')}</LocalizedText>
        </Button>
      ]}
    >
      {supplierAlerts.length === 0 ? (
        <div className="text-center py-8">
          <UserOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
          <Text type="secondary">
            <LocalizedText>{t('dashboard.allSuppliersUpToDate', 'All suppliers are up to date')}</LocalizedText>
          </Text>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-2">
            {overdueCount > 0 && (
              <div className="bg-red-50 border border-red-200 rounded p-2 text-center">
                <div className="text-lg font-bold text-red-600">{overdueCount}</div>
                <div className="text-xs text-red-600">
                  <LocalizedText>{t('dashboard.overduePayments', 'Overdue Payments')}</LocalizedText>
                </div>
              </div>
            )}
            {visitCount > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded p-2 text-center">
                <div className="text-lg font-bold text-blue-600">{visitCount}</div>
                <div className="text-xs text-blue-600">
                  <LocalizedText>{t('dashboard.upcomingVisits', 'Upcoming Visits')}</LocalizedText>
                </div>
              </div>
            )}
          </div>

          {/* Supplier Alerts List */}
          <div className="max-h-64 overflow-y-auto">
            <List
              size="small"
              dataSource={supplierAlerts}
              renderItem={(alert) => (
                <List.Item className="px-0">
                  <div className="flex items-start space-x-3 w-full">
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(alert.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <Text strong className="text-sm">
                          {alert.supplier_name}
                        </Text>
                        <Badge
                          status={getPriorityColor(alert.priority) as any}
                          text={getTypeLabel(alert.type)}
                        />
                      </div>
                      
                      <Text className="text-xs text-gray-600 block mb-2">
                        {alert.message}
                      </Text>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {alert.amount && (
                            <Tag color={alert.type === 'overdue_payment' ? 'red' : 'orange'}>
                              {formatCurrency(alert.amount)}
                            </Tag>
                          )}
                          {alert.days_overdue && (
                            <Tag color="red">
                              {alert.days_overdue} days overdue
                            </Tag>
                          )}
                          {alert.next_visit_date && (
                            <Tag color="blue">
                              {formatDate(alert.next_visit_date)}
                            </Tag>
                          )}
                        </div>
                        
                        <Button
                          type="link"
                          size="small"
                          className="p-0 h-auto text-xs"
                        >
                          <LocalizedText>
                            {alert.type === 'overdue_payment' 
                              ? t('dashboard.recordPayment', 'Record Payment')
                              : alert.type === 'visit_reminder'
                              ? t('dashboard.markVisited', 'Mark Visited')
                              : t('dashboard.viewDetails', 'View Details')
                            }
                          </LocalizedText>
                        </Button>
                      </div>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </div>
        </div>
      )}
    </Card>
  );
};

export default SupplierTrackingCard;