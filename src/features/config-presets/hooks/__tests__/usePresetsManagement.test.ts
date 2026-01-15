import { renderHook, waitFor, createMockConfigPreset } from '@test/test-utils'
import { act } from 'react'
import type { ConfigPreset } from '@/shared/types'
import { storage } from '@/shared/utils/browser/storage'
import { usePresetsManagement } from '../usePresetsManagement'

/**
 * Mock storage
 */
vi.mock('@/shared/utils/browser/storage', () => ({
  storage: {
    getAllData: vi.fn(),
    addConfigPreset: vi.fn(),
    getConfigPresets: vi.fn(),
    getPresetsMeta: vi.fn(),
    getPresetConfig: vi.fn(),
    deleteConfigPreset: vi.fn(),
  },
}))

describe('usePresetsManagement Hook 测试', () => {
  const mockOnApplyPreset = vi.fn().mockResolvedValue(undefined)
  const mockOnWarning = vi.fn()
  const mockOnError = vi.fn()
  const mockOnSuccess = vi.fn()

  const defaultProps = {
    onApplyPreset: mockOnApplyPreset,
    onWarning: mockOnWarning,
    onError: mockOnError,
    onSuccess: mockOnSuccess,
  }

  const mockPresets: ConfigPreset[] = [
    createMockConfigPreset({
      id: 'preset-1',
      name: '预设1',
      timestamp: Date.now(),
    }),
    createMockConfigPreset({
      id: 'preset-2',
      name: '预设2',
      timestamp: Date.now(),
    }),
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('初始状态', () => {
    it('应该初始化为默认状态', () => {
      const { result } = renderHook(() => usePresetsManagement(defaultProps))

      expect(result.current.presetsModalVisible).toBe(false)
      expect(result.current.addPresetModalVisible).toBe(false)
      expect(result.current.presetsList).toEqual([])
      expect(result.current.presetNameInput).toBe('')
    })
  })

  describe('handleOpenAddPreset', () => {
    it('应该打开添加预设对话框', () => {
      const { result } = renderHook(() => usePresetsManagement(defaultProps))

      act(() => {
        result.current.handleOpenAddPreset()
      })

      expect(result.current.addPresetModalVisible).toBe(true)
      expect(result.current.presetNameInput).toBe('')
    })

    it('应该在打开时清空输入框', () => {
      const { result } = renderHook(() => usePresetsManagement(defaultProps))

      act(() => {
        result.current.setPresetNameInput('旧名称')
      })

      expect(result.current.presetNameInput).toBe('旧名称')

      act(() => {
        result.current.handleOpenAddPreset()
      })

      expect(result.current.presetNameInput).toBe('')
    })
  })

  describe('handleAddPreset', () => {
    it('应该在名称为空时显示警告', async () => {
      const { result } = renderHook(() => usePresetsManagement(defaultProps))

      await act(async () => {
        await result.current.handleAddPreset()
      })

      expect(mockOnWarning).toHaveBeenCalledWith('请输入预设配置名称')
      expect(storage.addConfigPreset).not.toHaveBeenCalled()
    })

    it('应该在名称仅包含空格时显示警告', async () => {
      const { result } = renderHook(() => usePresetsManagement(defaultProps))

      act(() => {
        result.current.setPresetNameInput('   ')
      })

      await act(async () => {
        await result.current.handleAddPreset()
      })

      expect(mockOnWarning).toHaveBeenCalledWith('请输入预设配置名称')
    })

    it('应该在名称超过50字符时显示警告', async () => {
      const { result } = renderHook(() => usePresetsManagement(defaultProps))

      act(() => {
        result.current.setPresetNameInput('a'.repeat(51))
      })

      await act(async () => {
        await result.current.handleAddPreset()
      })

      expect(mockOnWarning).toHaveBeenCalledWith('预设配置名称不能超过50个字符')
    })

    it('应该在名称正好50字符时正常保存', async () => {
      const mockConfig = { theme: 'dark' } as any
      vi.mocked(storage.getAllData).mockResolvedValue(mockConfig)
      vi.mocked(storage.addConfigPreset).mockResolvedValue(undefined)

      const { result } = renderHook(() => usePresetsManagement(defaultProps))

      act(() => {
        result.current.setPresetNameInput('a'.repeat(50))
      })

      await act(async () => {
        await result.current.handleAddPreset()
      })

      expect(storage.addConfigPreset).toHaveBeenCalledWith('a'.repeat(50), mockConfig)
      expect(mockOnSuccess).toHaveBeenCalledWith('已保存为预设配置')
    })

    it('应该成功添加预设配置', async () => {
      const mockConfig = { theme: 'dark' } as any
      vi.mocked(storage.getAllData).mockResolvedValue(mockConfig)
      vi.mocked(storage.addConfigPreset).mockResolvedValue(undefined)

      const { result } = renderHook(() => usePresetsManagement(defaultProps))

      act(() => {
        result.current.setPresetNameInput('新预设')
      })

      await act(async () => {
        await result.current.handleAddPreset()
      })

      expect(storage.getAllData).toHaveBeenCalled()
      expect(storage.addConfigPreset).toHaveBeenCalledWith('新预设', mockConfig)
      expect(mockOnSuccess).toHaveBeenCalledWith('已保存为预设配置')
      expect(result.current.addPresetModalVisible).toBe(false)
      expect(result.current.presetNameInput).toBe('')
    })

    it('应该处理前后空格', async () => {
      const mockConfig = { theme: 'dark' } as any
      vi.mocked(storage.getAllData).mockResolvedValue(mockConfig)
      vi.mocked(storage.addConfigPreset).mockResolvedValue(undefined)

      const { result } = renderHook(() => usePresetsManagement(defaultProps))

      act(() => {
        result.current.setPresetNameInput('  预设名称  ')
      })

      await act(async () => {
        await result.current.handleAddPreset()
      })

      expect(storage.addConfigPreset).toHaveBeenCalledWith('预设名称', mockConfig)
    })

    it('应该处理添加失败的情况', async () => {
      const error = new Error('保存失败')
      vi.mocked(storage.getAllData).mockResolvedValue({} as any)
      vi.mocked(storage.addConfigPreset).mockRejectedValue(error)

      const { result } = renderHook(() => usePresetsManagement(defaultProps))

      act(() => {
        result.current.setPresetNameInput('预设')
      })

      await act(async () => {
        await result.current.handleAddPreset()
      })

      expect(mockOnError).toHaveBeenCalledWith('保存失败')
      expect(result.current.addPresetModalVisible).toBe(false)
    })

    it('应该处理非Error类型的错误', async () => {
      vi.mocked(storage.getAllData).mockResolvedValue({} as any)
      vi.mocked(storage.addConfigPreset).mockRejectedValue('字符串错误')

      const { result } = renderHook(() => usePresetsManagement(defaultProps))

      act(() => {
        result.current.setPresetNameInput('预设')
      })

      await act(async () => {
        await result.current.handleAddPreset()
      })

      expect(mockOnError).toHaveBeenCalledWith('添加预设配置失败')
    })
  })

  describe('handleOpenPresets', () => {
    it('应该加载预设配置列表并打开对话框', async () => {
      const mockMeta = mockPresets.map(({ id, name, timestamp }) => ({ id, name, timestamp }))
      vi.mocked(storage.getPresetsMeta).mockResolvedValue(mockMeta)

      const { result } = renderHook(() => usePresetsManagement(defaultProps))

      await act(async () => {
        await result.current.handleOpenPresets()
      })

      expect(storage.getPresetsMeta).toHaveBeenCalled()
      expect(result.current.presetsList).toEqual(mockMeta)
      expect(result.current.presetsModalVisible).toBe(true)
    })

    it('应该处理加载失败的情况', async () => {
      const error = new Error('加载失败')
      vi.mocked(storage.getPresetsMeta).mockRejectedValue(error)

      const { result } = renderHook(() => usePresetsManagement(defaultProps))

      await act(async () => {
        await result.current.handleOpenPresets()
      })

      expect(mockOnError).toHaveBeenCalledWith('加载预设配置列表失败')
      expect(result.current.presetsModalVisible).toBe(false)
    })

    it('应该处理空的预设列表', async () => {
      vi.mocked(storage.getPresetsMeta).mockResolvedValue([])

      const { result } = renderHook(() => usePresetsManagement(defaultProps))

      await act(async () => {
        await result.current.handleOpenPresets()
      })

      expect(result.current.presetsList).toEqual([])
      expect(result.current.presetsModalVisible).toBe(true)
    })
  })

  describe('handleApplyPreset', () => {
    it('应该调用onApplyPreset并关闭对话框', async () => {
      const mockMeta = {
        id: mockPresets[0].id,
        name: mockPresets[0].name,
        timestamp: mockPresets[0].timestamp,
      }
      vi.mocked(storage.getPresetConfig).mockResolvedValue(mockPresets[0].config)

      const { result } = renderHook(() => usePresetsManagement(defaultProps))

      await act(async () => {
        await result.current.handleApplyPreset(mockMeta)
      })

      await waitFor(() => {
        expect(mockOnApplyPreset).toHaveBeenCalledWith(mockPresets[0])
        expect(result.current.presetsModalVisible).toBe(false)
      })
    })
  })

  describe('handleDeletePreset', () => {
    it('应该成功删除预设配置并刷新列表', async () => {
      const updatedMeta = [
        { id: mockPresets[1].id, name: mockPresets[1].name, timestamp: mockPresets[1].timestamp },
      ]
      vi.mocked(storage.deleteConfigPreset).mockResolvedValue(undefined)
      vi.mocked(storage.getPresetsMeta).mockResolvedValue(updatedMeta)

      const { result } = renderHook(() => usePresetsManagement(defaultProps))

      await act(async () => {
        await result.current.handleDeletePreset('preset-1')
      })

      expect(storage.deleteConfigPreset).toHaveBeenCalledWith('preset-1')
      expect(storage.getPresetsMeta).toHaveBeenCalled()
      expect(result.current.presetsList).toEqual(updatedMeta)
      expect(mockOnSuccess).toHaveBeenCalledWith('预设配置已删除')
    })

    it('应该处理删除失败的情况', async () => {
      const error = new Error('删除失败')
      vi.mocked(storage.deleteConfigPreset).mockRejectedValue(error)

      const { result } = renderHook(() => usePresetsManagement(defaultProps))

      await act(async () => {
        await result.current.handleDeletePreset('preset-1')
      })

      expect(mockOnError).toHaveBeenCalledWith('删除预设配置失败')
    })
  })

  describe('关闭对话框', () => {
    it('应该关闭预设列表对话框', () => {
      const { result } = renderHook(() => usePresetsManagement(defaultProps))

      act(() => {
        result.current.handleOpenPresets()
      })

      act(() => {
        result.current.closePresetsModal()
      })

      expect(result.current.presetsModalVisible).toBe(false)
    })

    it('应该关闭添加预设对话框', () => {
      const { result } = renderHook(() => usePresetsManagement(defaultProps))

      act(() => {
        result.current.handleOpenAddPreset()
      })

      act(() => {
        result.current.closeAddPresetModal()
      })

      expect(result.current.addPresetModalVisible).toBe(false)
    })
  })

  describe('setPresetNameInput', () => {
    it('应该更新输入框的值', () => {
      const { result } = renderHook(() => usePresetsManagement(defaultProps))

      act(() => {
        result.current.setPresetNameInput('新名称')
      })

      expect(result.current.presetNameInput).toBe('新名称')
    })
  })

  describe('回调函数为undefined的情况', () => {
    it('应该在没有onWarning时不报错', async () => {
      const { result } = renderHook(() =>
        usePresetsManagement({
          onApplyPreset: mockOnApplyPreset,
        })
      )

      await act(async () => {
        await result.current.handleAddPreset()
      })

      expect(() => result.current.handleAddPreset()).not.toThrow()
    })

    it('应该在没有onError时不报错', async () => {
      vi.mocked(storage.getPresetsMeta).mockRejectedValue(new Error('错误'))

      const { result } = renderHook(() =>
        usePresetsManagement({
          onApplyPreset: mockOnApplyPreset,
        })
      )

      await act(async () => {
        await result.current.handleOpenPresets()
      })

      expect(() => result.current.handleOpenPresets()).not.toThrow()
    })

    it('应该在没有onSuccess时不报错', async () => {
      vi.mocked(storage.getAllData).mockResolvedValue({} as any)
      vi.mocked(storage.addConfigPreset).mockResolvedValue(undefined)

      const { result } = renderHook(() =>
        usePresetsManagement({
          onApplyPreset: mockOnApplyPreset,
        })
      )

      act(() => {
        result.current.setPresetNameInput('预设')
      })

      await act(async () => {
        await result.current.handleAddPreset()
      })

      expect(() => result.current.handleAddPreset()).not.toThrow()
    })
  })
})
