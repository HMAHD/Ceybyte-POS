/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                WhatsApp Message History                                          │
 * │                                                                                                  │
 * │  Description: View WhatsApp message history and status                                          │
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
  Table,
  Tag,
  Button,
  Modal,
  Select,
  Input,
  DatePicker,
  Tooltip
} from 'antd';
import {
  MessageCircle,
  Eye,
  RefreshCw,
  Search,
  Calendar,
  User,
  Phone
} from 'lucide-react';
import { whatsappApi } from '@/api/whatsapp.api';
import type { WhatsAppMessage } from '@/types/api';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

const { Option } = Select;
const { RangePicker } = DatePicker;

export const WhatsAppHistory: React.FC = () => {
  useTranslation();
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<WhatsAppMessage | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [filters, setFilters] = useState({
    messageType: undefined as string | undefined,
    status: undefined as string | undefined,
    search: '',
    dateRange: null as any,
  });

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await whatsappApi.getMessageHistory();

      if (response.success) {
        setMessages(response.data || []);
      }
    } catch (error) {
      console.error('Error loading message history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (message: WhatsAppMessage) => {
    setSelectedMessage(message);
    setPreviewVisible(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'green';
      case 'delivered':
        return 'blue';
      case 'failed':
        return 'red';
      case 'pending':
        return 'orange';
      default:
        return 'default';
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'receipt':
        return '🧾';
      case 'reminder':
        return '🔔';
      case 'report':
        return '📊';
      case 'bulk':
        return '📢';
      case 'backup':
        return '💾';
      case 'greeting':
        return '🎉';
      default:
        return '💬';
    }
  };

  const filteredMessages = messages.filter(message => {
    // Message type filter
    if (filters.messageType && message.message_type !== filters.messageType) {
      return false;
    }

    // Status filter
    if (filters.status && message.status !== filters.status) {
      return false;
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesName = message.recipient_name?.toLowerCase().includes(searchLower);
      const matchesPhone = message.recipient_phone.includes(filters.search);
      const matchesContent = message.message_content.toLowerCase().includes(searchLower);

      if (!matchesName && !matchesPhone && !matchesContent) {
        return false;
      }
    }

    // Date range filter
    if (filters.dateRange && filters.dateRange.length === 2) {
      const messageDate = dayjs(message.created_at);
      const [startDate, endDate] = filters.dateRange;

      if (!messageDate.isBetween(startDate, endDate, 'day', '[]')) {
        return false;
      }
    }

    return true;
  });

  const columns = [
    {
      title: 'Type',
      dataIndex: 'message_type',
      key: 'message_type',
      width: 80,
      render: (type: string) => (
        <Tooltip title={type}>
          <span className="text-lg">{getMessageTypeIcon(type)}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Recipient',
      key: 'recipient',
      render: (record: WhatsAppMessage) => (
        <div>
          <div className="font-medium">{record.recipient_name || 'Unknown'}</div>
          <div className="text-sm text-gray-500">{record.recipient_phone}</div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Sent At',
      dataIndex: 'sent_at',
      key: 'sent_at',
      width: 150,
      render: (sentAt: string) =>
        sentAt ? dayjs(sentAt).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (createdAt: string) =>
        dayjs(createdAt).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (record: WhatsAppMessage) => (
        <Button
          type="text"
          icon={<Eye className="w-4 h-4" />}
          onClick={() => handlePreview(record)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-6 h-6 text-green-600" />
          <h1 className="text-2xl font-bold">WhatsApp Message History</h1>
        </div>

        <Button
          type="primary"
          icon={<RefreshCw className="w-4 h-4" />}
          onClick={loadMessages}
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Message Type</label>
            <Select
              placeholder="All types"
              allowClear
              value={filters.messageType}
              onChange={(value) => setFilters(prev => ({ ...prev, messageType: value }))}
              className="w-full"
            >
              <Option value="receipt">Receipt</Option>
              <Option value="reminder">Reminder</Option>
              <Option value="report">Report</Option>
              <Option value="bulk">Bulk Message</Option>
              <Option value="backup">Backup</Option>
              <Option value="greeting">Greeting</Option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <Select
              placeholder="All statuses"
              allowClear
              value={filters.status}
              onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              className="w-full"
            >
              <Option value="pending">Pending</Option>
              <Option value="sent">Sent</Option>
              <Option value="delivered">Delivered</Option>
              <Option value="failed">Failed</Option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <Input
              placeholder="Name, phone, or content"
              prefix={<Search className="w-4 h-4" />}
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date Range</label>
            <RangePicker
              value={filters.dateRange}
              onChange={(dates) => setFilters(prev => ({ ...prev, dateRange: dates }))}
              className="w-full"
            />
          </div>
        </div>
      </Card>

      {/* Messages Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredMessages}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} messages`,
          }}
        />
      </Card>

      {/* Message Preview Modal */}
      <Modal
        title="Message Details"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            Close
          </Button>
        ]}
        width={600}
      >
        {selectedMessage && (
          <div className="space-y-4">
            {/* Message Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Type</label>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getMessageTypeIcon(selectedMessage.message_type)}</span>
                  <span className="capitalize">{selectedMessage.message_type}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Status</label>
                <Tag color={getStatusColor(selectedMessage.status)}>
                  {selectedMessage.status.toUpperCase()}
                </Tag>
              </div>
            </div>

            {/* Recipient Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Recipient Name</label>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{selectedMessage.recipient_name || 'Unknown'}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Phone Number</label>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{selectedMessage.recipient_phone}</span>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Created At</label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{dayjs(selectedMessage.created_at).format('YYYY-MM-DD HH:mm:ss')}</span>
                </div>
              </div>

              {selectedMessage.sent_at && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Sent At</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{dayjs(selectedMessage.sent_at).format('YYYY-MM-DD HH:mm:ss')}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {selectedMessage.error_message && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Error Message</label>
                <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700">
                  {selectedMessage.error_message}
                </div>
              </div>
            )}

            {/* Message Content */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Message Content</label>
              <div className="bg-gray-50 border rounded p-4 max-h-60 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  {selectedMessage.message_content}
                </pre>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};