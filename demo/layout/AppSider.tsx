import React from 'react'
import { Menu } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppSider as StyledSider } from './AppLayout.styles'
import { menuItems } from '../config/menu'
import { SIDER_WIDTH, SIDER_COLLAPSED_WIDTH } from '../config/constants'

interface AppSiderProps {
  collapsed: boolean
  rightSide?: boolean
  hideHeader?: boolean
}

export const AppSider: React.FC<AppSiderProps> = ({ collapsed, rightSide, hideHeader }) => {
  const location = useLocation()
  const navigate = useNavigate()

  /** 点击菜单项 */
  const handleMenuClick = (key: string) => {
    navigate(key)
  }

  return (
    <StyledSider
      width={collapsed ? SIDER_COLLAPSED_WIDTH : SIDER_WIDTH}
      collapsed={collapsed}
      collapsedWidth={SIDER_COLLAPSED_WIDTH}
      $rightSide={rightSide}
      $hideHeader={hideHeader}
    >
      <Menu
        mode="inline"
        inlineCollapsed={collapsed}
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => handleMenuClick(key)}
        style={{ height: '100%', paddingTop: 8 }}
      />
    </StyledSider>
  )
}
