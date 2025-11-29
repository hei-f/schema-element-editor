import styled, { css, keyframes } from 'styled-components'
import type { EditorThemeVars } from '../editor/editor-theme-vars'

/** 扩展 styled-components 的 DefaultTheme，添加编辑器主题变量 */
declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefaultTheme extends EditorThemeVars {}
}

/**
 * 录制指示器闪烁动画
 */
const pulseAnimation = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`

/**
 * 录制模式容器 - 左侧面板 + 右侧编辑器
 */
export const RecordingModeContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`

/**
 * 录制状态栏
 */
export const RecordingStatusBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: ${(props) => props.theme.toolbarBackground};
  border-bottom: 1px solid ${(props) => props.theme.toolbarBorder};
`

/**
 * 录制状态左侧信息
 */
export const RecordingStatusLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

/**
 * 录制指示器
 */
export const RecordingIndicator = styled.div<{ $isRecording: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;

  ${(props) =>
    props.$isRecording
      ? css`
          background: rgba(255, 77, 79, 0.15);
          color: #ff4d4f;

          &::before {
            content: '';
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #ff4d4f;
            animation: ${pulseAnimation} 1s ease-in-out infinite;
          }
        `
      : css`
          background: rgba(82, 196, 26, 0.15);
          color: #52c41a;

          &::before {
            content: '';
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #52c41a;
          }
        `}
`

/**
 * 版本计数
 */
export const VersionCount = styled.span`
  color: ${(props) => props.theme.textSecondary};
  font-size: 12px;
`

/**
 * 录制内容区域
 */
export const RecordingContentArea = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`

/**
 * 录制面板（左侧）
 */
export const RecordingPanelContainer = styled.div`
  width: 280px;
  min-width: 280px;
  display: flex;
  flex-direction: column;
  background: ${(props) => props.theme.panelBackground};
  border-right: 1px solid ${(props) => props.theme.panelBorder};
`

/**
 * 面板头部
 */
export const PanelHeader = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid ${(props) => props.theme.panelBorder};
  font-size: 13px;
  font-weight: 500;
  color: ${(props) => props.theme.textPrimary};
  display: flex;
  align-items: center;
  justify-content: space-between;
`

/**
 * 版本列表容器
 */
export const VersionListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.scrollbarThumb};
    border-radius: 3px;

    &:hover {
      background: ${(props) => props.theme.scrollbarThumbHover};
    }
  }
`

/**
 * 版本列表项
 */
export const VersionItem = styled.div<{ $isActive?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  margin-bottom: 4px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;

  ${(props) =>
    props.$isActive
      ? css`
          background: ${props.theme.listItemActiveBackground};
          border: 1px solid ${props.theme.listItemActiveBorder};
        `
      : css`
          background: transparent;
          border: 1px solid transparent;

          &:hover {
            background: ${props.theme.listItemHoverBackground};
            border-color: ${props.theme.listItemHoverBackground};
          }
        `}
`

/**
 * 版本信息
 */
export const VersionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

/**
 * 版本序号
 */
export const VersionNumber = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: ${(props) => props.theme.textPrimary};
`

/**
 * 版本时间
 */
export const VersionTimestamp = styled.span`
  font-size: 11px;
  color: ${(props) => props.theme.textSecondary};
`

/**
 * 编辑器区域（右侧）
 */
export const RecordingEditorArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

/**
 * Diff模式容器
 */
export const DiffModeContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: ${(props) => props.theme.panelBackground};
`

/**
 * Diff工具栏
 */
export const DiffToolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: ${(props) => props.theme.toolbarBackground};
  border-bottom: 1px solid ${(props) => props.theme.toolbarBorder};
`

/**
 * 版本选择器组
 */
export const VersionSelectorGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

/**
 * 版本选择器标签
 */
export const VersionSelectorLabel = styled.span`
  font-size: 12px;
  color: ${(props) => props.theme.textSecondary};
`

/**
 * Diff内容区域（滚动容器）
 */
export const DiffContentArea = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
  overscroll-behavior: contain;

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #4a5568;
    border-radius: 4px;

    &:hover {
      background: #5a6878;
    }
  }
`

type DiffLineType = 'added' | 'removed' | 'unchanged' | 'empty'

/**
 * Diff表格容器
 * 使用 table 布局确保左右行高对齐
 */
export const DiffTableContainer = styled.div`
  display: table;
  width: 100%;
  table-layout: fixed; /* 固定表格布局，防止水平滚动 */
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  line-height: 1.6;
  border-collapse: collapse;
`

/**
 * 表头
 */
export const DiffTableHeader = styled.div`
  display: table-row;
  position: sticky;
  top: 0;
  z-index: 10;
`

/**
 * 表头单元格
 */
export const DiffTableHeaderCell = styled.div<{ $isLeft?: boolean }>`
  display: table-cell;
  width: 50%;
  padding: 8px 16px;
  background: #282c34;
  border-bottom: 1px solid #b0b0b0;
  font-size: 12px;
  color: #abb2bf;

  ${(props) =>
    props.$isLeft &&
    css`
      border-right: 1px solid #b0b0b0;
    `}
`

/**
 * 表格主体
 */
export const DiffTableBody = styled.div`
  display: table-row-group;
`

/**
 * 表格行（包含左右两侧）
 */
export const DiffTableRow = styled.div`
  display: table-row;
`

/**
 * 单元格（左或右）
 */
export const DiffCell = styled.div<{ $type: DiffLineType; $isLeft?: boolean }>`
  display: table-cell;
  width: 50%;
  vertical-align: top;
  border-bottom: 1px solid #b0b0b0;

  ${(props) =>
    props.$isLeft &&
    css`
      border-right: 1px solid #b0b0b0;
    `}

  ${(props) => {
    switch (props.$type) {
      case 'added':
        return css`
          background: rgba(152, 195, 121, 0.12);
        `
      case 'removed':
        return css`
          background: rgba(224, 108, 117, 0.12);
        `
      case 'empty':
        return css`
          background: #f5f5f5;
        `
      default:
        return css`
          background: #f5f5f5;
        `
    }
  }}
`

/**
 * 单元格行号
 */
export const DiffCellLineNumber = styled.span<{ $type: DiffLineType }>`
  display: inline-block;
  width: 48px;
  min-width: 48px;
  padding: 2px 8px;
  text-align: right;
  user-select: none;
  border-right: 1px solid #b0b0b0;

  ${(props) => {
    switch (props.$type) {
      case 'added':
        return css`
          background: rgba(152, 195, 121, 0.18);
          color: #98c379;
        `
      case 'removed':
        return css`
          background: rgba(224, 108, 117, 0.18);
          color: #e06c75;
        `
      case 'empty':
        return css`
          background: #e8e8e8;
          color: transparent;
        `
      default:
        return css`
          background: #e8e8e8;
          color: #666666;
        `
    }
  }}
`

/**
 * 单元格内容
 */
export const DiffCellContent = styled.span<{ $type: DiffLineType }>`
  display: inline-block;
  padding: 2px 12px;
  white-space: pre-wrap;
  word-break: break-all;

  ${(props) => {
    switch (props.$type) {
      case 'added':
        return css`
          color: #98c379;
        `
      case 'removed':
        return css`
          color: #e06c75;
        `
      case 'empty':
        return css`
          color: transparent;
        `
      default:
        return css`
          /* 相同行使用深色文字（浅色背景） */
          color: #333333;
        `
    }
  }}
`

/**
 * 行内新增高亮
 */
export const DiffInlineAdd = styled.span`
  background: rgba(152, 195, 121, 0.4);
  color: #98c379;
  padding: 0 2px;
  border-radius: 2px;
`

/**
 * 行内删除高亮
 */
export const DiffInlineRemove = styled.span`
  background: rgba(224, 108, 117, 0.4);
  color: #e06c75;
  padding: 0 2px;
  border-radius: 2px;
`

/**
 * 语法高亮 - 键名（属性名）- 红色
 * 参考 schemaEditorDark: tags.propertyName
 */
export const SyntaxKeyword = styled.span`
  color: #e06c75;
  font-weight: bold;
`

/**
 * 语法高亮 - 字符串 - 绿色
 * 参考 schemaEditorDark: tags.string
 */
export const SyntaxString = styled.span`
  color: #98c379;
`

/**
 * 语法高亮 - 数字 - 橙色
 * 参考 schemaEditorDark: tags.number
 */
export const SyntaxNumber = styled.span`
  color: #d19a66;
`

/**
 * 语法高亮 - 布尔值 - 橙色加粗
 * 参考 schemaEditorDark: tags.bool
 */
export const SyntaxBoolean = styled.span`
  color: #d19a66;
  font-weight: bold;
`

/**
 * 语法高亮 - null - 橙色加粗
 * 参考 schemaEditorDark: tags.null
 */
export const SyntaxNull = styled.span`
  color: #d19a66;
  font-weight: bold;
`

/**
 * 语法高亮 - 标点符号（逗号、冒号）
 * 参考 schemaEditorDark: tags.separator
 */
export const SyntaxPunctuation = styled.span`
  color: #abb2bf;
`

/**
 * 语法高亮 - 方括号 - 黄色
 * 参考 schemaEditorDark: tags.squareBracket
 */
export const SyntaxSquareBracket = styled.span`
  color: #e8ba36;
  font-weight: bold;
`

/**
 * 语法高亮 - 花括号 - 绿色
 * 参考 schemaEditorDark: tags.brace
 */
export const SyntaxBrace = styled.span`
  color: #54a857;
  font-weight: bold;
`

/**
 * 空状态提示
 */
export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${(props) => props.theme.textSecondary};
  font-size: 14px;
  gap: 8px;
`

/**
 * 可编辑 Diff 视图容器
 */
export const EditableDiffContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background: ${(props) => props.theme.panelBackground};
`

/**
 * Diff 头部行（包含两个面板头部）
 */
export const DiffHeaderRow = styled.div`
  display: flex;
  flex-shrink: 0;
`

/**
 * 编辑器面板头部
 */
export const DiffEditorHeader = styled.div<{ $isLeft?: boolean }>`
  flex: 1;
  padding: 8px 16px;
  background: ${(props) => props.theme.headerBackground};
  border-bottom: 1px solid ${(props) => props.theme.panelBorder};
  font-size: 12px;
  color: ${(props) => props.theme.headerTextColor};
  font-weight: 500;
  ${(props) => props.$isLeft && `border-right: 1px solid ${props.theme.panelBorder};`}
`

/**
 * 共享滚动容器（核心：统一滚动）
 */
export const SharedScrollContainer = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
  background: ${(props) => props.theme.panelBackground};

  &::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }

  &::-webkit-scrollbar-track {
    background: ${(props) => props.theme.scrollbarTrack};
  }

  &::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.scrollbarThumb};
    border-radius: 6px;
    border: 3px solid ${(props) => props.theme.scrollbarTrack};

    &:hover {
      background: ${(props) => props.theme.scrollbarThumbHover};
    }
  }
`

/**
 * 编辑器内容行（两个编辑器并排）
 */
export const DiffEditorsRow = styled.div`
  display: flex;
  min-height: 100%;
`

/**
 * 单侧编辑器面板（无滚动）
 */
export const DiffEditorPanel = styled.div<{ $isLeft?: boolean }>`
  flex: 1;
  min-width: 0;
  ${(props) => props.$isLeft && `border-right: 1px solid ${props.theme.panelBorder};`}
`

/**
 * 编辑器包装容器（禁用垂直滚动，启用水平滚动）
 */
export const DiffEditorWrapper = styled.div`
  position: relative;

  /* CodeMirror 编辑器：禁用垂直滚动，让外部容器统一滚动 */
  .cm-editor {
    height: auto !important;
  }

  .cm-scroller {
    overflow-y: visible !important;
    overflow-x: auto !important; /* 允许水平滚动 */
  }

  .cm-content {
    min-height: auto !important;
  }

  /* 隐藏水平滚动条，使用共享滚动 */
  .cm-scroller::-webkit-scrollbar {
    height: 0;
  }
`

/**
 * 斜条纹占位行样式
 * 灰色斜条纹背景，不占行号
 */
export const PlaceholderLineStyle = styled.div`
  height: 19.2px; /* 与编辑器行高一致 (12px * 1.6) */
  background: repeating-linear-gradient(-45deg, #e8e8e8, #e8e8e8 4px, #f5f5f5 4px, #f5f5f5 8px);
  border-bottom: 1px solid #e0e0e0;
  box-sizing: border-box;
`

/**
 * 深色主题斜条纹占位行
 */
export const PlaceholderLineStyleDark = styled.div`
  height: 19.2px;
  background: repeating-linear-gradient(-45deg, #2d3748, #2d3748 4px, #1a202c 4px, #1a202c 8px);
  border-bottom: 1px solid #4a5568;
  box-sizing: border-box;
`

/**
 * 行高亮背景 - 新增行
 */
export const AddedLineBackground = `
  background: rgba(152, 195, 121, 0.15);
`

/**
 * 行高亮背景 - 删除行
 */
export const RemovedLineBackground = `
  background: rgba(224, 108, 117, 0.15);
`

/**
 * 行高亮背景 - 修改行
 */
export const ModifiedLineBackground = `
  background: rgba(229, 192, 123, 0.15);
`

/**
 * 停止按钮样式（显眼）
 */
export const StopRecordingButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  background: linear-gradient(135deg, #ff4d4f 0%, #f5222d 100%);
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(255, 77, 79, 0.3);

  &:hover {
    background: linear-gradient(135deg, #ff7875 0%, #ff4d4f 100%);
    box-shadow: 0 4px 12px rgba(255, 77, 79, 0.4);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`

/**
 * Diff按钮
 */
export const DiffButton = styled.button<{ $disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: ${(props) =>
    props.$disabled ? 'rgba(255, 255, 255, 0.05)' : 'rgba(24, 144, 255, 0.15)'};
  border: 1px solid ${(props) => (props.$disabled ? 'transparent' : 'rgba(24, 144, 255, 0.3)')};
  border-radius: 6px;
  color: ${(props) => (props.$disabled ? '#6b7280' : '#1890ff')};
  font-size: 12px;
  cursor: ${(props) => (props.$disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease;

  ${(props) =>
    !props.$disabled &&
    css`
      &:hover {
        background: rgba(24, 144, 255, 0.25);
        border-color: rgba(24, 144, 255, 0.5);
      }
    `}
`
