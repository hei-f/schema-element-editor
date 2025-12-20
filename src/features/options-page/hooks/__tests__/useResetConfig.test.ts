import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { useResetConfig } from '../useResetConfig'
import { DEFAULT_VALUES } from '@/shared/constants/defaults'
import { SECTION_KEYS, SECTION_DEFAULT_KEYS, type SectionKey } from '../../config/field-config'
import type { SettingsStorage } from '../../types'

describe('useResetConfig', () => {
  const mockForm = {
    setFieldsValue: vi.fn(),
  }

  /** 创建 Mock Storage */
  const createMockStorage = (): SettingsStorage => ({
    loadAllSettings: vi.fn().mockResolvedValue({}),
    saveField: vi.fn().mockResolvedValue(undefined),
    resetSectionToDefault: vi.fn().mockImplementation((sectionKey: SectionKey) => {
      const keys = SECTION_DEFAULT_KEYS[sectionKey]
      const defaultValues: Record<string, unknown> = {}
      for (const key of keys) {
        defaultValues[key] = (DEFAULT_VALUES as Record<string, unknown>)[key]
      }
      return Promise.resolve(defaultValues)
    }),
    resetAllToDefault: vi.fn().mockResolvedValue(DEFAULT_VALUES),
    setAllConfig: vi.fn().mockResolvedValue(undefined),
  })

  const mockCallbacks = {
    onThemeColorChange: vi.fn(),
    showSuccess: vi.fn(),
  }

  let mockStorage: SettingsStorage

  beforeEach(() => {
    vi.clearAllMocks()
    mockStorage = createMockStorage()
  })

  describe('resetAllToDefault', () => {
    it('应该重置所有配置到默认值', async () => {
      const { result } = renderHook(() =>
        useResetConfig({
          form: mockForm as any,
          storage: mockStorage,
          ...mockCallbacks,
        })
      )

      await result.current.resetAllToDefault()

      // 验证 storage 方法被调用
      expect(mockStorage.resetAllToDefault).toHaveBeenCalled()

      // 验证表单被设置为默认值
      expect(mockForm.setFieldsValue).toHaveBeenCalledWith(DEFAULT_VALUES)

      // 验证主题色回调被调用
      expect(mockCallbacks.onThemeColorChange).toHaveBeenCalledWith(DEFAULT_VALUES.themeColor)

      // 验证成功提示
      expect(mockCallbacks.showSuccess).toHaveBeenCalledWith('已恢复全部默认配置')
    })
  })

  describe('resetSectionToDefault', () => {
    it('应该重置集成配置部分到默认值', async () => {
      const { result } = renderHook(() =>
        useResetConfig({
          form: mockForm as any,
          storage: mockStorage,
          ...mockCallbacks,
        })
      )

      await result.current.resetSectionToDefault(SECTION_KEYS.INTEGRATION_CONFIG)

      // 验证 storage 方法被调用
      expect(mockStorage.resetSectionToDefault).toHaveBeenCalledWith(
        SECTION_KEYS.INTEGRATION_CONFIG
      )

      // 验证表单被设置
      expect(mockForm.setFieldsValue).toHaveBeenCalled()

      // 验证成功提示
      expect(mockCallbacks.showSuccess).toHaveBeenCalledWith('已恢复默认配置')
    })

    it('应该重置编辑器配置部分到默认值', async () => {
      const { result } = renderHook(() =>
        useResetConfig({
          form: mockForm as any,
          storage: mockStorage,
          ...mockCallbacks,
        })
      )

      await result.current.resetSectionToDefault(SECTION_KEYS.EDITOR_CONFIG)

      // 验证 storage 方法被调用
      expect(mockStorage.resetSectionToDefault).toHaveBeenCalledWith(SECTION_KEYS.EDITOR_CONFIG)

      // 验证表单被设置
      expect(mockForm.setFieldsValue).toHaveBeenCalled()

      // 验证成功提示
      expect(mockCallbacks.showSuccess).toHaveBeenCalledWith('已恢复默认配置')
    })
  })
})
