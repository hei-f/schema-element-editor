import { MODAL_Z_INDEX } from '@/shared/constants/theme'
import { shadowRootManager } from '@/shared/utils/shadow-root-manager'
import { Input, Modal } from 'antd'
import React from 'react'

interface AddFavoriteModalProps {
  visible: boolean
  favoriteNameInput: string
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
  onInputChange,
  onAdd,
  onClose,
}) => {
  return (
    <Modal
      title="添加到收藏"
      open={visible}
      onOk={onAdd}
      onCancel={onClose}
      okText="添加"
      cancelText="取消"
      getContainer={shadowRootManager.getContainer}
      zIndex={MODAL_Z_INDEX}
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
