/*
 * ╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                        CEYBYTE POS                                               ║
 * ║                                                                                                  ║
 * ║                                   Create User Modal                                              ║
 * ║                                                                                                  ║
 * ║  Description: Modal component for creating new users with role assignment,                       ║
 * ║               password setup, PIN configuration, and validation.                                 ║
 * ║                                                                                                  ║
 * ║  Author: Akash Hasendra                                                                          ║
 * ║  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   ║
 * ║  License: MIT License with Sri Lankan Business Terms                                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  message,
  Space,
  Typography,
  Alert,
  Row,
  Col,
  Tag,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  CrownOutlined,
  UserSwitchOutlined,
  SafetyOutlined,
} from '@ant-design/icons';

import { CreateUserRequest } from '@/api/users';
import { usersAPI } from '@/api/users';

const { Option } = Select;
const { Text } = Typography;

interface CreateUserModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('cashier');

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // Prepare user data
      const userData: CreateUserRequest = {
        username: values.username.toLowerCase().trim(),
        name: values.name.trim(),
        email: values.email?.trim() || undefined,
        phone: values.phone?.trim() || undefined,
        password: values.password,
        pin: undefined,
        role: values.role,
        preferred_language: 'en',
        notes: undefined,
        is_active: true,
      };

      const response = await usersAPI.createUser(userData);

      if (response.success) {
        message.success(t('users.messages.userCreated'));
        form.resetFields();
        setSelectedRole('cashier');
        onSuccess();
      } else {
        message.error(response.error || t('users.messages.createError'));
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      if (error.errorFields) {
        // Form validation errors
        return;
      }
      message.error(t('users.messages.createError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedRole('cashier');
    onClose();
  };

  const validateUsername = async (_: any, value: string) => {
    if (!value) return Promise.resolve();

    if (value.length < 3) {
      return Promise.reject(new Error(t('users.validation.usernameMinLength')));
    }

    if (!/^[a-zA-Z0-9]+$/.test(value)) {
      return Promise.reject(new Error(t('users.validation.usernameFormat')));
    }

    // Check availability (optional, for better UX)
    try {
      const isAvailable = await usersAPI.validateUsername(value);
      if (!isAvailable) {
        return Promise.reject(new Error(t('users.validation.usernameExists')));
      }
    } catch (error) {
      // Ignore validation errors for availability check and continue
      console.warn('Username availability check failed:', error);
    }

    return Promise.resolve();
  };

  const validatePassword = (_: any, value: string) => {
    if (!value) return Promise.resolve();

    if (value.length < 6) {
      return Promise.reject(new Error(t('users.validation.passwordMinLength')));
    }

    return Promise.resolve();
  };


  const getRolePermissions = (role: string) => {
    const permissions = {
      owner: [
        'sales',
        'inventory',
        'customers',
        'suppliers',
        'reports',
        'settings',
        'users',
        'backup',
        'system',
      ],
      cashier: ['sales', 'inventory', 'customers', 'basic_reports'],
      helper: ['sales'],
    };

    return permissions[role as keyof typeof permissions] || [];
  };

  return (
    <Modal
      title={
        <span className='text-lg font-semibold text-gray-800'>
          {t('users.create.title', 'Create New User')}
        </span>
      }
      open={visible}
      onCancel={handleCancel}
      width={720}
      footer={[
        <Button key='cancel' onClick={handleCancel} size='middle'>
          {t('common.cancel', 'Cancel')}
        </Button>,
        <Button
          key='submit'
          type='primary'
          loading={loading}
          onClick={handleSubmit}
          size='middle'
          className='bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0'
        >
          {t('users.create.submit', 'Create User')}
        </Button>,
      ]}
      maskClosable={false}
      className='user-modal'
    >
      <div className='max-h-[65vh]'>
        <Form
          form={form}
          layout='vertical'
          initialValues={{
            role: 'cashier',
          }}
          className='space-y-4'
        >
          {/* Essential Information - Always Visible */}
          <div className='space-y-4'>
            <div className='flex items-center space-x-2 mb-4'>
              <UserOutlined className='text-blue-600' />
              <Text strong className='text-gray-800 text-base'>
                {t('users.create.sections.basicInfo', 'Basic Information')}
              </Text>
            </div>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name='name'
                  label={t('users.fields.name', 'Full Name')}
                  rules={[
                    {
                      required: true,
                      message: t('users.validation.nameRequired', 'Full name is required'),
                    },
                    { min: 2, message: t('users.validation.nameMinLength', 'Name must be at least 2 characters') },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined className='text-gray-400' />}
                    placeholder={t('users.placeholders.name', 'Enter full name')}
                    maxLength={100}
                    size='middle'
                    style={{ height: '40px' }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name='username'
                  label={t('users.fields.username')}
                  rules={[
                    {
                      required: true,
                      message: t('users.validation.usernameRequired'),
                    },
                    { validator: validateUsername },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined className='text-gray-400' />}
                    placeholder={t('users.placeholders.username')}
                    maxLength={50}
                    size='middle'
                    style={{ height: '40px' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name='password'
                  label={t('users.fields.password')}
                  rules={[
                    {
                      required: true,
                      message: t('users.validation.passwordRequired'),
                    },
                    { validator: validatePassword },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined className='text-gray-400' />}
                    placeholder={t('users.placeholders.password')}
                    maxLength={128}
                    size='middle'
                    style={{ height: '40px' }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name='role'
                  label={t('users.fields.role')}
                  rules={[
                    {
                      required: true,
                      message: t('users.validation.roleRequired'),
                    },
                  ]}
                >
                  <Select 
                    onChange={setSelectedRole} 
                    placeholder='Select role'
                    size='middle'
                    className='w-full'
                    style={{ 
                      height: '40px',
                      lineHeight: '40px'
                    }}
                  >
                    <Option value='owner'>
                      <Space>
                        <CrownOutlined style={{ color: '#faad14' }} />
                        {t('users.roles.owner')}
                      </Space>
                    </Option>
                    <Option value='cashier'>
                      <Space>
                        <SafetyOutlined style={{ color: '#1890ff' }} />
                        {t('users.roles.cashier')}
                      </Space>
                    </Option>
                    <Option value='helper'>
                      <Space>
                        <UserSwitchOutlined style={{ color: '#52c41a' }} />
                        {t('users.roles.helper')}
                      </Space>
                    </Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* Role Permissions Preview */}
            <Alert
              message={
                <Text strong className='text-sm'>
                  {t('users.create.rolePermissions', {
                    role: t(`users.roles.${selectedRole}`),
                  })}
                </Text>
              }
              description={
                <div className='mt-2'>
                  <div className='flex flex-wrap gap-1'>
                    {getRolePermissions(selectedRole).map(permission => (
                      <Tag key={permission} color='blue' className='text-xs'>
                        {t(`users.permissions.${permission}`)}
                      </Tag>
                    ))}
                  </div>
                </div>
              }
              type='info'
              showIcon={false}
              className='border-blue-200 bg-blue-50'
            />
          </div>

        </Form>
      </div>
    </Modal>
  );
};

export default CreateUserModal;
