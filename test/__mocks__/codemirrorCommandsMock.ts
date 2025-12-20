/**
 * @codemirror/commands 模块的 Mock
 */

/**
 * Mock history
 */
export function history(config?: any) {
  return { extension: 'history', config }
}

/**
 * Mock defaultKeymap
 */
export const defaultKeymap = [
  { key: 'Enter', run: () => true },
  { key: 'Backspace', run: () => true },
]

/**
 * Mock historyKeymap
 */
export const historyKeymap = [
  { key: 'Mod-z', run: () => true },
  { key: 'Mod-y', run: () => true },
  { key: 'Mod-Shift-z', run: () => true },
]

/**
 * Mock indentWithTab
 */
export const indentWithTab = {
  key: 'Tab',
  run: () => true,
}

/**
 * Mock cursorMatchingBracket
 */
export function cursorMatchingBracket(_view: any) {
  return true
}

/**
 * Mock other commands
 */
export function undo(_view: any) {
  return true
}

export function redo(_view: any) {
  return true
}

export function indentMore(_view: any) {
  return true
}

export function indentLess(_view: any) {
  return true
}
