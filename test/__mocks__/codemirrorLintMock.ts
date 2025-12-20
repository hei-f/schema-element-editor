/**
 * @codemirror/lint 模块的 Mock
 */

/**
 * Mock Diagnostic
 */
export interface Diagnostic {
  from: number
  to: number
  severity: 'error' | 'warning' | 'info'
  message: string
  source?: string
  actions?: Array<{
    name: string
    apply: (view: any, from: number, to: number) => void
  }>
}

/**
 * Mock linter
 */
export function linter(source: any, config?: any) {
  return { extension: 'linter', source, config }
}

/**
 * Mock lintGutter
 */
export function lintGutter(config?: any) {
  return { extension: 'lintGutter', config }
}

/**
 * Mock lintKeymap
 */
export const lintKeymap = [{ key: 'Mod-Shift-m', run: () => true }]

/**
 * Mock setDiagnostics
 */
export function setDiagnostics(_state: any, diagnostics: Diagnostic[]) {
  return { effects: [{ value: diagnostics }] }
}

/**
 * Mock forceLinting
 */
export function forceLinting(_view: any) {
  return true
}
