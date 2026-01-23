import styled from 'styled-components'
import { Layout } from 'antd'
import { HEADER_HEIGHT, SIDER_WIDTH, SIDER_COLLAPSED_WIDTH } from '../config/constants'

const { Header, Content, Sider } = Layout

export const AppLayoutContainer = styled(Layout)`
  min-height: 100vh;
`

export const AppHeader = styled(Header)<{ $siderCollapsed: boolean }>`
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

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
`

export const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  .logo-icon {
    font-size: 24px;
    color: #1677ff;
  }
`

export const BodyLayout = styled(Layout)<{ $hideHeader?: boolean }>`
  margin-top: ${(props) => (props.$hideHeader ? 0 : HEADER_HEIGHT)}px;
`

export const AppSider = styled(Sider)<{
  collapsed: boolean
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
  width: ${(props) => (props.collapsed ? SIDER_COLLAPSED_WIDTH : SIDER_WIDTH)}px !important;
  min-width: ${(props) => (props.collapsed ? SIDER_COLLAPSED_WIDTH : SIDER_WIDTH)}px !important;
  max-width: ${(props) => (props.collapsed ? SIDER_COLLAPSED_WIDTH : SIDER_WIDTH)}px !important;
`

export const AppContent = styled(Content)<{
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
