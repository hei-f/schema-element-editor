import React from 'react'
import { EditorSection } from '../shared'
import type { NormalModeContentProps } from '../types'

/**
 * 普通编辑模式内容组件
 * 工具栏由父组件统一管理，此组件仅渲染编辑器区域
 */
export const NormalModeContent: React.FC<NormalModeContentProps> = (props) => {
  const { editorProps, notificationProps } = props

  return <EditorSection editorProps={editorProps} notificationProps={notificationProps} />
}
