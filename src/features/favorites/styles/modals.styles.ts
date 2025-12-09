import { Alert, Input, Space } from 'antd'
import styled from 'styled-components'

/**
 * 编辑器预览容器
 */
export const PreviewEditorContainer = styled.div`
  height: 600px;
`

/**
 * 编辑模态框内容容器
 */
export const EditModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

/**
 * 名称输入框
 */
export const EditModalNameInput = styled(Input)`
  &.see-input {
    font-size: 14px;
  }
`

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
 * 错误提示
 */
export const ErrorAlert = styled(Alert)`
  &.see-alert {
    margin-top: 8px;
  }
`

/**
 * 全宽垂直布局容器
 */
export const FullWidthVerticalSpace = styled(Space).attrs({
  direction: 'vertical',
  size: 'middle',
})`
  &.see-space {
    width: 100%;
  }
`

/**
 * 列表搜索区域容器
 */
export const ListSearchContainer = styled(Space).attrs({
  direction: 'vertical',
})`
  &.see-space {
    width: 100%;
    margin-bottom: 16px;
  }
`

/**
 * 全宽搜索输入框
 */
export const FullWidthSearchInput = styled(Input.Search)`
  &.see-input {
    width: 100%;
  }
`
