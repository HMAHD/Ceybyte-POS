/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                   Main Application Component                                     │
 * │                                                                                                  │
 * │  Description: Main application component that handles authentication routing and role-based      │
 * │               interface selection. Shows appropriate interface based on user role.               │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNetwork } from '@/contexts/NetworkContext';
import LoginScreen from '@/components/LoginScreen';
import HelperModeInterface from '@/components/HelperModeInterface';
import NetworkSelectionDialog from '@/components/NetworkSelectionDialog';
import router from '@/routes';
import type { NetworkConfiguration } from '@/types/network';

export const MainApplication: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const { isFirstRun, updateConfig } = useNetwork();
  const [showNetworkDialog, setShowNetworkDialog] = useState(isFirstRun);

  const handleNetworkSetupComplete = (config: NetworkConfiguration) => {
    updateConfig(config);
    setShowNetworkDialog(false);
  };

  // Show network setup dialog on first run
  if (showNetworkDialog) {
    return (
      <NetworkSelectionDialog
        visible={true}
        onComplete={handleNetworkSetupComplete}
      />
    );
  }

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-ceybyte-primary mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Show helper mode interface for helper users
  if (user?.role === 'helper') {
    return <HelperModeInterface />;
  }

  // Show main router-based application for owner and cashier users
  return <RouterProvider router={router} />;
};

export default MainApplication;
