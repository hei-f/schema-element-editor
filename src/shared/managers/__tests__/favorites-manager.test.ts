import type { Favorite } from '@/shared/types'
import { FavoritesManager, favoritesManager } from '../favorites-manager'

describe('FavoritesManager 测试', () => {
  let manager: FavoritesManager

  beforeEach(() => {
    manager = new FavoritesManager()
  })

  const createMockFavorite = (id: string, lastUsedTime?: number): Favorite => ({
    id,
    name: `Favorite ${id}`,
    content: `Content ${id}`,
    timestamp: Date.now(),
    lastUsedTime: lastUsedTime || Date.now()
  })

  describe('单例', () => {
    it('应该导出单例实例', () => {
      expect(favoritesManager).toBeInstanceOf(FavoritesManager)
    })
  })

  describe('getFavorites 获取收藏列表', () => {
    it('应该调用storage获取收藏', async () => {
      const mockFavorites = [createMockFavorite('1'), createMockFavorite('2')]
      const mockGetter = jest.fn().mockResolvedValue(mockFavorites)

      const result = await manager.getFavorites(mockGetter)

      expect(mockGetter).toHaveBeenCalled()
      expect(result).toEqual(mockFavorites)
    })

    it('空列表应该返回空数组', async () => {
      const mockGetter = jest.fn().mockResolvedValue([])

      const result = await manager.getFavorites(mockGetter)

      expect(result).toEqual([])
    })
  })

  describe('addFavorite 添加收藏', () => {
    it('应该添加新收藏到列表开头', async () => {
      const existingFavorites = [createMockFavorite('existing')]
      const mockGetter = jest.fn().mockResolvedValue(existingFavorites)
      const mockSaver = jest.fn().mockResolvedValue(undefined)

      await manager.addFavorite('New Fav', 'new content', 10, mockGetter, mockSaver)

      expect(mockSaver).toHaveBeenCalled()
      const savedFavorites = mockSaver.mock.calls[0][0] as Favorite[]
      expect(savedFavorites).toHaveLength(2)
      expect(savedFavorites[0].name).toBe('New Fav')
      expect(savedFavorites[0].content).toBe('new content')
    })

    it('应该生成唯一ID和时间戳', async () => {
      const mockGetter = jest.fn().mockResolvedValue([])
      const mockSaver = jest.fn().mockResolvedValue(undefined)
      const beforeAdd = Date.now()

      await manager.addFavorite('Test', 'content', 10, mockGetter, mockSaver)

      const savedFavorites = mockSaver.mock.calls[0][0] as Favorite[]
      const favorite = savedFavorites[0]
      
      expect(favorite.id).toMatch(/^fav_\d+_[a-z0-9]+$/)
      expect(favorite.timestamp).toBeGreaterThanOrEqual(beforeAdd)
      expect(favorite.lastUsedTime).toBeGreaterThanOrEqual(beforeAdd)
    })

    it('超过最大数量时应该应用LRU清理', async () => {
      const now = Date.now()
      const existingFavorites = [
        { ...createMockFavorite('old1'), name: 'old1', lastUsedTime: now - 3000 },
        { ...createMockFavorite('old2'), name: 'old2', lastUsedTime: now - 2000 },
        { ...createMockFavorite('recent'), name: 'recent', lastUsedTime: now - 1000 }
      ]
      const mockGetter = jest.fn().mockResolvedValue(existingFavorites)
      const mockSaver = jest.fn().mockResolvedValue(undefined)

      await manager.addFavorite('New', 'content', 3, mockGetter, mockSaver)

      const savedFavorites = mockSaver.mock.calls[0][0] as Favorite[]
      expect(savedFavorites).toHaveLength(3)
      // 应该保留新添加的和最近使用的
      expect(savedFavorites.map(f => f.name)).toContain('New')
      expect(savedFavorites.map(f => f.name)).toContain('recent')
      expect(savedFavorites.map(f => f.id)).not.toContain('old1')
    })

    it('未超过最大数量时不应该删除', async () => {
      const existingFavorites = [createMockFavorite('1'), createMockFavorite('2')]
      const mockGetter = jest.fn().mockResolvedValue(existingFavorites)
      const mockSaver = jest.fn().mockResolvedValue(undefined)

      await manager.addFavorite('New', 'content', 10, mockGetter, mockSaver)

      const savedFavorites = mockSaver.mock.calls[0][0] as Favorite[]
      expect(savedFavorites).toHaveLength(3)
    })
  })

  describe('deleteFavorite 删除收藏', () => {
    it('应该删除指定ID的收藏', async () => {
      const favorites = [
        createMockFavorite('1'),
        createMockFavorite('2'),
        createMockFavorite('3')
      ]
      const mockGetter = jest.fn().mockResolvedValue(favorites)
      const mockSaver = jest.fn().mockResolvedValue(undefined)

      await manager.deleteFavorite('2', mockGetter, mockSaver)

      const savedFavorites = mockSaver.mock.calls[0][0] as Favorite[]
      expect(savedFavorites).toHaveLength(2)
      expect(savedFavorites.map(f => f.id)).not.toContain('2')
      expect(savedFavorites.map(f => f.id)).toContain('1')
      expect(savedFavorites.map(f => f.id)).toContain('3')
    })

    it('ID不存在时应该不改变列表', async () => {
      const favorites = [createMockFavorite('1')]
      const mockGetter = jest.fn().mockResolvedValue(favorites)
      const mockSaver = jest.fn().mockResolvedValue(undefined)

      await manager.deleteFavorite('non-existent', mockGetter, mockSaver)

      const savedFavorites = mockSaver.mock.calls[0][0] as Favorite[]
      expect(savedFavorites).toEqual(favorites)
    })
  })

  describe('updateFavoriteUsedTime 更新使用时间', () => {
    it('应该更新指定收藏的lastUsedTime', async () => {
      const beforeUpdate = Date.now()
      const favorites = [
        createMockFavorite('target', beforeUpdate - 10000),
        createMockFavorite('other', beforeUpdate)
      ]
      const mockGetter = jest.fn().mockResolvedValue(favorites)
      const mockSaver = jest.fn().mockResolvedValue(undefined)

      await manager.updateFavoriteUsedTime('target', mockGetter, mockSaver)

      const savedFavorites = mockSaver.mock.calls[0][0] as Favorite[]
      const updated = savedFavorites.find(f => f.id === 'target')
      const other = savedFavorites.find(f => f.id === 'other')
      
      expect(updated!.lastUsedTime).toBeGreaterThanOrEqual(beforeUpdate)
      expect(updated!.lastUsedTime).not.toBe(beforeUpdate - 10000)
      expect(other!.lastUsedTime).toBe(beforeUpdate) // 其他收藏不变
    })

    it('ID不存在时不应该保存', async () => {
      const favorites = [createMockFavorite('1')]
      const mockGetter = jest.fn().mockResolvedValue(favorites)
      const mockSaver = jest.fn().mockResolvedValue(undefined)

      await manager.updateFavoriteUsedTime('non-existent', mockGetter, mockSaver)

      expect(mockSaver).not.toHaveBeenCalled()
    })
  })

  describe('cleanOldFavorites 清理旧收藏', () => {
    it('超过最大数量时应该删除最少使用的', async () => {
      const now = Date.now()
      const favorites = [
        createMockFavorite('oldest', now - 5000),
        createMockFavorite('old', now - 4000),
        createMockFavorite('recent', now - 1000),
        createMockFavorite('newest', now)
      ]
      const mockGetter = jest.fn().mockResolvedValue(favorites)
      const mockSaver = jest.fn().mockResolvedValue(undefined)

      const deletedCount = await manager.cleanOldFavorites(2, mockGetter, mockSaver)

      expect(deletedCount).toBe(2)
      const savedFavorites = mockSaver.mock.calls[0][0] as Favorite[]
      expect(savedFavorites).toHaveLength(2)
      expect(savedFavorites.map(f => f.id)).toContain('newest')
      expect(savedFavorites.map(f => f.id)).toContain('recent')
    })

    it('未超过最大数量时应该返回0', async () => {
      const favorites = [createMockFavorite('1'), createMockFavorite('2')]
      const mockGetter = jest.fn().mockResolvedValue(favorites)
      const mockSaver = jest.fn().mockResolvedValue(undefined)

      const deletedCount = await manager.cleanOldFavorites(5, mockGetter, mockSaver)

      expect(deletedCount).toBe(0)
      expect(mockSaver).not.toHaveBeenCalled()
    })

    it('刚好等于最大数量时应该返回0', async () => {
      const favorites = [createMockFavorite('1'), createMockFavorite('2')]
      const mockGetter = jest.fn().mockResolvedValue(favorites)
      const mockSaver = jest.fn().mockResolvedValue(undefined)

      const deletedCount = await manager.cleanOldFavorites(2, mockGetter, mockSaver)

      expect(deletedCount).toBe(0)
      expect(mockSaver).not.toHaveBeenCalled()
    })
  })

  describe('LRU算法', () => {
    it('应该按lastUsedTime降序排序', async () => {
      const now = Date.now()
      const favorites = [
        createMockFavorite('1', now - 5000),
        createMockFavorite('2', now - 1000),
        createMockFavorite('3', now - 3000)
      ]
      const mockGetter = jest.fn().mockResolvedValue(favorites)
      const mockSaver = jest.fn().mockResolvedValue(undefined)

      await manager.cleanOldFavorites(2, mockGetter, mockSaver)

      const savedFavorites = mockSaver.mock.calls[0][0] as Favorite[]
      expect(savedFavorites[0].id).toBe('2') // 最近使用
      expect(savedFavorites[1].id).toBe('3')
    })

    it('lastUsedTime不存在时应该使用timestamp', async () => {
      const now = Date.now()
      const favorites = [
        { ...createMockFavorite('old'), timestamp: now - 5000, lastUsedTime: undefined } as any,
        { ...createMockFavorite('new'), timestamp: now - 1000, lastUsedTime: undefined } as any
      ]
      const mockGetter = jest.fn().mockResolvedValue(favorites)
      const mockSaver = jest.fn().mockResolvedValue(undefined)

      await manager.cleanOldFavorites(1, mockGetter, mockSaver)

      const savedFavorites = mockSaver.mock.calls[0][0] as Favorite[]
      expect(savedFavorites[0].id).toBe('new')
    })
  })

  describe('综合场景', () => {
    it('应该处理完整的收藏生命周期', async () => {
      const mockGetter = jest.fn()
      const mockSaver = jest.fn().mockResolvedValue(undefined)

      // 初始为空
      mockGetter.mockResolvedValueOnce([])
      await manager.addFavorite('First', 'content1', 3, mockGetter, mockSaver)

      // 添加第二个
      const firstFavorite = mockSaver.mock.calls[0][0][0]
      mockGetter.mockResolvedValueOnce([firstFavorite])
      await manager.addFavorite('Second', 'content2', 3, mockGetter, mockSaver)

      // 更新使用时间
      const favorites = mockSaver.mock.calls[1][0]
      mockGetter.mockResolvedValueOnce(favorites)
      await manager.updateFavoriteUsedTime(firstFavorite.id, mockGetter, mockSaver)

      // 删除第二个（通过名称查找ID）
      const updatedFavorites = mockSaver.mock.calls[2][0]
      const secondId = updatedFavorites.find((f: Favorite) => f.name === 'Second')?.id
      mockGetter.mockResolvedValueOnce(updatedFavorites)
      await manager.deleteFavorite(secondId, mockGetter, mockSaver)

      const finalFavorites = mockSaver.mock.calls[3][0]
      expect(finalFavorites).toHaveLength(1)
      expect(finalFavorites[0].name).toBe('First')
    })

    it('应该处理大量收藏的LRU清理', async () => {
      const now = Date.now()
      const favorites: Favorite[] = []
      
      // 创建100个收藏
      for (let i = 0; i < 100; i++) {
        favorites.push(createMockFavorite(`fav${i}`, now - i * 1000))
      }

      const mockGetter = jest.fn().mockResolvedValue(favorites)
      const mockSaver = jest.fn().mockResolvedValue(undefined)

      await manager.cleanOldFavorites(10, mockGetter, mockSaver)

      const savedFavorites = mockSaver.mock.calls[0][0] as Favorite[]
      expect(savedFavorites).toHaveLength(10)
      // 应该保留最近使用的10个
      expect(savedFavorites[0].id).toBe('fav0')
      expect(savedFavorites[9].id).toBe('fav9')
    })
  })
})

