import { FORM_PATHS } from '@/shared/constants/form-paths'
import { storage } from '@/shared/utils/browser/storage'
import { pathEqual, pathToString } from '@/shared/utils/form-path'

/**
 * 配置区块标识常量
 * 用于标识各个配置卡片及其对应的默认值键
 */
export const SECTION_KEYS = {
  INTEGRATION_CONFIG: 'integrationConfig',
  ELEMENT_DETECTION: 'elementDetection',
  EDITOR_CONFIG: 'editorConfig',
  FEATURE_TOGGLE: 'featureToggle',
  PREVIEW_CONFIG: 'previewConfig',
  DATA_MANAGEMENT: 'dataManagement',
  KEYBOARD_SHORTCUTS: 'keyboardShortcuts',
  DEBUG: 'debug',
} as const

export type SectionKey = (typeof SECTION_KEYS)[keyof typeof SECTION_KEYS]

/**
 * 各卡片对应的默认值键映射
 * key: 区块标识
 * value: 该区块包含的配置字段名数组
 */
export const SECTION_DEFAULT_KEYS: Record<SectionKey, readonly string[]> = {
  [SECTION_KEYS.INTEGRATION_CONFIG]: [
    'apiConfig',
    'attributeName',
    'getFunctionName',
    'updateFunctionName',
    'previewFunctionName',
  ],
  [SECTION_KEYS.ELEMENT_DETECTION]: [
    'searchConfig',
    'highlightColor',
    'highlightAllConfig',
    'recordingModeConfig',
  ],
  [SECTION_KEYS.EDITOR_CONFIG]: ['drawerWidth', 'enableAstTypeHints', 'editorTheme'],
  [SECTION_KEYS.FEATURE_TOGGLE]: ['toolbarButtons'],
  [SECTION_KEYS.PREVIEW_CONFIG]: ['previewConfig'],
  [SECTION_KEYS.DATA_MANAGEMENT]: [
    'maxFavoritesCount',
    'autoSaveDraft',
    'maxHistoryCount',
    'exportConfig',
  ],
  [SECTION_KEYS.KEYBOARD_SHORTCUTS]: ['drawerShortcuts'],
  [SECTION_KEYS.DEBUG]: ['enableDebugLog', 'autoParseString'],
}

/**
 * 字段分组接口
 */
interface FieldGroup {
  /** 字段路径数组 */
  fieldPaths: readonly (readonly string[])[]
  /** 保存函数 */
  save: (allValues: any) => Promise<void>
}

/**
 * 字段分组配置 - 需要组合保存的字段
 */
export const FIELD_GROUPS: Record<string, FieldGroup> = {
  apiConfig: {
    fieldPaths: [
      FORM_PATHS.apiConfig.communicationMode,
      FORM_PATHS.apiConfig.requestTimeout,
      FORM_PATHS.apiConfig.sourceConfig.contentSource,
      FORM_PATHS.apiConfig.sourceConfig.hostSource,
      FORM_PATHS.apiConfig.messageTypes.getSchema,
      FORM_PATHS.apiConfig.messageTypes.updateSchema,
      FORM_PATHS.apiConfig.messageTypes.checkPreview,
      FORM_PATHS.apiConfig.messageTypes.renderPreview,
      FORM_PATHS.apiConfig.messageTypes.cleanupPreview,
    ],
    save: async (allValues: any) => {
      await storage.setApiConfig(allValues.apiConfig)
    },
  },
  searchConfig: {
    fieldPaths: [
      FORM_PATHS.searchConfig.limitUpwardSearch,
      FORM_PATHS.searchConfig.searchDepthUp,
      FORM_PATHS.searchConfig.throttleInterval,
    ],
    save: async (allValues: any) => {
      await storage.setSearchConfig(allValues.searchConfig)
    },
  },
  functionNames: {
    fieldPaths: [
      FORM_PATHS.getFunctionName,
      FORM_PATHS.updateFunctionName,
      FORM_PATHS.previewFunctionName,
    ],
    save: async (allValues: any) => {
      await storage.setFunctionNames(
        allValues.getFunctionName,
        allValues.updateFunctionName,
        allValues.previewFunctionName
      )
    },
  },
  toolbarButtons: {
    fieldPaths: [
      FORM_PATHS.toolbarButtons.astRawStringToggle,
      FORM_PATHS.toolbarButtons.escape,
      FORM_PATHS.toolbarButtons.deserialize,
      FORM_PATHS.toolbarButtons.serialize,
      FORM_PATHS.toolbarButtons.format,
      FORM_PATHS.toolbarButtons.preview,
      FORM_PATHS.toolbarButtons.importExport,
      FORM_PATHS.toolbarButtons.draft,
      FORM_PATHS.toolbarButtons.favorites,
      FORM_PATHS.toolbarButtons.history,
    ],
    save: async (allValues: any) => {
      await storage.setToolbarButtons(allValues.toolbarButtons)
    },
  },
  previewConfig: {
    fieldPaths: [
      FORM_PATHS.previewConfig.previewWidth,
      FORM_PATHS.previewConfig.updateDelay,
      FORM_PATHS.previewConfig.autoUpdate,
    ],
    save: async (allValues: any) => {
      await storage.setPreviewConfig(allValues.previewConfig)
    },
  },
  highlightAllConfig: {
    fieldPaths: [
      FORM_PATHS.highlightAllConfig.enabled,
      FORM_PATHS.highlightAllConfig.keyBinding,
      FORM_PATHS.highlightAllConfig.maxHighlightCount,
    ],
    save: async (allValues: any) => {
      await storage.setHighlightAllConfig(allValues.highlightAllConfig)
    },
  },
  recordingModeConfig: {
    fieldPaths: [
      FORM_PATHS.recordingModeConfig.enabled,
      FORM_PATHS.recordingModeConfig.keyBinding,
      FORM_PATHS.recordingModeConfig.highlightColor,
      FORM_PATHS.recordingModeConfig.pollingInterval,
    ],
    save: async (allValues: any) => {
      await storage.setRecordingModeConfig(allValues.recordingModeConfig)
    },
  },
  exportConfig: {
    fieldPaths: [FORM_PATHS.exportConfig.customFileName],
    save: async (allValues: any) => {
      await storage.setExportConfig(allValues.exportConfig)
    },
  },
  drawerShortcuts: {
    fieldPaths: [
      FORM_PATHS.drawerShortcuts.save,
      FORM_PATHS.drawerShortcuts.format,
      FORM_PATHS.drawerShortcuts.openOrUpdatePreview,
      FORM_PATHS.drawerShortcuts.closePreview,
    ],
    save: async (allValues: any) => {
      await storage.setDrawerShortcuts(allValues.drawerShortcuts)
    },
  },
}

/**
 * 需要防抖保存的字段路径集合
 */
export const DEBOUNCE_FIELD_PATHS: readonly (readonly string[])[] = [
  FORM_PATHS.attributeName,
  FORM_PATHS.drawerWidth,
  FORM_PATHS.searchConfig.searchDepthUp,
  FORM_PATHS.searchConfig.throttleInterval,
  FORM_PATHS.getFunctionName,
  FORM_PATHS.updateFunctionName,
  FORM_PATHS.previewFunctionName,
  FORM_PATHS.maxFavoritesCount,
  FORM_PATHS.highlightColor,
  FORM_PATHS.maxHistoryCount,
  FORM_PATHS.highlightAllConfig.keyBinding,
  FORM_PATHS.highlightAllConfig.maxHighlightCount,
  FORM_PATHS.recordingModeConfig.keyBinding,
  FORM_PATHS.recordingModeConfig.highlightColor,
  FORM_PATHS.recordingModeConfig.pollingInterval,
  FORM_PATHS.apiConfig.requestTimeout,
  FORM_PATHS.apiConfig.sourceConfig.contentSource,
  FORM_PATHS.apiConfig.sourceConfig.hostSource,
  FORM_PATHS.apiConfig.messageTypes.getSchema,
  FORM_PATHS.apiConfig.messageTypes.updateSchema,
  FORM_PATHS.apiConfig.messageTypes.checkPreview,
  FORM_PATHS.apiConfig.messageTypes.renderPreview,
  FORM_PATHS.apiConfig.messageTypes.cleanupPreview,
]

/**
 * 独立字段路径与 storage 方法的映射
 */
export const FIELD_PATH_STORAGE_MAP: Record<string, string> = {
  attributeName: 'setAttributeName',
  drawerWidth: 'setDrawerWidth',
  autoParseString: 'setAutoParseString',
  enableDebugLog: 'setEnableDebugLog',
  highlightColor: 'setHighlightColor',
  maxFavoritesCount: 'setMaxFavoritesCount',
  autoSaveDraft: 'setAutoSaveDraft',
  maxHistoryCount: 'setMaxHistoryCount',
  enableAstTypeHints: 'setEnableAstTypeHints',
}

/**
 * 收集所有已知的字段路径（用于控制 getChangedFieldPath 的递归深度）
 */
export const KNOWN_FIELD_PATHS: Set<string> = new Set(
  Object.values(FIELD_GROUPS).flatMap((group) =>
    group.fieldPaths.map((p) => pathToString(p as string[]))
  )
)

/**
 * 根据字段路径查找所属的字段组
 * @param path 字段路径数组
 * @returns 找到的字段组，如果没有找到则返回 null
 */
export function findFieldGroup(path: readonly string[]): FieldGroup | null {
  for (const group of Object.values(FIELD_GROUPS)) {
    if (group.fieldPaths.some((fieldPath) => pathEqual(fieldPath as string[], path as string[]))) {
      return group
    }
  }
  return null
}

/**
 * 判断字段是否需要防抖保存
 * @param path 字段路径数组
 * @returns 是否需要防抖
 */
export function isDebounceField(path: readonly string[]): boolean {
  return DEBOUNCE_FIELD_PATHS.some((debouncePath) =>
    pathEqual(debouncePath as string[], path as string[])
  )
}
