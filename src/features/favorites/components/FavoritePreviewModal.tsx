import { CodeMirrorEditor } from '@/features/schema-drawer/components/CodeMirrorEditor'
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
        <CodeMirrorEditor
          height="100%"
          defaultValue={content}
          theme="light"
          readOnly={true}
        />
      </PreviewEditorContainer>
    </Modal>
  )
}

