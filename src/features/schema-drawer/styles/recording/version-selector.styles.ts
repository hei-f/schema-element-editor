import styled from 'styled-components'
import { ModernDropdownContainer } from '../shared/modern-dropdown.styles'

/** 版本选择器下拉容器（复用 ModernDropdown） */
export const VersionSelectorContainer = ModernDropdownContainer

/** 版本选择器下拉列表（自定义滚动条颜色以支持明暗主题） */
export const VersionSelectorList = styled.div<{ $maxHeight?: string; $isDark?: boolean }>`
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
    background: ${(props) => (props.$isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)')};
    border-radius: 3px;

    &:hover {
      background: ${(props) =>
        props.$isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.25)'};
    }
  }
`

/** 版本选择器选项 */
export const VersionSelectorItem = styled.div<{
  $isDark?: boolean
  $isActive?: boolean
  $themeColor?: string
}>`
  position: relative;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  color: ${(props) => {
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

/** 版本选择器选项内容容器 */
export const VersionSelectorContent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
`

/** 版本信息容器 */
export const VersionSelectorInfo = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
`

/** 版本号标签 */
export const VersionSelectorLabel = styled.div<{ $isActive?: boolean }>`
  font-size: 14px;
  font-weight: ${(props) => (props.$isActive ? 500 : 400)};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

/** 时间戳显示 */
export const VersionSelectorTime = styled.div<{ $isActive?: boolean }>`
  font-size: 12px;
  opacity: ${(props) => (props.$isActive ? 0.7 : 0.5)};
  white-space: nowrap;
  flex-shrink: 0;
`

/** 选中标记 */
export const VersionSelectorCheck = styled.span`
  font-size: 16px;
  font-weight: bold;
  margin-left: auto;
  flex-shrink: 0;
`
