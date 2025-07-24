/*
 * ╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                        CEYBYTE POS                                               ║
 * ║                                                                                                  ║
 * ║                                    Active Sessions Display                                       ║
 * ║                                                                                                  ║
 * ║  Description: Component to display and manage active user sessions across terminals             ║
 * ║               with force logout functionality and session monitoring.                            ║
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
  Input, 
  Modal, 
  message,
  Tooltip,
  Badge,
  Avatar
} from 'antd';
import { 
  ReloadOutlined, 
  LogoutOutlined,
  UserOutlined,
  LaptopOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { sessionsAPI, SessionInfo } from '@/api/sessions';

dayjs.extend(relativeTime);

const { Title } = Typography;
const { Search } = Input;
const { confirm } = Modal;

interface ActiveSessionsProps {
  onSessionUpdate?: () => void;
}

export const ActiveSessions: React.FC<ActiveSessionsProps> = ({ onSessionUpdate }) => {
  const { t } = useTranslation();
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [filters, setFilters] = useState({
    terminal: '',
    user_id: undefined as number | undefined,
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

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await sessionsAPI.getActiveSessions(filters);
      
      if (response.success && response.data) {
        setSessions(response.data.sessions || []);
        setPagination(prev => ({
          ...prev,
          total: response.data?.total || 0,
          current: response.data?.page || 1
        }));
      } else {
        message.error(t('sessions.active.loadError'));
        setSessions([]); // Ensure sessions is always an array
      }
    } catch (error) {
      message.error(t('sessions.active.loadError'));
      setSessions([]); // Ensure sessions is always an array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [filters]);

  const handleRefresh = () => {
    loadSessions();
    onSessionUpdate?.();
  };

  const handleForceLogout = (sessionIds: number[], sessionUsernames: string[]) => {
    const userList = sessionUsernames.join(', ');
    
    confirm({
      title: t('sessions.active.forceLogout.title'),
      content: t('sessions.active.forceLogout.confirm', { users: userList }),
      icon: <ExclamationCircleOutlined />,
      okText: t('common.yes'),
      cancelText: t('common.cancel'),
      okType: 'danger',
      onOk: async () => {
        try {
          const response = await sessionsAPI.forceLogoutSessions({
            session_ids: sessionIds,
            reason: 'Administrative force logout'
          });
          
          if (response.success && response.data) {
            message.success(t('sessions.active.forceLogout.success', { 
              count: response.data.logged_out_sessions 
            }));
            setSelectedRowKeys([]);
            handleRefresh();
          } else {
            message.error(t('sessions.active.forceLogout.error'));
          }
        } catch (error) {
          message.error(t('sessions.active.forceLogout.error'));
        }
      }
    });
  };

  const getRoleColor = (role: string): string => {
    switch (role.toLowerCase()) {
      case 'owner': return 'red';
      case 'cashier': return 'blue';
      case 'helper': return 'green';
      default: return 'default';
    }
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

  const columns: ColumnsType<SessionInfo> = [
    {
      title: t('sessions.active.columns.user'),
      dataIndex: 'user_name',
      key: 'user_name',
      render: (name: string, record: SessionInfo) => (
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
      title: t('sessions.active.columns.role'),
      dataIndex: 'user_role',
      key: 'user_role',
      render: (role: string) => (
        <Tag color={getRoleColor(role)}>
          {t(`auth.roles.${role.toLowerCase()}`)}
        </Tag>
      ),
      filters: [
        { text: t('auth.roles.owner'), value: 'owner' },
        { text: t('auth.roles.cashier'), value: 'cashier' },
        { text: t('auth.roles.helper'), value: 'helper' }
      ],
      onFilter: (value, record) => record.user_role === value
    },
    {
      title: t('sessions.active.columns.terminal'),
      dataIndex: 'terminal_name',
      key: 'terminal_name',
      render: (terminal: string) => (
        <Space>
          <LaptopOutlined />
          <span>{terminal || t('sessions.terminal.unknown')}</span>
        </Space>
      )
    },
    {
      title: t('sessions.active.columns.loginTime'),
      dataIndex: 'login_time',
      key: 'login_time',
      render: (time: string) => (
        <Tooltip title={dayjs(time).format('DD/MM/YYYY HH:mm:ss')}>
          <Space>
            <ClockCircleOutlined />
            {dayjs(time).fromNow()}
          </Space>
        </Tooltip>
      ),
      sorter: (a, b) => dayjs(a.login_time).unix() - dayjs(b.login_time).unix()
    },
    {
      title: t('sessions.active.columns.duration'),
      dataIndex: 'session_duration',
      key: 'session_duration',
      render: (duration: number) => (
        <Badge 
          status={duration > 480 ? 'warning' : 'processing'} 
          text={getSessionDurationText(duration)} 
        />
      ),
      sorter: (a, b) => (a.session_duration || 0) - (b.session_duration || 0)
    },
    {
      title: t('sessions.active.columns.location'),
      dataIndex: 'ip_address',
      key: 'ip_address',
      render: (ip: string, record: SessionInfo) => (
        <Tooltip title={`IP: ${ip}`}>
          <Space>
            <EnvironmentOutlined />
            <span>{record.location || ip || t('sessions.location.unknown')}</span>
          </Space>
        </Tooltip>
      )
    },
    {
      title: t('sessions.active.columns.actions'),
      key: 'actions',
      render: (_, record: SessionInfo) => (
        <Button
          type="text"
          danger
          icon={<LogoutOutlined />}
          size="small"
          onClick={() => handleForceLogout([record.id], [record.username])}
        >
          {t('sessions.active.forceLogout.button')}
        </Button>
      )
    }
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys as number[]),
    getCheckboxProps: (record: SessionInfo) => ({
      name: record.username
    })
  };

  const handleTableChange = (paginationConfig: any) => {
    setFilters(prev => ({
      ...prev,
      page: paginationConfig.current,
      per_page: paginationConfig.pageSize
    }));
  };

  const selectedSessions = sessions?.filter(session => selectedRowKeys.includes(session.id)) || [];

  return (
    <div className="active-sessions">
      <Space direction="vertical" size="middle" className="w-full">
        {/* Header Controls */}
        <div className="flex justify-between items-center">
          <Title level={4} className="mb-0">
            {t('sessions.active.title')}
          </Title>
          
          <Space>
            <Search
              placeholder={t('sessions.active.search.placeholder')}
              style={{ width: 250 }}
              onSearch={(value) => setFilters(prev => ({ ...prev, terminal: value, page: 1 }))}
              allowClear
            />
            
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleRefresh}
              loading={loading}
            >
              {t('common.refresh')}
            </Button>
            
            {selectedRowKeys.length > 0 && (
              <Button
                type="primary"
                danger
                icon={<LogoutOutlined />}
                onClick={() => handleForceLogout(
                  selectedRowKeys, 
                  selectedSessions.map(s => s.username)
                )}
              >
                {t('sessions.active.forceLogout.selected', { count: selectedRowKeys.length })}
              </Button>
            )}
          </Space>
        </div>

        {/* Sessions Table */}
        <Table
          columns={columns}
          dataSource={sessions}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          rowSelection={rowSelection}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
          className="sessions-table"
          size="middle"
        />
      </Space>
    </div>
  );
};

export default ActiveSessions;