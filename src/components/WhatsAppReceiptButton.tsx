/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                WhatsApp Receipt Button                                           │
 * │                                                                                                  │
 * │  Description: Button component to send receipts via WhatsApp                                    │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                  │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState } from 'react';
import { Button, message, Modal, Input } from 'antd';
import { MessageCircle } from 'lucide-react';
import { useWhatsApp } from '@/hooks/useWhatsApp';

interface WhatsAppReceiptButtonProps {
  saleId: number;
  customerPhone?: string;
  customerName?: string;
  size?: 'small' | 'middle' | 'large';
  type?: 'default' | 'primary' | 'text';
  disabled?: boolean;
}

export const WhatsAppReceiptButton: React.FC<WhatsAppReceiptButtonProps> = ({
  saleId,
  customerPhone,
  customerName,
  size = 'middle',
  type = 'default',
  disabled = false,
}) => {
  const { sendReceipt, isConfigured } = useWhatsApp();
  const [loading, setLoading] = useState(false);
  const [phoneModalVisible, setPhoneModalVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(customerPhone || '');

  const handleSendReceipt = async (phone?: string) => {
    try {
      setLoading(true);
      const response = await sendReceipt(saleId, phone);
      
      if (response.success) {
        message.success('Receipt sent via WhatsApp successfully!');
        setPhoneModalVisible(false);
      } else {
        message.error(response.error || 'Failed to send receipt');
      }
    } catch (error) {
      console.error('Error sending WhatsApp receipt:', error);
      message.error('Failed to send receipt via WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (!isConfigured) {
      message.warning('WhatsApp is not configured. Please configure WhatsApp integration first.');
      return;
    }

    if (customerPhone) {
      // Send directly if customer phone is available
      handleSendReceipt(customerPhone);
    } else {
      // Show phone input modal
      setPhoneModalVisible(true);
    }
  };

  const handlePhoneSubmit = () => {
    if (!phoneNumber.trim()) {
      message.error('Please enter a phone number');
      return;
    }
    handleSendReceipt(phoneNumber);
  };

  if (!isConfigured) {
    return null; // Don't show button if WhatsApp is not configured
  }

  return (
    <>
      <Button
        type={type}
        size={size}
        icon={<MessageCircle className="w-4 h-4" />}
        onClick={handleClick}
        loading={loading}
        disabled={disabled}
        className="text-green-600 border-green-600 hover:bg-green-50"
      >
        WhatsApp
      </Button>

      <Modal
        title="Send Receipt via WhatsApp"
        open={phoneModalVisible}
        onOk={handlePhoneSubmit}
        onCancel={() => setPhoneModalVisible(false)}
        confirmLoading={loading}
        okText="Send"
        cancelText="Cancel"
      >
        <div className="space-y-4">
          {customerName && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer
              </label>
              <div className="text-gray-900">{customerName}</div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <Input
              placeholder="Enter phone number (e.g., 94771234567)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              prefix="+94"
            />
            <div className="text-xs text-gray-500 mt-1">
              Enter phone number with country code (94 for Sri Lanka)
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};