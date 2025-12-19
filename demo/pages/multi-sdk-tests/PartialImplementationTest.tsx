import React, { useState } from 'react'
import { useSchemaElementEditor, SchemaValue } from '@schema-element-editor/host-sdk'
import { Typography, Alert, Space } from 'antd'
import { TestLayout } from './components/TestLayout'
import { SdkCard } from './components/SdkCard'

const { Text, Paragraph } = Typography

interface DataStore {
  [key: string]: SchemaValue | undefined
}

interface PartialImplementationTestProps {
  onBack: () => void
}

export const PartialImplementationTest: React.FC<PartialImplementationTestProps> = (props) => {
  const [dataStore, setDataStore] = useState<DataStore>({
    'test-item': {
      type: 'text',
      content: '测试数据',
      description: '由数据管理 SDK 提供',
    },
  })

  const [previewVisible, setPreviewVisible] = useState(false)

  useSchemaElementEditor({
    sdkId: 'data-management-sdk',
    level: 10,
    getSchema: (params) => {
      console.log('[数据管理 SDK] getSchema 被调用:', params)
      return dataStore[params] as SchemaValue
    },
    updateSchema: (schema, params) => {
      console.log('[数据管理 SDK] updateSchema 被调用:', params, schema)
      setDataStore((prev) => ({ ...prev, [params]: schema }))
      return true
    },
  })

  useSchemaElementEditor({
    sdkId: 'preview-sdk',
    level: 100,
    renderPreview: (schema, containerId) => {
      console.log('[预览 SDK] renderPreview 被调用:', schema, containerId)
      const container = document.getElementById(containerId)
      if (container) {
        container.innerHTML = `
          <div style="padding: 16px; background: #e6f4ff; border-radius: 8px; border: 2px solid #1677ff;">
            <h3 style="margin: 0 0 8px 0; color: #1677ff;">🎨 自定义预览（由预览 SDK 渲染）</h3>
            <pre style="margin: 0; font-size: 14px;">${JSON.stringify(schema, null, 2)}</pre>
          </div>
        `
        setPreviewVisible(true)
      }
      return () => {
        console.log('[预览 SDK] 清理预览')
        if (container) {
          container.innerHTML = ''
        }
        setPreviewVisible(false)
      }
    },
  })

  return (
    <TestLayout
      title="部分方法实现测试"
      description="此测试验证只实现部分方法的场景，不同的 SDK 负责不同的功能。"
      onBack={props.onBack}
      checklistItems={[
        '点击 test-item，数据读取应该由数据管理 SDK（level: 10）处理',
        '编辑数据后，数据更新应该由数据管理 SDK 处理',
        '预览功能应该由预览 SDK（level: 100）处理',
        '这展示了关注点分离：数据管理和预览渲染由不同的 SDK 负责',
      ]}
    >
      <Alert
        message="架构说明"
        description={
          <Space direction="vertical">
            <div>
              <strong>数据管理 SDK（level: 10）</strong>：只实现 getSchema 和
              updateSchema，负责数据的 CRUD
            </div>
            <div>
              <strong>预览 SDK（level: 100）</strong>：只实现 renderPreview，负责自定义预览渲染
            </div>
            <div>
              由于预览 SDK 没有实现数据方法，数据操作会回退到数据管理 SDK
              处理。这是一种典型的职责分离模式。
            </div>
          </Space>
        }
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <SdkCard
        title="数据管理 SDK"
        level={10}
        priorityColor="blue"
        priorityText="数据层"
        extraTags={[{ color: 'green', text: '实现：getSchema, updateSchema' }]}
      >
        <div style={{ marginBottom: 12 }}>
          <Text strong>实现的方法：</Text>
          <div style={{ marginTop: 8 }}>
            <Space>
              <Text code style={{ background: '#f6ffed', padding: '2px 8px', borderRadius: 4 }}>
                getSchema
              </Text>
              <Text code style={{ background: '#f6ffed', padding: '2px 8px', borderRadius: 4 }}>
                updateSchema
              </Text>
            </Space>
          </div>
        </div>
        <div>
          <Text strong>管理的数据：</Text>
          <pre
            style={{
              margin: '8px 0 0',
              fontSize: 12,
              background: '#f0f0f0',
              padding: 8,
              borderRadius: 4,
            }}
          >
            {JSON.stringify(dataStore['test-item'], null, 2)}
          </pre>
        </div>
      </SdkCard>

      <SdkCard
        title="预览 SDK"
        level={100}
        priorityColor="purple"
        priorityText="展示层"
        extraTags={[{ color: 'orange', text: '实现：renderPreview' }]}
      >
        <div style={{ marginBottom: 12 }}>
          <Text strong>实现的方法：</Text>
          <div style={{ marginTop: 8 }}>
            <Space>
              <Text code style={{ background: '#fff1f0', padding: '2px 8px', borderRadius: 4 }}>
                renderPreview
              </Text>
            </Space>
          </div>
        </div>
        <div>
          <Text type="secondary">
            此 SDK 不管理数据，只负责提供自定义的预览渲染功能。打开编辑器的预览面板查看效果。
          </Text>
        </div>
        {previewVisible && (
          <Alert
            message="预览已激活"
            description="预览面板中的内容由此 SDK 渲染"
            type="success"
            showIcon
            style={{ marginTop: 12 }}
          />
        )}
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
        <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
          点击此元素，数据由数据管理 SDK 提供，预览由预览 SDK 渲染
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
          💡 典型应用场景
        </Text>
        <Paragraph style={{ marginBottom: 8 }}>这种分离模式适用于以下场景：</Paragraph>
        <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
          <li>基础组件库提供数据管理，业务层只添加预览功能</li>
          <li>状态管理库负责数据 CRUD，UI 库负责渲染</li>
          <li>多个团队协作，各自负责不同的功能模块</li>
          <li>渐进式增强：先有基础功能，后续按需添加高级功能</li>
        </ul>
      </div>
    </TestLayout>
  )
}
