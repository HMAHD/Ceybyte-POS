/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                   Barcode Scanner Component                                      │
 * │                                                                                                  │
 * │  Description: Barcode scanning component with keyboard input support and audio feedback.        │
 * │               Handles barcode input from USB scanners and manual entry.                         │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Space, message } from 'antd';
import { BarcodeOutlined, ScanOutlined } from '@ant-design/icons';
import { productsApi, ProductResponse } from '@/api/products.api';

interface BarcodeScannerProps {
  onProductFound?: (product: ProductResponse) => void;
  onBarcodeScanned?: (barcode: string) => void;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onProductFound,
  onBarcodeScanned,
  placeholder = "Scan or enter barcode...",
  disabled = false,
  autoFocus = true
}) => {
  const [barcode, setBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<any>(null);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastKeypressTime = useRef<number>(0);

  // Auto-focus input when component mounts
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Handle keyboard input for barcode scanners
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (disabled) return;

      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeypressTime.current;
      
      // If time between keystrokes is very short (< 50ms), it's likely a barcode scanner
      if (timeDiff < 50 && event.key !== 'Enter') {
        // Clear any existing timeout
        if (scanTimeoutRef.current) {
          clearTimeout(scanTimeoutRef.current);
        }
        
        // Set timeout to process barcode after scanner finishes
        scanTimeoutRef.current = setTimeout(() => {
          if (barcode.length > 0) {
            handleBarcodeSubmit(barcode);
          }
        }, 100);
      }
      
      lastKeypressTime.current = currentTime;
    };

    document.addEventListener('keypress', handleKeyPress);
    return () => {
      document.removeEventListener('keypress', handleKeyPress);
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, [barcode, disabled]);

  const handleBarcodeSubmit = async (barcodeValue: string) => {
    if (!barcodeValue.trim()) return;

    setLoading(true);
    try {
      // Call the barcode scanned callback first
      if (onBarcodeScanned) {
        onBarcodeScanned(barcodeValue);
      }

      // Try to find product by barcode
      const response = await productsApi.getProductByBarcode(barcodeValue);
      
      if (response.success && response.data) {
        // Product found
        if (onProductFound) {
          onProductFound(response.data);
        }
        
        // Play success sound (if available)
        playBeep(800, 100); // High beep for success
        
        message.success(`Product found: ${response.data.name_en}`);
      } else {
        // Product not found
        playBeep(400, 200); // Low beep for not found
        message.warning(`No product found with barcode: ${barcodeValue}`);
      }
    } catch (error) {
      console.error('Error scanning barcode:', error);
      playBeep(300, 300); // Lower beep for error
      message.error('Error scanning barcode');
    } finally {
      setLoading(false);
      setBarcode(''); // Clear input after scan
      
      // Refocus input for next scan
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const playBeep = (frequency: number, duration: number) => {
    try {
      // Create audio context for beep sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
      // Fallback: no audio feedback if Web Audio API is not available
      console.log('Audio feedback not available');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBarcode(e.target.value);
  };

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBarcodeSubmit(barcode);
    }
  };

  const handleScanClick = () => {
    handleBarcodeSubmit(barcode);
  };

  return (
    <Space.Compact style={{ width: '100%' }}>
      <Input
        ref={inputRef}
        value={barcode}
        onChange={handleInputChange}
        onKeyPress={handleInputKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        prefix={<BarcodeOutlined />}
        autoComplete="off"
        style={{ flex: 1 }}
      />
      <Button
        type="primary"
        icon={<ScanOutlined />}
        onClick={handleScanClick}
        loading={loading}
        disabled={disabled || !barcode.trim()}
      >
        Scan
      </Button>
    </Space.Compact>
  );
};

export default BarcodeScanner;