/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                   Language Switcher Component                                    │
 * │                                                                                                  │
 * │  Description: Language switcher component with persistence and smooth transitions.               │
 * │               Supports English, Sinhala, and Tamil with native language names.                   │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '../i18n';

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'buttons' | 'compact';
  className?: string;
  showFlags?: boolean;
  showNativeNames?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'dropdown',
  className = '',
  showFlags = true,
  showNativeNames = true,
}) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = i18n.language as SupportedLanguage;
  const currentLangConfig = SUPPORTED_LANGUAGES[currentLanguage];

  const handleLanguageChange = (langCode: SupportedLanguage) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  if (variant === 'buttons') {
    return (
      <div className={`flex gap-2 ${className}`}>
        {Object.entries(SUPPORTED_LANGUAGES).map(([code, config]) => (
          <button
            key={code}
            onClick={() => handleLanguageChange(code as SupportedLanguage)}
            className={`
              px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${
                currentLanguage === code
                  ? 'bg-ceybyte-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {showFlags && <span className="mr-1">{config.flag}</span>}
            {showNativeNames ? config.nativeName : config.name}
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-2 py-1 text-sm rounded hover:bg-gray-100 transition-colors"
        >
          {showFlags && <span>{currentLangConfig.flag}</span>}
          <span className="font-medium">{currentLangConfig.code.toUpperCase()}</span>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border z-20">
              {Object.entries(SUPPORTED_LANGUAGES).map(([code, config]) => (
                <button
                  key={code}
                  onClick={() => handleLanguageChange(code as SupportedLanguage)}
                  className={`
                    w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors
                    flex items-center gap-3
                    ${currentLanguage === code ? 'bg-ceybyte-primary/10 text-ceybyte-primary' : 'text-gray-700'}
                  `}
                >
                  {showFlags && <span className="text-lg">{config.flag}</span>}
                  <div>
                    <div className="font-medium">{config.name}</div>
                    {showNativeNames && config.nativeName !== config.name && (
                      <div className="text-xs text-gray-500">{config.nativeName}</div>
                    )}
                  </div>
                  {currentLanguage === code && (
                    <svg className="w-4 h-4 ml-auto text-ceybyte-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-ceybyte-primary focus:border-ceybyte-primary transition-colors"
      >
        {showFlags && <span className="text-lg">{currentLangConfig.flag}</span>}
        <div className="text-left">
          <div className="text-sm font-medium text-gray-900">{currentLangConfig.name}</div>
          {showNativeNames && currentLangConfig.nativeName !== currentLangConfig.name && (
            <div className="text-xs text-gray-500">{currentLangConfig.nativeName}</div>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border z-20">
            <div className="py-1">
              {Object.entries(SUPPORTED_LANGUAGES).map(([code, config]) => (
                <button
                  key={code}
                  onClick={() => handleLanguageChange(code as SupportedLanguage)}
                  className={`
                    w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors
                    flex items-center gap-3
                    ${currentLanguage === code ? 'bg-ceybyte-primary/10' : ''}
                  `}
                >
                  {showFlags && <span className="text-xl">{config.flag}</span>}
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${currentLanguage === code ? 'text-ceybyte-primary' : 'text-gray-900'}`}>
                      {config.name}
                    </div>
                    {showNativeNames && config.nativeName !== config.name && (
                      <div className="text-xs text-gray-500">{config.nativeName}</div>
                    )}
                  </div>
                  {currentLanguage === code && (
                    <svg className="w-5 h-5 text-ceybyte-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSwitcher;