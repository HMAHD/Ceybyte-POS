/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                  Network Status Monitor                                          │
 * │                                                                                                  │
 * │  Description: Real-time network status monitoring component for multi-terminal POS.              │
 * │               Shows connectivity status, sync progress, and terminal health.                     │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Badge,
  Popover,
  Card,
  Space,
  Typography,
  Tag,
  Button,
  Alert,
  Divider,
} from 'antd';
import {
  WifiOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  DesktopOutlined,
} from '@ant-design/icons';
import { useTranslation } from '../hooks/useTranslation';
import LocalizedText from './LocalizedText';
import type { NetworkConnectivity, Terminal } from '../types/terminal';
import {
  testNetworkConnectivity,
  discoverTerminals,
  startHeartbeatMonitor,
  stopHeartbeatMonitor,
} from '../api/terminals.api';

const { Text } = Typography;

interface NetworkStatusMonitorProps {
  networkPath?: string;
  terminalType?: string;
  showDetails?: boolean;
  onStatusChange?: (status: NetworkConnectivity) => void;
}

export const NetworkStatusMonitor: React.FC<NetworkStatusMonitorProps> = ({
  networkPath,
  terminalType = 'client',
  showDetails = false,
  onStatusChange,
}) => {
  const { t } = useTranslation();

  const [connectivity, setConnectivity] = useState<NetworkConnectivity>({
    network_available: false,
    main_computer_reachable: false,
    shared_folder_accessible: false,
    database_accessible: false,
    latency_ms: undefined,
    error_message: undefined,
  });

  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  // Check network connectivity
  const checkConnectivity = useCallback(async () => {
    try {
      setIsChecking(true);

      const response = await testNetworkConnectivity({
        network_path: networkPath,
        terminal_type: terminalType,
      });

      if (response.success) {
        setConnectivity(response.connectivity);
        setLastCheck(new Date());

        if (onStatusChange) {
          onStatusChange(response.connectivity);
        }
      }
    } catch (error) {
      console.error('Network connectivity check failed:', error);
      setConnectivity({
        network_available: false,
        main_computer_reachable: false,
        shared_folder_accessible: false,
        database_accessible: false,
        latency_ms: undefined,
        error_message: error instanceof Error ? error.message : 'Connection failed',
      });
    } finally {
      setIsChecking(false);
    }
  }, [networkPath, terminalType, onStatusChange]);

  // Load terminals
  const loadTerminals = useCallback(async () => {
    try {
      const response = await discoverTerminals();
      if (response.success) {
        setTerminals(response.terminals);
      }
    } catch (error) {
      console.error('Failed to load terminals:', error);
    }
  }, []);

  // Initialize monitoring
  useEffect(() => {
    // Initial check
    checkConnectivity();
    loadTerminals();

    // Set up periodic connectivity checks
    const connectivityInterval = setInterval(checkConnectivity, 30000); // Every 30 seconds

    // Set up terminal discovery refresh
    const terminalInterval = setInterval(loadTerminals, 60000); // Every minute

    // Set up heartbeat monitoring
    const heartbeatId = startHeartbeatMonitor(30000);

    return () => {
      clearInterval(connectivityInterval);
      clearInterval(terminalInterval);
      if (heartbeatId) {
        stopHeartbeatMonitor(heartbeatId);
      }
    };
  }, [checkConnectivity, loadTerminals]);

  // Get overall status
  const getOverallStatus = (): 'online' | 'offline' | 'warning' => {
    if (!connectivity.network_available) return 'offline';
    if (terminalType === 'main') return 'online';
    if (connectivity.main_computer_reachable && connectivity.database_accessible) {
      return 'online';
    }
    if (connectivity.main_computer_reachable) return 'warning';
    return 'offline';
  };

  // Get status icon
  const getStatusIcon = () => {
    const status = getOverallStatus();
    switch (status) {
      case 'online':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'warning':
        return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
      case 'offline':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
    }
  };

  // Get status color
  const getStatusColor = (): 'success' | 'warning' | 'error' => {
    const status = getOverallStatus();
    switch (status) {
      case 'online':
        return 'success';
      case 'warning':
        return 'warning';
      case 'offline':
        return 'error';
    }
  };

  // Get status text
  const getStatusText = (): string => {
    const status = getOverallStatus();
    switch (status) {
      case 'online':
        return t('network.status.online', 'Online');
      case 'warning':
        return t('network.status.warning', 'Limited');
      case 'offline':
        return t('network.status.offline', 'Offline');
    }
  };

  // Render detailed status
  const renderDetailedStatus = () => (
    <Card size="small" style={{ width: 350 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text strong>
            <LocalizedText>{t('network.connectivity', 'Network Connectivity')}</LocalizedText>
          </Text>
          {lastCheck && (
            <Text type="secondary" style={{ float: 'right', fontSize: '12px' }}>
              {t('network.lastCheck', 'Last check')}: {lastCheck.toLocaleTimeString()}
            </Text>
          )}
        </div>

        <Space direction="vertical" style={{ width: '100%' }} size="small">
          <div className="flex justify-between items-center">
            <Text>{t('network.basicConnectivity', 'Internet')}</Text>
            <Tag color={connectivity.network_available ? 'green' : 'red'}>
              {connectivity.network_available ? 'OK' : 'Failed'}
            </Tag>
          </div>

          {terminalType === 'client' && (
            <>
              <div className="flex justify-between items-center">
                <Text>{t('network.mainComputer', 'Main Computer')}</Text>
                <Tag color={connectivity.main_computer_reachable ? 'green' : 'red'}>
                  {connectivity.main_computer_reachable ? 'Reachable' : 'Unreachable'}
                </Tag>
              </div>

              <div className="flex justify-between items-center">
                <Text>{t('network.sharedFolder', 'Shared Folder')}</Text>
                <Tag color={connectivity.shared_folder_accessible ? 'green' : 'red'}>
                  {connectivity.shared_folder_accessible ? 'Accessible' : 'Blocked'}
                </Tag>
              </div>
            </>
          )}

          <div className="flex justify-between items-center">
            <Text>{t('network.database', 'Database')}</Text>
            <Tag color={connectivity.database_accessible ? 'green' : 'red'}>
              {connectivity.database_accessible ? 'Connected' : 'Disconnected'}
            </Tag>
          </div>

          {connectivity.latency_ms && (
            <div className="flex justify-between items-center">
              <Text>{t('network.latency', 'Latency')}</Text>
              <Text>
                {connectivity.latency_ms}ms
                <Tag
                  color={
                    connectivity.latency_ms < 50
                      ? 'green'
                      : connectivity.latency_ms < 200
                        ? 'orange'
                        : 'red'
                  }
                  style={{ marginLeft: 8 }}
                >
                  {connectivity.latency_ms < 50
                    ? 'Excellent'
                    : connectivity.latency_ms < 200
                      ? 'Good'
                      : 'Slow'}
                </Tag>
              </Text>
            </div>
          )}
        </Space>

        {connectivity.error_message && (
          <Alert
            type="error"
            message={connectivity.error_message}
            showIcon
          />
        )}

        <Divider style={{ margin: '8px 0' }} />

        <div>
          <Text strong>
            <LocalizedText>{t('network.terminals', 'Network Terminals')}</LocalizedText>
          </Text>
          <Text type="secondary" style={{ float: 'right' }}>
            {terminals.length} {t('network.found', 'found')}
          </Text>
        </div>

        <Space direction="vertical" style={{ width: '100%' }} size="small">
          {terminals.slice(0, 3).map((terminal) => (
            <div key={terminal.terminal_id} className="flex justify-between items-center">
              <Space size="small">
                {terminal.is_main_terminal ? (
                  <DesktopOutlined style={{ color: '#1890ff' }} />
                ) : (
                  <DesktopOutlined style={{ color: '#52c41a' }} />
                )}
                <Text style={{ fontSize: '12px' }}>{terminal.terminal_name}</Text>
              </Space>
              <Tag
                color={terminal.is_online ? 'green' : 'red'}
              >
                {terminal.is_online ? 'Online' : 'Offline'}
              </Tag>
            </div>
          ))}

          {terminals.length > 3 && (
            <Text type="secondary" style={{ fontSize: '12px', textAlign: 'center' }}>
              +{terminals.length - 3} more terminals
            </Text>
          )}
        </Space>

        <Button
          type="link"
          size="small"
          icon={<ReloadOutlined />}
          onClick={checkConnectivity}
          loading={isChecking}
          style={{ padding: 0 }}
        >
          <LocalizedText>{t('network.refresh', 'Refresh Status')}</LocalizedText>
        </Button>
      </Space>
    </Card>
  );

  // Simple status indicator
  const statusIndicator = (
    <Badge status={getStatusColor()} text={getStatusText()}>
      <Space size="small">
        {getStatusIcon()}
        <WifiOutlined />
      </Space>
    </Badge>
  );

  if (showDetails) {
    return renderDetailedStatus();
  }

  return (
    <Popover
      content={renderDetailedStatus()}
      title={
        <Space>
          <WifiOutlined />
          <LocalizedText>{t('network.status', 'Network Status')}</LocalizedText>
        </Space>
      }
      trigger="hover"
      placement="bottomRight"
    >
      <div style={{ cursor: 'pointer' }}>
        {statusIndicator}
      </div>
    </Popover>
  );
};

export default NetworkStatusMonitor;