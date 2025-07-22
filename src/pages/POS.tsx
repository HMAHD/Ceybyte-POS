/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                      POS Page                                                    │
 * │                                                                                                  │
 * │  Description: Point of Sale transaction interface for processing sales,                          │
 * │               managing cart items, and handling payments.                                        │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React from 'react';
import { Typography, Button, Result } from 'antd';
import { ShoppingCartOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import LocalizedText from '@/components/LocalizedText';
import { useTranslation } from '@/hooks/useTranslation';

const { Title } = Typography;

const POSPage: React.FC = () => {
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
            <ShoppingCartOutlined className='mr-2' />
            <LocalizedText>{t('pos.title', 'Point of Sale')}</LocalizedText>
          </Title>
        </div>

        <Result
          icon={<ShoppingCartOutlined />}
          title={
            <LocalizedText>
              {t('pos.comingSoon', 'POS Interface Coming Soon')}
            </LocalizedText>
          }
          subTitle={
            <LocalizedText>
              {t(
                'pos.description',
                'The Point of Sale interface will include product catalog, shopping cart, payment processing, and receipt printing.'
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

export default POSPage;
