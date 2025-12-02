import { InfoCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { Alert, Card, Collapse, Flex, Form, Input, InputNumber, Typography } from 'antd'
import styled, { keyframes } from 'styled-components'
import { MENU_COLLAPSED_WIDTH, MENU_EXPANDED_WIDTH } from '../config/menu-config'

const { Text, Title, Paragraph } = Typography

/** 主题色常量 */
const THEME_COLORS = {
  primary: '#39C5BB',
  skyBlue: '#7EC8E3',
  lavender: '#B8A9F3',
  coral: '#F78DA7',
  mint: '#7FDBCA',
} as const

/** 背景渐变流动动画 */
const bgGradientFlow = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`

/** 背景光晕漂移动画1 - 极慢速大范围 */
const bgGlowDrift1 = keyframes`
  0%, 100% {
    translate: 0 0;
  }
  25% {
    translate: 200px 300px;
  }
  50% {
    translate: -100px 500px;
  }
  75% {
    translate: 150px 200px;
  }
`

/** 背景光晕漂移动画2 - 极慢速大范围 */
const bgGlowDrift2 = keyframes`
  0%, 100% {
    translate: 0 0;
  }
  30% {
    translate: -200px 150px;
  }
  60% {
    translate: 100px -200px;
  }
  80% {
    translate: -100px 100px;
  }
`

/** 背景光晕漂移动画3 - 极慢速大范围 */
const bgGlowDrift3 = keyframes`
  0%, 100% {
    translate: 0 0;
  }
  20% {
    translate: 250px -100px;
  }
  50% {
    translate: -150px 300px;
  }
  75% {
    translate: 100px -150px;
  }
`

/** 背景光晕漂移动画4 - 极慢速大范围 */
const bgGlowDrift4 = keyframes`
  0%, 100% {
    translate: 0 0;
  }
  35% {
    translate: -180px -120px;
  }
  65% {
    translate: 120px 180px;
  }
  85% {
    translate: -80px -80px;
  }
`

/** 背景光晕脉动 - 缓慢 */
const bgGlowPulse = keyframes`
  0%, 100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 0.75;
    transform: scale(1.08);
  }
`

/** 页面根容器 - 带动态渐变背景和超大光晕 */
export const PageRoot = styled.div`
  min-height: 100vh;
  background: linear-gradient(
    -45deg,
    rgba(57, 197, 187, 0.1),
    rgba(126, 200, 227, 0.08),
    rgba(184, 169, 243, 0.06),
    rgba(247, 141, 167, 0.05),
    rgba(57, 197, 187, 0.08),
    rgba(126, 200, 227, 0.06)
  );
  background-size: 400% 400%;
  animation: ${bgGradientFlow} 30s ease infinite;
  position: relative;
  overflow: hidden;

  --glow-delay-1: 0s;
  --glow-delay-2: 0s;

  /* 超大背景光晕1 - 左上角 */
  &::before {
    content: '';
    position: fixed;
    width: 900px;
    height: 900px;
    top: -10%;
    left: 5%;
    background: radial-gradient(
      circle,
      ${THEME_COLORS.primary}50 0%,
      ${THEME_COLORS.primary}25 45%,
      transparent 70%
    );
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
    filter: blur(35px);
    animation:
      ${bgGlowPulse} 6.4s ease-in-out infinite,
      ${bgGlowDrift1} 28s ease-in-out infinite;
    animation-delay: var(--glow-delay-1), var(--glow-delay-1);
  }

  /* 超大背景光晕2 - 右侧 */
  &::after {
    content: '';
    position: fixed;
    width: 1100px;
    height: 1100px;
    top: 10%;
    right: -5%;
    background: radial-gradient(
      circle,
      ${THEME_COLORS.skyBlue}50 0%,
      ${THEME_COLORS.skyBlue}25 45%,
      transparent 70%
    );
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
    filter: blur(40px);
    animation:
      ${bgGlowPulse} 8s ease-in-out infinite,
      ${bgGlowDrift2} 32s ease-in-out infinite;
    animation-delay: var(--glow-delay-2), var(--glow-delay-2);
  }
`

/** 背景光晕层1 - 主要光晕 */
export const BackgroundGlowLayer = styled.div`
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: visible;
  --glow-delay-1: 0s;
  --glow-delay-2: 0s;

  /* 粉色光晕 - 中央偏右 */
  &::before {
    content: '';
    position: absolute;
    width: 900px;
    height: 900px;
    top: 25%;
    right: 20%;
    background: radial-gradient(
      circle,
      ${THEME_COLORS.coral}55 0%,
      ${THEME_COLORS.coral}28 45%,
      transparent 70%
    );
    border-radius: 50%;
    filter: blur(30px);
    animation:
      ${bgGlowPulse} 7.2s ease-in-out infinite,
      ${bgGlowDrift3} 26s ease-in-out infinite;
    animation-delay: var(--glow-delay-1), var(--glow-delay-1);
  }

  /* 淡紫色光晕 - 底部偏左 */
  &::after {
    content: '';
    position: absolute;
    width: 850px;
    height: 850px;
    bottom: -5%;
    left: 20%;
    background: radial-gradient(
      circle,
      ${THEME_COLORS.lavender}50 0%,
      ${THEME_COLORS.lavender}25 45%,
      transparent 70%
    );
    border-radius: 50%;
    filter: blur(28px);
    animation:
      ${bgGlowPulse} 9s ease-in-out infinite,
      ${bgGlowDrift4} 30s ease-in-out infinite;
    animation-delay: var(--glow-delay-2), var(--glow-delay-2);
  }
`

/** 背景光晕层2 - 边缘光晕 */
export const EdgeGlowLayer = styled.div`
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: visible;
  --glow-delay-1: 0s;
  --glow-delay-2: 0s;

  /* 青色光晕 - 左下角 */
  &::before {
    content: '';
    position: absolute;
    width: 700px;
    height: 700px;
    bottom: 10%;
    left: -5%;
    background: radial-gradient(
      circle,
      ${THEME_COLORS.primary}45 0%,
      ${THEME_COLORS.primary}22 45%,
      transparent 70%
    );
    border-radius: 50%;
    filter: blur(25px);
    animation:
      ${bgGlowPulse} 5.6s ease-in-out infinite,
      ${bgGlowDrift1} 22s ease-in-out infinite;
    animation-delay: var(--glow-delay-1), var(--glow-delay-1);
  }

  /* 蓝色光晕 - 右边缘中间 */
  &::after {
    content: '';
    position: absolute;
    width: 900px;
    height: 900px;
    top: 20%;
    right: -10%;
    background: radial-gradient(
      circle,
      ${THEME_COLORS.skyBlue}52 0%,
      ${THEME_COLORS.skyBlue}28 45%,
      transparent 70%
    );
    border-radius: 50%;
    filter: blur(32px);
    animation:
      ${bgGlowPulse} 6.4s ease-in-out infinite,
      ${bgGlowDrift2} 24s ease-in-out infinite;
    animation-delay: var(--glow-delay-2), var(--glow-delay-2);
  }
`

/** 背景光晕层3 - 右侧光晕 */
export const RightGlowLayer = styled.div`
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: visible;
  --glow-delay-1: 0s;
  --glow-delay-2: 0s;

  /* 淡蓝光晕 - 右下角 */
  &::before {
    content: '';
    position: absolute;
    width: 800px;
    height: 800px;
    bottom: 5%;
    right: -5%;
    background: radial-gradient(
      circle,
      ${THEME_COLORS.skyBlue}45 0%,
      ${THEME_COLORS.skyBlue}22 45%,
      transparent 70%
    );
    border-radius: 50%;
    filter: blur(30px);
    animation:
      ${bgGlowPulse} 7.2s ease-in-out infinite,
      ${bgGlowDrift3} 27s ease-in-out infinite;
    animation-delay: var(--glow-delay-1), var(--glow-delay-1);
  }

  /* 淡紫色光晕 - 右侧中部 */
  &::after {
    content: '';
    position: absolute;
    width: 700px;
    height: 700px;
    top: 40%;
    right: 8%;
    background: radial-gradient(
      circle,
      ${THEME_COLORS.lavender}40 0%,
      ${THEME_COLORS.lavender}20 45%,
      transparent 70%
    );
    border-radius: 50%;
    filter: blur(28px);
    animation:
      ${bgGlowPulse} 8s ease-in-out infinite,
      ${bgGlowDrift4} 29s ease-in-out infinite;
    animation-delay: var(--glow-delay-2), var(--glow-delay-2);
  }
`

/** 内容容器 - 轻透明毛玻璃效果 */
export const Container = styled.div<{ $menuCollapsed?: boolean }>`
  max-width: 1000px;
  margin: 20px auto 20px;
  padding: 24px 28px 40px;
  background: rgba(255, 255, 255, 0);
  backdrop-filter: blur(16px) saturate(140%);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
  min-height: calc(100vh - 40px);
  margin-left: ${(props) =>
    (props.$menuCollapsed ? MENU_COLLAPSED_WIDTH : MENU_EXPANDED_WIDTH) + 20}px;
  margin-right: 20px;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
  border-radius: 24px;
  box-shadow:
    0 4px 24px rgba(57, 197, 187, 0.1),
    0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.35);
`

export const StyledCard = styled(Card)`
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`

export const CodeBlock = styled.pre`
  background: #f6f8fa;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  padding: 16px;
  overflow-x: auto;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #24292f;
  margin: 0;

  /* 注释样式 */
  .comment {
    color: #6a737d;
    font-style: italic;
  }

  /* HTML标签 */
  .tag {
    color: #22863a;
  }

  /* 属性名 */
  .attr-name {
    color: #6f42c1;
  }

  /* 属性值 */
  .attr-value {
    color: #032f62;
  }

  /* 关键字 */
  .keyword {
    color: #d73a49;
    font-weight: 500;
  }

  /* 函数名 */
  .function {
    color: #6f42c1;
  }

  /* 字符串 */
  .string {
    color: #032f62;
  }
`

export const HeaderSection = styled(Flex)`
  margin-bottom: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`

export const HeaderContent = styled.div`
  flex: 1;
`

export const HeaderActions = styled(Flex)`
  flex-shrink: 0;
`

export const VersionTag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.2);
`

/** SectionCard 面板标题容器 */
export const PanelHeader = styled(Flex)`
  width: 100%;
`

/** SectionCard 面板标题文本 */
export const PanelTitle = styled(Typography.Text)`
  font-weight: 600;
  font-size: 14px;
`

/** SectionCard 操作按钮组 */
export const PanelActions = styled(Flex)``

/** SectionCard 操作按钮 */
interface PanelActionButtonProps {
  $variant?: 'default' | 'primary'
  $colorPrimary?: string
  $colorPrimaryHover?: string
  $colorPrimaryActive?: string
}

export const PanelActionButton = styled.button<PanelActionButtonProps>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;

  ${(props) =>
    props.$variant === 'primary'
      ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border: none;
    box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
    
    &:hover {
      box-shadow: 0 4px 8px rgba(102, 126, 234, 0.4);
      transform: translateY(-1px);
    }
    
    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
    }
  `
      : `
    background: #fff;
    color: #666;
    border: 1px solid #d9d9d9;
    
    &:hover {
      color: ${props.$colorPrimaryHover || props.$colorPrimary || '#39c5bb'};
      border-color: ${props.$colorPrimaryHover || props.$colorPrimary || '#39c5bb'};
    }
    
    &:active {
      color: ${props.$colorPrimaryActive || '#2ba89f'};
      border-color: ${props.$colorPrimaryActive || '#2ba89f'};
    }
  `}
`

export const AutoSaveHint = styled(Flex)`
  padding: 12px 16px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-left: 3px solid #3b82f6;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #1e40af;

  .anticon {
    font-size: 16px;
    color: #3b82f6;
  }

  .ant-btn-link {
    margin-left: auto;
    padding: 0;
    height: auto;
  }
`

export const PageTitle = styled(Title)`
  &.ant-typography {
    margin-bottom: 8px;
  }
`

export const PageDescription = styled(Paragraph)`
  &.ant-typography {
    margin-bottom: 0;
  }
`

export const SectionTitle = styled(Title)<{ $noMarginTop?: boolean }>`
  &.ant-typography {
    margin-top: ${(props) => (props.$noMarginTop ? '0' : '24px')};
    margin-bottom: 16px;
  }
`

export const SectionSubTitle = styled(Title)`
  &.ant-typography {
    margin-top: 24px;
    margin-bottom: 16px;
  }
`

/** 基础折叠面板样式 */
const baseCollapseStyles = `
  margin-top: 24px;
  margin-bottom: 24px;

  /* 折叠面板头部样式 */
  .ant-collapse-header {
    /* 防止标题被选中 */
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;

    /* 确保箭头图标和标题垂直居中对齐 */
    align-items: center !important;
  }

  /* 确保箭头图标垂直居中 */
  .ant-collapse-expand-icon {
    display: flex;
    align-items: center;
    height: auto !important;
    padding-inline-end: 12px !important;
  }

  /* 确保 header 内容区域占满剩余空间 */
  .ant-collapse-header-text {
    flex: 1;
  }
`

/**
 * Section 折叠面板样式
 * 设计理念：简洁现代，强调排版和留白，底部边框作为视觉锚点
 */
export const StyledCollapseModern = styled(Collapse)`
  ${baseCollapseStyles}

  border: none;
  background: transparent;

  .ant-collapse-item {
    border: none;
    border-radius: 12px !important;
    margin-bottom: 8px;
    background: rgba(255, 255, 255, 0.45);
    backdrop-filter: blur(8px);
    position: relative;
    overflow: hidden;
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.04),
      0 4px 16px rgba(57, 197, 187, 0.06);
    transition: all 0.3s ease;

    /* 底部强调线 - 使用透明渐变 */
    &::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 2px;
      background: linear-gradient(
        90deg,
        rgba(57, 197, 187, 0.6) 0%,
        rgba(57, 197, 187, 0.3) 30%,
        rgba(57, 197, 187, 0.1) 60%,
        transparent 100%
      );
      opacity: 0;
      transition: opacity 0.3s ease;
    }
  }

  .ant-collapse-header {
    padding: 16px 20px;
    background: transparent;

    .ant-collapse-header-text {
      color: #262626;
      font-weight: 700;
      font-size: 15px;
    }

    .ant-collapse-expand-icon {
      color: #8c8c8c;
    }
  }

  .ant-collapse-content {
    border-top: 1px solid #f0f0f0;
    background: transparent;
  }

  .ant-collapse-content-box {
    padding: 20px;
  }

  /* 悬停效果 */
  .ant-collapse-item:hover {
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.06),
      0 8px 24px rgba(57, 197, 187, 0.1);

    &::after {
      opacity: 1;
    }
  }

  /* 展开状态 */
  .ant-collapse-item-active {
    background: rgba(255, 255, 255, 0.45);
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.05),
      0 8px 24px rgba(57, 197, 187, 0.08);

    &::after {
      opacity: 1;
    }

    .ant-collapse-header .ant-collapse-expand-icon {
      color: #39c5bb;
    }
  }
`

/** 默认样式 */
export const StyledCollapse = StyledCollapseModern

export const HelpIcon = styled(InfoCircleOutlined)`
  color: #1890ff;
  cursor: help;
`

export const ExampleSection = styled.div`
  margin-top: 24px;
`

export const ExampleLabel = styled(Text)`
  &.ant-typography {
    display: block;
    margin-bottom: 12px;
  }
`

export const SchemaNote = styled(Paragraph)`
  &.ant-typography {
    margin-top: 12px;
  }
`

/**
 * 配置卡片副标题
 */
export const CardSubtitle = styled(Text)`
  &.ant-typography {
    display: block;
    font-size: 14px;
    color: #8c8c8c;
    margin-bottom: 16px;
  }
`

/**
 * 卡片标题容器（带 emoji）
 */
export const CardTitleContainer = styled(Flex)`
  font-size: 16px;
  font-weight: 600;
`

/**
 * 配置区块分隔线（用于卡片内小标题上方）
 */
export const SectionDivider = styled.div`
  height: 1px;
  background: #f0f0f0;
  margin: 24px 0 16px;
`

/**
 * 表单区块子标题
 * 用于表单内部分组的标签，加粗样式
 */
export const FormSectionLabel = styled.div<{ $noMarginTop?: boolean }>`
  font-size: 13px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.88);
  margin: ${(props) => (props.$noMarginTop ? '0' : '24px')} 0 16px;
`

/**
 * 横向表单行容器
 * 用于将标签、输入框、帮助图标等元素横向排列
 */
export const InlineFormRow = styled(Flex)``

/**
 * 可换行表单容器
 * 用于多个表单项的网格布局，支持自动换行
 */
export const FormRowContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px 32px;
`

/**
 * 不可选中的表单标签
 * 用于表单项前的文本标签，防止用户选中文本
 */
export const FormLabel = styled.span`
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
`

/**
 * 零边距Form.Item
 * 用于内联表单项，移除默认的下边距
 */
export const ZeroMarginFormItem = styled(Form.Item)`
  &.ant-form-item {
    margin-bottom: 0;
  }
`

/**
 * 帮助提示图标
 * 用于表单项旁的帮助说明，带悬停效果
 */
export const HelpTooltipIcon = styled(QuestionCircleOutlined)`
  color: #999;
  cursor: pointer;

  &:hover {
    color: #666;
  }
`

/**
 * 固定宽度输入框
 * 支持通过 $width 属性自定义宽度
 */
export const FixedWidthInput = styled(Input)<{ $width?: number }>`
  width: ${(props) => props.$width || 100}px;
`

/**
 * 固定宽度数字输入框
 * 支持通过 $width 属性自定义宽度
 * 支持 suffix 和 addonAfter 属性显示单位
 */
export const FixedWidthInputNumber = styled(InputNumber)<{ $width?: number }>`
  width: ${(props) => props.$width || 100}px;
`

/**
 * 带可配置间距的Alert
 * 支持通过 $marginTop 和 $marginBottom 属性自定义上下间距
 */
export const SpacedAlert = styled(Alert)<{ $marginTop?: number; $marginBottom?: number }>`
  ${(props) => (props.$marginTop ? `margin-top: ${props.$marginTop}px;` : '')}
  ${(props) => (props.$marginBottom ? `margin-bottom: ${props.$marginBottom}px;` : '')}
`
