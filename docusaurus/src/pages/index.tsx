import React from 'react'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Layout from '@theme/Layout'
import styles from './index.module.css'

type FeatureItem = {
  title: string
  description: React.ReactNode
}

const FeatureItems: FeatureItem[] = [
  {
    title: '智能元素检测',
    description: <>按住 Alt/Option 键自动检测和高亮目标元素,支持 iframe 和批量高亮</>,
  },
  {
    title: '专业编辑器',
    description: <>基于 CodeMirror 6,支持 AST 智能补全、JSON 智能修复、Markdown 解析</>,
  },
  {
    title: '实时预览',
    description: <>编辑时实时预览 Schema 效果,支持自定义预览组件</>,
  },
  {
    title: '录制模式',
    description: <>轮询检测 Schema 变化并记录快照,支持多版本 Diff 对比</>,
  },
  {
    title: '版本管理',
    description: <>自动记录编辑历史,支持草稿保存和收藏管理</>,
  },
  {
    title: 'Agentic UI 原生支持',
    description: <>内置 postMessage 通信适配,开发环境下可直接调试 Bubble 组件数据</>,
  },
]

function Feature({ title, description, index }: FeatureItem & { index: number }) {
  return (
    <li className={styles.featureCard}>
      <div className={styles.featureNumber}>{String(index + 1).padStart(2, '0')}</div>
      <div className={styles.featureContent}>
        <h3 className={styles.featureTitle}>{title}</h3>
        <p className={styles.featureDescription}>{description}</p>
      </div>
    </li>
  )
}

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext()
  return (
    <div className={styles.scrollSection}>
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>{siteConfig.title}</h1>
          <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
          <Link className={styles.heroButton} to="/docs/guides/快速入门">
            快速入门 →
          </Link>
        </div>
      </div>
    </div>
  )
}

function HomepageFeatures() {
  return (
    <div className={styles.scrollSection}>
      <div className={styles.featuresSection}>
        <h2 className={styles.featuresSectionTitle}>核心功能</h2>
        <ul className={styles.featureList}>
          {FeatureItems.map((props, idx) => (
            <Feature key={idx} index={idx} {...props} />
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function Home(): React.ReactElement {
  const { siteConfig } = useDocusaurusContext()
  return (
    <Layout
      title={`${siteConfig.title} - 文档`}
      description="Schema Element Editor 是一款 Chrome 浏览器扩展插件，用于实时查看和编辑 DOM 元素的 Schema 数据"
    >
      <div className={styles.pageContainer}>
        <div className={styles.backgroundLayer} />
        <div className={styles.glowOrb1} />
        <div className={styles.glowOrb2} />
        <div className={styles.glowOrb3} />
        <div className={styles.glowOrb4} />
        <HomepageHeader />
        <HomepageFeatures />
      </div>
    </Layout>
  )
}
