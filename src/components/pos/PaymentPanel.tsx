/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                    Payment Panel                                                 │
 * │                                                                                                  │
 * │  Description: Payment processing interface with multiple payment methods,                       │
 * │               change calculation, and receipt generation for the POS system.                    │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  InputNumber,
  Select,
  Space,
  Divider,
  Row,
  Col,
  Tag,
  message,
  Modal,
  Input,
  List
} from 'antd';
import {
  DollarOutlined,
  CreditCardOutlined,
  MobileOutlined,
  UserOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
  CalculatorOutlined
} from '@ant-design/icons';
import { useTranslation } from '@/hooks/useTranslation';
import { CartItem } from '@/pages/POSPage';
import { salesApi, SaleCreateRequest } from '@/api/sales.api';

const { Option } = Select;
const { TextArea } = Input;

interface PaymentPanelProps {
  items: CartItem[];
  customerId?: number;
  customerName: string;
  isCustomerMode: boolean;
  showPayment: boolean;
  onPaymentComplete: () => void;
  onCancel: () => void;
}

type PaymentMethod = 'cash' | 'card' | 'mobile' | 'credit';

interface PaymentInfo {
  method: PaymentMethod;
  amount: number;
  reference?: string;
  notes?: string;
}

const PaymentPanel: React.FC<PaymentPanelProps> = ({
  items,
  customerId,
  customerName,
  isCustomerMode,
  showPayment,
  onPaymentComplete,
  onCancel
}) => {
  const { t, formatCurrency } = useTranslation();
  
  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amountTendered, setAmountTendered] = useState<number>(0);
  const [cardReference, setCardReference] = useState('');
  const [mobileReference, setMobileReference] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  
  // Receipt modal
  const [receiptModal, setReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

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
    setMobileReference('');
    setPaymentNotes('');
  }, [paymentMethod, total]);

  // Auto-set amount for non-cash payments
  useEffect(() => {
    if (paymentMethod !== 'cash') {
      setAmountTendered(total);
    }
  }, [paymentMethod, total]);

  const handlePayment = async () => {
    // Validation
    if (paymentMethod === 'cash' && amountTendered < total) {
      message.error('Insufficient amount tendered');
      return;
    }

    if (paymentMethod === 'card' && !cardReference.trim()) {
      message.error('Card reference number is required');
      return;
    }

    if (paymentMethod === 'mobile' && !mobileReference.trim()) {
      message.error('Mobile payment reference is required');
      return;
    }

    if (paymentMethod === 'credit' && !isCustomerMode) {
      message.error('Customer mode required for credit sales');
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
                          paymentMethod === 'mobile' ? mobileReference : undefined,
        payment_notes: paymentNotes || undefined,
        is_customer_mode: isCustomerMode
      };

      // Process payment through API
      const response = await salesApi.createSale(saleData);
      
      if (response.success && response.data) {
        // Create receipt data from API response
        const receipt = {
          id: response.data.receipt_number,
          timestamp: new Date(response.data.created_at),
          items,
          customer: isCustomerMode ? { id: customerId, name: customerName } : null,
          payment: {
            method: paymentMethod,
            amount: amountTendered,
            reference: paymentMethod === 'card' ? cardReference : 
                      paymentMethod === 'mobile' ? mobileReference : undefined,
            change: change,
            notes: paymentNotes
          },
          totals: {
            subtotal,
            discount: totalDiscount,
            total,
            itemCount
          },
          saleData: response.data
        };

        setReceiptData(receipt);
        setReceiptModal(true);
        
        message.success('Payment processed successfully');
      } else {
        throw new Error('Failed to create sale');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      message.error('Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleReceiptPrint = async () => {
    try {
      if (receiptData?.saleData?.id) {
        // Send to thermal printer via API
        const response = await salesApi.printReceipt(receiptData.saleData.id);
        if (response.success) {
          message.success('Receipt sent to printer');
        } else {
          message.warning('Receipt printed locally (printer not available)');
        }
      } else {
        message.warning('Receipt printed locally');
      }
    } catch (error) {
      console.error('Print error:', error);
      message.warning('Receipt printed locally (printer error)');
    }
    
    setReceiptModal(false);
    onPaymentComplete();
  };

  const handleReceiptSkip = () => {
    setReceiptModal(false);
    onPaymentComplete();
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
            {t('pos.card', 'Card')}
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
              {t('pos.credit', 'Credit')}
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
        />
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
              >
                {formatCurrency(amount)}
              </Button>
            </Col>
          ))}
        </Row>
      </div>

      {/* Change Display */}
      <div className="p-3 bg-green-50 rounded">
        <div className="flex justify-between items-center">
          <span className="font-medium">{t('pos.change', 'Change')}:</span>
          <span className="text-lg font-bold text-green-600">
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
          placeholder={t('pos.enterCardReference', 'Enter card reference number')}
          size="large"
        />
      </div>
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
          {t('pos.mobileReference', 'Mobile Payment Reference')}:
        </label>
        <Input
          value={mobileReference}
          onChange={(e) => setMobileReference(e.target.value)}
          placeholder={t('pos.enterMobileReference', 'Enter eZ Cash / mCash reference')}
          size="large"
        />
      </div>

      <div className="text-sm text-gray-600">
        <p>{t('pos.supportedMobilePayments', 'Supported: eZ Cash, mCash, and other mobile money services')}</p>
      </div>
    </div>
  );

  const renderCreditPayment = () => (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50 rounded">
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
    </div>
  );

  if (!showPayment) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <CalculatorOutlined style={{ fontSize: 48, marginBottom: 16 }} />
        <p>{t('pos.selectItemsForPayment', 'Select items and proceed to payment')}</p>
        <div className="mt-4 text-xs text-center">
          <p>{t('pos.paymentShortcuts', 'Payment Shortcuts:')}</p>
          <p>F12: {t('pos.instantCash', 'Instant Cash Sale')}</p>
          <p>F3: {t('pos.toggleCustomerMode', 'Toggle Customer Mode')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Sale Summary */}
      <Card size="small" className="mb-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>{t('pos.items', 'Items')}:</span>
            <span>{itemCount}</span>
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

      {/* Payment Form */}
      <div className="flex-1 overflow-auto">
        {renderPaymentMethodSelector()}

        {paymentMethod === 'cash' && renderCashPayment()}
        {paymentMethod === 'card' && renderCardPayment()}
        {paymentMethod === 'mobile' && renderMobilePayment()}
        {paymentMethod === 'credit' && renderCreditPayment()}

        {/* Payment Notes */}
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">
            {t('pos.notes', 'Notes')} ({t('common.optional', 'Optional')}):
          </label>
          <TextArea
            value={paymentNotes}
            onChange={(e) => setPaymentNotes(e.target.value)}
            placeholder={t('pos.enterPaymentNotes', 'Enter payment notes...')}
            rows={2}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 space-y-2">
        <Button
          type="primary"
          size="large"
          block
          icon={<CheckCircleOutlined />}
          onClick={handlePayment}
          loading={processing}
          disabled={
            (paymentMethod === 'cash' && amountTendered < total) ||
            (paymentMethod === 'card' && !cardReference.trim()) ||
            (paymentMethod === 'mobile' && !mobileReference.trim()) ||
            (paymentMethod === 'credit' && !isCustomerMode)
          }
        >
          {processing 
            ? t('pos.processing', 'Processing...') 
            : `${t('pos.processPayment', 'Process Payment')} - ${formatCurrency(total)}`
          }
        </Button>

        <Button size="large" block onClick={onCancel}>
          {t('common.cancel', 'Cancel')}
        </Button>
      </div>

      {/* Receipt Modal */}
      <Modal
        title={t('pos.paymentComplete', 'Payment Complete')}
        open={receiptModal}
        onCancel={handleReceiptSkip}
        footer={[
          <Button key="skip" onClick={handleReceiptSkip}>
            {t('pos.skipReceipt', 'Skip Receipt')}
          </Button>,
          <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={handleReceiptPrint}>
            {t('pos.printReceipt', 'Print Receipt')}
          </Button>
        ]}
        width={400}
      >
        {receiptData && (
          <div className="space-y-4">
            <div className="text-center">
              <CheckCircleOutlined className="text-green-500 text-4xl mb-2" />
              <h3 className="text-lg font-medium">
                {t('pos.paymentSuccessful', 'Payment Successful')}
              </h3>
            </div>

            <div className="bg-gray-50 p-3 rounded text-sm">
              <div className="flex justify-between mb-1">
                <span>{t('pos.receiptNumber', 'Receipt')}:</span>
                <span className="font-mono">{receiptData.id}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>{t('pos.paymentMethod', 'Method')}:</span>
                <span className="capitalize">{receiptData.payment.method}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>{t('pos.total', 'Total')}:</span>
                <span className="font-medium">{formatCurrency(receiptData.totals.total)}</span>
              </div>
              {receiptData.payment.change > 0 && (
                <div className="flex justify-between">
                  <span>{t('pos.change', 'Change')}:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(receiptData.payment.change)}
                  </span>
                </div>
              )}
            </div>

            <div className="text-xs text-gray-500 text-center">
              {t('pos.receiptPrintNote', 'Receipt will be printed on thermal printer')}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PaymentPanel;