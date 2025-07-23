/*
 * ╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                        CEYBYTE POS                                               ║
 * ║                                                                                                  ║
 * ║                                  User Details Modal                                              ║
 * ║                                                                                                  ║
 * ║  Description: Modal component for viewing detailed user information including                    ║
 * ║               permissions, activity history, and session information.                            ║
 * ║                                                                                                  ║
 * ║  Author: Akash Hasendra                                                                          ║
 * ║  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   ║
 * ║  License: MIT License with Sri Lankan Business Terms                                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  Descriptions,
  Tag,
  Badge,
  Space,
  Typography,
  Divider,
  Avatar,
  Card,
  Row,
  Col,
  Tooltip,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyOutlined,
  CrownOutlined,
  UserSwitchOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  GlobalOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

import { User } from '@/api/users';

const { Title, Text, Paragraph } = Typography;

interface UserDetailsModalProps {
  visible: boolean;
  user: User | null;
  onClose: () => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  visible,
  user,
  onClose,
}) => {
  const { t } = useTranslation();

  if (!user) return null;

  // Get role icon and color
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <CrownOutlined style={{ color: '#faad14' }} />;
      case 'cashier':
        return <SafetyOutlined style={{ color: '#1890ff' }} />;
      case 'helper':
        return <UserSwitchOutlined style={{ color: '#52c41a' }} />;
      default:
        return <UserOutlined />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'gold';
      case 'cashier':
        return 'blue';
      case 'helper':
        return 'green';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getRelativeTime = (dateString?: string) => {
    if (!dateString) return '-';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t('users.time.today');
    if (diffDays === 1) return t('users.time.yesterday');
    if (diffDays < 7) return t('users.time.daysAgo', { days: diffDays });
    if (diffDays < 30)
      return t('users.time.weeksAgo', { weeks: Math.floor(diffDays / 7) });
    return t('users.time.monthsAgo', { months: Math.floor(diffDays / 30) });
  };

  return (
    <Modal
      title={
        <Space size='middle'>
          <Avatar
            size='large'
            icon={<UserOutlined />}
            style={{
              backgroundColor: user.is_active ? '#1890ff' : '#d9d9d9',
              color: '#fff',
            }}
          />
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {user.name}
            </Title>
            <Text type='secondary'>@{user.username}</Text>
          </div>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={700}
      footer={null}
      maskClosable={true}
    >
      <div style={{ marginTop: 16 }}>
        {/* Status Overview */}
        <Card size='small' style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <Badge
                  status={user.is_active ? 'success' : 'default'}
                  text={
                    user.is_active
                      ? t('users.status.active')
                      : t('users.status.inactive')
                  }
                />
                <br />
                <Text type='secondary' style={{ fontSize: '12px' }}>
                  {t('users.details.accountStatus')}
                </Text>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <Tag
                  icon={getRoleIcon(user.role)}
                  color={getRoleColor(user.role)}
                >
                  {user.role_name}
                </Tag>
                <br />
                <Text type='secondary' style={{ fontSize: '12px' }}>
                  {t('users.details.userRole')}
                </Text>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                {user.has_pin ? (
                  <Tag color='orange' icon={<SafetyOutlined />}>
                    {t('users.details.pinEnabled')}
                  </Tag>
                ) : (
                  <Tag color='default'>{t('users.details.pinDisabled')}</Tag>
                )}
                <br />
                <Text type='secondary' style={{ fontSize: '12px' }}>
                  {t('users.details.quickAccess')}
                </Text>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Basic Information */}
        <Descriptions
          title={t('users.details.sections.basicInfo')}
          bordered
          size='small'
          column={1}
          style={{ marginBottom: 16 }}
        >
          <Descriptions.Item label={t('users.fields.username')}>
            <Space>
              <UserOutlined />
              <Text code>{user.username}</Text>
            </Space>
          </Descriptions.Item>

          <Descriptions.Item label={t('users.fields.name')}>
            {user.name}
          </Descriptions.Item>

          <Descriptions.Item label={t('users.fields.email')}>
            {user.email ? (
              <Space>
                <MailOutlined />
                <Text copyable>{user.email}</Text>
              </Space>
            ) : (
              <Text type='secondary'>-</Text>
            )}
          </Descriptions.Item>

          <Descriptions.Item label={t('users.fields.phone')}>
            {user.phone ? (
              <Space>
                <PhoneOutlined />
                <Text copyable>{user.phone}</Text>
              </Space>
            ) : (
              <Text type='secondary'>-</Text>
            )}
          </Descriptions.Item>

          <Descriptions.Item label={t('users.fields.preferredLanguage')}>
            <Space>
              <GlobalOutlined />
              {t(`languages.${user.preferred_language}`)}
            </Space>
          </Descriptions.Item>
        </Descriptions>

        {/* Role and Permissions */}
        <Card
          title={
            <Space>
              {getRoleIcon(user.role)}
              {t('users.details.sections.rolePermissions')}
            </Space>
          }
          size='small'
          style={{ marginBottom: 16 }}
        >
          <Paragraph>
            <Text strong>{t('users.details.role')}:</Text> {user.role_name}
          </Paragraph>

          <Text strong>{t('users.details.permissions')}:</Text>
          <div style={{ marginTop: 8 }}>
            {user.permissions.map(permission => (
              <Tag
                key={permission}
                icon={<CheckCircleOutlined />}
                color='green'
                style={{ marginBottom: 4 }}
              >
                {t(`users.permissions.${permission}`)}
              </Tag>
            ))}
          </div>
        </Card>

        {/* Activity Information */}
        <Descriptions
          title={
            <Space>
              <ClockCircleOutlined />
              {t('users.details.sections.activity')}
            </Space>
          }
          bordered
          size='small'
          column={1}
          style={{ marginBottom: 16 }}
        >
          <Descriptions.Item label={t('users.details.lastLogin')}>
            {user.last_login ? (
              <Tooltip title={formatDate(user.last_login)}>
                <Space>
                  <ClockCircleOutlined />
                  {getRelativeTime(user.last_login)}
                </Space>
              </Tooltip>
            ) : (
              <Text type='secondary'>{t('users.details.neverLoggedIn')}</Text>
            )}
          </Descriptions.Item>

          <Descriptions.Item label={t('users.details.lastActivity')}>
            {user.last_activity ? (
              <Tooltip title={formatDate(user.last_activity)}>
                <Space>
                  <ClockCircleOutlined />
                  {getRelativeTime(user.last_activity)}
                </Space>
              </Tooltip>
            ) : (
              <Text type='secondary'>{t('users.details.noActivity')}</Text>
            )}
          </Descriptions.Item>

          <Descriptions.Item label={t('users.details.accountCreated')}>
            <Tooltip title={formatDate(user.created_at)}>
              <Space>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                {getRelativeTime(user.created_at)}
              </Space>
            </Tooltip>
          </Descriptions.Item>

          {user.updated_at && (
            <Descriptions.Item label={t('users.details.lastUpdated')}>
              <Tooltip title={formatDate(user.updated_at)}>
                <Space>
                  <ClockCircleOutlined />
                  {getRelativeTime(user.updated_at)}
                </Space>
              </Tooltip>
            </Descriptions.Item>
          )}
        </Descriptions>

        {/* Notes */}
        {user.notes && (
          <Card
            title={
              <Space>
                <FileTextOutlined />
                {t('users.details.sections.notes')}
              </Space>
            }
            size='small'
          >
            <Paragraph>{user.notes}</Paragraph>
          </Card>
        )}
      </div>
    </Modal>
  );
};

export default UserDetailsModal;
