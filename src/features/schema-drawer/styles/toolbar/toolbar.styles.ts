import styled from 'styled-components'

/**
 * 编辑器工具栏
 */
export const EditorToolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px 16px 16px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
  gap: 12px;
  flex-wrap: wrap;
`

/**
 * 参数容器外层包装器
 * 用于实现动态渐变遮罩效果，透明度根据滚动偏移量平滑变化
 */
export const ParamsContainerWrapper = styled.div<{
  $leftMaskOpacity: number
  $rightMaskOpacity: number
}>`
  position: relative;
  flex: 1;
  min-width: 0;
  max-width: calc(100% - 500px);

  /* 左侧渐变遮罩 */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 20px;
    background: linear-gradient(to right, rgba(255, 255, 255, 0.95), transparent);
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
    background: linear-gradient(to left, rgba(255, 255, 255, 0.95), transparent);
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
  padding: 4px 0;
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
 */
export const AttributeTagWrapper = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  overflow: hidden;

  &:hover .copy-icon-wrapper {
    opacity: 1;
  }
`

/**
 * 按钮组
 */
export const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex-shrink: 0;
  justify-content: flex-end;
`

/**
 * 属性标签
 */
export const AttributeTag = styled.span`
  display: inline-block;
  padding: 2px 8px;
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 4px;
  font-size: 12px;
  line-height: 16px;
  color: #0050b3;
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
 */
export const CopyIconWrapper = styled.span`
  position: absolute;
  right: 4px;
  top: 3px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 16px;
  opacity: 0;
  transition:
    opacity 0.2s ease,
    background-color 0.2s ease;
  cursor: pointer;
  z-index: 1;
  padding: 0 3px;
  background-color: rgba(230, 247, 255, 0.95);
  border-radius: 3px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    opacity: 1 !important;
    background-color: rgba(230, 247, 255, 1);
  }
`

/**
 * 复制图标样式
 */
export const StyledCopyIcon = styled.span<{ $isSuccess?: boolean }>`
  font-size: 12px;
  color: ${(props) => (props.$isSuccess ? '#52c41a' : '#0050b3')};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 16px;
  line-height: 1;
  vertical-align: middle;
  transition:
    color 0.2s ease,
    transform 0.2s ease,
    opacity 0.2s ease;

  &:hover {
    color: ${(props) => (props.$isSuccess ? '#52c41a' : '#003a8c')};
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    display: block;
  }
`
