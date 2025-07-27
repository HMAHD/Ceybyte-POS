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
import { useAuth } from '@/contexts/AuthContext';
import { useNetwork } from '@/contexts/NetworkContext';
import LoginScreen from '@/components/LoginScreen';
import HelperModeInterface from '@/components/HelperModeInterface';
import { DashboardInterface } from '@/components/DashboardInterface';
import NetworkSelectionDialog from '@/components/NetworkSelectionDialog';
import { PageLoading } from '@/components/LoadingStates';
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
    return <PageLoading message="Initializing CeybytePOS..." />;
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Show helper mode interface for helper users
  if (user?.role === 'helper') {
    return <HelperModeInterface />;
  }

  // Show main dashboard for owner and cashier users
  return <DashboardInterface />;
};

export default MainApplication;
