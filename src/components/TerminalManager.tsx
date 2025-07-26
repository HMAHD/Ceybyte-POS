/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                    Terminal Manager                                              │
 * │                                                                                                  │
 * │  Description: Terminal management interface for multi-terminal POS network.                      │
 * │               Displays terminal status, sync information, and network diagnostics.              │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Button,
    Space,
    Tag,
    Tooltip,
    Modal,
    Form,
    Input,
    Alert,
    Progress,
    Row,
    Col,
    Statistic,
    Typography,
    Divider,
    Badge,
} from 'antd';
import {
    DesktopOutlined,
    LaptopOutlined,
    WifiOutlined,
    SyncOutlined,
    CheckCircleOutlined,
    ReloadOutlined,
    SettingOutlined,
    DeleteOutlined,
    EyeOutlined,
} from '@ant-design/icons';
import { useTranslation } from '../hooks/useTranslation';
import LocalizedText from './LocalizedText';
import type { Terminal, TerminalStatus, SyncStatus } from '../types/terminal';
import {
    discoverTerminals,
    getTerminal,
    updateTerminal,
    removeTerminal,
    syncTerminalData,
    runNetworkDiagnostics,
} from '../api/terminals.api';

const { Title, Text } = Typography;

interface TerminalManagerProps {
    currentTerminalId?: string;
}

export const TerminalManager: React.FC<TerminalManagerProps> = ({
    currentTerminalId,
}) => {
    const { t } = useTranslation();
    const [form] = Form.useForm();

    const [terminals, setTerminals] = useState<Terminal[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedTerminal, setSelectedTerminal] = useState<Terminal | null>(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [networkDiagnostics, setNetworkDiagnostics] = useState<any>(null);
    const [syncingTerminals, setSyncingTerminals] = useState<Set<string>>(new Set());

    useEffect(() => {
        loadTerminals();

        // Set up periodic refresh
        const interval = setInterval(loadTerminals, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const loadTerminals = async () => {
        try {
            setLoading(true);
            const response = await discoverTerminals();

            if (response.success) {
                setTerminals(response.terminals);
            }
        } catch (error) {
            console.error('Error loading terminals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSyncTerminal = async (terminalId: string, forceSync = false) => {
        try {
            setSyncingTerminals(prev => new Set(prev).add(terminalId));

            const response = await syncTerminalData(terminalId, forceSync);

            if (response.success) {
                // Refresh terminals to show updated sync status
                await loadTerminals();
            }
        } catch (error) {
            console.error('Error syncing terminal:', error);
        } finally {
            setSyncingTerminals(prev => {
                const newSet = new Set(prev);
                newSet.delete(terminalId);
                return newSet;
            });
        }
    };

    const handleRemoveTerminal = async (terminalId: string) => {
        try {
            Modal.confirm({
                title: t('terminal.confirmRemove', 'Remove Terminal'),
                content: t('terminal.confirmRemoveMessage', 'Are you sure you want to remove this terminal from the network?'),
                onOk: async () => {
                    const response = await removeTerminal(terminalId);
                    if (response.success) {
                        await loadTerminals();
                    }
                },
            });
        } catch (error) {
            console.error('Error removing terminal:', error);
        }
    };

    const handleEditTerminal = async (values: any) => {
        try {
            if (!selectedTerminal) return;

            const response = await updateTerminal(selectedTerminal.terminal_id, values);

            if (response.success) {
                setEditModalVisible(false);
                await loadTerminals();
            }
        } catch (error) {
            console.error('Error updating terminal:', error);
        }
    };

    const handleViewDetails = async (terminal: Terminal) => {
        try {
            const response = await getTerminal(terminal.terminal_id);

            if (response.success) {
                setSelectedTerminal(response.terminal);
                setDetailsModalVisible(true);
            }
        } catch (error) {
            console.error('Error getting terminal details:', error);
        }
    };

    const handleRunDiagnostics = async () => {
        try {
            setLoading(true);
            const response = await runNetworkDiagnostics();

            if (response.success) {
                setNetworkDiagnostics(response.diagnostics);
            }
        } catch (error) {
            console.error('Error running diagnostics:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: TerminalStatus): string => {
        switch (status) {
            case 'online':
                return 'green';
            case 'offline':
                return 'red';
            case 'maintenance':
                return 'orange';
            case 'error':
                return 'red';
            default:
                return 'default';
        }
    };

    const getSyncStatusColor = (status: SyncStatus): string => {
        switch (status) {
            case 'synced':
                return 'green';
            case 'pending':
                return 'orange';
            case 'failed':
                return 'red';
            case 'conflict':
                return 'purple';
            default:
                return 'default';
        }
    };

    const columns = [
        {
            title: <LocalizedText>{t('terminal.name', 'Terminal Name')}</LocalizedText>,
            dataIndex: 'terminal_name',
            key: 'terminal_name',
            render: (text: string, record: Terminal) => (
                <Space>
                    {record.is_main_terminal ? (
                        <DesktopOutlined style={{ color: '#1890ff' }} />
                    ) : (
                        <LaptopOutlined style={{ color: '#52c41a' }} />
                    )}
                    <div>
                        <div>{text}</div>
                        {record.display_name && (
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                {record.display_name}
                            </Text>
                        )}
                    </div>
                    {record.terminal_id === currentTerminalId && (
                        <Badge status="processing" text={t('terminal.current', 'Current')} />
                    )}
                </Space>
            ),
        },
        {
            title: <LocalizedText>{t('terminal.type', 'Type')}</LocalizedText>,
            dataIndex: 'terminal_type',
            key: 'terminal_type',
            render: (_: string, record: Terminal) => (
                <Tag color={record.is_main_terminal ? 'blue' : 'green'}>
                    <LocalizedText>
                        {record.is_main_terminal
                            ? t('terminal.main', 'Main')
                            : t('terminal.client', 'Client')}
                    </LocalizedText>
                </Tag>
            ),
        },
        {
            title: <LocalizedText>{t('terminal.status', 'Status')}</LocalizedText>,
            dataIndex: 'status',
            key: 'status',
            render: (status: TerminalStatus, record: Terminal) => (
                <Space direction="vertical" size="small">
                    <Tag color={getStatusColor(status)}>
                        <LocalizedText>{t(`terminal.status.${status}`, status)}</LocalizedText>
                    </Tag>
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                        {record.uptime_status}
                    </Text>
                </Space>
            ),
        },
        {
            title: <LocalizedText>{t('terminal.syncStatus', 'Sync Status')}</LocalizedText>,
            dataIndex: 'sync_status',
            key: 'sync_status',
            render: (syncStatus: SyncStatus, record: Terminal) => (
                <Space direction="vertical" size="small">
                    <Tag color={getSyncStatusColor(syncStatus)}>
                        <LocalizedText>{record.sync_status_display}</LocalizedText>
                    </Tag>
                    {record.pending_sync_count > 0 && (
                        <Text type="warning" style={{ fontSize: '11px' }}>
                            {record.pending_sync_count} pending
                        </Text>
                    )}
                </Space>
            ),
        },
        {
            title: <LocalizedText>{t('terminal.network', 'Network')}</LocalizedText>,
            key: 'network',
            render: (record: Terminal) => (
                <Space direction="vertical" size="small">
                    <Text style={{ fontSize: '12px' }}>{record.ip_address}</Text>
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                        {record.hostname}
                    </Text>
                </Space>
            ),
        },
        {
            title: <LocalizedText>{t('common.actions', 'Actions')}</LocalizedText>,
            key: 'actions',
            render: (record: Terminal) => (
                <Space>
                    <Tooltip title={t('terminal.viewDetails', 'View Details')}>
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetails(record)}
                        />
                    </Tooltip>

                    <Tooltip title={t('terminal.sync', 'Sync Data')}>
                        <Button
                            type="text"
                            icon={<SyncOutlined />}
                            loading={syncingTerminals.has(record.terminal_id)}
                            onClick={() => handleSyncTerminal(record.terminal_id)}
                        />
                    </Tooltip>

                    <Tooltip title={t('terminal.edit', 'Edit Terminal')}>
                        <Button
                            type="text"
                            icon={<SettingOutlined />}
                            onClick={() => {
                                setSelectedTerminal(record);
                                form.setFieldsValue({
                                    terminal_name: record.terminal_name,
                                    display_name: record.display_name,
                                });
                                setEditModalVisible(true);
                            }}
                        />
                    </Tooltip>

                    {!record.is_main_terminal && (
                        <Tooltip title={t('terminal.remove', 'Remove Terminal')}>
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => handleRemoveTerminal(record.terminal_id)}
                            />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    const renderNetworkOverview = () => {
        const onlineCount = terminals.filter(t => t.is_online).length;
        const syncedCount = terminals.filter(t => t.sync_status === 'synced').length;
        const mainTerminal = terminals.find(t => t.is_main_terminal);

        return (
            <Row gutter={16} className="mb-4">
                <Col span={6}>
                    <Card>
                        <Statistic
                            title={<LocalizedText>{t('terminal.totalTerminals', 'Total Terminals')}</LocalizedText>}
                            value={terminals.length}
                            prefix={<DesktopOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title={<LocalizedText>{t('terminal.onlineTerminals', 'Online')}</LocalizedText>}
                            value={onlineCount}
                            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title={<LocalizedText>{t('terminal.syncedTerminals', 'Synced')}</LocalizedText>}
                            value={syncedCount}
                            prefix={<SyncOutlined style={{ color: '#1890ff' }} />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title={<LocalizedText>{t('terminal.mainTerminal', 'Main Terminal')}</LocalizedText>}
                            value={mainTerminal ? mainTerminal.terminal_name : 'None'}
                            prefix={<DesktopOutlined style={{ color: '#1890ff' }} />}
                        />
                    </Card>
                </Col>
            </Row>
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <Title level={2}>
                    <DesktopOutlined className="mr-2" />
                    <LocalizedText>{t('terminal.manager', 'Terminal Manager')}</LocalizedText>
                </Title>

                <Space>
                    <Button
                        icon={<WifiOutlined />}
                        onClick={handleRunDiagnostics}
                        loading={loading}
                    >
                        <LocalizedText>{t('terminal.runDiagnostics', 'Run Diagnostics')}</LocalizedText>
                    </Button>

                    <Button
                        type="primary"
                        icon={<ReloadOutlined />}
                        onClick={loadTerminals}
                        loading={loading}
                    >
                        <LocalizedText>{t('common.refresh', 'Refresh')}</LocalizedText>
                    </Button>
                </Space>
            </div>

            {renderNetworkOverview()}

            {networkDiagnostics && (
                <Alert
                    type="info"
                    message={<LocalizedText>{t('terminal.diagnosticsResults', 'Network Diagnostics Results')}</LocalizedText>}
                    description={
                        <div>
                            <Text>Network Connectivity: {networkDiagnostics.network_connectivity.network_available ? 'OK' : 'Failed'}</Text>
                            <br />
                            <Text>Terminal Count: {networkDiagnostics.terminal_count}</Text>
                        </div>
                    }
                    closable
                    onClose={() => setNetworkDiagnostics(null)}
                    className="mb-4"
                />
            )}

            <Card>
                <Table
                    columns={columns}
                    dataSource={terminals}
                    rowKey="terminal_id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                    }}
                />
            </Card>

            {/* Edit Terminal Modal */}
            <Modal
                title={<LocalizedText>{t('terminal.editTerminal', 'Edit Terminal')}</LocalizedText>}
                open={editModalVisible}
                onCancel={() => setEditModalVisible(false)}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleEditTerminal}
                >
                    <Form.Item
                        label={<LocalizedText>{t('terminal.terminalName', 'Terminal Name')}</LocalizedText>}
                        name="terminal_name"
                        rules={[{ required: true, message: 'Please enter terminal name' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label={<LocalizedText>{t('terminal.displayName', 'Display Name')}</LocalizedText>}
                        name="display_name"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                <LocalizedText>{t('common.save', 'Save')}</LocalizedText>
                            </Button>
                            <Button onClick={() => setEditModalVisible(false)}>
                                <LocalizedText>{t('common.cancel', 'Cancel')}</LocalizedText>
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Terminal Details Modal */}
            <Modal
                title={<LocalizedText>{t('terminal.terminalDetails', 'Terminal Details')}</LocalizedText>}
                open={detailsModalVisible}
                onCancel={() => setDetailsModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setDetailsModalVisible(false)}>
                        <LocalizedText>{t('common.close', 'Close')}</LocalizedText>
                    </Button>
                ]}
                width={600}
            >
                {selectedTerminal && (
                    <div>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Text strong>Terminal ID:</Text>
                                <br />
                                <Text code>{selectedTerminal.terminal_id}</Text>
                            </Col>
                            <Col span={12}>
                                <Text strong>Hardware ID:</Text>
                                <br />
                                <Text code>{selectedTerminal.hardware_id}</Text>
                            </Col>
                        </Row>

                        <Divider />

                        <Row gutter={16}>
                            <Col span={12}>
                                <Text strong>CPU:</Text>
                                <br />
                                <Text>{selectedTerminal.cpu_info}</Text>
                            </Col>
                            <Col span={12}>
                                <Text strong>Memory:</Text>
                                <br />
                                <Text>{selectedTerminal.memory_gb} GB</Text>
                            </Col>
                        </Row>

                        <Divider />

                        <Row gutter={16}>
                            <Col span={12}>
                                <Text strong>OS Version:</Text>
                                <br />
                                <Text>{selectedTerminal.os_version}</Text>
                            </Col>
                            <Col span={12}>
                                <Text strong>App Version:</Text>
                                <br />
                                <Text>{selectedTerminal.app_version}</Text>
                            </Col>
                        </Row>

                        {selectedTerminal.ups_connected && (
                            <>
                                <Divider />
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Text strong>UPS Status:</Text>
                                        <br />
                                        <Tag color="green">{selectedTerminal.ups_status}</Tag>
                                    </Col>
                                    <Col span={12}>
                                        <Text strong>Battery Level:</Text>
                                        <br />
                                        <Progress
                                            percent={selectedTerminal.ups_battery_level || 0}
                                            size="small"
                                            status={
                                                (selectedTerminal.ups_battery_level || 0) < 20
                                                    ? 'exception'
                                                    : 'normal'
                                            }
                                        />
                                    </Col>
                                </Row>
                            </>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default TerminalManager;