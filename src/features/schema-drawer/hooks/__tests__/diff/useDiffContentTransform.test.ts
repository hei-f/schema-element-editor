import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDiffContentTransform } from '../../diff/useDiffContentTransform'
import { ContentType } from '@/shared/types'
import { schemaTransformer } from '../../../services/schema-transformer'

// Mock schemaTransformer
vi.mock('../../../services/schema-transformer', () => ({
  schemaTransformer: {
    convertToAST: vi.fn(),
    convertToMarkdown: vi.fn(),
  },
}))

// Mock content-transformer
vi.mock('../../../utils/content-transformer', () => ({
  formatContent: vi.fn((content: string) => `formatted:${content}`),
  unescapeContent: vi.fn((content: string) => `unescaped:${content}`),
  compactContent: vi.fn((content: string) => `compacted:${content}`),
  parseContent: vi.fn((content: string) => `parsed:${content}`),
}))

describe('useDiffContentTransform', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('初始化', () => {
    it('isDiffMode 为 false 时不应该初始化内容', () => {
      const { result } = renderHook(() =>
        useDiffContentTransform({
          isDiffMode: false,
          originalLeftContent: 'left content',
          originalRightContent: 'right content',
          transformBothSides: false,
        })
      )

      expect(result.current.diffLeftContent).toBe('')
      expect(result.current.diffRightContent).toBe('')
      expect(result.current.diffContentType).toBe(ContentType.RawString)
    })

    it('isDiffMode 为 true 时应该初始化内容', () => {
      const { result } = renderHook(() =>
        useDiffContentTransform({
          isDiffMode: true,
          originalLeftContent: 'left content',
          originalRightContent: 'right content',
          transformBothSides: false,
        })
      )

      expect(result.current.diffLeftContent).toBe('left content')
      expect(result.current.diffRightContent).toBe('right content')
      expect(result.current.diffContentType).toBe(ContentType.RawString)
    })

    it('应该根据 initialContentType 设置初始类型', () => {
      const { result } = renderHook(() =>
        useDiffContentTransform({
          isDiffMode: true,
          originalLeftContent: 'left',
          originalRightContent: 'right',
          initialContentType: ContentType.Ast,
          transformBothSides: false,
        })
      )

      expect(result.current.diffContentType).toBe(ContentType.Ast)
    })

    it('从非 Diff 切换到 Diff 模式时应该初始化', () => {
      const { result, rerender } = renderHook(
        ({ isDiffMode }) =>
          useDiffContentTransform({
            isDiffMode,
            originalLeftContent: 'left content',
            originalRightContent: 'right content',
            transformBothSides: false,
          }),
        { initialProps: { isDiffMode: false } }
      )

      expect(result.current.diffLeftContent).toBe('')

      rerender({ isDiffMode: true })

      expect(result.current.diffLeftContent).toBe('left content')
      expect(result.current.diffRightContent).toBe('right content')
    })
  })

  describe('transformBothSides = false（只操作右侧）', () => {
    it('格式化操作应该只影响右侧', () => {
      const { result } = renderHook(() =>
        useDiffContentTransform({
          isDiffMode: true,
          originalLeftContent: 'left',
          originalRightContent: 'right',
          transformBothSides: false,
        })
      )

      act(() => {
        result.current.diffToolbarActions.onDiffFormat()
      })

      expect(result.current.diffLeftContent).toBe('left')
      expect(result.current.diffRightContent).toBe('formatted:right')
    })

    it('转义操作应该只影响右侧', () => {
      const { result } = renderHook(() =>
        useDiffContentTransform({
          isDiffMode: true,
          originalLeftContent: 'left',
          originalRightContent: 'right',
          transformBothSides: false,
        })
      )

      act(() => {
        result.current.diffToolbarActions.onDiffEscape()
      })

      expect(result.current.diffLeftContent).toBe('left')
      // JSON.stringify 被直接调用
      expect(result.current.diffRightContent).toBe('"right"')
    })

    it('去转义操作应该只影响右侧', () => {
      const { result } = renderHook(() =>
        useDiffContentTransform({
          isDiffMode: true,
          originalLeftContent: 'left',
          originalRightContent: 'right',
          transformBothSides: false,
        })
      )

      act(() => {
        result.current.diffToolbarActions.onDiffUnescape()
      })

      expect(result.current.diffLeftContent).toBe('left')
      expect(result.current.diffRightContent).toBe('unescaped:right')
    })

    it('压缩操作应该只影响右侧', () => {
      const { result } = renderHook(() =>
        useDiffContentTransform({
          isDiffMode: true,
          originalLeftContent: 'left',
          originalRightContent: 'right',
          transformBothSides: false,
        })
      )

      act(() => {
        result.current.diffToolbarActions.onDiffCompact()
      })

      expect(result.current.diffLeftContent).toBe('left')
      expect(result.current.diffRightContent).toBe('compacted:right')
    })

    it('解析操作应该只影响右侧', () => {
      const { result } = renderHook(() =>
        useDiffContentTransform({
          isDiffMode: true,
          originalLeftContent: 'left',
          originalRightContent: 'right',
          transformBothSides: false,
        })
      )

      act(() => {
        result.current.diffToolbarActions.onDiffParse()
      })

      expect(result.current.diffLeftContent).toBe('left')
      expect(result.current.diffRightContent).toBe('parsed:right')
    })

    it('diffCanParse 应该只检查右侧', () => {
      const { result } = renderHook(() =>
        useDiffContentTransform({
          isDiffMode: true,
          originalLeftContent: 'not json',
          originalRightContent: '{"valid": true}',
          transformBothSides: false,
        })
      )

      expect(result.current.diffCanParse).toBe(true)
    })
  })

  describe('transformBothSides = true（操作两侧）', () => {
    it('格式化操作应该影响两侧', () => {
      const { result } = renderHook(() =>
        useDiffContentTransform({
          isDiffMode: true,
          originalLeftContent: 'left',
          originalRightContent: 'right',
          transformBothSides: true,
        })
      )

      act(() => {
        result.current.diffToolbarActions.onDiffFormat()
      })

      expect(result.current.diffLeftContent).toBe('formatted:left')
      expect(result.current.diffRightContent).toBe('formatted:right')
    })

    it('转义操作应该影响两侧', () => {
      const { result } = renderHook(() =>
        useDiffContentTransform({
          isDiffMode: true,
          originalLeftContent: 'left',
          originalRightContent: 'right',
          transformBothSides: true,
        })
      )

      act(() => {
        result.current.diffToolbarActions.onDiffEscape()
      })

      expect(result.current.diffLeftContent).toBe('"left"')
      expect(result.current.diffRightContent).toBe('"right"')
    })

    it('diffCanParse 应该检查两侧', () => {
      const { result } = renderHook(() =>
        useDiffContentTransform({
          isDiffMode: true,
          originalLeftContent: 'not json',
          originalRightContent: '{"valid": true}',
          transformBothSides: true,
        })
      )

      // 左侧不是有效 JSON，所以应该返回 false
      expect(result.current.diffCanParse).toBe(false)
    })

    it('两侧都是有效 JSON 时 diffCanParse 应该为 true', () => {
      const { result } = renderHook(() =>
        useDiffContentTransform({
          isDiffMode: true,
          originalLeftContent: '{"left": true}',
          originalRightContent: '{"right": true}',
          transformBothSides: true,
        })
      )

      expect(result.current.diffCanParse).toBe(true)
    })
  })

  describe('AST/RawString 切换', () => {
    it('切换到 AST 时应该调用 convertToAST', () => {
      vi.mocked(schemaTransformer.convertToAST).mockReturnValue({
        success: true,
        data: 'ast result',
      })

      const { result } = renderHook(() =>
        useDiffContentTransform({
          isDiffMode: true,
          originalLeftContent: 'left',
          originalRightContent: 'right',
          transformBothSides: false,
        })
      )

      act(() => {
        result.current.diffToolbarActions.onDiffSegmentChange(ContentType.Ast)
      })

      expect(schemaTransformer.convertToAST).toHaveBeenCalledWith('right')
      expect(result.current.diffContentType).toBe(ContentType.Ast)
      expect(result.current.diffRightContent).toBe('ast result')
    })

    it('切换到 RawString 时应该调用 convertToMarkdown', () => {
      vi.mocked(schemaTransformer.convertToMarkdown).mockReturnValue({
        success: true,
        data: 'markdown result',
      })

      const { result } = renderHook(() =>
        useDiffContentTransform({
          isDiffMode: true,
          originalLeftContent: 'left',
          originalRightContent: 'right',
          initialContentType: ContentType.Ast,
          transformBothSides: false,
        })
      )

      act(() => {
        result.current.diffToolbarActions.onDiffSegmentChange(ContentType.RawString)
      })

      expect(schemaTransformer.convertToMarkdown).toHaveBeenCalledWith('right')
      expect(result.current.diffContentType).toBe(ContentType.RawString)
      expect(result.current.diffRightContent).toBe('markdown result')
    })

    it('转换失败时应该保持原内容', () => {
      vi.mocked(schemaTransformer.convertToAST).mockReturnValue({
        success: false,
        data: undefined,
      })

      const { result } = renderHook(() =>
        useDiffContentTransform({
          isDiffMode: true,
          originalLeftContent: 'left',
          originalRightContent: 'right',
          transformBothSides: false,
        })
      )

      act(() => {
        result.current.diffToolbarActions.onDiffSegmentChange(ContentType.Ast)
      })

      expect(result.current.diffRightContent).toBe('right')
    })

    it('transformBothSides = true 时切换应该影响两侧', () => {
      vi.mocked(schemaTransformer.convertToAST).mockReturnValue({
        success: true,
        data: 'ast result',
      })

      const { result } = renderHook(() =>
        useDiffContentTransform({
          isDiffMode: true,
          originalLeftContent: 'left',
          originalRightContent: 'right',
          transformBothSides: true,
        })
      )

      act(() => {
        result.current.diffToolbarActions.onDiffSegmentChange(ContentType.Ast)
      })

      expect(schemaTransformer.convertToAST).toHaveBeenCalledTimes(2)
      expect(result.current.diffLeftContent).toBe('ast result')
      expect(result.current.diffRightContent).toBe('ast result')
    })
  })

  describe('diffToolbarActions', () => {
    it('应该包含所有必需的属性', () => {
      const { result } = renderHook(() =>
        useDiffContentTransform({
          isDiffMode: true,
          originalLeftContent: 'left',
          originalRightContent: 'right',
          transformBothSides: false,
        })
      )

      const { diffToolbarActions } = result.current

      expect(diffToolbarActions).toHaveProperty('onDiffSegmentChange')
      expect(diffToolbarActions).toHaveProperty('onDiffFormat')
      expect(diffToolbarActions).toHaveProperty('onDiffEscape')
      expect(diffToolbarActions).toHaveProperty('onDiffUnescape')
      expect(diffToolbarActions).toHaveProperty('onDiffCompact')
      expect(diffToolbarActions).toHaveProperty('onDiffParse')
      expect(diffToolbarActions).toHaveProperty('diffContentType')
      expect(diffToolbarActions).toHaveProperty('diffCanParse')
    })
  })
})
