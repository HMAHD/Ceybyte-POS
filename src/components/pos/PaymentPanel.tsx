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

import React, { useState } from 'react';
import {
  Button,
  message
} from 'antd';
import {
  CheckCircleOutlined,
  CalculatorOutlined
} from '@ant-design/icons';
import { useTranslation } from '@/hooks/useTranslation';
import { CartItem } from '@/pages/POSPage';
import PaymentModal from './PaymentModal';
import ReceiptModal from './ReceiptModal';
import CustomerSelector from './CustomerSelector';

interface PaymentPanelProps {
  items: CartItem[];
  customerId?: number;
  customerName: string;
  isCustomerMode: boolean;
  showPayment: boolean;
  onPaymentComplete: () => void;
  onCancel: () => void;
  onCustomerChange: (customerId: number | undefined, customerName: string) => void;
}

const PaymentPanel: React.FC<PaymentPanelProps> = ({
  items,
  customerId,
  customerName,
  isCustomerMode,
  showPayment,
  onPaymentComplete,
  onCancel,
  onCustomerChange
}) => {
  const { t, formatCurrency } = useTranslation();
  
  // Modal states
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [receiptModalVisible, setReceiptModalVisible] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  // Calculate totals
  const total = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleProceedToPayment = () => {
    if (items.length === 0) {
      message.warning('No items in cart');
      return;
    }
    setPaymentModalVisible(true);
  };

  const handlePaymentComplete = (receiptData: any) => {
    setPaymentModalVisible(false);
    setReceiptData(receiptData);
    setReceiptModalVisible(true);
  };

  const handleReceiptComplete = () => {
    setReceiptModalVisible(false);
    setReceiptData(null);
    onPaymentComplete();
  };

  return (
    <div className="h-full flex flex-col">
      {!showPayment ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <CalculatorOutlined style={{ fontSize: 48, marginBottom: 16 }} />
          <p>{t('pos.selectItemsForPayment', 'Select items and proceed to payment')}</p>
          <div className="mt-4 text-xs text-center">
            <p>{t('pos.paymentShortcuts', 'Payment Shortcuts:')}</p>
            <p>F12: {t('pos.instantCash', 'Instant Cash Sale')}</p>
            <p>F3: {t('pos.toggleCustomerMode', 'Toggle Customer Mode')}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Customer Selection */}
          {isCustomerMode && (
            <CustomerSelector
              value={customerId}
              onSelect={onCustomerChange}
              showCreditInfo={false}
            />
          )}

          {/* Sale Summary */}
          <div className="p-4 bg-gray-50 rounded">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>{t('pos.items', 'Items')}:</span>
                <span className="font-medium">{itemCount}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>{t('pos.total', 'Total')}:</span>
                <span className="text-blue-600">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              type="primary"
              size="large"
              block
              icon={<CheckCircleOutlined />}
              onClick={handleProceedToPayment}
              disabled={items.length === 0}
            >
              {t('pos.proceedToPayment', 'Proceed to Payment')} - {formatCurrency(total)}
            </Button>

            <Button size="large" block onClick={onCancel}>
              {t('common.cancel', 'Cancel')}
            </Button>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        visible={paymentModalVisible}
        items={items}
        customerId={customerId}
        customerName={customerName}
        isCustomerMode={isCustomerMode}
        onPaymentComplete={handlePaymentComplete}
        onCancel={() => setPaymentModalVisible(false)}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        visible={receiptModalVisible}
        receiptData={receiptData}
        onComplete={handleReceiptComplete}
      />
    </div>
  );
};

export default PaymentPanel;