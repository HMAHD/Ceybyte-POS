/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                   Settings Page                                                  │
 * │                                                                                                  │
 * │  Description: System settings interface for configuring POS preferences,                        │
 * │               printer settings, user management, and system configuration.                       │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React from 'react';
import { Typography, Button, Result } from 'antd';
import { SettingOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import LocalizedText from '@/components/LocalizedText';
import { useTranslation } from '@/hooks/useTranslation';

const { Title } = Typography;

const SettingsPage: React.FC = () => {
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
            <SettingOutlined className='mr-2' />
            <LocalizedText>
              {t('navigation.settings', 'Settings')}
            </LocalizedText>
          </Title>
        </div>

        <Result
          icon={<SettingOutlined />}
          title={
            <LocalizedText>
              {t('settings.comingSoon', 'Settings Interface Coming Soon')}
            </LocalizedText>
          }
          subTitle={
            <LocalizedText>
              {t(
                'settings.description',
                'The settings interface will include system configuration, user management, printer setup, and application preferences.'
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

export default SettingsPage;
