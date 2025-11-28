import type { HistoryEntry, HistoryEntryType } from '@/shared/types'
import { ClearOutlined, HistoryOutlined } from '@ant-design/icons'
import { Button, Dropdown } from 'antd'
import React from 'react'
import {
  HistoryDropdownCheck,
  HistoryDropdownClearButtonWrapper,
  HistoryDropdownContainer,
  HistoryDropdownDesc,
  HistoryDropdownEmptyIcon,
  HistoryDropdownEmptyState,
  HistoryDropdownIcon,
  HistoryDropdownInfo,
  HistoryDropdownItem,
  HistoryDropdownList,
  HistoryDropdownMenuItemContent,
  HistoryDropdownTime,
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
  manual: '🔄',
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
 * 历史记录下拉组件
 */
export const HistoryDropdown: React.FC<HistoryDropdownProps> = ({
  history,
  currentIndex,
  onLoadVersion,
  onClearHistory,
  disabled,
  showText = false,
}) => {
  const [open, setOpen] = React.useState(false)

  const handleItemClick = (index: number) => {
    onLoadVersion(index)
    setOpen(false)
  }

  const handleClear = () => {
    onClearHistory()
    setOpen(false)
  }

  const dropdownContent = (
    <HistoryDropdownContainer>
      <HistoryDropdownList>
        {history.length === 0 ? (
          <HistoryDropdownEmptyState>
            <HistoryDropdownEmptyIcon>📭</HistoryDropdownEmptyIcon>
            <div>暂无历史记录</div>
          </HistoryDropdownEmptyState>
        ) : (
          history.map((entry, index) => (
            <HistoryDropdownItem
              key={index}
              $isActive={index === currentIndex}
              onClick={() => handleItemClick(index)}
            >
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
            </HistoryDropdownItem>
          ))
        )}
      </HistoryDropdownList>
      {history.length > 0 && (
        <HistoryDropdownClearButtonWrapper>
          <Button
            block
            size="small"
            danger
            type="primary"
            icon={<ClearOutlined />}
            onClick={handleClear}
          >
            清除历史
          </Button>
        </HistoryDropdownClearButtonWrapper>
      )}
    </HistoryDropdownContainer>
  )

  return (
    <Dropdown
      popupRender={() => dropdownContent}
      trigger={['click']}
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
      getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement}
    >
      <Button size="small" type="text" icon={<HistoryOutlined />} disabled={disabled}>
        {showText && `历史${history.length > 0 ? ` (${history.length})` : ''}`}
      </Button>
    </Dropdown>
  )
}
