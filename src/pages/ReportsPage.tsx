/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                     Reports Page                                                │
 * │                                                                                                  │
 * │  Description: Comprehensive business reports with sales, inventory, and supplier analytics.     │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState } from 'react';
import { Card, Row, Col, Tabs, DatePicker, Button, Statistic, Table, Tag } from 'antd';
import { 
  FileTextOutlined, 
  BarChartOutlined, 
  ShoppingOutlined,
  UserOutlined,
  TrophyOutlined,
  FileExcelOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import LocalizedText from '@/components/LocalizedText';
import { useTranslation } from '@/hooks/useTranslation';
import SalesTrendChart from '@/components/dashboard/SalesTrendChart';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const ReportsPage: React.FC = () => {
  const { t, formatCurrency } = useTranslation();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(7, 'days'),
    dayjs()
  ]);

  // Mock data for reports
  const salesReportData = [
    {
      key: '1',
      date: '2025-01-27',
      sales: 125000,
      transactions: 45,
      profit: 28000,
      avg_sale: 2777.78
    },
    {
      key: '2',
      date: '2025-01-26',
      sales: 98000,
      transactions: 38,
      profit: 22000,
      avg_sale: 2578.95
    },
    {
      key: '3',
      date: '2025-01-25',
      sales: 156000,
      transactions: 52,
      profit: 35000,
      avg_sale: 3000.00
    }
  ];

  const topProductsData = [
    {
      key: '1',
      product: 'Rice - Basmati',
      category: 'Grains',
      quantity_sold: 125.5,
      revenue: 37650,
      profit: 7530,
      profit_margin: 20
    },
    {
      key: '2',
      product: 'Coca Cola - 330ml',
      category: 'Beverages',
      quantity_sold: 240,
      revenue: 24000,
      profit: 4800,
      profit_margin: 20
    },
    {
      key: '3',
      product: 'Bread - White',
      category: 'Bakery',
      quantity_sold: 85,
      revenue: 8500,
      profit: 1700,
      profit_margin: 20
    }
  ];

  const supplierPerformanceData = [
    {
      key: '1',
      supplier: 'ABC Distributors',
      total_purchases: 450000,
      payment_status: 'overdue',
      days_overdue: 5,
      last_delivery: '2025-01-25',
      performance_score: 85
    },
    {
      key: '2',
      supplier: 'Fresh Foods Ltd',
      total_purchases: 280000,
      payment_status: 'current',
      days_overdue: 0,
      last_delivery: '2025-01-27',
      performance_score: 95
    },
    {
      key: '3',
      supplier: 'Lanka Beverages',
      total_purchases: 320000,
      payment_status: 'due_soon',
      days_overdue: 0,
      last_delivery: '2025-01-26',
      performance_score: 90
    }
  ];

  const salesColumns = [
    {
      title: t('common.date', 'Date'),
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY')
    },
    {
      title: t('dashboard.totalSales', 'Total Sales'),
      dataIndex: 'sales',
      key: 'sales',
      render: (value: number) => formatCurrency(value)
    },
    {
      title: t('dashboard.transactions', 'Transactions'),
      dataIndex: 'transactions',
      key: 'transactions'
    },
    {
      title: t('dashboard.totalProfit', 'Total Profit'),
      dataIndex: 'profit',
      key: 'profit',
      render: (value: number) => formatCurrency(value)
    },
    {
      title: t('dashboard.avgSaleValue', 'Avg Sale Value'),
      dataIndex: 'avg_sale',
      key: 'avg_sale',
      render: (value: number) => formatCurrency(value)
    }
  ];

  const productsColumns = [
    {
      title: t('products.productName', 'Product Name'),
      dataIndex: 'product',
      key: 'product'
    },
    {
      title: t('products.category', 'Category'),
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag color="blue">{category}</Tag>
    },
    {
      title: t('common.quantity', 'Quantity Sold'),
      dataIndex: 'quantity_sold',
      key: 'quantity_sold'
    },
    {
      title: t('dashboard.totalSales', 'Revenue'),
      dataIndex: 'revenue',
      key: 'revenue',
      render: (value: number) => formatCurrency(value)
    },
    {
      title: t('dashboard.totalProfit', 'Profit'),
      dataIndex: 'profit',
      key: 'profit',
      render: (value: number) => formatCurrency(value)
    },
    {
      title: 'Profit Margin',
      dataIndex: 'profit_margin',
      key: 'profit_margin',
      render: (value: number) => `${value}%`
    }
  ];

  const suppliersColumns = [
    {
      title: t('suppliers.title', 'Supplier'),
      dataIndex: 'supplier',
      key: 'supplier'
    },
    {
      title: 'Total Purchases',
      dataIndex: 'total_purchases',
      key: 'total_purchases',
      render: (value: number) => formatCurrency(value)
    },
    {
      title: 'Payment Status',
      dataIndex: 'payment_status',
      key: 'payment_status',
      render: (status: string, record: any) => {
        const color = status === 'overdue' ? 'red' : status === 'due_soon' ? 'orange' : 'green';
        const text = status === 'overdue' ? `Overdue (${record.days_overdue} days)` : 
                    status === 'due_soon' ? 'Due Soon' : 'Current';
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: 'Last Delivery',
      dataIndex: 'last_delivery',
      key: 'last_delivery',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY')
    },
    {
      title: 'Performance Score',
      dataIndex: 'performance_score',
      key: 'performance_score',
      render: (score: number) => (
        <Tag color={score >= 90 ? 'green' : score >= 80 ? 'orange' : 'red'}>
          {score}%
        </Tag>
      )
    }
  ];

  const handleExport = (reportType: string) => {
    console.log(`Exporting ${reportType} report for date range:`, dateRange);
    // In a real implementation, this would trigger the export
  };

  return (
    <div className="space-y-6">
      {/* Header with Date Range and Export */}
      <Card className="ceybyte-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <FileTextOutlined style={{ fontSize: 24, color: '#1890ff' }} />
            <div>
              <h2 className="text-xl font-semibold mb-0">
                <LocalizedText>{t('reports.title', 'Reports & Analytics')}</LocalizedText>
              </h2>
              <p className="text-gray-600 text-sm mb-0">
                <LocalizedText>{t('reports.subtitle', 'Comprehensive business insights and analytics')}</LocalizedText>
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
              format="MMM DD, YYYY"
            />
            <Button 
              type="primary" 
              icon={<FileExcelOutlined />}
              onClick={() => handleExport('comprehensive')}
            >
              <LocalizedText>{t('dashboard.exportExcel', 'Export to Excel')}</LocalizedText>
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary Statistics */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="ceybyte-card">
            <Statistic
              title={<LocalizedText>{t('dashboard.totalSales', 'Total Sales')}</LocalizedText>}
              value={379000}
              formatter={value => formatCurrency(Number(value))}
              valueStyle={{ color: '#1890ff', fontSize: '24px', fontWeight: 'bold' }}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="ceybyte-card">
            <Statistic
              title={<LocalizedText>{t('dashboard.totalProfit', 'Total Profit')}</LocalizedText>}
              value={85000}
              formatter={value => formatCurrency(Number(value))}
              valueStyle={{ color: '#52c41a', fontSize: '24px', fontWeight: 'bold' }}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="ceybyte-card">
            <Statistic
              title={<LocalizedText>{t('dashboard.totalTransactions', 'Total Transactions')}</LocalizedText>}
              value={135}
              valueStyle={{ color: '#722ed1', fontSize: '24px', fontWeight: 'bold' }}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="ceybyte-card">
            <Statistic
              title={<LocalizedText>{t('dashboard.avgSaleValue', 'Avg Sale Value')}</LocalizedText>}
              value={2807.41}
              formatter={value => formatCurrency(Number(value))}
              valueStyle={{ color: '#fa8c16', fontSize: '24px', fontWeight: 'bold' }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Sales Trend Chart */}
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <SalesTrendChart />
        </Col>
      </Row>

      {/* Detailed Reports Tabs */}
      <Card className="ceybyte-card">
        <Tabs defaultActiveKey="sales" size="large">
          <TabPane 
            tab={
              <span>
                <BarChartOutlined />
                <LocalizedText>{t('reports.salesReport', 'Sales Report')}</LocalizedText>
              </span>
            } 
            key="sales"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  <LocalizedText>{t('reports.dailySalesBreakdown', 'Daily Sales Breakdown')}</LocalizedText>
                </h3>
                <Button 
                  icon={<FileExcelOutlined />}
                  onClick={() => handleExport('sales')}
                >
                  <LocalizedText>{t('reports.exportSales', 'Export Sales Data')}</LocalizedText>
                </Button>
              </div>
              <Table
                columns={salesColumns}
                dataSource={salesReportData}
                pagination={false}
                size="middle"
              />
            </div>
          </TabPane>

          <TabPane 
            tab={
              <span>
                <TrophyOutlined />
                <LocalizedText>{t('reports.topProducts', 'Top Products')}</LocalizedText>
              </span>
            } 
            key="products"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  <LocalizedText>{t('reports.topSellingProducts', 'Top Selling Products')}</LocalizedText>
                </h3>
                <Button 
                  icon={<FileExcelOutlined />}
                  onClick={() => handleExport('products')}
                >
                  <LocalizedText>{t('reports.exportProducts', 'Export Product Data')}</LocalizedText>
                </Button>
              </div>
              <Table
                columns={productsColumns}
                dataSource={topProductsData}
                pagination={false}
                size="middle"
              />
            </div>
          </TabPane>

          <TabPane 
            tab={
              <span>
                <UserOutlined />
                <LocalizedText>{t('reports.supplierPerformance', 'Supplier Performance')}</LocalizedText>
              </span>
            } 
            key="suppliers"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  <LocalizedText>{t('reports.supplierAnalytics', 'Supplier Performance Analytics')}</LocalizedText>
                </h3>
                <Button 
                  icon={<FileExcelOutlined />}
                  onClick={() => handleExport('suppliers')}
                >
                  <LocalizedText>{t('reports.exportSuppliers', 'Export Supplier Data')}</LocalizedText>
                </Button>
              </div>
              <Table
                columns={suppliersColumns}
                dataSource={supplierPerformanceData}
                pagination={false}
                size="middle"
              />
            </div>
          </TabPane>

          <TabPane 
            tab={
              <span>
                <ShoppingOutlined />
                <LocalizedText>{t('reports.inventoryReport', 'Inventory Report')}</LocalizedText>
              </span>
            } 
            key="inventory"
          >
            <div className="text-center py-12">
              <ShoppingOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
              <h3 className="text-lg font-semibold mb-2">
                <LocalizedText>{t('reports.inventoryAnalytics', 'Inventory Analytics')}</LocalizedText>
              </h3>
              <p className="text-gray-600 mb-4">
                <LocalizedText>{t('reports.inventoryDescription', 'Detailed inventory reports with stock levels, movement history, and reorder recommendations.')}</LocalizedText>
              </p>
              <Button type="primary" icon={<ShoppingOutlined />}>
                <LocalizedText>{t('reports.viewInventory', 'View Inventory Details')}</LocalizedText>
              </Button>
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default ReportsPage;