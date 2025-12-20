/**
 * @codemirror/search 模块的 Mock
 */

/**
 * Mock highlightSelectionMatches
 */
export function highlightSelectionMatches(config?: any) {
  return { extension: 'highlightSelectionMatches', config }
}

/**
 * Mock search
 */
export function search(config?: any) {
  return { extension: 'search', config }
}

/**
 * Mock searchKeymap
 */
export const searchKeymap = [
  { key: 'Mod-f', run: () => true },
  { key: 'Mod-g', run: () => true },
  { key: 'Mod-Shift-g', run: () => true },
]

/**
 * Mock SearchQuery
 */
export class SearchQuery {
  constructor(_config: any) {}

  static create(query: string, config?: any) {
    return new SearchQuery({ query, ...config })
  }
}

/**
 * Mock findNext
 */
export function findNext(_view: any) {
  return true
}

/**
 * Mock findPrevious
 */
export function findPrevious(_view: any) {
  return true
}

/**
 * Mock closeSearchPanel
 */
export function closeSearchPanel(_view: any) {
  return true
}

/**
 * Mock openSearchPanel
 */
export function openSearchPanel(_view: any) {
  return true
}
