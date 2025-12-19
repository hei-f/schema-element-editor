import React, { useState } from 'react'
import { useSchemaElementEditor, SchemaValue } from '@schema-element-editor/host-sdk'
import { Typography, Alert, Tag, Space } from 'antd'
import { TestLayout } from './components/TestLayout'
import { SdkCard } from './components/SdkCard'

const { Text, Paragraph } = Typography

interface DataStore {
  [key: string]: SchemaValue | undefined
}

interface MethodLevelTestProps {
  onBack: () => void
}

export const MethodLevelTest: React.FC<MethodLevelTestProps> = (props) => {
  const [sdkAData, setSdkAData] = useState<DataStore>({
    'test-item': {
      type: 'text',
      content: '测试数据 - SDK A',
      source: 'sdk-a',
    },
  })

  const [sdkBData, setSdkBData] = useState<DataStore>({
    'test-item': {
      type: 'text',
      content: '测试数据 - SDK B',
      source: 'sdk-b',
    },
  })

  useSchemaElementEditor({
    sdkId: 'method-level-sdk-a',
    level: 50,
    methodLevels: {
      getSchema: 100,
    },
    getSchema: (params) => {
      console.log('[SDK A] getSchema 被调用（methodLevel: 100）:', params)
      return sdkAData[params] as SchemaValue
    },
    updateSchema: (schema, params) => {
      console.log('[SDK A] updateSchema 被调用（使用默认 level: 50）:', params, schema)
      setSdkAData((prev) => ({ ...prev, [params]: schema }))
      return true
    },
  })

  useSchemaElementEditor({
    sdkId: 'method-level-sdk-b',
    level: 80,
    getSchema: (params) => {
      console.log('[SDK B] getSchema 被调用（使用默认 level: 80）:', params)
      return sdkBData[params] as SchemaValue
    },
    updateSchema: (schema, params) => {
      console.log('[SDK B] updateSchema 被调用（使用默认 level: 80）:', params, schema)
      setSdkBData((prev) => ({ ...prev, [params]: schema }))
      return true
    },
  })

  return (
    <TestLayout
      title="方法级别优先级测试"
      description="此测试验证 methodLevels 配置，允许为不同的方法设置不同的优先级。"
      onBack={props.onBack}
      checklistItems={[
        '点击 test-item，getSchema 请求应该由 SDK A 处理（methodLevel: 100）',
        '编辑数据后，updateSchema 请求应该由 SDK B 处理（level: 80）',
        '控制台日志应该清楚显示哪个 SDK 处理了哪个方法',
        '这个功能适用于需要精细控制不同操作优先级的场景',
      ]}
    >
      <Alert
        message="配置说明"
        description={
          <Space direction="vertical">
            <div>
              SDK A：默认 level: 50，但 getSchema 方法单独配置为 methodLevel: 100（最高优先级）
            </div>
            <div>SDK B：统一使用 level: 80</div>
            <div>
              结果：读取数据（getSchema）由 SDK A 处理，更新数据（updateSchema）由 SDK B 处理
            </div>
          </Space>
        }
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <SdkCard
        title="SDK A"
        level={50}
        priorityColor="purple"
        priorityText="默认优先级：低"
        extraTags={[{ color: 'red', text: 'getSchema: 100（高）' }]}
      >
        <div style={{ marginBottom: 12 }}>
          <Text strong>配置：</Text>
          <pre
            style={{
              margin: '8px 0',
              fontSize: 12,
              background: '#f9f0ff',
              padding: 8,
              borderRadius: 4,
            }}
          >
            {`{
  level: 50,
  methodLevels: {
    getSchema: 100  // 覆盖默认 level
  }
}`}
          </pre>
        </div>
        <div>
          <Text strong>管理的数据：</Text>
          <pre
            style={{
              margin: '8px 0',
              fontSize: 12,
              background: '#f0f0f0',
              padding: 8,
              borderRadius: 4,
            }}
          >
            {JSON.stringify(sdkAData['test-item'], null, 2)}
          </pre>
        </div>
      </SdkCard>

      <SdkCard
        title="SDK B"
        level={80}
        priorityColor="blue"
        priorityText="统一优先级：中"
        extraTags={[{ color: 'blue', text: 'updateSchema: 80（中）' }]}
      >
        <div style={{ marginBottom: 12 }}>
          <Text strong>配置：</Text>
          <pre
            style={{
              margin: '8px 0',
              fontSize: 12,
              background: '#e6f4ff',
              padding: 8,
              borderRadius: 4,
            }}
          >
            {`{
  level: 80  // 所有方法使用统一优先级
}`}
          </pre>
        </div>
        <div>
          <Text strong>管理的数据：</Text>
          <pre
            style={{
              margin: '8px 0',
              fontSize: 12,
              background: '#f0f0f0',
              padding: 8,
              borderRadius: 4,
            }}
          >
            {JSON.stringify(sdkBData['test-item'], null, 2)}
          </pre>
        </div>
      </SdkCard>

      <div
        data-id="test-item"
        style={{
          padding: 16,
          background: '#fff7e6',
          border: '2px solid #ffa940',
          borderRadius: 4,
          marginTop: 16,
        }}
      >
        <Text code strong style={{ fontSize: 14 }}>
          data-id="test-item"
        </Text>
        <Paragraph style={{ marginTop: 8, marginBottom: 8 }}>
          <Tag color="green">getSchema</Tag> 由 SDK A 处理（methodLevel: 100）
        </Paragraph>
        <Paragraph style={{ marginBottom: 0 }}>
          <Tag color="blue">updateSchema</Tag> 由 SDK B 处理（level: 80）
        </Paragraph>
      </div>

      <div
        style={{
          padding: 16,
          background: '#f6ffed',
          border: '2px solid #52c41a',
          borderRadius: 4,
          marginTop: 16,
        }}
      >
        <Text strong style={{ display: 'block', marginBottom: 8 }}>
          💡 使用场景
        </Text>
        <Paragraph style={{ marginBottom: 0 }}>
          methodLevels 适用于需要分离关注点的场景，例如：
          <br />- 数据读取由基础库处理，数据写入由业务层拦截校验
          <br />- 预览功能由 UI 库提供，数据管理由状态管理库处理
          <br />- 不同方法需要不同的权限控制
        </Paragraph>
      </div>
    </TestLayout>
  )
}
