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

/**
 * Shadow DOM容器
 * 用于隔离样式
 */
export const ShadowRootContainer = styled.div`
  all: initial;
  * {
    all: unset;
  }
`

/**
 * Tooltip容器（备用，目前使用原生DOM创建）
 */
export const TooltipContainer = styled.div<{ $isValid: boolean }>`
  position: fixed;
  z-index: 2147483647;
  background: ${(props) => (props.$isValid ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 77, 79, 0.9)')};
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  pointer-events: none;
  max-width: 300px;
  word-wrap: break-word;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
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
 * 编辑器工具栏
 */
export const EditorToolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
  gap: 12px;
  flex-wrap: wrap;
`

/**
 * 参数容器
 */
export const ParamsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  flex: 1;
  min-width: 0;
`

/**
 * 单个参数项
 */
export const ParamItem = styled.div`
  display: flex;
  align-items: center;
  max-width: 300px;
  min-width: 0;
`

/**
 * 编辑器容器
 */
export const EditorContainer = styled.div`
  flex: 1;
  overflow: hidden;
  position: relative;
`

/**
 * 按钮组
 */
export const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`

/**
 * 信息文本
 */
export const InfoText = styled.div`
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 8px;
`

/**
 * 属性标签
 */
export const AttributeTag = styled.span`
  display: inline-block;
  padding: 2px 8px;
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 4px;
  font-size: 12px;
  color: #0050b3;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: help;
`

/**
 * 参数标签
 */
export const ParamLabel = styled.span`
  font-size: 12px;
  color: #8c8c8c;
  margin-right: 4px;
  flex-shrink: 0;
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
 * 错误边界容器
 */
export const ErrorContainer = styled.div`
  padding: 20px;
  color: #ff4d4f;
  background: #fff1f0;
  border: 1px solid #ffccc7;
  border-radius: 4px;
`

/**
 * 重试按钮
 */
export const RetryButton = styled.button`
  padding: 8px 16px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: #40a9ff;
  }

  &:active {
    background: #096dd9;
  }
`
