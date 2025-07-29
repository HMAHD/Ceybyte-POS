/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                   PIN Authentication Context                                     │
 * │                                                                                                  │
 * │  Description: Fast PIN-based authentication context for POS operations.                          │
 * │               No JWT tokens, instant login, session stored in memory.                           │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { apiClient } from '@/api/client';
import { localDataService } from '@/services/LocalDataService';

interface PinUser {
  id: number;
  user_id: number;
  username: string;
  display_name: string;
  role: string;
  permissions: string[];
  preferred_language: string;
  has_account: boolean;
  last_used?: string;
}

interface PinAuthContextType {
  user: PinUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  availableUsers: Array<{
    username: string;
    display_name: string;
    role: string;
    last_used?: string;
  }>;
  pinLogin: (username: string, pin: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  loadAvailableUsers: () => Promise<void>;
  createPinUser: (userData: {
    username: string;
    display_name: string;
    pin: string;
    role: string;
    preferred_language?: string;
  }) => Promise<boolean>;
}

const PinAuthContext = createContext<PinAuthContextType | undefined>(undefined);

interface PinAuthProviderProps {
  children: ReactNode;
}

export const PinAuthProvider: React.FC<PinAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<PinUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<Array<{
    username: string;
    display_name: string;
    role: string;
    last_used?: string;
  }>>([]);

  const isAuthenticated = !!user;

  // Load available users on mount
  useEffect(() => {
    loadAvailableUsers();
    setupDefaultUsers();
  }, []);

  const setupDefaultUsers = async () => {
    try {
      await apiClient.post('/pin-auth/setup-defaults');
    } catch (error) {
      console.error('Failed to setup default users:', error);
    }
  };

  const loadAvailableUsers = async () => {
    try {
      const response = await apiClient.get<{ users: any[] }>('/pin-auth/users');
      
      if (response.success && response.data) {
        setAvailableUsers(response.data.users);
      }
    } catch (error) {
      console.error('Failed to load available users:', error);
    }
  };

  const pinLogin = async (username: string, pin: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await apiClient.post<{
        success: boolean;
        user: PinUser;
        session_type: string;
      }>('/pin-auth/login', {
        username,
        pin,
      });

      if (response.success && response.data?.success) {
        const userData = response.data.user;
        setUser(userData);
        
        // Store user in memory only (no localStorage for security)
        sessionStorage.setItem('ceybyte-pin-user', JSON.stringify(userData));
        
        // Start preloading essential data
        localDataService.preloadEssentialData();
        
        return true;
      } else {
        console.error('PIN login failed:', response.error);
        return false;
      }
    } catch (error) {
      console.error('PIN login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const createPinUser = async (userData: {
    username: string;
    display_name: string;
    pin: string;
    role: string;
    preferred_language?: string;
  }): Promise<boolean> => {
    try {
      const response = await apiClient.post('/pin-auth/create-user', userData);
      
      if (response.success) {
        // Reload available users
        await loadAvailableUsers();
        return true;
      } else {
        console.error('Failed to create PIN user:', response.error);
        return false;
      }
    } catch (error) {
      console.error('Create PIN user error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('ceybyte-pin-user');
    
    // Clear local data cache
    localDataService.clearCache();
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return user.permissions.includes(permission);
  };

  // Try to restore session from sessionStorage
  useEffect(() => {
    try {
      const savedUser = sessionStorage.getItem('ceybyte-pin-user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        
        // Start preloading data
        localDataService.preloadEssentialData();
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
      sessionStorage.removeItem('ceybyte-pin-user');
    }
  }, []);

  const value: PinAuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    availableUsers,
    pinLogin,
    logout,
    hasPermission,
    loadAvailableUsers,
    createPinUser,
  };

  return (
    <PinAuthContext.Provider value={value}>
      {children}
    </PinAuthContext.Provider>
  );
};

export const usePinAuth = (): PinAuthContextType => {
  const context = useContext(PinAuthContext);
  if (context === undefined) {
    throw new Error('usePinAuth must be used within a PinAuthProvider');
  }
  return context;
};