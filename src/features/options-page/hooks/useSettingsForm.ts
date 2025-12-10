import { useCallback, useRef } from 'react'
import type { FormInstance } from 'antd'
import { getChangedFieldPath, pathToString } from '@/shared/utils/form-path'
import { KNOWN_FIELD_PATHS } from '../config/field-config'
import type { SettingsStorage } from '../types'

interface UseSettingsFormProps {
  form: FormInstance
  storage: SettingsStorage
  /** 主题色变化回调（需要在 Form 外部使用，所以需要单独通知） */
  onThemeColorChange?: (color: string) => void
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
  const { form, storage, onThemeColorChange, showSuccess, showError } = props

  const timeoutMapRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  /**
   * 加载所有设置
   */
  const loadSettings = useCallback(async () => {
    try {
      const settings = await storage.loadAllSettings()
      form.setFieldsValue(settings.formValues)

      // 通知主题色变化（用于 ConfigProvider）
      const themeColor = settings.formValues.themeColor as string | undefined
      if (themeColor && onThemeColorChange) {
        onThemeColorChange(themeColor)
      }
    } catch (error) {
      console.error('加载配置失败:', error)
      showError('加载配置失败')
    }
  }, [form, storage, onThemeColorChange, showError])

  /**
   * 保存单个字段
   */
  const saveField = useCallback(
    async (fieldPath: string[], allValues: Record<string, unknown>) => {
      try {
        await storage.saveField(fieldPath, allValues)
        showSuccess('已保存')
      } catch (error) {
        console.error('保存配置失败:', error)
        showError('保存失败')
      }
    },
    [storage, showSuccess, showError]
  )

  /**
   * 判断是否需要防抖的字段
   */
  const isDebounceField = useCallback((fieldPath: string[]) => {
    const debounceFields = [
      'attributeName',
      'drawerWidth',
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
        ['keyBinding', 'pollingInterval', 'highlightColor', 'autoStopTimeout'].includes(
          fieldPath[1]
        )) ||
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

      // 主题色变化时通知（用于 ConfigProvider）
      if (fieldPath[0] === 'themeColor' && onThemeColorChange) {
        onThemeColorChange(allValues.themeColor as string)
      }

      if (isDebounceField(fieldPath)) {
        debouncedSave(fieldPath, allValues)
      } else {
        saveField(fieldPath, allValues)
      }
    },
    [isDebounceField, debouncedSave, saveField, onThemeColorChange]
  )

  return {
    loadSettings,
    handleValuesChange,
  }
}
