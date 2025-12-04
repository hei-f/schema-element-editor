import { FORM_PATHS } from '@/shared/constants/form-paths'
import { ColorPicker, Form, Space, Switch, Tooltip } from 'antd'
import React from 'react'
import { SectionCard } from '../components/SectionCard'
import { HelpIcon } from '../styles/layout.styles'

interface EditorConfigSectionProps {
  /** 是否展开 */
  isActive?: boolean
  /** 展开状态变化回调 */
  onActiveChange?: (active: boolean) => void
  /** 恢复默认回调 */
  onResetDefault?: () => void
}

/**
 * 编辑器配置区块
 */
export const EditorConfigSection: React.FC<EditorConfigSectionProps> = (props) => {
  const { isActive, onActiveChange, onResetDefault } = props

  return (
    <SectionCard
      title="编辑器配置"
      subtitle="定制编辑器界面和功能"
      panelKey="editor-config"
      isActive={isActive}
      onActiveChange={onActiveChange}
      onResetDefault={onResetDefault}
    >
      <Form.Item
        label={
          <Space>
            字符串自动解析
            <Tooltip title="开启后，当获取的Schema数据为字符串时，插件会自动将其解析为Markdown Elements结构">
              <HelpIcon />
            </Tooltip>
          </Space>
        }
        name={FORM_PATHS.autoParseString}
        valuePropName="checked"
        extra="自动将字符串类型的Schema数据解析为Markdown Elements结构"
        id="field-auto-parse"
      >
        <Switch />
      </Form.Item>

      <Form.Item
        label="AST类型提示"
        name={FORM_PATHS.enableAstTypeHints}
        valuePropName="checked"
        extra="编辑 AST (Elements[]) 类型数据时，提供字段名和类型的智能补全"
        id="field-ast-hints"
      >
        <Switch />
      </Form.Item>

      <Form.Item
        label={
          <Space>
            主题色
            <Tooltip title="设置插件的主题色，用于配置页面和编辑器中的高亮颜色">
              <HelpIcon />
            </Tooltip>
          </Space>
        }
        name={FORM_PATHS.themeColor}
        getValueFromEvent={(color) => color.toHexString()}
        extra="设置插件整体的主题色"
        id="field-theme-color"
      >
        <ColorPicker format="hex" showText />
      </Form.Item>
    </SectionCard>
  )
}
