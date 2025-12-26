import React, { ReactNode } from 'react'
import { Typography, Button, Space, Alert, Card, Divider } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'

const { Title, Paragraph } = Typography

interface TestLayoutProps {
  /** 测试标题 */
  title: string
  /** 测试说明 */
  description: ReactNode
  /** 测试内容 */
  children: ReactNode
  /** 检查清单项 */
  checklistItems?: string[]
  /** 使用说明 */
  instructions?: string[]
  /** 返回按钮点击回调 */
  onBack: () => void
}

export const TestLayout: React.FC<TestLayoutProps> = (props) => {
  const { title, description, children, checklistItems, instructions, onBack } = props

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Space direction="vertical" style={{ width: '100%', gap: 16 }}>
        <div>
          <Button icon={<ArrowLeftOutlined />} onClick={onBack} style={{ marginBottom: 16 }}>
            返回测试列表
          </Button>
          <Title level={2}>{title}</Title>
          <Paragraph>{description}</Paragraph>
        </div>

        <Divider />

        <Alert
          message="使用说明"
          description={
            <Space direction="vertical">
              {instructions && instructions.length > 0 ? (
                instructions.map((instruction, index) => (
                  <div key={index}>
                    {index + 1}. {instruction}
                  </div>
                ))
              ) : (
                <>
                  <div>1. 按住 Alt/Option 键，将鼠标悬停在带有 data-id 的元素上观察高亮</div>
                  <div>2. 按住 Alt/Option 键并点击元素打开编辑器</div>
                  <div>3. 在编辑器中编辑数据并保存</div>
                </>
              )}
            </Space>
          }
          type="info"
          showIcon
        />

        {children}

        {checklistItems && checklistItems.length > 0 && (
          <>
            <Divider />
            <Card title="测试检查清单" size="small">
              <Space direction="vertical">
                {checklistItems.map((item, index) => (
                  <div key={index}>✅ {item}</div>
                ))}
              </Space>
            </Card>
          </>
        )}
      </Space>
    </div>
  )
}
