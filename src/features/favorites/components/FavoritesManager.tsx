import type { Favorite } from '@/shared/types'
import React from 'react'
import { AddFavoriteModal } from './AddFavoriteModal'
import { FavoriteEditModal } from './FavoriteEditModal'
import { FavoritesListModal } from './FavoritesListModal'

interface FavoritesManagerProps {
  addFavoriteModalVisible: boolean
  favoriteNameInput: string
  favoritesModalVisible: boolean
  favoritesList: Favorite[]
  editModalVisible: boolean
  editingFavoriteId: string | null
  editingName: string
  editingContent: string
  onAddFavoriteInputChange: (value: string) => void
  onAddFavorite: () => Promise<void>
  onCloseAddFavoriteModal: () => void
  onCloseFavoritesModal: () => void
  onEditFavorite: (favorite: Favorite) => void
  onApplyFavorite: (favorite: Favorite) => void
  onDeleteFavorite: (id: string) => Promise<void>
  onSaveEdit: (id: string, name: string, content: string) => Promise<void>
  onCloseEditModal: () => void
}

/**
 * 收藏功能管理器 - 组合所有收藏相关的模态框
 */
export const FavoritesManager: React.FC<FavoritesManagerProps> = ({
  addFavoriteModalVisible,
  favoriteNameInput,
  favoritesModalVisible,
  favoritesList,
  editModalVisible,
  editingFavoriteId,
  editingName,
  editingContent,
  onAddFavoriteInputChange,
  onAddFavorite,
  onCloseAddFavoriteModal,
  onCloseFavoritesModal,
  onEditFavorite,
  onApplyFavorite,
  onDeleteFavorite,
  onSaveEdit,
  onCloseEditModal,
}) => {
  return (
    <>
      <AddFavoriteModal
        visible={addFavoriteModalVisible}
        favoriteNameInput={favoriteNameInput}
        onInputChange={onAddFavoriteInputChange}
        onAdd={onAddFavorite}
        onClose={onCloseAddFavoriteModal}
      />

      <FavoritesListModal
        visible={favoritesModalVisible}
        favoritesList={favoritesList}
        onEdit={onEditFavorite}
        onApply={onApplyFavorite}
        onDelete={onDeleteFavorite}
        onClose={onCloseFavoritesModal}
      />

      <FavoriteEditModal
        visible={editModalVisible}
        favoriteId={editingFavoriteId}
        initialName={editingName}
        initialContent={editingContent}
        onSave={onSaveEdit}
        onClose={onCloseEditModal}
      />
    </>
  )
}
