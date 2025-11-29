import React, { useState } from 'react'
import { Card, Button, Input, Space, Tag, Typography, Alert, Row, Col } from 'antd'
import { PlayCircleOutlined, ClearOutlined, ReloadOutlined } from '@ant-design/icons'
import { parserMarkdownToSlateNode, parserSlateNodeToMarkdown } from '@ant-design/agentic-ui'
import styled from 'styled-components'

const { TextArea } = Input
const { Title, Text } = Typography

const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`

const ResultCard = styled(Card)<{ $status?: 'success' | 'warning' | 'error' }>`
  .ant-card-head {
    border-bottom-color: ${(props) => {
      switch (props.$status) {
        case 'error':
          return '#a61d24'
        case 'warning':
          return '#d89614'
        case 'success':
          return '#49aa19'
        default:
          return '#303030'
      }
    }};
  }
`

const CodeBlock = styled.pre`
  background: #fafafa;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 12px;
  margin: 0;
  max-height: 350px;
  overflow: auto;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
  color: #333;
`

const DEFAULT_INPUT = `好的，针对 重庆农村商业银行 的人群，目前暂无人群尚未配置活动，您可以重新选择银行与活动配置信息,可点击选择其他人群，请选择并确认目标人群：

\`\`\`apaasify
[
  {
    "componentPath": "CrowdSelectionCard",
    "name": "人群选择卡片",
    "componentProps": {
      "instId": "CRCBANK",
      "data": {
        "itemList": [
          {
            "title": "ap_crowd.crowd_ok15a8z9o_alipay_id_dd",
            "checked": true,
            "id": "ap_crowd.crowd_ok15a8z9o_alipay_id_dd",
            "type": "ODPS_TABLE"
          }
        ]
      },
      "__readonly": true
    }
  }
]
\`\`\``

interface TransformResult {
  step: number
  title: string
  data: any
  nodeCount?: number
  error?: string
}

interface AstTestPageProps {
  siderCollapsed?: boolean
}

export const AstTestPage: React.FC<AstTestPageProps> = () => {
  const [input, setInput] = useState(DEFAULT_INPUT)
  const [results, setResults] = useState<TransformResult[]>([])

  const runTest = () => {
    const newResults: TransformResult[] = []

    newResults.push({
      step: 1,
      title: '原始 Markdown 字符串',
      data: input,
    })

    try {
      const ast1 = parserMarkdownToSlateNode(input)?.schema || []
      newResults.push({
        step: 2,
        title: 'parserMarkdownToSlateNode → AST',
        data: ast1,
        nodeCount: ast1.length,
      })

      const markdown2 = parserSlateNodeToMarkdown(ast1)
      newResults.push({
        step: 3,
        title: 'parserSlateNodeToMarkdown → 字符串',
        data: markdown2,
      })

      const ast2 = parserMarkdownToSlateNode(markdown2)?.schema || []
      newResults.push({
        step: 4,
        title: 'parserMarkdownToSlateNode → AST（第二次）',
        data: ast2,
        nodeCount: ast2.length,
      })
    } catch (error: any) {
      newResults.push({
        step: newResults.length + 1,
        title: '转换出错',
        data: null,
        error: error.message,
      })
    }

    setResults(newResults)
  }

  const getCardStatus = (result: TransformResult): 'success' | 'warning' | 'error' | undefined => {
    if (result.error) return 'error'
    if (result.step === 4 && results[1]?.nodeCount !== result.nodeCount) return 'warning'
    return undefined
  }

  const getStepColor = (step: number) => {
    const colors = ['green', 'blue', 'orange', 'red']
    return colors[step - 1] || 'default'
  }

  const formatData = (data: any): string => {
    if (typeof data === 'string') return data
    return JSON.stringify(data, null, 2)
  }

  const hasInconsistency = results.length === 4 && results[1]?.nodeCount !== results[3]?.nodeCount

  return (
    <PageContainer>
      <Title level={3}>🔬 AST 转换测试</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
        直接测试 <code>parserMarkdownToSlateNode</code> 和 <code>parserSlateNodeToMarkdown</code>{' '}
        函数的往返一致性
      </Text>

      <Card title="输入 Markdown 字符串" style={{ marginBottom: 24 }}>
        <TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入要测试的 Markdown 字符串..."
          autoSize={{ minRows: 6, maxRows: 12 }}
          style={{ fontFamily: 'monospace' }}
        />
        <Space style={{ marginTop: 16 }}>
          <Button type="primary" icon={<PlayCircleOutlined />} onClick={runTest}>
            运行测试
          </Button>
          <Button icon={<ClearOutlined />} onClick={() => setResults([])}>
            清除结果
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setInput(DEFAULT_INPUT)
              setResults([])
            }}
          >
            重置输入
          </Button>
        </Space>
      </Card>

      {results.length > 0 && (
        <>
          <Row gutter={[16, 16]}>
            {results.map((result, index) => (
              <Col span={12} key={index}>
                <ResultCard
                  $status={getCardStatus(result)}
                  title={
                    <Space>
                      <Tag color={getStepColor(result.step)}>Step {result.step}</Tag>
                      <span>{result.title}</span>
                      {result.nodeCount !== undefined && (
                        <Tag
                          color={
                            result.step === 4 && results[1]?.nodeCount !== result.nodeCount
                              ? 'red'
                              : 'default'
                          }
                        >
                          节点数: {result.nodeCount}
                          {result.step === 4 && results[1]?.nodeCount !== result.nodeCount && (
                            <> (原: {results[1]?.nodeCount})</>
                          )}
                        </Tag>
                      )}
                    </Space>
                  }
                  size="small"
                >
                  <CodeBlock>
                    {result.error ? (
                      <span style={{ color: '#f5222d' }}>{result.error}</span>
                    ) : (
                      formatData(result.data)
                    )}
                  </CodeBlock>
                </ResultCard>
              </Col>
            ))}
          </Row>

          {hasInconsistency && (
            <Alert
              type="warning"
              showIcon
              style={{ marginTop: 24 }}
              message="检测到往返转换不一致"
              description={
                <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
                  <li>
                    第一次转换后 AST 节点数: <code>{results[1]?.nodeCount}</code>
                  </li>
                  <li>
                    第二次转换后 AST 节点数: <code>{results[3]?.nodeCount}</code>
                  </li>
                  <li>
                    这是因为 <code>parserSlateNodeToMarkdown</code> 将 <code>otherProps</code>{' '}
                    序列化为 HTML 注释
                  </li>
                  <li>
                    而 <code>parserMarkdownToSlateNode</code> 将 HTML 注释解析为独立的{' '}
                    <code>code</code> 节点
                  </li>
                </ul>
              }
            />
          )}
        </>
      )}

      <Alert
        type="info"
        style={{ marginTop: 24 }}
        message="测试说明"
        description={
          <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
            <li>
              此工具直接调用 <code>@ant-design/agentic-ui</code> 库的{' '}
              <code>parserMarkdownToSlateNode</code> 和 <code>parserSlateNodeToMarkdown</code> 方法
            </li>
            <li>点击"运行测试"可以看到完整的转换流程和结果对比</li>
            <li>如果节点数发生变化，说明存在往返转换不一致的问题</li>
          </ul>
        }
      />
    </PageContainer>
  )
}
