import { createSchemaEditorBridge } from '@schema-editor/host-sdk'
import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'

/** iframe 内的 Schema 数据存储 */
const schemaStore: Record<string, unknown> = {
  'iframe-element-1': {
    title: 'iframe 元素 1 的 Schema',
    description: '来自 iframe 内部',
    value: 123,
  },
  'iframe-element-2': ['apple', 'banana', 'cherry'],
  'iframe-nested-object': {
    user: { name: 'Alice', age: 25 },
    settings: { theme: 'dark', lang: 'zh-CN' },
  },
}

/** iframe 测试应用 */
function IframeApp() {
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs((prev) => [...prev.slice(-10), `${new Date().toLocaleTimeString()} - ${message}`])
  }

  useEffect(() => {
    // 使用 SDK 创建桥接
    const cleanup = createSchemaEditorBridge({
      getSchema: (params) => {
        const data = schemaStore[params]
        addLog(`getSchema: ${params} => ${JSON.stringify(data)}`)
        return data ?? null
      },
      updateSchema: (schema, params) => {
        schemaStore[params] = schema
        addLog(`updateSchema: ${params} => ${JSON.stringify(schema)}`)
        return true
      },
    })

    // 使用 setTimeout 避免在 effect 中同步调用 setState
    setTimeout(() => addLog('SDK 桥接已初始化'), 0)

    return cleanup
  }, [])

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 20 }}>
      <div
        style={{
          background: 'linear-gradient(135deg, #e6fffb 0%, #87e8de 100%)',
          padding: 16,
          borderRadius: 8,
          marginBottom: 20,
          border: '1px solid #5cdbd3',
        }}
      >
        <h3 style={{ color: '#006d75', margin: '0 0 8px 0' }}>🖼️ iframe 内部 (使用 SDK)</h3>
        <p style={{ color: '#08979c', fontSize: 13, margin: 0 }}>
          按住 Alt/Option 键悬停在下方元素上测试
        </p>
      </div>

      <div
        style={{
          background: '#f6ffed',
          border: '1px solid #b7eb8f',
          borderRadius: 6,
          padding: 12,
          marginBottom: 16,
          fontSize: 12,
        }}
      >
        ✅ 使用 <code>@schema-editor/host-sdk</code> 初始化，自动处理 iframe 通信
      </div>

      <TestElement id="iframe-element-1" title="iframe 元素 1" valid />
      <TestElement id="iframe-element-2" title="iframe 元素 2" valid />
      <TestElement id="iframe-nested-object" title="嵌套对象数据" valid />
      <TestElement title="无效元素" valid={false} />

      <div
        style={{
          marginTop: 20,
          padding: 12,
          background: '#fafafa',
          borderRadius: 6,
          fontSize: 11,
          fontFamily: 'monospace',
          maxHeight: 150,
          overflow: 'auto',
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 8 }}>📋 日志</div>
        {logs.map((log, i) => (
          <div key={i} style={{ color: '#666' }}>
            {log}
          </div>
        ))}
      </div>
    </div>
  )
}

/** 测试元素组件 */
function TestElement({ id, title, valid }: { id?: string; title: string; valid: boolean }) {
  return (
    <div
      data-id={id}
      style={{
        padding: 16,
        border: '1px solid #d9d9d9',
        borderRadius: 8,
        marginBottom: 12,
        cursor: 'pointer',
        background: '#fff',
        borderLeft: `4px solid ${valid ? '#52c41a' : '#ff4d4f'}`,
      }}
    >
      <div style={{ fontWeight: 600, color: '#262626', marginBottom: 4 }}>
        {title}
        <span
          style={{
            display: 'inline-block',
            padding: '2px 8px',
            borderRadius: 4,
            fontSize: 11,
            marginLeft: 8,
            background: valid ? '#f6ffed' : '#fff2f0',
            color: valid ? '#389e0d' : '#cf1322',
          }}
        >
          {valid ? '有效' : '非法'}
        </span>
      </div>
      {id && (
        <div
          style={{
            fontFamily: 'Consolas, monospace',
            background: '#f5f5f5',
            padding: '4px 8px',
            borderRadius: 4,
            marginTop: 8,
            fontSize: 11,
            color: '#595959',
          }}
        >
          data-id="{id}"
        </div>
      )}
    </div>
  )
}

// 渲染应用
createRoot(document.getElementById('root')!).render(<IframeApp />)
