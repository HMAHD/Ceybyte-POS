/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                 Delivery Management Component                                     │
 * │                                                                                                  │
 * │  Description: Complete delivery management interface for three-wheeler and other delivery       │
 * │               services with driver tracking, route management, and status updates.              │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Truck,
  MapPin,
  Phone,
  Clock,
  User,
  Package,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  Filter,
  Calendar,
  Navigation,
  Star,
  Camera,
  FileText,
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatting';
import {
  getDeliveries,
  createDelivery,
  updateDeliveryStatus,
  type Delivery,
  type ApiResponse,
} from '@/api/sri-lankan-features.api';

interface DeliveryFormData {
  sale_id: number;
  customer_id: number;
  scheduled_date: string;
  delivery_address: string;
  delivery_area?: string;
  delivery_village?: string;
  contact_person?: string;
  contact_phone?: string;
  driver_name?: string;
  driver_phone?: string;
  vehicle_number?: string;
  vehicle_type?: string;
  delivery_fee?: number;
  special_instructions?: string;
}

const DeliveryManagement: React.FC = () => {
  const { t } = useTranslation();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState<DeliveryFormData>({
    sale_id: 0,
    customer_id: 0,
    scheduled_date: new Date().toISOString().split('T')[0],
    delivery_address: '',
    vehicle_type: 'three_wheeler',
    delivery_fee: 0,
  });

  const statusOptions = [
    { value: 'all', label: t('common.all') },
    { value: 'scheduled', label: t('delivery.status.scheduled') },
    { value: 'dispatched', label: t('delivery.status.dispatched') },
    { value: 'in_transit', label: t('delivery.status.in_transit') },
    { value: 'delivered', label: t('delivery.status.delivered') },
    { value: 'failed', label: t('delivery.status.failed') },
    { value: 'cancelled', label: t('delivery.status.cancelled') },
  ];

  const vehicleTypes = [
    { value: 'three_wheeler', label: t('delivery.vehicle.three_wheeler') },
    { value: 'motorcycle', label: t('delivery.vehicle.motorcycle') },
    { value: 'van', label: t('delivery.vehicle.van') },
    { value: 'truck', label: t('delivery.vehicle.truck') },
  ];

  useEffect(() => {
    loadDeliveries();
  }, [selectedStatus, selectedArea]);

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedStatus !== 'all') params.status = selectedStatus;
      if (selectedArea !== 'all') params.area = selectedArea;

      const response = await getDeliveries(params);
      if (response.success && response.data) {
        setDeliveries(response.data);
      } else {
        setError(response.error || 'Failed to load deliveries');
      }
    } catch (err) {
      setError('Network error while loading deliveries');
      console.error('Error loading deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDelivery = async () => {
    try {
      const response = await createDelivery(formData);
      if (response.success) {
        setShowCreateDialog(false);
        setFormData({
          sale_id: 0,
          customer_id: 0,
          scheduled_date: new Date().toISOString().split('T')[0],
          delivery_address: '',
          vehicle_type: 'three_wheeler',
          delivery_fee: 0,
        });
        loadDeliveries();
      } else {
        setError(response.error || 'Failed to create delivery');
      }
    } catch (err) {
      setError('Network error while creating delivery');
      console.error('Error creating delivery:', err);
    }
  };

  const handleStatusUpdate = async (deliveryId: number, newStatus: string) => {
    try {
      const response = await updateDeliveryStatus(deliveryId, newStatus);
      if (response.success) {
        loadDeliveries();
      } else {
        setError(response.error || 'Failed to update delivery status');
      }
    } catch (err) {
      setError('Network error while updating delivery status');
      console.error('Error updating delivery status:', err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="h-4 w-4" />;
      case 'dispatched':
        return <Truck className="h-4 w-4" />;
      case 'in_transit':
        return <Navigation className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-gray-100 text-gray-800';
      case 'dispatched':
        return 'bg-blue-100 text-blue-800';
      case 'in_transit':
        return 'bg-orange-100 text-orange-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredDeliveries = deliveries.filter(delivery =>
    delivery.delivery_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery.delivery_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (delivery.driver_name && delivery.driver_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const uniqueAreas = Array.from(new Set(deliveries.map(d => d.delivery_area).filter(Boolean)));

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
          <h1 className="text-2xl font-bold text-gray-900">{t('delivery.title')}</h1>
          <p className="text-gray-600">{t('delivery.subtitle')}</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('delivery.create')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('delivery.create')}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sale_id">{t('delivery.sale_id')}</Label>
                <Input
                  id="sale_id"
                  type="number"
                  value={formData.sale_id || ''}
                  onChange={(e) => setFormData({ ...formData, sale_id: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="customer_id">{t('delivery.customer_id')}</Label>
                <Input
                  id="customer_id"
                  type="number"
                  value={formData.customer_id || ''}
                  onChange={(e) => setFormData({ ...formData, customer_id: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="scheduled_date">{t('delivery.scheduled_date')}</Label>
                <Input
                  id="scheduled_date"
                  type="date"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="vehicle_type">{t('delivery.vehicle_type')}</Label>
                <Select
                  value={formData.vehicle_type}
                  onValueChange={(value) => setFormData({ ...formData, vehicle_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="delivery_address">{t('delivery.address')}</Label>
                <Textarea
                  id="delivery_address"
                  value={formData.delivery_address}
                  onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="delivery_area">{t('delivery.area')}</Label>
                <Input
                  id="delivery_area"
                  value={formData.delivery_area || ''}
                  onChange={(e) => setFormData({ ...formData, delivery_area: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="delivery_village">{t('delivery.village')}</Label>
                <Input
                  id="delivery_village"
                  value={formData.delivery_village || ''}
                  onChange={(e) => setFormData({ ...formData, delivery_village: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="contact_person">{t('delivery.contact_person')}</Label>
                <Input
                  id="contact_person"
                  value={formData.contact_person || ''}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="contact_phone">{t('delivery.contact_phone')}</Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_phone || ''}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="driver_name">{t('delivery.driver_name')}</Label>
                <Input
                  id="driver_name"
                  value={formData.driver_name || ''}
                  onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="driver_phone">{t('delivery.driver_phone')}</Label>
                <Input
                  id="driver_phone"
                  value={formData.driver_phone || ''}
                  onChange={(e) => setFormData({ ...formData, driver_phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="vehicle_number">{t('delivery.vehicle_number')}</Label>
                <Input
                  id="vehicle_number"
                  value={formData.vehicle_number || ''}
                  onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="delivery_fee">{t('delivery.fee')}</Label>
                <Input
                  id="delivery_fee"
                  type="number"
                  step="0.01"
                  value={formData.delivery_fee || ''}
                  onChange={(e) => setFormData({ ...formData, delivery_fee: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="special_instructions">{t('delivery.special_instructions')}</Label>
                <Textarea
                  id="special_instructions"
                  value={formData.special_instructions || ''}
                  onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleCreateDelivery}>
                {t('common.create')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={t('delivery.search_placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedArea} onValueChange={setSelectedArea}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t('delivery.filter_by_area')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all_areas')}</SelectItem>
                {uniqueAreas.map((area) => (
                  <SelectItem key={area} value={area}>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center text-red-800">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deliveries Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="h-5 w-5 mr-2" />
            {t('delivery.list')} ({filteredDeliveries.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('delivery.number')}</TableHead>
                <TableHead>{t('delivery.scheduled_date')}</TableHead>
                <TableHead>{t('delivery.address')}</TableHead>
                <TableHead>{t('delivery.driver')}</TableHead>
                <TableHead>{t('delivery.vehicle')}</TableHead>
                <TableHead>{t('delivery.status')}</TableHead>
                <TableHead>{t('delivery.fee')}</TableHead>
                <TableHead>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeliveries.map((delivery) => (
                <TableRow key={delivery.id}>
                  <TableCell className="font-medium">
                    {delivery.delivery_number}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {delivery.scheduled_date}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm">{delivery.delivery_address}</div>
                          {delivery.delivery_area && (
                            <div className="text-xs text-gray-500">{delivery.delivery_area}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {delivery.driver_name ? (
                      <div>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          {delivery.driver_name}
                        </div>
                        {delivery.driver_phone && (
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Phone className="h-3 w-3 mr-1" />
                            {delivery.driver_phone}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">{t('delivery.no_driver')}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {delivery.vehicle_number || t('delivery.no_vehicle')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(delivery.status)}>
                      <div className="flex items-center">
                        {getStatusIcon(delivery.status)}
                        <span className="ml-1">{t(`delivery.status.${delivery.status}`)}</span>
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatCurrency(delivery.delivery_fee)}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {delivery.status === 'scheduled' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(delivery.id, 'dispatched')}
                        >
                          {t('delivery.dispatch')}
                        </Button>
                      )}
                      {delivery.status === 'dispatched' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(delivery.id, 'delivered')}
                        >
                          {t('delivery.mark_delivered')}
                        </Button>
                      )}
                      {delivery.status === 'in_transit' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(delivery.id, 'delivered')}
                        >
                          {t('delivery.mark_delivered')}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredDeliveries.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {t('delivery.no_deliveries')}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryManagement;