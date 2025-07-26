/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                               Customer Credit Book Component                                     │
 * │                                                                                                  │
 * │  Description: Digital credit book interface showing customer ledger with transaction history,   │
 * │               running balance display, and aging analysis for credit management.                 │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                  │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CreditCard, Calendar, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import { CustomerResponse, customersApi } from '@/api/customers.api';

interface CustomerCreditBookProps {
  customer: CustomerResponse;
  onBack: () => void;
  onCollectPayment: () => void;
}

interface Transaction {
  id: number;
  type: 'sale' | 'payment';
  amount: number;
  description: string;
  balance_after: number;
  created_at: string;
  reference?: string;
}

export const CustomerCreditBook: React.FC<CustomerCreditBookProps> = ({
  customer,
  onBack,
  onCollectPayment
}) => {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'30' | '90' | '365' | 'all'>('90');

  useEffect(() => {
    loadTransactionHistory();
  }, [customer.id, dateRange]);

  const loadTransactionHistory = async () => {
    try {
      setLoading(true);
      
      const endDate = new Date();
      let startDate: Date | undefined;
      
      if (dateRange !== 'all') {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(dateRange));
      }

      const params = {
        start_date: startDate?.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        limit: 100
      };

      const response = await customersApi.getTransactionHistory(customer.id, params);
      if (response.success && response.data) {
        setTransactions(response.data);
      } else {
        console.error('Failed to load transaction history:', response.error);
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error loading transaction history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-LK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    return type === 'sale' ? (
      <TrendingUp className="w-4 h-4 text-red-500" />
    ) : (
      <DollarSign className="w-4 h-4 text-green-500" />
    );
  };

  const getTransactionColor = (type: string) => {
    return type === 'sale' ? 'text-red-600' : 'text-green-600';
  };

  const getAgingAnalysis = () => {
    const aging = {
      current: 0,
      days_1_30: 0,
      days_31_60: 0,
      days_61_90: 0,
      over_90: 0
    };

    // This would be calculated based on actual invoice dates
    // For now, using payment terms and current balance
    if (customer.days_overdue === 0) {
      aging.current = customer.current_balance;
    } else if (customer.days_overdue <= 30) {
      aging.days_1_30 = customer.current_balance;
    } else if (customer.days_overdue <= 60) {
      aging.days_31_60 = customer.current_balance;
    } else if (customer.days_overdue <= 90) {
      aging.days_61_90 = customer.current_balance;
    } else {
      aging.over_90 = customer.current_balance;
    }

    return aging;
  };

  const aging = getAgingAnalysis();

  return (
    <div className="customer-credit-book">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            {t('back')}
          </button>
          <CreditCard className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            {t('credit_book')} - {customer.name}
          </h1>
        </div>
        {customer.current_balance > 0 && (
          <button
            onClick={onCollectPayment}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <DollarSign className="w-4 h-4" />
            {t('collect_payment')}
          </button>
        )}
      </div>

      {/* Customer Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-5 h-5 text-blue-500" />
            <h3 className="font-medium text-gray-900">{t('credit_limit')}</h3>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(customer.credit_limit)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-red-500" />
            <h3 className="font-medium text-gray-900">{t('current_balance')}</h3>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(customer.current_balance)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            <h3 className="font-medium text-gray-900">{t('available_credit')}</h3>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(customer.credit_limit - customer.current_balance)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-2 mb-2">
            {customer.days_overdue > 0 ? (
              <AlertTriangle className="w-5 h-5 text-red-500" />
            ) : (
              <Calendar className="w-5 h-5 text-green-500" />
            )}
            <h3 className="font-medium text-gray-900">{t('payment_status')}</h3>
          </div>
          <p className={`text-2xl font-bold ${customer.days_overdue > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {customer.days_overdue > 0 ? `${customer.days_overdue} ${t('days_overdue')}` : t('current')}
          </p>
        </div>
      </div>

      {/* Aging Analysis */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t('aging_analysis')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">{t('current')}</div>
            <div className="text-lg font-bold text-green-600">
              {formatCurrency(aging.current)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">1-30 {t('days')}</div>
            <div className="text-lg font-bold text-yellow-600">
              {formatCurrency(aging.days_1_30)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">31-60 {t('days')}</div>
            <div className="text-lg font-bold text-orange-600">
              {formatCurrency(aging.days_31_60)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">61-90 {t('days')}</div>
            <div className="text-lg font-bold text-red-500">
              {formatCurrency(aging.days_61_90)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">90+ {t('days')}</div>
            <div className="text-lg font-bold text-red-700">
              {formatCurrency(aging.over_90)}
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {t('transaction_history')}
          </h2>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as '30' | '90' | '365' | 'all')}
            className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="30">{t('last_30_days')}</option>
            <option value="90">{t('last_90_days')}</option>
            <option value="365">{t('last_year')}</option>
            <option value="all">{t('all_time')}</option>
          </select>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">{t('loading_transactions')}</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>{t('no_transactions_found')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                    {t('date')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                    {t('type')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                    {t('description')}
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                    {t('amount')}
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                    {t('balance')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                    {t('reference')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatDate(transaction.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getTransactionIcon(transaction.type)}
                        <span className={`text-sm font-medium ${getTransactionColor(transaction.type)}`}>
                          {transaction.type === 'sale' ? t('sale') : t('payment')}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {transaction.description}
                    </td>
                    <td className={`px-4 py-3 text-sm font-medium text-right ${getTransactionColor(transaction.type)}`}>
                      {transaction.type === 'sale' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-right text-gray-900">
                      {formatCurrency(transaction.balance_after)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {transaction.reference || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerCreditBook;