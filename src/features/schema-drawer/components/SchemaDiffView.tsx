import type { SchemaSnapshot } from '@/shared/types'
import { RollbackOutlined } from '@ant-design/icons'
import { Button, Select, Segmented, Tooltip } from 'antd'
import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react'
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
} from '../styles/recording.styles'
import { schemaTransformer } from '../services/schema-transformer'
import type { DiffEditorHandle, DiffLineInfo, InlineDiffSegment } from './DiffEditor'
import { DiffEditor } from './DiffEditor'
import { useDiffSync } from '../hooks/useDiffSync'
import type { DiffRow } from '../utils/diff-algorithm'

/** 对比模式类型 */
type DiffDisplayMode = 'raw' | 'deserialize' | 'ast'

interface SchemaDiffViewProps {
  /** 快照列表 */
  snapshots: SchemaSnapshot[]
  /** 返回编辑模式回调 */
  onBackToEditor: () => void
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
 * 尝试将内容转换为可处理的 JSON 字符串
 */
function ensureJsonString(content: string): string {
  try {
    JSON.parse(content)
    return content
  } catch {
    return JSON.stringify(content)
  }
}

/**
 * 转换内容到指定显示模式
 */
function transformContent(content: string, mode: DiffDisplayMode): string {
  if (!content) return ''

  switch (mode) {
    case 'raw':
      return content

    case 'deserialize': {
      const jsonContent = ensureJsonString(content)
      const result = schemaTransformer.deserializeJson(jsonContent)
      if (result.success && result.data) {
        try {
          return JSON.stringify(JSON.parse(result.data), null, 2)
        } catch {
          return result.data
        }
      }
      return content
    }

    case 'ast': {
      const jsonContent = ensureJsonString(content)
      const result = schemaTransformer.convertToAST(jsonContent)
      if (result.success && result.data) {
        return result.data
      }
      return content
    }

    default:
      return content
  }
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
  const { snapshots, onBackToEditor } = props

  // 版本选择状态
  const [leftVersionId, setLeftVersionId] = useState<number | null>(
    snapshots.length > 0 ? snapshots[0].id : null
  )
  const [rightVersionId, setRightVersionId] = useState<number | null>(
    snapshots.length > 1 ? snapshots[snapshots.length - 1].id : null
  )

  // 显示模式
  const [displayMode, setDisplayMode] = useState<DiffDisplayMode>('raw')

  // 编辑器引用
  const leftEditorRef = useRef<DiffEditorHandle>(null)
  const rightEditorRef = useRef<DiffEditorHandle>(null)

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
  const leftTransformed = useMemo(() => {
    return transformContent(leftRawContent, displayMode)
  }, [leftRawContent, displayMode])

  const rightTransformed = useMemo(() => {
    return transformContent(rightRawContent, displayMode)
  }, [rightRawContent, displayMode])

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
  }, [leftTransformed])

  useEffect(() => {
    setRightContent(rightTransformed)
    rightEditorRef.current?.setValue(rightTransformed)
  }, [rightTransformed])

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

  // 版本选项
  const versionOptions = useMemo(() => {
    return snapshots.map((snapshot, index) => ({
      value: snapshot.id,
      label: `版本 ${index + 1} (${formatTimestamp(snapshot.timestamp)})`,
    }))
  }, [snapshots])

  // 判断是否为简单对比模式（非录制模式，只有2个快照且 timestamp 为连续的 0 和 1）
  const isSimpleDiffMode = useMemo(() => {
    if (snapshots.length !== 2) return false
    // 检查是否是编辑模式下的对比（timestamp 为 0 和 1）
    return snapshots[0].timestamp === 0 && snapshots[1].timestamp === 1
  }, [snapshots])

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

  // 模式切换处理
  const handleModeChange = (value: string | number) => {
    setDisplayMode(value as DiffDisplayMode)
  }

  return (
    <DiffModeContainer>
      {/* Diff工具栏 */}
      <DiffToolbar>
        <Button icon={<RollbackOutlined />} onClick={onBackToEditor} size="small">
          返回编辑模式
        </Button>

        {/* 非简单对比模式才显示版本选择器 */}
        {!isSimpleDiffMode && (
          <>
            <VersionSelectorGroup>
              <VersionSelectorLabel>左侧版本:</VersionSelectorLabel>
              <Select
                value={leftVersionId}
                onChange={setLeftVersionId}
                options={versionOptions}
                style={{ width: 180 }}
                size="small"
                popupMatchSelectWidth={false}
                getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement}
              />
            </VersionSelectorGroup>

            <VersionSelectorGroup>
              <VersionSelectorLabel>右侧版本:</VersionSelectorLabel>
              <Select
                value={rightVersionId}
                onChange={setRightVersionId}
                options={versionOptions}
                style={{ width: 180 }}
                size="small"
                popupMatchSelectWidth={false}
                getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement}
              />
            </VersionSelectorGroup>
          </>
        )}

        <VersionSelectorGroup>
          <VersionSelectorLabel>对比模式:</VersionSelectorLabel>
          <Tooltip title="选择数据展示格式进行对比">
            <Segmented
              size="small"
              value={displayMode}
              onChange={handleModeChange}
              options={[
                { label: '原始', value: 'raw' },
                { label: '反序列化', value: 'deserialize' },
                { label: 'AST', value: 'ast' },
              ]}
            />
          </Tooltip>
        </VersionSelectorGroup>

        {isComputing && <span style={{ color: '#8b949e', fontSize: 12 }}>计算中...</span>}
      </DiffToolbar>

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
              <DiffEditor
                ref={leftEditorRef}
                defaultValue={leftTransformed}
                onChange={handleLeftChange}
                onHorizontalScroll={handleLeftHorizontalScroll}
                isDark={true}
                diffLines={leftDiffLines}
              />
            </DiffEditorPanel>

            {/* 右侧编辑器 */}
            <DiffEditorPanel>
              <DiffEditor
                ref={rightEditorRef}
                defaultValue={rightTransformed}
                onChange={handleRightChange}
                onHorizontalScroll={handleRightHorizontalScroll}
                isDark={true}
                diffLines={rightDiffLines}
              />
            </DiffEditorPanel>
          </DiffEditorsRow>
        </SharedScrollContainer>
      </EditableDiffContainer>
    </DiffModeContainer>
  )
}
