import React, { useEffect, useRef } from 'react'
import { Card, Typography, Tag, Space, Alert } from 'antd'
import { EyeOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import { useSchemaElementEditor } from '@schema-element-editor/host-sdk'
import { parserMarkdownToSlateNode } from '@ant-design/agentic-ui'

const { Title, Text, Paragraph } = Typography

interface BuiltinPreviewTestPageProps {
  siderCollapsed?: boolean
}

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`

const HeaderCard = styled(Card)`
  margin-bottom: 24px;
  background: linear-gradient(135deg, #f0f5ff 0%, #d6e4ff 100%);
  border: 1px solid #adc6ff;
`

const TestCard = styled(Card)`
  cursor: pointer;
  transition: all 0.3s;
  border-left: 4px solid #1677ff;
  margin-bottom: 16px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`

const SchemaPreview = styled.pre`
  background: #fafafa;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 12px;
  margin: 8px 0 0 0;
  max-height: 200px;
  overflow: auto;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  line-height: 1.5;
  color: #333;
`

/** 测试用的 Markdown 内容 */
const MARKDOWN_CONTENT = `# 内置预览器测试

这是一个用于测试**内置预览器**功能的页面。

## 功能特性

- 支持 AST 类型内容
- 支持 RawString 类型内容
- 实时预览，无需手动更新

## 代码示例

\`\`\`javascript
const hello = "world"
console.log(hello)
\`\`\`

> 这是一段引用文本

| 列1 | 列2 | 列3 |
|-----|-----|-----|
| A   | B   | C   |
| D   | E   | F   |
`

/** 将 Markdown 转换为 AST */
const markdownToAst = (markdown: string) => {
  const result = parserMarkdownToSlateNode(markdown)
  return result?.schema || []
}

/** 测试数据 */
const TEST_CASES = [
  {
    id: 'ast-content',
    title: 'AST 类型内容',
    description: '使用 Elements[] 格式存储的 Markdown 内容',
    type: 'ast',
    getData: () => markdownToAst(MARKDOWN_CONTENT),
  },
  {
    id: 'rawstring-content',
    title: 'RawString 类型内容',
    description: '直接存储的 Markdown 字符串',
    type: 'rawString',
    getData: () => MARKDOWN_CONTENT,
  },
  {
    id: 'json-object',
    title: 'JSON 对象（不支持预览）',
    description: '普通 JSON 对象，不支持内置预览器',
    type: 'json',
    getData: () => ({
      name: '测试对象',
      items: [1, 2, 3],
      nested: { key: 'value' },
    }),
  },
]

export const BuiltinPreviewTestPage: React.FC<BuiltinPreviewTestPageProps> = () => {
  const schemaDataRef = useRef<Record<string, unknown>>({})

  // 初始化测试数据
  useEffect(() => {
    TEST_CASES.forEach((testCase) => {
      schemaDataRef.current[testCase.id] = testCase.getData()
    })
  }, [])

  // 注册 Schema Element Editor（不提供 renderPreview，触发内置预览器）
  useSchemaElementEditor({
    getSchema: (params) => {
      const data = schemaDataRef.current[params]
      console.log('[BuiltinPreviewTest] getSchema:', params, data)
      return data
    },
    updateSchema: (schema, params) => {
      schemaDataRef.current[params] = schema
      console.log('[BuiltinPreviewTest] updateSchema:', params, schema)
      return true
    },
    // 故意不提供 renderPreview，让插件使用内置预览器
  })

  return (
    <PageContainer>
      <HeaderCard>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Space align="center">
            <EyeOutlined style={{ fontSize: 24, color: '#1677ff' }} />
            <Title level={3} style={{ margin: 0 }}>
              内置预览器测试
            </Title>
          </Space>
          <Paragraph style={{ margin: 0, color: '#666' }}>
            此页面用于测试插件的内置 Markdown 预览器功能。
            <br />
            由于未提供 <code>renderPreview</code> 函数，插件会使用内置的 MarkdownEditor 渲染预览。
          </Paragraph>
        </Space>
      </HeaderCard>

      <Alert
        type="info"
        showIcon
        message="使用说明"
        description={
          <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
            <li>确保已在配置页开启「启用内置预览器」选项</li>
            <li>按住 Alt/Option 键悬停卡片，点击打开编辑器</li>
            <li>点击预览按钮查看内置预览器效果</li>
            <li>AST 和 RawString 类型支持预览，JSON 对象类型不支持</li>
          </ul>
        }
        style={{ marginBottom: 24 }}
      />

      {TEST_CASES.map((testCase) => (
        <TestCard key={testCase.id} data-id={testCase.id}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              <Text strong>{testCase.title}</Text>
              <Tag color={testCase.type === 'json' ? 'orange' : 'blue'}>{testCase.type}</Tag>
              {testCase.type === 'json' && <Tag color="red">不支持预览</Tag>}
            </Space>
            <Text type="secondary">{testCase.description}</Text>
            <SchemaPreview>{JSON.stringify(testCase.getData(), null, 2)}</SchemaPreview>
          </Space>
        </TestCard>
      ))}
    </PageContainer>
  )
}
