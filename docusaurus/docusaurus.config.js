// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from 'prism-react-renderer'

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Schema Element Editor',
  tagline: 'Chrome 浏览器扩展插件，用于实时查看和编辑 DOM 元素的 Schema 数据',
  favicon: 'img/favicon.png',

  // Set the production url of your site here
  url: 'https://hei-f.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/schema-element-editor/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'hei-f', // Usually your GitHub org/user name.
  projectName: 'schema-element-editor', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/hei-f/schema-element-editor/tree/main/docusaurus/',
        },
        blog: false, // 禁用博客功能
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'Schema Element Editor',
        logo: {
          alt: 'Schema Element Editor Logo',
          src: 'img/logo.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: '文档',
          },
          {
            href: 'https://github.com/hei-f/schema-element-editor',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: '文档',
            items: [
              {
                label: '快速入门',
                to: '/docs/guides/快速入门',
              },
              {
                label: '功能指南',
                to: '/docs/guides/元素检测与高亮',
              },
              {
                label: '开发者集成',
                to: '/docs/integration/概述',
              },
            ],
          },
          {
            title: '社区',
            items: [
              {
                label: 'GitHub Issues',
                href: 'https://github.com/hei-f/schema-element-editor/issues',
              },
              {
                label: 'GitHub Discussions',
                href: 'https://github.com/hei-f/schema-element-editor/discussions',
              },
            ],
          },
          {
            title: '更多',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/hei-f/schema-element-editor',
              },
              {
                label: 'npm - SDK',
                href: 'https://www.npmjs.com/package/@schema-element-editor/host-sdk',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Schema Element Editor. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['bash', 'json', 'typescript', 'javascript'],
      },
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 4,
      },
      docs: {
        sidebar: {
          hideable: true,
          autoCollapseCategories: false,
        },
      },
    }),

  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],
}

export default config
