/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                   Authentication Context                                         │
 * │                                                                                                  │
 * │  Description: React context for managing user authentication state and JWT tokens.               │
 * │               Provides login, logout, and user session management across the application.        │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/api/client';

interface User {
    id: number;
    username: string;
    name: string;
    role: string;
    permissions: string[];
    preferred_language: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<boolean>;
    pinLogin: (username: string, pin: string) => Promise<boolean>;
    logout: () => void;
    hasPermission: (permission: string) => boolean;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isAuthenticated = !!user && !!token;

    // Load token from localStorage on mount
    useEffect(() => {
        const savedToken = localStorage.getItem('ceybyte-pos-token');
        if (savedToken) {
            setToken(savedToken);
            verifyAndLoadUser(savedToken);
        } else {
            setIsLoading(false);
        }
    }, []);

    const verifyAndLoadUser = async (authToken: string) => {
        try {
            const response = await apiClient.get('/auth/me', {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            });

            if (response.success && response.data) {
                setUser(response.data);
            } else {
                // Token is invalid, clear it
                localStorage.removeItem('ceybyte-pos-token');
                setToken(null);
            }
        } catch (error) {
            console.error('Token verification failed:', error);
            localStorage.removeItem('ceybyte-pos-token');
            setToken(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (username: string, password: string): Promise<boolean> => {
        try {
            const response = await apiClient.post('/auth/login', {
                username,
                password
            });

            if (response.success && response.data) {
                const { access_token, user: userData } = response.data;

                setToken(access_token);
                setUser(userData);
                localStorage.setItem('ceybyte-pos-token', access_token);

                return true;
            } else {
                console.error('Login failed:', response.error);
                return false;
            }
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    const pinLogin = async (username: string, pin: string): Promise<boolean> => {
        try {
            const response = await apiClient.post('/auth/pin-login', {
                username,
                pin
            });

            if (response.success && response.data) {
                const { access_token, user: userData } = response.data;

                setToken(access_token);
                setUser(userData);
                localStorage.setItem('ceybyte-pos-token', access_token);

                return true;
            } else {
                console.error('PIN login failed:', response.error);
                return false;
            }
        } catch (error) {
            console.error('PIN login error:', error);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('ceybyte-pos-token');
    };

    const hasPermission = (permission: string): boolean => {
        if (!user) return false;
        return user.permissions.includes(permission);
    };

    const refreshUser = async () => {
        if (token) {
            await verifyAndLoadUser(token);
        }
    };

    const value: AuthContextType = {
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        pinLogin,
        logout,
        hasPermission,
        refreshUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};