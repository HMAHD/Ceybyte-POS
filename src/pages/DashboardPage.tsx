/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                      Dashboard Page                                              │
 * │                                                                                                  │
 * │  Description: Comprehensive business dashboard with sales analytics, cash flow tracking,        │
 * │               alerts system, cash drawer management, and reporting functionality.               │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                  │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Button, Spin, Alert } from 'antd';
import { 
  ShoppingCartOutlined, 
  UserOutlined, 
  FileTextOutlined,
  ReloadOutlined,
  DollarOutlined,
  TrophyOutlined,
  WarningOutlined,
  CreditCardOutlined
} from '@ant-design/icons';
import { useTranslation } from '@/hooks/useTranslation';
import LocalizedText from '@/components/LocalizedText';
import { dashboardApi, DashboardStats } from '@/api/dashboard.api';

// Dashboard component imports
import CashFlowCard from '@/components/dashboard/CashFlowCard';
import AlertsCard from '@/components/dashboard/AlertsCard';
import CashDrawerCard from '@/components/dashboard/CashDrawerCard';
import SalesTrendChart from '@/components/dashboard/SalesTrendChart';
import ReportsCard from '@/components/dashboard/ReportsCard';
import InventoryManagementCard from '@/components/dashboard/InventoryManagementCard';
import SupplierTrackingCard from '@/components/dashboard/SupplierTrackingCard';

const DashboardPage: React.FC = () => {
  const { t, formatCurrency } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardApi.getStats();
      
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError(response.error || 'Failed to load dashboard statistics');
      }
    } catch (err) {
      console.error('Dashboard stats loading error:', err);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error Loading Dashboard"
        description={error}
        type="error"
        action={
          <Button onClick={loadDashboardStats} icon={<ReloadOutlined />}>
            Retry
          </Button>
        }
      />
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Main Statistics - Large, Clear Numbers */}
      <div className="animate-slide-up">
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="ceybyte-card hover:shadow-lg transition-all duration-300">
              <Statistic
                title={<LocalizedText>{t('dashboard.todaySales', 'Today\'s Sales')}</LocalizedText>}
                value={stats.today_sales}
                formatter={value => formatCurrency(Number(value))}
                valueStyle={{ color: '#1890ff', fontSize: '28px', fontWeight: 'bold' }}
                prefix={<DollarOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="ceybyte-card hover:shadow-lg transition-all duration-300">
              <Statistic
                title={<LocalizedText>{t('dashboard.todayCosts', 'Today\'s Costs')}</LocalizedText>}
                value={stats.today_costs}
                formatter={value => formatCurrency(Number(value))}
                valueStyle={{ color: '#f5222d', fontSize: '28px', fontWeight: 'bold' }}
                prefix={<CreditCardOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="ceybyte-card hover:shadow-lg transition-all duration-300">
              <Statistic
                title={<LocalizedText>{t('dashboard.todayProfit', 'Today\'s Profit')}</LocalizedText>}
                value={stats.today_profit}
                formatter={value => formatCurrency(Number(value))}
                valueStyle={{ color: '#52c41a', fontSize: '28px', fontWeight: 'bold' }}
                prefix={<TrophyOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="ceybyte-card hover:shadow-lg transition-all duration-300">
              <Statistic
                title={<LocalizedText>{t('dashboard.transactions', 'Transactions')}</LocalizedText>}
                value={stats.today_transactions}
                valueStyle={{ color: '#722ed1', fontSize: '28px', fontWeight: 'bold' }}
                prefix={<ShoppingCartOutlined />}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Secondary Statistics */}
      <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="ceybyte-card">
              <Statistic
                title={<LocalizedText>{t('dashboard.cashInDrawer', 'Cash in Drawer')}</LocalizedText>}
                value={stats.cash_in_drawer}
                formatter={value => formatCurrency(Number(value))}
                valueStyle={{ fontSize: '18px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="ceybyte-card">
              <Statistic
                title={<LocalizedText>{t('dashboard.pendingReceivables', 'Pending Receivables')}</LocalizedText>}
                value={stats.pending_receivables}
                formatter={value => formatCurrency(Number(value))}
                valueStyle={{ color: '#faad14', fontSize: '18px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="ceybyte-card">
              <Statistic
                title={<LocalizedText>{t('dashboard.pendingPayables', 'Pending Payables')}</LocalizedText>}
                value={stats.pending_payables}
                formatter={value => formatCurrency(Number(value))}
                valueStyle={{ color: '#f5222d', fontSize: '18px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="ceybyte-card">
              <Statistic
                title={<LocalizedText>{t('dashboard.lowStockItems', 'Low Stock Items')}</LocalizedText>}
                value={stats.low_stock_items}
                valueStyle={{ 
                  color: stats.low_stock_items > 5 ? '#f5222d' : '#faad14', 
                  fontSize: '18px', 
                  fontWeight: 'bold' 
                }}
                prefix={<WarningOutlined />}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Main Dashboard Content */}
      <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <Row gutter={[24, 24]}>
          {/* Cash Flow Tracking */}
          <Col xs={24} lg={12}>
            <CashFlowCard />
          </Col>

          {/* Smart Alerts System */}
          <Col xs={24} lg={12}>
            <AlertsCard />
          </Col>
        </Row>
      </div>

      {/* Cash Drawer and Sales Trend */}
      <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
        <Row gutter={[24, 24]}>
          {/* Cash Drawer Management */}
          <Col xs={24} lg={8}>
            <CashDrawerCard />
          </Col>

          {/* Sales Trend Visualization */}
          <Col xs={24} lg={16}>
            <SalesTrendChart />
          </Col>
        </Row>
      </div>

      {/* Inventory and Supplier Management */}
      <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
        <Row gutter={[24, 24]}>
          {/* Inventory Management */}
          <Col xs={24} lg={12}>
            <InventoryManagementCard />
          </Col>

          {/* Supplier Tracking */}
          <Col xs={24} lg={12}>
            <SupplierTrackingCard />
          </Col>
        </Row>
      </div>

      {/* Reports and Quick Actions */}
      <div className="animate-slide-up" style={{ animationDelay: '500ms' }}>
        <Row gutter={[24, 24]}>
          {/* Reports Card */}
          <Col xs={24} lg={12}>
            <ReportsCard />
          </Col>

          {/* Quick Actions */}
          <Col xs={24} lg={12}>
            <Card 
              className="ceybyte-card h-full"
              title={
                <span className="text-lg font-semibold">
                  <LocalizedText>{t('dashboard.quickActions', 'Quick Actions')}</LocalizedText>
                </span>
              }
            >
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Button 
                    type="primary" 
                    icon={<ShoppingCartOutlined />} 
                    size="large"
                    className="ceybyte-btn ceybyte-btn-primary w-full h-16"
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-semibold">
                        <LocalizedText>{t('pos.startSale', 'Start New Sale')}</LocalizedText>
                      </span>
                      <span className="text-xs opacity-80">
                        <LocalizedText>{t('dashboard.pressF12', 'Press F12 for quick cash sale')}</LocalizedText>
                      </span>
                    </div>
                  </Button>
                </Col>
                <Col span={12}>
                  <Button 
                    icon={<FileTextOutlined />} 
                    size="large"
                    className="ceybyte-btn ceybyte-btn-secondary w-full h-12"
                  >
                    <LocalizedText>{t('navigation.products', 'Products')}</LocalizedText>
                  </Button>
                </Col>
                <Col span={12}>
                  <Button 
                    icon={<UserOutlined />} 
                    size="large"
                    className="ceybyte-btn ceybyte-btn-secondary w-full h-12"
                  >
                    <LocalizedText>{t('navigation.customers', 'Customers')}</LocalizedText>
                  </Button>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default DashboardPage;