/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                 Delivery Management Component                                     │
 * │                                                                                                  │
 * │  Description: Complete delivery management interface for three-wheeler and other delivery       │
 * │               services with driver tracking, route management, and status updates.              │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Table,
  Modal,
  Select,
  Button,
  Input,
  Form,
  Badge,
  Typography,
  Alert,
  Row,
  Col,
  message
} from 'antd';
import {
  TruckOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  UserOutlined,
  PackageOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  SearchOutlined,
  CalendarOutlined,
  NavigationOutlined
} from '@ant-design/icons';
import { formatCurrency } from '@/utils/formatting';
import {
  getDeliveries,
  createDelivery,
  updateDeliveryStatus,
  type Delivery
} from '@/api/sri-lankan-features.api';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface DeliveryFormData {
  sale_id: number;
  customer_id: number;
  scheduled_date: string;
  delivery_address: string;
  delivery_area?: string;
  delivery_village?: string;
  contact_person?: string;
  contact_phone?: string;
  driver_name?: string;
  driver_phone?: string;
  vehicle_number?: string;
  vehicle_type?: string;
  delivery_fee?: number;
  special_instructions?: string;
}

const DeliveryManagement: React.FC = () => {
  const { t } = useTranslation();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form] = Form.useForm();

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'dispatched', label: 'Dispatched' },
    { value: 'in_transit', label: 'In Transit' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'failed', label: 'Failed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const vehicleTypes = [
    { value: 'three_wheeler', label: 'Three Wheeler' },
    { value: 'motorcycle', label: 'Motorcycle' },
    { value: 'van', label: 'Van' },
    { value: 'truck', label: 'Truck' },
  ];

  useEffect(() => {
    loadDeliveries();
  }, [selectedStatus, selectedArea]);

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedStatus !== 'all') params.status = selectedStatus;
      if (selectedArea !== 'all') params.area = selectedArea;

      const response = await getDeliveries(params);
      if (response.success && response.data) {
        setDeliveries(response.data);
      } else {
        setError(response.error || 'Failed to load deliveries');
      }
    } catch (err) {
      setError('Network error while loading deliveries');
      console.error('Error loading deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDelivery = async (values: DeliveryFormData) => {
    try {
      const response = await createDelivery(values);
      if (response.success) {
        setShowCreateModal(false);
        form.resetFields();
        loadDeliveries();
        message.success('Delivery created successfully!');
      } else {
        setError(response.error || 'Failed to create delivery');
      }
    } catch (err) {
      setError('Network error while creating delivery');
      console.error('Error creating delivery:', err);
    }
  };

  const handleStatusUpdate = async (deliveryId: number, newStatus: string) => {
    try {
      const response = await updateDeliveryStatus(deliveryId, newStatus);
      if (response.success) {
        loadDeliveries();
        message.success('Delivery status updated successfully!');
      } else {
        setError(response.error || 'Failed to update delivery status');
      }
    } catch (err) {
      setError('Network error while updating delivery status');
      console.error('Error updating delivery status:', err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <ClockCircleOutlined />;
      case 'dispatched':
        return <TruckOutlined />;
      case 'in_transit':
        return <NavigationOutlined />;
      case 'delivered':
        return <CheckCircleOutlined />;
      case 'failed':
        return <CloseCircleOutlined />;
      case 'cancelled':
        return <ExclamationCircleOutlined />;
      default:
        return <PackageOutlined />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'default';
      case 'dispatched':
        return 'processing';
      case 'in_transit':
        return 'warning';
      case 'delivered':
        return 'success';
      case 'failed':
        return 'error';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredDeliveries = deliveries.filter(delivery =>
    delivery.delivery_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery.delivery_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (delivery.driver_name && delivery.driver_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const uniqueAreas = Array.from(new Set(deliveries.map(d => d.delivery_area).filter(Boolean)));

  const columns = [
    {
      title: 'Delivery Number',
      dataIndex: 'delivery_number',
      key: 'delivery_number',
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: 'Scheduled Date',
      dataIndex: 'scheduled_date',
      key: 'scheduled_date',
      render: (date: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalendarOutlined style={{ color: '#666' }} />
          {date}
        </div>
      )
    },
    {
      title: 'Address',
      dataIndex: 'delivery_address',
      key: 'delivery_address',
      render: (address: string, record: Delivery) => (
        <div style={{ maxWidth: '200px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <EnvironmentOutlined style={{ color: '#666', marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '14px' }}>{address}</div>
              {record.delivery_area && (
                <div style={{ fontSize: '12px', color: '#666' }}>{record.delivery_area}</div>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Driver',
      key: 'driver',
      render: (record: Delivery) => (
        record.driver_name ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserOutlined style={{ color: '#666' }} />
              {record.driver_name}
            </div>
            {record.driver_phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#666', marginTop: '4px' }}>
                <PhoneOutlined />
                {record.driver_phone}
              </div>
            )}
          </div>
        ) : (
          <Text type="secondary">No driver assigned</Text>
        )
      )
    },
    {
      title: 'Vehicle',
      dataIndex: 'vehicle_number',
      key: 'vehicle_number',
      render: (vehicle: string) => (
        <Text>{vehicle || 'Not specified'}</Text>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge 
          status={getStatusColor(status) as any}
          text={
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {getStatusIcon(status)}
              {status.replace('_', ' ').toUpperCase()}
            </span>
          }
        />
      )
    },
    {
      title: 'Fee',
      dataIndex: 'delivery_fee',
      key: 'delivery_fee',
      render: (fee: number) => formatCurrency(fee)
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Delivery) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          {record.status === 'scheduled' && (
            <Button
              size="small"
              type="primary"
              onClick={() => handleStatusUpdate(record.id, 'dispatched')}
            >
              Dispatch
            </Button>
          )}
          {record.status === 'dispatched' && (
            <Button
              size="small"
              type="primary"
              onClick={() => handleStatusUpdate(record.id, 'delivered')}
            >
              Mark Delivered
            </Button>
          )}
          {record.status === 'in_transit' && (
            <Button
              size="small"
              type="primary"
              onClick={() => handleStatusUpdate(record.id, 'delivered')}
            >
              Mark Delivered
            </Button>
          )}
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '256px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '16px' }}>Loading...</div>
          <Text type="secondary">Loading deliveries...</Text>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Delivery Management</Title>
          <Text type="secondary">Track and manage delivery operations</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowCreateModal(true)}>
          Create Delivery
        </Button>
      </div>

      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={16} align="middle">
          <Col flex="1">
            <Input
              placeholder="Search deliveries..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Col>
          <Col>
            <Select value={selectedStatus} onChange={setSelectedStatus} style={{ width: 150 }}>
              {statusOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Select value={selectedArea} onChange={setSelectedArea} style={{ width: 150 }}>
              <Option value="all">All Areas</Option>
              {uniqueAreas.map((area) => (
                <Option key={area} value={area}>
                  {area}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: '24px' }}
        />
      )}

      <Card title={<><TruckOutlined /> Deliveries ({filteredDeliveries.length})</>}>
        <Table
          columns={columns}
          dataSource={filteredDeliveries}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'No deliveries found' }}
        />
      </Card>

      <Modal
        title="Create New Delivery"
        open={showCreateModal}
        onCancel={() => setShowCreateModal(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateDelivery}
          initialValues={{
            scheduled_date: new Date().toISOString().split('T')[0],
            vehicle_type: 'three_wheeler',
            delivery_fee: 0,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Sale ID"
                name="sale_id"
                rules={[{ required: true, message: 'Please enter sale ID' }]}
              >
                <Input type="number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Customer ID"
                name="customer_id"
                rules={[{ required: true, message: 'Please enter customer ID' }]}
              >
                <Input type="number" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Scheduled Date"
                name="scheduled_date"
                rules={[{ required: true, message: 'Please select date' }]}
              >
                <Input type="date" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Vehicle Type"
                name="vehicle_type"
              >
                <Select>
                  {vehicleTypes.map((type) => (
                    <Option key={type.value} value={type.value}>
                      {type.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Delivery Address"
            name="delivery_address"
            rules={[{ required: true, message: 'Please enter delivery address' }]}
          >
            <TextArea rows={2} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Area" name="delivery_area">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Village" name="delivery_village">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Contact Person" name="contact_person">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Contact Phone" name="contact_phone">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Driver Name" name="driver_name">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Driver Phone" name="driver_phone">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Vehicle Number" name="vehicle_number">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Delivery Fee" name="delivery_fee">
                <Input type="number" step="0.01" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Special Instructions" name="special_instructions">
            <TextArea rows={2} />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Create Delivery
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default DeliveryManagement;