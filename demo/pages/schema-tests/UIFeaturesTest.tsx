import React, { useState, useRef, useCallback } from 'react'
import ReactDOM from 'react-dom/client'
import { Row, Col, Radio, Space, Typography, Alert, Modal, Drawer, Button, Card } from 'antd'
import { SwapOutlined } from '@ant-design/icons'
import { TestLayout } from './components/TestLayout'
import { TestElementCard } from './components/TestElementCard'
import { useSchemaTestCommunication, CommunicationMode } from './hooks/useSchemaTestCommunication'

const { Text } = Typography

const MESSAGE_SOURCE = {
  CONTENT: 'schema-element-editor-content',
  HOST: 'schema-element-editor-host',
} as const

/**
 * 预览组件 - 用于 React 渲染方式的预览
 * 包含打开 Modal/Drawer 的按钮，用于测试 z-index 配置
 */
interface PreviewComponentProps {
  schema: any
}

const PreviewComponent: React.FC<PreviewComponentProps> = (props) => {
  const { schema } = props
  const [modalVisible, setModalVisible] = useState(false)
  const [drawerVisible, setDrawerVisible] = useState(false)

  return (
    <div style={{ padding: 16, height: '100%', overflow: 'auto' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Card size="small" title="📊 Schema 数据">
          <pre style={{ margin: 0, fontSize: 12 }}>{JSON.stringify(schema, null, 2)}</pre>
        </Card>

        <Card size="small" title="🔢 z-index 测试">
          <Space>
            <Button type="primary" onClick={() => setModalVisible(true)}>
              打开 Modal
            </Button>
            <Button onClick={() => setDrawerVisible(true)}>打开 Drawer</Button>
          </Space>
          <p style={{ marginTop: 8, color: '#666', fontSize: 12 }}>
            点击按钮测试 Modal/Drawer 能否正常显示在编辑器之上
          </p>
        </Card>
      </Space>

      <Modal
        title="测试 Modal"
        open={modalVisible}
        onOk={() => setModalVisible(false)}
        onCancel={() => setModalVisible(false)}
      >
        <p>如果你能看到这个 Modal，说明 z-index 配置正确</p>
      </Modal>

      <Drawer
        title="测试 Drawer"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        <p>如果你能看到这个 Drawer，说明 z-index 配置正确</p>
      </Drawer>
    </div>
  )
}

/** 初始Schema数据 */
const INITIAL_SCHEMA_STORE: Record<string, any> = {
  'zindex-test': {
    title: 'z-index 配置测试',
    description: '测试编辑器的 z-index 配置，确保页面的 Modal/Drawer 能正常显示',
  },
  'editor-scroll-test': generateLargeData(),
  'params-scroll-test': {
    message: '这是一个用于测试 Params 滚动效果的示例数据',
    description: '工具栏中应该显示多个长参数，并支持水平滚动',
  },
}

/** 生成大量数据用于测试滚动 */
function generateLargeData() {
  const users = []
  for (let i = 1; i <= 100; i++) {
    users.push({
      id: i,
      name: `User ${i}`,
      email: `user${i}@example.com`,
      age: 20 + (i % 50),
    })
  }

  const logs = []
  for (let i = 1; i <= 50; i++) {
    logs.push({
      timestamp: new Date(2024, 0, 1, 10, i).toISOString(),
      level: i % 3 === 0 ? 'ERROR' : i % 2 === 0 ? 'WARN' : 'INFO',
      message: `Log message ${i}`,
    })
  }

  return {
    metadata: {
      title: '编辑器滚动测试',
      description: '包含100个用户对象、50条日志、深层嵌套结构等大量数据',
    },
    users,
    logs,
    nestedStructure: {
      level1: {
        level2: {
          level3: {
            level4: {
              level5: {
                data: 'Deep nested value',
                array: Array.from({ length: 20 }, (_, i) => ({ index: i, value: `Item ${i}` })),
              },
            },
          },
        },
      },
    },
  }
}

interface UIFeaturesTestProps {
  onBack: () => void
}

export const UIFeaturesTest: React.FC<UIFeaturesTestProps> = (props) => {
  const [communicationMode, setCommunicationMode] = useState<CommunicationMode>('postMessage')
  const previewRootRef = useRef<ReactDOM.Root | null>(null)

  /**
   * 渲染 React 预览组件
   */
  const renderPreviewComponent = useCallback((containerId: string, schema: any) => {
    const container = document.getElementById(containerId)
    if (!container) {
      return false
    }

    // 清理之前的 React Root
    if (previewRootRef.current) {
      previewRootRef.current.unmount()
      previewRootRef.current = null
    }

    // 创建新的 React Root 并渲染
    previewRootRef.current = ReactDOM.createRoot(container)
    previewRootRef.current.render(<PreviewComponent schema={schema} />)

    return true
  }, [])

  /**
   * 清理预览组件
   */
  const cleanupPreviewComponent = useCallback(() => {
    if (previewRootRef.current) {
      previewRootRef.current.unmount()
      previewRootRef.current = null
    }
  }, [])

  const { schemaData } = useSchemaTestCommunication({
    initialSchemaStore: INITIAL_SCHEMA_STORE,
    communicationMode,
    renderPreviewComponent,
    cleanupPreviewComponent,
  })

  return (
    <TestLayout
      title="UI 功能测试"
      description="测试编辑器的 UI 相关功能，包括 z-index 配置、滚动支持、预览功能等"
      onBack={props.onBack}
      checklistItems={[
        'z-index 配置正确，预览区域的 Modal/Drawer 能正常显示',
        '编辑器支持垂直滚动，能处理大量数据',
        '工具栏的 Params 区域支持水平滚动',
        '预览功能正常工作',
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

      {/* UI 功能测试 */}
      <div>
        <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 12 }}>
          🎨 UI 功能
        </Text>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <TestElementCard
              id="zindex-test"
              title="z-index 弹窗测试"
              description="开启预览后，点击预览区域的按钮测试 Modal/Drawer 能否正常显示"
              dataId="zindex-test"
              typeTag="UI"
              typeTagColor="magenta"
              schemaData={schemaData['zindex-test']}
            />
          </Col>
          <Col span={12}>
            <TestElementCard
              id="editor-scroll-test"
              title="编辑器滚动测试"
              description="包含100个用户对象、50条日志、深层嵌套结构等大量数据，用于测试编辑器垂直滚动能力"
              dataId="editor-scroll-test"
              typeTag="UI"
              typeTagColor="magenta"
              schemaData={{
                __truncated__: true,
                summary: '大量数据（点击打开编辑器查看完整内容）',
              }}
            />
          </Col>
          <Col span={24}>
            <TestElementCard
              id="params-scroll-test"
              title="Params 滚动测试"
              description="工具栏中显示多个长参数，测试水平滚动功能"
              dataId="very-long-param-name-1,another-long-parameter-value-2,user.profile.settings.theme,data[0].items[*].nested.value,https://api.example.com/v1/users"
              typeTag="UI"
              typeTagColor="magenta"
              schemaData={schemaData['params-scroll-test']}
            />
          </Col>
        </Row>
      </div>
    </TestLayout>
  )
}
