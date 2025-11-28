import React, { useState } from 'react'
import { Layout, Menu, Typography } from 'antd'
import { ExperimentOutlined, ApiOutlined, BugOutlined } from '@ant-design/icons'
import { AstTestPage } from './pages/AstTestPage'
import { SchemaTestPage } from './pages/SchemaTestPage'
import styled from 'styled-components'

const { Header, Content, Sider } = Layout
const { Title } = Typography

const AppLayout = styled(Layout)`
  min-height: 100vh;
`

const AppHeader = styled(Header)`
  display: flex;
  align-items: center;
  padding: 0 24px;
  background: #001529;
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

const AppSider = styled(Sider)`
  background: #fff !important;
  border-right: 1px solid #f0f0f0;
`

const AppContent = styled(Content)`
  padding: 24px;
  background: #f5f5f5;
  overflow: auto;
`

type PageKey = 'ast-test' | 'schema-test'

export const TestApp: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageKey>('schema-test')

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
        return <AstTestPage />
      case 'schema-test':
        return <SchemaTestPage />
      default:
        return <SchemaTestPage />
    }
  }

  return (
    <AppLayout>
      <AppHeader>
        <Logo>
          <BugOutlined className="logo-icon" />
          <Title level={4} style={{ margin: 0, color: '#fff' }}>
            Schema Editor 测试工具
          </Title>
        </Logo>
      </AppHeader>
      <Layout>
        <AppSider width={220}>
          <Menu
            mode="inline"
            selectedKeys={[currentPage]}
            items={menuItems}
            onClick={({ key }) => setCurrentPage(key as PageKey)}
            style={{ height: '100%', paddingTop: 8 }}
          />
        </AppSider>
        <AppContent>{renderPage()}</AppContent>
      </Layout>
    </AppLayout>
  )
}
