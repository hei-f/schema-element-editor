# Schema Editor

一个强大的Chrome扩展程序，用于查看和编辑DOM元素的Schema数据。

## 功能特性

- 🎯 **元素检测**：按住 Alt/Option 键悬停时自动检测元素的 `data-schema-params` 属性（可自定义属性名）
- 🎨 **可视化高亮**：用友好的样式标记目标元素
- 📝 **Schema编辑**：内置代码编辑器编辑JSON Schema
- 💾 **一键更新**：修改后直接更新页面Schema
- 🔄 **格式化工具**：内置JSON格式化和校验功能
- 🎛️ **状态持久化**：记住激活状态和偏好设置
- 🛡️ **防误触设计**：仅在按住 Alt/Option 键时启用检测功能
- ⚙️ **可自定义属性**：在配置页面可自定义要检测的属性名称

## 技术栈

- React 18 + TypeScript
- Vite + CRXJS
- Ant Design 5.x
- Monaco Editor (本地打包)
- Styled Components
- Chrome Extension Manifest V3

## 开发指南

### 前置要求

- Node.js >= 16
- npm 或 tnpm

### 安装依赖

```bash
tnpm install
```

### 开发模式

```bash
tnpm run dev
```

开发模式会启动Vite开发服务器，并在 `dist` 目录生成扩展文件。

### 构建生产版本

```bash
tnpm run build
```

构建完成后，产物将输出到 `dist` 目录。

### 打包分发

```bash
npm run package
```

此命令会：
1. 构建生产版本
2. 创建 zip 安装包
3. 输出到 `releases/` 目录

### 加载到Chrome（开发模式）

1. 打开Chrome浏览器
2. 访问 `chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目的 `dist` 目录

## 使用说明

### 激活插件

1. 点击浏览器工具栏中的Schema Editor图标
2. 图标状态变化：
   - **激活时**：图标显示 🟢 **绿色**幽灵
   - **停用时**：图标显示 ⚫ **灰色**幽灵
   - 标题显示：`Schema Editor - 已激活 ✓` 或 `Schema Editor - 未激活`

### 检查元素

1. 激活插件后，**按住 Alt 键（Mac 使用 Option ⌥ 键）**
2. 将鼠标悬停在页面元素上
3. 如果元素有目标属性，会显示高亮边框和属性值
4. 如果元素没有目标属性，会显示"非法目标"提示
5. 释放 Alt/Option 键后，高亮和提示会立即消失

> 💡 **为什么需要按住 Alt/Option 键？**  
> 避免正常浏览页面时误触插件的高亮功能，提供更好的用户体验。Mac 上 Control+单击会触发右键菜单，所以使用 Alt/Option 键更合适。

### 编辑Schema

1. **按住 Alt/Option 键并点击**高亮的元素
2. 右侧抽屉会自动打开，显示元素的Schema数据
3. 在编辑器中编辑JSON
4. 使用"格式化"按钮美化JSON
5. 点击"保存"按钮更新Schema

### 停用插件

再次点击工具栏图标即可停用插件。

## 页面集成要求

插件需要页面提供以下全局方法：

### `window.__getSchemaByParams(params)`

```typescript
/**
 * 获取元素的Schema数据
 * @param params - 参数数组（来自元素的 data-schema-params 属性，用逗号分隔）
 * @returns Schema对象
 */
window.__getSchemaByParams = (params) => {
  // params 是一个数组，例如：['param1', 'param2']
  // 根据参数返回对应的Schema对象
  return {
    // 你的Schema数据
  }
}
```

### `window.__updateSchemaByParams(schema, params)`

```typescript
/**
 * 更新元素的Schema数据
 * @param schema - 新的Schema对象
 * @param params - 参数数组
 * @returns 是否更新成功（返回true表示成功）
 */
window.__updateSchemaByParams = (schema, params) => {
  // 更新Schema数据
  // params 是一个数组，可用于定位要更新的Schema
  // ... 你的更新逻辑
  return true // 返回true表示更新成功
}
```

### 元素标记方式

在HTML元素上添加 `data-schema-params` 属性（或在配置页面自定义的属性名）：

```html
<!-- ✅ 正确：包含参数 -->
<div data-schema-params="param1">单个参数</div>

<!-- ✅ 正确：包含多个参数（逗号分隔）-->
<div data-schema-params="msg-001,comp-001">多个参数</div>

<!-- ❌ 错误：没有属性（会被标记为"非法目标"）-->
<div>无参数</div>

<!-- ❌ 错误：空属性值（会被标记为"非法目标"）-->
<div data-schema-params="">空参数</div>
```

**参数格式说明：**
- 单个参数：直接写参数值，如 `"user123"`
- 多个参数：用逗号分隔，如 `"msg-001,comp-001,user-123"`
- 插件会自动解析并转换为数组传递给 API 方法

## 项目结构

```
ChromeTools/
├── src/
│   ├── manifest.json          # Chrome扩展配置
│   ├── background/            # Background Service Worker
│   │   └── service-worker.ts
│   ├── content/               # Content Scripts
│   │   ├── index.tsx          # 入口文件
│   │   ├── monitor.ts         # 元素监听器
│   │   ├── injected-script.ts # 页面注入脚本
│   │   └── ui/                # React UI组件
│   │       ├── App.tsx
│   │       ├── SchemaDrawer.tsx
│   │       ├── Tooltip.tsx
│   │       └── styles.ts
│   ├── utils/                 # 工具函数
│   │   ├── message.ts
│   │   ├── storage.ts
│   │   └── element-detector.ts
│   └── types/                 # TypeScript类型定义
│       └── index.ts
├── public/
│   └── icons/                 # 扩展图标
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## 架构说明

### 通信流程

```
用户点击图标
  ↓
Background Service Worker切换状态
  ↓
通知Content Script
  ↓
Content Script开始监听按键和hover
  ↓
用户按住Alt/Option键 + hover元素 → 显示高亮和tooltip
  ↓
用户按住Alt/Option键 + 点击元素
  ↓
懒加载React UI（首次）
  ↓
Injected Script调用window.__getSchemaById()
  ↓
编辑器展示JSON
  ↓
用户编辑并保存
  ↓
Injected Script调用window.__updateSchemaById()
  ↓
Ant Design Message显示结果
```

### 样式隔离

使用Shadow DOM技术实现完全的样式隔离，确保插件UI不受页面样式影响，也不影响页面样式。

### 性能优化

- 分层加载：基础监听器始终轻量，React UI懒加载
- Shadow DOM：避免样式计算开销
- 事件委托：高效的事件监听机制

## 注意事项

1. 插件图标采用可爱幽灵主题，通过颜色区分状态（绿色=激活，灰色=未激活）
2. 页面必须提供 `window.__getSchemaByParams` 和 `window.__updateSchemaByParams` 方法
3. **⚠️ 目标元素必须具有 `data-schema-params` 属性**（或在配置页面自定义的属性名）
4. 插件通过读取HTML data属性来识别元素，属性值可以是单个参数或用逗号分隔的多个参数
5. 没有有效属性的元素会被标记为"非法目标"，无法打开编辑器
6. 可以在扩展的配置页面（右键点击图标 → 选项）自定义要检测的属性名称

## 许可证

MIT
