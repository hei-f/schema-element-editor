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
    format: true
  },
  highlightColor: '#39C5BB',
  maxFavoritesCount: 50,
  draftRetentionDays: 1,
  autoSaveDraft: false,
  draftAutoSaveDebounce: 3000
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
  DRAFTS_PREFIX: 'draft:',
  FAVORITES: 'favorites'
} as const

/**
 * 表单字段名常量
 */
export const FORM_FIELD_NAMES = {
  ATTRIBUTE_NAME: 'attributeName',
  DRAWER_WIDTH: 'drawerWidth',
  SEARCH_DEPTH_DOWN: 'searchDepthDown',
  SEARCH_DEPTH_UP: 'searchDepthUp',
  THROTTLE_INTERVAL: 'throttleInterval',
  GET_FUNCTION_NAME: 'getFunctionName',
  UPDATE_FUNCTION_NAME: 'updateFunctionName',
  AUTO_PARSE_STRING: 'autoParseString',
  ENABLE_DEBUG_LOG: 'enableDebugLog',
  HIGHLIGHT_COLOR: 'highlightColor',
  TOOLBAR_BUTTON_AST_RAW_STRING_TOGGLE: 'toolbarButtonAstRawStringToggle',
  TOOLBAR_BUTTON_DESERIALIZE: 'toolbarButtonDeserialize',
  TOOLBAR_BUTTON_SERIALIZE: 'toolbarButtonSerialize',
  TOOLBAR_BUTTON_FORMAT: 'toolbarButtonFormat',
  MAX_FAVORITES_COUNT: 'maxFavoritesCount',
  AUTO_SAVE_DRAFT: 'autoSaveDraft'
} as const

/**
 * 表单字段分组（按保存策略分类）
 */
export const FORM_FIELD_GROUPS = {
  INPUT_FIELDS: [
    FORM_FIELD_NAMES.ATTRIBUTE_NAME,
    FORM_FIELD_NAMES.DRAWER_WIDTH,
    FORM_FIELD_NAMES.GET_FUNCTION_NAME,
    FORM_FIELD_NAMES.UPDATE_FUNCTION_NAME
  ],
  NUMBER_FIELDS: [
    FORM_FIELD_NAMES.SEARCH_DEPTH_DOWN,
    FORM_FIELD_NAMES.SEARCH_DEPTH_UP,
    FORM_FIELD_NAMES.THROTTLE_INTERVAL
  ],
  COLOR_FIELDS: [
    FORM_FIELD_NAMES.HIGHLIGHT_COLOR
  ],
  SWITCH_FIELDS: [
    FORM_FIELD_NAMES.AUTO_PARSE_STRING,
    FORM_FIELD_NAMES.ENABLE_DEBUG_LOG,
    FORM_FIELD_NAMES.TOOLBAR_BUTTON_AST_RAW_STRING_TOGGLE,
    FORM_FIELD_NAMES.TOOLBAR_BUTTON_DESERIALIZE,
    FORM_FIELD_NAMES.TOOLBAR_BUTTON_SERIALIZE,
    FORM_FIELD_NAMES.TOOLBAR_BUTTON_FORMAT,
    FORM_FIELD_NAMES.AUTO_SAVE_DRAFT
  ],
  DRAFT_AND_FAVORITES_FIELDS: [
    FORM_FIELD_NAMES.MAX_FAVORITES_COUNT,
    FORM_FIELD_NAMES.AUTO_SAVE_DRAFT
  ]
} as const

