import { FORM_PATHS } from '@/shared/constants/form-paths'
import { LogoIcon } from '@/shared/icons/optionsPage/Logo'
import type { CommunicationMode } from '@/shared/types'
import { RightOutlined } from '@ant-design/icons'
import { Form, theme } from 'antd'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  getIntegrationChildren,
  MENU_BREAKPOINT,
  MENU_CONFIG,
  type MenuItemConfig,
} from '../../config/menu-config'
import {
  CollapseButton,
  ExpandArrow,
  GlassLayer,
  MenuContainer,
  MenuContent,
  MenuHeader,
  MenuItem,
  MenuItemIcon,
  MenuItemText,
  MenuList,
  MenuLogoWrapper,
  MenuTitle,
  SubMenuContainer,
  SubMenuItem,
  SubMenuItemText,
} from './side-menu.styles'

interface SideMenuProps {
  /** 菜单是否折叠 */
  collapsed: boolean
  /** 折叠状态变化回调 */
  onCollapsedChange: (collapsed: boolean) => void
  /** 当前激活的 Section */
  activeSection?: string
  /** 点击菜单项回调 */
  onMenuClick?: (sectionId: string) => void
  /** 点击子菜单项回调 */
  onSubMenuClick?: (anchorId: string) => void
  /** 是否为发布构建（控制调试菜单显示） */
  isReleaseBuild?: boolean
}

/**
 * 配置页侧边菜单组件
 * 支持折叠/展开、子菜单、滚动定位
 */
export const SideMenu: React.FC<SideMenuProps> = (props) => {
  const {
    collapsed,
    onCollapsedChange,
    activeSection,
    onMenuClick,
    onSubMenuClick,
    isReleaseBuild = false,
  } = props

  /** 通过 Form.useWatch 获取通信模式 */
  const communicationMode = Form.useWatch<CommunicationMode>(FORM_PATHS.apiConfig.communicationMode)

  /** 展开的菜单项 */
  const [expandedKeys, setExpandedKeys] = useState<string[]>([])

  /**
   * 根据通信模式动态生成菜单配置
   * 集成配置的子项根据 communicationMode 动态获取
   * 发布模式下隐藏调试菜单
   */
  const menuConfig = useMemo(() => {
    return MENU_CONFIG.filter((item) => {
      /** 发布模式下隐藏调试菜单 */
      if (isReleaseBuild && item.key === 'debug') {
        return false
      }
      return true
    }).map((item) => {
      if (item.key === 'integration-config') {
        return {
          ...item,
          children: getIntegrationChildren(communicationMode ?? 'postMessage'),
        }
      }
      return item
    })
  }, [communicationMode, isReleaseBuild])

  /**
   * 响应式处理：窗口宽度小于断点时自动折叠
   */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < MENU_BREAKPOINT) {
        onCollapsedChange(true)
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [onCollapsedChange])

  /**
   * 当激活的 Section 变化时，自动展开对应的菜单项
   */
  useEffect(() => {
    if (activeSection) {
      const menuItem = menuConfig.find((item) => item.sectionId === activeSection)
      if (menuItem) {
        // 使用 requestAnimationFrame 避免在 effect 中直接调用 setState
        requestAnimationFrame(() => {
          setExpandedKeys((prev) => (prev.includes(menuItem.key) ? prev : [...prev, menuItem.key]))
        })
      }
    }
  }, [activeSection, menuConfig])

  /**
   * 切换菜单项展开/折叠
   */
  const toggleExpand = useCallback((key: string) => {
    setExpandedKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  }, [])

  /**
   * 处理菜单项点击
   */
  const handleMenuItemClick = useCallback(
    (item: MenuItemConfig) => {
      if (collapsed) {
        onCollapsedChange(false)
      }
      toggleExpand(item.key)
      onMenuClick?.(item.sectionId)
    },
    [collapsed, onCollapsedChange, onMenuClick, toggleExpand]
  )

  /**
   * 处理子菜单项点击
   * 先展开 Section，然后滚动到锚点（锚点滚动内部会处理等待逻辑）
   */
  const handleSubMenuItemClick = useCallback(
    (anchorId: string, sectionId: string) => {
      onMenuClick?.(sectionId)
      onSubMenuClick?.(anchorId)
    },
    [onMenuClick, onSubMenuClick]
  )

  const { token } = theme.useToken()

  return (
    <MenuContainer $collapsed={collapsed} $themeColor={token.colorPrimary}>
      {/* 毛玻璃层 - 透视背景光晕 */}
      <GlassLayer />

      {/* 菜单内容 */}
      <MenuContent>
        {/* 头部 */}
        <MenuHeader $collapsed={collapsed}>
          <MenuLogoWrapper $collapsed={collapsed}>
            <LogoIcon style={{ fontSize: 24 }} />
            <MenuTitle $collapsed={collapsed}>SEE</MenuTitle>
          </MenuLogoWrapper>
          <CollapseButton
            $collapsed={collapsed}
            onClick={() => onCollapsedChange(!collapsed)}
            type="text"
          >
            <RightOutlined />
          </CollapseButton>
        </MenuHeader>

        {/* 菜单列表 */}
        <MenuList>
          {menuConfig.map((item) => {
            const isActive = activeSection === item.sectionId
            const isExpanded = expandedKeys.includes(item.key)
            const Icon = item.icon

            return (
              <React.Fragment key={item.key}>
                {/* 菜单项 */}
                <MenuItem
                  $active={isActive}
                  $collapsed={collapsed}
                  onClick={() => handleMenuItemClick(item)}
                  title={collapsed ? item.label : undefined}
                >
                  <MenuItemIcon $active={isActive}>
                    <Icon />
                  </MenuItemIcon>
                  <MenuItemText $collapsed={collapsed} $active={isActive}>
                    {item.label}
                  </MenuItemText>
                  {item.children && item.children.length > 0 && (
                    <ExpandArrow $expanded={isExpanded} $collapsed={collapsed}>
                      <RightOutlined />
                    </ExpandArrow>
                  )}
                </MenuItem>

                {/* 子菜单 */}
                {item.children && item.children.length > 0 && (
                  <SubMenuContainer $expanded={isExpanded} $collapsed={collapsed}>
                    {item.children.map((child) => (
                      <SubMenuItem
                        key={child.key}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSubMenuItemClick(child.anchorId, item.sectionId)
                        }}
                      >
                        <SubMenuItemText>{child.label}</SubMenuItemText>
                      </SubMenuItem>
                    ))}
                  </SubMenuContainer>
                )}
              </React.Fragment>
            )
          })}
        </MenuList>
      </MenuContent>
    </MenuContainer>
  )
}
