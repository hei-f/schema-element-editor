import { useState, useCallback, useMemo, useLayoutEffect, useRef } from 'react'
import { ContentType } from '@/shared/types'
import { schemaTransformer } from '../../services/schema-transformer'
import {
  formatContent,
  unescapeContent,
  compactContent,
  parseContent,
} from '../../utils/content-transformer'

/**
 * Diff 内容转换 Hook 的配置选项
 */
export interface UseDiffContentTransformOptions {
  /** 是否处于 Diff 模式 */
  isDiffMode: boolean
  /** 原始左侧内容（进入 Diff 模式时的初始值） */
  originalLeftContent: string
  /** 原始右侧内容（进入 Diff 模式时的初始值） */
  originalRightContent: string
  /** 初始内容类型（用于确定初始 diffContentType，仅 NormalModeLayout 使用） */
  initialContentType?: ContentType
  /** 是否同时转换两侧内容（NormalModeLayout: false，RecordingModeLayout: true） */
  transformBothSides: boolean
}

/**
 * Diff 工具栏动作集合
 */
export interface DiffToolbarActions {
  onDiffSegmentChange: (value: ContentType) => void
  onDiffFormat: () => void
  onDiffEscape: () => void
  onDiffUnescape: () => void
  onDiffCompact: () => void
  onDiffParse: () => void
  diffContentType: ContentType
  diffCanParse: boolean
}

/**
 * Diff 内容转换 Hook 的返回值
 */
export interface UseDiffContentTransformReturn {
  /** 当前 Diff 内容类型 */
  diffContentType: ContentType
  /** 转换后的左侧内容 */
  diffLeftContent: string
  /** 转换后的右侧内容 */
  diffRightContent: string
  /** Diff 内容是否可解析 */
  diffCanParse: boolean
  /** 工具栏动作集合 */
  diffToolbarActions: DiffToolbarActions
}

/**
 * Diff 内容转换 Hook
 *
 * 管理 Diff 模式下的内容状态和转换操作：
 * - 进入 Diff 模式时初始化内容
 * - 提供 AST/RawString 切换、格式化、转义、压缩、解析等操作
 * - 根据 transformBothSides 参数决定操作范围（单侧/双侧）
 */
export function useDiffContentTransform(
  options: UseDiffContentTransformOptions
): UseDiffContentTransformReturn {
  const {
    isDiffMode,
    originalLeftContent,
    originalRightContent,
    initialContentType,
    transformBothSides,
  } = options

  // Diff 模式下的内容状态
  const [diffContentType, setDiffContentType] = useState<ContentType>(ContentType.RawString)
  const [diffLeftContent, setDiffLeftContent] = useState<string>('')
  const [diffRightContent, setDiffRightContent] = useState<string>('')

  // 进入 Diff 模式时初始化（直接赋值，不做转换）
  // 使用 useLayoutEffect 确保在渲染前同步完成状态初始化
  const prevIsDiffModeRef = useRef(false)
  useLayoutEffect(() => {
    // 只在从非 Diff 进入 Diff 时初始化
    if (isDiffMode && !prevIsDiffModeRef.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 模式切换时同步初始化状态是合理的用例
      setDiffContentType(initialContentType ?? ContentType.RawString)
      setDiffLeftContent(originalLeftContent)
      setDiffRightContent(originalRightContent)
    }
    prevIsDiffModeRef.current = isDiffMode
  }, [isDiffMode, originalLeftContent, originalRightContent, initialContentType])

  /**
   * 统一的内容转换函数
   * 根据 transformBothSides 决定操作范围
   */
  const applyTransform = useCallback(
    (transformer: (content: string) => string) => {
      if (transformBothSides) {
        setDiffLeftContent((prev) => transformer(prev))
      }
      setDiffRightContent((prev) => transformer(prev))
    },
    [transformBothSides]
  )

  // AST/RawString 切换
  const handleDiffSegmentChange = useCallback(
    (value: ContentType) => {
      setDiffContentType(value)
      const transform = (prev: string): string => {
        if (value === ContentType.Ast) {
          // RawString → AST
          const result = schemaTransformer.convertToAST(prev)
          return result.success && result.data ? result.data : prev
        } else if (value === ContentType.RawString) {
          // AST → RawString
          const result = schemaTransformer.convertToMarkdown(prev)
          return result.success && result.data ? result.data : prev
        }
        return prev
      }
      applyTransform(transform)
    },
    [applyTransform]
  )

  // 格式化
  const handleDiffFormat = useCallback(() => {
    applyTransform(formatContent)
  }, [applyTransform])

  // 转义
  const handleDiffEscape = useCallback(() => {
    applyTransform((content) => JSON.stringify(content))
  }, [applyTransform])

  // 去转义
  const handleDiffUnescape = useCallback(() => {
    applyTransform(unescapeContent)
  }, [applyTransform])

  // 压缩
  const handleDiffCompact = useCallback(() => {
    applyTransform(compactContent)
  }, [applyTransform])

  // 解析
  const handleDiffParse = useCallback(() => {
    applyTransform(parseContent)
  }, [applyTransform])

  // 检查内容是否可解析
  const diffCanParse = useMemo(() => {
    try {
      JSON.parse(diffRightContent)
      if (transformBothSides) {
        JSON.parse(diffLeftContent)
      }
      return true
    } catch {
      return false
    }
  }, [diffLeftContent, diffRightContent, transformBothSides])

  // 工具栏动作集合
  const diffToolbarActions = useMemo<DiffToolbarActions>(
    () => ({
      onDiffSegmentChange: handleDiffSegmentChange,
      onDiffFormat: handleDiffFormat,
      onDiffEscape: handleDiffEscape,
      onDiffUnescape: handleDiffUnescape,
      onDiffCompact: handleDiffCompact,
      onDiffParse: handleDiffParse,
      diffContentType,
      diffCanParse,
    }),
    [
      handleDiffSegmentChange,
      handleDiffFormat,
      handleDiffEscape,
      handleDiffUnescape,
      handleDiffCompact,
      handleDiffParse,
      diffContentType,
      diffCanParse,
    ]
  )

  return {
    diffContentType,
    diffLeftContent,
    diffRightContent,
    diffCanParse,
    diffToolbarActions,
  }
}
