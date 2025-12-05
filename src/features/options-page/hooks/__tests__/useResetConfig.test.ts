import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { useResetConfig } from '../useResetConfig'
import { storage } from '@/shared/utils/browser/storage'
import { DEFAULT_VALUES } from '@/shared/constants/defaults'
import { SECTION_KEYS } from '../../config/field-config'

// Mock storage
vi.mock('@/shared/utils/browser/storage', () => ({
  storage: {
    setAttributeName: vi.fn().mockResolvedValue(undefined),
    setDrawerWidth: vi.fn().mockResolvedValue(undefined),
    setSearchConfig: vi.fn().mockResolvedValue(undefined),
    setFunctionNames: vi.fn().mockResolvedValue(undefined),
    setAutoParseString: vi.fn().mockResolvedValue(undefined),
    setEnableDebugLog: vi.fn().mockResolvedValue(undefined),
    setToolbarButtons: vi.fn().mockResolvedValue(undefined),
    setHighlightColor: vi.fn().mockResolvedValue(undefined),
    setMaxFavoritesCount: vi.fn().mockResolvedValue(undefined),
    setAutoSaveDraft: vi.fn().mockResolvedValue(undefined),
    setPreviewConfig: vi.fn().mockResolvedValue(undefined),
    setMaxHistoryCount: vi.fn().mockResolvedValue(undefined),
    setHighlightAllConfig: vi.fn().mockResolvedValue(undefined),
    setRecordingModeConfig: vi.fn().mockResolvedValue(undefined),
    setIframeConfig: vi.fn().mockResolvedValue(undefined),
    setEnableAstTypeHints: vi.fn().mockResolvedValue(undefined),
    setExportConfig: vi.fn().mockResolvedValue(undefined),
    setEditorTheme: vi.fn().mockResolvedValue(undefined),
    setApiConfig: vi.fn().mockResolvedValue(undefined),
    setGetFunctionName: vi.fn().mockResolvedValue(undefined),
    setUpdateFunctionName: vi.fn().mockResolvedValue(undefined),
    setPreviewFunctionName: vi.fn().mockResolvedValue(undefined),
  },
}))

describe('useResetConfig', () => {
  const mockForm = {
    setFieldsValue: vi.fn(),
  }

  const mockCallbacks = {
    onAttributeNameChange: vi.fn(),
    onGetFunctionNameChange: vi.fn(),
    onUpdateFunctionNameChange: vi.fn(),
    onPreviewFunctionNameChange: vi.fn(),
    onCommunicationModeChange: vi.fn(),
    onApiConfigChange: vi.fn(),
    showSuccess: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('resetAllToDefault', () => {
    it('应该重置所有配置到默认值', async () => {
      const { result } = renderHook(() =>
        useResetConfig({
          form: mockForm as any,
          ...mockCallbacks,
        })
      )

      await result.current.resetAllToDefault()

      // 验证表单被设置为默认值
      expect(mockForm.setFieldsValue).toHaveBeenCalledWith(DEFAULT_VALUES)

      // 验证 storage 方法被调用
      expect(storage.setAttributeName).toHaveBeenCalledWith(DEFAULT_VALUES.attributeName)
      expect(storage.setDrawerWidth).toHaveBeenCalledWith(DEFAULT_VALUES.drawerWidth)
      expect(storage.setApiConfig).toHaveBeenCalledWith(DEFAULT_VALUES.apiConfig)

      // 验证回调被调用
      expect(mockCallbacks.onAttributeNameChange).toHaveBeenCalledWith(DEFAULT_VALUES.attributeName)
      expect(mockCallbacks.onCommunicationModeChange).toHaveBeenCalledWith(
        DEFAULT_VALUES.apiConfig.communicationMode
      )
      expect(mockCallbacks.onApiConfigChange).toHaveBeenCalledWith(DEFAULT_VALUES.apiConfig)

      // 验证成功提示
      expect(mockCallbacks.showSuccess).toHaveBeenCalledWith('已恢复全部默认配置')
    })
  })

  describe('resetSectionToDefault', () => {
    it('应该重置集成配置部分到默认值', async () => {
      const { result } = renderHook(() =>
        useResetConfig({
          form: mockForm as any,
          ...mockCallbacks,
        })
      )

      await result.current.resetSectionToDefault(SECTION_KEYS.INTEGRATION_CONFIG)

      // 验证表单被设置
      expect(mockForm.setFieldsValue).toHaveBeenCalled()

      // 验证集成配置相关的回调被调用
      expect(mockCallbacks.onAttributeNameChange).toHaveBeenCalledWith(DEFAULT_VALUES.attributeName)
      expect(mockCallbacks.onGetFunctionNameChange).toHaveBeenCalledWith(
        DEFAULT_VALUES.getFunctionName
      )
      expect(mockCallbacks.onUpdateFunctionNameChange).toHaveBeenCalledWith(
        DEFAULT_VALUES.updateFunctionName
      )
      expect(mockCallbacks.onPreviewFunctionNameChange).toHaveBeenCalledWith(
        DEFAULT_VALUES.previewFunctionName
      )
      expect(mockCallbacks.onCommunicationModeChange).toHaveBeenCalledWith(
        DEFAULT_VALUES.apiConfig.communicationMode
      )
      expect(mockCallbacks.onApiConfigChange).toHaveBeenCalledWith(DEFAULT_VALUES.apiConfig)

      // 验证成功提示
      expect(mockCallbacks.showSuccess).toHaveBeenCalledWith('已恢复默认配置')
    })

    it('应该重置编辑器配置部分到默认值', async () => {
      const { result } = renderHook(() =>
        useResetConfig({
          form: mockForm as any,
          ...mockCallbacks,
        })
      )

      await result.current.resetSectionToDefault(SECTION_KEYS.EDITOR_CONFIG)

      // 验证表单被设置
      expect(mockForm.setFieldsValue).toHaveBeenCalled()

      // 编辑器配置不包含集成配置相关字段，所以这些回调不应被调用
      expect(mockCallbacks.onAttributeNameChange).not.toHaveBeenCalled()

      // 验证成功提示
      expect(mockCallbacks.showSuccess).toHaveBeenCalledWith('已恢复默认配置')
    })
  })
})
