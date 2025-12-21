import styled, { keyframes } from 'styled-components'

/**
 * 抽屉内容容器
 */
export const DrawerContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0 24px;
  gap: 12px;
`

/**
 * 模式切换容器
 * 用于包裹多个 ModeContentWrapper，限制绝对定位元素不溢出到 padding 区域
 */
export const ModeSwitchContainer = styled.div`
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`

/** 预览模式布局间距常量 */
const PREVIEW_GAP = 16
const RESIZER_WIDTH = 4
/** 拖动条距离预览区域右边缘的偏移：(GAP - RESIZER_WIDTH) / 2 - GAP/2 = -6px */
const RESIZER_LEFT_OFFSET = (PREVIEW_GAP - RESIZER_WIDTH) / 2 - PREVIEW_GAP / 2

/**
 * 预览区域可拖拽分隔条
 * 使用绝对定位放置在 gap 中间
 * 位置计算：预览区域宽度 = calc(previewWidth% - 8px)
 *          拖动条居中在 gap
 */
export const PreviewResizer = styled.div<{ $isDragging?: boolean; $previewWidth?: number }>`
  width: ${RESIZER_WIDTH}px;
  height: 100%;
  background: ${(props) => (props.$isDragging ? 'var(--see-color-primary, #1677ff)' : '#d9d9d9')};
  cursor: col-resize;
  position: absolute;
  left: calc(${(props) => props.$previewWidth || 0}% + ${RESIZER_LEFT_OFFSET}px);
  top: 0;
  transition: ${(props) => (props.$isDragging ? 'none' : 'left 300ms ease-out, background 0.2s')};
  border-radius: 2px;
  user-select: none;
  z-index: 10;

  &:hover {
    background: var(--see-color-primary, #1677ff);
  }

  /* 扩大点击热区 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -6px;
    right: -6px;
    bottom: 0;
    cursor: col-resize;
  }
`

/**
 * 预览模式主容器
 * 作为整个预览模式的根容器，使用 flex 布局
 */
export const PreviewModeContainer = styled.div`
  display: flex;
  height: 100%;
`

/**
 * 预览区域和编辑区域并排容器
 * 使用 gap 实现两个区域之间的间距
 */
export const PreviewEditorRow = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
  position: relative;
  overflow: hidden;
  gap: ${PREVIEW_GAP}px;
`

/**
 * 预览占位区域
 * 使用百分比宽度动态控制预览区域大小，通过 calc 补偿 gap 的一半
 * $width: 预览区域宽度百分比
 * $isClosing: 关闭过渡状态，宽度动画到 0
 * $isOpening: 打开过渡状态，宽度从 0 动画到目标值
 * $isDragging: 拖拽状态，禁用 transition 以实现实时响应
 */
export const PreviewPlaceholder = styled.div<{
  $width?: number
  $isClosing?: boolean
  $isOpening?: boolean
  $isDragging?: boolean
}>`
  width: ${(props) => {
    if (props.$isClosing || props.$isOpening) return '0'
    // 使用 calc 补偿 gap 的一半（8px）
    return props.$width ? `calc(${props.$width}% - ${PREVIEW_GAP / 2}px)` : 'auto'
  }};
  flex-shrink: 0;
  min-width: 0;
  background: #f7f8fa;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
  position: relative;
  overflow: hidden;
  transition: ${(props) => (props.$isDragging ? 'none' : 'width 300ms ease-out')};
`

/**
 * 拖拽时的蒙层样式 - 静止条纹效果
 * 宽度需要与 PreviewPlaceholder 保持一致，使用 calc 补偿 gap
 */
export const DragOverlay = styled.div<{ $width: number }>`
  position: absolute;
  top: 0;
  left: 0;
  width: calc(${(props) => props.$width}% - ${PREVIEW_GAP / 2}px);
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 5;
  pointer-events: none;
  box-sizing: border-box;
  border-radius: 12px;

  /* 虚线边框 */
  border: 2px dashed color-mix(in srgb, var(--see-color-primary, #1677ff) 60%, transparent);

  /* 静止条纹效果 */
  background-image: linear-gradient(
    45deg,
    color-mix(in srgb, var(--see-color-primary, #1677ff) 12%, transparent) 25%,
    color-mix(in srgb, var(--see-color-primary, #1677ff) 4%, transparent) 25%,
    color-mix(in srgb, var(--see-color-primary, #1677ff) 4%, transparent) 50%,
    color-mix(in srgb, var(--see-color-primary, #1677ff) 12%, transparent) 50%,
    color-mix(in srgb, var(--see-color-primary, #1677ff) 12%, transparent) 75%,
    color-mix(in srgb, var(--see-color-primary, #1677ff) 4%, transparent) 75%
  );
  background-size: 40px 40px;
`

/**
 * 拖拽时显示的宽度百分比文字
 */
export const DragWidthIndicator = styled.div`
  font-size: 32px;
  font-weight: 600;
  color: var(--see-color-primary, #1677ff);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 8px;
`

/**
 * 拖拽提示文字
 */
export const DragHintText = styled.div`
  font-size: 14px;
  color: #666;
`

/**
 * 预览模式下的编辑区域容器（工具栏 + 编辑器）
 * 使用 flex: 1 占据预览区域之外的剩余空间
 */
export const PreviewEditArea = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  position: relative;
  gap: 12px;
`

/**
 * 预览模式下的编辑器容器
 * 包含编辑器和轻量通知，带有圆角样式
 */
export const PreviewEditorContainer = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
`

/**
 * 模式切换进入动画
 * 使用 translateY 而非 opacity，避免从透明开始导致的"闪白"
 */
const modeEnter = keyframes`
  from {
    transform: translateY(8px);
  }
  to {
    transform: translateY(0);
  }
`

/**
 * 全屏模式过渡容器
 * 用于 Diff 模式和预览模式之间的平滑切换
 * $animate: 是否应用过渡动画（仅在全屏模式之间切换时需要）
 */
export const FullScreenModeWrapper = styled.div<{ $animate?: boolean }>`
  display: flex;
  flex-direction: column;
  height: 100%;
  animation: ${(props) => (props.$animate ? modeEnter : 'none')} 150ms ease-out;
`

/**
 * 内容区域容器
 * 用于保持所有模式内容在 DOM 中，通过 CSS 控制显示/隐藏
 */
export const ContentAreaContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  position: relative;
  gap: 12px;
`

/**
 * 模式内容包装器
 * 根据 $active 控制显示/隐藏，保持组件在 DOM 中避免重建
 * 使用 visibility + height 隐藏而非 display:none，保持内部组件状态
 */
export const ModeContentWrapper = styled.div<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: ${(props) => (props.$active ? 2 : 1)};
  /* 非活跃的立即隐藏，不参与过渡 */
  visibility: ${(props) => (props.$active ? 'visible' : 'hidden')};
  /* 活跃的始终不透明，只用 transform 动画增加动感 */
  opacity: 1;
  transform: translateY(${(props) => (props.$active ? '0' : '12px')});
  /* 只有激活时才有过渡动画（从偏移位置滑入） */
  transition: ${(props) => (props.$active ? 'transform 180ms ease-out' : 'none')};
  pointer-events: ${(props) => (props.$active ? 'auto' : 'none')};
`

/**
 * Suspense 加载提示容器
 * 用于统一 Suspense fallback 的样式
 */
export const SuspenseFallbackContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
`
