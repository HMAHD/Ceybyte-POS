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
import {
  Button,
  Input,
  Form,
  Alert,
  Segmented,
  Row,
  Col,
  Typography,
} from 'antd';
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import LocalizedText from '@/components/LocalizedText';
import { APP_NAME, COMPANY_NAME } from '@/utils/constants';

const { Title, Text } = Typography;

interface LoginScreenProps {
  onLoginSuccess?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { login, pinLogin } = useAuth();
  const { t, common } = useTranslation();

  const [loginMode, setLoginMode] = useState<'password' | 'pin'>('password');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePasswordLogin = async (values: any) => {
    setError('');
    setIsLoading(true);

    try {
      const success = await login(values.username || username, values.password);
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

  const handlePinLogin = async (values: any) => {
    setError('');
    setIsLoading(true);

    try {
      const success = await pinLogin(values.username || username, values.pin);
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
    setError('');
  };

  return (
    <div className='min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4'>
      {/* Sri Lankan Cultural Animated Background */}
      <div className='absolute inset-0 overflow-hidden'>
        {/* Interactive Blooming Lotus Tower on Right Side */}
        <div className='absolute right-8 top-1/2 transform -translate-y-1/2'>
          {/* Lotus Tower Stem */}
          <div className='absolute bottom-0 right-1/2 transform translate-x-1/2 w-1 h-32 bg-gradient-to-t from-green-400/30 to-green-300/20 animate-stem-grow'></div>

          {/* Blooming Lotus Flower - Multiple Layers */}
          <div className='relative lotus-container'>
            {/* Outer petals */}
            <div className='absolute w-8 h-16 bg-gradient-to-t from-pink-300/40 to-pink-100/30 lotus-petal-outer rotate-0 animate-lotus-bloom animation-delay-1000'></div>
            <div className='absolute w-8 h-16 bg-gradient-to-t from-pink-300/40 to-pink-100/30 lotus-petal-outer rotate-45 animate-lotus-bloom animation-delay-1500'></div>
            <div className='absolute w-8 h-16 bg-gradient-to-t from-pink-300/40 to-pink-100/30 lotus-petal-outer rotate-90 animate-lotus-bloom animation-delay-2000'></div>
            <div className='absolute w-8 h-16 bg-gradient-to-t from-pink-300/40 to-pink-100/30 lotus-petal-outer rotate-135 animate-lotus-bloom animation-delay-2500'></div>
            <div className='absolute w-8 h-16 bg-gradient-to-t from-pink-300/40 to-pink-100/30 lotus-petal-outer rotate-180 animate-lotus-bloom animation-delay-3000'></div>
            <div className='absolute w-8 h-16 bg-gradient-to-t from-pink-300/40 to-pink-100/30 lotus-petal-outer rotate-225 animate-lotus-bloom animation-delay-3500'></div>
            <div className='absolute w-8 h-16 bg-gradient-to-t from-pink-300/40 to-pink-100/30 lotus-petal-outer rotate-270 animate-lotus-bloom animation-delay-4000'></div>
            <div className='absolute w-8 h-16 bg-gradient-to-t from-pink-300/40 to-pink-100/30 lotus-petal-outer rotate-315 animate-lotus-bloom animation-delay-4500'></div>

            {/* Inner petals */}
            <div className='absolute w-6 h-12 bg-gradient-to-t from-pink-200/50 to-white/40 lotus-petal-inner rotate-22 animate-lotus-bloom-inner animation-delay-5000'></div>
            <div className='absolute w-6 h-12 bg-gradient-to-t from-pink-200/50 to-white/40 lotus-petal-inner rotate-67 animate-lotus-bloom-inner animation-delay-5500'></div>
            <div className='absolute w-6 h-12 bg-gradient-to-t from-pink-200/50 to-white/40 lotus-petal-inner rotate-112 animate-lotus-bloom-inner animation-delay-6000'></div>
            <div className='absolute w-6 h-12 bg-gradient-to-t from-pink-200/50 to-white/40 lotus-petal-inner rotate-157 animate-lotus-bloom-inner animation-delay-6500'></div>
            <div className='absolute w-6 h-12 bg-gradient-to-t from-pink-200/50 to-white/40 lotus-petal-inner rotate-202 animate-lotus-bloom-inner animation-delay-7000'></div>
            <div className='absolute w-6 h-12 bg-gradient-to-t from-pink-200/50 to-white/40 lotus-petal-inner rotate-247 animate-lotus-bloom-inner animation-delay-7500'></div>
            <div className='absolute w-6 h-12 bg-gradient-to-t from-pink-200/50 to-white/40 lotus-petal-inner rotate-292 animate-lotus-bloom-inner animation-delay-8000'></div>
            <div className='absolute w-6 h-12 bg-gradient-to-t from-pink-200/50 to-white/40 lotus-petal-inner rotate-337 animate-lotus-bloom-inner animation-delay-8500'></div>

            {/* Center of lotus */}
            <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gradient-to-br from-yellow-200/60 to-amber-300/50 rounded-full lotus-center animate-lotus-center-glow animation-delay-9000'></div>
          </div>
        </div>

        {/* Interactive Water with Ripples Below */}
        <div className='absolute bottom-0 left-0 w-full h-40'>
          {/* Water surface */}
          <div className='absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-blue-200/30 via-cyan-100/20 to-transparent water-surface animate-water-flow'></div>

          {/* Water ripples */}
          <div className='absolute bottom-8 right-12 w-16 h-4 border border-blue-300/20 rounded-full animate-ripple-1'></div>
          <div className='absolute bottom-12 right-10 w-24 h-6 border border-cyan-300/15 rounded-full animate-ripple-2 animation-delay-2000'></div>
          <div className='absolute bottom-6 right-14 w-32 h-8 border border-blue-200/10 rounded-full animate-ripple-3 animation-delay-4000'></div>
        </div>

        {/* Floating lotus petals throughout the screen */}
        <div className='absolute top-1/6 left-1/12 w-3 h-6 bg-gradient-to-t from-pink-200/25 to-white/15 lotus-petal-floating animate-petal-drift-1 animation-delay-2000'></div>
        <div className='absolute top-1/4 left-1/3 w-4 h-8 bg-gradient-to-t from-rose-200/30 to-pink-100/20 lotus-petal-floating animate-petal-drift-2 animation-delay-4000'></div>
        <div className='absolute top-1/3 right-1/4 w-4 h-8 bg-gradient-to-t from-pink-200/30 to-white/20 lotus-petal-floating animate-petal-drift-3 animation-delay-12000'></div>
        <div className='absolute top-2/3 right-1/6 w-3 h-6 bg-gradient-to-t from-rose-200/25 to-white/15 lotus-petal-floating animate-petal-drift-4 animation-delay-15000'></div>
        <div className='absolute top-1/2 left-1/6 w-5 h-10 bg-gradient-to-t from-pink-300/35 to-white/25 lotus-petal-floating animate-petal-drift-5 animation-delay-6000'></div>
        <div className='absolute top-3/4 left-2/3 w-3 h-7 bg-gradient-to-t from-rose-100/20 to-white/15 lotus-petal-floating animate-petal-drift-6 animation-delay-8000'></div>
        <div className='absolute top-1/5 right-1/3 w-4 h-9 bg-gradient-to-t from-pink-200/28 to-pink-50/18 lotus-petal-floating animate-petal-drift-7 animation-delay-10000'></div>
        <div className='absolute top-4/5 left-1/5 w-3 h-6 bg-gradient-to-t from-rose-200/22 to-white/12 lotus-petal-floating animate-petal-drift-8 animation-delay-14000'></div>
        <div className='absolute top-2/5 right-1/8 w-5 h-9 bg-gradient-to-t from-pink-300/32 to-pink-100/22 lotus-petal-floating animate-petal-drift-9 animation-delay-16000'></div>
        <div className='absolute top-3/5 left-1/4 w-4 h-7 bg-gradient-to-t from-rose-200/26 to-white/16 lotus-petal-floating animate-petal-drift-10 animation-delay-18000'></div>
        <div className='absolute top-1/8 left-3/4 w-3 h-8 bg-gradient-to-t from-pink-200/24 to-pink-50/14 lotus-petal-floating animate-petal-drift-11 animation-delay-20000'></div>
        <div className='absolute top-7/8 right-2/5 w-4 h-6 bg-gradient-to-t from-rose-300/28 to-white/18 lotus-petal-floating animate-petal-drift-12 animation-delay-22000'></div>

        {/* Small lotus buds scattered around */}
        <div className='absolute top-1/3 left-1/8 w-2 h-4 bg-gradient-to-t from-pink-300/20 to-pink-100/15 lotus-bud animate-bud-sway-1 animation-delay-3000'></div>
        <div className='absolute top-2/3 right-1/5 w-2 h-3 bg-gradient-to-t from-rose-200/18 to-white/12 lotus-bud animate-bud-sway-2 animation-delay-7000'></div>
        <div className='absolute top-1/2 right-1/8 w-2 h-4 bg-gradient-to-t from-pink-200/22 to-pink-50/16 lotus-bud animate-bud-sway-3 animation-delay-11000'></div>
        <div className='absolute top-1/4 left-3/5 w-2 h-3 bg-gradient-to-t from-rose-300/25 to-white/20 lotus-bud animate-bud-sway-4 animation-delay-13000'></div>
        <div className='absolute top-4/5 right-3/4 w-2 h-4 bg-gradient-to-t from-pink-200/20 to-pink-100/14 lotus-bud animate-bud-sway-5 animation-delay-17000'></div>

        {/* Larger floating lotus leaves */}
        <div className='absolute top-2/5 left-1/12 w-8 h-6 bg-gradient-to-br from-green-200/25 to-emerald-100/15 lotus-leaf animate-leaf-float-1 animation-delay-5000'></div>
        <div className='absolute top-3/4 right-1/7 w-6 h-5 bg-gradient-to-br from-green-300/20 to-teal-100/12 lotus-leaf animate-leaf-float-2 animation-delay-9000'></div>
        <div className='absolute top-1/6 right-2/3 w-7 h-5 bg-gradient-to-br from-emerald-200/22 to-green-100/14 lotus-leaf animate-leaf-float-3 animation-delay-19000'></div>

        {/* Interactive Mini Lotus Flowers - Respond to Hover */}
        <div className='absolute top-1/5 left-1/7 interactive-lotus-container'>
          <div className='mini-lotus animate-mini-lotus-gentle hover:animate-mini-lotus-excited animation-delay-1000'>
            <div className='mini-lotus-petal bg-gradient-to-t from-pink-300/35 to-white/25 rotate-0'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-pink-300/35 to-white/25 rotate-60'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-pink-300/35 to-white/25 rotate-120'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-pink-300/35 to-white/25 rotate-180'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-pink-300/35 to-white/25 rotate-240'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-pink-300/35 to-white/25 rotate-300'></div>
            <div className='mini-lotus-center bg-gradient-radial from-yellow-200/50 to-amber-300/40'></div>
          </div>
        </div>

        <div className='absolute top-2/3 left-1/3 interactive-lotus-container'>
          <div className='mini-lotus animate-mini-lotus-gentle hover:animate-mini-lotus-excited animation-delay-3000'>
            <div className='mini-lotus-petal bg-gradient-to-t from-rose-300/40 to-pink-100/30 rotate-0'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-rose-300/40 to-pink-100/30 rotate-60'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-rose-300/40 to-pink-100/30 rotate-120'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-rose-300/40 to-pink-100/30 rotate-180'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-rose-300/40 to-pink-100/30 rotate-240'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-rose-300/40 to-pink-100/30 rotate-300'></div>
            <div className='mini-lotus-center bg-gradient-radial from-yellow-300/55 to-orange-300/45'></div>
          </div>
        </div>

        <div className='absolute top-1/4 right-1/5 interactive-lotus-container'>
          <div className='mini-lotus animate-mini-lotus-gentle hover:animate-mini-lotus-excited animation-delay-5000'>
            <div className='mini-lotus-petal bg-gradient-to-t from-pink-200/38 to-white/28 rotate-0'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-pink-200/38 to-white/28 rotate-60'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-pink-200/38 to-white/28 rotate-120'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-pink-200/38 to-white/28 rotate-180'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-pink-200/38 to-white/28 rotate-240'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-pink-200/38 to-white/28 rotate-300'></div>
            <div className='mini-lotus-center bg-gradient-radial from-yellow-200/45 to-amber-200/35'></div>
          </div>
        </div>

        <div className='absolute top-4/5 right-1/3 interactive-lotus-container'>
          <div className='mini-lotus animate-mini-lotus-gentle hover:animate-mini-lotus-excited animation-delay-7000'>
            <div className='mini-lotus-petal bg-gradient-to-t from-rose-200/35 to-pink-50/25 rotate-0'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-rose-200/35 to-pink-50/25 rotate-60'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-rose-200/35 to-pink-50/25 rotate-120'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-rose-200/35 to-pink-50/25 rotate-180'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-rose-200/35 to-pink-50/25 rotate-240'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-rose-200/35 to-pink-50/25 rotate-300'></div>
            <div className='mini-lotus-center bg-gradient-radial from-orange-200/50 to-yellow-300/40'></div>
          </div>
        </div>

        <div className='absolute top-1/3 left-2/3 interactive-lotus-container'>
          <div className='mini-lotus animate-mini-lotus-gentle hover:animate-mini-lotus-excited animation-delay-9000'>
            <div className='mini-lotus-petal bg-gradient-to-t from-pink-300/42 to-white/32 rotate-0'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-pink-300/42 to-white/32 rotate-60'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-pink-300/42 to-white/32 rotate-120'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-pink-300/42 to-white/32 rotate-180'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-pink-300/42 to-white/32 rotate-240'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-pink-300/42 to-white/32 rotate-300'></div>
            <div className='mini-lotus-center bg-gradient-radial from-yellow-300/60 to-amber-400/50'></div>
          </div>
        </div>

        <div className='absolute top-3/5 left-1/8 interactive-lotus-container'>
          <div className='mini-lotus animate-mini-lotus-gentle hover:animate-mini-lotus-excited animation-delay-11000'>
            <div className='mini-lotus-petal bg-gradient-to-t from-rose-300/38 to-pink-100/28 rotate-0'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-rose-300/38 to-pink-100/28 rotate-60'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-rose-300/38 to-pink-100/28 rotate-120'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-rose-300/38 to-pink-100/28 rotate-180'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-rose-300/38 to-pink-100/28 rotate-240'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-rose-300/38 to-pink-100/28 rotate-300'></div>
            <div className='mini-lotus-center bg-gradient-radial from-orange-300/55 to-yellow-400/45'></div>
          </div>
        </div>

        <div className='absolute top-1/8 left-1/2 interactive-lotus-container'>
          <div className='mini-lotus animate-mini-lotus-gentle hover:animate-mini-lotus-excited animation-delay-13000'>
            <div className='mini-lotus-petal bg-gradient-to-t from-pink-200/40 to-white/30 rotate-0'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-pink-200/40 to-white/30 rotate-60'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-pink-200/40 to-white/30 rotate-120'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-pink-200/40 to-white/30 rotate-180'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-pink-200/40 to-white/30 rotate-240'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-pink-200/40 to-white/30 rotate-300'></div>
            <div className='mini-lotus-center bg-gradient-radial from-yellow-200/50 to-amber-300/40'></div>
          </div>
        </div>

        <div className='absolute top-7/8 left-3/4 interactive-lotus-container'>
          <div className='mini-lotus animate-mini-lotus-gentle hover:animate-mini-lotus-excited animation-delay-15000'>
            <div className='mini-lotus-petal bg-gradient-to-t from-rose-200/36 to-pink-50/26 rotate-0'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-rose-200/36 to-pink-50/26 rotate-60'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-rose-200/36 to-pink-50/26 rotate-120'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-rose-200/36 to-pink-50/26 rotate-180'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-rose-200/36 to-pink-50/26 rotate-240'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-rose-200/36 to-pink-50/26 rotate-300'></div>
            <div className='mini-lotus-center bg-gradient-radial from-orange-200/48 to-yellow-300/38'></div>
          </div>
        </div>

        <div className='absolute top-2/5 right-1/7 interactive-lotus-container'>
          <div className='mini-lotus animate-mini-lotus-gentle hover:animate-mini-lotus-excited animation-delay-17000'>
            <div className='mini-lotus-petal bg-gradient-to-t from-pink-300/45 to-white/35 rotate-0'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-pink-300/45 to-white/35 rotate-60'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-pink-300/45 to-white/35 rotate-120'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-pink-300/45 to-white/35 rotate-180'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-pink-300/45 to-white/35 rotate-240'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-pink-300/45 to-white/35 rotate-300'></div>
            <div className='mini-lotus-center bg-gradient-radial from-yellow-300/58 to-amber-400/48'></div>
          </div>
        </div>

        <div className='absolute top-1/6 left-4/5 interactive-lotus-container'>
          <div className='mini-lotus animate-mini-lotus-gentle hover:animate-mini-lotus-excited animation-delay-19000'>
            <div className='mini-lotus-petal bg-gradient-to-t from-rose-300/42 to-pink-100/32 rotate-0'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-rose-300/42 to-pink-100/32 rotate-60'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-rose-300/42 to-pink-100/32 rotate-120'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-rose-300/42 to-pink-100/32 rotate-180'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-rose-300/42 to-pink-100/32 rotate-240'></div>
            <div className='mini-lotus-petal bg-gradient-to-t from-rose-300/42 to-pink-100/32 rotate-300'></div>
            <div className='mini-lotus-center bg-gradient-radial from-orange-300/52 to-yellow-400/42'></div>
          </div>
        </div>

        {/* Traditional elements in background */}
        <div className='absolute top-1/4 left-1/4 w-12 h-12 srilanka-pattern border border-orange-300/20 animate-temple-glow animation-delay-2000'></div>
        <div className='absolute top-1/3 left-1/6 w-3 h-16 peacock-feather bg-gradient-to-b from-blue-300/25 to-green-300/20 animate-feather-sway animation-delay-6000'></div>

        {/* Subtle cultural gradient overlay */}
        <div className='absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-50/10 via-transparent via-green-50/8 to-blue-50/12 animate-cultural-shift'></div>
      </div>

      {/* Professional glass morphism login card */}
      <div className='relative z-10 w-full max-w-md backdrop-blur-xl bg-white/90 rounded-2xl shadow-2xl border border-white/30 p-6 sm:p-8'>
        <div className='relative'>
          {/* Compact Header */}
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center gap-3'>
              <div className='w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg'>
                <span className='text-white font-bold text-lg'>CP</span>
              </div>
              <div>
                <Title level={3} className='mb-0 text-gray-800 leading-tight'>
                  {APP_NAME}
                </Title>
                <Text type='secondary' className='text-xs'>
                  Powered by {COMPANY_NAME}
                </Text>
              </div>
            </div>

            {/* Language Switcher */}
            <div className='backdrop-blur-sm bg-gray-100/80 rounded-lg border border-gray-200/50 px-2 py-1'>
              <LanguageSwitcher variant='compact' showFlags={true} />
            </div>
          </div>

          <div className='space-y-4'>
            {/* Login Mode Toggle */}
            <div className='backdrop-blur-sm bg-gray-50/80 rounded-xl p-1 border border-gray-200/50'>
              <Segmented
                value={loginMode}
                onChange={value => setLoginMode(value as 'password' | 'pin')}
                options={[
                  {
                    label: (
                      <span className='text-gray-700 font-medium'>
                        <LocalizedText>{t('auth.password')}</LocalizedText>
                      </span>
                    ),
                    value: 'password',
                    icon: <LockOutlined className='text-gray-600' />,
                  },
                  {
                    label: (
                      <span className='text-gray-700 font-medium'>
                        <LocalizedText>{t('auth.pin')}</LocalizedText>
                      </span>
                    ),
                    value: 'pin',
                    icon: <SafetyOutlined className='text-gray-600' />,
                  },
                ]}
                block
                size='large'
                style={{
                  backgroundColor: 'transparent',
                }}
              />
            </div>

            {/* Error Message */}
            {error && (
              <Alert
                message={<LocalizedText>{error}</LocalizedText>}
                type='error'
                showIcon
                closable
                onClose={() => setError('')}
                className='backdrop-blur-sm bg-red-50/90 border border-red-200/50 rounded-lg'
              />
            )}

            {/* Password Login Form */}
            {loginMode === 'password' && (
              <Form
                onFinish={handlePasswordLogin}
                layout='vertical'
                size='middle'
                initialValues={{ username }}
                className='space-y-3'
              >
                <Form.Item
                  label={
                    <span className='text-gray-700 text-sm font-medium'>
                      <LocalizedText>{t('auth.username')}</LocalizedText>
                    </span>
                  }
                  name='username'
                  rules={[
                    { required: true, message: 'Please input your username!' },
                  ]}
                  className='mb-4'
                >
                  <Input
                    prefix={<UserOutlined className='text-gray-400' />}
                    disabled={isLoading}
                    placeholder='Enter username'
                    size='large'
                    className='backdrop-blur-sm bg-white/80 border-gray-200/50 rounded-lg h-12'
                    autoFocus
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span className='text-gray-700 text-sm font-medium'>
                      <LocalizedText>{t('auth.password')}</LocalizedText>
                    </span>
                  }
                  name='password'
                  rules={[
                    { required: true, message: 'Please input your password!' },
                  ]}
                  className='mb-5'
                >
                  <Input.Password
                    prefix={<LockOutlined className='text-gray-400' />}
                    disabled={isLoading}
                    placeholder='Enter password'
                    size='large'
                    className='backdrop-blur-sm bg-white/80 border-gray-200/50 rounded-lg h-12'
                  />
                </Form.Item>

                <Form.Item className='mb-0'>
                  <Button
                    type='primary'
                    htmlType='submit'
                    loading={isLoading}
                    block
                    size='large'
                    className='h-12 bg-blue-600 hover:bg-blue-700 border-0 rounded-lg font-medium shadow-lg'
                  >
                    <LocalizedText>
                      {isLoading ? common.loading : t('auth.loginButton')}
                    </LocalizedText>
                  </Button>
                </Form.Item>
              </Form>
            )}

            {/* PIN Login Form */}
            {loginMode === 'pin' && (
              <Form
                onFinish={handlePinLogin}
                layout='vertical'
                size='large'
                initialValues={{ username }}
                className='space-y-4'
              >
                <Form.Item
                  label={
                    <span className='text-gray-700 text-sm font-medium'>
                      <LocalizedText>{t('auth.username')}</LocalizedText>
                    </span>
                  }
                  name='username'
                  rules={[
                    { required: true, message: 'Please input your username!' },
                  ]}
                  className='mb-4'
                >
                  <Input
                    prefix={<UserOutlined className='text-gray-400' />}
                    disabled={isLoading}
                    placeholder='Enter username'
                    size='large'
                    className='backdrop-blur-sm bg-white/80 border-gray-200/50 rounded-lg h-12'
                    autoFocus
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span className='text-gray-700 text-sm font-medium'>
                      <LocalizedText>{t('auth.pin')}</LocalizedText>
                    </span>
                  }
                  name='pin'
                  rules={[
                    { required: true, message: 'Please input your PIN!' },
                  ]}
                  className='mb-5'
                >
                  <Input.Password
                    prefix={<SafetyOutlined className='text-gray-400' />}
                    maxLength={6}
                    style={{
                      textAlign: 'center',
                      letterSpacing: '0.5em',
                    }}
                    disabled={isLoading}
                    placeholder='• • • • • •'
                    size='large'
                    className='backdrop-blur-sm bg-white/80 border-gray-200/50 rounded-lg h-12'
                  />
                </Form.Item>

                <Form.Item className='mb-0'>
                  <Button
                    type='primary'
                    htmlType='submit'
                    loading={isLoading}
                    block
                    size='large'
                    className='h-12 bg-blue-600 hover:bg-blue-700 border-0 rounded-lg font-medium shadow-lg'
                  >
                    <LocalizedText>
                      {isLoading ? common.loading : t('auth.loginButton')}
                    </LocalizedText>
                  </Button>
                </Form.Item>
              </Form>
            )}

            {/* Quick Switch - Professional */}
            <div className='backdrop-blur-sm bg-gray-50/80 rounded-xl border border-gray-200/50 p-4'>
              <Text className='text-gray-700 text-sm font-medium block mb-3'>
                <LocalizedText>
                  {t('auth.quickSwitch', 'Quick Switch:')}
                </LocalizedText>
              </Text>
              <Row gutter={8}>
                <Col span={8}>
                  <Button
                    size='middle'
                    onClick={() => handleQuickUserSwitch('admin')}
                    block
                    title='PIN: 1234'
                    className='h-10 backdrop-blur-sm bg-white/80 border-gray-200/50 text-gray-700 hover:bg-blue-50 hover:border-blue-300 transition-all'
                  >
                    Admin
                  </Button>
                </Col>
                <Col span={8}>
                  <Button
                    size='middle'
                    onClick={() => handleQuickUserSwitch('cashier')}
                    block
                    title='PIN: 2345'
                    className='h-10 backdrop-blur-sm bg-white/80 border-gray-200/50 text-gray-700 hover:bg-blue-50 hover:border-blue-300 transition-all'
                  >
                    Cashier
                  </Button>
                </Col>
                <Col span={8}>
                  <Button
                    size='middle'
                    onClick={() => handleQuickUserSwitch('helper')}
                    block
                    title='PIN: 3456'
                    className='h-10 backdrop-blur-sm bg-white/80 border-gray-200/50 text-gray-700 hover:bg-blue-50 hover:border-blue-300 transition-all'
                  >
                    Helper
                  </Button>
                </Col>
              </Row>

              {/* Collapsible Credentials */}
              <details className='mt-4'>
                <summary className='text-gray-500 text-xs cursor-pointer hover:text-gray-700 transition-colors flex items-center'>
                  <span>View default credentials</span>
                  <svg
                    className='w-4 h-4 ml-1'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 9l-7 7-7-7'
                    />
                  </svg>
                </summary>
                <div className='mt-3 backdrop-blur-sm bg-white/60 rounded-lg p-3 text-xs space-y-2 text-gray-600 border border-gray-200/30'>
                  <div className='flex justify-between'>
                    <strong className='text-gray-700'>Admin:</strong>{' '}
                    <span>admin/AdminPass2025! (PIN: 1234)</span>
                  </div>
                  <div className='flex justify-between'>
                    <strong className='text-gray-700'>Cashier:</strong>{' '}
                    <span>cashier/CashierPass2025! (PIN: 2345)</span>
                  </div>
                  <div className='flex justify-between'>
                    <strong className='text-gray-700'>Helper:</strong>{' '}
                    <span>helper/HelperPass2025! (PIN: 3456)</span>
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
