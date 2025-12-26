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
  'string-simple': 'Hello World',
  'string-complex': 'This is a complex string with special chars: !@#$%^&*()',
  'string-multiline': 'Line 1\nLine 2\nLine 3',
  'number-int': 42,
  'number-float': 3.14159,
  'number-negative': -100,
  'number-zero': 0,
  'boolean-true': true,
  'boolean-false': false,
  'null-value': null,
}

interface BasicTypesTestProps {
  onBack: () => void
}

export const BasicTypesTest: React.FC<BasicTypesTestProps> = (props) => {
  const [communicationMode, setCommunicationMode] = useState<CommunicationMode>('postMessage')

  const { schemaData } = useSchemaTestCommunication({
    initialSchemaStore: INITIAL_SCHEMA_STORE,
    communicationMode,
  })

  return (
    <TestLayout
      title="基础类型测试"
      description="测试 Schema Element Editor 对基础数据类型的支持，包括 String、Number、Boolean 和 null"
      onBack={props.onBack}
      checklistItems={[
        '所有字符串类型元素都能正常打开编辑器',
        '数字类型（整数、浮点数、负数、零）都能正确显示和编辑',
        '布尔类型（true/false）能正确显示和编辑',
        'null 值能正确处理',
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

      {/* String 类型测试 */}
      <div>
        <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 12 }}>
          📝 String 类型
        </Text>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <TestElementCard
              id="string-simple"
              title="简单字符串"
              description="单行简单文本"
              dataId="string-simple"
              typeTag="String"
              typeTagColor="orange"
              schemaData={schemaData['string-simple']}
            />
          </Col>
          <Col span={12}>
            <TestElementCard
              id="string-complex"
              title="复杂字符串"
              description="包含特殊字符的字符串"
              dataId="string-complex"
              typeTag="String"
              typeTagColor="orange"
              schemaData={schemaData['string-complex']}
            />
          </Col>
          <Col span={12}>
            <TestElementCard
              id="string-multiline"
              title="多行字符串"
              description="包含换行符的多行文本"
              dataId="string-multiline"
              typeTag="String"
              typeTagColor="orange"
              schemaData={schemaData['string-multiline']}
            />
          </Col>
        </Row>
      </div>

      {/* Number 类型测试 */}
      <div style={{ marginTop: 24 }}>
        <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 12 }}>
          🔢 Number 类型
        </Text>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <TestElementCard
              id="number-int"
              title="整数"
              description="正整数"
              dataId="number-int"
              typeTag="Number"
              typeTagColor="blue"
              schemaData={schemaData['number-int']}
            />
          </Col>
          <Col span={12}>
            <TestElementCard
              id="number-float"
              title="浮点数"
              description="带小数的数字"
              dataId="number-float"
              typeTag="Number"
              typeTagColor="blue"
              schemaData={schemaData['number-float']}
            />
          </Col>
          <Col span={12}>
            <TestElementCard
              id="number-negative"
              title="负数"
              description="负整数"
              dataId="number-negative"
              typeTag="Number"
              typeTagColor="blue"
              schemaData={schemaData['number-negative']}
            />
          </Col>
          <Col span={12}>
            <TestElementCard
              id="number-zero"
              title="零"
              description="数字 0"
              dataId="number-zero"
              typeTag="Number"
              typeTagColor="blue"
              schemaData={schemaData['number-zero']}
            />
          </Col>
        </Row>
      </div>

      {/* Boolean 类型测试 */}
      <div style={{ marginTop: 24 }}>
        <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 12 }}>
          ✓ Boolean 类型
        </Text>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <TestElementCard
              id="boolean-true"
              title="布尔值 - true"
              description="布尔真值"
              dataId="boolean-true"
              typeTag="Boolean"
              typeTagColor="cyan"
              schemaData={schemaData['boolean-true']}
            />
          </Col>
          <Col span={12}>
            <TestElementCard
              id="boolean-false"
              title="布尔值 - false"
              description="布尔假值"
              dataId="boolean-false"
              typeTag="Boolean"
              typeTagColor="cyan"
              schemaData={schemaData['boolean-false']}
            />
          </Col>
        </Row>
      </div>

      {/* Null 类型测试 */}
      <div style={{ marginTop: 24 }}>
        <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 12 }}>
          ⊘ Null 类型
        </Text>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <TestElementCard
              id="null-value"
              title="空值"
              description="null 值测试"
              dataId="null-value"
              typeTag="Null"
              typeTagColor="default"
              schemaData={schemaData['null-value']}
            />
          </Col>
        </Row>
      </div>
    </TestLayout>
  )
}
