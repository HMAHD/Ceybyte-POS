/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                      Login Screen Component                                      │
 * │                                                                                                  │
 * │  Description: Login interface with username/password and PIN authentication support.             │
 * │               Includes role-based access and multi-language support.                             │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState } from 'react';
import {
  Card,
  Button,
  Input,
  Form,
  Alert,
  Space,
  Segmented,
  Row,
  Col,
  Typography,
} from 'antd';
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import LocalizedText from '@/components/LocalizedText';
import { APP_NAME, COMPANY_NAME } from '@/utils/constants';

const { Title, Text } = Typography;

interface LoginScreenProps {
  onLoginSuccess?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { login, pinLogin } = useAuth();
  const { t, common } = useTranslation();

  const [loginMode, setLoginMode] = useState<'password' | 'pin'>('password');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePasswordLogin = async (values: any) => {
    setError('');
    setIsLoading(true);

    try {
      const success = await login(values.username || username, values.password);
      if (success) {
        onLoginSuccess?.();
      } else {
        setError(t('auth.loginError'));
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(t('errors.networkError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinLogin = async (values: any) => {
    setError('');
    setIsLoading(true);

    try {
      const success = await pinLogin(values.username || username, values.pin);
      if (success) {
        onLoginSuccess?.();
      } else {
        setError(t('auth.loginError'));
      }
    } catch (error) {
      console.error('PIN login error:', error);
      setError(t('errors.networkError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickUserSwitch = (user: string) => {
    setUsername(user);
    setLoginMode('pin');
    setError('');
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
      <Card className='w-full max-w-md' style={{ maxWidth: 400 }}>
        <div className='p-6'>
          {/* Header */}
          <div className='text-right mb-4'>
            <LanguageSwitcher variant='compact' />
          </div>

          <div className='text-center mb-6'>
            <Title level={2} className='mb-2'>
              <LocalizedText>{APP_NAME}</LocalizedText>
            </Title>
            <Text type='secondary'>
              <LocalizedText>{t('auth.login')}</LocalizedText>
            </Text>
            <br />
            <Text type='secondary' className='text-xs'>
              Powered by {COMPANY_NAME}
            </Text>
          </div>

          <Space direction='vertical' className='w-full' size='large'>
            {/* Login Mode Toggle */}
            <Segmented
              value={loginMode}
              onChange={value => setLoginMode(value as 'password' | 'pin')}
              options={[
                {
                  label: <LocalizedText>{t('auth.password')}</LocalizedText>,
                  value: 'password',
                  icon: <LockOutlined />,
                },
                {
                  label: <LocalizedText>{t('auth.pin')}</LocalizedText>,
                  value: 'pin',
                  icon: <SafetyOutlined />,
                },
              ]}
              block
            />

            {/* Error Message */}
            {error && (
              <Alert
                message={<LocalizedText>{error}</LocalizedText>}
                type='error'
                showIcon
                closable
                onClose={() => setError('')}
              />
            )}

            {/* Password Login Form */}
            {loginMode === 'password' && (
              <Form
                onFinish={handlePasswordLogin}
                layout='vertical'
                size='large'
                initialValues={{ username }}
              >
                <Form.Item
                  label={<LocalizedText>{t('auth.username')}</LocalizedText>}
                  name='username'
                  rules={[
                    { required: true, message: 'Please input your username!' },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    disabled={isLoading}
                    placeholder='Username'
                  />
                </Form.Item>

                <Form.Item
                  label={<LocalizedText>{t('auth.password')}</LocalizedText>}
                  name='password'
                  rules={[
                    { required: true, message: 'Please input your password!' },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    disabled={isLoading}
                    placeholder='Password'
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type='primary'
                    htmlType='submit'
                    loading={isLoading}
                    block
                    size='large'
                  >
                    <LocalizedText>
                      {isLoading ? common.loading : t('auth.loginButton')}
                    </LocalizedText>
                  </Button>
                </Form.Item>
              </Form>
            )}

            {/* PIN Login Form */}
            {loginMode === 'pin' && (
              <Form
                onFinish={handlePinLogin}
                layout='vertical'
                size='large'
                initialValues={{ username }}
              >
                <Form.Item
                  label={<LocalizedText>{t('auth.username')}</LocalizedText>}
                  name='username'
                  rules={[
                    { required: true, message: 'Please input your username!' },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    disabled={isLoading}
                    placeholder='Username'
                  />
                </Form.Item>

                <Form.Item
                  label={<LocalizedText>{t('auth.pin')}</LocalizedText>}
                  name='pin'
                  rules={[
                    { required: true, message: 'Please input your PIN!' },
                  ]}
                >
                  <Input.Password
                    prefix={<SafetyOutlined />}
                    maxLength={6}
                    style={{ textAlign: 'center', letterSpacing: '0.2em' }}
                    disabled={isLoading}
                    placeholder='PIN'
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type='primary'
                    htmlType='submit'
                    loading={isLoading}
                    block
                    size='large'
                  >
                    <LocalizedText>
                      {isLoading ? common.loading : t('auth.loginButton')}
                    </LocalizedText>
                  </Button>
                </Form.Item>
              </Form>
            )}

            {/* Quick Switch */}
            <div>
              <Text type='secondary' className='text-sm'>
                <LocalizedText>
                  {t('auth.quickSwitch', 'Quick Switch:')}
                </LocalizedText>
              </Text>
              <Row gutter={8} className='mt-2'>
                <Col span={6}>
                  <Button
                    size='small'
                    onClick={() => handleQuickUserSwitch('admin')}
                    block
                    title='PIN: 1234'
                  >
                    <LocalizedText>Admin</LocalizedText>
                  </Button>
                </Col>
                <Col span={6}>
                  <Button
                    size='small'
                    onClick={() => handleQuickUserSwitch('owner')}
                    block
                    title='PIN: 1111'
                  >
                    <LocalizedText>Owner</LocalizedText>
                  </Button>
                </Col>
                <Col span={6}>
                  <Button
                    size='small'
                    onClick={() => handleQuickUserSwitch('cashier')}
                    block
                    title='PIN: 2345'
                  >
                    <LocalizedText>Cashier</LocalizedText>
                  </Button>
                </Col>
                <Col span={6}>
                  <Button
                    size='small'
                    onClick={() => handleQuickUserSwitch('helper')}
                    block
                    title='PIN: 3456'
                  >
                    <LocalizedText>Helper</LocalizedText>
                  </Button>
                </Col>
              </Row>

              {/* Default Credentials Info */}
              <div className='mt-4 p-3 bg-blue-50 rounded border border-blue-200'>
                <Text type='secondary' className='text-xs'>
                  <LocalizedText>Default Credentials:</LocalizedText>
                </Text>
                <div className='text-xs mt-1 space-y-1'>
                  <div>
                    <strong>Admin:</strong> admin/admin123 (PIN: 1234)
                  </div>
                  <div>
                    <strong>Owner:</strong> owner/owner123 (PIN: 1111)
                  </div>
                  <div>
                    <strong>Cashier:</strong> cashier/cashier123 (PIN: 2345)
                  </div>
                  <div>
                    <strong>Helper:</strong> helper/helper123 (PIN: 3456)
                  </div>
                </div>
              </div>
            </div>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default LoginScreen;
