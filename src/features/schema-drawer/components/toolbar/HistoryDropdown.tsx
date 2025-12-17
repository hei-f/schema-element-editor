import { HistoryIcon } from '@/shared/icons/drawer/title/HistoryIcon'
import type { HistoryEntry } from '@/shared/types'
import { ClearOutlined } from '@ant-design/icons'
import { Button, Dropdown, Tooltip } from 'antd'
import React from 'react'
import { DrawerTitleButton } from '../DrawerTitle/styles'
import {
  HistoryDropdownCheck,
  HistoryDropdownClearButtonWrapper,
  HistoryDropdownContainer,
  HistoryDropdownDesc,
  HistoryDropdownEmptyIcon,
  HistoryDropdownEmptyState,
  HistoryDropdownInfo,
  HistoryDropdownItem,
  HistoryDropdownList,
  HistoryDropdownMenuItemContent,
  HistoryDropdownTime,
} from '../../styles/toolbar/history-dropdown.styles'

interface HistoryDropdownProps {
  history: HistoryEntry[]
  currentIndex: number
  onLoadVersion: (index: number) => void
  onClearHistory: () => void
  disabled: boolean
  showText?: boolean
  themeColor?: string
  editorTheme?: string
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
  themeColor = '#0066ff',
  editorTheme = 'light',
}) => {
  const [open, setOpen] = React.useState(false)
  const isDark = editorTheme !== 'light'

  const handleItemClick = (index: number) => {
    onLoadVersion(index)
    setOpen(false)
  }

  const handleClear = () => {
    onClearHistory()
    setOpen(false)
  }

  const dropdownContent = (
    <HistoryDropdownContainer $isDark={isDark}>
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
              $isDark={isDark}
              $isActive={index === currentIndex}
              $themeColor={themeColor}
              onClick={() => handleItemClick(index)}
            >
              <HistoryDropdownMenuItemContent>
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
        <HistoryDropdownClearButtonWrapper $isDark={isDark}>
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
      <Tooltip title="编辑历史">
        <DrawerTitleButton
          size="small"
          type="text"
          icon={<HistoryIcon />}
          disabled={disabled}
          aria-label="history"
        >
          {showText && `历史${history.length > 0 ? ` (${history.length})` : ''}`}
        </DrawerTitleButton>
      </Tooltip>
    </Dropdown>
  )
}
