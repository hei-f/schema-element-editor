import React, { useState } from 'react'
import { useSchemaElementEditor, SchemaValue } from '@schema-element-editor/host-sdk'
import { Typography, Alert } from 'antd'
import { TestLayout } from './components/TestLayout'
import { SdkCard } from './components/SdkCard'

const { Text, Paragraph } = Typography

interface DataStore {
  [key: string]: SchemaValue | undefined
}

interface PriorityBlockingTestProps {
  onBack: () => void
}

export const PriorityBlockingTest: React.FC<PriorityBlockingTestProps> = (props) => {
  const [componentData, setComponentData] = useState<DataStore>({
    'item-1': { type: 'text', content: '组件库数据 1', source: 'component-library' },
    'item-2': { type: 'text', content: '组件库数据 2', source: 'component-library' },
  })

  const [userData, setUserData] = useState<DataStore>({
    'item-3': { type: 'text', content: '用户数据 3', source: 'user-app' },
    'item-4': { type: 'text', content: '用户数据 4', source: 'user-app' },
  })

  useSchemaElementEditor({
    sdkId: 'component-library-sdk',
    level: 10,
    getSchema: (params) => {
      console.log('[组件库 SDK] getSchema 被调用:', params)
      return componentData[params] as SchemaValue
    },
    updateSchema: (schema, params) => {
      console.log('[组件库 SDK] updateSchema 被调用:', params, schema)
      setComponentData((prev) => ({ ...prev, [params]: schema }))
      return true
    },
  })

  useSchemaElementEditor({
    sdkId: 'user-app-sdk',
    level: 100,
    getSchema: (params) => {
      console.log('[用户应用 SDK] getSchema 被调用:', params)
      return userData[params] as SchemaValue
    },
    updateSchema: (schema, params) => {
      console.log('[用户应用 SDK] updateSchema 被调用:', params, schema)
      setUserData((prev) => ({ ...prev, [params]: schema }))
      return true
    },
  })

  return (
    <TestLayout
      title="不同优先级阻塞测试"
      description="此测试验证当存在不同优先级的 SDK 时，只有最高优先级的 SDK 会响应，即使它没有对应 data-id 的数据。"
      onBack={props.onBack}
      checklistItems={[
        '点击 item-1 或 item-2，只有用户应用 SDK（level: 100）响应',
        '组件库 SDK（level: 10）被阻塞，即使它有实际数据',
        '编辑器会显示 undefined（因为用户应用 SDK 没有这些数据）',
        '点击 item-3 或 item-4，用户应用 SDK 正常返回数据',
        '这说明：在不同优先级场景下，应该让高优先级 SDK 管理所有数据',
      ]}
    >
      <Alert
        message="重要提示"
        description="这个测试展示了不推荐的场景：高优先级 SDK 会阻塞所有低优先级 SDK，即使它没有对应的数据。实际使用中，应该让所有 SDK 使用相同的 level（参考测试用例 1）。"
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <SdkCard
        title="组件库 SDK"
        level={10}
        priorityColor="orange"
        priorityText="优先级：低（被阻塞）"
      >
        <div
          data-id="item-1"
          style={{ padding: 8, background: '#f0f0f0', borderRadius: 4, marginBottom: 8 }}
        >
          <Text code>data-id="item-1"</Text>
          <pre style={{ margin: '8px 0 0', fontSize: 12 }}>
            {JSON.stringify(componentData['item-1'], null, 2)}
          </pre>
          <Text type="danger" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
            ⚠️ 点击此元素，此 SDK 不会响应（被高优先级 SDK 阻塞）
          </Text>
        </div>
        <div data-id="item-2" style={{ padding: 8, background: '#f0f0f0', borderRadius: 4 }}>
          <Text code>data-id="item-2"</Text>
          <pre style={{ margin: '8px 0 0', fontSize: 12 }}>
            {JSON.stringify(componentData['item-2'], null, 2)}
          </pre>
          <Text type="danger" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
            ⚠️ 点击此元素，此 SDK 不会响应（被高优先级 SDK 阻塞）
          </Text>
        </div>
      </SdkCard>

      <SdkCard
        title="用户应用 SDK"
        level={100}
        priorityColor="red"
        priorityText="优先级：最高（阻塞其他）"
      >
        <div
          data-id="item-3"
          style={{ padding: 8, background: '#fff1f0', borderRadius: 4, marginBottom: 8 }}
        >
          <Text code>data-id="item-3"</Text>
          <pre style={{ margin: '8px 0 0', fontSize: 12 }}>
            {JSON.stringify(userData['item-3'], null, 2)}
          </pre>
          <Text type="success" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
            ✅ 点击此元素，此 SDK 正常响应
          </Text>
        </div>
        <div data-id="item-4" style={{ padding: 8, background: '#fff1f0', borderRadius: 4 }}>
          <Text code>data-id="item-4"</Text>
          <pre style={{ margin: '8px 0 0', fontSize: 12 }}>
            {JSON.stringify(userData['item-4'], null, 2)}
          </pre>
          <Text type="success" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
            ✅ 点击此元素，此 SDK 正常响应
          </Text>
        </div>
      </SdkCard>

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
          💡 最佳实践建议
        </Text>
        <Paragraph style={{ marginBottom: 0 }}>
          如果需要多个 SDK 各自管理不同的数据域，应该将它们的 level 设置为相同值。这样所有 SDK
          都会响应请求，各自返回各自的数据。参考【测试用例 1：相同优先级多实例共存】。
        </Paragraph>
      </div>
    </TestLayout>
  )
}
