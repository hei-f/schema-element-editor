import { DEFAULT_VALUES } from '@/shared/constants/defaults'
import { FORM_PATHS } from '@/shared/constants/form-paths'
import { Form, Switch, Tooltip } from 'antd'
import React from 'react'
import { SectionCard } from '../components/SectionCard'
import { 
  FixedWidthInputNumber,
  FormSectionLabel,
  InlineFormRow,
  FormLabel,
  ZeroMarginFormItem,
  HelpTooltipIcon,
  SpacedAlert
} from '../styles/layout.styles'

interface DataManagementSectionProps {
  /** 恢复默认回调 */
  onResetDefault?: () => void
}

/**
 * 数据管理配置区块
 * 包含草稿、收藏、历史记录、导出等配置
 */
export const DataManagementSection: React.FC<DataManagementSectionProps> = (props) => {
  const { onResetDefault } = props

  return (
    <SectionCard
      title="数据管理配置"
      subtitle="管理草稿、收藏和历史记录"
      panelKey="data-management"
      onResetDefault={onResetDefault}
    >
      <FormSectionLabel $noMarginTop>草稿配置</FormSectionLabel>
      
      <Form.Item
        label="草稿自动保存"
        name={FORM_PATHS.autoSaveDraft}
        valuePropName="checked"
        extra="开启后，编辑器内容变化时会自动保存草稿"
      >
        <Switch />
      </Form.Item>

      <FormSectionLabel>收藏配置</FormSectionLabel>
      
      <Form.Item
        label="最大收藏数量"
        name={FORM_PATHS.maxFavoritesCount}
        rules={[
          { required: true, message: '请输入最大收藏数量' },
          { type: 'number', min: 10, max: 200, message: '最大收藏数量必须在10-200之间' }
        ]}
        extra={`收藏列表的最大容量，默认值为 ${DEFAULT_VALUES.maxFavoritesCount}`}
      >
        <FixedWidthInputNumber min={10} max={200} step={10} placeholder="50" $width={120} />
      </Form.Item>

      <FormSectionLabel>历史记录配置</FormSectionLabel>

      <Form.Item
        label="历史记录上限"
        name={FORM_PATHS.maxHistoryCount}
        extra="编辑历史的最大保存数量（不包含保存/草稿/收藏等特殊版本）"
        rules={[
          { required: true, message: '请输入历史记录上限' },
          { type: 'number', min: 10, max: 200, message: '请输入 10-200 之间的数字' }
        ]}
      >
        <FixedWidthInputNumber
          min={10}
          max={200}
          step={10}
          $width={120}
          suffix="条"
        />
      </Form.Item>
      
      <SpacedAlert
        message="提示"
        description="历史记录保存在浏览器的 sessionStorage 中，关闭标签页后会自动清除。特殊版本（如保存、加载草稿、应用收藏）不计入上限。"
        type="info"
        showIcon
        $marginBottom={24}
      />

      <FormSectionLabel>导出配置</FormSectionLabel>

      <InlineFormRow>
        <FormLabel>导出时自定义文件名:</FormLabel>
        <ZeroMarginFormItem
          name={FORM_PATHS.exportConfig.customFileName}
          valuePropName="checked"
        >
          <Switch />
        </ZeroMarginFormItem>
        <Tooltip title="开启后，点击导出时会弹窗让您自定义文件名">
          <HelpTooltipIcon />
        </Tooltip>
      </InlineFormRow>
    </SectionCard>
  )
}

