import { DEFAULT_VALUES, STORAGE_KEYS } from '@/shared/constants/defaults'
import { draftManager } from '@/shared/managers/draft-manager'
import { favoritesManager } from '@/shared/managers/favorites-manager'
import type { Draft, ExportConfig, Favorite, HighlightAllConfig, PreviewConfig, SearchConfig, StorageData, ToolbarButtonsConfig } from '@/shared/types'
import { logger } from '@/shared/utils/logger'
import { SIMPLE_STORAGE_FIELDS, type StorageFieldName } from './storage-config'

/**
 * 存储管理器类
 * 封装Chrome Storage API，提供类型安全的存储操作
 */
class StorageManager {
  private readonly STORAGE_KEYS = STORAGE_KEYS
  private readonly DEFAULT_VALUES = DEFAULT_VALUES

  /**
   * 通用的获取方法
   */
  private async getSimple<T>(fieldName: StorageFieldName): Promise<T> {
    const config = SIMPLE_STORAGE_FIELDS[fieldName]
    try {
      const result = await chrome.storage.local.get(config.key)
      let value = result[config.key] ?? config.defaultValue
      
      if (config.validator && !config.validator(value)) {
        return config.defaultValue as T
      }
      
      if (config.transformer) {
        value = config.transformer(value)
      }
      
      return value as T
    } catch (error) {
      console.error(`获取${fieldName}失败:`, error)
      return config.defaultValue as T
    }
  }

  /**
   * 通用的设置方法
   */
  private async setSimple<T>(fieldName: StorageFieldName, value: T): Promise<void> {
    const config = SIMPLE_STORAGE_FIELDS[fieldName]
    try {
      await chrome.storage.local.set({
        [config.key]: value
      })
    } catch (error) {
      console.error(`设置${fieldName}失败:`, error)
    }
  }

  /**
   * 获取激活状态
   */
  async getActiveState(): Promise<boolean> {
    return this.getSimple<boolean>('isActive')
  }

  /**
   * 设置激活状态
   */
  async setActiveState(isActive: boolean): Promise<void> {
    return this.setSimple('isActive', isActive)
  }

  /**
   * 切换激活状态
   */
  async toggleActiveState(): Promise<boolean> {
    const currentState = await this.getActiveState()
    const newState = !currentState
    await this.setActiveState(newState)
    return newState
  }

  /**
   * 获取抽屉宽度
   */
  async getDrawerWidth(): Promise<string | number> {
    return this.getSimple<string | number>('drawerWidth')
  }

  /**
   * 设置抽屉宽度
   */
  async setDrawerWidth(width: string | number): Promise<void> {
    return this.setSimple('drawerWidth', width)
  }

  /**
   * 获取属性名配置
   */
  async getAttributeName(): Promise<string> {
    return this.getSimple<string>('attributeName')
  }

  /**
   * 设置属性名配置
   */
  async setAttributeName(name: string): Promise<void> {
    return this.setSimple('attributeName', name)
  }

  /**
   * 获取搜索配置
   */
  async getSearchConfig(): Promise<SearchConfig> {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEYS.SEARCH_CONFIG)
      return result[this.STORAGE_KEYS.SEARCH_CONFIG] ?? this.DEFAULT_VALUES.searchConfig
    } catch (error) {
      console.error('获取搜索配置失败:', error)
      return this.DEFAULT_VALUES.searchConfig
    }
  }

  /**
   * 设置搜索配置
   */
  async setSearchConfig(config: Partial<SearchConfig>): Promise<void> {
    try {
      const currentConfig = await this.getSearchConfig()
      const newConfig = { ...currentConfig, ...config }
      await chrome.storage.local.set({
        [this.STORAGE_KEYS.SEARCH_CONFIG]: newConfig
      })
    } catch (error) {
      console.error('设置搜索配置失败:', error)
    }
  }

  /**
   * 获取获取Schema的函数名
   */
  async getGetFunctionName(): Promise<string> {
    return this.getSimple<string>('getFunctionName')
  }

  /**
   * 获取更新Schema的函数名
   */
  async getUpdateFunctionName(): Promise<string> {
    return this.getSimple<string>('updateFunctionName')
  }

  /**
   * 设置函数名
   */
  async setFunctionNames(getFunctionName: string, updateFunctionName: string): Promise<void> {
    try {
      await chrome.storage.local.set({
        [this.STORAGE_KEYS.GET_FUNCTION_NAME]: getFunctionName,
        [this.STORAGE_KEYS.UPDATE_FUNCTION_NAME]: updateFunctionName
      })
    } catch (error) {
      console.error('设置函数名失败:', error)
    }
  }

  /**
   * 获取字符串自动解析配置
   */
  async getAutoParseString(): Promise<boolean> {
    return this.getSimple<boolean>('autoParseString')
  }

  /**
   * 设置字符串自动解析配置
   */
  async setAutoParseString(enabled: boolean): Promise<void> {
    return this.setSimple('autoParseString', enabled)
  }

  /**
   * 获取调试日志启用状态
   */
  async getEnableDebugLog(): Promise<boolean> {
    return this.getSimple<boolean>('enableDebugLog')
  }

  /**
   * 设置调试日志启用状态
   */
  async setEnableDebugLog(enabled: boolean): Promise<void> {
    return this.setSimple('enableDebugLog', enabled)
  }

  /**
   * 获取工具栏按钮配置
   */
  async getToolbarButtons(): Promise<ToolbarButtonsConfig> {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEYS.TOOLBAR_BUTTONS)
      return result[this.STORAGE_KEYS.TOOLBAR_BUTTONS] ?? this.DEFAULT_VALUES.toolbarButtons
    } catch (error) {
      console.error('获取工具栏按钮配置失败:', error)
      return this.DEFAULT_VALUES.toolbarButtons
    }
  }

  /**
   * 设置工具栏按钮配置
   */
  async setToolbarButtons(config: Partial<ToolbarButtonsConfig>): Promise<void> {
    try {
      const currentConfig = await this.getToolbarButtons()
      const newConfig = { ...currentConfig, ...config }
      await chrome.storage.local.set({
        [this.STORAGE_KEYS.TOOLBAR_BUTTONS]: newConfig
      })
    } catch (error) {
      console.error('设置工具栏按钮配置失败:', error)
    }
  }

  /**
   * 获取高亮框颜色
   */
  async getHighlightColor(): Promise<string> {
    return this.getSimple<string>('highlightColor')
  }

  /**
   * 设置高亮框颜色
   */
  async setHighlightColor(color: string): Promise<void> {
    return this.setSimple('highlightColor', color)
  }

  /**
   * 获取所有存储数据
   */
  async getAllData(): Promise<StorageData> {
    const [isActive, drawerWidth, attributeName, searchConfig, getFunctionName, updateFunctionName, autoParseString, enableDebugLog, toolbarButtons, highlightColor, maxFavoritesCount, draftRetentionDays, autoSaveDraft, draftAutoSaveDebounce, previewConfig, maxHistoryCount, highlightAllConfig, enableAstTypeHints] = await Promise.all([
      this.getActiveState(),
      this.getDrawerWidth(),
      this.getAttributeName(),
      this.getSearchConfig(),
      this.getGetFunctionName(),
      this.getUpdateFunctionName(),
      this.getAutoParseString(),
      this.getEnableDebugLog(),
      this.getToolbarButtons(),
      this.getHighlightColor(),
      this.getMaxFavoritesCount(),
      this.getDraftRetentionDays(),
      this.getAutoSaveDraft(),
      this.getDraftAutoSaveDebounce(),
      this.getPreviewConfig(),
      this.getMaxHistoryCount(),
      this.getHighlightAllConfig(),
      this.getEnableAstTypeHints()
    ])
    const exportConfig = await this.getExportConfig()
    return { isActive, drawerWidth, attributeName, searchConfig, getFunctionName, updateFunctionName, autoParseString, enableDebugLog, toolbarButtons, highlightColor, maxFavoritesCount, draftRetentionDays, autoSaveDraft, draftAutoSaveDebounce, previewConfig, maxHistoryCount, highlightAllConfig, enableAstTypeHints, exportConfig }
  }

  /**
   * 获取最大收藏数量
   */
  async getMaxFavoritesCount(): Promise<number> {
    return this.getSimple<number>('maxFavoritesCount')
  }

  /**
   * 设置最大收藏数量
   */
  async setMaxFavoritesCount(count: number): Promise<void> {
    return this.setSimple('maxFavoritesCount', count)
  }

  /**
   * 获取草稿保留天数
   */
  async getDraftRetentionDays(): Promise<number> {
    return this.getSimple<number>('draftRetentionDays')
  }

  /**
   * 设置草稿保留天数
   */
  async setDraftRetentionDays(days: number): Promise<void> {
    return this.setSimple('draftRetentionDays', days)
  }

  /**
   * 获取草稿自动保存开关
   */
  async getAutoSaveDraft(): Promise<boolean> {
    return this.getSimple<boolean>('autoSaveDraft')
  }

  /**
   * 设置草稿自动保存开关
   */
  async setAutoSaveDraft(enabled: boolean): Promise<void> {
    return this.setSimple('autoSaveDraft', enabled)
  }

  /**
   * 获取草稿自动保存防抖时间
   */
  async getDraftAutoSaveDebounce(): Promise<number> {
    return this.getSimple<number>('draftAutoSaveDebounce')
  }

  /**
   * 设置草稿自动保存防抖时间
   */
  async setDraftAutoSaveDebounce(ms: number): Promise<void> {
    return this.setSimple('draftAutoSaveDebounce', ms)
  }

  /**
   * 获取预览配置
   */
  async getPreviewConfig(): Promise<PreviewConfig> {
    return this.getSimple<PreviewConfig>('previewConfig')
  }

  /**
   * 设置预览配置
   */
  async setPreviewConfig(config: PreviewConfig): Promise<void> {
    return this.setSimple('previewConfig', config)
  }

  /**
   * 获取草稿
   */
  async getDraft(paramsKey: string): Promise<Draft | null> {
    try {
      const key = this.STORAGE_KEYS.DRAFTS_PREFIX + paramsKey
      const result = await chrome.storage.local.get(key)
      return result[key] ?? null
    } catch (error) {
      console.error('获取草稿失败:', error)
      return null
    }
  }

  /**
   * 保存草稿
   */
  async saveDraft(paramsKey: string, content: string): Promise<void> {
    try {
      await draftManager.saveDraft(
        paramsKey,
        content,
        async (key, draft) => {
          await chrome.storage.local.set({ [key]: draft })
        }
      )
    } catch (error) {
      console.error('保存草稿失败:', error)
    }
  }

  /**
   * 删除草稿
   */
  async deleteDraft(paramsKey: string): Promise<void> {
    try {
      const key = this.STORAGE_KEYS.DRAFTS_PREFIX + paramsKey
      await chrome.storage.local.remove(key)
    } catch (error) {
      console.error('删除草稿失败:', error)
    }
  }

  /**
   * 清理过期草稿
   */
  async cleanExpiredDrafts(): Promise<void> {
    try {
      const retentionDays = await this.getDraftRetentionDays()
      
      await draftManager.cleanExpiredDrafts(
        retentionDays,
        this.STORAGE_KEYS.DRAFTS_PREFIX,
        async () => await chrome.storage.local.get(null),
        async (keys) => await chrome.storage.local.remove(keys)
      )
    } catch (error) {
      console.error('清理过期草稿失败:', error)
    }
  }

  /**
   * 获取收藏列表
   */
  async getFavorites(): Promise<Favorite[]> {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEYS.FAVORITES)
      return result[this.STORAGE_KEYS.FAVORITES] ?? []
    } catch (error) {
      console.error('获取收藏列表失败:', error)
      return []
    }
  }

  /**
   * 保存收藏列表
   */
  private async saveFavorites(favorites: Favorite[]): Promise<void> {
    await chrome.storage.local.set({
      [this.STORAGE_KEYS.FAVORITES]: favorites
    })
  }

  /**
   * 添加收藏
   */
  async addFavorite(name: string, content: string): Promise<void> {
    try {
      const maxCount = await this.getMaxFavoritesCount()
      
      await favoritesManager.addFavorite(
        name,
        content,
        maxCount,
        () => this.getFavorites(),
        (favorites) => this.saveFavorites(favorites)
      )
    } catch (error) {
      console.error('添加收藏失败:', error)
      throw error
    }
  }

  /**
   * 更新收藏
   */
  async updateFavorite(id: string, name: string, content: string): Promise<void> {
    try {
      await favoritesManager.updateFavorite(
        id,
        name,
        content,
        () => this.getFavorites(),
        (favorites) => this.saveFavorites(favorites)
      )
    } catch (error) {
      console.error('更新收藏失败:', error)
      throw error
    }
  }

  /**
   * 删除收藏
   */
  async deleteFavorite(id: string): Promise<void> {
    try {
      await favoritesManager.deleteFavorite(
        id,
        () => this.getFavorites(),
        (favorites) => this.saveFavorites(favorites)
      )
    } catch (error) {
      console.error('删除收藏失败:', error)
      throw error
    }
  }

  /**
   * 更新收藏的最后使用时间
   */
  async updateFavoriteUsedTime(id: string): Promise<void> {
    try {
      await favoritesManager.updateFavoriteUsedTime(
        id,
        () => this.getFavorites(),
        (favorites) => this.saveFavorites(favorites)
      )
    } catch (error) {
      console.error('更新收藏使用时间失败:', error)
    }
  }

  /**
   * 清理超过最大数量的收藏（使用LRU算法）
   */
  async cleanOldFavorites(): Promise<void> {
    try {
      const maxCount = await this.getMaxFavoritesCount()
      const cleanedCount = await favoritesManager.cleanOldFavorites(
        maxCount,
        () => this.getFavorites(),
        (favorites) => this.saveFavorites(favorites)
      )
      
      if (cleanedCount > 0) {
        logger.log(`已清理 ${cleanedCount} 个最少使用的收藏`)
      }
    } catch (error) {
      console.error('清理收藏失败:', error)
    }
  }

  /**
   * 获取历史记录上限配置
   */
  async getMaxHistoryCount(): Promise<number> {
    return this.getSimple<number>('maxHistoryCount')
  }

  /**
   * 设置历史记录上限
   */
  async setMaxHistoryCount(count: number): Promise<void> {
    return this.setSimple('maxHistoryCount', count)
  }

  /**
   * 获取高亮所有元素配置
   */
  async getHighlightAllConfig(): Promise<HighlightAllConfig> {
    return this.getSimple<HighlightAllConfig>('highlightAllConfig')
  }

  /**
   * 设置高亮所有元素配置
   */
  async setHighlightAllConfig(config: HighlightAllConfig): Promise<void> {
    return this.setSimple('highlightAllConfig', config)
  }

  /**
   * 获取 AST 类型提示启用状态
   */
  async getEnableAstTypeHints(): Promise<boolean> {
    return this.getSimple<boolean>('enableAstTypeHints')
  }

  /**
   * 设置 AST 类型提示启用状态
   */
  async setEnableAstTypeHints(enabled: boolean): Promise<void> {
    return this.setSimple('enableAstTypeHints', enabled)
  }

  /**
   * 获取导出配置
   */
  async getExportConfig(): Promise<ExportConfig> {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEYS.EXPORT_CONFIG)
      return result[this.STORAGE_KEYS.EXPORT_CONFIG] ?? this.DEFAULT_VALUES.exportConfig
    } catch (error) {
      console.error('获取导出配置失败:', error)
      return this.DEFAULT_VALUES.exportConfig
    }
  }

  /**
   * 设置导出配置
   */
  async setExportConfig(config: Partial<ExportConfig>): Promise<void> {
    try {
      const currentConfig = await this.getExportConfig()
      const newConfig = { ...currentConfig, ...config }
      await chrome.storage.local.set({
        [this.STORAGE_KEYS.EXPORT_CONFIG]: newConfig
      })
    } catch (error) {
      console.error('设置导出配置失败:', error)
      throw error
    }
  }
}

export const storage = new StorageManager()

