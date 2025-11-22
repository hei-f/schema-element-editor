import Editor from '@monaco-editor/react'
import { Button, Modal } from 'antd'
import React from 'react'
import { PreviewEditorContainer } from '../styles/modals.styles'

interface FavoritePreviewModalProps {
  visible: boolean
  title: string
  content: string
  shadowRoot: ShadowRoot
  onClose: () => void
}

/**
 * 收藏预览模态框组件
 */
export const FavoritePreviewModal: React.FC<FavoritePreviewModalProps> = ({
  visible,
  title,
  content,
  shadowRoot,
  onClose
}) => {
  const getContainer = () => shadowRoot as any

  return (
    <Modal
      title={`预览：${title}`}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          关闭
        </Button>
      ]}
      width={900}
      getContainer={getContainer}
      styles={{
        body: { padding: 0, height: '600px' }
      }}
    >
      <PreviewEditorContainer>
        <Editor
          height="100%"
          defaultLanguage="json"
          value={content}
          theme="vs"
          options={{
            readOnly: true,
            fontSize: 14,
            fontFamily: 'Monaco, Menlo, Consolas, monospace',
            lineNumbers: 'on',
            folding: true,
            showFoldingControls: 'always',
            foldingStrategy: 'indentation',
            foldingHighlight: true,
            unfoldOnClickAfterEndOfLine: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            renderLineHighlight: 'none',
            contextmenu: false,
            quickSuggestions: false,
            parameterHints: { enabled: false },
            suggestOnTriggerCharacters: false,
            acceptSuggestionOnEnter: 'off',
            tabCompletion: 'off',
            wordBasedSuggestions: 'off'
          }}
        />
      </PreviewEditorContainer>
    </Modal>
  )
}

