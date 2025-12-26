import React, { useState } from 'react'
import { Row, Col, Radio, Space, Typography, Alert } from 'antd'
import { SwapOutlined } from '@ant-design/icons'
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
  'json-repair-missing-colon': '{"name" "Alice", "age": 25}',
  'json-repair-missing-quotes': '{name: "Alice", age: 25}',
  'json-repair-trailing-comma': '{"name": "Alice", "age": 25,}',
  'json-repair-incomplete': '{"name": "Alice", "items": [1, 2, 3',
  'json-repair-single-quotes': "{'name': 'Alice', 'age': 25}",
  'json-repair-sse-data':
    '[{"componentPath":"WhiteBox","componentProps":{"data":"工具接口: PolicyToolsFacade.queryAgentMarketingStrategy\\n 策略生成失败","duration":"67073835","iconType":"icon-search3","resultStatus":"error","title":"查询智能策略工具调用失败"}}]\n',
}

interface JsonRepairTestProps {
  onBack: () => void
}

export const JsonRepairTest: React.FC<JsonRepairTestProps> = (props) => {
  const [communicationMode, setCommunicationMode] = useState<CommunicationMode>('postMessage')

  const { schemaData } = useSchemaTestCommunication({
    initialSchemaStore: INITIAL_SCHEMA_STORE,
    communicationMode,
  })

  return (
    <TestLayout
      title="JSON 修复测试"
      description="测试编辑器的 JSON 错误定位和自动修复功能，这些测试用例包含常见的 JSON 语法错误"
      onBack={props.onBack}
      instructions={[
        '按住 Alt/Option 键并点击元素打开编辑器',
        '点击工具栏的「定位错误」按钮，编辑器会自动跳转到错误位置',
        '点击「JSON 修复」按钮，系统会尝试自动修复 JSON 语法错误',
        '查看 Diff 视图，确认修复内容后点击「应用修复」',
      ]}
      checklistItems={[
        '错误定位功能能准确跳转到语法错误位置',
        'JSON 修复功能能自动修复常见语法错误',
        'Diff 视图能清晰展示修复前后的对比',
        '修复后的数据能正常保存',
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

      {/* JSON 修复测试用例 */}
      <div>
        <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 12 }}>
          🔧 JSON 语法错误修复
        </Text>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <TestElementCard
              id="json-repair-missing-colon"
              title="缺少冒号"
              description='{"name" "Alice"} - 缺少属性名和值之间的冒号'
              dataId="json-repair-missing-colon"
              typeTag="JsonRepair"
              typeTagColor="volcano"
              schemaData={schemaData['json-repair-missing-colon']}
            />
          </Col>
          <Col span={12}>
            <TestElementCard
              id="json-repair-missing-quotes"
              title="缺少引号"
              description="{name: 'Alice'} - 属性名缺少引号"
              dataId="json-repair-missing-quotes"
              typeTag="JsonRepair"
              typeTagColor="volcano"
              schemaData={schemaData['json-repair-missing-quotes']}
            />
          </Col>
          <Col span={12}>
            <TestElementCard
              id="json-repair-trailing-comma"
              title="末尾逗号"
              description='{"age": 25,} - 对象/数组末尾多余的逗号'
              dataId="json-repair-trailing-comma"
              typeTag="JsonRepair"
              typeTagColor="volcano"
              schemaData={schemaData['json-repair-trailing-comma']}
            />
          </Col>
          <Col span={12}>
            <TestElementCard
              id="json-repair-incomplete"
              title="不完整结构"
              description='{"items": [1, 2, 3 - 缺少闭合括号'
              dataId="json-repair-incomplete"
              typeTag="JsonRepair"
              typeTagColor="volcano"
              schemaData={schemaData['json-repair-incomplete']}
            />
          </Col>
          <Col span={12}>
            <TestElementCard
              id="json-repair-single-quotes"
              title="单引号"
              description="使用单引号而非双引号"
              dataId="json-repair-single-quotes"
              typeTag="JsonRepair"
              typeTagColor="volcano"
              schemaData={schemaData['json-repair-single-quotes']}
            />
          </Col>
          <Col span={12}>
            <TestElementCard
              id="json-repair-sse-data"
              title="SSE 数据格式"
              description="流式数据中包含转义字符和换行符"
              dataId="json-repair-sse-data"
              typeTag="JsonRepair"
              typeTagColor="volcano"
              schemaData={schemaData['json-repair-sse-data']}
            />
          </Col>
        </Row>
      </div>
    </TestLayout>
  )
}
