import { FORM_PATHS } from '@/shared/constants/form-paths'
import { storage } from '@/shared/utils/browser/storage'
import { Form, message, Switch, Tooltip } from 'antd'
import React from 'react'
import { SectionCard } from '../components/SectionCard'
import { 
  FormRowContainer, 
  InlineFormRow, 
  FormLabel, 
  ZeroMarginFormItem,
  HelpTooltipIcon,
  FormSectionLabel
} from '../styles/layout.styles'

interface FeatureToggleSectionProps {
  /** 恢复默认回调 */
  onResetDefault?: () => void
}

/**
 * 功能开关配置区块
 * 控制编辑器功能模块的启用/禁用
 */
export const FeatureToggleSection: React.FC<FeatureToggleSectionProps> = (props) => {
  const { onResetDefault } = props
  const form = Form.useFormInstance()

  /**
   * 一键精简：关闭所有功能开关
   */
  const handleSimplifyMode = async () => {
    const simplifiedConfig = {
      astRawStringToggle: false,
      deserialize: false,
      serialize: false,
      format: false,
      preview: false,
      importExport: false,
      draft: false,
      favorites: false,
      history: false
    }
    
    form.setFieldsValue({ toolbarButtons: simplifiedConfig })
    
    try {
      await storage.setToolbarButtons(simplifiedConfig)
      message.success('已切换到精简模式', 1.5)
    } catch (error) {
      message.error('保存失败')
    }
  }

  return (
    <SectionCard
      title="功能开关"
      subtitle="控制编辑器功能模块的启用/禁用"
      panelKey="feature-toggle"
      onResetDefault={onResetDefault}
      extraActions={[
        { label: '一键精简', onClick: handleSimplifyMode, variant: 'primary' }
      ]}
    >
      <FormSectionLabel $noMarginTop>功能模块</FormSectionLabel>
      <FormRowContainer>
        <InlineFormRow>
          <FormLabel>草稿功能:</FormLabel>
          <ZeroMarginFormItem
            name={FORM_PATHS.toolbarButtons.draft}
            valuePropName="checked"
          >
            <Switch />
          </ZeroMarginFormItem>
          <Tooltip title="包含保存草稿、加载草稿、删除草稿、自动保存草稿">
            <HelpTooltipIcon />
          </Tooltip>
        </InlineFormRow>

        <InlineFormRow>
          <FormLabel>收藏功能:</FormLabel>
          <ZeroMarginFormItem
            name={FORM_PATHS.toolbarButtons.favorites}
            valuePropName="checked"
          >
            <Switch />
          </ZeroMarginFormItem>
          <Tooltip title="包含添加收藏、浏览收藏">
            <HelpTooltipIcon />
          </Tooltip>
        </InlineFormRow>

        <InlineFormRow>
          <FormLabel>历史记录:</FormLabel>
          <ZeroMarginFormItem
            name={FORM_PATHS.toolbarButtons.history}
            valuePropName="checked"
          >
            <Switch />
          </ZeroMarginFormItem>
          <Tooltip title="包含编辑历史记录和版本切换">
            <HelpTooltipIcon />
          </Tooltip>
        </InlineFormRow>
      </FormRowContainer>

      <FormSectionLabel>工具栏按钮</FormSectionLabel>
      <FormRowContainer>
        <InlineFormRow>
          <FormLabel>AST/RawString切换:</FormLabel>
          <ZeroMarginFormItem
            name={FORM_PATHS.toolbarButtons.astRawStringToggle}
            valuePropName="checked"
          >
            <Switch />
          </ZeroMarginFormItem>
        </InlineFormRow>

        <InlineFormRow>
          <FormLabel>反序列化:</FormLabel>
          <ZeroMarginFormItem
            name={FORM_PATHS.toolbarButtons.deserialize}
            valuePropName="checked"
          >
            <Switch />
          </ZeroMarginFormItem>
        </InlineFormRow>

        <InlineFormRow>
          <FormLabel>序列化:</FormLabel>
          <ZeroMarginFormItem
            name={FORM_PATHS.toolbarButtons.serialize}
            valuePropName="checked"
          >
            <Switch />
          </ZeroMarginFormItem>
        </InlineFormRow>

        <InlineFormRow>
          <FormLabel>格式化:</FormLabel>
          <ZeroMarginFormItem
            name={FORM_PATHS.toolbarButtons.format}
            valuePropName="checked"
          >
            <Switch />
          </ZeroMarginFormItem>
        </InlineFormRow>

        <InlineFormRow>
          <FormLabel>预览:</FormLabel>
          <ZeroMarginFormItem
            name={FORM_PATHS.toolbarButtons.preview}
            valuePropName="checked"
          >
            <Switch />
          </ZeroMarginFormItem>
        </InlineFormRow>

        <InlineFormRow>
          <FormLabel>导入导出:</FormLabel>
          <ZeroMarginFormItem
            name={FORM_PATHS.toolbarButtons.importExport}
            valuePropName="checked"
          >
            <Switch />
          </ZeroMarginFormItem>
          <Tooltip title="在标题栏显示导入/导出按钮">
            <HelpTooltipIcon />
          </Tooltip>
        </InlineFormRow>
      </FormRowContainer>
    </SectionCard>
  )
}

