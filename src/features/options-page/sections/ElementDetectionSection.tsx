import { FORM_PATHS } from '@/shared/constants/form-paths'
import { Form, Switch } from 'antd'
import React from 'react'
import { ColorPickerField } from '../components/ColorPickerField'
import { SectionCard } from '../components/SectionCard'
import { 
  FormSectionLabel,
  FixedWidthInput,
  FixedWidthInputNumber,
  SpacedAlert
} from '../styles/layout.styles'

interface ElementDetectionSectionProps {
  /** 当前属性名（用于Alert提示） */
  attributeName: string
  /** 恢复默认回调 */
  onResetDefault?: () => void
}

/**
 * 元素检测与高亮配置区块
 * 包含搜索配置、高亮颜色、快捷键高亮等
 */
export const ElementDetectionSection: React.FC<ElementDetectionSectionProps> = (props) => {
  const { attributeName, onResetDefault } = props

  return (
    <SectionCard
      title="元素检测与高亮"
      subtitle="配置鼠标交互和元素识别行为"
      panelKey="element-detection"
      onResetDefault={onResetDefault}
    >
      <Form.Item
        label="节流间隔 (毫秒)"
        name={FORM_PATHS.searchConfig.throttleInterval}
        extra="控制鼠标移动检测频率，16ms约为60fps，建议范围 8-100ms"
      >
        <FixedWidthInputNumber min={8} $width={120} />
      </Form.Item>

      <Form.Item
        label="限制向上搜索层级"
        name={FORM_PATHS.searchConfig.limitUpwardSearch}
        valuePropName="checked"
        extra="关闭时向上搜索到根元素，开启时只搜索指定层数"
      >
        <Switch />
      </Form.Item>

      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) => 
          prevValues.searchConfig?.limitUpwardSearch !== currentValues.searchConfig?.limitUpwardSearch
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
      >
        <ColorPickerField />
      </Form.Item>

      <FormSectionLabel>快捷键高亮所有元素</FormSectionLabel>

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
          { pattern: /^[a-zA-Z0-9]$/, message: '请输入单个字母或数字' }
        ]}
        extra="输入单个字母或数字（0-9、A-Z），使用时按 Alt + [字符]"
        normalize={(value) => value?.toLowerCase()}
      >
        <FixedWidthInput
          placeholder="a"
          maxLength={1}
          $width={80}
          prefix="Alt +"
        />
      </Form.Item>

      <Form.Item
        label="最大高亮数量"
        name={FORM_PATHS.highlightAllConfig.maxHighlightCount}
        rules={[
          { required: true, message: '请输入最大高亮数量' },
          { type: 'number', min: 100, max: 1000, message: '请输入 100-1000 之间的数字' }
        ]}
        extra="避免页面卡顿，建议 100-1000 之间"
      >
        <FixedWidthInputNumber
          min={100}
          max={1000}
          step={50}
          $width={150}
          suffix="个"
        />
      </Form.Item>

      <SpacedAlert
        message="使用说明"
        description={
          <div>
            <p>1. 按住 Alt 键并按下配置的快捷键（默认 A），高亮所有带有 data-{attributeName} 属性的元素</p>
            <p>2. 松开 Alt 键，自动清除所有高亮</p>
            <p>3. 高亮时会显示每个元素的参数值标签</p>
          </div>
        }
        type="info"
        showIcon
        $marginTop={16}
      />
    </SectionCard>
  )
}

