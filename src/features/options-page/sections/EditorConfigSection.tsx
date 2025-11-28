import { DEFAULT_VALUES } from '@/shared/constants/defaults'
import { FORM_PATHS } from '@/shared/constants/form-paths'
import { Form, Input, Space, Switch, Tooltip } from 'antd'
import React from 'react'
import { SectionCard } from '../components/SectionCard'
import { HelpIcon } from '../styles/layout.styles'

interface EditorConfigSectionProps {
  /** 恢复默认回调 */
  onResetDefault?: () => void
}

/**
 * 编辑器配置区块
 */
export const EditorConfigSection: React.FC<EditorConfigSectionProps> = (props) => {
  const { onResetDefault } = props

  return (
    <SectionCard
      title="编辑器配置"
      subtitle="定制编辑器界面和功能"
      panelKey="editor-config"
      onResetDefault={onResetDefault}
    >
      <Form.Item
        label="抽屉宽度"
        name={FORM_PATHS.drawerWidth}
        rules={[
          { required: true, message: '请输入抽屉宽度' },
          { pattern: /^\d+(%|px)$/, message: '宽度格式必须为数字+px或%' },
        ]}
        extra="设置编辑器抽屉的宽度"
      >
        <Input placeholder={`例如: ${DEFAULT_VALUES.drawerWidth}`} />
      </Form.Item>

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
      >
        <Switch />
      </Form.Item>

      <Form.Item
        label="AST类型提示"
        name={FORM_PATHS.enableAstTypeHints}
        valuePropName="checked"
        extra="编辑 AST (Elements[]) 类型数据时，提供字段名和类型的智能补全"
      >
        <Switch />
      </Form.Item>
    </SectionCard>
  )
}
