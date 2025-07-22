/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                    UPS Status Indicator                                          │
 * │                                                                                                  │
 * │  Description: Real-time UPS (Uninterruptible Power Supply) status monitoring component.         │
 * │               Shows battery level, power status, and estimated runtime.                         │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect } from 'react';
import { Tooltip, Progress, Badge, Typography } from 'antd';
import {
  ThunderboltOutlined,
  BatteryOutlined,
  ExclamationTriangleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from '@/hooks/useTranslation';
import LocalizedText from '@/components/LocalizedText';
import { POS_TOKENS } from '@/theme/designSystem';

const { Text } = Typography;

export type UPSStatus =
  | 'online'
  | 'on_battery'
  | 'low_battery'
  | 'critical'
  | 'not_detected';

export interface UPSInfo {
  status: UPSStatus;
  batteryLevel: number; // 0-100
  estimatedRuntime: number; // minutes
  isCharging: boolean;
  lastUpdate: Date;
  model?: string;
  voltage?: number;
}

interface UPSStatusIndicatorProps {
  className?: string;
  showDetails?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const UPSStatusIndicator: React.FC<UPSStatusIndicatorProps> = ({
  className = '',
  showDetails = false,
  size = 'medium',
}) => {
  const { t } = useTranslation();
  const [upsInfo, setUpsInfo] = useState<UPSInfo>({
    status: 'not_detected',
    batteryLevel: 0,
    estimatedRuntime: 0,
    isCharging: false,
    lastUpdate: new Date(),
  });

  // Mock UPS monitoring - in real app, this would use Tauri APIs to check UPS status
  useEffect(() => {
    const checkUPSStatus = () => {
      // Simulate UPS detection and status
      const mockStatuses: UPSStatus[] = [
        'online',
        'on_battery',
        'low_battery',
        'not_detected',
      ];
      const randomStatus =
        mockStatuses[Math.floor(Math.random() * mockStatuses.length)];

      setUpsInfo({
        status: 'online', // For demo, always show as online
        batteryLevel: 85,
        estimatedRuntime: 45,
        isCharging: true,
        lastUpdate: new Date(),
        model: 'Generic UPS 650VA',
        voltage: 230,
      });
    };

    // Initial check
    checkUPSStatus();

    // Update every 30 seconds
    const interval = setInterval(checkUPSStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: UPSStatus): string => {
    switch (status) {
      case 'online':
        return POS_TOKENS.status.online;
      case 'on_battery':
        return POS_TOKENS.status.warning;
      case 'low_battery':
      case 'critical':
        return POS_TOKENS.status.error;
      case 'not_detected':
        return POS_TOKENS.status.offline;
      default:
        return POS_TOKENS.status.offline;
    }
  };

  const getStatusIcon = (status: UPSStatus) => {
    switch (status) {
      case 'online':
        return (
          <ThunderboltOutlined style={{ color: getStatusColor(status) }} />
        );
      case 'on_battery':
        return <BatteryOutlined style={{ color: getStatusColor(status) }} />;
      case 'low_battery':
      case 'critical':
        return (
          <ExclamationTriangleOutlined
            style={{ color: getStatusColor(status) }}
          />
        );
      case 'not_detected':
        return <BatteryOutlined style={{ color: getStatusColor(status) }} />;
      default:
        return <BatteryOutlined style={{ color: getStatusColor(status) }} />;
    }
  };

  const getStatusText = (status: UPSStatus): string => {
    switch (status) {
      case 'online':
        return t('ups.online', 'UPS Online');
      case 'on_battery':
        return t('ups.onBattery', 'On Battery');
      case 'low_battery':
        return t('ups.lowBattery', 'Low Battery');
      case 'critical':
        return t('ups.critical', 'Critical Battery');
      case 'not_detected':
        return t('ups.notDetected', 'UPS Not Detected');
      default:
        return t('ups.unknown', 'Unknown Status');
    }
  };

  const getBatteryColor = (level: number): string => {
    if (level > 50) return POS_TOKENS.status.online;
    if (level > 20) return POS_TOKENS.status.warning;
    return POS_TOKENS.status.error;
  };

  const formatRuntime = (minutes: number): string => {
    if (minutes < 60) {
      return t('ups.minutesRemaining', `${minutes} min`);
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return t('ups.hoursMinutesRemaining', `${hours}h ${remainingMinutes}m`);
  };

  if (upsInfo.status === 'not_detected') {
    return null; // Don't show indicator if no UPS detected
  }

  const tooltipContent = (
    <div className='space-y-2'>
      <div>
        <Text strong>
          <LocalizedText>{getStatusText(upsInfo.status)}</LocalizedText>
        </Text>
      </div>
      <div>
        <Text>
          <LocalizedText>
            {t('ups.batteryLevel', 'Battery Level')}
          </LocalizedText>
          : {upsInfo.batteryLevel}%
        </Text>
      </div>
      <div>
        <Text>
          <LocalizedText>{t('ups.estimatedRuntime', 'Runtime')}</LocalizedText>:{' '}
          {formatRuntime(upsInfo.estimatedRuntime)}
        </Text>
      </div>
      {upsInfo.model && (
        <div>
          <Text>
            <LocalizedText>{t('ups.model', 'Model')}</LocalizedText>:{' '}
            {upsInfo.model}
          </Text>
        </div>
      )}
      {upsInfo.voltage && (
        <div>
          <Text>
            <LocalizedText>{t('ups.voltage', 'Voltage')}</LocalizedText>:{' '}
            {upsInfo.voltage}V
          </Text>
        </div>
      )}
      <div>
        <Text type='secondary'>
          <LocalizedText>{t('ups.lastUpdate', 'Last Update')}</LocalizedText>:{' '}
          {upsInfo.lastUpdate.toLocaleTimeString()}
        </Text>
      </div>
    </div>
  );

  if (showDetails) {
    return (
      <div className={`ups-status-detailed ${className}`}>
        <div className='flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm border'>
          <div className='flex items-center space-x-2'>
            {getStatusIcon(upsInfo.status)}
            <Text strong className='text-sm'>
              <LocalizedText>{getStatusText(upsInfo.status)}</LocalizedText>
            </Text>
          </div>

          <div className='flex-1'>
            <Progress
              percent={upsInfo.batteryLevel}
              size='small'
              strokeColor={getBatteryColor(upsInfo.batteryLevel)}
              showInfo={false}
            />
          </div>

          <div className='text-right'>
            <Text className='text-xs font-medium'>{upsInfo.batteryLevel}%</Text>
            <br />
            <Text className='text-xs text-gray-500'>
              {formatRuntime(upsInfo.estimatedRuntime)}
            </Text>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Tooltip title={tooltipContent} placement='bottomRight'>
      <Badge
        dot={upsInfo.status === 'low_battery' || upsInfo.status === 'critical'}
        status={
          upsInfo.status === 'online'
            ? 'success'
            : upsInfo.status === 'on_battery'
              ? 'warning'
              : 'error'
        }
      >
        <div className={`ups-status-compact cursor-pointer ${className}`}>
          {getStatusIcon(upsInfo.status)}
          {size !== 'small' && (
            <Text className='ml-1 text-xs'>{upsInfo.batteryLevel}%</Text>
          )}
        </div>
      </Badge>
    </Tooltip>
  );
};

export default UPSStatusIndicator;
