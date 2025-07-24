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
import { Navigate, useLocation } from 'react-router-dom';
import { Result, Button } from 'antd';
import { LockOutlined, HomeOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { PermissionService, UserRole } from '@/utils/permissions';
import LocalizedText from '@/components/LocalizedText';
import LoginScreen from '@/components/LoginScreen';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermissions?: string[];
  requiredRole?: UserRole;
  fallbackPath?: string;
  showAccessDenied?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  requiredRole,
  fallbackPath = '/dashboard',
  showAccessDenied = true,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

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

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole && user.role !== requiredRole) {
    if (showAccessDenied) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Result
            status="403"
            title="403"
            subTitle={
              <LocalizedText>
                {t('errors.accessDenied', 'Sorry, you are not authorized to access this page.')}
              </LocalizedText>
            }
            icon={<LockOutlined className="text-red-500" />}
            extra={
              <Button type="primary" onClick={() => window.history.back()}>
                <HomeOutlined />
                <LocalizedText>{t('common.goBack', 'Go Back')}</LocalizedText>
              </Button>
            }
          />
        </div>
      );
    }
    return <Navigate to={fallbackPath} replace />;
  }

  // Check permission-based access
  if (requiredPermissions.length > 0) {
    const hasPermission = PermissionService.hasAnyPermission(user.role as UserRole, requiredPermissions);
    
    if (!hasPermission) {
      if (showAccessDenied) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Result
              status="403"
              title={
                <LocalizedText>
                  {t('errors.accessDeniedTitle', 'Access Denied')}
                </LocalizedText>
              }
              subTitle={
                <div className="space-y-2">
                  <div>
                    <LocalizedText>
                      {t('errors.insufficientPermissions', 'You do not have sufficient permissions to access this page.')}
                    </LocalizedText>
                  </div>
                  <div className="text-sm text-gray-500">
                    <LocalizedText>
                      {t('errors.contactAdmin', 'Please contact your administrator if you believe this is an error.')}
                    </LocalizedText>
                  </div>
                  <div className="text-xs text-gray-400">
                    <LocalizedText>
                      {t('errors.currentRole', 'Current role: {{role}}', { 
                        role: PermissionService.getRoleName(user.role as UserRole) 
                      })}
                    </LocalizedText>
                  </div>
                </div>
              }
              icon={<LockOutlined className="text-red-500" />}
              extra={
                <div className="space-x-2">
                  <Button onClick={() => window.history.back()}>
                    <LocalizedText>{t('common.goBack', 'Go Back')}</LocalizedText>
                  </Button>
                  <Button type="primary" onClick={() => window.location.href = '/dashboard'}>
                    <HomeOutlined />
                    <LocalizedText>{t('common.dashboard', 'Dashboard')}</LocalizedText>
                  </Button>
                </div>
              }
            />
          </div>
        );
      }
      return <Navigate to={fallbackPath} replace />;
    }
  }

  // Check route-based access
  const canAccessRoute = PermissionService.canAccessRoute(user.role as UserRole, location.pathname);
  if (!canAccessRoute) {
    if (showAccessDenied) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Result
            status="403"
            title={
              <LocalizedText>
                {t('errors.routeAccessDenied', 'Page Access Restricted')}
              </LocalizedText>
            }
            subTitle={
              <div className="space-y-2">
                <div>
                  <LocalizedText>
                    {t('errors.routeNotAllowed', 'Your current role does not allow access to this page.')}
                  </LocalizedText>
                </div>
                <div className="text-sm text-gray-500">
                  <LocalizedText>
                    {t('errors.availableFeatures', 'Please use the features available in your role or contact an administrator.')}
                  </LocalizedText>
                </div>
              </div>
            }
            icon={<LockOutlined className="text-orange-500" />}
            extra={
              <Button type="primary" onClick={() => window.location.href = '/dashboard'}>
                <HomeOutlined />
                <LocalizedText>{t('common.dashboard', 'Dashboard')}</LocalizedText>
              </Button>
            }
          />
        </div>
      );
    }
    return <Navigate to={fallbackPath} replace />;
  }

  // User has access, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
