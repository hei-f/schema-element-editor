import { DEFAULT_VALUES } from '@/shared/constants/defaults'
import { FORM_PATHS } from '@/shared/constants/form-paths'
import { DatabaseOutlined } from '@ant-design/icons'
import { Form, Space, Switch, Tooltip } from 'antd'
import React from 'react'
import { SectionCard } from '../components/SectionCard'
import { FormSectionLabelWithVariant } from '../components/FormSectionLabelWithVariant'
import {
  FixedWidthInputNumber,
  FormContent,
  FormSection,
  InlineFormRow,
  FormLabel,
  ZeroMarginFormItem,
  HelpTooltipIcon,
  SpacedAlert,
} from '../styles/layout.styles'
import type { SectionProps } from '../types'

/**
 * 数据管理配置区块
 * 包含草稿、收藏、历史记录、导出等配置
 */
export const DataManagementSection: React.FC<SectionProps> = (props) => {
  const { sectionId, isActive, onActiveChange, onResetDefault } = props

  return (
    <SectionCard
      title="数据管理配置"
      subtitle="管理草稿、收藏和历史记录"
      icon={DatabaseOutlined}
      panelKey="data-management"
      sectionId={sectionId}
      isActive={isActive}
      onActiveChange={onActiveChange}
      onResetDefault={onResetDefault}
    >
      <FormSection>
        <FormSectionLabelWithVariant id="field-draft-config">草稿配置</FormSectionLabelWithVariant>
        <FormContent>
          <Form.Item
            label={
              <Space>
                草稿自动保存
                <Tooltip title="开启后，编辑器内容变化时会自动保存草稿">
                  <HelpTooltipIcon />
                </Tooltip>
              </Space>
            }
            name={FORM_PATHS.autoSaveDraft}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </FormContent>
      </FormSection>

      <FormSection>
        <FormSectionLabelWithVariant id="field-favorites-config">
          收藏配置
        </FormSectionLabelWithVariant>
        <FormContent>
          <Form.Item
            label={
              <Space>
                最大收藏数量
                <Tooltip title={`收藏列表的最大容量，默认值为 ${DEFAULT_VALUES.maxFavoritesCount}`}>
                  <HelpTooltipIcon />
                </Tooltip>
              </Space>
            }
            name={FORM_PATHS.maxFavoritesCount}
            rules={[
              { required: true, message: '请输入最大收藏数量' },
              { type: 'number', min: 10, max: 200, message: '最大收藏数量必须在10-200之间' },
            ]}
          >
            <FixedWidthInputNumber min={10} max={200} step={10} placeholder="50" $width={120} />
          </Form.Item>
          <Form.Item
            label={
              <Space>
                最大固定收藏数量
                <Tooltip
                  title={`可以固定的收藏数量上限，固定的收藏会始终显示在列表顶部，默认值为 ${DEFAULT_VALUES.maxPinnedFavorites}`}
                >
                  <HelpTooltipIcon />
                </Tooltip>
              </Space>
            }
            name={FORM_PATHS.maxPinnedFavorites}
            rules={[
              { required: true, message: '请输入最大固定收藏数量' },
              { type: 'number', min: 1, max: 50, message: '最大固定收藏数量必须在1-50之间' },
            ]}
          >
            <FixedWidthInputNumber min={1} max={50} step={1} placeholder="10" $width={120} />
          </Form.Item>
        </FormContent>
      </FormSection>

      <FormSection>
        <FormSectionLabelWithVariant id="field-history-config">
          历史记录配置
        </FormSectionLabelWithVariant>
        <FormContent>
          <Form.Item
            label={
              <Space>
                历史记录上限
                <Tooltip title="编辑历史的最大保存数量（不包含保存/草稿/收藏等特殊版本）">
                  <HelpTooltipIcon />
                </Tooltip>
              </Space>
            }
            name={FORM_PATHS.maxHistoryCount}
            rules={[
              { required: true, message: '请输入历史记录上限' },
              { type: 'number', min: 10, max: 200, message: '请输入 10-200 之间的数字' },
            ]}
          >
            <FixedWidthInputNumber min={10} max={200} step={10} $width={120} suffix="条" />
          </Form.Item>
          <SpacedAlert
            message="提示"
            description="历史记录保存在浏览器的 sessionStorage 中，关闭标签页后会自动清除。特殊版本（如保存、加载草稿、应用收藏）不计入上限。"
            type="info"
            showIcon
          />
        </FormContent>
      </FormSection>

      <FormSection>
        <FormSectionLabelWithVariant id="field-export-config">导出配置</FormSectionLabelWithVariant>
        <FormContent>
          <InlineFormRow align="center" gap={8}>
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
        </FormContent>
      </FormSection>
    </SectionCard>
  )
}
