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
 * 背景色与工具栏一致
 */
export const RecordingStatusBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f7f8fa;
  border-radius: 12px;
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
  gap: 8px;
`

/**
 * 录制面板（左侧）
 */
export const RecordingPanelContainer = styled.div`
  width: 180px;
  min-width: 180px;
  display: flex;
  flex-direction: column;
  background: #eaebed;
  border-radius: 12px;
`

/**
 * 面板头部
 */
export const PanelHeader = styled.div`
  padding: 8px 16px;
  border-width: 0px 0px 1px 0px;
  border-style: solid;
  border-color: #e1e3e5;
  font-size: 14px;
  font-weight: 500;
  color: #353e5c;
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
  padding: 8px;
  cursor: pointer;
  transition: all 0.15s ease;

  ${(props) =>
    props.$isActive
      ? css`
          background: #f7f8fa;
          border-radius: 8px;
        `
      : css`
          background: transparent;
          border-radius: 6px;

          &:hover {
            background: rgba(0, 0, 0, 0.04);
          }
        `}
`

/**
 * 版本信息容器（左右布局）
 */
export const VersionInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`

/**
 * 版本序号
 */
export const VersionNumber = styled.span<{ $isActive?: boolean }>`
  font-size: 12px;
  font-weight: ${(props) => (props.$isActive ? 500 : 400)};
  color: ${(props) => (props.$isActive ? '#1677ff' : '#353e5c')};
`

/**
 * 版本时间
 */
export const VersionTimestamp = styled.span`
  font-size: 10px;
  color: #b9c0cb;
`

/**
 * 编辑器区域（右侧）
 */
export const RecordingEditorArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 12px;
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
  border-radius: 12px;
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
 * 录制操作按钮基础样式（统一尺寸）
 */
const recordingActionButtonBase = css`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 100px;
  height: 32px;
  padding: 0 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
`

/**
 * 停止按钮样式（显眼）
 */
export const StopRecordingButton = styled.button`
  ${recordingActionButtonBase}
  background: linear-gradient(135deg, #ff4d4f 0%, #f5222d 100%);
  border: none;
  color: white;
  box-shadow: 0 2px 8px rgba(255, 77, 79, 0.3);

  &:hover {
    background: linear-gradient(135deg, #ff7875 0%, #ff4d4f 100%);
    box-shadow: 0 4px 12px rgba(255, 77, 79, 0.4);
  }
`

/**
 * Diff按钮
 * 禁用状态使用更明显的灰色样式，确保在浅色背景上可见
 */
export const DiffButton = styled.button<{ $disabled?: boolean }>`
  ${recordingActionButtonBase}
  background: ${(props) => (props.$disabled ? '#e6ecf4' : 'rgba(24, 144, 255, 0.15)')};
  border: 1px solid ${(props) => (props.$disabled ? '#d9e0ea' : 'rgba(24, 144, 255, 0.3)')};
  color: ${(props) => (props.$disabled ? '#a0aec0' : '#1890ff')};
  cursor: ${(props) => (props.$disabled ? 'not-allowed' : 'pointer')};

  ${(props) =>
    !props.$disabled &&
    css`
      &:hover {
        background: rgba(24, 144, 255, 0.25);
        border-color: rgba(24, 144, 255, 0.5);
      }
    `}
`
