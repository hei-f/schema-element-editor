import React from 'react'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Layout from '@theme/Layout'
import {
  PageContainer,
  ScrollSection,
  BackgroundLayer,
  GlowOrb1,
  GlowOrb2,
  GlowOrb3,
  GlowOrb4,
  HeroSection,
  HeroContent,
  HeroTitle,
  HeroSubtitle,
  HeroButton,
  FeaturesSection,
  FeaturesSectionTitle,
  FeatureList,
  FeatureCard,
  FeatureNumber,
  FeatureContent,
  FeatureTitle,
  FeatureDescription,
} from './index.styles'

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
    <FeatureCard $index={index}>
      <FeatureNumber>{String(index + 1).padStart(2, '0')}</FeatureNumber>
      <FeatureContent>
        <FeatureTitle>{title}</FeatureTitle>
        <FeatureDescription>{description}</FeatureDescription>
      </FeatureContent>
    </FeatureCard>
  )
}

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext()
  return (
    <ScrollSection>
      <HeroSection>
        <HeroContent>
          <HeroTitle>{siteConfig.title}</HeroTitle>
          <HeroSubtitle>{siteConfig.tagline}</HeroSubtitle>
          <HeroButton to="/docs/guides/快速入门">快速入门 →</HeroButton>
        </HeroContent>
      </HeroSection>
    </ScrollSection>
  )
}

function HomepageFeatures() {
  return (
    <ScrollSection>
      <FeaturesSection>
        <FeaturesSectionTitle>核心功能</FeaturesSectionTitle>
        <FeatureList>
          {FeatureItems.map((props, idx) => (
            <Feature key={idx} index={idx} {...props} />
          ))}
        </FeatureList>
      </FeaturesSection>
    </ScrollSection>
  )
}

export default function Home(): React.ReactElement {
  const { siteConfig } = useDocusaurusContext()
  return (
    <Layout
      title={`${siteConfig.title} - 文档`}
      description="Schema Element Editor 是一款 Chrome 浏览器扩展插件，用于实时查看和编辑 DOM 元素的 Schema 数据"
    >
      <PageContainer className="homepage-container">
        <BackgroundLayer />
        <GlowOrb1 />
        <GlowOrb2 />
        <GlowOrb3 />
        <GlowOrb4 />
        <HomepageHeader />
        <HomepageFeatures />
      </PageContainer>
    </Layout>
  )
}
