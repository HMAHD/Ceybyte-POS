/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                   Dashboard Interface                                            │
 * │                                                                                                  │
 * │  Description: Main dashboard interface for owner and cashier users.                              │
 * │               Provides access to all POS features based on user permissions.                     │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React from 'react';
import AppRouter from '@/router/AppRouter';

export const DashboardInterface: React.FC = () => {
  return <AppRouter />;
};

export default DashboardInterface;
