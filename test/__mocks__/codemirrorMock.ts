/**
 * CodeMirror 相关模块的 Mock
 * 用于测试 CodeMirrorEditor 组件
 */

// Mock EditorView
export class MockEditorView {
  state: any
  dom: HTMLDivElement
  private changeHandlers: Array<(update: any) => void> = []

  constructor(config: any) {
    this.state = config.state || new MockEditorState()
    this.dom = document.createElement('div')
    this.dom.className = 'cm-editor'
    
    // 保存更新处理器
    if (config.dispatch) {
      this.changeHandlers.push(config.dispatch)
    }
  }

  dispatch(transaction: any) {
    // 模拟状态更新
    this.state = transaction.state || this.state
    
    // 触发更新处理器
    this.changeHandlers.forEach(handler => {
      handler({ state: this.state, transactions: [transaction] })
    })
  }

  focus() {
    this.dom.focus()
  }

  destroy() {
    // Mock destroy
  }

  static baseTheme() {
    return {}
  }
}

// Mock EditorState
export class MockEditorState {
  doc: any
  selection: any

  constructor(config: any = {}) {
    this.doc = config.doc || { toString: () => '', length: 0, lineAt: () => ({ number: 1 }) }
    this.selection = config.selection || { main: { from: 0, to: 0, empty: true } }
  }

  static create(config: any) {
    return new MockEditorState(config)
  }

  toJSON() {
    return {
      doc: this.doc.toString(),
      selection: this.selection
    }
  }

  update(spec: any) {
    return { state: new MockEditorState(), changes: spec.changes }
  }
}

// Mock EditorSelection
export const MockEditorSelection = {
  single: (from: number, to: number) => ({
    main: { from, to, empty: from === to }
  }),
  cursor: (pos: number) => ({
    main: { from: pos, to: pos, empty: true }
  }),
  range: (from: number, to: number) => ({
    from,
    to,
    empty: from === to
  })
}

// Mock Text (文档模型)
export class MockText {
  private content: string

  constructor(text: string = '') {
    this.content = text
  }

  toString() {
    return this.content
  }

  get length() {
    return this.content.length
  }

  lineAt(pos: number) {
    const lines = this.content.split('\n')
    let currentPos = 0
    for (let i = 0; i < lines.length; i++) {
      const lineLength = lines[i].length + 1 // +1 for newline
      if (pos <= currentPos + lineLength) {
        return {
          number: i + 1,
          from: currentPos,
          to: currentPos + lines[i].length,
          text: lines[i]
        }
      }
      currentPos += lineLength
    }
    return {
      number: lines.length,
      from: currentPos,
      to: this.content.length,
      text: lines[lines.length - 1] || ''
    }
  }

  static of(lines: string[]) {
    return new MockText(lines.join('\n'))
  }
}

// Mock 各种扩展函数
export const mockExtension = () => ({})

// 导出所有 mock
export const codemirrorMocks = {
  // @codemirror/state
  EditorState: MockEditorState,
  EditorSelection: MockEditorSelection,
  Text: MockText,
  
  // @codemirror/view
  EditorView: MockEditorView,
  keymap: mockExtension,
  lineNumbers: mockExtension,
  highlightActiveLine: mockExtension,
  highlightActiveLineGutter: mockExtension,
  placeholder: (_text: string) => mockExtension(),
  
  // @codemirror/commands
  defaultKeymap: [],
  historyKeymap: [],
  history: mockExtension,
  indentWithTab: {},
  cursorMatchingBracket: mockExtension,
  
  // @codemirror/autocomplete
  closeBrackets: mockExtension,
  closeBracketsKeymap: [],
  
  // @codemirror/language
  syntaxHighlighting: mockExtension,
  bracketMatching: mockExtension,
  foldGutter: mockExtension,
  foldKeymap: [],
  indentOnInput: mockExtension,
  
  // @codemirror/lang-json
  json: mockExtension,
  jsonParseLinter: mockExtension,
  
  // @codemirror/lint
  linter: mockExtension,
  lintGutter: mockExtension,
  
  // @codemirror/search
  highlightSelectionMatches: mockExtension,
  searchKeymap: [],
  
  // @codemirror/theme-one-dark
  oneDark: mockExtension,
  
  // @lezer/highlight
  HighlightStyle: {
    define: (_specs: any) => mockExtension()
  },
  tags: {
    propertyName: 'propertyName',
    string: 'string',
    number: 'number',
    bool: 'bool',
    null: 'null',
    keyword: 'keyword',
    operator: 'operator',
    comment: 'comment',
    bracket: 'bracket'
  }
}

