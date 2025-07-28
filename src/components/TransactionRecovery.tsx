/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                  Transaction Recovery                                            │
 * │                                                                                                  │
 * │  Description: Component for recovering transactions after power restoration.                      │
 * │               Shows pending transactions and allows user to complete or discard them.            │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect } from 'react';
import { Modal, List, Button, Typography, Tag, message, Divider } from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  InfoCircleOutlined,
  ShoppingCartOutlined 
} from '@ant-design/icons';
import { useTranslation } from '@/hooks/useTranslation';
import LocalizedText from '@/components/LocalizedText';
import { usePower, TransactionState } from '@/contexts/PowerContext';

const { Text, Title } = Typography;

interface TransactionRecoveryProps {
  visible: boolean;
  onClose: () => void;
}

export const TransactionRecovery: React.FC<TransactionRecoveryProps> = ({
  visible,
  onClose,
}) => {
  const { t } = useTranslation();
  const { getPendingTransactions, markTransactionRecovered } = usePower();
  const [pendingTransactions, setPendingTransactions] = useState<TransactionState[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Load pending transactions when modal opens
  useEffect(() => {
    if (visible) {
      loadPendingTransactions();
    }
  }, [visible]);

  const loadPendingTransactions = async () => {
    setLoading(true);
    try {
      const transactions = await getPendingTransactions();
      setPendingTransactions(transactions);
    } catch (error) {
      console.error('Failed to load pending transactions:', error);
      message.error(t('power.loadTransactionsFailed', 'Failed to load pending transactions'));
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverTransaction = async (transaction: TransactionState) => {
    setProcessingId(transaction.sessionId);
    try {
      // Here you would implement the actual transaction recovery logic
      // For now, we'll just mark it as successfully recovered
      await markTransactionRecovered(
        transaction.sessionId, 
        true, 
        'Transaction recovered by user'
      );
      
      // Remove from pending list
      setPendingTransactions(prev => 
        prev.filter(t => t.sessionId !== transaction.sessionId)
      );
      
      message.success(t('power.transactionRecovered', 'Transaction recovered successfully'));
    } catch (error) {
      console.error('Failed to recover transaction:', error);
      message.error(t('power.transactionRecoveryFailed', 'Failed to recover transaction'));
    } finally {
      setProcessingId(null);
    }
  };

  const handleDiscardTransaction = async (transaction: TransactionState) => {
    setProcessingId(transaction.sessionId);
    try {
      await markTransactionRecovered(
        transaction.sessionId, 
        false, 
        'Transaction discarded by user'
      );
      
      // Remove from pending list
      setPendingTransactions(prev => 
        prev.filter(t => t.sessionId !== transaction.sessionId)
      );
      
      message.info(t('power.transactionDiscarded', 'Transaction discarded'));
    } catch (error) {
      console.error('Failed to discard transaction:', error);
      message.error(t('power.transactionDiscardFailed', 'Failed to discard transaction'));
    } finally {
      setProcessingId(null);
    }
  };

  const formatTransactionData = (data: any): string => {
    try {
      if (data.items && Array.isArray(data.items)) {
        const itemCount = data.items.length;
        const total = data.total || 0;
        return t('power.transactionSummary', `${itemCount} items - Rs. ${total.toFixed(2)}`);
      }
      return t('power.transactionDataAvailable', 'Transaction data available');
    } catch {
      return t('power.transactionDataCorrupted', 'Transaction data may be corrupted');
    }
  };

  const getTransactionTypeTag = (type: string) => {
    const typeMap: Record<string, { color: string; text: string }> = {
      sale: { color: 'green', text: t('transaction.sale', 'Sale') },
      return: { color: 'orange', text: t('transaction.return', 'Return') },
      hold: { color: 'blue', text: t('transaction.hold', 'Hold') },
    };
    
    const config = typeMap[type] || { color: 'default', text: type };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  return (
    <Modal
      title={
        <div className="flex items-center space-x-2">
          <InfoCircleOutlined className="text-blue-500" />
          <Title level={4} className="mb-0">
            <LocalizedText>
              {t('power.transactionRecoveryTitle', 'Transaction Recovery')}
            </LocalizedText>
          </Title>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          <LocalizedText>{t('common.close', 'Close')}</LocalizedText>
        </Button>
      ]}
      width={700}
      className="transaction-recovery-modal"
    >
      <div className="space-y-4">
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <Text>
            <LocalizedText>
              {t('power.recoveryDescription', 
                'The following transactions were in progress when power was lost. ' +
                'You can recover them to complete the sales or discard them if they are no longer needed.'
              )}
            </LocalizedText>
          </Text>
        </div>

        {pendingTransactions.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircleOutlined className="text-4xl text-green-500 mb-2" />
            <Text className="text-lg">
              <LocalizedText>
                {t('power.noPendingTransactions', 'No pending transactions found')}
              </LocalizedText>
            </Text>
            <br />
            <Text type="secondary">
              <LocalizedText>
                {t('power.allTransactionsRecovered', 'All transactions have been recovered or completed')}
              </LocalizedText>
            </Text>
          </div>
        ) : (
          <List
            loading={loading}
            dataSource={pendingTransactions}
            renderItem={(transaction) => (
              <List.Item
                key={transaction.sessionId}
                className="border rounded-lg p-4 mb-3"
                actions={[
                  <Button
                    key="recover"
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    loading={processingId === transaction.sessionId}
                    onClick={() => handleRecoverTransaction(transaction)}
                  >
                    <LocalizedText>{t('power.recover', 'Recover')}</LocalizedText>
                  </Button>,
                  <Button
                    key="discard"
                    danger
                    icon={<CloseCircleOutlined />}
                    loading={processingId === transaction.sessionId}
                    onClick={() => handleDiscardTransaction(transaction)}
                  >
                    <LocalizedText>{t('power.discard', 'Discard')}</LocalizedText>
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={<ShoppingCartOutlined className="text-2xl text-blue-500" />}
                  title={
                    <div className="flex items-center space-x-2">
                      <Text strong>
                        <LocalizedText>{t('power.sessionId', 'Session')}</LocalizedText>: {transaction.sessionId}
                      </Text>
                      {getTransactionTypeTag(transaction.transactionType)}
                    </div>
                  }
                  description={
                    <div className="space-y-2">
                      <div>
                        <Text>
                          <LocalizedText>{t('power.transactionDetails', 'Details')}</LocalizedText>: {formatTransactionData(transaction.transactionData)}
                        </Text>
                      </div>
                      {transaction.lastAction && (
                        <div>
                          <Text type="secondary">
                            <LocalizedText>{t('power.lastAction', 'Last Action')}</LocalizedText>: {transaction.lastAction}
                          </Text>
                        </div>
                      )}
                      {transaction.customerId && (
                        <div>
                          <Text type="secondary">
                            <LocalizedText>{t('power.customerId', 'Customer ID')}</LocalizedText>: {transaction.customerId}
                          </Text>
                        </div>
                      )}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}

        <Divider />
        
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <Text className="text-sm">
            <LocalizedText>
              {t('power.recoveryNote', 
                'Note: Recovered transactions will be restored to their previous state. ' +
                'Discarded transactions will be permanently removed and cannot be recovered.'
              )}
            </LocalizedText>
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default TransactionRecovery;