import React from 'react'
import { Card, Space, Typography, List, Tag } from 'antd'
import {
  AppstoreOutlined,
  TrophyOutlined,
  StopOutlined,
  FunctionOutlined,
  BranchesOutlined,
} from '@ant-design/icons'

const { Title, Paragraph, Text } = Typography

interface TestCase {
  key: string
  title: string
  description: string
  icon: React.ReactNode
  tag?: { color: string; text: string }
}

interface MultiSdkTestIndexProps {
  /** 切换到指定测试页面 */
  onNavigate: (testKey: string) => void
}

const TEST_CASES: TestCase[] = [
  {
    key: 'same-level',
    title: '相同优先级多实例共存',
    description: '验证相同 level 的多个 SDK 各自管理各自的数据域，所有 SDK 都会响应请求',
    icon: <AppstoreOutlined />,
    tag: { color: 'green', text: '推荐场景' },
  },
  {
    key: 'priority-override',
    title: '不同优先级覆盖测试',
    description: '验证高优先级 SDK 覆盖低优先级 SDK（相同 data-id 的场景）',
    icon: <TrophyOutlined />,
    tag: { color: 'blue', text: '冲突处理' },
  },
  {
    key: 'priority-blocking',
    title: '不同优先级阻塞测试',
    description: '验证只有最高优先级的 SDK 响应，即使它没有对应的数据',
    icon: <StopOutlined />,
    tag: { color: 'orange', text: '注意事项' },
  },
  {
    key: 'method-level',
    title: '方法级别优先级测试',
    description: '验证 methodLevels 配置，不同方法使用不同的优先级',
    icon: <FunctionOutlined />,
    tag: { color: 'purple', text: '高级功能' },
  },
  {
    key: 'partial-implementation',
    title: '部分方法实现测试',
    description: '验证只实现部分方法的场景，数据和预览由不同 SDK 处理',
    icon: <BranchesOutlined />,
    tag: { color: 'cyan', text: '分离关注点' },
  },
]

export const MultiSdkTestIndex: React.FC<MultiSdkTestIndexProps> = (props) => {
  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Space direction="vertical" style={{ width: '100%', gap: 24 }}>
        <div>
          <Title level={2}>多 SDK 实例共存测试</Title>
          <Paragraph>
            当页面中同时存在多个 SDK 实例时，SDK 通过优先级协商机制来决定哪个实例响应插件请求。
            以下测试用例帮助你理解不同场景下的协商行为。
          </Paragraph>
        </div>

        <Card>
          <List
            dataSource={TEST_CASES}
            renderItem={(testCase) => (
              <List.Item
                key={testCase.key}
                style={{ cursor: 'pointer' }}
                onClick={() => props.onNavigate(testCase.key)}
              >
                <List.Item.Meta
                  avatar={
                    <div
                      style={{
                        fontSize: 32,
                        color: '#1677ff',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {testCase.icon}
                    </div>
                  }
                  title={
                    <Space>
                      <Text strong>{testCase.title}</Text>
                      {testCase.tag && <Tag color={testCase.tag.color}>{testCase.tag.text}</Tag>}
                    </Space>
                  }
                  description={testCase.description}
                />
              </List.Item>
            )}
          />
        </Card>
      </Space>
    </div>
  )
}
