import type { Favorite } from '@/shared/types'
import React from 'react'
import { AddFavoriteModal } from './AddFavoriteModal'
import { FavoritePreviewModal } from './FavoritePreviewModal'
import { FavoritesListModal } from './FavoritesListModal'

interface FavoritesManagerProps {
  shadowRoot: ShadowRoot
  addFavoriteModalVisible: boolean
  favoriteNameInput: string
  favoritesModalVisible: boolean
  favoritesList: Favorite[]
  previewModalVisible: boolean
  previewTitle: string
  previewContent: string
  onAddFavoriteInputChange: (value: string) => void
  onAddFavorite: () => Promise<void>
  onCloseAddFavoriteModal: () => void
  onCloseFavoritesModal: () => void
  onPreviewFavorite: (favorite: Favorite) => void
  onApplyFavorite: (favorite: Favorite) => void
  onDeleteFavorite: (id: string) => Promise<void>
  onClosePreviewModal: () => void
}

/**
 * 收藏功能管理器 - 组合所有收藏相关的模态框
 */
export const FavoritesManager: React.FC<FavoritesManagerProps> = ({
  shadowRoot,
  addFavoriteModalVisible,
  favoriteNameInput,
  favoritesModalVisible,
  favoritesList,
  previewModalVisible,
  previewTitle,
  previewContent,
  onAddFavoriteInputChange,
  onAddFavorite,
  onCloseAddFavoriteModal,
  onCloseFavoritesModal,
  onPreviewFavorite,
  onApplyFavorite,
  onDeleteFavorite,
  onClosePreviewModal
}) => {
  return (
    <>
      <AddFavoriteModal
        visible={addFavoriteModalVisible}
        favoriteNameInput={favoriteNameInput}
        shadowRoot={shadowRoot}
        onInputChange={onAddFavoriteInputChange}
        onAdd={onAddFavorite}
        onClose={onCloseAddFavoriteModal}
      />

      <FavoritesListModal
        visible={favoritesModalVisible}
        favoritesList={favoritesList}
        shadowRoot={shadowRoot}
        onPreview={onPreviewFavorite}
        onApply={onApplyFavorite}
        onDelete={onDeleteFavorite}
        onClose={onCloseFavoritesModal}
      />

      <FavoritePreviewModal
        visible={previewModalVisible}
        title={previewTitle}
        content={previewContent}
        shadowRoot={shadowRoot}
        onClose={onClosePreviewModal}
      />
    </>
  )
}

