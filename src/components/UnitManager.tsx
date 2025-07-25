/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                Unit of Measure Manager Component                                 │
 * │                                                                                                  │
 * │  Description: Unit of measure management with decimal precision settings.                        │
 * │               Supports various units like pieces, kg, liters with configurable decimals.       │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Table,
  Button,
  Form,
  Input,
  InputNumber,
  Switch,
  Space,
  message,
  Popconfirm,
  Card,
  Row,
  Col,
  Select,
  Tag,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { unitsApi, UnitResponse, UnitCreateRequest, UnitUpdateRequest } from '@/api/units.api';

const { Option } = Select;

interface UnitManagerProps {
  visible: boolean;
  onClose: () => void;
  onUnitChange?: () => void;
}

const UnitManager: React.FC<UnitManagerProps> = ({
  visible,
  onClose,
  onUnitChange
}) => {
  const [form] = Form.useForm();
  const [units, setUnits] = useState<UnitResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingUnit, setEditingUnit] = useState<UnitResponse | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadUnits();
    }
  }, [visible]);

  const loadUnits = async () => {
    setLoading(true);
    try {
      const response = await unitsApi.getUnits();
      if (response.success && response.data) {
        setUnits(response.data);
      } else {
        message.error('Failed to load units');
      }
    } catch (error) {
      console.error('Error loading units:', error);
      message.error('Failed to load units');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUnit = () => {
    setEditingUnit(null);
    form.resetFields();
    form.setFieldsValue({
      allow_decimals: true,
      decimal_places: 2,
      conversion_factor: 1.0
    });
    setIsFormVisible(true);
  };

  const handleEditUnit = (unit: UnitResponse) => {
    setEditingUnit(unit);
    form.setFieldsValue({
      name: unit.name,
      abbreviation: unit.abbreviation,
      allow_decimals: unit.allow_decimals,
      decimal_places: unit.decimal_places,
      base_unit_id: unit.base_unit_id,
      conversion_factor: unit.conversion_factor,
      symbol: unit.symbol
    });
    setIsFormVisible(true);
  };

  const handleDeleteUnit = async (unit: UnitResponse) => {
    try {
      const response = await unitsApi.deleteUnit(unit.id);
      if (response.success) {
        message.success('Unit deleted successfully');
        loadUnits();
        if (onUnitChange) {
          onUnitChange();
        }
      } else {
        message.error('Failed to delete unit');
      }
    } catch (error) {
      console.error('Error deleting unit:', error);
      message.error('Failed to delete unit');
    }
  };

  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      setFormLoading(true);

      const unitData = {
        ...values,
        decimal_places: parseInt(values.decimal_places || 2),
        conversion_factor: parseFloat(values.conversion_factor || 1.0)
      };

      let response;
      if (editingUnit) {
        response = await unitsApi.updateUnit(editingUnit.id, unitData as UnitUpdateRequest);
      } else {
        response = await unitsApi.createUnit(unitData as UnitCreateRequest);
      }

      if (response.success) {
        message.success(`Unit ${editingUnit ? 'updated' : 'created'} successfully`);
        setIsFormVisible(false);
        loadUnits();
        if (onUnitChange) {
          onUnitChange();
        }
      } else {
        message.error(`Failed to ${editingUnit ? 'update' : 'create'} unit`);
      }
    } catch (error) {
      console.error('Error saving unit:', error);
      message.error(`Failed to ${editingUnit ? 'update' : 'create'} unit`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleSeedDefaults = async () => {
    try {
      const response = await unitsApi.seedDefaultUnits();
      if (response.success) {
        message.success('Default units added successfully');
        loadUnits();
        if (onUnitChange) {
          onUnitChange();
        }
      } else {
        message.error('Failed to add default units');
      }
    } catch (error) {
      console.error('Error seeding units:', error);
      message.error('Failed to add default units');
    }
  };

  const columns: ColumnsType<UnitResponse> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-sm text-gray-500">
            {record.abbreviation} {record.symbol && `(${record.symbol})`}
          </div>
        </div>
      ),
    },
    {
      title: 'Decimal Settings',
      key: 'decimals',
      render: (_, record) => (
        <div>
          <Tag color={record.allow_decimals ? 'green' : 'red'}>
            {record.allow_decimals ? 'Decimals Allowed' : 'Whole Numbers Only'}
          </Tag>
          {record.allow_decimals && (
            <div className="text-sm text-gray-500 mt-1">
              {record.decimal_places} decimal places
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Base Unit',
      key: 'base_unit',
      render: (_, record) => (
        <div>
          {record.base_unit ? (
            <div>
              <div>{record.base_unit.name}</div>
              <div className="text-sm text-gray-500">
                Factor: {record.conversion_factor}
              </div>
            </div>
          ) : (
            <span className="text-gray-500">Base Unit</span>
          )}
        </div>
      ),
    },
    {
      title: 'Usage',
      dataIndex: 'product_count',
      key: 'product_count',
      render: (count) => (
        <Tag color={count > 0 ? 'blue' : 'default'}>
          {count} products
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit Unit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditUnit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Unit"
            description="Are you sure you want to delete this unit?"
            onConfirm={() => handleDeleteUnit(record)}
            okText="Delete"
            cancelText="Cancel"
            disabled={record.product_count > 0}
          >
            <Tooltip title={record.product_count > 0 ? "Cannot delete unit in use" : "Delete Unit"}>
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                disabled={record.product_count > 0}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Modal
        title="Unit of Measure Management"
        open={visible}
        onCancel={onClose}
        width={900}
        footer={[
          <Button key="seed" onClick={handleSeedDefaults}>
            Add Default Units
          </Button>,
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAddUnit}>
            Add Unit
          </Button>,
          <Button key="close" onClick={onClose}>
            Close
          </Button>
        ]}
      >
        <Card>
          <Table
            columns={columns}
            dataSource={units}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
              showQuickJumper: false
            }}
          />
        </Card>
      </Modal>

      <Modal
        title={editingUnit ? 'Edit Unit of Measure' : 'Add New Unit of Measure'}
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
            allow_decimals: true,
            decimal_places: 2,
            conversion_factor: 1.0
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Unit Name"
                name="name"
                rules={[{ required: true, message: 'Please enter unit name' }]}
              >
                <Input placeholder="e.g., Kilograms" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Abbreviation"
                name="abbreviation"
                rules={[
                  { required: true, message: 'Please enter abbreviation' },
                  { max: 10, message: 'Abbreviation must be 10 characters or less' }
                ]}
              >
                <Input placeholder="e.g., kg" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Symbol" name="symbol">
                <Input placeholder="e.g., kg (optional)" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Base Unit" name="base_unit_id">
                <Select placeholder="Select base unit (optional)" allowClear>
                  {units
                    .filter(unit => !editingUnit || unit.id !== editingUnit.id)
                    .map(unit => (
                      <Option key={unit.id} value={unit.id}>
                        {unit.name} ({unit.abbreviation})
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="allow_decimals" valuePropName="checked">
                <Switch /> Allow decimal quantities
                <Tooltip title="If enabled, products using this unit can have decimal quantities (e.g., 1.5 kg)">
                  <InfoCircleOutlined className="ml-2 text-gray-400" />
                </Tooltip>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Decimal Places"
                name="decimal_places"
                rules={[{ required: true, message: 'Please enter decimal places' }]}
              >
                <InputNumber
                  min={0}
                  max={6}
                  style={{ width: '100%' }}
                  disabled={!form.getFieldValue('allow_decimals')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Conversion Factor"
            name="conversion_factor"
            help="Factor to convert to base unit (e.g., 1000 for grams to kilograms)"
          >
            <InputNumber
              min={0.000001}
              precision={6}
              style={{ width: '100%' }}
              disabled={!form.getFieldValue('base_unit_id')}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default UnitManager;