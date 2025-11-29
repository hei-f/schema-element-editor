import React, { useState } from 'react'
import { Layout, Menu, Typography, Button } from 'antd'
import {
  ExperimentOutlined,
  ApiOutlined,
  BugOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons'
import { AstTestPage } from './pages/AstTestPage'
import { SchemaTestPage } from './pages/SchemaTestPage'
import styled from 'styled-components'

const { Header, Content, Sider } = Layout
const { Title } = Typography

/** Header 高度 */
const HEADER_HEIGHT = 64
/** Sider 宽度 */
const SIDER_WIDTH = 220
/** Sider 折叠宽度 */
const SIDER_COLLAPSED_WIDTH = 48

const AppLayout = styled(Layout)`
  min-height: 100vh;
`

const AppHeader = styled(Header)<{ $siderCollapsed: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: #001529;
  height: ${HEADER_HEIGHT}px;
`

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
`

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  .logo-icon {
    font-size: 24px;
    color: #1677ff;
  }
`

const BodyLayout = styled(Layout)`
  margin-top: ${HEADER_HEIGHT}px;
`

const AppSider = styled(Sider)<{ $collapsed: boolean }>`
  position: fixed !important;
  left: 0;
  top: ${HEADER_HEIGHT}px;
  bottom: 0;
  z-index: 99;
  background: #fff !important;
  border-right: 1px solid #f0f0f0;
  overflow-y: auto;
  width: ${(props) => (props.$collapsed ? SIDER_COLLAPSED_WIDTH : SIDER_WIDTH)}px !important;
  min-width: ${(props) => (props.$collapsed ? SIDER_COLLAPSED_WIDTH : SIDER_WIDTH)}px !important;
  max-width: ${(props) => (props.$collapsed ? SIDER_COLLAPSED_WIDTH : SIDER_WIDTH)}px !important;
`

const AppContent = styled(Content)<{ $siderCollapsed: boolean }>`
  margin-left: ${(props) => (props.$siderCollapsed ? SIDER_COLLAPSED_WIDTH : SIDER_WIDTH)}px;
  padding: 24px;
  background: #f5f5f5;
  min-height: calc(100vh - ${HEADER_HEIGHT}px);
  overflow: auto;
  transition: margin-left 0.2s ease;
`

type PageKey = 'ast-test' | 'schema-test'

export const TestApp: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageKey>('schema-test')
  const [siderCollapsed, setSiderCollapsed] = useState(false)

  const menuItems = [
    {
      key: 'schema-test',
      icon: <ApiOutlined />,
      label: 'Schema 功能测试',
    },
    {
      key: 'ast-test',
      icon: <ExperimentOutlined />,
      label: 'AST 转换测试',
    },
  ]

  const renderPage = () => {
    switch (currentPage) {
      case 'ast-test':
        return <AstTestPage siderCollapsed={siderCollapsed} />
      case 'schema-test':
        return <SchemaTestPage siderCollapsed={siderCollapsed} />
      default:
        return <SchemaTestPage siderCollapsed={siderCollapsed} />
    }
  }

  return (
    <AppLayout>
      <AppHeader $siderCollapsed={siderCollapsed}>
        <HeaderLeft>
          <Button
            type="text"
            icon={siderCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setSiderCollapsed(!siderCollapsed)}
            style={{ color: '#fff', marginRight: 16 }}
          />
          <Logo>
            <BugOutlined className="logo-icon" />
            <Title level={4} style={{ margin: 0, color: '#fff' }}>
              Schema Editor 测试工具
            </Title>
          </Logo>
        </HeaderLeft>
      </AppHeader>
      <BodyLayout>
        <AppSider
          width={siderCollapsed ? SIDER_COLLAPSED_WIDTH : SIDER_WIDTH}
          $collapsed={siderCollapsed}
          collapsed={siderCollapsed}
          collapsedWidth={SIDER_COLLAPSED_WIDTH}
        >
          <Menu
            mode="inline"
            inlineCollapsed={siderCollapsed}
            selectedKeys={[currentPage]}
            items={menuItems}
            onClick={({ key }) => setCurrentPage(key as PageKey)}
            style={{ height: '100%', paddingTop: 8 }}
          />
        </AppSider>
        <AppContent $siderCollapsed={siderCollapsed}>{renderPage()}</AppContent>
      </BodyLayout>
    </AppLayout>
  )
}

export { SIDER_WIDTH, SIDER_COLLAPSED_WIDTH, HEADER_HEIGHT }
