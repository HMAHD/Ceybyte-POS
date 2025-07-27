/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                   Cash Drawer Card Component                                     │
 * │                                                                                                  │
 * │  Description: Cash drawer management with opening/closing balance tracking and                  │
 * │               real-time cash flow monitoring for daily operations.                              │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                  │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect } from 'react';
import { Card, Statistic, Button, Modal, InputNumber, Form, Typography, Row, Col, Spin, Alert, Badge } from 'antd';
import { 
  WalletOutlined, 
  UnlockOutlined, 
  LockOutlined, 
  ReloadOutlined} from '@ant-design/icons';
import { useTranslation } from '@/hooks/useTranslation';
import LocalizedText from '@/components/LocalizedText';
import { dashboardApi, CashDrawerStatus } from '@/api/dashboard.api';

const { Title, Text } = Typography;

const CashDrawerCard: React.FC = () => {
  const { t, formatCurrency } = useTranslation();
  const [drawerStatus, setDrawerStatus] = useState<CashDrawerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openModalVisible, setOpenModalVisible] = useState(false);
  const [closeModalVisible, setCloseModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [form] = Form.useForm();

  const loadDrawerStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardApi.getCashDrawerStatus();
      
      if (response.success && response.data) {
        setDrawerStatus(response.data);
      } else {
        setError(response.error || 'Failed to load cash drawer status');
      }
    } catch (err) {
      console.error('Cash drawer loading error:', err);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrawerStatus();
  }, []);

  const handleOpenDrawer = async (values: { opening_balance: number }) => {
    try {
      setActionLoading(true);
      const response = await dashboardApi.openCashDrawer(values.opening_balance);
      
      if (response.success) {
        setOpenModalVisible(false);
        form.resetFields();
        await loadDrawerStatus();
      } else {
        console.error('Failed to open cash drawer:', response.error);
      }
    } catch (err) {
      console.error('Cash drawer open error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseDrawer = async (values: { closing_balance: number }) => {
    try {
      setActionLoading(true);
      const response = await dashboardApi.closeCashDrawer(values.closing_balance);
      
      if (response.success) {
        setCloseModalVisible(false);
        form.resetFields();
        await loadDrawerStatus();
      } else {
        console.error('Failed to close cash drawer:', response.error);
      }
    } catch (err) {
      console.error('Cash drawer close error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (loading) {
    return (
      <Card className="ceybyte-card h-full">
        <div className="flex items-center justify-center h-32">
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="ceybyte-card h-full">
        <Alert
          message="Error Loading Cash Drawer"
          description={error}
          type="error"
          action={
            <button
              onClick={loadDrawerStatus}
              className="text-blue-600 hover:text-blue-800"
            >
              <ReloadOutlined /> Retry
            </button>
          }
        />
      </Card>
    );
  }

  if (!drawerStatus) {
    return null;
  }

  return (
    <>
      <Card 
        className="ceybyte-card h-full"
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <WalletOutlined />
              <Title level={4} className="mb-0">
                <LocalizedText>{t('dashboard.cashDrawer', 'Cash Drawer')}</LocalizedText>
              </Title>
              <Badge 
                status={drawerStatus.is_balanced ? 'success' : 'error'}
                text={drawerStatus.is_balanced ? 'Balanced' : 'Unbalanced'}
              />
            </div>
            <button
              onClick={loadDrawerStatus}
              className="text-gray-500 hover:text-gray-700"
            >
              <ReloadOutlined />
            </button>
          </div>
        }
        actions={[
          <Button 
            key="open" 
            type="primary" 
            icon={<UnlockOutlined />}
            onClick={() => setOpenModalVisible(true)}
            size="small"
          >
            <LocalizedText>{t('dashboard.openDrawer', 'Open Drawer')}</LocalizedText>
          </Button>,
          <Button 
            key="close" 
            icon={<LockOutlined />}
            onClick={() => setCloseModalVisible(true)}
            size="small"
          >
            <LocalizedText>{t('dashboard.closeDrawer', 'Close Drawer')}</LocalizedText>
          </Button>
        ]}
      >
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Statistic
              title={<LocalizedText>{t('dashboard.openingBalance', 'Opening Balance')}</LocalizedText>}
              value={drawerStatus.opening_balance}
              formatter={value => formatCurrency(Number(value))}
              valueStyle={{ fontSize: '16px', fontWeight: 'bold' }}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title={<LocalizedText>{t('dashboard.currentBalance', 'Current Balance')}</LocalizedText>}
              value={drawerStatus.current_balance}
              formatter={value => formatCurrency(Number(value))}
              valueStyle={{ 
                fontSize: '16px', 
                fontWeight: 'bold',
                color: drawerStatus.current_balance >= 0 ? '#52c41a' : '#f5222d'
              }}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title={<LocalizedText>{t('dashboard.cashSales', 'Cash Sales')}</LocalizedText>}
              value={drawerStatus.total_cash_sales}
              formatter={value => formatCurrency(Number(value))}
              valueStyle={{ fontSize: '14px', color: '#52c41a' }}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title={<LocalizedText>{t('dashboard.cashReceived', 'Cash Received')}</LocalizedText>}
              value={drawerStatus.total_cash_received}
              formatter={value => formatCurrency(Number(value))}
              valueStyle={{ fontSize: '14px', color: '#52c41a' }}
            />
          </Col>
        </Row>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <Text type="secondary" className="text-xs">
            <LocalizedText>{t('dashboard.lastOpened', 'Last opened')}</LocalizedText>: {formatTime(drawerStatus.last_opened)}
          </Text>
        </div>
      </Card>

      {/* Open Drawer Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <UnlockOutlined />
            <span><LocalizedText>{t('dashboard.openCashDrawer', 'Open Cash Drawer')}</LocalizedText></span>
          </div>
        }
        open={openModalVisible}
        onCancel={() => setOpenModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleOpenDrawer}
        >
          <Form.Item
            name="opening_balance"
            label={<LocalizedText>{t('dashboard.openingBalance', 'Opening Balance')}</LocalizedText>}
            rules={[
              { required: true, message: 'Please enter opening balance' },
              { type: 'number', min: 0, message: 'Balance must be positive' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Enter opening balance"
              formatter={value => `Rs. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value!.replace(/Rs\.\s?|(,*)/g, '')}
              precision={2}
            />
          </Form.Item>
          
          <div className="flex justify-end space-x-2">
            <Button onClick={() => setOpenModalVisible(false)}>
              <LocalizedText>{t('common.cancel', 'Cancel')}</LocalizedText>
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={actionLoading}
              icon={<UnlockOutlined />}
            >
              <LocalizedText>{t('dashboard.openDrawer', 'Open Drawer')}</LocalizedText>
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Close Drawer Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <LockOutlined />
            <span><LocalizedText>{t('dashboard.closeCashDrawer', 'Close Cash Drawer')}</LocalizedText></span>
          </div>
        }
        open={closeModalVisible}
        onCancel={() => setCloseModalVisible(false)}
        footer={null}
      >
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <Text strong>
            <LocalizedText>{t('dashboard.expectedBalance', 'Expected Balance')}</LocalizedText>: {formatCurrency(drawerStatus.current_balance)}
          </Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleCloseDrawer}
        >
          <Form.Item
            name="closing_balance"
            label={<LocalizedText>{t('dashboard.actualBalance', 'Actual Balance (Count Cash)')}</LocalizedText>}
            rules={[
              { required: true, message: 'Please enter actual balance' },
              { type: 'number', min: 0, message: 'Balance must be positive' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Count and enter actual cash amount"
              formatter={value => `Rs. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value!.replace(/Rs\.\s?|(,*)/g, '')}
              precision={2}
            />
          </Form.Item>
          
          <div className="flex justify-end space-x-2">
            <Button onClick={() => setCloseModalVisible(false)}>
              <LocalizedText>{t('common.cancel', 'Cancel')}</LocalizedText>
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={actionLoading}
              icon={<LockOutlined />}
            >
              <LocalizedText>{t('dashboard.closeDrawer', 'Close Drawer')}</LocalizedText>
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default CashDrawerCard;