import styled from 'styled-components'

/**
 * 编辑器容器
 */
export const EditorContainer = styled.div`
  flex: 1;
  overflow: hidden;
  position: relative;
  border-radius: 12px;
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
