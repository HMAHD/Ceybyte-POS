/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                      Alerts Card Component                                       │
 * │                                                                                                  │
 * │  Description: Smart alerts system for low stock, overdue payments, and actionable              │
 * │               notifications with priority-based display.                                        │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                  │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect } from 'react';
import { Card, List, Badge, Typography, Button, Spin, Alert, Empty } from 'antd';
import {
  ExclamationCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  BellOutlined
} from '@ant-design/icons';
import { useTranslation } from '@/hooks/useTranslation';
import LocalizedText from '@/components/LocalizedText';
import { dashboardApi, AlertItem } from '@/api/dashboard.api';

const { Title, Text } = Typography;

const AlertsCard: React.FC = () => {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardApi.getAlerts();

      if (response.success && response.data) {
        // Sort alerts by severity and creation time
        const sortedAlerts = response.data.sort((a, b) => {
          const severityOrder = { high: 3, medium: 2, low: 1 };
          const severityDiff = severityOrder[b.severity as keyof typeof severityOrder] -
            severityOrder[a.severity as keyof typeof severityOrder];

          if (severityDiff !== 0) return severityDiff;

          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        setAlerts(sortedAlerts);
      } else {
        setError(response.error || 'Failed to load alerts');
      }
    } catch (err) {
      console.error('Alerts loading error:', err);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <ExclamationCircleOutlined style={{ color: '#f5222d' }} />;
      case 'medium':
        return <WarningOutlined style={{ color: '#faad14' }} />;
      case 'low':
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
      default:
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'processing';
      default:
        return 'default';
    }
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'low_stock':
        return t('dashboard.lowStock', 'Low Stock');
      case 'overdue_payment':
        return t('dashboard.overduePayment', 'Overdue Payment');
      case 'cash_drawer':
        return t('dashboard.cashDrawer', 'Cash Drawer');
      case 'system':
        return t('dashboard.system', 'System');
      default:
        return t('dashboard.notification', 'Notification');
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - alertTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return t('dashboard.justNow') || 'Just now';
    if (diffInMinutes < 60) {
      return diffInMinutes === 1
        ? t('dashboard.minuteAgo') || '1 minute ago'
        : `${diffInMinutes} minutes ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return diffInHours === 1
        ? t('dashboard.hourAgo') || '1 hour ago'
        : `${diffInHours} hours ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    return diffInDays === 1
      ? t('dashboard.dayAgo') || '1 day ago'
      : `${diffInDays} days ago`;
  };

  if (loading) {
    return (
      <Card className="ceybyte-card h-full">
        <div className="flex items-center justify-center h-64">
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="ceybyte-card h-full">
        <Alert
          message="Error Loading Alerts"
          description={error}
          type="error"
          action={
            <button
              onClick={loadAlerts}
              className="text-blue-600 hover:text-blue-800"
            >
              <ReloadOutlined /> Retry
            </button>
          }
        />
      </Card>
    );
  }

  return (
    <Card
      className="ceybyte-card h-full"
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BellOutlined />
            <Title level={4} className="mb-0">
              <LocalizedText>{t('dashboard.alerts', 'Alerts')}</LocalizedText>
            </Title>
            {alerts.length > 0 && (
              <Badge count={alerts.filter(a => a.action_required).length} />
            )}
          </div>
          <button
            onClick={loadAlerts}
            className="text-gray-500 hover:text-gray-700"
          >
            <ReloadOutlined />
          </button>
        </div>
      }
    >
      {alerts.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <LocalizedText>{t('dashboard.noAlerts', 'No alerts at this time')}</LocalizedText>
          }
        />
      ) : (
        <div className="max-h-80 overflow-y-auto">
          <List
            size="small"
            dataSource={alerts}
            renderItem={(alert) => (
              <List.Item className="px-0">
                <div className="flex items-start space-x-3 w-full">
                  <div className="flex-shrink-0 mt-1">
                    {getSeverityIcon(alert.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <Text strong className="text-sm">
                        {alert.title}
                      </Text>
                      <div className="flex items-center space-x-2">
                        <Badge
                          status={getSeverityColor(alert.severity) as any}
                          text={getAlertTypeLabel(alert.type)}
                        />
                      </div>
                    </div>
                    <Text className="text-xs text-gray-600 block mb-2">
                      {alert.message}
                    </Text>
                    <div className="flex items-center justify-between">
                      <Text type="secondary" className="text-xs">
                        {formatTimeAgo(alert.created_at)}
                      </Text>
                      {alert.action_required && (
                        <Button
                          type="link"
                          size="small"
                          className="p-0 h-auto text-xs"
                        >
                          <LocalizedText>{t('dashboard.takeAction', 'Take Action')}</LocalizedText>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </List.Item>
            )}
          />
        </div>
      )}
    </Card>
  );
};

export default AlertsCard;