/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                   Protected Route Component                                      │
 * │                                                                                                  │
 * │  Description: Route protection component with role-based access control.                         │
 * │               Handles authentication checks and permission validation.                           │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { ReactNode } from 'react';
import { usePinAuth } from '@/contexts/PinAuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import LocalizedText from '@/components/LocalizedText';
import LoginScreen from '@/components/LoginScreen';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
  fallback?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredRole,
  fallback,
}) => {
  const { isAuthenticated, isLoading, user, hasPermission } = usePinAuth();
  const { t } = useTranslation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-ceybyte-primary mx-auto mb-4'></div>
          <LocalizedText className='text-gray-600'>
            {t('common.loading')}
          </LocalizedText>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Check role requirement
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center'>
          <div className='mb-4'>
            <svg
              className='w-16 h-16 text-red-500 mx-auto'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19c-.77.833.192 2.5 1.732 2.5z'
              />
            </svg>
          </div>
          <LocalizedText
            as='h2'
            className='text-xl font-semibold text-gray-900 mb-2'
          >
            {t('auth.accessDenied')}
          </LocalizedText>
          <LocalizedText className='text-gray-600 mb-4'>
            {t(
              'auth.roleRequired',
              `This feature requires ${requiredRole} role.`
            )}
          </LocalizedText>
          <LocalizedText className='text-sm text-gray-500'>
            {t('auth.currentRole', `Your current role: ${user?.role}`)}
          </LocalizedText>
        </div>
      </div>
    );
  }

  // Check permission requirement
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      fallback || (
        <div className='min-h-screen flex items-center justify-center'>
          <div className='max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center'>
            <div className='mb-4'>
              <svg
                className='w-16 h-16 text-orange-500 mx-auto'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                />
              </svg>
            </div>
            <LocalizedText
              as='h2'
              className='text-xl font-semibold text-gray-900 mb-2'
            >
              {t('auth.accessDenied')}
            </LocalizedText>
            <LocalizedText className='text-gray-600 mb-4'>
              {t(
                'auth.permissionRequired',
                `This feature requires '${requiredPermission}' permission.`
              )}
            </LocalizedText>
            <LocalizedText className='text-sm text-gray-500'>
              {t('auth.currentRole', `Your current role: ${user?.role}`)}
            </LocalizedText>
          </div>
        </div>
      )
    );
  }

  // User is authenticated and has required permissions
  return <>{children}</>;
};

export default ProtectedRoute;
