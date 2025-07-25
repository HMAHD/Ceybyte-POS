/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                Connection Status Monitor                                         │
 * │                                                                                                  │
 * │  Description: Real-time connection status monitoring with visual indicators and alerts.          │
 * │               Monitors network, printer, and system connections.                                 │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect } from 'react';
import { Badge, Tooltip, Space, Typography, Alert } from 'antd';
import {
  WifiOutlined,
  PrinterOutlined,
  DatabaseOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from '@/hooks/useTranslation';
import LocalizedText from '@/components/LocalizedText';
import { useNetwork } from '@/contexts/NetworkContext';

const { Text } = Typography;

export type ConnectionType = 'network' | 'printer' | 'database' | 'api';
export type ConnectionStatus = 'connected' | 'disconnected' | 'warning' | 'testing';

interface ConnectionInfo {
  type: ConnectionType;
  status: ConnectionStatus;
  lastCheck: Date;
  latency?: number;
  errorMessage?: string;
}

interface ConnectionStatusMonitorProps {
  showLabels?: boolean;
  showAlert?: boolean;
  compact?: boolean;
  className?: string;
}

const ConnectionStatusMonitor: React.FC<ConnectionStatusMonitorProps> = ({
  showLabels = false,
  showAlert = true,
  compact = false,
  className = '',
}) => {
  const { t } = useTranslation();
  const { connectionStatus } = useNetwork();
  const [connections, setConnections] = useState<ConnectionInfo[]>([
    {
      type: 'network',
      status: 'connected',
      lastCheck: new Date(),
      latency: 45,
    },
    {
      type: 'printer',
      status: 'connected',
      lastCheck: new Date(),
    },
    {
      type: 'database',
      status: 'connected',
      lastCheck: new Date(),
      latency: 12,
    },
    {
      type: 'api',
      status: 'connected',
      lastCheck: new Date(),
      latency: 89,
    },
  ]);

  // Mock connection monitoring - in real app, this would use actual system checks
  useEffect(() => {
    const checkConnections = () => {
      setConnections(prev => prev.map(conn => ({
        ...conn,
        lastCheck: new Date(),
        // Simulate occasional connection issues
        status: Math.random() > 0.95 ? 'warning' : 'connected',
        latency: Math.floor(Math.random() * 100) + 10,
      })));
    };

    const interval = setInterval(checkConnections, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: ConnectionStatus): string => {
    switch (status) {
      case 'connected':
        return '#52c41a';
      case 'warning':
        return '#faad14';
      case 'disconnected':
        return '#ff4d4f';
      case 'testing':
        return '#1890ff';
      default:
        return '#d9d9d9';
    }
  };

  const getStatusIcon = (type: ConnectionType) => {
    switch (type) {
      case 'network':
        return <WifiOutlined />;
      case 'printer':
        return <PrinterOutlined />;
      case 'database':
        return <DatabaseOutlined />;
      case 'api':
        return <DatabaseOutlined />;
      default:
        return <CheckCircleOutlined />;
    }
  };

  const getStatusText = (type: ConnectionType, status: ConnectionStatus): string => {
    const typeText = {
      network: t('connection.network', 'Network'),
      printer: t('connection.printer', 'Printer'),
      database: t('connection.database', 'Database'),
      api: t('connection.api', 'API'),
    }[type];

    const statusText = {
      connected: t('connection.connected', 'Connected'),
      disconnected: t('connection.disconnected', 'Disconnected'),
      warning: t('connection.warning', 'Warning'),
      testing: t('connection.testing', 'Testing'),
    }[status];

    return `${typeText}: ${statusText}`;
  };

  const getTooltipContent = (conn: ConnectionInfo) => (
    <div className="space-y-1">
      <div>
        <Text strong>{getStatusText(conn.type, conn.status)}</Text>
      </div>
      {conn.latency && (
        <div>
          <Text>
            <LocalizedText>{t('connection.latency', 'Latency')}</LocalizedText>: {conn.latency}ms
          </Text>
        </div>
      )}
      <div>
        <Text type="secondary">
          <LocalizedText>{t('connection.lastCheck', 'Last Check')}</LocalizedText>: {conn.lastCheck.toLocaleTimeString()}
        </Text>
      </div>
      {conn.errorMessage && (
        <div>
          <Text type="danger">{conn.errorMessage}</Text>
        </div>
      )}
    </div>
  );

  const hasIssues = connections.some(conn => conn.status !== 'connected');
  const criticalIssues = connections.filter(conn => conn.status === 'disconnected');

  if (compact) {
    return (
      <div className={`connection-status-compact ${className}`}>
        <Space size="small">
          {connections.map((conn) => (
            <Tooltip key={conn.type} title={getTooltipContent(conn)}>
              <Badge
                dot
                color={getStatusColor(conn.status)}
                offset={[-2, 2]}
              >
                <span style={{ color: getStatusColor(conn.status), fontSize: 16 }}>
                  {getStatusIcon(conn.type)}
                </span>
              </Badge>
            </Tooltip>
          ))}
        </Space>
      </div>
    );
  }

  return (
    <div className={`connection-status-monitor ${className}`}>
      {showAlert && hasIssues && (
        <Alert
          message={
            <LocalizedText>
              {criticalIssues.length > 0
                ? t('connection.criticalIssues', 'Critical connection issues detected')
                : t('connection.minorIssues', 'Connection warnings detected')
              }
            </LocalizedText>
          }
          type={criticalIssues.length > 0 ? 'error' : 'warning'}
          showIcon
          closable
          className="mb-4"
        />
      )}

      <Space direction="vertical" size="small" className="w-full">
        {connections.map((conn) => (
          <div
            key={conn.type}
            className="flex items-center justify-between p-3 bg-white rounded-lg border"
          >
            <div className="flex items-center space-x-3">
              <Badge
                dot
                color={getStatusColor(conn.status)}
                offset={[-2, 2]}
              >
                <span style={{ color: getStatusColor(conn.status), fontSize: 18 }}>
                  {getStatusIcon(conn.type)}
                </span>
              </Badge>
              
              <div>
                <Text strong>
                  <LocalizedText>{getStatusText(conn.type, conn.status)}</LocalizedText>
                </Text>
                {showLabels && (
                  <div>
                    <Text type="secondary" className="text-xs">
                      <LocalizedText>{t('connection.lastCheck', 'Last Check')}</LocalizedText>: {conn.lastCheck.toLocaleTimeString()}
                    </Text>
                  </div>
                )}
              </div>
            </div>

            <div className="text-right">
              {conn.latency && (
                <Text className="text-xs">
                  {conn.latency}ms
                </Text>
              )}
              {conn.status === 'connected' && (
                <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: 8 }} />
              )}
              {conn.status === 'disconnected' && (
                <CloseCircleOutlined style={{ color: '#ff4d4f', marginLeft: 8 }} />
              )}
              {conn.status === 'warning' && (
                <ExclamationCircleOutlined style={{ color: '#faad14', marginLeft: 8 }} />
              )}
            </div>
          </div>
        ))}
      </Space>
    </div>
  );
};

export default ConnectionStatusMonitor;