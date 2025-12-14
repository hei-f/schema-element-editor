/**
 * useToolbarActions Hook 测试
 * 测试工具栏操作功能
 */

import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { useToolbarActions } from '../../editor/useToolbarActions'
import { schemaTransformer } from '../../../services/schema-transformer'
import { ContentType } from '@/shared/types'

// Mock schema-transformer
vi.mock('../../../services/schema-transformer', () => ({
  schemaTransformer: {
    formatJson: vi.fn(),
    escapeJson: vi.fn(),
    unescapeJson: vi.fn(),
    compactJson: vi.fn(),
    parseNestedJson: vi.fn(),
    convertToAST: vi.fn(),
    convertToMarkdown: vi.fn(),
  },
}))

describe('useToolbarActions', () => {
  const mockUpdateEditorContent = vi.fn()
  const mockShowLightNotification = vi.fn()
  const mockShowError = vi.fn()
  const mockShowWarning = vi.fn()

  const defaultProps = {
    editorValue: '{"type": "paragraph"}',
    updateEditorContent: mockUpdateEditorContent,
    showLightNotification: mockShowLightNotification,
    showError: mockShowError,
    showWarning: mockShowWarning,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('handleFormat', () => {
    it('应该成功格式化JSON', () => {
      const formattedJson = '{\n  "type": "paragraph"\n}'
      ;(schemaTransformer.formatJson as Mock).mockReturnValue({
        success: true,
        data: formattedJson,
      })

      const { result } = renderHook(() => useToolbarActions(defaultProps))

      act(() => {
        result.current.handleFormat()
      })

      expect(schemaTransformer.formatJson).toHaveBeenCalledWith(defaultProps.editorValue)
      expect(mockUpdateEditorContent).toHaveBeenCalledWith(formattedJson, { detectType: false })
      expect(mockShowLightNotification).toHaveBeenCalledWith('格式化成功')
    })

    it('应该处理格式化失败', () => {
      ;(schemaTransformer.formatJson as Mock).mockReturnValue({
        success: false,
        error: 'Invalid JSON',
      })

      const { result } = renderHook(() => useToolbarActions(defaultProps))

      act(() => {
        result.current.handleFormat()
      })

      expect(mockUpdateEditorContent).not.toHaveBeenCalled()
      expect(mockShowError).toHaveBeenCalledWith('格式化失败: Invalid JSON')
    })

    it('应该处理格式化成功但无数据', () => {
      ;(schemaTransformer.formatJson as Mock).mockReturnValue({
        success: true,
        data: null,
      })

      const { result } = renderHook(() => useToolbarActions(defaultProps))

      act(() => {
        result.current.handleFormat()
      })

      expect(mockUpdateEditorContent).not.toHaveBeenCalled()
      expect(mockShowLightNotification).not.toHaveBeenCalled()
    })
  })

  describe('handleEscape', () => {
    it('应该成功转义JSON', () => {
      const escapedJson = '"{\\"type\\": \\"paragraph\\"}"'
      ;(schemaTransformer.escapeJson as Mock).mockReturnValue({
        success: true,
        data: escapedJson,
      })

      const { result } = renderHook(() => useToolbarActions(defaultProps))

      act(() => {
        result.current.handleEscape()
      })

      expect(schemaTransformer.escapeJson).toHaveBeenCalledWith(defaultProps.editorValue)
      expect(mockUpdateEditorContent).toHaveBeenCalledWith(escapedJson, { markModified: true })
      expect(mockShowLightNotification).toHaveBeenCalledWith('转义成功')
    })

    it('应该处理转义失败', () => {
      ;(schemaTransformer.escapeJson as Mock).mockReturnValue({
        success: false,
        error: 'Escape failed',
      })

      const { result } = renderHook(() => useToolbarActions(defaultProps))

      act(() => {
        result.current.handleEscape()
      })

      expect(mockUpdateEditorContent).not.toHaveBeenCalled()
      expect(mockShowError).toHaveBeenCalledWith('Escape failed')
    })

    it('应该处理转义失败且无错误信息', () => {
      ;(schemaTransformer.escapeJson as Mock).mockReturnValue({
        success: false,
      })

      const { result } = renderHook(() => useToolbarActions(defaultProps))

      act(() => {
        result.current.handleEscape()
      })

      expect(mockShowError).toHaveBeenCalledWith('转义失败')
    })
  })

  describe('handleUnescape', () => {
    it('应该成功去转义JSON', () => {
      const unescapedJson = '{"type": "paragraph"}'
      ;(schemaTransformer.unescapeJson as Mock).mockReturnValue({
        success: true,
        data: unescapedJson,
      })

      const { result } = renderHook(() => useToolbarActions(defaultProps))

      act(() => {
        result.current.handleUnescape()
      })

      expect(schemaTransformer.unescapeJson).toHaveBeenCalledWith(defaultProps.editorValue)
      expect(mockUpdateEditorContent).toHaveBeenCalledWith(unescapedJson, { markModified: true })
      expect(mockShowLightNotification).toHaveBeenCalledWith('去转义成功')
    })

    it('应该处理去转义失败', () => {
      ;(schemaTransformer.unescapeJson as Mock).mockReturnValue({
        success: false,
        error: 'Unescape failed',
      })

      const { result } = renderHook(() => useToolbarActions(defaultProps))

      act(() => {
        result.current.handleUnescape()
      })

      expect(mockUpdateEditorContent).not.toHaveBeenCalled()
      expect(mockShowError).toHaveBeenCalledWith('Unescape failed')
    })

    it('应该处理去转义失败且无错误信息', () => {
      ;(schemaTransformer.unescapeJson as Mock).mockReturnValue({
        success: false,
      })

      const { result } = renderHook(() => useToolbarActions(defaultProps))

      act(() => {
        result.current.handleUnescape()
      })

      expect(mockShowError).toHaveBeenCalledWith('去转义失败')
    })
  })

  describe('handleCompact', () => {
    it('应该成功压缩JSON', () => {
      const compactJson = '{"type":"paragraph"}'
      ;(schemaTransformer.compactJson as Mock).mockReturnValue({
        success: true,
        data: compactJson,
      })

      const { result } = renderHook(() => useToolbarActions(defaultProps))

      act(() => {
        result.current.handleCompact()
      })

      expect(schemaTransformer.compactJson).toHaveBeenCalledWith(defaultProps.editorValue)
      expect(mockUpdateEditorContent).toHaveBeenCalledWith(compactJson, { markModified: true })
      expect(mockShowLightNotification).toHaveBeenCalledWith('压缩成功')
    })

    it('应该处理压缩失败', () => {
      ;(schemaTransformer.compactJson as Mock).mockReturnValue({
        success: false,
        error: 'Compact failed',
      })

      const { result } = renderHook(() => useToolbarActions(defaultProps))

      act(() => {
        result.current.handleCompact()
      })

      expect(mockUpdateEditorContent).not.toHaveBeenCalled()
      expect(mockShowError).toHaveBeenCalledWith('Compact failed')
    })

    it('应该处理压缩失败且无错误信息', () => {
      ;(schemaTransformer.compactJson as Mock).mockReturnValue({
        success: false,
      })

      const { result } = renderHook(() => useToolbarActions(defaultProps))

      act(() => {
        result.current.handleCompact()
      })

      expect(mockShowError).toHaveBeenCalledWith('压缩失败')
    })
  })

  describe('handleParse', () => {
    it('应该成功解析嵌套JSON（无parseCount）', () => {
      const parsedJson = '{"type": "paragraph"}'
      ;(schemaTransformer.parseNestedJson as Mock).mockReturnValue({
        success: true,
        data: parsedJson,
      })

      const { result } = renderHook(() => useToolbarActions(defaultProps))

      act(() => {
        result.current.handleParse()
      })

      expect(schemaTransformer.parseNestedJson).toHaveBeenCalledWith(defaultProps.editorValue)
      expect(mockUpdateEditorContent).toHaveBeenCalledWith(parsedJson, { markModified: true })
      expect(mockShowLightNotification).toHaveBeenCalledWith('解析成功')
    })

    it('应该成功解析嵌套JSON（带parseCount）', () => {
      const parsedJson = '{"type": "paragraph"}'
      ;(schemaTransformer.parseNestedJson as Mock).mockReturnValue({
        success: true,
        data: parsedJson,
        parseCount: 2,
      })

      const { result } = renderHook(() => useToolbarActions(defaultProps))

      act(() => {
        result.current.handleParse()
      })

      expect(mockUpdateEditorContent).toHaveBeenCalledWith(parsedJson, { markModified: true })
      expect(mockShowLightNotification).toHaveBeenCalledWith('解析成功（解析层数: 2）')
    })

    it('应该处理部分解析成功（带警告）', () => {
      const parsedJson = '{"type": "paragraph"}'
      ;(schemaTransformer.parseNestedJson as Mock).mockReturnValue({
        success: true,
        data: parsedJson,
        error: '部分内容无法解析',
        parseCount: 1,
      })

      const { result } = renderHook(() => useToolbarActions(defaultProps))

      act(() => {
        result.current.handleParse()
      })

      expect(mockUpdateEditorContent).toHaveBeenCalledWith(parsedJson, { markModified: true })
      expect(mockShowWarning).toHaveBeenCalledWith('部分内容无法解析，已显示当前解析结果')
    })

    it('应该处理解析失败', () => {
      ;(schemaTransformer.parseNestedJson as Mock).mockReturnValue({
        success: false,
        error: 'Parse failed',
      })

      const { result } = renderHook(() => useToolbarActions(defaultProps))

      act(() => {
        result.current.handleParse()
      })

      expect(mockUpdateEditorContent).not.toHaveBeenCalled()
      expect(mockShowError).toHaveBeenCalledWith('Parse failed')
    })

    it('应该处理解析失败且无错误信息', () => {
      ;(schemaTransformer.parseNestedJson as Mock).mockReturnValue({
        success: false,
      })

      const { result } = renderHook(() => useToolbarActions(defaultProps))

      act(() => {
        result.current.handleParse()
      })

      expect(mockShowError).toHaveBeenCalledWith('解析失败')
    })

    it('应该处理parseCount为0的情况', () => {
      const parsedJson = '{"type": "paragraph"}'
      ;(schemaTransformer.parseNestedJson as Mock).mockReturnValue({
        success: true,
        data: parsedJson,
        parseCount: 0,
      })

      const { result } = renderHook(() => useToolbarActions(defaultProps))

      act(() => {
        result.current.handleParse()
      })

      expect(mockShowLightNotification).toHaveBeenCalledWith('解析成功')
    })
  })

  describe('handleSegmentChange', () => {
    it('应该处理切换到AST类型', () => {
      const astData = '[{"type":"paragraph","children":[{"text":""}]}]'
      ;(schemaTransformer.convertToAST as Mock).mockReturnValue({
        success: true,
        data: astData,
      })

      const { result } = renderHook(() => useToolbarActions(defaultProps))

      act(() => {
        result.current.handleSegmentChange(ContentType.Ast)
      })

      expect(schemaTransformer.convertToAST).toHaveBeenCalledWith(defaultProps.editorValue)
      expect(mockUpdateEditorContent).toHaveBeenCalledWith(astData, { markModified: true })
      expect(mockShowLightNotification).toHaveBeenCalledWith('转换为AST成功')
    })

    it('应该处理切换到RawString类型', () => {
      const markdownData = 'This is a paragraph'
      ;(schemaTransformer.convertToMarkdown as Mock).mockReturnValue({
        success: true,
        data: markdownData,
      })

      const { result } = renderHook(() => useToolbarActions(defaultProps))

      act(() => {
        result.current.handleSegmentChange(ContentType.RawString)
      })

      expect(schemaTransformer.convertToMarkdown).toHaveBeenCalledWith(defaultProps.editorValue)
      expect(mockUpdateEditorContent).toHaveBeenCalledWith(markdownData, { markModified: true })
      expect(mockShowLightNotification).toHaveBeenCalledWith('转换为RawString成功')
    })

    it('应该处理转换到AST失败', () => {
      ;(schemaTransformer.convertToAST as Mock).mockReturnValue({
        success: false,
        error: 'Invalid format',
      })

      const { result } = renderHook(() => useToolbarActions(defaultProps))

      act(() => {
        result.current.handleSegmentChange(ContentType.Ast)
      })

      expect(mockUpdateEditorContent).not.toHaveBeenCalled()
      expect(mockShowError).toHaveBeenCalledWith('转换失败：Invalid format')
    })

    it('应该处理转换到Markdown失败', () => {
      ;(schemaTransformer.convertToMarkdown as Mock).mockReturnValue({
        success: false,
        error: 'Invalid AST',
      })

      const { result } = renderHook(() => useToolbarActions(defaultProps))

      act(() => {
        result.current.handleSegmentChange(ContentType.RawString)
      })

      expect(mockUpdateEditorContent).not.toHaveBeenCalled()
      expect(mockShowError).toHaveBeenCalledWith('转换失败：Invalid AST')
    })

    it('应该忽略其他类型的切换', () => {
      const { result } = renderHook(() => useToolbarActions(defaultProps))

      act(() => {
        result.current.handleSegmentChange('other-type')
      })

      expect(schemaTransformer.convertToAST).not.toHaveBeenCalled()
      expect(schemaTransformer.convertToMarkdown).not.toHaveBeenCalled()
      expect(mockUpdateEditorContent).not.toHaveBeenCalled()
    })
  })

  describe('Hook重新渲染', () => {
    it('应该在props变化时更新回调', () => {
      const { result, rerender } = renderHook((props) => useToolbarActions(props), {
        initialProps: defaultProps,
      })

      const firstFormatFn = result.current.handleFormat

      const newEditorValue = '{"type": "heading"}'
      rerender({
        ...defaultProps,
        editorValue: newEditorValue,
      })

      const secondFormatFn = result.current.handleFormat

      // 回调函数应该是新的引用（因为依赖改变了）
      expect(firstFormatFn).not.toBe(secondFormatFn)

      // 验证新回调使用新的editorValue
      ;(schemaTransformer.formatJson as Mock).mockReturnValue({
        success: true,
        data: '{\n  "type": "heading"\n}',
      })

      act(() => {
        secondFormatFn()
      })

      expect(schemaTransformer.formatJson).toHaveBeenCalledWith(newEditorValue)
    })
  })

  describe('边界情况', () => {
    it('应该处理空字符串editorValue', () => {
      ;(schemaTransformer.formatJson as Mock).mockReturnValue({
        success: false,
        error: 'Empty content',
      })

      const { result } = renderHook(() =>
        useToolbarActions({
          ...defaultProps,
          editorValue: '',
        })
      )

      act(() => {
        result.current.handleFormat()
      })

      expect(schemaTransformer.formatJson).toHaveBeenCalledWith('')
      expect(mockUpdateEditorContent).not.toHaveBeenCalled()
      expect(mockShowError).toHaveBeenCalledWith('格式化失败: Empty content')
    })

    it('应该处理极长的JSON字符串', () => {
      const longJson = '{"data":"' + 'x'.repeat(10000) + '"}'
      ;(schemaTransformer.compactJson as Mock).mockReturnValue({
        success: true,
        data: longJson,
      })

      const { result } = renderHook(() =>
        useToolbarActions({
          ...defaultProps,
          editorValue: longJson,
        })
      )

      act(() => {
        result.current.handleCompact()
      })

      expect(schemaTransformer.compactJson).toHaveBeenCalledWith(longJson)
    })

    it('应该处理包含特殊字符的JSON', () => {
      const specialJson = '{"text":"\\n\\t\\r"}'
      ;(schemaTransformer.escapeJson as Mock).mockReturnValue({
        success: true,
        data: '"{\\"text\\":\\"\\\\n\\\\t\\\\r\\"}"',
      })

      const { result } = renderHook(() =>
        useToolbarActions({
          ...defaultProps,
          editorValue: specialJson,
        })
      )

      act(() => {
        result.current.handleEscape()
      })

      expect(schemaTransformer.escapeJson).toHaveBeenCalledWith(specialJson)
    })
  })
})
