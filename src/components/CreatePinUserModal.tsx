/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                  Create PIN User Modal                                          │
 * │                                                                                                  │
 * │  Description: Modal for creating new PIN users with role selection and validation.               │
 * │               Simple form for quick user setup without complex authentication.                   │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState } from 'react';
import { Modal, Form, Input, Select, Button, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { usePinAuth } from '@/contexts/PinAuthContext';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;
const { Option } = Select;

interface CreatePinUserModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CreatePinUserModal: React.FC<CreatePinUserModalProps> = ({
  visible,
  onClose,
}) => {
  const { createPinUser } = usePinAuth();
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    
    try {
      const success = await createPinUser({
        username: values.username,
        display_name: values.display_name,
        pin: values.pin,
        role: values.role,
        preferred_language: values.preferred_language || 'en',
      });

      if (success) {
        message.success(t('PIN user created successfully'));
        form.resetFields();
        onClose();
      } else {
        message.error(t('Failed to create PIN user. Username may already exist.'));
      }
    } catch (error) {
      message.error(t('An error occurred while creating the user'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const validatePin = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error(t('Please enter a PIN')));
    }
    if (!/^\d{4,6}$/.test(value)) {
      return Promise.reject(new Error(t('PIN must be 4-6 digits')));
    }
    return Promise.resolve();
  };

  const validateConfirmPin = (_: any, value: string) => {
    const pin = form.getFieldValue('pin');
    if (value && value !== pin) {
      return Promise.reject(new Error(t('PINs do not match')));
    }
    return Promise.resolve();
  };

  return (
    <Modal
      title={t('Create New PIN User')}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          name="display_name"
          label={t('Display Name')}
          rules={[
            { required: true, message: t('Please enter display name') },
            { min: 2, message: t('Display name must be at least 2 characters') },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder={t('Enter display name')}
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="username"
          label={t('Username')}
          rules={[
            { required: true, message: t('Please enter username') },
            { min: 3, message: t('Username must be at least 3 characters') },
            { pattern: /^[a-zA-Z0-9_]+$/, message: t('Username can only contain letters, numbers, and underscores') },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder={t('Enter username')}
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="role"
          label={t('Role')}
          rules={[{ required: true, message: t('Please select a role') }]}
        >
          <Select placeholder={t('Select role')} size="large">
            <Option value="owner">
              <div className="flex items-center space-x-2">
                <span>👑</span>
                <span>{t('Owner')}</span>
              </div>
            </Option>
            <Option value="cashier">
              <div className="flex items-center space-x-2">
                <span>💰</span>
                <span>{t('Cashier')}</span>
              </div>
            </Option>
            <Option value="helper">
              <div className="flex items-center space-x-2">
                <span>🤝</span>
                <span>{t('Helper')}</span>
              </div>
            </Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="preferred_language"
          label={t('Preferred Language')}
          initialValue="en"
        >
          <Select size="large">
            <Option value="en">{t('English')}</Option>
            <Option value="si">{t('Sinhala')}</Option>
            <Option value="ta">{t('Tamil')}</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="pin"
          label={t('PIN')}
          rules={[{ validator: validatePin }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder={t('Enter 4-6 digit PIN')}
            size="large"
            maxLength={6}
          />
        </Form.Item>

        <Form.Item
          name="confirm_pin"
          label={t('Confirm PIN')}
          dependencies={['pin']}
          rules={[
            { required: true, message: t('Please confirm your PIN') },
            { validator: validateConfirmPin },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder={t('Confirm your PIN')}
            size="large"
            maxLength={6}
          />
        </Form.Item>

        <div className="text-center space-y-3">
          <Text type="secondary" className="text-sm block">
            {t('PIN users can access POS features instantly without complex authentication')}
          </Text>
          
          <div className="flex space-x-3">
            <Button onClick={handleCancel} size="large" className="flex-1">
              {t('Cancel')}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              className="flex-1"
            >
              {t('Create User')}
            </Button>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default CreatePinUserModal;