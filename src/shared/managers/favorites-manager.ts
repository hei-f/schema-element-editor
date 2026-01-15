import type { Favorite, FavoriteMeta } from '@/shared/types'

/**
 * 收藏管理服务
 * 封装收藏相关的业务逻辑，包括LRU算法
 */
export class FavoritesManager {
  /**
   * 获取收藏元数据列表（按Pin状态和LRU排序）
   */
  async getFavoritesMeta(storageGetter: () => Promise<FavoriteMeta[]>): Promise<FavoriteMeta[]> {
    const metadata = await storageGetter()
    return this.sortFavoritesMeta(metadata)
  }

  /**
   * 获取收藏列表（按Pin状态和LRU排序）
   */
  async getFavorites(storageGetter: () => Promise<Favorite[]>): Promise<Favorite[]> {
    const favorites = await storageGetter()
    return this.sortFavorites(favorites)
  }

  /**
   * 对收藏元数据列表排序：Pin的在前，然后按LRU排序
   */
  private sortFavoritesMeta(metadata: FavoriteMeta[]): FavoriteMeta[] {
    return [...metadata].sort((a, b) => {
      // Pin的优先级最高
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1

      // 都是Pin或都不是Pin，按LRU排序
      // Pin的按pinnedTime排序，非Pin的按lastUsedTime排序
      if (a.isPinned && b.isPinned) {
        return (b.pinnedTime || b.timestamp) - (a.pinnedTime || a.timestamp)
      }

      return (b.lastUsedTime || b.timestamp) - (a.lastUsedTime || a.timestamp)
    })
  }

  /**
   * 对收藏列表排序：Pin的在前，然后按LRU排序
   */
  private sortFavorites(favorites: Favorite[]): Favorite[] {
    return [...favorites].sort((a, b) => {
      // Pin的优先级最高
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1

      // 都是Pin或都不是Pin，按LRU排序
      // Pin的按pinnedTime排序，非Pin的按lastUsedTime排序
      if (a.isPinned && b.isPinned) {
        return (b.pinnedTime || b.timestamp) - (a.pinnedTime || a.timestamp)
      }

      return (b.lastUsedTime || b.timestamp) - (a.lastUsedTime || a.timestamp)
    })
  }

  /**
   * 添加收藏
   * @param maxCount 最大收藏数量
   * @throws 如果达到上限则抛出错误
   */
  async addFavorite(
    name: string,
    content: string,
    maxCount: number,
    getFavorites: () => Promise<Favorite[]>,
    saveFavorites: (favorites: Favorite[]) => Promise<void>
  ): Promise<void> {
    const favorites = await getFavorites()

    // 检查是否达到上限
    if (favorites.length >= maxCount) {
      throw new Error(`已达到收藏数量上限（${favorites.length}/${maxCount}），请删除旧收藏后再添加`)
    }

    const now = Date.now()
    const newFavorite: Favorite = {
      id: `fav_${now}_${Math.random().toString(36).slice(2, 9)}`,
      name,
      content,
      timestamp: now,
      lastUsedTime: now,
    }

    // 添加到列表开头
    favorites.unshift(newFavorite)

    await saveFavorites(favorites)
  }

  /**
   * 更新收藏
   */
  async updateFavorite(
    id: string,
    name: string,
    content: string,
    getFavorites: () => Promise<Favorite[]>,
    saveFavorites: (favorites: Favorite[]) => Promise<void>
  ): Promise<void> {
    const favorites = await getFavorites()
    const favorite = favorites.find((fav) => fav.id === id)

    if (favorite) {
      favorite.name = name
      favorite.content = content
      favorite.lastUsedTime = Date.now()
      await saveFavorites(favorites)
    } else {
      throw new Error('收藏不存在')
    }
  }

  /**
   * 删除收藏
   */
  async deleteFavorite(
    id: string,
    getFavorites: () => Promise<Favorite[]>,
    saveFavorites: (favorites: Favorite[]) => Promise<void>
  ): Promise<void> {
    const favorites = await getFavorites()
    const filtered = favorites.filter((fav) => fav.id !== id)
    await saveFavorites(filtered)
  }

  /**
   * 更新收藏的最后使用时间
   */
  async updateFavoriteUsedTime(
    id: string,
    getFavorites: () => Promise<Favorite[]>,
    saveFavorites: (favorites: Favorite[]) => Promise<void>
  ): Promise<void> {
    const favorites = await getFavorites()
    const favorite = favorites.find((fav) => fav.id === id)

    if (favorite) {
      favorite.lastUsedTime = Date.now()
      await saveFavorites(favorites)
    }
  }

  /**
   * 切换收藏的固定状态
   * @param maxPinned 最大固定数量
   */
  async togglePin(
    id: string,
    maxPinned: number,
    getFavorites: () => Promise<Favorite[]>,
    saveFavorites: (favorites: Favorite[]) => Promise<void>
  ): Promise<void> {
    const favorites = await getFavorites()
    const favorite = favorites.find((fav) => fav.id === id)

    if (!favorite) {
      throw new Error('收藏不存在')
    }

    // 如果当前是未固定状态，需要检查是否超过最大固定数量
    if (!favorite.isPinned) {
      const pinnedCount = favorites.filter((fav) => fav.isPinned).length
      if (pinnedCount >= maxPinned) {
        throw new Error(`最多只能固定 ${maxPinned} 个收藏`)
      }
      favorite.isPinned = true
      favorite.pinnedTime = Date.now()
    } else {
      // 取消固定
      favorite.isPinned = false
      favorite.pinnedTime = undefined
    }

    await saveFavorites(favorites)
  }

  /**
   * 应用LRU清理策略
   * 如果收藏数量超过最大值，删除最少使用的收藏
   */
  private applyLRUCleanup(favorites: Favorite[], maxCount: number): Favorite[] {
    if (favorites.length <= maxCount) {
      return favorites
    }

    // 按最后使用时间排序（降序）
    const sorted = [...favorites].sort(
      (a, b) => (b.lastUsedTime || b.timestamp) - (a.lastUsedTime || a.timestamp)
    )

    // 只保留最近使用的maxCount个
    return sorted.slice(0, maxCount)
  }

  /**
   * 手动清理超过最大数量的收藏
   */
  async cleanOldFavorites(
    maxCount: number,
    getFavorites: () => Promise<Favorite[]>,
    saveFavorites: (favorites: Favorite[]) => Promise<void>
  ): Promise<number> {
    const favorites = await getFavorites()

    if (favorites.length <= maxCount) {
      return 0
    }

    const cleanedFavorites = this.applyLRUCleanup(favorites, maxCount)
    await saveFavorites(cleanedFavorites)

    return favorites.length - cleanedFavorites.length
  }
}

/**
 * 导出单例实例
 */
export const favoritesManager = new FavoritesManager()
