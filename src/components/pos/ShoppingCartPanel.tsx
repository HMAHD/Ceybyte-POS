/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                  Shopping Cart Panel                                             │
 * │                                                                                                  │
 * │  Description: Shopping cart interface with quantity adjustment, price negotiation,              │
 * │               customer selection, and sale hold/retrieve functionality.                         │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect } from 'react';
import {
  List,
  Button,
  InputNumber,
  Space,
  Divider,
  Modal,
  Input,
  Select,
  Card,
  Tag,
  Tooltip,
  Popconfirm,
  Badge,
  message
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  UserOutlined,
  HolderOutlined,
  ReloadOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  MinusOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useTranslation } from '@/hooks/useTranslation';
import { CartItem, HeldSale } from '@/pages/POSPage';

const { Option } = Select;
const { TextArea } = Input;

interface ShoppingCartPanelProps {
  items: CartItem[];
  customerId?: number;
  customerName: string;
  isCustomerMode: boolean;
  heldSales: HeldSale[];
  onUpdateItem: (itemId: string, updates: Partial<CartItem>) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  onHoldSale: () => void;
  onRetrieveSale: (heldSale: HeldSale) => void;
  onProceedToPayment: () => void;
  onCustomerChange: (customerId?: number, customerName?: string) => void;
}

const ShoppingCartPanel: React.FC<ShoppingCartPanelProps> = ({
  items,
  customerId,
  customerName,
  isCustomerMode,
  heldSales,
  onUpdateItem,
  onRemoveItem,
  onClearCart,
  onHoldSale,
  onRetrieveSale,
  onProceedToPayment,
  onCustomerChange
}) => {
  const { t, formatCurrency } = useTranslation();
  
  // Modal states
  const [priceEditModal, setPriceEditModal] = useState<{
    visible: boolean;
    item?: CartItem;
    newPrice: number;
    discountAmount: number;
  }>({
    visible: false,
    newPrice: 0,
    discountAmount: 0
  });
  
  const [customerModal, setCustomerModal] = useState(false);
  const [heldSalesModal, setHeldSalesModal] = useState(false);
  const [tempCustomerName, setTempCustomerName] = useState('');

  // Listen for F5 keyboard shortcut to show held sales
  useEffect(() => {
    const handleShowHeldSales = () => {
      if (heldSales.length > 0) {
        setHeldSalesModal(true);
      }
    };

    document.addEventListener('showHeldSales', handleShowHeldSales);
    return () => document.removeEventListener('showHeldSales', handleShowHeldSales);
  }, [heldSales.length]);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.originalPrice), 0);
  const totalDiscount = items.reduce((sum, item) => sum + item.discountAmount, 0);
  const total = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      onRemoveItem(itemId);
      return;
    }
    
    const item = items.find(i => i.id === itemId);
    if (item) {
      onUpdateItem(itemId, { 
        quantity: newQuantity,
        lineTotal: newQuantity * item.unitPrice - item.discountAmount
      });
    }
  };

  const handlePriceEdit = (item: CartItem) => {
    setPriceEditModal({
      visible: true,
      item,
      newPrice: item.unitPrice,
      discountAmount: item.discountAmount
    });
  };

  const handlePriceUpdate = () => {
    const { item, newPrice, discountAmount } = priceEditModal;
    if (!item) return;

    // Validate minimum price if product has one
    if (item.product.min_selling_price && newPrice < item.product.min_selling_price) {
      message.error(`Minimum selling price is ${formatCurrency(item.product.min_selling_price)}`);
      return;
    }

    onUpdateItem(item.id, {
      unitPrice: newPrice,
      discountAmount,
      isNegotiated: newPrice !== item.originalPrice || discountAmount > 0,
      lineTotal: item.quantity * newPrice - discountAmount
    });

    setPriceEditModal({ visible: false, newPrice: 0, discountAmount: 0 });
    message.success('Price updated successfully');
  };

  const handleCustomerSelect = () => {
    // In a real implementation, this would open a customer search modal
    // For now, we'll use a simple input
    setTempCustomerName(customerName);
    setCustomerModal(true);
  };

  const handleCustomerSave = () => {
    onCustomerChange(undefined, tempCustomerName);
    setCustomerModal(false);
    message.success('Customer updated');
  };

  const renderCartItem = (item: CartItem) => (
    <List.Item key={item.id} className="px-0">
      <div className="w-full">
        {/* Product Info */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <div className="font-medium text-sm">{item.product.name_en}</div>
            {item.product.name_si && (
              <div className="text-xs text-gray-500">{item.product.name_si}</div>
            )}
            {item.isNegotiated && (
              <Tag color="orange" size="small">Negotiated</Tag>
            )}
          </div>
          
          <Tooltip title="Remove item">
            <Button
              type="text"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => onRemoveItem(item.id)}
            />
          </Tooltip>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Button
              size="small"
              icon={<MinusOutlined />}
              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
            />
            <InputNumber
              size="small"
              min={0}
              max={item.product.track_inventory ? item.product.current_stock : undefined}
              value={item.quantity}
              onChange={(value) => handleQuantityChange(item.id, value || 0)}
              style={{ width: 60 }}
            />
            <Button
              size="small"
              icon={<PlusOutlined />}
              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
            />
            <span className="text-xs text-gray-500">
              {item.product.unit_of_measure?.abbreviation}
            </span>
          </div>

          <Tooltip title="Edit price">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handlePriceEdit(item)}
              disabled={!item.product.is_negotiable && !isCustomerMode}
            />
          </Tooltip>
        </div>

        {/* Price Info */}
        <div className="flex justify-between items-center text-sm">
          <div>
            <span className="text-gray-600">
              {formatCurrency(item.unitPrice)} × {item.quantity}
            </span>
            {item.discountAmount > 0 && (
              <span className="text-red-500 ml-2">
                -{formatCurrency(item.discountAmount)}
              </span>
            )}
          </div>
          <div className="font-medium text-blue-600">
            {formatCurrency(item.lineTotal)}
          </div>
        </div>
      </div>
    </List.Item>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Customer Section */}
      {isCustomerMode && (
        <div className="mb-3 p-2 bg-blue-50 rounded">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UserOutlined className="text-blue-600" />
              <span className="text-sm font-medium">
                {customerName || t('pos.selectCustomer', 'Select Customer')}
              </span>
            </div>
            <Button size="small" onClick={handleCustomerSelect}>
              {customerName ? t('common.change', 'Change') : t('common.select', 'Select')}
            </Button>
          </div>
        </div>
      )}

      {/* Cart Items */}
      <div className="flex-1 overflow-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <ShoppingCartOutlined style={{ fontSize: 48, marginBottom: 16 }} />
            <p>{t('pos.emptyCart', 'Cart is empty')}</p>
            <p className="text-xs">{t('pos.addProductsToCart', 'Add products to start a sale')}</p>
          </div>
        ) : (
          <List
            dataSource={items}
            renderItem={renderCartItem}
            size="small"
            split={false}
          />
        )}
      </div>

      {/* Cart Summary */}
      {items.length > 0 && (
        <>
          <Divider className="my-3" />
          <div className="space-y-2 text-sm">
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
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>{t('pos.total', 'Total')}:</span>
              <span className="text-blue-600">{formatCurrency(total)}</span>
            </div>
          </div>
        </>
      )}

      {/* Action Buttons */}
      <div className="mt-4 space-y-2">
        <div className="flex space-x-2">
          <Button
            icon={<HolderOutlined />}
            onClick={onHoldSale}
            disabled={items.length === 0}
            className="flex-1"
          >
            {t('pos.hold', 'Hold')}
          </Button>
          
          <Tooltip title={`${heldSales.length} held sales`}>
            <Badge count={heldSales.length} size="small">
              <Button
                icon={<ReloadOutlined />}
                onClick={() => setHeldSalesModal(true)}
                disabled={heldSales.length === 0}
              />
            </Badge>
          </Tooltip>
        </div>

        <div className="flex space-x-2">
          <Popconfirm
            title="Clear all items from cart?"
            onConfirm={onClearCart}
            disabled={items.length === 0}
          >
            <Button danger className="flex-1" disabled={items.length === 0}>
              {t('pos.clear', 'Clear')}
            </Button>
          </Popconfirm>
          
          <Button
            type="primary"
            icon={<DollarOutlined />}
            onClick={onProceedToPayment}
            disabled={items.length === 0}
            className="flex-1"
          >
            {t('pos.pay', 'Pay')}
          </Button>
        </div>
      </div>

      {/* Price Edit Modal */}
      <Modal
        title={t('pos.editPrice', 'Edit Price')}
        open={priceEditModal.visible}
        onOk={handlePriceUpdate}
        onCancel={() => setPriceEditModal({ visible: false, newPrice: 0, discountAmount: 0 })}
        width={400}
      >
        {priceEditModal.item && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('pos.product', 'Product')}:
              </label>
              <div className="text-sm text-gray-600">
                {priceEditModal.item.product.name_en}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('pos.originalPrice', 'Original Price')}:
              </label>
              <div className="text-sm text-gray-600">
                {formatCurrency(priceEditModal.item.originalPrice)}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('pos.newPrice', 'New Price')}:
              </label>
              <InputNumber
                value={priceEditModal.newPrice}
                onChange={(value) => setPriceEditModal(prev => ({ ...prev, newPrice: value || 0 }))}
                min={priceEditModal.item.product.min_selling_price || 0}
                precision={2}
                style={{ width: '100%' }}
                addonBefore="Rs."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('pos.discountAmount', 'Discount Amount')}:
              </label>
              <InputNumber
                value={priceEditModal.discountAmount}
                onChange={(value) => setPriceEditModal(prev => ({ ...prev, discountAmount: value || 0 }))}
                min={0}
                precision={2}
                style={{ width: '100%' }}
                addonBefore="Rs."
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Customer Modal */}
      <Modal
        title={t('pos.selectCustomer', 'Select Customer')}
        open={customerModal}
        onOk={handleCustomerSave}
        onCancel={() => setCustomerModal(false)}
        width={400}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('pos.customerName', 'Customer Name')}:
            </label>
            <Input
              value={tempCustomerName}
              onChange={(e) => setTempCustomerName(e.target.value)}
              placeholder={t('pos.enterCustomerName', 'Enter customer name')}
            />
          </div>
          <div className="text-xs text-gray-500">
            {t('pos.customerSearchNote', 'In future versions, this will include customer search and selection.')}
          </div>
        </div>
      </Modal>

      {/* Held Sales Modal */}
      <Modal
        title={t('pos.heldSales', 'Held Sales')}
        open={heldSalesModal}
        onCancel={() => setHeldSalesModal(false)}
        footer={null}
        width={600}
      >
        <List
          dataSource={heldSales}
          renderItem={(heldSale) => (
            <List.Item
              actions={[
                <Button
                  type="primary"
                  size="small"
                  onClick={() => {
                    onRetrieveSale(heldSale);
                    setHeldSalesModal(false);
                  }}
                >
                  {t('pos.retrieve', 'Retrieve')}
                </Button>
              ]}
            >
              <div className="w-full">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium">
                      {heldSale.customerName || t('pos.walkInCustomer', 'Walk-in Customer')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {heldSale.items.length} items | {formatCurrency(
                        heldSale.items.reduce((sum, item) => sum + item.lineTotal, 0)
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {heldSale.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                {heldSale.notes && (
                  <div className="text-xs text-gray-600">{heldSale.notes}</div>
                )}
              </div>
            </List.Item>
          )}
          locale={{ emptyText: t('pos.noHeldSales', 'No held sales') }}
        />
      </Modal>

      {/* Keyboard Shortcuts Info */}
      <div className="mt-2 pt-2 border-t">
        <div className="text-xs text-gray-500 text-center">
          {t('pos.cartShortcuts', 'F4: Hold Sale | F5: Retrieve | F12: Instant Cash')}
        </div>
      </div>
    </div>
  );
};

export default ShoppingCartPanel;