/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  tutorialSidebar: [
    {
      type: 'doc',
      id: 'guides/快速入门',
      label: '快速入门',
    },
    {
      type: 'category',
      label: '功能指南',
      collapsed: false,
      items: [
        'guides/元素检测与高亮',
        'guides/Schema编辑器',
        'guides/实时预览',
        'guides/录制模式',
        'guides/Diff对比',
        'guides/版本管理',
        'guides/收藏管理',
        'guides/导入导出',
      ],
    },
    {
      type: 'category',
      label: '开发者集成',
      collapsed: false,
      items: ['integration/概述', 'integration/postMessage模式', 'integration/SDK使用指南'],
    },
    {
      type: 'doc',
      id: 'configuration/配置选项',
      label: '配置参考',
    },
  ],
}

export default sidebars
