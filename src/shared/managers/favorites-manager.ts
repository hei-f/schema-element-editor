import type { Favorite } from '@/shared/types'

/**
 * 收藏管理服务
 * 封装收藏相关的业务逻辑，包括LRU算法
 */
export class FavoritesManager {
  /**
   * 获取收藏列表
   */
  async getFavorites(storageGetter: () => Promise<Favorite[]>): Promise<Favorite[]> {
    return await storageGetter()
  }

  /**
   * 添加收藏
   * @param maxCount 最大收藏数量
   */
  async addFavorite(
    name: string,
    content: string,
    maxCount: number,
    getFavorites: () => Promise<Favorite[]>,
    saveFavorites: (favorites: Favorite[]) => Promise<void>
  ): Promise<void> {
    const favorites = await getFavorites()
    
    const now = Date.now()
    const newFavorite: Favorite = {
      id: `fav_${now}_${Math.random().toString(36).slice(2, 9)}`,
      name,
      content,
      timestamp: now,
      lastUsedTime: now
    }
    
    // 添加到列表开头
    favorites.unshift(newFavorite)
    
    // 应用LRU清理策略
    const cleanedFavorites = this.applyLRUCleanup(favorites, maxCount)
    
    await saveFavorites(cleanedFavorites)
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
    const favorite = favorites.find(fav => fav.id === id)
    
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
    const filtered = favorites.filter(fav => fav.id !== id)
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
    const favorite = favorites.find(fav => fav.id === id)
    
    if (favorite) {
      favorite.lastUsedTime = Date.now()
      await saveFavorites(favorites)
    }
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
    const sorted = [...favorites].sort((a, b) => 
      (b.lastUsedTime || b.timestamp) - (a.lastUsedTime || a.timestamp)
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

