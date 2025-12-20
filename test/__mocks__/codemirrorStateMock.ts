/**
 * @codemirror/state 模块的 Mock
 * 解决多实例冲突问题
 */

/**
 * Mock EditorState
 */
export class EditorState {
  static create(config?: any) {
    return new EditorState(config)
  }

  constructor(public config?: any) {}

  get doc() {
    const docContent = this.config?.doc || ''
    return {
      toString: () => docContent,
      length: docContent.length || 0,
      lines: 1,
      lineAt: () => ({ from: 0, to: 0, number: 1, text: '' }),
      sliceString: (from?: number, to?: number) => {
        return docContent.slice(from, to)
      },
    }
  }

  get selection() {
    return {
      main: { from: 0, to: 0 },
      ranges: [{ from: 0, to: 0 }],
    }
  }

  sliceDoc(from?: number, to?: number) {
    const doc = this.doc.toString()
    return doc.slice(from, to)
  }

  update(_specs: any) {
    return { state: this, transactions: [] }
  }

  toJSON() {
    return { doc: this.doc.toString() }
  }
}

/**
 * Mock EditorSelection
 */
export class EditorSelection {
  static single(anchor: number, head?: number) {
    return { main: { from: anchor, to: head || anchor } }
  }

  static range(anchor: number, head: number) {
    return { from: anchor, to: head }
  }

  static cursor(pos: number) {
    return { from: pos, to: pos }
  }
}

/**
 * Mock Transaction
 */
export class Transaction {
  constructor(
    public state: EditorState,
    public changes?: any
  ) {}
}

/**
 * Mock StateEffect
 */
export class StateEffect {
  static define() {
    return {
      of: (value: any) => ({ value }),
    }
  }
}

/**
 * Mock StateField
 */
export class StateField {
  static define(config: any) {
    return config
  }
}

/**
 * Mock Facet
 */
export class Facet {
  static define(config?: any) {
    return {
      of: (value: any) => value,
      ...config,
    }
  }
}

/**
 * Mock Extension
 */
export type Extension = any

/**
 * Mock Compartment
 */
export class Compartment {
  of(extension: Extension) {
    return extension
  }

  reconfigure(extension: Extension) {
    return { effects: [{ value: extension }] }
  }
}

/**
 * Mock ChangeSet
 */
export class ChangeSet {
  static of(changes: any, length: number) {
    return new ChangeSet(changes, length)
  }

  constructor(
    public changes: any,
    public length: number
  ) {}
}

/**
 * Mock Text
 */
export class Text {
  static of(text: string[]) {
    return {
      toString: () => text.join('\n'),
      length: text.join('\n').length,
      lines: text.length,
      lineAt: (_pos: number) => ({ from: 0, to: 0, number: 1, text: text[0] || '' }),
    }
  }
}

/**
 * Mock combineConfig
 */
export function combineConfig(configs: any[], defaults: any) {
  return { ...defaults, ...configs[0] }
}

/**
 * Mock RangeSet
 */
export class RangeSet {
  static empty = new RangeSet()
  static of() {
    return new RangeSet()
  }
}

/**
 * Mock Prec
 */
export const Prec = {
  highest(ext: Extension) {
    return ext
  },
  high(ext: Extension) {
    return ext
  },
  default(ext: Extension) {
    return ext
  },
  low(ext: Extension) {
    return ext
  },
  lowest(ext: Extension) {
    return ext
  },
}
