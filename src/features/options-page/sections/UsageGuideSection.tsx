import { Typography } from 'antd'
import React from 'react'
import { SectionCard } from '../components/SectionCard'
import { SchemaNote, SectionTitle } from '../styles/layout.styles'

interface UsageGuideSectionProps {
  /** 当前属性名（用于使用说明） */
  attributeName: string
  /** 是否展开 */
  isActive?: boolean
  /** 展开状态变化回调 */
  onActiveChange?: (active: boolean) => void
}

/**
 * 使用指南区块
 * 合并原有的使用说明和Schema类型支持
 */
export const UsageGuideSection: React.FC<UsageGuideSectionProps> = (props) => {
  const { attributeName, isActive, onActiveChange } = props

  return (
    <SectionCard
      title="使用指南"
      subtitle="快速上手和参考信息"
      panelKey="usage-guide"
      isActive={isActive}
      onActiveChange={onActiveChange}
    >
      <Typography.Title level={5} id="field-usage-instructions">
        使用说明
      </Typography.Title>
      <Typography.Paragraph>
        <ol>
          <li>
            在页面HTML元素上添加 <Typography.Text code>data-{attributeName}</Typography.Text> 属性
          </li>
          <li>页面需要实现获取和更新Schema数据的全局函数</li>
          <li>
            激活插件后，按住 <Typography.Text keyboard>Alt/Option</Typography.Text> 键悬停查看参数
          </li>
          <li>
            按住 <Typography.Text keyboard>Alt/Option</Typography.Text> 键并点击元素打开编辑器
          </li>
        </ol>
      </Typography.Paragraph>

      <SectionTitle level={5} id="field-schema-types">
        Schema类型支持
      </SectionTitle>
      <Typography.Paragraph>
        Schema编辑器支持字符串、数字、对象、数组、布尔值等数据类型
      </Typography.Paragraph>
      <SchemaNote type="secondary">注意：编辑器使用JSON格式，字符串值需要用引号包裹</SchemaNote>
    </SectionCard>
  )
}
