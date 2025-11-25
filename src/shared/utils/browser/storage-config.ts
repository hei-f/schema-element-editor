import { DEFAULT_VALUES, STORAGE_KEYS } from '@/shared/constants/defaults'
import type { EditorTheme, HighlightAllConfig, PreviewConfig } from '@/shared/types'

/**
 * 存储字段配置接口
 */
interface StorageFieldConfig<T> {
  /** 存储键名 */
  key: string
  /** 默认值 */
  defaultValue: T
  /** 可选的值转换函数（用于get时） */
  transformer?: (value: any) => T
  /** 可选的值验证函数 */
  validator?: (value: any) => value is T
}

/**
 * 简单字段配置映射表
 * 这些字段只需要简单的 get/set 操作，无需额外业务逻辑
 */
export const SIMPLE_STORAGE_FIELDS = {
  isActive: {
    key: STORAGE_KEYS.IS_ACTIVE,
    defaultValue: DEFAULT_VALUES.isActive
  } as StorageFieldConfig<boolean>,

  attributeName: {
    key: STORAGE_KEYS.ATTRIBUTE_NAME,
    defaultValue: DEFAULT_VALUES.attributeName
  } as StorageFieldConfig<string>,

  drawerWidth: {
    key: STORAGE_KEYS.DRAWER_WIDTH,
    defaultValue: DEFAULT_VALUES.drawerWidth,
    transformer: (value: string | number) => {
      if (typeof value === 'number') {
        return `${value}px` as string | number
      }
      return value
    }
  } as StorageFieldConfig<string | number>,

  getFunctionName: {
    key: STORAGE_KEYS.GET_FUNCTION_NAME,
    defaultValue: DEFAULT_VALUES.getFunctionName
  } as StorageFieldConfig<string>,

  updateFunctionName: {
    key: STORAGE_KEYS.UPDATE_FUNCTION_NAME,
    defaultValue: DEFAULT_VALUES.updateFunctionName
  } as StorageFieldConfig<string>,

  autoParseString: {
    key: STORAGE_KEYS.AUTO_PARSE_STRING,
    defaultValue: DEFAULT_VALUES.autoParseString
  } as StorageFieldConfig<boolean>,

  enableDebugLog: {
    key: STORAGE_KEYS.ENABLE_DEBUG_LOG,
    defaultValue: DEFAULT_VALUES.enableDebugLog
  } as StorageFieldConfig<boolean>,

  highlightColor: {
    key: STORAGE_KEYS.HIGHLIGHT_COLOR,
    defaultValue: DEFAULT_VALUES.highlightColor,
    validator: (value: any): value is string => {
      return typeof value === 'string' && value.length > 0
    }
  } as StorageFieldConfig<string>,

  maxFavoritesCount: {
    key: STORAGE_KEYS.MAX_FAVORITES_COUNT,
    defaultValue: DEFAULT_VALUES.maxFavoritesCount
  } as StorageFieldConfig<number>,

  draftRetentionDays: {
    key: STORAGE_KEYS.DRAFT_RETENTION_DAYS,
    defaultValue: DEFAULT_VALUES.draftRetentionDays
  } as StorageFieldConfig<number>,

  autoSaveDraft: {
    key: STORAGE_KEYS.AUTO_SAVE_DRAFT,
    defaultValue: DEFAULT_VALUES.autoSaveDraft
  } as StorageFieldConfig<boolean>,

  draftAutoSaveDebounce: {
    key: STORAGE_KEYS.DRAFT_AUTO_SAVE_DEBOUNCE,
    defaultValue: DEFAULT_VALUES.draftAutoSaveDebounce
  } as StorageFieldConfig<number>,

  previewConfig: {
    key: STORAGE_KEYS.PREVIEW_CONFIG,
    defaultValue: DEFAULT_VALUES.previewConfig
  } as StorageFieldConfig<PreviewConfig>,

  maxHistoryCount: {
    key: STORAGE_KEYS.MAX_HISTORY_COUNT,
    defaultValue: DEFAULT_VALUES.maxHistoryCount,
    validator: (value: any): value is number => {
      return typeof value === 'number' && value >= 10 && value <= 200
    }
  } as StorageFieldConfig<number>,

  highlightAllConfig: {
    key: STORAGE_KEYS.HIGHLIGHT_ALL_CONFIG,
    defaultValue: DEFAULT_VALUES.highlightAllConfig,
    validator: (value: any): value is HighlightAllConfig => {
      return (
        value &&
        typeof value.enabled === 'boolean' &&
        typeof value.keyBinding === 'string' &&
        value.keyBinding.length === 1 &&
        /^[a-zA-Z0-9]$/.test(value.keyBinding) &&  // 支持字母和数字
        typeof value.maxHighlightCount === 'number' &&
        value.maxHighlightCount >= 100 &&
        value.maxHighlightCount <= 1000
      )
    }
  } as StorageFieldConfig<HighlightAllConfig>,

  enableAstTypeHints: {
    key: STORAGE_KEYS.ENABLE_AST_TYPE_HINTS,
    defaultValue: DEFAULT_VALUES.enableAstTypeHints
  } as StorageFieldConfig<boolean>,

  editorTheme: {
    key: STORAGE_KEYS.EDITOR_THEME,
    defaultValue: DEFAULT_VALUES.editorTheme,
    validator: (value: any): value is EditorTheme => {
      return ['light', 'dark', 'schemaEditorDark'].includes(value)
    }
  } as StorageFieldConfig<EditorTheme>,

  previewFunctionName: {
    key: STORAGE_KEYS.PREVIEW_FUNCTION_NAME,
    defaultValue: DEFAULT_VALUES.previewFunctionName
  } as StorageFieldConfig<string>
}

/**
 * 字段名称类型
 */
export type StorageFieldName = keyof typeof SIMPLE_STORAGE_FIELDS

