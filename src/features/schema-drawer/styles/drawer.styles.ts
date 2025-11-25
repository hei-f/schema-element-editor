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
 * 草稿通知提示（3秒后消失）
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
 * 抽屉内容容器
 */
export const DrawerContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0;
`

/**
 * 抽屉底部按钮组（右对齐 + 间距）
 */
export const DrawerFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
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
 * 预览区域可拖拽分隔条
 */
export const PreviewResizer = styled.div<{ $isDragging?: boolean }>`
  width: 8px;
  height: 100%;
  background: ${props => props.$isDragging ? '#1890ff' : '#d9d9d9'};
  cursor: col-resize;
  flex-shrink: 0;
  position: relative;
  transition: background 0.2s;
  border-left: 1px solid #bfbfbf;
  border-right: 1px solid #bfbfbf;
  user-select: none;
  z-index: 10;
  
  &:hover {
    background: #1890ff;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -4px;
    right: -4px;
    bottom: 0;
    cursor: col-resize;
  }
`

/**
 * 预览模式主容器
 */
export const PreviewModeContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`

/**
 * 预览区域和编辑器并排容器
 */
export const PreviewEditorRow = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
  position: relative;
  overflow: hidden;
`

/**
 * 预览占位区域
 */
export const PreviewPlaceholder = styled.div<{ $width: number }>`
  width: ${props => props.$width}%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
  flex-shrink: 0;
  position: relative;
`

/**
 * 预览模式下的编辑器容器
 */
export const PreviewEditorContainer = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  position: relative;
`

