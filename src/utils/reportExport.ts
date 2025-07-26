/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                   Report Export Utilities                                       │
 * │                                                                                                  │
 * │  Description: Utilities for exporting reports to CSV, Excel, and PDF formats.                   │
 * │               Handles data formatting and file generation for supplier reports.                  │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import type { 
  SupplierAnalytics, 
  SupplierAgingReport, 
  SupplierPerformanceReport 
} from '@/api/suppliers.api';

export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle nested objects and arrays
        if (typeof value === 'object' && value !== null) {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        // Escape commas and quotes in strings
        if (typeof value === 'string') {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportSupplierAnalytics = (analytics: SupplierAnalytics) => {
  // Export top suppliers
  const topSuppliersData = analytics.top_suppliers.map(supplier => ({
    'Supplier Name': supplier.supplier_name,
    'Total Amount': supplier.total_amount,
    'Invoice Count': supplier.invoice_count,
    'Average Invoice': (supplier.total_amount / supplier.invoice_count).toFixed(2)
  }));

  exportToCSV(topSuppliersData, `supplier-analytics-top-suppliers-${new Date().toISOString().split('T')[0]}`);

  // Export monthly trends
  const monthlyTrendsData = analytics.monthly_trends.map(trend => ({
    'Month': trend.month,
    'Invoice Count': trend.invoice_count,
    'Invoice Amount': trend.total_amount,
    'Payment Count': trend.payment_count,
    'Payment Amount': trend.payment_amount,
    'Net Amount': trend.total_amount - trend.payment_amount
  }));

  exportToCSV(monthlyTrendsData, `supplier-analytics-monthly-trends-${new Date().toISOString().split('T')[0]}`);
};

export const exportSupplierAging = (agingReport: SupplierAgingReport) => {
  const allInvoices: any[] = [];
  
  Object.entries(agingReport.aging_buckets).forEach(([bucket, data]) => {
    data.invoices.forEach(invoice => {
      allInvoices.push({
        'Aging Bucket': bucket.replace('_', ' ').toUpperCase(),
        'Invoice Number': invoice.invoice_number,
        'Supplier Name': invoice.supplier_name,
        'Due Date': invoice.due_date,
        'Days Overdue': invoice.days_overdue,
        'Balance Amount': invoice.balance_amount
      });
    });
  });

  exportToCSV(allInvoices, `supplier-aging-report-${new Date().toISOString().split('T')[0]}`);
};

export const exportSupplierPerformance = (performanceReport: SupplierPerformanceReport) => {
  const performanceData = performanceReport.suppliers.map(supplier => ({
    'Supplier Name': supplier.supplier_name,
    'Contact Person': supplier.contact_person || '',
    'City': supplier.city || '',
    'Total Invoices': supplier.metrics.total_invoices,
    'Total Invoice Amount': supplier.metrics.total_invoice_amount,
    'Total Payments': supplier.metrics.total_payments,
    'Average Invoice Amount': supplier.metrics.average_invoice_amount.toFixed(2),
    'Payment Timeliness %': supplier.metrics.payment_timeliness_percent.toFixed(1),
    'Average Delay Days': supplier.metrics.average_delay_days.toFixed(1),
    'On Time Payments': supplier.metrics.on_time_payments,
    'Late Payments': supplier.metrics.late_payments,
    'Current Balance': supplier.metrics.current_balance,
    'Overdue Invoices': supplier.metrics.overdue_invoices,
    'Credit Utilization %': supplier.metrics.credit_utilization_percent.toFixed(1)
  }));

  exportToCSV(performanceData, `supplier-performance-report-${new Date().toISOString().split('T')[0]}`);
};

export const exportSupplierSummary = (summary: any) => {
  const summaryData = [{
    'Report Date': new Date().toISOString().split('T')[0],
    'Total Suppliers': summary.total_suppliers,
    'Total Outstanding': summary.total_outstanding,
    'Overdue Invoices': summary.overdue_invoices,
    'Overdue Amount': summary.overdue_amount,
    'Average Payment Terms': summary.average_payment_terms
  }];

  exportToCSV(summaryData, `supplier-summary-${new Date().toISOString().split('T')[0]}`);
};

// Print report function
export const printReport = (title: string, content: string) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px; 
          color: #333;
        }
        h1 { 
          color: #1890ff; 
          border-bottom: 2px solid #1890ff; 
          padding-bottom: 10px;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 20px 0;
        }
        th, td { 
          border: 1px solid #ddd; 
          padding: 8px; 
          text-align: left;
        }
        th { 
          background-color: #f5f5f5; 
          font-weight: bold;
        }
        .summary { 
          background-color: #f0f8ff; 
          padding: 15px; 
          border-radius: 5px; 
          margin: 20px 0;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <div class="summary">
        <strong>Generated on:</strong> ${new Date().toLocaleString()}<br>
        <strong>System:</strong> CeybytePOS - Sri Lankan Point of Sale System
      </div>
      ${content}
      <div class="footer">
        <p>© 2025 Ceybyte.com - Sri Lankan Point of Sale System</p>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
};