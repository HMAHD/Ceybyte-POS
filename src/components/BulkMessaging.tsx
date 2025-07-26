/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                   Bulk Messaging Component                                       │
 * │                                                                                                  │
 * │  Description: WhatsApp bulk messaging with area/village filtering                               │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                  │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  Button, 
  Table, 
  message, 
  Modal,
  Statistic,
  Row,
  Col
} from 'antd';
import { MessageCircle, Send, Users, Filter } from 'lucide-react';
import { whatsappApi } from '@/api/whatsapp.api';

const { TextArea } = Input;
const { Option } = Select;

interface Customer {
  id: number;
  name: string;
  phone: string;
  area: string;
  village: string;
  credit_balance: number;
}

export const BulkMessaging: React.FC = () => {
  useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [villages, setVillages] = useState<string[]>([]);
  const [selectedArea, setSelectedArea] = useState<string | undefined>();
  const [selectedVillage, setSelectedVillage] = useState<string | undefined>();
  const [previewVisible, setPreviewVisible] = useState(false);

  useEffect(() => {
    loadAreas();
    loadCustomers();
  }, []);

  useEffect(() => {
    if (selectedArea) {
      loadVillages(selectedArea);
    } else {
      setVillages([]);
      setSelectedVillage(undefined);
    }
  }, [selectedArea]);

  useEffect(() => {
    loadCustomers();
  }, [selectedArea, selectedVillage]);

  const loadAreas = async () => {
    try {
      const response = await whatsappApi.getAreas();
      if (response.success) {
        setAreas(response.data || []);
      }
    } catch (error) {
      console.error('Error loading areas:', error);
    }
  };

  const loadVillages = async (area: string) => {
    try {
      const response = await whatsappApi.getVillages(area);
      if (response.success) {
        setVillages(response.data || []);
      }
    } catch (error) {
      console.error('Error loading villages:', error);
    }
  };

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await whatsappApi.getCustomersWithWhatsApp(selectedArea, selectedVillage);
      
      if (response.success) {
        setCustomers(response.data || []);
      } else {
        message.error(response.error || 'Failed to load customers');
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      message.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleAreaChange = (area: string | undefined) => {
    setSelectedArea(area);
    setSelectedVillage(undefined);
    form.setFieldValue('village_filter', undefined);
  };

  const handleSendMessage = async (values: any) => {
    try {
      if (!values.message?.trim()) {
        message.error('Please enter a message');
        return;
      }

      if (customers.length === 0) {
        message.error('No customers found with the current filters');
        return;
      }

      const confirmed = await new Promise((resolve) => {
        Modal.confirm({
          title: 'Send Bulk Message',
          content: `Are you sure you want to send this message to ${customers.length} customers?`,
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
        });
      });

      if (!confirmed) return;

      setLoading(true);
      
      const response = await whatsappApi.sendBulkMessage({
        message: values.message,
        area_filter: selectedArea,
        village_filter: selectedVillage,
      });

      if (response.success) {
        message.success('Bulk message sending initiated successfully');
        form.resetFields(['message']);
      } else {
        message.error(response.error || 'Failed to send bulk message');
      }
    } catch (error) {
      console.error('Error sending bulk message:', error);
      message.error('Failed to send bulk message');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    const message = form.getFieldValue('message');
    if (!message?.trim()) {
      message.error('Please enter a message to preview');
      return;
    }
    setPreviewVisible(true);
  };

  const customerColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Area',
      dataIndex: 'area',
      key: 'area',
    },
    {
      title: 'Village',
      dataIndex: 'village',
      key: 'village',
    },
    {
      title: 'Credit Balance',
      dataIndex: 'credit_balance',
      key: 'credit_balance',
      render: (balance: number) => `Rs. ${balance.toLocaleString()}`,
    },
  ];

  const messageTemplates = [
    {
      label: 'Festival Greeting',
      value: `🎉 *Festival Greetings!*

Dear Valued Customer,

Wishing you and your family a very happy and prosperous festival season!

Special offers available at our shop. Visit us soon!

Best regards,
Your CeybytePOS Team`
    },
    {
      label: 'Payment Reminder',
      value: `🔔 *Payment Reminder*

Dear Customer,

This is a friendly reminder about your pending payment. Please visit our shop at your earliest convenience.

Thank you for your continued business!

CeybytePOS Team`
    },
    {
      label: 'New Stock Arrival',
      value: `📦 *New Stock Arrival!*

Dear Customer,

We have received fresh stock of your favorite items. Visit our shop to check out the new arrivals!

Thank you for choosing us!

CeybytePOS Team`
    }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <MessageCircle className="w-6 h-6 text-green-600" />
        <h1 className="text-2xl font-bold">Bulk WhatsApp Messaging</h1>
      </div>

      <Row gutter={[16, 16]}>
        {/* Message Form */}
        <Col xs={24} lg={12}>
          <Card title="Compose Message" className="h-full">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSendMessage}
            >
              {/* Filters */}
              <div className="mb-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Customer Filters
                </h4>
                
                <Row gutter={[8, 8]}>
                  <Col xs={24} sm={12}>
                    <Form.Item name="area_filter" label="Area">
                      <Select
                        placeholder="Select area"
                        allowClear
                        value={selectedArea}
                        onChange={handleAreaChange}
                      >
                        {areas.map(area => (
                          <Option key={area} value={area}>{area}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  
                  <Col xs={24} sm={12}>
                    <Form.Item name="village_filter" label="Village">
                      <Select
                        placeholder="Select village"
                        allowClear
                        value={selectedVillage}
                        onChange={setSelectedVillage}
                        disabled={!selectedArea}
                      >
                        {villages.map(village => (
                          <Option key={village} value={village}>{village}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              {/* Message Templates */}
              <Form.Item label="Quick Templates">
                <Select
                  placeholder="Choose a template"
                  allowClear
                  onChange={(value) => {
                    if (value) {
                      const template = messageTemplates.find(t => t.label === value);
                      if (template) {
                        form.setFieldValue('message', template.value);
                      }
                    }
                  }}
                >
                  {messageTemplates.map(template => (
                    <Option key={template.label} value={template.label}>
                      {template.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {/* Message Content */}
              <Form.Item
                name="message"
                label="Message"
                rules={[{ required: true, message: 'Please enter a message' }]}
              >
                <TextArea
                  rows={8}
                  placeholder="Enter your message here..."
                  showCount
                  maxLength={1000}
                />
              </Form.Item>

              {/* Action Buttons */}
              <Form.Item>
                <div className="flex gap-2">
                  <Button
                    type="default"
                    onClick={handlePreview}
                  >
                    Preview
                  </Button>
                  
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<Send className="w-4 h-4" />}
                    loading={loading}
                    disabled={customers.length === 0}
                  >
                    Send to {customers.length} Customers
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Customer List */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Target Customers
              </div>
            }
            className="h-full"
          >
            <div className="mb-4">
              <Statistic
                title="Total Recipients"
                value={customers.length}
                prefix={<Users className="w-4 h-4" />}
              />
            </div>

            <Table
              columns={customerColumns}
              dataSource={customers}
              rowKey="id"
              loading={loading}
              size="small"
              scroll={{ y: 400 }}
              pagination={{
                pageSize: 10,
                showSizeChanger: false,
                showQuickJumper: true,
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Preview Modal */}
      <Modal
        title="Message Preview"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            Close
          </Button>
        ]}
      >
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="whitespace-pre-wrap font-mono text-sm">
            {form.getFieldValue('message')}
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <strong>Recipients:</strong> {customers.length} customers
          {selectedArea && <div><strong>Area:</strong> {selectedArea}</div>}
          {selectedVillage && <div><strong>Village:</strong> {selectedVillage}</div>}
        </div>
      </Modal>
    </div>
  );
};