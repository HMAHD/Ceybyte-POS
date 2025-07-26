/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                              Network Configuration Wizard                                        │
 * │                                                                                                  │
 * │  Description: Comprehensive network setup wizard for multi-terminal POS systems.                │
 * │               Handles terminal registration, network discovery, and sync configuration.          │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect } from 'react';
import {
    Modal,
    Steps,
    Card,
    Button,
    Space,
    Typography,
    Alert,
    Spin,
    Row,
    Col,
} from 'antd';
import {
    DesktopOutlined,
    WifiOutlined,
    SyncOutlined,
    CheckCircleOutlined,
    SettingOutlined,
} from '@ant-design/icons';
import { useTranslation } from '@/hooks/useTranslation';
import LocalizedText from '@/components/LocalizedText';
import NetworkSelectionDialog from '@/components/NetworkSelectionDialog';
import TerminalManager from '@/components/TerminalManager';
import NetworkStatusMonitor from '@/components/NetworkStatusMonitor';
import SyncQueueManager from '@/components/SyncQueueManager';
import type { NetworkConfiguration } from '@/types/network';
import type { Terminal } from '@/types/terminal';
import {
    initializeTerminal,
    discoverTerminals,
    initializeOfflineCache,
} from '@/api/terminals.api';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

interface NetworkConfigurationWizardProps {
    visible: boolean;
    onComplete: (config: NetworkConfiguration) => void;
    onCancel?: () => void;
    currentTerminalId?: string;
}

export const NetworkConfigurationWizard: React.FC<NetworkConfigurationWizardProps> = ({
    visible,
    onComplete,
    onCancel,
    currentTerminalId,
}) => {
    const { t } = useTranslation();

    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [networkConfig, setNetworkConfig] = useState<NetworkConfiguration | null>(null);
    const [terminalId, setTerminalId] = useState<string | null>(currentTerminalId || null);
    const [terminals, setTerminals] = useState<Terminal[]>([]);
    const [setupComplete, setSetupComplete] = useState(false);

    useEffect(() => {
        if (visible && currentTerminalId) {
            setTerminalId(currentTerminalId);
            loadTerminals();
        }
    }, [visible, currentTerminalId]);

    const loadTerminals = async () => {
        try {
            const response = await discoverTerminals();
            if (response.success) {
                setTerminals(response.terminals);
            }
        } catch (error) {
            console.error('Error loading terminals:', error);
        }
    };

    const handleNetworkSetupComplete = async (config: NetworkConfiguration) => {
        try {
            setLoading(true);
            setNetworkConfig(config);

            // Initialize terminal in backend
            const terminalConfig = {
                terminal_name: config.terminalName,
                terminal_type: 'pos' as const,
                is_main_terminal: config.terminalType === 'main',
                app_version: '1.0.0',
                network_path: config.mainComputerPath,
            };

            const response = await initializeTerminal(terminalConfig);

            if (response.success) {
                setTerminalId(response.terminal_id);

                // Initialize offline cache
                await initializeOfflineCache();

                // Move to next step
                setCurrentStep(1);
            }
        } catch (error) {
            console.error('Error initializing terminal:', error);
            // Continue anyway - offline mode
            setCurrentStep(1);
        } finally {
            setLoading(false);
        }
    };

    const handleTerminalSetupComplete = async () => {
        try {
            setLoading(true);

            // Refresh terminal list
            await loadTerminals();

            // Move to sync setup
            setCurrentStep(2);
        } catch (error) {
            console.error('Error completing terminal setup:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSyncSetupComplete = () => {
        setCurrentStep(3);
        setSetupComplete(true);
    };

    const handleWizardComplete = () => {
        if (networkConfig) {
            onComplete(networkConfig);
        }
    };

    const renderNetworkSetup = () => (
        <div>
            <Title level={4} className="text-center mb-4">
                <LocalizedText>{t('wizard.networkSetup', 'Network Setup')}</LocalizedText>
            </Title>

            <NetworkSelectionDialog
                visible={true}
                onComplete={handleNetworkSetupComplete}
                onCancel={onCancel}
            />
        </div>
    );

    const renderTerminalManagement = () => (
        <div>
            <Title level={4} className="text-center mb-4">
                <LocalizedText>{t('wizard.terminalManagement', 'Terminal Management')}</LocalizedText>
            </Title>

            <Paragraph className="text-center mb-6">
                <LocalizedText>
                    {t('wizard.terminalManagementDesc', 'Configure and manage terminals in your network.')}
                </LocalizedText>
            </Paragraph>

            <Card>
                <TerminalManager currentTerminalId={terminalId || undefined} />
            </Card>

            <div className="text-center mt-6">
                <Space>
                    <Button onClick={() => setCurrentStep(0)}>
                        <LocalizedText>{t('common.back', 'Back')}</LocalizedText>
                    </Button>
                    <Button type="primary" onClick={handleTerminalSetupComplete}>
                        <LocalizedText>{t('common.continue', 'Continue')}</LocalizedText>
                    </Button>
                </Space>
            </div>
        </div>
    );

    const renderSyncConfiguration = () => (
        <div>
            <Title level={4} className="text-center mb-4">
                <LocalizedText>{t('wizard.syncConfiguration', 'Sync Configuration')}</LocalizedText>
            </Title>

            <Paragraph className="text-center mb-6">
                <LocalizedText>
                    {t('wizard.syncConfigurationDesc', 'Configure data synchronization and offline support.')}
                </LocalizedText>
            </Paragraph>

            <Row gutter={16}>
                <Col span={12}>
                    <Card title={<LocalizedText>{t('wizard.networkStatus', 'Network Status')}</LocalizedText>}>
                        <NetworkStatusMonitor
                            terminalId={terminalId || undefined}
                            networkPath={networkConfig?.mainComputerPath}
                            terminalType={networkConfig?.terminalType}
                            showDetails={true}
                        />
                    </Card>
                </Col>

                <Col span={12}>
                    <Card title={<LocalizedText>{t('wizard.syncQueue', 'Sync Queue')}</LocalizedText>}>
                        {terminalId && (
                            <SyncQueueManager
                                terminalId={terminalId}
                                onSyncComplete={() => console.log('Sync completed')}
                            />
                        )}
                    </Card>
                </Col>
            </Row>

            <div className="text-center mt-6">
                <Space>
                    <Button onClick={() => setCurrentStep(1)}>
                        <LocalizedText>{t('common.back', 'Back')}</LocalizedText>
                    </Button>
                    <Button type="primary" onClick={handleSyncSetupComplete}>
                        <LocalizedText>{t('common.continue', 'Continue')}</LocalizedText>
                    </Button>
                </Space>
            </div>
        </div>
    );

    const renderCompletion = () => (
        <div className="text-center">
            <CheckCircleOutlined
                style={{ fontSize: 64, color: '#52c41a', marginBottom: 16 }}
            />

            <Title level={3} className="mb-4">
                <LocalizedText>{t('wizard.setupComplete', 'Setup Complete!')}</LocalizedText>
            </Title>

            <Paragraph className="mb-6">
                <LocalizedText>
                    {t('wizard.setupCompleteDesc', 'Your multi-terminal network has been configured successfully.')}
                </LocalizedText>
            </Paragraph>

            <Card className="mb-6">
                <Row gutter={16}>
                    <Col span={8}>
                        <div className="text-center">
                            <DesktopOutlined style={{ fontSize: 32, color: '#1890ff' }} />
                            <div className="mt-2">
                                <Text strong>
                                    <LocalizedText>{t('wizard.terminalsConfigured', 'Terminals')}</LocalizedText>
                                </Text>
                                <br />
                                <Text>{terminals.length} configured</Text>
                            </div>
                        </div>
                    </Col>

                    <Col span={8}>
                        <div className="text-center">
                            <WifiOutlined style={{ fontSize: 32, color: '#52c41a' }} />
                            <div className="mt-2">
                                <Text strong>
                                    <LocalizedText>{t('wizard.networkStatus', 'Network')}</LocalizedText>
                                </Text>
                                <br />
                                <Text>Connected</Text>
                            </div>
                        </div>
                    </Col>

                    <Col span={8}>
                        <div className="text-center">
                            <SyncOutlined style={{ fontSize: 32, color: '#722ed1' }} />
                            <div className="mt-2">
                                <Text strong>
                                    <LocalizedText>{t('wizard.syncEnabled', 'Sync')}</LocalizedText>
                                </Text>
                                <br />
                                <Text>Enabled</Text>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Card>

            <Alert
                type="success"
                message={<LocalizedText>{t('wizard.readyToUse', 'Ready to Use')}</LocalizedText>}
                description={
                    <LocalizedText>
                        {t('wizard.readyToUseDesc', 'Your POS system is now ready for multi-terminal operation.')}
                    </LocalizedText>
                }
                showIcon
                className="mb-6"
            />

            <Button type="primary" size="large" onClick={handleWizardComplete}>
                <LocalizedText>{t('wizard.startUsing', 'Start Using POS System')}</LocalizedText>
            </Button>
        </div>
    );

    const steps = [
        {
            title: <LocalizedText>{t('wizard.network', 'Network')}</LocalizedText>,
            icon: <WifiOutlined />,
            content: renderNetworkSetup(),
        },
        {
            title: <LocalizedText>{t('wizard.terminals', 'Terminals')}</LocalizedText>,
            icon: <DesktopOutlined />,
            content: renderTerminalManagement(),
        },
        {
            title: <LocalizedText>{t('wizard.sync', 'Sync')}</LocalizedText>,
            icon: <SyncOutlined />,
            content: renderSyncConfiguration(),
        },
        {
            title: <LocalizedText>{t('wizard.complete', 'Complete')}</LocalizedText>,
            icon: <CheckCircleOutlined />,
            content: renderCompletion(),
        },
    ];

    return (
        <Modal
            title={
                <div>
                    <SettingOutlined className="mr-2" />
                    <LocalizedText>{t('wizard.title', 'Network Configuration Wizard')}</LocalizedText>
                </div>
            }
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={1000}
            centered
            maskClosable={false}
            closable={!!onCancel}
        >
            <div className="mb-6">
                <Steps current={currentStep}>
                    {steps.map((step, index) => (
                        <Step
                            key={index}
                            title={step.title}
                            icon={step.icon}
                            status={
                                index < currentStep
                                    ? 'finish'
                                    : index === currentStep
                                        ? 'process'
                                        : 'wait'
                            }
                        />
                    ))}
                </Steps>
            </div>

            <Spin spinning={loading}>
                <div style={{ minHeight: 400 }}>
                    {steps[currentStep]?.content}
                </div>
            </Spin>
        </Modal>
    );
};

export default NetworkConfigurationWizard;