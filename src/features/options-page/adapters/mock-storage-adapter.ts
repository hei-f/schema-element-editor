import { DEFAULT_VALUES } from '@/shared/constants/defaults'
import type { StorageData } from '@/shared/types'
import { SECTION_DEFAULT_KEYS, type SectionKey } from '../config/field-config'
import type { SettingsData, SettingsStorage } from '../types'

/**
 * 创建 Mock Storage 适配器
 * 用于测试环境，使用默认值和内存存储
 */
export const createMockStorageAdapter = (): SettingsStorage => {
  return {
    async loadAllSettings(): Promise<SettingsData> {
      return {
        formValues: {
          attributeName: DEFAULT_VALUES.attributeName,
          drawerWidth: DEFAULT_VALUES.drawerWidth,
          searchConfig: DEFAULT_VALUES.searchConfig,
          autoParseString: DEFAULT_VALUES.autoParseString,
          toolbarButtons: DEFAULT_VALUES.toolbarButtons,
          highlightColor: DEFAULT_VALUES.highlightColor,
          maxFavoritesCount: DEFAULT_VALUES.maxFavoritesCount,
          autoSaveDraft: DEFAULT_VALUES.autoSaveDraft,
          previewConfig: DEFAULT_VALUES.previewConfig,
          maxHistoryCount: DEFAULT_VALUES.maxHistoryCount,
          highlightAllConfig: DEFAULT_VALUES.highlightAllConfig,
          recordingModeConfig: DEFAULT_VALUES.recordingModeConfig,
          iframeConfig: DEFAULT_VALUES.iframeConfig,
          enableAstTypeHints: DEFAULT_VALUES.enableAstTypeHints,
          exportConfig: DEFAULT_VALUES.exportConfig,
          editorTheme: DEFAULT_VALUES.editorTheme,
          apiConfig: DEFAULT_VALUES.apiConfig,
          drawerShortcuts: DEFAULT_VALUES.drawerShortcuts,
          themeColor: DEFAULT_VALUES.themeColor,
        },
      }
    },

    async saveField(): Promise<void> {
      // Mock 环境不持久化，仅模拟保存成功
      // 实际保存由组件内部状态管理
    },

    async resetSectionToDefault(sectionKey: SectionKey): Promise<Record<string, unknown>> {
      const keys = SECTION_DEFAULT_KEYS[sectionKey]
      const defaultValues: Record<string, unknown> = {}

      if (keys && Array.isArray(keys)) {
        for (const key of keys) {
          defaultValues[key] = (DEFAULT_VALUES as Record<string, unknown>)[key]
        }
      }

      return defaultValues
    },

    async resetAllToDefault(): Promise<Record<string, unknown>> {
      return DEFAULT_VALUES as unknown as Record<string, unknown>
    },

    async setAllConfig(_allValues: StorageData): Promise<void> {
      // Mock 环境不持久化，仅模拟批量保存成功
      // 实际保存由组件内部状态管理
    },
  }
}
