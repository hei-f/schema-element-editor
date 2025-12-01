import { FORM_PATHS } from '@/shared/constants/form-paths'
import type { IframeSchemaTarget } from '@/shared/types'
import { Form, Radio, Space, Switch, Typography } from 'antd'
import React from 'react'
import { ColorPickerField } from '../components/ColorPickerField'
import { SectionCard } from '../components/SectionCard'
import {
  FormSectionLabel,
  FixedWidthInput,
  FixedWidthInputNumber,
  SpacedAlert,
} from '../styles/layout.styles'

const { Text } = Typography

interface ElementDetectionSectionProps {
  /** 当前属性名（用于Alert提示） */
  attributeName: string
  /** 是否展开 */
  isActive?: boolean
  /** 展开状态变化回调 */
  onActiveChange?: (active: boolean) => void
  /** 恢复默认回调 */
  onResetDefault?: () => void
}

/**
 * 元素检测与高亮配置区块
 * 包含搜索配置、高亮颜色、快捷键高亮等
 */
export const ElementDetectionSection: React.FC<ElementDetectionSectionProps> = (props) => {
  const { attributeName, isActive, onActiveChange, onResetDefault } = props

  return (
    <SectionCard
      title="元素检测与高亮"
      subtitle="配置鼠标交互和元素识别行为"
      panelKey="element-detection"
      isActive={isActive}
      onActiveChange={onActiveChange}
      onResetDefault={onResetDefault}
    >
      <Form.Item
        label="节流间隔 (毫秒)"
        name={FORM_PATHS.searchConfig.throttleInterval}
        extra="控制鼠标移动检测频率，16ms约为60fps，建议范围 8-100ms"
        id="field-throttle-interval"
      >
        <FixedWidthInputNumber min={8} $width={120} />
      </Form.Item>

      <Form.Item
        label="限制向上搜索层级"
        name={FORM_PATHS.searchConfig.limitUpwardSearch}
        valuePropName="checked"
        extra="关闭时向上搜索到根元素，开启时只搜索指定层数"
        id="field-search-depth"
      >
        <Switch />
      </Form.Item>

      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues.searchConfig?.limitUpwardSearch !==
          currentValues.searchConfig?.limitUpwardSearch
        }
      >
        {({ getFieldValue }) => {
          const limitUpwardSearch = getFieldValue(FORM_PATHS.searchConfig.limitUpwardSearch)
          return (
            <Form.Item
              label="向上搜索深度"
              name={FORM_PATHS.searchConfig.searchDepthUp}
              extra="查找父元素的最大层数（仅在限制层级时生效）"
            >
              <FixedWidthInputNumber min={1} max={100} disabled={!limitUpwardSearch} $width={120} />
            </Form.Item>
          )
        }}
      </Form.Item>

      <Form.Item
        label="高亮框颜色"
        name={FORM_PATHS.highlightColor}
        extra="设置鼠标悬停时元素高亮框的颜色"
        id="field-highlight-color"
      >
        <ColorPickerField />
      </Form.Item>

      <FormSectionLabel id="field-highlight-all">快捷键高亮所有元素</FormSectionLabel>

      <Form.Item
        label="启用功能"
        name={FORM_PATHS.highlightAllConfig.enabled}
        valuePropName="checked"
        extra="按住 Alt 键并按下配置的快捷键，高亮页面上所有合法元素"
      >
        <Switch />
      </Form.Item>

      <Form.Item
        label="快捷键"
        name={FORM_PATHS.highlightAllConfig.keyBinding}
        rules={[
          { required: true, message: '请输入快捷键' },
          { pattern: /^[a-zA-Z0-9]$/, message: '请输入单个字母或数字' },
        ]}
        extra="输入单个字母或数字（0-9、A-Z），使用时按 Alt + [字符]"
        normalize={(value) => value?.toLowerCase()}
      >
        <FixedWidthInput placeholder="a" maxLength={1} $width={80} prefix="Alt +" />
      </Form.Item>

      <Form.Item
        label="最大高亮数量"
        name={FORM_PATHS.highlightAllConfig.maxHighlightCount}
        rules={[
          { required: true, message: '请输入最大高亮数量' },
          { type: 'number', min: 100, max: 1000, message: '请输入 100-1000 之间的数字' },
        ]}
        extra="避免页面卡顿，建议 100-1000 之间"
      >
        <FixedWidthInputNumber min={100} max={1000} step={50} $width={150} suffix="个" />
      </Form.Item>

      <SpacedAlert
        message="高亮所有元素说明"
        description={
          <div>
            <p>
              1. 按住 Alt 键并按下配置的快捷键（默认 A），高亮所有带有 data-{attributeName}{' '}
              属性的元素
            </p>
            <p>2. 松开 Alt 键，自动清除所有高亮</p>
            <p>3. 高亮时会显示每个元素的参数值标签</p>
          </div>
        }
        type="info"
        showIcon
        $marginTop={16}
      />

      <FormSectionLabel id="field-recording-mode">Schema录制模式</FormSectionLabel>

      <Form.Item
        label="启用功能"
        name={FORM_PATHS.recordingModeConfig.enabled}
        valuePropName="checked"
        extra="按 Alt + 快捷键切换到录制模式，点击元素后以录制模式打开抽屉"
      >
        <Switch />
      </Form.Item>

      <Form.Item
        label="快捷键"
        name={FORM_PATHS.recordingModeConfig.keyBinding}
        rules={[
          { required: true, message: '请输入快捷键' },
          { pattern: /^[a-zA-Z0-9]$/, message: '请输入单个字母或数字' },
        ]}
        extra="输入单个字母或数字（0-9、A-Z），使用时按 Alt + [字符]"
        normalize={(value) => value?.toLowerCase()}
      >
        <FixedWidthInput placeholder="r" maxLength={1} $width={80} prefix="Alt +" />
      </Form.Item>

      <Form.Item
        label="录制模式高亮颜色"
        name={FORM_PATHS.recordingModeConfig.highlightColor}
        extra="录制模式下元素高亮框的颜色，区别于普通模式"
      >
        <ColorPickerField />
      </Form.Item>

      <Form.Item
        label="轮询间隔 (毫秒)"
        name={FORM_PATHS.recordingModeConfig.pollingInterval}
        rules={[
          { required: true, message: '请输入轮询间隔' },
          { type: 'number', min: 50, max: 1000, message: '请输入 50-1000 之间的数字' },
        ]}
        extra="Schema 变化检测的频率，建议 100ms"
      >
        <FixedWidthInputNumber min={50} max={1000} step={50} $width={150} suffix="ms" />
      </Form.Item>

      <SpacedAlert
        message="录制模式说明"
        description={
          <div>
            <p>1. 按 Alt + 快捷键（默认 R）切换到录制模式，高亮框会变成红色</p>
            <p>2. 点击目标元素，以录制模式打开Schema编辑器</p>
            <p>3. 录制模式会每隔指定时间轮询Schema变化，并记录每个不同的版本</p>
            <p>4. 停止录制后，可以选择任意两个版本进行差异对比</p>
          </div>
        }
        type="info"
        showIcon
        $marginTop={16}
      />

      <FormSectionLabel id="field-iframe-config">iframe 支持</FormSectionLabel>

      <Form.Item
        label="启用 iframe 元素检测"
        name={FORM_PATHS.iframeConfig.enabled}
        valuePropName="checked"
        extra="开启后可检测页面中同源 iframe 内的元素"
      >
        <Switch />
      </Form.Item>

      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues.iframeConfig?.enabled !== currentValues.iframeConfig?.enabled
        }
      >
        {({ getFieldValue }) => {
          const iframeEnabled = getFieldValue(FORM_PATHS.iframeConfig.enabled)
          return (
            <Form.Item
              label="Schema 数据来源"
              name={FORM_PATHS.iframeConfig.schemaTarget}
              extra="配置 iframe 内元素的 Schema 数据由谁提供"
            >
              <Radio.Group disabled={!iframeEnabled}>
                <Space direction="vertical">
                  <Radio value={'iframe' as IframeSchemaTarget}>
                    <Text strong>iframe 内部</Text>
                    <Text type="secondary" style={{ marginLeft: 8 }}>
                      向 iframe 的 window 发送 postMessage（默认）
                    </Text>
                  </Radio>
                  <Radio value={'topFrame' as IframeSchemaTarget}>
                    <Text strong>主页面</Text>
                    <Text type="secondary" style={{ marginLeft: 8 }}>
                      向 top frame 的 window 发送 postMessage
                    </Text>
                  </Radio>
                </Space>
              </Radio.Group>
            </Form.Item>
          )
        }}
      </Form.Item>

      <SpacedAlert
        message="iframe 支持说明"
        description={
          <div>
            <p>
              <Text strong>💡 如果页面不包含需要检测的 iframe，建议关闭此功能以减少资源消耗</Text>
            </p>
            <p>1. 仅支持同源 iframe，跨域 iframe 会显示"跨域 iframe 暂不支持"提示</p>
            <p>
              2. 默认向 iframe 内部发送 postMessage 获取 Schema，如果 iframe
              内没有集成响应逻辑，可切换为主页面
            </p>
            <p>3. 高亮框和 tooltip 统一渲染在主页面，不会被 iframe 边界裁剪</p>
          </div>
        }
        type="info"
        showIcon
        $marginTop={16}
      />
    </SectionCard>
  )
}
