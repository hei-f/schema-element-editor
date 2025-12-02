import type { ShortcutKey } from '@/shared/types'
import {
  BROWSER_RESERVED_SHORTCUTS,
  CODEMIRROR_SHORTCUTS,
  formatShortcut,
  isBrowserReserved,
  isCodeMirrorConflict,
  isMac,
  getModifierSymbol,
  matchesShortcut,
  shortcutFromEvent,
  shortcutToString,
  validateShortcut,
} from '../keyboard-shortcuts'

describe('keyboard-shortcuts 工具函数测试', () => {
  const originalNavigator = global.navigator

  afterEach(() => {
    // 恢复 navigator
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    })
  })

  /**
   * 模拟 Mac 平台
   */
  const mockMacPlatform = () => {
    Object.defineProperty(global, 'navigator', {
      value: { platform: 'MacIntel' },
      writable: true,
      configurable: true,
    })
  }

  /**
   * 模拟 Windows 平台
   */
  const mockWindowsPlatform = () => {
    Object.defineProperty(global, 'navigator', {
      value: { platform: 'Win32' },
      writable: true,
      configurable: true,
    })
  }

  describe('常量定义', () => {
    it('BROWSER_RESERVED_SHORTCUTS 应该包含常见浏览器快捷键', () => {
      expect(BROWSER_RESERVED_SHORTCUTS).toContain('Cmd+W')
      expect(BROWSER_RESERVED_SHORTCUTS).toContain('Cmd+T')
      expect(BROWSER_RESERVED_SHORTCUTS).toContain('Cmd+S')
      expect(BROWSER_RESERVED_SHORTCUTS).toContain('Cmd+F')
    })

    it('CODEMIRROR_SHORTCUTS 应该包含编辑器快捷键', () => {
      expect(CODEMIRROR_SHORTCUTS).toContain('Cmd+Z')
      expect(CODEMIRROR_SHORTCUTS).toContain('Cmd+C')
      expect(CODEMIRROR_SHORTCUTS).toContain('Cmd+V')
      expect(CODEMIRROR_SHORTCUTS).toContain('Cmd+A')
    })
  })

  describe('isMac', () => {
    it('在 Mac 平台应该返回 true', () => {
      mockMacPlatform()
      expect(isMac()).toBe(true)
    })

    it('在 Windows 平台应该返回 false', () => {
      mockWindowsPlatform()
      expect(isMac()).toBe(false)
    })

    it('在 Linux 平台应该返回 false', () => {
      Object.defineProperty(global, 'navigator', {
        value: { platform: 'Linux x86_64' },
        writable: true,
        configurable: true,
      })
      expect(isMac()).toBe(false)
    })
  })

  describe('getModifierSymbol', () => {
    describe('在 Mac 平台', () => {
      beforeEach(() => {
        mockMacPlatform()
      })

      it('ctrl 应该返回 ⌃', () => {
        expect(getModifierSymbol('ctrl')).toBe('⌃')
      })

      it('cmd 应该返回 ⌘', () => {
        expect(getModifierSymbol('cmd')).toBe('⌘')
      })

      it('shift 应该返回 ⇧', () => {
        expect(getModifierSymbol('shift')).toBe('⇧')
      })

      it('alt 应该返回 ⌥', () => {
        expect(getModifierSymbol('alt')).toBe('⌥')
      })
    })

    describe('在 Windows 平台', () => {
      beforeEach(() => {
        mockWindowsPlatform()
      })

      it('ctrl 应该返回 Ctrl', () => {
        expect(getModifierSymbol('ctrl')).toBe('Ctrl')
      })

      it('cmd 应该返回 Ctrl', () => {
        expect(getModifierSymbol('cmd')).toBe('Ctrl')
      })

      it('shift 应该返回 Shift', () => {
        expect(getModifierSymbol('shift')).toBe('Shift')
      })

      it('alt 应该返回 Alt', () => {
        expect(getModifierSymbol('alt')).toBe('Alt')
      })
    })
  })

  describe('formatShortcut', () => {
    describe('在 Mac 平台', () => {
      beforeEach(() => {
        mockMacPlatform()
      })

      it('应该格式化 Cmd+S 为 ⌘S', () => {
        const shortcut: ShortcutKey = { key: 's', ctrlOrCmd: true, shift: false, alt: false }
        expect(formatShortcut(shortcut)).toBe('⌘S')
      })

      it('应该格式化 Cmd+Shift+F 为 ⌘⇧F', () => {
        const shortcut: ShortcutKey = { key: 'f', ctrlOrCmd: true, shift: true, alt: false }
        expect(formatShortcut(shortcut)).toBe('⌘⇧F')
      })

      it('应该格式化 Alt+P 为 ⌥P', () => {
        const shortcut: ShortcutKey = { key: 'p', ctrlOrCmd: false, shift: false, alt: true }
        expect(formatShortcut(shortcut)).toBe('⌥P')
      })

      it('应该格式化 Cmd+Alt+Shift+K 为 ⌘⇧⌥K', () => {
        const shortcut: ShortcutKey = { key: 'k', ctrlOrCmd: true, shift: true, alt: true }
        expect(formatShortcut(shortcut)).toBe('⌘⇧⌥K')
      })

      it('应该处理特殊键名', () => {
        const shortcut: ShortcutKey = { key: 'Enter', ctrlOrCmd: true, shift: false, alt: false }
        expect(formatShortcut(shortcut)).toBe('⌘Enter')
      })
    })

    describe('在 Windows 平台', () => {
      beforeEach(() => {
        mockWindowsPlatform()
      })

      it('应该格式化 Ctrl+S 为 Ctrl+S', () => {
        const shortcut: ShortcutKey = { key: 's', ctrlOrCmd: true, shift: false, alt: false }
        expect(formatShortcut(shortcut)).toBe('Ctrl+S')
      })

      it('应该格式化 Ctrl+Shift+F 为 Ctrl+Shift+F', () => {
        const shortcut: ShortcutKey = { key: 'f', ctrlOrCmd: true, shift: true, alt: false }
        expect(formatShortcut(shortcut)).toBe('Ctrl+Shift+F')
      })

      it('应该格式化 Alt+P 为 Alt+P', () => {
        const shortcut: ShortcutKey = { key: 'p', ctrlOrCmd: false, shift: false, alt: true }
        expect(formatShortcut(shortcut)).toBe('Alt+P')
      })
    })
  })

  describe('shortcutToString', () => {
    it('应该将 Cmd+S 转换为 Cmd+S', () => {
      const shortcut: ShortcutKey = { key: 's', ctrlOrCmd: true, shift: false, alt: false }
      expect(shortcutToString(shortcut)).toBe('Cmd+S')
    })

    it('应该将 Cmd+Shift+F 转换为 Cmd+Shift+F', () => {
      const shortcut: ShortcutKey = { key: 'f', ctrlOrCmd: true, shift: true, alt: false }
      expect(shortcutToString(shortcut)).toBe('Cmd+Shift+F')
    })

    it('应该将 Alt+P 转换为 Alt+P', () => {
      const shortcut: ShortcutKey = { key: 'p', ctrlOrCmd: false, shift: false, alt: true }
      expect(shortcutToString(shortcut)).toBe('Alt+P')
    })

    it('应该将 Cmd+Alt+Shift+K 转换为 Cmd+Shift+Alt+K', () => {
      const shortcut: ShortcutKey = { key: 'k', ctrlOrCmd: true, shift: true, alt: true }
      expect(shortcutToString(shortcut)).toBe('Cmd+Shift+Alt+K')
    })

    it('应该将小写 key 转换为大写', () => {
      const shortcut: ShortcutKey = { key: 'a', ctrlOrCmd: true, shift: false, alt: false }
      expect(shortcutToString(shortcut)).toBe('Cmd+A')
    })
  })

  describe('shortcutFromEvent', () => {
    /**
     * 创建模拟的 KeyboardEvent
     */
    const createEvent = (options: Partial<KeyboardEvent>): KeyboardEvent => {
      return {
        key: 'a',
        code: 'KeyA',
        metaKey: false,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        ...options,
      } as KeyboardEvent
    }

    it('应该正确解析字母键', () => {
      const event = createEvent({ key: 'a', code: 'KeyA' })
      const result = shortcutFromEvent(event)

      expect(result).toEqual({
        key: 'a',
        ctrlOrCmd: false,
        shift: false,
        alt: false,
      })
    })

    it('应该正确解析数字键', () => {
      const event = createEvent({ key: '1', code: 'Digit1' })
      const result = shortcutFromEvent(event)

      expect(result).toEqual({
        key: '1',
        ctrlOrCmd: false,
        shift: false,
        alt: false,
      })
    })

    it('应该正确解析带 Cmd/Meta 修饰键的事件', () => {
      const event = createEvent({ key: 's', code: 'KeyS', metaKey: true })
      const result = shortcutFromEvent(event)

      expect(result?.ctrlOrCmd).toBe(true)
    })

    it('应该正确解析带 Ctrl 修饰键的事件', () => {
      const event = createEvent({ key: 's', code: 'KeyS', ctrlKey: true })
      const result = shortcutFromEvent(event)

      expect(result?.ctrlOrCmd).toBe(true)
    })

    it('应该正确解析带 Shift 修饰键的事件', () => {
      const event = createEvent({ key: 'S', code: 'KeyS', shiftKey: true })
      const result = shortcutFromEvent(event)

      expect(result?.shift).toBe(true)
    })

    it('应该正确解析带 Alt 修饰键的事件', () => {
      const event = createEvent({ key: 'p', code: 'KeyP', altKey: true })
      const result = shortcutFromEvent(event)

      expect(result?.alt).toBe(true)
    })

    it('应该忽略单独的修饰键', () => {
      const events = [
        createEvent({ key: 'Control', code: 'ControlLeft' }),
        createEvent({ key: 'Meta', code: 'MetaLeft' }),
        createEvent({ key: 'Shift', code: 'ShiftLeft' }),
        createEvent({ key: 'Alt', code: 'AltLeft' }),
      ]

      events.forEach((event) => {
        expect(shortcutFromEvent(event)).toBeNull()
      })
    })

    it('应该正确解析特殊键', () => {
      const event = createEvent({ key: 'Enter', code: 'Enter' })
      const result = shortcutFromEvent(event)

      expect(result?.key).toBe('enter')
    })
  })

  describe('matchesShortcut', () => {
    /**
     * 创建模拟的 KeyboardEvent
     */
    const createEvent = (options: Partial<KeyboardEvent>): KeyboardEvent => {
      return {
        key: 'a',
        code: 'KeyA',
        metaKey: false,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        ...options,
      } as KeyboardEvent
    }

    it('应该匹配字母键', () => {
      const shortcut: ShortcutKey = { key: 'p', ctrlOrCmd: false, shift: false, alt: true }
      const event = createEvent({ code: 'KeyP', altKey: true })

      expect(matchesShortcut(event, shortcut)).toBe(true)
    })

    it('应该匹配数字键', () => {
      const shortcut: ShortcutKey = { key: '1', ctrlOrCmd: true, shift: false, alt: false }
      const event = createEvent({ code: 'Digit1', metaKey: true })

      expect(matchesShortcut(event, shortcut)).toBe(true)
    })

    it('不同的键应该不匹配', () => {
      const shortcut: ShortcutKey = { key: 'p', ctrlOrCmd: false, shift: false, alt: true }
      const event = createEvent({ code: 'KeyS', altKey: true })

      expect(matchesShortcut(event, shortcut)).toBe(false)
    })

    it('修饰键不同应该不匹配', () => {
      const shortcut: ShortcutKey = { key: 'p', ctrlOrCmd: false, shift: false, alt: true }
      const event = createEvent({ code: 'KeyP', altKey: false })

      expect(matchesShortcut(event, shortcut)).toBe(false)
    })

    it('额外的 Shift 修饰键应该不匹配', () => {
      const shortcut: ShortcutKey = { key: 'p', ctrlOrCmd: false, shift: false, alt: true }
      const event = createEvent({ code: 'KeyP', altKey: true, shiftKey: true })

      expect(matchesShortcut(event, shortcut)).toBe(false)
    })

    it('应该匹配特殊键', () => {
      const shortcut: ShortcutKey = { key: 'enter', ctrlOrCmd: true, shift: false, alt: false }
      const event = createEvent({ code: 'Enter', metaKey: true })

      expect(matchesShortcut(event, shortcut)).toBe(true)
    })

    it('Cmd 和 Ctrl 应该等价', () => {
      const shortcut: ShortcutKey = { key: 's', ctrlOrCmd: true, shift: false, alt: false }
      const eventWithMeta = createEvent({ code: 'KeyS', metaKey: true })
      const eventWithCtrl = createEvent({ code: 'KeyS', ctrlKey: true })

      expect(matchesShortcut(eventWithMeta, shortcut)).toBe(true)
      expect(matchesShortcut(eventWithCtrl, shortcut)).toBe(true)
    })
  })

  describe('isBrowserReserved', () => {
    it('应该识别浏览器保留的快捷键', () => {
      const reserved: ShortcutKey = { key: 'w', ctrlOrCmd: true, shift: false, alt: false }
      expect(isBrowserReserved(reserved)).toBe(true)
    })

    it('应该识别 Cmd+S 为保留快捷键', () => {
      const reserved: ShortcutKey = { key: 's', ctrlOrCmd: true, shift: false, alt: false }
      expect(isBrowserReserved(reserved)).toBe(true)
    })

    it('应该识别非保留的快捷键', () => {
      const notReserved: ShortcutKey = { key: 'p', ctrlOrCmd: false, shift: false, alt: true }
      expect(isBrowserReserved(notReserved)).toBe(false)
    })
  })

  describe('isCodeMirrorConflict', () => {
    it('应该识别 Cmd+Z 为冲突快捷键', () => {
      const conflict: ShortcutKey = { key: 'z', ctrlOrCmd: true, shift: false, alt: false }
      expect(isCodeMirrorConflict(conflict)).toBe(true)
    })

    it('应该识别 Cmd+C 为冲突快捷键', () => {
      const conflict: ShortcutKey = { key: 'c', ctrlOrCmd: true, shift: false, alt: false }
      expect(isCodeMirrorConflict(conflict)).toBe(true)
    })

    it('应该识别非冲突的快捷键', () => {
      const noConflict: ShortcutKey = { key: 'p', ctrlOrCmd: false, shift: false, alt: true }
      expect(isCodeMirrorConflict(noConflict)).toBe(false)
    })
  })

  describe('validateShortcut', () => {
    it('没有修饰键应该返回错误', () => {
      const shortcut: ShortcutKey = { key: 'p', ctrlOrCmd: false, shift: false, alt: false }
      const error = validateShortcut(shortcut)

      expect(error).toBe('快捷键必须包含 Ctrl/Cmd 或 Alt 修饰键')
    })

    it('只有 Shift 修饰键应该返回错误', () => {
      const shortcut: ShortcutKey = { key: 'p', ctrlOrCmd: false, shift: true, alt: false }
      const error = validateShortcut(shortcut)

      expect(error).toBe('快捷键必须包含 Ctrl/Cmd 或 Alt 修饰键')
    })

    it('浏览器保留快捷键应该返回错误', () => {
      const shortcut: ShortcutKey = { key: 'w', ctrlOrCmd: true, shift: false, alt: false }
      const error = validateShortcut(shortcut)

      expect(error).toBe('此快捷键被浏览器占用，无法使用')
    })

    it('CodeMirror 冲突快捷键应该返回警告', () => {
      const shortcut: ShortcutKey = { key: 'z', ctrlOrCmd: true, shift: false, alt: false }
      const error = validateShortcut(shortcut)

      expect(error).toBe('此快捷键可能与编辑器功能冲突')
    })

    it('有效的快捷键应该返回 null', () => {
      const shortcut: ShortcutKey = { key: 'p', ctrlOrCmd: false, shift: false, alt: true }
      const error = validateShortcut(shortcut)

      expect(error).toBeNull()
    })

    it('带 Ctrl/Cmd 的有效快捷键应该返回 null', () => {
      const shortcut: ShortcutKey = { key: 'k', ctrlOrCmd: true, shift: false, alt: false }
      const error = validateShortcut(shortcut)

      expect(error).toBeNull()
    })

    it('组合修饰键的有效快捷键应该返回 null', () => {
      const shortcut: ShortcutKey = { key: 'm', ctrlOrCmd: true, shift: true, alt: true }
      const error = validateShortcut(shortcut)

      expect(error).toBeNull()
    })
  })

  describe('边界情况', () => {
    it('空 key 应该正常处理', () => {
      const shortcut: ShortcutKey = { key: '', ctrlOrCmd: true, shift: false, alt: false }
      expect(shortcutToString(shortcut)).toBe('Cmd+')
    })

    it('大写字母 key 应该正常处理', () => {
      const shortcut: ShortcutKey = { key: 'S', ctrlOrCmd: true, shift: false, alt: false }
      expect(shortcutToString(shortcut)).toBe('Cmd+S')
    })

    it('多字符特殊键应该正常处理', () => {
      const shortcut: ShortcutKey = { key: 'Escape', ctrlOrCmd: true, shift: false, alt: false }
      expect(shortcutToString(shortcut)).toBe('Cmd+ESCAPE')
    })
  })
})
