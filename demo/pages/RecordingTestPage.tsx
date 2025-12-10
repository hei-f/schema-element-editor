import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { Card, InputNumber, Switch, Typography, Tag, Divider, Alert, Button, Space } from 'antd'
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  ThunderboltOutlined,
  SyncOutlined,
} from '@ant-design/icons'
import { useSchemaElementEditor } from '@schema-element-editor/host-sdk'
import { useLatest } from '@/shared/hooks/useLatest'

const { Title, Text, Paragraph } = Typography

/** 页面容器 */
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
`

/** 控制面板 */
const ControlPanel = styled(Card)`
  .ant-card-head-title {
    font-size: 16px;
    font-weight: 600;
  }
`

/** 数据预览区域 */
const DataPreview = styled(Card)`
  .preview-content {
    font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
    font-size: 13px;
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 16px;
    border-radius: 6px;
    max-height: 300px;
    overflow-y: auto;
    white-space: pre-wrap;
    word-break: break-all;
  }
`

/** 状态栏 */
const StatusBar = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: #fafafa;
  border-radius: 6px;
  margin-bottom: 16px;
`

/** 统计信息 */
const StatsItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  .label {
    font-size: 12px;
    color: #888;
  }

  .value {
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }
`

/** 控制项行 */
const ControlRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;

  .label {
    min-width: 100px;
    color: #666;
  }
`

/** 随机生成 SSE 数据块 */
const generateRandomChunk = (): string => {
  const chunks = [
    '正在思考...',
    '让我分析一下...',
    '这是一个很好的问题。',
    '根据我的理解，',
    '首先需要明确的是，',
    '从技术角度来看，',
    '值得注意的是，',
    '另外需要考虑的是，',
    '综合以上分析，',
    '总结来说，',
    '希望这能帮到你！',
    '\n\n',
    '接下来，',
    '然后，',
    '此外，',
    '最后，',
    '1. ',
    '2. ',
    '3. ',
    '- ',
    '* ',
    '```javascript\n',
    '```\n',
    'const ',
    'function ',
    'return ',
    '// ',
    '/* ',
    ' */',
    ' = ',
    ';\n',
    '{\n',
    '}\n',
    '(\n',
    ')\n',
  ]
  return chunks[Math.floor(Math.random() * chunks.length)]
}

interface RecordingTestPageProps {
  siderCollapsed: boolean
}

export const RecordingTestPage: React.FC<RecordingTestPageProps> = () => {
  /** SSE 模拟状态 */
  const [isRecordingActive, setIsRecordingActive] = useState(false)
  const [streamContent, setStreamContent] = useState('')

  /** 推送间隔（毫秒） */
  const [pushInterval, setPushInterval] = useState(100)

  /** 是否启用随机延迟 */
  const [enableRandomDelay, setEnableRandomDelay] = useState(true)

  /** 统计数据 */
  const [stats, setStats] = useState({
    pushCount: 0,
    lastPushTime: 0,
  })

  /** Refs */
  const streamTimerRef = useRef<number | null>(null)
  const streamContentRef = useLatest(streamContent)
  /** 存储 pushSchema 函数的 ref（用于避免循环依赖） */
  const pushSchemaRef = useRef<typeof recording.push | null>(null)

  /** 当前模拟的 params（对应 data-id） */
  const DATA_ID = 'recording-test'

  /** 使用 SDK 接入插件 */
  const { recording } = useSchemaElementEditor({
    getSchema: (): string => {
      return streamContentRef.current
    },

    updateSchema: (schema: unknown): boolean => {
      setStreamContent(typeof schema === 'string' ? schema : JSON.stringify(schema))
      return true
    },
  })

  /** 开始 SSE 模拟 */
  const startSSESimulation = () => {
    if (isRecordingActive) return
    setStreamContent('')
    setStats({ pushCount: 0, lastPushTime: 0 })
    setIsRecordingActive(true)
  }

  /** 停止 SSE 模拟 */
  const stopSSESimulation = () => {
    if (streamTimerRef.current) {
      clearTimeout(streamTimerRef.current)
      streamTimerRef.current = null
    }
    setIsRecordingActive(false)
  }

  // 更新 recording.push ref（在 effect 中更新以避免渲染期间修改 ref）
  useEffect(() => {
    pushSchemaRef.current = recording.push
  }, [recording.push])

  /**
   * SSE 模拟逻辑
   * 当 isRecordingActive 为 true 时开始推送数据
   */
  useEffect(() => {
    if (!isRecordingActive) return

    const pushNextChunk = () => {
      const chunk = generateRandomChunk()
      const newContent = streamContentRef.current + chunk
      setStreamContent(newContent)

      // 推送数据给插件（数据变化时调用 pushSchema）
      pushSchemaRef.current?.(DATA_ID, newContent)

      setStats((prev) => ({
        pushCount: prev.pushCount + 1,
        lastPushTime: Date.now(),
      }))

      // 计算下一次推送的延迟
      const baseDelay = pushInterval
      const delay = enableRandomDelay ? baseDelay + Math.random() * baseDelay : baseDelay

      streamTimerRef.current = window.setTimeout(pushNextChunk, delay)
    }

    // 开始推送
    pushNextChunk()

    // 清理函数
    return () => {
      if (streamTimerRef.current) {
        clearTimeout(streamTimerRef.current)
        streamTimerRef.current = null
      }
    }
  }, [isRecordingActive, pushInterval, enableRandomDelay, streamContentRef])

  return (
    <PageContainer>
      <Title level={3}>
        <ThunderboltOutlined style={{ marginRight: 8 }} />
        录制模式测试（事件驱动）
      </Title>

      <Alert
        message="简化的录制模式 API"
        description={
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            <li>
              SDK 只需配置 <Text code>getSchema</Text> 和 <Text code>updateSchema</Text>
            </li>
            <li>
              数据变化时调用 <Text code>pushSchema(params, data)</Text> 推送给插件
            </li>
            <li>录制开始/停止由 SDK 自动响应，无需配置回调</li>
          </ol>
        }
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      {/* 状态栏 */}
      <StatusBar>
        <Space>
          <Button
            type={isRecordingActive ? 'default' : 'primary'}
            icon={<PlayCircleOutlined />}
            onClick={startSSESimulation}
            disabled={isRecordingActive}
          >
            开始模拟 SSE
          </Button>
          <Button
            danger
            icon={<PauseCircleOutlined />}
            onClick={stopSSESimulation}
            disabled={!isRecordingActive}
          >
            停止模拟
          </Button>
        </Space>
        <Tag
          color={isRecordingActive ? 'processing' : 'default'}
          icon={isRecordingActive ? <SyncOutlined spin /> : null}
        >
          {isRecordingActive ? 'SSE 数据推送中' : '已停止'}
        </Tag>
        <StatsItem>
          <span className="label">推送次数</span>
          <span className="value">{stats.pushCount}</span>
        </StatsItem>
        <StatsItem>
          <span className="label">数据长度</span>
          <span className="value">{streamContent.length} 字符</span>
        </StatsItem>
      </StatusBar>

      {/* 控制面板 */}
      <ControlPanel
        title="模拟参数配置"
        extra={
          isRecordingActive ? (
            <Tag color="green" icon={<PlayCircleOutlined />}>
              数据持续推送中
            </Tag>
          ) : (
            <Tag color="default" icon={<PauseCircleOutlined />}>
              等待录制
            </Tag>
          )
        }
      >
        <ControlRow>
          <span className="label">推送间隔：</span>
          <InputNumber
            value={pushInterval}
            onChange={(v) => setPushInterval(v ?? 100)}
            min={50}
            max={2000}
            step={50}
            addonAfter="ms"
            disabled={isRecordingActive}
            style={{ width: 150 }}
          />
          <Text type="secondary">模拟 SSE 数据块之间的间隔</Text>
        </ControlRow>

        <ControlRow>
          <span className="label">随机延迟：</span>
          <Switch
            checked={enableRandomDelay}
            onChange={setEnableRandomDelay}
            disabled={isRecordingActive}
          />
          <Text type="secondary">启用后会在基础间隔上增加 0~100% 的随机延迟</Text>
        </ControlRow>

        <Divider />

        <Paragraph>
          <Text strong>测试步骤：</Text>
        </Paragraph>
        <ol style={{ color: '#666', paddingLeft: 20 }}>
          <li>配置推送间隔和随机延迟参数</li>
          <li>
            使用插件进入<Text code>录制模式</Text>（Alt + R）
          </li>
          <li>点击本页面带有 data-id 的元素</li>
          <li>插件会自动发送开始录制指令，宿主开始推送数据</li>
          <li>观察插件录制面板的版本历史更新情况</li>
          <li>点击插件的「停止录制」按钮，宿主自动停止推送</li>
        </ol>
      </ControlPanel>

      {/* 数据预览 */}
      <DataPreview title="实时数据预览" extra={<Tag>data-id="recording-test"</Tag>}>
        <div className="preview-content" data-id="recording-test">
          {streamContent || '（等待插件触发录制...）'}
        </div>
      </DataPreview>

      {/* SDK 接入示例 */}
      <Card title="宿主接入示例（使用 SDK）" size="small">
        <pre
          style={{
            background: '#f5f5f5',
            padding: 16,
            borderRadius: 6,
            overflow: 'auto',
            fontSize: 13,
          }}
        >
          {`import { useSchemaElementEditor } from '@schema-element-editor/host-sdk'

// 最简配置：只需 getSchema 和 updateSchema
const { recording } = useSchemaElementEditor({
  getSchema: (params) => dataStore[params],
  updateSchema: (schema, params) => {
    dataStore[params] = schema
    return true
  },
})

// 数据变化时调用 recording.push 推送数据（录制功能自动可用）
sseHandler.onData = (params, data) => {
  recording.push(params, data)
}`}
        </pre>
      </Card>
    </PageContainer>
  )
}
