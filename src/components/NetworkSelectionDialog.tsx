/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                  Network Selection Dialog                                        │
 * │                                                                                                  │
 * │  Description: First-run configuration dialog for setting up network connectivity.               │
 * │               Allows selection between Main Computer and Client Computer modes.                  │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Card,
  Button,
  Input,
  Form,
  Steps,
  Alert,
  Space,
  Typography,
  Row,
  Col,
  Divider,
  Spin,
  Progress,
  Tag,
  Tooltip,
} from 'antd';
import {
  DesktopOutlined,
  LaptopOutlined,
  WifiOutlined,
  DatabaseOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useTranslation } from '@/hooks/useTranslation';
import LocalizedText from '@/components/LocalizedText';
import type { NetworkConfiguration, ConnectionTestResult, NetworkSetupStep, TerminalType } from '@/types/network';
import {
  getNetworkConfig,
  saveNetworkConfig,
  generateTerminalId,
  testConnection,
  getMainComputerSetupSteps,
  getClientComputerSetupSteps,
  validateNetworkPath,
  validateTerminalName,
} from '@/utils/networkConfig';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

interface NetworkSelectionDialogProps {
  visible: boolean;
  onComplete: (config: NetworkConfiguration) => void;
  onCancel?: () => void;
}

export const NetworkSelectionDialog: React.FC<NetworkSelectionDialogProps> = ({
  visible,
  onComplete,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState<NetworkConfiguration>(getNetworkConfig());
  const [isLoading, setIsLoading] = useState(false);
  const [connectionResult, setConnectionResult] = useState<ConnectionTestResult | null>(null);
  const [setupSteps, setSetupSteps] = useState<NetworkSetupStep[]>([]);

  useEffect(() => {
    if (visible) {
      // Reset form and state when dialog opens
      setCurrentStep(0);
      setConfig(getNetworkConfig());
      setConnectionResult(null);
      form.resetFields();
    }
  }, [visible, form]);

  const handleTerminalTypeSelect = (type: TerminalType) => {
    const newConfig = {
      ...config,
      terminalType: type,
      terminalId: generateTerminalId(type),
      terminalName: type === 'main' ? 'Main Terminal' : 'Client Terminal',
    };
    setConfig(newConfig);
    
    // Set up steps based on terminal type
    const steps = type === 'main' ? getMainComputerSetupSteps() : getClientComputerSetupSteps();
    setSetupSteps(steps);
    
    setCurrentStep(1);
  };

  const handleConfigurationSubmit = async (values: any) => {
    setIsLoading(true);
    
    try {
      const updatedConfig = {
        ...config,
        terminalName: values.terminalName || config.terminalName,
        mainComputerPath: values.mainComputerPath,
        offlineMode: values.offlineMode || false,
      };
      
      setConfig(updatedConfig);
      setCurrentStep(2);
    } catch (error) {
      console.error('Configuration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectionTest = async () => {
    setIsLoading(true);
    setConnectionResult(null);
    
    try {
      const result = await testConnection(config);
      setConnectionResult(result);
      
      if (result.success) {
        // Update config with successful connection
        const finalConfig = {
          ...config,
          isConfigured: true,
          connectionStatus: result.status,
          lastConnectionTest: result.timestamp,
        };
        
        setConfig(finalConfig);
        saveNetworkConfig(finalConfig);
        setCurrentStep(3);
      }
    } catch (error) {
      console.error('Connection test error:', error);
      setConnectionResult({
        success: false,
        status: 'error',
        message: 'Connection test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    const finalConfig = {
      ...config,
      isConfigured: true,
    };
    saveNetworkConfig(finalConfig);
    onComplete(finalConfig);
  };

  const handleSkipToOffline = () => {
    const offlineConfig = {
      ...config,
      terminalType: 'main' as TerminalType,
      terminalId: generateTerminalId('main'),
      terminalName: 'Offline Terminal',
      isConfigured: true,
      offlineMode: true,
      connectionStatus: 'disconnected' as const,
    };
    saveNetworkConfig(offlineConfig);
    onComplete(offlineConfig);
  };

  const renderTerminalSelection = () => (
    <div className="text-center">
      <Title level={3} className="mb-6">
        <LocalizedText>{t('network.selectTerminalType', 'Select Terminal Type')}</LocalizedText>
      </Title>
      
      <Row gutter={24} justify="center">
        <Col xs={24} md={10}>
          <Card
            hoverable
            className="h-full cursor-pointer"
            onClick={() => handleTerminalTypeSelect('main')}
            cover={
              <div className="p-8 text-center bg-blue-50">
                <DesktopOutlined style={{ fontSize: 64, color: '#1890ff' }} />
              </div>
            }
          >
            <Card.Meta
              title={
                <div className="text-center">
                  <LocalizedText>{t('network.mainComputer', 'Main Computer')}</LocalizedText>
                </div>
              }
              description={
                <div className="text-center">
                  <Paragraph>
                    <LocalizedText>
                      {t('network.mainComputerDesc', 'This computer will host the database and serve other terminals')}
                    </LocalizedText>
                  </Paragraph>
                  <ul className="text-left text-sm">
                    <li><LocalizedText>{t('network.mainFeature1', 'Hosts the main database')}</LocalizedText></li>
                    <li><LocalizedText>{t('network.mainFeature2', 'Manages file sharing')}</LocalizedText></li>
                    <li><LocalizedText>{t('network.mainFeature3', 'Controls system settings')}</LocalizedText></li>
                    <li><LocalizedText>{t('network.mainFeature4', 'Generates reports')}</LocalizedText></li>
                  </ul>
                </div>
              }
            />
          </Card>
        </Col>
        
        <Col xs={24} md={10}>
          <Card
            hoverable
            className="h-full cursor-pointer"
            onClick={() => handleTerminalTypeSelect('client')}
            cover={
              <div className="p-8 text-center bg-green-50">
                <LaptopOutlined style={{ fontSize: 64, color: '#52c41a' }} />
              </div>
            }
          >
            <Card.Meta
              title={
                <div className="text-center">
                  <LocalizedText>{t('network.clientComputer', 'Client Computer')}</LocalizedText>
                </div>
              }
              description={
                <div className="text-center">
                  <Paragraph>
                    <LocalizedText>
                      {t('network.clientComputerDesc', 'This computer will connect to the main computer for data access')}
                    </LocalizedText>
                  </Paragraph>
                  <ul className="text-left text-sm">
                    <li><LocalizedText>{t('network.clientFeature1', 'Connects to main database')}</LocalizedText></li>
                    <li><LocalizedText>{t('network.clientFeature2', 'Syncs data automatically')}</LocalizedText></li>
                    <li><LocalizedText>{t('network.clientFeature3', 'Works offline when needed')}</LocalizedText></li>
                    <li><LocalizedText>{t('network.clientFeature4', 'Handles sales transactions')}</LocalizedText></li>
                  </ul>
                </div>
              }
            />
          </Card>
        </Col>
      </Row>
      
      <Divider />
      
      <Button type="link" onClick={handleSkipToOffline}>
        <LocalizedText>{t('network.skipToOffline', 'Skip and use offline mode')}</LocalizedText>
      </Button>
    </div>
  );

  const renderConfiguration = () => (
    <div>
      <Title level={4} className="mb-4">
        <LocalizedText>
          {config.terminalType === 'main' 
            ? t('network.configureMainComputer', 'Configure Main Computer')
            : t('network.configureClientComputer', 'Configure Client Computer')
          }
        </LocalizedText>
      </Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleConfigurationSubmit}
        initialValues={{
          terminalName: config.terminalName,
          mainComputerPath: config.mainComputerPath,
        }}
      >
        <Form.Item
          label={<LocalizedText>{t('network.terminalName', 'Terminal Name')}</LocalizedText>}
          name="terminalName"
          rules={[
            { required: true, message: 'Please enter a terminal name' },
            { validator: (_, value) => {
              const validation = validateTerminalName(value);
              return validation.valid ? Promise.resolve() : Promise.reject(validation.message);
            }},
          ]}
        >
          <Input
            placeholder={t('network.terminalNamePlaceholder', 'Enter a name for this terminal')}
            prefix={<DesktopOutlined />}
          />
        </Form.Item>
        
        {config.terminalType === 'client' && (
          <Form.Item
            label={<LocalizedText>{t('network.mainComputerPath', 'Main Computer Path')}</LocalizedText>}
            name="mainComputerPath"
            rules={[
              { required: true, message: 'Please enter the main computer path' },
              { validator: (_, value) => {
                const validation = validateNetworkPath(value);
                return validation.valid ? Promise.resolve() : Promise.reject(validation.message);
              }},
            ]}
          >
            <Input
              placeholder="\\MAIN-PC\POS"
              prefix={<WifiOutlined />}
              addonAfter={
                <Tooltip title={t('network.pathFormatHelp', 'Format: \\\\COMPUTER-NAME\\FOLDER-NAME')}>
                  <InfoCircleOutlined />
                </Tooltip>
              }
            />
          </Form.Item>
        )}
        
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              <LocalizedText>{t('common.continue', 'Continue')}</LocalizedText>
            </Button>
            <Button onClick={() => setCurrentStep(0)}>
              <LocalizedText>{t('common.back', 'Back')}</LocalizedText>
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );

  const renderConnectionTest = () => (
    <div>
      <Title level={4} className="mb-4">
        <LocalizedText>{t('network.testConnection', 'Test Connection')}</LocalizedText>
      </Title>
      
      <Card className="mb-4">
        <Row gutter={16} align="middle">
          <Col span={4}>
            <DatabaseOutlined style={{ fontSize: 32, color: '#1890ff' }} />
          </Col>
          <Col span={16}>
            <div>
              <Text strong>
                <LocalizedText>{config.terminalName}</LocalizedText>
              </Text>
              <br />
              <Text type="secondary">
                {config.terminalType === 'main' 
                  ? <LocalizedText>{t('network.mainComputerSetup', 'Main Computer Setup')}</LocalizedText>
                  : <LocalizedText>{t('network.connectingTo', 'Connecting to')}: {config.mainComputerPath}</LocalizedText>
                }
              </Text>
            </div>
          </Col>
          <Col span={4}>
            <Tag color={config.terminalType === 'main' ? 'blue' : 'green'}>
              <LocalizedText>
                {config.terminalType === 'main' ? t('network.main', 'Main') : t('network.client', 'Client')}
              </LocalizedText>
            </Tag>
          </Col>
        </Row>
      </Card>
      
      {connectionResult && (
        <Alert
          type={connectionResult.success ? 'success' : 'error'}
          message={connectionResult.message}
          description={connectionResult.details}
          showIcon
          className="mb-4"
          action={
            !connectionResult.success && (
              <Button size="small" onClick={handleConnectionTest}>
                <ReloadOutlined />
                <LocalizedText>{t('network.retry', 'Retry')}</LocalizedText>
              </Button>
            )
          }
        />
      )}
      
      <Space>
        <Button 
          type="primary" 
          onClick={handleConnectionTest} 
          loading={isLoading}
          icon={<WifiOutlined />}
        >
          <LocalizedText>{t('network.testConnection', 'Test Connection')}</LocalizedText>
        </Button>
        <Button onClick={() => setCurrentStep(1)}>
          <LocalizedText>{t('common.back', 'Back')}</LocalizedText>
        </Button>
        {connectionResult?.success && (
          <Button type="primary" onClick={() => setCurrentStep(3)}>
            <LocalizedText>{t('common.continue', 'Continue')}</LocalizedText>
          </Button>
        )}
      </Space>
    </div>
  );

  const renderCompletion = () => (
    <div className="text-center">
      <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 16 }} />
      
      <Title level={3} className="mb-4">
        <LocalizedText>{t('network.setupComplete', 'Network Setup Complete!')}</LocalizedText>
      </Title>
      
      <Paragraph>
        <LocalizedText>
          {config.terminalType === 'main'
            ? t('network.mainSetupSuccess', 'Your main computer has been configured successfully. Other terminals can now connect to this computer.')
            : t('network.clientSetupSuccess', 'Your client computer has been connected successfully. You can now use the POS system.')
          }
        </LocalizedText>
      </Paragraph>
      
      <Card className="mb-4">
        <Row gutter={16}>
          <Col span={12}>
            <Text strong><LocalizedText>{t('network.terminalType', 'Terminal Type')}</LocalizedText>:</Text>
            <br />
            <Tag color={config.terminalType === 'main' ? 'blue' : 'green'}>
              <LocalizedText>
                {config.terminalType === 'main' ? t('network.mainComputer', 'Main Computer') : t('network.clientComputer', 'Client Computer')}
              </LocalizedText>
            </Tag>
          </Col>
          <Col span={12}>
            <Text strong><LocalizedText>{t('network.terminalName', 'Terminal Name')}</LocalizedText>:</Text>
            <br />
            <Text>{config.terminalName}</Text>
          </Col>
        </Row>
        {config.mainComputerPath && (
          <Row gutter={16} className="mt-2">
            <Col span={24}>
              <Text strong><LocalizedText>{t('network.connectedTo', 'Connected To')}</LocalizedText>:</Text>
              <br />
              <Text code>{config.mainComputerPath}</Text>
            </Col>
          </Row>
        )}
      </Card>
      
      <Button type="primary" size="large" onClick={handleComplete}>
        <LocalizedText>{t('network.startUsingPOS', 'Start Using POS System')}</LocalizedText>
      </Button>
    </div>
  );

  const steps = [
    {
      title: <LocalizedText>{t('network.selectType', 'Select Type')}</LocalizedText>,
      icon: <SettingOutlined />,
    },
    {
      title: <LocalizedText>{t('network.configure', 'Configure')}</LocalizedText>,
      icon: <DesktopOutlined />,
    },
    {
      title: <LocalizedText>{t('network.testConnection', 'Test Connection')}</LocalizedText>,
      icon: <WifiOutlined />,
    },
    {
      title: <LocalizedText>{t('network.complete', 'Complete')}</LocalizedText>,
      icon: <CheckCircleOutlined />,
    },
  ];

  return (
    <Modal
      title={
        <div>
          <DatabaseOutlined className="mr-2" />
          <LocalizedText>{t('network.networkSetup', 'Network Setup')}</LocalizedText>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      centered
      maskClosable={false}
      closable={!!onCancel}
    >
      <div className="mb-6">
        <Steps current={currentStep} items={steps} />
      </div>
      
      <Spin spinning={isLoading}>
        {currentStep === 0 && renderTerminalSelection()}
        {currentStep === 1 && renderConfiguration()}
        {currentStep === 2 && renderConnectionTest()}
        {currentStep === 3 && renderCompletion()}
      </Spin>
    </Modal>
  );
};

export default NetworkSelectionDialog;