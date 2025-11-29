import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { DiffResult, DiffRow } from '../../utils/diff-algorithm'
import { computeLineDiff } from '../../utils/diff-algorithm'

/** diff 同步 hook 的返回值 */
interface UseDiffSyncReturn {
  /** 左侧内容 */
  leftContent: string
  /** 右侧内容 */
  rightContent: string
  /** 设置左侧内容 */
  setLeftContent: (content: string) => void
  /** 设置右侧内容 */
  setRightContent: (content: string) => void
  /** diff 计算结果 */
  diffResult: DiffResult | null
  /** diff 行数据 */
  diffRows: DiffRow[]
  /** 左侧占位行位置（行号数组，0-indexed） */
  leftPlaceholders: number[]
  /** 右侧占位行位置（行号数组，0-indexed） */
  rightPlaceholders: number[]
  /** 左侧滚动处理函数 */
  handleLeftScroll: (scrollTop: number) => number
  /** 右侧滚动处理函数 */
  handleRightScroll: (scrollTop: number) => number
  /** 是否正在计算 diff */
  isComputing: boolean
}

/** hook 参数 */
interface UseDiffSyncOptions {
  /** 初始左侧内容 */
  initialLeft: string
  /** 初始右侧内容 */
  initialRight: string
  /** 防抖延迟（毫秒） */
  debounceMs?: number
  /** 行高（像素） */
  lineHeight?: number
}

/**
 * Diff 同步 Hook
 * 管理左右内容状态、计算 diff、提供滚动同步
 */
export function useDiffSync(options: UseDiffSyncOptions): UseDiffSyncReturn {
  const { initialLeft, initialRight, debounceMs = 300 } = options

  const [leftContent, setLeftContent] = useState(initialLeft)
  const [rightContent, setRightContent] = useState(initialRight)
  // 使用 lazy initial state 避免在 effect 中同步调用 setState
  const [diffResult, setDiffResult] = useState<DiffResult | null>(() =>
    computeLineDiff(initialLeft, initialRight)
  )
  const [isComputing, setIsComputing] = useState(false)

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 计算 diff（带防抖）
  useEffect(() => {
    // 清除之前的 timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // 标记开始计算 - 使用 setTimeout 0 避免同步 setState
    const markComputingTimer = setTimeout(() => setIsComputing(true), 0)

    debounceTimerRef.current = setTimeout(() => {
      const result = computeLineDiff(leftContent, rightContent)
      setDiffResult(result)
      setIsComputing(false)
    }, debounceMs)

    return () => {
      clearTimeout(markComputingTimer)
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [leftContent, rightContent, debounceMs])

  // diff 行数据
  const diffRows = useMemo(() => {
    return diffResult?.rows || []
  }, [diffResult])

  // 计算左侧占位行位置
  const leftPlaceholders = useMemo(() => {
    const placeholders: number[] = []
    let lineIndex = 0

    for (const row of diffRows) {
      if (row.left.type === 'placeholder') {
        placeholders.push(lineIndex)
      }
      lineIndex++
    }

    return placeholders
  }, [diffRows])

  // 计算右侧占位行位置
  const rightPlaceholders = useMemo(() => {
    const placeholders: number[] = []
    let lineIndex = 0

    for (const row of diffRows) {
      if (row.right.type === 'placeholder') {
        placeholders.push(lineIndex)
      }
      lineIndex++
    }

    return placeholders
  }, [diffRows])

  // 左侧滚动处理：返回右侧应该滚动到的位置
  const handleLeftScroll = useCallback(
    (scrollTop: number): number => {
      if (!diffResult) return scrollTop

      // 由于两侧的可视行是对齐的，直接返回相同的滚动位置
      return scrollTop
    },
    [diffResult]
  )

  // 右侧滚动处理：返回左侧应该滚动到的位置
  const handleRightScroll = useCallback(
    (scrollTop: number): number => {
      if (!diffResult) return scrollTop

      return scrollTop
    },
    [diffResult]
  )

  return {
    leftContent,
    rightContent,
    setLeftContent,
    setRightContent,
    diffResult,
    diffRows,
    leftPlaceholders,
    rightPlaceholders,
    handleLeftScroll,
    handleRightScroll,
    isComputing,
  }
}
