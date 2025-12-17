import { shadowRootManager } from '@/shared/utils/shadow-root-manager'
import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ContextMenuContainer, ContextMenuItem } from './styles'
import { ContextMenuAction, type EditorContextMenuProps } from './types'

/**
 * 编辑器右键菜单组件
 * 在用户右键点击编辑器时显示操作菜单
 */
export const EditorContextMenu: React.FC<EditorContextMenuProps> = (props) => {
  const { visible, position, hasSelection, themeColor, editorTheme, onSelect, onClose } = props
  const menuRef = useRef<HTMLDivElement>(null)

  /**
   * 判断是否为深色主题
   */
  const isDark = editorTheme !== 'light'

  /**
   * 点击外部关闭菜单
   */
  useEffect(() => {
    if (!visible) return

    const shadowRoot = shadowRootManager.get()

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    // 延迟添加监听器，避免立即触发
    const timer = setTimeout(() => {
      shadowRoot.addEventListener('mousedown', handleClickOutside as EventListener)
    }, 0)

    return () => {
      clearTimeout(timer)
      shadowRoot.removeEventListener('mousedown', handleClickOutside as EventListener)
    }
  }, [visible, onClose])

  /**
   * 处理菜单项点击
   */
  const handleMenuItemClick = (action: ContextMenuAction) => {
    if (!hasSelection) return
    onSelect(action)
    onClose()
  }

  /**
   * 菜单项配置
   */
  const menuItems = [
    {
      key: ContextMenuAction.QUICK_EDIT,
      label: '单独编辑',
      visible: true,
      disabled: !hasSelection,
    },
  ]

  if (!visible) return null

  return createPortal(
    <ContextMenuContainer ref={menuRef} $x={position.x} $y={position.y} $isDark={isDark}>
      {menuItems
        .filter((item) => item.visible)
        .map((item) => (
          <ContextMenuItem
            key={item.key}
            $isDark={isDark}
            $disabled={item.disabled}
            $themeColor={themeColor}
            onClick={() => !item.disabled && handleMenuItemClick(item.key)}
          >
            {item.label}
          </ContextMenuItem>
        ))}
    </ContextMenuContainer>,
    shadowRootManager.getContainer()
  )
}
