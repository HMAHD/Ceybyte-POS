/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                      Dashboard Page                                              │
 * │                                                                                                  │
 * │  Description: Main dashboard page with business overview and quick actions.                      │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React from 'react';
import { Card, Row, Col, Statistic, Button } from 'antd';
import { ShoppingCartOutlined, UserOutlined, FileTextOutlined } from '@ant-design/icons';
import { useTranslation } from '@/hooks/useTranslation';
import LocalizedText from '@/components/LocalizedText';

const DashboardPage: React.FC = () => {
  const { t, formatCurrency } = useTranslation();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Quick Stats */}
      <div className="animate-slide-up">
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="ceybyte-card hover:shadow-lg transition-all duration-300">
              <Statistic
                title={<LocalizedText>{t('dashboard.todaySales', 'Today\'s Sales')}</LocalizedText>}
                value={125000}
                formatter={value => formatCurrency(Number(value))}
                valueStyle={{ color: '#0066cc', fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="ceybyte-card hover:shadow-lg transition-all duration-300">
              <Statistic
                title={<LocalizedText>{t('dashboard.todayProfit', 'Today\'s Profit')}</LocalizedText>}
                value={25000}
                formatter={value => formatCurrency(Number(value))}
                valueStyle={{ color: '#22c55e', fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="ceybyte-card hover:shadow-lg transition-all duration-300">
              <Statistic
                title={<LocalizedText>{t('dashboard.lowStock', 'Low Stock Items')}</LocalizedText>}
                value={3}
                valueStyle={{ color: '#f59e0b', fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="ceybyte-card hover:shadow-lg transition-all duration-300">
              <Statistic
                title={<LocalizedText>{t('dashboard.pendingPayments', 'Pending Payments')}</LocalizedText>}
                value={45000}
                formatter={value => formatCurrency(Number(value))}
                valueStyle={{ color: '#ef4444', fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Quick Actions */}
      <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Card
              className="ceybyte-card h-full"
              hoverable
              actions={[
                <Button 
                  key="start-sale" 
                  type="primary" 
                  icon={<ShoppingCartOutlined />} 
                  size="large"
                  className="ceybyte-btn ceybyte-btn-primary"
                  block
                >
                  <LocalizedText>{t('pos.startSale', 'Start Sale')}</LocalizedText>
                </Button>
              ]}
            >
              <Card.Meta
                avatar={
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <ShoppingCartOutlined style={{ fontSize: 24, color: '#0066cc' }} />
                  </div>
                }
                title={
                  <span className="text-lg font-semibold text-gray-800">
                    <LocalizedText>{t('pos.newSale', 'New Sale')}</LocalizedText>
                  </span>
                }
                description={
                  <span className="text-gray-600">
                    <LocalizedText>{t('pos.startNewSale', 'Start a new sale transaction')}</LocalizedText>
                  </span>
                }
              />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card
              className="ceybyte-card h-full"
              hoverable
              actions={[
                <Button 
                  key="manage-products" 
                  icon={<FileTextOutlined />} 
                  size="large"
                  className="ceybyte-btn ceybyte-btn-secondary"
                  block
                >
                  <LocalizedText>{t('navigation.manage', 'Manage')}</LocalizedText>
                </Button>
              ]}
            >
              <Card.Meta
                avatar={
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <FileTextOutlined style={{ fontSize: 24, color: '#22c55e' }} />
                  </div>
                }
                title={
                  <span className="text-lg font-semibold text-gray-800">
                    <LocalizedText>{t('navigation.products', 'Products')}</LocalizedText>
                  </span>
                }
                description={
                  <span className="text-gray-600">
                    <LocalizedText>{t('products.manageProducts', 'Manage product inventory')}</LocalizedText>
                  </span>
                }
              />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card
              className="ceybyte-card h-full"
              hoverable
              actions={[
                <Button 
                  key="manage-customers" 
                  icon={<UserOutlined />} 
                  size="large"
                  className="ceybyte-btn ceybyte-btn-secondary"
                  block
                >
                  <LocalizedText>{t('navigation.manage', 'Manage')}</LocalizedText>
                </Button>
              ]}
            >
              <Card.Meta
                avatar={
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <UserOutlined style={{ fontSize: 24, color: '#722ed1' }} />
                  </div>
                }
                title={
                  <span className="text-lg font-semibold text-gray-800">
                    <LocalizedText>{t('navigation.customers', 'Customers')}</LocalizedText>
                  </span>
                }
                description={
                  <span className="text-gray-600">
                    <LocalizedText>{t('customers.manageCustomers', 'Manage customer accounts')}</LocalizedText>
                  </span>
                }
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default DashboardPage;