import styled from 'styled-components'

/**
 * 编辑器工具栏
 */
export const EditorToolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 24px;
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
 * 按钮组
 */
export const ButtonGroup = styled.div`
  display: flex;
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

