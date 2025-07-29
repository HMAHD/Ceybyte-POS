/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                   Local Data Hooks                                              │
 * │                                                                                                  │
 * │  Description: React hooks for local-first data management with reactive updates.                 │
 * │               Provides instant UI updates with background synchronization.                       │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import { useState, useEffect, useCallback } from 'react';
import { localDataService } from '@/services/LocalDataService';

// Generic hook for entity data
export function useLocalData<T>(entity: string, id?: string | number) {
  const [data, setData] = useState<T | T[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // Subscribe to data changes
    const unsubscribe = localDataService.subscribe(entity, (event) => {
      if (!mounted) return;

      switch (event.type) {
        case 'created':
        case 'updated':
        case 'synced':
          if (id) {
            // Single item
            if (event.data.id === id) {
              setData(event.data);
            }
          } else {
            // List - refresh data
            loadData();
          }
          break;
        case 'deleted':
          if (id && event.data.id === id) {
            setData(null);
          } else if (!id) {
            // List - refresh data
            loadData();
          }
          break;
      }
    });

    // Initial load
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await localDataService.get<T>(entity, id);
        if (mounted) {
          setData(result);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load data');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [entity, id]);

  const create = useCallback(async (newData: Partial<T>) => {
    try {
      setError(null);
      return await localDataService.create<T>(entity, newData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create');
      throw err;
    }
  }, [entity]);

  const update = useCallback(async (updateId: string | number, updateData: Partial<T>) => {
    try {
      setError(null);
      return await localDataService.update<T>(entity, updateId, updateData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
      throw err;
    }
  }, [entity]);

  const remove = useCallback(async (deleteId: string | number) => {
    try {
      setError(null);
      return await localDataService.delete(entity, deleteId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
      throw err;
    }
  }, [entity]);

  return {
    data,
    loading,
    error,
    create,
    update,
    remove,
  };
}

// Specific hooks for common entities
export function useProducts() {
  return useLocalData<{
    id: number;
    name: string;
    barcode?: string;
    price: number;
    cost?: number;
    category_id?: number;
    unit_id?: number;
    stock_quantity?: number;
    is_active: boolean;
  }>('products');
}

export function useProduct(id: number) {
  return useLocalData<{
    id: number;
    name: string;
    barcode?: string;
    price: number;
    cost?: number;
    category_id?: number;
    unit_id?: number;
    stock_quantity?: number;
    is_active: boolean;
  }>('products', id);
}

export function useCustomers() {
  return useLocalData<{
    id: number;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    credit_limit?: number;
    current_credit?: number;
    is_active: boolean;
  }>('customers');
}

export function useCustomer(id: number) {
  return useLocalData<{
    id: number;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    credit_limit?: number;
    current_credit?: number;
    is_active: boolean;
  }>('customers', id);
}

export function useCategories() {
  return useLocalData<{
    id: number;
    name: string;
    description?: string;
    is_active: boolean;
  }>('categories');
}

export function useTodaySales() {
  return useLocalData<{
    id: number;
    receipt_number: string;
    customer_id?: number;
    customer_name?: string;
    user_id: number;
    terminal_id: number;
    items: Array<{
      product_id: number;
      product_name: string;
      quantity: number;
      unit_price: number;
      total_price: number;
    }>;
    payment: {
      method: string;
      amount_tendered?: number;
      change_amount?: number;
      reference?: string;
    };
    totals: {
      subtotal: number;
      tax_amount: number;
      discount_amount: number;
      total: number;
    };
    created_at: string;
    updated_at: string;
  }>('sales');
}

export function useDailySalesSummary() {
  return useLocalData<{
    date: string;
    total_sales: number;
    total_amount: number;
    transaction_count: number;
    payment_methods: Record<string, number>;
  }>('sales/summary/daily');
}

// Hook for sync status
export function useSyncStatus() {
  const [status, setStatus] = useState(localDataService.getSyncStatus());

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(localDataService.getSyncStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return status;
}