# Schema Editor

Chrome扩展程序，用于实时查看和编辑DOM元素的Schema数据。

![Version](https://img.shields.io/badge/version-1.11.0-blue)
![License](https://img.shields.io/badge/license-MIT-orange)

## 功能

- 🎯 **智能元素检测**: 按住 Alt/Option 键时自动检测和高亮目标元素
- 🔦 **批量高亮**: 支持快捷键（Alt+字母/数字）一键高亮页面所有可编辑元素，可配置快捷键和数量上限
- 🔴 **录制模式**: 按 Alt+R 进入录制模式，轮询检测Schema变化并记录快照，支持多版本Diff对比
- 📝 **Schema编辑器**: 内置CodeMirror编辑器，支持JSON格式化和校验
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

## 技术栈

React 18 + TypeScript + Vite + Ant Design 5 + CodeMirror + Chrome Extension MV3

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
```

加载到Chrome：访问 `chrome://extensions/`，开启开发者模式，选择 `dist` 目录。

## 测试

**方式一：一键启动（推荐）**

```bash
npm run test:dev
```

访问 http://localhost:8080/index.html

**方式二：分开启动**

```bash
# 终端1：启动开发服务器
npm run dev

# 终端2：启动测试页面
npm run test:page
```

访问 http://localhost:8080/index.html

## 使用

点击工具栏图标激活插件（绿色=激活，灰色=未激活）。

### 基础操作

- **单元素高亮**: 按住 Alt/Option 键悬停元素显示高亮，点击打开编辑器
- **批量高亮**: 按住 Alt/Option 键 + 配置的快捷键（默认A），高亮页面所有可编辑元素。松开 Alt 键清除高亮
  - 可在配置页面自定义快捷键（支持字母和数字）
  - 可配置最大高亮数量（100-1000，默认500）
- **录制模式** (v1.9.0+): 按住 Alt/Option 键 + R，进入录制模式（高亮框变红），点击元素以录制模式打开编辑器
  - 录制模式下会自动轮询检测Schema变化，记录每个不同的版本快照
  - 停止录制后，可选择任意两个版本进行Diff对比，支持原始/反序列化/AST三种对比模式
  - 可在配置页面自定义快捷键、高亮颜色和轮询间隔

## 页面集成

页面需提供 API 接口和 DOM 标记，插件支持两种通信模式。

### 核心 API 类型定义

无论使用哪种通信模式，获取和更新 Schema 的类型定义一致：

```typescript
/** 获取 Schema 函数 */
type GetSchemaFunc<T> = (params: string) => NonNullable<T>

/** 更新 Schema 函数 */
type UpdateSchemaFunc<T> = (schema: NonNullable<T>, params: string) => boolean
```

- `params`: 参数字符串，格式为 `'param1'` 或 `'param1,param2'`
- `schema`: Schema 数据对象，不能为 `null` 或 `undefined`

### 预览 API 类型定义

预览函数的类型因通信模式而异：

**CustomEvent 模式**：通过 `containerId` 获取容器

```typescript
/** 预览函数（CustomEvent 模式） */
type RenderPreviewFunc<T> = (schema: NonNullable<T>, containerId: string) => void
```

**Window 函数模式（已废弃）**：直接传入容器 DOM 元素

```typescript
/** @deprecated 预览函数（Window 函数模式） */
type PreviewFunc<T> = (schema: NonNullable<T>, container: HTMLElement) => (() => void) | null
```

- `schema`: 当前编辑的 Schema 数据
- `containerId`: 预览容器的 DOM ID，通过 `document.getElementById()` 获取
- `container`: 预览容器 DOM 元素（已废弃模式）
- 返回清理函数：插件关闭预览时会自动调用（仅 Window 函数模式需要返回）

### CustomEvent 事件模式（推荐）

使用 CustomEvent 实现双向通信，无需污染 window 对象：

```typescript
// 监听扩展请求
window.addEventListener('schema-editor:request', (event: CustomEvent) => {
  const { type, payload, requestId } = event.detail
  let result

  switch (type) {
    case 'GET_SCHEMA':
      // payload.params: 'param1' 或 'param1,param2'
      result = { success: true, data: getSchema(payload.params) }
      break
    case 'UPDATE_SCHEMA':
      result = { success: updateSchema(payload.schema, payload.params) }
      break
    case 'CHECK_PREVIEW':
      result = { exists: true }  // 是否支持预览
      break
    case 'RENDER_PREVIEW':
      // payload.schema: 当前编辑的 Schema 数据
      // payload.containerId: 预览容器 ID
      const container = document.getElementById(payload.containerId)
      renderPreview(payload.schema, container)
      result = { success: true, hasCleanup: true }
      break
    case 'CLEANUP_PREVIEW':
      cleanupPreview()
      result = { success: true }
      break
  }

  // 发送响应
  window.dispatchEvent(new CustomEvent('schema-editor:response', {
    detail: { requestId, ...result }
  }))
})
```

事件名可在配置页面自定义，默认为 `schema-editor:request` 和 `schema-editor:response`。

### 通信模式对比

| 特性 | CustomEvent 模式 | Window 函数模式 |
|------|------------------|-----------------|
| **性能** | 异步事件驱动，有微小开销（~50-200μs） | 同步直接调用，理论更快（~1-5μs） |
| **命名空间** | 事件隔离，不污染 window | 需要在 window 上挂载函数 |
| **健壮性** | 内置超时机制和错误处理 | 依赖页面实现 |
| **可调试性** | requestId 便于追踪 | 无内置追踪机制 |
| **安全性** | 减少全局暴露 | 全局函数可被外部访问 |

> **性能说明**：Window 函数模式理论上有微小的性能优势（同步调用 vs 事件驱动），但实际差异在微秒级别，Schema 编辑操作为低频用户交互，业务逻辑处理耗时（毫秒级）远大于通信开销，因此性能差异可忽略不计。CustomEvent 模式带来的架构收益（隔离性、健壮性、可维护性）远超这点性能损失。

### Window 函数模式（已废弃）

> ⚠️ **此模式已废弃，将在未来版本中移除，建议迁移到 CustomEvent 模式。**

```typescript
// @deprecated 获取Schema
window.__getContentById = (params: string) => {
  return { /* Schema对象 */ }
}

// @deprecated 更新Schema
window.__updateContentById = (schema, params: string) => {
  return true
}

// @deprecated 预览函数（可选）
window.__getContentPreview = (data, container: HTMLElement) => {
  const root = ReactDOM.createRoot(container)
  root.render(<Preview data={data} />)
  return () => root.unmount()
}
```

函数名可在配置页面自定义。

### 预览功能 (v1.2.0+)

使用方式：
1. 在编辑器工具栏点击"预览"按钮开启预览
2. 预览区域会在抽屉左侧显示
3. 可拖拽分隔条调整预览/编辑器宽度
4. 支持手动更新或自动更新预览（可在配置页面设置）

如果页面未提供预览函数，预览按钮将被禁用。

### 元素标记

```html
<!-- 单个参数 -->
<div data-id="param1"></div>

<!-- 多个参数 -->
<div data-id="param1,param2"></div>
```

属性值为参数数组的 `join(',')` 结果。

> **注意**：`data-id` 符合 [Agentic UI](https://github.com/ant-design/agentic-ui) 的规范，使用默认配置即可，无需用户手动配置属性名。如有特殊需求，属性名也可在配置页面自定义。

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

插件会自动将 Markdown 字符串解析为结构化的 Elements 数组进行编辑，保存时自动转换回 Markdown 字符串。该功能默认开启，符合 [Agentic UI](https://github.com/ant-design/agentic-ui) 的数据规范，可在配置页面【高级】选项中关闭。

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
src/
├── core/          # 核心功能（background、content script）
├── features/      # 功能模块（schema-drawer、favorites、options-page）
└── shared/        # 共享资源（components、managers、types、utils）
```
