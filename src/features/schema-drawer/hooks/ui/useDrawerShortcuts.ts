import { matchesShortcut } from '@/shared/constants/keyboard-shortcuts'
import type { DrawerShortcutsConfig } from '@/shared/types'
import { useCallback, useEffect } from 'react'

interface UseDrawerShortcutsOptions {
  /** 快捷键配置 */
  shortcuts: DrawerShortcutsConfig
  /** 抽屉是否打开 */
  isOpen: boolean
  /** 保存回调 */
  onSave?: () => void
  /** 格式化回调 */
  onFormat?: () => void
  /** 打开或更新预览回调 */
  onOpenOrUpdatePreview?: () => void
  /** 关闭预览回调 */
  onClosePreview?: () => void
  /** 是否可以保存 */
  canSave?: boolean
  /** 是否可以格式化 */
  canFormat?: boolean
  /** 预览是否已打开 */
  isPreviewOpen?: boolean
  /** 是否有预览功能 */
  hasPreviewFunction?: boolean
}

/**
 * 抽屉快捷键监听 Hook
 * 在编辑器获得焦点时响应快捷键
 */
export const useDrawerShortcuts = (options: UseDrawerShortcutsOptions): void => {
  const {
    shortcuts,
    isOpen,
    onSave,
    onFormat,
    onOpenOrUpdatePreview,
    onClosePreview,
    canSave = true,
    canFormat = true,
    isPreviewOpen = false,
    hasPreviewFunction = false,
  } = options

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // 抽屉未打开时不响应
      if (!isOpen) return

      // 保存快捷键
      if (shortcuts.save.key && matchesShortcut(event, shortcuts.save)) {
        event.preventDefault()
        event.stopPropagation()
        if (canSave && onSave) {
          onSave()
        }
        return
      }

      // 格式化快捷键
      if (shortcuts.format.key && matchesShortcut(event, shortcuts.format)) {
        event.preventDefault()
        event.stopPropagation()
        if (canFormat && onFormat) {
          onFormat()
        }
        return
      }

      // 关闭预览快捷键（优先检查，因为它有 Shift 修饰键）
      if (shortcuts.closePreview.key && matchesShortcut(event, shortcuts.closePreview)) {
        event.preventDefault()
        event.stopPropagation()
        if (isPreviewOpen && onClosePreview) {
          onClosePreview()
        }
        return
      }

      // 打开/更新预览快捷键
      if (
        shortcuts.openOrUpdatePreview.key &&
        matchesShortcut(event, shortcuts.openOrUpdatePreview)
      ) {
        event.preventDefault()
        event.stopPropagation()
        if (hasPreviewFunction && onOpenOrUpdatePreview) {
          onOpenOrUpdatePreview()
        }
        return
      }
    },
    [
      isOpen,
      shortcuts,
      onSave,
      onFormat,
      onOpenOrUpdatePreview,
      onClosePreview,
      canSave,
      canFormat,
      isPreviewOpen,
      hasPreviewFunction,
    ]
  )

  useEffect(() => {
    // 使用捕获阶段，优先于其他事件处理器
    document.addEventListener('keydown', handleKeyDown, true)
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [handleKeyDown])
}
