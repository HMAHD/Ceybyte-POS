/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                  Product Search Panel                                            │
 * │                                                                                                  │
 * │  Description: Product search interface with category filters, recent products,                  │
 * │               and barcode scanning for the POS system.                                          │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { 
  Input, 
  Select, 
  Button, 
  List, 
  Space, 
  Tag, 
  Tabs, 
  message,
  Badge,
  Tooltip
} from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  BarcodeOutlined,
  AppstoreOutlined,
  HistoryOutlined,
  FilterOutlined
} from '@ant-design/icons';
import BarcodeScanner from '@/components/BarcodeScanner';
import { useTranslation } from '@/hooks/useTranslation';
import { ProductResponse, productsApi } from '@/api/products.api';
import { CategoryResponse, categoriesApi } from '@/api/categories.api';

const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface ProductSearchPanelProps {
  onAddToCart: (product: ProductResponse, quantity?: number) => void;
  isCustomerMode: boolean;
}

interface RecentProduct {
  product: ProductResponse;
  lastUsed: Date;
  useCount: number;
}

const ProductSearchPanel = forwardRef<any, ProductSearchPanelProps>(
  ({ onAddToCart }, ref) => {
    const { t, formatCurrency } = useTranslation();
    
    // State
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
    const [activeTab, setActiveTab] = useState('search');
    
    // Load initial data
    useEffect(() => {
      loadCategories();
      loadRecentProducts();
      searchProducts();
    }, []);

    // Search when filters change
    useEffect(() => {
      searchProducts();
    }, [searchText, selectedCategory]);

    useImperativeHandle(ref, () => ({
      focus: () => {
        // Focus the search input
        const searchInput = document.querySelector('.product-search-input input') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    }));

    const loadCategories = async () => {
      try {
        const response = await categoriesApi.getCategories();
        if (response.success && response.data) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    const loadRecentProducts = () => {
      const stored = localStorage.getItem('ceybyte-pos-recent-products');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setRecentProducts(parsed.map((item: any) => ({
            ...item,
            lastUsed: new Date(item.lastUsed)
          })));
        } catch (error) {
          console.error('Error loading recent products:', error);
        }
      }
    };

    const saveRecentProducts = (products: RecentProduct[]) => {
      localStorage.setItem('ceybyte-pos-recent-products', JSON.stringify(products));
    };

    const searchProducts = async () => {
      setLoading(true);
      try {
        const response = await productsApi.getProducts({
          search: searchText || undefined,
          category_id: selectedCategory,
          is_active: true,
          limit: 50
        });

        if (response.success && response.data) {
          setProducts(response.data);
        } else {
          message.error('Failed to load products');
        }
      } catch (error) {
        console.error('Error searching products:', error);
        message.error('Failed to search products');
      } finally {
        setLoading(false);
      }
    };

    const handleProductSelect = (product: ProductResponse) => {
      // Add to recent products
      const existingIndex = recentProducts.findIndex(rp => rp.product.id === product.id);
      let updatedRecent: RecentProduct[];
      
      if (existingIndex >= 0) {
        // Update existing
        updatedRecent = [...recentProducts];
        updatedRecent[existingIndex] = {
          ...updatedRecent[existingIndex],
          lastUsed: new Date(),
          useCount: updatedRecent[existingIndex].useCount + 1
        };
      } else {
        // Add new
        const newRecent: RecentProduct = {
          product,
          lastUsed: new Date(),
          useCount: 1
        };
        updatedRecent = [newRecent, ...recentProducts];
      }
      
      // Keep only top 20 recent products
      updatedRecent = updatedRecent
        .sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime())
        .slice(0, 20);
      
      setRecentProducts(updatedRecent);
      saveRecentProducts(updatedRecent);
      
      // Add to cart
      onAddToCart(product);
    };

    const handleBarcodeScanned = (product: ProductResponse) => {
      handleProductSelect(product);
      setActiveTab('search'); // Switch back to search tab
    };

    const getStockStatus = (product: ProductResponse) => {
      if (!product.track_inventory) return null;
      
      if (product.current_stock <= 0) {
        return <Tag color="red">Out of Stock</Tag>;
      } else if (product.current_stock <= product.minimum_stock) {
        return <Tag color="orange">Low Stock</Tag>;
      }
      return <Tag color="green">In Stock</Tag>;
    };

    const renderProductItem = (product: ProductResponse) => (
      <List.Item
        key={product.id}
        className="cursor-pointer hover:bg-gray-50 p-2 rounded"
        onClick={() => handleProductSelect(product)}
      >
        <div className="w-full">
          <div className="flex justify-between items-start mb-1">
            <div className="flex-1">
              <div className="font-medium text-sm">{product.name_en}</div>
              {product.name_si && (
                <div className="text-xs text-gray-500">{product.name_si}</div>
              )}
              {product.name_ta && (
                <div className="text-xs text-gray-500">{product.name_ta}</div>
              )}
            </div>
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleProductSelect(product);
              }}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm">
              <span className="font-medium text-blue-600">
                {formatCurrency(product.selling_price)}
              </span>
              {product.is_negotiable && (
                <Tag color="orange" className="ml-1">Negotiable</Tag>
              )}
            </div>
            <div className="flex items-center space-x-1">
              {getStockStatus(product)}
              {product.track_inventory && (
                <span className="text-xs text-gray-500">
                  {product.current_stock} {product.unit_of_measure?.abbreviation}
                </span>
              )}
            </div>
          </div>
          
          {product.barcode && (
            <div className="text-xs text-gray-400 mt-1">
              <BarcodeOutlined /> {product.barcode}
            </div>
          )}
        </div>
      </List.Item>
    );

    return (
      <div className="h-full flex flex-col">
        {/* Search Controls */}
        <div className="mb-4 space-y-2">
          <Search
            className="product-search-input"
            placeholder={t('pos.searchProducts', 'Search products...')}
            allowClear
            onSearch={setSearchText}
            onChange={(e) => !e.target.value && setSearchText('')}
            prefix={<SearchOutlined />}
          />
          
          <BarcodeScanner
            placeholder={t('pos.scanBarcode', 'Scan barcode...')}
            onProductFound={handleBarcodeScanned}
            autoFocus={false}
          />
          
          <div className="flex space-x-2">
            <Select
              placeholder={t('pos.selectCategory', 'Category')}
              allowClear
              value={selectedCategory}
              onChange={setSelectedCategory}
              style={{ flex: 1 }}
              size="small"
            >
              {categories.map(cat => (
                <Option key={cat.id} value={cat.id}>
                  {cat.name_en}
                </Option>
              ))}
            </Select>
            
            <Tooltip title={t('pos.clearFilters', 'Clear filters')}>
              <Button
                size="small"
                icon={<FilterOutlined />}
                onClick={() => {
                  setSearchText('');
                  setSelectedCategory(undefined);
                }}
              />
            </Tooltip>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="flex-1 overflow-hidden">
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            size="small"
            className="h-full"
          >
            <TabPane 
              tab={
                <span>
                  <AppstoreOutlined />
                  {t('pos.products', 'Products')}
                  {products.length > 0 && (
                    <Badge count={products.length} size="small" className="ml-1" />
                  )}
                </span>
              } 
              key="search"
            >
              <div className="h-full overflow-auto">
                <List
                  dataSource={products}
                  loading={loading}
                  renderItem={renderProductItem}
                  size="small"
                  locale={{ emptyText: t('pos.noProductsFound', 'No products found') }}
                />
              </div>
            </TabPane>
            
            <TabPane 
              tab={
                <span>
                  <HistoryOutlined />
                  {t('pos.recent', 'Recent')}
                  {recentProducts.length > 0 && (
                    <Badge count={recentProducts.length} size="small" className="ml-1" />
                  )}
                </span>
              } 
              key="recent"
            >
              <div className="h-full overflow-auto">
                <List
                  dataSource={recentProducts}
                  renderItem={(recentProduct) => renderProductItem(recentProduct.product)}
                  size="small"
                  locale={{ emptyText: t('pos.noRecentProducts', 'No recent products') }}
                />
              </div>
            </TabPane>
          </Tabs>
        </div>

        {/* Quick Actions */}
        <div className="mt-2 pt-2 border-t">
          <Space size="small" className="w-full justify-center">
            <span className="text-xs text-gray-500">
              {t('pos.shortcuts', 'F1: Focus Search | F3: Customer Mode')}
            </span>
          </Space>
        </div>
      </div>
    );
  }
);

ProductSearchPanel.displayName = 'ProductSearchPanel';

export default ProductSearchPanel;