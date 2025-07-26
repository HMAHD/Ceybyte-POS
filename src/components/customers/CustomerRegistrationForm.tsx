/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                              Customer Registration Form Component                                │
 * │                                                                                                  │
 * │  Description: Customer registration form with credit settings, contact information,             │
 * │               and area/village grouping for collection routes.                                   │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                  │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, X, User, Phone, Mail, MapPin, CreditCard, Globe } from 'lucide-react';
import { customersApi, CustomerCreateRequest } from '@/api/customers.api';

interface CustomerRegistrationFormProps {
  onCancel: () => void;
  onCustomerRegistered: () => void;
}

export const CustomerRegistrationForm: React.FC<CustomerRegistrationFormProps> = ({
  onCancel,
  onCustomerRegistered
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CustomerCreateRequest>({
    name: '',
    phone: '',
    email: '',
    address: '',
    area_village: '',
    credit_limit: 0,
    payment_terms_days: 30,
    whatsapp_opt_in: false,
    preferred_language: 'en'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('name_required');
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t('phone_required');
    } else if (!/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = t('invalid_phone_format');
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('invalid_email_format');
    }

    if (!formData.area_village.trim()) {
      newErrors.area_village = t('area_village_required');
    }

    if (formData.credit_limit < 0) {
      newErrors.credit_limit = t('credit_limit_must_be_positive');
    }

    if (formData.payment_terms_days < 1 || formData.payment_terms_days > 365) {
      newErrors.payment_terms_days = t('payment_terms_invalid_range');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const response = await customersApi.createCustomer(formData);
      
      if (response.success) {
        onCustomerRegistered();
      } else {
        console.error('Failed to create customer:', response.error);
        setErrors({ submit: response.error || t('failed_to_create_customer') });
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      setErrors({ submit: t('network_error') });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CustomerCreateRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="customer-registration-form">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <User className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            {t('register_new_customer')}
          </h1>
        </div>
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <X className="w-4 h-4" />
          {t('cancel')}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            {t('basic_information')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('customer_name')} *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={t('enter_customer_name')}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('preferred_language')}
              </label>
              <select
                value={formData.preferred_language}
                onChange={(e) => handleInputChange('preferred_language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="en">{t('english')}</option>
                <option value="si">{t('sinhala')}</option>
                <option value="ta">{t('tamil')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5" />
            {t('contact_information')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('phone_number')} *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0771234567"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('email_address')}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="customer@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('address')}
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('enter_customer_address')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('area_village')} *
              </label>
              <input
                type="text"
                value={formData.area_village}
                onChange={(e) => handleInputChange('area_village', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.area_village ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={t('enter_area_or_village')}
              />
              {errors.area_village && (
                <p className="mt-1 text-sm text-red-600">{errors.area_village}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="whatsapp_opt_in"
                checked={formData.whatsapp_opt_in}
                onChange={(e) => handleInputChange('whatsapp_opt_in', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="whatsapp_opt_in" className="ml-2 block text-sm text-gray-700">
                {t('enable_whatsapp_notifications')}
              </label>
            </div>
          </div>
        </div>

        {/* Credit Settings */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            {t('credit_settings')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('credit_limit')} (LKR)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.credit_limit}
                onChange={(e) => handleInputChange('credit_limit', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.credit_limit ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.credit_limit && (
                <p className="mt-1 text-sm text-red-600">{errors.credit_limit}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {t('set_to_zero_for_cash_only')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('payment_terms')} ({t('days')})
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={formData.payment_terms_days}
                onChange={(e) => handleInputChange('payment_terms_days', parseInt(e.target.value) || 30)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.payment_terms_days ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.payment_terms_days && (
                <p className="mt-1 text-sm text-red-600">{errors.payment_terms_days}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {t('number_of_days_for_payment')}
              </p>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            {loading ? t('saving') : t('register_customer')}
          </button>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default CustomerRegistrationForm;