import type { HistoryEntry, HistoryEntryType } from '@/shared/types'
import { shadowRootManager } from '@/shared/utils/shadow-root-manager'
import { ClearOutlined, HistoryOutlined } from '@ant-design/icons'
import { Button, Dropdown, type MenuProps } from 'antd'
import React, { useMemo } from 'react'
import {
  HistoryDropdownCheck,
  HistoryDropdownClearButtonWrapper,
  HistoryDropdownDesc,
  HistoryDropdownEmptyIcon,
  HistoryDropdownEmptyState,
  HistoryDropdownIcon,
  HistoryDropdownInfo,
  HistoryDropdownMenuItemContent,
  HistoryDropdownTime
} from '../styles/history-dropdown.styles'

interface HistoryDropdownProps {
  history: HistoryEntry[]
  currentIndex: number
  onLoadVersion: (index: number) => void
  onClearHistory: () => void
  disabled: boolean
  showText?: boolean
}

/**
 * 历史类型图标映射
 */
const HISTORY_ICONS: Record<HistoryEntryType, string> = {
  initial: '📄',
  auto: '✏️',
  save: '💾',
  draft: '📝',
  favorite: '⭐',
  manual: '🔄'
}

/**
 * 时间格式化
 */
const formatTimeAgo = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return '刚刚'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟前`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}小时前`
  const date = new Date(timestamp)
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

/**
 * 历史记录下拉组件（Dropdown 版本）
 */
export const HistoryDropdown: React.FC<HistoryDropdownProps> = ({
  history,
  currentIndex,
  onLoadVersion,
  onClearHistory,
  disabled,
  showText = true
}) => {
  const [open, setOpen] = React.useState(false)
  
  /**
   * 处理菜单点击
   */
  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'clear') {
      onClearHistory()
      setOpen(false)
    } else {
      const index = parseInt(key, 10)
      if (!isNaN(index)) {
        onLoadVersion(index)
        setOpen(false)
      }
    }
  }
  
  /**
   * 生成菜单项
   */
  const menuItems: MenuProps['items'] = useMemo(() => {
    if (history.length === 0) {
      return [
        {
          key: 'empty',
          label: (
            <HistoryDropdownEmptyState>
              <HistoryDropdownEmptyIcon>📭</HistoryDropdownEmptyIcon>
              <div>暂无历史记录</div>
            </HistoryDropdownEmptyState>
          ),
          disabled: true
        }
      ]
    }
    
    const items: MenuProps['items'] = history.map((entry, index) => ({
      key: String(index),
      label: (
        <HistoryDropdownMenuItemContent>
          <HistoryDropdownIcon>{HISTORY_ICONS[entry.type]}</HistoryDropdownIcon>
          <HistoryDropdownInfo>
            <HistoryDropdownDesc $isActive={index === currentIndex}>
              {entry.description || '内容变更'}
            </HistoryDropdownDesc>
            <HistoryDropdownTime $isActive={index === currentIndex}>
              {formatTimeAgo(entry.timestamp)}
            </HistoryDropdownTime>
          </HistoryDropdownInfo>
          {index === currentIndex && <HistoryDropdownCheck>✓</HistoryDropdownCheck>}
        </HistoryDropdownMenuItemContent>
      )
    }))
    
    // 添加分隔线和清除按钮
    items.push(
      {
        type: 'divider'
      },
      {
        key: 'clear',
        label: (
          <HistoryDropdownClearButtonWrapper>
            <Button
              block
              size="small"
              danger
              type="primary"
              icon={<ClearOutlined />}
            >
              清除历史
            </Button>
          </HistoryDropdownClearButtonWrapper>
        ),
        style: { padding: 0 }
      }
    )
    
    return items
  }, [history, currentIndex])
  
  return (
    <Dropdown
      menu={{
        items: menuItems,
        onClick: handleMenuClick
      }}
      trigger={['click']}
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
      getPopupContainer={() => shadowRootManager.getContainer()}
      overlayStyle={{ maxHeight: '500px', overflow: 'auto' }}
    >
      <Button
        size="small"
        type="text"
        icon={<HistoryOutlined />}
        disabled={disabled}
      >
        {showText && `历史${history.length > 0 ? ` (${history.length})` : ''}`}
      </Button>
    </Dropdown>
  )
}

