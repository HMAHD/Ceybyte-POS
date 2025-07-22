/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                      Login Screen Component                                      │
 * │                                                                                                  │
 * │  Description: Login interface with username/password and PIN authentication support.             │
 * │               Includes role-based access and multi-language support.                             │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import LocalizedText from '@/components/LocalizedText';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { APP_NAME, COMPANY_NAME } from '@/utils/constants';

interface LoginScreenProps {
  onLoginSuccess?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { login, pinLogin } = useAuth();
  const { t, common } = useTranslation();
  
  const [loginMode, setLoginMode] = useState<'password' | 'pin'>('password');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (success) {
        onLoginSuccess?.();
      } else {
        setError(t('auth.loginError'));
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(t('errors.networkError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await pinLogin(username, pin);
      if (success) {
        onLoginSuccess?.();
      } else {
        setError(t('auth.loginError'));
      }
    } catch (error) {
      console.error('PIN login error:', error);
      setError(t('errors.networkError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickUserSwitch = (user: string) => {
    setUsername(user);
    setLoginMode('pin');
    setPin('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-end mb-4">
            <LanguageSwitcher variant="compact" />
          </div>
          
          <CardTitle className="text-2xl text-center">
            <LocalizedText>{APP_NAME}</LocalizedText>
          </CardTitle>
          <CardDescription className="text-center">
            <LocalizedText>{t('auth.login')}</LocalizedText>
          </CardDescription>
          <p className="text-sm text-muted-foreground text-center">
            Powered by {COMPANY_NAME}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Login Mode Toggle */}
          <div className="flex bg-muted rounded-lg p-1">
            <Button
              type="button"
              variant={loginMode === 'password' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setLoginMode('password')}
              className="flex-1"
            >
              <LocalizedText>{t('auth.password')}</LocalizedText>
            </Button>
            <Button
              type="button"
              variant={loginMode === 'pin' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setLoginMode('pin')}
              className="flex-1"
            >
              <LocalizedText>{t('auth.pin')}</LocalizedText>
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                <LocalizedText>{error}</LocalizedText>
              </AlertDescription>
            </Alert>
          )}

          {/* Password Login Form */}
          {loginMode === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">
                  <LocalizedText>{t('auth.username')}</LocalizedText>
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  <LocalizedText>{t('auth.password')}</LocalizedText>
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                <LocalizedText>
                  {isLoading ? common.loading : t('auth.loginButton')}
                </LocalizedText>
              </Button>
            </form>
          )}

          {/* PIN Login Form */}
          {loginMode === 'pin' && (
            <form onSubmit={handlePinLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username-pin">
                  <LocalizedText>{t('auth.username')}</LocalizedText>
                </Label>
                <Input
                  id="username-pin"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pin">
                  <LocalizedText>{t('auth.pin')}</LocalizedText>
                </Label>
                <Input
                  id="pin"
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                  required
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                <LocalizedText>
                  {isLoading ? common.loading : t('auth.loginButton')}
                </LocalizedText>
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter>
          <div className="w-full space-y-3">
            <div className="text-sm text-muted-foreground">
              <LocalizedText>{t('auth.quickSwitch', 'Quick Switch:')}</LocalizedText>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickUserSwitch('admin')}
                className="text-xs"
              >
                <LocalizedText>Admin</LocalizedText>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickUserSwitch('cashier')}
                className="text-xs"
              >
                <LocalizedText>Cashier</LocalizedText>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickUserSwitch('helper')}
                className="text-xs"
              >
                <LocalizedText>Helper</LocalizedText>
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginScreen;