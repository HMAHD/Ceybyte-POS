/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                   Supplier API Client                                            │
 * │                                                                                                  │
 * │  Description: Frontend API client for supplier management operations including                   │
 * │               credit management, invoice entry, and payment processing.                          │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

const API_BASE_URL = 'http://127.0.0.1:8000';

export interface Supplier {
    id: number;
    name: string;
    company_name?: string;
    contact_person?: string;
    phone?: string;
    mobile?: string;
    email?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    postal_code?: string;
    business_registration?: string;
    vat_number?: string;
    credit_limit: number;
    current_balance: number;
    payment_terms_days: number;
    visit_day?: string;
    visit_frequency: string;
    last_visit_date?: string;
    next_visit_date?: string;
    is_active: boolean;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface SupplierCreate {
    name: string;
    company_name?: string;
    contact_person?: string;
    phone?: string;
    mobile?: string;
    email?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    postal_code?: string;
    business_registration?: string;
    vat_number?: string;
    credit_limit?: number;
    payment_terms_days?: number;
    visit_day?: string;
    visit_frequency?: string;
    notes?: string;
}

export interface SupplierUpdate {
    name?: string;
    company_name?: string;
    contact_person?: string;
    phone?: string;
    mobile?: string;
    email?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    postal_code?: string;
    business_registration?: string;
    vat_number?: string;
    credit_limit?: number;
    payment_terms_days?: number;
    visit_day?: string;
    visit_frequency?: string;
    is_active?: boolean;
    notes?: string;
}

export interface SupplierInvoice {
    id: number;
    invoice_number: string;
    supplier_invoice_number: string;
    supplier_id: number;
    supplier_name: string;
    invoice_date: string;
    due_date: string;
    subtotal: number;
    discount_amount: number;
    tax_amount: number;
    total_amount: number;
    paid_amount: number;
    balance_amount: number;
    status: string;
    payment_status: string;
    goods_received: boolean;
    po_number?: string;
    description?: string;
    notes?: string;
    invoice_photo_path?: string;
    created_at: string;
    updated_at: string;
}

export interface SupplierInvoiceCreate {
    supplier_id: number;
    supplier_invoice_number: string;
    invoice_date: string;
    due_date: string;
    subtotal: number;
    discount_amount?: number;
    tax_amount?: number;
    total_amount: number;
    po_number?: string;
    description?: string;
    notes?: string;
    payment_terms?: string;
}

export interface SupplierPayment {
    id: number;
    payment_number: string;
    supplier_id: number;
    supplier_name: string;
    invoice_id?: number;
    invoice_number?: string;
    payment_method: string;
    amount: number;
    payment_date: string;
    status: string;
    allocated_amount: number;
    advance_amount: number;
    description?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface SupplierPaymentCreate {
    supplier_id: number;
    invoice_id?: number;
    payment_method: string;
    amount: number;
    payment_date?: string;
    cheque_number?: string;
    cheque_date?: string;
    bank_name?: string;
    transfer_reference?: string;
    account_number?: string;
    mobile_number?: string;
    transaction_id?: string;
    description?: string;
    notes?: string;
}

export interface VisitAlert {
    supplier_id: number;
    supplier_name: string;
    contact_person?: string;
    phone?: string;
    next_visit_date: string;
    days_overdue: number;
    visit_frequency: string;
}

export interface PaymentReminder {
    invoice_id: number;
    invoice_number: string;
    supplier_id: number;
    supplier_name: string;
    contact_person?: string;
    phone?: string;
    due_date: string;
    days_overdue: number;
    balance_amount: number;
    payment_terms_days: number;
}

export interface SupplierSummary {
    total_suppliers: number;
    total_outstanding: number;
    overdue_invoices: number;
    overdue_amount: number;
    average_payment_terms: number;
}

export interface SupplierAnalytics {
    period_days: number;
    start_date: string;
    end_date: string;
    payment_summary: {
        total_payments: number;
        payment_count: number;
        by_method: Record<string, number>;
        average_payment_days: number;
    };
    invoice_summary: {
        total_invoices: number;
        total_amount: number;
        average_invoice_amount: number;
    };
    top_suppliers: Array<{
        supplier_id: number;
        supplier_name: string;
        total_amount: number;
        invoice_count: number;
    }>;
    monthly_trends: Array<{
        month: string;
        invoice_count: number;
        total_amount: number;
        payment_count: number;
        payment_amount: number;
    }>;
}

export interface SupplierAgingReport {
    report_date: string;
    total_amount: number;
    total_invoices: number;
    aging_buckets: {
        current: AgingBucket;
        '1_30_days': AgingBucket;
        '31_60_days': AgingBucket;
        '61_90_days': AgingBucket;
        over_90_days: AgingBucket;
    };
}

export interface AgingBucket {
    amount: number;
    count: number;
    invoices: Array<{
        invoice_id: number;
        invoice_number: string;
        supplier_name: string;
        due_date: string;
        days_overdue: number;
        balance_amount: number;
    }>;
}

export interface SupplierPerformanceReport {
    report_date: string;
    period_days: number;
    suppliers: Array<{
        supplier_id: number;
        supplier_name: string;
        contact_person?: string;
        city?: string;
        metrics: {
            total_invoices: number;
            total_invoice_amount: number;
            total_payments: number;
            average_invoice_amount: number;
            payment_timeliness_percent: number;
            average_delay_days: number;
            on_time_payments: number;
            late_payments: number;
            current_balance: number;
            overdue_invoices: number;
            credit_utilization_percent: number;
        };
    }>;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

class SupplierAPI {
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                ...options,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                return {
                    success: false,
                    error: errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
                };
            }

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('API Request Error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Network error occurred',
            };
        }
    }

    // Supplier CRUD operations
    async getSuppliers(params?: {
        skip?: number;
        limit?: number;
        search?: string;
        city?: string;
        has_balance?: boolean;
        visit_due?: boolean;
        active_only?: boolean;
    }): Promise<ApiResponse<Supplier[]>> {
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    searchParams.append(key, value.toString());
                }
            });
        }

        return this.request<Supplier[]>(`/suppliers?${searchParams.toString()}`);
    }

    async getSupplier(id: number): Promise<ApiResponse<Supplier>> {
        return this.request<Supplier>(`/suppliers/${id}`);
    }

    async createSupplier(supplier: SupplierCreate): Promise<ApiResponse<Supplier>> {
        return this.request<Supplier>('/suppliers', {
            method: 'POST',
            body: JSON.stringify(supplier),
        });
    }

    async updateSupplier(id: number, supplier: SupplierUpdate): Promise<ApiResponse<Supplier>> {
        return this.request<Supplier>(`/suppliers/${id}`, {
            method: 'PUT',
            body: JSON.stringify(supplier),
        });
    }

    async deleteSupplier(id: number): Promise<ApiResponse<{ message: string }>> {
        return this.request<{ message: string }>(`/suppliers/${id}`, {
            method: 'DELETE',
        });
    }

    // Invoice operations
    async getSupplierInvoices(
        supplierId: number,
        params?: {
            skip?: number;
            limit?: number;
            status?: string;
            payment_status?: string;
        }
    ): Promise<ApiResponse<SupplierInvoice[]>> {
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    searchParams.append(key, value.toString());
                }
            });
        }

        return this.request<SupplierInvoice[]>(
            `/suppliers/${supplierId}/invoices?${searchParams.toString()}`
        );
    }

    async createSupplierInvoice(
        supplierId: number,
        invoice: SupplierInvoiceCreate
    ): Promise<ApiResponse<SupplierInvoice>> {
        return this.request<SupplierInvoice>(`/suppliers/${supplierId}/invoices`, {
            method: 'POST',
            body: JSON.stringify(invoice),
        });
    }

    async uploadInvoicePhoto(
        supplierId: number,
        invoiceId: number,
        file: File
    ): Promise<ApiResponse<{ message: string; file_path: string }>> {
        const formData = new FormData();
        formData.append('file', file);

        return this.request<{ message: string; file_path: string }>(
            `/suppliers/${supplierId}/invoices/${invoiceId}/upload-photo`,
            {
                method: 'POST',
                body: formData,
                headers: {}, // Let browser set Content-Type for FormData
            }
        );
    }

    async receiveGoods(
        supplierId: number,
        invoiceId: number
    ): Promise<ApiResponse<{ message: string }>> {
        return this.request<{ message: string }>(
            `/suppliers/${supplierId}/invoices/${invoiceId}/receive-goods`,
            {
                method: 'POST',
            }
        );
    }

    // Payment operations
    async getSupplierPayments(
        supplierId: number,
        params?: {
            skip?: number;
            limit?: number;
        }
    ): Promise<ApiResponse<SupplierPayment[]>> {
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    searchParams.append(key, value.toString());
                }
            });
        }

        return this.request<SupplierPayment[]>(
            `/suppliers/${supplierId}/payments?${searchParams.toString()}`
        );
    }

    async createSupplierPayment(
        supplierId: number,
        payment: SupplierPaymentCreate
    ): Promise<ApiResponse<SupplierPayment>> {
        return this.request<SupplierPayment>(`/suppliers/${supplierId}/payments`, {
            method: 'POST',
            body: JSON.stringify(payment),
        });
    }

    // Alerts and reminders
    async getVisitAlerts(): Promise<ApiResponse<VisitAlert[]>> {
        return this.request<VisitAlert[]>('/suppliers/visit-alerts');
    }

    async getPaymentReminders(): Promise<ApiResponse<PaymentReminder[]>> {
        return this.request<PaymentReminder[]>('/suppliers/payment-reminders');
    }

    // Reports
    async getSupplierSummary(): Promise<ApiResponse<SupplierSummary>> {
        return this.request<SupplierSummary>('/suppliers/reports/summary');
    }

    async getSupplierAnalytics(days: number = 30): Promise<ApiResponse<SupplierAnalytics>> {
        return this.request<SupplierAnalytics>(`/suppliers/reports/analytics?days=${days}`);
    }

    async getSupplierAgingReport(): Promise<ApiResponse<SupplierAgingReport>> {
        return this.request<SupplierAgingReport>('/suppliers/reports/aging');
    }

    async getSupplierPerformanceReport(
        supplierId?: number,
        days: number = 90
    ): Promise<ApiResponse<SupplierPerformanceReport>> {
        const params = new URLSearchParams();
        if (supplierId) params.append('supplier_id', supplierId.toString());
        params.append('days', days.toString());

        return this.request<SupplierPerformanceReport>(`/suppliers/reports/performance?${params.toString()}`);
    }
}

export const supplierAPI = new SupplierAPI();