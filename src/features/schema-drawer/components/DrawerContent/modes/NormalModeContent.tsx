import React from 'react'
import { DrawerToolbar } from '../../toolbar/DrawerToolbar'
import { EditorSection } from '../shared'
import type { NormalModeContentProps } from '../types'

/**
 * 普通编辑模式内容组件
 */
export const NormalModeContent: React.FC<NormalModeContentProps> = (props) => {
  const {
    attributes,
    contentType,
    canParse,
    toolbarButtons,
    toolbarActions,
    editorProps,
    notificationProps,
    previewEnabled,
  } = props

  return (
    <>
      <DrawerToolbar
        attributes={attributes}
        contentType={contentType}
        canParse={canParse}
        toolbarButtons={toolbarButtons}
        previewEnabled={previewEnabled}
        showDiffButton={true}
        onFormat={toolbarActions.onFormat}
        onEscape={toolbarActions.onEscape}
        onUnescape={toolbarActions.onUnescape}
        onCompact={toolbarActions.onCompact}
        onParse={toolbarActions.onParse}
        onSegmentChange={toolbarActions.onSegmentChange}
        onRenderPreview={toolbarActions.onRenderPreview}
        onEnterDiffMode={toolbarActions.onEnterDiffMode}
        onLocateError={toolbarActions.onLocateError}
        onRepairJson={toolbarActions.onRepairJson}
      />
      <EditorSection editorProps={editorProps} notificationProps={notificationProps} />
    </>
  )
}
