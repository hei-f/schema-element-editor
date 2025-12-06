import { Collapse, theme, Tooltip, Flex } from 'antd'
import React from 'react'
import {
  PanelActionButton,
  PanelActions,
  PanelHeader,
  PanelIcon,
  PanelTitle,
  PanelTitleWrapper,
  PanelTitleHelpIcon,
  StyledCollapseModern,
} from '../styles/layout.styles'

const { Panel } = Collapse

interface SectionCardProps {
  /** 卡片标题 */
  title: string
  /** 卡片副标题（描述） */
  subtitle?: string
  /** 卡片图标 */
  icon?: React.ComponentType
  /** 卡片内容 */
  children: React.ReactNode
  /** 唯一的key，用于Collapse */
  panelKey: string
  /** 区块 ID，用于滚动定位 */
  sectionId?: string
  /** 是否默认展开（非受控模式） */
  defaultActive?: boolean
  /** 是否展开（受控模式） */
  isActive?: boolean
  /** 展开状态变化回调 */
  onActiveChange?: (active: boolean) => void
  /** 恢复默认回调 */
  onResetDefault?: () => void
  /** 额外的操作按钮配置 */
  extraActions?: Array<{
    label: string
    onClick: () => void
    variant?: 'default' | 'primary'
  }>
}

/**
 * 配置区块卡片组件
 * 可折叠的配置区块，带标题和副标题
 */
export const SectionCard: React.FC<SectionCardProps> = (props) => {
  const {
    title,
    subtitle,
    icon: Icon,
    children,
    panelKey,
    sectionId,
    defaultActive = false,
    isActive,
    onActiveChange,
    onResetDefault,
    extraActions,
  } = props

  const { token } = theme.useToken()

  // 判断是否为受控模式
  const isControlled = isActive !== undefined

  /** 处理展开/折叠变化 */
  const handleChange = (keys: string | string[]) => {
    const activeKeys = Array.isArray(keys) ? keys : [keys]
    onActiveChange?.(activeKeys.includes(panelKey))
  }

  const handleResetClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onResetDefault?.()
  }

  const handleActionClick = (e: React.MouseEvent, onClick: () => void) => {
    e.stopPropagation()
    onClick()
  }

  const hasActions = extraActions?.length || onResetDefault

  const headerContent = (
    <PanelHeader align="center" justify="space-between">
      <PanelTitleWrapper align="center" gap={8}>
        {Icon && (
          <PanelIcon>
            <Icon />
          </PanelIcon>
        )}
        <PanelTitle>{title}</PanelTitle>
        {subtitle && (
          <Tooltip title={subtitle}>
            <PanelTitleHelpIcon />
          </Tooltip>
        )}
      </PanelTitleWrapper>
      {hasActions && (
        <PanelActions align="center" gap={8}>
          {extraActions?.map((action, index) => (
            <PanelActionButton
              key={index}
              $variant={action.variant}
              $colorPrimary={token.colorPrimary}
              $colorPrimaryHover={token.colorPrimaryHover}
              $colorPrimaryActive={token.colorPrimaryActive}
              onClick={(e) => handleActionClick(e, action.onClick)}
            >
              {action.label}
            </PanelActionButton>
          ))}
          {onResetDefault && (
            <PanelActionButton
              $colorPrimary={token.colorPrimary}
              $colorPrimaryHover={token.colorPrimaryHover}
              $colorPrimaryActive={token.colorPrimaryActive}
              onClick={handleResetClick}
            >
              恢复默认
            </PanelActionButton>
          )}
        </PanelActions>
      )}
    </PanelHeader>
  )

  // 受控模式使用 activeKey，非受控模式使用 defaultActiveKey
  const collapseProps = isControlled
    ? { activeKey: isActive ? [panelKey] : [], onChange: handleChange }
    : { defaultActiveKey: defaultActive ? [panelKey] : [], onChange: handleChange }

  return (
    <StyledCollapseModern id={sectionId} {...collapseProps}>
      <Panel header={headerContent} key={panelKey}>
        <Flex vertical gap={24}>
          {children}
        </Flex>
      </Panel>
    </StyledCollapseModern>
  )
}
