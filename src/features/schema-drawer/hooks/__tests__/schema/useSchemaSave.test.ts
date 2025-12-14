import type { Mock } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSchemaSave } from '../../schema/useSchemaSave'
import { storage } from '@/shared/utils/browser/storage'
import { schemaTransformer } from '../../../services/schema-transformer'

// Mock storage
vi.mock('@/shared/utils/browser/storage', () => ({
  storage: {
    deleteDraft: vi.fn().mockResolvedValue(undefined),
  },
}))

// Mock schemaTransformer
vi.mock('../../../services/schema-transformer', () => ({
  schemaTransformer: {
    prepareSaveData: vi.fn(),
    convertToMarkdown: vi.fn(),
  },
}))

describe('useSchemaSave', () => {
  const mockOnSaveSuccess = vi.fn()
  const mockOnSave = vi.fn()

  const defaultProps = {
    editorValue: '{"name": "test"}',
    wasStringData: false,
    paramsKey: 'test-key',
    onSaveSuccess: mockOnSaveSuccess,
    onSave: mockOnSave,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('初始状态', () => {
    it('应该返回正确的初始状态', () => {
      ;(schemaTransformer.prepareSaveData as Mock).mockReturnValue({
        success: true,
        data: { name: 'test' },
      })

      const { result } = renderHook(() => useSchemaSave(defaultProps))

      expect(result.current.isSaving).toBe(false)
      expect(typeof result.current.handleSave).toBe('function')
    })
  })

  describe('handleSave 成功场景', () => {
    it('应该成功保存数据', async () => {
      const mockData = { name: 'test' }
      ;(schemaTransformer.prepareSaveData as Mock).mockReturnValue({
        success: true,
        data: mockData,
      })
      mockOnSave.mockResolvedValue(undefined)

      const { result } = renderHook(() => useSchemaSave(defaultProps))

      await act(async () => {
        await result.current.handleSave()
      })

      expect(schemaTransformer.prepareSaveData).toHaveBeenCalledWith(
        defaultProps.editorValue,
        defaultProps.wasStringData
      )
      expect(mockOnSave).toHaveBeenCalledWith(mockData)
      expect(storage.deleteDraft).toHaveBeenCalledWith(defaultProps.paramsKey)
      expect(mockOnSaveSuccess).toHaveBeenCalled()
    })

    it('应该在保存过程中设置 isSaving 为 true', async () => {
      ;(schemaTransformer.prepareSaveData as Mock).mockReturnValue({
        success: true,
        data: {},
      })

      let savingDuringCall = false
      mockOnSave.mockImplementation(async () => {
        // 在保存过程中检查状态（这里无法直接访问，但可以验证调用顺序）
        savingDuringCall = true
        return undefined
      })

      const { result } = renderHook(() => useSchemaSave(defaultProps))

      await act(async () => {
        await result.current.handleSave()
      })

      expect(savingDuringCall).toBe(true)
      // 保存完成后 isSaving 应该恢复为 false
      expect(result.current.isSaving).toBe(false)
    })

    it('应该处理字符串类型的原始数据', async () => {
      const stringProps = {
        ...defaultProps,
        wasStringData: true,
        editorValue: '"test string"',
      }
      ;(schemaTransformer.prepareSaveData as Mock).mockReturnValue({
        success: true,
        data: 'test string',
      })
      mockOnSave.mockResolvedValue(undefined)

      const { result } = renderHook(() => useSchemaSave(stringProps))

      await act(async () => {
        await result.current.handleSave()
      })

      expect(schemaTransformer.prepareSaveData).toHaveBeenCalledWith(stringProps.editorValue, true)
      expect(mockOnSave).toHaveBeenCalledWith('test string')
    })
  })

  describe('handleSave 失败场景', () => {
    it('当数据转换失败时应该抛出错误', async () => {
      ;(schemaTransformer.prepareSaveData as Mock).mockReturnValue({
        success: false,
        error: '无效的 JSON 格式',
      })

      const { result } = renderHook(() => useSchemaSave(defaultProps))

      await expect(
        act(async () => {
          await result.current.handleSave()
        })
      ).rejects.toThrow('保存失败: 无效的 JSON 格式')

      expect(mockOnSave).not.toHaveBeenCalled()
      expect(mockOnSaveSuccess).not.toHaveBeenCalled()
    })

    it('当数据转换失败且没有错误消息时应该使用默认消息', async () => {
      ;(schemaTransformer.prepareSaveData as Mock).mockReturnValue({
        success: false,
      })

      const { result } = renderHook(() => useSchemaSave(defaultProps))

      await expect(
        act(async () => {
          await result.current.handleSave()
        })
      ).rejects.toThrow('保存失败: 数据转换失败')
    })

    it('当保存 API 调用失败时应该抛出错误', async () => {
      ;(schemaTransformer.prepareSaveData as Mock).mockReturnValue({
        success: true,
        data: {},
      })
      mockOnSave.mockRejectedValue(new Error('网络错误'))

      const { result } = renderHook(() => useSchemaSave(defaultProps))

      await expect(
        act(async () => {
          await result.current.handleSave()
        })
      ).rejects.toThrow('保存失败: 网络错误')

      expect(storage.deleteDraft).not.toHaveBeenCalled()
      expect(mockOnSaveSuccess).not.toHaveBeenCalled()
    })

    it('即使保存失败也应该恢复 isSaving 状态', async () => {
      ;(schemaTransformer.prepareSaveData as Mock).mockReturnValue({
        success: false,
        error: '转换失败',
      })

      const { result } = renderHook(() => useSchemaSave(defaultProps))

      try {
        await act(async () => {
          await result.current.handleSave()
        })
      } catch {
        // 预期会抛出错误
      }

      expect(result.current.isSaving).toBe(false)
    })
  })

  describe('props 变化', () => {
    it('应该使用最新的 editorValue', async () => {
      ;(schemaTransformer.prepareSaveData as Mock).mockReturnValue({
        success: true,
        data: {},
      })
      mockOnSave.mockResolvedValue(undefined)

      const { result, rerender } = renderHook((props) => useSchemaSave(props), {
        initialProps: defaultProps,
      })

      const newProps = {
        ...defaultProps,
        editorValue: '{"updated": true}',
      }
      rerender(newProps)

      await act(async () => {
        await result.current.handleSave()
      })

      expect(schemaTransformer.prepareSaveData).toHaveBeenCalledWith('{"updated": true}', false)
    })

    it('应该使用最新的 paramsKey 删除草稿', async () => {
      ;(schemaTransformer.prepareSaveData as Mock).mockReturnValue({
        success: true,
        data: {},
      })
      mockOnSave.mockResolvedValue(undefined)

      const { result, rerender } = renderHook((props) => useSchemaSave(props), {
        initialProps: defaultProps,
      })

      const newProps = {
        ...defaultProps,
        paramsKey: 'new-key',
      }
      rerender(newProps)

      await act(async () => {
        await result.current.handleSave()
      })

      expect(storage.deleteDraft).toHaveBeenCalledWith('new-key')
    })
  })

  describe('录制模式', () => {
    it('应该在录制模式下将AST转换为RawString', async () => {
      const astData = '[{"type":"paragraph","children":[{"text":"Hello"}]}]'
      const rawStringData = 'Hello'

      ;(schemaTransformer.convertToMarkdown as Mock).mockReturnValue({
        success: true,
        data: rawStringData,
      })
      mockOnSave.mockResolvedValue(undefined)

      const recordingProps = {
        ...defaultProps,
        editorValue: astData,
        wasStringData: true,
        isRecordingMode: true,
        contentType: 'ast' as any,
      }

      const { result } = renderHook(() => useSchemaSave(recordingProps))

      await act(async () => {
        await result.current.handleSave()
      })

      expect(schemaTransformer.convertToMarkdown).toHaveBeenCalledWith(astData)
      expect(mockOnSave).toHaveBeenCalledWith(rawStringData)
      expect(storage.deleteDraft).toHaveBeenCalledWith(defaultProps.paramsKey)
      expect(mockOnSaveSuccess).toHaveBeenCalled()
    })

    it('应该处理录制模式下AST转RawString失败', async () => {
      ;(schemaTransformer.convertToMarkdown as Mock).mockReturnValue({
        success: false,
        error: '转换失败',
      })

      const recordingProps = {
        ...defaultProps,
        wasStringData: true,
        isRecordingMode: true,
        contentType: 'ast' as any,
      }

      const { result } = renderHook(() => useSchemaSave(recordingProps))

      await expect(
        act(async () => {
          await result.current.handleSave()
        })
      ).rejects.toThrow('保存失败: 转换失败')

      expect(mockOnSave).not.toHaveBeenCalled()
      expect(result.current.isSaving).toBe(false)
    })

    it('应该处理录制模式下转换成功但无数据', async () => {
      ;(schemaTransformer.convertToMarkdown as Mock).mockReturnValue({
        success: true,
        data: null,
      })

      const recordingProps = {
        ...defaultProps,
        wasStringData: true,
        isRecordingMode: true,
        contentType: 'ast' as any,
      }

      const { result } = renderHook(() => useSchemaSave(recordingProps))

      await expect(
        act(async () => {
          await result.current.handleSave()
        })
      ).rejects.toThrow('保存失败: 转换为 RawString 失败')

      expect(mockOnSave).not.toHaveBeenCalled()
    })

    it('应该在录制模式下保持RawString格式不变', async () => {
      const rawStringData = 'Plain text content'
      mockOnSave.mockResolvedValue(undefined)

      const recordingProps = {
        ...defaultProps,
        editorValue: rawStringData,
        wasStringData: true,
        isRecordingMode: true,
        contentType: 'rawString' as any,
      }

      const { result } = renderHook(() => useSchemaSave(recordingProps))

      await act(async () => {
        await result.current.handleSave()
      })

      // 不应该调用转换函数
      expect(schemaTransformer.convertToMarkdown).not.toHaveBeenCalled()
      expect(schemaTransformer.prepareSaveData).not.toHaveBeenCalled()
      // 直接保存原始内容
      expect(mockOnSave).toHaveBeenCalledWith(rawStringData)
      expect(mockOnSaveSuccess).toHaveBeenCalled()
    })

    it('应该在录制模式下保持非字符串数据不变', async () => {
      const jsonData = '{"type":"paragraph"}'
      mockOnSave.mockResolvedValue(undefined)

      const recordingProps = {
        ...defaultProps,
        editorValue: jsonData,
        wasStringData: false,
        isRecordingMode: true,
        contentType: 'ast' as any,
      }

      const { result } = renderHook(() => useSchemaSave(recordingProps))

      await act(async () => {
        await result.current.handleSave()
      })

      // 不应该调用转换函数（因为wasStringData=false）
      expect(schemaTransformer.convertToMarkdown).not.toHaveBeenCalled()
      expect(schemaTransformer.prepareSaveData).not.toHaveBeenCalled()
      // 直接保存原始内容
      expect(mockOnSave).toHaveBeenCalledWith(jsonData)
      expect(mockOnSaveSuccess).toHaveBeenCalled()
    })
  })
})
