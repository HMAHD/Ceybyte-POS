/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                 Supplier Components Index                                        │
 * │                                                                                                  │
 * │  Description: Central export file for all supplier management components.                        │
 * │               Provides easy imports for supplier-related functionality.                          │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

export { SupplierForm } from './SupplierForm';
export { default as SupplierList } from './SupplierList';
export { SupplierDashboard } from './SupplierDashboard';
export { SupplierReports } from './SupplierReports';

// Re-export types from API
export type {
  Supplier,
  SupplierCreate,
  SupplierUpdate,
  SupplierInvoice,
  SupplierInvoiceCreate,
  SupplierPayment,
  SupplierPaymentCreate,
  SupplierSummary,
  SupplierAnalytics,
  SupplierAgingReport,
  SupplierPerformanceReport,
  VisitAlert,
  PaymentReminder
} from '@/api/suppliers.api';