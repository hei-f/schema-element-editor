import React from 'react'
import { Button, Typography } from 'antd'
import { BugOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { AppHeader as StyledHeader, HeaderLeft, Logo } from './AppLayout.styles'

const { Title } = Typography

interface AppHeaderProps {
  siderCollapsed: boolean
  onToggleSider: () => void
}

export const AppHeader: React.FC<AppHeaderProps> = ({ siderCollapsed, onToggleSider }) => {
  return (
    <StyledHeader $siderCollapsed={siderCollapsed}>
      <HeaderLeft>
        <Button
          type="text"
          icon={siderCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggleSider}
          style={{ color: '#fff', marginRight: 16 }}
        />
        <Logo>
          <BugOutlined className="logo-icon" />
          <Title level={4} style={{ margin: 0, color: '#fff' }}>
            Schema Element Editor 测试工具
          </Title>
        </Logo>
      </HeaderLeft>
    </StyledHeader>
  )
}
