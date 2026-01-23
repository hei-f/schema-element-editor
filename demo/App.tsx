import React, { Suspense } from 'react'
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AppLayout } from './layout'
import { RouteWrapper } from './router/RouteWrapper'
import { LoadingFallback } from './router/LoadingFallback'
import { routeConfigs, multiSdkRoutes, schemaTestRoutes } from './router/route-config'
import { SIDER_WIDTH, SIDER_COLLAPSED_WIDTH, HEADER_HEIGHT } from './config/constants'

/**
 * 带导航功能的路由包装器
 */
const NavigateWrapper: React.FC<{
  Component: React.ComponentType<{ onNavigate: (key: string) => void }>
  basePath: string
}> = ({ Component, basePath }) => {
  const navigate = useNavigate()
  return <Component onNavigate={(key: string) => navigate(`${basePath}/${key}`)} />
}

/**
 * 带返回功能的路由包装器
 */
const BackWrapper: React.FC<{
  Component: React.ComponentType<{ onBack: () => void }>
  backPath: string
}> = ({ Component, backPath }) => {
  const navigate = useNavigate()
  return <Component onBack={() => navigate(backPath)} />
}

/**
 * 测试工具主应用组件
 *
 * 架构说明：
 * - config/: 配置文件（常量、菜单配置）
 * - layout/: 布局组件（AppLayout、AppHeader、AppSider）
 * - router/: 路由配置（懒加载组件、路由配置）
 *
 * 性能优化：
 * - KeepAlive: 在 AppLayout 中缓存路由组件状态，避免重复挂载
 * - 路由预加载: 鼠标悬停时预加载组件代码
 *
 * 路由架构：
 * - 使用嵌套路由，AppLayout 作为父路由的 element
 * - 所有子路由通过 outlet 渲染，并被 KeepAlive 缓存
 */
export const TestApp: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          {/* 默认重定向到 schema-tests */}
          <Route index element={<Navigate to="/schema-tests" replace />} />

          {/* 顶级路由 - siderCollapsed 通过 outlet context 传递 */}
          {routeConfigs.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <RouteWrapper Component={route.component} />
                </Suspense>
              }
            />
          ))}

          {/* Multi SDK 测试路由 */}
          {multiSdkRoutes.map((route) => {
            if (route.hasNavigateCallback) {
              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <Suspense fallback={<LoadingFallback />}>
                      <NavigateWrapper Component={route.component} basePath="/multi-sdk-test" />
                    </Suspense>
                  }
                />
              )
            }
            if (route.hasBackCallback) {
              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <Suspense fallback={<LoadingFallback />}>
                      <BackWrapper Component={route.component} backPath="/multi-sdk-test" />
                    </Suspense>
                  }
                />
              )
            }
            return null
          })}

          {/* Schema 测试路由 */}
          {schemaTestRoutes.map((route) => {
            if (route.hasNavigateCallback) {
              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <Suspense fallback={<LoadingFallback />}>
                      <NavigateWrapper Component={route.component} basePath="/schema-tests" />
                    </Suspense>
                  }
                />
              )
            }
            if (route.hasBackCallback) {
              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <Suspense fallback={<LoadingFallback />}>
                      <BackWrapper Component={route.component} backPath="/schema-tests" />
                    </Suspense>
                  }
                />
              )
            }
            return null
          })}

          {/* 404 页面 */}
          <Route path="*" element={<div>页面未找到</div>} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

/** 导出布局常量供其他模块使用 */
export { SIDER_WIDTH, SIDER_COLLAPSED_WIDTH, HEADER_HEIGHT }
