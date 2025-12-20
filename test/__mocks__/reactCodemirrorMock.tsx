/**
 * @uiw/react-codemirror 模块的 Mock
 * 用于避免 CodeMirror 多实例冲突
 */

import { forwardRef, useImperativeHandle } from 'react'
import { vi } from 'vitest'

/**
 * Mock CodeMirror 组件
 */
const CodeMirror = forwardRef<any, any>((props, ref) => {
  const {
    value = '',
    onChange,
    height = '100%',
    theme = 'light',
    extensions: _extensions = [],
    basicSetup: _basicSetup = true,
    editable = true,
    readOnly = false,
    placeholder = '',
    ...restProps
  } = props

  // 模拟编辑器实例方法
  useImperativeHandle(ref, () => ({
    view: {
      state: {
        doc: {
          toString: () => value,
          length: value.length,
        },
        selection: {
          main: { from: 0, to: 0 },
        },
      },
      dispatch: vi.fn(),
      focus: vi.fn(),
    },
    editor: {
      getValue: () => value,
      setValue: (newValue: string) => onChange?.(newValue),
    },
  }))

  return (
    <div data-testid="mock-codemirror" data-theme={theme} style={{ height }} {...restProps}>
      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly || !editable}
        style={{
          width: '100%',
          height: '100%',
          fontFamily: 'monospace',
          fontSize: '14px',
          border: 'none',
          outline: 'none',
          resize: 'none',
          padding: '8px',
        }}
      />
    </div>
  )
})

CodeMirror.displayName = 'MockCodeMirror'

export default CodeMirror

/**
 * Mock EditorView
 */
export const EditorView = {
  theme: () => ({}),
  baseTheme: () => ({}),
  editable: {
    of: (value: boolean) => ({ editable: value }),
  },
  lineNumbers: () => ({}),
  highlightActiveLine: () => ({}),
  highlightActiveLineGutter: () => ({}),
  drawSelection: () => ({}),
  dropCursor: () => ({}),
  rectangularSelection: () => ({}),
  crosshairCursor: () => ({}),
  highlightSpecialChars: () => ({}),
}

/**
 * Mock EditorState
 */
export const EditorState = {
  create: (config: any) => ({
    doc: { toString: () => config?.doc || '' },
    selection: { main: { from: 0, to: 0 } },
  }),
}

/**
 * Mock keymap
 */
export const keymap = {
  of: (bindings: any[]) => ({ keymap: bindings }),
}

/**
 * Mock 其他常用导出
 */
export const basicSetup = {}
export const minimalSetup = {}
