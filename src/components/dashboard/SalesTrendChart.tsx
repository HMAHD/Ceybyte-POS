/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                  Sales Trend Chart Component                                     │
 * │                                                                                                  │
 * │  Description: Basic sales trend visualization using charts with daily sales,                    │
 * │               transaction count, and profit tracking over time.                                 │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                  │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect } from 'react';
import { Card, Typography, Select, Spin, Alert } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ReloadOutlined, RiseOutlined } from '@ant-design/icons';
import { useTranslation } from '@/hooks/useTranslation';
import LocalizedText from '@/components/LocalizedText';
import { dashboardApi, SalesTrend } from '@/api/dashboard.api';

const { Title } = Typography;
const { Option } = Select;

interface ChartData extends SalesTrend {
  formattedDate: string;
}

const SalesTrendChart: React.FC = () => {
  const { t, formatCurrency } = useTranslation();
  const [salesData, setSalesData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [days, setDays] = useState(7);

  const loadSalesTrend = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardApi.getSalesTrend(days);

      if (response.success && response.data) {
        const formattedData = response.data.map(item => ({
          ...item,
          formattedDate: new Date(item.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          })
        }));
        setSalesData(formattedData);
      } else {
        setError(response.error || 'Failed to load sales trend');
      }
    } catch (err) {
      console.error('Sales trend loading error:', err);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSalesTrend();
  }, [days]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-semibold text-gray-800">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {
                entry.dataKey === 'transaction_count'
                  ? entry.value
                  : formatCurrency(entry.value)
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
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
          message="Error Loading Sales Trend"
          description={error}
          type="error"
          action={
            <button
              onClick={loadSalesTrend}
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
            <RiseOutlined />
            <Title level={4} className="mb-0">
              <LocalizedText>{t('dashboard.salesTrend', 'Sales Trend')}</LocalizedText>
            </Title>
          </div>
          <div className="flex items-center space-x-2">
            <Select
              value={days}
              onChange={setDays}
              size="small"
              style={{ width: 100 }}
            >
              <Option value={7}>7 Days</Option>
              <Option value={14}>14 Days</Option>
              <Option value={30}>30 Days</Option>
            </Select>
            <Select
              value={chartType}
              onChange={setChartType}
              size="small"
              style={{ width: 80 }}
            >
              <Option value="line">Line</Option>
              <Option value="bar">Bar</Option>
            </Select>
            <button
              onClick={loadSalesTrend}
              className="text-gray-500 hover:text-gray-700"
            >
              <ReloadOutlined />
            </button>
          </div>
        </div>
      }
    >
      <div style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="formattedDate"
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#666"
                tickFormatter={(value) => `Rs. ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="sales_amount"
                stroke="#1890ff"
                strokeWidth={2}
                dot={{ fill: '#1890ff', strokeWidth: 2, r: 4 }}
                name="Sales"
              />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#52c41a"
                strokeWidth={2}
                dot={{ fill: '#52c41a', strokeWidth: 2, r: 4 }}
                name="Profit"
              />
            </LineChart>
          ) : (
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="formattedDate"
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#666"
                tickFormatter={(value) => `Rs. ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="sales_amount"
                fill="#1890ff"
                name="Sales"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="profit"
                fill="#52c41a"
                name="Profit"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-blue-600">
              {formatCurrency(salesData.reduce((sum, item) => sum + item.sales_amount, 0))}
            </div>
            <div className="text-xs text-gray-500">
              <LocalizedText>{t('dashboard.totalSales', 'Total Sales')}</LocalizedText>
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">
              {formatCurrency(salesData.reduce((sum, item) => sum + item.profit, 0))}
            </div>
            <div className="text-xs text-gray-500">
              <LocalizedText>{t('dashboard.totalProfit', 'Total Profit')}</LocalizedText>
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-600">
              {salesData.reduce((sum, item) => sum + item.transaction_count, 0)}
            </div>
            <div className="text-xs text-gray-500">
              <LocalizedText>{t('dashboard.totalTransactions', 'Total Transactions')}</LocalizedText>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SalesTrendChart;