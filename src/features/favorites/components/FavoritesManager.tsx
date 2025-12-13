import type { EditorTheme, Favorite } from '@/shared/types'
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
  /** 编辑器主题 */
  editorTheme: EditorTheme
  /** 主题颜色 */
  themeColor: string
  onAddFavoriteInputChange: (value: string) => void
  onAddFavorite: () => Promise<void>
  onCloseAddFavoriteModal: () => void
  onCloseFavoritesModal: () => void
  onEditFavorite: (favorite: Favorite) => void
  onApplyFavorite: (favorite: Favorite) => void
  onDeleteFavorite: (id: string) => Promise<void>
  onPinFavorite: (id: string) => Promise<void>
  onAddTag: (id: string) => Promise<void>
  onRemoveTag: (id: string, tagLabel: string) => Promise<void>
  onSaveEdit: (id: string, name: string, content: string) => Promise<void>
  onCloseEditModal: () => void
}

/**
 * 收藏功能管理器 - 组合所有收藏相关的模态框
 */
export const FavoritesManager: React.FC<FavoritesManagerProps> = (props) => {
  const {
    addFavoriteModalVisible,
    favoriteNameInput,
    favoritesModalVisible,
    favoritesList,
    editModalVisible,
    editingFavoriteId,
    editingName,
    editingContent,
    editorTheme,
    themeColor,
    onAddFavoriteInputChange,
    onAddFavorite,
    onCloseAddFavoriteModal,
    onCloseFavoritesModal,
    onEditFavorite,
    onApplyFavorite,
    onDeleteFavorite,
    onPinFavorite,
    onAddTag,
    onRemoveTag,
    onSaveEdit,
    onCloseEditModal,
  } = props
  return (
    <>
      <AddFavoriteModal
        visible={addFavoriteModalVisible}
        favoriteNameInput={favoriteNameInput}
        themeColor={themeColor}
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
        onPin={onPinFavorite}
        onAddTag={onAddTag}
        onRemoveTag={onRemoveTag}
        onClose={onCloseFavoritesModal}
      />

      <FavoriteEditModal
        visible={editModalVisible}
        favoriteId={editingFavoriteId}
        initialName={editingName}
        initialContent={editingContent}
        editorTheme={editorTheme}
        onSave={onSaveEdit}
        onClose={onCloseEditModal}
      />
    </>
  )
}
