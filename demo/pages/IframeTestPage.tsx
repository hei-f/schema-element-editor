import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Card, Typography, Space, Tag, Alert, Row, Col, Badge, Radio, Divider } from 'antd'
import { BlockOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import styled from 'styled-components'

const { Title, Text, Paragraph } = Typography

interface IframeTestPageProps {
  siderCollapsed?: boolean
}

const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding-bottom: 24px;
`

const HeaderCard = styled(Card)`
  margin-bottom: 24px;
  background: linear-gradient(135deg, #f0f5ff 0%, #d6e4ff 100%);
  border: 1px solid #adc6ff;
`

const IframeContainer = styled.div`
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 16px;
  background: #fafafa;
  margin-top: 16px;
`

const StyledIframe = styled.iframe`
  width: 100%;
  height: 450px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
`

const TestCard = styled(Card)<{ $isValid?: boolean }>`
  cursor: pointer;
  transition: all 0.3s;
  border-left: 4px solid ${(props) => (props.$isValid ? '#52c41a' : '#ff4d4f')};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`

const LogPanel = styled(Card)`
  margin-top: 24px;
  max-height: 300px;
  overflow-y: auto;

  .ant-card-body {
    padding: 12px;
  }
`

const LogItem = styled.div<{ $type: string }>`
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  padding: 4px 8px;
  margin: 2px 0;
  border-radius: 4px;
  background: ${(props) => {
    switch (props.$type) {
      case 'success':
        return '#f6ffed'
      case 'error':
        return '#fff2f0'
      case 'warn':
        return '#fffbe6'
      default:
        return '#e6f4ff'
    }
  }};
  color: ${(props) => {
    switch (props.$type) {
      case 'success':
        return '#389e0d'
      case 'error':
        return '#cf1322'
      case 'warn':
        return '#d48806'
      default:
        return '#0958d9'
    }
  }};
`

interface LogEntry {
  type: 'info' | 'success' | 'warn' | 'error'
  message: string
  time: string
}

export const IframeTestPage: React.FC<IframeTestPageProps> = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [schemaTarget, setSchemaTarget] = useState<'iframe' | 'topFrame'>('iframe')

  const addLog = useCallback((type: LogEntry['type'], message: string) => {
    const log: LogEntry = {
      type,
      message,
      time: new Date().toLocaleTimeString(),
    }
    setLogs((prev) => [...prev.slice(-20), log])
  }, [])

  // iframe 加载完成回调
  const handleIframeLoad = useCallback(() => {
    addLog('success', 'iframe 内容已加载')
  }, [addLog])

  // 主页面的 Schema 数据（用于 schemaTarget = topFrame 时）
  const topFrameSchemaStore = useRef<Record<string, unknown>>({
    'iframe-element-1': {
      title: '来自主页面的 Schema',
      description: '当配置为 topFrame 时使用此数据',
      source: 'top-frame',
    },
    'iframe-element-2': { message: '这是主页面提供的数据' },
    'iframe-nested-object': { type: 'top-frame-data', items: [1, 2, 3] },
  })

  // 监听来自插件的 postMessage（主页面模式）
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || event.data.source !== 'schema-editor-content') return

      const { type, payload, requestId } = event.data
      let result: Record<string, unknown>

      switch (type) {
        case 'GET_SCHEMA': {
          const schema = topFrameSchemaStore.current[payload.params]
          if (schema !== undefined) {
            result = { success: true, data: schema }
            addLog('success', `[主页面] 返回 Schema: ${payload.params}`)
          } else {
            result = {
              success: true,
              data: { error: 'Schema not found in top frame', params: payload.params },
            }
            addLog('warn', `[主页面] Schema 未找到: ${payload.params}`)
          }
          break
        }

        case 'UPDATE_SCHEMA': {
          topFrameSchemaStore.current[payload.params] = payload.schema
          result = { success: true }
          addLog('success', `[主页面] Schema 已更新: ${payload.params}`)
          break
        }

        case 'CHECK_PREVIEW': {
          result = { exists: false }
          break
        }

        default:
          result = { success: false, error: `Unknown type: ${type}` }
      }

      // 发送响应
      window.postMessage(
        {
          source: 'schema-editor-host',
          requestId,
          ...result,
        },
        '*'
      )
    }

    window.addEventListener('message', handleMessage)
    // 使用 setTimeout 避免在 effect 中同步调用 setState
    setTimeout(() => addLog('info', '主页面 postMessage 监听器已注册'), 0)

    return () => window.removeEventListener('message', handleMessage)
  }, [addLog])

  return (
    <PageContainer>
      <HeaderCard>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ color: '#2f54eb', margin: 0 }}>
              <BlockOutlined style={{ marginRight: 8 }} />
              iframe 元素检测测试
            </Title>
          </Col>
          <Col>
            <Space>
              <Text strong>Schema 数据来源配置：</Text>
              <Radio.Group
                value={schemaTarget}
                onChange={(e) => setSchemaTarget(e.target.value)}
                optionType="button"
                buttonStyle="solid"
              >
                <Radio.Button value="iframe">iframe 内部</Radio.Button>
                <Radio.Button value="topFrame">主页面</Radio.Button>
              </Radio.Group>
            </Space>
          </Col>
        </Row>

        <Alert
          style={{ marginTop: 16 }}
          type="info"
          showIcon
          message="测试说明"
          description={
            <div>
              <p>
                1. 按住 <Text keyboard>Alt/Option</Text> 键悬停在 iframe 内的元素上，观察高亮效果
              </p>
              <p>2. 点击 iframe 内的有效元素，打开 Schema 编辑器抽屉</p>
              <p>3. 根据上方的"Schema 数据来源配置"，数据会从 iframe 内部或主页面获取</p>
              <p>
                4. 修改插件设置页的 <Text code>iframe 支持 → Schema 数据来源</Text>{' '}
                配置，需与上方选择一致
              </p>
            </div>
          }
        />
      </HeaderCard>

      <Row gutter={24}>
        <Col span={16}>
          <Card
            title={
              <Space>
                <BlockOutlined />
                <span>同源 iframe 测试区域</span>
                <Tag color="success">同源</Tag>
              </Space>
            }
          >
            <IframeContainer>
              <StyledIframe
                ref={iframeRef}
                src="/iframe-app.html"
                title="测试 iframe (SDK)"
                onLoad={handleIframeLoad}
              />
            </IframeContainer>
          </Card>

          <Card title="主页面测试元素" style={{ marginTop: 24 }}>
            <Paragraph type="secondary" style={{ marginBottom: 16 }}>
              以下是主页面的测试元素，用于对比 iframe 内外的检测效果
            </Paragraph>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <TestCard $isValid data-id="top-frame-element-1">
                  <Space style={{ marginBottom: 8 }}>
                    <Badge status="success" text="有效" />
                    <Text strong>主页面元素 1</Text>
                  </Space>
                  <Paragraph type="secondary" style={{ margin: 0, fontSize: 13 }}>
                    这是主页面的测试元素
                  </Paragraph>
                </TestCard>
              </Col>
              <Col span={12}>
                <TestCard $isValid data-id="top-frame-element-2">
                  <Space style={{ marginBottom: 8 }}>
                    <Badge status="success" text="有效" />
                    <Text strong>主页面元素 2</Text>
                  </Space>
                  <Paragraph type="secondary" style={{ margin: 0, fontSize: 13 }}>
                    这是主页面的另一个测试元素
                  </Paragraph>
                </TestCard>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="功能状态">
            <Space orientation="vertical" style={{ width: '100%' }}>
              <div>
                <Text type="secondary">iframe 检测：</Text>
                <Tag icon={<CheckCircleOutlined />} color="success">
                  已启用
                </Tag>
              </div>
              <div>
                <Text type="secondary">当前数据来源：</Text>
                <Tag color={schemaTarget === 'iframe' ? 'blue' : 'orange'}>
                  {schemaTarget === 'iframe' ? 'iframe 内部' : '主页面'}
                </Tag>
              </div>
              <Divider style={{ margin: '12px 0' }} />
              <div>
                <Text type="secondary">跨域 iframe：</Text>
                <Tag icon={<CloseCircleOutlined />} color="default">
                  暂不支持
                </Tag>
              </div>
            </Space>
          </Card>

          <LogPanel title="📋 日志输出" style={{ marginTop: 24 }}>
            {logs.length === 0 ? (
              <Text type="secondary">等待操作...</Text>
            ) : (
              logs.map((log, index) => (
                <LogItem key={index} $type={log.type}>
                  [{log.time}] {log.message}
                </LogItem>
              ))
            )}
          </LogPanel>
        </Col>
      </Row>
    </PageContainer>
  )
}
