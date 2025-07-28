/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                    UPS Status Indicator                                          │
 * │                                                                                                  │
 * │  Description: Real-time UPS (Uninterruptible Power Supply) status monitoring component.          │
 * │               Shows battery level, power status, and estimated runtime.                          │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React from 'react';
import { Tooltip, Progress, Badge, Typography } from 'antd';
import {
  ThunderboltOutlined,
  PoweroffOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from '@/hooks/useTranslation';
import LocalizedText from '@/components/LocalizedText';
import { POS_TOKENS } from '@/theme/designSystem';
import { usePower } from '@/contexts/PowerContext';

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
  const { upsInfo } = usePower();

  // Convert power context UPS info to component format
  const componentUpsInfo: UPSInfo = {
    status: upsInfo.status,
    batteryLevel: upsInfo.batteryLevel,
    estimatedRuntime: upsInfo.estimatedRuntime,
    isCharging: upsInfo.isCharging,
    lastUpdate: new Date(upsInfo.lastUpdate),
    model: upsInfo.model,
    voltage: upsInfo.voltage,
  };

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
        return <PoweroffOutlined style={{ color: getStatusColor(status) }} />;
      case 'low_battery':
      case 'critical':
        return (
          <ExclamationCircleOutlined
            style={{ color: getStatusColor(status) }}
          />
        );
      case 'not_detected':
        return <PoweroffOutlined style={{ color: getStatusColor(status) }} />;
      default:
        return <PoweroffOutlined style={{ color: getStatusColor(status) }} />;
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

  if (componentUpsInfo.status === 'not_detected') {
    return null; // Don't show indicator if no UPS detected
  }

  const tooltipContent = (
    <div className='space-y-2'>
      <div>
        <Text strong>
          <LocalizedText>{getStatusText(componentUpsInfo.status)}</LocalizedText>
        </Text>
      </div>
      <div>
        <Text>
          <LocalizedText>
            {t('ups.batteryLevel', 'Battery Level')}
          </LocalizedText>
          : {componentUpsInfo.batteryLevel}%
        </Text>
      </div>
      <div>
        <Text>
          <LocalizedText>{t('ups.estimatedRuntime', 'Runtime')}</LocalizedText>:{' '}
          {formatRuntime(componentUpsInfo.estimatedRuntime)}
        </Text>
      </div>
      {componentUpsInfo.model && (
        <div>
          <Text>
            <LocalizedText>{t('ups.model', 'Model')}</LocalizedText>:{' '}
            {componentUpsInfo.model}
          </Text>
        </div>
      )}
      {componentUpsInfo.voltage && (
        <div>
          <Text>
            <LocalizedText>{t('ups.voltage', 'Voltage')}</LocalizedText>:{' '}
            {componentUpsInfo.voltage}V
          </Text>
        </div>
      )}
      <div>
        <Text type='secondary'>
          <LocalizedText>{t('ups.lastUpdate', 'Last Update')}</LocalizedText>:{' '}
          {componentUpsInfo.lastUpdate.toLocaleTimeString()}
        </Text>
      </div>
    </div>
  );

  if (showDetails) {
    return (
      <div className={`ups-status-detailed ${className}`}>
        <div className='flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm border'>
          <div className='flex items-center space-x-2'>
            {getStatusIcon(componentUpsInfo.status)}
            <Text strong className='text-sm'>
              <LocalizedText>{getStatusText(componentUpsInfo.status)}</LocalizedText>
            </Text>
          </div>

          <div className='flex-1'>
            <Progress
              percent={componentUpsInfo.batteryLevel}
              size='small'
              strokeColor={getBatteryColor(componentUpsInfo.batteryLevel)}
              showInfo={false}
            />
          </div>

          <div className='text-right'>
            <Text className='text-xs font-medium'>{componentUpsInfo.batteryLevel}%</Text>
            <br />
            <Text className='text-xs text-gray-500'>
              {formatRuntime(componentUpsInfo.estimatedRuntime)}
            </Text>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Tooltip title={tooltipContent} placement='bottomRight'>
      <Badge
        dot={componentUpsInfo.status === 'low_battery' || componentUpsInfo.status === 'critical'}
        status={
          componentUpsInfo.status === 'online'
            ? 'success'
            : componentUpsInfo.status === 'on_battery'
              ? 'warning'
              : 'error'
        }
      >
        <div className={`ups-status-compact cursor-pointer ${className}`}>
          {getStatusIcon(componentUpsInfo.status)}
          {size !== 'small' && (
            <Text className='ml-1 text-xs'>{componentUpsInfo.batteryLevel}%</Text>
          )}
        </div>
      </Badge>
    </Tooltip>
  );
};

export default UPSStatusIndicator;
