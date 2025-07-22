/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                    Loading States Components                                     │
 * │                                                                                                  │
 * │  Description: Reusable loading states, skeletons, and transition components                     │
 * │               for consistent loading experience across the POS system.                          │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React from 'react';
import { Skeleton, Card, Row, Col, Space, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useTranslation } from '@/hooks/useTranslation';
import LocalizedText from '@/components/LocalizedText';

// Custom loading icon
const LoadingIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

// Full page loading
export const PageLoading: React.FC<{ message?: string }> = ({ message }) => {
  const { t } = useTranslation();

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='text-center'>
        <Spin indicator={LoadingIcon} size='large' />
        <div className='mt-4'>
          <LocalizedText className='text-gray-600'>
            {message || t('common.loading', 'Loading...')}
          </LocalizedText>
        </div>
      </div>
    </div>
  );
};

// Dashboard skeleton
export const DashboardSkeleton: React.FC = () => (
  <div className='p-6'>
    {/* Header skeleton */}
    <div className='mb-8'>
      <Skeleton.Input style={{ width: 300, height: 32 }} active />
      <Skeleton.Input style={{ width: 200, height: 20, marginTop: 8 }} active />
    </div>

    {/* Stats cards skeleton */}
    <Row gutter={[24, 24]} className='mb-8'>
      {[1, 2, 3, 4].map(i => (
        <Col xs={24} sm={12} lg={6} key={i}>
          <Card>
            <Skeleton active paragraph={{ rows: 1 }} />
          </Card>
        </Col>
      ))}
    </Row>

    {/* Action cards skeleton */}
    <Row gutter={[24, 24]}>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <Col xs={24} md={12} lg={8} key={i}>
          <Card>
            <Skeleton active avatar paragraph={{ rows: 2 }} />
          </Card>
        </Col>
      ))}
    </Row>
  </div>
);

// Product list skeleton
export const ProductListSkeleton: React.FC = () => (
  <div className='p-6'>
    <div className='mb-6'>
      <Skeleton.Input style={{ width: 300, height: 40 }} active />
    </div>

    <Row gutter={[16, 16]}>
      {Array.from({ length: 12 }).map((_, i) => (
        <Col xs={24} sm={12} md={8} lg={6} key={i}>
          <Card>
            <Skeleton active avatar paragraph={{ rows: 3 }} />
          </Card>
        </Col>
      ))}
    </Row>
  </div>
);

// Table skeleton
export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div>
    {/* Table header */}
    <div className='mb-4'>
      <Row gutter={16}>
        {[1, 2, 3, 4].map(i => (
          <Col span={6} key={i}>
            <Skeleton.Input style={{ width: '100%', height: 32 }} active />
          </Col>
        ))}
      </Row>
    </div>

    {/* Table rows */}
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className='mb-3'>
        <Row gutter={16}>
          {[1, 2, 3, 4].map(j => (
            <Col span={6} key={j}>
              <Skeleton.Input style={{ width: '100%', height: 24 }} active />
            </Col>
          ))}
        </Row>
      </div>
    ))}
  </div>
);

// Form skeleton
export const FormSkeleton: React.FC<{ fields?: number }> = ({ fields = 6 }) => (
  <div className='space-y-6'>
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i}>
        <Skeleton.Input
          style={{ width: 120, height: 20, marginBottom: 8 }}
          active
        />
        <Skeleton.Input style={{ width: '100%', height: 40 }} active />
      </div>
    ))}

    <div className='pt-4'>
      <Space>
        <Skeleton.Button style={{ width: 100, height: 40 }} active />
        <Skeleton.Button style={{ width: 80, height: 40 }} active />
      </Space>
    </div>
  </div>
);

// Sales interface skeleton
export const SalesInterfaceSkeleton: React.FC = () => (
  <Row gutter={24} className='h-full'>
    {/* Product search column */}
    <Col span={8}>
      <Card
        title={<Skeleton.Input style={{ width: 150 }} active />}
        className='h-full'
      >
        <div className='space-y-4'>
          <Skeleton.Input style={{ width: '100%', height: 40 }} active />
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className='flex items-center space-x-3'>
              <Skeleton.Avatar size={40} active />
              <div className='flex-1'>
                <Skeleton.Input style={{ width: '100%', height: 20 }} active />
                <Skeleton.Input
                  style={{ width: '60%', height: 16, marginTop: 4 }}
                  active
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </Col>

    {/* Cart column */}
    <Col span={8}>
      <Card
        title={<Skeleton.Input style={{ width: 100 }} active />}
        className='h-full'
      >
        <div className='space-y-4'>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className='flex justify-between items-center'>
              <div className='flex-1'>
                <Skeleton.Input style={{ width: '80%', height: 20 }} active />
                <Skeleton.Input
                  style={{ width: '40%', height: 16, marginTop: 4 }}
                  active
                />
              </div>
              <Skeleton.Input style={{ width: 60, height: 20 }} active />
            </div>
          ))}
        </div>
      </Card>
    </Col>

    {/* Payment column */}
    <Col span={8}>
      <Card
        title={<Skeleton.Input style={{ width: 120 }} active />}
        className='h-full'
      >
        <div className='space-y-4'>
          <Skeleton.Input style={{ width: '100%', height: 60 }} active />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton.Button
              key={i}
              style={{ width: '100%', height: 48 }}
              active
            />
          ))}
        </div>
      </Card>
    </Col>
  </Row>
);

// Content loading wrapper
export const ContentLoading: React.FC<{
  loading: boolean;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
}> = ({ loading, children, skeleton }) => {
  if (loading) {
    return (
      <div className='relative'>
        {skeleton || <Skeleton active paragraph={{ rows: 4 }} />}
      </div>
    );
  }

  return <>{children}</>;
};

// Inline loading
export const InlineLoading: React.FC<{ message?: string }> = ({ message }) => {
  const { t } = useTranslation();

  return (
    <div className='flex items-center justify-center py-8'>
      <Space>
        <Spin size='small' />
        <span className='text-gray-600'>
          <LocalizedText>
            {message || t('common.loading', 'Loading...')}
          </LocalizedText>
        </span>
      </Space>
    </div>
  );
};

// Button loading state
export const ButtonLoading: React.FC<{
  loading: boolean;
  children: React.ReactNode;
  loadingText?: string;
}> = ({ loading, children, loadingText }) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <Space>
        <Spin size='small' />
        <LocalizedText>
          {loadingText || t('common.loading', 'Loading...')}
        </LocalizedText>
      </Space>
    );
  }

  return <>{children}</>;
};

export default {
  PageLoading,
  DashboardSkeleton,
  ProductListSkeleton,
  TableSkeleton,
  FormSkeleton,
  SalesInterfaceSkeleton,
  ContentLoading,
  InlineLoading,
  ButtonLoading,
};
