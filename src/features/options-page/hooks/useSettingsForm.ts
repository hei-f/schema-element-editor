import { useCallback, useRef } from 'react'
import type { FormInstance } from 'antd'
import type { ApiConfig, CommunicationMode } from '@/shared/types'
import { storage } from '@/shared/utils/browser/storage'
import { getChangedFieldPath, getValueByPath, pathToString } from '@/shared/utils/form-path'
import { FIELD_PATH_STORAGE_MAP, findFieldGroup, KNOWN_FIELD_PATHS } from '../config/field-config'

interface UseSettingsFormProps {
  form: FormInstance
  onAttributeNameChange: (value: string) => void
  onGetFunctionNameChange: (value: string) => void
  onUpdateFunctionNameChange: (value: string) => void
  onPreviewFunctionNameChange: (value: string) => void
  onCommunicationModeChange: (value: CommunicationMode) => void
  onApiConfigChange: (value: ApiConfig) => void
  showSuccess: (msg: string) => void
  showError: (msg: string) => void
}

interface UseSettingsFormReturn {
  /** 加载所有设置 */
  loadSettings: () => Promise<void>
  /** 处理表单值变化 */
  handleValuesChange: (
    changedValues: Record<string, unknown>,
    allValues: Record<string, unknown>
  ) => void
}

/**
 * 设置表单 Hook
 * 处理配置的加载、保存、防抖等逻辑
 */
export const useSettingsForm = (props: UseSettingsFormProps): UseSettingsFormReturn => {
  const {
    form,
    onAttributeNameChange,
    onGetFunctionNameChange,
    onUpdateFunctionNameChange,
    onPreviewFunctionNameChange,
    onCommunicationModeChange,
    onApiConfigChange,
    showSuccess,
    showError,
  } = props

  const timeoutMapRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  /**
   * 加载所有设置
   */
  const loadSettings = useCallback(async () => {
    try {
      const attributeName = await storage.getAttributeName()
      const searchConfig = await storage.getSearchConfig()
      const getFunctionName = await storage.getGetFunctionName()
      const updateFunctionName = await storage.getUpdateFunctionName()
      const autoParseString = await storage.getAutoParseString()
      const enableDebugLog = await storage.getEnableDebugLog()
      const toolbarButtons = await storage.getToolbarButtons()
      const drawerWidth = await storage.getDrawerWidth()
      const highlightColor = await storage.getHighlightColor()
      const maxFavoritesCount = await storage.getMaxFavoritesCount()
      const autoSaveDraft = await storage.getAutoSaveDraft()
      const previewConfig = await storage.getPreviewConfig()
      const maxHistoryCount = await storage.getMaxHistoryCount()
      const highlightAllConfig = await storage.getHighlightAllConfig()
      const recordingModeConfig = await storage.getRecordingModeConfig()
      const iframeConfig = await storage.getIframeConfig()
      const enableAstTypeHints = await storage.getEnableAstTypeHints()
      const exportConfig = await storage.getExportConfig()
      const editorTheme = await storage.getEditorTheme()
      const previewFunctionName = await storage.getPreviewFunctionName()
      const apiConfig = await storage.getApiConfig()
      const drawerShortcuts = await storage.getDrawerShortcuts()
      const themeColor = await storage.getThemeColor()

      onAttributeNameChange(attributeName)
      onGetFunctionNameChange(getFunctionName)
      onUpdateFunctionNameChange(updateFunctionName)
      onPreviewFunctionNameChange(previewFunctionName)
      onCommunicationModeChange(apiConfig.communicationMode)
      onApiConfigChange(apiConfig)

      form.setFieldsValue({
        attributeName,
        drawerWidth,
        searchConfig,
        getFunctionName,
        updateFunctionName,
        autoParseString,
        enableDebugLog,
        toolbarButtons,
        highlightColor,
        maxFavoritesCount,
        autoSaveDraft,
        previewConfig,
        maxHistoryCount,
        highlightAllConfig,
        recordingModeConfig,
        iframeConfig,
        enableAstTypeHints,
        exportConfig,
        editorTheme,
        previewFunctionName,
        apiConfig,
        drawerShortcuts,
        themeColor,
      })
    } catch (error) {
      console.error('加载配置失败:', error)
      showError('加载配置失败')
    }
  }, [
    form,
    onAttributeNameChange,
    onGetFunctionNameChange,
    onUpdateFunctionNameChange,
    onPreviewFunctionNameChange,
    onCommunicationModeChange,
    onApiConfigChange,
    showError,
  ])

  /**
   * 保存单个字段
   */
  const saveField = useCallback(
    async (fieldPath: string[], allValues: Record<string, unknown>) => {
      try {
        const fieldGroup = findFieldGroup(fieldPath)

        if (fieldGroup) {
          await fieldGroup.save(allValues)

          if (fieldPath[0] === 'getFunctionName' || fieldPath[0] === 'updateFunctionName') {
            onGetFunctionNameChange(allValues.getFunctionName as string)
            onUpdateFunctionNameChange(allValues.updateFunctionName as string)
          }

          if (fieldPath[0] === 'previewFunctionName') {
            onPreviewFunctionNameChange(allValues.previewFunctionName as string)
          }

          if (fieldPath[0] === 'apiConfig') {
            const apiConfig = allValues.apiConfig as ApiConfig
            onCommunicationModeChange(apiConfig.communicationMode)
            onApiConfigChange(apiConfig)
          }

          showSuccess('已保存')
          return
        }

        const pathKey = pathToString(fieldPath)
        const storageMethod = FIELD_PATH_STORAGE_MAP[pathKey]
        const storageAny = storage as unknown as Record<string, (value: unknown) => Promise<void>>

        if (storageMethod && storageAny[storageMethod]) {
          const fieldValue = getValueByPath(allValues, fieldPath)
          await storageAny[storageMethod](fieldValue)

          if (pathKey === 'attributeName') {
            onAttributeNameChange(fieldValue as string)
          }

          showSuccess('已保存')
        }
      } catch (error) {
        console.error('保存配置失败:', error)
        showError('保存失败')
      }
    },
    [
      onAttributeNameChange,
      onGetFunctionNameChange,
      onUpdateFunctionNameChange,
      onPreviewFunctionNameChange,
      onCommunicationModeChange,
      onApiConfigChange,
      showSuccess,
      showError,
    ]
  )

  /**
   * 判断是否需要防抖的字段
   */
  const isDebounceField = useCallback((fieldPath: string[]) => {
    const debounceFields = [
      'attributeName',
      'drawerWidth',
      'getFunctionName',
      'updateFunctionName',
      'previewFunctionName',
      'maxFavoritesCount',
      'highlightColor',
      'maxHistoryCount',
      'themeColor',
    ]
    const apiConfigDebounceFields = ['requestTimeout', 'sourceConfig', 'messageTypes']

    return (
      debounceFields.includes(fieldPath[0]) ||
      (fieldPath[0] === 'searchConfig' &&
        ['searchDepthUp', 'throttleInterval'].includes(fieldPath[1])) ||
      (fieldPath[0] === 'highlightAllConfig' &&
        ['keyBinding', 'maxHighlightCount'].includes(fieldPath[1])) ||
      (fieldPath[0] === 'recordingModeConfig' &&
        ['keyBinding', 'pollingInterval', 'highlightColor'].includes(fieldPath[1])) ||
      (fieldPath[0] === 'apiConfig' && apiConfigDebounceFields.includes(fieldPath[1]))
    )
  }, [])

  /**
   * 防抖保存
   */
  const debouncedSave = useCallback(
    (fieldPath: string[], allValues: Record<string, unknown>) => {
      const pathKey = pathToString(fieldPath)
      const existingTimeout = timeoutMapRef.current.get(pathKey)
      if (existingTimeout) {
        clearTimeout(existingTimeout)
      }

      const newTimeout = setTimeout(async () => {
        try {
          await form.validateFields([fieldPath])
          await saveField(fieldPath, allValues)
        } catch (error) {
          console.debug('表单验证失败，不保存:', error)
        }
        timeoutMapRef.current.delete(pathKey)
      }, 500)

      timeoutMapRef.current.set(pathKey, newTimeout)
    },
    [form, saveField]
  )

  /**
   * 处理表单值变化
   */
  const handleValuesChange = useCallback(
    (changedValues: Record<string, unknown>, allValues: Record<string, unknown>) => {
      const fieldPath = getChangedFieldPath(changedValues, [], KNOWN_FIELD_PATHS)

      if (isDebounceField(fieldPath)) {
        debouncedSave(fieldPath, allValues)
      } else {
        saveField(fieldPath, allValues)
      }
    },
    [isDebounceField, debouncedSave, saveField]
  )

  return {
    loadSettings,
    handleValuesChange,
  }
}
