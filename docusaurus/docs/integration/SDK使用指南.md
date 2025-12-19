---
id: SDK使用指南
title: SDK 使用指南
sidebar_position: 3
---

`@schema-element-editor/host-sdk` 是 Schema Element Editor 的官方宿主端 SDK，提供便捷的 postMessage 通信封装。

## 安装

```bash
npm install @schema-element-editor/host-sdk
```

支持的框架：

- React（内置 hooks）
- Vue（内置 composable）
- 纯 JavaScript / 其他框架

## React 项目

### 基本用法

```tsx
import { useSchemaElementEditor } from '@schema-element-editor/host-sdk'

function App() {
  // 数据存储（示例）
  const [dataStore, setDataStore] = useState<Record<string, any>>({
    'message-1': { type: 'paragraph', children: [{ text: 'Hello' }] },
  })

  useSchemaElementEditor({
    // 获取 Schema（可选，但通常需要提供）
    getSchema: (params) => dataStore[params],

    // 更新 Schema（可选，但通常需要提供）
    updateSchema: (schema, params) => {
      setDataStore((prev) => ({ ...prev, [params]: schema }))
      return true
    },
  })

  return <div data-id="message-1">可编辑的内容</div>
}
```

**注意**：`getSchema` 和 `updateSchema` 现在是可选的，这允许你创建专门提供某些功能的 SDK 实例（如仅提供预览功能），让其他 SDK 处理数据管理。详见[多 SDK 实例共存](#多-sdk-实例共存)章节。

### 添加预览功能

```tsx
import { useSchemaElementEditor } from '@schema-element-editor/host-sdk'
import ReactDOM from 'react-dom/client'

function PreviewComponent({ data }: { data: any }) {
  return <pre>{JSON.stringify(data, null, 2)}</pre>
}

function App() {
  useSchemaElementEditor({
    getSchema: (params) => dataStore[params],
    updateSchema: (schema, params) => {
      /* ... */
    },

    // 预览函数（可选）
    renderPreview: (schema, containerId) => {
      const container = document.getElementById(containerId)
      if (!container) return

      const root = ReactDOM.createRoot(container)
      root.render(<PreviewComponent data={schema} />)

      // 返回清理函数
      return () => root.unmount()
    },
  })

  return <div>...</div>
}
```

### 条件启用

```tsx
function App() {
  const [isReady, setIsReady] = useState(false)

  useSchemaElementEditor({
    // 仅在 isReady 为 true 时启用
    enabled: isReady,
    getSchema: (params) => dataStore[params],
    updateSchema: (schema, params) => {
      /* ... */
    },
  })

  useEffect(() => {
    // 某些初始化完成后启用
    initializeData().then(() => setIsReady(true))
  }, [])

  return <div>...</div>
}
```

### 录制模式数据推送

```tsx
function App() {
  const { recording } = useSchemaElementEditor({
    getSchema: (params) => dataStore[params],
    updateSchema: (schema, params) => {
      /* ... */
    },
  })

  // 数据变化时推送（SDK 内部管理录制状态）
  useEffect(() => {
    const handleSSEData = (params: string, data: any) => {
      // 更新本地数据
      dataStore[params] = data

      // 推送给插件（未录制时静默忽略）
      recording.push(params, data)
    }

    sseConnection.on('data', handleSSEData)
    return () => sseConnection.off('data', handleSSEData)
  }, [recording])

  return <div>...</div>
}
```

## Vue 项目

### 基本用法

```vue
<script setup lang="ts">
import { useSchemaElementEditor } from '@schema-element-editor/host-sdk/vue'
import { ref } from 'vue'

const dataStore = ref<Record<string, any>>({
  'message-1': { type: 'paragraph', children: [{ text: 'Hello' }] },
})

const { recording } = useSchemaElementEditor({
  getSchema: (params) => dataStore.value[params],
  updateSchema: (schema, params) => {
    dataStore.value[params] = schema
    return true
  },
})
</script>

<template>
  <div data-id="message-1">可编辑的内容</div>
</template>
```

### 条件启用

```vue
<script setup lang="ts">
import { useSchemaElementEditor } from '@schema-element-editor/host-sdk/vue'
import { ref, computed } from 'vue'

const isReady = ref(false)

useSchemaElementEditor({
  // 支持 ref 或 computed
  enabled: isReady,
  getSchema: (params) => dataStore.value[params],
  updateSchema: (schema, params) => {
    /* ... */
  },
})

onMounted(async () => {
  await initializeData()
  isReady.value = true
})
</script>
```

## 纯 JavaScript / 其他框架

### 基本用法

```typescript
import { createSchemaElementEditorBridge } from '@schema-element-editor/host-sdk/core'

// 创建桥接器
const bridge = createSchemaElementEditorBridge({
  getSchema: (params) => dataStore[params],
  updateSchema: (schema, params) => {
    dataStore[params] = schema
    return true
  },
})

// 需要清理时调用
// bridge.cleanup()
```

### 录制模式

```typescript
const bridge = createSchemaElementEditorBridge({
  getSchema: (params) => dataStore[params],
  updateSchema: (schema, params) => {
    /* ... */
  },
})

// 数据变化时推送
sseHandler.onData = (params, data) => {
  bridge.recording.push(params, data)
}
```

## 配置选项

### 完整配置接口

```typescript
interface SchemaEditorConfig {
  /** 获取 Schema（可选） */
  getSchema?: (params: string) => SchemaValue

  /** 更新 Schema（可选） */
  updateSchema?: (schema: SchemaValue, params: string) => boolean

  /** 渲染预览（可选） */
  renderPreview?: (schema: SchemaValue, containerId: string) => (() => void) | void

  /** 消息标识配置（可选） */
  sourceConfig?: {
    contentSource?: string // 默认 'schema-element-editor-content'
    hostSource?: string // 默认 'schema-element-editor-host'
  }

  /** 消息类型配置（可选） */
  messageTypes?: {
    getSchema?: string // 默认 'GET_SCHEMA'
    updateSchema?: string // 默认 'UPDATE_SCHEMA'
    checkPreview?: string // 默认 'CHECK_PREVIEW'
    renderPreview?: string // 默认 'RENDER_PREVIEW'
    cleanupPreview?: string // 默认 'CLEANUP_PREVIEW'
    startRecording?: string // 默认 'START_RECORDING'
    stopRecording?: string // 默认 'STOP_RECORDING'
    schemaPush?: string // 默认 'SCHEMA_PUSH'
  }
}

// React 额外配置
interface ReactSchemaEditorConfig extends SchemaEditorConfig {
  /** 是否启用（默认 true） */
  enabled?: boolean
}
```

**方法说明**：

虽然所有方法都是可选的，但实际使用时应根据功能需求实现相应的方法：

- **数据查看场景**：至少实现 `getSchema`
- **数据编辑场景**：实现 `getSchema` 和 `updateSchema`
- **需要预览功能**：额外实现 `renderPreview`
- **只提供预览功能**：只实现 `renderPreview`（让其他 SDK 处理数据）

SDK 会根据实现的方法自动注册相应的功能，未实现的方法不会响应插件请求。

### 自定义消息配置

```typescript
useSchemaElementEditor({
  getSchema: (params) => dataStore[params],
  updateSchema: (schema, params) => {
    /* ... */
  },

  // 自定义消息标识（需与插件配置一致）
  sourceConfig: {
    contentSource: 'my-app-content',
    hostSource: 'my-app-host',
  },

  // 自定义消息类型（需与插件配置一致）
  messageTypes: {
    getSchema: 'MY_GET_SCHEMA',
    updateSchema: 'MY_UPDATE_SCHEMA',
    // 其他使用默认值
  },
})
```

## 返回值

### React

```typescript
interface UseSchemaEditorReturn {
  recording: {
    /** 推送 Schema 数据（未录制时静默忽略） */
    push: (params: string, data: SchemaValue) => void
  }
}

const { recording } = useSchemaElementEditor({
  /* ... */
})
```

### Vue

同 React，返回 `{ recording }` 对象。

### Core

```typescript
interface SchemaEditorBridge {
  /** 清理桥接器 */
  cleanup: () => void

  /** 录制相关方法 */
  recording: {
    push: (params: string, data: SchemaValue) => void
  }
}

const bridge = createSchemaElementEditorBridge({
  /* ... */
})
```

## iframe 场景

SDK 自动处理 iframe 场景：

- 自动检测是否在 iframe 中
- 接收来自自身和父窗口的消息
- 响应自动发送给正确的目标窗口

无需额外配置。

## TypeScript 支持

SDK 完全使用 TypeScript 编写，提供完整的类型定义。

### 导出的类型

```typescript
import type {
  SchemaValue,
  SchemaEditorConfig,
  PostMessageSourceConfig,
  PostMessageTypeConfig,
  SchemaEditorBridge,
  SchemaEditorRecording,
} from '@schema-element-editor/host-sdk'
```

## 最佳实践

### 1. 正确处理清理

React 和 Vue 版本会自动处理清理，使用 Core 版本时需要手动清理：

```typescript
const bridge = createSchemaElementEditorBridge({
  /* ... */
})

// 页面卸载时
window.addEventListener('beforeunload', () => {
  bridge.cleanup()
})
```

### 2. 预览函数的清理

如果 `renderPreview` 创建了需要清理的资源（如 React root、事件监听器等），应该返回清理函数：

```typescript
renderPreview: (schema, containerId) => {
  const container = document.getElementById(containerId)
  const root = ReactDOM.createRoot(container)
  root.render(<Preview data={schema} />)

  // 返回清理函数,SDK 会在下次渲染前或清理预览时调用
  return () => root.unmount()
}
```

如果只是简单修改 DOM 内容，可以不返回清理函数：

```typescript
renderPreview: (schema, containerId) => {
  const container = document.getElementById(containerId)
  if (container) {
    container.innerHTML = `<pre>${JSON.stringify(schema, null, 2)}</pre>`
  }
  // 不需要返回清理函数
}
```

## 多 SDK 实例共存

### 场景说明

在某些情况下，页面可能同时存在多个 SDK 实例：

- 基础组件库内部集成了 SDK
- 用户应用层也使用了 SDK
- 多个独立模块各自使用 SDK

SDK 提供了**优先级协商机制**，确保多实例场景下插件能正常工作。

### 优先级配置

#### 基本优先级

使用 `level` 配置整体优先级（数值越大优先级越高）：

```tsx
// 用户应用层 SDK - 高优先级
useSchemaElementEditor({
  level: 100, // 高优先级
  getSchema: (params) => myDataStore[params],
  updateSchema: (schema, params) => {
    myDataStore[params] = schema
    return true
  },
})

// 基础组件库内部 SDK - 低优先级（或不配置，默认 0）
useSchemaElementEditor({
  level: 10, // 低优先级
  getSchema: (params) => componentDataStore[params],
  updateSchema: (schema, params) => {
    componentDataStore[params] = schema
    return true
  },
})
```

**协商规则**：

- 当多个 SDK 同时存在时，只有优先级最高的 SDK 响应插件请求
- 默认 `level: 0`，未配置优先级的 SDK 优先级最低
- 相同优先级时，所有该优先级的 SDK 都会响应（保持向后兼容）

#### 同级SDK的数据域管理

**⚠️ 重要说明**：

**不推荐在同一页面使用多个相同优先级的SDK**。每个页面理想情况下应该只有一个SDK实例负责数据管理。多SDK实例主要用于以下特殊场景：

- 基础组件库内部集成了SDK，用户应用层也需要使用SDK
- 需要对不同模块的数据使用不同的优先级管理

如果确实需要多个相同优先级的SDK共存，**必须确保它们管理不同的数据域**，否则会导致冲突和不确定行为。

**✅ 如果必须使用多个同级SDK，推荐做法**：

```tsx
// 用户应用SDK - 管理 user-* 前缀的数据
useSchemaElementEditor({
  level: 100,
  getSchema: (params) => {
    // 只返回 user-* 的数据，其他返回 undefined
    if (params.startsWith('user-')) {
      return userDataStore[params]
    }
    return undefined // 让其他SDK处理
  },
  updateSchema: (schema, params) => {
    if (params.startsWith('user-')) {
      userDataStore[params] = schema
      return true
    }
    return false
  },
})

// 组件库SDK - 管理 component-* 前缀的数据
useSchemaElementEditor({
  level: 100,
  getSchema: (params) => {
    if (params.startsWith('component-')) {
      return componentDataStore[params]
    }
    return undefined
  },
  updateSchema: (schema, params) => {
    if (params.startsWith('component-')) {
      componentDataStore[params] = schema
      return true
    }
    return false
  },
})
```

**SDK的智能响应机制**：

- 当某个SDK对于请求返回 `undefined`（无数据）或执行失败时，SDK会自动跳过响应
- 这样可以避免"无效响应先到达，有效响应被忽略"的问题
- 只有真正有数据/能处理该请求的SDK才会响应

**❌ 避免的做法**：

```tsx
// 错误：多个同级SDK管理相同的data-id
// SDK-A
useSchemaElementEditor({
  level: 100,
  getSchema: (params) => dataStoreA[params], // 可能有 'item-1'
})

// SDK-B
useSchemaElementEditor({
  level: 100,
  getSchema: (params) => dataStoreB[params], // 也可能有 'item-1'
})
// 如果两个SDK都有'item-1'的数据，插件会使用第一个到达的响应，行为不确定
```

**如果必须让多个SDK管理相同数据**：

使用不同的 `level` 优先级，只让最高优先级的SDK响应：

```tsx
useSchemaElementEditor({
  level: 100, // 高优先级
  getSchema: (params) => primaryDataStore[params],
})

useSchemaElementEditor({
  level: 50, // 低优先级（会被阻塞）
  getSchema: (params) => backupDataStore[params],
})
```

#### 方法级别优先级

可以为每个方法单独配置优先级：

```tsx
useSchemaElementEditor({
  level: 50, // 默认优先级
  methodLevels: {
    getSchema: 100, // getSchema 使用更高优先级
    updateSchema: 100,
    renderPreview: 10, // 预览功能使用较低优先级
  },
  getSchema: (params) => dataStore[params],
  updateSchema: (schema, params) => {
    /* ... */
  },
  renderPreview: (schema, containerId) => {
    /* ... */
  },
})
```

**方法级别配置说明**：

- 未配置的方法使用 `level` 作为优先级
- 方法级别优先级覆盖默认 `level`
- 支持的方法：`getSchema`、`updateSchema`、`checkPreview`、`renderPreview`、`cleanupPreview`、`startRecording`、`stopRecording`

### SDK 实例标识

可选配置 `sdkId` 用于调试和追踪：

```tsx
useSchemaElementEditor({
  sdkId: 'my-app-sdk', // 自定义 ID，方便调试
  level: 100,
  getSchema: (params) => dataStore[params],
  updateSchema: (schema, params) => {
    /* ... */
  },
})
```

如果不配置，SDK 会自动生成唯一 ID。

### 完整示例

#### 场景：组件库 + 用户应用

**组件库代码**（低优先级）：

```tsx
// 基础组件库内部
import { useSchemaElementEditor } from '@schema-element-editor/host-sdk'

function UILibraryProvider({ children }) {
  useSchemaElementEditor({
    sdkId: 'ui-library-sdk',
    level: 10, // 低优先级
    getSchema: (params) => {
      // 组件库的数据获取逻辑
      return componentRegistry.getData(params)
    },
    updateSchema: (schema, params) => {
      componentRegistry.updateData(params, schema)
      return true
    },
  })

  return <>{children}</>
}
```

**用户应用代码**（高优先级）：

```tsx
// 用户应用层
import { useSchemaElementEditor } from '@schema-element-editor/host-sdk'

function App() {
  const [myData, setMyData] = useState({})

  useSchemaElementEditor({
    sdkId: 'my-app-sdk',
    level: 100, // 高优先级，覆盖组件库
    getSchema: (params) => myData[params],
    updateSchema: (schema, params) => {
      setMyData((prev) => ({ ...prev, [params]: schema }))
      return true
    },
  })

  return (
    <UILibraryProvider>
      <div data-id="user-content">用户内容</div>
    </UILibraryProvider>
  )
}
```

**结果**：插件请求会优先由用户应用的 SDK 响应（`level: 100`），组件库的 SDK（`level: 10`）不会响应。

#### 场景 2：只提供特定功能

有时用户只想添加某些功能（如预览），而让基础库处理数据管理：

**基础组件库代码**：

```tsx
// 基础组件库 - 提供完整的数据管理
useSchemaElementEditor({
  sdkId: 'ui-library-sdk',
  level: 10,
  getSchema: (params) => componentRegistry.getData(params),
  updateSchema: (schema, params) => {
    componentRegistry.updateData(params, schema)
    return true
  },
})
```

**用户应用代码**：

```tsx
// 用户应用 - 只添加自定义预览
useSchemaElementEditor({
  sdkId: 'my-preview-sdk',
  level: 100,
  // 不提供 getSchema 和 updateSchema，让基础库处理
  renderPreview: (schema, containerId) => {
    // 用户自定义的预览渲染逻辑
    const container = document.getElementById(containerId)
    if (container) {
      container.innerHTML = renderMyCustomPreview(schema)
    }
  },
})
```

**结果**：
- `getSchema` / `updateSchema` 请求 → 基础库 SDK 处理（level: 10，因为用户 SDK 没实现这些方法）
- `renderPreview` 请求 → 用户应用 SDK 处理（level: 100）

这种模式让用户可以复用基础库的数据管理逻辑，只需添加自己的定制功能。

### 工作原理

1. **初始化阶段**：每个 SDK 初始化时，通过 `postMessage` 广播自己的优先级信息
2. **协商阶段**：各 SDK 收集其他 SDK 的优先级，判断自己是否应该响应
3. **响应阶段**：插件发送请求时，只有优先级最高的 SDK 响应

**优势**：

- ✅ 去中心化：SDK 之间点对点通信，无需全局协调器
- ✅ 自动化：无需用户手动配置，自动协商
- ✅ 向后兼容：未配置优先级的旧版 SDK 仍可正常工作
- ✅ 灵活性：支持整体和方法级别的优先级配置

## 故障排除

### SDK 不工作

1. **检查安装**：确认 `@schema-element-editor/host-sdk` 已安装
2. **检查导入路径**：
   - React: `@schema-element-editor/host-sdk`
   - Vue: `@schema-element-editor/host-sdk/vue`
   - Core: `@schema-element-editor/host-sdk/core`
3. **检查 enabled 配置**：确认不是 `false`

### 配置与插件不匹配

如果自定义了 `sourceConfig` 或 `messageTypes`，确保与插件配置页面的设置一致。

### 录制推送不工作

1. 确认插件处于录制模式
2. 确认 `params` 与正在录制的元素匹配
3. 检查浏览器控制台是否有错误

### 多 SDK 实例问题

1. **检查优先级配置**：确认高优先级 SDK 的 `level` 值足够大
2. **检查 data-id 重复**：如果不同 SDK 管理相同的 `data-id`，确保优先级配置正确
3. **调试技巧**：配置 `sdkId` 便于在控制台中追踪 SDK 行为
