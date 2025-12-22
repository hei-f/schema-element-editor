import styled from 'styled-components'
import {
  ModernDropdownContainer,
  ModernDropdownEmpty,
  ModernDropdownEmptyIcon,
  ModernDropdownItem,
  ModernDropdownItemContent,
  ModernDropdownList,
  ModernDropdownSection,
} from '../shared/modern-dropdown.styles'

/**
 * 历史下拉容器
 * 继承现代化下拉样式
 */
export const HistoryDropdownContainer = styled(ModernDropdownContainer)`
  width: 280px;
  max-width: 90vw;
`

/**
 * 历史列表容器
 * 使用统一的现代化列表样式
 */
export const HistoryDropdownList = styled(ModernDropdownList)`
  max-height: 360px;
`

/**
 * 历史列表项
 * 继承现代化菜单项的交互效果
 */
export const HistoryDropdownItem = styled(ModernDropdownItem)<{ $isActive: boolean }>`
  /* 历史记录特定的样式可以在这里覆盖 */
`

/**
 * 历史菜单项内容容器
 * 采用单行水平布局，标题和时间左右分布
 */
export const HistoryDropdownMenuItemContent = styled(ModernDropdownItemContent)`
  align-items: center;
`

/**
 * 历史信息容器
 * 水平布局：描述文本居左，时间居右
 */
export const HistoryDropdownInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`

/**
 * 历史描述文本
 * 单行显示，超出省略
 */
export const HistoryDropdownDesc = styled.div<{ $isActive: boolean }>`
  font-size: 13px;
  font-weight: ${(props) => (props.$isActive ? 500 : 400)};
  line-height: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
`

/**
 * 历史时间文本
 * 固定宽度，右对齐
 */
export const HistoryDropdownTime = styled.div<{ $isActive: boolean }>`
  font-size: 12px;
  line-height: 20px;
  color: ${(props) => (props.$isActive ? 'currentColor' : '#8c8c8c')};
  opacity: ${(props) => (props.$isActive ? 0.7 : 0.5)};
  white-space: nowrap;
  flex-shrink: 0;
`

/**
 * 历史选中标记
 */
export const HistoryDropdownCheck = styled.span`
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
  line-height: 20px;
`

/**
 * 历史下拉清除按钮容器
 * 使用统一的区域样式
 */
export const HistoryDropdownClearButtonWrapper = styled(ModernDropdownSection)`
  /* 可以添加历史记录特定的底部区域样式 */
`

/**
 * 历史下拉空状态容器
 */
export const HistoryDropdownEmptyState = styled(ModernDropdownEmpty)`
  /* 使用统一的空状态样式 */
`

/**
 * 空状态图标
 */
export const HistoryDropdownEmptyIcon = styled(ModernDropdownEmptyIcon)`
  /* 使用统一的空状态图标样式 */
`
