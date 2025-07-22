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

  const getColor = () => {
    switch (status) {
      case 'connected':
        return '#52c41a';
      case 'warning':
        return '#fa8c16';
      case 'disconnected':
        return '#f5222d';
      default:
        return '#d9d9d9';
    }
  };

  return (
    <Tooltip title={label}>
      <Badge dot color={getColor()} offset={[-2, 2]}>
        <span style={{ color: getColor(), fontSize: 16 }}>{getIcon()}</span>
      </Badge>
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
          background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
          borderRight: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        {/* Logo */}
        <div className='p-4 text-center border-b border-gray-100 mb-4'>
          {!collapsed ? (
            <div className='flex items-center justify-center space-x-2'>
              <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md'>
                <span className='text-white font-bold text-sm'>CP</span>
              </div>
              <Title level={4} className='mb-0 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent'>
                <LocalizedText>{APP_NAME}</LocalizedText>
              </Title>
            </div>
          ) : (
            <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md mx-auto'>
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

        {/* User Info in Sidebar (when expanded) */}
        {!collapsed && (
          <div className='absolute bottom-4 left-4 right-4'>
            <div className='p-3 bg-gray-50 rounded-lg'>
              <div className='flex items-center space-x-2'>
                <Avatar size='small' icon={<UserOutlined />} />
                <div className='flex-1 min-w-0'>
                  <Text className='text-xs font-medium truncate'>
                    <LocalizedText>{user?.name}</LocalizedText>
                  </Text>
                  <br />
                  <Tag color='blue'>
                    <LocalizedText>{user?.role}</LocalizedText>
                  </Tag>
                </div>
              </div>
            </div>
          </div>
        )}
      </Sider>

      <Layout>
        {/* Header */}
        <Header
          className='bg-white shadow-sm border-b px-6 backdrop-blur-sm'
          style={{ 
            height: 64, 
            lineHeight: '64px',
            background: 'rgba(255, 255, 255, 0.95)',
          }}
        >
          <div className='flex justify-between items-center h-full'>
            {/* Left side - Collapse button and breadcrumb */}
            <div className='flex items-center'>
              <Button
                type='text'
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                className='mr-4 hover:bg-gray-100 rounded-lg transition-colors'
                size='large'
              />

              {/* Terminal Status */}
              <Space size='middle'>
                <Text type='secondary'>
                  <LocalizedText>
                    {t('header.terminal', 'Terminal')}
                  </LocalizedText>
                  :
                  <Text className='ml-1 font-medium'>
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
                  >
                    <LocalizedText>
                      {networkConfig.terminalType === 'main'
                        ? t('network.main', 'Main')
                        : t('network.client', 'Client')}
                    </LocalizedText>
                  </Tag>
                )}
              </Space>
            </div>

            {/* Right side - Status indicators, language switcher, user menu */}
            <Space size='middle'>
              {/* Connection Status Indicators */}
              <Space size='small'>
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
              </Space>

              <Divider type='vertical' />

              {/* Language Switcher */}
              <LanguageSwitcher variant='compact' />

              {/* User Menu */}
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
                <Button type='text' className='flex items-center'>
                  <Avatar
                    size='small'
                    icon={<UserOutlined />}
                    className='mr-2'
                  />
                  <Text className='hidden sm:inline'>
                    <LocalizedText>{user?.name}</LocalizedText>
                  </Text>
                </Button>
              </Dropdown>
            </Space>
          </div>
        </Header>

        {/* Main Content */}
        <Content className='bg-transparent overflow-auto'>
          <div className='min-h-full'>
            {children}
          </div>
        </Content>

        {/* Footer */}
        <Footer className='bg-white border-t text-center py-3 shadow-sm' style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
          <Space split={<Divider type='vertical' />} size='middle'>
            <Text type='secondary' className='text-xs'>
              Powered by <Text strong>{COMPANY_NAME}</Text>
            </Text>
            <div className='text-xs'>
              <Space size='middle' wrap>
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
              </Space>
            </div>
            <Text type='secondary' className='text-xs'>
              <GlobalOutlined className='mr-1' />
              <LocalizedText>
                {t('footer.version', 'Version')}
              </LocalizedText>{' '}
              1.0.0
            </Text>
          </Space>
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
