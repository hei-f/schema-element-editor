import styled from 'styled-components'

/**
 * 现代化下拉菜单样式系统
 * 提供统一的视觉语言和交互体验
 * 可用于历史记录、主题选择、工具栏等各类下拉场景
 */

/**
 * 下拉容器基础样式
 */
export const ModernDropdownContainer = styled.div<{ $isDark?: boolean }>`
  display: flex;
  flex-direction: column;
  background-color: ${(props) => (props.$isDark ? '#252526' : '#ffffff')};
  border-radius: 8px;
  box-shadow: ${(props) =>
    props.$isDark
      ? '0 8px 24px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3)'
      : '0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)'};
  border: 1px solid ${(props) => (props.$isDark ? '#3a3a3a' : '#e0e0e0')};
  overflow: hidden;
  backdrop-filter: blur(10px);
`

/**
 * 下拉列表容器
 * 使用 gap 实现子元素间隔
 */
export const ModernDropdownList = styled.div<{ $maxHeight?: string }>`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px 4px;
  max-height: ${(props) => props.$maxHeight || '320px'};
  overflow-y: auto;

  /* 滚动条样式 */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.15);
    border-radius: 3px;

    &:hover {
      background: rgba(0, 0, 0, 0.25);
    }
  }
`

/**
 * 下拉菜单项基础样式
 * 包含现代化的交互效果
 */
export const ModernDropdownItem = styled.div<{
  $isDark?: boolean
  $isActive?: boolean
  $disabled?: boolean
  $themeColor?: string
}>`
  position: relative;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: ${(props) => (props.$disabled ? 'not-allowed' : 'pointer')};
  color: ${(props) => {
    if (props.$disabled) return props.$isDark ? '#595959' : '#bfbfbf'
    if (props.$isActive) return props.$themeColor || '#0066ff'
    return props.$isDark ? '#cccccc' : '#262626'
  }};
  font-size: 14px;
  line-height: 20px;
  font-weight: ${(props) => (props.$isActive ? 500 : 400)};
  background: ${(props) => {
    if (props.$isActive) {
      const color = props.$themeColor || '#0066ff'
      return props.$isDark ? `rgba(255, 255, 255, 0.08)` : `${color}12`
    }
    return 'transparent'
  }};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  opacity: ${(props) => (props.$disabled ? 0.5 : 1)};
  pointer-events: ${(props) => (props.$disabled ? 'none' : 'auto')};

  /* 左侧高亮条 */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: ${(props) => (props.$isActive ? '60%' : '0')};
    background: ${(props) => props.$themeColor || '#0066ff'};
    border-radius: 0 2px 2px 0;
    transition: height 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  ${(props) =>
    !props.$disabled &&
    !props.$isActive &&
    `
    &:hover {
      background: ${
        props.$isDark
          ? `linear-gradient(90deg, 
              rgba(255, 255, 255, 0.08) 0%, 
              rgba(255, 255, 255, 0.05) 100%)`
          : `linear-gradient(90deg, 
              ${props.$themeColor || '#0066ff'}15 0%, 
              ${props.$themeColor || '#0066ff'}08 100%)`
      };
      color: ${props.$isDark ? '#ffffff' : props.$themeColor || '#0066ff'};
      box-shadow: ${
        props.$isDark
          ? 'inset 0 0 0 1px rgba(255, 255, 255, 0.1)'
          : `inset 0 0 0 1px ${props.$themeColor || '#0066ff'}20`
      };
      transform: translateX(2px);
      padding-left: 12px;
      
      &::before {
        height: 60%;
      }
    }

    &:active {
      transform: translateX(2px) scale(0.98);
      background: ${props.$isDark ? `rgba(255, 255, 255, 0.12)` : `${props.$themeColor || '#0066ff'}18`};
    }
  `}
`

/**
 * 下拉菜单项内容容器
 * 使用 gap 实现子元素间隔
 */
export const ModernDropdownItemContent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
`

/**
 * 下拉菜单头部/底部区域
 * 用于放置标题、清除按钮等
 */
export const ModernDropdownSection = styled.div<{ $isDark?: boolean }>`
  padding: 8px 12px;
  background: ${(props) => (props.$isDark ? '#1e1e1e' : '#fafafa')};
  border-top: 1px solid ${(props) => (props.$isDark ? '#3a3a3a' : '#f0f0f0')};

  &:first-child {
    border-top: none;
    border-bottom: 1px solid ${(props) => (props.$isDark ? '#3a3a3a' : '#f0f0f0')};
  }
`

/**
 * 空状态容器
 */
export const ModernDropdownEmpty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 20px;
  color: #8c8c8c;
  font-size: 14px;
  text-align: center;
`

/**
 * 空状态图标
 */
export const ModernDropdownEmptyIcon = styled.div`
  font-size: 36px;
  opacity: 0.5;
`
