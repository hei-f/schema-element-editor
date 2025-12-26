import React, { ReactNode } from 'react'
import { Card, Space, Badge, Tag, Typography } from 'antd'
import styled from 'styled-components'

const { Text, Paragraph } = Typography

interface TestElementCardProps {
  /** 元素ID */
  id: string
  /** 标题 */
  title: string
  /** 描述 */
  description: string
  /** data-id 属性值 */
  dataId?: string
  /** 其他data属性 */
  dataAttrs?: Record<string, string>
  /** 是否有效 */
  isValid?: boolean
  /** 类型标签 */
  typeTag?: string
  /** 类型标签颜色 */
  typeTagColor?: string
  /** Schema数据（用于显示） */
  schemaData?: any
  /** 额外的操作按钮 */
  actions?: ReactNode
  /** 子元素（如果需要自定义内容） */
  children?: ReactNode
}

const StyledCard = styled(Card)<{ $isValid?: boolean }>`
  cursor: pointer;
  transition: all 0.3s;
  border-left: 4px solid ${(props) => (props.$isValid ? '#52c41a' : '#ff4d4f')};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`

const AttrInfo = styled.div`
  font-family: 'Consolas', 'Monaco', monospace;
  background: #f5f5f5;
  padding: 8px 12px;
  border-radius: 4px;
  margin-top: 8px;
  font-size: 12px;
  color: #595959;
`

const SchemaDisplay = styled.pre`
  background: #fafafa;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 12px;
  margin: 8px 0 0 0;
  max-height: 150px;
  overflow: auto;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 11px;
  line-height: 1.4;
  color: #333;
`

export const TestElementCard: React.FC<TestElementCardProps> = (props) => {
  const {
    id,
    title,
    description,
    dataId,
    dataAttrs = {},
    isValid = true,
    typeTag,
    typeTagColor = 'default',
    schemaData,
    actions,
    children,
  } = props

  const allAttrs = {
    ...(dataId ? { 'data-id': dataId } : {}),
    ...dataAttrs,
  }

  return (
    <StyledCard id={id} $isValid={isValid} size="small" {...allAttrs}>
      <Space style={{ marginBottom: 8 }}>
        <Badge status={isValid ? 'success' : 'error'} text={isValid ? '有效' : '非法'} />
        <Text strong>{title}</Text>
        {typeTag && <Tag color={typeTagColor}>{typeTag}</Tag>}
      </Space>
      <Paragraph type="secondary" style={{ margin: '4px 0 0 0', fontSize: 13 }}>
        {description}
      </Paragraph>

      {actions && <div style={{ marginTop: 12 }}>{actions}</div>}

      {dataId && <AttrInfo>data-id: "{dataId}"</AttrInfo>}

      {schemaData !== undefined && (
        <SchemaDisplay>
          {typeof schemaData === 'string' ? schemaData : JSON.stringify(schemaData, null, 2)}
        </SchemaDisplay>
      )}

      {children}
    </StyledCard>
  )
}
