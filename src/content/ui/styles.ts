import styled from 'styled-components'

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
  background: ${(props) =>
    props.$isValid ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 77, 79, 0.9)'};
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

