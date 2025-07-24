/*
 * ╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                        CEYBYTE POS                                               ║
 * ║                                                                                                  ║
 * ║                                      Audit Logs View                                            ║
 * ║                                                                                                  ║
 * ║  Description: Component to display system audit logs with filtering capabilities                ║
 * ║               for security monitoring and system activity tracking.                             ║
 * ║                                                                                                  ║
 * ║  Author: Akash Hasendra                                                                          ║
 * ║  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   ║
 * ║  License: MIT License with Sri Lankan Business Terms                                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Tag, 
  Typography, 
  Select, 
  message,
  Tooltip,
  Avatar,
  Drawer,
  Descriptions
} from 'antd';
import { 
  ReloadOutlined, 
  UserOutlined,
  LaptopOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { sessionsAPI, AuditLogEntry } from '@/api/sessions';

dayjs.extend(relativeTime);

const { Title } = Typography;
const { Option } = Select;

export const AuditLogs: React.FC = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [filters, setFilters] = useState({
    event_type: undefined as string | undefined,
    user_id: undefined as number | undefined,
    severity: undefined as string | undefined,
    days: 30,
    page: 1,
    per_page: 50
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 50,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number, range: [number, number]) => 
      t('common.pagination.showTotal', { start: range[0], end: range[1], total })
  });

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const response = await sessionsAPI.getAuditLogs(filters);
      
      if (response.success && response.data) {
        setLogs(response.data.logs || []);
        setPagination(prev => ({
          ...prev,
          total: response.data?.total || 0,
          current: response.data?.page || 1
        }));
      } else {
        message.error(t('sessions.audit.loadError'));
        setLogs([]); // Ensure logs is always an array
      }
    } catch (error) {
      message.error(t('sessions.audit.loadError'));
      setLogs([]); // Ensure logs is always an array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, [filters]);

  const handleRefresh = () => {
    loadAuditLogs();
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity.toLowerCase()) {
      case 'info': return 'blue';
      case 'warning': return 'orange';
      case 'error': return 'red';
      case 'critical': return 'red';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'info': return <InfoCircleOutlined />;
      case 'warning': return <WarningOutlined />;
      case 'error': return <ExclamationCircleOutlined />;
      case 'critical': return <ExclamationCircleOutlined />;
      default: return <InfoCircleOutlined />;
    }
  };

  const getEventTypeColor = (eventType: string): string => {
    if (eventType.includes('login')) return 'green';
    if (eventType.includes('logout')) return 'red';
    if (eventType.includes('failed')) return 'red';
    if (eventType.includes('security')) return 'orange';
    return 'blue';
  };

  const handleViewDetails = (log: AuditLogEntry) => {
    setSelectedLog(log);
    setDrawerVisible(true);
  };

  const columns: ColumnsType<AuditLogEntry> = [
    {
      title: t('sessions.audit.columns.timestamp'),
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (time: string) => (
        <Tooltip title={dayjs(time).format('DD/MM/YYYY HH:mm:ss')}>
          <Space>
            <ClockCircleOutlined />
            <div>
              <div>{dayjs(time).format('DD/MM HH:mm')}</div>
              <div className="text-xs text-gray-500">{dayjs(time).fromNow()}</div>
            </div>
          </Space>
        </Tooltip>
      ),
      sorter: (a, b) => dayjs(a.timestamp).unix() - dayjs(b.timestamp).unix(),
      defaultSortOrder: 'descend'
    },
    {
      title: t('sessions.audit.columns.severity'),
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: string) => (
        <Tag color={getSeverityColor(severity)} icon={getSeverityIcon(severity)}>
          {t(`sessions.audit.severity.${severity.toLowerCase()}`)}
        </Tag>
      ),
      filters: [
        { text: t('sessions.audit.severity.info'), value: 'info' },
        { text: t('sessions.audit.severity.warning'), value: 'warning' },
        { text: t('sessions.audit.severity.error'), value: 'error' },
        { text: t('sessions.audit.severity.critical'), value: 'critical' }
      ],
      onFilter: (value, record) => record.severity === value,
      width: 120
    },
    {
      title: t('sessions.audit.columns.eventType'),
      dataIndex: 'event_type',
      key: 'event_type',
      render: (eventType: string) => (
        <Tag color={getEventTypeColor(eventType)}>
          {t(`sessions.audit.eventType.${eventType}`, eventType)}
        </Tag>
      ),
      width: 150
    },
    {
      title: t('sessions.audit.columns.user'),
      dataIndex: 'username',
      key: 'username',
      render: (username: string | undefined, record: AuditLogEntry) => {
        if (!username) {
          return <span className="text-gray-400">{t('sessions.audit.systemEvent')}</span>;
        }
        
        return (
          <Space>
            <Avatar size="small" icon={<UserOutlined />} />
            <span>@{username}</span>
          </Space>
        );
      },
      width: 120
    },
    {
      title: t('sessions.audit.columns.description'),
      dataIndex: 'description',
      key: 'description',
      render: (description: string) => (
        <div className="max-w-md">
          <Tooltip title={description}>
            <span className="text-ellipsis overflow-hidden">
              {description.length > 60 ? `${description.substring(0, 60)}...` : description}
            </span>
          </Tooltip>
        </div>
      )
    },
    {
      title: t('sessions.audit.columns.terminal'),
      dataIndex: 'terminal_name',
      key: 'terminal_name',
      render: (terminal?: string) => {
        if (!terminal) return <span className="text-gray-400">-</span>;
        
        return (
          <Space>
            <LaptopOutlined />
            <span>{terminal}</span>
          </Space>
        );
      },
      width: 120
    },
    {
      title: t('sessions.audit.columns.actions'),
      key: 'actions',
      render: (_: any, record: AuditLogEntry) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => handleViewDetails(record)}
        >
          {t('sessions.audit.viewDetails')}
        </Button>
      ),
      width: 100
    }
  ];

  const handleTableChange = (paginationConfig: any) => {
    setFilters(prev => ({
      ...prev,
      page: paginationConfig.current,
      per_page: paginationConfig.pageSize
    }));
  };

  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value, page: 1 }));
  };

  return (
    <div className="audit-logs">
      <Space direction="vertical" size="middle" className="w-full">
        {/* Header Controls */}
        <div className="flex justify-between items-center">
          <Title level={4} className="mb-0">
            {t('sessions.audit.title')}
          </Title>
          
          <Space>
            <Select
              placeholder={t('sessions.audit.filter.severity')}
              value={filters.severity}
              onChange={(value) => handleFilterChange('severity', value)}
              style={{ width: 120 }}
              allowClear
            >
              <Option value="info">{t('sessions.audit.severity.info')}</Option>
              <Option value="warning">{t('sessions.audit.severity.warning')}</Option>
              <Option value="error">{t('sessions.audit.severity.error')}</Option>
              <Option value="critical">{t('sessions.audit.severity.critical')}</Option>
            </Select>
            
            <Select
              value={filters.days}
              onChange={(value) => handleFilterChange('days', value)}
              style={{ width: 150 }}
            >
              <Option value={1}>{t('sessions.audit.filter.today')}</Option>
              <Option value={7}>{t('sessions.audit.filter.last7days')}</Option>
              <Option value={30}>{t('sessions.audit.filter.last30days')}</Option>
              <Option value={90}>{t('sessions.audit.filter.last90days')}</Option>
            </Select>
            
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleRefresh}
              loading={loading}
            >
              {t('common.refresh')}
            </Button>
          </Space>
        </div>

        {/* Audit Logs Table */}
        <Table
          columns={columns}
          dataSource={logs}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
          className="audit-logs-table"
          size="middle"
          rowClassName={(record) => {
            if (record.severity === 'critical' || record.severity === 'error') {
              return 'audit-log-error';
            }
            if (record.severity === 'warning') {
              return 'audit-log-warning';
            }
            return '';
          }}
        />
      </Space>

      {/* Audit Log Details Drawer */}
      <Drawer
        title={t('sessions.audit.details.title')}
        width={600}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        className="audit-log-drawer"
      >
        {selectedLog && (
          <Space direction="vertical" size="large" className="w-full">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label={t('sessions.audit.details.timestamp')}>
                {dayjs(selectedLog.timestamp).format('DD/MM/YYYY HH:mm:ss')}
              </Descriptions.Item>
              
              <Descriptions.Item label={t('sessions.audit.details.severity')}>
                <Tag color={getSeverityColor(selectedLog.severity)} icon={getSeverityIcon(selectedLog.severity)}>
                  {t(`sessions.audit.severity.${selectedLog.severity.toLowerCase()}`)}
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label={t('sessions.audit.details.eventType')}>
                <Tag color={getEventTypeColor(selectedLog.event_type)}>
                  {selectedLog.event_type}
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label={t('sessions.audit.details.user')}>
                {selectedLog.username ? `@${selectedLog.username}` : t('sessions.audit.systemEvent')}
              </Descriptions.Item>
              
              <Descriptions.Item label={t('sessions.audit.details.terminal')}>
                {selectedLog.terminal_name || t('sessions.terminal.unknown')}
              </Descriptions.Item>
              
              <Descriptions.Item label={t('sessions.audit.details.ipAddress')}>
                {selectedLog.ip_address || '-'}
              </Descriptions.Item>
              
              <Descriptions.Item label={t('sessions.audit.details.description')}>
                {selectedLog.description}
              </Descriptions.Item>
              
              {selectedLog.metadata && (
                <Descriptions.Item label={t('sessions.audit.details.metadata')}>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Space>
        )}
      </Drawer>
    </div>
  );
};

export default AuditLogs;