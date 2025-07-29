/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                   Local Data Service                                            │
 * │                                                                                                  │
 * │  Description: Local-first data management with instant UI updates and background sync.           │
 * │               Keeps hot data in memory, warm data in localStorage, cold data in API.            │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import { apiClient } from '@/api/client';

// Data categories for different caching strategies
type DataCategory = 'hot' | 'warm' | 'cold';

// Event system for reactive updates
type DataEventType = 'created' | 'updated' | 'deleted' | 'synced';

interface DataEvent<T = any> {
  type: DataEventType;
  entity: string;
  data: T;
  timestamp: number;
}

type DataEventListener<T = any> = (event: DataEvent<T>) => void;

class LocalDataService {
  private memoryCache = new Map<string, any>();
  private eventListeners = new Map<string, Set<DataEventListener>>();
  private syncQueue: Array<{ action: string; entity: string; data: any; timestamp: number }> = [];
  private isOnline = navigator.onLine;
  private syncInProgress = false;

  constructor() {
    // Monitor online status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processSyncQueue();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Start background sync
    this.startBackgroundSync();
  }

  // Event system
  subscribe<T>(entity: string, listener: DataEventListener<T>): () => void {
    if (!this.eventListeners.has(entity)) {
      this.eventListeners.set(entity, new Set());
    }
    
    this.eventListeners.get(entity)!.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.eventListeners.get(entity)?.delete(listener);
    };
  }

  private emit<T>(entity: string, type: DataEventType, data: T) {
    const event: DataEvent<T> = {
      type,
      entity,
      data,
      timestamp: Date.now()
    };

    this.eventListeners.get(entity)?.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Event listener error:', error);
      }
    });
  }

  // Memory cache (hot data)
  private setMemoryCache(key: string, data: any) {
    this.memoryCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  private getMemoryCache(key: string): any | null {
    const cached = this.memoryCache.get(key);
    if (!cached) return null;

    // Hot data expires after 5 minutes
    if (Date.now() - cached.timestamp > 5 * 60 * 1000) {
      this.memoryCache.delete(key);
      return null;
    }

    return cached.data;
  }

  // localStorage cache (warm data)
  private setLocalStorage(key: string, data: any) {
    try {
      localStorage.setItem(`ceybyte-pos-${key}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('localStorage error:', error);
    }
  }

  private getLocalStorage(key: string): any | null {
    try {
      const cached = localStorage.getItem(`ceybyte-pos-${key}`);
      if (!cached) return null;

      const parsed = JSON.parse(cached);
      
      // Warm data expires after 1 hour
      if (Date.now() - parsed.timestamp > 60 * 60 * 1000) {
        localStorage.removeItem(`ceybyte-pos-${key}`);
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.error('localStorage parse error:', error);
      return null;
    }
  }

  // Generic data operations with optimistic updates
  async get<T>(entity: string, id?: string | number): Promise<T | T[] | null> {
    const cacheKey = id ? `${entity}-${id}` : entity;
    
    // Try memory cache first (hot data)
    let data = this.getMemoryCache(cacheKey);
    if (data) {
      return data;
    }

    // Try localStorage (warm data)
    data = this.getLocalStorage(cacheKey);
    if (data) {
      // Promote to memory cache
      this.setMemoryCache(cacheKey, data);
      return data;
    }

    // Fetch from API (cold data) - non-blocking
    this.fetchFromAPI(entity, id, cacheKey);
    
    // Return null for now, data will come via events
    return null;
  }

  private async fetchFromAPI(entity: string, id?: string | number, cacheKey?: string) {
    try {
      const endpoint = id ? `/${entity}/${id}` : `/${entity}`;
      const response = await apiClient.get(endpoint);
      
      if (response.success && response.data) {
        const key = cacheKey || (id ? `${entity}-${id}` : entity);
        
        // Cache the data
        this.setMemoryCache(key, response.data);
        this.setLocalStorage(key, response.data);
        
        // Emit event
        this.emit(entity, 'synced', response.data);
      } else {
        console.warn(`API returned error for ${entity}:`, response.error);
        // For failed API calls, emit empty data to prevent infinite loading
        this.handleAPIError(entity, cacheKey);
      }
    } catch (error) {
      console.error(`Failed to fetch ${entity}:`, error);
      // For failed API calls, emit empty data to prevent infinite loading
      this.handleAPIError(entity, cacheKey);
    }
  }

  private handleAPIError(entity: string, cacheKey?: string) {
    const key = cacheKey || entity;
    
    // Provide fallback empty data based on entity type
    let fallbackData: any = [];
    
    if (entity.includes('summary')) {
      fallbackData = {
        date: new Date().toISOString().split('T')[0],
        total_sales: 0,
        total_amount: 0,
        transaction_count: 0,
        payment_methods: {}
      };
    }
    
    // Cache the fallback data
    this.setMemoryCache(key, fallbackData);
    
    // Emit event with fallback data
    this.emit(entity, 'synced', fallbackData);
  }

  // Optimistic create
  async create<T>(entity: string, data: Partial<T>): Promise<T> {
    const tempId = `temp-${Date.now()}`;
    const optimisticData = { ...data, id: tempId, _isOptimistic: true } as T;
    
    // Immediate UI update
    this.setMemoryCache(`${entity}-${tempId}`, optimisticData);
    this.emit(entity, 'created', optimisticData);
    
    // Queue for sync
    this.queueSync('create', entity, data);
    
    return optimisticData;
  }

  // Optimistic update
  async update<T>(entity: string, id: string | number, data: Partial<T>): Promise<T> {
    const cacheKey = `${entity}-${id}`;
    const existing = this.getMemoryCache(cacheKey) || this.getLocalStorage(cacheKey) || {};
    const optimisticData = { ...existing, ...data, _isOptimistic: true } as T;
    
    // Immediate UI update
    this.setMemoryCache(cacheKey, optimisticData);
    this.setLocalStorage(cacheKey, optimisticData);
    this.emit(entity, 'updated', optimisticData);
    
    // Queue for sync
    this.queueSync('update', entity, { id, ...data });
    
    return optimisticData;
  }

  // Optimistic delete
  async delete(entity: string, id: string | number): Promise<boolean> {
    const cacheKey = `${entity}-${id}`;
    
    // Remove from caches
    this.memoryCache.delete(cacheKey);
    localStorage.removeItem(`ceybyte-pos-${cacheKey}`);
    
    // Emit event
    this.emit(entity, 'deleted', { id });
    
    // Queue for sync
    this.queueSync('delete', entity, { id });
    
    return true;
  }

  // Sync queue management
  private queueSync(action: string, entity: string, data: any) {
    this.syncQueue.push({
      action,
      entity,
      data,
      timestamp: Date.now()
    });

    // Try immediate sync if online
    if (this.isOnline && !this.syncInProgress) {
      this.processSyncQueue();
    }
  }

  private async processSyncQueue() {
    if (this.syncInProgress || !this.isOnline || this.syncQueue.length === 0) {
      return;
    }

    this.syncInProgress = true;

    while (this.syncQueue.length > 0 && this.isOnline) {
      const item = this.syncQueue.shift()!;
      
      try {
        await this.syncItem(item);
      } catch (error) {
        console.error('Sync failed:', error);
        // Put item back at the beginning for retry
        this.syncQueue.unshift(item);
        break;
      }
    }

    this.syncInProgress = false;
  }

  private async syncItem(item: { action: string; entity: string; data: any; timestamp: number }) {
    const { action, entity, data } = item;
    
    try {
      let response;
      
      switch (action) {
        case 'create':
          response = await apiClient.post(`/${entity}`, data);
          break;
        case 'update':
          response = await apiClient.put(`/${entity}/${data.id}`, data);
          break;
        case 'delete':
          response = await apiClient.delete(`/${entity}/${data.id}`);
          break;
        default:
          throw new Error(`Unknown sync action: ${action}`);
      }

      if (response.success) {
        // Update local cache with server response
        if (action !== 'delete' && response.data) {
          const cacheKey = `${entity}-${response.data.id}`;
          this.setMemoryCache(cacheKey, response.data);
          this.setLocalStorage(cacheKey, response.data);
          this.emit(entity, 'synced', response.data);
        }
      } else {
        throw new Error(response.error || 'Sync failed');
      }
    } catch (error) {
      console.error(`Failed to sync ${action} ${entity}:`, error);
      throw error;
    }
  }

  // Background sync every 30 seconds
  private startBackgroundSync() {
    setInterval(() => {
      if (this.isOnline) {
        this.processSyncQueue();
      }
    }, 30000);
  }

  // Preload essential data
  async preloadEssentialData(): Promise<void> {
    const essentialEntities = [
      'products',
      'categories', 
      'customers',
      'units',
      'sales/summary/daily'
    ];

    const promises = essentialEntities.map(entity => 
      this.fetchFromAPI(entity, undefined, entity)
    );

    try {
      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Failed to preload essential data:', error);
    }
  }

  // Clear all caches
  clearCache(): void {
    this.memoryCache.clear();
    
    // Clear localStorage items
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('ceybyte-pos-')) {
        localStorage.removeItem(key);
      }
    });
  }

  // Get sync queue status
  getSyncStatus(): { pending: number; isOnline: boolean; syncing: boolean } {
    return {
      pending: this.syncQueue.length,
      isOnline: this.isOnline,
      syncing: this.syncInProgress
    };
  }
}

// Export singleton instance
export const localDataService = new LocalDataService();
export default localDataService;