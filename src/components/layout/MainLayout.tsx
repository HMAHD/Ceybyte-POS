/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                    Main Application Layout                                       │
 * │                                                                                                  │
 * │  Description: Responsive main layout with sidebar navigation, header with status indicators,     │
 * │               footer with branding, and role-based menu access control.                          │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout,
  Menu,
  Button,
  Space,
  Typography,
  Tag,
  Badge,
  Tooltip,
  Dropdown,
  Avatar,
  Divider,
} from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  SettingOutlined,
  LogoutOutlined,
  WifiOutlined,
  PrinterOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
  BgColorsOutlined,
  KeyOutlined,
  UsergroupAddOutlined,
  ContactsTwoTone,
} from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import { useNetwork } from '@/contexts/NetworkContext';
import { useTranslation } from '@/hooks/useTranslation';
import LocalizedText from '@/components/LocalizedText';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import UPSStatusIndicator from '@/components/UPSStatusIndicator';
import KeyboardShortcutsModal, {
  useKeyboardShortcuts,
  ShortcutHint,
} from '@/components/KeyboardShortcuts';
import { APP_NAME, COMPANY_NAME } from '@/utils/constants';
import { KEYBOARD_SHORTCUTS, COMPONENT_SIZES } from '@/theme/designSystem';

const { Header, Sider, Content, Footer } = Layout;
const { Text, Title } = Typography;

interface MainLayoutProps {
  children: ReactNode;
  selectedKey?: string;
}

interface StatusIndicatorProps {
  type: 'network' | 'printer' | 'ups';
  status: 'connected' | 'disconnected' | 'warning';
  label: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  type,
  status,
  label,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'network':
        return <WifiOutlined />;
      case 'printer':
        return <PrinterOutlined />;
      case 'ups':
        return <ThunderboltOutlined />;
      default:
        return null;
    }
  };

  const getStatusInfo = () => {
    switch (status) {
      case 'connected':
        return { color: '#22c55e', bgColor: '#dcfce7', dotColor: '#16a34a' };
      case 'warning':
        return { color: '#f59e0b', bgColor: '#fef3c7', dotColor: '#d97706' };
      case 'disconnected':
        return { color: '#ef4444', bgColor: '#fee2e2', dotColor: '#dc2626' };
      default:
        return { color: '#6b7280', bgColor: '#f3f4f6', dotColor: '#9ca3af' };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Tooltip title={label} placement='bottom'>
      <div
        className='relative inline-flex items-center justify-center w-8 h-8 rounded-lg hover:scale-105 transition-all duration-200 cursor-pointer'
        style={{
          backgroundColor: statusInfo.bgColor,
          color: statusInfo.color,
        }}
      >
        <span className='text-sm font-medium'>{getIcon()}</span>
        <span
          className='absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white'
          style={{ backgroundColor: statusInfo.dotColor }}
        ></span>
      </div>
    </Tooltip>
  );
};

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  selectedKey = 'dashboard',
}) => {
  const navigate = useNavigate();
  const { user, logout, hasPermission } = useAuth();
  const { config: networkConfig, connectionStatus } = useNetwork();
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Mock status - in real app, these would come from system monitoring
  const [printerStatus] = useState<'connected' | 'disconnected' | 'warning'>(
    'connected'
  );

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: (
        <LocalizedText>{t('navigation.dashboard', 'Dashboard')}</LocalizedText>
      ),
      permission: 'dashboard',
    },
    {
      key: 'pos',
      icon: <ShoppingCartOutlined />,
      label: (
        <LocalizedText>{t('navigation.pos', 'Point of Sale')}</LocalizedText>
      ),
      permission: 'sales',
    },
    {
      key: 'products',
      icon: <FileTextOutlined />,
      label: (
        <LocalizedText>{t('navigation.products', 'Products')}</LocalizedText>
      ),
      permission: 'inventory',
    },
    {
      key: 'customers',
      icon: <UserOutlined />,
      label: (
        <LocalizedText>{t('navigation.customers', 'Customers')}</LocalizedText>
      ),
      permission: 'customers',
    },
    {
      key: 'suppliers',
      icon: <TeamOutlined />,
      label: (
        <LocalizedText>{t('navigation.suppliers', 'Suppliers')}</LocalizedText>
      ),
      permission: 'suppliers',
    },
    {
      key: 'users',
      icon: <ContactsTwoTone twoToneColor={['#8b5cf6', '#c4b5fd']} />,
      label: (
        <LocalizedText>
          {t('navigation.users', 'User Management')}
        </LocalizedText>
      ),
      permission: 'users',
    },
    {
      key: 'reports',
      icon: <FileTextOutlined />,
      label: (
        <LocalizedText>{t('navigation.reports', 'Reports')}</LocalizedText>
      ),
      permission: 'reports',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: (
        <LocalizedText>{t('navigation.settings', 'Settings')}</LocalizedText>
      ),
      permission: 'settings',
    },
  ];

  // Filter menu items based on user permissions
  const filteredMenuItems = menuItems.filter(item => {
    if (item.type === 'divider') return true;
    if (!item.permission) return true;
    return hasPermission(item.permission);
  });

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <LocalizedText>{t('user.profile', 'Profile')}</LocalizedText>,
    },
    {
      key: 'theme',
      icon: <BgColorsOutlined />,
      label: <LocalizedText>{t('user.theme', 'Theme Settings')}</LocalizedText>,
    },
    {
      key: 'shortcuts',
      icon: <KeyOutlined />,
      label: (
        <LocalizedText>
          {t('user.shortcuts', 'Keyboard Shortcuts')}
        </LocalizedText>
      ),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: <LocalizedText>{t('auth.logout', 'Logout')}</LocalizedText>,
      onClick: logout,
    },
  ];

  const handleMenuClick = (key: string) => {
    if (key === 'shortcuts') {
      setShowShortcuts(true);
    } else {
      // Navigate to the selected route
      navigate(`/${key}`);
    }
  };

  // Set up keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: KEYBOARD_SHORTCUTS.help,
      action: () => setShowShortcuts(true),
      description: 'Show keyboard shortcuts',
      category: 'global',
    },
    {
      key: KEYBOARD_SHORTCUTS.settings,
      action: () => navigate('/settings'),
      description: 'Open settings',
      category: 'global',
    },
    {
      key: 'F1',
      action: () => navigate('/dashboard'),
      description: 'Go to dashboard',
      category: 'navigation',
    },
    {
      key: 'F2',
      action: () => navigate('/pos'),
      description: 'Open POS interface',
      category: 'navigation',
    },
    {
      key: 'F3',
      action: () => navigate('/products'),
      description: 'Manage products',
      category: 'navigation',
    },
    {
      key: 'F4',
      action: () => navigate('/customers'),
      description: 'Manage customers',
      category: 'navigation',
    },
    // Add more shortcuts as needed
  ]);

  return (
    <Layout className='min-h-screen bg-gray-50'>
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        className='modern-sidebar shadow-lg'
        style={{
          background: '#ffffff',
          borderRight: '1px solid #e5e7eb',
          boxShadow: '2px 0 4px rgba(0, 0, 0, 0.03)',
        }}
      >
        {/* Logo */}
        <div className='p-3 text-center border-b border-gray-100 mb-2'>
          {!collapsed ? (
            <div className='flex items-center justify-center space-x-2'>
              <div className='w-8 h-8 rounded-lg bg-white border-2 border-blue-600 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow duration-200'>
                <span className='text-blue-600 font-bold text-sm'>CP</span>
              </div>
              <div className='mb-0 text-gray-800 font-bold text-lg'>
                <LocalizedText>{APP_NAME}</LocalizedText>
              </div>
            </div>
          ) : (
            <div className='w-8 h-8 rounded-lg bg-white border-2 border-blue-600 flex items-center justify-center shadow-sm mx-auto hover:shadow-md transition-shadow duration-200'>
              <span className='text-white font-bold text-sm'>CP</span>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <div className='px-2'>
          <Menu
            mode='inline'
            selectedKeys={[selectedKey]}
            items={filteredMenuItems}
            onClick={({ key }) => handleMenuClick(key)}
            className='border-none bg-transparent'
            style={{
              fontSize: '14px',
            }}
          />
        </div>

        {/* User info removed from sidebar as it's already in header */}
      </Sider>

      <Layout>
        {/* Header */}
        <Header
          className='bg-white shadow-sm border-b px-2 sm:px-4 backdrop-blur-lg'
          style={{
            height: 56,
            lineHeight: 'normal',
            background: '#ffffff',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div className='flex justify-between items-center w-full'>
            {/* Left side - Collapse button and breadcrumb */}
            <div className='flex items-center'>
              <Button
                type='text'
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                className='mr-3 hover:bg-gray-100 rounded-md transition-colors'
                size='middle'
                style={{ height: '32px', width: '32px' }}
              />

              {/* Terminal Status - Always Visible */}
              <div className='flex items-center space-x-1 sm:space-x-2 px-1 sm:px-2 py-1 bg-white rounded-lg border border-gray-200'>
                <Text type='secondary' className='text-xs sm:text-sm'>
                  <span className='hidden sm:inline'>
                    <LocalizedText>
                      {t('header.terminal', 'Terminal')}:
                    </LocalizedText>
                  </span>
                  <Text className='ml-1 font-medium text-blue-600'>
                    {networkConfig.terminalName ||
                      networkConfig.terminalId ||
                      'MAIN-001'}
                  </Text>
                </Text>
                {networkConfig.terminalType && (
                  <Tag
                    color={
                      networkConfig.terminalType === 'main' ? 'blue' : 'green'
                    }
                    size='small'
                    className='text-xs'
                  >
                    <LocalizedText>
                      {networkConfig.terminalType === 'main'
                        ? t('network.main', 'MAIN')
                        : t('network.client', 'CLIENT')}
                    </LocalizedText>
                  </Tag>
                )}
              </div>
            </div>

            {/* Right side - Status indicators, language switcher, user menu */}
            <div className='flex items-center space-x-1 sm:space-x-2'>
              {/* Connection Status Indicators - Always Visible */}
              <div className='flex items-center space-x-1 sm:space-x-2 px-1 sm:px-2 py-1 bg-gray-50 rounded-lg border border-gray-200'>
                <StatusIndicator
                  type='network'
                  status={connectionStatus}
                  label={t('status.network', 'Network Connection')}
                />
                <StatusIndicator
                  type='printer'
                  status={printerStatus}
                  label={t('status.printer', 'Printer Connection')}
                />
                <UPSStatusIndicator size='small' />
              </div>

              <div className='w-px h-6 bg-gray-300'></div>

              {/* Language Switcher - Always Visible */}
              <div className='px-1'>
                <LanguageSwitcher variant='compact' />
              </div>

              {/* User Menu */}
              <div className='ml-2'>
                <Dropdown
                  menu={{
                    items: userMenuItems,
                    onClick: ({ key }) => {
                      if (key === 'logout') {
                        logout();
                      } else {
                        handleMenuClick(key);
                      }
                    },
                  }}
                  placement='bottomRight'
                >
                  <Button
                    type='text'
                    className='flex items-center px-3 py-1 hover:bg-gray-100 rounded-lg border border-gray-200'
                  >
                    <Avatar
                      size={24}
                      icon={<UserOutlined />}
                      className='mr-2'
                      style={{ backgroundColor: '#0066cc' }}
                    />
                    <div className='hidden lg:block text-left'>
                      <div className='text-sm font-medium text-gray-900'>
                        <LocalizedText>{user?.name}</LocalizedText>
                      </div>
                      <div className='text-xs text-gray-500'>
                        <LocalizedText>{user?.role}</LocalizedText>
                      </div>
                    </div>
                  </Button>
                </Dropdown>
              </div>
            </div>
          </div>
        </Header>

        {/* Main Content */}
        <Content className='bg-transparent overflow-auto'>
          <div className='min-h-full'>{children}</div>
        </Content>

        {/* Footer */}
        <Footer
          className='bg-white border-t text-center py-1 px-2 shadow-sm'
          style={{
            background: 'rgba(255, 255, 255, 0.98)',
            borderTop: '1px solid rgba(0, 102, 204, 0.1)',
            minHeight: '40px',
          }}
        >
          <div className='flex flex-wrap items-center justify-between gap-2 text-xs'>
            <Text type='secondary' className='text-xs'>
              <span className='hidden sm:inline'>Powered by </span>
              <Text strong>{COMPANY_NAME}</Text>
            </Text>
            <div className='hidden lg:flex text-xs gap-4'>
              <ShortcutHint
                shortcut={KEYBOARD_SHORTCUTS.quickSale}
                description={t('shortcuts.quickSale', 'Quick Sale')}
              />
              <ShortcutHint
                shortcut={KEYBOARD_SHORTCUTS.customerMode}
                description={t('shortcuts.customerMode', 'Customer Mode')}
              />
              <ShortcutHint
                shortcut={KEYBOARD_SHORTCUTS.settings}
                description={t('shortcuts.settings', 'Settings')}
              />
              <ShortcutHint
                shortcut={KEYBOARD_SHORTCUTS.help}
                description={t('shortcuts.help', 'Help')}
              />
            </div>
            <Text type='secondary' className='text-xs'>
              <GlobalOutlined className='mr-1' />
              <span className='hidden sm:inline'>
                <LocalizedText>
                  {t('footer.version', 'Version')}
                </LocalizedText>{' '}
              </span>
              1.0.0
            </Text>
          </div>
        </Footer>
      </Layout>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        visible={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </Layout>
  );
};

export default MainLayout;
