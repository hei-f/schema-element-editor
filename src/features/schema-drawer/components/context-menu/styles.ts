import styled from 'styled-components'

/**
 * 右键菜单容器
 * 参考编辑器自动补全面板的设计风格
 */
export const ContextMenuContainer = styled.div<{ $x: number; $y: number; $isDark: boolean }>`
  position: fixed;
  left: ${(props) => props.$x}px;
  top: ${(props) => props.$y}px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 150px;
  padding: 6px 4px;
  background-color: ${(props) => (props.$isDark ? '#252526' : '#ffffff')};
  border-radius: 8px;
  box-shadow: ${(props) =>
    props.$isDark
      ? '0 8px 24px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3)'
      : '0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)'};
  border: 1px solid ${(props) => (props.$isDark ? '#3a3a3a' : '#e0e0e0')};
  animation: contextMenuFadeIn 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: auto;
  z-index: 1001;
  backdrop-filter: blur(10px);

  @keyframes contextMenuFadeIn {
    from {
      opacity: 0;
      transform: translateY(-4px) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`

/**
 * 菜单项
 * 现代化的交互设计，提供优雅的视觉反馈
 */
export const ContextMenuItem = styled.div<{
  $isDark: boolean
  $disabled?: boolean
  $themeColor: string
}>`
  position: relative;
  padding: 6px 4px;
  border-radius: 6px;
  cursor: ${(props) => (props.$disabled ? 'not-allowed' : 'pointer')};
  color: ${(props) => {
    if (props.$disabled) return props.$isDark ? '#595959' : '#bfbfbf'
    return props.$isDark ? '#cccccc' : '#262626'
  }};
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  opacity: ${(props) => (props.$disabled ? 0.5 : 1)};
  pointer-events: ${(props) => (props.$disabled ? 'none' : 'auto')};
  overflow: hidden;

  /* 添加微妙的左侧高亮条 */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 0;
    background: ${(props) => props.$themeColor};
    border-radius: 0 2px 2px 0;
    transition: height 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  ${(props) =>
    !props.$disabled &&
    `
    &:hover {
      background: ${
        props.$isDark
          ? `linear-gradient(90deg, 
              rgba(255, 255, 255, 0.08) 0%, 
              rgba(255, 255, 255, 0.05) 100%)`
          : `linear-gradient(90deg, 
              ${props.$themeColor}15 0%, 
              ${props.$themeColor}08 100%)`
      };
      color: ${props.$isDark ? '#ffffff' : props.$themeColor};
      box-shadow: ${
        props.$isDark
          ? 'inset 0 0 0 1px rgba(255, 255, 255, 0.1)'
          : `inset 0 0 0 1px ${props.$themeColor}20`
      };
      transform: translateX(2px);
      padding-left: 6px;
      
      &::before {
        height: 60%;
      }
    }

    &:active {
      transform: translateX(2px) scale(0.98);
      background: ${props.$isDark ? `rgba(255, 255, 255, 0.12)` : `${props.$themeColor}18`};
    }
  `}
`
