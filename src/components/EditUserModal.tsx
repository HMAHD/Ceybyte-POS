/*
 * ╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                        CEYBYTE POS                                               ║
 * ║                                                                                                  ║
 * ║                                    Edit User Modal                                               ║
 * ║                                                                                                  ║
 * ║  Description: Modal component for editing existing users with role management,                   ║
 * ║               PIN setup, status control, and field validation.                                   ║
 * ║                                                                                                  ║
 * ║  Author: Akash Hasendra                                                                          ║
 * ║  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   ║
 * ║  License: MIT License with Sri Lankan Business Terms                                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  Form,
  Input,
  Select,
  Switch,
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
  EditOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyOutlined,
  UserOutlined,
  CrownOutlined,
  UserSwitchOutlined,
  SettingOutlined,
} from '@ant-design/icons';

import { User, UpdateUserRequest } from '@/api/users';
import { usersAPI } from '@/api/users';
import { useAuth } from '@/contexts/AuthContext';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

interface EditUserModalProps {
  visible: boolean;
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  visible,
  user,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('cashier');
  const [enablePin, setEnablePin] = useState(false);

  const isOwnAccount = user?.id === currentUser?.id;

  // Initialize form when user data is available
  useEffect(() => {
    if (user && visible) {
      form.setFieldsValue({
        name: user.name,
        email: user.email || '',
        phone: user.phone || '',
        role: user.role,
        preferred_language: user.preferred_language,
        is_active: user.is_active,
        notes: user.notes || '',
      });
      setSelectedRole(user.role);
      setEnablePin(user.has_pin);
    }
  }, [user, visible, form]);

  const handleSubmit = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const values = await form.validateFields();

      // Prepare update data
      const updateData: UpdateUserRequest = {
        name: values.name.trim(),
        email: values.email?.trim() || undefined,
        phone: values.phone?.trim() || undefined,
        pin:
          enablePin && values.pin ? values.pin : enablePin ? undefined : null,
        role: values.role,
        preferred_language: values.preferred_language,
        notes: values.notes?.trim() || undefined,
        is_active: isOwnAccount ? undefined : values.is_active, // Can't change own status
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof UpdateUserRequest] === undefined) {
          delete updateData[key as keyof UpdateUserRequest];
        }
      });

      const response = await usersAPI.updateUser(user.id, updateData);

      if (response.success) {
        message.success(t('users.messages.userUpdated'));
        onSuccess();
      } else {
        message.error(response.error || t('users.messages.updateError'));
      }
    } catch (error: any) {
      console.error('Error updating user:', error);
      if (error.errorFields) {
        // Form validation errors
        return;
      }
      message.error(t('users.messages.updateError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const validatePin = (_: any, value: string) => {
    if (!enablePin || !value) return Promise.resolve();

    if (!/^\d{4,6}$/.test(value)) {
      return Promise.reject(new Error(t('users.validation.pinFormat')));
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

  if (!user) return null;

  return (
    <Modal
      title={
        <div className='flex items-center space-x-3'>
          <div className='w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center'>
            <EditOutlined className='text-white text-sm' />
          </div>
          <div>
            <span className='text-lg font-semibold text-gray-800'>
              {t('users.edit.title')}
            </span>
            <div className='text-sm text-gray-500'>@{user.username}</div>
          </div>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      width={720}
      footer={[
        <Button key='cancel' onClick={handleCancel} size='middle'>
          {t('common.cancel')}
        </Button>,
        <Button
          key='submit'
          type='primary'
          loading={loading}
          onClick={handleSubmit}
          size='middle'
          className='bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 border-0'
        >
          {t('users.edit.submit')}
        </Button>,
      ]}
      maskClosable={false}
      className='user-modal'
    >
      <div className='max-h-[70vh] overflow-y-auto pr-2'>
        <Form form={form} layout='vertical' className='space-y-4'>
          {/* Username Notice */}
          <Alert
            message={t('users.edit.usernameNote')}
            description={t('users.edit.usernameDescription', {
              username: user.username,
            })}
            type='info'
            showIcon
            className='mb-4'
          />

          {/* Basic Information */}
          <div className='bg-gray-50 rounded-lg p-4 space-y-4'>
            <div className='flex items-center space-x-2 mb-3'>
              <UserOutlined className='text-green-600' />
              <Text strong className='text-gray-800'>
                {t('users.edit.sections.basicInfo')}
              </Text>
            </div>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name='name'
                  label={t('users.fields.name')}
                  rules={[
                    {
                      required: true,
                      message: t('users.validation.nameRequired'),
                    },
                    { min: 2, message: t('users.validation.nameMinLength') },
                  ]}
                  className='mb-3'
                >
                  <Input
                    placeholder={t('users.placeholders.name')}
                    maxLength={100}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name='email'
                  label={t('users.fields.email')}
                  rules={[
                    {
                      type: 'email',
                      message: t('users.validation.emailFormat'),
                    },
                  ]}
                  className='mb-3'
                >
                  <Input
                    prefix={<MailOutlined className='text-gray-400' />}
                    placeholder={t('users.placeholders.email')}
                    maxLength={100}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name='phone'
              label={t('users.fields.phone')}
              className='mb-0'
            >
              <Input
                prefix={<PhoneOutlined className='text-gray-400' />}
                placeholder={t('users.placeholders.phone')}
                maxLength={20}
              />
            </Form.Item>
          </div>

          {/* PIN Management */}
          <div className='bg-orange-50 rounded-lg p-4 space-y-4'>
            <div className='flex items-center space-x-2 mb-3'>
              <SafetyOutlined className='text-orange-600' />
              <Text strong className='text-gray-800'>
                {t('users.edit.sections.pin')}
              </Text>
            </div>

            <div className='bg-white rounded-md p-3 border border-orange-200'>
              <div className='flex items-center justify-between mb-2'>
                <div className='flex items-center space-x-2'>
                  <SafetyOutlined className='text-orange-500' />
                  <Text strong className='text-sm'>
                    {t('users.fields.enablePin')}
                  </Text>
                  <Switch
                    size='small'
                    checked={enablePin}
                    onChange={setEnablePin}
                  />
                </div>
              </div>
              <Text type='secondary' className='text-xs block mb-2'>
                {user.has_pin && !enablePin
                  ? t('users.help.pinWillBeRemoved')
                  : t('users.help.pinDescription')}
              </Text>

              {enablePin && (
                <Form.Item
                  name='pin'
                  label={
                    user.has_pin
                      ? t('users.fields.newPin')
                      : t('users.fields.pin')
                  }
                  rules={[
                    {
                      required: enablePin && !user.has_pin,
                      message: t('users.validation.pinRequired'),
                    },
                    { validator: validatePin },
                  ]}
                  className='mb-0'
                >
                  <Input
                    prefix={<SafetyOutlined className='text-gray-400' />}
                    placeholder={
                      user.has_pin
                        ? t('users.placeholders.newPin')
                        : t('users.placeholders.pin')
                    }
                    maxLength={6}
                    type='password'
                  />
                </Form.Item>
              )}
            </div>
          </div>

          {/* Role & Permissions */}
          <div className='bg-blue-50 rounded-lg p-4 space-y-4'>
            <div className='flex items-center space-x-2 mb-3'>
              <CrownOutlined className='text-blue-600' />
              <Text strong className='text-gray-800'>
                {t('users.edit.sections.rolePermissions')}
              </Text>
            </div>

            <Form.Item
              name='role'
              label={t('users.fields.role')}
              rules={[
                { required: true, message: t('users.validation.roleRequired') },
              ]}
              className='mb-3'
            >
              <Select
                onChange={setSelectedRole}
                disabled={isOwnAccount}
                placeholder='Select role'
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

            {isOwnAccount && (
              <Alert
                message={t('users.edit.ownAccountNote')}
                type='warning'
                showIcon
                className='mb-3'
              />
            )}

            {/* Role Permissions Preview */}
            <Alert
              message={
                <Text strong className='text-sm'>
                  {t('users.edit.rolePermissions', {
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

          {/* Additional Settings */}
          <div className='bg-green-50 rounded-lg p-4 space-y-4'>
            <div className='flex items-center space-x-2 mb-3'>
              <SettingOutlined className='text-green-600' />
              <Text strong className='text-gray-800'>
                {t('users.edit.sections.additionalSettings')}
              </Text>
            </div>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name='preferred_language'
                  label={t('users.fields.preferredLanguage')}
                  className='mb-3'
                >
                  <Select placeholder='Select language'>
                    <Option value='en'>{t('languages.en')}</Option>
                    <Option value='si'>{t('languages.si')}</Option>
                    <Option value='ta'>{t('languages.ta')}</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                {!isOwnAccount && (
                  <Form.Item
                    name='is_active'
                    label={t('users.fields.status')}
                    valuePropName='checked'
                    className='mb-3'
                  >
                    <Switch
                      checkedChildren={t('users.status.active')}
                      unCheckedChildren={t('users.status.inactive')}
                    />
                  </Form.Item>
                )}
              </Col>
            </Row>

            <Form.Item
              name='notes'
              label={t('users.fields.notes')}
              className='mb-0'
            >
              <TextArea
                placeholder={t('users.placeholders.notes')}
                rows={2}
                maxLength={500}
              />
            </Form.Item>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default EditUserModal;
