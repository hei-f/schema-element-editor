# postMessage 模式

postMessage 模式是 Schema Element Editor 推荐的集成方式，使用 `window.postMessage` 进行通信，不污染全局对象。

## 优势

- 🔒 **安全性高** - 方法不暴露在 window 对象上
- 📦 **命名空间隔离** - 不会与页面其他代码冲突
- 🛡️ **健壮性强** - 内置超时机制和错误处理
- 🎯 **可追踪** - requestId 便于调试和追踪
- 🚀 **录制模式** - 支持事件驱动的数据推送

## 使用官方 SDK（推荐）

最简单的集成方式是使用官方 SDK。详细说明请参阅 [SDK 使用指南](./SDK使用指南.md)。

```bash
npm install @schema-element-editor/host-sdk
```

```typescript
import { useSchemaElementEditor } from '@schema-element-editor/host-sdk'

function App() {
  useSchemaElementEditor({
    getSchema: (params) => dataStore[params],
    updateSchema: (schema, params) => {
      dataStore[params] = schema
      return true
    },
  })
  // ...
}
```

## 手动实现

如果不使用 SDK，也可以手动实现 postMessage 监听。

### 消息格式

**插件发送的请求**：

```typescript
interface PluginRequest {
  source: string // 默认 'schema-element-editor-content'
  type: string // 消息类型，如 'GET_SCHEMA'
  payload?: object // 请求数据
  requestId: string // 请求 ID，响应时需要原样返回
}
```

**宿主返回的响应**：

```typescript
interface HostResponse {
  source: string // 默认 'schema-element-editor-host'
  requestId: string // 与请求相同的 ID
  success?: boolean // 操作是否成功
  data?: any // 返回的数据
  error?: string // 错误信息
  exists?: boolean // 用于 CHECK_PREVIEW
}
```

### 完整实现示例

```typescript
// 监听扩展请求
window.addEventListener('message', (event) => {
  // 只处理来自当前窗口的消息
  if (event.source !== window) return

  // 只处理来自插件的消息
  if (event.data?.source !== 'schema-element-editor-content') return

  const { type, payload, requestId } = event.data
  let result

  switch (type) {
    case 'GET_SCHEMA': {
      // payload.params: 'param1' 或 'param1,param2'
      const data = getSchemaFromStore(payload.params)
      result = { success: true, data }
      break
    }

    case 'UPDATE_SCHEMA': {
      // payload.schema: Schema 数据
      // payload.params: 元素参数
      const success = saveSchemaToStore(payload.schema, payload.params)
      result = { success }
      break
    }

    case 'CHECK_PREVIEW': {
      // 检查是否支持预览
      result = { exists: typeof renderPreview === 'function' }
      break
    }

    case 'RENDER_PREVIEW': {
      // payload.schema: Schema 数据
      // payload.containerId: 预览容器 ID
      const container = document.getElementById(payload.containerId)
      renderPreview(payload.schema, container)
      result = { success: true }
      break
    }

    case 'CLEANUP_PREVIEW': {
      // 清理预览资源（如定时器、全局状态）
      cleanupPreview?.()
      result = { success: true }
      break
    }

    case 'START_RECORDING': {
      // 开始录制（可选实现）
      // payload.params: 元素参数
      startRecording?.(payload.params)
      result = { success: true }
      break
    }

    case 'STOP_RECORDING': {
      // 停止录制（可选实现）
      // payload.params: 元素参数
      stopRecording?.(payload.params)
      result = { success: true }
      break
    }

    default:
      // 未知消息类型，不处理
      return
  }

  // 发送响应（必须携带 requestId）
  window.postMessage(
    {
      source: 'schema-element-editor-host',
      requestId,
      ...result,
    },
    '*'
  )
})
```

### 消息类型说明

| 消息类型          | 说明                 | 必需 |
| ----------------- | -------------------- | ---- |
| `GET_SCHEMA`      | 获取 Schema 数据     | ✅   |
| `UPDATE_SCHEMA`   | 更新 Schema 数据     | ✅   |
| `CHECK_PREVIEW`   | 检查预览功能是否可用 | ❌   |
| `RENDER_PREVIEW`  | 渲染预览内容         | ❌   |
| `CLEANUP_PREVIEW` | 清理预览资源         | ❌   |
| `START_RECORDING` | 通知开始录制         | ❌   |
| `STOP_RECORDING`  | 通知停止录制         | ❌   |

## 主动推送数据（录制模式）

在录制模式下，宿主可以主动推送数据给插件，而不是等待插件轮询。

### 推送消息格式

```typescript
window.postMessage(
  {
    source: 'schema-element-editor-host',
    type: 'SCHEMA_PUSH',
    payload: {
      success: true,
      data: schemaData, // Schema 数据
      params: 'message-1', // 元素参数
    },
  },
  '*'
)
```

### 使用 SDK 推送

使用 SDK 时，调用 `recording.push()` 方法：

```typescript
const { recording } = useSchemaElementEditor({
  getSchema: (params) => dataStore[params],
  updateSchema: (schema, params) => {
    /* ... */
  },
})

// 数据变化时推送
sseHandler.onData = (params, data) => {
  recording.push(params, data)
}
```

> 💡 SDK 内部会判断是否正在录制，未录制时静默忽略推送。

## 自定义配置

### 在插件配置页面自定义

打开插件配置页面，在「集成配置」中可以自定义：

| 配置项          | 默认值                          |
| --------------- | ------------------------------- |
| 插件端 source   | `schema-element-editor-content` |
| 宿主端 source   | `schema-element-editor-host`    |
| GET_SCHEMA      | `GET_SCHEMA`                    |
| UPDATE_SCHEMA   | `UPDATE_SCHEMA`                 |
| CHECK_PREVIEW   | `CHECK_PREVIEW`                 |
| RENDER_PREVIEW  | `RENDER_PREVIEW`                |
| CLEANUP_PREVIEW | `CLEANUP_PREVIEW`               |
| START_RECORDING | `START_RECORDING`               |
| STOP_RECORDING  | `STOP_RECORDING`                |
| SCHEMA_PUSH     | `SCHEMA_PUSH`                   |

### 在代码中自定义（使用 SDK）

```typescript
useSchemaElementEditor({
  getSchema: (params) => dataStore[params],
  updateSchema: (schema, params) => {
    /* ... */
  },

  // 自定义消息标识
  sourceConfig: {
    content: 'my-app-content',
    host: 'my-app-host',
  },

  // 自定义消息类型
  messageTypes: {
    getSchema: 'MY_GET_SCHEMA',
    updateSchema: 'MY_UPDATE_SCHEMA',
    // ...
  },
})
```

> ⚠️ 代码中的配置需要与插件配置页面中的设置一致。

## iframe 场景

### 消息接收

如果您的页面在 iframe 中，需要同时处理来自自身和父窗口的消息：

```typescript
window.addEventListener('message', (event) => {
  // 接受来自当前窗口或父窗口的消息
  const isFromSelf = event.source === window
  const isFromParent = window !== window.top && event.source === window.parent

  if (!isFromSelf && !isFromParent) return

  // 处理消息...
})
```

### 消息发送

在 iframe 中，响应需要发送给父窗口：

```typescript
const isInIframe = window !== window.top
const targetWindow = isInIframe ? window.parent : window

targetWindow.postMessage(
  {
    source: 'schema-element-editor-host',
    requestId,
    // ...
  },
  '*'
)
```

> 💡 使用 SDK 时，这些都会自动处理。

## 错误处理

### 超时处理

插件默认等待响应 5 秒，超时后会显示错误。

可以在配置页面调整「请求超时时间」（1-30 秒）。

### 返回错误信息

```typescript
// 成功响应
result = { success: true, data: schemaData }

// 失败响应
result = { success: false, error: '获取数据失败：找不到指定元素' }
```

## 故障排除

### 通信不工作

1. **检查 source 标识**
   - 确认代码中的 source 与插件配置一致
   - 检查是否有拼写错误

2. **检查 requestId**
   - 响应必须包含与请求相同的 requestId
   - 没有 requestId 的响应会被忽略

3. **检查消息类型**
   - 确认消息类型名称与配置一致
   - 注意大小写

### 调试技巧

在浏览器控制台监听所有 postMessage：

```javascript
window.addEventListener('message', (e) => {
  if (e.data?.source?.includes('schema-element-editor')) {
    console.log('Schema Element Editor message:', e.data)
  }
})
```
