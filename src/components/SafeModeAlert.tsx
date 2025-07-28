/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                    Safe Mode Alert                                               │
 * │                                                                                                  │
 * │  Description: Alert component that displays when safe mode is active due to low battery.         │
 * │               Prevents new transactions and shows power status information.                       │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React from 'react';
import { Alert, Progress, Typography, Space } from 'antd';
import { ExclamationCircleOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useTranslation } from '@/hooks/useTranslation';
import LocalizedText from '@/components/LocalizedText';
import { usePower } from '@/contexts/PowerContext';

const { Text } = Typography;

interface SafeModeAlertProps {
  className?: string;
  showDetails?: boolean;
}

export const SafeModeAlert: React.FC<SafeModeAlertProps> = ({
  className = '',
  showDetails = true,
}) => {
  const { t } = useTranslation();
  const { upsInfo, safeMode } = usePower();

  if (!safeMode) {
    return null;
  }

  const getBatteryColor = (level: number): string => {
    if (level > 20) return '#faad14'; // warning orange
    return '#f5222d'; // error red
  };

  const formatRuntime = (minutes: number): string => {
    if (minutes < 60) {
      return t('ups.minutesRemaining', `${minutes} min`);
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return t('ups.hoursMinutesRemaining', `${hours}h ${remainingMinutes}m`);
  };

  const alertMessage = (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <ExclamationCircleOutlined className="text-lg" />
        <Text strong className="text-base">
          <LocalizedText>
            {t('power.safeModeActive', 'Safe Mode Active - Low Battery Detected')}
          </LocalizedText>
        </Text>
      </div>
      
      {showDetails && (
        <div className="space-y-3 mt-3">
          <div className="flex items-center justify-between">
            <Text>
              <LocalizedText>{t('ups.batteryLevel', 'Battery Level')}</LocalizedText>:
            </Text>
            <div className="flex items-center space-x-2 flex-1 ml-4">
              <Progress
                percent={upsInfo.batteryLevel}
                size="small"
                strokeColor={getBatteryColor(upsInfo.batteryLevel)}
                className="flex-1"
              />
              <Text strong>{upsInfo.batteryLevel}%</Text>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Text>
              <LocalizedText>{t('ups.estimatedRuntime', 'Estimated Runtime')}</LocalizedText>:
            </Text>
            <Text strong>{formatRuntime(upsInfo.estimatedRuntime)}</Text>
          </div>
          
          <div className="flex items-center justify-between">
            <Text>
              <LocalizedText>{t('ups.status', 'UPS Status')}</LocalizedText>:
            </Text>
            <Space>
              <ThunderboltOutlined 
                style={{ 
                  color: upsInfo.status === 'online' ? '#52c41a' : '#faad14' 
                }} 
              />
              <Text strong>
                <LocalizedText>
                  {upsInfo.status === 'online' 
                    ? t('ups.online', 'Online') 
                    : upsInfo.status === 'on_battery'
                    ? t('ups.onBattery', 'On Battery')
                    : upsInfo.status === 'low_battery'
                    ? t('ups.lowBattery', 'Low Battery')
                    : t('ups.critical', 'Critical Battery')
                  }
                </LocalizedText>
              </Text>
            </Space>
          </div>
        </div>
      )}
    </div>
  );

  const alertDescription = (
    <div className="mt-2">
      <Text>
        <LocalizedText>
          {t('power.safeModeDescription', 
            'New transactions are temporarily disabled to prevent data loss. ' +
            'Current transactions will be automatically saved. Normal operation will resume when power is restored.'
          )}
        </LocalizedText>
      </Text>
    </div>
  );

  return (
    <Alert
      message={alertMessage}
      description={alertDescription}
      type="warning"
      showIcon={false}
      className={`safe-mode-alert ${className}`}
      style={{
        borderColor: '#faad14',
        backgroundColor: '#fffbe6',
        borderWidth: 2,
      }}
    />
  );
};

export default SafeModeAlert;