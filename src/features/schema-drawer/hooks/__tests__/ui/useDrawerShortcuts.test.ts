import { renderHook } from '@testing-library/react'
import type { MockedFunction, MockInstance } from 'vitest'
import { useDrawerShortcuts } from '../../ui/useDrawerShortcuts'
import type { DrawerShortcutsConfig, ShortcutKey } from '@/shared/types'

// Mock keyboard-shortcuts
vi.mock('@/shared/constants/keyboard-shortcuts', () => ({
  matchesShortcut: vi.fn(),
}))

import { matchesShortcut } from '@/shared/constants/keyboard-shortcuts'

const mockMatchesShortcut = matchesShortcut as MockedFunction<typeof matchesShortcut>

describe('useDrawerShortcuts Hook 测试', () => {
  const defaultShortcuts: DrawerShortcutsConfig = {
    save: { key: 's', ctrlOrCmd: false, shift: false, alt: true },
    format: { key: 'f', ctrlOrCmd: false, shift: false, alt: true },
    openOrUpdatePreview: { key: 'p', ctrlOrCmd: false, shift: false, alt: true },
    closePreview: { key: 'p', ctrlOrCmd: false, shift: true, alt: true },
  }

  let addEventListenerSpy: MockInstance
  let removeEventListenerSpy: MockInstance
  let keydownHandler: ((event: KeyboardEvent) => void) | null = null

  beforeEach(() => {
    vi.clearAllMocks()
    keydownHandler = null

    addEventListenerSpy = vi
      .spyOn(document, 'addEventListener')
      .mockImplementation((type, handler) => {
        if (type === 'keydown') {
          keydownHandler = handler as (event: KeyboardEvent) => void
        }
      })
    removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')
  })

  afterEach(() => {
    addEventListenerSpy.mockRestore()
    removeEventListenerSpy.mockRestore()
  })

  /**
   * 创建模拟的 KeyboardEvent
   */
  const createKeyboardEvent = (
    key: string,
    options: Partial<KeyboardEvent> = {}
  ): KeyboardEvent => {
    const event = {
      key,
      code: `Key${key.toUpperCase()}`,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      metaKey: false,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      ...options,
    } as unknown as KeyboardEvent
    return event
  }

  describe('事件监听器管理', () => {
    it('应该在挂载时添加 keydown 事件监听器', () => {
      renderHook(() =>
        useDrawerShortcuts({
          shortcuts: defaultShortcuts,
          isOpen: true,
        })
      )

      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function), true)
    })

    it('应该在卸载时移除事件监听器', () => {
      const { unmount } = renderHook(() =>
        useDrawerShortcuts({
          shortcuts: defaultShortcuts,
          isOpen: true,
        })
      )

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function), true)
    })
  })

  describe('抽屉关闭状态', () => {
    it('当抽屉关闭时不应该响应快捷键', () => {
      const onSave = vi.fn()
      mockMatchesShortcut.mockReturnValue(true)

      renderHook(() =>
        useDrawerShortcuts({
          shortcuts: defaultShortcuts,
          isOpen: false,
          onSave,
        })
      )

      const event = createKeyboardEvent('s', { altKey: true })
      keydownHandler?.(event)

      expect(onSave).not.toHaveBeenCalled()
      expect(event.preventDefault).not.toHaveBeenCalled()
    })
  })

  describe('保存快捷键', () => {
    it('应该在匹配保存快捷键时调用 onSave', () => {
      const onSave = vi.fn()
      mockMatchesShortcut.mockImplementation(
        (_: KeyboardEvent, shortcut: ShortcutKey) => shortcut.key === 's'
      )

      renderHook(() =>
        useDrawerShortcuts({
          shortcuts: defaultShortcuts,
          isOpen: true,
          onSave,
          canSave: true,
        })
      )

      const event = createKeyboardEvent('s', { altKey: true })
      keydownHandler?.(event)

      expect(onSave).toHaveBeenCalledTimes(1)
      expect(event.preventDefault).toHaveBeenCalled()
      expect(event.stopPropagation).toHaveBeenCalled()
    })

    it('当 canSave 为 false 时不应该调用 onSave', () => {
      const onSave = vi.fn()
      mockMatchesShortcut.mockImplementation(
        (_: KeyboardEvent, shortcut: ShortcutKey) => shortcut.key === 's'
      )

      renderHook(() =>
        useDrawerShortcuts({
          shortcuts: defaultShortcuts,
          isOpen: true,
          onSave,
          canSave: false,
        })
      )

      const event = createKeyboardEvent('s', { altKey: true })
      keydownHandler?.(event)

      expect(onSave).not.toHaveBeenCalled()
    })

    it('当 onSave 未定义时不应该报错', () => {
      mockMatchesShortcut.mockImplementation(
        (_: KeyboardEvent, shortcut: ShortcutKey) => shortcut.key === 's'
      )

      renderHook(() =>
        useDrawerShortcuts({
          shortcuts: defaultShortcuts,
          isOpen: true,
          canSave: true,
        })
      )

      const event = createKeyboardEvent('s', { altKey: true })

      expect(() => keydownHandler?.(event)).not.toThrow()
    })

    it('当 save.key 为空时不应该匹配', () => {
      const onSave = vi.fn()
      const shortcuts: DrawerShortcutsConfig = {
        ...defaultShortcuts,
        save: { key: '', ctrlOrCmd: false, shift: false, alt: true },
      }

      renderHook(() =>
        useDrawerShortcuts({
          shortcuts,
          isOpen: true,
          onSave,
        })
      )

      const event = createKeyboardEvent('s', { altKey: true })
      keydownHandler?.(event)

      expect(onSave).not.toHaveBeenCalled()
    })
  })

  describe('格式化快捷键', () => {
    it('应该在匹配格式化快捷键时调用 onFormat', () => {
      const onFormat = vi.fn()
      mockMatchesShortcut.mockImplementation(
        (_: KeyboardEvent, shortcut: ShortcutKey) => shortcut.key === 'f'
      )

      renderHook(() =>
        useDrawerShortcuts({
          shortcuts: defaultShortcuts,
          isOpen: true,
          onFormat,
          canFormat: true,
        })
      )

      const event = createKeyboardEvent('f', { altKey: true })
      keydownHandler?.(event)

      expect(onFormat).toHaveBeenCalledTimes(1)
      expect(event.preventDefault).toHaveBeenCalled()
      expect(event.stopPropagation).toHaveBeenCalled()
    })

    it('当 canFormat 为 false 时不应该调用 onFormat', () => {
      const onFormat = vi.fn()
      mockMatchesShortcut.mockImplementation(
        (_: KeyboardEvent, shortcut: ShortcutKey) => shortcut.key === 'f'
      )

      renderHook(() =>
        useDrawerShortcuts({
          shortcuts: defaultShortcuts,
          isOpen: true,
          onFormat,
          canFormat: false,
        })
      )

      const event = createKeyboardEvent('f', { altKey: true })
      keydownHandler?.(event)

      expect(onFormat).not.toHaveBeenCalled()
    })
  })

  describe('关闭预览快捷键', () => {
    it('应该在匹配关闭预览快捷键时调用 onClosePreview', () => {
      const onClosePreview = vi.fn()
      mockMatchesShortcut.mockImplementation(
        (_: KeyboardEvent, shortcut: ShortcutKey) => shortcut.key === 'p' && shortcut.shift
      )

      renderHook(() =>
        useDrawerShortcuts({
          shortcuts: defaultShortcuts,
          isOpen: true,
          onClosePreview,
          isPreviewOpen: true,
        })
      )

      const event = createKeyboardEvent('p', { altKey: true, shiftKey: true })
      keydownHandler?.(event)

      expect(onClosePreview).toHaveBeenCalledTimes(1)
      expect(event.preventDefault).toHaveBeenCalled()
      expect(event.stopPropagation).toHaveBeenCalled()
    })

    it('当预览未打开时不应该调用 onClosePreview', () => {
      const onClosePreview = vi.fn()
      mockMatchesShortcut.mockImplementation(
        (_: KeyboardEvent, shortcut: ShortcutKey) => shortcut.key === 'p' && shortcut.shift
      )

      renderHook(() =>
        useDrawerShortcuts({
          shortcuts: defaultShortcuts,
          isOpen: true,
          onClosePreview,
          isPreviewOpen: false,
        })
      )

      const event = createKeyboardEvent('p', { altKey: true, shiftKey: true })
      keydownHandler?.(event)

      expect(onClosePreview).not.toHaveBeenCalled()
    })
  })

  describe('打开/更新预览快捷键', () => {
    it('应该在匹配打开预览快捷键时调用 onOpenOrUpdatePreview', () => {
      const onOpenOrUpdatePreview = vi.fn()
      mockMatchesShortcut.mockImplementation(
        (_: KeyboardEvent, shortcut: ShortcutKey) => shortcut.key === 'p' && !shortcut.shift
      )

      renderHook(() =>
        useDrawerShortcuts({
          shortcuts: defaultShortcuts,
          isOpen: true,
          onOpenOrUpdatePreview,
          hasPreviewFunction: true,
        })
      )

      const event = createKeyboardEvent('p', { altKey: true })
      keydownHandler?.(event)

      expect(onOpenOrUpdatePreview).toHaveBeenCalledTimes(1)
      expect(event.preventDefault).toHaveBeenCalled()
      expect(event.stopPropagation).toHaveBeenCalled()
    })

    it('当没有预览功能时不应该调用 onOpenOrUpdatePreview', () => {
      const onOpenOrUpdatePreview = vi.fn()
      mockMatchesShortcut.mockImplementation(
        (_: KeyboardEvent, shortcut: ShortcutKey) => shortcut.key === 'p' && !shortcut.shift
      )

      renderHook(() =>
        useDrawerShortcuts({
          shortcuts: defaultShortcuts,
          isOpen: true,
          onOpenOrUpdatePreview,
          hasPreviewFunction: false,
        })
      )

      const event = createKeyboardEvent('p', { altKey: true })
      keydownHandler?.(event)

      expect(onOpenOrUpdatePreview).not.toHaveBeenCalled()
    })
  })

  describe('快捷键优先级', () => {
    it('关闭预览快捷键应该优先于打开预览快捷键', () => {
      const onClosePreview = vi.fn()
      const onOpenOrUpdatePreview = vi.fn()

      // 模拟两个快捷键都匹配的情况（实际上只有 closePreview 先被检查）
      mockMatchesShortcut.mockImplementation((_: KeyboardEvent, shortcut: ShortcutKey) => {
        if (shortcut.key === 'p' && shortcut.shift) {
          return true // closePreview 匹配
        }
        return false
      })

      renderHook(() =>
        useDrawerShortcuts({
          shortcuts: defaultShortcuts,
          isOpen: true,
          onClosePreview,
          onOpenOrUpdatePreview,
          isPreviewOpen: true,
          hasPreviewFunction: true,
        })
      )

      const event = createKeyboardEvent('p', { altKey: true, shiftKey: true })
      keydownHandler?.(event)

      // 只有 closePreview 应该被调用
      expect(onClosePreview).toHaveBeenCalledTimes(1)
      expect(onOpenOrUpdatePreview).not.toHaveBeenCalled()
    })
  })

  describe('默认值', () => {
    it('canSave 默认应该为 true', () => {
      const onSave = vi.fn()
      mockMatchesShortcut.mockImplementation(
        (_: KeyboardEvent, shortcut: ShortcutKey) => shortcut.key === 's'
      )

      renderHook(() =>
        useDrawerShortcuts({
          shortcuts: defaultShortcuts,
          isOpen: true,
          onSave,
          // 不传 canSave，应该默认为 true
        })
      )

      const event = createKeyboardEvent('s', { altKey: true })
      keydownHandler?.(event)

      expect(onSave).toHaveBeenCalled()
    })

    it('canFormat 默认应该为 true', () => {
      const onFormat = vi.fn()
      mockMatchesShortcut.mockImplementation(
        (_: KeyboardEvent, shortcut: ShortcutKey) => shortcut.key === 'f'
      )

      renderHook(() =>
        useDrawerShortcuts({
          shortcuts: defaultShortcuts,
          isOpen: true,
          onFormat,
          // 不传 canFormat，应该默认为 true
        })
      )

      const event = createKeyboardEvent('f', { altKey: true })
      keydownHandler?.(event)

      expect(onFormat).toHaveBeenCalled()
    })

    it('isPreviewOpen 默认应该为 false', () => {
      const onClosePreview = vi.fn()
      mockMatchesShortcut.mockImplementation(
        (_: KeyboardEvent, shortcut: ShortcutKey) => shortcut.key === 'p' && shortcut.shift
      )

      renderHook(() =>
        useDrawerShortcuts({
          shortcuts: defaultShortcuts,
          isOpen: true,
          onClosePreview,
          // 不传 isPreviewOpen，应该默认为 false
        })
      )

      const event = createKeyboardEvent('p', { altKey: true, shiftKey: true })
      keydownHandler?.(event)

      // 由于 isPreviewOpen 默认为 false，不应该调用
      expect(onClosePreview).not.toHaveBeenCalled()
    })

    it('hasPreviewFunction 默认应该为 false', () => {
      const onOpenOrUpdatePreview = vi.fn()
      mockMatchesShortcut.mockImplementation(
        (_: KeyboardEvent, shortcut: ShortcutKey) => shortcut.key === 'p' && !shortcut.shift
      )

      renderHook(() =>
        useDrawerShortcuts({
          shortcuts: defaultShortcuts,
          isOpen: true,
          onOpenOrUpdatePreview,
          // 不传 hasPreviewFunction，应该默认为 false
        })
      )

      const event = createKeyboardEvent('p', { altKey: true })
      keydownHandler?.(event)

      // 由于 hasPreviewFunction 默认为 false，不应该调用
      expect(onOpenOrUpdatePreview).not.toHaveBeenCalled()
    })
  })

  describe('isOpen 状态变化', () => {
    it('当 isOpen 从 false 变为 true 时应该开始响应快捷键', () => {
      const onSave = vi.fn()
      mockMatchesShortcut.mockImplementation(
        (_: KeyboardEvent, shortcut: ShortcutKey) => shortcut.key === 's'
      )

      const { rerender } = renderHook(
        (props: { isOpen: boolean }) =>
          useDrawerShortcuts({
            shortcuts: defaultShortcuts,
            isOpen: props.isOpen,
            onSave,
          }),
        { initialProps: { isOpen: false } }
      )

      // 抽屉关闭时
      const event1 = createKeyboardEvent('s', { altKey: true })
      keydownHandler?.(event1)
      expect(onSave).not.toHaveBeenCalled()

      // 打开抽屉
      rerender({ isOpen: true })

      const event2 = createKeyboardEvent('s', { altKey: true })
      keydownHandler?.(event2)
      expect(onSave).toHaveBeenCalledTimes(1)
    })
  })

  describe('不匹配的快捷键', () => {
    it('不匹配任何快捷键时不应该阻止事件', () => {
      const onSave = vi.fn()
      const onFormat = vi.fn()
      mockMatchesShortcut.mockReturnValue(false)

      renderHook(() =>
        useDrawerShortcuts({
          shortcuts: defaultShortcuts,
          isOpen: true,
          onSave,
          onFormat,
        })
      )

      const event = createKeyboardEvent('x', { altKey: true })
      keydownHandler?.(event)

      expect(onSave).not.toHaveBeenCalled()
      expect(onFormat).not.toHaveBeenCalled()
      expect(event.preventDefault).not.toHaveBeenCalled()
      expect(event.stopPropagation).not.toHaveBeenCalled()
    })
  })
})
