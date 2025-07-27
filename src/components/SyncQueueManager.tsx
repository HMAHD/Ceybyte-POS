/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                   Sync Queue Manager                                            │
 * │                                                                                                  │
 * │  Description: Component for managing offline transaction queue and synchronization.              │
 * │               Shows pending transactions, sync status, and conflict resolution.                 │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Progress,
  Alert,
  Modal,
  Typography,
  Tooltip,
  Statistic,
  Row,
  Col,
  Empty,
} from 'antd';
import {
  SyncOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined,
  ReloadOutlined,
  WarningOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from '@/hooks/useTranslation';
import LocalizedText from '@/components/LocalizedText';
import type { OfflineTransaction, ConflictResolution } from '@/types/terminal';

const { Title, Text } = Typography;

interface SyncQueueManagerProps {
  terminalId: string;
  onSyncComplete?: () => void;
}

export const SyncQueueManager: React.FC<SyncQueueManagerProps> = ({
  terminalId,
  onSyncComplete,
}) => {
  const { t } = useTranslation();

  const [transactions, setTransactions] = useState<OfflineTransaction[]>([]);
  const [conflicts, setConflicts] = useState<ConflictResolution[]>([]);
  const [loading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [selectedTransaction, setSelectedTransaction] = useState<OfflineTransaction | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  useEffect(() => {
    loadSyncQueue();
    loadConflicts();

    // Set up periodic refresh
    const interval = setInterval(() => {
      loadSyncQueue();
      loadConflicts();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [terminalId]);

  const loadSyncQueue = async () => {
    try {
      // Mock data - in real implementation, this would call the API
      const mockTransactions: OfflineTransaction[] = [
        {
          id: '1',
          type: 'sale',
          data: {
            customer_id: 'CUST001',
            total: 1500.00,
            items: [{ product_id: 'PROD001', quantity: 2, price: 750.00 }]
          },
          queued_at: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
          sync_status: 'pending',
          retry_count: 0,
        },
        {
          id: '2',
          type: 'customer_update',
          data: {
            id: 'CUST002',
            name: 'John Doe',
            phone: '+94771234567',
            credit_limit: 5000.00
          },
          queued_at: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
          sync_status: 'failed',
          retry_count: 2,
          error_message: 'Network timeout',
        },
        {
          id: '3',
          type: 'product_update',
          data: {
            id: 'PROD003',
            name: 'Rice 1kg',
            price: 180.00,
            stock_quantity: 50
          },
          queued_at: new Date(Date.now() - 120000).toISOString(), // 2 minutes ago
          sync_status: 'pending',
          retry_count: 0,
        },
      ];

      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Error loading sync queue:', error);
    }
  };

  const loadConflicts = async () => {
    try {
      // Mock data - in real implementation, this would call the API
      const mockConflicts: ConflictResolution[] = [
        {
          conflict_id: 'CONF001',
          table_name: 'customers',
          record_id: 'CUST001',
          local_data: { name: 'Local Name', credit_limit: 3000 },
          remote_data: { name: 'Remote Name', credit_limit: 3500 },
          local_timestamp: new Date(Date.now() - 300000).toISOString(),
          remote_timestamp: new Date(Date.now() - 180000).toISOString(),
          resolution_strategy: 'last_write_wins',
          resolved: false,
        },
      ];

      setConflicts(mockConflicts);
    } catch (error) {
      console.error('Error loading conflicts:', error);
    }
  };

  const handleSyncAll = async () => {
    try {
      setSyncing(true);
      setSyncProgress(0);

      const pendingTransactions = transactions.filter(t => t.sync_status === 'pending');

      for (let i = 0; i < pendingTransactions.length; i++) {
        const transaction = pendingTransactions[i];

        // Simulate sync process
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update progress
        setSyncProgress(((i + 1) / pendingTransactions.length) * 100);

        // Update transaction status
        setTransactions(prev =>
          prev.map(t =>
            t.id === transaction.id
              ? { ...t, sync_status: 'synced' as const }
              : t
          )
        );
      }

      if (onSyncComplete) {
        onSyncComplete();
      }

    } catch (error) {
      console.error('Error syncing transactions:', error);
    } finally {
      setSyncing(false);
      setSyncProgress(0);
    }
  };

  const handleRetryTransaction = async (transactionId: string) => {
    try {
      // Simulate retry
      await new Promise(resolve => setTimeout(resolve, 1000));

      setTransactions(prev =>
        prev.map(t =>
          t.id === transactionId
            ? { ...t, sync_status: 'synced' as const, error_message: undefined }
            : t
        )
      );
    } catch (error) {
      console.error('Error retrying transaction:', error);
    }
  };

  const handleDeleteTransaction = (transactionId: string) => {
    Modal.confirm({
      title: t('sync.confirmDelete', 'Delete Transaction'),
      content: t('sync.confirmDeleteMessage', 'Are you sure you want to delete this transaction? This action cannot be undone.'),
      onOk: () => {
        setTransactions(prev => prev.filter(t => t.id !== transactionId));
      },
    });
  };

  const handleViewDetails = (transaction: OfflineTransaction) => {
    setSelectedTransaction(transaction);
    setDetailsModalVisible(true);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'synced':
        return 'green';
      case 'pending':
        return 'orange';
      case 'failed':
        return 'red';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sale':
        return '💰';
      case 'customer_update':
        return '👤';
      case 'product_update':
        return '📦';
      case 'payment':
        return '💳';
      default:
        return '📄';
    }
  };

  const columns = [
    {
      title: <LocalizedText>{t('sync.type', 'Type')}</LocalizedText>,
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Space>
          <span>{getTypeIcon(type)}</span>
          <LocalizedText>{t(`sync.type.${type}`, type)}</LocalizedText>
        </Space>
      ),
    },
    {
      title: <LocalizedText>{t('sync.queuedAt', 'Queued At')}</LocalizedText>,
      dataIndex: 'queued_at',
      key: 'queued_at',
      render: (queuedAt: string) => (
        <Text style={{ fontSize: '12px' }}>
          {new Date(queuedAt).toLocaleString()}
        </Text>
      ),
    },
    {
      title: <LocalizedText>{t('sync.status', 'Status')}</LocalizedText>,
      dataIndex: 'sync_status',
      key: 'sync_status',
      render: (status: string, record: OfflineTransaction) => (
        <Space direction="vertical" size="small">
          <Tag color={getStatusColor(status)}>
            <LocalizedText>{t(`sync.status.${status}`, status)}</LocalizedText>
          </Tag>
          {record.retry_count > 0 && (
            <Text type="secondary" style={{ fontSize: '11px' }}>
              {record.retry_count} retries
            </Text>
          )}
          {record.error_message && (
            <Tooltip title={record.error_message}>
              <WarningOutlined style={{ color: '#ff4d4f' }} />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: <LocalizedText>{t('common.actions', 'Actions')}</LocalizedText>,
      key: 'actions',
      render: (record: OfflineTransaction) => (
        <Space>
          <Tooltip title={t('sync.viewDetails', 'View Details')}>
            <Button
              type="text"
              icon={<InfoCircleOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>

          {record.sync_status === 'failed' && (
            <Tooltip title={t('sync.retry', 'Retry')}>
              <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={() => handleRetryTransaction(record.id)}
              />
            </Tooltip>
          )}

          <Tooltip title={t('sync.delete', 'Delete')}>
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteTransaction(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const pendingCount = transactions.filter(t => t.sync_status === 'pending').length;
  const failedCount = transactions.filter(t => t.sync_status === 'failed').length;
  const syncedCount = transactions.filter(t => t.sync_status === 'synced').length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={3}>
          <SyncOutlined className="mr-2" />
          <LocalizedText>{t('sync.queueManager', 'Sync Queue Manager')}</LocalizedText>
        </Title>

        <Space>
          <Button
            type="primary"
            icon={<SyncOutlined />}
            onClick={handleSyncAll}
            loading={syncing}
            disabled={pendingCount === 0}
          >
            <LocalizedText>{t('sync.syncAll', 'Sync All')}</LocalizedText>
          </Button>

          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              loadSyncQueue();
              loadConflicts();
            }}
            loading={loading}
          >
            <LocalizedText>{t('common.refresh', 'Refresh')}</LocalizedText>
          </Button>
        </Space>
      </div>

      {/* Statistics */}
      <Row gutter={16} className="mb-4">
        <Col span={6}>
          <Card>
            <Statistic
              title={<LocalizedText>{t('sync.pending', 'Pending')}</LocalizedText>}
              value={pendingCount}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title={<LocalizedText>{t('sync.failed', 'Failed')}</LocalizedText>}
              value={failedCount}
              prefix={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title={<LocalizedText>{t('sync.synced', 'Synced')}</LocalizedText>}
              value={syncedCount}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title={<LocalizedText>{t('sync.conflicts', 'Conflicts')}</LocalizedText>}
              value={conflicts.length}
              prefix={<WarningOutlined style={{ color: '#722ed1' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Sync Progress */}
      {syncing && (
        <Alert
          type="info"
          message={<LocalizedText>{t('sync.syncing', 'Synchronizing transactions...')}</LocalizedText>}
          description={
            <Progress
              percent={Math.round(syncProgress)}
              status="active"
              showInfo={true}
            />
          }
          className="mb-4"
        />
      )}

      {/* Conflicts Alert */}
      {conflicts.length > 0 && (
        <Alert
          type="warning"
          message={<LocalizedText>{t('sync.conflictsDetected', 'Data Conflicts Detected')}</LocalizedText>}
          description={
            <LocalizedText>
              {t('sync.conflictsMessage', `${conflicts.length} data conflicts need resolution before sync can complete.`)}
            </LocalizedText>
          }
          showIcon
          className="mb-4"
        />
      )}

      {/* Transaction Queue */}
      <Card title={<LocalizedText>{t('sync.transactionQueue', 'Transaction Queue')}</LocalizedText>}>
        {transactions.length === 0 ? (
          <Empty
            description={<LocalizedText>{t('sync.noTransactions', 'No pending transactions')}</LocalizedText>}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={transactions}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
            }}
          />
        )}
      </Card>

      {/* Transaction Details Modal */}
      <Modal
        title={<LocalizedText>{t('sync.transactionDetails', 'Transaction Details')}</LocalizedText>}
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsModalVisible(false)}>
            <LocalizedText>{t('common.close', 'Close')}</LocalizedText>
          </Button>
        ]}
        width={600}
      >
        {selectedTransaction && (
          <div>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Transaction ID:</Text>
                <br />
                <Text code>{selectedTransaction.id}</Text>
              </div>

              <div>
                <Text strong>Type:</Text>
                <br />
                <Tag>{selectedTransaction.type}</Tag>
              </div>

              <div>
                <Text strong>Status:</Text>
                <br />
                <Tag color={getStatusColor(selectedTransaction.sync_status)}>
                  {selectedTransaction.sync_status}
                </Tag>
              </div>

              <div>
                <Text strong>Data:</Text>
                <br />
                <pre style={{
                  background: '#f5f5f5',
                  padding: '8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  overflow: 'auto'
                }}>
                  {JSON.stringify(selectedTransaction.data, null, 2)}
                </pre>
              </div>

              {selectedTransaction.error_message && (
                <div>
                  <Text strong>Error:</Text>
                  <br />
                  <Alert
                    type="error"
                    message={selectedTransaction.error_message}
                  />
                </div>
              )}
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SyncQueueManager;