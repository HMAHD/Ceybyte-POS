/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                     PIN Login Screen                                            │
 * │                                                                                                  │
 * │  Description: Fast PIN-based login interface for POS operations.                                 │
 * │               Simple user selection and PIN entry with instant authentication.                   │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect } from 'react';
import { Card, Button, Input, message, Avatar, Typography, Space, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, PlusOutlined } from '@ant-design/icons';
import { usePinAuth } from '@/contexts/PinAuthContext';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

interface PinLoginScreenProps {
  onCreateUser?: () => void;
}

export const PinLoginScreen: React.FC<PinLoginScreenProps> = ({ onCreateUser }) => {
  const { pinLogin, isLoading, availableUsers, loadAvailableUsers } = usePinAuth();
  const { t } = useTranslation();
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [pin, setPin] = useState('');
  const [pinVisible, setPinVisible] = useState(false);

  useEffect(() => {
    loadAvailableUsers();
  }, []);

  const handleLogin = async () => {
    if (!selectedUser) {
      message.error(t('Please select a user'));
      return;
    }

    if (!pin || pin.length < 4) {
      message.error(t('Please enter your PIN'));
      return;
    }

    const success = await pinLogin(selectedUser, pin);
    
    if (!success) {
      message.error(t('Invalid PIN. Please try again.'));
      setPin('');
    }
  };

  const handlePinChange = (value: string) => {
    // Only allow digits and limit to 6 characters
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setPin(numericValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return '#1890ff';
      case 'cashier': return '#52c41a';
      case 'helper': return '#faad14';
      default: return '#d9d9d9';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return '👑';
      case 'cashier': return '💰';
      case 'helper': return '🤝';
      default: return '👤';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Title level={2} className="text-gray-800 mb-2">
            CeybytePOS
          </Title>
          <Text className="text-gray-600">
            {t('Enter your PIN to continue')}
          </Text>
        </div>

        <Card className="shadow-lg border-0">
          <div className="space-y-6">
            {/* User Selection */}
            <div>
              <Text strong className="block mb-3">
                {t('Select User')}
              </Text>
              <Row gutter={[12, 12]}>
                {availableUsers.map((user) => (
                  <Col span={24} key={user.username}>
                    <Card
                      size="small"
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedUser === user.username
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedUser(user.username)}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar
                          style={{ backgroundColor: getRoleColor(user.role) }}
                          icon={<UserOutlined />}
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Text strong>{user.display_name}</Text>
                            <span className="text-sm">{getRoleIcon(user.role)}</span>
                          </div>
                          <Text type="secondary" className="text-xs">
                            {t(user.role)} • @{user.username}
                          </Text>
                        </div>
                        {user.last_used && (
                          <Text type="secondary" className="text-xs">
                            {new Date(user.last_used).toLocaleDateString()}
                          </Text>
                        )}
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>

            {/* PIN Input */}
            {selectedUser && (
              <div>
                <Text strong className="block mb-3">
                  {t('Enter PIN')}
                </Text>
                <Input.Password
                  size="large"
                  placeholder={t('Enter your 4-6 digit PIN')}
                  prefix={<LockOutlined />}
                  value={pin}
                  onChange={(e) => handlePinChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  visibilityToggle={{
                    visible: pinVisible,
                    onVisibleChange: setPinVisible,
                  }}
                  maxLength={6}
                  autoFocus
                />
              </div>
            )}

            {/* Login Button */}
            <Button
              type="primary"
              size="large"
              block
              loading={isLoading}
              disabled={!selectedUser || pin.length < 4}
              onClick={handleLogin}
            >
              {t('Login')}
            </Button>

            {/* Create User Button */}
            {onCreateUser && (
              <Button
                type="dashed"
                size="large"
                block
                icon={<PlusOutlined />}
                onClick={onCreateUser}
              >
                {t('Create New User')}
              </Button>
            )}
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <Text type="secondary" className="text-sm">
            {t('Powered by Ceybyte.com')}
          </Text>
        </div>
      </div>
    </div>
  );
};

export default PinLoginScreen;