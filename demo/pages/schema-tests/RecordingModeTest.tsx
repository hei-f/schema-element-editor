import React, { useState, useRef, useCallback } from 'react'
import { Row, Col, Radio, Space, Typography, Alert, Button, Tag } from 'antd'
import { SwapOutlined, PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons'
import { TestLayout } from './components/TestLayout'
import { TestElementCard } from './components/TestElementCard'
import { useSchemaTestCommunication, CommunicationMode } from './hooks/useSchemaTestCommunication'

const { Text } = Typography

const MESSAGE_SOURCE = {
  CONTENT: 'schema-element-editor-content',
  HOST: 'schema-element-editor-host',
} as const

/** 初始Schema数据 */
const INITIAL_SCHEMA_STORE: Record<string, any> = {
  'recording-test': '"初始内容"',
}

interface RecordingModeTestProps {
  onBack: () => void
}

export const RecordingModeTest: React.FC<RecordingModeTestProps> = (props) => {
  const [communicationMode, setCommunicationMode] = useState<CommunicationMode>('postMessage')
  const [isRecording, setIsRecording] = useState(false)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const recordingCountRef = useRef(0)

  const { schemaData, schemaStoreRef, addLog } = useSchemaTestCommunication({
    initialSchemaStore: INITIAL_SCHEMA_STORE,
    communicationMode,
  })

  const startRecordingTest = useCallback(() => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
    }

    recordingCountRef.current = 0
    const startTime = Date.now()

    schemaStoreRef.current['recording-test'] = JSON.stringify('开始录制测试 - 时间: 0ms')
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

      if (elapsed >= 10000) {
        clearInterval(recordingTimerRef.current!)
        recordingTimerRef.current = null
        setIsRecording(false)

        const finalLines = [...lines, '', '---', '', '✅ 录制测试完成！']
        schemaStoreRef.current['recording-test'] = JSON.stringify(finalLines.join('\n'))

        addLog('success', '✅ 录制模式测试完成', {
          totalUpdates: recordingCountRef.current,
          duration: `${elapsed}ms`,
        })
      }
    }, 100)
  }, [schemaStoreRef, addLog])

  const stopRecordingTest = useCallback(() => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
      setIsRecording(false)
      addLog('info', '⏹️ 录制模式测试已手动停止')
    }
  }, [addLog])

  return (
    <TestLayout
      title="录制模式测试"
      description="测试编辑器的录制模式功能，验证在数据快速更新的场景下编辑器的表现"
      onBack={props.onBack}
      instructions={[
        '点击「开始测试」按钮启动录制模式测试',
        '在测试运行时（约10秒），按住 Alt/Option 并点击测试元素打开编辑器',
        '观察编辑器是否能流畅显示快速更新的内容',
        '测试期间可以点击「停止测试」按钮提前结束',
      ]}
      checklistItems={[
        '录制模式下编辑器能流畅显示快速更新的内容',
        '内容更新频率约为 100ms 一次',
        '编辑器不会因快速更新而卡顿或崩溃',
        '测试完成后显示最终状态',
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

      {/* 录制测试 */}
      <div>
        <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 12 }}>
          🎬 录制模式
        </Text>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <TestElementCard
              id="recording-test"
              title="录制模式测试元素"
              description="点击开始测试后，数据会以 100ms 的间隔快速更新，持续 10 秒"
              dataId="recording-test"
              typeTag="Recording"
              typeTagColor="red"
              schemaData={schemaData['recording-test']}
              actions={
                <Space>
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
              }
            />
          </Col>
        </Row>
      </div>
    </TestLayout>
  )
}
