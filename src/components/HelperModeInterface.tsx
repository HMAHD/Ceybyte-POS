/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                  Helper Mode Interface                                           │
 * │                                                                                                  │
 * │  Description: Simplified interface for helper users with restricted access.                      │
 * │               Only allows basic sales operations with minimal UI complexity.                     │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React from 'react';
import {
  Layout,
  Card,
  Button,
  Input,
  Space,
  Typography,
  Tag,
  Alert,
  Row,
  Col,
} from 'antd';
import {
  ShoppingCartOutlined,
  ScanOutlined,
  CreditCardOutlined,
  DollarOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { usePinAuth } from '@/contexts/PinAuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import LocalizedText from '@/components/LocalizedText';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

export const HelperModeInterface: React.FC = () => {
  const { user, logout } = usePinAuth();
  const { t, formatCurrency } = useTranslation();

  return (
    <Layout className='min-h-screen'>
      {/* Header */}
      <Header className='bg-white shadow-sm border-b px-6'>
        <div className='flex justify-between items-center h-full'>
          <div className='flex items-center'>
            <Title level={3} className='mb-0 mr-3'>
              <ScanOutlined className='mr-2' />
              <LocalizedText>
                {t('pos.pointOfSale', 'Point of Sale')}
              </LocalizedText>
            </Title>
            <Tag color='blue'>
              <LocalizedText>
                {t('auth.helperMode', 'Helper Mode')}
              </LocalizedText>
            </Tag>
          </div>

          <Space size='middle'>
            <LanguageSwitcher variant='compact' />
            <Text type='secondary'>
              <LocalizedText>{user?.name}</LocalizedText>
            </Text>
            <Button icon={<LogoutOutlined />} onClick={logout} type='text'>
              <LocalizedText>{t('auth.logout')}</LocalizedText>
            </Button>
          </Space>
        </div>
      </Header>

      {/* Main Content */}
      <Content className='p-6'>
        <div className='max-w-7xl mx-auto'>
          <Row gutter={[24, 24]}>
            {/* Product Search */}
            <Col xs={24} lg={8}>
              <Card
                title={
                  <Space>
                    <ScanOutlined />
                    <LocalizedText>
                      {t('pos.productSearch', 'Product Search')}
                    </LocalizedText>
                  </Space>
                }
                className='h-full'
              >
                <Space direction='vertical' className='w-full' size='large'>
                  <Input
                    size='large'
                    placeholder={t('pos.scanBarcode', 'Scan barcode')}
                    prefix={<ScanOutlined />}
                  />

                  <div className='text-center'>
                    <Text type='secondary'>
                      <LocalizedText>
                        {t(
                          'pos.scanBarcodeHint',
                          'Scan barcode or search product'
                        )}
                      </LocalizedText>
                    </Text>
                  </div>
                </Space>
              </Card>
            </Col>

            {/* Shopping Cart */}
            <Col xs={24} lg={8}>
              <Card
                title={
                  <Space>
                    <ShoppingCartOutlined />
                    <LocalizedText>
                      {t('pos.cart', 'Shopping Cart')}
                    </LocalizedText>
                  </Space>
                }
                className='h-full'
              >
                <div className='text-center py-12'>
                  <ShoppingCartOutlined
                    style={{ fontSize: 48, color: '#d9d9d9' }}
                  />
                  <div className='mt-4'>
                    <Text type='secondary'>
                      <LocalizedText>
                        {t('pos.emptyCart', 'Cart is empty')}
                      </LocalizedText>
                    </Text>
                  </div>
                </div>

                <div className='border-t pt-4 mt-4'>
                  <div className='flex justify-between items-center'>
                    <Title level={4} className='mb-0'>
                      <LocalizedText>
                        {t('common.total', 'Total')}
                      </LocalizedText>
                    </Title>
                    <Title level={4} className='mb-0'>
                      {formatCurrency(0)}
                    </Title>
                  </div>
                </div>
              </Card>
            </Col>

            {/* Payment */}
            <Col xs={24} lg={8}>
              <Card
                title={
                  <Space>
                    <CreditCardOutlined />
                    <LocalizedText>{t('pos.payment', 'Payment')}</LocalizedText>
                  </Space>
                }
                className='h-full'
              >
                <Space direction='vertical' className='w-full' size='middle'>
                  <Button disabled size='large' block icon={<DollarOutlined />}>
                    <LocalizedText>{t('pos.cash', 'Cash')}</LocalizedText>
                  </Button>

                  <Button
                    disabled
                    size='large'
                    block
                    icon={<CreditCardOutlined />}
                  >
                    <LocalizedText>{t('pos.card', 'Card')}</LocalizedText>
                  </Button>

                  <div className='text-center mt-4'>
                    <Text type='secondary' className='text-xs'>
                      <LocalizedText>
                        {t('pos.addItemsFirst', 'Add items to cart first')}
                      </LocalizedText>
                    </Text>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>

          {/* Helper Instructions */}
          <Alert
            className='mt-8'
            message={
              <Title level={4} className='mb-2'>
                <LocalizedText>
                  {t('auth.helperInstructions', 'Helper Mode Instructions')}
                </LocalizedText>
              </Title>
            }
            description={
              <ul className='space-y-2'>
                <li>
                  •{' '}
                  <LocalizedText>
                    {t(
                      'auth.helperInstruction1',
                      'Scan product barcodes to add items'
                    )}
                  </LocalizedText>
                </li>
                <li>
                  •{' '}
                  <LocalizedText>
                    {t('auth.helperInstruction2', 'Process cash payments only')}
                  </LocalizedText>
                </li>
                <li>
                  •{' '}
                  <LocalizedText>
                    {t(
                      'auth.helperInstruction3',
                      'Call supervisor for discounts or returns'
                    )}
                  </LocalizedText>
                </li>
                <li>
                  •{' '}
                  <LocalizedText>
                    {t(
                      'auth.helperInstruction4',
                      'Use F12 for quick cash sale'
                    )}
                  </LocalizedText>
                </li>
              </ul>
            }
            type='info'
            showIcon
          />
        </div>
      </Content>
    </Layout>
  );
};

export default HelperModeInterface;
