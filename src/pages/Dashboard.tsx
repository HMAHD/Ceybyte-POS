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
    <div className='p-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
      <div className='max-w-7xl mx-auto'>
        {/* Welcome Section */}
        <div className='mb-8 fade-in'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <Title level={2} className='mb-2 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent'>
                <LocalizedText>
                  {t('dashboard.welcome', `Welcome, ${user?.name}`)}
                </LocalizedText>
              </Title>
              <Text type='secondary' className='text-lg'>
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
        <ContentLoading
          loading={statsLoading}
          skeleton={
            <Row gutter={[24, 24]} className='mb-8'>
              {[1, 2, 3, 4].map(i => (
                <Col xs={24} sm={12} lg={6} key={i}>
                  <Card loading className='modern-card' />
                </Col>
              ))}
            </Row>
          }
        >
          <Row gutter={[24, 24]} className='mb-8'>
            <Col xs={24} sm={12} lg={6}>
              <Card className='modern-card hover-lift slide-in-left' style={{ animationDelay: '0.1s' }}>
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
                  <div className='w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center'>
                    <ShoppingCartOutlined className='text-blue-500 text-xl' />
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card className='modern-card hover-lift slide-in-left' style={{ animationDelay: '0.2s' }}>
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
                  <div className='w-12 h-12 rounded-full bg-green-50 flex items-center justify-center'>
                    <div className='text-green-500 text-xl'>💰</div>
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card className='modern-card hover-lift slide-in-left' style={{ animationDelay: '0.3s' }}>
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
                  <div className='w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center'>
                    <div className='text-orange-500 text-xl'>⚠️</div>
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card className='modern-card hover-lift slide-in-left' style={{ animationDelay: '0.4s' }}>
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
                  <div className='w-12 h-12 rounded-full bg-red-50 flex items-center justify-center'>
                    <div className='text-red-500 text-xl'>📋</div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </ContentLoading>

        {/* Quick Actions */}
        <div className='mb-8'>
          <Title level={3} className='mb-6 text-gray-700'>
            <LocalizedText>Quick Actions</LocalizedText>
          </Title>
          <Row gutter={[24, 24]}>
          <Col xs={24} md={12} lg={8}>
            <Card
              className='modern-card hover-lift h-full scale-in'
              style={{ animationDelay: '0.5s' }}
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
              <div className='text-center p-4'>
                <div className='w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg'>
                  <ShoppingCartOutlined className='text-white text-2xl' />
                </div>
                <Title level={4} className='mb-2 text-gray-800'>
                  <LocalizedText>{t('pos.newSale')}</LocalizedText>
                </Title>
                <Text type='secondary' className='text-center block'>
                  <LocalizedText>
                    {t('pos.startNewSale', 'Start a new sale transaction')}
                  </LocalizedText>
                </Text>
              </div>
            </Card>
          </Col>

          {hasPermission('inventory') && (
            <Col xs={24} md={12} lg={8}>
              <Card
                hoverable
                className='h-full'
                actions={[
                  <Button
                    key='manage-products'
                    icon={<FileTextOutlined />}
                    block
                    onClick={() => navigate('/products')}
                  >
                    <LocalizedText>
                      {t('navigation.manage', 'Manage')}
                    </LocalizedText>
                  </Button>,
                ]}
              >
                <Card.Meta
                  avatar={
                    <FileTextOutlined
                      style={{ fontSize: 24, color: '#52c41a' }}
                    />
                  }
                  title={
                    <LocalizedText>{t('navigation.products')}</LocalizedText>
                  }
                  description={
                    <LocalizedText>
                      {t('products.manageProducts', 'Manage product inventory')}
                    </LocalizedText>
                  }
                />
              </Card>
            </Col>
          )}

          <Col xs={24} md={12} lg={8}>
            <Card
              hoverable
              className='h-full'
              actions={[
                <Button
                  key='manage-customers'
                  icon={<UserOutlined />}
                  block
                  onClick={() => navigate('/customers')}
                >
                  <LocalizedText>
                    {t('navigation.manage', 'Manage')}
                  </LocalizedText>
                </Button>,
              ]}
            >
              <Card.Meta
                avatar={
                  <UserOutlined style={{ fontSize: 24, color: '#722ed1' }} />
                }
                title={
                  <LocalizedText>{t('navigation.customers')}</LocalizedText>
                }
                description={
                  <LocalizedText>
                    {t('customers.manageCustomers', 'Manage customer accounts')}
                  </LocalizedText>
                }
              />
            </Card>
          </Col>

          {hasPermission('suppliers') && (
            <Col xs={24} md={12} lg={8}>
              <Card
                hoverable
                className='h-full'
                actions={[
                  <Button
                    key='manage-suppliers'
                    icon={<TeamOutlined />}
                    block
                    onClick={() => navigate('/suppliers')}
                  >
                    <LocalizedText>
                      {t('navigation.manage', 'Manage')}
                    </LocalizedText>
                  </Button>,
                ]}
              >
                <Card.Meta
                  avatar={
                    <TeamOutlined style={{ fontSize: 24, color: '#fa8c16' }} />
                  }
                  title={
                    <LocalizedText>{t('navigation.suppliers')}</LocalizedText>
                  }
                  description={
                    <LocalizedText>
                      {t(
                        'suppliers.manageSuppliers',
                        'Manage supplier accounts'
                      )}
                    </LocalizedText>
                  }
                />
              </Card>
            </Col>
          )}

          {hasPermission('reports') && (
            <Col xs={24} md={12} lg={8}>
              <Card
                hoverable
                className='h-full'
                actions={[
                  <Button
                    key='view-reports'
                    icon={<FileTextOutlined />}
                    block
                    onClick={() => navigate('/reports')}
                  >
                    <LocalizedText>
                      {t('navigation.view', 'View')}
                    </LocalizedText>
                  </Button>,
                ]}
              >
                <Card.Meta
                  avatar={
                    <FileTextOutlined
                      style={{ fontSize: 24, color: '#13c2c2' }}
                    />
                  }
                  title={
                    <LocalizedText>{t('navigation.reports')}</LocalizedText>
                  }
                  description={
                    <LocalizedText>
                      {t(
                        'reports.viewReports',
                        'View sales and business reports'
                      )}
                    </LocalizedText>
                  }
                />
              </Card>
            </Col>
          )}

          {hasPermission('settings') && (
            <Col xs={24} md={12} lg={8}>
              <Card
                hoverable
                className='h-full'
                actions={[
                  <Button
                    key='configure-settings'
                    icon={<SettingOutlined />}
                    block
                    onClick={() => navigate('/settings')}
                  >
                    <LocalizedText>
                      {t('navigation.configure', 'Configure')}
                    </LocalizedText>
                  </Button>,
                ]}
              >
                <Card.Meta
                  avatar={
                    <SettingOutlined
                      style={{ fontSize: 24, color: '#f5222d' }}
                    />
                  }
                  title={
                    <LocalizedText>{t('navigation.settings')}</LocalizedText>
                  }
                  description={
                    <LocalizedText>
                      {t(
                        'settings.systemSettings',
                        'Configure system settings'
                      )}
                    </LocalizedText>
                  }
                />
              </Card>
            </Col>
          )}
          </Row>
        </div>

        {/* System Status */}
        <Card
          className='modern-card fade-in'
          title={
            <span className='text-gray-700 font-semibold'>
              <LocalizedText>
                {t('dashboard.systemStatus', 'System Status')}
              </LocalizedText>
            </span>
          }
        >
          <Space direction='vertical' className='w-full'>
            <div className='flex justify-between items-center'>
              <Text>
                <LocalizedText>
                  {t('dashboard.apiStatus', 'API Status')}
                </LocalizedText>
              </Text>
              {apiStatus === 'Checking...' ? (
                <InlineLoading message={t('common.checking', 'Checking...')} />
              ) : (
                <Text
                  type={apiStatus.includes('failed') ? 'danger' : 'success'}
                >
                  {apiStatus}
                </Text>
              )}
            </div>

            <div className='flex justify-between items-center'>
              <Text>
                <LocalizedText>
                  {t('dashboard.userRole', 'User Role')}
                </LocalizedText>
              </Text>
              <Text strong>
                <LocalizedText>{user?.role}</LocalizedText>
              </Text>
            </div>

            <Divider />
            <div className='flex justify-between items-center'>
              <Text type='secondary' className='text-xs'>
                Powered by Ceybyte.com
              </Text>
              <Button
                size='small'
                type='link'
                onClick={loadDashboardStats}
                loading={statsLoading}
              >
                <LocalizedText>
                  {t('dashboard.refreshStats', 'Refresh Stats')}
                </LocalizedText>
              </Button>
            </div>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
