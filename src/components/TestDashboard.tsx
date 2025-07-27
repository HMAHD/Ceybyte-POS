/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                      Test Dashboard                                              │
 * │                                                                                                  │
 * │  Description: Simple test dashboard to verify routing and basic functionality                    │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                  │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { DollarOutlined, ShoppingCartOutlined, UserOutlined } from '@ant-design/icons';

const TestDashboard: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">CeybytePOS Dashboard</h1>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Today's Sales"
              value={125000}
              formatter={value => `Rs. ${value?.toLocaleString()}`}
              valueStyle={{ color: '#1890ff', fontSize: '24px', fontWeight: 'bold' }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Transactions"
              value={47}
              valueStyle={{ color: '#722ed1', fontSize: '24px', fontWeight: 'bold' }}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Customers"
              value={156}
              valueStyle={{ color: '#52c41a', fontSize: '24px', fontWeight: 'bold' }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="System Status" className="mt-6">
        <div className="space-y-2">
          <p><strong>API Status:</strong> <span className="text-green-600">Connected</span></p>
          <p><strong>Database:</strong> <span className="text-green-600">Online</span></p>
          <p><strong>Printer:</strong> <span className="text-green-600">Ready</span></p>
          <p><strong>Network:</strong> <span className="text-green-600">Connected</span></p>
        </div>
      </Card>

      <Card title="Quick Actions" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Start New Sale
          </button>
          <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            View Products
          </button>
          <button className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
            Customer Management
          </button>
        </div>
      </Card>
    </div>
  );
};

export default TestDashboard;