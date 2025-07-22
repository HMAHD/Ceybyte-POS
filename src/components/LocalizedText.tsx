/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                   Localized Text Component                                      │
 * │                                                                                                  │
 * │  Description: Component that automatically applies correct fonts and styling for different      │
 * │               languages. Handles Sinhala, Tamil, and English text rendering.                   │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                  │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { type SupportedLanguage } from '../i18n';

interface LocalizedTextProps {
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  lang?: SupportedLanguage;
  optimize?: boolean; // Enable text rendering optimization
  thermal?: boolean; // Use thermal printer optimized fonts
  receipt?: boolean; // Use receipt optimized fonts
}

export const LocalizedText: React.FC<LocalizedTextProps> = ({
  children,
  as: Component = 'span',
  className = '',
  lang,
  optimize = false,
  thermal = false,
  receipt = false,
}) => {
  const { language } = useTranslation();
  const currentLang = lang || language;

  // Build CSS classes based on language and options
  const getFontClasses = () => {
    const classes = [];

    // Base font class
    if (thermal) {
      classes.push(`thermal-print-${currentLang}`);
    } else if (receipt) {
      classes.push(`receipt-text-${currentLang}`);
    } else {
      classes.push(`font-${currentLang}`);
    }

    // Text rendering optimization
    if (optimize && (currentLang === 'si' || currentLang === 'ta')) {
      classes.push(`optimize-${currentLang}`);
    }

    return classes.join(' ');
  };

  const combinedClassName = `${getFontClasses()} ${className}`.trim();

  return (
    <Component 
      className={combinedClassName}
      lang={currentLang}
    >
      {children}
    </Component>
  );
};

export default LocalizedText;