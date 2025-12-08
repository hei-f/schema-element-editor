import { EllipsisOutlined } from '@ant-design/icons'
import { Dropdown, Tooltip } from 'antd'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  MoreButton,
  MoreMenuContainer,
  MoreMenuItem,
  ResponsiveButtonGroupContainer,
  ResponsiveButtonGroupFixed,
  ResponsiveButtonGroupScrollable,
  ToolbarButton,
} from '../../styles/toolbar/toolbar.styles'

/** 工具栏按钮配置 */
export interface ToolbarButtonConfig {
  /** 按钮唯一标识 */
  key: string
  /** 按钮文本 */
  label: React.ReactNode
  /** 点击回调 */
  onClick?: () => void
  /** 是否禁用 */
  disabled?: boolean
  /** 提示文本 */
  tooltip?: string
  /** 按钮类型 */
  type?: 'default' | 'primary'
  /** 是否显示该按钮 */
  visible?: boolean
  /** 是否为固定按钮（不会被收入更多菜单） */
  fixed?: boolean
  /** 是否为原始组件（不用 ToolbarButton 包装，如 Segmented） */
  isRawComponent?: boolean
  /** 在更多菜单中显示的文本（用于原始组件） */
  menuLabel?: string
}

interface ResponsiveButtonGroupProps {
  /** 按钮配置列表 */
  buttons: ToolbarButtonConfig[]
  /** 获取 tooltip/dropdown 挂载容器 */
  getPopupContainer?: () => HTMLElement
}

/** 按钮之间的间距 */
const BUTTON_GAP = 8

/**
 * 响应式按钮组组件
 * 使用 IntersectionObserver 检测按钮可见性，将被截断的按钮收入"更多"下拉菜单
 */
export const ResponsiveButtonGroup: React.FC<ResponsiveButtonGroupProps> = (props) => {
  const { buttons, getPopupContainer } = props

  const containerRef = useRef<HTMLDivElement>(null)
  const measureContainerRef = useRef<HTMLDivElement>(null)
  const fixedAreaRef = useRef<HTMLDivElement>(null)
  const [visibleButtonKeys, setVisibleButtonKeys] = useState<Set<string>>(new Set())
  const [fixedAreaWidth, setFixedAreaWidth] = useState(0)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  /** 过滤出可见的按钮 */
  const enabledButtons = useMemo(() => buttons.filter((btn) => btn.visible !== false), [buttons])

  /** 普通按钮（可被收入更多菜单） */
  const normalButtons = useMemo(() => enabledButtons.filter((btn) => !btn.fixed), [enabledButtons])

  /** 固定按钮（始终显示） */
  const fixedButtons = useMemo(() => enabledButtons.filter((btn) => btn.fixed), [enabledButtons])

  /** 检测测量容器中按钮的可见性 */
  const checkButtonsVisibility = useCallback(() => {
    const measureContainer = measureContainerRef.current
    if (!measureContainer) return

    const containerRect = measureContainer.getBoundingClientRect()
    const children = Array.from(measureContainer.children) as HTMLElement[]

    const newVisibleKeys = new Set<string>()

    for (const child of children) {
      const key = child.dataset.key
      if (!key) continue

      const childRect = child.getBoundingClientRect()

      // 检查按钮右边缘是否在容器内（允许 0.5px 的误差）
      const isFullyVisible = childRect.right <= containerRect.right + 0.5

      if (isFullyVisible) {
        newVisibleKeys.add(key)
      } else {
        // 按钮顺序是从左到右，一旦遇到不完全可见的，后面的都不可见
        break
      }
    }

    setVisibleButtonKeys(newVisibleKeys)
    setIsInitialized(true)
  }, [])

  /** 更新固定区域宽度 */
  const updateFixedAreaWidth = useCallback(() => {
    const fixedArea = fixedAreaRef.current
    if (fixedArea) {
      const rect = fixedArea.getBoundingClientRect()
      setFixedAreaWidth(Math.ceil(rect.width))
    }
  }, [])

  /** 监听容器大小变化 */
  useEffect(() => {
    const container = containerRef.current
    const measureContainer = measureContainerRef.current
    if (!container || !measureContainer) return

    // 初始检测
    updateFixedAreaWidth()
    // 延迟一帧执行检测，确保布局已经完成
    requestAnimationFrame(() => {
      checkButtonsVisibility()
    })

    const resizeObserver = new ResizeObserver(() => {
      updateFixedAreaWidth()
      checkButtonsVisibility()
    })

    resizeObserver.observe(container)
    resizeObserver.observe(measureContainer)

    return () => {
      resizeObserver.disconnect()
    }
  }, [checkButtonsVisibility, updateFixedAreaWidth])

  /** 监听固定区域大小变化 */
  useEffect(() => {
    const fixedArea = fixedAreaRef.current
    if (!fixedArea) return

    const resizeObserver = new ResizeObserver(() => {
      updateFixedAreaWidth()
      // 固定区域大小变化后重新检测
      checkButtonsVisibility()
    })

    resizeObserver.observe(fixedArea)

    return () => {
      resizeObserver.disconnect()
    }
  }, [updateFixedAreaWidth, checkButtonsVisibility])

  /** 按钮配置变化时重新检测 */
  useEffect(() => {
    // 延迟一帧执行，确保 DOM 已更新
    requestAnimationFrame(() => {
      checkButtonsVisibility()
    })
  }, [normalButtons.length, checkButtonsVisibility])

  /** 可显示的普通按钮 */
  const displayedButtons = useMemo(() => {
    // 初始化之前显示所有按钮
    if (!isInitialized) {
      return normalButtons
    }
    return normalButtons.filter((btn) => visibleButtonKeys.has(btn.key))
  }, [normalButtons, visibleButtonKeys, isInitialized])

  /** 被隐藏的普通按钮 */
  const hiddenButtons = useMemo(() => {
    if (!isInitialized) {
      return []
    }
    return normalButtons.filter((btn) => !visibleButtonKeys.has(btn.key))
  }, [normalButtons, visibleButtonKeys, isInitialized])

  /** 是否需要显示"更多"按钮 */
  const showMoreButton = hiddenButtons.length > 0

  /** 是否显示固定区域 */
  const showFixedArea = showMoreButton || fixedButtons.length > 0

  /** 渲染单个按钮（用于测量和显示） */
  const renderButtonContent = (config: ToolbarButtonConfig) => {
    const { label, onClick, disabled, type = 'default', isRawComponent } = config

    // 原始组件直接渲染，不包装 ToolbarButton
    if (isRawComponent) {
      return label
    }

    return (
      <ToolbarButton size="small" type={type} onClick={onClick} disabled={disabled}>
        {label}
      </ToolbarButton>
    )
  }

  /** 渲染单个按钮（带 tooltip） */
  const renderButton = (config: ToolbarButtonConfig) => {
    const { key, tooltip, isRawComponent } = config

    const content = renderButtonContent(config)

    return (
      <div key={key} style={{ flexShrink: 0 }}>
        {tooltip && !isRawComponent ? (
          <Tooltip title={tooltip} placement="bottom" getPopupContainer={getPopupContainer}>
            {content}
          </Tooltip>
        ) : (
          content
        )}
      </div>
    )
  }

  /** 渲染更多菜单中的按钮 */
  const renderMenuButton = (config: ToolbarButtonConfig) => {
    const { key, label, onClick, disabled, isRawComponent, menuLabel } = config

    // 原始组件在菜单中使用 menuLabel 或者不显示
    if (isRawComponent && !menuLabel) {
      return null
    }

    return (
      <MoreMenuItem
        key={key}
        $disabled={disabled}
        onClick={() => {
          if (!disabled && onClick) {
            onClick()
            setMoreMenuOpen(false)
          }
        }}
      >
        {isRawComponent ? menuLabel : label}
      </MoreMenuItem>
    )
  }

  /** 更多菜单内容 */
  const moreMenuContent = (
    <MoreMenuContainer>{hiddenButtons.map((btn) => renderMenuButton(btn))}</MoreMenuContainer>
  )

  /** 计算测量容器的右边距（为固定区域预留空间） */
  const measureContainerRight = useMemo(() => {
    // 固定区域宽度 + gap
    // 如果还没测量到，使用一个估算值（更多按钮 24px + Diff 按钮约 55px + gap）
    const fixedWidth = fixedAreaWidth > 0 ? fixedAreaWidth : 80
    return fixedWidth + BUTTON_GAP
  }, [fixedAreaWidth])

  return (
    <ResponsiveButtonGroupContainer ref={containerRef}>
      {/* 隐藏的测量容器：与显示区域有相同的宽度限制，用于检测按钮可见性 */}
      <div
        ref={measureContainerRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: measureContainerRight,
          display: 'flex',
          gap: BUTTON_GAP,
          visibility: 'hidden',
          pointerEvents: 'none',
          // overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        {normalButtons.map((btn) => (
          <div key={btn.key} data-key={btn.key} style={{ flexShrink: 0 }}>
            {renderButtonContent(btn)}
          </div>
        ))}
      </div>

      {/* 可见按钮区域 */}
      <ResponsiveButtonGroupScrollable>
        {displayedButtons.map((btn) => renderButton(btn))}
      </ResponsiveButtonGroupScrollable>

      {/* 固定区域：包含更多按钮和固定按钮 */}
      {showFixedArea && (
        <ResponsiveButtonGroupFixed ref={fixedAreaRef}>
          {/* 更多按钮 */}
          {showMoreButton && (
            <Dropdown
              popupRender={() => moreMenuContent}
              trigger={['click']}
              open={moreMenuOpen}
              onOpenChange={setMoreMenuOpen}
              placement="bottomRight"
              getPopupContainer={getPopupContainer}
            >
              <MoreButton size="small" icon={<EllipsisOutlined />} />
            </Dropdown>
          )}

          {/* 固定按钮（始终显示在最右侧） */}
          {fixedButtons.map((btn) => renderButton(btn))}
        </ResponsiveButtonGroupFixed>
      )}
    </ResponsiveButtonGroupContainer>
  )
}
