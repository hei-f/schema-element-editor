import type { ElementAttributes, ToolbarButtonsConfig } from '@/shared/types'
import { ContentType } from '@/shared/types'
import { Tooltip } from 'antd'
import React from 'react'
import {
  ButtonGroup,
  EditorToolbar as StyledEditorToolbar,
  ToolbarButton,
  ToolbarSegmented,
} from '../../styles/toolbar/toolbar.styles'
import { DIFF_DISPLAY_MODE_OPTIONS, type DiffDisplayMode } from '../editor/SchemaDiffView'
import { ScrollableParams } from './ScrollableParams'

/** 工具栏模式类型 */
export type ToolbarMode = 'diff' | 'recording' | 'preview' | 'normal'

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
  /** 当前对比显示模式 */
  diffDisplayMode?: DiffDisplayMode
  /** 对比显示模式变化回调 */
  onDiffDisplayModeChange?: (mode: DiffDisplayMode) => void
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
 * 无论 Diff 模式还是默认模式，工具栏结构保持一致，避免切换动画
 */
export const DrawerToolbar: React.FC<DrawerToolbarProps> = (props) => {
  const {
    mode = 'normal',
    attributes,
    contentType,
    canParse,
    toolbarButtons,
    previewEnabled = false,
    isRecording = false,
    showDiffButton = false,
    isDiffMode = false,
    diffDisplayMode = 'raw',
    onDiffDisplayModeChange,
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

  /** 判断是否为 Diff 模式（支持 mode prop 和 isDiffMode prop） */
  const isInDiffMode = mode === 'diff' || isDiffMode

  /** Diff 按钮点击处理：根据当前模式决定进入或退出 */
  const handleDiffButtonClick = () => {
    if (isInDiffMode) {
      onExitDiffMode?.()
    } else {
      onEnterDiffMode?.()
    }
  }

  return (
    <StyledEditorToolbar>
      {/* 参数区域：仅非 Diff 模式显示，Diff 模式使用等高占位保持按钮位置一致 */}
      {!isInDiffMode ? (
        <ScrollableParams params={attributes.params || []} onCopyParam={onCopyParam} />
      ) : (
        <div style={{ flex: 1, minHeight: 32 }} />
      )}

      <ButtonGroup>
        {/* 更新预览按钮：仅预览模式且非 Diff 时显示 */}
        {!isInDiffMode && previewEnabled && onRenderPreview && (
          <ToolbarButton size="small" type="primary" onClick={onRenderPreview}>
            更新预览
          </ToolbarButton>
        )}

        {/* 修复确认按钮：仅 Diff 模式且有待确认的修复时显示 */}
        {isInDiffMode && hasPendingRepair && onApplyRepair && onCancelRepair && (
          <>
            <Tooltip title="应用修复后的内容">
              <ToolbarButton size="small" type="primary" onClick={onApplyRepair}>
                应用修复
              </ToolbarButton>
            </Tooltip>
            <Tooltip title="取消修复，恢复原内容">
              <ToolbarButton size="small" onClick={onCancelRepair}>
                取消
              </ToolbarButton>
            </Tooltip>
          </>
        )}

        {/* AST/RawString 切换：仅非 Diff 模式显示 */}
        {!isInDiffMode && toolbarButtons.astRawStringToggle && (
          <Tooltip
            title={
              isRecording
                ? '录制中不可切换'
                : contentType === ContentType.Other
                  ? '当前数据类型错误'
                  : ''
            }
          >
            <ToolbarSegmented
              options={[
                { label: 'AST', value: ContentType.Ast },
                { label: 'RawString', value: ContentType.RawString },
              ]}
              value={contentType === ContentType.Other ? undefined : contentType}
              onChange={onSegmentChange}
              disabled={contentType === ContentType.Other || isRecording}
            />
          </Tooltip>
        )}

        {/* 转义/去转义按钮：仅非 Diff 模式显示 */}
        {!isInDiffMode && toolbarButtons.escape && (
          <>
            <Tooltip title="将内容包装成字符串值，添加引号和转义">
              <ToolbarButton size="small" onClick={onEscape}>
                转义
              </ToolbarButton>
            </Tooltip>
            <Tooltip title="将字符串值还原，移除外层引号和转义">
              <ToolbarButton size="small" onClick={onUnescape}>
                去转义
              </ToolbarButton>
            </Tooltip>
          </>
        )}

        {/* 压缩按钮：仅非 Diff 模式显示 */}
        {!isInDiffMode && toolbarButtons.serialize && (
          <Tooltip title="将 JSON 压缩成一行">
            <ToolbarButton size="small" onClick={onCompact}>
              压缩
            </ToolbarButton>
          </Tooltip>
        )}

        {/* 解析按钮：仅非 Diff 模式显示 */}
        {!isInDiffMode && toolbarButtons.deserialize && (
          <Tooltip title={!canParse ? '当前内容不是有效的 JSON 格式' : '解析多层嵌套/转义的 JSON'}>
            <ToolbarButton size="small" onClick={onParse} disabled={!canParse}>
              解析
            </ToolbarButton>
          </Tooltip>
        )}

        {/* 格式化按钮：仅非 Diff 模式显示 */}
        {!isInDiffMode && toolbarButtons.format && (
          <Tooltip title={!canParse ? '当前内容不是有效的 JSON 格式' : ''}>
            <ToolbarButton size="small" onClick={onFormat} disabled={!canParse}>
              格式化
            </ToolbarButton>
          </Tooltip>
        )}

        {/* 定位错误按钮：仅非 Diff 模式显示 */}
        {!isInDiffMode && onLocateError && (
          <Tooltip title="定位 JSON 语法错误位置（支持检测字符串内部的 JSON）">
            <ToolbarButton size="small" onClick={onLocateError}>
              定位错误
            </ToolbarButton>
          </Tooltip>
        )}

        {/* 修复JSON按钮：仅非 Diff 模式显示 */}
        {!isInDiffMode && onRepairJson && (
          <Tooltip title="尝试自动修复 JSON 语法错误（支持修复字符串内部的 JSON）">
            <ToolbarButton size="small" onClick={onRepairJson}>
              修复JSON
            </ToolbarButton>
          </Tooltip>
        )}

        {/* 对比显示模式选择器：仅 Diff 模式显示 */}
        {isInDiffMode && (
          <Tooltip title="选择数据展示格式进行对比">
            <ToolbarSegmented
              size="small"
              value={diffDisplayMode}
              onChange={(value) => onDiffDisplayModeChange?.(value as DiffDisplayMode)}
              options={DIFF_DISPLAY_MODE_OPTIONS}
            />
          </Tooltip>
        )}

        {/* Diff 按钮：始终显示，根据模式决定样式和行为 */}
        {showDiffButton && (
          <ToolbarButton
            size="small"
            type={isInDiffMode ? 'primary' : 'default'}
            onClick={handleDiffButtonClick}
          >
            Diff
          </ToolbarButton>
        )}
      </ButtonGroup>
    </StyledEditorToolbar>
  )
}
