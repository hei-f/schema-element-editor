---
id: intro
title: 文档介绍
sidebar_position: 0
slug: /
---

# Schema Element Editor 文档

> Schema Element Editor (SEE) 是一款 Chrome 浏览器扩展插件，用于实时查看和编辑 DOM 元素的 Schema 数据。专为前端开发者和测试人员打造，特别针对 AI 智能体对话场景（如 Agentic UI）优化。

## 🎯 核心特性

<table>
  <thead>
    <tr>
      <th>分类</th>
      <th>功能</th>
      <th>说明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="1"><strong>Agentic UI 集成</strong></td>
      <td>🤝 <strong>Agentic UI 开箱即用</strong></td>
      <td><a href="https://github.com/ant-design/agentic-ui">Agentic UI</a> 已集成插件支持，开发环境下可直接调试 Bubble 组件数据</td>
    </tr>
    <tr>
      <td rowspan="4"><strong>元素检测与交互</strong></td>
      <td>🎯 <strong>智能元素检测</strong></td>
      <td>按住 Alt/Option 键时自动检测和高亮目标元素</td>
    </tr>
    <tr>
      <td>🔦 <strong>批量高亮</strong></td>
      <td>支持快捷键（Alt+字母/数字）一键高亮页面所有可编辑元素，可配置快捷键和数量上限</td>
    </tr>
    <tr>
      <td>🔴 <strong>录制模式</strong></td>
      <td>按 Alt+R 进入录制模式，轮询检测Schema变化并记录快照，支持多版本Diff对比</td>
    </tr>
    <tr>
      <td>🖼️ <strong>iframe 支持</strong></td>
      <td>支持检测页面中同源 iframe 内的元素，高亮框统一渲染在主页面</td>
    </tr>
    <tr>
      <td rowspan="6"><strong>Schema 编辑</strong></td>
      <td>📝 <strong>Schema 编辑器</strong></td>
      <td>内置CodeMirror编辑器，支持JSON格式化、压缩、转义/去转义等操作</td>
    </tr>
    <tr>
      <td>💾 <strong>实时更新</strong></td>
      <td>修改后直接同步到页面</td>
    </tr>
    <tr>
      <td>🔧 <strong>JSON 智能修复</strong></td>
      <td>自动检测JSON语法错误，一键定位错误位置并尝试智能修复，支持 Diff 对比查看修复前后差异</td>
    </tr>
    <tr>
      <td>🖱️ <strong>快速单独编辑</strong></td>
      <td>在编辑器中选中内容后可快速打开独立编辑弹窗，支持选中自动显示或右键触发两种模式，提供完整的编辑和格式化功能</td>
    </tr>
    <tr>
      <td>🧠 <strong>AST 自动补全</strong></td>
      <td>编辑 AST 类型数据时提供字段名和类型的自动提示，支持快捷键触发</td>
    </tr>
    <tr>
      <td>🤖 <strong>智能解析</strong></td>
      <td>自动解析 Markdown 字符串为结构化数据，完美适配 AI 智能体对话场景</td>
    </tr>
    <tr>
      <td rowspan="1"><strong>预览与对比</strong></td>
      <td>👁️ <strong>实时预览</strong></td>
      <td>支持在编辑时实时预览Schema效果，可自定义预览组件</td>
    </tr>
    <tr>
      <td rowspan="4"><strong>数据管理</strong></td>
      <td>📜 <strong>编辑历史</strong></td>
      <td>自动记录编辑历史，支持版本回退和对比，标记保存/草稿/收藏等特殊版本</td>
    </tr>
    <tr>
      <td>💿 <strong>草稿功能</strong></td>
      <td>支持手动保存和自动保存草稿，防止数据丢失</td>
    </tr>
    <tr>
      <td>⭐ <strong>收藏管理</strong></td>
      <td>快速保存和应用常用Schema配置，支持编辑已保存的收藏</td>
    </tr>
    <tr>
      <td>📥📤 <strong>导入导出</strong></td>
      <td>支持导出Schema为JSON文件，也可从文件导入，方便数据分享和备份</td>
    </tr>
    <tr>
      <td rowspan="4"><strong>配置与定制</strong></td>
      <td>📋 <strong>预设配置</strong></td>
      <td>支持保存和管理完整的插件配置方案，可一键切换不同的工作环境配置 (v2.4.0+)</td>
    </tr>
    <tr>
      <td>⚙️ <strong>灵活配置</strong></td>
      <td>可自定义属性名、搜索深度、节流间隔等参数</td>
    </tr>
    <tr>
      <td>🎨 <strong>样式隔离</strong></td>
      <td>使用Shadow DOM确保样式不受页面干扰</td>
    </tr>
    <tr>
      <td>🌈 <strong>主题色配置</strong></td>
      <td>支持自定义插件主题色，配置页面和编辑器界面统一应用 (v1.21.0+)</td>
    </tr>
  </tbody>
</table>

## 📖 文档结构

### 🚀 快速入门

从这里开始了解如何安装和使用插件：

- [快速入门](./guides/快速入门) - 安装插件并开始使用

### 📚 功能指南

详细了解 Schema Element Editor 的各项功能：

- [元素检测与高亮](./guides/元素检测与高亮) - 基础检测、批量高亮、iframe 支持
- [Schema 编辑器](./guides/Schema编辑器) - JSON 编辑、格式化、快速单独编辑、AST 自动补全
- [实时预览](./guides/实时预览) - 内置预览器和自定义预览
- [录制模式](./guides/录制模式) - 录制 Schema 变化，多版本快照
- [Diff 对比](./guides/Diff对比) - 版本差异对比，格式转换
- [版本管理](./guides/版本管理) - 编辑历史、草稿功能
- [收藏管理](./guides/收藏管理) - 保存和应用常用配置
- [预设配置](./guides/预设配置) - 保存和切换完整配置方案
- [导入导出](./guides/导入导出) - Schema 数据的导入导出

### 🔧 开发者集成指南

将 Schema Element Editor 集成到您的项目：

- [集成概述](./integration/概述) - 集成方式和要求
- [postMessage 模式](./integration/postMessage模式) - postMessage 通信协议详解
- [SDK 使用指南](./integration/SDK使用指南) - 官方 SDK 的详细使用说明

### ⚙️ 配置参考

- [配置选项](./configuration/配置选项) - 所有配置项的详细说明

## 🔧 技术栈

- React 19 + TypeScript + Vite
- Ant Design 6 + CodeMirror 6
- Chrome Extension Manifest V3

## 🤝 获取帮助

如果您在使用过程中遇到问题：

1. 查阅本文档中的相关指南
2. 在 [GitHub Issues](https://github.com/hei-f/schema-element-editor/issues) 中搜索是否有类似问题
3. 提交新的 Issue 描述您遇到的问题

---

**当前版本：** v2.5.0 

