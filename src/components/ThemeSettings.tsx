/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                    Theme Settings Component                                      │
 * │                                                                                                  │
 * │  Description: Theme configuration interface with visual previews, color picker,                  │
 * │               font size adjustment, and custom theme creation.                                   │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  ColorPicker,
  Slider,
  Switch,
  Select,
  Space,
  Typography,
  Divider,
  Radio,
  InputNumber,
} from 'antd';
import { BgColorsOutlined, FontSizeOutlined, BorderOutlined } from '@ant-design/icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/hooks/useTranslation';
import LocalizedText from '@/components/LocalizedText';
import type { ThemePreset } from '@/theme';

const { Title, Text } = Typography;
const { Option } = Select;

export const ThemeSettings: React.FC = () => {
  const { currentTheme, setTheme, setCustomTheme, availableThemes } = useTheme();
  const { t } = useTranslation();
  const [customPrimaryColor, setCustomPrimaryColor] = useState(currentTheme.token?.colorPrimary || '#1890ff');
  const [customFontSize, setCustomFontSize] = useState(currentTheme.token?.fontSize || 14);
  const [customBorderRadius, setCustomBorderRadius] = useState(currentTheme.token?.borderRadius || 6);
  const [compactMode, setCompactMode] = useState(false);

  const handlePresetChange = (preset: ThemePreset) => {
    setTheme(preset);
    const newTheme = availableThemes[preset];
    setCustomPrimaryColor(newTheme.token?.colorPrimary || '#1890ff');
    setCustomFontSize(newTheme.token?.fontSize || 14);
    setCustomBorderRadius(newTheme.token?.borderRadius || 6);
  };

  const handleCustomColorChange = (color: any) => {
    const colorHex = color.toHexString();
    setCustomPrimaryColor(colorHex);
    setCustomTheme({
      token: {
        colorPrimary: colorHex,
      },
    });
  };

  const handleFontSizeChange = (size: number | null) => {
    if (size) {
      setCustomFontSize(size);
      setCustomTheme({
        token: {
          fontSize: size,
        },
      });
    }
  };

  const handleBorderRadiusChange = (radius: number) => {
    setCustomBorderRadius(radius);
    setCustomTheme({
      token: {
        borderRadius: radius,
      },
    });
  };

  const handleCompactModeChange = (checked: boolean) => {
    setCompactMode(checked);
    setCustomTheme({
      token: {
        controlHeight: checked ? 32 : 40,
      },
      components: {
        Button: {
          controlHeight: checked ? 40 : 48,
        },
        Input: {
          controlHeight: checked ? 36 : 44,
        },
      },
    });
  };

  const ThemePreview: React.FC<{ preset: ThemePreset }> = ({ preset }) => {
    const theme = availableThemes[preset];
    const isSelected = currentTheme.preset === preset;

    return (
      <Card
        size="small"
        className={`cursor-pointer transition-all ${isSelected ? 'border-blue-500 shadow-md' : 'hover:shadow-sm'
          }`}
        onClick={() => handlePresetChange(preset)}
        style={{
          borderColor: isSelected ? theme.token?.colorPrimary : undefined,
        }}
      >
        <div className="text-center">
          <div
            className="w-full h-12 rounded mb-2"
            style={{
              background: `linear-gradient(135deg, ${theme.token?.colorPrimary} 0%, ${theme.token?.colorPrimary}80 100%)`,
            }}
          />
          <Text strong>{theme.name}</Text>
          <br />
          <Text type="secondary" className="text-xs">
            {theme.description}
          </Text>
        </div>
      </Card>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Title level={2}>
        <BgColorsOutlined className="mr-2" />
        <LocalizedText>{t('settings.themeSettings', 'Theme Settings')}</LocalizedText>
      </Title>

      <Row gutter={[24, 24]}>
        {/* Theme Presets */}
        <Col span={24}>
          <Card title={<LocalizedText>{t('theme.presets', 'Theme Presets')}</LocalizedText>}>
            <Row gutter={[16, 16]}>
              {Object.keys(availableThemes).map((preset) => (
                <Col xs={12} sm={8} md={6} key={preset}>
                  <ThemePreview preset={preset as ThemePreset} />
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        {/* Customization Options */}
        <Col xs={24} lg={12}>
          <Card title={<LocalizedText>{t('theme.customization', 'Customization')}</LocalizedText>}>
            <Space direction="vertical" className="w-full" size="large">
              {/* Primary Color */}
              <div>
                <Text strong>
                  <LocalizedText>{t('theme.primaryColor', 'Primary Color')}</LocalizedText>
                </Text>
                <div className="mt-2">
                  <ColorPicker
                    value={customPrimaryColor}
                    onChange={handleCustomColorChange}
                    showText
                    size="large"
                  />
                </div>
              </div>

              <Divider />

              {/* Font Size */}
              <div>
                <Text strong>
                  <FontSizeOutlined className="mr-1" />
                  <LocalizedText>{t('theme.fontSize', 'Font Size')}</LocalizedText>
                </Text>
                <div className="mt-2">
                  <Row gutter={16} align="middle">
                    <Col span={16}>
                      <Slider
                        min={12}
                        max={20}
                        value={customFontSize}
                        onChange={handleFontSizeChange}
                        marks={{
                          12: 'Small',
                          14: 'Medium',
                          16: 'Large',
                          20: 'XL',
                        }}
                      />
                    </Col>
                    <Col span={8}>
                      <InputNumber
                        min={12}
                        max={20}
                        value={customFontSize}
                        onChange={handleFontSizeChange}
                        addonAfter="px"
                      />
                    </Col>
                  </Row>
                </div>
              </div>

              <Divider />

              {/* Border Radius */}
              <div>
                <Text strong>
                  <BorderOutlined className="mr-1" />
                  <LocalizedText>{t('theme.borderRadius', 'Border Radius')}</LocalizedText>
                </Text>
                <div className="mt-2">
                  <Radio.Group
                    value={customBorderRadius}
                    onChange={(e) => handleBorderRadiusChange(e.target.value)}
                  >
                    <Radio.Button value={0}>Sharp</Radio.Button>
                    <Radio.Button value={4}>Small</Radio.Button>
                    <Radio.Button value={6}>Medium</Radio.Button>
                    <Radio.Button value={8}>Large</Radio.Button>
                    <Radio.Button value={12}>Round</Radio.Button>
                  </Radio.Group>
                </div>
              </div>

              <Divider />

              {/* Compact Mode */}
              <div className="flex justify-between items-center">
                <div>
                  <Text strong>
                    <LocalizedText>{t('theme.compactMode', 'Compact Mode')}</LocalizedText>
                  </Text>
                  <br />
                  <Text type="secondary">
                    <LocalizedText>{t('theme.compactModeDesc', 'Smaller components for small screens')}</LocalizedText>
                  </Text>
                </div>
                <Switch checked={compactMode} onChange={handleCompactModeChange} />
              </div>
            </Space>
          </Card>
        </Col>

        {/* Preview */}
        <Col xs={24} lg={12}>
          <Card title={<LocalizedText>{t('theme.preview', 'Preview')}</LocalizedText>}>
            <Space direction="vertical" className="w-full">
              <Button type="primary" size="large">
                <LocalizedText>{t('common.primary', 'Primary Button')}</LocalizedText>
              </Button>
              <Button size="large">
                <LocalizedText>{t('common.default', 'Default Button')}</LocalizedText>
              </Button>
              <Button type="dashed" size="large">
                <LocalizedText>{t('common.dashed', 'Dashed Button')}</LocalizedText>
              </Button>
              <div className="mt-4">
                <Text>
                  <LocalizedText>{t('theme.sampleText', 'Sample text with current font size')}</LocalizedText>
                </Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ThemeSettings;