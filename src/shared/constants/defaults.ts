import type { StorageData } from '@/shared/types'
import { DEFAULT_EDITOR_THEME } from './editor-themes'
import { CONTEXT_MENU_TRIGGER_MODE } from './context-menu'

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
    allowHighlightedElementClick: false,
  },
  autoParseString: true,
  toolbarButtons: {
    astRawStringToggle: true,
    escape: true,
    deserialize: false,
    compact: false,
    format: true,
    preview: true,
    importExport: true,
    draft: true,
    favorites: true,
    history: true,
  },
  highlightColor: '#1677FF',
  maxFavoritesCount: 50,
  maxPinnedFavorites: 10,
  maxConfigPresetsCount: 5,
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
    enableBuiltinPreview: true,
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
    dataFetchMode: 'polling',
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
    requestTimeout: 1,
    sourceConfig: {
      contentSource: 'schema-element-editor-content',
      hostSource: 'schema-element-editor-host',
    },
    messageTypes: {
      getSchema: 'GET_SCHEMA',
      updateSchema: 'UPDATE_SCHEMA',
      checkPreview: 'CHECK_PREVIEW',
      renderPreview: 'RENDER_PREVIEW',
      cleanupPreview: 'CLEANUP_PREVIEW',
      startRecording: 'START_RECORDING',
      stopRecording: 'STOP_RECORDING',
      schemaPush: 'SCHEMA_PUSH',
    },
  },
  drawerShortcuts: {
    save: { key: 's', ctrlOrCmd: false, shift: false, alt: true },
    format: { key: 'f', ctrlOrCmd: false, shift: false, alt: true },
    openOrUpdatePreview: { key: 'p', ctrlOrCmd: false, shift: false, alt: true },
    closePreview: { key: 'p', ctrlOrCmd: false, shift: true, alt: true },
  },
  themeColor: '#1677FF',
  contextMenuConfig: {
    enabled: true,
    triggerMode: CONTEXT_MENU_TRIGGER_MODE.SELECTION,
  },
} as const

/**
 * 存储键名
 */
export const STORAGE_KEYS = {
  IS_ACTIVE: 'isActive',
  DRAWER_WIDTH: 'drawerWidth',
  ATTRIBUTE_NAME: 'attributeName',
  SEARCH_CONFIG: 'searchConfig',
  AUTO_PARSE_STRING: 'autoParseString',
  TOOLBAR_BUTTONS: 'toolbarButtons',
  HIGHLIGHT_COLOR: 'highlightColor',
  MAX_FAVORITES_COUNT: 'maxFavoritesCount',
  MAX_PINNED_FAVORITES: 'maxPinnedFavorites',
  DRAFT_RETENTION_DAYS: 'draftRetentionDays',
  AUTO_SAVE_DRAFT: 'autoSaveDraft',
  DRAFT_AUTO_SAVE_DEBOUNCE: 'draftAutoSaveDebounce',
  PREVIEW_CONFIG: 'previewConfig',
  DRAFTS_PREFIX: 'draft:',
  FAVORITES: 'favorites',
  FAVORITES_METADATA: 'favoritesMetadata',
  FAVORITES_CONTENT: 'favoritesContent',
  MAX_HISTORY_COUNT: 'maxHistoryCount',
  HIGHLIGHT_ALL_CONFIG: 'highlightAllConfig',
  RECORDING_MODE_CONFIG: 'recordingModeConfig',
  IFRAME_CONFIG: 'iframeConfig',
  ENABLE_AST_TYPE_HINTS: 'enableAstTypeHints',
  EXPORT_CONFIG: 'exportConfig',
  EDITOR_THEME: 'editorTheme',
  API_CONFIG: 'apiConfig',
  DRAWER_SHORTCUTS: 'drawerShortcuts',
  THEME_COLOR: 'themeColor',
  CONTEXT_MENU_CONFIG: 'contextMenuConfig',
  MAX_CONFIG_PRESETS_COUNT: 'maxConfigPresetsCount',
  CONFIG_PRESETS: 'configPresets',
  CONFIG_PRESETS_METADATA: 'configPresetsMetadata',
  CONFIG_PRESETS_CONTENT: 'configPresetsContent',
} as const
