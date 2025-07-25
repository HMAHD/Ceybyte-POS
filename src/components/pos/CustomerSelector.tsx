/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                    Customer Selector Component                                   │
 * │                                                                                                  │
 * │  Description: Customer search and selection component with credit information display           │
 * │               for credit sales and customer mode operations.                                     │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect } from 'react';
import {
  Select,
  Button,
  Tag,
  message,
  Card,
  Divider
} from 'antd';
import {
  UserOutlined,
  PlusOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CreditCardOutlined
} from '@ant-design/icons';
import { useTranslation } from '@/hooks/useTranslation';
import { customersApi, CustomerResponse } from '@/api/customers.api';

const { Option } = Select;

interface CustomerSelectorProps {
  value?: number;
  onSelect: (customerId: number | undefined, customerName: string) => void;
  showCreditInfo?: boolean;
  disabled?: boolean;
}

const CustomerSelector: React.FC<CustomerSelectorProps> = ({
  value,
  onSelect,
  showCreditInfo = false,
  disabled = false
}) => {
  const { t, formatCurrency } = useTranslation();
  
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerResponse | null>(null);

  // Load customers on component mount
  useEffect(() => {
    loadCustomers();
  }, []);

  // Load selected customer details when value changes
  useEffect(() => {
    if (value && !selectedCustomer) {
      loadCustomerDetails(value);
    }
  }, [value]);

  const loadCustomers = async (search?: string) => {
    setLoading(true);
    try {
      const response = search 
        ? await customersApi.searchCustomers(search)
        : await customersApi.getCustomers({ limit: 50, active_only: true });
      
      if (response.success && response.data) {
        setCustomers(response.data);
      } else {
        message.error('Failed to load customers');
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      message.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerDetails = async (customerId: number) => {
    try {
      const response = await customersApi.getCustomer(customerId);
      if (response.success && response.data) {
        setSelectedCustomer(response.data);
      }
    } catch (error) {
      console.error('Error loading customer details:', error);
    }
  };

  const handleSearch = (searchText: string) => {
    if (searchText.length >= 2) {
      loadCustomers(searchText);
    } else if (searchText.length === 0) {
      loadCustomers();
    }
  };

  const handleSelect = (customerId: number | undefined) => {
    if (customerId) {
      const customer = customers.find(c => c.id === customerId);
      if (customer) {
        setSelectedCustomer(customer);
        onSelect(customerId, customer.name);
      }
    } else {
      setSelectedCustomer(null);
      onSelect(undefined, '');
    }
  };

  const handleClear = () => {
    setSelectedCustomer(null);
    onSelect(undefined, '');
  };

  const renderCustomerOption = (customer: CustomerResponse) => (
    <div className="py-1">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="font-medium">{customer.name}</div>
          <div className="text-xs text-gray-500 flex items-center space-x-3">
            <span className="flex items-center">
              <PhoneOutlined className="mr-1" />
              {customer.phone}
            </span>
            <span className="flex items-center">
              <EnvironmentOutlined className="mr-1" />
              {customer.area_village}
            </span>
          </div>
        </div>
        <div className="text-right text-xs">
          {customer.current_balance > 0 && (
            <Tag color="orange">
              Balance: {formatCurrency(customer.current_balance)}
            </Tag>
          )}
          {customer.days_overdue > 0 && (
            <Tag color="red">
              {customer.days_overdue}d overdue
            </Tag>
          )}
        </div>
      </div>
    </div>
  );

  const renderCreditInfo = () => {
    if (!showCreditInfo || !selectedCustomer) return null;

    const availableCredit = selectedCustomer.credit_limit - selectedCustomer.current_balance;
    const creditUtilization = (selectedCustomer.current_balance / selectedCustomer.credit_limit) * 100;

    return (
      <Card size="small" className="mt-3 bg-blue-50 border-blue-200">
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2 mb-2">
            <CreditCardOutlined className="text-blue-600" />
            <span className="font-medium text-blue-800">Credit Information</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-gray-600">Credit Limit</div>
              <div className="font-medium">{formatCurrency(selectedCustomer.credit_limit)}</div>
            </div>
            <div>
              <div className="text-gray-600">Current Balance</div>
              <div className={`font-medium ${selectedCustomer.current_balance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                {formatCurrency(selectedCustomer.current_balance)}
              </div>
            </div>
            <div>
              <div className="text-gray-600">Available Credit</div>
              <div className={`font-medium ${availableCredit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(availableCredit)}
              </div>
            </div>
            <div>
              <div className="text-gray-600">Payment Terms</div>
              <div className="font-medium">{selectedCustomer.payment_terms_days} days</div>
            </div>
          </div>

          {selectedCustomer.days_overdue > 0 && (
            <>
              <Divider className="my-2" />
              <div className="text-red-600 text-xs">
                <strong>Overdue:</strong> {selectedCustomer.days_overdue} days
                {selectedCustomer.last_payment_date && (
                  <span className="ml-2">
                    (Last payment: {new Date(selectedCustomer.last_payment_date).toLocaleDateString()})
                  </span>
                )}
              </div>
            </>
          )}

          {creditUtilization > 80 && (
            <>
              <Divider className="my-2" />
              <div className="text-orange-600 text-xs">
                <strong>Warning:</strong> Credit utilization is {creditUtilization.toFixed(1)}%
              </div>
            </>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div>
      <div className="flex items-center space-x-2 mb-2">
        <UserOutlined />
        <label className="text-sm font-medium">
          {t('pos.customer', 'Customer')}:
        </label>
      </div>

      <div className="space-y-2">
        <Select
          value={value}
          placeholder={t('pos.selectCustomer', 'Select customer or search...')}
          showSearch
          allowClear
          loading={loading}
          onSearch={handleSearch}
          onSelect={handleSelect}
          onClear={handleClear}
          filterOption={false}
          style={{ width: '100%' }}
          size="large"
          disabled={disabled}
          dropdownRender={(menu) => (
            <div>
              {menu}
              <Divider className="my-1" />
              <div className="p-2">
                <Button
                  type="link"
                  icon={<PlusOutlined />}
                  size="small"
                  className="text-blue-600"
                  onClick={() => message.info('Add new customer feature coming soon')}
                >
                  Add New Customer
                </Button>
              </div>
            </div>
          )}
        >
          {customers.map(customer => (
            <Option key={customer.id} value={customer.id}>
              {renderCustomerOption(customer)}
            </Option>
          ))}
        </Select>

        {selectedCustomer && !showCreditInfo && (
          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
            <div className="flex items-center justify-between">
              <span>{selectedCustomer.name}</span>
              <div className="flex items-center space-x-2">
                <span>{selectedCustomer.phone}</span>
                <span>•</span>
                <span>{selectedCustomer.area_village}</span>
              </div>
            </div>
          </div>
        )}

        {renderCreditInfo()}
      </div>
    </div>
  );
};

export default CustomerSelector;