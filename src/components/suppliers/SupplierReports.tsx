/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                 Supplier Reports Dashboard                                       │
 * │                                                                                                  │
 * │  Description: Comprehensive supplier analytics and reporting dashboard with charts,             │
 * │               aging reports, performance metrics, and trend analysis.                            │
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
  Tabs,
  Table,
  Select,
  Button,
  Statistic,
  Progress,
  Tag,
  Space,
  Alert,
  Spin
} from 'antd';
import {
  BarChartOutlined,
  RiseOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  FileTextOutlined,
  DownloadOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  supplierAPI,
  type SupplierAnalytics,
  type SupplierAgingReport,
  type SupplierPerformanceReport,
  type SupplierSummary
} from '@/api/suppliers.api';
import {
  exportSupplierAnalytics,
  exportSupplierAging,
  exportSupplierPerformance,
  exportSupplierSummary
} from '@/utils/reportExport';

const { TabPane } = Tabs;
const { Option } = Select;

export const SupplierReports: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  // Data states
  const [summary, setSummary] = useState<SupplierSummary | null>(null);
  const [analytics, setAnalytics] = useState<SupplierAnalytics | null>(null);
  const [agingReport, setAgingReport] = useState<SupplierAgingReport | null>(null);
  const [performanceReport, setPerformanceReport] = useState<SupplierPerformanceReport | null>(null);

  const loadReportData = async () => {
    setLoading(true);
    try {
      const [summaryRes, analyticsRes, agingRes, performanceRes] = await Promise.all([
        supplierAPI.getSupplierSummary(),
        supplierAPI.getSupplierAnalytics(selectedPeriod),
        supplierAPI.getSupplierAgingReport(),
        supplierAPI.getSupplierPerformanceReport(undefined, selectedPeriod)
      ]);

      if (summaryRes.success && summaryRes.data) setSummary(summaryRes.data);
      if (analyticsRes.success && analyticsRes.data) setAnalytics(analyticsRes.data);
      if (agingRes.success && agingRes.data) setAgingReport(agingRes.data);
      if (performanceRes.success && performanceRes.data) setPerformanceReport(performanceRes.data);
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [selectedPeriod]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getAgingColor = (bucket: string) => {
    switch (bucket) {
      case 'current': return '#52c41a';
      case '1_30_days': return '#faad14';
      case '31_60_days': return '#fa8c16';
      case '61_90_days': return '#f5222d';
      case 'over_90_days': return '#722ed1';
      default: return '#d9d9d9';
    }
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return '#52c41a';
    if (percentage >= 70) return '#faad14';
    if (percentage >= 50) return '#fa8c16';
    return '#f5222d';
  };

  // Overview Tab
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('Total Suppliers')}
              value={summary?.total_suppliers || 0}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('Total Outstanding')}
              value={summary?.total_outstanding || 0}
              formatter={(value) => formatCurrency(Number(value))}
              prefix={<DollarOutlined />}
              valueStyle={{ color: summary?.total_outstanding ? '#f5222d' : undefined }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('Overdue Invoices')}
              value={summary?.overdue_invoices || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: summary?.overdue_invoices ? '#f5222d' : '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('Avg Payment Terms')}
              value={summary?.average_payment_terms || 0}
              suffix={t('days')}
              prefix={<RiseOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Payment Methods Distribution */}
      {analytics && (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title={t('Payment Methods Distribution')}>
              <div className="space-y-4">
                {Object.entries(analytics.payment_summary.by_method).map(([method, amount]) => {
                  const percentage = (amount / analytics.payment_summary.total_payments) * 100;
                  return (
                    <div key={method}>
                      <div className="flex justify-between mb-1">
                        <span className="capitalize">{method.replace('_', ' ')}</span>
                        <span>{formatCurrency(amount)}</span>
                      </div>
                      <Progress percent={percentage} showInfo={false} />
                    </div>
                  );
                })}
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title={t('Top Suppliers by Volume')}>
              <div className="space-y-3">
                {analytics.top_suppliers.slice(0, 5).map((supplier, index) => (
                  <div key={supplier.supplier_id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Tag color="blue">{index + 1}</Tag>
                      <span className="font-medium">{supplier.supplier_name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(supplier.total_amount)}</div>
                      <div className="text-sm text-gray-500">{supplier.invoice_count} invoices</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* Monthly Trends */}
      {analytics && analytics.monthly_trends.length > 0 && (
        <Card title={t('Monthly Trends')}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">{t('Month')}</th>
                  <th className="text-right p-2">{t('Invoices')}</th>
                  <th className="text-right p-2">{t('Invoice Amount')}</th>
                  <th className="text-right p-2">{t('Payments')}</th>
                  <th className="text-right p-2">{t('Payment Amount')}</th>
                </tr>
              </thead>
              <tbody>
                {analytics.monthly_trends.map((trend) => (
                  <tr key={trend.month} className="border-b">
                    <td className="p-2">{trend.month}</td>
                    <td className="text-right p-2">{trend.invoice_count}</td>
                    <td className="text-right p-2">{formatCurrency(trend.total_amount)}</td>
                    <td className="text-right p-2">{trend.payment_count}</td>
                    <td className="text-right p-2">{formatCurrency(trend.payment_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );

  // Aging Report Tab
  const renderAgingReport = () => {
    if (!agingReport) return <Spin size="large" />;

    const agingColumns: ColumnsType<any> = [
      {
        title: t('Invoice Number'),
        dataIndex: 'invoice_number',
        key: 'invoice_number',
      },
      {
        title: t('Supplier'),
        dataIndex: 'supplier_name',
        key: 'supplier_name',
      },
      {
        title: t('Due Date'),
        dataIndex: 'due_date',
        key: 'due_date',
        render: (date: string) => new Date(date).toLocaleDateString(),
      },
      {
        title: t('Days Overdue'),
        dataIndex: 'days_overdue',
        key: 'days_overdue',
        render: (days: number) => (
          <Tag color={days > 0 ? 'red' : 'green'}>
            {days > 0 ? `${days} days` : 'Current'}
          </Tag>
        ),
      },
      {
        title: t('Amount'),
        dataIndex: 'balance_amount',
        key: 'balance_amount',
        render: (amount: number) => formatCurrency(amount),
        align: 'right' as const,
      },
    ];

    return (
      <div className="space-y-6">
        {/* Aging Summary */}
        <Row gutter={[16, 16]}>
          {Object.entries(agingReport.aging_buckets).map(([bucket, data]) => (
            <Col xs={24} sm={12} md={8} lg={4} key={bucket}>
              <Card>
                <Statistic
                  title={bucket.replace('_', '-').replace('days', 'd')}
                  value={data.amount}
                  formatter={(value) => formatCurrency(Number(value))}
                  valueStyle={{ color: getAgingColor(bucket) }}
                />
                <div className="text-sm text-gray-500 mt-1">
                  {data.count} {t('invoices')}
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Aging Details */}
        <Tabs defaultActiveKey="over_90_days">
          {Object.entries(agingReport.aging_buckets).map(([bucket, data]) => (
            <TabPane
              tab={
                <span>
                  {bucket.replace('_', '-').replace('days', 'd')}
                  <Tag color={getAgingColor(bucket)} style={{ marginLeft: 8 }}>
                    {data.count}
                  </Tag>
                </span>
              }
              key={bucket}
            >
              <Table
                columns={agingColumns}
                dataSource={data.invoices}
                rowKey="invoice_id"
                pagination={{ pageSize: 10 }}
                size="small"
              />
            </TabPane>
          ))}
        </Tabs>
      </div>
    );
  };

  // Performance Report Tab
  const renderPerformanceReport = () => {
    if (!performanceReport) return <Spin size="large" />;

    const performanceColumns: ColumnsType<any> = [
      {
        title: t('Supplier'),
        dataIndex: 'supplier_name',
        key: 'supplier_name',
        render: (name: string, record: any) => (
          <div>
            <div className="font-medium">{name}</div>
            {record.contact_person && (
              <div className="text-sm text-gray-500">{record.contact_person}</div>
            )}
            {record.city && (
              <div className="text-xs text-gray-400">{record.city}</div>
            )}
          </div>
        ),
      },
      {
        title: t('Invoices'),
        key: 'invoices',
        render: (_, record: any) => (
          <div>
            <div>{record.metrics.total_invoices}</div>
            <div className="text-sm text-gray-500">
              {formatCurrency(record.metrics.average_invoice_amount)} avg
            </div>
          </div>
        ),
      },
      {
        title: t('Payment Performance'),
        key: 'payment_performance',
        render: (_, record: any) => (
          <div>
            <Progress
              percent={record.metrics.payment_timeliness_percent}
              size="small"
              strokeColor={getPerformanceColor(record.metrics.payment_timeliness_percent)}
            />
            <div className="text-xs text-gray-500 mt-1">
              {record.metrics.on_time_payments} on time, {record.metrics.late_payments} late
            </div>
          </div>
        ),
      },
      {
        title: t('Avg Delay'),
        dataIndex: ['metrics', 'average_delay_days'],
        key: 'average_delay_days',
        render: (days: number) => (
          <Tag color={days <= 5 ? 'green' : days <= 15 ? 'orange' : 'red'}>
            {days.toFixed(1)} days
          </Tag>
        ),
      },
      {
        title: t('Current Balance'),
        dataIndex: ['metrics', 'current_balance'],
        key: 'current_balance',
        render: (balance: number) => formatCurrency(balance),
        align: 'right' as const,
      },
      {
        title: t('Credit Utilization'),
        key: 'credit_utilization',
        render: (_, record: any) => (
          <Progress
            percent={record.metrics.credit_utilization_percent}
            size="small"
            strokeColor={record.metrics.credit_utilization_percent > 80 ? '#f5222d' : '#52c41a'}
          />
        ),
      },
    ];

    return (
      <div className="space-y-6">
        <Alert
          message={t('Performance Analysis')}
          description={t('Based on {{days}} days of data ending {{date}}', {
            days: performanceReport.period_days,
            date: new Date(performanceReport.report_date).toLocaleDateString()
          })}
          type="info"
          showIcon
        />

        <Table
          columns={performanceColumns}
          dataSource={performanceReport.suppliers}
          rowKey="supplier_id"
          pagination={{ pageSize: 20 }}
          scroll={{ x: 1200 }}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">{t('Supplier Reports & Analytics')}</h2>
        <Space>
          <Select
            value={selectedPeriod}
            onChange={setSelectedPeriod}
            style={{ width: 120 }}
          >
            <Option value={7}>7 {t('days')}</Option>
            <Option value={30}>30 {t('days')}</Option>
            <Option value={90}>90 {t('days')}</Option>
            <Option value={365}>1 {t('year')}</Option>
          </Select>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadReportData}
            loading={loading}
          >
            {t('Refresh')}
          </Button>
          <Button
            icon={<DownloadOutlined />}
            type="primary"
            onClick={() => {
              switch (activeTab) {
                case 'overview':
                  if (analytics) exportSupplierAnalytics(analytics);
                  if (summary) exportSupplierSummary(summary);
                  break;
                case 'aging':
                  if (agingReport) exportSupplierAging(agingReport);
                  break;
                case 'performance':
                  if (performanceReport) exportSupplierPerformance(performanceReport);
                  break;
              }
            }}
          >
            {t('Export')}
          </Button>
        </Space>
      </div>

      {/* Reports Tabs */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'overview',
              label: (
                <span>
                  <BarChartOutlined />
                  {t('Overview')}
                </span>
              ),
              children: renderOverview(),
            },
            {
              key: 'aging',
              label: (
                <span>
                  <ClockCircleOutlined />
                  {t('Aging Report')}
                </span>
              ),
              children: renderAgingReport(),
            },
            {
              key: 'performance',
              label: (
                <span>
                  <RiseOutlined />
                  {t('Performance')}
                </span>
              ),
              children: renderPerformanceReport(),
            },
          ]}
        />
      </Card>
    </div>
  );
};