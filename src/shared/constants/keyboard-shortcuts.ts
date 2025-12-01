import type { ShortcutKey } from '@/shared/types'

/**
 * 浏览器保留快捷键列表
 * 这些快捷键被浏览器占用，无法通过 JavaScript 拦截
 */
export const BROWSER_RESERVED_SHORTCUTS: readonly string[] = [
  // 标签页操作
  'Cmd+W',
  'Cmd+T',
  'Cmd+N',
  'Cmd+Shift+T',
  'Cmd+Shift+N',
  // 浏览器操作
  'Cmd+Q',
  'Cmd+H',
  'Cmd+M',
  'Cmd+,',
  // 导航
  'Cmd+L',
  'Cmd+R',
  'Cmd+Shift+R',
  // 开发者工具
  'Cmd+Alt+I',
  'Cmd+Alt+J',
  'Cmd+Alt+C',
  // 查找
  'Cmd+F',
  'Cmd+G',
  // 书签
  'Cmd+D',
  'Cmd+Shift+B',
  // 打印
  'Cmd+P',
  // 保存网页
  'Cmd+S',
  // 全屏
  'Cmd+Shift+F',
] as const

/**
 * CodeMirror 常用快捷键列表
 * 这些快捷键与编辑器功能冲突，建议避免使用
 */
export const CODEMIRROR_SHORTCUTS: readonly string[] = [
  'Cmd+Z',
  'Cmd+Shift+Z',
  'Cmd+Y',
  'Cmd+A',
  'Cmd+C',
  'Cmd+V',
  'Cmd+X',
  'Cmd+/',
  'Cmd+[',
  'Cmd+]',
] as const

/**
 * 判断是否为 Mac 系统
 */
export const isMac = (): boolean => {
  return navigator.platform.toUpperCase().includes('MAC')
}

/**
 * 获取修饰键显示文本
 */
export const getModifierSymbol = (modifier: 'ctrl' | 'cmd' | 'shift' | 'alt'): string => {
  const mac = isMac()
  switch (modifier) {
    case 'ctrl':
      return mac ? '⌃' : 'Ctrl'
    case 'cmd':
      return mac ? '⌘' : 'Ctrl'
    case 'shift':
      return mac ? '⇧' : 'Shift'
    case 'alt':
      return mac ? '⌥' : 'Alt'
  }
}

/**
 * 将 ShortcutKey 转换为显示字符串
 * @example { key: 's', ctrlOrCmd: true, shift: false, alt: false } => "⌘S" (Mac) 或 "Ctrl+S" (Windows)
 */
export const formatShortcut = (shortcut: ShortcutKey): string => {
  const mac = isMac()
  const parts: string[] = []

  if (shortcut.ctrlOrCmd) {
    parts.push(mac ? '⌘' : 'Ctrl')
  }
  if (shortcut.shift) {
    parts.push(mac ? '⇧' : 'Shift')
  }
  if (shortcut.alt) {
    parts.push(mac ? '⌥' : 'Alt')
  }

  // 格式化按键名
  const keyDisplay = shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key

  if (mac) {
    // Mac 风格：⌘⇧F
    return parts.join('') + keyDisplay
  } else {
    // Windows 风格：Ctrl+Shift+F
    parts.push(keyDisplay)
    return parts.join('+')
  }
}

/**
 * 将 ShortcutKey 转换为标准化字符串（用于比较和黑名单检查）
 * @example { key: 's', ctrlOrCmd: true, shift: false, alt: false } => "Cmd+S"
 */
export const shortcutToString = (shortcut: ShortcutKey): string => {
  const parts: string[] = []

  if (shortcut.ctrlOrCmd) {
    parts.push('Cmd')
  }
  if (shortcut.shift) {
    parts.push('Shift')
  }
  if (shortcut.alt) {
    parts.push('Alt')
  }

  parts.push(shortcut.key.toUpperCase())
  return parts.join('+')
}

/**
 * 从 KeyboardEvent 创建 ShortcutKey
 * 使用 event.code 而不是 event.key，避免 Mac 上 Option+字母产生特殊字符
 */
export const shortcutFromEvent = (event: KeyboardEvent): ShortcutKey | null => {
  // 忽略单独的修饰键
  if (['Control', 'Meta', 'Shift', 'Alt'].includes(event.key)) {
    return null
  }

  // 从 event.code 提取实际按键（如 KeyA -> a, Digit1 -> 1）
  let key = ''
  const code = event.code
  if (code.startsWith('Key')) {
    key = code.slice(3).toLowerCase()
  } else if (code.startsWith('Digit')) {
    key = code.slice(5)
  } else {
    // 特殊键直接使用 code（如 Enter, Space, Escape 等）
    key = code.toLowerCase()
  }

  return {
    key,
    ctrlOrCmd: event.metaKey || event.ctrlKey,
    shift: event.shiftKey,
    alt: event.altKey,
  }
}

/**
 * 检查快捷键是否匹配 KeyboardEvent
 * 使用 event.code 而不是 event.key，因为 Mac 上 Option+字母 会产生特殊字符
 */
export const matchesShortcut = (event: KeyboardEvent, shortcut: ShortcutKey): boolean => {
  // 使用 event.code 获取物理键位（如 'KeyP'），避免 Option+P 变成 'π' 的问题
  const eventCode = event.code.toLowerCase()
  const shortcutKey = shortcut.key.toLowerCase()

  // 将配置的 key 转换为 code 格式
  let expectedCode: string
  if (shortcutKey.length === 1) {
    if (/^[a-z]$/.test(shortcutKey)) {
      expectedCode = `key${shortcutKey}`
    } else if (/^[0-9]$/.test(shortcutKey)) {
      expectedCode = `digit${shortcutKey}`
    } else {
      expectedCode = shortcutKey
    }
  } else {
    // 特殊键如 Enter, Escape 等
    expectedCode = shortcutKey
  }

  return (
    eventCode === expectedCode &&
    (event.metaKey || event.ctrlKey) === shortcut.ctrlOrCmd &&
    event.shiftKey === shortcut.shift &&
    event.altKey === shortcut.alt
  )
}

/**
 * 检查快捷键是否在浏览器保留列表中
 */
export const isBrowserReserved = (shortcut: ShortcutKey): boolean => {
  const str = shortcutToString(shortcut)
  return BROWSER_RESERVED_SHORTCUTS.includes(str)
}

/**
 * 检查快捷键是否与 CodeMirror 冲突
 */
export const isCodeMirrorConflict = (shortcut: ShortcutKey): boolean => {
  const str = shortcutToString(shortcut)
  return CODEMIRROR_SHORTCUTS.includes(str)
}

/**
 * 验证快捷键是否有效
 * @returns 错误信息，如果有效则返回 null
 */
export const validateShortcut = (shortcut: ShortcutKey): string | null => {
  // 必须有至少一个修饰键
  if (!shortcut.ctrlOrCmd && !shortcut.alt) {
    return '快捷键必须包含 Ctrl/Cmd 或 Alt 修饰键'
  }

  // 检查浏览器保留
  if (isBrowserReserved(shortcut)) {
    return '此快捷键被浏览器占用，无法使用'
  }

  // 检查 CodeMirror 冲突（警告，不阻止）
  if (isCodeMirrorConflict(shortcut)) {
    return '此快捷键可能与编辑器功能冲突'
  }

  return null
}
