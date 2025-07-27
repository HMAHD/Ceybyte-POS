/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                              Inventory Management Card Component                                 │
 * │                                                                                                  │
 * │  Description: Inventory management system with low stock alerts and stock level monitoring.     │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                  │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect } from 'react';
import { Card, List, Typography, Progress, Button, Spin, Alert, Badge, Tag } from 'antd';
import { 
  ReloadOutlined, 
  ShoppingOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useTranslation } from '@/hooks/useTranslation';
import LocalizedText from '@/components/LocalizedText';

const { Title, Text } = Typography;

interface LowStockItem {
  id: number;
  name: string;
  current_stock: number;
  min_stock_level: number;
  unit_of_measure: string;
  category: string;
  last_restocked: string;
  stock_percentage: number;
}

const InventoryManagementCard: React.FC = () => {
  const { t } = useTranslation();
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data generator for low stock items
  const generateMockLowStockItems = (): LowStockItem[] => {
    return [
      {
        id: 1,
        name: "Rice - Basmati",
        current_stock: 5.5,
        min_stock_level: 20,
        unit_of_measure: "kg",
        category: "Grains",
        last_restocked: "2025-01-25",
        stock_percentage: 27.5
      },
      {
        id: 2,
        name: "Coca Cola - 330ml",
        current_stock: 12,
        min_stock_level: 50,
        unit_of_measure: "bottles",
        category: "Beverages",
        last_restocked: "2025-01-24",
        stock_percentage: 24
      },
      {
        id: 3,
        name: "Bread - White",
        current_stock: 3,
        min_stock_level: 15,
        unit_of_measure: "loaves",
        category: "Bakery",
        last_restocked: "2025-01-27",
        stock_percentage: 20
      },
      {
        id: 4,
        name: "Milk Powder - 400g",
        current_stock: 2,
        min_stock_level: 10,
        unit_of_measure: "packets",
        category: "Dairy",
        last_restocked: "2025-01-23",
        stock_percentage: 20
      }
    ];
  };

  const loadLowStockItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockData = generateMockLowStockItems();
      setLowStockItems(mockData);
    } catch (err) {
      console.error('Low stock items loading error:', err);
      setError('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLowStockItems();
  }, []);

  const getStockStatus = (percentage: number) => {
    if (percentage <= 20) return { color: 'error', text: 'Critical' };
    if (percentage <= 40) return { color: 'warning', text: 'Low' };
    return { color: 'success', text: 'Normal' };
  };

  const formatLastRestocked = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
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
          message="Error Loading Inventory"
          description={error}
          type="error"
          action={
            <button
              onClick={loadLowStockItems}
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
            <ShoppingOutlined />
            <Title level={4} className="mb-0">
              <LocalizedText>{t('dashboard.inventoryManagement', 'Inventory Management')}</LocalizedText>
            </Title>
            <Badge count={lowStockItems.length} />
          </div>
          <button
            onClick={loadLowStockItems}
            className="text-gray-500 hover:text-gray-700"
          >
            <ReloadOutlined />
          </button>
        </div>
      }
      actions={[
        <Button 
          key="restock" 
          type="primary" 
          icon={<ShoppingOutlined />}
          size="small"
        >
          <LocalizedText>{t('dashboard.restockItems', 'Restock Items')}</LocalizedText>
        </Button>
      ]}
    >
      {lowStockItems.length === 0 ? (
        <div className="text-center py-8">
          <ShoppingOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
          <Text type="secondary">
            <LocalizedText>{t('dashboard.allStockNormal', 'All items are well stocked')}</LocalizedText>
          </Text>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <div className="flex items-center space-x-2">
              <ExclamationCircleOutlined style={{ color: '#f5222d' }} />
              <Text strong style={{ color: '#f5222d' }}>
                <LocalizedText>{t('dashboard.lowStockAlert', 'Low Stock Alert')}</LocalizedText>
              </Text>
            </div>
            <Text className="text-sm text-red-600">
              <LocalizedText>
                {t('dashboard.itemsNeedRestock', `${lowStockItems.length} items need immediate restocking`)}
              </LocalizedText>
            </Text>
          </div>

          {/* Low Stock Items List */}
          <div className="max-h-64 overflow-y-auto">
            <List
              size="small"
              dataSource={lowStockItems}
              renderItem={(item) => {
                const status = getStockStatus(item.stock_percentage);
                return (
                  <List.Item className="px-0">
                    <div className="w-full space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Text strong className="text-sm">{item.name}</Text>
                          <div className="flex items-center space-x-2 mt-1">
                            <Tag color="blue">{item.category}</Tag>
                            <Text type="secondary" className="text-xs">
                              Last restocked: {formatLastRestocked(item.last_restocked)}
                            </Text>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge status={status.color as any} text={status.text} />
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>
                            Current: {item.current_stock} {item.unit_of_measure}
                          </span>
                          <span>
                            Min: {item.min_stock_level} {item.unit_of_measure}
                          </span>
                        </div>
                        <Progress
                          percent={item.stock_percentage}
                          size="small"
                          status={item.stock_percentage <= 20 ? 'exception' : 
                                 item.stock_percentage <= 40 ? 'active' : 'success'}
                          showInfo={false}
                        />
                      </div>
                    </div>
                  </List.Item>
                );
              }}
            />
          </div>
        </div>
      )}
    </Card>
  );
};

export default InventoryManagementCard;