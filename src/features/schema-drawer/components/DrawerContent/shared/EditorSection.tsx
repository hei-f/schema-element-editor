import { ContentType } from '@/shared/types'
import React from 'react'
import { CodeMirrorEditor } from '../../editor/CodeMirrorEditor'
import { EditorContainer } from '../../../styles/editor/editor.styles'
import { LightSuccessNotification } from '../../../styles/notifications/notifications.styles'
import type { EditorProps, NotificationProps } from '../types'

interface EditorSectionProps {
  editorProps: EditorProps
  notificationProps: NotificationProps
}

/**
 * 编辑器区域组件
 * 包含编辑器和轻量通知
 */
export const EditorSection: React.FC<EditorSectionProps> = (props) => {
  const { editorProps, notificationProps } = props
  const {
    editorRef,
    editorValue,
    editorTheme,
    enableAstTypeHints,
    contentType,
    onChange,
    enableContextMenu,
    onContextMenuAction,
  } = editorProps
  const { lightNotifications } = notificationProps

  const isDark = editorTheme === 'dark' || editorTheme === 'seeDark'

  return (
    <EditorContainer>
      {lightNotifications.map((notification, index) => (
        <LightSuccessNotification
          key={notification.id}
          style={{ top: `${16 + index * 48}px` }}
          $isDark={isDark}
        >
          {notification.text}
        </LightSuccessNotification>
      ))}
      <CodeMirrorEditor
        ref={editorRef}
        height="100%"
        defaultValue={editorValue}
        onChange={onChange}
        theme={editorTheme}
        placeholder="在此输入 JSON Schema..."
        enableAstHints={enableAstTypeHints}
        isAstContent={() => contentType === ContentType.Ast}
        enableContextMenu={enableContextMenu}
        onContextMenuAction={onContextMenuAction}
      />
    </EditorContainer>
  )
}
