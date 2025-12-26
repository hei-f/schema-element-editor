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
  'object-simple': { name: 'Test Object', value: 123 },
  'object-nested': {
    user: { id: 1, name: 'Alice', profile: { age: 25, city: 'Beijing' } },
    settings: { theme: 'dark', notifications: true },
  },
  'object-empty': {},
  'array-numbers': [1, 2, 3, 4, 5],
  'array-strings': ['apple', 'banana', 'cherry'],
  'array-objects': [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
  ],
  'array-mixed': [1, 'text', true, { key: 'value' }, [1, 2, 3]],
  'array-empty': [],
  'array-nested': [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ],
  'multi-params-test': {
    message: '多参数测试',
    description: '工具栏中应该显示多个参数，并支持水平滚动',
  },
}

interface ComplexTypesTestProps {
  onBack: () => void
}

export const ComplexTypesTest: React.FC<ComplexTypesTestProps> = (props) => {
  const [communicationMode, setCommunicationMode] = useState<CommunicationMode>('postMessage')

  const { schemaData } = useSchemaTestCommunication({
    initialSchemaStore: INITIAL_SCHEMA_STORE,
    communicationMode,
  })

  return (
    <TestLayout
      title="复杂类型测试"
      description="测试 Schema Element Editor 对复杂数据类型的支持，包括 Object、Array 以及嵌套结构"
      onBack={props.onBack}
      checklistItems={[
        '简单和嵌套对象都能正常打开和编辑',
        '各种数组类型（数字、字符串、对象、混合）都能正确显示',
        '深层嵌套结构能正确处理',
        '空对象和空数组能正确处理',
        '多参数元素的工具栏支持水平滚动',
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

      {/* Object 类型测试 */}
      <div>
        <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 12 }}>
          📦 Object 类型
        </Text>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <TestElementCard
              id="object-simple"
              title="简单对象"
              description="包含基础字段的对象"
              dataId="object-simple"
              typeTag="Object"
              typeTagColor="green"
              schemaData={schemaData['object-simple']}
            />
          </Col>
          <Col span={12}>
            <TestElementCard
              id="object-nested"
              title="嵌套对象"
              description="包含多层嵌套的复杂对象"
              dataId="object-nested"
              typeTag="Object"
              typeTagColor="green"
              schemaData={schemaData['object-nested']}
            />
          </Col>
          <Col span={12}>
            <TestElementCard
              id="object-empty"
              title="空对象"
              description="空对象 {}"
              dataId="object-empty"
              typeTag="Object"
              typeTagColor="green"
              schemaData={schemaData['object-empty']}
            />
          </Col>
        </Row>
      </div>

      {/* Array 类型测试 */}
      <div style={{ marginTop: 24 }}>
        <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 12 }}>
          📋 Array 类型
        </Text>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <TestElementCard
              id="array-numbers"
              title="数字数组"
              description="纯数字类型的数组"
              dataId="array-numbers"
              typeTag="Array"
              typeTagColor="purple"
              schemaData={schemaData['array-numbers']}
            />
          </Col>
          <Col span={12}>
            <TestElementCard
              id="array-strings"
              title="字符串数组"
              description="纯字符串类型的数组"
              dataId="array-strings"
              typeTag="Array"
              typeTagColor="purple"
              schemaData={schemaData['array-strings']}
            />
          </Col>
          <Col span={12}>
            <TestElementCard
              id="array-objects"
              title="对象数组"
              description="包含对象的数组"
              dataId="array-objects"
              typeTag="Array"
              typeTagColor="purple"
              schemaData={schemaData['array-objects']}
            />
          </Col>
          <Col span={12}>
            <TestElementCard
              id="array-mixed"
              title="混合类型数组"
              description="包含多种数据类型的数组"
              dataId="array-mixed"
              typeTag="Array"
              typeTagColor="purple"
              schemaData={schemaData['array-mixed']}
            />
          </Col>
          <Col span={12}>
            <TestElementCard
              id="array-nested"
              title="嵌套数组"
              description="数组的数组（二维数组）"
              dataId="array-nested"
              typeTag="Array"
              typeTagColor="purple"
              schemaData={schemaData['array-nested']}
            />
          </Col>
          <Col span={12}>
            <TestElementCard
              id="array-empty"
              title="空数组"
              description="空数组 []"
              dataId="array-empty"
              typeTag="Array"
              typeTagColor="purple"
              schemaData={schemaData['array-empty']}
            />
          </Col>
        </Row>
      </div>

      {/* 多参数测试 */}
      <div style={{ marginTop: 24 }}>
        <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 12 }}>
          🔄 多参数测试
        </Text>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <TestElementCard
              id="multi-params-test"
              title="多参数元素"
              description="测试工具栏对长参数的滚动支持"
              dataId="very-long-param-name-1,another-long-parameter-value-2,user.profile.settings.theme,data[0].items[*].nested.value,https://api.example.com/v1/users"
              typeTag="Object"
              typeTagColor="green"
              schemaData={schemaData['multi-params-test']}
            />
          </Col>
        </Row>
      </div>
    </TestLayout>
  )
}
