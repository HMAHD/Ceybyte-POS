/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                  Supplier Dashboard Component                                    │
 * │                                                                                                  │
 * │  Description: Dashboard showing supplier summary statistics, alerts, and quick actions.         │
 * │               Includes visit reminders, payment alerts, and key metrics.                        │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Alert, 
  List, 
  Button, 
  Tag,
  Space,
  Divider,
  Progress
} from 'antd';
import {
  UserOutlined,
  DollarOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
  PhoneOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { supplierAPI, type VisitAlert, type PaymentReminder, type SupplierSummary } from '@/api/suppliers.api';

interface SupplierDashboardProps {
  onViewSupplier?: (supplierId: number) => void;
}

export const SupplierDashboard: React.FC<SupplierDashboardProps> = ({
  onViewSupplier
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<SupplierSummary | null>(null);
  const [visitAlerts, setVisitAlerts] = useState<VisitAlert[]>([]);
  const [paymentReminders, setPaymentReminders] = useState<PaymentReminder[]>([]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [summaryResponse, visitResponse, paymentResponse] = await Promise.all([
        supplierAPI.getSupplierSummary(),
        supplierAPI.getVisitAlerts(),
        supplierAPI.getPaymentReminders()
      ]);

      if (summaryResponse.success && summaryResponse.data) {
        setSummary(summaryResponse.data);
      }

      if (visitResponse.success && visitResponse.data) {
        setVisitAlerts(visitResponse.data);
      }

      if (paymentResponse.success && paymentResponse.data) {
        setPaymentReminders(paymentResponse.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('Total Suppliers')}
              value={summary?.total_suppliers || 0}
              prefix={<UserOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('Total Outstanding')}
              value={summary?.total_outstanding || 0}
              prefix={<DollarOutlined />}
              formatter={(value) => formatCurrency(Number(value))}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('Overdue Invoices')}
              value={summary?.overdue_invoices || 0}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: summary?.overdue_invoices ? '#cf1322' : undefined }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('Overdue Amount')}
              value={summary?.overdue_amount || 0}
              prefix={<DollarOutlined />}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: summary?.overdue_amount ? '#cf1322' : undefined }}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Visit Alerts */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <CalendarOutlined />
                {t('Visit Alerts')}
                {visitAlerts.length > 0 && (
                  <Tag color="orange">{visitAlerts.length}</Tag>
                )}
              </Space>
            }
            extra={
              <Button 
                type="link" 
                onClick={loadDashboardData}
                loading={loading}
              >
                {t('Refresh')}
              </Button>
            }
          >
            {visitAlerts.length === 0 ? (
              <Alert
                message={t('No visits due')}
                description={t('All supplier visits are up to date')}
                type="success"
                showIcon
              />
            ) : (
              <List
                dataSource={visitAlerts}
                renderItem={(alert) => (
                  <List.Item
                    actions={[
                      <Button
                        type="text"
                        icon={<PhoneOutlined />}
                        size="small"
                        disabled={!alert.phone}
                      >
                        {t('Call')}
                      </Button>,
                      <Button
                        type="text"
                        icon={<EyeOutlined />}
                        size="small"
                        onClick={() => onViewSupplier?.(alert.supplier_id)}
                      >
                        {t('View')}
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          {alert.supplier_name}
                          {alert.days_overdue > 0 ? (
                            <Tag color="red">
                              {t('Overdue')} {alert.days_overdue}d
                            </Tag>
                          ) : (
                            <Tag color="orange">{t('Due Today')}</Tag>
                          )}
                        </Space>
                      }
                      description={
                        <div>
                          {alert.contact_person && (
                            <div>{t('Contact')}: {alert.contact_person}</div>
                          )}
                          <div>{t('Frequency')}: {alert.visit_frequency}</div>
                          <div>{t('Next Visit')}: {alert.next_visit_date}</div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        {/* Payment Reminders */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <DollarOutlined />
                {t('Payment Reminders')}
                {paymentReminders.length > 0 && (
                  <Tag color="red">{paymentReminders.length}</Tag>
                )}
              </Space>
            }
            extra={
              <Button 
                type="link" 
                onClick={loadDashboardData}
                loading={loading}
              >
                {t('Refresh')}
              </Button>
            }
          >
            {paymentReminders.length === 0 ? (
              <Alert
                message={t('No overdue payments')}
                description={t('All supplier payments are up to date')}
                type="success"
                showIcon
              />
            ) : (
              <List
                dataSource={paymentReminders}
                renderItem={(reminder) => (
                  <List.Item
                    actions={[
                      <Button
                        type="text"
                        icon={<PhoneOutlined />}
                        size="small"
                        disabled={!reminder.phone}
                      >
                        {t('Call')}
                      </Button>,
                      <Button
                        type="text"
                        icon={<EyeOutlined />}
                        size="small"
                        onClick={() => onViewSupplier?.(reminder.supplier_id)}
                      >
                        {t('View')}
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          {reminder.supplier_name}
                          <Tag color="red">
                            {reminder.days_overdue}d {t('overdue')}
                          </Tag>
                        </Space>
                      }
                      description={
                        <div>
                          <div>{t('Invoice')}: {reminder.invoice_number}</div>
                          <div>{t('Due Date')}: {reminder.due_date}</div>
                          <div>{t('Amount')}: {formatCurrency(reminder.balance_amount)}</div>
                          {reminder.contact_person && (
                            <div>{t('Contact')}: {reminder.contact_person}</div>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Quick Analytics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title={t('Payment Performance')}>
            {summary && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>{t('Average Payment Terms')}</span>
                  <Tag color="blue">{summary.average_payment_terms.toFixed(0)} {t('days')}</Tag>
                </div>
                <div className="flex justify-between items-center">
                  <span>{t('Overdue Rate')}</span>
                  <Tag color={summary.overdue_invoices > 0 ? 'red' : 'green'}>
                    {summary.total_suppliers > 0 
                      ? ((summary.overdue_invoices / summary.total_suppliers) * 100).toFixed(1)
                      : 0}%
                  </Tag>
                </div>
                <div className="flex justify-between items-center">
                  <span>{t('Outstanding vs Total')}</span>
                  <Progress 
                    percent={summary.total_outstanding > 0 ? Math.min(100, (summary.total_outstanding / 1000000) * 100) : 0}
                    size="small"
                    strokeColor={summary.total_outstanding > 500000 ? '#f5222d' : '#52c41a'}
                  />
                </div>
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={t('Quick Actions')}>
            <Space wrap>
              <Button type="primary" icon={<UserOutlined />}>
                {t('Add New Supplier')}
              </Button>
              <Button icon={<DollarOutlined />}>
                {t('Record Payment')}
              </Button>
              <Button icon={<CalendarOutlined />}>
                {t('Schedule Visit')}
              </Button>
              <Button icon={<ExclamationCircleOutlined />}>
                {t('View All Alerts')}
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};