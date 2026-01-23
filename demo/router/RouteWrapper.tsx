import React from 'react'
import { useOutletContext } from 'react-router-dom'

interface RouteWrapperProps {
  Component: React.ComponentType<{ siderCollapsed: boolean }>
}

interface OutletContext {
  siderCollapsed: boolean
}

/** 路由包装组件 - 从 outlet context 获取 siderCollapsed 并传递给组件 */
export const RouteWrapper: React.FC<RouteWrapperProps> = ({ Component }) => {
  const { siderCollapsed } = useOutletContext<OutletContext>()
  return <Component siderCollapsed={siderCollapsed} />
}
