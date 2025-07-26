/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                    Supplier Form Component                                       │
 * │                                                                                                  │
 * │  Description: Form component for creating and editing supplier information including             │
 * │               contact details, credit terms, and visit scheduling.                              │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supplierAPI, type Supplier, type SupplierCreate, type SupplierUpdate } from '@/api/suppliers.api';

interface SupplierFormProps {
    supplier?: Supplier;
    onSubmit: (supplier: Supplier) => void;
    onCancel: () => void;
}

export const SupplierForm: React.FC<SupplierFormProps> = ({
    supplier,
    onSubmit,
    onCancel,
}) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<SupplierCreate>({
        name: '',
        company_name: '',
        contact_person: '',
        phone: '',
        mobile: '',
        email: '',
        address_line1: '',
        address_line2: '',
        city: '',
        postal_code: '',
        business_registration: '',
        vat_number: '',
        credit_limit: 0,
        payment_terms_days: 30,
        visit_day: '',
        visit_frequency: 'weekly',
        notes: '',
    });

    useEffect(() => {
        if (supplier) {
            setFormData({
                name: supplier.name,
                company_name: supplier.company_name || '',
                contact_person: supplier.contact_person || '',
                phone: supplier.phone || '',
                mobile: supplier.mobile || '',
                email: supplier.email || '',
                address_line1: supplier.address_line1 || '',
                address_line2: supplier.address_line2 || '',
                city: supplier.city || '',
                postal_code: supplier.postal_code || '',
                business_registration: supplier.business_registration || '',
                vat_number: supplier.vat_number || '',
                credit_limit: supplier.credit_limit,
                payment_terms_days: supplier.payment_terms_days,
                visit_day: supplier.visit_day || '',
                visit_frequency: supplier.visit_frequency,
                notes: supplier.notes || '',
            });
        }
    }, [supplier]);

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = t('Supplier name is required');
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = t('Please enter a valid email address');
        }

        if ((formData.credit_limit ?? 0) < 0) {
            newErrors.credit_limit = t('Credit limit cannot be negative');
        }

        if ((formData.payment_terms_days ?? 30) < 1) {
            newErrors.payment_terms_days = t('Payment terms must be at least 1 day');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            let response;
            if (supplier) {
                response = await supplierAPI.updateSupplier(supplier.id, formData as SupplierUpdate);
            } else {
                response = await supplierAPI.createSupplier(formData);
            }

            if (response.success && response.data) {
                onSubmit(response.data);
            } else {
                console.error('Supplier operation failed:', response.error);
                alert(response.error || t('Operation failed'));
            }
        } catch (error) {
            console.error('Error submitting supplier form:', error);
            alert(t('An error occurred while saving the supplier'));
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof SupplierCreate, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">
                {supplier ? t('Edit Supplier') : t('Add New Supplier')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('Supplier Name')} *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.name
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            required
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('Company Name')}
                        </label>
                        <input
                            type="text"
                            value={formData.company_name}
                            onChange={(e) => handleInputChange('company_name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('Contact Person')}
                        </label>
                        <input
                            type="text"
                            value={formData.contact_person}
                            onChange={(e) => handleInputChange('contact_person', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('Phone')}
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('Mobile')}
                        </label>
                        <input
                            type="tel"
                            value={formData.mobile}
                            onChange={(e) => handleInputChange('mobile', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('Email')}
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.email
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-blue-500'
                                }`}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                        )}
                    </div>
                </div>

                {/* Address Information */}
                <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">{t('Address Information')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('Address Line 1')}
                            </label>
                            <input
                                type="text"
                                value={formData.address_line1}
                                onChange={(e) => handleInputChange('address_line1', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('Address Line 2')}
                            </label>
                            <input
                                type="text"
                                value={formData.address_line2}
                                onChange={(e) => handleInputChange('address_line2', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('City')}
                            </label>
                            <input
                                type="text"
                                value={formData.city}
                                onChange={(e) => handleInputChange('city', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('Postal Code')}
                            </label>
                            <input
                                type="text"
                                value={formData.postal_code}
                                onChange={(e) => handleInputChange('postal_code', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Business Information */}
                <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">{t('Business Information')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('Business Registration')}
                            </label>
                            <input
                                type="text"
                                value={formData.business_registration}
                                onChange={(e) => handleInputChange('business_registration', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('VAT Number')}
                            </label>
                            <input
                                type="text"
                                value={formData.vat_number}
                                onChange={(e) => handleInputChange('vat_number', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Credit Terms */}
                <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">{t('Credit Terms')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('Credit Limit')} (LKR)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.credit_limit}
                                onChange={(e) => handleInputChange('credit_limit', parseFloat(e.target.value) || 0)}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.credit_limit
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-blue-500'
                                    }`}
                            />
                            {errors.credit_limit && (
                                <p className="text-red-500 text-sm mt-1">{errors.credit_limit}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('Payment Terms')} ({t('Days')})
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={formData.payment_terms_days}
                                onChange={(e) => handleInputChange('payment_terms_days', parseInt(e.target.value) || 30)}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.payment_terms_days
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-blue-500'
                                    }`}
                            />
                            {errors.payment_terms_days && (
                                <p className="text-red-500 text-sm mt-1">{errors.payment_terms_days}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Visit Schedule */}
                <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">{t('Visit Schedule')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('Visit Day')}
                            </label>
                            <select
                                value={formData.visit_day}
                                onChange={(e) => handleInputChange('visit_day', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">{t('Select Day')}</option>
                                <option value="monday">{t('Monday')}</option>
                                <option value="tuesday">{t('Tuesday')}</option>
                                <option value="wednesday">{t('Wednesday')}</option>
                                <option value="thursday">{t('Thursday')}</option>
                                <option value="friday">{t('Friday')}</option>
                                <option value="saturday">{t('Saturday')}</option>
                                <option value="sunday">{t('Sunday')}</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('Visit Frequency')}
                            </label>
                            <select
                                value={formData.visit_frequency}
                                onChange={(e) => handleInputChange('visit_frequency', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="daily">{t('Daily')}</option>
                                <option value="weekly">{t('Weekly')}</option>
                                <option value="biweekly">{t('Bi-weekly')}</option>
                                <option value="monthly">{t('Monthly')}</option>
                                <option value="quarterly">{t('Quarterly')}</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                <div className="border-t pt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('Notes')}
                    </label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={t('Additional notes about the supplier...')}
                    />
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        disabled={loading}
                    >
                        {t('Cancel')}
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? t('Saving...') : supplier ? t('Update Supplier') : t('Create Supplier')}
                    </button>
                </div>
            </form>
        </div>
    );
};