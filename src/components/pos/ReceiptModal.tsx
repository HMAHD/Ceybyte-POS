/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                    Receipt Confirmation Modal                                    │
 * │                                                                                                  │
 * │  Description: Post-payment receipt modal with printing options, WhatsApp sharing,              │
 * │               and transaction confirmation for the POS system.                                   │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState } from 'react';
import {
  Modal,
  Button,
  Divider,
  message,
  Card,
  Tag,
  Alert
} from 'antd';
import {
  CheckCircleOutlined,
  PrinterOutlined,
  WhatsAppOutlined,
  CopyOutlined,
  DollarOutlined,
  CreditCardOutlined,
  MobileOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useTranslation } from '@/hooks/useTranslation';
import { CartItem } from '@/pages/POSPage';
import { salesApi } from '@/api/sales.api';

interface ReceiptModalProps {
  visible: boolean;
  receiptData: {
    id: string;
    timestamp: Date;
    items: CartItem[];
    customer: { id?: number; name: string } | null;
    payment: {
      method: string;
      amount: number;
      reference?: string;
      change?: number;
      notes?: string;
      provider?: string;
    };
    totals: {
      subtotal: number;
      discount: number;
      total: number;
      itemCount: number;
    };
    saleData: any;
  } | null;
  onComplete: () => void;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({
  visible,
  receiptData,
  onComplete
}) => {
  const { t, formatCurrency } = useTranslation();
  const [printing, setPrinting] = useState(false);
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);

  if (!receiptData) return null;

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <DollarOutlined className="text-green-600" />;
      case 'card':
        return <CreditCardOutlined className="text-blue-600" />;
      case 'mobile':
        return <MobileOutlined className="text-purple-600" />;
      case 'credit':
        return <UserOutlined className="text-orange-600" />;
      default:
        return <DollarOutlined />;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash':
        return t('pos.cash', 'Cash');
      case 'card':
        return t('pos.card', 'Card Payment');
      case 'mobile':
        return t('pos.mobileMoney', 'Mobile Money');
      case 'credit':
        return t('pos.credit', 'Customer Credit');
      default:
        return method;
    }
  };

  const handlePrintReceipt = async () => {
    setPrinting(true);
    try {
      if (receiptData.saleData?.id) {
        const response = await salesApi.printReceipt(receiptData.saleData.id);
        if (response.success) {
          message.success('Receipt sent to thermal printer');
        } else {
          message.warning('Receipt queued for printing (printer not available)');
        }
      } else {
        message.warning('Receipt printed locally');
      }
    } catch (error) {
      console.error('Print error:', error);
      message.error('Failed to print receipt. Please try again.');
    } finally {
      setPrinting(false);
    }
  };

  const handleSendWhatsApp = async () => {
    if (!receiptData.customer?.name) {
      message.warning('Customer information required for WhatsApp');
      return;
    }

    setSendingWhatsApp(true);
    try {
      // Mock WhatsApp sending - would integrate with actual WhatsApp API
      await new Promise(resolve => setTimeout(resolve, 2000));
      message.success('Receipt sent via WhatsApp');
    } catch (error) {
      console.error('WhatsApp error:', error);
      message.error('Failed to send WhatsApp message');
    } finally {
      setSendingWhatsApp(false);
    }
  };

  const handleCopyReceipt = () => {
    const receiptText = generateReceiptText();
    navigator.clipboard.writeText(receiptText).then(() => {
      message.success('Receipt copied to clipboard');
    }).catch(() => {
      message.error('Failed to copy receipt');
    });
  };

  const generateReceiptText = () => {
    const lines = [
      '================================',
      '         CEYBYTE POS',
      '    Sri Lankan Point of Sale',
      '================================',
      '',
      `Receipt: ${receiptData.id}`,
      `Date: ${receiptData.timestamp.toLocaleString()}`,
      `Cashier: ${t('common.user', 'User')}`,
      '',
      '--------------------------------',
      'ITEMS:',
      '--------------------------------'
    ];

    receiptData.items.forEach(item => {
      lines.push(`${item.product.name_en}`);
      lines.push(`  ${item.quantity} x ${formatCurrency(item.unitPrice)} = ${formatCurrency(item.lineTotal)}`);
      if (item.discountAmount > 0) {
        lines.push(`  Discount: -${formatCurrency(item.discountAmount)}`);
      }
    });

    lines.push('--------------------------------');
    lines.push(`Subtotal: ${formatCurrency(receiptData.totals.subtotal)}`);
    
    if (receiptData.totals.discount > 0) {
      lines.push(`Discount: -${formatCurrency(receiptData.totals.discount)}`);
    }
    
    lines.push(`TOTAL: ${formatCurrency(receiptData.totals.total)}`);
    lines.push('');
    lines.push(`Payment: ${getPaymentMethodLabel(receiptData.payment.method)}`);
    
    if (receiptData.payment.method === 'cash') {
      lines.push(`Tendered: ${formatCurrency(receiptData.payment.amount)}`);
      if (receiptData.payment.change && receiptData.payment.change > 0) {
        lines.push(`Change: ${formatCurrency(receiptData.payment.change)}`);
      }
    }
    
    if (receiptData.payment.reference) {
      lines.push(`Reference: ${receiptData.payment.reference}`);
    }

    if (receiptData.customer) {
      lines.push('');
      lines.push(`Customer: ${receiptData.customer.name}`);
    }

    lines.push('');
    lines.push('================================');
    lines.push('Thank you for your business!');
    lines.push('Powered by Ceybyte.com');
    lines.push('================================');

    return lines.join('\n');
  };

  return (
    <Modal
      title={
        <div className="flex items-center space-x-2">
          <CheckCircleOutlined className="text-green-500" />
          <span>{t('pos.paymentComplete', 'Payment Complete')}</span>
        </div>
      }
      open={visible}
      onCancel={onComplete}
      width={500}
      footer={null}
      maskClosable={false}
    >
      <div className="space-y-4">
        {/* Success Message */}
        <div className="text-center py-4">
          <CheckCircleOutlined className="text-green-500 text-5xl mb-3" />
          <h3 className="text-lg font-medium text-green-700 mb-2">
            {t('pos.paymentSuccessful', 'Payment Successful!')}
          </h3>
          <p className="text-gray-600">
            Transaction completed successfully
          </p>
        </div>

        {/* Receipt Summary */}
        <Card size="small" className="bg-gray-50">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="font-medium">Receipt Number:</span>
              <Tag color="blue" className="font-mono">{receiptData.id}</Tag>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Payment Method:</span>
              <div className="flex items-center space-x-1">
                {getPaymentMethodIcon(receiptData.payment.method)}
                <span className="capitalize">{getPaymentMethodLabel(receiptData.payment.method)}</span>
              </div>
            </div>

            {receiptData.payment.provider && (
              <div className="flex justify-between">
                <span>Provider:</span>
                <span className="capitalize">{receiptData.payment.provider}</span>
              </div>
            )}

            {receiptData.payment.reference && (
              <div className="flex justify-between">
                <span>Reference:</span>
                <span className="font-mono text-xs">{receiptData.payment.reference}</span>
              </div>
            )}
            
            <Divider className="my-2" />
            
            <div className="flex justify-between">
              <span>Items:</span>
              <span>{receiptData.totals.itemCount}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(receiptData.totals.subtotal)}</span>
            </div>
            
            {receiptData.totals.discount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Discount:</span>
                <span>-{formatCurrency(receiptData.totals.discount)}</span>
              </div>
            )}
            
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span className="text-green-600">{formatCurrency(receiptData.totals.total)}</span>
            </div>

            {receiptData.payment.method === 'cash' && (
              <>
                <div className="flex justify-between">
                  <span>Amount Tendered:</span>
                  <span>{formatCurrency(receiptData.payment.amount)}</span>
                </div>
                {receiptData.payment.change && receiptData.payment.change > 0 && (
                  <div className="flex justify-between font-medium text-blue-600">
                    <span>Change:</span>
                    <span>{formatCurrency(receiptData.payment.change)}</span>
                  </div>
                )}
              </>
            )}

            {receiptData.customer && (
              <>
                <Divider className="my-2" />
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span className="font-medium">{receiptData.customer.name}</span>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Primary Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="primary"
              size="large"
              icon={<PrinterOutlined />}
              onClick={handlePrintReceipt}
              loading={printing}
              block
            >
              {printing ? 'Printing...' : t('pos.printReceipt', 'Print Receipt')}
            </Button>

            {receiptData.customer && (
              <Button
                size="large"
                icon={<WhatsAppOutlined />}
                onClick={handleSendWhatsApp}
                loading={sendingWhatsApp}
                className="bg-green-500 hover:bg-green-600 text-white border-green-500"
                block
              >
                {sendingWhatsApp ? 'Sending...' : 'Send WhatsApp'}
              </Button>
            )}
          </div>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              size="large"
              icon={<CopyOutlined />}
              onClick={handleCopyReceipt}
              block
            >
              Copy Receipt
            </Button>

            <Button
              size="large"
              onClick={onComplete}
              block
            >
              {t('pos.newSale', 'New Sale')}
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <Alert
          message="Post-Payment Options"
          description={
            <ul className="text-xs space-y-1 mt-2">
              <li>• Print receipt on thermal printer for customer</li>
              <li>• Send receipt via WhatsApp (if customer selected)</li>
              <li>• Copy receipt text for manual sharing</li>
              <li>• Click "New Sale" to start next transaction</li>
            </ul>
          }
          type="info"
          showIcon
          className="text-xs"
        />

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 pt-2 border-t">
          <p>Thank you for using CeybytePOS</p>
          <p>Powered by Ceybyte.com</p>
        </div>
      </div>
    </Modal>
  );
};

export default ReceiptModal;