/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                 Printer Configuration Component                                   │
 * │                                                                                                  │
 * │  Description: Thermal printer setup and configuration interface with discovery and testing      │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                  │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Printer, 
  Search, 
  Settings, 
  TestTube, 
  Plus, 
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';

interface DiscoveredPrinter {
  type: string;
  name: string;
  port: string;
  vendor_id?: string;
  product_id?: string;
  description?: string;
}

interface ConfiguredPrinter {
  id: number;
  name: string;
  type: string;
  connection_string: string;
  is_default: boolean;
  paper_width: number;
  characters_per_line: number;
  last_test_success: boolean;
}

interface PrinterConfigProps {
  onClose?: () => void;
}

export const PrinterConfig: React.FC<PrinterConfigProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const [discoveredPrinters, setDiscoveredPrinters] = useState<{
    usb: DiscoveredPrinter[];
    serial: DiscoveredPrinter[];
  }>({ usb: [], serial: [] });
  const [configuredPrinters, setConfiguredPrinters] = useState<ConfiguredPrinter[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isTesting, setIsTesting] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState<DiscoveredPrinter | null>(null);

  useEffect(() => {
    loadConfiguredPrinters();
    discoverPrinters();
  }, []);

  const loadConfiguredPrinters = async () => {
    try {
      const response = await fetch('/api/printer/');
      const data = await response.json();
      if (data.success) {
        setConfiguredPrinters(data.data);
      }
    } catch (error) {
      console.error('Failed to load configured printers:', error);
    }
  };

  const discoverPrinters = async () => {
    setIsDiscovering(true);
    try {
      const response = await fetch('/api/printer/discover');
      const data = await response.json();
      if (data.success) {
        setDiscoveredPrinters(data.data);
      }
    } catch (error) {
      console.error('Failed to discover printers:', error);
    } finally {
      setIsDiscovering(false);
    }
  };

  const testPrinter = async (printer: DiscoveredPrinter | ConfiguredPrinter) => {
    const testId = 'type' in printer ? printer.type + printer.port : printer.id.toString();
    setIsTesting(testId);
    
    try {
      let printerConfig;
      
      if ('type' in printer) {
        // Discovered printer
        printerConfig = {
          type: printer.type,
          name: printer.name,
          port: printer.port,
          vendor_id: printer.vendor_id,
          product_id: printer.product_id
        };
      } else {
        // Configured printer
        printerConfig = {
          type: printer.type,
          name: printer.name,
          connection_string: printer.connection_string
        };
        
        if (printer.type === 'usb') {
          const [vendor_id, product_id] = printer.connection_string.split(':');
          printerConfig.vendor_id = vendor_id;
          printerConfig.product_id = product_id;
        } else if (printer.type === 'serial') {
          printerConfig.port = printer.connection_string;
        }
      }
      
      const response = await fetch('/api/printer/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ printer_config: printerConfig })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(t('printer.testSuccess'));
        loadConfiguredPrinters(); // Refresh to update test status
      } else {
        alert(t('printer.testFailed') + ': ' + data.message);
      }
    } catch (error) {
      console.error('Printer test failed:', error);
      alert(t('printer.testError'));
    } finally {
      setIsTesting(null);
    }
  };

  const addPrinter = (printer: DiscoveredPrinter) => {
    setSelectedPrinter(printer);
    setShowAddForm(true);
  };

  const savePrinter = async (formData: any) => {
    try {
      let connectionString = '';
      
      if (formData.type === 'usb') {
        connectionString = `${formData.vendor_id}:${formData.product_id}`;
      } else if (formData.type === 'serial') {
        connectionString = formData.port;
      } else if (formData.type === 'network') {
        connectionString = `${formData.host}:${formData.port}`;
      }
      
      const response = await fetch('/api/printer/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          printer_type: formData.type,
          connection_string: connectionString,
          paper_width: parseInt(formData.paper_width) || 80,
          characters_per_line: parseInt(formData.characters_per_line) || 48,
          is_default: formData.is_default || false
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setShowAddForm(false);
        setSelectedPrinter(null);
        loadConfiguredPrinters();
        alert(t('printer.addSuccess'));
      } else {
        alert(t('printer.addFailed'));
      }
    } catch (error) {
      console.error('Failed to save printer:', error);
      alert(t('printer.saveError'));
    }
  };

  const deletePrinter = async (printerId: number) => {
    if (!confirm(t('printer.deleteConfirm'))) return;
    
    try {
      const response = await fetch(`/api/printer/${printerId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        loadConfiguredPrinters();
        alert(t('printer.deleteSuccess'));
      } else {
        alert(t('printer.deleteFailed'));
      }
    } catch (error) {
      console.error('Failed to delete printer:', error);
      alert(t('printer.deleteError'));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Printer className="w-6 h-6 text-ceybyte-primary" />
            <h2 className="text-xl font-semibold">{t('printer.configuration')}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Configured Printers */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">{t('printer.configured')}</h3>
            {configuredPrinters.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                {t('printer.noConfigured')}
              </p>
            ) : (
              <div className="space-y-3">
                {configuredPrinters.map((printer) => (
                  <div
                    key={printer.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Printer className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="font-medium">{printer.name}</div>
                        <div className="text-sm text-gray-500">
                          {printer.type.toUpperCase()} - {printer.connection_string}
                          {printer.is_default && (
                            <span className="ml-2 px-2 py-1 bg-ceybyte-primary text-white text-xs rounded">
                              {t('printer.default')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {printer.last_test_success ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <button
                        onClick={() => testPrinter(printer)}
                        disabled={isTesting === printer.id.toString()}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                      >
                        {isTesting === printer.id.toString() ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <TestTube className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => deletePrinter(printer.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Discovered Printers */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">{t('printer.discovered')}</h3>
              <button
                onClick={discoverPrinters}
                disabled={isDiscovering}
                className="flex items-center gap-2 px-4 py-2 bg-ceybyte-primary text-white rounded hover:bg-ceybyte-primary/90 disabled:opacity-50"
              >
                {isDiscovering ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                {t('printer.discover')}
              </button>
            </div>

            {/* USB Printers */}
            {discoveredPrinters.usb.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">{t('printer.usbPrinters')}</h4>
                <div className="space-y-2">
                  {discoveredPrinters.usb.map((printer, index) => (
                    <div
                      key={`usb-${index}`}
                      className="flex items-center justify-between p-3 border rounded"
                    >
                      <div>
                        <div className="font-medium">{printer.name}</div>
                        <div className="text-sm text-gray-500">
                          {printer.vendor_id}:{printer.product_id}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => testPrinter(printer)}
                          disabled={isTesting === printer.type + printer.port}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                        >
                          {isTesting === printer.type + printer.port ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <TestTube className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => addPrinter(printer)}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Serial Printers */}
            {discoveredPrinters.serial.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">{t('printer.serialPrinters')}</h4>
                <div className="space-y-2">
                  {discoveredPrinters.serial.map((printer, index) => (
                    <div
                      key={`serial-${index}`}
                      className="flex items-center justify-between p-3 border rounded"
                    >
                      <div>
                        <div className="font-medium">{printer.name}</div>
                        <div className="text-sm text-gray-500">
                          {printer.description}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => testPrinter(printer)}
                          disabled={isTesting === printer.type + printer.port}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                        >
                          {isTesting === printer.type + printer.port ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <TestTube className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => addPrinter(printer)}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {discoveredPrinters.usb.length === 0 && discoveredPrinters.serial.length === 0 && !isDiscovering && (
              <p className="text-gray-500 text-center py-8">
                {t('printer.noDiscovered')}
              </p>
            )}
          </div>
        </div>

        {/* Add Printer Form Modal */}
        {showAddForm && selectedPrinter && (
          <AddPrinterForm
            printer={selectedPrinter}
            onSave={savePrinter}
            onCancel={() => {
              setShowAddForm(false);
              setSelectedPrinter(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

interface AddPrinterFormProps {
  printer: DiscoveredPrinter;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const AddPrinterForm: React.FC<AddPrinterFormProps> = ({ printer, onSave, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: printer.name,
    type: printer.type,
    vendor_id: printer.vendor_id || '',
    product_id: printer.product_id || '',
    port: printer.port || '',
    paper_width: '80',
    characters_per_line: '48',
    is_default: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium">{t('printer.addPrinter')}</h3>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('printer.name')}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-ceybyte-primary"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('printer.paperWidth')}
              </label>
              <select
                value={formData.paper_width}
                onChange={(e) => setFormData({ ...formData, paper_width: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-ceybyte-primary"
              >
                <option value="58">58mm</option>
                <option value="80">80mm</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t('printer.charactersPerLine')}
              </label>
              <input
                type="number"
                value={formData.characters_per_line}
                onChange={(e) => setFormData({ ...formData, characters_per_line: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-ceybyte-primary"
                min="32"
                max="64"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_default"
              checked={formData.is_default}
              onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="is_default" className="text-sm">
              {t('printer.setAsDefault')}
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-ceybyte-primary text-white rounded hover:bg-ceybyte-primary/90"
            >
              {t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};