/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                    Payment Processing Modal                                      │
 * │                                                                                                  │
 * │  Description: Enhanced payment modal with multiple payment methods, change calculation,         │
 * │               and comprehensive payment processing for the POS system.                          │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Card,
  Button,
  InputNumber,
  Select,
  Space,
  Divider,
  Row,
  Col,
  message,
  Input,
  Alert,
  Spin
} from 'antd';
import {
  DollarOutlined,
  CreditCardOutlined,
  MobileOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CalculatorOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { useTranslation } from '@/hooks/useTranslation';
import { CartItem } from '@/pages/POSPage';
import { salesApi, SaleCreateRequest } from '@/api/sales.api';
import { customersApi, CustomerCreditInfo } from '@/api/customers.api';
import { MOBILE_PROVIDERS } from '@/utils/constants';

const { Option } = Select;
const { TextArea } = Input;

interface PaymentModalProps {
  visible: boolean;
  items: CartItem[];
  customerId?: number;
  customerName: string;
  isCustomerMode: boolean;
  onPaymentComplete: (receiptData: any) => void;
  onCancel: () => void;
}

type PaymentMethod = 'cash' | 'card' | 'mobile' | 'credit';

interface PaymentValidation {
  isValid: boolean;
  errors: string[];
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  items,
  customerId,
  customerName,
  isCustomerMode,
  onPaymentComplete,
  onCancel
}) => {
  const { t, formatCurrency } = useTranslation();
  
  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amountTendered, setAmountTendered] = useState<number>(0);
  const [cardReference, setCardReference] = useState('');
  const [mobileProvider, setMobileProvider] = useState<string>('');
  const [mobileReference, setMobileReference] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  
  // Customer credit info
  const [customerCredit, setCustomerCredit] = useState<CustomerCreditInfo | null>(null);
  const [loadingCredit, setLoadingCredit] = useState(false);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.originalPrice), 0);
  const totalDiscount = items.reduce((sum, item) => sum + item.discountAmount, 0);
  const total = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const change = paymentMethod === 'cash' ? Math.max(0, amountTendered - total) : 0;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Quick amount buttons for cash payments
  const quickAmounts = [
    Math.ceil(total / 100) * 100, // Round up to nearest 100
    Math.ceil(total / 500) * 500, // Round up to nearest 500
    Math.ceil(total / 1000) * 1000, // Round up to nearest 1000
    total // Exact amount
  ].filter((amount, index, arr) => arr.indexOf(amount) === index && amount >= total);

  // Reset payment form when payment method changes
  useEffect(() => {
    setAmountTendered(paymentMethod === 'cash' ? 0 : total);
    setCardReference('');
    setMobileProvider('');
    setMobileReference('');
    setPaymentNotes('');
  }, [paymentMethod, total]);

  // Auto-set amount for non-cash payments
  useEffect(() => {
    if (paymentMethod !== 'cash') {
      setAmountTendered(total);
    }
  }, [paymentMethod, total]);

  // Load customer credit info when customer changes
  useEffect(() => {
    if (customerId && paymentMethod === 'credit') {
      loadCustomerCredit(customerId);
    }
  }, [customerId, paymentMethod]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (visible) {
      setPaymentMethod('cash');
      setAmountTendered(0);
      setCardReference('');
      setMobileProvider('');
      setMobileReference('');
      setPaymentNotes('');
      setProcessing(false);
      setCustomerCredit(null);
    }
  }, [visible]);

  const loadCustomerCredit = async (customerId: number) => {
    setLoadingCredit(true);
    try {
      const response = await customersApi.getCustomerCredit(customerId);
      if (response.success && response.data) {
        setCustomerCredit(response.data);
      } else {
        message.error('Failed to load customer credit information');
      }
    } catch (error) {
      console.error('Error loading customer credit:', error);
      message.error('Failed to load customer credit information');
    } finally {
      setLoadingCredit(false);
    }
  };

  const validatePayment = (): PaymentValidation => {
    const errors: string[] = [];

    if (items.length === 0) {
      errors.push('No items in cart');
    }

    if (paymentMethod === 'cash') {
      if (amountTendered < total) {
        errors.push('Insufficient amount tendered');
      }
      if (amountTendered <= 0) {
        errors.push('Amount tendered must be greater than zero');
      }
    }

    if (paymentMethod === 'card') {
      if (!cardReference.trim()) {
        errors.push('Card reference number is required');
      }
      if (cardReference.length < 4) {
        errors.push('Card reference must be at least 4 characters');
      }
    }

    if (paymentMethod === 'mobile') {
      if (!mobileProvider) {
        errors.push('Mobile payment provider is required');
      }
      if (!mobileReference.trim()) {
        errors.push('Mobile payment reference is required');
      }
      if (mobileReference.length < 6) {
        errors.push('Mobile reference must be at least 6 characters');
      }
    }

    if (paymentMethod === 'credit') {
      if (!isCustomerMode || !customerId) {
        errors.push('Customer must be selected for credit sales');
      }
      if (!customerCredit) {
        errors.push('Customer credit information not loaded');
      } else if (total > customerCredit.available_credit) {
        errors.push(`Credit limit exceeded. Available: ${formatCurrency(customerCredit.available_credit)}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const handlePayment = async () => {
    const validation = validatePayment();
    
    if (!validation.isValid) {
      validation.errors.forEach(error => message.error(error));
      return;
    }

    setProcessing(true);

    try {
      // Prepare sale data
      const saleData: SaleCreateRequest = {
        customer_id: customerId,
        customer_name: customerName || undefined,
        items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          discount_amount: item.discountAmount,
          notes: undefined
        })),
        payment_method: paymentMethod,
        amount_tendered: paymentMethod === 'cash' ? amountTendered : undefined,
        payment_reference: paymentMethod === 'card' ? cardReference : 
                          paymentMethod === 'mobile' ? `${mobileProvider}:${mobileReference}` : undefined,
        payment_notes: paymentNotes || undefined,
        is_customer_mode: isCustomerMode
      };

      // Process payment through API
      const response = await salesApi.createSale(saleData);
      
      if (response.success && response.data) {
        // Create receipt data from API response
        const receiptData = {
          id: response.data.receipt_number,
          timestamp: new Date(response.data.created_at),
          items,
          customer: isCustomerMode ? { id: customerId, name: customerName } : null,
          payment: {
            method: paymentMethod,
            amount: amountTendered,
            reference: paymentMethod === 'card' ? cardReference : 
                      paymentMethod === 'mobile' ? `${mobileProvider}:${mobileReference}` : undefined,
            change: change,
            notes: paymentNotes,
            provider: paymentMethod === 'mobile' ? mobileProvider : undefined
          },
          totals: {
            subtotal,
            discount: totalDiscount,
            total,
            itemCount
          },
          saleData: response.data
        };

        message.success('Payment processed successfully');
        onPaymentComplete(receiptData);
      } else {
        throw new Error(response.error || 'Failed to create sale');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      message.error('Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const renderPaymentMethodSelector = () => (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">
        {t('pos.paymentMethod', 'Payment Method')}:
      </label>
      <Select
        value={paymentMethod}
        onChange={setPaymentMethod}
        style={{ width: '100%' }}
        size="large"
        disabled={processing}
      >
        <Option value="cash">
          <Space>
            <DollarOutlined />
            {t('pos.cash', 'Cash')}
          </Space>
        </Option>
        <Option value="card">
          <Space>
            <CreditCardOutlined />
            {t('pos.card', 'Card Payment')}
          </Space>
        </Option>
        <Option value="mobile">
          <Space>
            <MobileOutlined />
            {t('pos.mobileMoney', 'Mobile Money')}
          </Space>
        </Option>
        {isCustomerMode && (
          <Option value="credit">
            <Space>
              <UserOutlined />
              {t('pos.credit', 'Customer Credit')}
            </Space>
          </Option>
        )}
      </Select>
    </div>
  );

  const renderCashPayment = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('pos.amountTendered', 'Amount Tendered')}:
        </label>
        <InputNumber
          value={amountTendered}
          onChange={(value) => setAmountTendered(value || 0)}
          min={0}
          precision={2}
          style={{ width: '100%' }}
          size="large"
          addonBefore="Rs."
          disabled={processing}
          status={amountTendered < total ? 'error' : ''}
        />
        {amountTendered < total && (
          <div className="text-red-500 text-xs mt-1">
            Insufficient amount. Need {formatCurrency(total - amountTendered)} more.
          </div>
        )}
      </div>

      {/* Quick Amount Buttons */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('pos.quickAmounts', 'Quick Amounts')}:
        </label>
        <Row gutter={[8, 8]}>
          {quickAmounts.map((amount) => (
            <Col span={12} key={amount}>
              <Button
                block
                onClick={() => setAmountTendered(amount)}
                type={amountTendered === amount ? 'primary' : 'default'}
                disabled={processing}
                size="small"
              >
                {formatCurrency(amount)}
              </Button>
            </Col>
          ))}
        </Row>
      </div>

      {/* Change Display */}
      <div className={`p-3 rounded ${change > 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
        <div className="flex justify-between items-center">
          <span className="font-medium">{t('pos.change', 'Change')}:</span>
          <span className={`text-lg font-bold ${change > 0 ? 'text-green-600' : 'text-gray-600'}`}>
            {formatCurrency(change)}
          </span>
        </div>
      </div>
    </div>
  );

  const renderCardPayment = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('pos.amount', 'Amount')}:
        </label>
        <InputNumber
          value={total}
          disabled
          precision={2}
          style={{ width: '100%' }}
          size="large"
          addonBefore="Rs."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          {t('pos.cardReference', 'Card Reference Number')}:
        </label>
        <Input
          value={cardReference}
          onChange={(e) => setCardReference(e.target.value)}
          placeholder={t('pos.enterCardReference', 'Enter card reference/approval number')}
          size="large"
          disabled={processing}
          status={cardReference.length > 0 && cardReference.length < 4 ? 'error' : ''}
        />
        <div className="text-xs text-gray-500 mt-1">
          Enter the approval code from the card terminal
        </div>
      </div>

      <Alert
        message="Card Payment Instructions"
        description="Process the card payment on your card terminal first, then enter the approval reference number above."
        type="info"
        showIcon
        className="text-xs"
      />
    </div>
  );

  const renderMobilePayment = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('pos.amount', 'Amount')}:
        </label>
        <InputNumber
          value={total}
          disabled
          precision={2}
          style={{ width: '100%' }}
          size="large"
          addonBefore="Rs."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          {t('pos.mobileProvider', 'Mobile Payment Provider')}:
        </label>
        <Select
          value={mobileProvider}
          onChange={setMobileProvider}
          placeholder="Select provider"
          style={{ width: '100%' }}
          size="large"
          disabled={processing}
        >
          <Option value="ezcash">{MOBILE_PROVIDERS.EZ_CASH}</Option>
          <Option value="mcash">{MOBILE_PROVIDERS.M_CASH}</Option>
          <Option value="other">{MOBILE_PROVIDERS.OTHER}</Option>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          {t('pos.mobileReference', 'Transaction Reference')}:
        </label>
        <Input
          value={mobileReference}
          onChange={(e) => setMobileReference(e.target.value)}
          placeholder={t('pos.enterMobileReference', 'Enter transaction reference number')}
          size="large"
          disabled={processing}
          status={mobileReference.length > 0 && mobileReference.length < 6 ? 'error' : ''}
        />
        <div className="text-xs text-gray-500 mt-1">
          Reference number from the mobile payment confirmation
        </div>
      </div>

      <Alert
        message="Mobile Payment Instructions"
        description="Customer should complete the mobile payment first, then provide the transaction reference number."
        type="info"
        showIcon
        className="text-xs"
      />
    </div>
  );

  const renderCreditPayment = () => (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50 rounded border border-blue-200">
        <div className="flex items-center space-x-2 mb-2">
          <UserOutlined className="text-blue-600" />
          <span className="font-medium">
            {customerName || t('pos.selectCustomer', 'Select Customer')}
          </span>
        </div>
        <div className="text-sm text-gray-600">
          {t('pos.creditSaleNote', 'This sale will be added to customer credit account')}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          {t('pos.creditAmount', 'Credit Amount')}:
        </label>
        <InputNumber
          value={total}
          disabled
          precision={2}
          style={{ width: '100%' }}
          size="large"
          addonBefore="Rs."
        />
      </div>

      {/* Credit Limit Information */}
      {loadingCredit ? (
        <div className="p-3 bg-gray-50 rounded text-center">
          <Spin size="small" />
          <span className="ml-2 text-sm">Loading credit information...</span>
        </div>
      ) : customerCredit ? (
        <div className="p-3 bg-gray-50 rounded">
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Credit Limit:</span>
              <span className="font-medium">{formatCurrency(customerCredit.credit_limit)}</span>
            </div>
            <div className="flex justify-between">
              <span>Current Balance:</span>
              <span className="font-medium text-orange-600">{formatCurrency(customerCredit.current_balance)}</span>
            </div>
            <div className="flex justify-between">
              <span>Available Credit:</span>
              <span className={`font-medium ${customerCredit.available_credit >= total ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(customerCredit.available_credit)}
              </span>
            </div>
            <Divider className="my-2" />
            <div className="flex justify-between">
              <span>After This Sale:</span>
              <span className={`font-medium ${customerCredit.available_credit >= total ? 'text-blue-600' : 'text-red-600'}`}>
                {formatCurrency(customerCredit.available_credit - total)}
              </span>
            </div>
            {customerCredit.days_overdue > 0 && (
              <>
                <Divider className="my-2" />
                <div className="text-red-600 text-xs">
                  <strong>Warning:</strong> Customer has {customerCredit.days_overdue} days overdue balance
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <Alert
          message="Credit Information Required"
          description="Please ensure customer is selected and credit information is loaded."
          type="warning"
          showIcon
        />
      )}

      {customerCredit && customerCredit.available_credit < total && (
        <Alert
          message="Credit Limit Exceeded"
          description={`This sale exceeds the available credit limit by ${formatCurrency(total - customerCredit.available_credit)}. Manager approval may be required.`}
          type="error"
          showIcon
        />
      )}
    </div>
  );

  const validation = validatePayment();

  return (
    <Modal
      title={
        <div className="flex items-center space-x-2">
          <CalculatorOutlined />
          <span>{t('pos.processPayment', 'Process Payment')}</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={600}
      footer={null}
      maskClosable={!processing}
      closable={!processing}
    >
      <Spin spinning={processing} tip="Processing payment...">
        <div className="space-y-4">
          {/* Sale Summary */}
          <Card size="small" className="bg-gray-50">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>{t('pos.items', 'Items')}:</span>
                <span className="font-medium">{itemCount}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('pos.subtotal', 'Subtotal')}:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>{t('pos.discount', 'Discount')}:</span>
                  <span>-{formatCurrency(totalDiscount)}</span>
                </div>
              )}
              <Divider className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>{t('pos.total', 'Total')}:</span>
                <span className="text-blue-600">{formatCurrency(total)}</span>
              </div>
            </div>
          </Card>

          {/* Payment Method Selection */}
          {renderPaymentMethodSelector()}

          {/* Payment Method Specific Forms */}
          {paymentMethod === 'cash' && renderCashPayment()}
          {paymentMethod === 'card' && renderCardPayment()}
          {paymentMethod === 'mobile' && renderMobilePayment()}
          {paymentMethod === 'credit' && renderCreditPayment()}

          {/* Payment Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('pos.notes', 'Notes')} ({t('common.optional', 'Optional')}):
            </label>
            <TextArea
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              placeholder={t('pos.enterPaymentNotes', 'Enter payment notes...')}
              rows={2}
              disabled={processing}
            />
          </div>

          {/* Validation Errors */}
          {!validation.isValid && (
            <Alert
              message="Payment Validation Errors"
              description={
                <ul className="list-disc list-inside">
                  {validation.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              }
              type="error"
              showIcon
            />
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-4">
            <Button
              size="large"
              onClick={onCancel}
              disabled={processing}
              icon={<CloseOutlined />}
            >
              {t('common.cancel', 'Cancel')}
            </Button>
            
            <Button
              type="primary"
              size="large"
              onClick={handlePayment}
              loading={processing}
              disabled={!validation.isValid}
              icon={<CheckCircleOutlined />}
              className="flex-1"
            >
              {processing 
                ? t('pos.processing', 'Processing...') 
                : `${t('pos.processPayment', 'Process Payment')} - ${formatCurrency(total)}`
              }
            </Button>
          </div>
        </div>
      </Spin>
    </Modal>
  );
};

export default PaymentModal;