import type { Favorite } from '@/shared/types'
import { storage } from '@/shared/utils/browser/storage'
import { shadowRootManager } from '@/shared/utils/shadow-root-manager'
import { Modal } from 'antd'
import { useCallback, useState } from 'react'

interface UseFavoritesManagementProps {
  editorValue: string
  isModified: boolean
  onApplyFavorite: (content: string) => void
  /** 轻量提示回调 */
  onShowLightNotification: (text: string) => void
  /** 警告提示回调 */
  onWarning?: (message: string) => void
  /** 错误提示回调 */
  onError?: (message: string) => void
}

interface UseFavoritesManagementReturn {
  favoritesList: Favorite[]
  favoritesModalVisible: boolean
  addFavoriteModalVisible: boolean
  favoriteNameInput: string
  editModalVisible: boolean
  editingFavoriteId: string | null
  editingName: string
  editingContent: string
  setFavoriteNameInput: (value: string) => void
  handleOpenAddFavorite: () => void
  handleAddFavorite: () => Promise<void>
  handleOpenFavorites: () => Promise<void>
  handleApplyFavorite: (favorite: Favorite) => void
  handleDeleteFavorite: (id: string) => Promise<void>
  handleEditFavorite: (favorite: Favorite) => void
  handleSaveEdit: (id: string, name: string, content: string) => Promise<void>
  closeFavoritesModal: () => void
  closeAddFavoriteModal: () => void
  closeEditModal: () => void
}

/**
 * 收藏管理 Hook
 */
export const useFavoritesManagement = ({
  editorValue,
  isModified,
  onApplyFavorite,
  onShowLightNotification,
  onWarning,
  onError,
}: UseFavoritesManagementProps): UseFavoritesManagementReturn => {
  const [favoritesModalVisible, setFavoritesModalVisible] = useState(false)
  const [favoritesList, setFavoritesList] = useState<Favorite[]>([])
  const [addFavoriteModalVisible, setAddFavoriteModalVisible] = useState(false)
  const [favoriteNameInput, setFavoriteNameInput] = useState('')
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingFavoriteId, setEditingFavoriteId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingContent, setEditingContent] = useState('')

  /**
   * 打开添加收藏对话框
   */
  const handleOpenAddFavorite = useCallback(() => {
    setFavoriteNameInput('')
    setAddFavoriteModalVisible(true)
  }, [])

  /**
   * 添加到收藏
   */
  const handleAddFavorite = useCallback(async () => {
    if (!favoriteNameInput.trim()) {
      onWarning?.('请输入收藏名称')
      return
    }

    if (favoriteNameInput.length > 50) {
      onWarning?.('收藏名称不能超过50个字符')
      return
    }

    try {
      await storage.addFavorite(favoriteNameInput.trim(), editorValue)
      onShowLightNotification('已添加到收藏')
      setAddFavoriteModalVisible(false)
      setFavoriteNameInput('')
    } catch (error) {
      console.error('添加收藏失败:', error)
      onError?.('添加收藏失败')
    }
  }, [favoriteNameInput, editorValue, onShowLightNotification, onWarning, onError])

  /**
   * 打开收藏列表
   */
  const handleOpenFavorites = useCallback(async () => {
    try {
      const favorites = await storage.getFavorites()
      setFavoritesList(favorites)
      setFavoritesModalVisible(true)
    } catch (error) {
      console.error('加载收藏列表失败:', error)
      onError?.('加载收藏列表失败')
    }
  }, [onError])

  /**
   * 应用收藏内容
   */
  const applyFavoriteContent = useCallback(
    async (favorite: Favorite) => {
      onApplyFavorite(favorite.content)
      setFavoritesModalVisible(false)

      await storage.updateFavoriteUsedTime(favorite.id)

      onShowLightNotification('已应用收藏内容')
    },
    [onApplyFavorite, onShowLightNotification]
  )

  /**
   * 应用收藏
   */
  const handleApplyFavorite = useCallback(
    (favorite: Favorite) => {
      if (isModified) {
        Modal.confirm({
          title: '确认应用收藏',
          content: '当前内容未保存，应用收藏将替换当前内容，确认吗？',
          okText: '应用',
          cancelText: '取消',
          getContainer: shadowRootManager.getContainer,
          onOk: () => {
            applyFavoriteContent(favorite)
          },
        })
      } else {
        applyFavoriteContent(favorite)
      }
    },
    [isModified, applyFavoriteContent]
  )

  /**
   * 删除收藏
   */
  const handleDeleteFavorite = useCallback(
    async (id: string) => {
      try {
        await storage.deleteFavorite(id)
        const favorites = await storage.getFavorites()
        setFavoritesList(favorites)
        onShowLightNotification('收藏已删除')
      } catch (error) {
        console.error('删除收藏失败:', error)
        onError?.('删除收藏失败')
      }
    },
    [onShowLightNotification, onError]
  )

  /**
   * 编辑收藏
   */
  const handleEditFavorite = useCallback((favorite: Favorite) => {
    setEditingFavoriteId(favorite.id)
    setEditingName(favorite.name)
    try {
      const formatted = JSON.stringify(JSON.parse(favorite.content), null, 2)
      setEditingContent(formatted)
    } catch (error) {
      console.debug('JSON 格式化失败，使用原始内容:', error)
      setEditingContent(favorite.content)
    }
    setEditModalVisible(true)
  }, [])

  /**
   * 保存编辑
   */
  const handleSaveEdit = useCallback(
    async (id: string, name: string, content: string) => {
      try {
        await storage.updateFavorite(id, name, content)

        // 刷新列表
        const favorites = await storage.getFavorites()
        setFavoritesList(favorites)

        onShowLightNotification('收藏已更新')
        setEditModalVisible(false)
      } catch (error) {
        onError?.('更新收藏失败')
        throw error
      }
    },
    [onShowLightNotification, onError]
  )

  const closeFavoritesModal = useCallback(() => setFavoritesModalVisible(false), [])
  const closeAddFavoriteModal = useCallback(() => setAddFavoriteModalVisible(false), [])
  const closeEditModal = useCallback(() => setEditModalVisible(false), [])

  return {
    favoritesList,
    favoritesModalVisible,
    addFavoriteModalVisible,
    favoriteNameInput,
    editModalVisible,
    editingFavoriteId,
    editingName,
    editingContent,
    setFavoriteNameInput,
    handleOpenAddFavorite,
    handleAddFavorite,
    handleOpenFavorites,
    handleApplyFavorite,
    handleDeleteFavorite,
    handleEditFavorite,
    handleSaveEdit,
    closeFavoritesModal,
    closeAddFavoriteModal,
    closeEditModal,
  }
}
