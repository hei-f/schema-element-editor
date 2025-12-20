import { DEFAULT_VALUES } from '@/shared/constants/defaults'
import type { StorageData } from '@/shared/types'
import { storage } from '@/shared/utils/browser/storage'
import { getValueByPath, pathToString } from '@/shared/utils/form-path'
import {
  FIELD_PATH_STORAGE_MAP,
  findFieldGroup,
  SECTION_DEFAULT_KEYS,
  type SectionKey,
} from '../config/field-config'
import type { SettingsData, SettingsStorage } from '../types'

/**
 * 创建 Chrome Storage 适配器
 * 用于插件环境，封装 Chrome Storage API
 */
export const createChromeStorageAdapter = (): SettingsStorage => {
  return {
    async loadAllSettings(): Promise<SettingsData> {
      const [
        attributeName,
        searchConfig,
        autoParseString,
        enableDebugLog,
        toolbarButtons,
        drawerWidth,
        highlightColor,
        maxFavoritesCount,
        maxConfigPresetsCount,
        autoSaveDraft,
        previewConfig,
        maxHistoryCount,
        highlightAllConfig,
        recordingModeConfig,
        iframeConfig,
        enableAstTypeHints,
        exportConfig,
        editorTheme,
        apiConfig,
        drawerShortcuts,
        themeColor,
      ] = await Promise.all([
        storage.getAttributeName(),
        storage.getSearchConfig(),
        storage.getAutoParseString(),
        storage.getEnableDebugLog(),
        storage.getToolbarButtons(),
        storage.getDrawerWidth(),
        storage.getHighlightColor(),
        storage.getMaxFavoritesCount(),
        storage.getMaxConfigPresetsCount(),
        storage.getAutoSaveDraft(),
        storage.getPreviewConfig(),
        storage.getMaxHistoryCount(),
        storage.getHighlightAllConfig(),
        storage.getRecordingModeConfig(),
        storage.getIframeConfig(),
        storage.getEnableAstTypeHints(),
        storage.getExportConfig(),
        storage.getEditorTheme(),
        storage.getApiConfig(),
        storage.getDrawerShortcuts(),
        storage.getThemeColor(),
      ])

      return {
        formValues: {
          attributeName,
          drawerWidth,
          searchConfig,
          autoParseString,
          enableDebugLog,
          toolbarButtons,
          highlightColor,
          maxFavoritesCount,
          maxConfigPresetsCount,
          autoSaveDraft,
          previewConfig,
          maxHistoryCount,
          highlightAllConfig,
          recordingModeConfig,
          iframeConfig,
          enableAstTypeHints,
          exportConfig,
          editorTheme,
          apiConfig,
          drawerShortcuts,
          themeColor,
        },
      }
    },

    async saveField(fieldPath: string[], allValues: Record<string, unknown>): Promise<void> {
      const fieldGroup = findFieldGroup(fieldPath)

      if (fieldGroup) {
        await fieldGroup.save(allValues)
        return
      }

      const pathKey = pathToString(fieldPath)
      const storageMethod = FIELD_PATH_STORAGE_MAP[pathKey]
      const storageAny = storage as unknown as Record<string, (value: unknown) => Promise<void>>

      if (storageMethod && storageAny[storageMethod]) {
        const fieldValue = getValueByPath(allValues, fieldPath)
        await storageAny[storageMethod](fieldValue)
      }
    },

    async resetSectionToDefault(sectionKey: SectionKey): Promise<Record<string, unknown>> {
      const keys = SECTION_DEFAULT_KEYS[sectionKey]
      const defaultValues: Record<string, unknown> = {}

      for (const key of keys) {
        defaultValues[key] = (DEFAULT_VALUES as Record<string, unknown>)[key]
      }

      // 并行保存到 storage
      const storageAny = storage as unknown as Record<string, (value: unknown) => Promise<void>>
      const savePromises = keys
        .map((key) => {
          const value = (DEFAULT_VALUES as Record<string, unknown>)[key]
          const storageMethod = `set${key.charAt(0).toUpperCase()}${key.slice(1)}`
          if (storageAny[storageMethod]) {
            return storageAny[storageMethod](value)
          }
          return null
        })
        .filter(Boolean)

      await Promise.all(savePromises)

      return defaultValues
    },

    async resetAllToDefault(): Promise<Record<string, unknown>> {
      // 并行保存所有默认值到 storage
      await Promise.all([
        storage.setAttributeName(DEFAULT_VALUES.attributeName),
        storage.setDrawerWidth(DEFAULT_VALUES.drawerWidth),
        storage.setSearchConfig(DEFAULT_VALUES.searchConfig),
        storage.setAutoParseString(DEFAULT_VALUES.autoParseString),
        storage.setEnableDebugLog(DEFAULT_VALUES.enableDebugLog),
        storage.setToolbarButtons(DEFAULT_VALUES.toolbarButtons),
        storage.setHighlightColor(DEFAULT_VALUES.highlightColor),
        storage.setMaxFavoritesCount(DEFAULT_VALUES.maxFavoritesCount),
        storage.setAutoSaveDraft(DEFAULT_VALUES.autoSaveDraft),
        storage.setPreviewConfig(DEFAULT_VALUES.previewConfig),
        storage.setMaxHistoryCount(DEFAULT_VALUES.maxHistoryCount),
        storage.setHighlightAllConfig(DEFAULT_VALUES.highlightAllConfig),
        storage.setRecordingModeConfig(DEFAULT_VALUES.recordingModeConfig),
        storage.setIframeConfig(DEFAULT_VALUES.iframeConfig),
        storage.setEnableAstTypeHints(DEFAULT_VALUES.enableAstTypeHints),
        storage.setExportConfig(DEFAULT_VALUES.exportConfig),
        storage.setEditorTheme(DEFAULT_VALUES.editorTheme),
        storage.setApiConfig(DEFAULT_VALUES.apiConfig),
      ])

      return DEFAULT_VALUES as unknown as Record<string, unknown>
    },

    async setAllConfig(allValues: StorageData): Promise<void> {
      // 调用全局 storage 的 setAllConfig 方法批量保存
      await storage.setAllConfig(allValues)
    },
  }
}
