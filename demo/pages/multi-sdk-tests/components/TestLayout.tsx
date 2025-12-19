import React, { ReactNode } from 'react'
import { Typography, Button, Space, Alert, Card, Divider } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'

const { Title, Paragraph, Text } = Typography

interface TestLayoutProps {
  /** 测试标题 */
  title: string
  /** 测试说明 */
  description: ReactNode
  /** 测试内容 */
  children: ReactNode
  /** 检查清单项 */
  checklistItems?: string[]
  /** 返回按钮点击回调 */
  onBack: () => void
}

export const TestLayout: React.FC<TestLayoutProps> = (props) => {
  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Space direction="vertical" style={{ width: '100%', gap: 16 }}>
        <div>
          <Button icon={<ArrowLeftOutlined />} onClick={props.onBack} style={{ marginBottom: 16 }}>
            返回测试列表
          </Button>
          <Title level={2}>{props.title}</Title>
          <Paragraph>{props.description}</Paragraph>
        </div>

        <Divider />

        <Alert
          message="测试说明"
          description={
            <Space direction="vertical">
              <div>1. 按住 Alt/Option 键点击任意带有 data-id 的元素</div>
              <div>2. 编辑器应该显示对应 SDK 的数据</div>
              <div>3. 查看浏览器控制台日志，确认 SDK 的响应情况</div>
            </Space>
          }
          type="info"
          showIcon
        />

        {props.children}

        {props.checklistItems && props.checklistItems.length > 0 && (
          <>
            <Divider />
            <Card title="测试检查清单" size="small">
              <Space direction="vertical">
                {props.checklistItems.map((item, index) => (
                  <Text key={index}>✅ {item}</Text>
                ))}
              </Space>
            </Card>
          </>
        )}
      </Space>
    </div>
  )
}
