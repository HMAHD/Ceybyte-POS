/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                              Customer Credit Management Component                                │
 * │                                                                                                  │
 * │  Description: Main customer credit management interface with customer list, search,             │
 * │               credit book, and payment collection functionality.                                 │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                  │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Plus, Filter, CreditCard, Users, AlertTriangle } from 'lucide-react';
import { customersApi, CustomerResponse } from '@/api/customers.api';
import { CustomerRegistrationForm } from './CustomerRegistrationForm';
import { CustomerCreditBook } from './CustomerCreditBook';
import { PaymentCollectionModal } from './PaymentCollectionModal';

interface CustomerCreditManagementProps {
  className?: string;
}

export const CustomerCreditManagement: React.FC<CustomerCreditManagementProps> = ({
  className = ''
}) => {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'overdue'>('all');
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerResponse | null>(null);
  const [showCreditBook, setShowCreditBook] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [areas, setAreas] = useState<string[]>([]);

  useEffect(() => {
    loadCustomers();
  }, [searchTerm, selectedArea, filterType]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm || undefined,
        area_village: selectedArea || undefined,
        has_credit: filterType === 'credit' ? true : undefined,
        overdue_only: filterType === 'overdue' ? true : undefined,
        active_only: true
      };

      const response = await customersApi.getCustomers(params);
      if (response.success) {
        setCustomers(response.data);
        
        // Extract unique areas for filter dropdown
        const uniqueAreas = [...new Set(response.data.map(c => c.area_village))];
        setAreas(uniqueAreas);
      } else {
        console.error('Failed to load customers:', response.error);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerRegistered = () => {
    setShowRegistrationForm(false);
    loadCustomers();
  };

  const handleViewCreditBook = (customer: CustomerResponse) => {
    setSelectedCustomer(customer);
    setShowCreditBook(true);
  };

  const handleCollectPayment = (customer: CustomerResponse) => {
    setSelectedCustomer(customer);
    setShowPaymentModal(true);
  };

  const handlePaymentCollected = () => {
    setShowPaymentModal(false);
    loadCustomers();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getCustomerStatusColor = (customer: CustomerResponse) => {
    if (customer.days_overdue > 0) return 'text-red-600';
    if (customer.current_balance > 0) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getCustomerStatusText = (customer: CustomerResponse) => {
    if (customer.days_overdue > 0) return t('overdue');
    if (customer.current_balance > 0) return t('credit');
    return t('clear');
  };

  if (showRegistrationForm) {
    return (
      <CustomerRegistrationForm
        onCancel={() => setShowRegistrationForm(false)}
        onCustomerRegistered={handleCustomerRegistered}
      />
    );
  }

  if (showCreditBook && selectedCustomer) {
    return (
      <CustomerCreditBook
        customer={selectedCustomer}
        onBack={() => setShowCreditBook(false)}
        onCollectPayment={() => {
          setShowCreditBook(false);
          setShowPaymentModal(true);
        }}
      />
    );
  }

  return (
    <div className={`customer-credit-management ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CreditCard className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            {t('customer_credit_management')}
          </h1>
        </div>
        <button
          onClick={() => setShowRegistrationForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('add_customer')}
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={t('search_customers')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Area Filter */}
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">{t('all_areas')}</option>
            {areas.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>

          {/* Credit Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'credit' | 'overdue')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">{t('all_customers')}</option>
            <option value="credit">{t('with_credit')}</option>
            <option value="overdue">{t('overdue_only')}</option>
          </select>

          {/* Summary Stats */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            {t('total_customers')}: {customers.length}
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-lg shadow-sm border">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">{t('loading_customers')}</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>{t('no_customers_found')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                    {t('customer')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                    {t('contact')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                    {t('area')}
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                    {t('credit_limit')}
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                    {t('current_balance')}
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">
                    {t('status')}
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900">{customer.name}</div>
                        {customer.email && (
                          <div className="text-sm text-gray-500">{customer.email}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{customer.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{customer.area_village}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(customer.credit_limit)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className={`text-sm font-medium ${getCustomerStatusColor(customer)}`}>
                        {formatCurrency(customer.current_balance)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {customer.days_overdue > 0 && (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-xs font-medium ${getCustomerStatusColor(customer)}`}>
                          {getCustomerStatusText(customer)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewCreditBook(customer)}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        >
                          {t('credit_book')}
                        </button>
                        {customer.current_balance > 0 && (
                          <button
                            onClick={() => handleCollectPayment(customer)}
                            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                          >
                            {t('collect_payment')}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Collection Modal */}
      {showPaymentModal && selectedCustomer && (
        <PaymentCollectionModal
          customer={selectedCustomer}
          onClose={() => setShowPaymentModal(false)}
          onPaymentCollected={handlePaymentCollected}
        />
      )}
    </div>
  );
};

export default CustomerCreditManagement;