# Schema Editor

Chrome扩展程序，用于实时查看和编辑DOM元素的Schema数据。

![Version](https://img.shields.io/badge/version-1.0.10-blue)
![License](https://img.shields.io/badge/license-MIT-orange)

## 功能

- 🎯 **智能元素检测**: 按住 Alt/Option 键时自动检测和高亮目标元素
- 📝 **Schema编辑器**: 内置Monaco编辑器，支持JSON格式化和校验
- 🤖 **智能解析**: 自动解析 Markdown 字符串为结构化数据，完美适配 AI 智能体对话场景
- 💾 **实时更新**: 修改后直接同步到页面
- 💿 **草稿功能**: 支持手动保存和自动保存草稿，防止数据丢失
- ⭐ **收藏管理**: 快速保存和应用常用Schema配置
- ⚙️ **灵活配置**: 可自定义属性名、搜索深度、节流间隔等参数
- 🎨 **样式隔离**: 使用Shadow DOM确保样式不受页面干扰

## 技术栈

React 18 + TypeScript + Vite + Ant Design 5 + Monaco Editor + Chrome Extension MV3

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

点击工具栏图标激活插件（绿色=激活，灰色=未激活）。按住 Alt/Option 键悬停元素显示高亮，点击打开编辑器。

## 页面集成

页面需提供以下全局方法和DOM标记：

### 全局方法

```typescript
// 获取Schema
window.__getContentById = (params: string) => {
  // params: 'param1' 或 'param1,param2'
  return { /* Schema对象 */ }
}

// 更新Schema
window.__updateContentById = (schema: any, params: string) => {
  // 更新逻辑
  return true
}
```

函数名可在配置页面自定义。

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

## 项目结构

```
src/
├── core/          # 核心功能（background、content script）
├── features/      # 功能模块（schema-drawer、favorites、options-page）
└── shared/        # 共享资源（components、managers、types、utils）
```
