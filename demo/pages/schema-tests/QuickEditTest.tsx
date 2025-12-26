import React, { useState } from 'react'
import { Row, Col, Radio, Space, Typography, Alert, Card } from 'antd'
import { SwapOutlined, InfoCircleOutlined } from '@ant-design/icons'
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
  'quick-edit-sse-stream': `data: {"type": "message", "content": "Hello"}
event: update
data: {"status" "processing", "progress": 50}
event: complete
data: {"result": [1, 2, 3}`,

  'quick-edit-log-format': `[2024-01-15 10:30:00] INFO: Starting process
[2024-01-15 10:30:05] DATA: {"user": "Alice", "action" "login"}
[2024-01-15 10:30:10] ERROR: {"code": 500, "message": "Server error", "details": {"reason" "connection timeout"}}
[2024-01-15 10:30:15] INFO: Process completed`,

  'quick-edit-multi-json': `这是一些描述文本

第一个配置：{"name": "config1", "value" 100}

更多说明文字...

第二个配置：{"name": "config2", "enabled": true "timeout": 3000}

结束说明`,

  'quick-edit-embedded-text': `用户配置文档

系统会读取以下JSON配置来初始化服务：

{"server": {"host": "localhost", "port" 8080}, "database": {"url": "mongodb://localhost", "name" "mydb"}}

请确保配置正确后再启动服务。`,

  'quick-edit-api-response': `HTTP/1.1 500 Internal Server Error
Content-Type: application/json
Date: Mon, 15 Jan 2024 10:30:00 GMT

{"error": {"code": "INVALID_REQUEST", "message": "Invalid parameters", "details": [{"field": "userId", "issue" "missing required field"}, {"field": "timestamp", "issue" "invalid format"}]}}`,

  'quick-edit-nested-error': `任务执行报告：

主任务状态：{"id": "task-001", "status": "failed", "error": {"type": "ValidationError", "context": {"input": {"data": [1, 2, 3, "field": "value"}], "validator" "schema-v2"}}}

子任务状态：正常`,
}

interface QuickEditTestProps {
  onBack: () => void
}

export const QuickEditTest: React.FC<QuickEditTestProps> = (props) => {
  const [communicationMode, setCommunicationMode] = useState<CommunicationMode>('postMessage')

  const { schemaData } = useSchemaTestCommunication({
    initialSchemaStore: INITIAL_SCHEMA_STORE,
    communicationMode,
  })

  return (
    <TestLayout
      title="单独编辑功能测试"
      description="测试单独编辑功能处理混杂错误 JSON 的场景。这些测试用例模拟真实环境中数据不是纯粹的 JSON，而是文本中嵌入了有语法错误的 JSON 片段的情况。"
      onBack={props.onBack}
      instructions={[
        '按住 Alt/Option 键并点击元素打开编辑器',
        '在编辑器中，使用鼠标选中有问题的 JSON 部分（不要选中周围的文本）',
        '右键点击选中的内容，选择「单独编辑」',
        '在单独编辑弹窗中，使用「定位错误」找到语法错误位置',
        '点击「JSON 修复」自动修复错误',
        '查看 Diff 对比，确认修复内容',
        '点击「保存并替换」，修复后的 JSON 会替换编辑器中选中的部分',
      ]}
      checklistItems={[
        '能够选中文本中的部分内容并打开单独编辑',
        '单独编辑中的错误定位功能正常工作',
        'JSON 修复功能能修复各种语法错误',
        '修复后能正确替换原内容中的对应部分',
        '保存后整体数据保持完整（非JSON部分不受影响）',
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

      {/* 功能说明卡片 */}
      <Card>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space>
            <InfoCircleOutlined style={{ color: '#1677ff' }} />
            <Text strong>单独编辑功能使用场景</Text>
          </Space>
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            当数据不是纯粹的 JSON，而是包含描述文本、日志、注释等内容，中间混杂着有错误的 JSON
            时，可以使用单独编辑功能：
          </Paragraph>
          <ul style={{ marginBottom: 0, paddingLeft: 24 }}>
            <li>选中需要修复的 JSON 部分</li>
            <li>在单独的编辑器中使用 JSON 修复工具</li>
            <li>修复后替换回原位置</li>
            <li>保持周围文本内容不变</li>
          </ul>
        </Space>
      </Card>

      {/* 测试用例 */}
      <div style={{ marginTop: 16 }}>
        <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 12 }}>
          🎯 测试场景
        </Text>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <TestElementCard
              id="quick-edit-sse-stream"
              title="SSE 流式数据修复"
              description="模拟 Server-Sent Events 流式响应，event/data 字段中混杂着错误的 JSON（缺少冒号、括号不匹配）"
              dataId="quick-edit-sse-stream"
              typeTag="QuickEdit"
              typeTagColor="magenta"
              schemaData={schemaData['quick-edit-sse-stream']}
            >
              <Alert
                type="info"
                message="选中提示"
                description='选中任意一行 data: 后面的 JSON 部分（如：{"status" "processing", "progress": 50}），右键选择单独编辑'
                style={{ marginTop: 8, fontSize: 12 }}
                showIcon
              />
            </TestElementCard>
          </Col>

          <Col span={24}>
            <TestElementCard
              id="quick-edit-log-format"
              title="日志格式修复"
              description="日志文本中嵌入的 JSON 数据存在语法错误（缺少冒号）"
              dataId="quick-edit-log-format"
              typeTag="QuickEdit"
              typeTagColor="magenta"
              schemaData={schemaData['quick-edit-log-format']}
            >
              <Alert
                type="info"
                message="选中提示"
                description="选中 ERROR 行中的 JSON 部分（从 { 到 }），该 JSON 包含多处错误"
                style={{ marginTop: 8, fontSize: 12 }}
                showIcon
              />
            </TestElementCard>
          </Col>

          <Col span={24}>
            <TestElementCard
              id="quick-edit-multi-json"
              title="多段 JSON 修复"
              description="文档中包含多个 JSON 配置片段，部分有语法错误"
              dataId="quick-edit-multi-json"
              typeTag="QuickEdit"
              typeTagColor="magenta"
              schemaData={schemaData['quick-edit-multi-json']}
            >
              <Alert
                type="info"
                message="选中提示"
                description="分别选中两个配置的 JSON 部分进行修复，修复后描述文本应保持不变"
                style={{ marginTop: 8, fontSize: 12 }}
                showIcon
              />
            </TestElementCard>
          </Col>

          <Col span={24}>
            <TestElementCard
              id="quick-edit-embedded-text"
              title="文本嵌入 JSON 修复"
              description="技术文档中嵌入的配置 JSON 存在多处语法错误"
              dataId="quick-edit-embedded-text"
              typeTag="QuickEdit"
              typeTagColor="magenta"
              schemaData={schemaData['quick-edit-embedded-text']}
            >
              <Alert
                type="info"
                message="选中提示"
                description='选中配置 JSON（从 {"server" 到 最后的 }），修复后文档说明应保持不变'
                style={{ marginTop: 8, fontSize: 12 }}
                showIcon
              />
            </TestElementCard>
          </Col>

          <Col span={24}>
            <TestElementCard
              id="quick-edit-api-response"
              title="API 响应修复"
              description="HTTP 响应中的 JSON body 存在语法错误"
              dataId="quick-edit-api-response"
              typeTag="QuickEdit"
              typeTagColor="magenta"
              schemaData={schemaData['quick-edit-api-response']}
            >
              <Alert
                type="info"
                message="选中提示"
                description="选中响应体中的 JSON 部分（最后一行），修复后 HTTP 头部应保持不变"
                style={{ marginTop: 8, fontSize: 12 }}
                showIcon
              />
            </TestElementCard>
          </Col>

          <Col span={24}>
            <TestElementCard
              id="quick-edit-nested-error"
              title="嵌套错误修复"
              description="报告文本中嵌入了深层嵌套的 JSON，内部存在语法错误"
              dataId="quick-edit-nested-error"
              typeTag="QuickEdit"
              typeTagColor="magenta"
              schemaData={schemaData['quick-edit-nested-error']}
            >
              <Alert
                type="info"
                message="选中提示"
                description="选中主任务状态的 JSON（包含嵌套的 error 对象），内部多处缺少冒号"
                style={{ marginTop: 8, fontSize: 12 }}
                showIcon
              />
            </TestElementCard>
          </Col>
        </Row>
      </div>
    </TestLayout>
  )
}
