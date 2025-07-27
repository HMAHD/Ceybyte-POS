/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                     Reports Card Component                                       │
 * │                                                                                                  │
 * │  Description: Daily and monthly summary reports with Excel export functionality                 │
 * │               and comprehensive business analytics display.                                      │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                  │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Row, Col, Statistic, Spin, Alert, Modal, DatePicker } from 'antd';
import { 
  FileExcelOutlined, 
  DownloadOutlined, 
  ReloadOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { useTranslation } from '@/hooks/useTranslation';
import LocalizedText from '@/components/LocalizedText';
import { dashboardApi, MonthlyReport } from '@/api/dashboard.api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;


const ReportsCard: React.FC = () => {
  const { t, formatCurrency } = useTranslation();
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format('YYYY-MM'));

  const loadMonthlyReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardApi.getMonthlyReport(selectedMonth);
      
      if (response.success && response.data) {
        setMonthlyReport(response.data);
      } else {
        setError(response.error || 'Failed to load monthly report');
      }
    } catch (err) {
      console.error('Monthly report loading error:', err);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMonthlyReport();
  }, [selectedMonth]);

  const handleExport = async (reportType: 'daily' | 'monthly' | 'custom', startDate?: string, endDate?: string) => {
    try {
      setExportLoading(true);
      const response = await dashboardApi.exportToExcel(reportType, startDate, endDate);
      
      if (response.success && response.data) {
        // In a real implementation, this would trigger a download
        console.log('Export successful:', response.data);
        setExportModalVisible(false);
      } else {
        console.error('Export failed:', response.error);
      }
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setExportLoading(false);
    }
  };

  const formatMonthYear = (monthString: string) => {
    return dayjs(monthString).format('MMMM YYYY');
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
          message="Error Loading Reports"
          description={error}
          type="error"
          action={
            <button
              onClick={loadMonthlyReport}
              className="text-blue-600 hover:text-blue-800"
            >
              <ReloadOutlined /> Retry
            </button>
          }
        />
      </Card>
    );
  }

  if (!monthlyReport) {
    return null;
  }

  return (
    <>
      <Card 
        className="ceybyte-card h-full"
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChartOutlined />
              <Title level={4} className="mb-0">
                <LocalizedText>{t('dashboard.monthlyReport', 'Monthly Report')}</LocalizedText>
              </Title>
            </div>
            <div className="flex items-center space-x-2">
              <DatePicker
                picker="month"
                value={dayjs(selectedMonth)}
                onChange={(date) => setSelectedMonth(date?.format('YYYY-MM') || dayjs().format('YYYY-MM'))}
                size="small"
                format="MMM YYYY"
              />
              <button
                onClick={loadMonthlyReport}
                className="text-gray-500 hover:text-gray-700"
              >
                <ReloadOutlined />
              </button>
            </div>
          </div>
        }
        actions={[
          <Button 
            key="export" 
            type="primary" 
            icon={<FileExcelOutlined />}
            onClick={() => setExportModalVisible(true)}
            size="small"
          >
            <LocalizedText>{t('dashboard.exportExcel', 'Export to Excel')}</LocalizedText>
          </Button>
        ]}
      >
        <div className="space-y-4">
          {/* Month Summary */}
          <div className="text-center mb-4">
            <Title level={5} className="text-gray-600 mb-2">
              {formatMonthYear(monthlyReport.month)}
            </Title>
          </div>

          {/* Key Metrics */}
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Statistic
                title={<LocalizedText>{t('dashboard.totalSales', 'Total Sales')}</LocalizedText>}
                value={monthlyReport.total_sales}
                formatter={value => formatCurrency(Number(value))}
                valueStyle={{ color: '#1890ff', fontSize: '18px', fontWeight: 'bold' }}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title={<LocalizedText>{t('dashboard.totalProfit', 'Total Profit')}</LocalizedText>}
                value={monthlyReport.total_profit}
                formatter={value => formatCurrency(Number(value))}
                valueStyle={{ color: '#52c41a', fontSize: '18px', fontWeight: 'bold' }}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title={<LocalizedText>{t('dashboard.transactions', 'Transactions')}</LocalizedText>}
                value={monthlyReport.transaction_count}
                valueStyle={{ fontSize: '16px', fontWeight: 'bold' }}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title={<LocalizedText>{t('dashboard.avgSaleValue', 'Avg Sale Value')}</LocalizedText>}
                value={monthlyReport.average_sale_value}
                formatter={value => formatCurrency(Number(value))}
                valueStyle={{ fontSize: '16px', fontWeight: 'bold' }}
              />
            </Col>
          </Row>

          {/* Top Products */}
          <div className="mt-6">
            <Title level={5} className="mb-3">
              <LocalizedText>{t('dashboard.topProducts', 'Top Selling Products')}</LocalizedText>
            </Title>
            <div className="space-y-2">
              {monthlyReport.top_selling_products.slice(0, 3).map((product, index) => (
                <div key={product.product_id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <Text strong className="text-sm">{product.product_name}</Text>
                      <br />
                      <Text type="secondary" className="text-xs">
                        Qty: {product.quantity_sold}
                      </Text>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-green-600">
                      {formatCurrency(product.revenue)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Profit: {formatCurrency(product.profit)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mt-6">
            <Title level={5} className="mb-3">
              <LocalizedText>{t('dashboard.paymentMethods', 'Payment Methods')}</LocalizedText>
            </Title>
            <div className="space-y-2">
              {monthlyReport.payment_breakdown.map((payment) => (
                <div key={payment.method} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ 
                        backgroundColor: payment.method === 'cash' ? '#52c41a' : 
                                        payment.method === 'card' ? '#1890ff' :
                                        payment.method === 'mobile' ? '#722ed1' : '#faad14'
                      }}
                    />
                    <Text className="capitalize">{payment.method}</Text>
                  </div>
                  <div className="text-right">
                    <Text strong>{formatCurrency(payment.amount)}</Text>
                    <Text type="secondary" className="ml-2 text-xs">
                      ({payment.percentage}%)
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Export Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <FileExcelOutlined />
            <span><LocalizedText>{t('dashboard.exportReport', 'Export Report')}</LocalizedText></span>
          </div>
        }
        open={exportModalVisible}
        onCancel={() => setExportModalVisible(false)}
        footer={null}
      >
        <div className="space-y-4">
          <div>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => handleExport('daily')}
              loading={exportLoading}
              block
              className="mb-2"
            >
              <LocalizedText>{t('dashboard.exportDaily', 'Export Today\'s Report')}</LocalizedText>
            </Button>
            
            <Button
              icon={<DownloadOutlined />}
              onClick={() => handleExport('monthly', selectedMonth + '-01')}
              loading={exportLoading}
              block
              className="mb-2"
            >
              <LocalizedText>{t('dashboard.exportMonthly', 'Export Monthly Report')}</LocalizedText>
            </Button>
          </div>

          <div className="border-t pt-4">
            <Text strong className="block mb-2">
              <LocalizedText>{t('dashboard.customRange', 'Custom Date Range')}</LocalizedText>
            </Text>
            <RangePicker
              style={{ width: '100%', marginBottom: 12 }}
              format="YYYY-MM-DD"
            />
            <Button
              icon={<DownloadOutlined />}
              onClick={() => handleExport('custom')}
              loading={exportLoading}
              block
            >
              <LocalizedText>{t('dashboard.exportCustom', 'Export Custom Range')}</LocalizedText>
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ReportsCard;