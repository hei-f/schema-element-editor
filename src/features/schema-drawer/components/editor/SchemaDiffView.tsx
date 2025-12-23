import { DEFAULT_EDITOR_THEME } from '@/shared/constants/editor-themes'
import type { EditorTheme, SchemaSnapshot } from '@/shared/types'
import React, { Suspense, useMemo, useState, useRef, useCallback, useEffect } from 'react'
import { diffChars } from 'diff'
import {
  DiffModeContainer,
  DiffToolbar,
  VersionSelectorGroup,
  VersionSelectorLabel,
  EditableDiffContainer,
  DiffHeaderRow,
  DiffEditorHeader,
  SharedScrollContainer,
  DiffEditorsRow,
  DiffEditorPanel,
} from '../../styles/recording/recording.styles'
import type { DiffEditorHandle, DiffLineInfo, InlineDiffSegment } from './DiffEditor'
import { DiffEditor } from './DiffEditor.lazy'
import { useDiffSync } from '../../hooks/diff/useDiffSync'
import type { DiffRow } from '../../utils/diff-algorithm'
import { VersionSelector } from '../recording/VersionSelector'

interface SchemaDiffViewProps {
  /** 快照列表 */
  snapshots: SchemaSnapshot[]
  /** 转换后的左侧内容（由父组件提供） */
  transformedLeftContent?: string
  /** 转换后的右侧内容（由父组件提供） */
  transformedRightContent?: string
  /** 编辑器主题 */
  theme?: EditorTheme
  /** 主题色 */
  themeColor?: string
}

/**
 * 格式化时间戳（毫秒）
 */
function formatTimestamp(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`
  }
  const seconds = (ms / 1000).toFixed(1)
  return `${seconds}s`
}

/**
 * 计算行内差异片段
 * @param leftContent 左侧行内容
 * @param rightContent 右侧行内容
 * @param side 当前处理的是哪一侧
 */
function computeInlineDiffs(
  leftContent: string,
  rightContent: string,
  side: 'left' | 'right'
): InlineDiffSegment[] {
  const diffs = diffChars(leftContent, rightContent)
  const segments: InlineDiffSegment[] = []
  let position = 0

  for (const part of diffs) {
    if (side === 'left') {
      // 左侧：只关心 removed 部分
      if (part.removed) {
        segments.push({
          from: position,
          to: position + part.value.length,
          type: 'removed',
        })
        position += part.value.length
      } else if (!part.added) {
        // 未变化的部分
        position += part.value.length
      }
      // added 部分在左侧不显示
    } else {
      // 右侧：只关心 added 部分
      if (part.added) {
        segments.push({
          from: position,
          to: position + part.value.length,
          type: 'added',
        })
        position += part.value.length
      } else if (!part.removed) {
        // 未变化的部分
        position += part.value.length
      }
      // removed 部分在右侧不显示
    }
  }

  return segments
}

/**
 * 将 DiffRow 转换为左侧编辑器的 DiffLineInfo
 */
function convertToLeftDiffLines(rows: DiffRow[]): DiffLineInfo[] {
  const result: DiffLineInfo[] = []
  let editorLine = 0

  for (const row of rows) {
    const leftSide = row.left

    if (leftSide.type === 'placeholder') {
      // 占位行：在当前位置插入 widget
      result.push({
        editorLine,
        type: 'unchanged',
        isPlaceholder: true,
      })
    } else {
      // 计算行内差异（仅对 modified 行）
      let inlineDiffs: InlineDiffSegment[] | undefined
      if (leftSide.type === 'modified' && leftSide.pairContent !== undefined) {
        inlineDiffs = computeInlineDiffs(leftSide.content, leftSide.pairContent, 'left')
      }

      // 正常行：根据类型设置背景
      result.push({
        editorLine,
        type:
          leftSide.type === 'modified'
            ? 'modified'
            : leftSide.type === 'removed'
              ? 'removed'
              : leftSide.type === 'added'
                ? 'added'
                : 'unchanged',
        isPlaceholder: false,
        inlineDiffs,
      })
      editorLine++
    }
  }

  return result.filter((line) => !line.isPlaceholder || line.editorLine >= 0)
}

/**
 * 将 DiffRow 转换为右侧编辑器的 DiffLineInfo
 */
function convertToRightDiffLines(rows: DiffRow[]): DiffLineInfo[] {
  const result: DiffLineInfo[] = []
  let editorLine = 0

  for (const row of rows) {
    const rightSide = row.right

    if (rightSide.type === 'placeholder') {
      result.push({
        editorLine,
        type: 'unchanged',
        isPlaceholder: true,
      })
    } else {
      // 计算行内差异（仅对 modified 行）
      let inlineDiffs: InlineDiffSegment[] | undefined
      if (rightSide.type === 'modified' && rightSide.pairContent !== undefined) {
        inlineDiffs = computeInlineDiffs(rightSide.pairContent, rightSide.content, 'right')
      }

      result.push({
        editorLine,
        type:
          rightSide.type === 'modified'
            ? 'modified'
            : rightSide.type === 'added'
              ? 'added'
              : rightSide.type === 'removed'
                ? 'removed'
                : 'unchanged',
        isPlaceholder: false,
        inlineDiffs,
      })
      editorLine++
    }
  }

  return result.filter((line) => !line.isPlaceholder || line.editorLine >= 0)
}

/**
 * Schema Diff 视图组件（可编辑版）
 */
export const SchemaDiffView: React.FC<SchemaDiffViewProps> = (props) => {
  const {
    snapshots,
    transformedLeftContent,
    transformedRightContent,
    theme = DEFAULT_EDITOR_THEME,
    themeColor = '#0066ff',
  } = props

  /**
   * 用户主动选择的版本 ID
   * null 表示用户尚未主动选择，使用默认值
   */
  const [userSelectedLeftId, setUserSelectedLeftId] = useState<number | null>(null)
  const [userSelectedRightId, setUserSelectedRightId] = useState<number | null>(null)

  /**
   * 有效的版本 ID（派生状态）
   * 优先使用用户选择（如果仍有效），否则使用默认值
   * 解决进入 Diff 模式时版本选择不自动初始化的问题
   */
  const leftVersionId = useMemo(() => {
    if (userSelectedLeftId !== null && snapshots.find((s) => s.id === userSelectedLeftId)) {
      return userSelectedLeftId
    }
    return snapshots.length > 0 ? snapshots[0].id : null
  }, [snapshots, userSelectedLeftId])

  const rightVersionId = useMemo(() => {
    if (userSelectedRightId !== null && snapshots.find((s) => s.id === userSelectedRightId)) {
      return userSelectedRightId
    }
    return snapshots.length > 1 ? snapshots[snapshots.length - 1].id : null
  }, [snapshots, userSelectedRightId])

  // 编辑器引用
  const leftEditorRef = useRef<DiffEditorHandle>(null)
  const rightEditorRef = useRef<DiffEditorHandle>(null)

  // 判断是否为简单对比模式（非录制模式，只有2个快照且 timestamp 为连续的 0 和 1）
  const isSimpleDiffMode = useMemo(() => {
    if (snapshots.length !== 2) return false
    // 检查是否是编辑模式下的对比（timestamp 为 0 和 1）
    return snapshots[0].timestamp === 0 && snapshots[1].timestamp === 1
  }, [snapshots])

  // 获取原始内容
  const leftRawContent = useMemo(() => {
    const snapshot = snapshots.find((s) => s.id === leftVersionId)
    return snapshot?.content || ''
  }, [snapshots, leftVersionId])

  const rightRawContent = useMemo(() => {
    const snapshot = snapshots.find((s) => s.id === rightVersionId)
    return snapshot?.content || ''
  }, [snapshots, rightVersionId])

  // 转换后的内容
  // 录制模式：使用根据版本选择计算的 rawContent（支持版本切换）
  // 简单对比模式：优先使用父组件提供的转换内容（支持 AST/RawString 切换等操作）
  const leftTransformed = useMemo(() => {
    return isSimpleDiffMode ? (transformedLeftContent ?? leftRawContent) : leftRawContent
  }, [isSimpleDiffMode, transformedLeftContent, leftRawContent])

  const rightTransformed = useMemo(() => {
    return isSimpleDiffMode ? (transformedRightContent ?? rightRawContent) : rightRawContent
  }, [isSimpleDiffMode, transformedRightContent, rightRawContent])

  // Diff 同步
  const { setLeftContent, setRightContent, diffRows, isComputing } = useDiffSync({
    initialLeft: leftTransformed,
    initialRight: rightTransformed,
    debounceMs: 200,
  })

  // 版本切换时更新内容
  useEffect(() => {
    setLeftContent(leftTransformed)
    leftEditorRef.current?.setValue(leftTransformed)
  }, [leftTransformed, setLeftContent])

  useEffect(() => {
    setRightContent(rightTransformed)
    rightEditorRef.current?.setValue(rightTransformed)
  }, [rightTransformed, setRightContent])

  // 计算编辑器的 diff 行信息
  const leftDiffLines = useMemo(() => {
    return convertToLeftDiffLines(diffRows)
  }, [diffRows])

  const rightDiffLines = useMemo(() => {
    return convertToRightDiffLines(diffRows)
  }, [diffRows])

  // 更新编辑器装饰
  useEffect(() => {
    leftEditorRef.current?.updateDecorations(leftDiffLines)
    rightEditorRef.current?.updateDecorations(rightDiffLines)
  }, [leftDiffLines, rightDiffLines])

  // 版本信息显示
  const leftVersionInfo = useMemo(() => {
    if (isSimpleDiffMode) {
      return '原始数据'
    }
    const snapshot = snapshots.find((s) => s.id === leftVersionId)
    const index = snapshots.findIndex((s) => s.id === leftVersionId)
    if (!snapshot) return '请选择左侧版本'
    return `版本 ${index + 1} (${formatTimestamp(snapshot.timestamp)})`
  }, [snapshots, leftVersionId, isSimpleDiffMode])

  const rightVersionInfo = useMemo(() => {
    if (isSimpleDiffMode) {
      return '当前编辑'
    }
    const snapshot = snapshots.find((s) => s.id === rightVersionId)
    const index = snapshots.findIndex((s) => s.id === rightVersionId)
    if (!snapshot) return '请选择右侧版本'
    return `版本 ${index + 1} (${formatTimestamp(snapshot.timestamp)})`
  }, [snapshots, rightVersionId, isSimpleDiffMode])

  // 内容变化处理
  const handleLeftChange = useCallback(
    (value: string) => {
      setLeftContent(value)
    },
    [setLeftContent]
  )

  const handleRightChange = useCallback(
    (value: string) => {
      setRightContent(value)
    },
    [setRightContent]
  )

  // 水平滚动同步
  const handleLeftHorizontalScroll = useCallback((scrollLeft: number) => {
    rightEditorRef.current?.setScrollLeft(scrollLeft)
  }, [])

  const handleRightHorizontalScroll = useCallback((scrollLeft: number) => {
    leftEditorRef.current?.setScrollLeft(scrollLeft)
  }, [])

  return (
    <DiffModeContainer>
      {/* 录制模式下显示版本选择器 */}
      {!isSimpleDiffMode && (
        <DiffToolbar>
          <VersionSelectorGroup>
            <VersionSelectorLabel>左侧版本:</VersionSelectorLabel>
            <VersionSelector
              snapshots={snapshots}
              value={leftVersionId ?? snapshots[0]?.id}
              onChange={setUserSelectedLeftId}
              label="左侧版本"
              theme={theme}
              themeColor={themeColor}
            />
          </VersionSelectorGroup>

          <VersionSelectorGroup>
            <VersionSelectorLabel>右侧版本:</VersionSelectorLabel>
            <VersionSelector
              snapshots={snapshots}
              value={rightVersionId ?? snapshots[snapshots.length - 1]?.id}
              onChange={setUserSelectedRightId}
              label="右侧版本"
              theme={theme}
              themeColor={themeColor}
            />
          </VersionSelectorGroup>

          {isComputing && <span style={{ color: '#8b949e', fontSize: 12 }}>计算中...</span>}
        </DiffToolbar>
      )}

      {/* 可编辑 Diff 内容区域 */}
      <EditableDiffContainer>
        {/* 头部行 */}
        <DiffHeaderRow>
          <DiffEditorHeader $isLeft>{leftVersionInfo}</DiffEditorHeader>
          <DiffEditorHeader>{rightVersionInfo}</DiffEditorHeader>
        </DiffHeaderRow>

        {/* 共享滚动容器 */}
        <SharedScrollContainer>
          <DiffEditorsRow>
            {/* 左侧编辑器 */}
            <DiffEditorPanel $isLeft>
              <Suspense
                fallback={<div style={{ padding: '20px', textAlign: 'center' }}>加载中...</div>}
              >
                <DiffEditor
                  ref={leftEditorRef}
                  defaultValue={leftTransformed}
                  onChange={handleLeftChange}
                  onHorizontalScroll={handleLeftHorizontalScroll}
                  theme={theme}
                  diffLines={leftDiffLines}
                />
              </Suspense>
            </DiffEditorPanel>

            {/* 右侧编辑器 */}
            <DiffEditorPanel>
              <Suspense
                fallback={<div style={{ padding: '20px', textAlign: 'center' }}>加载中...</div>}
              >
                <DiffEditor
                  ref={rightEditorRef}
                  defaultValue={rightTransformed}
                  onChange={handleRightChange}
                  onHorizontalScroll={handleRightHorizontalScroll}
                  theme={theme}
                  diffLines={rightDiffLines}
                />
              </Suspense>
            </DiffEditorPanel>
          </DiffEditorsRow>
        </SharedScrollContainer>
      </EditableDiffContainer>
    </DiffModeContainer>
  )
}
