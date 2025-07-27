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
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Layout,
  Menu,
  Button,
  Space,
  Typography,
  Tag,
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
import ConnectionStatusMonitor from '@/components/ConnectionStatusMonitor';
import { 
  useKeyboardShortcuts, 
  useRegisterShortcuts,
  KeyboardShortcutHint 
} from '@/components/KeyboardShortcutSystem';
import { APP_NAME, COMPANY_NAME } from '@/utils/constants';
import { 
  KEYBOARD_SHORTCUTS, 
  CEYBYTE_COLORS
} from '@/theme/designSystem';

const { Header, Sider, Content, Footer } = Layout;
const { Text, Title } = Typography;

interface MainLayoutProps {
  children: ReactNode;
  selectedKey?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  selectedKey,
}) => {
  const { user, logout, hasPermission } = useAuth();
  const { config: networkConfig } = useNetwork();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { showHelp } = useKeyboardShortcuts();

  // Auto-detect selected key from current route if not provided
  const currentSelectedKey = selectedKey || (() => {
    const path = location.pathname;
    if (path === '/') return 'dashboard';
    if (path.startsWith('/pos')) return 'pos';
    if (path.startsWith('/products')) return 'products';
    if (path.startsWith('/customers')) return 'customers';
    if (path.startsWith('/suppliers')) return 'suppliers';
    if (path.startsWith('/reports')) return 'reports';
    if (path.startsWith('/settings')) return 'settings';
    return 'dashboard';
  })();

  // Mock status - in real app, these would come from system monitoring
  const [] = useState<'connected' | 'disconnected' | 'warning'>(
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
      showHelp();
    } else {
      // Navigate to the selected route
      const routes: Record<string, string> = {
        dashboard: '/',
        pos: '/pos',
        products: '/products',
        customers: '/customers',
        suppliers: '/suppliers',
        reports: '/reports',
        settings: '/settings',
      };
      
      if (routes[key]) {
        navigate(routes[key]);
      }
    }
  };

  // Register keyboard shortcuts
  useRegisterShortcuts([
    {
      key: KEYBOARD_SHORTCUTS.help,
      action: () => showHelp(),
      description: t('shortcuts.helpDesc', 'Show keyboard shortcuts'),
      category: 'global',
    },
    {
      key: KEYBOARD_SHORTCUTS.settings,
      action: () => handleMenuClick('settings'),
      description: t('shortcuts.settingsDesc', 'Open settings'),
      category: 'global',
    },
    {
      key: KEYBOARD_SHORTCUTS.dashboard,
      action: () => handleMenuClick('dashboard'),
      description: t('shortcuts.dashboardDesc', 'Go to dashboard'),
      category: 'navigation',
    },
    {
      key: KEYBOARD_SHORTCUTS.quickSale,
      action: () => handleMenuClick('pos'),
      description: t('shortcuts.quickSaleDesc', 'Quick sale'),
      category: 'global',
    },
    {
      key: KEYBOARD_SHORTCUTS.products,
      action: () => handleMenuClick('products'),
      description: t('shortcuts.productsDesc', 'Go to products'),
      category: 'navigation',
    },
    {
      key: KEYBOARD_SHORTCUTS.customers,
      action: () => handleMenuClick('customers'),
      description: t('shortcuts.customersDesc', 'Go to customers'),
      category: 'navigation',
    },
    {
      key: KEYBOARD_SHORTCUTS.reports,
      action: () => handleMenuClick('reports'),
      description: t('shortcuts.reportsDesc', 'Go to reports'),
      category: 'navigation',
    },
  ]);

  return (
    <Layout className='min-h-screen'>
      {/* Enhanced Sidebar with better animations */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        className='shadow-lg transition-smooth animate-slide-in'
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)',
          borderRight: '1px solid #e5e7eb',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.06)',
        }}
      >
        {/* Enhanced Logo with Ceybyte Branding */}
        <div className='p-4 text-center border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100'>
          {!collapsed ? (
            <div className='space-y-1'>
              <Title level={4} className='mb-0 text-blue-600 font-bold'>
                <LocalizedText>{APP_NAME}</LocalizedText>
              </Title>
              <Text className='text-xs text-blue-500 font-medium'>
                <LocalizedText>Sri Lankan POS System</LocalizedText>
              </Text>
            </div>
          ) : (
            <div className='text-blue-600 text-xl font-bold bg-blue-100 w-10 h-10 rounded-lg flex items-center justify-center mx-auto'>
              CP
            </div>
          )}
        </div>

        {/* Enhanced Navigation Menu */}
        <Menu
          mode='inline'
          selectedKeys={[currentSelectedKey]}
          items={filteredMenuItems}
          onClick={({ key }) => handleMenuClick(key)}
          className='border-none transition-smooth mt-2'
          style={{
            background: 'transparent',
            fontSize: '14px',
          }}
          theme='light'
        />

        {/* Enhanced User Info in Sidebar (when expanded) */}
        {!collapsed && (
          <div className='absolute bottom-4 left-4 right-4 animate-fade-in'>
            <div className='p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 shadow-sm'>
              <div className='flex items-center space-x-3'>
                <Avatar 
                  size='small' 
                  icon={<UserOutlined />}
                  style={{ 
                    backgroundColor: CEYBYTE_COLORS.primary[500],
                    border: '2px solid white',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <div className='flex-1 min-w-0'>
                  <Text className='text-xs font-semibold truncate text-gray-700'>
                    <LocalizedText>{user?.name}</LocalizedText>
                  </Text>
                  <br />
                  <Tag 
                    color='blue' 
                    className='text-xs font-medium'
                    style={{ 
                      background: CEYBYTE_COLORS.primary[100],
                      color: CEYBYTE_COLORS.primary[700],
                      border: `1px solid ${CEYBYTE_COLORS.primary[200]}`
                    }}
                  >
                    <LocalizedText>{user?.role}</LocalizedText>
                  </Tag>
                </div>
              </div>
            </div>
          </div>
        )}
      </Sider>

      <Layout>
        {/* Enhanced Header with better styling */}
        <Header
          className='bg-white shadow-md border-b px-6 animate-slide-up'
          style={{ 
            height: 64, 
            lineHeight: '64px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderBottom: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
          }}
        >
          <div className='flex justify-between items-center h-full'>
            {/* Left side - Enhanced collapse button and terminal status */}
            <div className='flex items-center space-x-4'>
              <Button
                type='text'
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                className='hover:bg-blue-50 transition-fast'
                style={{
                  color: CEYBYTE_COLORS.primary[600],
                  fontSize: '16px',
                  width: '40px',
                  height: '40px',
                }}
              />

              {/* Enhanced Terminal Status */}
              <div className='connection-status-bar'>
                <Text type='secondary' className='text-sm font-medium'>
                  <LocalizedText>
                    {t('header.terminal', 'Terminal')}
                  </LocalizedText>
                  :
                </Text>
                <Text className='font-semibold text-gray-700'>
                  {networkConfig.terminalName ||
                    networkConfig.terminalId ||
                    'MAIN-001'}
                </Text>
                {networkConfig.terminalType && (
                  <Tag
                    color={
                      networkConfig.terminalType === 'main' ? 'blue' : 'green'
                    }
                    className='font-medium'
                    style={{
                      background: networkConfig.terminalType === 'main' 
                        ? CEYBYTE_COLORS.primary[100]
                        : CEYBYTE_COLORS.success[100],
                      color: networkConfig.terminalType === 'main'
                        ? CEYBYTE_COLORS.primary[700]
                        : CEYBYTE_COLORS.success[700],
                      border: `1px solid ${
                        networkConfig.terminalType === 'main'
                          ? CEYBYTE_COLORS.primary[200]
                          : CEYBYTE_COLORS.success[200]
                      }`
                    }}
                  >
                    <LocalizedText>
                      {networkConfig.terminalType === 'main'
                        ? t('network.main', 'Main')
                        : t('network.client', 'Client')}
                    </LocalizedText>
                  </Tag>
                )}
              </div>
            </div>

            {/* Right side - Enhanced status indicators, language switcher, user menu */}
            <Space size='large'>
              {/* Enhanced Connection Status Indicators */}
              <div className='flex items-center space-x-3'>
                <ConnectionStatusMonitor compact showAlert={false} />
                <UPSStatusIndicator size='small' />
              </div>

              <Divider type='vertical' style={{ height: '24px', borderColor: '#d1d5db' }} />

              {/* Language Switcher */}
              <LanguageSwitcher variant='compact' />

              <Divider type='vertical' style={{ height: '24px', borderColor: '#d1d5db' }} />

              {/* Enhanced User Menu */}
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
                trigger={['click']}
              >
                <Button 
                  type='text' 
                  className='flex items-center hover:bg-blue-50 transition-fast px-3 py-2 rounded-lg'
                  style={{ height: '40px' }}
                >
                  <Avatar
                    size='small'
                    icon={<UserOutlined />}
                    className='mr-2'
                    style={{ 
                      backgroundColor: CEYBYTE_COLORS.primary[500],
                      border: '2px solid white',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <div className='hidden sm:flex flex-col items-start'>
                    <Text className='text-sm font-medium text-gray-700'>
                      <LocalizedText>{user?.name}</LocalizedText>
                    </Text>
                    <Text className='text-xs text-gray-500'>
                      <LocalizedText>{user?.role}</LocalizedText>
                    </Text>
                  </div>
                </Button>
              </Dropdown>
            </Space>
          </div>
        </Header>

        {/* Enhanced Main Content Area */}
        <Content 
          className='animate-fade-in'
          style={{
            minHeight: 'calc(100vh - 120px)', // Account for header and footer
            overflow: 'auto',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            padding: '24px',
          }}
        >
          <div className="max-w-full mx-auto">
            <div className="animate-slide-up">
              {children}
            </div>
          </div>
        </Content>

        {/* Enhanced Footer with better Ceybyte branding */}
        <Footer 
          className='bg-white border-t text-center animate-slide-up'
          style={{
            padding: '16px 24px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderTop: '1px solid #e2e8f0',
            boxShadow: '0 -1px 3px rgba(0, 0, 0, 0.05)',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div className='w-full max-w-6xl'>
            <div className='flex flex-wrap items-center justify-between gap-4'>
              {/* Left - Ceybyte Branding */}
              <div className='flex items-center space-x-2'>
                <Text type='secondary' className='text-xs font-medium'>
                  Powered by 
                </Text>
                <Text 
                  strong 
                  className='text-xs'
                  style={{ color: CEYBYTE_COLORS.primary[600] }}
                >
                  {COMPANY_NAME}
                </Text>
                <Text type='secondary' className='text-xs'>
                  - Sri Lankan POS System
                </Text>
              </div>

              {/* Center - Keyboard Shortcuts */}
              <div className='shortcut-hint-group'>
                <KeyboardShortcutHint
                  shortcut={KEYBOARD_SHORTCUTS.quickSale}
                  description={t('shortcuts.quickSale', 'Quick Sale')}
                />
                <span className='shortcut-separator'>|</span>
                <KeyboardShortcutHint
                  shortcut={KEYBOARD_SHORTCUTS.customerMode}
                  description={t('shortcuts.customerMode', 'Customer Mode')}
                />
                <span className='shortcut-separator'>|</span>
                <KeyboardShortcutHint
                  shortcut={KEYBOARD_SHORTCUTS.settings}
                  description={t('shortcuts.settings', 'Settings')}
                />
                <span className='shortcut-separator'>|</span>
                <KeyboardShortcutHint
                  shortcut={KEYBOARD_SHORTCUTS.help}
                  description={t('shortcuts.help', 'Help')}
                />
              </div>

              {/* Right - Version Info */}
              <div className='flex items-center space-x-2'>
                <GlobalOutlined 
                  className='text-gray-400' 
                  style={{ fontSize: '12px' }}
                />
                <Text type='secondary' className='text-xs font-medium'>
                  <LocalizedText>
                    {t('footer.version', 'Version')}
                  </LocalizedText>{' '}
                  1.0.0
                </Text>
              </div>
            </div>
          </div>
        </Footer>
      </Layout>


    </Layout>
  );
};

export default MainLayout;
