import { FORM_PATHS } from '@/shared/constants/form-paths'
import { storage } from '@/shared/utils/browser/storage'
import { pathEqual } from '@/shared/utils/form-path'

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
  searchConfig: {
    fieldPaths: [
      FORM_PATHS.searchConfig.searchDepthDown,
      FORM_PATHS.searchConfig.searchDepthUp,
      FORM_PATHS.searchConfig.throttleInterval
    ],
    save: async (allValues: any) => {
      await storage.setSearchConfig(allValues.searchConfig)
    }
  },
  functionNames: {
    fieldPaths: [
      FORM_PATHS.getFunctionName,
      FORM_PATHS.updateFunctionName
    ],
    save: async (allValues: any) => {
      await storage.setFunctionNames(
        allValues.getFunctionName,
        allValues.updateFunctionName
      )
    }
  },
  toolbarButtons: {
    fieldPaths: [
      FORM_PATHS.toolbarButtons.astRawStringToggle,
      FORM_PATHS.toolbarButtons.deserialize,
      FORM_PATHS.toolbarButtons.serialize,
      FORM_PATHS.toolbarButtons.format,
      FORM_PATHS.toolbarButtons.preview,
      FORM_PATHS.toolbarButtons.importExport
    ],
    save: async (allValues: any) => {
      await storage.setToolbarButtons(allValues.toolbarButtons)
    }
  },
  previewConfig: {
    fieldPaths: [
      FORM_PATHS.previewConfig.previewWidth,
      FORM_PATHS.previewConfig.updateDelay,
      FORM_PATHS.previewConfig.rememberState,
      FORM_PATHS.previewConfig.autoUpdate
    ],
    save: async (allValues: any) => {
      await storage.setPreviewConfig(allValues.previewConfig)
    }
  },
  highlightAllConfig: {
    fieldPaths: [
      FORM_PATHS.highlightAllConfig.enabled,
      FORM_PATHS.highlightAllConfig.keyBinding,
      FORM_PATHS.highlightAllConfig.maxHighlightCount
    ],
    save: async (allValues: any) => {
      await storage.setHighlightAllConfig(allValues.highlightAllConfig)
    }
  },
  exportConfig: {
    fieldPaths: [
      FORM_PATHS.exportConfig.customFileName
    ],
    save: async (allValues: any) => {
      await storage.setExportConfig(allValues.exportConfig)
    }
  }
}

/**
 * 需要防抖保存的字段路径集合
 */
export const DEBOUNCE_FIELD_PATHS: readonly (readonly string[])[] = [
  FORM_PATHS.attributeName,
  FORM_PATHS.drawerWidth,
  FORM_PATHS.searchConfig.searchDepthDown,
  FORM_PATHS.searchConfig.searchDepthUp,
  FORM_PATHS.searchConfig.throttleInterval,
  FORM_PATHS.getFunctionName,
  FORM_PATHS.updateFunctionName,
  FORM_PATHS.maxFavoritesCount,
  FORM_PATHS.highlightColor,
  FORM_PATHS.maxHistoryCount,
  FORM_PATHS.highlightAllConfig.keyBinding,
  FORM_PATHS.highlightAllConfig.maxHighlightCount
]

/**
 * 独立字段路径与 storage 方法的映射
 */
export const FIELD_PATH_STORAGE_MAP: Record<string, string> = {
  'attributeName': 'setAttributeName',
  'drawerWidth': 'setDrawerWidth',
  'autoParseString': 'setAutoParseString',
  'enableDebugLog': 'setEnableDebugLog',
  'highlightColor': 'setHighlightColor',
  'maxFavoritesCount': 'setMaxFavoritesCount',
  'autoSaveDraft': 'setAutoSaveDraft',
  'maxHistoryCount': 'setMaxHistoryCount',
  'enableAstTypeHints': 'setEnableAstTypeHints'
}

/**
 * 根据字段路径查找所属的字段组
 * @param path 字段路径数组
 * @returns 找到的字段组，如果没有找到则返回 null
 */
export function findFieldGroup(path: readonly string[]): FieldGroup | null {
  for (const group of Object.values(FIELD_GROUPS)) {
    if (group.fieldPaths.some(fieldPath => pathEqual(fieldPath as string[], path as string[]))) {
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
  return DEBOUNCE_FIELD_PATHS.some(debouncePath => pathEqual(debouncePath as string[], path as string[]))
}
