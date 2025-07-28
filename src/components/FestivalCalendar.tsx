/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                  Festival Calendar Component                                     │
 * │                                                                                                  │
 * │  Description: Sri Lankan festival calendar with Poya days, public holidays, and business       │
 * │               impact analysis for retail planning and customer communications.                   │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect } from 'react';
import { Card, Badge, Select, Tabs, Alert, Typography, Row, Col, Statistic } from 'antd';
import type { TabsProps } from 'antd';
import { 
  CalendarOutlined, 
  StarOutlined, 
  BellOutlined, 
  RiseOutlined, 
  GiftOutlined, 
  TeamOutlined, 
  FireOutlined
} from '@ant-design/icons';
import { 
  getFestivals, 
  getTodaysFestivals, 
  getPoyaDays,
  autoUpdateFestivals,
  type Festival 
} from '@/api/sri-lankan-features.api';

const { Title, Text } = Typography;
const { Option } = Select;

export const FestivalCalendar: React.FC = () => {
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [todaysFestivals, setTodaysFestivals] = useState<Festival[]>([]);
  const [poyaDays, setPoyaDays] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedType, setSelectedType] = useState<string>('all');

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i);

  const festivalTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'public_holiday', label: 'Public Holidays' },
    { value: 'poya_day', label: 'Poya Days' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'religious', label: 'Religious' },
  ];

  useEffect(() => {
    loadFestivalData();
  }, [selectedYear, selectedType]);

  useEffect(() => {
    initializeFestivalData();
  }, []);

  const initializeFestivalData = async () => {
    try {
      const response = await autoUpdateFestivals();
      if (response.success) {
        console.log('Festival data auto-updated successfully');
      }
    } catch (error) {
      console.error('Error auto-updating festival data:', error);
    }
  };

  const loadFestivalData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = { year: selectedYear };
      if (selectedType !== 'all') {
        params.type = selectedType;
      }

      const [festivalsResponse, todaysResponse, poyaResponse] = await Promise.all([
        getFestivals(params),
        getTodaysFestivals(),
        getPoyaDays(selectedYear)
      ]);

      if (festivalsResponse.success && festivalsResponse.data) {
        setFestivals(festivalsResponse.data);
      } else {
        setError(festivalsResponse.error || 'Failed to load festivals');
      }

      if (todaysResponse.success && todaysResponse.data) {
        setTodaysFestivals(todaysResponse.data);
      }

      if (poyaResponse.success && poyaResponse.data) {
        setPoyaDays(poyaResponse.data);
      }

    } catch (err) {
      setError('Network error while loading festival data');
      console.error('Error loading festival data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFestivalIcon = (type: string, category?: string) => {
    if (category === 'buddhist' || type === 'poya_day') {
      return <StarOutlined style={{ color: '#faad14' }} />;
    }
    if (category === 'christian') {
      return <GiftOutlined style={{ color: '#52c41a' }} />;
    }
    if (category === 'cultural') {
      return <TeamOutlined style={{ color: '#1890ff' }} />;
    }
    if (category === 'national') {
      return <FireOutlined style={{ color: '#f5222d' }} />;
    }
    return <CalendarOutlined />;
  };

  const getSalesImpactColor = (impact?: string) => {
    switch (impact) {
      case 'high':
        return 'success';
      case 'medium':
        return 'warning';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilText = (daysUntil: number) => {
    if (daysUntil === 0) return 'Today';
    if (daysUntil === 1) return 'Tomorrow';
    if (daysUntil < 0) return 'Passed';
    return `${daysUntil} days`;
  };

  const renderCalendarTab = () => (
    <div>
      {festivals.map((festival) => (
        <Card key={festival.id} style={{ marginBottom: '16px' }} hoverable>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
              <div style={{ marginTop: '4px' }}>
                {getFestivalIcon(festival.type, festival.category)}
              </div>
              <div style={{ flex: 1 }}>
                <Title level={4} style={{ margin: 0, marginBottom: '4px' }}>{festival.name}</Title>
                {festival.name_si && (
                  <Text type="secondary" style={{ display: 'block', fontSize: '14px' }}>{festival.name_si}</Text>
                )}
                {festival.name_ta && (
                  <Text type="secondary" style={{ display: 'block', fontSize: '14px' }}>{festival.name_ta}</Text>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                  <CalendarOutlined style={{ color: '#666' }} />
                  <Text type="secondary">{formatDate(festival.date)}</Text>
                  <Badge count={getDaysUntilText(festival.days_until)} style={{ backgroundColor: '#f0f0f0', color: '#666' }} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
              {festival.is_public_holiday && (
                <Badge status="success" text="Public Holiday" />
              )}
              {festival.is_poya_day && (
                <Badge status="warning" text="Poya Day" />
              )}
              {festival.expected_sales_impact && (
                <Badge status={getSalesImpactColor(festival.expected_sales_impact)} text={`${festival.expected_sales_impact} impact`} />
              )}
            </div>
          </div>
          {festival.greeting_message_en && (
            <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fafafa', borderRadius: '4px' }}>
              <Text italic>"{festival.greeting_message_en}"</Text>
            </div>
          )}
        </Card>
      ))}
      {festivals.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px' }}>
          <Text type="secondary">No festivals found for the selected criteria</Text>
        </div>
      )}
    </div>
  );

  const renderPoyaTab = () => (
    <Card title={<><StarOutlined /> Poya Calendar {selectedYear}</>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {poyaDays.map((poya) => (
          <div key={poya.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: '#fff7e6', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <StarOutlined style={{ color: '#faad14' }} />
              <div>
                <Title level={5} style={{ margin: 0 }}>{poya.name}</Title>
                <Text type="secondary">{formatDate(poya.date)}</Text>
              </div>
            </div>
            <Badge count={getDaysUntilText(poya.days_until)} style={{ backgroundColor: '#f0f0f0', color: '#666' }} />
          </div>
        ))}
      </div>
    </Card>
  );

  const renderBusinessTab = () => (
    <div>
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="High Impact Festivals"
              value={festivals.filter(f => f.expected_sales_impact === 'high').length}
              valueStyle={{ color: '#52c41a' }}
              prefix={<RiseOutlined />}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>Major shopping opportunities</Text>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Public Holidays"
              value={festivals.filter(f => f.is_public_holiday).length}
              valueStyle={{ color: '#1890ff' }}
              prefix={<CalendarOutlined />}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>Business closure days</Text>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Poya Days"
              value={festivals.filter(f => f.is_poya_day).length}
              valueStyle={{ color: '#faad14' }}
              prefix={<StarOutlined />}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>Buddhist observance days</Text>
          </Card>
        </Col>
      </Row>

      <Card title={<><BellOutlined /> Upcoming High Impact Festivals</>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {festivals
            .filter(f => f.expected_sales_impact === 'high' && f.days_until >= 0 && f.days_until <= 30)
            .slice(0, 5)
            .map((festival) => (
              <div key={festival.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f6ffed', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <RiseOutlined style={{ color: '#52c41a' }} />
                  <div>
                    <Title level={5} style={{ margin: 0 }}>{festival.name}</Title>
                    <Text type="secondary">{formatDate(festival.date)}</Text>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Badge status="success" text={getDaysUntilText(festival.days_until)} />
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    Stock up recommended
                  </div>
                </div>
              </div>
            ))}
          {festivals.filter(f => f.expected_sales_impact === 'high' && f.days_until >= 0 && f.days_until <= 30).length === 0 && (
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <Text type="secondary">No upcoming high impact festivals in the next 30 days</Text>
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '256px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '16px' }}>Loading...</div>
          <Text type="secondary">Loading festival calendar...</Text>
        </div>
      </div>
    );
  }

  const tabItems: TabsProps['items'] = [
    {
      key: 'calendar',
      label: (
        <span>
          <CalendarOutlined />
          Calendar
        </span>
      ),
      children: renderCalendarTab(),
    },
    {
      key: 'poya',
      label: (
        <span>
          <StarOutlined />
          Poya Days
        </span>
      ),
      children: renderPoyaTab(),
    },
    {
      key: 'business',
      label: (
        <span>
          <RiseOutlined />
          Business Impact
        </span>
      ),
      children: renderBusinessTab(),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Festival Calendar</Title>
          <Text type="secondary">Sri Lankan festivals and business planning</Text>
        </div>
        <Badge count="Sri Lankan Calendar" style={{ backgroundColor: '#f0f0f0', color: '#666' }} />
      </div>

      {todaysFestivals.length > 0 && (
        <Alert
          message={
            <div>
              <Text strong style={{ color: '#1890ff' }}>Today's Festivals</Text>
              <div style={{ marginTop: '8px' }}>
                {todaysFestivals.map((festival) => (
                  <div key={festival.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    {getFestivalIcon(festival.type, festival.category)}
                    <Text strong>{festival.name}</Text>
                    {festival.is_public_holiday && (
                      <Badge status="success" text="Public Holiday" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          }
          type="info"
          style={{ marginBottom: '24px' }}
        />
      )}

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: '24px' }}
        />
      )}

      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        <Select value={selectedYear} onChange={setSelectedYear} style={{ width: 120 }}>
          {years.map((year) => (
            <Option key={year} value={year}>
              {year}
            </Option>
          ))}
        </Select>

        <Select value={selectedType} onChange={setSelectedType} style={{ width: 200 }}>
          {festivalTypes.map((type) => (
            <Option key={type.value} value={type.value}>
              {type.label}
            </Option>
          ))}
        </Select>
      </div>

      <Tabs items={tabItems} />
    </div>
  );
};