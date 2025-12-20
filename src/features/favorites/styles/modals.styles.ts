import { Alert, Input, Space, Table, Tag, Button } from 'antd'
import styled from 'styled-components'

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

/**
 * 收藏模态框标签
 */
export const FavoriteModalTag = styled(Tag)`
  && {
    display: inline-flex;
    align-items: center;
    margin: 0;
  }
`

/**
 * 可点击的收藏模态框标签
 */
export const ClickableFavoriteModalTag = styled(FavoriteModalTag)`
  && {
    cursor: pointer;
  }
`

/**
 * 标签颜色选择网格
 */
export const TagColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  margin-top: 8px;
`

/**
 * 标签颜色选择框
 */
export const TagColorBox = styled.div<{ $selected: boolean }>`
  width: 100%;
  height: 40px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid ${(props) => (props.$selected ? '#1677ff' : '#f0f0f0')};
  background: ${(props) => (props.$selected ? '#f0f8ff' : '#fff')};
  transition: all 0.2s;

  &:hover {
    transform: scale(1.05);
    border-color: #1677ff;
    box-shadow: 0 2px 8px rgba(22, 119, 255, 0.2);
  }
`

/**
 * 标签预览区域
 */
export const TagPreviewSection = styled.div`
  margin-top: 16px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 4px;
`

/**
 * 标签预览标签文本
 */
export const TagPreviewLabel = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
`

/**
 * 收藏列表固定按钮
 */
export const FavoritesPinButton = styled(Button)<{ $pinned: boolean }>`
  && {
    font-size: 16px !important;
    transition: all 0.2s;

    ${(props) =>
      props.$pinned
        ? `
      color: #faad14 !important;
    `
        : `
      color: #d9d9d9 !important;
      &:hover {
        color: #faad14 !important;
      }
    `}
  }
`

/**
 * 表单标签
 */
export const FormLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
`

/**
 * 错误提示文本
 */
export const ErrorText = styled.div`
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 4px;
`

/**
 * 表单区域容器
 */
export const FormSection = styled.div`
  margin-top: 16px;
`

/**
 * 表单项容器
 */
export const FormItem = styled.div`
  margin-bottom: 8px;
`

/**
 * 收藏名称文本
 */
export const FavoriteName = styled.span<{ $pinned?: boolean }>`
  font-weight: ${(props) => (props.$pinned ? 600 : 400)};
`

/**
 * 收藏列表表格
 * 支持固定行的高亮样式
 */
export const FavoritesTable = styled(Table)`
  && .pinned-row {
    background-color: #fffbf0 !important;
  }

  && .pinned-row:hover > td {
    background-color: #fff7e6 !important;
  }
` as typeof Table
