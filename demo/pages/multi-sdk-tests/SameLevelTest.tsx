import React, { useState } from 'react'
import { useSchemaElementEditor, SchemaValue } from '@schema-element-editor/host-sdk'
import { Typography } from 'antd'
import { TestLayout } from './components/TestLayout'
import { SdkCard } from './components/SdkCard'

const { Text } = Typography

interface DataStore {
  [key: string]: SchemaValue | undefined
}

interface SameLevelTestProps {
  onBack: () => void
}

export const SameLevelTest: React.FC<SameLevelTestProps> = (props) => {
  const [userData, setUserData] = useState<DataStore>({
    'user-message-1': { type: 'text', content: '用户数据 1', source: 'user-app' },
    'user-message-2': { type: 'text', content: '用户数据 2', source: 'user-app' },
  })

  const [componentData, setComponentData] = useState<DataStore>({
    'component-item-1': { type: 'text', content: '组件库数据 1', source: 'component-library' },
    'component-item-2': { type: 'text', content: '组件库数据 2', source: 'component-library' },
  })

  const [thirdPartyData, setThirdPartyData] = useState<DataStore>({
    'third-party-1': { type: 'text', content: '第三方数据 1', source: 'third-party' },
    'third-party-2': { type: 'text', content: '第三方数据 2', source: 'third-party' },
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

  useSchemaElementEditor({
    sdkId: 'component-library-sdk',
    level: 100,
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
    sdkId: 'third-party-sdk',
    level: 100,
    getSchema: (params) => {
      console.log('[第三方 SDK] getSchema 被调用:', params)
      return thirdPartyData[params] as SchemaValue
    },
    updateSchema: (schema, params) => {
      console.log('[第三方 SDK] updateSchema 被调用:', params, schema)
      setThirdPartyData((prev) => ({ ...prev, [params]: schema }))
      return true
    },
  })

  return (
    <TestLayout
      title="相同优先级多实例共存测试"
      description="此测试验证当多个 SDK 使用相同的 level 时，它们都会响应请求，各自管理各自的数据域。这是最常见的多 SDK 场景。"
      onBack={props.onBack}
      checklistItems={[
        '点击 user-message-1 或 user-message-2，编辑器应显示用户应用 SDK 的数据',
        '点击 component-item-1 或 component-item-2，编辑器应显示组件库 SDK 的数据',
        '点击 third-party-1 或 third-party-2，编辑器应显示第三方 SDK 的数据',
        '控制台应显示所有 SDK 都被调用，但只有对应的 SDK 返回有效数据',
      ]}
    >
      <SdkCard title="用户应用 SDK" level={100} priorityColor="green">
        <div
          data-id="user-message-1"
          style={{ padding: 8, background: '#f0f0f0', borderRadius: 4, marginBottom: 8 }}
        >
          <Text code>data-id="user-message-1"</Text>
          <pre style={{ margin: '8px 0 0', fontSize: 12 }}>
            {JSON.stringify(userData['user-message-1'], null, 2)}
          </pre>
        </div>
        <div
          data-id="user-message-2"
          style={{ padding: 8, background: '#f0f0f0', borderRadius: 4 }}
        >
          <Text code>data-id="user-message-2"</Text>
          <pre style={{ margin: '8px 0 0', fontSize: 12 }}>
            {JSON.stringify(userData['user-message-2'], null, 2)}
          </pre>
        </div>
      </SdkCard>

      <SdkCard title="组件库 SDK" level={100} priorityColor="green">
        <div
          data-id="component-item-1"
          style={{ padding: 8, background: '#f0f0f0', borderRadius: 4, marginBottom: 8 }}
        >
          <Text code>data-id="component-item-1"</Text>
          <pre style={{ margin: '8px 0 0', fontSize: 12 }}>
            {JSON.stringify(componentData['component-item-1'], null, 2)}
          </pre>
        </div>
        <div
          data-id="component-item-2"
          style={{ padding: 8, background: '#f0f0f0', borderRadius: 4 }}
        >
          <Text code>data-id="component-item-2"</Text>
          <pre style={{ margin: '8px 0 0', fontSize: 12 }}>
            {JSON.stringify(componentData['component-item-2'], null, 2)}
          </pre>
        </div>
      </SdkCard>

      <SdkCard title="第三方 SDK" level={100} priorityColor="green">
        <div
          data-id="third-party-1"
          style={{ padding: 8, background: '#f0f0f0', borderRadius: 4, marginBottom: 8 }}
        >
          <Text code>data-id="third-party-1"</Text>
          <pre style={{ margin: '8px 0 0', fontSize: 12 }}>
            {JSON.stringify(thirdPartyData['third-party-1'], null, 2)}
          </pre>
        </div>
        <div data-id="third-party-2" style={{ padding: 8, background: '#f0f0f0', borderRadius: 4 }}>
          <Text code>data-id="third-party-2"</Text>
          <pre style={{ margin: '8px 0 0', fontSize: 12 }}>
            {JSON.stringify(thirdPartyData['third-party-2'], null, 2)}
          </pre>
        </div>
      </SdkCard>
    </TestLayout>
  )
}
