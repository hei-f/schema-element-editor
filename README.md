# Schema Element Editor (SEE)

Chrome扩展程序，用于实时查看和编辑DOM元素的Schema数据。

![Version](https://img.shields.io/badge/version-1.27.0-blue)
![License](https://img.shields.io/badge/license-MIT-orange)

## 功能

- 🎯 **智能元素检测**: 按住 Alt/Option 键时自动检测和高亮目标元素
- 🖼️ **iframe 支持**: 支持检测页面中同源 iframe 内的元素，高亮框统一渲染在主页面
- 🔦 **批量高亮**: 支持快捷键（Alt+字母/数字）一键高亮页面所有可编辑元素，可配置快捷键和数量上限
- 🔴 **录制模式**: 按 Alt+R 进入录制模式，轮询检测Schema变化并记录快照，支持多版本Diff对比
- 📝 **Schema编辑器**: 内置CodeMirror编辑器，支持JSON格式化、压缩、转义/去转义等操作
- 🔧 **JSON 智能修复**: 自动检测JSON语法错误，一键定位错误位置并尝试智能修复
- 🧠 **AST 智能补全**: 编辑 AST 类型数据时提供字段名和类型的智能提示，支持快捷键触发
- 👁️ **实时预览**: 支持在编辑时实时预览Schema效果，可自定义预览组件
- 🤖 **智能解析**: 自动解析 Markdown 字符串为结构化数据，完美适配 AI 智能体对话场景
- 💾 **实时更新**: 修改后直接同步到页面
- 📜 **编辑历史**: 自动记录编辑历史，支持版本回退和对比，标记保存/草稿/收藏等特殊版本
- 💿 **草稿功能**: 支持手动保存和自动保存草稿，防止数据丢失
- ⭐ **收藏管理**: 快速保存和应用常用Schema配置，支持编辑已保存的收藏
- 📥📤 **导入导出**: 支持导出Schema为JSON文件，也可从文件导入，方便数据分享和备份
- ⚙️ **灵活配置**: 可自定义属性名、搜索深度、节流间隔等参数
- 🎨 **样式隔离**: 使用Shadow DOM确保样式不受页面干扰
- 🌈 **主题色配置** (v1.21.0+): 支持自定义插件主题色，配置页面和编辑器界面统一应用
- 🤝 **[Agentic UI](https://github.com/ant-design/agentic-ui) 原生支持**: 内置 postMessage 通信适配，开发环境下可直接调试 Bubble 组件数据

## 技术栈

React 19 + TypeScript + Vite + Ant Design 6 + CodeMirror 6 + Chrome Extension MV3

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 打包
npm run package

# 启动演示应用
npm run demo
```

加载到Chrome：访问 `chrome://extensions/`，开启开发者模式，选择 `dist` 目录。

### SDK 开发

```bash
# 构建 SDK
npm run build:sdk

# 发布 SDK
npm run publish:sdk
```

## 测试

```bash
# 启动演示应用
npm run demo
```

访问 http://localhost:3001

## 使用

点击工具栏图标激活插件（蓝色=激活，灰色=未激活）。

### 基础操作

- **单元素高亮**: 按住 Alt/Option 键悬停元素显示高亮，点击打开编辑器
- **批量高亮**: 按住 Alt/Option 键 + 配置的快捷键（默认A），高亮页面所有可编辑元素。松开 Alt 键清除高亮
  - 可在配置页面自定义快捷键（支持字母和数字）
  - 可配置最大高亮数量（100-1000，默认500）
- **录制模式** (v1.9.0+): 按住 Alt/Option 键 + R，进入录制模式（高亮框变红），点击元素以录制模式打开编辑器
  - 录制模式下会自动轮询检测Schema变化，记录每个不同的版本快照
  - 停止录制后，可选择任意两个版本进行Diff对比，支持原始/反序列化/AST三种对比模式
  - 可在配置页面自定义快捷键、高亮颜色和轮询间隔
- **iframe 元素检测** (v1.19.0+): 支持检测页面中同源 iframe 内的元素
  - 高亮框和 tooltip 统一渲染在主页面，不会被 iframe 边界裁剪
  - 可配置 Schema 数据来源（iframe 内部或主页面）
  - 仅支持同源 iframe，跨域 iframe 暂不支持
  - 可在配置页面开启/关闭此功能

## 页面集成

页面需提供 API 接口和 DOM 标记，插件支持两种通信模式。

### 核心 API 类型定义

无论使用哪种通信模式，获取和更新 Schema 的类型定义一致：

```typescript
/** Schema 数据类型（支持所有 JSON 类型） */
type SchemaValue = Record<string, unknown> | unknown[] | string | number | boolean | null

/** 获取 Schema 函数 */
type GetSchemaFunc<T extends SchemaValue = SchemaValue> = (params: string) => T

/** 更新 Schema 函数 */
type UpdateSchemaFunc<T extends SchemaValue = SchemaValue> = (schema: T, params: string) => boolean
```

- `params`: 参数字符串，格式为 `'param1'` 或 `'param1,param2'`
- `schema`: Schema 数据，支持所有 `JSON.parse` 可返回的类型（对象、数组、字符串、数字、布尔值、null）

### 预览 API 类型定义

预览容器统一由插件创建，宿主通过 `containerId` 获取容器并渲染内容：

```typescript
/**
 * 预览函数类型（两种模式统一）
 * @param schema - 当前编辑的 Schema 数据（支持所有 JSON 类型）
 * @param containerId - 预览容器 ID，通过 document.getElementById() 获取
 * @returns 可选的清理函数，插件关闭预览时自动调用
 */
type PreviewFunc<T extends SchemaValue = SchemaValue> = (
  schema: T,
  containerId: string
) => (() => void) | void
```

### 通信模式对比

插件支持两种通信模式，各有优劣：

| 特性           | postMessage 模式            | Window 函数模式          |
| -------------- | --------------------------- | ------------------------ |
| **接入复杂度** | 需要实现消息监听和响应      | 简单，只需暴露全局函数   |
| **命名空间**   | 不污染 window，方法不会暴露 | 需要在 window 上挂载函数 |
| **安全性**     | 更高，减少全局暴露          | 全局函数可被外部访问     |
| **可定制性**   | 支持自定义消息标识和类型    | 支持自定义函数名         |
| **健壮性**     | 内置超时机制和错误处理      | 依赖页面实现             |
| **可调试性**   | requestId 便于追踪          | 无内置追踪机制           |

### postMessage 模式

使用 postMessage 实现双向通信，不污染 window 对象，方法不会暴露给外部。

#### 使用官方 SDK（推荐）

安装 SDK：

```bash
npm install @schema-editor/host-sdk
```

**React 项目：**

```typescript
import { useSchemaEditor } from '@schema-editor/host-sdk'

function App() {
  useSchemaEditor({
    getSchema: (params) => dataStore[params],
    updateSchema: (schema, params) => {
      dataStore[params] = schema
      return true
    },
    // 可选：预览功能
    renderPreview: (schema, containerId) => {
      const container = document.getElementById(containerId)
      const root = ReactDOM.createRoot(container)
      root.render(<Preview data={schema} />)
      return () => root.unmount() // 返回清理函数
    },
  })

  return <div>...</div>
}
```

**Vue 项目：**

```typescript
import { useSchemaEditor } from '@schema-editor/host-sdk/vue'

useSchemaEditor({
  getSchema: (params) => dataStore.value[params],
  updateSchema: (schema, params) => {
    dataStore.value[params] = schema
    return true
  },
})
```

**纯 JS / 其他框架：**

```typescript
import { createSchemaEditorBridge } from '@schema-editor/host-sdk/core'

const cleanup = createSchemaEditorBridge({
  getSchema: (params) => dataStore[params],
  updateSchema: (schema, params) => {
    dataStore[params] = schema
    return true
  },
})

// 需要清理时调用
cleanup()
```

**SDK 配置项说明：**

| 配置项          | 类型                                                                 | 必需 | 说明                                                   |
| --------------- | -------------------------------------------------------------------- | ---- | ------------------------------------------------------ |
| `getSchema`     | `(params: string) => SchemaValue`                                    | ✅   | 获取 Schema 数据                                       |
| `updateSchema`  | `(schema: SchemaValue, params: string) => boolean`                   | ✅   | 更新 Schema 数据                                       |
| `renderPreview` | `(schema: SchemaValue, containerId: string) => (() => void) \| void` | ❌   | 渲染预览，可返回清理函数                               |
| `enabled`       | `boolean`（React）/ `MaybeRefOrGetter<boolean>`（Vue）               | ❌   | 是否启用桥接，默认 `true`。仅当明确设为 `false` 时禁用 |
| `sourceConfig`  | `Partial<PostMessageSourceConfig>`                                   | ❌   | 自定义消息标识                                         |
| `messageTypes`  | `Partial<PostMessageTypeConfig>`                                     | ❌   | 自定义消息类型                                         |

**条件启用示例（React）：**

```typescript
const [isReady, setIsReady] = useState(false)

useSchemaEditor({
  enabled: isReady, // 仅在 isReady 为 true 时启用
  getSchema: (params) => dataStore[params],
  updateSchema: (schema, params) => {
    dataStore[params] = schema
    return true
  },
})
```

**自定义消息配置示例：**

```typescript
useSchemaEditor({
  getSchema: (params) => dataStore[params],
  updateSchema: (schema, params) => {
    dataStore[params] = schema
    return true
  },
  // 自定义消息标识（需与插件配置页面一致）
  sourceConfig: {
    content: 'my-app-content', // 插件端标识，默认 'schema-editor-content'
    host: 'my-app-host', // 宿主端标识，默认 'schema-editor-host'
  },
  // 自定义消息类型（需与插件配置页面一致）
  messageTypes: {
    getSchema: 'MY_GET_SCHEMA', // 默认 'GET_SCHEMA'
    updateSchema: 'MY_UPDATE_SCHEMA', // 默认 'UPDATE_SCHEMA'
    checkPreview: 'MY_CHECK_PREVIEW', // 默认 'CHECK_PREVIEW'
    renderPreview: 'MY_RENDER_PREVIEW', // 默认 'RENDER_PREVIEW'
    cleanupPreview: 'MY_CLEANUP_PREVIEW', // 默认 'CLEANUP_PREVIEW'
  },
})
```

#### 手动实现 postMessage 监听

如果不使用 SDK，也可以手动实现 postMessage 监听：

```typescript
// 监听扩展请求
window.addEventListener('message', (event) => {
  // 只处理来自当前窗口的消息
  if (event.source !== window) return
  // 只处理来自插件的消息（source 可在配置页面自定义）
  if (event.data?.source !== 'schema-editor-content') return

  const { type, payload, requestId } = event.data
  let result

  // 消息类型可在配置页面自定义
  switch (type) {
    case 'GET_SCHEMA':
      // payload.params: 'param1' 或 'param1,param2'
      result = { success: true, data: getSchema(payload.params) }
      break
    case 'UPDATE_SCHEMA':
      result = { success: updateSchema(payload.schema, payload.params) }
      break
    case 'CHECK_PREVIEW':
      result = { exists: true } // 是否支持预览
      break
    case 'RENDER_PREVIEW':
      // payload.schema: 当前编辑的 Schema 数据
      // payload.containerId: 预览容器 ID
      const container = document.getElementById(payload.containerId)
      renderPreview(payload.schema, container)
      result = { success: true }
      break
    case 'CLEANUP_PREVIEW':
      // 可选：预览容器 DOM 已被插件移除，此消息用于通知宿主清理额外资源（如定时器、全局状态等）
      // 如果宿主无需额外清理，可以忽略此消息或返回空响应
      cleanupPreview?.()
      result = { success: true }
      break
  }

  // 发送响应（必须携带 requestId，source 可在配置页面自定义）
  window.postMessage(
    {
      source: 'schema-editor-host',
      requestId,
      ...result,
    },
    '*'
  )
})
```

**可配置项**（在配置页面的【集成配置】中设置）：

- 插件端 source 标识（默认：`schema-editor-content`）
- 宿主端 source 标识（默认：`schema-editor-host`）
- 消息类型名称（默认：`GET_SCHEMA`、`UPDATE_SCHEMA`、`CHECK_PREVIEW`、`RENDER_PREVIEW`、`CLEANUP_PREVIEW`）
- 请求超时时间（默认：5秒）

### Window 函数模式

接入简单，宿主应用只需在 window 上暴露方法即可：

```typescript
// 获取Schema（必需）
window.__getContentById = (params: string) => {
  return { /* Schema对象 */ }
}

// 更新Schema（必需）
window.__updateContentById = (schema, params: string) => {
  return true
}

// 预览函数（可选）
window.__getContentPreview = (data, containerId: string) => {
  const container = document.getElementById(containerId)
  const root = ReactDOM.createRoot(container)
  root.render(<Preview data={data} />)
  return () => root.unmount()
}
```

函数名可在配置页面自定义。

> ⚠️ **注意**：Window 函数模式会将方法暴露在全局 window 对象上，可能被页面其他脚本访问。如果对安全性有要求，建议使用 postMessage 模式。

### 预览功能 (v1.2.0+)

使用方式：

1. 在编辑器工具栏点击"预览"按钮开启预览
2. 预览区域会在抽屉左侧显示
3. 可拖拽分隔条调整预览/编辑器宽度
4. 支持手动更新或自动更新预览（可在配置页面设置）

**内置预览器 (v1.25.0+)**：

当宿主页面未提供 `renderPreview` 函数时，插件提供内置的 Markdown 预览器作为 fallback：

- 支持 AST（Elements[]）类型内容的预览
- 支持 RawString（Markdown 字符串）类型内容的预览
- 实时响应编辑内容变化，无需手动刷新
- 可在配置页面【预览行为】中开启/关闭「启用内置预览器」选项

> **注意**：内置预览器仅支持 AST 和 RawString 类型，JSON 对象类型不支持预览。如需自定义预览效果，建议宿主页面提供 `renderPreview` 函数。

### 元素标记

```html
<!-- 单个参数 -->
<div data-id="param1"></div>

<!-- 多个参数 -->
<div data-id="param1,param2"></div>
```

属性值为参数数组的 `join(',')` 结果。

> **注意**：`data-id` 符合 Agentic UI 的规范，使用默认配置即可，无需用户手动配置属性名。如有特殊需求，属性名也可在配置页面自定义。

### Agentic UI 集成

Agentic UI 已内置 postMessage 通信适配，开发环境下开箱即用。

**使用方式：**

1. 激活插件（工具栏图标变为蓝色）
2. 按住 Alt/Option 悬停目标 Bubble，点击打开编辑器

**组件要求：**

| 组件         | 要求                                       |
| ------------ | ------------------------------------------ |
| `Bubble`     | 需配置 `id` 属性                           |
| `BubbleList` | 数据项需包含 `id` 字段（组件内部自动传递） |

```tsx
// Bubble 需指定 id
<Bubble
  id="msg-1"
  originData={{ id: 'msg-1', role: 'assistant', content: '# Hello' }}
/>

// BubbleList 数据项需包含 id 字段
<BubbleList bubbleList={[{ id: 'msg-1', role: 'assistant', content: '...' }]} />
```

### Markdown 字符串自动解析 (v1.0.6+)

插件支持智能体对话场景，当 `__getContentById` 返回字符串类型时，会自动将其解析为 Markdown Elements 结构：

```typescript
// AI 智能体返回 Markdown 字符串
window.__getContentById = (params: string) => {
  return `# 智能体回复

这是智能体生成的内容...

- 支持列表
- 支持代码块
- 支持各种 Markdown 语法`
}
```

插件会自动将 Markdown 字符串解析为结构化的 Elements 数组进行编辑，保存时自动转换回 Markdown 字符串。该功能默认开启，符合 Agentic UI 的数据规范，可在配置页面【高级】选项中关闭。

### AST 智能类型提示 (v1.5.0+)

编辑 AST (Elements[]) 类型数据时，插件提供字段名和类型的智能补全功能：

**功能特性：**

- 🎯 **上下文感知**: 根据当前光标位置智能推断可用字段
- ⚡ **实时补全**: 输入时自动触发补全提示
- ⌨️ **快捷键支持**:
  - `Cmd/Ctrl + .` 手动触发补全
  - `Alt + /` 备用快捷键
- 📚 **类型提示**: 显示字段类型和描述信息
- 🔧 **可配置**: 可在配置页面开启/关闭该功能

**支持的字段类型：**

- Element 对象：`type`, `children`, `text`, `bold`, `url`, `code`, `italic` 等
- 类型值：`paragraph`, `heading-one`, `heading-two`, `link` 等

该功能默认开启，可在配置页面【编辑器】选项中调整。

## 项目结构

```
├── src/                    # 插件源码
│   ├── core/               # 核心功能（background、content script）
│   ├── features/           # 功能模块（schema-drawer、favorites、options-page）
│   └── shared/             # 共享资源（components、managers、types、utils）
├── packages/
│   └── host-sdk/           # 宿主接入 SDK（@schema-editor/host-sdk）
└── demo/                   # 演示应用
```
