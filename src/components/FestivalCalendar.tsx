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
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, 
  Star, 
  Bell, 
  TrendingUp, 
  Gift, 
  Users, 
  AlertCircle,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { 
  getFestivals, 
  getTodaysFestivals, 
  getPoyaDays,
  getFestivalReminders,
  autoUpdateFestivals,
  type Festival 
} from '@/api/sri-lankan-features.api';

export const FestivalCalendar: React.FC = () => {
  const { t } = useTranslation();
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
    { value: 'all', label: t('festival.all_types') },
    { value: 'public_holiday', label: t('festival.public_holidays') },
    { value: 'poya_day', label: t('festival.poya_days') },
    { value: 'cultural', label: t('festival.cultural') },
    { value: 'religious', label: t('festival.religious') },
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

      // Load festivals for selected year and type
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
      return <Star className="h-4 w-4" />;
    }
    if (category === 'christian') {
      return <Gift className="h-4 w-4" />;
    }
    if (category === 'cultural') {
      return <Users className="h-4 w-4" />;
    }
    if (category === 'national') {
      return <Sparkles className="h-4 w-4" />;
    }
    return <Calendar className="h-4 w-4" />;
  };

  const getSalesImpactColor = (impact?: string) => {
    switch (impact) {
      case 'high':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    if (daysUntil === 0) return t('festival.today');
    if (daysUntil === 1) return t('festival.tomorrow');
    if (daysUntil < 0) return t('festival.passed');
    return t('festival.days_until', { days: daysUntil });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('festival.title')}</h1>
          <p className="text-muted-foreground">{t('festival.description')}</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {t('festival.sri_lankan_calendar')}
        </Badge>
      </div>

      {/* Today's Festivals Alert */}
      {todaysFestivals.length > 0 && (
        <Alert className="border-blue-200 bg-blue-50">
          <Sparkles className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold text-blue-900 mb-2">
              {t('festival.todays_festivals')}
            </div>
            <div className="space-y-1">
              {todaysFestivals.map((festival) => (
                <div key={festival.id} className="flex items-center gap-2">
                  {getFestivalIcon(festival.type, festival.category)}
                  <span className="font-medium">{festival.name}</span>
                  {festival.is_public_holiday && (
                    <Badge variant="secondary" className="text-xs">
                      {t('festival.public_holiday')}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {t('festival.calendar')}
          </TabsTrigger>
          <TabsTrigger value="poya" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            {t('festival.poya_days')}
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            {t('festival.business_impact')}
          </TabsTrigger>
        </TabsList>

        <div className="flex gap-4 mb-4">
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {festivalTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="calendar" className="space-y-4">
          <div className="grid gap-4">
            {festivals.map((festival) => (
              <Card key={festival.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getFestivalIcon(festival.type, festival.category)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{festival.name}</h3>
                        {festival.name_si && (
                          <p className="text-sm text-gray-600 font-sinhala">{festival.name_si}</p>
                        )}
                        {festival.name_ta && (
                          <p className="text-sm text-gray-600 font-tamil">{festival.name_ta}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{formatDate(festival.date)}</span>
                          <Badge variant="outline" className="text-xs">
                            {getDaysUntilText(festival.days_until)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {festival.is_public_holiday && (
                        <Badge variant="default" className="text-xs">
                          {t('festival.public_holiday')}
                        </Badge>
                      )}
                      {festival.is_poya_day && (
                        <Badge variant="secondary" className="text-xs">
                          {t('festival.poya_day')}
                        </Badge>
                      )}
                      {festival.expected_sales_impact && (
                        <Badge className={`text-xs ${getSalesImpactColor(festival.expected_sales_impact)}`}>
                          {t(`festival.impact.${festival.expected_sales_impact}`)}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {festival.greeting_message_en && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm italic">"{festival.greeting_message_en}"</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {festivals.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {t('festival.no_festivals')}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="poya" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                {t('festival.poya_calendar')} {selectedYear}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {poyaDays.map((poya) => (
                  <div key={poya.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Star className="h-4 w-4 text-yellow-600" />
                      <div>
                        <h4 className="font-medium">{poya.name}</h4>
                        <p className="text-sm text-gray-600">{formatDate(poya.date)}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {getDaysUntilText(poya.days_until)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-green-700">
                  {t('festival.high_impact_festivals')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {festivals.filter(f => f.expected_sales_impact === 'high').length}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {t('festival.high_impact_description')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-blue-700">
                  {t('festival.public_holidays')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {festivals.filter(f => f.is_public_holiday).length}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {t('festival.public_holidays_description')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-yellow-700">
                  {t('festival.poya_days')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {festivals.filter(f => f.is_poya_day).length}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {t('festival.poya_days_description')}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {t('festival.upcoming_high_impact')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {festivals
                  .filter(f => f.expected_sales_impact === 'high' && f.days_until >= 0 && f.days_until <= 30)
                  .slice(0, 5)
                  .map((festival) => (
                    <div key={festival.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <div>
                          <h4 className="font-medium">{festival.name}</h4>
                          <p className="text-sm text-gray-600">{formatDate(festival.date)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          {getDaysUntilText(festival.days_until)}
                        </Badge>
                        <p className="text-xs text-gray-600 mt-1">
                          {t('festival.stock_up_recommended')}
                        </p>
                      </div>
                    </div>
                  ))}
                {festivals.filter(f => f.expected_sales_impact === 'high' && f.days_until >= 0 && f.days_until <= 30).length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    {t('festival.no_upcoming_high_impact')}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};