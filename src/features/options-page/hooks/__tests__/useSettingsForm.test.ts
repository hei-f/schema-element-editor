import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { useSettingsForm } from '../useSettingsForm'
import { DEFAULT_VALUES } from '@/shared/constants/defaults'
import type { SettingsStorage, SettingsData } from '../../types'

describe('useSettingsForm', () => {
  const mockForm = {
    setFieldsValue: vi.fn(),
    validateFields: vi.fn().mockResolvedValue(undefined),
  }

  /** Mock 设置数据 */
  const mockSettingsData: SettingsData = {
    formValues: {
      attributeName: DEFAULT_VALUES.attributeName,
      drawerWidth: DEFAULT_VALUES.drawerWidth,
      searchConfig: DEFAULT_VALUES.searchConfig,
      autoParseString: DEFAULT_VALUES.autoParseString,
      enableDebugLog: DEFAULT_VALUES.enableDebugLog,
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

  /** Mock Storage */
  const createMockStorage = (): SettingsStorage => ({
    loadAllSettings: vi.fn().mockResolvedValue(mockSettingsData),
    saveField: vi.fn().mockResolvedValue(undefined),
    resetSectionToDefault: vi.fn().mockResolvedValue({}),
    resetAllToDefault: vi.fn().mockResolvedValue(DEFAULT_VALUES),
  })

  const mockCallbacks = {
    onThemeColorChange: vi.fn(),
    showSuccess: vi.fn(),
    showError: vi.fn(),
  }

  let mockStorage: SettingsStorage

  beforeEach(() => {
    vi.clearAllMocks()
    mockStorage = createMockStorage()
  })

  describe('loadSettings', () => {
    it('应该加载所有配置并更新表单', async () => {
      const { result } = renderHook(() =>
        useSettingsForm({
          form: mockForm as any,
          storage: mockStorage,
          ...mockCallbacks,
        })
      )

      await result.current.loadSettings()

      // 验证表单被设置
      expect(mockForm.setFieldsValue).toHaveBeenCalledWith(mockSettingsData.formValues)

      // 验证主题色回调被调用
      expect(mockCallbacks.onThemeColorChange).toHaveBeenCalledWith(DEFAULT_VALUES.themeColor)
    })

    it('加载失败时应该显示错误', async () => {
      vi.mocked(mockStorage.loadAllSettings).mockRejectedValue(new Error('加载失败'))

      const { result } = renderHook(() =>
        useSettingsForm({
          form: mockForm as any,
          storage: mockStorage,
          ...mockCallbacks,
        })
      )

      await result.current.loadSettings()

      expect(mockCallbacks.showError).toHaveBeenCalledWith('加载配置失败')
    })
  })

  describe('handleValuesChange', () => {
    it('应该处理非防抖字段的值变化', async () => {
      const { result } = renderHook(() =>
        useSettingsForm({
          form: mockForm as any,
          storage: mockStorage,
          ...mockCallbacks,
        })
      )

      // 模拟 autoParseString 变化（非防抖字段）
      await waitFor(() => {
        result.current.handleValuesChange(
          { autoParseString: true },
          { autoParseString: true, attributeName: 'test' }
        )
      })

      // 非防抖字段应该立即保存
      expect(mockStorage.saveField).toHaveBeenCalled()
    })
  })
})
