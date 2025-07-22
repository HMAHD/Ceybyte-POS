/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                    Reports Page                                                  │
 * │                                                                                                  │
 * │  Description: Business reporting interface for sales reports, inventory reports,                 │
 * │               financial summaries, and analytics dashboards.                                     │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React from 'react';
import { Typography, Button, Result } from 'antd';
import { FileTextOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import LocalizedText from '@/components/LocalizedText';
import { useTranslation } from '@/hooks/useTranslation';

const { Title } = Typography;

const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className='p-6'>
      <div className='max-w-7xl mx-auto'>
        <div className='flex items-center mb-6'>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/dashboard')}
            className='mr-4'
          >
            <LocalizedText>Back</LocalizedText>
          </Button>
          <Title level={2} className='mb-0'>
            <FileTextOutlined className='mr-2' />
            <LocalizedText>{t('navigation.reports', 'Reports')}</LocalizedText>
          </Title>
        </div>

        <Result
          icon={<FileTextOutlined />}
          title={
            <LocalizedText>
              {t('reports.comingSoon', 'Reports Interface Coming Soon')}
            </LocalizedText>
          }
          subTitle={
            <LocalizedText>
              {t(
                'reports.description',
                'The reports interface will include sales reports, inventory summaries, financial statements, and business analytics.'
              )}
            </LocalizedText>
          }
          extra={
            <Button type='primary' onClick={() => navigate('/dashboard')}>
              <LocalizedText>
                {t('common.backToDashboard', 'Back to Dashboard')}
              </LocalizedText>
            </Button>
          }
        />
      </div>
    </div>
  );
};

export default ReportsPage;
