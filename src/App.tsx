/*
 * ╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                        CEYBYTE POS                                               ║
 * ║                                                                                                  ║
 * ║                                    Main Application Component                                    ║
 * ║                                                                                                  ║
 * ║  Description: Main React component that serves as the entry point for CeybytePOS application.    ║
 * ║               Handles theme configuration and provides global context providers.                 ║
 * ║                                                                                                  ║
 * ║  Author: Akash Hasendra                                                                          ║
 * ║  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   ║
 * ║  License: MIT License with Sri Lankan Business Terms                                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import React from 'react';
import { ConfigProvider, App as AntdApp } from 'antd';
import './App.css';
import './assets/fonts/fonts.css';
import './i18n';
import { PinAuthProvider } from '@/contexts/PinAuthContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { NetworkProvider } from '@/contexts/NetworkContext';
import { PowerProvider } from '@/contexts/PowerContext';
import { KeyboardShortcutProvider } from '@/components/KeyboardShortcutSystem';
import { MainApplication } from '@/components/MainApplication';


const AppContent: React.FC = () => {
  const { currentTheme } = useTheme();

  return (
    <ConfigProvider theme={currentTheme} componentSize='middle'>
      <AntdApp>
        <KeyboardShortcutProvider>
          <NetworkProvider>
            <PowerProvider>
              <PinAuthProvider>
                <MainApplication />
              </PinAuthProvider>
            </PowerProvider>
          </NetworkProvider>
        </KeyboardShortcutProvider>
      </AntdApp>
    </ConfigProvider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
