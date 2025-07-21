// UI component prop types

import { ReactNode } from 'react';
import { Language, UserRole } from '../utils/constants';

export interface LayoutProps {
  children: ReactNode;
  user?: {
    name: string;
    role: UserRole;
  };
  terminal?: {
    name: string;
    isOnline: boolean;
  };
  upsStatus?: {
    isOnBattery: boolean;
    batteryLevel?: number;
    estimatedRuntime?: number;
  };
}

export interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export interface InputProps {
  type?: 'text' | 'number' | 'email' | 'tel' | 'password';
  placeholder?: string;
  value?: string | number;
  onChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  autoFocus?: boolean;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface TableColumn<T> {
  key: keyof T;
  header: string;
  render?: (value: any, row: T) => ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  className?: string;
}

export interface LanguageSwitcherProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

export interface CurrencyDisplayProps {
  amount: number;
  className?: string;
  showSymbol?: boolean;
}

export interface ShortcutKeyProps {
  keys: string[];
  description: string;
  onTrigger?: () => void;
}