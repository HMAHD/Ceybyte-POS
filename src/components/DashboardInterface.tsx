/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                   Dashboard Interface                                            │
 * │                                                                                                  │
 * │  Description: Main dashboard interface for owner and cashier users.                              │
 * │               Provides access to all POS features based on user permissions.                     │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect } from 'react';
import { Layout, Card, Row, Col, Button, Space, Typography, Tag, Statistic, Divider } from 'antd';
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import LocalizedText from '@/components/LocalizedText';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { apiClient } from '@/api/client';
import { APP_NAME, COMPANY_NAME } from '@/utils/constants';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

export const DashboardInterface: React.FC = () => {
  const { user, logout, hasPermission } = useAuth();
  const { t, formatCurrency, formatDateTime } = useTranslation();
  const [apiStatus, setApiStatus] = useState<string>('Checking...');

  useEffect(() => {
    checkApiHealth();
  }, []);

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

  return (
    <Layout className="min-h-screen">
      {/* Header */}
      <Header className="bg-white shadow-sm border-b px-6">
        <div className="flex justify-between items-center h-full">
          <div className="flex items-center">
            <Title level={3} className="mb-0 mr-3">
              <DashboardOutlined className="mr-2" />
              <LocalizedText>{APP_NAME}</LocalizedText>
            </Title>
            <Tag color="success">
              <LocalizedText>{user?.role}</LocalizedText>
            </Tag>
          </div>

          <Space size="middle">
            <LanguageSwitcher variant="compact" />
            <Text type="secondary">
              <LocalizedText>{user?.name}</LocalizedText>
            </Text>
            <Button
              icon={<LogoutOutlined />}
              onClick={logout}
              type="text"
            >
              <LocalizedText>{t('auth.logout')}</LocalizedText>
            </Button>
          </Space>
        </div>
      </Header>

      {/* Main Content */}
      <Content className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <Title level={2} className="mb-2">
              <LocalizedText>{t('dashboard.welcome', `Welcome, ${user?.name}`)}</LocalizedText>
            </Title>
            <Text type="secondary">
              <LocalizedText>{formatDateTime(new Date())}</LocalizedText>
            </Text>
          </div>

          {/* Quick Stats */}
          <Row gutter={[24, 24]} className="mb-8">
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title={<LocalizedText>{t('dashboard.todaySales')}</LocalizedText>}
                  value={0}
                  formatter={(value) => formatCurrency(Number(value))}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title={<LocalizedText>{t('dashboard.todayProfit')}</LocalizedText>}
                  value={0}
                  formatter={(value) => formatCurrency(Number(value))}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title={<LocalizedText>{t('dashboard.lowStockItems')}</LocalizedText>}
                  value={0}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title={<LocalizedText>{t('dashboard.pendingPayments')}</LocalizedText>}
                  value={0}
                  formatter={(value) => formatCurrency(Number(value))}
                  valueStyle={{ color: '#f5222d' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Quick Actions */}
          <Row gutter={[24, 24]} className="mb-8">
            <Col xs={24} md={12} lg={8}>
              <Card
                hoverable
                className="h-full"
                actions={[
                  <Button type="primary" icon={<ShoppingCartOutlined />} block>
                    <LocalizedText>{t('pos.startSale', 'Start Sale')}</LocalizedText>
                  </Button>
                ]}
              >
                <Card.Meta
                  avatar={<ShoppingCartOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
                  title={<LocalizedText>{t('pos.newSale')}</LocalizedText>}
                  description={<LocalizedText>{t('pos.startNewSale', 'Start a new sale transaction')}</LocalizedText>}
                />
              </Card>
            </Col>

            {hasPermission('inventory') && (
              <Col xs={24} md={12} lg={8}>
                <Card
                  hoverable
                  className="h-full"
                  actions={[
                    <Button icon={<FileTextOutlined />} block>
                      <LocalizedText>{t('navigation.manage', 'Manage')}</LocalizedText>
                    </Button>
                  ]}
                >
                  <Card.Meta
                    avatar={<FileTextOutlined style={{ fontSize: 24, color: '#52c41a' }} />}
                    title={<LocalizedText>{t('navigation.products')}</LocalizedText>}
                    description={<LocalizedText>{t('products.manageProducts', 'Manage product inventory')}</LocalizedText>}
                  />
                </Card>
              </Col>
            )}

            <Col xs={24} md={12} lg={8}>
              <Card
                hoverable
                className="h-full"
                actions={[
                  <Button icon={<UserOutlined />} block>
                    <LocalizedText>{t('navigation.manage', 'Manage')}</LocalizedText>
                  </Button>
                ]}
              >
                <Card.Meta
                  avatar={<UserOutlined style={{ fontSize: 24, color: '#722ed1' }} />}
                  title={<LocalizedText>{t('navigation.customers')}</LocalizedText>}
                  description={<LocalizedText>{t('customers.manageCustomers', 'Manage customer accounts')}</LocalizedText>}
                />
              </Card>
            </Col>

            {hasPermission('suppliers') && (
              <Col xs={24} md={12} lg={8}>
                <Card
                  hoverable
                  className="h-full"
                  actions={[
                    <Button icon={<TeamOutlined />} block>
                      <LocalizedText>{t('navigation.manage', 'Manage')}</LocalizedText>
                    </Button>
                  ]}
                >
                  <Card.Meta
                    avatar={<TeamOutlined style={{ fontSize: 24, color: '#fa8c16' }} />}
                    title={<LocalizedText>{t('navigation.suppliers')}</LocalizedText>}
                    description={<LocalizedText>{t('suppliers.manageSuppliers', 'Manage supplier accounts')}</LocalizedText>}
                  />
                </Card>
              </Col>
            )}

            {hasPermission('reports') && (
              <Col xs={24} md={12} lg={8}>
                <Card
                  hoverable
                  className="h-full"
                  actions={[
                    <Button icon={<FileTextOutlined />} block>
                      <LocalizedText>{t('navigation.view', 'View')}</LocalizedText>
                    </Button>
                  ]}
                >
                  <Card.Meta
                    avatar={<FileTextOutlined style={{ fontSize: 24, color: '#13c2c2' }} />}
                    title={<LocalizedText>{t('navigation.reports')}</LocalizedText>}
                    description={<LocalizedText>{t('reports.viewReports', 'View sales and business reports')}</LocalizedText>}
                  />
                </Card>
              </Col>
            )}

            {hasPermission('settings') && (
              <Col xs={24} md={12} lg={8}>
                <Card
                  hoverable
                  className="h-full"
                  actions={[
                    <Button icon={<SettingOutlined />} block>
                      <LocalizedText>{t('navigation.configure', 'Configure')}</LocalizedText>
                    </Button>
                  ]}
                >
                  <Card.Meta
                    avatar={<SettingOutlined style={{ fontSize: 24, color: '#f5222d' }} />}
                    title={<LocalizedText>{t('navigation.settings')}</LocalizedText>}
                    description={<LocalizedText>{t('settings.systemSettings', 'Configure system settings')}</LocalizedText>}
                  />
                </Card>
              </Col>
            )}
          </Row>

          {/* System Status */}
          <Card title={<LocalizedText>{t('dashboard.systemStatus', 'System Status')}</LocalizedText>}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                  <Text>
                    <LocalizedText>{t('dashboard.apiStatus', 'API Status')}</LocalizedText>
                  </Text>
                  <Tag color="success">{apiStatus}</Tag>
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                  <Text>
                    <LocalizedText>{t('dashboard.userRole', 'User Role')}</LocalizedText>
                  </Text>
                  <Tag color="blue">
                    <LocalizedText>{user?.role}</LocalizedText>
                  </Tag>
                </div>
              </Col>
            </Row>

            <Divider />
            <Text type="secondary" className="text-xs">
              Powered by {COMPANY_NAME} - <LocalizedText>{t('dashboard.authenticationActive', 'Authentication Active')}</LocalizedText>
            </Text>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default DashboardInterface;