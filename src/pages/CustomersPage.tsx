/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                    Customers Page                                               │
 * │                                                                                                  │
 * │  Description: Main customers page with credit management functionality including customer        │
 * │               registration, credit book, and payment collection.                                 │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React from 'react';
import { CustomerCreditManagement } from '@/components/customers/CustomerCreditManagement';

const CustomersPage: React.FC = () => {
  return (
    <div className="p-6">
      <CustomerCreditManagement />
    </div>
  );
};

export default CustomersPage;