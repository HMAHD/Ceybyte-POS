/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                    Core Sales Interface                                          │
 * │                                                                                                  │
 * │  Description: Main Point of Sale interface with three-column layout for product search,         │
 * │               shopping cart, and payment processing. Includes barcode scanning and shortcuts.   │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect, useRef } from 'react';
import { Layout, Row, Col, Card, message } from 'antd';
import { useTranslation } from '@/hooks/useTranslation';
import ProductSearchPanel from '@/components/pos/ProductSearchPanel';
import ShoppingCartPanel from '@/components/pos/ShoppingCartPanel';
import PaymentPanel from '@/components/pos/PaymentPanel';
import { ProductResponse } from '@/api/products.api';

const { Content } = Layout;

export interface CartItem {
  id: string;
  product: ProductResponse;
  quantity: number;
  unitPrice: number;
  originalPrice: number;
  discountAmount: number;
  lineTotal: number;
  isNegotiated: boolean;
}

export interface HeldSale {
  id: string;
  items: CartItem[];
  customerId?: number;
  customerName?: string;
  timestamp: Date;
  notes?: string;
}

const POSPage: React.FC = () => {
  const { t } = useTranslation();
  
  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerId, setCustomerId] = useState<number | undefined>();
  const [customerName, setCustomerName] = useState<string>('');
  const [isCustomerMode, setIsCustomerMode] = useState(false);
  
  // Held sales state
  const [heldSales, setHeldSales] = useState<HeldSale[]>([]);
  
  // UI state
  const [showPayment, setShowPayment] = useState(false);
  
  // Refs for keyboard shortcuts
  const productSearchRef = useRef<any>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // F12 - Instant cash sale
      if (event.key === 'F12') {
        event.preventDefault();
        handleInstantCashSale();
      }
      
      // F3 - Toggle customer mode
      if (event.key === 'F3') {
        event.preventDefault();
        toggleCustomerMode();
      }
      
      // F1 - Focus product search
      if (event.key === 'F1') {
        event.preventDefault();
        if (productSearchRef.current) {
          productSearchRef.current.focus();
        }
      }
      
      // F4 - Hold current sale
      if (event.key === 'F4') {
        event.preventDefault();
        handleHoldSale();
      }
      
      // F5 - Retrieve held sale (show held sales modal)
      if (event.key === 'F5') {
        event.preventDefault();
        if (heldSales.length > 0) {
          // Trigger held sales modal - this will be handled by the cart panel
          const event = new CustomEvent('showHeldSales');
          document.dispatchEvent(event);
        } else {
          message.info('No held sales to retrieve');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [cartItems, isCustomerMode]);

  const handleAddToCart = (product: ProductResponse, quantity: number = 1) => {
    const existingItemIndex = cartItems.findIndex(item => item.product.id === product.id);
    
    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...cartItems];
      const existingItem = updatedItems[existingItemIndex];
      existingItem.quantity += quantity;
      existingItem.lineTotal = existingItem.quantity * existingItem.unitPrice - existingItem.discountAmount;
      setCartItems(updatedItems);
    } else {
      // Add new item
      const newItem: CartItem = {
        id: `${product.id}-${Date.now()}`,
        product,
        quantity,
        unitPrice: product.selling_price,
        originalPrice: product.selling_price,
        discountAmount: 0,
        lineTotal: quantity * product.selling_price,
        isNegotiated: false
      };
      setCartItems([...cartItems, newItem]);
    }
    
    message.success(`${product.name_en} added to cart`);
  };

  const handleUpdateCartItem = (itemId: string, updates: Partial<CartItem>) => {
    setCartItems(items => 
      items.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              ...updates,
              lineTotal: (updates.quantity || item.quantity) * (updates.unitPrice || item.unitPrice) - (updates.discountAmount || item.discountAmount)
            }
          : item
      )
    );
  };

  const handleRemoveCartItem = (itemId: string) => {
    setCartItems(items => items.filter(item => item.id !== itemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
    setCustomerId(undefined);
    setCustomerName('');
    setShowPayment(false);
  };

  const handleHoldSale = () => {
    if (cartItems.length === 0) {
      message.warning('No items in cart to hold');
      return;
    }

    const heldSale: HeldSale = {
      id: `held-${Date.now()}`,
      items: [...cartItems],
      customerId,
      customerName,
      timestamp: new Date(),
      notes: `Held by ${t('common.user', 'User')} at ${new Date().toLocaleTimeString()}`
    };

    setHeldSales([...heldSales, heldSale]);
    handleClearCart();
    message.success('Sale held successfully');
  };

  const handleRetrieveSale = (heldSale: HeldSale) => {
    setCartItems(heldSale.items);
    setCustomerId(heldSale.customerId);
    setCustomerName(heldSale.customerName || '');
    
    // Remove from held sales
    setHeldSales(sales => sales.filter(sale => sale.id !== heldSale.id));
    message.success('Sale retrieved successfully');
  };

  const handleInstantCashSale = () => {
    if (cartItems.length === 0) {
      message.warning('No items in cart for instant sale');
      return;
    }
    
    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + item.lineTotal, 0);
    
    // Process instant cash payment
    message.success(`Instant cash sale completed: ${t('common.currency', 'Rs.')} ${total.toFixed(2)}`);
    
    // Clear cart after sale
    handleClearCart();
  };

  const toggleCustomerMode = () => {
    setIsCustomerMode(!isCustomerMode);
    message.info(`Customer mode ${!isCustomerMode ? 'enabled' : 'disabled'}`);
  };

  const handleProceedToPayment = () => {
    if (cartItems.length === 0) {
      message.warning('No items in cart');
      return;
    }
    setShowPayment(true);
  };

  const handlePaymentComplete = () => {
    message.success('Payment completed successfully');
    handleClearCart();
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Layout>
      <Content className="p-4 h-full">
        <Row gutter={16} className="h-full">
          {/* Product Search Panel - Left Column */}
          <Col span={8} className="h-full">
            <Card 
              title={t('pos.productSearch', 'Product Search')} 
              className="h-full"
              bodyStyle={{ height: 'calc(100% - 57px)', overflow: 'hidden' }}
            >
              <ProductSearchPanel
                ref={productSearchRef}
                onAddToCart={handleAddToCart}
                isCustomerMode={isCustomerMode}
              />
            </Card>
          </Col>

          {/* Shopping Cart Panel - Middle Column */}
          <Col span={8} className="h-full">
            <Card 
              title={
                <div className="flex justify-between items-center">
                  <span>{t('pos.shoppingCart', 'Shopping Cart')}</span>
                  <span className="text-sm font-normal">
                    {cartItemCount} {t('pos.items', 'items')} | {t('common.currency', 'Rs.')} {cartTotal.toFixed(2)}
                  </span>
                </div>
              }
              className="h-full"
              bodyStyle={{ height: 'calc(100% - 57px)', overflow: 'hidden' }}
            >
              <ShoppingCartPanel
                items={cartItems}
                customerId={customerId}
                customerName={customerName}
                isCustomerMode={isCustomerMode}
                heldSales={heldSales}
                onUpdateItem={handleUpdateCartItem}
                onRemoveItem={handleRemoveCartItem}
                onClearCart={handleClearCart}
                onHoldSale={handleHoldSale}
                onRetrieveSale={handleRetrieveSale}
                onProceedToPayment={handleProceedToPayment}
                onCustomerChange={(id, name) => {
                  setCustomerId(id);
                  setCustomerName(name || '');
                }}
              />
            </Card>
          </Col>

          {/* Payment Panel - Right Column */}
          <Col span={8} className="h-full">
            <Card 
              title={t('pos.payment', 'Payment')} 
              className="h-full"
              bodyStyle={{ height: 'calc(100% - 57px)', overflow: 'hidden' }}
            >
              <PaymentPanel
                items={cartItems}
                customerId={customerId}
                customerName={customerName}
                isCustomerMode={isCustomerMode}
                showPayment={showPayment}
                onPaymentComplete={handlePaymentComplete}
                onCancel={() => setShowPayment(false)}
                onCustomerChange={(id, name) => {
                  setCustomerId(id);
                  setCustomerName(name || '');
                }}
              />
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default POSPage;