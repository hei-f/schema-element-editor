/**
 * @codemirror/autocomplete 模块的 Mock
 */

/**
 * Mock autocompletion
 */
export function autocompletion(config?: any) {
  return {
    extension: 'autocompletion',
    config,
  }
}

/**
 * Mock closeBrackets
 */
export function closeBrackets() {
  return { extension: 'closeBrackets' }
}

/**
 * Mock closeBracketsKeymap
 */
export const closeBracketsKeymap = [{ key: 'Backspace', run: () => true }]

/**
 * Mock CompletionContext
 */
export interface CompletionContext {
  state: any
  pos: number
  explicit: boolean
  aborted: boolean
}

/**
 * Mock CompletionResult
 */
export interface CompletionResult {
  from: number
  to?: number
  options: Array<{
    label: string
    type?: string
    detail?: string
    info?: string
    apply?: string
  }>
  validFor?: RegExp
}
