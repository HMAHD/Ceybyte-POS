/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                   Suppliers Page                                                 │
 * │                                                                                                  │
 * │  Description: Supplier management interface for maintaining supplier records,                    │
 * │               purchase orders, and supplier payment tracking.                                    │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React from 'react';
import { Typography, Button, Result } from 'antd';
import { TeamOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import LocalizedText from '@/components/LocalizedText';
import { useTranslation } from '@/hooks/useTranslation';

const { Title } = Typography;

const SuppliersPage: React.FC = () => {
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
            <TeamOutlined className='mr-2' />
            <LocalizedText>
              {t('navigation.suppliers', 'Suppliers')}
            </LocalizedText>
          </Title>
        </div>

        <Result
          icon={<TeamOutlined />}
          title={
            <LocalizedText>
              {t('suppliers.comingSoon', 'Supplier Management Coming Soon')}
            </LocalizedText>
          }
          subTitle={
            <LocalizedText>
              {t(
                'suppliers.description',
                'The supplier management interface will include supplier profiles, purchase orders, payment tracking, and inventory sourcing.'
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

export default SuppliersPage;
