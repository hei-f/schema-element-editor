import type { StorageData } from '@/shared/types'
import { DEFAULT_EDITOR_THEME } from './editor-themes'

/**
 * 录制模式左侧面板宽度（px）
 */
export const RECORDING_PANEL_WIDTH = 180

/**
 * 默认配置值
 * 项目中所有默认值的单一数据源
 */
export const DEFAULT_VALUES: Readonly<StorageData> = {
  isActive: false,
  drawerWidth: '800px',
  attributeName: 'id',
  searchConfig: {
    limitUpwardSearch: false,
    searchDepthUp: 5,
    throttleInterval: 16,
  },
  getFunctionName: '__getContentById',
  updateFunctionName: '__updateContentById',
  previewFunctionName: '__getContentPreview',
  autoParseString: true,
  enableDebugLog: false,
  toolbarButtons: {
    astRawStringToggle: true,
    escape: true,
    deserialize: false,
    serialize: false,
    format: true,
    preview: true,
    importExport: true,
    draft: true,
    favorites: true,
    history: true,
  },
  highlightColor: '#1677FF',
  maxFavoritesCount: 50,
  draftRetentionDays: 1,
  autoSaveDraft: false,
  draftAutoSaveDebounce: 3000,
  previewConfig: {
    previewWidth: 40,
    updateDelay: 500,
    autoUpdate: false,
    zIndex: {
      default: 2147483646,
      preview: 999,
    },
  },
  maxHistoryCount: 50,
  highlightAllConfig: {
    enabled: true,
    keyBinding: 'a',
    maxHighlightCount: 500,
  },
  recordingModeConfig: {
    enabled: true,
    keyBinding: 'r',
    highlightColor: '#FF4D4F',
    pollingInterval: 100,
    autoStopTimeout: null,
  },
  iframeConfig: {
    enabled: false,
    schemaTarget: 'iframe',
  },
  enableAstTypeHints: true,
  exportConfig: {
    customFileName: false,
  },
  editorTheme: DEFAULT_EDITOR_THEME,
  apiConfig: {
    communicationMode: 'postMessage',
    requestTimeout: 5,
    sourceConfig: {
      contentSource: 'schema-editor-content',
      hostSource: 'schema-editor-host',
    },
    messageTypes: {
      getSchema: 'GET_SCHEMA',
      updateSchema: 'UPDATE_SCHEMA',
      checkPreview: 'CHECK_PREVIEW',
      renderPreview: 'RENDER_PREVIEW',
      cleanupPreview: 'CLEANUP_PREVIEW',
    },
  },
  drawerShortcuts: {
    save: { key: 's', ctrlOrCmd: false, shift: false, alt: true },
    format: { key: 'f', ctrlOrCmd: false, shift: false, alt: true },
    openOrUpdatePreview: { key: 'p', ctrlOrCmd: false, shift: false, alt: true },
    closePreview: { key: 'p', ctrlOrCmd: false, shift: true, alt: true },
  },
  themeColor: '#1677FF',
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
  RECORDING_MODE_CONFIG: 'recordingModeConfig',
  IFRAME_CONFIG: 'iframeConfig',
  ENABLE_AST_TYPE_HINTS: 'enableAstTypeHints',
  EXPORT_CONFIG: 'exportConfig',
  EDITOR_THEME: 'editorTheme',
  PREVIEW_FUNCTION_NAME: 'previewFunctionName',
  API_CONFIG: 'apiConfig',
  DRAWER_SHORTCUTS: 'drawerShortcuts',
  THEME_COLOR: 'themeColor',
} as const
