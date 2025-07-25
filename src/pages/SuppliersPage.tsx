/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                    Suppliers Page                                               │
 * │                                                                                                  │
 * │  Description: Supplier management page (placeholder for future implementation).                  │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React from 'react';
import { Card, Typography } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import LocalizedText from '@/components/LocalizedText';
import { useTranslation } from '@/hooks/useTranslation';

const { Title, Text } = Typography;

const SuppliersPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center min-h-96">
      <Card className="text-center max-w-md">
        <TeamOutlined style={{ fontSize: 48, color: '#fa8c16', marginBottom: 16 }} />
        <Title level={3}>
          <LocalizedText>{t('suppliers.title', 'Supplier Management')}</LocalizedText>
        </Title>
        <Text type="secondary">
          <LocalizedText>{t('suppliers.comingSoon', 'Supplier management interface will be implemented in upcoming tasks.')}</LocalizedText>
        </Text>
      </Card>
    </div>
  );
};

export default SuppliersPage;