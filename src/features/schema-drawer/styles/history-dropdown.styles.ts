import styled from 'styled-components'

/**
 * 历史下拉菜单项内容容器
 */
export const HistoryDropdownMenuItemContent = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 0;
  min-width: 300px;
`

/**
 * 历史图标
 */
export const HistoryDropdownIcon = styled.span`
  font-size: 18px;
  flex-shrink: 0;
`

/**
 * 历史信息容器
 */
export const HistoryDropdownInfo = styled.div`
  flex: 1;
  min-width: 0;
`

/**
 * 历史描述文本
 */
export const HistoryDropdownDesc = styled.div<{ $isActive: boolean }>`
  font-size: 14px;
  font-weight: ${props => props.$isActive ? 600 : 500};
  color: ${props => props.$isActive ? '#1890ff' : '#262626'};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

/**
 * 历史时间文本
 */
export const HistoryDropdownTime = styled.div<{ $isActive: boolean }>`
  font-size: 12px;
  color: ${props => props.$isActive ? '#40a9ff' : '#8c8c8c'};
  margin-top: 2px;
`

/**
 * 历史选中标记
 */
export const HistoryDropdownCheck = styled.span`
  color: #1890ff;
  font-size: 16px;
  font-weight: bold;
  flex-shrink: 0;
`

/**
 * 历史下拉清除按钮容器
 */
export const HistoryDropdownClearButtonWrapper = styled.div`
  padding: 8px 12px;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
`

/**
 * 历史下拉空状态容器
 */
export const HistoryDropdownEmptyState = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: #8c8c8c;
  font-size: 14px;
`

/**
 * 空状态图标
 */
export const HistoryDropdownEmptyIcon = styled.div`
  font-size: 36px;
  margin-bottom: 8px;
  opacity: 0.5;
`

