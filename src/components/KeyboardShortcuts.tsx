/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                  Keyboard Shortcuts Component                                    │
 * │                                                                                                  │
 * │  Description: Global keyboard shortcuts handler and visual indicator component.                  │
 * │               Provides consistent keyboard navigation across the POS system.                     │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useEffect, useCallback } from 'react';
import { Modal, Typography, Row, Col, Tag, Divider } from 'antd';
import { KeyOutlined } from '@ant-design/icons';
import { useTranslation } from '@/hooks/useTranslation';
import LocalizedText from '@/components/LocalizedText';
import { KEYBOARD_SHORTCUTS } from '@/theme/designSystem';

const { Title, Text } = Typography;

interface KeyboardShortcutsProps {
  visible: boolean;
  onClose: () => void;
}

interface ShortcutAction {
  key: string;
  action: () => void;
  description: string;
  category: 'global' | 'sale' | 'navigation' | 'system';
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsProps> = ({
  visible,
  onClose,
}) => {
  const { t } = useTranslation();

  const shortcutCategories = [
    {
      title: t('shortcuts.global', 'Global Shortcuts'),
      category: 'global' as const,
      shortcuts: [
        {
          key: KEYBOARD_SHORTCUTS.quickSale,
          description: t('shortcuts.quickSaleDesc', 'Quick Cash Sale'),
        },
        {
          key: KEYBOARD_SHORTCUTS.customerMode,
          description: t('shortcuts.customerModeDesc', 'Customer Mode'),
        },
        {
          key: KEYBOARD_SHORTCUTS.productSearch,
          description: t('shortcuts.productSearchDesc', 'Product Search'),
        },
        {
          key: KEYBOARD_SHORTCUTS.settings,
          description: t('shortcuts.settingsDesc', 'Settings'),
        },
        {
          key: KEYBOARD_SHORTCUTS.help,
          description: t('shortcuts.helpDesc', 'Help'),
        },
      ],
    },
    {
      title: t('shortcuts.sale', 'Sale Operations'),
      category: 'sale' as const,
      shortcuts: [
        {
          key: KEYBOARD_SHORTCUTS.holdSale,
          description: t('shortcuts.holdSaleDesc', 'Hold Current Sale'),
        },
        {
          key: KEYBOARD_SHORTCUTS.retrieveSale,
          description: t('shortcuts.retrieveSaleDesc', 'Retrieve Held Sale'),
        },
        {
          key: KEYBOARD_SHORTCUTS.completeSale,
          description: t('shortcuts.completeSaleDesc', 'Complete Sale'),
        },
        {
          key: KEYBOARD_SHORTCUTS.cancelSale,
          description: t('shortcuts.cancelSaleDesc', 'Cancel Sale'),
        },
      ],
    },
    {
      title: t('shortcuts.navigation', 'Navigation'),
      category: 'navigation' as const,
      shortcuts: [
        {
          key: KEYBOARD_SHORTCUTS.dashboard,
          description: t('shortcuts.dashboardDesc', 'Dashboard'),
        },
        {
          key: KEYBOARD_SHORTCUTS.products,
          description: t('shortcuts.productsDesc', 'Products'),
        },
        {
          key: KEYBOARD_SHORTCUTS.customers,
          description: t('shortcuts.customersDesc', 'Customers'),
        },
        {
          key: KEYBOARD_SHORTCUTS.reports,
          description: t('shortcuts.reportsDesc', 'Reports'),
        },
      ],
    },
    {
      title: t('shortcuts.system', 'System'),
      category: 'system' as const,
      shortcuts: [
        {
          key: KEYBOARD_SHORTCUTS.logout,
          description: t('shortcuts.logoutDesc', 'Logout'),
        },
        {
          key: KEYBOARD_SHORTCUTS.switchUser,
          description: t('shortcuts.switchUserDesc', 'Switch User'),
        },
        {
          key: KEYBOARD_SHORTCUTS.offlineMode,
          description: t('shortcuts.offlineModeDesc', 'Toggle Offline Mode'),
        },
      ],
    },
  ];

  return (
    <Modal
      title={
        <div>
          <KeyOutlined className='mr-2' />
          <LocalizedText>
            {t('shortcuts.title', 'Keyboard Shortcuts')}
          </LocalizedText>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      centered
    >
      <div className='space-y-6'>
        {shortcutCategories.map((category, index) => (
          <div key={category.category}>
            <Title level={4} className='mb-3'>
              {category.title}
            </Title>
            <Row gutter={[16, 8]}>
              {category.shortcuts.map(shortcut => (
                <Col xs={24} sm={12} key={shortcut.key}>
                  <div className='flex justify-between items-center p-2 hover:bg-gray-50 rounded'>
                    <Text>{shortcut.description}</Text>
                    <Tag className='font-mono text-xs'>{shortcut.key}</Tag>
                  </div>
                </Col>
              ))}
            </Row>
            {index < shortcutCategories.length - 1 && <Divider />}
          </div>
        ))}
      </div>
    </Modal>
  );
};

// Hook for global keyboard shortcuts
export const useKeyboardShortcuts = (shortcuts: ShortcutAction[]) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const { key, ctrlKey, altKey, shiftKey } = event;

      // Build the key combination string
      let combination = '';
      if (ctrlKey) combination += 'Ctrl+';
      if (altKey) combination += 'Alt+';
      if (shiftKey) combination += 'Shift+';
      combination += key;

      // Find matching shortcut
      const shortcut = shortcuts.find(
        s => s.key === combination || s.key === key
      );
      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

// Component for displaying keyboard shortcut hints
export const ShortcutHint: React.FC<{
  shortcut: string;
  description: string;
}> = ({ shortcut, description }) => (
  <div className='flex items-center space-x-2 text-xs text-gray-500'>
    <Tag className='font-mono text-xs'>
      {shortcut}
    </Tag>
    <span>{description}</span>
  </div>
);

export default KeyboardShortcutsModal;
