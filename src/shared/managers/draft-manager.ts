import type { Draft } from '@/shared/types'

/**
 * 草稿管理服务
 * 封装草稿相关的业务逻辑，包括过期清理
 */
export class DraftManager {
  /**
   * 获取草稿
   */
  async getDraft(
    paramsKey: string,
    getDraftFromStorage: (key: string) => Promise<Draft | null>
  ): Promise<Draft | null> {
    return await getDraftFromStorage(paramsKey)
  }

  /**
   * 保存草稿
   */
  async saveDraft(
    paramsKey: string,
    content: string,
    saveDraftToStorage: (key: string, draft: Draft) => Promise<void>
  ): Promise<void> {
    const draft: Draft = {
      content,
      timestamp: Date.now()
    }
    await saveDraftToStorage(paramsKey, draft)
  }

  /**
   * 删除草稿
   */
  async deleteDraft(
    paramsKey: string,
    deleteDraftFromStorage: (key: string) => Promise<void>
  ): Promise<void> {
    await deleteDraftFromStorage(paramsKey)
  }

  /**
   * 检查草稿是否过期
   * @param draft 草稿对象
   * @param retentionDays 保留天数
   * @returns 是否已过期
   */
  isDraftExpired(draft: Draft, retentionDays: number): boolean {
    const expirationTime = Date.now() - retentionDays * 24 * 60 * 60 * 1000
    return draft.timestamp < expirationTime
  }

  /**
   * 筛选出过期的草稿键
   * @param allDrafts 所有草稿的键值对
   * @param retentionDays 保留天数
   * @param draftsPrefix 草稿键的前缀
   * @returns 过期的草稿键列表
   */
  findExpiredDraftKeys(
    allDrafts: Record<string, Draft>,
    retentionDays: number,
    draftsPrefix: string
  ): string[] {
    const expiredKeys: string[] = []
    
    for (const [key, draft] of Object.entries(allDrafts)) {
      if (key.startsWith(draftsPrefix) && this.isDraftExpired(draft, retentionDays)) {
        expiredKeys.push(key)
      }
    }
    
    return expiredKeys
  }

  /**
   * 清理过期草稿
   * @returns 清理的草稿数量
   */
  async cleanExpiredDrafts(
    retentionDays: number,
    draftsPrefix: string,
    getAllStorage: () => Promise<any>,
    removeKeys: (keys: string[]) => Promise<void>
  ): Promise<number> {
    try {
      const allData = await getAllStorage()
      const expiredKeys = this.findExpiredDraftKeys(allData, retentionDays, draftsPrefix)
      
      if (expiredKeys.length > 0) {
        await removeKeys(expiredKeys)
        console.log(`已清理 ${expiredKeys.length} 个过期草稿`)
      }
      
      return expiredKeys.length
    } catch (error) {
      console.error('清理过期草稿失败:', error)
      return 0
    }
  }
}

/**
 * 导出单例实例
 */
export const draftManager = new DraftManager()

