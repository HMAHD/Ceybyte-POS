/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                    Dashboard Page                                                │
 * │                                                                                                  │
 * │  Description: Main dashboard page showing business overview, quick stats,                        │
 * │               and quick action cards for common POS operations.                                  │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Typography,
  Statistic,
  Divider,
} from 'antd';
import {
  ShoppingCartOutlined,
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  SettingOutlined,
  DollarOutlined,
  ExclamationOutlined,
  CreditCardOutlined,
  ShopTwoTone,
  ContactsTwoTone,
  UsergroupAddOutlined,
  BarChartOutlined,
  ControlTwoTone,
  ShoppingTwoTone,
  CustomerServiceTwoTone,
  AppstoreTwoTone,
  PieChartTwoTone,
  SettingTwoTone,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import LocalizedText from '@/components/LocalizedText';
import { ContentLoading, InlineLoading } from '@/components/LoadingStates';
import { apiClient } from '@/api/client';

const { Title, Text } = Typography;

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const { t, formatCurrency } = useTranslation();
  const [apiStatus, setApiStatus] = useState<string>('Checking...');
  const [statsLoading, setStatsLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    todaySales: 0,
    todayProfit: 0,
    lowStockItems: 0,
    pendingPayments: 0,
  });

  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    try {
      await Promise.all([checkApiHealth(), loadDashboardStats()]);
    } catch (error) {
      console.error('Dashboard initialization error:', error);
    }
  };

  const checkApiHealth = async () => {
    try {
      const response = await apiClient.healthCheck();
      if (response.success && response.data) {
        setApiStatus(`${response.data.service} - ${response.data.status}`);
      } else {
        setApiStatus('API connection failed');
      }
    } catch (error) {
      console.error('API Error:', error);
      setApiStatus('API not available');
    }
  };

  const loadDashboardStats = async () => {
    setStatsLoading(true);
    try {
      // Simulate API calls for dashboard stats
      await new Promise(resolve => setTimeout(resolve, 800));

      setDashboardStats({
        todaySales: 125000,
        todayProfit: 25000,
        lowStockItems: 3,
        pendingPayments: 45000,
      });
    } catch (error) {
      console.error('Stats loading error:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  return (
    <div className='p-4 h-full'>
      <div className='max-w-full mx-auto h-full flex flex-col'>
        {/* Welcome Section */}
        <div className='mb-4 flex-shrink-0'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <Title level={2} className='mb-2 text-gray-800'>
                <LocalizedText>
                  {t('dashboard.welcome', `Welcome, ${user?.name}`)}
                </LocalizedText>
              </Title>
              <Text type='secondary' className='text-sm'>
                <LocalizedText>{new Date().toLocaleDateString()}</LocalizedText>
              </Text>
            </div>
            <div className='flex items-center space-x-3'>
              <div className='status-dot online'></div>
              <Text type='secondary'>System Online</Text>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className='flex-shrink-0'>
        <ContentLoading
          loading={statsLoading}
          skeleton={
            <Row gutter={[16, 16]} className='mb-4'>
              {[1, 2, 3, 4].map(i => (
                <Col xs={12} sm={6} lg={6} key={i}>
                  <Card loading className='modern-card' />
                </Col>
              ))}
            </Row>
          }
        >
          <Row gutter={[8, 6]} className='mb-1'>
            <Col xs={24} sm={12} lg={6}>
              <Card className='modern-card hover-lift'>
                <div className='flex items-center justify-between'>
                  <Statistic
                    title={
                      <span className='text-gray-600 font-medium'>
                        <LocalizedText>{t('dashboard.todaySales')}</LocalizedText>
                      </span>
                    }
                    value={dashboardStats.todaySales}
                    formatter={value => formatCurrency(Number(value))}
                    valueStyle={{ 
                      color: '#0066cc', 
                      fontSize: '1.5rem',
                      fontWeight: '600'
                    }}
                  />
                  <div className='w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center'>
                    <ShoppingCartOutlined className='text-blue-500 text-sm' />
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card className='modern-card hover-lift'>
                <div className='flex items-center justify-between'>
                  <Statistic
                    title={
                      <span className='text-gray-600 font-medium'>
                        <LocalizedText>{t('dashboard.todayProfit')}</LocalizedText>
                      </span>
                    }
                    value={dashboardStats.todayProfit}
                    formatter={value => formatCurrency(Number(value))}
                    valueStyle={{ 
                      color: '#22c55e', 
                      fontSize: '1.5rem',
                      fontWeight: '600'
                    }}
                  />
                  <div className='w-8 h-8 rounded-full bg-green-50 flex items-center justify-center hover-scale'>
                    <DollarOutlined className='text-green-500 text-sm' />
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card className='modern-card hover-lift'>
                <div className='flex items-center justify-between'>
                  <Statistic
                    title={
                      <span className='text-gray-600 font-medium'>
                        <LocalizedText>
                          {t('dashboard.lowStockItems')}
                        </LocalizedText>
                      </span>
                    }
                    value={dashboardStats.lowStockItems}
                    valueStyle={{ 
                      color: '#f59e0b', 
                      fontSize: '1.5rem',
                      fontWeight: '600'
                    }}
                  />
                  <div className='w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center hover-scale'>
                    <ExclamationOutlined className='text-orange-500 text-sm' />
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card className='modern-card hover-lift'>
                <div className='flex items-center justify-between'>
                  <Statistic
                    title={
                      <span className='text-gray-600 font-medium'>
                        <LocalizedText>
                          {t('dashboard.pendingPayments')}
                        </LocalizedText>
                      </span>
                    }
                    value={dashboardStats.pendingPayments}
                    formatter={value => formatCurrency(Number(value))}
                    valueStyle={{ 
                      color: '#ef4444', 
                      fontSize: '1.5rem',
                      fontWeight: '600'
                    }}
                  />
                  <div className='w-8 h-8 rounded-full bg-red-50 flex items-center justify-center hover-scale'>
                    <CreditCardOutlined className='text-red-500 text-sm' />
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </ContentLoading>
        </div>

        {/* Quick Actions */}
        <div className='flex-shrink-0 mb-4'>
          <div className='mb-4 text-lg font-semibold text-gray-700'>
            <LocalizedText>Quick Actions</LocalizedText>
          </div>
          <Row gutter={[8, 8]}>
          <Col xs={12} sm={8} md={6} lg={4} xl={4}>
            <Card
              className='modern-card hover-lift'
              size='small'
              actions={[
                <Button
                  key='start-sale'
                  className='modern-button gradient-button'
                  icon={<ShoppingCartOutlined />}
                  block
                  size='large'
                  onClick={() => navigate('/pos')}
                >
                  <LocalizedText>
                    {t('pos.startSale', 'Start Sale')}
                  </LocalizedText>
                </Button>,
              ]}
            >
              <div className='text-center py-2 px-1'>
                <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mx-auto mb-2 shadow-sm hover-scale'>
                  <ShoppingTwoTone className='text-white text-base' twoToneColor={['#ffffff', '#e3f2fd']} />
                </div>
                <div className='text-xs font-medium text-gray-800 mb-1'>
                  <LocalizedText>{t('pos.newSale')}</LocalizedText>
                </div>
                <div className='text-xs text-gray-500 text-center hidden md:block'>
                  <LocalizedText>
                    {t('pos.startNewSale', 'Start a new sale transaction')}
                  </LocalizedText>
                </div>
              </div>
            </Card>
          </Col>

          {hasPermission('inventory') && (
            <Col xs={12} sm={8} md={6} lg={4} xl={4}>
              <Card
                className='modern-card hover-lift'
                size='small'
                actions={[
                  <Button
                    key='manage-products'
                    className='modern-button gradient-button'
                    icon={<FileTextOutlined />}
                    block
                    size='large'
                    onClick={() => navigate('/products')}
                  >
                    <LocalizedText>
                      {t('navigation.manage', 'Manage')}
                    </LocalizedText>
                  </Button>,
                ]}
              >
                <div className='text-center py-2 px-1'>
                  <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-2 shadow-sm hover-scale'>
                    <ShopTwoTone className='text-white text-base' twoToneColor={['#ffffff', '#d1fae5']} />
                  </div>
                  <div className='text-xs font-medium text-gray-800 mb-1'>
                    <LocalizedText>{t('navigation.products')}</LocalizedText>
                  </div>
                  <div className='text-xs text-gray-500 text-center hidden md:block'>
                    <LocalizedText>
                      {t('products.manageProducts', 'Manage product inventory')}
                    </LocalizedText>
                  </div>
                </div>
              </Card>
            </Col>
          )}

          <Col xs={12} sm={8} md={6} lg={4} xl={4}>
            <Card
              className='modern-card hover-lift'
              size='small'
              actions={[
                <Button
                  key='manage-customers'
                  className='modern-button gradient-button'
                  icon={<UserOutlined />}
                  block
                  size='large'
                  onClick={() => navigate('/customers')}
                >
                  <LocalizedText>
                    {t('navigation.manage', 'Manage')}
                  </LocalizedText>
                </Button>,
              ]}
            >
              <div className='text-center py-2 px-1'>
                <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center mx-auto mb-2 shadow-sm hover-scale'>
                  <CustomerServiceTwoTone className='text-white text-base' twoToneColor={['#ffffff', '#ede9fe']} />
                </div>
                <div className='text-xs font-medium text-gray-800 mb-1'>
                  <LocalizedText>{t('navigation.customers')}</LocalizedText>
                </div>
                <div className='text-xs text-gray-500 text-center hidden md:block'>
                  <LocalizedText>
                    {t('customers.manageCustomers', 'Manage customer accounts')}
                  </LocalizedText>
                </div>
              </div>
            </Card>
          </Col>

          {hasPermission('suppliers') && (
            <Col xs={12} sm={8} md={6} lg={4} xl={4}>
              <Card
                className='modern-card hover-lift'
                size='small'
                actions={[
                  <Button
                    key='manage-suppliers'
                    className='modern-button gradient-button'
                    icon={<TeamOutlined />}
                    block
                    size='large'
                    onClick={() => navigate('/suppliers')}
                  >
                    <LocalizedText>
                      {t('navigation.manage', 'Manage')}
                    </LocalizedText>
                  </Button>,
                ]}
              >
                <div className='text-center py-2 px-1'>
                  <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-2 shadow-sm hover-scale'>
                    <ContactsTwoTone className='text-white text-base' twoToneColor={['#ffffff', '#fef3c7']} />
                  </div>
                  <div className='text-xs font-medium text-gray-800 mb-1'>
                    <LocalizedText>{t('navigation.suppliers')}</LocalizedText>
                  </div>
                  <div className='text-xs text-gray-500 text-center hidden md:block'>
                    <LocalizedText>
                      {t(
                        'suppliers.manageSuppliers',
                        'Manage supplier accounts'
                      )}
                    </LocalizedText>
                  </div>
                </div>
              </Card>
            </Col>
          )}

          {hasPermission('reports') && (
            <Col xs={12} sm={8} md={6} lg={4} xl={4}>
              <Card
                className='modern-card hover-lift'
                size='small'
                actions={[
                  <Button
                    key='view-reports'
                    className='modern-button gradient-button'
                    icon={<FileTextOutlined />}
                    block
                    size='large'
                    onClick={() => navigate('/reports')}
                  >
                    <LocalizedText>
                      {t('navigation.view', 'View')}
                    </LocalizedText>
                  </Button>,
                ]}
              >
                <div className='text-center py-2 px-1'>
                  <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center mx-auto mb-2 shadow-sm hover-scale'>
                    <PieChartTwoTone className='text-white text-base' twoToneColor={['#ffffff', '#e0f2fe']} />
                  </div>
                  <div className='text-xs font-medium text-gray-800 mb-1'>
                    <LocalizedText>{t('navigation.reports')}</LocalizedText>
                  </div>
                  <div className='text-xs text-gray-500 text-center hidden md:block'>
                    <LocalizedText>
                      {t(
                        'reports.viewReports',
                        'View sales and business reports'
                      )}
                    </LocalizedText>
                  </div>
                </div>
              </Card>
            </Col>
          )}

          {hasPermission('settings') && (
            <Col xs={12} sm={8} md={6} lg={4} xl={4}>
              <Card
                className='modern-card hover-lift'
                size='small'
                actions={[
                  <Button
                    key='configure-settings'
                    className='modern-button gradient-button'
                    icon={<SettingOutlined />}
                    block
                    size='large'
                    onClick={() => navigate('/settings')}
                  >
                    <LocalizedText>
                      {t('navigation.configure', 'Configure')}
                    </LocalizedText>
                  </Button>,
                ]}
              >
                <div className='text-center py-2 px-1'>
                  <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center mx-auto mb-2 shadow-sm hover-scale'>
                    <SettingTwoTone className='text-white text-base' twoToneColor={['#ffffff', '#fce7f3']} />
                  </div>
                  <div className='text-xs font-medium text-gray-800 mb-1'>
                    <LocalizedText>{t('navigation.settings')}</LocalizedText>
                  </div>
                  <div className='text-xs text-gray-500 text-center hidden md:block'>
                    <LocalizedText>
                      {t(
                        'settings.systemSettings',
                        'Configure system settings'
                      )}
                    </LocalizedText>
                  </div>
                </div>
              </Card>
            </Col>
          )}
          </Row>
        </div>

        {/* System Status - Ultra Compact */}
        <div className='flex-shrink-0'>
          <div className='flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-white rounded-lg border border-gray-100 shadow-sm'>
            {/* API Status */}
            <div className='flex items-center space-x-2'>
              <div className='w-2 h-2 rounded-full bg-green-500'></div>
              <Text className='text-xs font-medium text-gray-700'>
                {apiStatus === 'Checking...' ? (
                  <InlineLoading message='API' />
                ) : (
                  <span className={apiStatus.includes('failed') ? 'text-red-500' : 'text-green-600'}>
                    API Online
                  </span>
                )}
              </Text>
            </div>
            
            {/* User Role */}
            <div className='flex items-center space-x-1'>
              <Text className='text-xs text-gray-500'>Role:</Text>
              <Text className='text-xs font-medium text-gray-700'>
                <LocalizedText>{user?.role}</LocalizedText>
              </Text>
            </div>
            
            {/* Refresh Button */}
            <Button
              size='small'
              type='text'
              onClick={loadDashboardStats}
              loading={statsLoading}
              className='text-xs px-2 py-1 h-6'
            >
              <LocalizedText>{t('dashboard.refresh', 'Refresh')}</LocalizedText>
            </Button>
            
            {/* Brand */}
            <Text type='secondary' className='text-xs hidden sm:block'>
              Ceybyte.com
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;