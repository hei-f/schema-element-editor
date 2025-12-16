import type { ToolbarButtonsConfig } from '@/shared/types'
import React from 'react'
import { DrawerFooterContainer, FooterButton } from './styles'

interface DrawerFooterProps {
  /** 工具栏按钮配置 */
  toolbarButtons: ToolbarButtonsConfig
  /** 保存草稿 */
  onSaveDraft: () => void
  /** 关闭抽屉 */
  onClose: () => void
  /** 保存 */
  onSave: () => Promise<void>
  /** 是否正在保存 */
  isSaving: boolean
  /** 是否已修改 */
  isModified: boolean
  /** 错误处理 */
  onError: (message: string) => void
  /** 主题色 */
  themeColor: string
  /** 悬浮态颜色 */
  hoverColor: string
  /** 激活态颜色 */
  activeColor: string
}

/**
 * Schema 编辑器抽屉底部组件
 * 包含保存草稿、关闭、保存等按钮
 */
export const DrawerFooter: React.FC<DrawerFooterProps> = (props) => {
  const {
    toolbarButtons,
    onSaveDraft,
    onClose,
    onSave,
    isSaving,
    isModified,
    onError,
    themeColor,
    hoverColor,
    activeColor,
  } = props

  const handleSave = async () => {
    try {
      await onSave()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '保存失败'
      onError(errorMessage)
    }
  }

  return (
    <DrawerFooterContainer>
      {toolbarButtons.draft && <FooterButton onClick={onSaveDraft}>保存草稿</FooterButton>}
      <FooterButton onClick={onClose}>关闭</FooterButton>
      <FooterButton
        type="primary"
        onClick={handleSave}
        loading={isSaving}
        disabled={!isModified}
        $themeColor={themeColor}
        $hoverColor={hoverColor}
        $activeColor={activeColor}
      >
        {isSaving ? '保存中...' : '保存'}
      </FooterButton>
    </DrawerFooterContainer>
  )
}
