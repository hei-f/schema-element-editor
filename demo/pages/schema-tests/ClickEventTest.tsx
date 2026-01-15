import React, { useState, useCallback } from 'react'
import { Row, Col, Radio, Space, Typography, Alert, Button, Card, Statistic } from 'antd'
import { SwapOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { TestLayout } from './components/TestLayout'
import { TestElementCard } from './components/TestElementCard'
import { useSchemaTestCommunication, CommunicationMode } from './hooks/useSchemaTestCommunication'

const { Text, Paragraph } = Typography

const MESSAGE_SOURCE = {
  CONTENT: 'schema-element-editor-content',
  HOST: 'schema-element-editor-host',
} as const

/** 初始Schema数据 */
const INITIAL_SCHEMA_STORE: Record<string, any> = {
  'click-button-1': {
    type: 'button',
    label: '按钮 1',
    action: 'submit',
  },
  'click-button-2': {
    type: 'button',
    label: '按钮 2',
    action: 'cancel',
  },
  'click-link': {
    type: 'link',
    text: '跳转链接',
    url: '#test',
  },
  'click-card': {
    type: 'card',
    title: '可点击卡片',
    content: '这是一个可点击的卡片组件',
  },
}

interface ClickEventTestProps {
  onBack: () => void
}

export const ClickEventTest: React.FC<ClickEventTestProps> = (props) => {
  const [communicationMode, setCommunicationMode] = useState<CommunicationMode>('postMessage')
  const [clickCounts, setClickCounts] = useState<Record<string, number>>({
    button1: 0,
    button2: 0,
    link: 0,
    card: 0,
  })

  const { schemaData } = useSchemaTestCommunication({
    initialSchemaStore: INITIAL_SCHEMA_STORE,
    communicationMode,
  })

  const handleClick = useCallback((elementId: string) => {
    setClickCounts((prev) => ({
      ...prev,
      [elementId]: prev[elementId] + 1,
    }))
  }, [])

  const resetCounts = useCallback(() => {
    setClickCounts({
      button1: 0,
      button2: 0,
      link: 0,
      card: 0,
    })
  }, [])

  return (
    <TestLayout
      title="点击事件触发测试"
      description="测试按住 Option/Alt 键点击元素时，是否会触发元素自身的点击事件"
      onBack={props.onBack}
      checklistItems={[
        '默认情况下（配置关闭），按住 Option/Alt 点击元素只打开编辑抽屉，不触发元素点击事件',
        '开启"触发高亮元素点击事件"配置后，按住 Option/Alt 点击元素时，既打开编辑抽屉，也触发元素点击事件',
        '配置可在插件设置页面的"元素检测与高亮 > 基础模式"中找到',
        '录制模式（Option/Alt + R）也遵循相同的配置',
      ]}
    >
      {/* 通信模式切换 */}
      <Alert
        type={communicationMode === 'postMessage' ? 'info' : 'warning'}
        showIcon
        message={
          <Space>
            <SwapOutlined style={{ color: '#1677ff' }} />
            <Text strong style={{ color: '#1677ff' }}>
              通信模式：
            </Text>
            <Radio.Group
              value={communicationMode}
              onChange={(e) => setCommunicationMode(e.target.value)}
              optionType="button"
              buttonStyle="solid"
            >
              <Radio.Button value="postMessage">postMessage 直连</Radio.Button>
              <Radio.Button value="windowFunction">Window 函数</Radio.Button>
            </Radio.Group>
          </Space>
        }
        description={
          communicationMode === 'postMessage'
            ? `监听 source: ${MESSAGE_SOURCE.CONTENT} → 响应 source: ${MESSAGE_SOURCE.HOST}`
            : '暴露 __getContentById / __updateContentById'
        }
      />

      {/* 测试说明 */}
      <Alert
        type="info"
        showIcon
        message="测试步骤"
        description={
          <div>
            <Paragraph style={{ marginBottom: 8 }}>
              <Text strong>1. 默认行为测试（配置关闭）：</Text>
            </Paragraph>
            <ul style={{ marginLeft: 20, marginBottom: 12 }}>
              <li>按住 Option/Alt 键，点击下方任一测试元素</li>
              <li>
                应该：打开编辑抽屉，点击计数器
                <Text strong type="danger">
                  不增加
                </Text>
              </li>
            </ul>

            <Paragraph style={{ marginBottom: 8 }}>
              <Text strong>2. 开启配置测试：</Text>
            </Paragraph>
            <ul style={{ marginLeft: 20, marginBottom: 12 }}>
              <li>打开插件设置页面（右键插件图标 → 选项）</li>
              <li>找到"元素检测与高亮"区块 → "基础模式"部分</li>
              <li>开启"触发高亮元素点击事件"开关</li>
              <li>刷新本页面</li>
            </ul>

            <Paragraph style={{ marginBottom: 8 }}>
              <Text strong>3. 验证配置生效：</Text>
            </Paragraph>
            <ul style={{ marginLeft: 20 }}>
              <li>按住 Option/Alt 键，点击下方任一测试元素</li>
              <li>
                应该：打开编辑抽屉，点击计数器
                <Text strong type="success">
                  增加
                </Text>
              </li>
            </ul>
          </div>
        }
      />

      {/* 点击统计面板 */}
      <Card
        title={
          <Space>
            <ThunderboltOutlined />
            点击统计
          </Space>
        }
        extra={
          <Button size="small" onClick={resetCounts}>
            重置计数
          </Button>
        }
      >
        <Row gutter={16}>
          <Col span={6}>
            <Statistic title="按钮 1" value={clickCounts.button1} suffix="次" />
          </Col>
          <Col span={6}>
            <Statistic title="按钮 2" value={clickCounts.button2} suffix="次" />
          </Col>
          <Col span={6}>
            <Statistic title="链接" value={clickCounts.link} suffix="次" />
          </Col>
          <Col span={6}>
            <Statistic title="卡片" value={clickCounts.card} suffix="次" />
          </Col>
        </Row>
      </Card>

      {/* 测试元素 */}
      <div>
        <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 12 }}>
          🎯 测试元素（按住 Option/Alt 点击）
        </Text>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card
              title="按钮元素"
              size="small"
              style={{ height: '100%' }}
              styles={{ body: { display: 'flex', flexDirection: 'column', gap: 12 } }}
            >
              <Button
                type="primary"
                data-id="click-button-1"
                onClick={() => handleClick('button1')}
                block
              >
                点击按钮 1（当前: {clickCounts.button1} 次）
              </Button>
              <Button
                type="default"
                data-id="click-button-2"
                onClick={() => handleClick('button2')}
                block
              >
                点击按钮 2（当前: {clickCounts.button2} 次）
              </Button>
              <TestElementCard
                id="click-button-1"
                title="按钮 1 Schema"
                description="普通按钮，绑定了 click 事件"
                dataId="click-button-1"
                typeTag="Button"
                typeTagColor="blue"
                schemaData={schemaData['click-button-1']}
                compact
              />
            </Card>
          </Col>

          <Col span={12}>
            <Card
              title="链接元素"
              size="small"
              style={{ height: '100%' }}
              styles={{ body: { display: 'flex', flexDirection: 'column', gap: 12 } }}
            >
              <a
                href="#test"
                data-id="click-link"
                onClick={(e) => {
                  e.preventDefault()
                  handleClick('link')
                }}
                style={{
                  display: 'block',
                  padding: '8px 16px',
                  textAlign: 'center',
                  background: '#f0f0f0',
                  borderRadius: 4,
                  textDecoration: 'none',
                }}
              >
                点击链接（当前: {clickCounts.link} 次）
              </a>
              <TestElementCard
                id="click-link"
                title="链接 Schema"
                description="链接元素，绑定了 click 事件"
                dataId="click-link"
                typeTag="Link"
                typeTagColor="green"
                schemaData={schemaData['click-link']}
                compact
              />
            </Card>
          </Col>

          <Col span={24}>
            <Card
              title="可点击卡片"
              size="small"
              data-id="click-card"
              onClick={() => handleClick('card')}
              style={{ cursor: 'pointer' }}
              styles={{ body: { display: 'flex', flexDirection: 'column', gap: 12 } }}
            >
              <Alert
                message={`这是一个可点击的卡片容器（当前: ${clickCounts.card} 次）`}
                description="整个卡片都绑定了 click 事件，点击卡片任意位置都会触发"
                type="warning"
                showIcon
              />
              <TestElementCard
                id="click-card"
                title="卡片 Schema"
                description="卡片容器，整个元素绑定了 click 事件"
                dataId="click-card"
                typeTag="Card"
                typeTagColor="purple"
                schemaData={schemaData['click-card']}
                compact
              />
            </Card>
          </Col>
        </Row>
      </div>
    </TestLayout>
  )
}
