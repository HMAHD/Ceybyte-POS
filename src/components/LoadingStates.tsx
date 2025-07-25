/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                    Loading States Components                                     │
 * │                                                                                                  │
 * │  Description: Reusable loading state components including skeletons, spinners, and              │
 * │               loading overlays for consistent loading experience across the application.         │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React from 'react';
import { Spin, Skeleton, Card, Space } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { CEYBYTE_COLORS } from '@/theme/designSystem';

interface LoadingSpinnerProps {
  size?: 'small' | 'default' | 'large';
  tip?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'default',
  tip,
  className = '',
}) => {
  const antIcon = (
    <LoadingOutlined 
      style={{ 
        fontSize: size === 'small' ? 16 : size === 'large' ? 32 : 24,
        color: CEYBYTE_COLORS.primary[500]
      }} 
      spin 
    />
  );

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Spin indicator={antIcon} tip={tip} size={size} />
    </div>
  );
};

interface PageLoadingProps {
  message?: string;
}

export const PageLoading: React.FC<PageLoadingProps> = ({
  message = 'Loading...'
}) => {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100'>
      <div className='text-center space-y-4'>
        <div className='animate-bounce'>
          <div 
            className='w-16 h-16 rounded-full mx-auto flex items-center justify-center'
            style={{ 
              background: `linear-gradient(135deg, ${CEYBYTE_COLORS.primary[500]}, ${CEYBYTE_COLORS.primary[600]})`,
              boxShadow: '0 8px 32px rgba(0, 102, 204, 0.3)'
            }}
          >
            <LoadingOutlined 
              style={{ 
                fontSize: 24, 
                color: 'white' 
              }} 
              spin 
            />
          </div>
        </div>
        <div>
          <h3 className='text-lg font-semibold text-gray-700 mb-2'>
            CeybytePOS
          </h3>
          <p className='text-sm text-gray-500'>{message}</p>
        </div>
      </div>
    </div>
  );
};

interface SkeletonCardProps {
  rows?: number;
  avatar?: boolean;
  title?: boolean;
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  rows = 3,
  avatar = false,
  title = true,
  className = '',
}) => {
  return (
    <Card className={`skeleton-card ${className}`}>
      <Skeleton
        avatar={avatar}
        title={title}
        paragraph={{ rows }}
        active
      />
    </Card>
  );
};

interface SkeletonListProps {
  count?: number;
  className?: string;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  count = 5,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} avatar rows={2} />
      ))}
    </div>
  );
};

interface SkeletonTableProps {
  columns?: number;
  rows?: number;
  className?: string;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  columns = 4,
  rows = 5,
  className = '',
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Table Header */}
      <div className='grid gap-4' style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <div key={`header-${index}`} className='skeleton skeleton-title h-4'></div>
        ))}
      </div>
      
      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={`row-${rowIndex}`} 
          className='grid gap-4' 
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={`cell-${rowIndex}-${colIndex}`} className='skeleton skeleton-text'></div>
          ))}
        </div>
      ))}
    </div>
  );
};

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  children: React.ReactNode;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Loading...',
  children,
}) => {
  return (
    <div className='relative'>
      {children}
      {visible && (
        <div className='absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50 animate-fade-in'>
          <div className='text-center space-y-3'>
            <LoadingSpinner size='large' />
            <p className='text-sm text-gray-600 font-medium'>{message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

interface InlineLoadingProps {
  size?: 'small' | 'default';
  text?: string;
  className?: string;
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({
  size = 'small',
  text = 'Loading...',
  className = '',
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <LoadingSpinner size={size} />
      <span className='text-sm text-gray-600'>{text}</span>
    </div>
  );
};

// Button loading state
interface LoadingButtonProps {
  loading: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading,
  children,
  className = '',
  onClick,
  disabled = false,
}) => {
  return (
    <button
      className={`ceybyte-btn ceybyte-btn-primary ${className} ${loading || disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={loading || disabled}
    >
      {loading && (
        <LoadingOutlined 
          style={{ 
            fontSize: 14, 
            marginRight: 8,
            color: 'currentColor'
          }} 
          spin 
        />
      )}
      {children}
    </button>
  );
};

export default {
  LoadingSpinner,
  PageLoading,
  SkeletonCard,
  SkeletonList,
  SkeletonTable,
  LoadingOverlay,
  InlineLoading,
  LoadingButton,
};