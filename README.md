# Schema Editor

Chrome扩展程序，用于实时查看和编辑DOM元素的Schema数据。

## 功能

- 🎯 智能元素检测：按住 Alt/Option 键时自动检测和高亮目标元素
- 📝 Schema编辑器：内置Monaco编辑器，支持JSON格式化和校验
- 💾 实时更新：修改后直接同步到页面
- ⚙️ 灵活配置：可自定义属性名、搜索深度、节流间隔等参数

## 技术栈

React 18 + TypeScript + Vite + Ant Design 5 + Monaco Editor + Manifest V3

## 开发

```bash
# 安装依赖
tnpm install

# 开发模式
tnpm run dev

# 构建
tnpm run build

# 打包
npm run package
```

加载到Chrome：访问 `chrome://extensions/`，开启开发者模式，选择 `dist` 目录。

## 使用

点击工具栏图标激活插件（绿色=激活，灰色=未激活）。按住 Alt/Option 键悬停元素显示高亮，点击打开编辑器。

## 页面集成

页面需提供以下全局方法和DOM标记：

### 全局方法

```typescript
// 获取Schema
window.__getSchemaByParams = (params: string) => {
  // params: 'param1' 或 'param1,param2'
  return { /* Schema对象 */ }
}

// 更新Schema
window.__updateSchemaByParams = (schema: any, params: string) => {
  // 更新逻辑
  return true
}
```

函数名可在配置页面自定义。

### 元素标记

```html
<!-- 单个参数 -->
<div data-schema-params="param1"></div>

<!-- 多个参数 -->
<div data-schema-params="param1,param2"></div>
```

属性值为参数数组的 `join(',')` 结果。属性名可在配置页面自定义。

## 项目结构

```
src/
├── background/         # Service Worker
├── content/           # Content Script + React UI
├── options/           # 配置页面
├── utils/             # 工具函数
└── types/             # 类型定义
public/
├── injected.js        # 页面注入脚本
└── icons/             # 扩展图标
```

## License

MIT

