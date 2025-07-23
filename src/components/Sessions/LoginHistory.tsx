/*
 * ╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                        CEYBYTE POS                                               ║
 * ║                                                                                                  ║
 * ║                                     Login History View                                           ║
 * ║                                                                                                  ║
 * ║  Description: Component to display user login/logout history with filtering and export          ║
 * ║               capabilities for auditing and session monitoring purposes.                         ║
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
  Badge,
  Avatar
} from 'antd';
import { 
  ReloadOutlined, 
  LoginOutlined,
  LogoutOutlined,
  UserOutlined,
  LaptopOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { sessionsAPI, LoginHistoryEntry } from '@/api/sessions';

dayjs.extend(relativeTime);

const { Title } = Typography;
const { Option } = Select;

export const LoginHistory: React.FC = () => {
  const { t } = useTranslation();
  const [history, setHistory] = useState<LoginHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    user_id: undefined as number | undefined,
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

  const loadLoginHistory = async () => {
    try {
      setLoading(true);
      const response = await sessionsAPI.getLoginHistory(filters);
      
      if (response.success && response.data) {
        setHistory(response.data.history || []);
        setPagination(prev => ({
          ...prev,
          total: response.data?.total || 0,
          current: response.data?.page || 1
        }));
      } else {
        message.error(t('sessions.history.loadError'));
        setHistory([]); // Ensure history is always an array
      }
    } catch (error) {
      message.error(t('sessions.history.loadError'));
      setHistory([]); // Ensure history is always an array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLoginHistory();
  }, [filters]);

  const handleRefresh = () => {
    loadLoginHistory();
  };

  const getLogoutReasonColor = (reason?: string): string => {
    switch (reason) {
      case 'manual': return 'blue';
      case 'timeout': return 'orange';
      case 'forced': return 'red';
      case 'system': return 'purple';
      default: return 'default';
    }
  };

  const getLogoutReasonText = (reason?: string): string => {
    if (!reason) return t('sessions.logoutReason.unknown');
    return t(`sessions.logoutReason.${reason}`);
  };

  const getLoginMethodIcon = (method: string) => {
    return method === 'pin' ? <span className="text-xs">PIN</span> : <LoginOutlined />;
  };

  const getSessionDurationText = (minutes?: number): string => {
    if (!minutes) return t('sessions.duration.unknown');
    
    if (minutes < 60) {
      return t('sessions.duration.minutes', { count: minutes });
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return t('sessions.duration.hours', { count: hours });
      } else {
        return t('sessions.duration.hoursMinutes', { hours, minutes: remainingMinutes });
      }
    }
  };

  const columns: ColumnsType<LoginHistoryEntry> = [
    {
      title: t('sessions.history.columns.user'),
      dataIndex: 'user_name',
      key: 'user_name',
      render: (name: string, record: LoginHistoryEntry) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-xs text-gray-500">@{record.username}</div>
          </div>
        </Space>
      )
    },
    {
      title: t('sessions.history.columns.loginTime'),
      dataIndex: 'login_time',
      key: 'login_time',
      render: (time: string) => (
        <Tooltip title={dayjs(time).format('DD/MM/YYYY HH:mm:ss')}>
          <Space>
            <LoginOutlined className="text-green-500" />
            <div>
              <div>{dayjs(time).format('DD/MM HH:mm')}</div>
              <div className="text-xs text-gray-500">{dayjs(time).fromNow()}</div>
            </div>
          </Space>
        </Tooltip>
      ),
      sorter: (a, b) => dayjs(a.login_time).unix() - dayjs(b.login_time).unix()
    },
    {
      title: t('sessions.history.columns.logoutTime'),
      dataIndex: 'logout_time',
      key: 'logout_time',
      render: (time?: string) => {
        if (!time) {
          return (
            <Badge status="processing" text={t('sessions.history.stillActive')} />
          );
        }
        
        return (
          <Tooltip title={dayjs(time).format('DD/MM/YYYY HH:mm:ss')}>
            <Space>
              <LogoutOutlined className="text-red-500" />
              <div>
                <div>{dayjs(time).format('DD/MM HH:mm')}</div>
                <div className="text-xs text-gray-500">{dayjs(time).fromNow()}</div>
              </div>
            </Space>
          </Tooltip>
        );
      }
    },
    {
      title: t('sessions.history.columns.duration'),
      dataIndex: 'session_duration',
      key: 'session_duration',
      render: (duration?: number) => (
        <Space>
          <ClockCircleOutlined />
          {getSessionDurationText(duration)}
        </Space>
      ),
      sorter: (a, b) => (a.session_duration || 0) - (b.session_duration || 0)
    },
    {
      title: t('sessions.history.columns.terminal'),
      dataIndex: 'terminal_name',
      key: 'terminal_name',
      render: (terminal?: string) => (
        <Space>
          <LaptopOutlined />
          <span>{terminal || t('sessions.terminal.unknown')}</span>
        </Space>
      )
    },
    {
      title: t('sessions.history.columns.method'),
      dataIndex: 'login_method',
      key: 'login_method',
      render: (method: string) => (
        <Tag icon={getLoginMethodIcon(method)}>
          {t(`sessions.loginMethod.${method}`)}
        </Tag>
      ),
      filters: [
        { text: t('sessions.loginMethod.password'), value: 'password' },
        { text: t('sessions.loginMethod.pin'), value: 'pin' }
      ],
      onFilter: (value, record) => record.login_method === value
    },
    {
      title: t('sessions.history.columns.logoutReason'),
      dataIndex: 'logout_reason',
      key: 'logout_reason',
      render: (reason?: string) => (
        <Tag color={getLogoutReasonColor(reason)}>
          {getLogoutReasonText(reason)}
        </Tag>
      ),
      filters: [
        { text: t('sessions.logoutReason.manual'), value: 'manual' },
        { text: t('sessions.logoutReason.timeout'), value: 'timeout' },
        { text: t('sessions.logoutReason.forced'), value: 'forced' },
        { text: t('sessions.logoutReason.system'), value: 'system' }
      ],
      onFilter: (value, record) => record.logout_reason === value
    }
  ];

  const handleTableChange = (paginationConfig: any) => {
    setFilters(prev => ({
      ...prev,
      page: paginationConfig.current,
      per_page: paginationConfig.pageSize
    }));
  };

  const handleDaysChange = (days: number) => {
    setFilters(prev => ({ ...prev, days, page: 1 }));
  };

  return (
    <div className="login-history">
      <Space direction="vertical" size="middle" className="w-full">
        {/* Header Controls */}
        <div className="flex justify-between items-center">
          <Title level={4} className="mb-0">
            {t('sessions.history.title')}
          </Title>
          
          <Space>
            <Select
              value={filters.days}
              onChange={handleDaysChange}
              style={{ width: 150 }}
            >
              <Option value={7}>{t('sessions.history.filter.last7days')}</Option>
              <Option value={30}>{t('sessions.history.filter.last30days')}</Option>
              <Option value={90}>{t('sessions.history.filter.last90days')}</Option>
              <Option value={365}>{t('sessions.history.filter.lastYear')}</Option>
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

        {/* History Table */}
        <Table
          columns={columns}
          dataSource={history}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
          className="login-history-table"
          size="middle"
        />
      </Space>
    </div>
  );
};

export default LoginHistory;