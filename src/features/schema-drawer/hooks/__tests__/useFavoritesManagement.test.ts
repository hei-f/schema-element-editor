import { act, renderHook, waitFor } from '@testing-library/react'
import { storage } from '@/shared/utils/browser/storage'
import { shadowRootManager } from '@/shared/utils/shadow-root-manager'
import { Modal } from 'antd'
import { useFavoritesManagement } from '../useFavoritesManagement'
import type { Favorite } from '@/shared/types'

// Mock dependencies
jest.mock('@/shared/utils/browser/storage')
jest.mock('antd', () => ({
  Modal: {
    confirm: jest.fn()
  }
}))

const mockStorage = storage as jest.Mocked<typeof storage>
const mockModal = Modal as jest.Mocked<typeof Modal>

describe('useFavoritesManagement Hook 测试', () => {
  const mockOnApplyFavorite = jest.fn()
  const mockOnShowLightNotification = jest.fn()
  const mockOnWarning = jest.fn()
  const mockOnError = jest.fn()

  const defaultProps = {
    editorValue: 'test content',
    paramsKey: 'test-params',
    isModified: false,
    onApplyFavorite: mockOnApplyFavorite,
    onShowLightNotification: mockOnShowLightNotification,
    onWarning: mockOnWarning,
    onError: mockOnError
  }

  const mockFavorite: Favorite = {
    id: 'fav_1',
    name: '测试收藏',
    content: '{"test": "data"}',
    timestamp: Date.now(),
    sourceParams: 'test-params',
    lastUsedTime: Date.now()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    
    // 初始化 shadowRootManager
    const mockShadowRoot = document.createElement('div') as unknown as ShadowRoot
    shadowRootManager.init(mockShadowRoot)
  })
  
  afterEach(() => {
    shadowRootManager.reset()
  })

  describe('初始化', () => {
    it('应该初始化为默认状态', () => {
      const { result } = renderHook(() => useFavoritesManagement(defaultProps))

      expect(result.current.favoritesList).toEqual([])
      expect(result.current.favoritesModalVisible).toBe(false)
      expect(result.current.addFavoriteModalVisible).toBe(false)
      expect(result.current.favoriteNameInput).toBe('')
      expect(result.current.previewModalVisible).toBe(false)
      expect(result.current.previewContent).toBe('')
      expect(result.current.previewTitle).toBe('')
    })
  })

  describe('handleOpenAddFavorite 打开添加收藏对话框', () => {
    it('应该打开添加收藏对话框', () => {
      const { result } = renderHook(() => useFavoritesManagement(defaultProps))

      act(() => {
        result.current.handleOpenAddFavorite()
      })

      expect(result.current.addFavoriteModalVisible).toBe(true)
      expect(result.current.favoriteNameInput).toBe('')
    })

    it('打开时应该清空名称输入', () => {
      const { result } = renderHook(() => useFavoritesManagement(defaultProps))

      act(() => {
        result.current.setFavoriteNameInput('old name')
        result.current.handleOpenAddFavorite()
      })

      expect(result.current.favoriteNameInput).toBe('')
    })
  })

  describe('handleAddFavorite 添加收藏', () => {
    it('名称为空时应该显示警告', async () => {
      const { result } = renderHook(() => useFavoritesManagement(defaultProps))

      await act(async () => {
        await result.current.handleAddFavorite()
      })

      expect(mockOnWarning).toHaveBeenCalledWith('请输入收藏名称')
      expect(mockStorage.addFavorite).not.toHaveBeenCalled()
    })

    it('名称只有空格时应该显示警告', async () => {
      const { result } = renderHook(() => useFavoritesManagement(defaultProps))

      act(() => {
        result.current.setFavoriteNameInput('   ')
      })

      await act(async () => {
        await result.current.handleAddFavorite()
      })

      expect(mockOnWarning).toHaveBeenCalledWith('请输入收藏名称')
    })

    it('名称超过50个字符时应该显示警告', async () => {
      const { result } = renderHook(() => useFavoritesManagement(defaultProps))

      act(() => {
        result.current.setFavoriteNameInput('a'.repeat(51))
      })

      await act(async () => {
        await result.current.handleAddFavorite()
      })

      expect(mockOnWarning).toHaveBeenCalledWith('收藏名称不能超过50个字符')
    })

    it('应该成功添加收藏', async () => {
      mockStorage.addFavorite.mockResolvedValue(undefined)
      const { result } = renderHook(() => useFavoritesManagement(defaultProps))

      act(() => {
        result.current.setFavoriteNameInput('My Favorite')
      })

      await act(async () => {
        await result.current.handleAddFavorite()
      })

      expect(mockStorage.addFavorite).toHaveBeenCalledWith('My Favorite', 'test content', 'test-params')
      expect(mockOnShowLightNotification).toHaveBeenCalledWith('已添加到收藏')
      expect(result.current.addFavoriteModalVisible).toBe(false)
      expect(result.current.favoriteNameInput).toBe('')
    })

    it('应该去除名称首尾空格', async () => {
      mockStorage.addFavorite.mockResolvedValue(undefined)
      const { result } = renderHook(() => useFavoritesManagement(defaultProps))

      act(() => {
        result.current.setFavoriteNameInput('  My Favorite  ')
      })

      await act(async () => {
        await result.current.handleAddFavorite()
      })

      expect(mockStorage.addFavorite).toHaveBeenCalledWith('My Favorite', 'test content', 'test-params')
    })

    it('添加失败时应该显示错误', async () => {
      mockStorage.addFavorite.mockRejectedValue(new Error('Add error'))
      const { result } = renderHook(() => useFavoritesManagement(defaultProps))

      act(() => {
        result.current.setFavoriteNameInput('My Favorite')
      })

      await act(async () => {
        await result.current.handleAddFavorite()
      })

      expect(mockOnError).toHaveBeenCalledWith('添加收藏失败')
    })
  })

  describe('handleOpenFavorites 打开收藏列表', () => {
    it('应该加载并显示收藏列表', async () => {
      const mockFavorites = [mockFavorite]
      mockStorage.getFavorites.mockResolvedValue(mockFavorites)

      const { result } = renderHook(() => useFavoritesManagement(defaultProps))

      await act(async () => {
        await result.current.handleOpenFavorites()
      })

      expect(mockStorage.getFavorites).toHaveBeenCalled()
      expect(result.current.favoritesList).toEqual(mockFavorites)
      expect(result.current.favoritesModalVisible).toBe(true)
    })

    it('加载失败时应该显示错误', async () => {
      mockStorage.getFavorites.mockRejectedValue(new Error('Load error'))

      const { result } = renderHook(() => useFavoritesManagement(defaultProps))

      await act(async () => {
        await result.current.handleOpenFavorites()
      })

      expect(mockOnError).toHaveBeenCalledWith('加载收藏列表失败')
    })
  })

  describe('handleApplyFavorite 应用收藏', () => {
    it('未修改时应该直接应用收藏', async () => {
      mockStorage.updateFavoriteUsedTime.mockResolvedValue(undefined)
      const { result } = renderHook(() => useFavoritesManagement(defaultProps))

      await act(async () => {
        result.current.handleApplyFavorite(mockFavorite)
      })

      await waitFor(() => {
        expect(mockOnApplyFavorite).toHaveBeenCalledWith('{"test": "data"}')
        expect(mockStorage.updateFavoriteUsedTime).toHaveBeenCalledWith('fav_1')
        expect(mockOnShowLightNotification).toHaveBeenCalledWith('已应用收藏内容')
        expect(result.current.favoritesModalVisible).toBe(false)
      })
    })

    it('已修改时应该显示确认对话框', async () => {
      mockStorage.updateFavoriteUsedTime.mockResolvedValue(undefined)
      mockModal.confirm.mockImplementation(({ onOk }) => {
        onOk?.()
        return {} as any
      })

      const { result } = renderHook(() => useFavoritesManagement({
        ...defaultProps,
        isModified: true
      }))

      await act(async () => {
        result.current.handleApplyFavorite(mockFavorite)
      })

      expect(mockModal.confirm).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '确认应用收藏',
          content: '当前内容未保存，应用收藏将替换当前内容，确认吗？'
        })
      )

      await waitFor(() => {
        expect(mockOnApplyFavorite).toHaveBeenCalledWith('{"test": "data"}')
      })
    })
  })

  describe('handleDeleteFavorite 删除收藏', () => {
    it('应该成功删除收藏并刷新列表', async () => {
      const updatedFavorites: Favorite[] = []
      mockStorage.deleteFavorite.mockResolvedValue(undefined)
      mockStorage.getFavorites.mockResolvedValue(updatedFavorites)

      const { result } = renderHook(() => useFavoritesManagement(defaultProps))

      await act(async () => {
        await result.current.handleDeleteFavorite('fav_1')
      })

      expect(mockStorage.deleteFavorite).toHaveBeenCalledWith('fav_1')
      expect(mockStorage.getFavorites).toHaveBeenCalled()
      expect(result.current.favoritesList).toEqual(updatedFavorites)
      expect(mockOnShowLightNotification).toHaveBeenCalledWith('收藏已删除')
    })

    it('删除失败时应该显示错误', async () => {
      mockStorage.deleteFavorite.mockRejectedValue(new Error('Delete error'))

      const { result } = renderHook(() => useFavoritesManagement(defaultProps))

      await act(async () => {
        await result.current.handleDeleteFavorite('fav_1')
      })

      expect(mockOnError).toHaveBeenCalledWith('删除收藏失败')
    })
  })

  describe('handlePreviewFavorite 预览收藏', () => {
    it('应该格式化JSON内容并显示预览', () => {
      const { result } = renderHook(() => useFavoritesManagement(defaultProps))

      act(() => {
        result.current.handlePreviewFavorite(mockFavorite)
      })

      expect(result.current.previewModalVisible).toBe(true)
      expect(result.current.previewTitle).toBe('测试收藏')
      expect(result.current.previewContent).toBe(JSON.stringify(JSON.parse('{"test": "data"}'), null, 2))
    })

    it('非JSON内容应该直接显示', () => {
      const nonJsonFavorite: Favorite = {
        ...mockFavorite,
        content: 'plain text content'
      }

      const { result } = renderHook(() => useFavoritesManagement(defaultProps))

      act(() => {
        result.current.handlePreviewFavorite(nonJsonFavorite)
      })

      expect(result.current.previewContent).toBe('plain text content')
    })

    it('格式化失败时应该显示原始内容', () => {
      const invalidJsonFavorite: Favorite = {
        ...mockFavorite,
        content: '{invalid json'
      }

      const { result } = renderHook(() => useFavoritesManagement(defaultProps))

      act(() => {
        result.current.handlePreviewFavorite(invalidJsonFavorite)
      })

      expect(result.current.previewContent).toBe('{invalid json')
    })
  })

  describe('关闭对话框', () => {
    it('应该关闭收藏列表对话框', () => {
      const { result } = renderHook(() => useFavoritesManagement(defaultProps))

      act(() => {
        result.current.closeFavoritesModal()
      })

      expect(result.current.favoritesModalVisible).toBe(false)
    })

    it('应该关闭添加收藏对话框', () => {
      const { result } = renderHook(() => useFavoritesManagement(defaultProps))

      act(() => {
        result.current.closeAddFavoriteModal()
      })

      expect(result.current.addFavoriteModalVisible).toBe(false)
    })

    it('应该关闭预览对话框', () => {
      const { result } = renderHook(() => useFavoritesManagement(defaultProps))

      act(() => {
        result.current.closePreviewModal()
      })

      expect(result.current.previewModalVisible).toBe(false)
    })
  })

  describe('setFavoriteNameInput', () => {
    it('应该更新收藏名称输入', () => {
      const { result } = renderHook(() => useFavoritesManagement(defaultProps))

      act(() => {
        result.current.setFavoriteNameInput('New Name')
      })

      expect(result.current.favoriteNameInput).toBe('New Name')
    })
  })
})

