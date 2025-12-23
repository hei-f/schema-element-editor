import type { SchemaSnapshot, EditorTheme } from '@/shared/types'
import { Select } from 'antd'
import React, { useState } from 'react'
import {
  VersionSelectorContainer,
  VersionSelectorList,
  VersionSelectorItem,
  VersionSelectorContent,
  VersionSelectorInfo,
  VersionSelectorLabel,
  VersionSelectorTime,
  VersionSelectorCheck,
} from '../../styles/recording/version-selector.styles'

interface VersionSelectorProps {
  /** 版本快照列表 */
  snapshots: SchemaSnapshot[]
  /** 当前选中的版本ID */
  value: number
  /** 版本切换回调 */
  onChange: (versionId: number) => void
  /** 显示标签（用于accessibility） */
  label: string
  /** 编辑器主题 */
  theme?: EditorTheme
  /** 主题色 */
  themeColor?: string
}

/**
 * 格式化时间戳（毫秒）
 */
function formatTimestamp(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`
  }
  const seconds = (ms / 1000).toFixed(1)
  return `${seconds}s`
}

/**
 * 版本选择器组件
 * 使用统一的 ModernDropdown 样式系统
 */
export const VersionSelector: React.FC<VersionSelectorProps> = (props) => {
  const { snapshots, value, onChange, label, theme = 'light', themeColor = '#0066ff' } = props

  const isDark = theme !== 'light'
  const [open, setOpen] = useState(false)

  /** 生成 Select 的 options 数据 */
  const options = snapshots.map((snapshot, index) => ({
    label: `版本 ${index + 1}`,
    value: snapshot.id,
  }))

  /**
   * 处理选项点击
   */
  const handleItemClick = (snapshotId: number) => {
    onChange(snapshotId)
    setOpen(false)
  }

  /**
   * 自定义下拉内容渲染
   * 完全替换 Antd Select 的默认下拉菜单
   */
  const dropdownRender = () => {
    return (
      <VersionSelectorContainer $isDark={isDark}>
        <VersionSelectorList $isDark={isDark}>
          {snapshots.map((snapshot, index) => {
            const isActive = snapshot.id === value

            return (
              <VersionSelectorItem
                key={snapshot.id}
                $isDark={isDark}
                $isActive={isActive}
                $themeColor={themeColor}
                onClick={() => handleItemClick(snapshot.id)}
              >
                <VersionSelectorContent>
                  <VersionSelectorInfo>
                    <VersionSelectorLabel $isActive={isActive}>
                      版本 {index + 1}
                    </VersionSelectorLabel>
                    <VersionSelectorTime $isActive={isActive}>
                      {formatTimestamp(snapshot.timestamp)}
                    </VersionSelectorTime>
                  </VersionSelectorInfo>
                  {isActive && <VersionSelectorCheck>✓</VersionSelectorCheck>}
                </VersionSelectorContent>
              </VersionSelectorItem>
            )
          })}
        </VersionSelectorList>
      </VersionSelectorContainer>
    )
  }

  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      open={open}
      onDropdownVisibleChange={setOpen}
      style={{ width: 180 }}
      size="small"
      popupMatchSelectWidth={false}
      getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement}
      popupRender={dropdownRender}
      styles={{
        popup: {
          root: {
            padding: 0,
            background: 'transparent',
            boxShadow: 'none',
          },
          list: {
            display: 'none',
          },
          listItem: {
            display: 'none',
          },
        },
      }}
      aria-label={label}
    />
  )
}
