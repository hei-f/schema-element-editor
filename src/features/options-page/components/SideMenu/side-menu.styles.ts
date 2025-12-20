import { Button } from 'antd'
import { MENU_COLLAPSED_WIDTH, MENU_EXPANDED_WIDTH } from '../../config/menu-config'
import styled, { css } from 'styled-components'

/** 菜单容器 - 固定定位 */
export const MenuContainer = styled.div<{ $collapsed: boolean; $themeColor?: string }>`
  /* 设置主题色 CSS 变量，供子组件使用 */
  --menu-theme-color: ${(props) => props.$themeColor || '#39c5bb'};
  --menu-theme-color-rgb: ${(props) => {
    const hex = props.$themeColor || '#39c5bb'
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `${r}, ${g}, ${b}`
  }};

  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: ${(props) => (props.$collapsed ? MENU_COLLAPSED_WIDTH : MENU_EXPANDED_WIDTH)}px;
  z-index: 100;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow:
    4px 0 24px rgba(var(--menu-theme-color-rgb), 0.12),
    2px 0 8px rgba(0, 0, 0, 0.04);
`

/** 毛玻璃层 - 透视背景光晕 */
export const GlassLayer = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0);
  backdrop-filter: blur(12px) saturate(140%);
  -webkit-backdrop-filter: blur(12px) saturate(140%);
  border-right: 1px solid rgba(255, 255, 255, 0.35);
  z-index: 0;
`

/** 菜单内容区域 */
export const MenuContent = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px 0;
`

/** 菜单头部 */
export const MenuHeader = styled.div<{ $collapsed: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.$collapsed ? 'center' : 'space-between')};
  padding: ${(props) => (props.$collapsed ? '12px 0' : '12px 16px 12px 20px')};
  margin-bottom: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
`

/** Logo 和标题包装器 */
export const MenuLogoWrapper = styled.div<{ $collapsed: boolean }>`
  display: flex;
  align-items: center;
  gap: 16px;
  opacity: ${(props) => (props.$collapsed ? 0 : 1)};
  width: ${(props) => (props.$collapsed ? 0 : 'auto')};
  overflow: hidden;
  transition:
    opacity 0.2s ease,
    width 0.2s ease;
`

/** 菜单标题 */
export const MenuTitle = styled.span<{ $collapsed: boolean }>`
  font-size: 20px;
  font-weight: 600;
  color: #353e5c;
  white-space: nowrap;
  overflow: hidden;
`

/** 折叠按钮 */
export const CollapseButton = styled(Button)<{ $collapsed: boolean }>`
  && {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    min-width: 24px;
    padding: 0;
    border: none !important;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.6);
    color: #666;
    transition: all 0.2s ease;
    flex-shrink: 0;

    &:hover {
      background: rgba(255, 255, 255, 0.9) !important;
      color: var(--menu-theme-color) !important;
      /* transform: scale(1.05); */
    }

    /* &:active {
      transform: scale(0.95);
    } */
  }

  svg {
    transition: transform 0.3s ease;
    transform: ${(props) => (props.$collapsed ? 'rotate(0deg)' : 'rotate(180deg)')};
  }
`

/** 菜单列表容器 */
export const MenuList = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
  padding: 0 8px;

  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.15);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.25);
  }
`

/** 菜单项基础样式 */
const menuItemBase = css`
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(var(--menu-theme-color-rgb), 0.15),
      rgba(var(--menu-theme-color-rgb), 0.08)
    );
    opacity: 0;
    transition: opacity 0.2s ease;
    border-radius: inherit;
  }

  &:hover::before {
    opacity: 1;
  }
`

/** 菜单项 */
export const MenuItem = styled.div<{ $active?: boolean; $collapsed: boolean }>`
  ${menuItemBase}
  margin-bottom: 4px;
  justify-content: ${(props) => (props.$collapsed ? 'center' : 'flex-start')};

  ${(props) =>
    props.$active &&
    css`
      background: linear-gradient(
        135deg,
        rgba(var(--menu-theme-color-rgb), 0.15),
        rgba(var(--menu-theme-color-rgb), 0.08)
      );

      &::after {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 20px;
        background: linear-gradient(
          180deg,
          var(--menu-theme-color),
          color-mix(in srgb, var(--menu-theme-color) 70%, white)
        );
        border-radius: 0 2px 2px 0;
      }
    `}

  &:hover {
    transform: translateX(2px);
  }
`

/** 菜单项图标 */
export const MenuItemIcon = styled.span<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  font-size: 16px;
  color: ${(props) => (props.$active ? 'var(--menu-theme-color)' : '#666')};
  transition: color 0.2s ease;
  position: relative;
  z-index: 1;
  flex-shrink: 0;
`

/** 菜单项文字 */
export const MenuItemText = styled.span<{ $collapsed: boolean; $active?: boolean }>`
  margin-left: ${(props) => (props.$collapsed ? 0 : '12px')};
  font-size: 14px;
  font-weight: ${(props) => (props.$active ? 500 : 400)};
  color: ${(props) => (props.$active ? 'var(--menu-theme-color)' : '#353E5C')};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: ${(props) => (props.$collapsed ? 0 : 1)};
  width: ${(props) => (props.$collapsed ? 0 : 'auto')};
  transition: all 0.2s ease;
  position: relative;
  z-index: 1;
`

/** 展开箭头 */
export const ExpandArrow = styled.span<{ $expanded: boolean; $collapsed: boolean }>`
  margin-left: auto;
  display: ${(props) => (props.$collapsed ? 'none' : 'flex')};
  align-items: center;
  color: #999;
  font-size: 10px;
  opacity: ${(props) => (props.$collapsed ? 0 : 1)};
  transition: all 0.2s ease;
  position: relative;
  z-index: 1;

  svg {
    transition: transform 0.2s ease;
    transform: ${(props) => (props.$expanded ? 'rotate(90deg)' : 'rotate(0deg)')};
  }
`

/** 子菜单容器 */
export const SubMenuContainer = styled.div<{ $expanded: boolean; $collapsed: boolean }>`
  overflow: hidden;
  max-height: ${(props) => (props.$expanded && !props.$collapsed ? '500px' : '0')};
  opacity: ${(props) => (props.$expanded && !props.$collapsed ? 1 : 0)};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding-left: ${(props) => (props.$collapsed ? 0 : '20px')};
`

/** 子菜单项 */
export const SubMenuItem = styled.div<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  margin: 2px 0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  color: ${(props) => (props.$active ? 'var(--menu-theme-color)' : '#666F8D')};
  background: ${(props) =>
    props.$active ? 'rgba(var(--menu-theme-color-rgb), 0.08)' : 'transparent'};
  transition: all 0.2s ease;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: ${(props) => (props.$active ? 'var(--menu-theme-color)' : '#ccc')};
    transition: all 0.2s ease;
  }

  &:hover {
    color: var(--menu-theme-color);
    background: rgba(var(--menu-theme-color-rgb), 0.06);

    &::before {
      background: var(--menu-theme-color);
      transform: translateY(-50%) scale(1.2);
    }
  }
`

/** 子菜单项文字 */
export const SubMenuItemText = styled.span`
  margin-left: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`
