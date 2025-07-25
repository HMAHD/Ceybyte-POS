/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                Keyboard Shortcut System                                         │
 * │                                                                                                  │
 * │  Description: Enhanced keyboard shortcut system with visual indicators and global management.    │
 * │               Provides consistent keyboard navigation across the entire POS system.             │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Modal, Typography, Row, Col, Tag, Divider, Space, Tooltip } from 'antd';
import { KeyOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useTranslation } from '@/hooks/useTranslation';
import LocalizedText from '@/components/LocalizedText';


const { Title, Text } = Typography;

interface ShortcutAction {
  key: string;
  action: () => void;
  description: string;
  category: 'global' | 'sale' | 'navigation' | 'system';
  enabled?: boolean;
}

interface KeyboardShortcutContextType {
  shortcuts: ShortcutAction[];
  registerShortcut: (shortcut: ShortcutAction) => void;
  unregisterShortcut: (key: string) => void;
  showHelp: () => void;
  isHelpVisible: boolean;
}

const KeyboardShortcutContext = createContext<KeyboardShortcutContextType | null>(null);

export const useKeyboardShortcuts = () => {
  const context = useContext(KeyboardShortcutContext);
  if (!context) {
    throw new Error('useKeyboardShortcuts must be used within KeyboardShortcutProvider');
  }
  return context;
};

interface KeyboardShortcutProviderProps {
  children: ReactNode;
}

export const KeyboardShortcutProvider: React.FC<KeyboardShortcutProviderProps> = ({ children }) => {
  const [shortcuts, setShortcuts] = useState<ShortcutAction[]>([]);
  const [isHelpVisible, setIsHelpVisible] = useState(false);

  const registerShortcut = (shortcut: ShortcutAction) => {
    setShortcuts(prev => {
      const existing = prev.find(s => s.key === shortcut.key);
      if (existing) {
        return prev.map(s => s.key === shortcut.key ? shortcut : s);
      }
      return [...prev, shortcut];
    });
  };

  const unregisterShortcut = (key: string) => {
    setShortcuts(prev => prev.filter(s => s.key !== key));
  };

  const showHelp = () => setIsHelpVisible(true);

  const handleKeyDown = (event: KeyboardEvent) => {
    const { key, ctrlKey, altKey, shiftKey, metaKey } = event;

    // Build the key combination string
    let combination = '';
    if (ctrlKey) combination += 'Ctrl+';
    if (altKey) combination += 'Alt+';
    if (shiftKey) combination += 'Shift+';
    if (metaKey) combination += 'Meta+';
    combination += key;

    // Find matching shortcut
    const shortcut = shortcuts.find(s => 
      (s.key === combination || s.key === key) && 
      (s.enabled !== false)
    );

    if (shortcut) {
      event.preventDefault();
      event.stopPropagation();
      shortcut.action();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  return (
    <KeyboardShortcutContext.Provider value={{
      shortcuts,
      registerShortcut,
      unregisterShortcut,
      showHelp,
      isHelpVisible,
    }}>
      {children}
      <KeyboardShortcutHelpModal 
        visible={isHelpVisible}
        onClose={() => setIsHelpVisible(false)}
        shortcuts={shortcuts}
      />
    </KeyboardShortcutContext.Provider>
  );
};

interface KeyboardShortcutHelpModalProps {
  visible: boolean;
  onClose: () => void;
  shortcuts: ShortcutAction[];
}

const KeyboardShortcutHelpModal: React.FC<KeyboardShortcutHelpModalProps> = ({
  visible,
  onClose,
  shortcuts,
}) => {
  const { t } = useTranslation();

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, ShortcutAction[]>);

  const categoryTitles = {
    global: t('shortcuts.global', 'Global Shortcuts'),
    sale: t('shortcuts.sale', 'Sale Operations'),
    navigation: t('shortcuts.navigation', 'Navigation'),
    system: t('shortcuts.system', 'System'),
  };

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
      width={900}
      centered
    >
      <div className='space-y-6'>
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <InfoCircleOutlined className="text-blue-600" />
            <Text strong className="text-blue-800">
              <LocalizedText>{t('shortcuts.tip', 'Pro Tip')}</LocalizedText>
            </Text>
          </div>
          <Text className="text-blue-700">
            <LocalizedText>
              {t('shortcuts.tipText', 'Use keyboard shortcuts to navigate faster and increase productivity.')}
            </LocalizedText>
          </Text>
        </div>

        {Object.entries(groupedShortcuts).map(([category, categoryShortcuts], index) => (
          <div key={category}>
            <Title level={4} className='mb-3'>
              {categoryTitles[category as keyof typeof categoryTitles] || category}
            </Title>
            <Row gutter={[16, 8]}>
              {categoryShortcuts.map(shortcut => (
                <Col xs={24} sm={12} lg={8} key={shortcut.key}>
                  <div className='flex justify-between items-center p-3 hover:bg-gray-50 rounded border'>
                    <Text className="flex-1">{shortcut.description}</Text>
                    <KeyboardShortcutBadge shortcut={shortcut.key} />
                  </div>
                </Col>
              ))}
            </Row>
            {index < Object.keys(groupedShortcuts).length - 1 && <Divider />}
          </div>
        ))}

        {shortcuts.length === 0 && (
          <div className="text-center py-8">
            <Text type="secondary">
              <LocalizedText>
                {t('shortcuts.noShortcuts', 'No keyboard shortcuts are currently registered.')}
              </LocalizedText>
            </Text>
          </div>
        )}
      </div>
    </Modal>
  );
};

// Component for displaying keyboard shortcut badges
export const KeyboardShortcutBadge: React.FC<{
  shortcut: string;
  size?: 'small' | 'default';
}> = ({ shortcut, size = 'default' }) => {
  const keys = shortcut.split('+');
  
  return (
    <Space size={2}>
      {keys.map((key, index) => (
        <React.Fragment key={key}>
          <Tag 
            className={`font-mono ${size === 'small' ? 'text-xs' : 'text-sm'}`}
            style={{ 
              margin: 0,
              padding: size === 'small' ? '1px 4px' : '2px 6px',
              fontSize: size === 'small' ? '10px' : '12px',
              lineHeight: 1.2,
            }}
          >
            {key}
          </Tag>
          {index < keys.length - 1 && <span className="text-gray-400">+</span>}
        </React.Fragment>
      ))}
    </Space>
  );
};

// Component for displaying keyboard shortcut hints in footer
export const KeyboardShortcutHint: React.FC<{
  shortcut: string;
  description: string;
  size?: 'small' | 'default';
}> = ({ shortcut, description, size = 'small' }) => (
  <Tooltip title={description}>
    <div className='flex items-center space-x-2 text-xs text-gray-500 cursor-help'>
      <KeyboardShortcutBadge shortcut={shortcut} size={size} />
      <span className="hidden sm:inline">{description}</span>
    </div>
  </Tooltip>
);

// Hook for registering shortcuts in components
export const useRegisterShortcuts = (shortcuts: ShortcutAction[]) => {
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts();

  useEffect(() => {
    shortcuts.forEach(registerShortcut);
    
    return () => {
      shortcuts.forEach(shortcut => unregisterShortcut(shortcut.key));
    };
  }, [shortcuts, registerShortcut, unregisterShortcut]);
};

export default KeyboardShortcutProvider;