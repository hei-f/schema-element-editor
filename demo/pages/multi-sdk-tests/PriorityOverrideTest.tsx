import React, { useState } from 'react'
import { useSchemaElementEditor, SchemaValue } from '@schema-element-editor/host-sdk'
import { Typography, Alert } from 'antd'
import { TestLayout } from './components/TestLayout'
import { SdkCard } from './components/SdkCard'

const { Text, Paragraph } = Typography

interface DataStore {
  [key: string]: SchemaValue | undefined
}

interface PriorityOverrideTestProps {
  onBack: () => void
}

export const PriorityOverrideTest: React.FC<PriorityOverrideTestProps> = (props) => {
  const [sdkAData, setSdkAData] = useState<DataStore>({
    'conflict-item': {
      type: 'text',
      content: '冲突数据 - SDK A',
      source: 'sdk-a',
      priority: 50,
    },
  })

  const [sdkBData, setSdkBData] = useState<DataStore>({
    'conflict-item': {
      type: 'text',
      content: '冲突数据 - SDK B',
      source: 'sdk-b',
      priority: 80,
    },
  })

  const [sdkCData, setSdkCData] = useState<DataStore>({
    'conflict-item': {
      type: 'text',
      content: '冲突数据 - SDK C',
      source: 'sdk-c',
      priority: 100,
    },
  })

  useSchemaElementEditor({
    sdkId: 'conflict-sdk-a',
    level: 50,
    getSchema: (params) => {
      console.log('[SDK A] getSchema 被调用:', params)
      return sdkAData[params] as SchemaValue
    },
    updateSchema: (schema, params) => {
      console.log('[SDK A] updateSchema 被调用:', params, schema)
      setSdkAData((prev) => ({ ...prev, [params]: schema }))
      return true
    },
  })

  useSchemaElementEditor({
    sdkId: 'conflict-sdk-b',
    level: 80,
    getSchema: (params) => {
      console.log('[SDK B] getSchema 被调用:', params)
      return sdkBData[params] as SchemaValue
    },
    updateSchema: (schema, params) => {
      console.log('[SDK B] updateSchema 被调用:', params, schema)
      setSdkBData((prev) => ({ ...prev, [params]: schema }))
      return true
    },
  })

  useSchemaElementEditor({
    sdkId: 'conflict-sdk-c',
    level: 100,
    getSchema: (params) => {
      console.log('[SDK C] getSchema 被调用:', params)
      return sdkCData[params] as SchemaValue
    },
    updateSchema: (schema, params) => {
      console.log('[SDK C] updateSchema 被调用:', params, schema)
      setSdkCData((prev) => ({ ...prev, [params]: schema }))
      return true
    },
  })

  return (
    <TestLayout
      title="不同优先级覆盖测试"
      description="此测试验证当多个 SDK 管理相同的 data-id 时，只有优先级最高的 SDK 会响应请求。"
      onBack={props.onBack}
      checklistItems={[
        '点击 conflict-item，编辑器应显示 SDK C（level: 100）的数据',
        '控制台应只显示 SDK C 的日志，SDK A 和 SDK B 不应响应',
        '编辑数据后，只有 SDK C 的数据应该更新',
      ]}
    >
      <Alert
        message="三个 SDK 都管理 conflict-item，应该由最高优先级（level: 100）的 SDK C 响应"
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <SdkCard title="SDK A" level={50} priorityColor="orange" priorityText="优先级：低">
        <pre
          style={{
            margin: 0,
            fontSize: 12,
            background: '#f0f0f0',
            padding: 8,
            borderRadius: 4,
          }}
        >
          {JSON.stringify(sdkAData['conflict-item'], null, 2)}
        </pre>
      </SdkCard>

      <SdkCard title="SDK B" level={80} priorityColor="blue" priorityText="优先级：中">
        <pre
          style={{
            margin: 0,
            fontSize: 12,
            background: '#e6f4ff',
            padding: 8,
            borderRadius: 4,
          }}
        >
          {JSON.stringify(sdkBData['conflict-item'], null, 2)}
        </pre>
      </SdkCard>

      <SdkCard title="SDK C" level={100} priorityColor="red" priorityText="优先级：最高">
        <pre
          style={{
            margin: 0,
            fontSize: 12,
            background: '#fff1f0',
            padding: 8,
            borderRadius: 4,
          }}
        >
          {JSON.stringify(sdkCData['conflict-item'], null, 2)}
        </pre>
      </SdkCard>

      <div
        data-id="conflict-item"
        style={{
          padding: 16,
          background: '#fff7e6',
          border: '2px solid #ffa940',
          borderRadius: 4,
          marginTop: 16,
        }}
      >
        <Text code strong style={{ fontSize: 14 }}>
          data-id="conflict-item"
        </Text>
        <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
          点击此元素，编辑器应该显示 SDK C 的数据（红色背景）
        </Paragraph>
      </div>
    </TestLayout>
  )
}
