import { renderHook, act } from '@testing-library/react'
import type { Mock } from 'vitest'
import { useJsonRepair } from '../../editor/useJsonRepair'
import { FULL_SCREEN_MODE } from '@/shared/constants/ui-modes'
import { schemaTransformer } from '../../../services/schema-transformer'
import { getJsonError, repairJson } from '../../../utils/json-repair'
import type { CodeMirrorEditorHandle } from '../../../components/editor/CodeMirrorEditor'

/**
 * Mock 依赖
 */
vi.mock('../../../services/schema-transformer', () => ({
  schemaTransformer: {
    unescapeJson: vi.fn(),
  },
}))

vi.mock('../../../utils/json-repair', () => ({
  getJsonError: vi.fn(),
  repairJson: vi.fn(),
}))

describe('useJsonRepair', () => {
  const mockEditorRef = {
    current: {
      showErrorWidget: vi.fn(),
      hideErrorWidget: vi.fn(),
      getValue: vi.fn(),
      setValue: vi.fn(),
      focus: vi.fn(),
      goToPosition: vi.fn(),
    } as CodeMirrorEditorHandle,
  }

  const defaultProps = {
    editorValue: '{"name": "test"}',
    editorRef: mockEditorRef,
    getContentToAnalyze: vi.fn((content: string) => ({
      content,
      isInnerContent: false,
    })),
    updateEditorContent: vi.fn(),
    switchFullScreenMode: vi.fn(),
    showLightNotification: vi.fn(),
    showError: vi.fn(),
    showWarning: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('初始状态', () => {
    it('应该返回正确的初始状态', () => {
      const { result } = renderHook(() => useJsonRepair(defaultProps))

      expect(result.current.repairOriginalValue).toBe('')
      expect(result.current.pendingRepairedValue).toBe('')
      expect(typeof result.current.handleLocateError).toBe('function')
      expect(typeof result.current.handleRepairJson).toBe('function')
      expect(typeof result.current.handleApplyRepair).toBe('function')
      expect(typeof result.current.handleCancelRepair).toBe('function')
      expect(typeof result.current.handleBackToEditor).toBe('function')
    })
  })

  describe('handleLocateError - 定位错误', () => {
    it('应该在JSON有错误时显示错误提示', () => {
      const mockError = {
        line: 1,
        column: 10,
        message: 'Unexpected token',
        shortMessage: 'Unexpected token',
        codeFrame: '> 1 | {"name": "test"',
      }
      ;(getJsonError as Mock).mockReturnValue(mockError)

      const { result } = renderHook(() => useJsonRepair(defaultProps))

      act(() => {
        result.current.handleLocateError()
      })

      expect(defaultProps.getContentToAnalyze).toHaveBeenCalledWith(defaultProps.editorValue)
      expect(getJsonError).toHaveBeenCalledWith(defaultProps.editorValue)
      expect(mockEditorRef.current?.showErrorWidget).toHaveBeenCalledWith(
        1,
        10,
        'JSON 语法错误：Unexpected token'
      )
    })

    it('应该在JSON正确时显示成功提示', () => {
      ;(getJsonError as Mock).mockReturnValue(null)

      const { result } = renderHook(() => useJsonRepair(defaultProps))

      act(() => {
        result.current.handleLocateError()
      })

      expect(defaultProps.showLightNotification).toHaveBeenCalledWith('JSON 格式正确，无语法错误')
    })

    it('应该处理字符串内部的JSON错误（isInnerContent=true）', () => {
      const propsWithInnerContent = {
        ...defaultProps,
        getContentToAnalyze: vi.fn(() => ({
          content: '{"name": "test"',
          isInnerContent: true,
        })),
      }

      const mockError = {
        line: 1,
        column: 16,
        message: 'Unexpected end of JSON',
        shortMessage: 'Unexpected end of JSON',
        codeFrame: '> 1 | {"name": "test"',
      }
      ;(getJsonError as Mock).mockReturnValue(mockError)
      ;(schemaTransformer.unescapeJson as Mock).mockReturnValue({
        success: true,
        data: '{"name": "test"}',
      })

      const { result } = renderHook(() => useJsonRepair(propsWithInnerContent))

      act(() => {
        result.current.handleLocateError()
      })

      expect(schemaTransformer.unescapeJson).toHaveBeenCalled()
      expect(propsWithInnerContent.updateEditorContent).toHaveBeenCalledWith('{"name": "test"}', {
        markModified: true,
      })
    })

    it('应该在去转义失败时显示警告', () => {
      const propsWithInnerContent = {
        ...defaultProps,
        getContentToAnalyze: vi.fn(() => ({
          content: '{"name": "test"',
          isInnerContent: true,
        })),
      }

      const mockError = {
        line: 1,
        column: 16,
        message: 'Unexpected end of JSON',
        shortMessage: 'Unexpected end of JSON',
        codeFrame: '> 1 | {"name": "test"',
      }
      ;(getJsonError as Mock).mockReturnValue(mockError)
      ;(schemaTransformer.unescapeJson as Mock).mockReturnValue({
        success: false,
        error: '去转义失败',
      })

      const { result } = renderHook(() => useJsonRepair(propsWithInnerContent))

      act(() => {
        result.current.handleLocateError()
      })

      expect(defaultProps.showWarning).toHaveBeenCalledWith(
        expect.stringContaining('字符串内部的 JSON 有错误')
      )
    })
  })

  describe('handleRepairJson - 修复JSON', () => {
    it('应该成功修复JSON并进入Diff模式', () => {
      const invalidJson = '{"name": "test",}'
      const repairedJson = '{\n  "name": "test"\n}'
      const props = {
        ...defaultProps,
        editorValue: invalidJson,
      }

      ;(repairJson as Mock).mockReturnValue({
        success: true,
        repaired: repairedJson,
      })

      const { result } = renderHook(() => useJsonRepair(props))

      act(() => {
        result.current.handleRepairJson()
      })

      expect(repairJson).toHaveBeenCalledWith(invalidJson)
      expect(result.current.repairOriginalValue).toBe(invalidJson)
      expect(result.current.pendingRepairedValue).toBe(repairedJson)
      expect(defaultProps.switchFullScreenMode).toHaveBeenCalledWith(FULL_SCREEN_MODE.DIFF)
      expect(defaultProps.showLightNotification).toHaveBeenCalledWith('JSON 已修复，请确认是否应用')
    })

    it('应该处理字符串内部JSON的修复（isInnerContent=true）', () => {
      const invalidJson = '"{\\"name\\": \\"test\\",}"'
      const repairedJson = '{\n  "name": "test"\n}'
      const props = {
        ...defaultProps,
        editorValue: invalidJson,
        getContentToAnalyze: vi.fn(() => ({
          content: '{"name": "test",}',
          isInnerContent: true,
        })),
      }

      ;(repairJson as Mock).mockReturnValue({
        success: true,
        repaired: repairedJson,
      })

      const { result } = renderHook(() => useJsonRepair(props))

      act(() => {
        result.current.handleRepairJson()
      })

      // 对于isInnerContent，修复后的内容应该被JSON.stringify包装
      expect(result.current.pendingRepairedValue).toBe(JSON.stringify(repairedJson))
      expect(defaultProps.showLightNotification).toHaveBeenCalledWith(
        '字符串内部的 JSON 已修复，请确认是否应用'
      )
    })

    it('应该在JSON已经正确时显示无需修复提示', () => {
      const validJson = '{"name": "test"}'
      const props = {
        ...defaultProps,
        editorValue: validJson,
      }

      ;(repairJson as Mock).mockReturnValue({
        success: false,
        repaired: null,
        error: 'Already valid JSON',
      })

      const { result } = renderHook(() => useJsonRepair(props))

      act(() => {
        result.current.handleRepairJson()
      })

      expect(defaultProps.showLightNotification).toHaveBeenCalledWith('JSON 格式正确，无需修复')
    })

    it('应该在无法修复时显示错误提示', () => {
      const invalidJson = 'not a json at all'
      const props = {
        ...defaultProps,
        editorValue: invalidJson,
      }

      ;(repairJson as Mock).mockReturnValue({
        success: false,
        repaired: null,
        error: 'Cannot repair',
      })

      // Mock JSON.parse也失败
      vi.spyOn(JSON, 'parse').mockImplementation(() => {
        throw new Error('Invalid JSON')
      })

      const { result } = renderHook(() => useJsonRepair(props))

      act(() => {
        result.current.handleRepairJson()
      })

      expect(defaultProps.showError).toHaveBeenCalledWith('Cannot repair')

      vi.restoreAllMocks()
    })
  })

  describe('handleApplyRepair - 应用修复', () => {
    it('应该应用修复并更新编辑器内容', () => {
      const repairedJson = '{\n  "name": "test"\n}'
      ;(repairJson as Mock).mockReturnValue({
        success: true,
        repaired: repairedJson,
      })

      const { result } = renderHook(() => useJsonRepair(defaultProps))

      // 先触发修复
      act(() => {
        result.current.handleRepairJson()
      })

      // 应用修复
      act(() => {
        result.current.handleApplyRepair()
      })

      expect(defaultProps.updateEditorContent).toHaveBeenCalledWith(repairedJson, {
        markModified: true,
      })
      expect(defaultProps.showLightNotification).toHaveBeenCalledWith('已应用修复')
      expect(defaultProps.switchFullScreenMode).toHaveBeenCalledWith(FULL_SCREEN_MODE.NONE)
      expect(result.current.pendingRepairedValue).toBe('')
      expect(result.current.repairOriginalValue).toBe('')
    })

    it('应该在没有待修复内容时不执行更新', () => {
      const { result } = renderHook(() => useJsonRepair(defaultProps))

      act(() => {
        result.current.handleApplyRepair()
      })

      expect(defaultProps.updateEditorContent).not.toHaveBeenCalled()
      expect(defaultProps.switchFullScreenMode).toHaveBeenCalledWith(FULL_SCREEN_MODE.NONE)
    })
  })

  describe('handleCancelRepair - 取消修复', () => {
    it('应该取消修复并清除状态', () => {
      const repairedJson = '{\n  "name": "test"\n}'
      ;(repairJson as Mock).mockReturnValue({
        success: true,
        repaired: repairedJson,
      })

      const { result } = renderHook(() => useJsonRepair(defaultProps))

      // 先触发修复
      act(() => {
        result.current.handleRepairJson()
      })

      expect(result.current.pendingRepairedValue).toBe(repairedJson)

      // 取消修复
      act(() => {
        result.current.handleCancelRepair()
      })

      expect(result.current.pendingRepairedValue).toBe('')
      expect(result.current.repairOriginalValue).toBe('')
      expect(defaultProps.switchFullScreenMode).toHaveBeenCalledWith(FULL_SCREEN_MODE.NONE)
      expect(defaultProps.showLightNotification).toHaveBeenCalledWith('已取消修复')
    })
  })

  describe('handleBackToEditor - 返回编辑模式', () => {
    it('应该退出Diff模式并清除修复原始值', () => {
      const { result } = renderHook(() => useJsonRepair(defaultProps))

      act(() => {
        result.current.handleBackToEditor()
      })

      expect(defaultProps.switchFullScreenMode).toHaveBeenCalledWith(FULL_SCREEN_MODE.NONE)
      expect(result.current.repairOriginalValue).toBe('')
    })
  })

  describe('边界情况', () => {
    it('应该处理空字符串输入', () => {
      const props = {
        ...defaultProps,
        editorValue: '',
      }
      ;(getJsonError as Mock).mockReturnValue({
        line: 1,
        column: 1,
        message: 'Unexpected end of JSON input',
        shortMessage: 'Unexpected end of JSON input',
        codeFrame: '> 1 | ',
      })

      const { result } = renderHook(() => useJsonRepair(props))

      act(() => {
        result.current.handleLocateError()
      })

      expect(mockEditorRef.current?.showErrorWidget).toHaveBeenCalled()
    })

    it('应该处理嵌套很深的JSON结构', () => {
      const deepJson = '{"a":{"b":{"c":{"d":"value"}}}}'
      const props = {
        ...defaultProps,
        editorValue: deepJson,
      }
      ;(getJsonError as Mock).mockReturnValue(null)

      const { result } = renderHook(() => useJsonRepair(props))

      act(() => {
        result.current.handleLocateError()
      })

      expect(defaultProps.showLightNotification).toHaveBeenCalledWith('JSON 格式正确，无语法错误')
    })

    it('应该处理包含特殊字符的JSON', () => {
      const jsonWithSpecialChars = '{"text":"Hello\\nWorld\\t!"}'
      const props = {
        ...defaultProps,
        editorValue: jsonWithSpecialChars,
      }
      ;(getJsonError as Mock).mockReturnValue(null)

      const { result } = renderHook(() => useJsonRepair(props))

      act(() => {
        result.current.handleLocateError()
      })

      expect(defaultProps.showLightNotification).toHaveBeenCalledWith('JSON 格式正确，无语法错误')
    })

    it('应该处理连续多次修复操作', () => {
      const repairedJson1 = '{\n  "name": "test1"\n}'
      const repairedJson2 = '{\n  "name": "test2"\n}'

      ;(repairJson as Mock)
        .mockReturnValueOnce({
          success: true,
          repaired: repairedJson1,
        })
        .mockReturnValueOnce({
          success: true,
          repaired: repairedJson2,
        })

      const { result } = renderHook(() => useJsonRepair(defaultProps))

      // 第一次修复
      act(() => {
        result.current.handleRepairJson()
      })
      expect(result.current.pendingRepairedValue).toBe(repairedJson1)

      // 取消
      act(() => {
        result.current.handleCancelRepair()
      })
      expect(result.current.pendingRepairedValue).toBe('')

      // 第二次修复
      act(() => {
        result.current.handleRepairJson()
      })
      expect(result.current.pendingRepairedValue).toBe(repairedJson2)
    })
  })
})
