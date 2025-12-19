import React, { ReactNode } from 'react'
import { Card, Space, Typography, Tag } from 'antd'

const { Text } = Typography

interface SdkCardProps {
  /** SDK 名称 */
  title: string
  /** 优先级 level */
  level: number
  /** 优先级标签颜色 */
  priorityColor?: 'red' | 'orange' | 'green' | 'blue' | 'purple'
  /** 优先级标签文本 */
  priorityText?: string
  /** 额外的标签 */
  extraTags?: Array<{ color: string; text: string }>
  /** 管理的数据展示 */
  children: ReactNode
}

const PRIORITY_COLORS = {
  red: '优先级：最高',
  green: '优先级：高',
  orange: '优先级：低',
  blue: '优先级：中',
  purple: '优先级：特殊',
}

export const SdkCard: React.FC<SdkCardProps> = (props) => {
  const priorityText = props.priorityText || PRIORITY_COLORS[props.priorityColor || 'blue']

  return (
    <Card
      title={
        <Space>
          <Text>{props.title}</Text>
          <Tag color="cyan">level: {props.level}</Tag>
          {props.priorityColor && <Tag color={props.priorityColor}>{priorityText}</Tag>}
          {props.extraTags?.map((tag, index) => (
            <Tag key={index} color={tag.color}>
              {tag.text}
            </Tag>
          ))}
        </Space>
      }
      size="small"
      style={{ marginBottom: 16 }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text type="secondary">管理的数据：</Text>
        </div>
        {props.children}
      </Space>
    </Card>
  )
}
