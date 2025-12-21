import { QuestionCircleOutlined } from '@ant-design/icons'
import { Alert, Button, Collapse, Flex, Form, Input, InputNumber, Typography } from 'antd'
import styled, { keyframes } from 'styled-components'
import { MENU_COLLAPSED_WIDTH, MENU_EXPANDED_WIDTH } from '../config/menu-config'

const { Text, Title } = Typography

/**
 * 光晕颜色配置
 * 珊瑚粉 #F78DA7、薰衣草紫 #B8A9F3、青绿 #39C5BB
 * 浓度：20%（full）/ 10%（half）
 */
const GLOW_COLORS = {
  pink: (intensity: 'full' | 'half' = 'full') =>
    intensity === 'full' ? 'rgba(247, 141, 167, 0.2)' : 'rgba(247, 141, 167, 0.1)',
  purple: (intensity: 'full' | 'half' = 'full') =>
    intensity === 'full' ? 'rgba(184, 169, 243, 0.2)' : 'rgba(184, 169, 243, 0.1)',
  green: (intensity: 'full' | 'half' = 'full') =>
    intensity === 'full' ? 'rgba(57, 197, 187, 0.2)' : 'rgba(57, 197, 187, 0.1)',
} as const

/** 动画速度倍率 */
const GLOW_SPEED = 3

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
  height: 100vh;
  background: linear-gradient(
    -45deg,
    rgba(57, 197, 187, 0.08),
    rgba(184, 169, 243, 0.06),
    rgba(236, 72, 153, 0.05),
    rgba(57, 197, 187, 0.06),
    rgba(184, 169, 243, 0.08)
  );
  background-size: 400% 400%;
  animation: ${bgGradientFlow} 30s ease infinite;
  position: relative;
  overflow: hidden;
  display: flex;

  --glow-delay-1: 0s;
  --glow-delay-2: 0s;

  /* 左上角 - 绿色 */
  &::before {
    content: '';
    position: fixed;
    width: 900px;
    height: 900px;
    top: -8%;
    left: -5%;
    background: radial-gradient(
      circle,
      ${GLOW_COLORS.green('full')} 0%,
      ${GLOW_COLORS.green('half')} 45%,
      transparent 70%
    );
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
    filter: blur(35px);
    animation:
      ${bgGlowPulse} calc(6.4s / ${GLOW_SPEED}) ease-in-out infinite,
      ${bgGlowDrift1} calc(28s / ${GLOW_SPEED}) ease-in-out infinite;
    animation-delay: var(--glow-delay-1), var(--glow-delay-1);
  }

  /* 右上角 - 紫色 */
  &::after {
    content: '';
    position: fixed;
    width: 900px;
    height: 900px;
    top: -8%;
    right: -5%;
    background: radial-gradient(
      circle,
      ${GLOW_COLORS.purple('full')} 0%,
      ${GLOW_COLORS.purple('half')} 45%,
      transparent 70%
    );
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
    filter: blur(35px);
    animation:
      ${bgGlowPulse} calc(8s / ${GLOW_SPEED}) ease-in-out infinite,
      ${bgGlowDrift2} calc(32s / ${GLOW_SPEED}) ease-in-out infinite;
    animation-delay: var(--glow-delay-2), var(--glow-delay-2);
  }

  .see-form-item {
    margin-bottom: 0;
  }
`

/** 背景光晕层1 - 中间行光晕 */
export const BackgroundGlowLayer = styled.div`
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: visible;
  --glow-delay-1: 0s;
  --glow-delay-2: 0s;

  /* 左中 - 粉色 */
  &::before {
    content: '';
    position: absolute;
    width: 850px;
    height: 850px;
    top: 35%;
    left: -8%;
    background: radial-gradient(
      circle,
      ${GLOW_COLORS.pink('full')} 0%,
      ${GLOW_COLORS.pink('half')} 45%,
      transparent 70%
    );
    border-radius: 50%;
    filter: blur(30px);
    animation:
      ${bgGlowPulse} calc(7.2s / ${GLOW_SPEED}) ease-in-out infinite,
      ${bgGlowDrift3} calc(26s / ${GLOW_SPEED}) ease-in-out infinite;
    animation-delay: var(--glow-delay-1), var(--glow-delay-1);
  }

  /* 右中 - 粉色 */
  &::after {
    content: '';
    position: absolute;
    width: 850px;
    height: 850px;
    top: 35%;
    right: -8%;
    background: radial-gradient(
      circle,
      ${GLOW_COLORS.pink('full')} 0%,
      ${GLOW_COLORS.pink('half')} 45%,
      transparent 70%
    );
    border-radius: 50%;
    filter: blur(30px);
    animation:
      ${bgGlowPulse} calc(9s / ${GLOW_SPEED}) ease-in-out infinite,
      ${bgGlowDrift4} calc(30s / ${GLOW_SPEED}) ease-in-out infinite;
    animation-delay: var(--glow-delay-2), var(--glow-delay-2);
  }
`

/** 背景光晕层2 - 底部行光晕 */
export const EdgeGlowLayer = styled.div<{ $visible?: boolean }>`
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: visible;
  --glow-delay-1: 0s;
  --glow-delay-2: 0s;
  display: ${(props) => (props.$visible === false ? 'none' : 'block')};

  /* 左下角 - 紫色 */
  &::before {
    content: '';
    position: absolute;
    width: 900px;
    height: 900px;
    bottom: -8%;
    left: -5%;
    background: radial-gradient(
      circle,
      ${GLOW_COLORS.purple('full')} 0%,
      ${GLOW_COLORS.purple('half')} 45%,
      transparent 70%
    );
    border-radius: 50%;
    filter: blur(35px);
    animation:
      ${bgGlowPulse} calc(5.6s / ${GLOW_SPEED}) ease-in-out infinite,
      ${bgGlowDrift1} calc(22s / ${GLOW_SPEED}) ease-in-out infinite;
    animation-delay: var(--glow-delay-1), var(--glow-delay-1);
  }

  /* 右下角 - 绿色 */
  &::after {
    content: '';
    position: absolute;
    width: 900px;
    height: 900px;
    bottom: -8%;
    right: -5%;
    background: radial-gradient(
      circle,
      ${GLOW_COLORS.green('full')} 0%,
      ${GLOW_COLORS.green('half')} 45%,
      transparent 70%
    );
    border-radius: 50%;
    filter: blur(35px);
    animation:
      ${bgGlowPulse} calc(6.4s / ${GLOW_SPEED}) ease-in-out infinite,
      ${bgGlowDrift2} calc(24s / ${GLOW_SPEED}) ease-in-out infinite;
    animation-delay: var(--glow-delay-2), var(--glow-delay-2);
  }
`

/** 滚动区域包装器 - 占据侧边栏右侧的所有空间 */
export const ScrollWrapper = styled.div<{ $menuCollapsed?: boolean }>`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  margin-left: ${(props) => (props.$menuCollapsed ? MENU_COLLAPSED_WIDTH : MENU_EXPANDED_WIDTH)}px;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  /* 滚动条样式 */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.15);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.25);
  }
`

/** 内容容器 - 轻透明毛玻璃效果 */
export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 1000px;
  margin: 20px auto 20px 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0);
  backdrop-filter: blur(16px) saturate(140%);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
  position: relative;
  z-index: 1;
  border-radius: 24px;
  box-shadow:
    0 4px 24px rgba(57, 197, 187, 0.1),
    0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.35);
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
  && {
    @media (max-width: 768px) {
      flex-direction: column;
      align-items: stretch;
    }
  }
`

export const HeaderContent = styled.div`
  flex: 1;
`

export const VersionTag = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  padding: 0 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.2);
`

/** 顶部操作栏容器 */
export const HeaderToolbar = styled(Flex)`
  && {
    gap: 8px;
  }
`

/** 版本信息容器（版本号 + 分隔线 + 检查更新按钮） */
export const VersionContainer = styled.div`
  display: flex;
  align-items: center;
  height: 30px;
  gap: 8px;
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 12px;
  padding: 0 2px 0 12px;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.04),
    0 4px 16px color-mix(in srgb, var(--see-color-primary, #1677ff) 6%, transparent);
`

/** 版本号文字 */
export const VersionText = styled.span`
  color: #666f8d;
  font-size: 12px;
  font-weight: 600;
`

/** 版本容器内的竖直分隔线 */
export const VersionDivider = styled.div`
  width: 1px;
  height: 12px;
  background: #d9d9d9;
`

/** 检查更新按钮 */
export const CheckUpdateButton = styled(Button)`
  && {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 8px;
    height: 24px;
    /* background: #ffffff; */
    border-radius: 16px;
    font-size: 12px;
    /* color: #666f8d; */
    cursor: pointer;
    /* transition: all 0.2s ease; */
    /* border: 1px solid transparent !important; */
  }
`

/** 保存预设配置按钮 */
export const SavePresetButton = styled(Button)`
  && {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 12px;
    height: 24px;
    border-radius: 16px;
    font-size: 12px;
  }
`

/** 管理预设配置按钮（图标按钮） */
export const ManagePresetButton = styled(Button)`
  && {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 0;
    border-radius: 50%;
    font-size: 14px;
  }
`

/** 提示信息容器（圆点 + 提示文字 + 恢复默认按钮） */
export const HintContainer = styled(VersionContainer)`
  gap: 16px;
  padding: 0 12px;
`

/** 提示内容（圆点 + 文字） */
export const HintContent = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`

/** 提示圆点 */
export const HintDot = styled.div`
  width: 4px;
  height: 4px;
  background: #666f8d;
  border-radius: 50%;
`

/** 提示文字 */
export const HintText = styled.span`
  font-size: 12px;
  color: #666f8d;
`

/** 恢复默认按钮 */
export const ResetDefaultButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  /* padding: 0; */
  height: auto;
  background: transparent;
  border: none;
  font-size: 12px;
  color: var(--theme-color, #1890ff);
  transition: opacity 0.2s ease;
  box-shadow: none;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
    color: var(--theme-color, #1890ff) !important;
    background: transparent !important;
    border: none !important;
  }
`

/** SectionCard 面板标题容器 */
export const PanelHeader = styled(Flex)`
  && {
    width: 100%;
  }
`

/** SectionCard 面板图标 */
export const PanelIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #353e5c;
`

/** SectionCard 面板标题文本 */
export const PanelTitle = styled(Typography.Text)`
  && {
    font-weight: 500;
    font-size: 16px;
    color: #353e5c;
  }
`

/** SectionCard 标题容器（包含标题和帮助图标） */
export const PanelTitleWrapper = styled(Flex)``

/** SectionCard 标题帮助图标 */
export const PanelTitleHelpIcon = styled(QuestionCircleOutlined)`
  && {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.45);
    cursor: help;
    transition: color 0.2s;

    &:hover {
      color: rgba(0, 0, 0, 0.65);
    }
  }
`

/** SectionCard 操作按钮组 */
export const PanelActions = styled(Flex)``

/** SectionCard 操作按钮（antd Button 版本，用于恢复默认等） */
interface PanelActionButtonProps {
  $variant?: 'default' | 'primary'
  $colorPrimary?: string
  $colorPrimaryHover?: string
  $colorPrimaryActive?: string
}

export const PanelActionButton = styled(Button)<PanelActionButtonProps>`
  && {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 12px;
    height: auto;
    font-size: 12px;
    font-weight: 500;
    border-radius: 16px;
    transition: all 0.2s ease;
    background: #ffffff;
    color: #666f8d;
    border: 1px solid #e6ecf4;

    &:hover {
      color: ${(props) => props.$colorPrimaryHover || props.$colorPrimary || '#39c5bb'} !important;
      border-color: ${(props) =>
        props.$colorPrimaryHover || props.$colorPrimary || '#39c5bb'} !important;
      background: #ffffff !important;
    }

    &:active {
      color: ${(props) => props.$colorPrimaryActive || '#2ba89f'} !important;
      border-color: ${(props) => props.$colorPrimaryActive || '#2ba89f'} !important;
    }
  }
`

/** SectionCard 操作按钮（原生 button 版本，用于一键精简等特殊按钮） */
export const NativePanelActionButton = styled.button<{ $variant?: 'default' | 'primary' }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  height: auto;
  font-size: 12px;
  font-weight: 500;
  border-radius: 16px;
  transition: all 0.2s ease;
  cursor: pointer;
  outline: none;

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
    background: #ffffff;
    color: #666f8d;
    border: 1px solid #e6ecf4;
    
    &:hover {
      color: var(--see-color-primary, #1677ff);
      border-color: var(--see-color-primary, #1677ff);
    }
  `}
`

/** Surprise me 按钮样式（复用 NativePanelActionButton 的 primary 样式） */
export const SurpriseButton = styled(NativePanelActionButton).attrs({
  $variant: 'primary' as const,
})``

export const PageTitle = styled(Title)`
  &.see-typography {
    margin: 0;
  }
`

/**
 * Section 折叠面板样式
 * 设计理念：简洁现代，强调排版和留白，底部边框作为视觉锚点
 */
export const StyledCollapseModern = styled(Collapse)<{ id?: string }>`
  && {
    border: none;
    background: transparent;
  }

  .see-collapse-item {
    border: none;
    border-radius: 12px !important;
    margin-bottom: 8px;
    background: rgba(255, 255, 255, 0.45);
    backdrop-filter: blur(8px);
    position: relative;
    overflow: hidden;
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.04),
      0 4px 16px color-mix(in srgb, var(--see-color-primary, #1677ff) 6%, transparent);
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
        color-mix(in srgb, var(--see-color-primary, #1677ff) 60%, transparent) 0%,
        color-mix(in srgb, var(--see-color-primary, #1677ff) 30%, transparent) 30%,
        color-mix(in srgb, var(--see-color-primary, #1677ff) 10%, transparent) 60%,
        transparent 100%
      );
      opacity: 0;
      transition: opacity 0.3s ease;
    }
  }

  .see-collapse-header {
    padding: 16px 20px;
    background: transparent;
    /* 防止标题被选中 */
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    /* 确保箭头图标和标题垂直居中对齐 */
    align-items: center !important;

    .see-collapse-header-text {
      flex: 1;
      color: #262626;
      font-weight: 700;
      font-size: 15px;
    }

    .see-collapse-expand-icon {
      display: flex;
      align-items: center;
      height: auto !important;
      padding-inline-end: 12px !important;
      color: #8c8c8c;
    }
  }

  .see-collapse-content {
    border-top: 1px solid #f0f0f0;
    background: transparent;
  }

  .see-collapse-content-box {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  /* 悬停效果 */
  .see-collapse-item:hover {
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.06),
      0 8px 24px color-mix(in srgb, var(--see-color-primary, #1677ff) 10%, transparent);

    &::after {
      opacity: 1;
    }
  }

  /* 展开状态 */
  .see-collapse-item-active {
    background: rgba(255, 255, 255, 0.45);
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.05),
      0 8px 24px color-mix(in srgb, var(--see-color-primary, #1677ff) 8%, transparent);

    &::after {
      opacity: 1;
    }

    .see-collapse-header .see-collapse-expand-icon {
      color: var(--see-color-primary, #1677ff);
    }
  }
`

export const ExampleSection = styled(Flex)``

export const ExampleLabel = styled(Text)`
  &.see-typography {
    display: block;
  }
`

/**
 * 表单区块容器
 * 用于包装子标题和它下面的内容，内部使用 flex + gap: 8px
 */
/** 表单分组容器：子标题 + FormContent */
export const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

/** 表单内容容器：包裹 Form.Item，控制表单项之间的间距 */
export const FormContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

/**
 * 表单区块子标题
 * 用于表单内部分组的标签
 * 配合 FormSection 容器使用，通过 gap 控制与内容的间距
 * 样式：浅色背景容器 + 左侧装饰线
 */
export const FormSectionLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #353e5c;
  position: relative;
  padding: 8px 12px 8px 14px;
  background: color-mix(in srgb, var(--see-color-primary, #1677ff) 6%, transparent);
  border-radius: 8px;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 60%;
    background: linear-gradient(
      180deg,
      var(--see-color-primary, #1677ff),
      color-mix(in srgb, var(--see-color-primary, #1677ff) 60%, white)
    );
    border-radius: 0 2px 2px 0;
  }

  /* 锚点高亮动画 - 使用 box-shadow 避免与背景色冲突 */
  &.anchor-highlight {
    animation: anchorHighlight 2s ease;
  }

  @keyframes anchorHighlight {
    0% {
      box-shadow:
        0 0 0 2px color-mix(in srgb, var(--see-color-primary, #1677ff) 40%, transparent),
        0 0 12px color-mix(in srgb, var(--see-color-primary, #1677ff) 30%, transparent);
    }
    100% {
      box-shadow:
        0 0 0 0 transparent,
        0 0 0 transparent;
    }
  }
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
  &.see-form-item {
    margin-bottom: 0;
  }
`

/**
 * 帮助提示图标
 * 用于表单项旁的帮助说明，带悬停效果
 */
export const HelpTooltipIcon = styled(QuestionCircleOutlined)`
  && {
    color: rgba(0, 0, 0, 0.45);
    cursor: help;
    font-size: 14px;

    &:hover {
      color: rgba(0, 0, 0, 0.65);
    }
  }
`

/**
 * 固定宽度输入框
 * 支持通过 $width 属性自定义宽度
 */
export const FixedWidthInput = styled(Input)<{ $width?: number }>`
  && {
    width: ${(props) => props.$width || 100}px;
  }
`

/**
 * 固定宽度数字输入框
 * 支持通过 $width 属性自定义宽度
 * 支持 suffix 和 addonAfter 属性显示单位
 */
export const FixedWidthInputNumber = styled(InputNumber)<{ $width?: number }>`
  && {
    width: ${(props) => props.$width || 100}px;
  }
`

/**
 * 带可配置间距的Alert
 * 支持通过 $marginTop 和 $marginBottom 属性自定义上下间距
 */
export const SpacedAlert = styled(Alert)<{ $marginTop?: number; $marginBottom?: number }>`
  && {
    ${(props) => (props.$marginTop ? `margin-top: ${props.$marginTop}px;` : '')}
    ${(props) => (props.$marginBottom ? `margin-bottom: ${props.$marginBottom}px;` : '')}
  }
`

/**
 * 辅助说明文本
 * 用于表单下方的次要提示信息
 */
export const SecondaryHintText = styled(Text)`
  /* && {
    display: block;
  } */
`
