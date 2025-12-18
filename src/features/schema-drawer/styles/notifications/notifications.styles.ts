import styled, { keyframes } from 'styled-components'

/**
 * 轻量入场动画
 * 从右侧滑入 + 淡入
 */
const lightSlideIn = keyframes`
  0% {
    opacity: 0;
    transform: translateX(12px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
`

/**
 * 出场动画
 * 淡出 + 微微上移
 */
const lightFadeOut = keyframes`
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-6px);
  }
`

/**
 * 轻量操作成功提示（编辑器内）
 * 保持轻量、简洁、优雅
 */
export const LightSuccessNotification = styled.div<{ $isDark?: boolean }>`
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  font-size: 13px;
  line-height: 1.4;
  font-weight: 500;
  color: ${(props) => (props.$isDark ? '#ffffff' : '#262626')};

  /* 简洁背景 - 深色模式用更亮的背景增强对比 */
  background: ${(props) =>
    props.$isDark
      ? 'linear-gradient(135deg, rgba(60, 75, 65, 0.95) 0%, rgba(55, 70, 60, 0.95) 100%)'
      : 'rgba(255, 255, 255, 0.98)'};
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);

  /* 圆角 */
  border-radius: 6px;

  /* 优化阴影 - 深色背景用微妙的绿色光晕 */
  box-shadow: ${(props) =>
    props.$isDark
      ? `
        0 0 0 1px rgba(82, 196, 26, 0.5),
        0 2px 8px rgba(82, 196, 26, 0.25),
        0 4px 16px rgba(82, 196, 26, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.12)
      `
      : `
        0 2px 8px rgba(0, 0, 0, 0.08),
        0 4px 12px rgba(0, 0, 0, 0.05),
        0 0 0 1px rgba(0, 0, 0, 0.04)
      `};

  /* 入场和出场动画 - 对标 antd message 的 3 秒停留时间 */
  animation:
    ${lightSlideIn} 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    ${lightFadeOut} 0.2s cubic-bezier(0.4, 0, 0.2, 1) 2.8s forwards;

  /* 禁用交互 */
  pointer-events: none;
  user-select: none;

  /* 平滑过渡（用于多个通知时的位置变化） */
  transition: top 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  /* 成功图标样式 - 简洁的圆形徽章 */
  &::before {
    content: '✓';
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    font-size: 11px;
    font-weight: 700;
    color: ${(props) => (props.$isDark ? '#52c41a' : '#52c41a')};
    background: ${(props) =>
      props.$isDark ? 'rgba(82, 196, 26, 0.12)' : 'rgba(82, 196, 26, 0.1)'};
    border-radius: 50%;
  }
`
