import styled from 'styled-components'

/**
 * 历史记录菜单标题样式
 */
export const HistoryMenuHeader = styled.div`
  padding: 8px 12px;
  font-size: 12px;
  color: #8c8c8c;
  font-weight: 500;
  border-bottom: 1px solid #f0f0f0;
`

/**
 * 历史记录菜单项样式
 */
export const HistoryMenuItem = styled.div<{ isActive?: boolean }>`
  padding: 10px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  background: ${props => props.isActive ? '#e6f7ff' : 'transparent'};
  transition: background 0.2s ease;
  pointer-events: none; /* 让点击事件穿透到 Menu.Item */
  
  &:hover {
    background: ${props => props.isActive ? '#e6f7ff' : '#f5f5f5'};
  }
  
  .history-icon {
    font-size: 16px;
    flex-shrink: 0;
    line-height: 1;
  }
  
  .history-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  
  .history-time {
    font-size: 11px;
    color: #8c8c8c;
    line-height: 1.4;
  }
  
  .history-desc {
    font-size: 13px;
    color: #262626;
    font-weight: ${props => props.isActive ? '500' : '400'};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.4;
  }
  
  .history-check {
    color: #1890ff;
    font-weight: 600;
    font-size: 14px;
    flex-shrink: 0;
  }
`

/**
 * 清除历史按钮样式
 */
export const HistoryClearButton = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  color: #ff4d4f;
  font-size: 13px;
  border-top: 1px solid #f0f0f0;
  transition: background 0.2s ease;
  pointer-events: none; /* 让点击事件穿透到 Menu.Item */
  
  &:hover {
    background: #fff1f0;
  }
`

/**
 * 历史记录空状态样式
 */
export const HistoryEmptyState = styled.div`
  padding: 20px;
  text-align: center;
  color: #8c8c8c;
  font-size: 13px;
`

