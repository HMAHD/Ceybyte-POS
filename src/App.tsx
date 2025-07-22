/*
 * ╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                        CEYBYTE POS                                               ║
 * ║                                                                                                  ║
 * ║                                    Main Application Component                                    ║
 * ║                                                                                                  ║
 * ║  Description: Main React component that serves as the entry point for CeybytePOS application.    ║
 * ║               Handles API health checks and displays system status.                              ║
 * ║                                                                                                  ║
 * ║  Author: Akash Hasendra                                                                          ║
 * ║  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   ║
 * ║  License: MIT License with Sri Lankan Business Terms                                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import React from 'react';
import './App.css';
import './assets/fonts/fonts.css';
import './i18n';
import { AuthProvider } from '@/contexts/AuthContext';
import { MainApplication } from '@/components/MainApplication';

function App() {
  return (
    <AuthProvider>
      <MainApplication />
    </AuthProvider>
  );
}

export default App;
