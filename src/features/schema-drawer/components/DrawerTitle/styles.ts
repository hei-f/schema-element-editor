import { Button } from 'antd'
import styled, { keyframes } from 'styled-components'

/**
 * 淡入淡出动画（用于自动保存成功提示）
 */
const fadeInOut = keyframes`
  0% {
    opacity: 0;
    transform: translateY(-2px);
  }
  10% {
    opacity: 0.8;
    transform: translateY(0);
  }
  90% {
    opacity: 0.8;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-2px);
  }
`

/**
 * 淡入动画（用于草稿检测提示）
 */
const fadeIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(-2px);
  }
  100% {
    opacity: 0.8;
    transform: translateY(0);
  }
`

/**
 * 抽屉标题容器
 */
export const DrawerTitleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

/**
 * 抽屉标题左侧内容区域
 */
export const DrawerTitleLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`

/**
 * 抽屉标题操作按钮区域
 */
export const DrawerTitleActions = styled.div`
  flex-shrink: 0;
`

/**
 * 草稿通知提示
 */
export const DraftNotification = styled.span`
  font-size: 12px;
  color: #1890ff;
  opacity: 0.8;
  animation: ${fadeIn} 0.3s ease-in-out;
`

/**
 * 草稿自动保存成功提示
 */
export const DraftAutoSaveSuccess = styled.span`
  font-size: 12px;
  color: #52c41a;
  opacity: 0.8;
  animation: ${fadeInOut} 2s ease-in-out;
`

/**
 * 抽屉标题工具栏按钮
 * primary 按钮使用 CSS 变量 --drawer-theme-color 作为主题色
 */
export const DrawerTitleButton = styled(Button)`
  &.see-btn {
    border-radius: 6px;
    color: rgba(102, 111, 141, 1);

    &:hover:not(:disabled) {
      color: rgba(53, 62, 92, 1);
    }
  }

  /* primary 按钮使用主题色（仅非禁用状态） */
  &.see-btn-primary:not(:disabled):not(.see-btn-disabled) {
    background: var(--drawer-theme-color, #1677ff);
    color: #fff;

    &:hover {
      background: color-mix(in srgb, var(--drawer-theme-color, #1677ff) 85%, #ffffff);
      color: #fff;
    }

    &:active {
      background: color-mix(in srgb, var(--drawer-theme-color, #1677ff) 85%, #000000);
    }
  }

  .see-btn-icon {
    display: flex;
    justify-content: center;
    align-items: center;
  }
`
