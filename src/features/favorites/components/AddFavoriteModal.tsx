import { Input, Modal } from 'antd'
import React from 'react'

interface AddFavoriteModalProps {
  visible: boolean
  favoriteNameInput: string
  shadowRoot: ShadowRoot
  onInputChange: (value: string) => void
  onAdd: () => Promise<void>
  onClose: () => void
}

/**
 * 添加收藏模态框组件
 */
export const AddFavoriteModal: React.FC<AddFavoriteModalProps> = ({
  visible,
  favoriteNameInput,
  shadowRoot,
  onInputChange,
  onAdd,
  onClose
}) => {
  const getContainer = () => shadowRoot as any

  return (
    <Modal
      title="添加到收藏"
      open={visible}
      onOk={onAdd}
      onCancel={onClose}
      okText="添加"
      cancelText="取消"
      getContainer={getContainer}
    >
      <Input
        placeholder="请输入收藏名称（不超过50字符）"
        value={favoriteNameInput}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange(e.target.value)}
        maxLength={50}
        onPressEnter={onAdd}
      />
    </Modal>
  )
}

