/*
 * ╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                        CEYBYTE POS                                               ║
 * ║                                                                                                  ║
 * ║                                   Session Management UI                                          ║
 * ║                                                                                                  ║
 * ║  Description: Main session management interface with active sessions, login history,            ║
 * ║               audit logs, and administrative controls for user session monitoring.               ║
 * ║                                                                                                  ║
 * ║  Author: Akash Hasendra                                                                          ║
 * ║  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   ║
 * ║  License: MIT License with Sri Lankan Business Terms                                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import React, { useState, useEffect } from 'react';
import { Card, Tabs, Space, Spin, message } from 'antd';
import { 
  ClockCircleOutlined, 
  UserOutlined, 
  SafetyOutlined, 
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { ActiveSessions } from './ActiveSessions';
import { LoginHistory } from './LoginHistory';
import { AuditLogs } from './AuditLogs';
import { SessionStats } from './SessionStats';
import { sessionsAPI, SessionStats as SessionStatsType } from '@/api/sessions';

const { TabPane } = Tabs;

interface SessionsProps {
  className?: string;
}

export const Sessions: React.FC<SessionsProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('active');
  const [sessionStats, setSessionStats] = useState<SessionStatsType | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSessionStats = async () => {
    try {
      const response = await sessionsAPI.getSessionStats();
      if (response.success && response.data) {
        setSessionStats(response.data);
      } else {
        message.error(t('sessions.stats.loadError'));
      }
    } catch (error) {
      message.error(t('sessions.stats.loadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessionStats();
    
    // Auto-refresh stats every 30 seconds
    const interval = setInterval(loadSessionStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const onSessionUpdate = () => {
    // Refresh stats when sessions are updated
    loadSessionStats();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className={`session-management ${className}`}>
      <Space direction="vertical" size="large" className="w-full">
        {/* Header with Stats */}
        <Card className="glass-morphism">
          <SessionStats stats={sessionStats} onRefresh={loadSessionStats} />
        </Card>

        {/* Main Content Tabs */}
        <Card className="glass-morphism">
          <Tabs 
            activeKey={activeTab} 
            onChange={handleTabChange}
            type="card"
            className="sessions-tabs"
          >
            <TabPane 
              tab={
                <span>
                  <UserOutlined />
                  {t('sessions.tabs.active')}
                  {sessionStats && (
                    <span className="ml-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                      {sessionStats.active_sessions}
                    </span>
                  )}
                </span>
              } 
              key="active"
            >
              <ActiveSessions onSessionUpdate={onSessionUpdate} />
            </TabPane>
            
            <TabPane 
              tab={
                <span>
                  <ClockCircleOutlined />
                  {t('sessions.tabs.history')}
                </span>
              } 
              key="history"
            >
              <LoginHistory />
            </TabPane>
            
            <TabPane 
              tab={
                <span>
                  <SafetyOutlined />
                  {t('sessions.tabs.audit')}
                </span>
              } 
              key="audit"
            >
              <AuditLogs />
            </TabPane>
          </Tabs>
        </Card>
      </Space>
    </div>
  );
};

export default Sessions;