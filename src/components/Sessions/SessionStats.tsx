/*
 * ╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                        CEYBYTE POS                                               ║
 * ║                                                                                                  ║
 * ║                                     Session Statistics                                           ║
 * ║                                                                                                  ║
 * ║  Description: Component to display session statistics dashboard with key metrics                ║
 * ║               including active sessions, login counts, and user role distribution.              ║
 * ║                                                                                                  ║
 * ║  Author: Akash Hasendra                                                                          ║
 * ║  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   ║
 * ║  License: MIT License with Sri Lankan Business Terms                                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import React from 'react';
import { Row, Col, Statistic, Button, Space, Tooltip } from 'antd';
import { 
  UserOutlined, 
  LoginOutlined, 
  ClockCircleOutlined,
  WarningOutlined,
  ReloadOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import { SessionStats as SessionStatsType } from '@/api/sessions';

interface SessionStatsProps {
  stats: SessionStatsType | null;
  onRefresh: () => void;
}

export const SessionStats: React.FC<SessionStatsProps> = ({ stats, onRefresh }) => {
  const { t } = useTranslation();

  if (!stats) {
    return null;
  }

  const getRoleDisplayName = (role: string): string => {
    return t(`auth.roles.${role.toLowerCase()}`);
  };

  const getAvgDurationText = (minutes: number): string => {
    if (minutes < 60) {
      return t('sessions.duration.minutes', { count: Math.round(minutes) });
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = Math.round(minutes % 60);
      if (remainingMinutes === 0) {
        return t('sessions.duration.hours', { count: hours });
      } else {
        return t('sessions.duration.hoursMinutes', { hours, minutes: remainingMinutes });
      }
    }
  };

  return (
    <div className="session-stats">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold mb-0">
          {t('sessions.stats.title')}
        </h3>
        <Space>
          <span className="text-sm text-gray-500">
            {t('sessions.stats.lastUpdated')}: {dayjs(stats.timestamp).format('HH:mm:ss')}
          </span>
          <Button 
            size="small" 
            icon={<ReloadOutlined />} 
            onClick={onRefresh}
          >
            {t('common.refresh')}
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        {/* Active Sessions */}
        <Col xs={24} sm={12} lg={6}>
          <div className="bg-blue-50 rounded-lg p-4">
            <Statistic
              title={t('sessions.stats.activeSessions')}
              value={stats.active_sessions}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
            />
          </div>
        </Col>

        {/* Today's Sessions */}
        <Col xs={24} sm={12} lg={6}>
          <div className="bg-green-50 rounded-lg p-4">
            <Statistic
              title={t('sessions.stats.todaySessions')}
              value={stats.today_sessions}
              prefix={<LoginOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
            />
          </div>
        </Col>

        {/* Failed Logins */}
        <Col xs={24} sm={12} lg={6}>
          <div className="bg-red-50 rounded-lg p-4">
            <Tooltip title={t('sessions.stats.failedLoginsTooltip')}>
              <Statistic
                title={t('sessions.stats.failedLogins')}
                value={stats.failed_logins_today}
                prefix={<WarningOutlined style={{ color: '#ff4d4f' }} />}
                valueStyle={{ 
                  color: stats.failed_logins_today > 5 ? '#ff4d4f' : '#595959', 
                  fontWeight: 'bold' 
                }}
              />
            </Tooltip>
          </div>
        </Col>

        {/* Average Session Duration */}
        <Col xs={24} sm={12} lg={6}>
          <div className="bg-purple-50 rounded-lg p-4">
            <Statistic
              title={t('sessions.stats.avgDuration')}
              value={getAvgDurationText(stats.average_session_duration_minutes)}
              prefix={<ClockCircleOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1', fontWeight: 'bold' }}
            />
          </div>
        </Col>
      </Row>

      {/* Sessions by Role */}
      {stats.sessions_by_role && Object.keys(stats.sessions_by_role).length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-medium mb-3 flex items-center">
            <TeamOutlined className="mr-2" />
            {t('sessions.stats.sessionsByRole')}
          </h4>
          
          <Row gutter={[12, 12]}>
            {Object.entries(stats.sessions_by_role || {}).map(([role, count]) => (
              <Col key={role} xs={12} sm={8} md={6}>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-700">
                      {count}
                    </div>
                    <div className="text-sm text-gray-500">
                      {getRoleDisplayName(role)}
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </div>
  );
};

export default SessionStats;