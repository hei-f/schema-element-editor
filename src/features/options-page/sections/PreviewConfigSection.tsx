import { FORM_PATHS } from '@/shared/constants/form-paths'
import { Divider, Form, Switch } from 'antd'
import React from 'react'
import { SectionCard } from '../components/SectionCard'
import { FixedWidthInputNumber } from '../styles/layout.styles'

interface PreviewConfigSectionProps {
  /** 是否展开 */
  isActive?: boolean
  /** 展开状态变化回调 */
  onActiveChange?: (active: boolean) => void
  /** 恢复默认回调 */
  onResetDefault?: () => void
}

/**
 * 实时预览配置区块
 * 包含预览功能的所有配置项
 */
export const PreviewConfigSection: React.FC<PreviewConfigSectionProps> = (props) => {
  const { isActive, onActiveChange, onResetDefault } = props

  return (
    <SectionCard
      title="实时预览配置"
      subtitle="控制预览区域的行为和显示"
      panelKey="preview-config"
      isActive={isActive}
      onActiveChange={onActiveChange}
      onResetDefault={onResetDefault}
    >
      <Form.Item
        label="自动更新预览"
        name={FORM_PATHS.previewConfig.autoUpdate}
        valuePropName="checked"
        extra="编辑器内容变化时自动更新预览（使用下面设置的延迟）"
        id="field-auto-update"
      >
        <Switch />
      </Form.Item>

      <Form.Item
        label="更新防抖（毫秒）"
        name={FORM_PATHS.previewConfig.updateDelay}
        extra="编辑后多久更新预览，避免频繁渲染"
        id="field-update-delay"
      >
        <FixedWidthInputNumber min={100} max={2000} step={100} $width={120} />
      </Form.Item>

      <Form.Item
        label="预览区域宽度"
        name={FORM_PATHS.previewConfig.previewWidth}
        extra="预览区域占抽屉的百分比（20-80%）"
        id="field-preview-width"
      >
        <FixedWidthInputNumber min={20} max={80} $width={120} suffix="%" />
      </Form.Item>

      <div id="field-z-index">
        <Divider orientation="left" plain style={{ margin: '8px 0' }}>
          层级配置
        </Divider>
      </div>

      <Form.Item
        label="默认 z-index"
        name={FORM_PATHS.previewConfig.zIndex.default}
        extra="非预览模式下的层级，确保插件不被页面元素遮挡"
      >
        <FixedWidthInputNumber min={1000} max={2147483647} $width={150} />
      </Form.Item>

      <Form.Item
        label="预览模式 z-index"
        name={FORM_PATHS.previewConfig.zIndex.preview}
        extra="预览模式下的层级，需低于 antd 弹窗默认值 1000 以显示弹窗"
      >
        <FixedWidthInputNumber min={1} max={2147483647} $width={150} />
      </Form.Item>
    </SectionCard>
  )
}
