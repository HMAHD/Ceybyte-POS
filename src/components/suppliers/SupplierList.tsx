/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                    Supplier List Component                                       │
 * │                                                                                                  │
 * │  Description: Displays list of suppliers with search, filtering, and management options.        │
 * │               Includes credit balance display and visit schedule information.                    │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, 
  Input, 
  Button, 
  Space, 
  Tag, 
  Card,
  Row,
  Col,
  Select,
  Tooltip,
  message
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  EyeOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { supplierAPI, type Supplier } from '@/api/suppliers.api';
import { useTranslation } from 'react-i18next';

const { Search } = Input;
const { Option } = Select;

interface SupplierListProps {
  onSelectSupplier?: (supplier: Supplier) => void;
  onEditSupplier?: (supplier: Supplier) => void;
  onCreateSupplier?: () => void;
}

const SupplierList: React.FC<SupplierListProps> = ({
  onSelectSupplier,
  onEditSupplier,
  onCreateSupplier
}) => {
  const { t } = useTranslation();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [cityFilter, setCityFilter] = useState<string | undefined>();
  const [balanceFilter, setBalanceFilter] = useState<boolean | undefined>();
  const [visitDueFilter, setVisitDueFilter] = useState<boolean | undefined>();

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const response = await supplierAPI.getSuppliers({
        search: debouncedSearchText || undefined,
        city: cityFilter,
        has_balance: balanceFilter,
        visit_due: visitDueFilter,
        active_only: true,
        limit: 100 // Increase limit for better UX
      });

      if (response.success && response.data) {
        setSuppliers(response.data);
      } else {
        console.error('Failed to load suppliers:', response.error);
        message.error(response.error || t('Failed to load suppliers'));
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
      message.error(t('Network error occurred while loading suppliers'));
    } finally {
      setLoading(false);
    }
  };

  // Debounce search text
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    loadSuppliers();
  }, [debouncedSearchText, cityFilter, balanceFilter, visitDueFilter]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getBalanceStatus = (balance: number) => {
    if (balance === 0) {
      return <Tag color="green">No Balance</Tag>;
    } else if (balance > 0) {
      return <Tag color="orange">Outstanding</Tag>;
    }
    return <Tag color="red">Credit</Tag>;
  };

  const getVisitStatus = (supplier: Supplier) => {
    if (!supplier.next_visit_date) {
      return <Tag color="default">No Schedule</Tag>;
    }

    const today = new Date();
    const nextVisit = new Date(supplier.next_visit_date);
    const diffDays = Math.ceil((nextVisit.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return <Tag color="red" icon={<ExclamationCircleOutlined />}>Overdue ({Math.abs(diffDays)}d)</Tag>;
    } else if (diffDays === 0) {
      return <Tag color="orange">Today</Tag>;
    } else if (diffDays <= 3) {
      return <Tag color="yellow">Due Soon ({diffDays}d)</Tag>;
    }
    return <Tag color="green">Scheduled ({diffDays}d)</Tag>;
  };

  const columns: ColumnsType<Supplier> = [
    {
      title: t('Supplier Name'),
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Supplier) => (
        <div>
          <div className="font-medium">{text}</div>
          {record.company_name && (
            <div className="text-sm text-gray-500">{record.company_name}</div>
          )}
          {record.contact_person && (
            <div className="text-xs text-gray-400">{record.contact_person}</div>
          )}
        </div>
      ),
    },
    {
      title: t('Contact'),
      key: 'contact',
      render: (_, record: Supplier) => (
        <Space direction="vertical" size="small">
          {record.mobile && (
            <div className="flex items-center text-sm">
              <PhoneOutlined className="mr-1" />
              {record.mobile}
            </div>
          )}
          {record.email && (
            <div className="flex items-center text-sm">
              <MailOutlined className="mr-1" />
              {record.email}
            </div>
          )}
          {record.city && (
            <div className="text-xs text-gray-500">{record.city}</div>
          )}
        </Space>
      ),
    },
    {
      title: t('Balance'),
      key: 'balance',
      render: (_, record: Supplier) => (
        <div>
          <div className="font-medium">{formatCurrency(record.current_balance)}</div>
          {getBalanceStatus(record.current_balance)}
          <div className="text-xs text-gray-500">
            Limit: {formatCurrency(record.credit_limit)}
          </div>
        </div>
      ),
      sorter: (a, b) => a.current_balance - b.current_balance,
    },
    {
      title: t('Payment Terms'),
      dataIndex: 'payment_terms_days',
      key: 'payment_terms_days',
      render: (days: number) => (
        <div>
          <div className="font-medium">{days} days</div>
          <div className="text-xs text-gray-500">Net payment</div>
        </div>
      ),
    },
    {
      title: t('Visit Schedule'),
      key: 'visit',
      render: (_, record: Supplier) => (
        <div>
          {getVisitStatus(record)}
          {record.visit_frequency && (
            <div className="text-xs text-gray-500 mt-1">
              <CalendarOutlined className="mr-1" />
              {record.visit_frequency} - {record.visit_day}
            </div>
          )}
        </div>
      ),
    },
    {
      title: t('Actions'),
      key: 'actions',
      render: (_, record: Supplier) => (
        <Space>
          <Tooltip title={t('View')}>
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => onSelectSupplier?.(record)}
            />
          </Tooltip>
          <Tooltip title={t('Edit')}>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEditSupplier?.(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const uniqueCities = Array.from(new Set(suppliers.map(s => s.city).filter(Boolean)));

  return (
    <Card>
      <div className="mb-4">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder={t('Search suppliers...')}
              allowClear
              onSearch={setSearchText}
              onChange={(e) => setSearchText(e.target.value)}
              loading={loading && debouncedSearchText !== searchText}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder={t('Filter by city')}
              allowClear
              style={{ width: '100%' }}
              value={cityFilter}
              onChange={setCityFilter}
            >
              {uniqueCities.map(city => (
                <Option key={city} value={city}>{city}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder={t('Filter by balance')}
              allowClear
              style={{ width: '100%' }}
              value={balanceFilter}
              onChange={setBalanceFilter}
            >
              <Option value={true}>Has Balance</Option>
              <Option value={false}>No Balance</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder={t('Filter by visit')}
              allowClear
              style={{ width: '100%' }}
              value={visitDueFilter}
              onChange={setVisitDueFilter}
            >
              <Option value={true}>Visit Due</Option>
              <Option value={false}>No Visit Due</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadSuppliers}
              loading={loading}
              style={{ width: '100%' }}
            >
              {t('Refresh')}
            </Button>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onCreateSupplier}
              style={{ width: '100%' }}
            >
              {t('Add Supplier')}
            </Button>
          </Col>
        </Row>
      </div>

      <Table
        columns={columns}
        dataSource={suppliers}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} of ${total} suppliers`
        }}
        scroll={{ x: 1200 }}
      />
    </Card>
  );
};

export default SupplierList;