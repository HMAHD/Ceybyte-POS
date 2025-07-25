/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                 Printer Settings Page                                            │
 * │                                                                                                  │
 * │  Description: Printer configuration and management page for thermal printer setup              │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                  │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Printer, Settings, TestTube, Queue } from 'lucide-react';
import { PrinterConfig } from '@/components/PrinterConfig';

export const PrinterSettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const [showConfig, setShowConfig] = useState(false);
  const [printQueue, setPrintQueue] = useState([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);

  const handleTestPrint = async () => {
    try {
      const response = await fetch('/api/printer/receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sale_data: {
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().split(' ')[0],
            cashier: 'Test User',
            customer: 'Test Customer',
            items: [
              {
                name: 'Test Product',
                quantity: 1,
                price: 100.00
              }
            ],
            payment_method: 'cash',
            amount_paid: 100.00,
            change: 0
          },
          business_info: {
            name: 'CeybytePOS Demo',
            address: 'Test Address',
            phone: '011-1234567'
          },
          language: 'en',
          paper_width: 80
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(t('printer.testSuccess'));
      } else {
        alert(t('printer.testFailed') + ': ' + data.message);
      }
    } catch (error) {
      console.error('Test print failed:', error);
      alert(t('printer.testError'));
    }
  };

  const loadPrintQueue = async () => {
    try {
      const response = await fetch('/api/printer/queue');
      const data = await response.json();
      if (data.success) {
        setPrintQueue(data.data);
      }
    } catch (error) {
      console.error('Failed to load print queue:', error);
    }
  };

  const processQueue = async () => {
    setIsProcessingQueue(true);
    try {
      const response = await fetch('/api/printer/queue/process', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        alert('Print queue processed successfully');
        loadPrintQueue(); // Refresh queue
      } else {
        alert('Failed to process print queue');
      }
    } catch (error) {
      console.error('Failed to process queue:', error);
      alert('Error processing print queue');
    } finally {
      setIsProcessingQueue(false);
    }
  };

  React.useEffect(() => {
    loadPrintQueue();
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Printer className="w-8 h-8 text-ceybyte-primary" />
          <div>
            <h1 className="text-2xl font-bold">{t('printer.configuration')}</h1>
            <p className="text-gray-600">Configure thermal printers and manage print jobs</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Printer Configuration */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-5 h-5 text-ceybyte-primary" />
            <h2 className="text-lg font-semibold">Printer Setup</h2>
          </div>
          
          <p className="text-gray-600 mb-4">
            Configure thermal printers for receipt printing. Supports USB, Serial, and Network printers.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => setShowConfig(true)}
              className="w-full px-4 py-2 bg-ceybyte-primary text-white rounded hover:bg-ceybyte-primary/90 flex items-center justify-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Configure Printers
            </button>
            
            <button
              onClick={handleTestPrint}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-2"
            >
              <TestTube className="w-4 h-4" />
              Test Print Receipt
            </button>
          </div>
        </div>

        {/* Print Queue */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Queue className="w-5 h-5 text-ceybyte-primary" />
              <h2 className="text-lg font-semibold">{t('printer.printQueue')}</h2>
            </div>
            <button
              onClick={loadPrintQueue}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              {t('common.refresh')}
            </button>
          </div>
          
          {printQueue.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              {t('printer.queueEmpty')}
            </p>
          ) : (
            <div className="space-y-2">
              {printQueue.map((job: any) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-3 border rounded"
                >
                  <div>
                    <div className="font-medium">{job.job_type}</div>
                    <div className="text-sm text-gray-500">
                      {job.reference_id} - Priority: {job.priority}
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${
                      job.status === 'completed' ? 'bg-green-100 text-green-800' :
                      job.status === 'failed' ? 'bg-red-100 text-red-800' :
                      job.status === 'printing' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                </div>
              ))}
              
              <button
                onClick={processQueue}
                disabled={isProcessingQueue}
                className="w-full mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                {isProcessingQueue ? t('printer.processing') : 'Process Queue'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Printer Features */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">Printer Features</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Multi-Language Support</h3>
            <p className="text-sm text-gray-600">
              Print receipts in English, Sinhala, and Tamil with proper character transliteration.
            </p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">ESC/POS Compatible</h3>
            <p className="text-sm text-gray-600">
              Works with most thermal printers supporting ESC/POS commands.
            </p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Direct Printing</h3>
            <p className="text-sm text-gray-600">
              Print directly without Windows print dialogs for faster operation.
            </p>
          </div>
        </div>
      </div>

      {/* Printer Configuration Modal */}
      {showConfig && (
        <PrinterConfig onClose={() => setShowConfig(false)} />
      )}
    </div>
  );
};