/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                WhatsApp Configuration                                            │
 * │                                                                                                  │
 * │  Description: WhatsApp Business API configuration interface                                     │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                  │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Form, Input, Switch, Button, TimePicker, message, Divider } from 'antd';
import { MessageCircle, Settings, TestTube, Save } from 'lucide-react';
import { whatsappApi } from '@/api/whatsapp.api';
import type { WhatsAppConfig as WhatsAppConfigType } from '@/types/api';
import dayjs from 'dayjs';

const { TextArea } = Input;

export const WhatsAppConfig: React.FC = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [config, setConfig] = useState<WhatsAppConfigType | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await whatsappApi.getConfig();

      if (response.success && response.data) {
        setConfig(response.data);

        // Set form values
        form.setFieldsValue({
          ...response.data,
          daily_report_time: response.data.daily_report_time
            ? dayjs(response.data.daily_report_time, 'HH:mm')
            : dayjs('18:00', 'HH:mm'),
        });
      }
    } catch (error) {
      console.error('Error loading WhatsApp config:', error);
      message.error('Failed to load WhatsApp configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values: any) => {
    try {
      setLoading(true);

      const configData = {
        ...values,
        daily_report_time: values.daily_report_time?.format('HH:mm') || '18:00',
      };

      const response = await whatsappApi.saveConfig(configData);

      if (response.success) {
        setConfig(response.data || null);
        message.success('WhatsApp configuration saved successfully');
      } else {
        message.error(response.error || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving WhatsApp config:', error);
      message.error('Failed to save WhatsApp configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setTestLoading(true);
      const response = await whatsappApi.testConnection();

      if (response.success) {
        message.success('WhatsApp connection test successful!');
      } else {
        message.error(response.error || 'Connection test failed');
      }
    } catch (error) {
      console.error('Error testing WhatsApp connection:', error);
      message.error('Failed to test WhatsApp connection');
    } finally {
      setTestLoading(false);
    }
  };

  const getDefaultReminderTemplate = () => {
    return `*Payment Reminder*

Dear {customer_name},

This is a friendly reminder about your outstanding balance:

Amount Due: Rs. {balance:,.2f}
Due Date: {due_date}

Please visit our shop or contact us to settle your account.

Thank you for your business!

{business_name}
Phone: {business_phone}`;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <MessageCircle className="w-6 h-6 text-green-600" />
        <h1 className="text-2xl font-bold">WhatsApp Integration</h1>
      </div>

      <Card loading={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            auto_send_receipts: false,
            daily_reports_enabled: false,
            customer_reminders_enabled: false,
            backup_sharing_enabled: false,
            daily_report_time: dayjs('18:00', 'HH:mm'),
          }}
        >
          {/* API Configuration */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              API Configuration
            </h3>

            <Form.Item
              name="api_url"
              label="WhatsApp Business API URL"
              rules={[{ required: true, message: 'Please enter API URL' }]}
            >
              <Input placeholder="https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID" />
            </Form.Item>

            <Form.Item
              name="api_token"
              label="API Access Token"
              rules={[{ required: true, message: 'Please enter API token' }]}
            >
              <Input.Password placeholder="Your WhatsApp Business API token" />
            </Form.Item>

            <Form.Item
              name="business_phone"
              label="Business Phone Number"
              rules={[{ required: true, message: 'Please enter business phone' }]}
            >
              <Input placeholder="94771234567" />
            </Form.Item>

            <Form.Item
              name="business_name"
              label="Business Name"
              rules={[{ required: true, message: 'Please enter business name' }]}
            >
              <Input placeholder="Your Business Name" />
            </Form.Item>

            <Button
              type="default"
              icon={<TestTube className="w-4 h-4" />}
              onClick={handleTestConnection}
              loading={testLoading}
              disabled={!config}
            >
              Test Connection
            </Button>
          </div>

          <Divider />

          {/* Feature Settings */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Feature Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="auto_send_receipts"
                label="Auto Send Receipts"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="daily_reports_enabled"
                label="Daily Reports"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="customer_reminders_enabled"
                label="Customer Reminders"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="backup_sharing_enabled"
                label="Backup Notifications"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </div>
          </div>

          <Divider />

          {/* Report Settings */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Report Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="daily_report_time"
                label="Daily Report Time"
              >
                <TimePicker format="HH:mm" />
              </Form.Item>

              <Form.Item
                name="owner_phone"
                label="Owner Phone Number"
              >
                <Input placeholder="94771234567" />
              </Form.Item>
            </div>
          </div>

          <Divider />

          {/* Message Templates */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Message Templates</h3>

            <Form.Item
              name="receipt_template"
              label="Receipt Template (Optional)"
            >
              <TextArea
                rows={4}
                placeholder="Custom receipt template (leave empty for default)"
              />
            </Form.Item>

            <Form.Item
              name="reminder_template"
              label="Reminder Template"
            >
              <TextArea
                rows={8}
                placeholder={getDefaultReminderTemplate()}
              />
            </Form.Item>

            <Form.Item
              name="greeting_template"
              label="Greeting Template (Optional)"
            >
              <TextArea
                rows={4}
                placeholder="Custom greeting template for festivals/special occasions"
              />
            </Form.Item>
          </div>

          {/* Template Variables Help */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-2">Available Template Variables:</h4>
            <div className="text-sm text-gray-600 grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <strong>Customer:</strong> {'{customer_name}'}, {'{balance}'}, {'{due_date}'}
              </div>
              <div>
                <strong>Business:</strong> {'{business_name}'}, {'{business_phone}'}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<Save className="w-4 h-4" />}
              loading={loading}
              size="large"
            >
              Save Configuration
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};