import React, { useState, useEffect, useCallback } from 'react'
import { Layout, Menu, Typography, Button } from 'antd'
import {
  ExperimentOutlined,
  ApiOutlined,
  BugOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  RobotOutlined,
  BlockOutlined,
  SettingOutlined,
  EyeOutlined,
  VideoCameraOutlined,
  AppstoreOutlined,
} from '@ant-design/icons'
import { AstTestPage } from './pages/AstTestPage'
import { AgenticDemoPage } from './pages/AgenticDemoPage'
import { IframeTestPage } from './pages/IframeTestPage'
import { OptionsTestPage } from './pages/OptionsTestPage'
import { BuiltinPreviewTestPage } from './pages/BuiltinPreviewTestPage'
import { RecordingTestPage } from './pages/RecordingTestPage'
import { MultiSdkTestIndex } from './pages/multi-sdk-tests/index'
import { SameLevelTest } from './pages/multi-sdk-tests/SameLevelTest'
import { PriorityOverrideTest } from './pages/multi-sdk-tests/PriorityOverrideTest'
import { PriorityBlockingTest } from './pages/multi-sdk-tests/PriorityBlockingTest'
import { MethodLevelTest } from './pages/multi-sdk-tests/MethodLevelTest'
import { PartialImplementationTest } from './pages/multi-sdk-tests/PartialImplementationTest'
import { SchemaTestIndex } from './pages/schema-tests/index'
import { BasicTypesTest } from './pages/schema-tests/BasicTypesTest'
import { ComplexTypesTest } from './pages/schema-tests/ComplexTypesTest'
import { JsonRepairTest } from './pages/schema-tests/JsonRepairTest'
import { QuickEditTest } from './pages/schema-tests/QuickEditTest'
import { RecordingModeTest } from './pages/schema-tests/RecordingModeTest'
import { UIFeaturesTest } from './pages/schema-tests/UIFeaturesTest'
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

const BodyLayout = styled(Layout)<{ $hideHeader?: boolean }>`
  margin-top: ${(props) => (props.$hideHeader ? 0 : HEADER_HEIGHT)}px;
`

const AppSider = styled(Sider)<{
  $collapsed: boolean
  $rightSide?: boolean
  $hideHeader?: boolean
}>`
  position: fixed !important;
  ${(props) => (props.$rightSide ? 'right: 0;' : 'left: 0;')}
  top: ${(props) => (props.$hideHeader ? 0 : HEADER_HEIGHT)}px;
  bottom: 0;
  z-index: 99;
  background: #fff !important;
  ${(props) =>
    props.$rightSide ? 'border-left: 1px solid #f0f0f0;' : 'border-right: 1px solid #f0f0f0;'}
  overflow-y: auto;
  width: ${(props) => (props.$collapsed ? SIDER_COLLAPSED_WIDTH : SIDER_WIDTH)}px !important;
  min-width: ${(props) => (props.$collapsed ? SIDER_COLLAPSED_WIDTH : SIDER_WIDTH)}px !important;
  max-width: ${(props) => (props.$collapsed ? SIDER_COLLAPSED_WIDTH : SIDER_WIDTH)}px !important;
`

const AppContent = styled(Content)<{
  $siderCollapsed: boolean
  $rightSide?: boolean
  $noPadding?: boolean
}>`
  ${(props) =>
    props.$rightSide
      ? `margin-right: ${props.$siderCollapsed ? SIDER_COLLAPSED_WIDTH : SIDER_WIDTH}px;`
      : `margin-left: ${props.$siderCollapsed ? SIDER_COLLAPSED_WIDTH : SIDER_WIDTH}px;`}
  padding: ${(props) => (props.$noPadding ? 0 : 24)}px;
  background: ${(props) => (props.$noPadding ? 'transparent' : '#f5f5f5')};
  min-height: 100vh;
  overflow: auto;
  transition:
    margin-left 0.2s ease,
    margin-right 0.2s ease;
`

type PageKey =
  | 'ast-test'
  | 'schema-test'
  | 'agentic-demo'
  | 'iframe-test'
  | 'options-test'
  | 'builtin-preview-test'
  | 'recording-test'
  | 'multi-sdk-test'
  | 'multi-sdk-test-same-level'
  | 'multi-sdk-test-priority-override'
  | 'multi-sdk-test-priority-blocking'
  | 'multi-sdk-test-method-level'
  | 'multi-sdk-test-partial-implementation'
  | 'schema-tests'
  | 'schema-tests-basic-types'
  | 'schema-tests-complex-types'
  | 'schema-tests-json-repair'
  | 'schema-tests-quick-edit'
  | 'schema-tests-recording-mode'
  | 'schema-tests-ui-features'

/** 默认页面 */
const DEFAULT_PAGE: PageKey = 'schema-tests'

/**
 * 从 URL hash 中获取当前页面
 */
const getPageFromHash = (): PageKey => {
  const hash = window.location.hash.slice(1) // 移除 #
  const validPages: PageKey[] = [
    'ast-test',
    'schema-test',
    'agentic-demo',
    'iframe-test',
    'options-test',
    'builtin-preview-test',
    'recording-test',
    'multi-sdk-test',
    'multi-sdk-test-same-level',
    'multi-sdk-test-priority-override',
    'multi-sdk-test-priority-blocking',
    'multi-sdk-test-method-level',
    'multi-sdk-test-partial-implementation',
    'schema-tests',
    'schema-tests-basic-types',
    'schema-tests-complex-types',
    'schema-tests-json-repair',
    'schema-tests-quick-edit',
    'schema-tests-recording-mode',
    'schema-tests-ui-features',
  ]
  return validPages.includes(hash as PageKey) ? (hash as PageKey) : DEFAULT_PAGE
}

/**
 * 更新 URL hash
 */
const setHashToUrl = (page: PageKey) => {
  window.location.hash = page
}

export const TestApp: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageKey>(getPageFromHash)
  const [siderCollapsed, setSiderCollapsed] = useState(() => getPageFromHash() === 'options-test')

  /** 是否为设置页开发模式（隐藏 header，菜单在右侧折叠） */
  const isOptionsPage = currentPage === 'options-test'

  // 设置页模式下禁止 body 滚动（配置页有自己的滚动区域）
  useEffect(() => {
    if (isOptionsPage) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOptionsPage])

  // 监听 hash 变化（浏览器前进/后退）
  useEffect(() => {
    const handleHashChange = () => {
      const newPage = getPageFromHash()
      setCurrentPage(newPage)
      // 设置页模式下自动折叠侧边栏
      if (newPage === 'options-test') {
        setSiderCollapsed(true)
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // 页面切换时更新 URL hash
  const handlePageChange = useCallback((page: PageKey) => {
    setCurrentPage(page)
    setHashToUrl(page)
    // 设置页模式下自动折叠侧边栏
    if (page === 'options-test') {
      setSiderCollapsed(true)
    }
  }, [])

  const menuItems = [
    {
      key: 'schema-tests',
      icon: <ApiOutlined />,
      label: 'Schema 功能测试',
    },
    {
      key: 'ast-test',
      icon: <ExperimentOutlined />,
      label: 'AST 转换测试',
    },
    {
      key: 'agentic-demo',
      icon: <RobotOutlined />,
      label: 'Agentic UI Demo',
    },
    {
      key: 'recording-test',
      icon: <VideoCameraOutlined />,
      label: '录制模式测试',
    },
    {
      key: 'multi-sdk-test',
      icon: <AppstoreOutlined />,
      label: '多 SDK 实例测试',
    },
    {
      key: 'iframe-test',
      icon: <BlockOutlined />,
      label: 'iframe 测试',
    },
    {
      key: 'builtin-preview-test',
      icon: <EyeOutlined />,
      label: '内置预览器测试',
    },
    {
      key: 'options-test',
      icon: <SettingOutlined />,
      label: '设置页开发',
    },
  ]

  const renderPage = () => {
    switch (currentPage) {
      case 'ast-test':
        return <AstTestPage siderCollapsed={siderCollapsed} />
      case 'agentic-demo':
        return <AgenticDemoPage siderCollapsed={siderCollapsed} />
      case 'recording-test':
        return <RecordingTestPage siderCollapsed={siderCollapsed} />
      case 'multi-sdk-test':
        return (
          <MultiSdkTestIndex
            onNavigate={(testKey) => handlePageChange(`multi-sdk-test-${testKey}` as PageKey)}
          />
        )
      case 'multi-sdk-test-same-level':
        return <SameLevelTest onBack={() => handlePageChange('multi-sdk-test')} />
      case 'multi-sdk-test-priority-override':
        return <PriorityOverrideTest onBack={() => handlePageChange('multi-sdk-test')} />
      case 'multi-sdk-test-priority-blocking':
        return <PriorityBlockingTest onBack={() => handlePageChange('multi-sdk-test')} />
      case 'multi-sdk-test-method-level':
        return <MethodLevelTest onBack={() => handlePageChange('multi-sdk-test')} />
      case 'multi-sdk-test-partial-implementation':
        return <PartialImplementationTest onBack={() => handlePageChange('multi-sdk-test')} />
      case 'schema-tests':
        return (
          <SchemaTestIndex
            onNavigate={(testKey) => handlePageChange(`schema-tests-${testKey}` as PageKey)}
          />
        )
      case 'schema-tests-basic-types':
        return <BasicTypesTest onBack={() => handlePageChange('schema-tests')} />
      case 'schema-tests-complex-types':
        return <ComplexTypesTest onBack={() => handlePageChange('schema-tests')} />
      case 'schema-tests-json-repair':
        return <JsonRepairTest onBack={() => handlePageChange('schema-tests')} />
      case 'schema-tests-quick-edit':
        return <QuickEditTest onBack={() => handlePageChange('schema-tests')} />
      case 'schema-tests-recording-mode':
        return <RecordingModeTest onBack={() => handlePageChange('schema-tests')} />
      case 'schema-tests-ui-features':
        return <UIFeaturesTest onBack={() => handlePageChange('schema-tests')} />
      case 'iframe-test':
        return <IframeTestPage siderCollapsed={siderCollapsed} />
      case 'builtin-preview-test':
        return <BuiltinPreviewTestPage siderCollapsed={siderCollapsed} />
      case 'options-test':
        return <OptionsTestPage siderCollapsed={siderCollapsed} />
      default:
        return (
          <SchemaTestIndex
            onNavigate={(testKey) => handlePageChange(`schema-tests-${testKey}` as PageKey)}
          />
        )
    }
  }

  return (
    <AppLayout>
      {/* Header - 设置页模式下隐藏 */}
      {!isOptionsPage && (
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
                Schema Element Editor 测试工具
              </Title>
            </Logo>
          </HeaderLeft>
        </AppHeader>
      )}
      <BodyLayout $hideHeader={isOptionsPage}>
        <AppSider
          width={siderCollapsed ? SIDER_COLLAPSED_WIDTH : SIDER_WIDTH}
          $collapsed={siderCollapsed}
          collapsed={siderCollapsed}
          collapsedWidth={SIDER_COLLAPSED_WIDTH}
          $rightSide={isOptionsPage}
          $hideHeader={isOptionsPage}
        >
          <Menu
            mode="inline"
            inlineCollapsed={siderCollapsed}
            selectedKeys={[currentPage]}
            items={menuItems}
            onClick={({ key }) => handlePageChange(key as PageKey)}
            style={{ height: '100%', paddingTop: 8 }}
          />
        </AppSider>
        <AppContent
          $siderCollapsed={siderCollapsed}
          $rightSide={isOptionsPage}
          $noPadding={isOptionsPage}
        >
          {renderPage()}
        </AppContent>
      </BodyLayout>
    </AppLayout>
  )
}

export { SIDER_WIDTH, SIDER_COLLAPSED_WIDTH, HEADER_HEIGHT }
