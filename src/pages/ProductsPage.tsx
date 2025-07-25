/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                     Products Page                                               │
 * │                                                                                                  │
 * │  Description: Complete product management interface with grid/list view, search,                │
 * │               add/edit forms, category management, and barcode functionality.                   │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect } from 'react';
import {
  Layout,
  Card,
  Button,
  Input,
  Select,
  Table,
  Space,
  Modal,
  Form,
  InputNumber,
  Switch,
  message,
  Tooltip,
  Tag,
  Row,
  Col,
  Tabs,
  Alert
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BarcodeOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  ReloadOutlined,
  WarningOutlined,
  SettingOutlined,
  FolderOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import LocalizedText from '@/components/LocalizedText';
import BarcodeScanner from '@/components/BarcodeScanner';
import CategoryManager from '@/components/CategoryManager';
import UnitManager from '@/components/UnitManager';
import { useTranslation } from '@/hooks/useTranslation';
import { productsApi, ProductResponse, ProductCreateRequest, ProductUpdateRequest } from '@/api/products.api';
import { categoriesApi, CategoryResponse } from '@/api/categories.api';
import { unitsApi, UnitResponse } from '@/api/units.api';

const { Content } = Layout;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

type ViewMode = 'grid' | 'list';

const ProductsPage: React.FC = () => {
  const [form] = Form.useForm();

  // State management
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [units, setUnits] = useState<UnitResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  
  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [categoryManagerVisible, setCategoryManagerVisible] = useState(false);
  const [unitManagerVisible, setUnitManagerVisible] = useState(false);

  // Load initial data
  useEffect(() => {
    loadProducts();
    loadCategories();
    loadUnits();
  }, [searchText, selectedCategory, showLowStockOnly, showActiveOnly]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await productsApi.getProducts({
        search: searchText || undefined,
        category_id: selectedCategory,
        low_stock_only: showLowStockOnly,
        is_active: showActiveOnly,
        limit: 1000
      });

      if (response.success && response.data) {
        setProducts(response.data);
      } else {
        message.error('Failed to load products');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      message.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

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

  const loadUnits = async () => {
    try {
      const response = await unitsApi.getUnits();
      if (response.success && response.data) {
        setUnits(response.data);
      }
    } catch (error) {
      console.error('Error loading units:', error);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    form.resetFields();
    form.setFieldsValue({
      is_active: true,
      is_negotiable: false,
      is_service: false,
      track_inventory: true,
      allow_negative_stock: false,
      tax_inclusive: true,
      cost_price: 0,
      selling_price: 0,
      current_stock: 0,
      minimum_stock: 0,
      tax_rate: 0
    });
    setIsModalVisible(true);
  };

  const handleEditProduct = (product: ProductResponse) => {
    setEditingProduct(product);
    form.setFieldsValue({
      ...product,
      category_id: product.category?.id,
      unit_of_measure_id: product.unit_of_measure?.id
    });
    setIsModalVisible(true);
  };

  const handleDeleteProduct = async (product: ProductResponse) => {
    Modal.confirm({
      title: 'Delete Product',
      content: `Are you sure you want to delete "${product.name_en}"?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const response = await productsApi.deleteProduct(product.id);
          if (response.success) {
            message.success('Product deleted successfully');
            loadProducts();
          } else {
            message.error('Failed to delete product');
          }
        } catch (error) {
          console.error('Error deleting product:', error);
          message.error('Failed to delete product');
        }
      }
    });
  };

  const handleGenerateBarcode = async (product: ProductResponse) => {
    try {
      const response = await productsApi.generateBarcode(product.id);
      if (response.success && response.data) {
        message.success(`Barcode generated: ${response.data.barcode}`);
        loadProducts();
      } else {
        message.error('Failed to generate barcode');
      }
    } catch (error) {
      console.error('Error generating barcode:', error);
      message.error('Failed to generate barcode');
    }
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      setModalLoading(true);

      const productData = {
        ...values,
        cost_price: parseFloat(values.cost_price || 0),
        selling_price: parseFloat(values.selling_price || 0),
        wholesale_price: values.wholesale_price ? parseFloat(values.wholesale_price) : undefined,
        special_price: values.special_price ? parseFloat(values.special_price) : undefined,
        min_selling_price: values.min_selling_price ? parseFloat(values.min_selling_price) : undefined,
        markup_percentage: values.markup_percentage ? parseFloat(values.markup_percentage) : undefined,
        current_stock: parseFloat(values.current_stock || 0),
        minimum_stock: parseFloat(values.minimum_stock || 0),
        maximum_stock: values.maximum_stock ? parseFloat(values.maximum_stock) : undefined,
        reorder_level: values.reorder_level ? parseFloat(values.reorder_level) : undefined,
        tax_rate: parseFloat(values.tax_rate || 0)
      };

      let response;
      if (editingProduct) {
        response = await productsApi.updateProduct(editingProduct.id, productData as ProductUpdateRequest);
      } else {
        response = await productsApi.createProduct(productData as ProductCreateRequest);
      }

      if (response.success) {
        message.success(`Product ${editingProduct ? 'updated' : 'created'} successfully`);
        setIsModalVisible(false);
        loadProducts();
      } else {
        message.error(`Failed to ${editingProduct ? 'update' : 'create'} product`);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      message.error(`Failed to ${editingProduct ? 'update' : 'create'} product`);
    } finally {
      setModalLoading(false);
    }
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

  const columns: ColumnsType<ProductResponse> = [
    {
      title: 'Product Name',
      dataIndex: 'name_en',
      key: 'name_en',
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          {record.name_si && <div className="text-sm text-gray-500">{record.name_si}</div>}
          {record.name_ta && <div className="text-sm text-gray-500">{record.name_ta}</div>}
        </div>
      ),
    },
    {
      title: 'SKU/Barcode',
      key: 'codes',
      render: (_, record) => (
        <div>
          {record.sku && <div className="text-sm">SKU: {record.sku}</div>}
          {record.barcode && <div className="text-sm">Barcode: {record.barcode}</div>}
          {record.internal_code && <div className="text-sm">Code: {record.internal_code}</div>}
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: ['category', 'name_en'],
      key: 'category',
      render: (text) => text || '-',
    },
    {
      title: 'Price',
      key: 'price',
      render: (_, record) => (
        <div>
          <div className="font-medium">Rs. {record.selling_price.toFixed(2)}</div>
          <div className="text-sm text-gray-500">Cost: Rs. {record.cost_price.toFixed(2)}</div>
        </div>
      ),
    },
    {
      title: 'Stock',
      key: 'stock',
      render: (_, record) => (
        <div>
          <div>{record.current_stock} {record.unit_of_measure?.abbreviation}</div>
          {getStockStatus(record)}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit Product">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditProduct(record)}
            />
          </Tooltip>
          {!record.barcode && (
            <Tooltip title="Generate Barcode">
              <Button
                type="text"
                icon={<BarcodeOutlined />}
                onClick={() => handleGenerateBarcode(record)}
              />
            </Tooltip>
          )}
          <Tooltip title="Delete Product">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteProduct(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const lowStockProducts = products.filter(p => 
    p.track_inventory && p.current_stock <= p.minimum_stock
  );

  return (
    <Layout>
      <Content className="p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">
              <LocalizedText>Product Management</LocalizedText>
            </h1>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddProduct}
              >
                Add Product
              </Button>
              <Button
                icon={<FolderOutlined />}
                onClick={() => setCategoryManagerVisible(true)}
              >
                Categories
              </Button>
              <Button
                icon={<SettingOutlined />}
                onClick={() => setUnitManagerVisible(true)}
              >
                Units
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadProducts}
                loading={loading}
              >
                Refresh
              </Button>
            </Space>
          </div>

          {lowStockProducts.length > 0 && (
            <Alert
              message={`${lowStockProducts.length} products are low on stock`}
              type="warning"
              icon={<WarningOutlined />}
              showIcon
              closable
              className="mb-4"
            />
          )}

          <Card>
            <Row gutter={16} className="mb-4">
              <Col span={6}>
                <Search
                  placeholder="Search products..."
                  allowClear
                  onSearch={setSearchText}
                  onChange={(e) => !e.target.value && setSearchText('')}
                />
              </Col>
              <Col span={6}>
                <BarcodeScanner
                  placeholder="Scan barcode to find product..."
                  onProductFound={(product) => {
                    message.success(`Found: ${product.name_en}`);
                    // Optionally scroll to product in table or open edit modal
                  }}
                  autoFocus={false}
                />
              </Col>
              <Col span={3}>
                <Select
                  placeholder="Category"
                  allowClear
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  style={{ width: '100%' }}
                >
                  {categories.map(cat => (
                    <Option key={cat.id} value={cat.id}>
                      {cat.name_en}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col span={3}>
                <Space>
                  <Switch
                    checked={showLowStockOnly}
                    onChange={setShowLowStockOnly}
                  />
                  <span>Low Stock</span>
                </Space>
              </Col>
              <Col span={3}>
                <Space>
                  <Switch
                    checked={showActiveOnly}
                    onChange={setShowActiveOnly}
                  />
                  <span>Active</span>
                </Space>
              </Col>
              <Col span={3}>
                <Space>
                  <Button
                    type={viewMode === 'list' ? 'primary' : 'default'}
                    icon={<UnorderedListOutlined />}
                    onClick={() => setViewMode('list')}
                  />
                  <Button
                    type={viewMode === 'grid' ? 'primary' : 'default'}
                    icon={<AppstoreOutlined />}
                    onClick={() => setViewMode('grid')}
                  />
                </Space>
              </Col>
            </Row>

            <Table
              columns={columns}
              dataSource={products}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 50,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `Total ${total} products`
              }}
            />
          </Card>
        </div>

        <Modal
          title={editingProduct ? 'Edit Product' : 'Add New Product'}
          open={isModalVisible}
          onOk={handleModalSubmit}
          onCancel={() => setIsModalVisible(false)}
          confirmLoading={modalLoading}
          width={800}
          destroyOnClose
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              is_active: true,
              is_negotiable: false,
              is_service: false,
              track_inventory: true,
              allow_negative_stock: false,
              tax_inclusive: true
            }}
          >
            <Tabs defaultActiveKey="basic">
              <TabPane tab="Basic Info" key="basic">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Product Name (English)"
                      name="name_en"
                      rules={[{ required: true, message: 'Please enter product name' }]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Product Name (Sinhala)" name="name_si">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Product Name (Tamil)" name="name_ta">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Category" name="category_id">
                      <Select placeholder="Select category" allowClear>
                        {categories.map(cat => (
                          <Option key={cat.id} value={cat.id}>
                            {cat.name_en}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item label="SKU" name="sku">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Barcode" name="barcode">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Internal Code" name="internal_code">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item label="Description" name="description">
                  <Input.TextArea rows={3} />
                </Form.Item>
              </TabPane>

              <TabPane tab="Pricing" key="pricing">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Cost Price"
                      name="cost_price"
                      rules={[{ required: true, message: 'Please enter cost price' }]}
                    >
                      <InputNumber
                        min={0}
                        precision={2}
                        style={{ width: '100%' }}
                        addonBefore="Rs."
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Selling Price"
                      name="selling_price"
                      rules={[{ required: true, message: 'Please enter selling price' }]}
                    >
                      <InputNumber
                        min={0}
                        precision={2}
                        style={{ width: '100%' }}
                        addonBefore="Rs."
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Wholesale Price" name="wholesale_price">
                      <InputNumber
                        min={0}
                        precision={2}
                        style={{ width: '100%' }}
                        addonBefore="Rs."
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Special Price" name="special_price">
                      <InputNumber
                        min={0}
                        precision={2}
                        style={{ width: '100%' }}
                        addonBefore="Rs."
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Minimum Selling Price" name="min_selling_price">
                      <InputNumber
                        min={0}
                        precision={2}
                        style={{ width: '100%' }}
                        addonBefore="Rs."
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Tax Rate (%)" name="tax_rate">
                      <InputNumber
                        min={0}
                        max={100}
                        precision={2}
                        style={{ width: '100%' }}
                        addonAfter="%"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="is_negotiable" valuePropName="checked">
                      <Switch /> Price is negotiable
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="tax_inclusive" valuePropName="checked">
                      <Switch /> Tax inclusive pricing
                    </Form.Item>
                  </Col>
                </Row>
              </TabPane>

              <TabPane tab="Inventory" key="inventory">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Unit of Measure"
                      name="unit_of_measure_id"
                      rules={[{ required: true, message: 'Please select unit of measure' }]}
                    >
                      <Select placeholder="Select unit">
                        {units.map(unit => (
                          <Option key={unit.id} value={unit.id}>
                            {unit.name} ({unit.abbreviation})
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Current Stock" name="current_stock">
                      <InputNumber
                        min={0}
                        precision={3}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Minimum Stock" name="minimum_stock">
                      <InputNumber
                        min={0}
                        precision={3}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Maximum Stock" name="maximum_stock">
                      <InputNumber
                        min={0}
                        precision={3}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="track_inventory" valuePropName="checked">
                      <Switch /> Track inventory
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="allow_negative_stock" valuePropName="checked">
                      <Switch /> Allow negative stock
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="is_service" valuePropName="checked">
                      <Switch /> Service item (no inventory)
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="is_active" valuePropName="checked">
                      <Switch /> Active
                    </Form.Item>
                  </Col>
                </Row>
              </TabPane>
            </Tabs>
          </Form>
        </Modal>

        <CategoryManager
          visible={categoryManagerVisible}
          onClose={() => setCategoryManagerVisible(false)}
          onCategoryChange={loadCategories}
        />

        <UnitManager
          visible={unitManagerVisible}
          onClose={() => setUnitManagerVisible(false)}
          onUnitChange={loadUnits}
        />
      </Content>
    </Layout>
  );
};

export default ProductsPage;