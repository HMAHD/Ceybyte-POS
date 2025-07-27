/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                  Category Manager Component                                      │
 * │                                                                                                  │
 * │  Description: Category management component with hierarchical tree structure.                   │
 * │               Supports add, edit, delete operations with parent-child relationships.           │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Tree,
  Button,
  Form,
  Input,
  Select,
  Switch,
  Space,
  message,
  Popconfirm,
  Card,
  Row,
  Col,
  InputNumber
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderOutlined,
  FolderOpenOutlined
} from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';
import { categoriesApi, CategoryResponse, CategoryCreateRequest, CategoryUpdateRequest } from '@/api/categories.api';

const { Option } = Select;

interface CategoryManagerProps {
  visible: boolean;
  onClose: () => void;
  onCategoryChange?: () => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({
  visible,
  onClose,
  onCategoryChange
}) => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const [, setLoading] = useState(false);
  const [] = useState<CategoryResponse | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadCategories();
    }
  }, [visible]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await categoriesApi.getCategoryTree();
      if (response.success && response.data) {
        setCategories(response.data);
        setTreeData(buildTreeData(response.data));
      } else {
        message.error('Failed to load categories');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      message.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const buildTreeData = (categories: CategoryResponse[]): DataNode[] => {
    return categories.map(category => ({
      title: (
        <div className="flex justify-between items-center">
          <span>
            {category.name_en}
            {category.product_count > 0 && (
              <span className="ml-2 text-gray-500">({category.product_count})</span>
            )}
          </span>
          <Space size="small">
            <Button
              type="text"
              size="small"
              icon={<PlusOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleAddSubcategory(category);
              }}
            />
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleEditCategory(category);
              }}
            />
            <Popconfirm
              title="Delete Category"
              description="Are you sure you want to delete this category?"
              onConfirm={(e) => {
                e?.stopPropagation();
                handleDeleteCategory(category);
              }}
              okText="Delete"
              cancelText="Cancel"
              disabled={category.product_count > 0 || category.children.length > 0}
            >
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                disabled={category.product_count > 0 || category.children.length > 0}
                onClick={(e) => e.stopPropagation()}
              />
            </Popconfirm>
          </Space>
        </div>
      ),
      key: category.id.toString(),
      icon: category.children.length > 0 ? <FolderOpenOutlined /> : <FolderOutlined />,
      children: category.children.length > 0 ? buildTreeData(category.children as CategoryResponse[]) : undefined,
    }));
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    form.resetFields();
    form.setFieldsValue({
      is_negotiable_default: false,
      sort_order: 0
    });
    setIsFormVisible(true);
  };

  const handleAddSubcategory = (parent: CategoryResponse) => {
    setEditingCategory(null);
    form.resetFields();
    form.setFieldsValue({
      parent_id: parent.id,
      is_negotiable_default: parent.is_negotiable_default,
      sort_order: 0
    });
    setIsFormVisible(true);
  };

  const handleEditCategory = (category: CategoryResponse) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name_en: category.name_en,
      name_si: category.name_si,
      name_ta: category.name_ta,
      parent_id: category.parent_id,
      sort_order: category.sort_order,
      is_negotiable_default: category.is_negotiable_default,
      icon: category.icon,
      color: category.color,
      description: category.description
    });
    setIsFormVisible(true);
  };

  const handleDeleteCategory = async (category: CategoryResponse) => {
    try {
      const response = await categoriesApi.deleteCategory(category.id);
      if (response.success) {
        message.success('Category deleted successfully');
        loadCategories();
        if (onCategoryChange) {
          onCategoryChange();
        }
      } else {
        message.error('Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      message.error('Failed to delete category');
    }
  };

  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      setFormLoading(true);

      const categoryData = {
        ...values,
        sort_order: parseInt(values.sort_order || 0)
      };

      let response;
      if (editingCategory) {
        response = await categoriesApi.updateCategory(editingCategory.id, categoryData as CategoryUpdateRequest);
      } else {
        response = await categoriesApi.createCategory(categoryData as CategoryCreateRequest);
      }

      if (response.success) {
        message.success(`Category ${editingCategory ? 'updated' : 'created'} successfully`);
        setIsFormVisible(false);
        loadCategories();
        if (onCategoryChange) {
          onCategoryChange();
        }
      } else {
        message.error(`Failed to ${editingCategory ? 'update' : 'create'} category`);
      }
    } catch (error) {
      console.error('Error saving category:', error);
      message.error(`Failed to ${editingCategory ? 'update' : 'create'} category`);
    } finally {
      setFormLoading(false);
    }
  };

  const getAllCategories = (categories: CategoryResponse[]): CategoryResponse[] => {
    let result: CategoryResponse[] = [];
    categories.forEach(category => {
      result.push(category);
      if (category.children.length > 0) {
        result = result.concat(getAllCategories(category.children as CategoryResponse[]));
      }
    });
    return result;
  };

  const allCategories = getAllCategories(categories);
  const availableParents = editingCategory 
    ? allCategories.filter(cat => cat.id !== editingCategory.id)
    : allCategories;

  return (
    <>
      <Modal
        title="Category Management"
        open={visible}
        onCancel={onClose}
        width={800}
        footer={[
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAddCategory}>
            Add Category
          </Button>,
          <Button key="close" onClick={onClose}>
            Close
          </Button>
        ]}
      >
        <Card>
          {treeData.length > 0 ? (
            <Tree
              treeData={treeData}
              defaultExpandAll
              showIcon
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              No categories found. Click "Add Category" to create your first category.
            </div>
          )}
        </Card>
      </Modal>

      <Modal
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
        open={isFormVisible}
        onOk={handleFormSubmit}
        onCancel={() => setIsFormVisible(false)}
        confirmLoading={formLoading}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            is_negotiable_default: false,
            sort_order: 0
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Category Name (English)"
                name="name_en"
                rules={[{ required: true, message: 'Please enter category name' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Category Name (Sinhala)" name="name_si">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Category Name (Tamil)" name="name_ta">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Parent Category" name="parent_id">
                <Select placeholder="Select parent category" allowClear>
                  {availableParents.map(cat => (
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
              <Form.Item label="Sort Order" name="sort_order">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Icon" name="icon">
                <Input placeholder="Icon name" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Color" name="color">
                <Input placeholder="#000000" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="is_negotiable_default" valuePropName="checked">
            <Switch /> Products in this category are negotiable by default
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CategoryManager;