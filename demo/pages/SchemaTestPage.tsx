import React, { useState, useEffect, useRef, useCallback } from 'react'
import ReactDOM from 'react-dom/client'
import {
  Card,
  Button,
  Space,
  Tag,
  Typography,
  Badge,
  Collapse,
  Row,
  Col,
  message,
  Radio,
  Alert,
  Menu,
  Modal,
  Drawer,
} from 'antd'
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  SafetyCertificateOutlined,
  SwapOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DownOutlined,
  UpOutlined,
} from '@ant-design/icons'
import styled from 'styled-components'
import { SIDER_WIDTH, SIDER_COLLAPSED_WIDTH } from '../App'

const { Title, Text, Paragraph } = Typography

/** 通信模式类型 */
type CommunicationMode = 'postMessage' | 'windowFunction'

/** postMessage 模式消息来源标识 */
const MESSAGE_SOURCE = {
  /** 插件端发送的消息 */
  CONTENT: 'schema-element-editor-content',
  /** 宿主端响应的消息 */
  HOST: 'schema-element-editor-host',
} as const

/** 分类导航侧边栏宽度 */
const NAV_SIDER_WIDTH = 180

/** 控制台宽度 */
const CONSOLE_WIDTH = 400

interface SchemaTestPageProps {
  /** App 侧边栏是否折叠 */
  siderCollapsed?: boolean
}

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100%;
`

const NavSider = styled.div<{ $collapsed: boolean; $appSiderCollapsed: boolean }>`
  position: fixed;
  left: ${(props) => (props.$appSiderCollapsed ? SIDER_COLLAPSED_WIDTH : SIDER_WIDTH)}px;
  top: 64px;
  bottom: 0;
  width: ${(props) => (props.$collapsed ? 0 : NAV_SIDER_WIDTH)}px;
  background: #fafafa;
  border-right: 1px solid #f0f0f0;
  transition:
    width 0.2s ease,
    left 0.2s ease;
  overflow: hidden;
  overflow-y: auto;
  z-index: 98;
`

const NavExpandButton = styled(Button)<{ $appSiderCollapsed: boolean }>`
  position: fixed;
  left: ${(props) => (props.$appSiderCollapsed ? SIDER_COLLAPSED_WIDTH + 8 : SIDER_WIDTH + 8)}px;
  top: 72px;
  z-index: 99;
  transition: left 0.2s ease;
`

const NavSiderHeader = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
`

const MainContent = styled.div<{ $navSiderCollapsed: boolean }>`
  flex: 1;
  min-width: 0;
  padding-bottom: 60px;
  margin-left: ${(props) => (props.$navSiderCollapsed ? 0 : NAV_SIDER_WIDTH)}px;
  transition: margin-left 0.2s ease;
`

const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`

const HeaderCard = styled(Card)`
  margin-bottom: 24px;
  background: linear-gradient(135deg, #e6f4ff 0%, #bae0ff 100%);
  border: 1px solid #91caff;
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

const ConsolePanel = styled(Card)<{ $collapsed: boolean; $appSiderCollapsed: boolean }>`
  position: fixed;
  bottom: 0;
  left: ${(props) => (props.$appSiderCollapsed ? SIDER_COLLAPSED_WIDTH : SIDER_WIDTH)}px;
  width: ${CONSOLE_WIDTH}px;
  max-height: ${(props) => (props.$collapsed ? '40px' : '300px')};
  margin: 0;
  border-radius: 0 8px 0 0;
  z-index: 1000;
  box-shadow: 2px -2px 8px rgba(0, 0, 0, 0.1);
  transition:
    max-height 0.2s ease,
    left 0.2s ease;

  .ant-card-head {
    min-height: 40px;
    padding: 0 12px;
    cursor: pointer;
  }

  .ant-card-head-title {
    padding: 8px 0;
  }

  .ant-card-body {
    max-height: 240px;
    overflow-y: auto;
    padding: 12px;
    display: ${(props) => (props.$collapsed ? 'none' : 'block')};
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

const SchemaDisplay = styled.pre`
  background: #fafafa;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 12px;
  margin: 8px 0 0 0;
  max-height: 150px;
  overflow: auto;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 11px;
  line-height: 1.4;
  color: #333;
`

const AttrInfo = styled.div`
  font-family: 'Consolas', 'Monaco', monospace;
  background: #f5f5f5;
  padding: 8px 12px;
  border-radius: 4px;
  margin-top: 8px;
  font-size: 12px;
  color: #595959;
`

const SectionAnchor = styled.div`
  scroll-margin-top: 80px;
`

interface LogEntry {
  type: 'info' | 'success' | 'warn' | 'error'
  message: string
  data?: any
  time: string
}

interface TestElement {
  id: string
  title: string
  description: string
  attrs: Record<string, string>
  schemaKey: string | null
  badge: 'success' | 'error'
  badgeText: string
  typeTag: string | null
}

/**
 * 预览组件 - 用于 React 渲染方式的预览
 * 包含打开 Modal/Drawer 的按钮，用于测试 z-index 配置
 */
interface PreviewComponentProps {
  schema: any
}

const PreviewComponent: React.FC<PreviewComponentProps> = ({ schema }) => {
  const [modalVisible, setModalVisible] = useState(false)
  const [drawerVisible, setDrawerVisible] = useState(false)

  return (
    <div style={{ padding: 16, height: '100%', overflow: 'auto' }}>
      <Space orientation="vertical" style={{ width: '100%' }} size="middle">
        <Card size="small" title="📊 Schema 数据">
          <pre
            style={{
              margin: 0,
              fontSize: 12,
              maxHeight: 200,
              overflow: 'auto',
              background: '#fafafa',
              padding: 8,
              borderRadius: 4,
            }}
          >
            {JSON.stringify(schema, null, 2)}
          </pre>
        </Card>

        <Card size="small" title="🧪 z-index 测试">
          <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 12 }}>
            点击下方按钮测试弹窗是否能正常显示。如果预览模式的 z-index
            配置正确，弹窗应该能正常显示在最顶层。
          </Paragraph>
          <Space>
            <Button type="primary" onClick={() => setModalVisible(true)}>
              打开 Modal
            </Button>
            <Button onClick={() => setDrawerVisible(true)}>打开 Drawer</Button>
          </Space>
        </Card>
      </Space>

      <Modal
        title="测试 Modal"
        open={modalVisible}
        onOk={() => setModalVisible(false)}
        onCancel={() => setModalVisible(false)}
      >
        <p>如果你能看到这个弹窗，说明 z-index 配置正确！</p>
        <p>预览模式下插件的 z-index 应该低于 antd 弹窗的默认值 1000。</p>
      </Modal>

      <Drawer
        title="测试 Drawer"
        placement="right"
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        <p>如果你能看到这个抽屉，说明 z-index 配置正确！</p>
        <p>预览模式下插件的 z-index 应该低于 antd 抽屉的默认值 1000。</p>
      </Drawer>
    </div>
  )
}

/** Schema 数据存储 */
const initialSchemaStore: Record<string, any> = {
  'string-simple': 'Hello World',
  'string-complex': 'This is a complex string with special chars: !@#$%^&*()',
  'number-int': 42,
  'number-float': 3.14159,
  'number-negative': -100,
  'object-simple': { name: 'Test Object', value: 123 },
  'object-nested': {
    user: { id: 1, name: 'Alice', profile: { age: 25, city: 'Beijing' } },
    settings: { theme: 'dark', notifications: true },
  },
  'array-numbers': [1, 2, 3, 4, 5],
  'array-strings': ['apple', 'banana', 'cherry'],
  'array-objects': [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
  ],
  'user-001,profile-001': {
    userId: 'user-001',
    profileId: 'profile-001',
    data: { username: 'alice', email: 'alice@example.com', age: 28 },
  },
  'boolean-true': true,
  'boolean-false': false,
  'recording-test': '"初始内容"',
  // JSON 修复测试用例（故意使用错误格式的字符串）
  'json-repair-missing-colon': '{"name" "Alice", "age": 25}',
  'json-repair-missing-quotes': '{name: "Alice", age: 25}',
  'json-repair-trailing-comma': '{"name": "Alice", "age": 25,}',
  'json-repair-incomplete': '{"name": "Alice", "items": [1, 2, 3',
  'json-repair-single-quotes': "{'name': 'Alice', 'age': 25}",
  'json-repair-sse-data':
    '[{"componentPath":"WhiteBox","componentProps":{"data":"工具接口: PolicyToolsFacade.queryAgentMarketingStrategy\\n 策略生成失败","duration":"67073835","iconType":"icon-search3","resultStatus":"error","title":"查询智能策略工具调用失败"}}]\n',
  'very-long-param-name-1,another-long-parameter-value-2,user.profile.settings.theme,data[0].items[*].nested.value,https://api.example.com/v1/users':
    {
      message: '这是一个用于测试 Params 滚动效果的示例数据',
      description: '工具栏中应该显示多个长参数，并支持水平滚动',
    },
  'zindex-test': {
    title: 'z-index 配置测试',
    description: '用于验证预览模式下弹窗能否正常显示',
  },
}

const testElements: TestElement[] = [
  {
    id: 'string-simple',
    title: 'String - 简单字符串',
    description: '单参数测试，schema为简单字符串',
    attrs: { 'data-id': 'string-simple' },
    schemaKey: 'string-simple',
    badge: 'success',
    badgeText: '有效',
    typeTag: 'String',
  },
  {
    id: 'string-complex',
    title: 'String - 复杂字符串',
    description: '包含特殊字符的字符串',
    attrs: { 'data-id': 'string-complex' },
    schemaKey: 'string-complex',
    badge: 'success',
    badgeText: '有效',
    typeTag: 'String',
  },
  {
    id: 'number-int',
    title: 'Number - 整数',
    description: '单参数测试，schema为整数',
    attrs: { 'data-id': 'number-int' },
    schemaKey: 'number-int',
    badge: 'success',
    badgeText: '有效',
    typeTag: 'Number',
  },
  {
    id: 'number-float',
    title: 'Number - 浮点数',
    description: '单参数测试，schema为浮点数',
    attrs: { 'data-id': 'number-float' },
    schemaKey: 'number-float',
    badge: 'success',
    badgeText: '有效',
    typeTag: 'Number',
  },
  {
    id: 'object-simple',
    title: 'Object - 简单对象',
    description: '单参数测试，schema为简单对象',
    attrs: { 'data-id': 'object-simple' },
    schemaKey: 'object-simple',
    badge: 'success',
    badgeText: '有效',
    typeTag: 'Object',
  },
  {
    id: 'object-nested',
    title: 'Object - 嵌套对象',
    description: '单参数测试，schema为复杂嵌套对象',
    attrs: { 'data-id': 'object-nested' },
    schemaKey: 'object-nested',
    badge: 'success',
    badgeText: '有效',
    typeTag: 'Object',
  },
  {
    id: 'array-numbers',
    title: 'Array - 数字数组',
    description: '单参数测试，schema为数字数组',
    attrs: { 'data-id': 'array-numbers' },
    schemaKey: 'array-numbers',
    badge: 'success',
    badgeText: '有效',
    typeTag: 'Array',
  },
  {
    id: 'array-strings',
    title: 'Array - 字符串数组',
    description: '单参数测试，schema为字符串数组',
    attrs: { 'data-id': 'array-strings' },
    schemaKey: 'array-strings',
    badge: 'success',
    badgeText: '有效',
    typeTag: 'Array',
  },
  {
    id: 'array-objects',
    title: 'Array - 对象数组',
    description: '单参数测试，schema为对象数组',
    attrs: { 'data-id': 'array-objects' },
    schemaKey: 'array-objects',
    badge: 'success',
    badgeText: '有效',
    typeTag: 'Array',
  },
  {
    id: 'multi-params',
    title: '多参数测试',
    description: '包含user-001和profile-001两个参数',
    attrs: { 'data-id': 'user-001,profile-001' },
    schemaKey: 'user-001,profile-001',
    badge: 'success',
    badgeText: '有效',
    typeTag: 'Object',
  },
  {
    id: 'boolean-true',
    title: 'Boolean - true',
    description: '单参数测试，schema为true',
    attrs: { 'data-id': 'boolean-true' },
    schemaKey: 'boolean-true',
    badge: 'success',
    badgeText: '有效',
    typeTag: 'Boolean',
  },
  {
    id: 'boolean-false',
    title: 'Boolean - false',
    description: '单参数测试，schema为false',
    attrs: { 'data-id': 'boolean-false' },
    schemaKey: 'boolean-false',
    badge: 'success',
    badgeText: '有效',
    typeTag: 'Boolean',
  },
  {
    id: 'recording-test',
    title: '🎬 录制模式测试',
    description: '点击开始后schema会持续变化，用于测试录制功能',
    attrs: { 'data-id': 'recording-test' },
    schemaKey: 'recording-test',
    badge: 'success',
    badgeText: '有效',
    typeTag: 'Recording',
  },
  // JSON 修复测试用例
  {
    id: 'json-repair-missing-colon',
    title: '🔧 缺少冒号',
    description: '{"name" "Alice"} - 键值对之间缺少冒号，测试定位错误和修复功能',
    attrs: { 'data-id': 'json-repair-missing-colon' },
    schemaKey: 'json-repair-missing-colon',
    badge: 'error',
    badgeText: '错误JSON',
    typeTag: 'JsonRepair',
  },
  {
    id: 'json-repair-missing-quotes',
    title: '🔧 缺少引号',
    description: '{name: "Alice"} - 键名缺少引号，JavaScript对象字面量风格',
    attrs: { 'data-id': 'json-repair-missing-quotes' },
    schemaKey: 'json-repair-missing-quotes',
    badge: 'error',
    badgeText: '错误JSON',
    typeTag: 'JsonRepair',
  },
  {
    id: 'json-repair-trailing-comma',
    title: '🔧 尾随逗号',
    description: '{"name": "Alice",} - 对象末尾有多余逗号',
    attrs: { 'data-id': 'json-repair-trailing-comma' },
    schemaKey: 'json-repair-trailing-comma',
    badge: 'error',
    badgeText: '错误JSON',
    typeTag: 'JsonRepair',
  },
  {
    id: 'json-repair-incomplete',
    title: '🔧 不完整JSON',
    description: '{"items": [1, 2, 3 - 缺少结束括号，模拟SSE传输中断',
    attrs: { 'data-id': 'json-repair-incomplete' },
    schemaKey: 'json-repair-incomplete',
    badge: 'error',
    badgeText: '错误JSON',
    typeTag: 'JsonRepair',
  },
  {
    id: 'json-repair-single-quotes',
    title: '🔧 单引号',
    description: "{'name': 'Alice'} - 使用单引号而非双引号",
    attrs: { 'data-id': 'json-repair-single-quotes' },
    schemaKey: 'json-repair-single-quotes',
    badge: 'error',
    badgeText: '错误JSON',
    typeTag: 'JsonRepair',
  },
  {
    id: 'json-repair-sse-data',
    title: '🔧 SSE流式数据',
    description: '模拟真实SSE传输的数据，可能包含转义字符和特殊格式',
    attrs: { 'data-id': 'json-repair-sse-data' },
    schemaKey: 'json-repair-sse-data',
    badge: 'error',
    badgeText: '错误JSON',
    typeTag: 'JsonRepair',
  },
  {
    id: 'params-scroll-test',
    title: '📜 Params 滚动测试',
    description: '测试工具栏中多个长参数的水平滚动效果和渐变遮罩',
    attrs: {
      'data-id':
        'very-long-param-name-1,another-long-parameter-value-2,user.profile.settings.theme,data[0].items[*].nested.value,https://api.example.com/v1/users',
    },
    schemaKey:
      'very-long-param-name-1,another-long-parameter-value-2,user.profile.settings.theme,data[0].items[*].nested.value,https://api.example.com/v1/users',
    badge: 'success',
    badgeText: '有效',
    typeTag: 'UI',
  },
  {
    id: 'zindex-test',
    title: '🔢 z-index 弹窗测试',
    description: '开启预览后，点击预览区域的按钮测试 Modal/Drawer 能否正常显示',
    attrs: { 'data-id': 'zindex-test' },
    schemaKey: 'zindex-test',
    badge: 'success',
    badgeText: '有效',
    typeTag: 'UI',
  },
  {
    id: 'invalid-null',
    title: '无效元素测试',
    description: '不包含任何data-id属性，应显示"非法目标"',
    attrs: {},
    schemaKey: null,
    badge: 'error',
    badgeText: '非法',
    typeTag: null,
  },
]

/** 分组配置 */
const GROUP_CONFIG = {
  'string-number': { key: 'string-number', label: 'String / Number', icon: '📝' },
  'object-array': { key: 'object-array', label: 'Object / Array', icon: '📦' },
  boolean: { key: 'boolean', label: 'Boolean', icon: '✓' },
  recording: { key: 'recording', label: 'Recording', icon: '🎬' },
  'json-repair': { key: 'json-repair', label: 'JSON 修复', icon: '🔧' },
  ui: { key: 'ui', label: 'UI 测试', icon: '🎨' },
  invalid: { key: 'invalid', label: '无效元素', icon: '⚠️' },
} as const

export const SchemaTestPage: React.FC<SchemaTestPageProps> = (props) => {
  const { siderCollapsed: appSiderCollapsed = false } = props
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [schemaData, setSchemaData] = useState<Record<string, any>>({})
  const [isRecording, setIsRecording] = useState(false)
  const [communicationMode, setCommunicationMode] = useState<CommunicationMode>('postMessage')
  const [navSiderCollapsed, setNavSiderCollapsed] = useState(false)
  const [consoleCollapsed, setConsoleCollapsed] = useState(true)
  const schemaStoreRef = useRef({ ...initialSchemaStore })
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const recordingCountRef = useRef(0)
  const previewRootRef = useRef<ReactDOM.Root | null>(null)

  const addLog = useCallback((type: LogEntry['type'], logMessage: string, data?: any) => {
    const log: LogEntry = {
      type,
      message: logMessage,
      data,
      time: new Date().toLocaleTimeString(),
    }
    setLogs((prev) => [...prev.slice(-30), log])
  }, [])

  /**
   * 渲染 React 预览组件
   */
  const renderPreviewComponent = useCallback(
    (containerId: string, schema: any) => {
      const container = document.getElementById(containerId)
      if (!container) {
        addLog('error', '❌ 预览容器不存在', { containerId })
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

      addLog('success', '✅ React 预览渲染完成')
      return true
    },
    [addLog]
  )

  /**
   * 清理预览组件
   */
  const cleanupPreviewComponent = useCallback(() => {
    if (previewRootRef.current) {
      previewRootRef.current.unmount()
      previewRootRef.current = null
      addLog('info', '🧹 预览组件已清理')
    }
  }, [addLog])

  /**
   * 处理 Schema 请求的核心逻辑（两种模式共用）
   */
  const handleRequest = useCallback(
    (type: string, payload: any): any => {
      let result: any

      switch (type) {
        case 'GET_SCHEMA': {
          const params = payload.params
          addLog('info', '🔍 收到 GET_SCHEMA 请求', { params })

          const schema = schemaStoreRef.current[params]

          if (schema !== undefined) {
            addLog('success', '✅ 返回 Schema 数据', schema)
            result = { success: true, data: schema }
          } else {
            const defaultSchema = {
              error: 'Schema not found',
              params: params,
              message: '未找到对应的Schema数据',
            }
            addLog('warn', '⚠️ 未找到Schema，返回默认值', defaultSchema)
            result = { success: true, data: defaultSchema }
          }
          break
        }

        case 'UPDATE_SCHEMA': {
          const { schema, params } = payload
          addLog('info', '💾 收到 UPDATE_SCHEMA 请求', { schema, params })

          try {
            if (schema === null || schema === undefined) {
              throw new Error('Schema 数据不能为空')
            }

            schemaStoreRef.current[params] = schema
            setSchemaData({ ...schemaStoreRef.current })

            addLog('success', '✅ Schema 更新成功', { params, newValue: schema })
            result = { success: true }
          } catch (error: any) {
            addLog('error', '❌ Schema 更新失败', { error: error.message })
            result = { success: false, error: error.message }
          }
          break
        }

        case 'CHECK_PREVIEW': {
          addLog('info', '🔍 收到 CHECK_PREVIEW 请求')
          result = { exists: true }
          addLog('success', '✅ 预览功能可用')
          break
        }

        case 'RENDER_PREVIEW': {
          const { schema, containerId } = payload
          addLog('info', '🎨 收到 RENDER_PREVIEW 请求', { schema, containerId })

          const success = renderPreviewComponent(containerId, schema)
          result = { success }
          break
        }

        case 'CLEANUP_PREVIEW': {
          addLog('info', '🧹 收到 CLEANUP_PREVIEW 请求')
          cleanupPreviewComponent()
          result = { success: true }
          break
        }

        default:
          addLog('warn', '⚠️ 未知的请求类型', { type })
          result = { success: false, error: `未知的请求类型: ${type}` }
      }

      return result
    },
    [addLog, renderPreviewComponent, cleanupPreviewComponent]
  )

  /**
   * 注册 postMessage 模式监听器
   */
  useEffect(() => {
    setSchemaData({ ...schemaStoreRef.current })

    if (communicationMode !== 'postMessage') return

    const handlePostMessage = (event: MessageEvent) => {
      // 只处理来自当前窗口的消息
      if (event.source !== window) return
      // 只处理来自插件的消息
      if (!event.data || event.data.source !== MESSAGE_SOURCE.CONTENT) return

      const { type, payload, requestId } = event.data
      const result = handleRequest(type, payload)

      // 发送响应（必须携带 requestId）
      window.postMessage(
        {
          source: MESSAGE_SOURCE.HOST,
          requestId,
          ...result,
        },
        '*'
      )
    }

    window.addEventListener('message', handlePostMessage)
    addLog('info', '🚀 postMessage 模式已启用', {
      receive: `source: ${MESSAGE_SOURCE.CONTENT}`,
      respond: `source: ${MESSAGE_SOURCE.HOST}`,
    })

    return () => {
      window.removeEventListener('message', handlePostMessage)
    }
  }, [communicationMode, handleRequest, addLog])

  /**
   * 注册 windowFunction 模式的全局函数
   */
  useEffect(() => {
    if (communicationMode !== 'windowFunction') {
      // 清理全局函数
      delete (window as any).__getContentById
      delete (window as any).__updateContentById
      delete (window as any).__getContentPreview
      return
    }

    // 注册全局函数
    ;(window as any).__getContentById = (params: string) => {
      addLog('info', '🔍 调用 __getContentById', { params })
      const schema = schemaStoreRef.current[params]
      if (schema !== undefined) {
        addLog('success', '✅ 返回 Schema 数据', schema)
        return schema
      }
      const defaultSchema = { error: 'Schema not found', params }
      addLog('warn', '⚠️ 未找到Schema，返回默认值', defaultSchema)
      return defaultSchema
    }
    ;(window as any).__updateContentById = (schema: any, params: string) => {
      addLog('info', '💾 调用 __updateContentById', { schema, params })
      try {
        if (schema === null || schema === undefined) {
          throw new Error('Schema 数据不能为空')
        }
        schemaStoreRef.current[params] = schema
        setSchemaData({ ...schemaStoreRef.current })
        addLog('success', '✅ Schema 更新成功', { params, newValue: schema })
        return true
      } catch (error: any) {
        addLog('error', '❌ Schema 更新失败', { error: error.message })
        return false
      }
    }
    ;(window as any).__getContentPreview = (data: any, containerId: string) => {
      addLog('info', '🎨 调用 __getContentPreview', { data, containerId })
      renderPreviewComponent(containerId, data)
      return () => {
        addLog('info', '🧹 预览清理函数被调用')
        cleanupPreviewComponent()
      }
    }

    addLog('info', '🚀 windowFunction 模式已启用', {
      functions: ['__getContentById', '__updateContentById', '__getContentPreview'],
    })

    return () => {
      delete (window as any).__getContentById
      delete (window as any).__updateContentById
      delete (window as any).__getContentPreview
    }
  }, [communicationMode, addLog, renderPreviewComponent, cleanupPreviewComponent])

  /**
   * 切换通信模式
   */
  const handleModeChange = (mode: CommunicationMode) => {
    setCommunicationMode(mode)
    setLogs([]) // 清空日志
    message.success(`已切换到 ${mode === 'postMessage' ? 'postMessage 直连' : 'Window 函数'} 模式`)
  }

  const startRecordingTest = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
    }

    recordingCountRef.current = 0
    const startTime = Date.now()

    schemaStoreRef.current['recording-test'] = JSON.stringify('开始录制测试 - 时间: 0ms')
    setSchemaData({ ...schemaStoreRef.current })
    setIsRecording(true)

    addLog('info', '🎬 开始录制模式测试', { duration: '10秒', interval: '100ms' })

    recordingTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      recordingCountRef.current++

      const lines = [
        `录制模式测试 - 已运行 ${elapsed}ms`,
        `更新次数: ${recordingCountRef.current}`,
        '',
        '---',
      ]

      for (let i = 1; i <= Math.min(recordingCountRef.current, 10); i++) {
        lines.push(`数据行 ${i}: 内容_${i * 100}ms`)
      }

      const newContent = lines.join('\n')
      schemaStoreRef.current['recording-test'] = JSON.stringify(newContent)
      setSchemaData({ ...schemaStoreRef.current })

      if (elapsed >= 10000) {
        clearInterval(recordingTimerRef.current!)
        recordingTimerRef.current = null
        setIsRecording(false)

        const finalLines = [...lines, '', '---', '', '✅ 录制测试完成！']
        schemaStoreRef.current['recording-test'] = JSON.stringify(finalLines.join('\n'))
        setSchemaData({ ...schemaStoreRef.current })

        addLog('success', '✅ 录制模式测试完成', {
          totalUpdates: recordingCountRef.current,
          duration: `${elapsed}ms`,
        })
      }
    }, 100)
  }

  const stopRecordingTest = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
      setIsRecording(false)
      addLog('info', '⏹️ 录制模式测试已手动停止')
    }
  }

  const verifyAttributes = () => {
    let successCount = 0
    let failCount = 0

    testElements.forEach((elem) => {
      const domElem = document.getElementById(elem.id)
      if (domElem) {
        const hasExpectedAttrs = Object.keys(elem.attrs).length > 0
        const actualValue = domElem.getAttribute('data-id')

        const isCorrect =
          (!elem.attrs['data-id'] && !actualValue) || actualValue === elem.attrs['data-id']

        if (hasExpectedAttrs && isCorrect) {
          successCount++
        } else if (hasExpectedAttrs && !isCorrect) {
          failCount++
        }
      }
    })

    if (failCount > 0) {
      message.warning(`发现 ${failCount} 个元素属性不正确`)
    } else {
      message.success(`所有 ${successCount} 个元素属性验证通过！`)
    }
  }

  const getTypeColor = (typeTag: string | null) => {
    switch (typeTag) {
      case 'String':
        return 'orange'
      case 'Number':
        return 'blue'
      case 'Object':
        return 'green'
      case 'Array':
        return 'purple'
      case 'Boolean':
        return 'cyan'
      case 'Recording':
        return 'red'
      case 'JsonRepair':
        return 'volcano'
      case 'UI':
        return 'magenta'
      default:
        return 'default'
    }
  }

  const groupedElements = {
    'string-number': testElements.filter((e) => ['String', 'Number'].includes(e.typeTag || '')),
    'object-array': testElements.filter((e) => ['Object', 'Array'].includes(e.typeTag || '')),
    boolean: testElements.filter((e) => e.typeTag === 'Boolean'),
    recording: testElements.filter((e) => e.typeTag === 'Recording'),
    'json-repair': testElements.filter((e) => e.typeTag === 'JsonRepair'),
    ui: testElements.filter((e) => e.typeTag === 'UI'),
    invalid: testElements.filter((e) => !e.typeTag),
  }

  const scrollToSection = (key: string) => {
    const element = document.getElementById(`section-${key}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const menuItems = Object.entries(GROUP_CONFIG).map(([key, config]) => ({
    key,
    label: `${config.icon} ${config.label}`,
    onClick: () => scrollToSection(key),
  }))

  return (
    <LayoutContainer>
      {/* 分类导航侧边栏 */}
      <NavSider $collapsed={navSiderCollapsed} $appSiderCollapsed={appSiderCollapsed}>
        <NavSiderHeader>
          <Text strong>测试分类</Text>
          <Button
            size="small"
            icon={<MenuFoldOutlined />}
            onClick={() => setNavSiderCollapsed(true)}
          />
        </NavSiderHeader>
        <Menu
          mode="inline"
          items={menuItems}
          style={{ border: 'none', background: 'transparent' }}
        />
      </NavSider>

      {/* 分类展开按钮 - 固定定位 */}
      {navSiderCollapsed && (
        <NavExpandButton
          $appSiderCollapsed={appSiderCollapsed}
          icon={<MenuUnfoldOutlined />}
          onClick={() => setNavSiderCollapsed(false)}
        >
          显示分类
        </NavExpandButton>
      )}

      {/* 主内容区 */}
      <MainContent $navSiderCollapsed={navSiderCollapsed}>
        <PageContainer>
          <HeaderCard>
            <Row justify="space-between" align="middle">
              <Col>
                <Title level={3} style={{ color: '#0958d9', margin: 0 }}>
                  🔧 Schema Element Editor 功能测试
                </Title>
              </Col>
              <Col>
                <Space>
                  <SwapOutlined style={{ color: '#1677ff' }} />
                  <Text strong style={{ color: '#1677ff' }}>
                    通信模式：
                  </Text>
                  <Radio.Group
                    value={communicationMode}
                    onChange={(e) => handleModeChange(e.target.value)}
                    optionType="button"
                    buttonStyle="solid"
                  >
                    <Radio.Button value="postMessage">postMessage 直连</Radio.Button>
                    <Radio.Button value="windowFunction">Window 函数</Radio.Button>
                  </Radio.Group>
                </Space>
              </Col>
            </Row>

            <Alert
              style={{ marginTop: 16 }}
              type={communicationMode === 'postMessage' ? 'info' : 'warning'}
              showIcon
              message={
                communicationMode === 'postMessage'
                  ? '📡 postMessage 直连模式（推荐）'
                  : '⚠️ Window 函数模式（已废弃）'
              }
              description={
                communicationMode === 'postMessage'
                  ? `监听 source: ${MESSAGE_SOURCE.CONTENT} → 响应 source: ${MESSAGE_SOURCE.HOST}`
                  : '暴露 __getContentById / __updateContentById / __getContentPreview'
              }
            />

            <Space style={{ marginTop: 16 }}>
              <Button icon={<SafetyCertificateOutlined />} onClick={verifyAttributes}>
                验证元素属性
              </Button>
            </Space>
            <Paragraph style={{ color: '#595959', margin: '16px 0 0 0', fontSize: 13 }}>
              💡 使用说明：按住 <Text keyboard>Alt/Option</Text>{' '}
              并将鼠标悬停在测试元素上，观察高亮效果；按住 <Text keyboard>Alt/Option</Text>{' '}
              并点击有效元素打开抽屉
            </Paragraph>
          </HeaderCard>

          <Collapse
            defaultActiveKey={Object.keys(GROUP_CONFIG)}
            items={Object.entries(groupedElements).map(([groupKey, elements]) => {
              const config = GROUP_CONFIG[groupKey as keyof typeof GROUP_CONFIG]
              return {
                key: groupKey,
                label: (
                  <SectionAnchor id={`section-${groupKey}`}>
                    <Text strong>
                      {config.icon} {config.label} 类型测试
                    </Text>
                  </SectionAnchor>
                ),
                children: (
                  <Row gutter={[16, 16]}>
                    {elements.map((elem) => (
                      <Col span={elem.typeTag === 'Recording' ? 24 : 12} key={elem.id}>
                        <TestCard
                          id={elem.id}
                          $isValid={elem.badge === 'success'}
                          size="small"
                          {...(elem.attrs['data-id'] ? { 'data-id': elem.attrs['data-id'] } : {})}
                          {...(elem.attrs['data-schema-params']
                            ? { 'data-schema-params': elem.attrs['data-schema-params'] }
                            : {})}
                        >
                          <Space style={{ marginBottom: 8 }}>
                            <Badge
                              status={elem.badge === 'success' ? 'success' : 'error'}
                              text={elem.badgeText}
                            />
                            <Text strong>{elem.title}</Text>
                            {elem.typeTag && (
                              <Tag color={getTypeColor(elem.typeTag)}>{elem.typeTag}</Tag>
                            )}
                          </Space>
                          <Paragraph type="secondary" style={{ margin: '4px 0 0 0', fontSize: 13 }}>
                            {elem.description}
                          </Paragraph>

                          {elem.typeTag === 'Recording' && (
                            <Space style={{ marginTop: 12 }}>
                              <Button
                                type="primary"
                                danger
                                icon={<PlayCircleOutlined />}
                                onClick={startRecordingTest}
                                disabled={isRecording}
                              >
                                开始测试
                              </Button>
                              <Button
                                icon={<PauseCircleOutlined />}
                                onClick={stopRecordingTest}
                                disabled={!isRecording}
                              >
                                停止测试
                              </Button>
                              {isRecording && <Tag color="processing">录制中...</Tag>}
                            </Space>
                          )}

                          {Object.keys(elem.attrs).length > 0 && (
                            <AttrInfo>data-id: "{elem.attrs['data-id']}"</AttrInfo>
                          )}

                          {elem.schemaKey && schemaData[elem.schemaKey] !== undefined && (
                            <SchemaDisplay>
                              {typeof schemaData[elem.schemaKey] === 'string'
                                ? schemaData[elem.schemaKey]
                                : JSON.stringify(schemaData[elem.schemaKey], null, 2)}
                            </SchemaDisplay>
                          )}
                        </TestCard>
                      </Col>
                    ))}
                  </Row>
                ),
              }
            })}
          />
        </PageContainer>
      </MainContent>

      {/* 控制台 - 左下角 */}
      <ConsolePanel
        $collapsed={consoleCollapsed}
        $appSiderCollapsed={appSiderCollapsed}
        title={
          <Space onClick={() => setConsoleCollapsed(!consoleCollapsed)}>
            {consoleCollapsed ? <UpOutlined /> : <DownOutlined />}
            <span>📋 控制台输出</span>
          </Space>
        }
        size="small"
        extra={<Tag>{logs.length} 条日志</Tag>}
      >
        {logs.length === 0 ? (
          <Text type="secondary">等待插件操作...</Text>
        ) : (
          logs.map((log, index) => (
            <LogItem key={index} $type={log.type}>
              [{log.time}] {log.message}
              {log.data && (
                <pre style={{ margin: '4px 0 0 12px', fontSize: 11, opacity: 0.8 }}>
                  {JSON.stringify(log.data, null, 2)}
                </pre>
              )}
            </LogItem>
          ))
        )}
      </ConsolePanel>
    </LayoutContainer>
  )
}
