/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                     Settings Page                                               │
 * │                                                                                                  │
 * │  Description: System settings and configuration page (placeholder for future implementation).    │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React from 'react';
import { Card, Typography } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import LocalizedText from '@/components/LocalizedText';
import { useTranslation } from '@/hooks/useTranslation';

const { Title, Text } = Typography;

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center min-h-96">
      <Card className="text-center max-w-md">
        <SettingOutlined style={{ fontSize: 48, color: '#f5222d', marginBottom: 16 }} />
        <Title level={3}>
          <LocalizedText>{t('settings.title', 'System Settings')}</LocalizedText>
        </Title>
        <Text type="secondary">
          <LocalizedText>{t('settings.comingSoon', 'System settings interface will be implemented in upcoming tasks.')}</LocalizedText>
        </Text>
      </Card>
    </div>
  );
};

export default SettingsPage;