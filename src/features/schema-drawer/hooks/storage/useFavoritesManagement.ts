import type { Favorite, FavoriteMeta, FavoriteTag } from '@/shared/types'
import { storage } from '@/shared/utils/browser/storage'
import { useCallback, useState } from 'react'

interface UseFavoritesManagementProps {
  editorValue: string
  isModified: boolean
  onApplyFavorite: (content: string) => void
  /** 警告提示回调 */
  onWarning?: (message: string) => void
  /** 错误提示回调 */
  onError?: (message: string) => void
  /** 成功提示回调（用于全局message） */
  onSuccess?: (message: string) => void
}

interface UseFavoritesManagementReturn {
  favoritesList: FavoriteMeta[]
  favoritesModalVisible: boolean
  addFavoriteModalVisible: boolean
  favoriteNameInput: string
  editModalVisible: boolean
  editingFavoriteId: string | null
  editingName: string
  editingContent: string
  addTagModalVisible: boolean
  currentFavoriteForTag: Favorite | null
  applyConfirmModalVisible: boolean
  pendingApplyFavorite: Favorite | null
  setFavoriteNameInput: (value: string) => void
  handleOpenAddFavorite: () => void
  handleAddFavorite: () => Promise<void>
  handleOpenFavorites: () => Promise<void>
  handleApplyFavorite: (favorite: FavoriteMeta) => void
  handleConfirmApply: () => void
  handleCancelApply: () => void
  handleDeleteFavorite: (id: string) => Promise<void>
  handlePinFavorite: (id: string) => Promise<void>
  handleOpenAddTag: (id: string) => Promise<void>
  handleAddTag: (tag: FavoriteTag) => Promise<void>
  handleRemoveTag: (id: string, tagLabel: string) => Promise<void>
  closeAddTagModal: () => void
  handleEditFavorite: (favorite: FavoriteMeta) => void
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
  onWarning,
  onError,
  onSuccess,
}: UseFavoritesManagementProps): UseFavoritesManagementReturn => {
  const [favoritesModalVisible, setFavoritesModalVisible] = useState(false)
  const [favoritesList, setFavoritesList] = useState<FavoriteMeta[]>([])
  const [addFavoriteModalVisible, setAddFavoriteModalVisible] = useState(false)
  const [favoriteNameInput, setFavoriteNameInput] = useState('')
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingFavoriteId, setEditingFavoriteId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingContent, setEditingContent] = useState('')
  const [addTagModalVisible, setAddTagModalVisible] = useState(false)
  const [currentFavoriteForTag, setCurrentFavoriteForTag] = useState<FavoriteMeta | null>(null)
  const [applyConfirmModalVisible, setApplyConfirmModalVisible] = useState(false)
  const [pendingApplyFavorite, setPendingApplyFavorite] = useState<FavoriteMeta | null>(null)

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
      onSuccess?.('已添加到收藏')
      setAddFavoriteModalVisible(false)
      setFavoriteNameInput('')
    } catch (error) {
      console.error('添加收藏失败:', error)
      const errorMessage = error instanceof Error ? error.message : '添加收藏失败'
      onError?.(errorMessage)
    }
  }, [favoriteNameInput, editorValue, onWarning, onError, onSuccess])

  /**
   * 打开收藏列表
   */
  const handleOpenFavorites = useCallback(async () => {
    try {
      const metadata = await storage.getFavoritesMeta()
      setFavoritesList(metadata)
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
    async (favorite: FavoriteMeta) => {
      try {
        // 按需加载content
        const content = await storage.getFavoriteContent(favorite.id)
        if (content === null) {
          onError?.('获取收藏内容失败')
          return
        }

        onApplyFavorite(content)
        setFavoritesModalVisible(false)

        await storage.updateFavoriteUsedTime(favorite.id)

        onSuccess?.('已应用收藏内容')
      } catch (error) {
        console.error('应用收藏失败:', error)
        onError?.('应用收藏失败')
      }
    },
    [onApplyFavorite, onSuccess, onError]
  )

  /**
   * 应用收藏
   */
  const handleApplyFavorite = useCallback(
    (favorite: FavoriteMeta) => {
      if (isModified) {
        setPendingApplyFavorite(favorite)
        setApplyConfirmModalVisible(true)
      } else {
        applyFavoriteContent(favorite)
      }
    },
    [isModified, applyFavoriteContent]
  )

  /**
   * 确认应用收藏
   */
  const handleConfirmApply = useCallback(() => {
    if (pendingApplyFavorite) {
      applyFavoriteContent(pendingApplyFavorite)
      setApplyConfirmModalVisible(false)
      setPendingApplyFavorite(null)
    }
  }, [pendingApplyFavorite, applyFavoriteContent])

  /**
   * 取消应用收藏
   */
  const handleCancelApply = useCallback(() => {
    setApplyConfirmModalVisible(false)
    setPendingApplyFavorite(null)
  }, [])

  /**
   * 删除收藏
   */
  const handleDeleteFavorite = useCallback(
    async (id: string) => {
      try {
        await storage.deleteFavorite(id)
        const metadata = await storage.getFavoritesMeta()
        setFavoritesList(metadata)
        onSuccess?.('收藏已删除')
      } catch (error) {
        console.error('删除收藏失败:', error)
        onError?.('删除收藏失败')
      }
    },
    [onError, onSuccess]
  )

  /**
   * 切换收藏的固定状态
   */
  const handlePinFavorite = useCallback(
    async (id: string) => {
      try {
        await storage.togglePinFavorite(id)

        // 刷新列表
        const metadata = await storage.getFavoritesMeta()
        setFavoritesList(metadata)

        onSuccess?.('已更新固定状态')
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '操作失败'
        onError?.(errorMessage)
      }
    },
    [onSuccess, onError]
  )

  /**
   * 打开添加标签弹窗
   */
  const handleOpenAddTag = useCallback(
    async (id: string) => {
      const favorite = favoritesList.find((fav) => fav.id === id)
      if (favorite) {
        setCurrentFavoriteForTag(favorite)
        setAddTagModalVisible(true)
      }
    },
    [favoritesList]
  )

  /**
   * 添加标签
   */
  const handleAddTag = useCallback(
    async (tag: FavoriteTag) => {
      if (!currentFavoriteForTag) return

      try {
        const updatedTags = [...(currentFavoriteForTag.tags || []), tag]
        await storage.updateFavoriteTags(currentFavoriteForTag.id, updatedTags)

        // 刷新列表
        const metadata = await storage.getFavoritesMeta()
        setFavoritesList(metadata)

        onSuccess?.('标签已添加')
        setAddTagModalVisible(false)
        setCurrentFavoriteForTag(null)
      } catch (_error) {
        onError?.('添加标签失败')
      }
    },
    [currentFavoriteForTag, onError, onSuccess]
  )

  /**
   * 删除标签
   */
  const handleRemoveTag = useCallback(
    async (id: string, tagLabel: string) => {
      try {
        const meta = favoritesList.find((fav) => fav.id === id)
        if (!meta) return

        const updatedTags = (meta.tags || []).filter((tag) => tag.label !== tagLabel)
        await storage.updateFavoriteTags(id, updatedTags)

        // 刷新列表
        const metadata = await storage.getFavoritesMeta()
        setFavoritesList(metadata)

        onSuccess?.('标签已删除')
      } catch (_error) {
        onError?.('删除标签失败')
      }
    },
    [favoritesList, onError, onSuccess]
  )

  const closeAddTagModal = useCallback(() => {
    setAddTagModalVisible(false)
    setCurrentFavoriteForTag(null)
  }, [])

  /**
   * 编辑收藏
   */
  const handleEditFavorite = useCallback(
    async (favorite: FavoriteMeta) => {
      try {
        setEditingFavoriteId(favorite.id)
        setEditingName(favorite.name)

        // 按需加载content
        const content = await storage.getFavoriteContent(favorite.id)
        if (content === null) {
          onError?.('获取收藏内容失败')
          return
        }

        try {
          const formatted = JSON.stringify(JSON.parse(content), null, 2)
          setEditingContent(formatted)
        } catch (error) {
          console.debug('JSON 格式化失败，使用原始内容:', error)
          setEditingContent(content)
        }
        setEditModalVisible(true)
      } catch (error) {
        console.error('加载收藏内容失败:', error)
        onError?.('加载收藏内容失败')
      }
    },
    [onError]
  )

  /**
   * 保存编辑
   */
  const handleSaveEdit = useCallback(
    async (id: string, name: string, content: string) => {
      try {
        await storage.updateFavorite(id, name, content)

        // 刷新列表
        const metadata = await storage.getFavoritesMeta()
        setFavoritesList(metadata)

        onSuccess?.('收藏已更新')
        setEditModalVisible(false)
      } catch (error) {
        onError?.('更新收藏失败')
        throw error
      }
    },
    [onError, onSuccess]
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
    addTagModalVisible,
    currentFavoriteForTag,
    applyConfirmModalVisible,
    pendingApplyFavorite,
    setFavoriteNameInput,
    handleOpenAddFavorite,
    handleAddFavorite,
    handleOpenFavorites,
    handleApplyFavorite,
    handleConfirmApply,
    handleCancelApply,
    handleDeleteFavorite,
    handlePinFavorite,
    handleOpenAddTag,
    handleAddTag,
    handleRemoveTag,
    closeAddTagModal,
    handleEditFavorite,
    handleSaveEdit,
    closeFavoritesModal,
    closeAddFavoriteModal,
    closeEditModal,
  }
}
