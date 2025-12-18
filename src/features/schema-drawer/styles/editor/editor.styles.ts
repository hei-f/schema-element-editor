import styled from 'styled-components'

/**
 * 编辑器容器
 */
export const EditorContainer = styled.div`
  flex: 1;
  overflow: visible; /* 允许轻量提示的光晕效果溢出 */
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
