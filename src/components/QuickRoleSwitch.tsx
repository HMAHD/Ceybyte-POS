/*
 * ╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                        CEYBYTE POS                                               ║
 * ║                                                                                                  ║
 * ║                                     Quick Role Switch Component                                  ║
 * ║                                                                                                  ║
 * ║  Description: Component for quick switching between user roles without full logout.             ║
 * ║               Supports PIN-based authentication for fast user switching.                        ║
 * ║                                                                                                  ║
 * ║  Author: Akash Hasendra                                                                          ║
 * ║  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   ║
 * ║  License: MIT License with Sri Lankan Business Terms                                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import React, { useState } from 'react';
import { Modal, Input, Button, Avatar, Typography, Space, message } from 'antd';
import { UserOutlined, LockOutlined, CrownOutlined, SafetyOutlined, UserSwitchOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import LocalizedText from '@/components/LocalizedText';

const { Title, Text } = Typography;

interface QuickRoleSwitchProps {
  visible: boolean;
  onClose: () => void;
}

const QuickRoleSwitch: React.FC<QuickRoleSwitchProps> = ({ visible, onClose }) => {
  const { user, pinLogin } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [pin, setPin] = useState('');

  // Quick access users (these would normally come from API)
  const quickUsers = [
    {
      username: 'admin',
      name: 'Administrator',
      role: 'owner',
      icon: <CrownOutlined />,
      color: '#gold',
    },
    {
      username: 'cashier',
      name: 'Main Cashier',
      role: 'cashier',
      icon: <SafetyOutlined />,
      color: '#1890ff',
    },
    {
      username: 'helper',
      name: 'Sales Helper',
      role: 'helper',
      icon: <UserSwitchOutlined />,
      color: '#52c41a',
    },
  ];

  const handleUserSelect = (username: string) => {
    setSelectedUser(username);
    setPin('');
  };

  const handleSwitch = async () => {
    if (!selectedUser || !pin) {
      message.warning(t('quickSwitch.selectUserAndPin', 'Please select a user and enter PIN'));
      return;
    }

    setLoading(true);
    try {
      const success = await pinLogin(selectedUser, pin);
      if (success) {
        message.success(t('quickSwitch.switchSuccess', 'User switched successfully'));
        onClose();
        setSelectedUser('');
        setPin('');
      } else {
        message.error(t('quickSwitch.invalidPin', 'Invalid PIN'));
      }
    } catch (error) {
      console.error('Quick switch error:', error);
      message.error(t('quickSwitch.switchError', 'Failed to switch user'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedUser('');
    setPin('');
    onClose();
  };

  return (
    <Modal
      open={visible}
      title={
        <div className="flex items-center gap-2">
          <UserSwitchOutlined className="text-blue-500" />
          <LocalizedText>{t('quickSwitch.title', 'Quick User Switch')}</LocalizedText>
        </div>
      }
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          <LocalizedText>{t('common.cancel', 'Cancel')}</LocalizedText>
        </Button>,
        <Button
          key="switch"
          type="primary"
          loading={loading}
          disabled={!selectedUser || !pin}
          onClick={handleSwitch}
        >
          <LocalizedText>{t('quickSwitch.switch', 'Switch User')}</LocalizedText>
        </Button>,
      ]}
      width={480}
      centered
    >
      <div className="py-4">
        {/* Current User Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <Text className="text-sm text-gray-600 mb-2 block">
            <LocalizedText>{t('quickSwitch.currentUser', 'Current User:')}</LocalizedText>
          </Text>
          <div className="flex items-center gap-3">
            <Avatar size={32} icon={<UserOutlined />} className="bg-blue-500" />
            <div>
              <div className="font-medium">{user?.name}</div>
              <div className="text-sm text-gray-500">
                <LocalizedText>{t(`users.roles.${user?.role}`, user?.role)}</LocalizedText>
              </div>
            </div>
          </div>
        </div>

        {/* User Selection */}
        <div className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-3 block">
            <LocalizedText>{t('quickSwitch.selectUser', 'Select User:')}</LocalizedText>
          </Text>
          <Space direction="vertical" size={8} className="w-full">
            {quickUsers.map((quickUser) => (
              <div
                key={quickUser.username}
                className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedUser === quickUser.username
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => handleUserSelect(quickUser.username)}
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    size={28}
                    icon={quickUser.icon}
                    style={{ backgroundColor: quickUser.color }}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{quickUser.name}</div>
                    <div className="text-xs text-gray-500">
                      <LocalizedText>{t(`users.roles.${quickUser.role}`, quickUser.role)}</LocalizedText>
                    </div>
                  </div>
                  {selectedUser === quickUser.username && (
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </Space>
        </div>

        {/* PIN Entry */}
        {selectedUser && (
          <div className="mt-4">
            <Text className="text-sm font-medium text-gray-700 mb-2 block">
              <LocalizedText>{t('quickSwitch.enterPin', 'Enter PIN:')}</LocalizedText>
            </Text>
            <Input.Password
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder={t('quickSwitch.pinPlaceholder', 'Enter 4-digit PIN')}
              prefix={<LockOutlined className="text-gray-400" />}
              maxLength={6}
              size="large"
              autoFocus
              onPressEnter={handleSwitch}
              className="text-center tracking-widest font-mono"
            />
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <Text className="text-xs text-blue-700">
            <LocalizedText>
              {t('quickSwitch.note', 'Note: Quick switch preserves your current session. You can switch back anytime using PIN authentication.')}
            </LocalizedText>
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default QuickRoleSwitch;