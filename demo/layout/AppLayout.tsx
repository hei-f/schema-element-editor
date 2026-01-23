import React, { useState, useEffect } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'
import { KeepAlive } from 'keepalive-for-react'
import { AppLayoutContainer, BodyLayout, AppContent } from './AppLayout.styles'
import { AppHeader } from './AppHeader'
import { AppSider } from './AppSider'

export const AppLayout: React.FC = () => {
  const location = useLocation()

  /** 是否为设置页开发模式（隐藏 header，菜单在右侧折叠） */
  const isOptionsPage = location.pathname === '/options-test'

  /** 侧边栏折叠状态（设置页默认折叠） */
  const [siderCollapsed, setSiderCollapsed] = useState(isOptionsPage)

  /** 通过 outlet context 传递给子路由 */
  const outlet = useOutlet({ siderCollapsed })

  /** 设置页模式下禁止 body 滚动（配置页有自己的滚动区域） */
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

  return (
    <AppLayoutContainer>
      {/* Header - 设置页模式下隐藏 */}
      {!isOptionsPage && (
        <AppHeader
          siderCollapsed={siderCollapsed}
          onToggleSider={() => setSiderCollapsed(!siderCollapsed)}
        />
      )}

      <BodyLayout $hideHeader={isOptionsPage}>
        <AppSider collapsed={siderCollapsed} rightSide={isOptionsPage} hideHeader={isOptionsPage} />

        <AppContent
          $siderCollapsed={siderCollapsed}
          $rightSide={isOptionsPage}
          $noPadding={isOptionsPage}
        >
          <KeepAlive activeCacheKey={location.pathname} max={10}>
            {outlet}
          </KeepAlive>
        </AppContent>
      </BodyLayout>
    </AppLayoutContainer>
  )
}
