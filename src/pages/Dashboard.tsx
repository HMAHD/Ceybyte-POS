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
    <div className='p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Welcome Section */}
        <div className='mb-8'>
          <Title level={2} className='mb-2'>
            <LocalizedText>
              {t('dashboard.welcome', `Welcome, ${user?.name}`)}
            </LocalizedText>
          </Title>
          <Text type='secondary'>
            <LocalizedText>{new Date().toLocaleDateString()}</LocalizedText>
          </Text>
        </div>

        {/* Quick Stats */}
        <ContentLoading
          loading={statsLoading}
          skeleton={
            <Row gutter={[24, 24]} className='mb-8'>
              {[1, 2, 3, 4].map(i => (
                <Col xs={24} sm={12} lg={6} key={i}>
                  <Card loading />
                </Col>
              ))}
            </Row>
          }
        >
          <Row gutter={[24, 24]} className='mb-8'>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title={
                    <LocalizedText>{t('dashboard.todaySales')}</LocalizedText>
                  }
                  value={dashboardStats.todaySales}
                  formatter={value => formatCurrency(Number(value))}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title={
                    <LocalizedText>{t('dashboard.todayProfit')}</LocalizedText>
                  }
                  value={dashboardStats.todayProfit}
                  formatter={value => formatCurrency(Number(value))}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title={
                    <LocalizedText>
                      {t('dashboard.lowStockItems')}
                    </LocalizedText>
                  }
                  value={dashboardStats.lowStockItems}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title={
                    <LocalizedText>
                      {t('dashboard.pendingPayments')}
                    </LocalizedText>
                  }
                  value={dashboardStats.pendingPayments}
                  formatter={value => formatCurrency(Number(value))}
                  valueStyle={{ color: '#f5222d' }}
                />
              </Card>
            </Col>
          </Row>
        </ContentLoading>

        {/* Quick Actions */}
        <Row gutter={[24, 24]} className='mb-8'>
          <Col xs={24} md={12} lg={8}>
            <Card
              hoverable
              className='h-full'
              actions={[
                <Button
                  key='start-sale'
                  type='primary'
                  icon={<ShoppingCartOutlined />}
                  block
                  onClick={() => navigate('/pos')}
                >
                  <LocalizedText>
                    {t('pos.startSale', 'Start Sale')}
                  </LocalizedText>
                </Button>,
              ]}
            >
              <Card.Meta
                avatar={
                  <ShoppingCartOutlined
                    style={{ fontSize: 24, color: '#1890ff' }}
                  />
                }
                title={<LocalizedText>{t('pos.newSale')}</LocalizedText>}
                description={
                  <LocalizedText>
                    {t('pos.startNewSale', 'Start a new sale transaction')}
                  </LocalizedText>
                }
              />
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

        {/* System Status */}
        <Card
          title={
            <LocalizedText>
              {t('dashboard.systemStatus', 'System Status')}
            </LocalizedText>
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
