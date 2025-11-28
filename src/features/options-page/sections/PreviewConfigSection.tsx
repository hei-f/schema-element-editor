import { FORM_PATHS } from '@/shared/constants/form-paths'
import { Form, Switch } from 'antd'
import React from 'react'
import { SectionCard } from '../components/SectionCard'
import { FixedWidthInputNumber } from '../styles/layout.styles'

interface PreviewConfigSectionProps {
  /** 恢复默认回调 */
  onResetDefault?: () => void
}

/**
 * 实时预览配置区块
 * 包含预览功能的所有配置项
 */
export const PreviewConfigSection: React.FC<PreviewConfigSectionProps> = (props) => {
  const { onResetDefault } = props

  return (
    <SectionCard
      title="实时预览配置"
      subtitle="控制预览区域的行为和显示"
      panelKey="preview-config"
      onResetDefault={onResetDefault}
    >
      <Form.Item
        label="自动更新预览"
        name={FORM_PATHS.previewConfig.autoUpdate}
        valuePropName="checked"
        extra="编辑器内容变化时自动更新预览（使用下面设置的延迟）"
      >
        <Switch />
      </Form.Item>

      <Form.Item
        label="更新防抖（毫秒）"
        name={FORM_PATHS.previewConfig.updateDelay}
        extra="编辑后多久更新预览，避免频繁渲染"
      >
        <FixedWidthInputNumber min={100} max={2000} step={100} $width={120} />
      </Form.Item>

      <Form.Item
        label="预览区域宽度"
        name={FORM_PATHS.previewConfig.previewWidth}
        extra="预览区域占抽屉的百分比（20-80%）"
      >
        <FixedWidthInputNumber min={20} max={80} $width={120} suffix="%" />
      </Form.Item>
    </SectionCard>
  )
}
