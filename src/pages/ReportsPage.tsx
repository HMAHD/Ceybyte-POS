/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                     Reports Page                                                │
 * │                                                                                                  │
 * │  Description: Reports and analytics page (placeholder for future implementation).                │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React from 'react';
import { Card, Typography } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import LocalizedText from '@/components/LocalizedText';
import { useTranslation } from '@/hooks/useTranslation';

const { Title, Text } = Typography;

const ReportsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center min-h-96">
      <Card className="text-center max-w-md">
        <FileTextOutlined style={{ fontSize: 48, color: '#13c2c2', marginBottom: 16 }} />
        <Title level={3}>
          <LocalizedText>{t('reports.title', 'Reports & Analytics')}</LocalizedText>
        </Title>
        <Text type="secondary">
          <LocalizedText>{t('reports.comingSoon', 'Reports and analytics interface will be implemented in upcoming tasks.')}</LocalizedText>
        </Text>
      </Card>
    </div>
  );
};

export default ReportsPage;