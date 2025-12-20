/**
 * @codemirror/view 模块的 Mock
 */

import { EditorState } from './codemirrorStateMock'

/**
 * Mock EditorView
 */
export class EditorView {
  state: EditorState
  dom: HTMLDivElement

  constructor(config: { state: EditorState; parent?: HTMLElement }) {
    this.state = config.state
    this.dom = document.createElement('div')
    this.dom.className = 'cm-editor'
    if (config.parent) {
      config.parent.appendChild(this.dom)
    }
  }

  dispatch(_transaction: any) {
    // Mock dispatch
  }

  update(_transactions: any[]) {
    // Mock update
  }

  destroy() {
    if (this.dom.parentNode) {
      this.dom.parentNode.removeChild(this.dom)
    }
  }

  focus() {
    // Mock focus
  }

  requestMeasure(fn: any) {
    fn()
  }

  static theme = (spec: any) => ({ extension: 'theme', spec })
  static baseTheme = (spec: any) => ({ extension: 'baseTheme', spec })
  static editorAttributes = { of: (value: any) => ({ editorAttributes: value }) }
  static contentAttributes = { of: (value: any) => ({ contentAttributes: value }) }
}

/**
 * Mock Decoration
 */
export class Decoration {
  static mark(attrs: any) {
    return { type: 'mark', attrs }
  }

  static widget(config: any) {
    return { type: 'widget', config }
  }

  static replace(config: any) {
    return { type: 'replace', config }
  }

  static line(attrs: any) {
    return { type: 'line', attrs }
  }

  static set(decorations: any[], sort = false) {
    return { decorations, sort }
  }
}

/**
 * Mock DecorationSet
 */
export class DecorationSet {
  static empty = new DecorationSet()

  update(_tr: any) {
    return this
  }

  map(_changes: any) {
    return this
  }
}

/**
 * Mock WidgetType
 */
export class WidgetType {
  toDOM() {
    return document.createElement('span')
  }

  eq(_other: WidgetType) {
    return false
  }

  updateDOM(_dom: HTMLElement) {
    return false
  }

  get estimatedHeight() {
    return -1
  }

  ignoreEvent() {
    return true
  }

  destroy() {}
}

/**
 * Mock ViewPlugin
 */
export class ViewPlugin {
  static define(create: any, config?: any) {
    return { extension: 'viewPlugin', create, config }
  }

  static fromClass(cls: any, config?: any) {
    return { extension: 'viewPlugin', cls, config }
  }
}

/**
 * Mock keymap
 * 需要支持 keymap.of() 方法
 */
export const keymap = {
  of: (bindings: any[]) => ({ extension: 'keymap', bindings }),
}

/**
 * Mock lineNumbers
 */
export function lineNumbers(config?: any) {
  return { extension: 'lineNumbers', config }
}

/**
 * Mock highlightActiveLine
 */
export function highlightActiveLine() {
  return { extension: 'highlightActiveLine' }
}

/**
 * Mock highlightActiveLineGutter
 */
export function highlightActiveLineGutter() {
  return { extension: 'highlightActiveLineGutter' }
}

/**
 * Mock placeholder
 */
export function placeholder(text: string) {
  return { extension: 'placeholder', text }
}

/**
 * Mock drawSelection
 */
export function drawSelection(config?: any) {
  return { extension: 'drawSelection', config }
}

/**
 * Mock dropCursor
 */
export function dropCursor(config?: any) {
  return { extension: 'dropCursor', config }
}

/**
 * Mock rectangularSelection
 */
export function rectangularSelection(config?: any) {
  return { extension: 'rectangularSelection', config }
}

/**
 * Mock crosshairCursor
 */
export function crosshairCursor(config?: any) {
  return { extension: 'crosshairCursor', config }
}

/**
 * Mock highlightSpecialChars
 */
export function highlightSpecialChars(config?: any) {
  return { extension: 'highlightSpecialChars', config }
}

/**
 * Mock showPanel
 */
export function showPanel(create: any, config?: any) {
  return { extension: 'showPanel', create, config }
}

/**
 * Mock getPanel
 */
export function getPanel(_view: EditorView, _panel: any) {
  return null
}

/**
 * Mock tooltips
 */
export function tooltips(config?: any) {
  return { extension: 'tooltips', config }
}

/**
 * Mock showTooltip
 */
export function showTooltip(tooltip: any) {
  return { extension: 'showTooltip', tooltip }
}

/**
 * Mock ViewUpdate
 */
export interface ViewUpdate {
  view: EditorView
  state: EditorState
  transactions: any[]
  changes: any
  viewportChanged: boolean
  heightChanged: boolean
  focusChanged: boolean
  docChanged: boolean
  selectionSet: boolean
}
