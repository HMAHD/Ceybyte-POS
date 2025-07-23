/*
 * ╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                        CEYBYTE POS                                               ║
 * ║                                                                                                  ║
 * ║                                  User Management Interface                                       ║
 * ║                                                                                                  ║
 * ║  Description: Complete user management interface with CRUD operations, role management,          ║
 * ║               search, filtering, and user status controls for admin users.                       ║
 * ║                                                                                                  ║
 * ║  Author: Akash Hasendra                                                                          ║
 * ║  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   ║
 * ║  License: MIT License with Sri Lankan Business Terms                                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Tooltip,
  Modal,
  message,
  Card,
  Row,
  Col,
  Typography,
  Avatar,
  Dropdown,
  Badge,
} from 'antd';
import {
  UserOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined,
  EyeOutlined,
  MoreOutlined,
  ReloadOutlined,
  CrownOutlined,
  SafetyOutlined,
  UserSwitchOutlined,
  MailOutlined,
  PhoneOutlined,
  ContactsTwoTone,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

import { User, UserFilters } from '@/api/users';
import { usersAPI } from '@/api/users';
import { useAuth } from '@/contexts/AuthContext';
import LocalizedText from '@/components/LocalizedText';
import CreateUserModal from './CreateUserModal';
import EditUserModal from './EditUserModal';
import UserDetailsModal from './UserDetailsModal';

const { Title, Text } = Typography;
const { Option } = Select;

interface UserManagementProps {
  className?: string;
}

const UserManagement: React.FC<UserManagementProps> = ({ className }) => {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();

  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // Filters and search
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: undefined,
    is_active: undefined,
  });

  // Modals
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Load users
  const loadUsers = async () => {
    console.log('🔍 Loading users...');
    setLoading(true);
    try {
      const response = await usersAPI.getUsers({
        ...filters,
        page: pagination.current,
        per_page: pagination.pageSize,
      });

      console.log('📦 API Response:', response);

      if (response.success && response.data) {
        console.log('✅ Setting users:', response.data.users?.length || 0, 'users');
        setUsers(response.data?.users || []);
        setPagination(prev => ({
          ...prev,
          total: response.data?.total || 0,
        }));
      } else {
        console.error('❌ API returned error:', response.error);
        message.error(t('users.messages.loadError'));
      }
    } catch (error) {
      console.error('💥 Error loading users:', error);
      message.error(t('users.messages.loadError'));
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    loadUsers();
  }, [filters, pagination.current, pagination.pageSize]);

  // Handlers
  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleRoleFilter = (value: string | undefined) => {
    setFilters(prev => ({ ...prev, role: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleStatusFilter = (value: boolean | undefined) => {
    setFilters(prev => ({ ...prev, is_active: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleToggleStatus = async (userId: number) => {
    try {
      const response = await usersAPI.toggleUserStatus(userId);
      if (response.success) {
        message.success(t('users.messages.statusUpdated'));
        loadUsers();
      } else {
        message.error(t('users.messages.statusUpdateError'));
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      message.error(t('users.messages.statusUpdateError'));
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      const response = await usersAPI.deleteUser(userId);
      if (response.success) {
        message.success(t('users.messages.userDeleted'));
        loadUsers();
      } else {
        message.error(t('users.messages.deleteError'));
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      message.error(t('users.messages.deleteError'));
    }
  };

  const handleResetPassword = async (userId: number) => {
    Modal.confirm({
      title: t('users.resetPassword.title'),
      content: t('users.resetPassword.confirmation'),
      onOk: async () => {
        try {
          // For now, we'll use a default password. In production, this should generate a random password
          const response = await usersAPI.resetUserPassword(
            userId,
            'newpass123'
          );
          if (response.success) {
            message.success(t('users.messages.passwordReset'));
          } else {
            message.error(t('users.messages.passwordResetError'));
          }
        } catch (error) {
          console.error('Error resetting password:', error);
          message.error(t('users.messages.passwordResetError'));
        }
      },
    });
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <CrownOutlined style={{ color: '#gold' }} />;
      case 'cashier':
        return <SafetyOutlined style={{ color: '#1890ff' }} />;
      case 'helper':
        return <UserSwitchOutlined style={{ color: '#52c41a' }} />;
      default:
        return <UserOutlined />;
    }
  };

  // Get role color
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

  // Table columns
  const columns: ColumnsType<User> = [
    {
      title: <LocalizedText>{t('users.table.user', 'User')}</LocalizedText>,
      key: 'user',
      width: 200,
      fixed: 'left',
      render: (_, record) => (
        <div className='flex items-center space-x-2 py-1'>
          <Avatar
            size={32}
            icon={<UserOutlined />}
            className='flex-shrink-0'
            style={{
              backgroundColor: record.is_active ? '#3b82f6' : '#94a3b8',
              fontSize: '14px',
            }}
          />
          <div className='min-w-0 flex-1'>
            <div className='font-medium text-gray-900 text-sm truncate max-w-[120px]'>
              {record.name}
            </div>
            <Text type='secondary' className='text-xs truncate block max-w-[120px]'>
              @{record.username}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: <LocalizedText>{t('users.table.role', 'Role')}</LocalizedText>,
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role: string) => (
        <Tag
          icon={getRoleIcon(role)}
          color={getRoleColor(role)}
          className='px-2 py-1 rounded-md border-0 font-medium text-xs'
        >
          <LocalizedText>{t(`users.roles.${role}`, role.charAt(0).toUpperCase() + role.slice(1))}</LocalizedText>
        </Tag>
      ),
    },
    {
      title: <LocalizedText>{t('users.table.contact', 'Contact')}</LocalizedText>,
      key: 'contact',
      width: 180,
      render: (_, record) => (
        <div className='space-y-1'>
          {record.email && (
            <div className='text-xs text-gray-700 flex items-center truncate'>
              <MailOutlined className='mr-1 text-gray-400 flex-shrink-0' />
              <span className='truncate'>{record.email}</span>
            </div>
          )}
          {record.phone && (
            <div className='text-xs text-gray-600 flex items-center'>
              <PhoneOutlined className='mr-1 text-gray-400 flex-shrink-0' />
              <span>{record.phone}</span>
            </div>
          )}
          {!record.email && !record.phone && (
            <Text type='secondary' className='text-xs'>
              <LocalizedText>{t('users.table.noContact', 'No contact')}</LocalizedText>
            </Text>
          )}
        </div>
      ),
    },
    {
      title: <LocalizedText>{t('users.table.status', 'Status')}</LocalizedText>,
      key: 'status',
      width: 90,
      render: (_, record) => (
        <div className='space-y-1'>
          <Badge
            status={record.is_active ? 'success' : 'default'}
            text={
              <span
                className={`text-xs ${record.is_active ? 'text-green-600' : 'text-gray-500'}`}
              >
                <LocalizedText>{record.is_active ? t('users.status.active', 'Active') : t('users.status.inactive', 'Inactive')}</LocalizedText>
              </span>
            }
          />
          {record.has_pin && (
            <Tag
              color='orange'
              className='text-xs rounded-sm border-0 px-1'
              style={{ fontSize: '10px' }}
            >
              PIN
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: <LocalizedText>{t('users.table.lastLogin', 'Last Login')}</LocalizedText>,
      dataIndex: 'last_login',
      key: 'last_login',
      width: 120,
      render: (lastLogin: string) => {
        if (!lastLogin) {
          return (
            <Text type='secondary' className='text-xs'>
              <LocalizedText>{t('users.table.neverLoggedIn', 'Never')}</LocalizedText>
            </Text>
          );
        }

        const date = new Date(lastLogin);
        const now = new Date();
        const diffDays = Math.floor(
          (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
        );

        let timeText = '';
        if (diffDays === 0) timeText = 'Today';
        else if (diffDays === 1) timeText = 'Yesterday';
        else if (diffDays < 7) timeText = `${diffDays}d ago`;
        else timeText = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        return (
          <Tooltip title={date.toLocaleString()}>
            <div className='text-xs text-gray-600'>
              {timeText}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      fixed: 'right',
      render: (_, record) => {
        const isOwnAccount = record.id === currentUser?.id;

        const menuItems = [
          {
            key: 'view',
            icon: <EyeOutlined />,
            label: t('users.actions.view'),
            onClick: () => {
              setSelectedUser(record);
              setDetailsModalVisible(true);
            },
          },
          {
            key: 'edit',
            icon: <EditOutlined />,
            label: t('users.actions.edit'),
            onClick: () => {
              setSelectedUser(record);
              setEditModalVisible(true);
            },
          },
          {
            key: 'resetPassword',
            icon: <LockOutlined />,
            label: t('users.actions.resetPassword'),
            onClick: () => handleResetPassword(record.id),
          },
          {
            key: 'toggleStatus',
            icon: record.is_active ? <UnlockOutlined /> : <LockOutlined />,
            label: record.is_active
              ? t('users.actions.deactivate')
              : t('users.actions.activate'),
            disabled: isOwnAccount,
            onClick: () => handleToggleStatus(record.id),
          },
          {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: t('users.actions.delete'),
            disabled: isOwnAccount,
            danger: true,
            onClick: () => {
              Modal.confirm({
                title: t('users.delete.title'),
                content: t('users.delete.confirmation', { name: record.name }),
                onOk: () => handleDeleteUser(record.id),
              });
            },
          },
        ];

        return (
          <Space size={4}>
            <Button 
              type='text' 
              size='small'
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedUser(record);
                setDetailsModalVisible(true);
              }}
              className='text-blue-600 hover:bg-blue-50'
            />
            <Dropdown
              menu={{ items: menuItems.slice(1) }}
              trigger={['click']}
              placement='bottomRight'
            >
              <Button 
                type='text' 
                icon={<MoreOutlined />} 
                size='small'
                className='text-gray-500 hover:bg-gray-50'
              />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  // Check if current user has admin access
  if (currentUser?.role !== 'owner') {
    return (
      <div className='flex items-center justify-center h-64'>
        <Text type='secondary'><LocalizedText>{t('users.messages.accessDenied')}</LocalizedText></Text>
      </div>
    );
  }

  return (
    <div className={`user-management p-4 ${className || ''}`}>
      {/* Header Section */}
      <div className='mb-4'>
        <div className='flex items-center justify-between mb-3'>
          <div>
            <Title
              level={2}
              className='flex items-center gap-3 mb-1 text-gray-800'
              style={{ margin: 0 }}
            >
              <div className='w-10 h-10 bg-gradient-to-br from-violet-400 to-violet-600 rounded-xl flex items-center justify-center shadow-lg'>
                <ContactsTwoTone 
                  className='text-white text-lg'
                  twoToneColor={['#ffffff', '#ede9fe']}
                />
              </div>
              {t('users.title', 'User Management')}
            </Title>
            <Text type='secondary' className='text-sm'>
              <LocalizedText>
                {t('users.description', 'Manage system users, roles, and permissions')}
              </LocalizedText>
            </Text>
          </div>

          <Button
            type='primary'
            size='middle'
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
            className='bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 shadow-md hover:shadow-lg transition-all duration-200 px-4'
          >
            <LocalizedText>{t('users.actions.create', 'Add User')}</LocalizedText>
          </Button>
        </div>
      </div>

      {/* Search and Filters Section */}
      <div className='mb-8'>
        <Card
          className='shadow-sm border-0'
          styles={{ body: { padding: '20px' } }}
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
          }}
        >
          <Row gutter={[16, 16]} align='middle'>
            <Col xs={24} sm={24} md={14} lg={12}>
              <div className='space-y-1'>
                <Text className='text-sm font-medium text-gray-700'>
                  <LocalizedText>{t('common.search', 'Search')}</LocalizedText>
                </Text>
                <div className='flex gap-2'>
                  <Input
                    placeholder={t('users.search.placeholder', 'Search by name or username...')}
                    allowClear
                    onChange={(e) => handleSearch(e.target.value)}
                    size='middle'
                    className='flex-1'
                    prefix={<SearchOutlined className='text-gray-400' />}
                    style={{ height: '40px' }}
                  />
                  <Button
                    type='primary'
                    icon={<SearchOutlined />}
                    onClick={() => loadUsers()}
                    size='middle'
                    style={{ height: '40px' }}
                  >
                    <LocalizedText>{t('common.search', 'Search')}</LocalizedText>
                  </Button>
                </div>
              </div>
            </Col>

            <Col xs={12} sm={8} md={5} lg={4}>
              <div className='space-y-1'>
                <Text className='text-sm font-medium text-gray-700'>
                  <LocalizedText>{t('users.filters.role', 'Role')}</LocalizedText>
                </Text>
                <Select
                  placeholder={t('users.filters.role', 'All Roles')}
                  allowClear
                  size='middle'
                  className='w-full'
                  onChange={handleRoleFilter}
                  style={{ height: '40px' }}
                >
                  <Option value='owner'>
                    <Space>
                      <CrownOutlined className='text-yellow-500' />
                      <LocalizedText>{t('users.roles.owner', 'Owner')}</LocalizedText>
                    </Space>
                  </Option>
                  <Option value='cashier'>
                    <Space>
                      <SafetyOutlined className='text-blue-500' />
                      <LocalizedText>{t('users.roles.cashier', 'Cashier')}</LocalizedText>
                    </Space>
                  </Option>
                  <Option value='helper'>
                    <Space>
                      <UserSwitchOutlined className='text-green-500' />
                      <LocalizedText>{t('users.roles.helper', 'Helper')}</LocalizedText>
                    </Space>
                  </Option>
                </Select>
              </div>
            </Col>

            <Col xs={12} sm={8} md={5} lg={4}>
              <div className='space-y-1'>
                <Text className='text-sm font-medium text-gray-700'>
                  <LocalizedText>{t('users.filters.status', 'Status')}</LocalizedText>
                </Text>
                <Select
                  placeholder={t('users.filters.status', 'All Status')}
                  allowClear
                  size='middle'
                  className='w-full'
                  onChange={handleStatusFilter}
                  style={{ height: '40px' }}
                >
                  <Option value={true}>
                    <div className='flex items-center gap-2'>
                      <Badge status='success' />
                      <LocalizedText>{t('users.status.active', 'Active')}</LocalizedText>
                    </div>
                  </Option>
                  <Option value={false}>
                    <div className='flex items-center gap-2'>
                      <Badge status='default' />
                      <LocalizedText>{t('users.status.inactive', 'Inactive')}</LocalizedText>
                    </div>
                  </Option>
                </Select>
              </div>
            </Col>

            <Col xs={24} sm={8} md={24} lg={4}>
              <div className='space-y-1'>
                <Text className='text-sm font-medium text-gray-700'>&nbsp;</Text>
                <div className='flex justify-end'>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={loadUsers}
                    loading={loading}
                    size='middle'
                    className='hover:bg-gray-50'
                  >
                    <LocalizedText>{t('common.refresh', 'Refresh')}</LocalizedText>
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      </div>

      {/* Users Table Section */}
      <div>
        <Card
          className='shadow-sm border-0'
          styles={{ body: { padding: '0' } }}
          style={{
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
        <Table
          columns={columns}
          dataSource={users}
          loading={loading}
          rowKey='id'
          scroll={{ x: 750, y: 400 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              <LocalizedText>{t('users.pagination.total', `Showing ${range[0]}-${range[1]} of ${total} users`, { start: range[0], end: range[1], total })}</LocalizedText>,
            onChange: (page, pageSize) => {
              setPagination(prev => ({
                ...prev,
                current: page,
                pageSize: pageSize || prev.pageSize,
              }));
            },
            style: { padding: '16px 24px' },
          }}
          size='small'
          className='modern-table'
          style={
            {
              '--table-header-bg': '#fafbfc',
              '--table-row-hover-bg': '#f8fafc',
            } as any
          }
        />
      </Card>
      </div>

      {/* Modals */}
      <CreateUserModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSuccess={() => {
          setCreateModalVisible(false);
          loadUsers();
        }}
      />

      <EditUserModal
        visible={editModalVisible}
        user={selectedUser}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedUser(null);
        }}
        onSuccess={() => {
          setEditModalVisible(false);
          setSelectedUser(null);
          loadUsers();
        }}
      />

      <UserDetailsModal
        visible={detailsModalVisible}
        user={selectedUser}
        onClose={() => {
          setDetailsModalVisible(false);
          setSelectedUser(null);
        }}
      />
    </div>
  );
};

export default UserManagement;
