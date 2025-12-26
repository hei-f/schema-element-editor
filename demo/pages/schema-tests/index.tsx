import React from 'react'
import { Card, Space, Typography, List, Tag } from 'antd'
import {
  FileTextOutlined,
  DatabaseOutlined,
  ToolOutlined,
  EditOutlined,
  VideoCameraOutlined,
  BgColorsOutlined,
} from '@ant-design/icons'

const { Title, Paragraph, Text } = Typography

interface TestCase {
  key: string
  title: string
  description: string
  icon: React.ReactNode
  tag?: { color: string; text: string }
}

interface SchemaTestIndexProps {
  /** 切换到指定测试页面 */
  onNavigate: (testKey: string) => void
}

const TEST_CASES: TestCase[] = [
  {
    key: 'basic-types',
    title: '基础类型测试',
    description: '测试 String、Number、Boolean、Null 等基础数据类型的支持',
    icon: <FileTextOutlined />,
    tag: { color: 'green', text: '基础功能' },
  },
  {
    key: 'complex-types',
    title: '复杂类型测试',
    description: '测试 Object、Array 以及深层嵌套结构的支持',
    icon: <DatabaseOutlined />,
    tag: { color: 'blue', text: '进阶功能' },
  },
  {
    key: 'json-repair',
    title: 'JSON 修复测试',
    description: '测试 JSON 错误定位和自动修复功能，验证常见语法错误的修复能力',
    icon: <ToolOutlined />,
    tag: { color: 'orange', text: '核心功能' },
  },
  {
    key: 'quick-edit',
    title: '单独编辑测试',
    description: '测试单独编辑功能，处理文本中嵌入的错误 JSON 片段',
    icon: <EditOutlined />,
    tag: { color: 'magenta', text: '新功能' },
  },
  {
    key: 'recording-mode',
    title: '录制模式测试',
    description: '测试编辑器在数据快速更新场景下的表现',
    icon: <VideoCameraOutlined />,
    tag: { color: 'red', text: '性能测试' },
  },
  {
    key: 'ui-features',
    title: 'UI 功能测试',
    description: '测试 z-index 配置、滚动支持、预览功能等 UI 相关特性',
    icon: <BgColorsOutlined />,
    tag: { color: 'cyan', text: 'UI 测试' },
  },
]

export const SchemaTestIndex: React.FC<SchemaTestIndexProps> = (props) => {
  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Space direction="vertical" style={{ width: '100%', gap: 24 }}>
        <div>
          <Title level={2}>Schema Element Editor 功能测试</Title>
          <Paragraph>
            这里包含了 Schema Element Editor
            的各项功能测试用例，帮助你验证编辑器在不同场景下的表现。选择一个测试分类开始测试。
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
