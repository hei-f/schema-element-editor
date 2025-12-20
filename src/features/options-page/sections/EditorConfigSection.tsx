import { FORM_PATHS } from '@/shared/constants/form-paths'
import { CONTEXT_MENU_TRIGGER_MODE } from '@/shared/constants/context-menu'
import { DesktopOutlined } from '@ant-design/icons'
import { Form, Select, Space, Switch, Tooltip } from 'antd'
import React from 'react'
import { ColorPickerField } from '../components/ColorPickerField'
import { SectionCard } from '../components/SectionCard'
import { FormSectionLabelWithVariant } from '../components/FormSectionLabelWithVariant'
import { FormContent, FormSection, HelpTooltipIcon } from '../styles/layout.styles'
import type { SectionProps } from '../types'

/**
 * 编辑器配置区块
 */
export const EditorConfigSection: React.FC<SectionProps> = (props) => {
  const { sectionId, isActive, onActiveChange, onResetDefault } = props

  return (
    <SectionCard
      title="编辑器配置"
      subtitle="定制编辑器界面和功能"
      icon={DesktopOutlined}
      panelKey="editor-config"
      sectionId={sectionId}
      isActive={isActive}
      onActiveChange={onActiveChange}
      onResetDefault={onResetDefault}
    >
      <FormSection>
        <FormSectionLabelWithVariant id="field-editor-features">
          编辑器功能
        </FormSectionLabelWithVariant>
        <FormContent>
          <Form.Item
            label={
              <Space>
                字符串自动解析
                <Tooltip title="开启后，当获取的Schema数据为字符串时，插件会自动将其解析为Markdown Elements结构">
                  <HelpTooltipIcon />
                </Tooltip>
              </Space>
            }
            name={FORM_PATHS.autoParseString}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            label={
              <Space>
                AST类型提示
                <Tooltip title="编辑 AST (Elements[]) 类型数据时，提供字段名和类型的自动补全">
                  <HelpTooltipIcon />
                </Tooltip>
              </Space>
            }
            name={FORM_PATHS.enableAstTypeHints}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label={
              <Space>
                启用单独编辑
                <Tooltip title="在编辑器中对选中的内容快速打开单独编辑弹窗">
                  <HelpTooltipIcon />
                </Tooltip>
              </Space>
            }
            name={FORM_PATHS.contextMenuConfig.enabled}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.contextMenuConfig?.enabled !== currentValues.contextMenuConfig?.enabled
            }
          >
            {({ getFieldValue }) =>
              getFieldValue(FORM_PATHS.contextMenuConfig.enabled) ? (
                <Form.Item
                  label={
                    <Space>
                      单独编辑触发方式
                      <Tooltip title="选择单独编辑弹窗的触发方式">
                        <HelpTooltipIcon />
                      </Tooltip>
                    </Space>
                  }
                  name={FORM_PATHS.contextMenuConfig.triggerMode}
                >
                  <Select
                    style={{ width: 200 }}
                    options={[
                      { label: '选中自动出现', value: CONTEXT_MENU_TRIGGER_MODE.SELECTION },
                      { label: '右键出现', value: CONTEXT_MENU_TRIGGER_MODE.CONTEXT_MENU },
                    ]}
                  />
                </Form.Item>
              ) : null
            }
          </Form.Item>
        </FormContent>
      </FormSection>

      <FormSection>
        <FormSectionLabelWithVariant id="field-appearance">外观设置</FormSectionLabelWithVariant>
        <FormContent>
          <Form.Item
            label={
              <Space>
                主题色
                <Tooltip title="设置插件的主题色，用于配置页面和编辑器中的高亮颜色">
                  <HelpTooltipIcon />
                </Tooltip>
              </Space>
            }
            name={FORM_PATHS.themeColor}
          >
            <ColorPickerField />
          </Form.Item>
        </FormContent>
      </FormSection>
    </SectionCard>
  )
}
