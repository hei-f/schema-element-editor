---
id: intro
title: 文档介绍
sidebar_position: 0
slug: /
---

# Schema Element Editor 文档

> Schema Element Editor (SEE) 是一款 Chrome 浏览器扩展插件，用于实时查看和编辑 DOM 元素的 Schema 数据。专为前端开发者和测试人员打造，特别针对 AI 智能体对话场景（如 Agentic UI）优化。

## 🎯 核心特性

### Agentic UI 集成

- 🤝 **原生支持** - 内置 [Agentic UI](https://github.com/ant-design/agentic-ui) postMessage 通信适配
- 🔧 **开发调试** - 开发环境下可直接调试 Bubble 组件数据

### 元素检测

- 🎯 **智能元素检测** - 按住 Alt/Option 键自动检测和高亮目标元素
- 🔦 **批量高亮** - 一键高亮页面所有可编辑元素
- 🖼️ **iframe 支持** - 支持检测同源 iframe 内的元素

### Schema 编辑

- 📝 **专业编辑器** - 内置 CodeMirror 编辑器，支持语法高亮
- 💾 **实时更新** - 修改后直接同步到页面
- 🔧 **JSON 智能修复** - 自动检测并修复 JSON 语法错误
- 🧠 **AST 自动补全** - 编辑 Elements[] 类型时提供自动提示
- 🤖 **Markdown 解析** - 自动解析 Markdown 字符串为结构化数据

### 实时预览

- 👁️ **实时预览** - 编辑时实时预览 Schema 效果
- 📊 **Diff 对比** - 版本差异对比，支持格式转换和工具操作

### 数据管理

- 📜 **编辑历史** - 自动记录编辑历史，支持版本回退
- 💿 **草稿功能** - 支持手动和自动保存草稿
- ⭐ **收藏管理** - 快速保存和应用常用配置
- 📥📤 **导入导出** - 支持 JSON 文件导入导出

### 录制模式

- 🔴 **Schema 录制** - 轮询检测 Schema 变化并记录快照
- 📊 **版本对比** - 选择任意两个版本进行差异对比

## 📖 文档结构

### 🚀 快速入门

从这里开始了解如何安装和使用插件：

- [快速入门](./guides/快速入门) - 安装插件并开始使用

### 📚 功能指南

详细了解 Schema Element Editor 的各项功能：

- [元素检测与高亮](./guides/元素检测与高亮) - 基础检测、批量高亮、iframe 支持
- [Schema 编辑器](./guides/Schema编辑器) - JSON 编辑、格式化、AST 自动补全
- [实时预览](./guides/实时预览) - 内置预览器和自定义预览
- [录制模式](./guides/录制模式) - 录制 Schema 变化，多版本快照
- [Diff 对比](./guides/Diff对比) - 版本差异对比，格式转换
- [版本管理](./guides/版本管理) - 编辑历史、草稿功能
- [收藏管理](./guides/收藏管理) - 保存和应用常用配置
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

**当前版本：** v2.3.1  

