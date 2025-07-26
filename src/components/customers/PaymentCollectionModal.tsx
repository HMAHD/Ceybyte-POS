/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                             Payment Collection Modal Component                                   │
 * │                                                                                                  │
 * │  Description: Modal for collecting customer payments with multiple payment methods,              │
 * │               partial payment support, and receipt generation.                                   │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                  │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, DollarSign, CreditCard, Banknote, Smartphone, Save, Calculator } from 'lucide-react';
import { CustomerResponse, customersApi } from '@/api/customers.api';

interface PaymentCollectionModalProps {
  customer: CustomerResponse;
  onClose: () => void;
  onPaymentCollected: () => void;
}

interface PaymentData {
  amount: number;
  payment_method: 'cash' | 'card' | 'bank_transfer' | 'mobile_payment';
  reference_number?: string;
  notes?: string;
}

export const PaymentCollectionModal: React.FC<PaymentCollectionModalProps> = ({
  customer,
  onClose,
  onPaymentCollected
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData>({
    amount: customer.current_balance,
    payment_method: 'cash',
    reference_number: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const paymentMethods = [
    { value: 'cash', label: t('cash'), icon: Banknote },
    { value: 'card', label: t('card'), icon: CreditCard },
    { value: 'bank_transfer', label: t('bank_transfer'), icon: DollarSign },
    { value: 'mobile_payment', label: t('mobile_payment'), icon: Smartphone }
  ];

  const validatePayment = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (paymentData.amount <= 0) {
      newErrors.amount = t('amount_must_be_positive');
    }

    if (paymentData.amount > customer.current_balance) {
      newErrors.amount = t('amount_exceeds_balance');
    }

    if (paymentData.payment_method !== 'cash' && !paymentData.reference_number?.trim()) {
      newErrors.reference_number = t('reference_number_required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePayment()) {
      return;
    }

    try {
      setLoading(true);
      const paymentRequest = {
        customer_id: customer.id,
        amount: paymentData.amount,
        payment_method: paymentData.payment_method,
        reference: paymentData.reference_number,
        notes: paymentData.notes
      };
      
      const response = await customersApi.recordPayment(paymentRequest);
      
      if (response.success) {
        onPaymentCollected();
      } else {
        console.error('Failed to record payment:', response.error);
        setErrors({ submit: response.error || t('failed_to_record_payment') });
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      setErrors({ submit: t('network_error') });
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (value: string) => {
    const amount = parseFloat(value) || 0;
    setPaymentData(prev => ({ ...prev, amount }));
    
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: '' }));
    }
  };

  const setQuickAmount = (percentage: number) => {
    const amount = (customer.current_balance * percentage) / 100;
    setPaymentData(prev => ({ ...prev, amount }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">
              {t('collect_payment')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">{customer.name}</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div>{t('current_balance')}: <span className="font-medium text-red-600">{formatCurrency(customer.current_balance)}</span></div>
              <div>{t('credit_limit')}: <span className="font-medium">{formatCurrency(customer.credit_limit)}</span></div>
              {customer.days_overdue > 0 && (
                <div className="text-red-600">
                  {t('overdue_by')} {customer.days_overdue} {t('days')}
                </div>
              )}
            </div>
          </div>

          {/* Payment Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('payment_amount')} *
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.01"
                value={paymentData.amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.amount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              <Calculator className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
            )}
            
            {/* Quick Amount Buttons */}
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setQuickAmount(25)}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                25%
              </button>
              <button
                type="button"
                onClick={() => setQuickAmount(50)}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                50%
              </button>
              <button
                type="button"
                onClick={() => setQuickAmount(100)}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                {t('full_amount')}
              </button>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('payment_method')} *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => setPaymentData(prev => ({ ...prev, payment_method: method.value as any }))}
                    className={`flex items-center gap-2 p-3 border rounded-lg transition-colors ${
                      paymentData.payment_method === method.value
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{method.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reference Number */}
          {paymentData.payment_method !== 'cash' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('reference_number')} *
              </label>
              <input
                type="text"
                value={paymentData.reference_number}
                onChange={(e) => setPaymentData(prev => ({ ...prev, reference_number: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.reference_number ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={t('enter_reference_number')}
              />
              {errors.reference_number && (
                <p className="mt-1 text-sm text-red-600">{errors.reference_number}</p>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('notes')}
            </label>
            <textarea
              value={paymentData.notes}
              onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder={t('optional_payment_notes')}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {loading ? t('processing') : t('record_payment')}
            </button>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default PaymentCollectionModal;