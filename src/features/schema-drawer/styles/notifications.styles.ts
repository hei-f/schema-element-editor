import styled, { keyframes } from 'styled-components'

/**
 * 淡入淡出动画
 */
const fadeInOut = keyframes`
  0% {
    opacity: 0;
    transform: translateY(-2px);
  }
  10% {
    opacity: 0.9;
    transform: translateY(0);
  }
  90% {
    opacity: 0.9;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-2px);
  }
`

/**
 * 轻量操作成功提示（编辑器内）
 */
export const LightSuccessNotification = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
  font-size: 12px;
  color: #52c41a;
  background: rgba(255, 255, 255, 0.95);
  padding: 6px 12px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #b7eb8f;
  opacity: 0.9;
  animation: ${fadeInOut} 1.5s ease-in-out;
  pointer-events: none;
  transition:
    top 0.3s ease-out,
    transform 0.3s ease-out;
`
