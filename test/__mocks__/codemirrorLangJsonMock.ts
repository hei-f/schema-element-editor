/**
 * @codemirror/lang-json 模块的 Mock
 */

/**
 * Mock json 语言扩展
 */
export function json() {
  return {
    language: {
      name: 'json',
      parser: {}
    }
  }
}

/**
 * Mock jsonLanguage
 */
export const jsonLanguage = {
  name: 'json',
  parser: {}
}

/**
 * Mock jsonParseLinter
 */
export function jsonParseLinter() {
  return () => []
}

