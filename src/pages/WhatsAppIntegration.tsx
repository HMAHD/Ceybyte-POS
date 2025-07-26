/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                WhatsApp Integration Page                                         │
 * │                                                                                                  │
 * │  Description: Main WhatsApp integration management interface                                     │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                  │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState } from 'react';
import { Tabs, Button, message } from 'antd';
import {
    MessageCircle,
    Settings,
    Send,
    History,
    Calendar,
    Users
} from 'lucide-react';
import { WhatsAppConfig } from '@/components/WhatsAppConfig';
import { BulkMessaging } from '@/components/BulkMessaging';
import { WhatsAppHistory } from '@/components/WhatsAppHistory';
import { whatsappApi } from '@/api/whatsapp.api';

export const WhatsAppIntegration: React.FC = () => {
    const [activeTab, setActiveTab] = useState('config');
    const [loading, setLoading] = useState(false);

    const handleTriggerDailyReport = async () => {
        try {
            setLoading(true);
            const response = await whatsappApi.sendDailyReport();

            if (response.success) {
                message.success('Daily report sent successfully');
            } else {
                message.error(response.error || 'Failed to send daily report');
            }
        } catch (error) {
            console.error('Error sending daily report:', error);
            message.error('Failed to send daily report');
        } finally {
            setLoading(false);
        }
    };

    const handleTriggerReminders = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://127.0.0.1:8000/api/whatsapp/trigger-customer-reminders', {
                method: 'POST',
            });

            const data = await response.json();

            if (response.ok) {
                message.success('Customer reminders triggered successfully');
            } else {
                message.error(data.detail || 'Failed to trigger reminders');
            }
        } catch (error) {
            console.error('Error triggering reminders:', error);
            message.error('Failed to trigger customer reminders');
        } finally {
            setLoading(false);
        }
    };

    const tabItems = [
        {
            key: 'config',
            label: (
                <span className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Configuration
                </span>
            ),
            children: <WhatsAppConfig />,
        },
        {
            key: 'bulk',
            label: (
                <span className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Bulk Messaging
                </span>
            ),
            children: <BulkMessaging />,
        },
        {
            key: 'history',
            label: (
                <span className="flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Message History
                </span>
            ),
            children: <WhatsAppHistory />,
        },
        {
            key: 'automation',
            label: (
                <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Automation
                </span>
            ),
            children: (
                <div className="p-6 max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <Calendar className="w-6 h-6 text-blue-600" />
                        <h1 className="text-2xl font-bold">WhatsApp Automation</h1>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Daily Reports */}
                        <div className="bg-white border rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                <h3 className="text-lg font-semibold">Daily Reports</h3>
                            </div>

                            <p className="text-gray-600 mb-4">
                                Send automated daily sales reports to the owner at a scheduled time.
                            </p>

                            <div className="space-y-3">
                                <div className="text-sm text-gray-500">
                                    Configure automatic daily reports in the Configuration tab.
                                </div>

                                <Button
                                    type="primary"
                                    onClick={handleTriggerDailyReport}
                                    loading={loading}
                                    block
                                >
                                    Send Daily Report Now
                                </Button>
                            </div>
                        </div>

                        {/* Customer Reminders */}
                        <div className="bg-white border rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Users className="w-5 h-5 text-orange-600" />
                                <h3 className="text-lg font-semibold">Payment Reminders</h3>
                            </div>

                            <p className="text-gray-600 mb-4">
                                Send payment reminders to customers with outstanding balances.
                            </p>

                            <div className="space-y-3">
                                <div className="text-sm text-gray-500">
                                    Automatically remind customers about pending payments.
                                </div>

                                <Button
                                    type="primary"
                                    onClick={handleTriggerReminders}
                                    loading={loading}
                                    block
                                >
                                    Send Reminders Now
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Automation Features */}
                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">Automated Features</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                <div>
                                    <div className="font-medium">Auto Receipt Sending</div>
                                    <div className="text-sm text-gray-600">
                                        Automatically send receipts via WhatsApp after each sale
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                <div>
                                    <div className="font-medium">Daily Report Scheduling</div>
                                    <div className="text-sm text-gray-600">
                                        Send daily sales summary at configured time
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                                <div>
                                    <div className="font-medium">Payment Reminders</div>
                                    <div className="text-sm text-gray-600">
                                        Automatic reminders for overdue customer payments
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                                <div>
                                    <div className="font-medium">Backup Notifications</div>
                                    <div className="text-sm text-gray-600">
                                        Get notified when database backups are created
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-3">
                        <MessageCircle className="w-8 h-8 text-green-600" />
                        <div>
                            <h1 className="text-2xl font-bold">WhatsApp Business Integration</h1>
                            <p className="text-gray-600">
                                Manage WhatsApp messaging, automation, and customer communication
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={tabItems}
                    size="large"
                />
            </div>
        </div>
    );
};