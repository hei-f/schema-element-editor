import { useCallback } from 'react'
import type { FormInstance } from 'antd'
import type { ApiConfig, CommunicationMode } from '@/shared/types'
import { DEFAULT_VALUES } from '@/shared/constants/defaults'
import { storage } from '@/shared/utils/browser/storage'
import { SECTION_DEFAULT_KEYS, SECTION_KEYS, type SectionKey } from '../config/field-config'

interface UseResetConfigProps {
  form: FormInstance
  onAttributeNameChange: (value: string) => void
  onGetFunctionNameChange: (value: string) => void
  onUpdateFunctionNameChange: (value: string) => void
  onPreviewFunctionNameChange: (value: string) => void
  onCommunicationModeChange: (value: CommunicationMode) => void
  onApiConfigChange: (value: ApiConfig) => void
  showSuccess: (msg: string) => void
}

interface UseResetConfigReturn {
  /** 恢复指定卡片的默认配置 */
  resetSectionToDefault: (sectionKey: SectionKey) => Promise<void>
  /** 恢复全部默认配置 */
  resetAllToDefault: () => Promise<void>
}

/**
 * 重置配置 Hook
 * 处理恢复默认配置的逻辑
 */
export const useResetConfig = (props: UseResetConfigProps): UseResetConfigReturn => {
  const {
    form,
    onAttributeNameChange,
    onGetFunctionNameChange,
    onUpdateFunctionNameChange,
    onPreviewFunctionNameChange,
    onCommunicationModeChange,
    onApiConfigChange,
    showSuccess,
  } = props

  /**
   * 恢复指定卡片的默认配置
   */
  const resetSectionToDefault = useCallback(
    async (sectionKey: SectionKey) => {
      const keys = SECTION_DEFAULT_KEYS[sectionKey]
      const defaultValues: Record<string, unknown> = {}

      for (const key of keys) {
        defaultValues[key] = (DEFAULT_VALUES as Record<string, unknown>)[key]
      }

      form.setFieldsValue(defaultValues)

      // 保存到 storage
      for (const key of keys) {
        const value = (DEFAULT_VALUES as Record<string, unknown>)[key]
        const storageMethod = `set${key.charAt(0).toUpperCase()}${key.slice(1)}`
        const storageAny = storage as unknown as Record<string, (value: unknown) => Promise<void>>
        if (storageAny[storageMethod]) {
          await storageAny[storageMethod](value)
        }
      }

      // 更新 state
      if (sectionKey === SECTION_KEYS.INTEGRATION_CONFIG) {
        onAttributeNameChange(DEFAULT_VALUES.attributeName)
        onGetFunctionNameChange(DEFAULT_VALUES.getFunctionName)
        onUpdateFunctionNameChange(DEFAULT_VALUES.updateFunctionName)
        onPreviewFunctionNameChange(DEFAULT_VALUES.previewFunctionName)
        onCommunicationModeChange(DEFAULT_VALUES.apiConfig.communicationMode)
        onApiConfigChange(DEFAULT_VALUES.apiConfig)
      }

      showSuccess('已恢复默认配置')
    },
    [
      form,
      onAttributeNameChange,
      onGetFunctionNameChange,
      onUpdateFunctionNameChange,
      onPreviewFunctionNameChange,
      onCommunicationModeChange,
      onApiConfigChange,
      showSuccess,
    ]
  )

  /**
   * 恢复全部默认配置
   */
  const resetAllToDefault = useCallback(async () => {
    form.setFieldsValue(DEFAULT_VALUES)

    // 保存所有默认值到 storage
    await storage.setAttributeName(DEFAULT_VALUES.attributeName)
    await storage.setDrawerWidth(DEFAULT_VALUES.drawerWidth)
    await storage.setSearchConfig(DEFAULT_VALUES.searchConfig)
    await storage.setFunctionNames(
      DEFAULT_VALUES.getFunctionName,
      DEFAULT_VALUES.updateFunctionName,
      DEFAULT_VALUES.previewFunctionName
    )
    await storage.setAutoParseString(DEFAULT_VALUES.autoParseString)
    await storage.setEnableDebugLog(DEFAULT_VALUES.enableDebugLog)
    await storage.setToolbarButtons(DEFAULT_VALUES.toolbarButtons)
    await storage.setHighlightColor(DEFAULT_VALUES.highlightColor)
    await storage.setMaxFavoritesCount(DEFAULT_VALUES.maxFavoritesCount)
    await storage.setAutoSaveDraft(DEFAULT_VALUES.autoSaveDraft)
    await storage.setPreviewConfig(DEFAULT_VALUES.previewConfig)
    await storage.setMaxHistoryCount(DEFAULT_VALUES.maxHistoryCount)
    await storage.setHighlightAllConfig(DEFAULT_VALUES.highlightAllConfig)
    await storage.setRecordingModeConfig(DEFAULT_VALUES.recordingModeConfig)
    await storage.setIframeConfig(DEFAULT_VALUES.iframeConfig)
    await storage.setEnableAstTypeHints(DEFAULT_VALUES.enableAstTypeHints)
    await storage.setExportConfig(DEFAULT_VALUES.exportConfig)
    await storage.setEditorTheme(DEFAULT_VALUES.editorTheme)
    await storage.setApiConfig(DEFAULT_VALUES.apiConfig)

    // 更新 state
    onAttributeNameChange(DEFAULT_VALUES.attributeName)
    onGetFunctionNameChange(DEFAULT_VALUES.getFunctionName)
    onUpdateFunctionNameChange(DEFAULT_VALUES.updateFunctionName)
    onPreviewFunctionNameChange(DEFAULT_VALUES.previewFunctionName)
    onCommunicationModeChange(DEFAULT_VALUES.apiConfig.communicationMode)
    onApiConfigChange(DEFAULT_VALUES.apiConfig)

    showSuccess('已恢复全部默认配置')
  }, [
    form,
    onAttributeNameChange,
    onGetFunctionNameChange,
    onUpdateFunctionNameChange,
    onPreviewFunctionNameChange,
    onCommunicationModeChange,
    onApiConfigChange,
    showSuccess,
  ])

  return {
    resetSectionToDefault,
    resetAllToDefault,
  }
}
