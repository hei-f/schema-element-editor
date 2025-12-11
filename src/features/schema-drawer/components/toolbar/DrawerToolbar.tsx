import type { ElementAttributes, ToolbarButtonsConfig } from '@/shared/types'
import { ContentType } from '@/shared/types'
import { TOOLBAR_MODE, type ToolbarMode } from '@/shared/constants/ui-modes'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  EditorToolbar as StyledEditorToolbar,
  ToolbarSegmented,
} from '../../styles/toolbar/toolbar.styles'
import { ResponsiveButtonGroup, type ToolbarButtonConfig } from './ResponsiveButtonGroup'
import { ScrollableParams } from './ScrollableParams'

// 重新导出 ToolbarMode 类型以保持向后兼容
export type { ToolbarMode }

/** 参数区域隐藏的容器最小宽度阈值（px） */
const PARAMS_HIDE_THRESHOLD = 300

/**
 * Diff 模式专用工具栏回调
 * 这些回调会同时对 Diff 视图的左右两侧内容进行操作
 */
export interface DiffToolbarActions {
  /** Diff 模式下的 AST/RawString 切换 */
  onDiffSegmentChange?: (value: ContentType) => void
  /** Diff 模式下的格式化 */
  onDiffFormat?: () => void
  /** Diff 模式下的转义 */
  onDiffEscape?: () => void
  /** Diff 模式下的去转义 */
  onDiffUnescape?: () => void
  /** Diff 模式下的压缩 */
  onDiffCompact?: () => void
  /** Diff 模式下的解析 */
  onDiffParse?: () => void
  /** Diff 模式当前内容类型 */
  diffContentType?: ContentType
  /** Diff 模式是否可以解析 */
  diffCanParse?: boolean
}

interface DrawerToolbarProps {
  /** 工具栏模式，用于控制按钮显示 */
  mode?: ToolbarMode
  attributes: ElementAttributes
  contentType: ContentType
  canParse: boolean
  toolbarButtons: ToolbarButtonsConfig
  previewEnabled?: boolean
  /** 是否正在录制（录制中禁用部分功能） */
  isRecording?: boolean
  /** 是否显示 diff 按钮 */
  showDiffButton?: boolean
  /** 是否处于 Diff 模式 */
  isDiffMode?: boolean
  /** Diff 模式专用工具栏回调 */
  diffToolbarActions?: DiffToolbarActions
  onFormat: () => void
  onEscape: () => void
  onUnescape: () => void
  onCompact: () => void
  onParse: () => void
  onSegmentChange: (value: string | number) => void
  onRenderPreview?: () => void
  /** 进入 diff 模式 */
  onEnterDiffMode?: () => void
  /** 退出 diff 模式 */
  onExitDiffMode?: () => void
  /** 定位 JSON 错误 */
  onLocateError?: () => void
  /** 修复 JSON */
  onRepairJson?: () => void
  /** 是否有待确认的修复内容 */
  hasPendingRepair?: boolean
  /** 应用修复 */
  onApplyRepair?: () => void
  /** 取消修复 */
  onCancelRepair?: () => void
  /** 复制参数成功回调 */
  onCopyParam?: (value: string, index: number) => void
}

/**
 * 抽屉工具栏组件
 * 工具栏始终保持在 DOM 中，按钮根据模式条件原子化渲染
 * 支持响应式布局，在空间不足时将按钮收入"更多"菜单
 */
export const DrawerToolbar: React.FC<DrawerToolbarProps> = (props) => {
  const {
    mode = TOOLBAR_MODE.NORMAL,
    attributes,
    contentType,
    canParse,
    toolbarButtons,
    previewEnabled = false,
    isRecording = false,
    showDiffButton = false,
    isDiffMode = false,
    diffToolbarActions,
    onFormat,
    onEscape,
    onUnescape,
    onCompact,
    onParse,
    onSegmentChange,
    onRenderPreview,
    onEnterDiffMode,
    onExitDiffMode,
    onLocateError,
    onRepairJson,
    hasPendingRepair = false,
    onApplyRepair,
    onCancelRepair,
    onCopyParam,
  } = props

  const toolbarRef = useRef<HTMLDivElement>(null)
  const [hideParams, setHideParams] = useState(false)

  /** 获取 tooltip/dropdown 的挂载容器（工具栏的父元素，避免被 overflow: hidden 裁剪） */
  const getPopupContainer = useCallback(() => {
    return toolbarRef.current?.parentElement || document.body
  }, [])

  /** 判断是否为 Diff 模式（支持 mode prop 和 isDiffMode prop） */
  const isInDiffMode = mode === TOOLBAR_MODE.DIFF || isDiffMode

  /** Diff 按钮点击处理：根据当前模式决定进入或退出 */
  const handleDiffButtonClick = useCallback(() => {
    if (isInDiffMode) {
      onExitDiffMode?.()
    } else {
      onEnterDiffMode?.()
    }
  }, [isInDiffMode, onExitDiffMode, onEnterDiffMode])

  /** 监听容器宽度，决定是否隐藏参数区域 */
  useEffect(() => {
    const toolbar = toolbarRef.current
    if (!toolbar) return

    const checkWidth = () => {
      const width = toolbar.offsetWidth
      setHideParams(width < PARAMS_HIDE_THRESHOLD)
    }

    checkWidth()

    const resizeObserver = new ResizeObserver(checkWidth)
    resizeObserver.observe(toolbar)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  /** 构建按钮配置列表 */
  const buildButtonConfigs = useCallback((): ToolbarButtonConfig[] => {
    const configs: ToolbarButtonConfig[] = []

    // 非 Diff 模式下的按钮
    if (!isInDiffMode) {
      // 更新预览按钮
      if (previewEnabled && onRenderPreview) {
        configs.push({
          key: 'render-preview',
          label: '更新预览',
          onClick: onRenderPreview,
          type: 'primary',
        })
      }

      // AST/RawString 切换（原始组件，不包装 ToolbarButton）
      if (toolbarButtons.astRawStringToggle) {
        const segmentValue = contentType === ContentType.Other ? undefined : contentType
        const segmentDisabled = contentType === ContentType.Other || isRecording
        configs.push({
          key: 'ast-rawstring-toggle',
          label: (
            <ToolbarSegmented
              key={`segment-${contentType}-${isRecording}`}
              options={[
                { label: 'AST', value: ContentType.Ast },
                { label: 'RawString', value: ContentType.RawString },
              ]}
              value={segmentValue}
              onChange={onSegmentChange}
              disabled={segmentDisabled}
            />
          ),
          isRawComponent: true,
          // Segmented 不在更多菜单中显示，因为它需要特殊交互
        })
      }

      // 转义按钮
      if (toolbarButtons.escape) {
        configs.push({
          key: 'escape',
          label: '转义',
          onClick: onEscape,
          tooltip: '将内容包装成字符串值，添加引号和转义',
        })

        configs.push({
          key: 'unescape',
          label: '去转义',
          onClick: onUnescape,
          tooltip: '将字符串值还原，移除外层引号和转义',
        })
      }

      // 压缩按钮
      if (toolbarButtons.serialize) {
        configs.push({
          key: 'compact',
          label: '压缩',
          onClick: onCompact,
          tooltip: '将 JSON 压缩成一行',
        })
      }

      // 解析按钮
      if (toolbarButtons.deserialize) {
        configs.push({
          key: 'parse',
          label: '解析',
          onClick: onParse,
          disabled: !canParse,
          tooltip: !canParse ? '当前内容不是有效的 JSON 格式' : '解析多层嵌套/转义的 JSON',
        })
      }

      // 格式化按钮
      if (toolbarButtons.format) {
        configs.push({
          key: 'format',
          label: '格式化',
          onClick: onFormat,
          disabled: !canParse,
          tooltip: !canParse ? '当前内容不是有效的 JSON 格式' : undefined,
        })
      }

      // 定位错误按钮
      if (onLocateError) {
        configs.push({
          key: 'locate-error',
          label: '定位错误',
          onClick: onLocateError,
          tooltip: '定位 JSON 语法错误位置（支持检测字符串内部的 JSON）',
        })
      }

      // 修复JSON按钮
      if (onRepairJson) {
        configs.push({
          key: 'repair-json',
          label: '修复JSON',
          onClick: onRepairJson,
          tooltip: '尝试自动修复 JSON 语法错误（支持修复字符串内部的 JSON）',
        })
      }
    }

    // Diff 模式下的按钮（复用普通模式的工具栏按钮）
    if (isInDiffMode) {
      // 修复确认按钮
      if (hasPendingRepair && onApplyRepair && onCancelRepair) {
        configs.push({
          key: 'apply-repair',
          label: '应用修复',
          onClick: onApplyRepair,
          type: 'primary',
          tooltip: '应用修复后的内容',
        })

        configs.push({
          key: 'cancel-repair',
          label: '取消',
          onClick: onCancelRepair,
          tooltip: '取消修复，恢复原内容',
        })
      }

      // AST/RawString 切换（Diff 模式专用）
      if (toolbarButtons.astRawStringToggle && diffToolbarActions?.onDiffSegmentChange) {
        const segmentValue = diffToolbarActions.diffContentType
        // other 类型时禁用切换，且不选中任何选项
        const isOther = segmentValue === ContentType.Other
        configs.push({
          key: 'diff-ast-rawstring-toggle',
          label: (
            <ToolbarSegmented
              key={`diff-segment-${segmentValue}`}
              options={[
                { label: 'AST', value: ContentType.Ast },
                { label: 'RawString', value: ContentType.RawString },
              ]}
              value={isOther ? undefined : segmentValue}
              onChange={(value) => diffToolbarActions.onDiffSegmentChange?.(value)}
              disabled={isOther}
            />
          ),
          isRawComponent: true,
        })
      }

      // 转义/去转义按钮（Diff 模式）
      if (toolbarButtons.escape && diffToolbarActions) {
        if (diffToolbarActions.onDiffEscape) {
          configs.push({
            key: 'diff-escape',
            label: '转义',
            onClick: diffToolbarActions.onDiffEscape,
            tooltip: '将左右两侧内容包装成字符串值',
          })
        }

        if (diffToolbarActions.onDiffUnescape) {
          configs.push({
            key: 'diff-unescape',
            label: '去转义',
            onClick: diffToolbarActions.onDiffUnescape,
            tooltip: '将左右两侧字符串值还原',
          })
        }
      }

      // 压缩按钮（Diff 模式）
      if (toolbarButtons.serialize && diffToolbarActions?.onDiffCompact) {
        configs.push({
          key: 'diff-compact',
          label: '压缩',
          onClick: diffToolbarActions.onDiffCompact,
          tooltip: '将左右两侧 JSON 压缩成一行',
        })
      }

      // 解析按钮（Diff 模式）
      if (toolbarButtons.deserialize && diffToolbarActions?.onDiffParse) {
        const diffCanParse = diffToolbarActions.diffCanParse ?? true
        configs.push({
          key: 'diff-parse',
          label: '解析',
          onClick: diffToolbarActions.onDiffParse,
          disabled: !diffCanParse,
          tooltip: !diffCanParse
            ? '当前内容不是有效的 JSON 格式'
            : '解析左右两侧多层嵌套/转义的 JSON',
        })
      }

      // 格式化按钮（Diff 模式）
      if (toolbarButtons.format && diffToolbarActions?.onDiffFormat) {
        const diffCanParse = diffToolbarActions.diffCanParse ?? true
        configs.push({
          key: 'diff-format',
          label: '格式化',
          onClick: diffToolbarActions.onDiffFormat,
          disabled: !diffCanParse,
          tooltip: !diffCanParse ? '当前内容不是有效的 JSON 格式' : '格式化左右两侧 JSON',
        })
      }
    }

    // Diff 按钮（固定显示）
    if (showDiffButton) {
      configs.push({
        key: 'diff',
        label: 'Diff',
        onClick: handleDiffButtonClick,
        type: isInDiffMode ? 'primary' : 'default',
        fixed: true, // 固定按钮，不会被收入更多菜单
      })
    }

    return configs
  }, [
    isInDiffMode,
    previewEnabled,
    onRenderPreview,
    toolbarButtons,
    contentType,
    onSegmentChange,
    isRecording,
    onEscape,
    onUnescape,
    onCompact,
    onParse,
    canParse,
    onFormat,
    onLocateError,
    onRepairJson,
    hasPendingRepair,
    onApplyRepair,
    onCancelRepair,
    diffToolbarActions,
    showDiffButton,
    handleDiffButtonClick,
  ])

  const buttonConfigs = buildButtonConfigs()

  return (
    <StyledEditorToolbar ref={toolbarRef}>
      {/* 参数区域：仅非 Diff 模式且空间足够时显示 */}
      {!isInDiffMode && !hideParams && (
        <ScrollableParams params={attributes.params || []} onCopyParam={onCopyParam} />
      )}

      {/* 响应式按钮组 */}
      <ResponsiveButtonGroup buttons={buttonConfigs} getPopupContainer={getPopupContainer} />
    </StyledEditorToolbar>
  )
}
