/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                      Login Screen Component                                      │
 * │                                                                                                  │
 * │  Description: PIN-based login interface for fast POS authentication.                             │
 * │               Simple username and PIN entry with multi-language support.                        │
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
  Typography,
  Space,
  Alert,
} from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { usePinAuth } from '@/contexts/PinAuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import LocalizedText from '@/components/LocalizedText';

const { Title, Text } = Typography;

// Constants
const APP_NAME = 'CeybytePOS';
const COMPANY_NAME = 'Ceybyte.com';

interface LoginScreenProps {
  onLoginSuccess?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { pinLogin } = usePinAuth();
  const { t, common } = useTranslation();

  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePinLogin = async () => {
    if (!username || !pin) {
      setError(t('Please enter username and PIN'));
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const success = await pinLogin(username, pin);
      if (success) {
        onLoginSuccess?.();
      } else {
        setError(t('Invalid username or PIN'));
        setPin(''); // Clear PIN on failure
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(t('errors.networkError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePinLogin();
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
      <Card className='w-full max-w-md shadow-lg' style={{ maxWidth: 400 }}>
        <div className='p-6'>
          {/* Language Switcher */}
          <div className='text-right mb-4'>
            <LanguageSwitcher variant='compact' />
          </div>

          {/* Header */}
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

            {/* PIN Login Form */}
            <div className="space-y-4">
              <div>
                <Text strong className="block mb-2">
                  <LocalizedText>{t('auth.username')}</LocalizedText>
                </Text>
                <Input
                  prefix={<UserOutlined />}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  placeholder="Username"
                  size="large"
                  onKeyPress={handleKeyPress}
                />
              </div>

              <div>
                <Text strong className="block mb-2">
                  <LocalizedText>{t('auth.pin')}</LocalizedText>
                </Text>
                <Input.Password
                  prefix={<LockOutlined />}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  disabled={isLoading}
                  placeholder="Enter 4-6 digit PIN"
                  size="large"
                  maxLength={6}
                  onKeyPress={handleKeyPress}
                />
              </div>

              <Button
                type='primary'
                onClick={handlePinLogin}
                loading={isLoading}
                block
                size='large'
                disabled={!username || !pin}
              >
                <LocalizedText>
                  {isLoading ? common.loading : t('auth.loginButton')}
                </LocalizedText>
              </Button>
            </div>

            {/* Quick Access Hint */}
            <div className="text-center">
              <Text type="secondary" className="text-sm">
                <LocalizedText>Default: owner (1234), cashier (5678)</LocalizedText>
              </Text>
            </div>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default LoginScreen;