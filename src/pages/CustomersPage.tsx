/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                    Customers Page                                               │
 * │                                                                                                  │
 * │  Description: Customer management page (placeholder for future implementation).                  │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React from 'react';
import { Card, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import LocalizedText from '@/components/LocalizedText';
import { useTranslation } from '@/hooks/useTranslation';

const { Title, Text } = Typography;

const CustomersPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center min-h-96">
      <Card className="text-center max-w-md">
        <UserOutlined style={{ fontSize: 48, color: '#722ed1', marginBottom: 16 }} />
        <Title level={3}>
          <LocalizedText>{t('customers.title', 'Customer Management')}</LocalizedText>
        </Title>
        <Text type="secondary">
          <LocalizedText>{t('customers.comingSoon', 'Customer management interface will be implemented in upcoming tasks.')}</LocalizedText>
        </Text>
      </Card>
    </div>
  );
};

export default CustomersPage;