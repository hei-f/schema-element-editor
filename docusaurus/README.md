# Schema Element Editor 文档站点

本目录包含 Schema Element Editor 的 Docusaurus 文档站点配置和内容。

## 技术栈

- **Docusaurus 3.9.2** - 文档站点生成器
- **React 19.2.3** - 与主项目版本一致
- **pnpm 9.0.0** - 包管理器
- **TypeScript** - 类型支持

## 本地开发

### 安装依赖

```bash
cd docusaurus
pnpm install
```

### 启动开发服务器

```bash
pnpm run start
```

开发服务器将在 http://localhost:3000 启动。

### 构建生产版本

```bash
pnpm run build
```

构建产物将生成在 `build` 目录。

### 本地预览构建结果

```bash
pnpm run serve
```

## 目录结构

```
docusaurus/
├── docs/                    # 文档内容
│   ├── guides/              # 功能指南
│   ├── integration/         # 开发者集成指南
│   └── configuration/       # 配置参考
├── src/
│   ├── pages/               # 自定义页面（首页）
│   └── css/                 # 自定义样式
├── static/                  # 静态资源
│   └── img/                 # 图片资源
├── docusaurus.config.js     # Docusaurus 配置
├── sidebars.js              # 侧边栏配置
└── package.json             # 依赖配置
```

## 部署

### GitHub Pages（自动部署）

文档站点配置了 GitHub Actions 自动部署。当以下情况发生时会自动触发部署：

- 推送到 `main` 分支
- 修改了 `docs/` 或 `docusaurus/` 目录
- 手动触发工作流

部署后的站点地址：

- https://hei-f.github.io/schema-element-editor/

### 首次部署配置

1. 在 GitHub 仓库设置中启用 GitHub Pages
2. 进入 `Settings` → `Pages`
3. Source 选择 `GitHub Actions`
4. 保存配置

之后每次推送都会自动构建和部署。

## 文档编写

### 添加新文档

1. 在对应目录创建 `.md` 文件
2. 添加 frontmatter：

```markdown
---
id: 文件名
title: 文档标题
sidebar_position: 排序位置
---

文档内容...
```

3. 在 `sidebars.js` 中添加对应条目

### 内部链接

使用相对路径或绝对路径（不带 `.md` 后缀）：

```markdown
[快速入门](./快速入门)
[集成概述](/docs/integration/概述)
```

### 图片

将图片放在 `static/img/` 目录，然后在文档中引用：

```markdown
![描述](/img/screenshot.png)
```

## 自定义

### 主题色

在 `src/css/custom.css` 中修改主题色：

```css
:root {
  --ifm-color-primary: #1677ff;
  /* ... */
}
```

### 导航栏

在 `docusaurus.config.js` 中的 `themeConfig.navbar` 配置。

### 页脚

在 `docusaurus.config.js` 中的 `themeConfig.footer` 配置。

## 故障排除

### 构建失败

1. 检查 Node.js 版本（需要 ≥18）
2. 清除缓存：`rm -rf .docusaurus node_modules && pnpm install`
3. 查看构建日志中的错误信息

### 链接失效

确保内部链接不包含 `.md` 后缀，使用相对路径或绝对路径。

### 样式问题

清除浏览器缓存，或在开发模式下强制刷新。

## 相关命令

主项目中添加了以下快捷命令：

```bash
# 从主项目根目录运行
npm run docs:dev      # 启动文档开发服务器
npm run docs:build    # 构建文档站点
npm run docs:serve    # 预览构建结果
```

## 更多信息

- [Docusaurus 官方文档](https://docusaurus.io/)
- [Markdown 语法参考](https://docusaurus.io/docs/markdown-features)
