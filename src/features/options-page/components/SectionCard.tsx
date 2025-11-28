import { Collapse } from 'antd'
import React from 'react'
import {
  CardSubtitle,
  PanelActionButton,
  PanelActions,
  PanelHeader,
  PanelTitle,
  StyledCollapse,
} from '../styles/layout.styles'

const { Panel } = Collapse

interface SectionCardProps {
  /** 卡片标题 */
  title: string
  /** 卡片副标题（描述） */
  subtitle?: string
  /** 卡片内容 */
  children: React.ReactNode
  /** 唯一的key，用于Collapse */
  panelKey: string
  /** 是否默认展开 */
  defaultActive?: boolean
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
    children,
    panelKey,
    defaultActive = true,
    onResetDefault,
    extraActions,
  } = props

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
      <PanelTitle>{title}</PanelTitle>
      {hasActions && (
        <PanelActions align="center" gap={8}>
          {extraActions?.map((action, index) => (
            <PanelActionButton
              key={index}
              $variant={action.variant}
              onClick={(e) => handleActionClick(e, action.onClick)}
            >
              {action.label}
            </PanelActionButton>
          ))}
          {onResetDefault && (
            <PanelActionButton onClick={handleResetClick}>恢复默认</PanelActionButton>
          )}
        </PanelActions>
      )}
    </PanelHeader>
  )

  return (
    <StyledCollapse defaultActiveKey={defaultActive ? [panelKey] : []}>
      <Panel header={headerContent} key={panelKey}>
        {subtitle && <CardSubtitle>{subtitle}</CardSubtitle>}
        {children}
      </Panel>
    </StyledCollapse>
  )
}
