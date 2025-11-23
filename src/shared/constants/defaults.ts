import type { StorageData } from '@/shared/types'

/**
 * 默认配置值
 * 项目中所有默认值的单一数据源
 */
export const DEFAULT_VALUES: Readonly<StorageData> = {
  isActive: false,
  drawerWidth: '800px',
  attributeName: 'id',
  searchConfig: {
    searchDepthDown: 5,
    searchDepthUp: 0,
    throttleInterval: 100
  },
  getFunctionName: '__getContentById',
  updateFunctionName: '__updateContentById',
  autoParseString: true,
  enableDebugLog: false,
  toolbarButtons: {
    astRawStringToggle: true,
    deserialize: false,
    serialize: false,
    format: true,
    preview: true
  },
  highlightColor: '#39C5BB',
  maxFavoritesCount: 50,
  draftRetentionDays: 1,
  autoSaveDraft: false,
  draftAutoSaveDebounce: 3000,
  previewConfig: {
    previewWidth: 40,
    updateDelay: 500,
    rememberState: false,
    autoUpdate: false
  },
  maxHistoryCount: 50,
  highlightAllConfig: {
    enabled: true,
    keyBinding: 'a',
    maxHighlightCount: 500
  },
  enableAstTypeHints: true
} as const

/**
 * 存储键名
 */
export const STORAGE_KEYS = {
  IS_ACTIVE: 'isActive',
  DRAWER_WIDTH: 'drawerWidth',
  ATTRIBUTE_NAME: 'attributeName',
  SEARCH_CONFIG: 'searchConfig',
  GET_FUNCTION_NAME: 'getFunctionName',
  UPDATE_FUNCTION_NAME: 'updateFunctionName',
  AUTO_PARSE_STRING: 'autoParseString',
  ENABLE_DEBUG_LOG: 'enableDebugLog',
  TOOLBAR_BUTTONS: 'toolbarButtons',
  HIGHLIGHT_COLOR: 'highlightColor',
  MAX_FAVORITES_COUNT: 'maxFavoritesCount',
  DRAFT_RETENTION_DAYS: 'draftRetentionDays',
  AUTO_SAVE_DRAFT: 'autoSaveDraft',
  DRAFT_AUTO_SAVE_DEBOUNCE: 'draftAutoSaveDebounce',
  PREVIEW_CONFIG: 'previewConfig',
  DRAFTS_PREFIX: 'draft:',
  FAVORITES: 'favorites',
  MAX_HISTORY_COUNT: 'maxHistoryCount',
  HIGHLIGHT_ALL_CONFIG: 'highlightAllConfig',
  ENABLE_AST_TYPE_HINTS: 'enableAstTypeHints'
} as const


