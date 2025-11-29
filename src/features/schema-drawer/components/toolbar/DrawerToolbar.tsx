import type { ElementAttributes, ToolbarButtonsConfig } from '@/shared/types'
import { ContentType } from '@/shared/types'
import { Button, Segmented, Tooltip } from 'antd'
import { DiffOutlined } from '@ant-design/icons'
import React from 'react'
import {
  ButtonGroup,
  EditorToolbar as StyledEditorToolbar,
} from '../../styles/toolbar/toolbar.styles'
import { DIFF_DISPLAY_MODE_OPTIONS, type DiffDisplayMode } from '../editor/SchemaDiffView'
import { ScrollableParams } from './ScrollableParams'

interface DrawerToolbarProps {
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
}

/**
 * 抽屉工具栏组件
 */
export const DrawerToolbar: React.FC<DrawerToolbarProps> = ({
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
}) => {
  // Diff 模式下的简化工具栏
  if (isDiffMode) {
    return (
      <StyledEditorToolbar>
        <div style={{ flex: 1 }} />
        <ButtonGroup>
          {/* 修复确认按钮（如果有待确认的修复） */}
          {hasPendingRepair && onApplyRepair && onCancelRepair && (
            <>
              <Tooltip title="应用修复后的内容">
                <Button size="small" type="primary" onClick={onApplyRepair}>
                  应用修复
                </Button>
              </Tooltip>
              <Tooltip title="取消修复，恢复原内容">
                <Button size="small" onClick={onCancelRepair}>
                  取消
                </Button>
              </Tooltip>
            </>
          )}
          <Tooltip title="选择数据展示格式进行对比">
            <Segmented
              size="small"
              value={diffDisplayMode}
              onChange={(value) => onDiffDisplayModeChange?.(value as DiffDisplayMode)}
              options={DIFF_DISPLAY_MODE_OPTIONS}
            />
          </Tooltip>
          <Tooltip title="关闭对比模式">
            <Button size="small" type="primary" icon={<DiffOutlined />} onClick={onExitDiffMode}>
              对比
            </Button>
          </Tooltip>
        </ButtonGroup>
      </StyledEditorToolbar>
    )
  }

  return (
    <StyledEditorToolbar>
      <ScrollableParams params={attributes.params || []} />
      <ButtonGroup>
        {previewEnabled && onRenderPreview && (
          <Button size="small" type="primary" onClick={onRenderPreview}>
            更新预览
          </Button>
        )}
        {toolbarButtons.astRawStringToggle && (
          <Tooltip
            title={
              isRecording
                ? '录制中不可切换'
                : contentType === ContentType.Other
                  ? '当前数据类型错误'
                  : ''
            }
          >
            <Segmented
              size="small"
              shape="round"
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
        {toolbarButtons.escape && (
          <>
            <Tooltip title="将内容包装成字符串值，添加引号和转义">
              <Button size="small" onClick={onEscape}>
                转义
              </Button>
            </Tooltip>
            <Tooltip title="将字符串值还原，移除外层引号和转义">
              <Button size="small" onClick={onUnescape}>
                去转义
              </Button>
            </Tooltip>
          </>
        )}
        {toolbarButtons.serialize && (
          <Tooltip title="将 JSON 压缩成一行">
            <Button size="small" onClick={onCompact}>
              压缩
            </Button>
          </Tooltip>
        )}
        {toolbarButtons.deserialize && (
          <Tooltip title={!canParse ? '当前内容不是有效的 JSON 格式' : '解析多层嵌套/转义的 JSON'}>
            <Button size="small" onClick={onParse} disabled={!canParse}>
              解析
            </Button>
          </Tooltip>
        )}
        {toolbarButtons.format && (
          <Tooltip title={!canParse ? '当前内容不是有效的 JSON 格式' : ''}>
            <Button size="small" onClick={onFormat} disabled={!canParse}>
              格式化
            </Button>
          </Tooltip>
        )}
        {/* JSON 错误诊断按钮（始终可用，点击时智能判断） */}
        {onLocateError && (
          <Tooltip title="定位 JSON 语法错误位置（支持检测字符串内部的 JSON）">
            <Button size="small" onClick={onLocateError}>
              定位错误
            </Button>
          </Tooltip>
        )}
        {onRepairJson && (
          <Tooltip title="尝试自动修复 JSON 语法错误（支持修复字符串内部的 JSON）">
            <Button size="small" onClick={onRepairJson}>
              修复JSON
            </Button>
          </Tooltip>
        )}
        {showDiffButton && onEnterDiffMode && (
          <Tooltip title="对比模式：对比两段内容的差异">
            <Button size="small" onClick={onEnterDiffMode}>
              Diff
            </Button>
          </Tooltip>
        )}
      </ButtonGroup>
    </StyledEditorToolbar>
  )
}
