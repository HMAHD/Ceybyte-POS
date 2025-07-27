/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                      Test App Component                                          │
 * │                                                                                                  │
 * │  Description: Simple test app to verify basic functionality without authentication              │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                  │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SimpleLayout from './SimpleLayout';
import TestDashboard from './TestDashboard';

const TestApp: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <SimpleLayout>
              <TestDashboard />
            </SimpleLayout>
          }
        />
        <Route
          path="*"
          element={
            <SimpleLayout>
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h2>
                <p className="text-gray-600">The requested page could not be found.</p>
              </div>
            </SimpleLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default TestApp;