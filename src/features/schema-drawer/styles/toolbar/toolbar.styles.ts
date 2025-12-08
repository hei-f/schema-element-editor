import { Button, Segmented } from 'antd'
import styled from 'styled-components'

/**
 * 编辑器工具栏
 * 单行布局，不换行
 */
export const EditorToolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: 12px;
  background: #f7f8fa;
  gap: 12px;
  flex-wrap: nowrap;
  overflow: hidden;
`

/**
 * 参数容器外层包装器
 * 用于实现动态渐变遮罩效果，透明度根据滚动偏移量平滑变化
 * 支持通过 $hidden 属性控制隐藏
 */
export const ParamsContainerWrapper = styled.div<{
  $leftMaskOpacity: number
  $rightMaskOpacity: number
  $hidden?: boolean
}>`
  position: relative;
  flex-shrink: 1;
  min-width: 0;
  max-width: 50%;
  display: ${(props) => (props.$hidden ? 'none' : 'block')};

  /* 左侧渐变遮罩 */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 20px;
    background: linear-gradient(to right, rgba(247, 248, 250, 0.95), transparent);
    pointer-events: none;
    z-index: 1;
    opacity: ${(props) => props.$leftMaskOpacity};
  }

  /* 右侧渐变遮罩 */
  &::after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 20px;
    background: linear-gradient(to left, rgba(247, 248, 250, 0.95), transparent);
    pointer-events: none;
    z-index: 1;
    opacity: ${(props) => props.$rightMaskOpacity};
  }
`

/**
 * 参数容器
 * 支持水平滚动，隐藏滚动条
 */
export const ParamsContainer = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  align-items: center;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0;
  scroll-behavior: smooth;

  /* 隐藏滚动条 */
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
`

/**
 * 单个参数项
 */
export const ParamItem = styled.div`
  display: flex;
  align-items: center;
  max-width: 200px;
  min-width: 0;
  flex-shrink: 0;
`

/**
 * 属性标签包装器（支持复制功能）
 * 作为 Flex 容器，内部展示参数标签和复制图标
 */
export const AttributeTagWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background:
    linear-gradient(
      0deg,
      color-mix(in srgb, var(--drawer-theme-color, #1677ff) 15%, transparent),
      color-mix(in srgb, var(--drawer-theme-color, #1677ff) 15%, transparent)
    ),
    #ffffff;
  border-radius: 8px;
  font-size: 12px;
  /* line-height: 16px; */
  color: #666f8d;
  cursor: pointer;
`

/**
 * 按钮组（保留用于兼容）
 */
export const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex-shrink: 0;
  justify-content: flex-end;
  align-items: center;
`

/**
 * 响应式按钮组容器
 * flex 布局，确保固定按钮始终在右侧
 */
export const ResponsiveButtonGroupContainer = styled.div`
  position: relative;
  display: flex;
  flex: 1;
  min-width: 0;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
`

/**
 * 响应式按钮组可滚动区域
 * 包含普通按钮，overflow: hidden 裁剪超出部分
 */
export const ResponsiveButtonGroupScrollable = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  align-items: center;
  min-width: 0;
  flex: 1;
  /* overflow: hidden; */
`

/**
 * 响应式按钮组固定区域
 * 包含更多按钮和固定按钮，始终显示
 */
export const ResponsiveButtonGroupFixed = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
`

/**
 * 更多按钮
 */
export const MoreButton = styled(Button)`
  &.see-btn {
    border-radius: 16px;
    padding: 2px 8px;
    font-size: 12px;
    height: 24px;
    line-height: 1.5;
    border: 1px solid #e6ecf4;
    color: #666f8d;
    background: #ffffff;

    &:hover {
      border-color: #c9d1e0;
      color: #4a5168;
      background: #f5f7fa;
    }

    &:active {
      border-color: #b8c2d4;
      color: #3d4459;
      background: #eef1f6;
    }

    &:focus {
      border-color: #e6ecf4;
      box-shadow: none;
    }
  }
`

/**
 * 更多菜单容器
 */
export const MoreMenuContainer = styled.div`
  min-width: 100px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow:
    0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);
  padding: 4px;
`

/**
 * 更多菜单项
 */
export const MoreMenuItem = styled.div<{ $disabled?: boolean }>`
  padding: 8px 12px;
  font-size: 12px;
  color: ${(props) => (props.$disabled ? '#bfbfbf' : '#666f8d')};
  cursor: ${(props) => (props.$disabled ? 'not-allowed' : 'pointer')};
  border-radius: 6px;
  transition: background 0.2s;
  white-space: nowrap;

  &:hover {
    background: ${(props) => (props.$disabled ? 'transparent' : '#f5f7fa')};
  }
`

/**
 * 工具栏按钮
 * 普通按钮使用固定样式，primary 按钮使用 CSS 变量 --drawer-theme-color 作为主题色
 * 使用固定高度避免 hover 时高度变化
 */
export const ToolbarButton = styled(Button)`
  &.see-btn {
    border-radius: 16px;
    padding: 2px 12px;
    font-size: 12px;
    height: 24px;
    line-height: 1.5;
  }
  /* border-radius: 16px;
  padding: 2px 12px;
  font-size: 12px;
  min-height: 24px;
  line-height: 1.5; */

  /* primary 按钮使用主题色（仅非禁用状态） */
  &.see-btn-primary:not(:disabled):not(.see-btn-disabled) {
    border: 1px solid transparent;
    background: var(--drawer-theme-color, #1677ff);
    color: #ffffff;

    &:hover {
      background: color-mix(in srgb, var(--drawer-theme-color, #1677ff) 85%, #ffffff);
    }

    &:active {
      background: color-mix(in srgb, var(--drawer-theme-color, #1677ff) 85%, #000000);
    }
  }
`

/**
 * 工具栏 Segmented 切换组件
 * 使用类型断言保留 Segmented 的泛型能力
 */
export const ToolbarSegmented = styled(Segmented)`
  &.see-segmented {
    border-radius: 16px !important;
    background: #e6ecf4 !important;
    padding: 2px !important;
    font-size: 12px;
    color: #666f8d;
    min-height: auto !important;
  }

  .see-segmented-group {
    gap: 0;
  }

  .see-segmented-item {
    border-radius: 16px !important;
    font-size: 12px;
    color: #666f8d;
    /* transition: all 0.2s; */
    background: transparent !important;
  }

  .see-segmented-item-label {
    padding: 2px 8px !important;
    min-height: auto !important;
    line-height: 1.5 !important;
    font-size: 12px;
    color: #666f8d;
  }

  .see-segmented-item-selected {
    background: #ffffff !important;
    color: #353e5c;
  }

  .see-segmented-item-selected .see-segmented-item-label {
    color: #353e5c !important;
  }

  .see-segmented-thumb {
    border-radius: 16px !important;
    background: #ffffff !important;
  }
` as typeof Segmented

/**
 * 属性标签（params 胶囊样式）
 * 使用 CSS 变量 --drawer-theme-color 作为主题色，默认为 #1677FF
 */
export const AttributeTag = styled.span`
  display: inline-block;
  padding: 4px 8px;
  background:
    linear-gradient(
      0deg,
      color-mix(in srgb, var(--drawer-theme-color, #1677ff) 15%, transparent),
      color-mix(in srgb, var(--drawer-theme-color, #1677ff) 15%, transparent)
    ),
    #ffffff;
  border-radius: 8px;
  font-size: 12px;
  line-height: 16px;
  color: #666f8d;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: help;
`

/**
 * 参数标签
 */
export const ParamLabel = styled.span`
  font-size: 12px;
  color: #8c8c8c;
  margin-right: 4px;
  flex-shrink: 0;
`

/**
 * 复制图标包装器
 * 默认展示，点击可复制
 */
export const CopyIconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 16px;
  cursor: pointer;
`

/**
 * 复制图标样式
 */
export const StyledCopyIcon = styled.span`
  font-size: 12px;
  color: #666f8d;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 16px;
  line-height: 1;
  vertical-align: middle;

  svg {
    display: block;
  }
`
