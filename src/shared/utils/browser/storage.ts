import { DEFAULT_VALUES, STORAGE_KEYS } from '@/shared/constants/defaults'
import { draftManager } from '@/shared/managers/draft-manager'
import { favoritesManager } from '@/shared/managers/favorites-manager'
import { presetManager } from '@/shared/managers/preset-manager'
import type {
  ApiConfig,
  ConfigPreset,
  ConfigPresetMeta,
  ConfigPresetsContentMap,
  Draft,
  DrawerShortcutsConfig,
  EditorContextMenuConfig,
  EditorTheme,
  ExportConfig,
  Favorite,
  FavoriteMeta,
  FavoritesContentMap,
  FavoriteTag,
  HighlightAllConfig,
  IframeConfig,
  PreviewConfig,
  RecordingModeConfig,
  SearchConfig,
  StorageData,
  ToolbarButtonsConfig,
} from '@/shared/types'
import { SIMPLE_STORAGE_FIELDS, type StorageFieldName } from './storage-config'

/**
 * 存储键到值类型的映射
 */
type StorageValueMap = {
  [STORAGE_KEYS.SEARCH_CONFIG]: Partial<SearchConfig>
  [STORAGE_KEYS.TOOLBAR_BUTTONS]: Partial<ToolbarButtonsConfig>
  [STORAGE_KEYS.PREVIEW_CONFIG]: Partial<PreviewConfig>
  [STORAGE_KEYS.FAVORITES]: Favorite[]
  [STORAGE_KEYS.FAVORITES_METADATA]: FavoriteMeta[]
  [STORAGE_KEYS.FAVORITES_CONTENT]: FavoritesContentMap
  [STORAGE_KEYS.CONFIG_PRESETS]: ConfigPreset[]
  [STORAGE_KEYS.CONFIG_PRESETS_METADATA]: ConfigPresetMeta[]
  [STORAGE_KEYS.CONFIG_PRESETS_CONTENT]: ConfigPresetsContentMap
  [STORAGE_KEYS.HIGHLIGHT_ALL_CONFIG]: Partial<HighlightAllConfig>
  [STORAGE_KEYS.RECORDING_MODE_CONFIG]: Partial<RecordingModeConfig>
  [STORAGE_KEYS.IFRAME_CONFIG]: Partial<IframeConfig>
  [STORAGE_KEYS.EXPORT_CONFIG]: Partial<ExportConfig>
  [STORAGE_KEYS.API_CONFIG]: Partial<ApiConfig>
  [STORAGE_KEYS.DRAWER_SHORTCUTS]: Partial<DrawerShortcutsConfig> & { togglePreview?: unknown }
  [STORAGE_KEYS.CONTEXT_MENU_CONFIG]: Partial<EditorContextMenuConfig>
}

/**
 * 存储管理器类
 * 封装Chrome Storage API，提供类型安全的存储操作
 */
class StorageManager {
  private readonly STORAGE_KEYS = STORAGE_KEYS
  private readonly DEFAULT_VALUES = DEFAULT_VALUES
  private migrationCompleted = false

  constructor() {
    // 异步执行数据迁移（不阻塞实例化）
    this.migrateOldFavoritesData().catch((error) => {
      console.error('收藏数据迁移失败:', error)
    })
    this.migrateOldPresetsData().catch((error) => {
      console.error('预设配置数据迁移失败:', error)
    })
  }

  /**
   * 迁移旧版收藏数据到新的分离存储格式
   * @deprecated 此方法将在下个大版本中移除
   * TODO: 在下个大版本（v3.0.0）中移除此迁移逻辑
   */
  private async migrateOldFavoritesData(): Promise<void> {
    if (this.migrationCompleted) {
      return
    }

    try {
      // 检查是否存在旧数据
      const oldFavorites = await this.getStorageValue(this.STORAGE_KEYS.FAVORITES)
      if (!oldFavorites || oldFavorites.length === 0) {
        this.migrationCompleted = true
        return
      }

      // 检查新格式数据是否已存在
      const existingMeta = await this.getStorageValue(this.STORAGE_KEYS.FAVORITES_METADATA)
      if (existingMeta && existingMeta.length > 0) {
        // 新数据已存在，跳过迁移
        this.migrationCompleted = true
        return
      }

      console.log('开始迁移收藏数据到新格式...')

      // 分离元数据和内容
      const metadata: FavoriteMeta[] = []
      const contentMap: FavoritesContentMap = {}

      for (const favorite of oldFavorites) {
        // 提取元数据
        metadata.push({
          id: favorite.id,
          name: favorite.name,
          timestamp: favorite.timestamp,
          lastUsedTime: favorite.lastUsedTime,
          isPinned: favorite.isPinned,
          pinnedTime: favorite.pinnedTime,
          tags: favorite.tags,
        })

        // 存储内容
        contentMap[favorite.id] = favorite.content
      }

      // 保存新格式数据
      await chrome.storage.local.set({
        [this.STORAGE_KEYS.FAVORITES_METADATA]: metadata,
        [this.STORAGE_KEYS.FAVORITES_CONTENT]: contentMap,
      })

      // 删除旧数据
      await chrome.storage.local.remove(this.STORAGE_KEYS.FAVORITES)

      console.log(`收藏数据迁移完成，共迁移 ${metadata.length} 条记录`)
      this.migrationCompleted = true
    } catch (error) {
      console.error('收藏数据迁移失败:', error)
      throw error
    }
  }

  /**
   * 迁移旧版预设配置数据到新的分离存储格式
   * @deprecated 此方法将在下个大版本中移除
   * TODO: 在下个大版本（v3.0.0）中移除此迁移逻辑
   */
  private async migrateOldPresetsData(): Promise<void> {
    try {
      // 检查是否存在旧数据
      const oldPresets = await this.getStorageValue(this.STORAGE_KEYS.CONFIG_PRESETS)
      if (!oldPresets || oldPresets.length === 0) {
        return
      }

      // 检查新格式数据是否已存在
      const existingMeta = await this.getStorageValue(this.STORAGE_KEYS.CONFIG_PRESETS_METADATA)
      if (existingMeta && existingMeta.length > 0) {
        // 新数据已存在，跳过迁移
        return
      }

      console.log('开始迁移预设配置数据到新格式...')

      // 分离元数据和内容
      const metadata: ConfigPresetMeta[] = []
      const contentMap: ConfigPresetsContentMap = {}

      for (const preset of oldPresets) {
        // 提取元数据
        metadata.push({
          id: preset.id,
          name: preset.name,
          timestamp: preset.timestamp,
        })

        // 存储内容
        contentMap[preset.id] = preset.config
      }

      // 保存新格式数据
      await chrome.storage.local.set({
        [this.STORAGE_KEYS.CONFIG_PRESETS_METADATA]: metadata,
        [this.STORAGE_KEYS.CONFIG_PRESETS_CONTENT]: contentMap,
      })

      // 删除旧数据
      await chrome.storage.local.remove(this.STORAGE_KEYS.CONFIG_PRESETS)

      console.log(`预设配置数据迁移完成，共迁移 ${metadata.length} 条记录`)
    } catch (error) {
      console.error('预设配置数据迁移失败:', error)
      throw error
    }
  }

  /**
   * 类型安全的存储值获取方法
   */
  private async getStorageValue<K extends keyof StorageValueMap>(
    key: K
  ): Promise<StorageValueMap[K] | undefined> {
    const result = await chrome.storage.local.get<{ [P in K]: StorageValueMap[P] }>(key)
    return result[key]
  }

  /**
   * 通用的获取方法
   */
  private async getSimple<T>(fieldName: StorageFieldName): Promise<T> {
    const config = SIMPLE_STORAGE_FIELDS[fieldName]
    try {
      const result = await chrome.storage.local.get(config.key)
      const value = result[config.key] ?? config.defaultValue

      if (config.validator && !config.validator(value)) {
        return config.defaultValue as T
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
        [config.key]: value,
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
  async getDrawerWidth(): Promise<string> {
    return this.getSimple<string>('drawerWidth')
  }

  /**
   * 设置抽屉宽度
   */
  async setDrawerWidth(width: string): Promise<void> {
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
   * 合并存储值和默认值，确保新增字段也能获取到默认值
   */
  async getSearchConfig(): Promise<SearchConfig> {
    try {
      const storedConfig = await this.getStorageValue(this.STORAGE_KEYS.SEARCH_CONFIG)
      return { ...this.DEFAULT_VALUES.searchConfig, ...storedConfig }
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
        [this.STORAGE_KEYS.SEARCH_CONFIG]: newConfig,
      })
    } catch (error) {
      console.error('设置搜索配置失败:', error)
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
   * 获取工具栏按钮配置
   * 合并存储值和默认值，确保新增字段也能获取到默认值
   */
  async getToolbarButtons(): Promise<ToolbarButtonsConfig> {
    try {
      const storedConfig = await this.getStorageValue(this.STORAGE_KEYS.TOOLBAR_BUTTONS)
      // 合并默认值，确保新增字段能获取到默认值
      return { ...this.DEFAULT_VALUES.toolbarButtons, ...storedConfig }
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
        [this.STORAGE_KEYS.TOOLBAR_BUTTONS]: newConfig,
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
    const [
      isActive,
      drawerWidth,
      attributeName,
      searchConfig,
      autoParseString,
      toolbarButtons,
      highlightColor,
      maxFavoritesCount,
      maxPinnedFavorites,
      maxConfigPresetsCount,
      draftRetentionDays,
      autoSaveDraft,
      draftAutoSaveDebounce,
      previewConfig,
      maxHistoryCount,
      highlightAllConfig,
      recordingModeConfig,
      iframeConfig,
      enableAstTypeHints,
      editorTheme,
      apiConfig,
      drawerShortcuts,
      themeColor,
      contextMenuConfig,
    ] = await Promise.all([
      this.getActiveState(),
      this.getDrawerWidth(),
      this.getAttributeName(),
      this.getSearchConfig(),
      this.getAutoParseString(),
      this.getToolbarButtons(),
      this.getHighlightColor(),
      this.getMaxFavoritesCount(),
      this.getMaxPinnedFavorites(),
      this.getMaxConfigPresetsCount(),
      this.getDraftRetentionDays(),
      this.getAutoSaveDraft(),
      this.getDraftAutoSaveDebounce(),
      this.getPreviewConfig(),
      this.getMaxHistoryCount(),
      this.getHighlightAllConfig(),
      this.getRecordingModeConfig(),
      this.getIframeConfig(),
      this.getEnableAstTypeHints(),
      this.getEditorTheme(),
      this.getApiConfig(),
      this.getDrawerShortcuts(),
      this.getThemeColor(),
      this.getContextMenuConfig(),
    ])
    const exportConfig = await this.getExportConfig()
    return {
      isActive,
      drawerWidth,
      attributeName,
      searchConfig,
      autoParseString,
      toolbarButtons,
      highlightColor,
      maxFavoritesCount,
      maxPinnedFavorites,
      maxConfigPresetsCount,
      draftRetentionDays,
      autoSaveDraft,
      draftAutoSaveDebounce,
      previewConfig,
      maxHistoryCount,
      highlightAllConfig,
      recordingModeConfig,
      iframeConfig,
      enableAstTypeHints,
      exportConfig,
      editorTheme,
      apiConfig,
      drawerShortcuts,
      themeColor,
      contextMenuConfig,
    }
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
   * 获取最大固定收藏数量
   */
  async getMaxPinnedFavorites(): Promise<number> {
    return this.getSimple<number>('maxPinnedFavorites')
  }

  /**
   * 设置最大固定收藏数量
   */
  async setMaxPinnedFavorites(count: number): Promise<void> {
    return this.setSimple('maxPinnedFavorites', count)
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
   * 合并存储值和默认值，确保新增字段也能获取到默认值
   */
  async getPreviewConfig(): Promise<PreviewConfig> {
    try {
      const storedConfig = await this.getStorageValue(this.STORAGE_KEYS.PREVIEW_CONFIG)
      if (!storedConfig) {
        return this.DEFAULT_VALUES.previewConfig
      }
      return {
        ...this.DEFAULT_VALUES.previewConfig,
        ...storedConfig,
        zIndex: {
          ...this.DEFAULT_VALUES.previewConfig.zIndex,
          ...storedConfig.zIndex,
        },
      }
    } catch (error) {
      console.error('获取预览配置失败:', error)
      return this.DEFAULT_VALUES.previewConfig
    }
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
      const result = await chrome.storage.local.get<Record<string, Draft>>(key)
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
      await draftManager.saveDraft(paramsKey, content, async (key, draft) => {
        await chrome.storage.local.set({ [key]: draft })
      })
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
   * 获取收藏元数据列表（已排序：Pin的在前，然后按LRU排序）
   */
  async getFavoritesMeta(): Promise<FavoriteMeta[]> {
    try {
      return await favoritesManager.getFavoritesMeta(() => this.getRawFavoritesMeta())
    } catch (error) {
      console.error('获取收藏元数据列表失败:', error)
      return []
    }
  }

  /**
   * 获取指定收藏的内容
   */
  async getFavoriteContent(id: string): Promise<string | null> {
    try {
      const contentMap = await this.getRawFavoritesContent()
      return contentMap[id] ?? null
    } catch (error) {
      console.error('获取收藏内容失败:', error)
      return null
    }
  }

  /**
   * 获取收藏列表（已排序：Pin的在前，然后按LRU排序）
   * 合并元数据和内容，返回完整的Favorite对象
   */
  async getFavorites(): Promise<Favorite[]> {
    try {
      const metadata = await this.getFavoritesMeta()
      const contentMap = await this.getRawFavoritesContent()

      return metadata.map((meta) => ({
        ...meta,
        content: contentMap[meta.id] ?? '',
      }))
    } catch (error) {
      console.error('获取收藏列表失败:', error)
      return []
    }
  }

  /**
   * 获取原始收藏元数据列表（未排序，用于内部存储操作）
   */
  private async getRawFavoritesMeta(): Promise<FavoriteMeta[]> {
    try {
      const storedValue = await this.getStorageValue(this.STORAGE_KEYS.FAVORITES_METADATA)
      return storedValue ?? []
    } catch (error) {
      console.error('获取收藏元数据列表失败:', error)
      return []
    }
  }

  /**
   * 获取原始收藏内容映射（用于内部存储操作）
   */
  private async getRawFavoritesContent(): Promise<FavoritesContentMap> {
    try {
      const storedValue = await this.getStorageValue(this.STORAGE_KEYS.FAVORITES_CONTENT)
      return storedValue ?? {}
    } catch (error) {
      console.error('获取收藏内容映射失败:', error)
      return {}
    }
  }

  /**
   * 保存收藏元数据列表
   */
  private async saveFavoritesMeta(metadata: FavoriteMeta[]): Promise<void> {
    await chrome.storage.local.set({
      [this.STORAGE_KEYS.FAVORITES_METADATA]: metadata,
    })
  }

  /**
   * 保存收藏内容映射
   */
  private async saveFavoritesContent(contentMap: FavoritesContentMap): Promise<void> {
    await chrome.storage.local.set({
      [this.STORAGE_KEYS.FAVORITES_CONTENT]: contentMap,
    })
  }

  /**
   * 添加收藏
   */
  async addFavorite(name: string, content: string): Promise<void> {
    try {
      const maxCount = await this.getMaxFavoritesCount()
      const metadata = await this.getRawFavoritesMeta()

      // 检查是否达到上限
      if (metadata.length >= maxCount) {
        throw new Error(
          `已达到收藏数量上限（${metadata.length}/${maxCount}），请删除旧收藏后再添加`
        )
      }

      const now = Date.now()
      const id = `fav_${now}_${Math.random().toString(36).slice(2, 9)}`

      // 创建新的元数据
      const newMeta: FavoriteMeta = {
        id,
        name,
        timestamp: now,
        lastUsedTime: now,
      }

      // 添加到元数据列表开头
      metadata.unshift(newMeta)

      // 获取内容映射并添加新内容
      const contentMap = await this.getRawFavoritesContent()
      contentMap[id] = content

      // 保存
      await this.saveFavoritesMeta(metadata)
      await this.saveFavoritesContent(contentMap)
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
      const metadata = await this.getRawFavoritesMeta()
      const meta = metadata.find((m) => m.id === id)

      if (!meta) {
        throw new Error('收藏不存在')
      }

      // 更新元数据
      meta.name = name
      meta.lastUsedTime = Date.now()

      // 更新内容
      const contentMap = await this.getRawFavoritesContent()
      contentMap[id] = content

      // 保存
      await this.saveFavoritesMeta(metadata)
      await this.saveFavoritesContent(contentMap)
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
      // 删除元数据
      const metadata = await this.getRawFavoritesMeta()
      const filteredMeta = metadata.filter((m) => m.id !== id)

      // 删除内容
      const contentMap = await this.getRawFavoritesContent()
      delete contentMap[id]

      // 保存
      await this.saveFavoritesMeta(filteredMeta)
      await this.saveFavoritesContent(contentMap)
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
      const metadata = await this.getRawFavoritesMeta()
      const meta = metadata.find((m) => m.id === id)

      if (meta) {
        meta.lastUsedTime = Date.now()
        await this.saveFavoritesMeta(metadata)
      }
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
      const metadata = await this.getRawFavoritesMeta()

      if (metadata.length <= maxCount) {
        return
      }

      // 按最后使用时间排序（降序）
      const sorted = [...metadata].sort(
        (a, b) => (b.lastUsedTime || b.timestamp) - (a.lastUsedTime || a.timestamp)
      )

      // 只保留最近使用的maxCount个
      const kept = sorted.slice(0, maxCount)
      const removed = sorted.slice(maxCount)

      // 从内容映射中删除被移除的收藏
      const contentMap = await this.getRawFavoritesContent()
      for (const meta of removed) {
        delete contentMap[meta.id]
      }

      // 保存
      await this.saveFavoritesMeta(kept)
      await this.saveFavoritesContent(contentMap)
    } catch (error) {
      console.error('清理收藏失败:', error)
    }
  }

  /**
   * 切换收藏的固定状态
   */
  async togglePinFavorite(id: string): Promise<void> {
    try {
      const metadata = await this.getRawFavoritesMeta()
      const meta = metadata.find((m) => m.id === id)

      if (!meta) {
        throw new Error('收藏不存在')
      }

      // 如果当前是未固定状态，需要检查是否超过最大固定数量
      if (!meta.isPinned) {
        const maxPinned = await this.getMaxPinnedFavorites()
        const pinnedCount = metadata.filter((m) => m.isPinned).length
        if (pinnedCount >= maxPinned) {
          throw new Error(`最多只能固定 ${maxPinned} 个收藏`)
        }
        meta.isPinned = true
        meta.pinnedTime = Date.now()
      } else {
        // 取消固定
        meta.isPinned = false
        meta.pinnedTime = undefined
      }

      await this.saveFavoritesMeta(metadata)
    } catch (error) {
      console.error('切换收藏固定状态失败:', error)
      throw error
    }
  }

  /**
   * 更新收藏的标签
   */
  async updateFavoriteTags(id: string, tags: FavoriteTag[]): Promise<void> {
    try {
      const metadata = await this.getRawFavoritesMeta()
      const meta = metadata.find((m) => m.id === id)

      if (meta) {
        meta.tags = tags
        await this.saveFavoritesMeta(metadata)
      } else {
        throw new Error('收藏不存在')
      }
    } catch (error) {
      console.error('更新收藏标签失败:', error)
      throw error
    }
  }

  /**
   * ==================== 预设配置管理 ====================
   */

  /**
   * 获取最大预设配置数量
   */
  async getMaxConfigPresetsCount(): Promise<number> {
    return this.getSimple<number>('maxConfigPresetsCount')
  }

  /**
   * 设置最大预设配置数量
   */
  async setMaxConfigPresetsCount(count: number): Promise<void> {
    return this.setSimple('maxConfigPresetsCount', count)
  }

  /**
   * 获取预设配置元数据列表（推荐使用，用于列表展示）
   */
  async getPresetsMeta(): Promise<ConfigPresetMeta[]> {
    try {
      return await presetManager.getPresetsMeta(() => this.getRawPresetsMeta())
    } catch (error) {
      console.error('获取预设配置元数据列表失败:', error)
      return []
    }
  }

  /**
   * 获取预设配置列表（向后兼容，包含完整配置内容）
   */
  async getConfigPresets(): Promise<ConfigPreset[]> {
    try {
      return await presetManager.getPresets(() => this.getRawConfigPresets())
    } catch (error) {
      console.error('获取预设配置列表失败:', error)
      return []
    }
  }

  /**
   * 获取指定预设的完整配置内容
   */
  async getPresetConfig(id: string): Promise<StorageData | null> {
    try {
      const contentMap = await this.getRawPresetsContent()
      return contentMap[id] || null
    } catch (error) {
      console.error(`获取预设配置内容失败 (id: ${id}):`, error)
      return null
    }
  }

  /**
   * 获取原始预设配置元数据列表（内部方法）
   */
  private async getRawPresetsMeta(): Promise<ConfigPresetMeta[]> {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEYS.CONFIG_PRESETS_METADATA)
      return (result[this.STORAGE_KEYS.CONFIG_PRESETS_METADATA] as ConfigPresetMeta[]) || []
    } catch (error) {
      console.error('读取预设配置元数据失败:', error)
      return []
    }
  }

  /**
   * 获取原始预设配置内容映射（内部方法）
   */
  private async getRawPresetsContent(): Promise<ConfigPresetsContentMap> {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEYS.CONFIG_PRESETS_CONTENT)
      return (result[this.STORAGE_KEYS.CONFIG_PRESETS_CONTENT] as ConfigPresetsContentMap) || {}
    } catch (error) {
      console.error('读取预设配置内容失败:', error)
      return {}
    }
  }

  /**
   * 获取原始预设配置列表（内部方法，向后兼容）
   */
  private async getRawConfigPresets(): Promise<ConfigPreset[]> {
    try {
      // 从分离的存储中合并数据
      const metadata = await this.getRawPresetsMeta()
      const contentMap = await this.getRawPresetsContent()

      return metadata.map((meta) => ({
        ...meta,
        config: contentMap[meta.id] || ({} as StorageData),
      }))
    } catch (error) {
      console.error('读取预设配置失败:', error)
      return []
    }
  }

  /**
   * 保存预设配置列表（内部方法，分离存储元数据和内容）
   */
  private async saveConfigPresets(presets: ConfigPreset[]): Promise<void> {
    try {
      // 分离元数据和内容
      const metadata: ConfigPresetMeta[] = []
      const contentMap: ConfigPresetsContentMap = {}

      for (const preset of presets) {
        metadata.push({
          id: preset.id,
          name: preset.name,
          timestamp: preset.timestamp,
        })
        contentMap[preset.id] = preset.config
      }

      // 分别保存元数据和内容
      await chrome.storage.local.set({
        [this.STORAGE_KEYS.CONFIG_PRESETS_METADATA]: metadata,
        [this.STORAGE_KEYS.CONFIG_PRESETS_CONTENT]: contentMap,
      })
    } catch (error) {
      console.error('保存预设配置失败:', error)
      throw error
    }
  }

  /**
   * 添加预设配置
   */
  async addConfigPreset(name: string, config: StorageData): Promise<void> {
    try {
      const maxCount = await this.getMaxConfigPresetsCount()

      await presetManager.addPreset(
        name,
        config,
        maxCount,
        () => this.getRawConfigPresets(),
        (presets) => this.saveConfigPresets(presets)
      )
    } catch (error) {
      console.error('添加预设配置失败:', error)
      throw error
    }
  }

  /**
   * 更新预设配置
   */
  async updateConfigPreset(id: string, name: string, config: StorageData): Promise<void> {
    try {
      await presetManager.updatePreset(
        id,
        name,
        config,
        () => this.getRawConfigPresets(),
        (presets) => this.saveConfigPresets(presets)
      )
    } catch (error) {
      console.error('更新预设配置失败:', error)
      throw error
    }
  }

  /**
   * 删除预设配置
   */
  async deleteConfigPreset(id: string): Promise<void> {
    try {
      await presetManager.deletePreset(
        id,
        () => this.getRawConfigPresets(),
        (presets) => this.saveConfigPresets(presets)
      )
    } catch (error) {
      console.error('删除预设配置失败:', error)
      throw error
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
   * 合并存储值和默认值，确保新增字段也能获取到默认值
   */
  async getHighlightAllConfig(): Promise<HighlightAllConfig> {
    try {
      const storedConfig = await this.getStorageValue(this.STORAGE_KEYS.HIGHLIGHT_ALL_CONFIG)
      return { ...this.DEFAULT_VALUES.highlightAllConfig, ...storedConfig }
    } catch (error) {
      console.error('获取高亮所有元素配置失败:', error)
      return this.DEFAULT_VALUES.highlightAllConfig
    }
  }

  /**
   * 设置高亮所有元素配置
   */
  async setHighlightAllConfig(config: HighlightAllConfig): Promise<void> {
    return this.setSimple('highlightAllConfig', config)
  }

  /**
   * 获取录制模式配置
   * 合并存储值和默认值，确保新增字段也能获取到默认值
   */
  async getRecordingModeConfig(): Promise<RecordingModeConfig> {
    try {
      const storedConfig = await this.getStorageValue(this.STORAGE_KEYS.RECORDING_MODE_CONFIG)
      return { ...this.DEFAULT_VALUES.recordingModeConfig, ...storedConfig }
    } catch (error) {
      console.error('获取录制模式配置失败:', error)
      return this.DEFAULT_VALUES.recordingModeConfig
    }
  }

  /**
   * 设置录制模式配置
   */
  async setRecordingModeConfig(config: RecordingModeConfig): Promise<void> {
    return this.setSimple('recordingModeConfig', config)
  }

  /**
   * 获取 iframe 配置
   * 合并存储值和默认值，确保新增字段也能获取到默认值
   */
  async getIframeConfig(): Promise<IframeConfig> {
    try {
      const storedConfig = await this.getStorageValue(this.STORAGE_KEYS.IFRAME_CONFIG)
      return { ...this.DEFAULT_VALUES.iframeConfig, ...storedConfig }
    } catch (error) {
      console.error('获取 iframe 配置失败:', error)
      return this.DEFAULT_VALUES.iframeConfig
    }
  }

  /**
   * 设置 iframe 配置
   */
  async setIframeConfig(config: IframeConfig): Promise<void> {
    return this.setSimple('iframeConfig', config)
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
   * 合并存储值和默认值，确保新增字段也能获取到默认值
   */
  async getExportConfig(): Promise<ExportConfig> {
    try {
      const storedConfig = await this.getStorageValue(this.STORAGE_KEYS.EXPORT_CONFIG)
      return { ...this.DEFAULT_VALUES.exportConfig, ...storedConfig }
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
        [this.STORAGE_KEYS.EXPORT_CONFIG]: newConfig,
      })
    } catch (error) {
      console.error('设置导出配置失败:', error)
      throw error
    }
  }

  /**
   * 获取编辑器主题
   */
  async getEditorTheme(): Promise<EditorTheme> {
    return this.getSimple<EditorTheme>('editorTheme')
  }

  /**
   * 设置编辑器主题
   */
  async setEditorTheme(theme: EditorTheme): Promise<void> {
    return this.setSimple('editorTheme', theme)
  }

  /**
   * 获取 API 配置
   * 合并存储值和默认值，确保新增字段也能获取到默认值
   */
  async getApiConfig(): Promise<ApiConfig> {
    try {
      const storedConfig = await this.getStorageValue(this.STORAGE_KEYS.API_CONFIG)
      if (!storedConfig) {
        return this.DEFAULT_VALUES.apiConfig
      }
      return {
        ...this.DEFAULT_VALUES.apiConfig,
        ...storedConfig,
        sourceConfig: {
          ...this.DEFAULT_VALUES.apiConfig.sourceConfig,
          ...storedConfig.sourceConfig,
        },
        messageTypes: {
          ...this.DEFAULT_VALUES.apiConfig.messageTypes,
          ...storedConfig.messageTypes,
        },
      }
    } catch (error) {
      console.error('获取API配置失败:', error)
      return this.DEFAULT_VALUES.apiConfig
    }
  }

  /**
   * 设置 API 配置
   */
  async setApiConfig(config: ApiConfig): Promise<void> {
    return this.setSimple('apiConfig', config)
  }

  /**
   * 获取抽屉快捷键配置
   */
  async getDrawerShortcuts(): Promise<DrawerShortcutsConfig> {
    try {
      const storedConfig = await this.getStorageValue(this.STORAGE_KEYS.DRAWER_SHORTCUTS)
      if (!storedConfig) {
        return this.DEFAULT_VALUES.drawerShortcuts
      }
      // 深度合并每个快捷键配置，确保旧格式数据不会破坏结构
      const defaults = this.DEFAULT_VALUES.drawerShortcuts
      return {
        save: this.mergeShortcutKey(defaults.save, storedConfig.save),
        format: this.mergeShortcutKey(defaults.format, storedConfig.format),
        openOrUpdatePreview: this.mergeShortcutKey(
          defaults.openOrUpdatePreview,
          storedConfig.openOrUpdatePreview || storedConfig.togglePreview
        ),
        closePreview: this.mergeShortcutKey(defaults.closePreview, storedConfig.closePreview),
      }
    } catch (error) {
      console.error('获取抽屉快捷键配置失败:', error)
      return this.DEFAULT_VALUES.drawerShortcuts
    }
  }

  /**
   * 合并快捷键配置，处理旧格式兼容
   */
  private mergeShortcutKey(
    defaultKey: { key: string; ctrlOrCmd: boolean; shift: boolean; alt: boolean },
    storedKey: unknown
  ): { key: string; ctrlOrCmd: boolean; shift: boolean; alt: boolean } {
    // 如果存储的值不存在或不是对象，返回默认值
    if (!storedKey || typeof storedKey !== 'object') {
      return defaultKey
    }
    const stored = storedKey as Record<string, unknown>
    return {
      key: typeof stored.key === 'string' ? stored.key : defaultKey.key,
      ctrlOrCmd: typeof stored.ctrlOrCmd === 'boolean' ? stored.ctrlOrCmd : defaultKey.ctrlOrCmd,
      shift: typeof stored.shift === 'boolean' ? stored.shift : defaultKey.shift,
      alt: typeof stored.alt === 'boolean' ? stored.alt : defaultKey.alt,
    }
  }

  /**
   * 设置抽屉快捷键配置
   */
  async setDrawerShortcuts(config: DrawerShortcutsConfig): Promise<void> {
    return this.setSimple('drawerShortcuts', config)
  }

  /**
   * 获取右键菜单配置
   */
  async getContextMenuConfig(): Promise<EditorContextMenuConfig> {
    try {
      const storedConfig = await this.getStorageValue(this.STORAGE_KEYS.CONTEXT_MENU_CONFIG)
      if (!storedConfig) {
        return this.DEFAULT_VALUES.contextMenuConfig
      }
      return {
        ...this.DEFAULT_VALUES.contextMenuConfig,
        ...storedConfig,
      }
    } catch (error) {
      console.error('获取右键菜单配置失败:', error)
      return this.DEFAULT_VALUES.contextMenuConfig
    }
  }

  /**
   * 设置右键菜单配置
   */
  async setContextMenuConfig(config: EditorContextMenuConfig): Promise<void> {
    try {
      await chrome.storage.local.set({
        [this.STORAGE_KEYS.CONTEXT_MENU_CONFIG]: config,
      })
    } catch (error) {
      console.error('设置右键菜单配置失败:', error)
    }
  }

  /**
   * 获取主题色
   */
  async getThemeColor(): Promise<string> {
    return this.getSimple<string>('themeColor')
  }

  /**
   * 设置主题色
   */
  async setThemeColor(color: string): Promise<void> {
    return this.setSimple('themeColor', color)
  }

  /**
   * 批量保存所有配置（用于应用预设配置）
   */
  async setAllConfig(config: StorageData): Promise<void> {
    try {
      // 批量设置所有配置项
      await Promise.all([
        this.setActiveState(config.isActive),
        this.setDrawerWidth(config.drawerWidth),
        this.setAttributeName(config.attributeName),
        this.setSearchConfig(config.searchConfig),
        this.setAutoParseString(config.autoParseString),
        this.setToolbarButtons(config.toolbarButtons),
        this.setHighlightColor(config.highlightColor),
        this.setMaxFavoritesCount(config.maxFavoritesCount),
        this.setMaxPinnedFavorites(config.maxPinnedFavorites),
        this.setDraftRetentionDays(config.draftRetentionDays),
        this.setAutoSaveDraft(config.autoSaveDraft),
        this.setDraftAutoSaveDebounce(config.draftAutoSaveDebounce),
        this.setPreviewConfig(config.previewConfig),
        this.setMaxHistoryCount(config.maxHistoryCount),
        this.setHighlightAllConfig(config.highlightAllConfig),
        this.setRecordingModeConfig(config.recordingModeConfig),
        this.setIframeConfig(config.iframeConfig),
        this.setEnableAstTypeHints(config.enableAstTypeHints),
        this.setExportConfig(config.exportConfig),
        this.setEditorTheme(config.editorTheme),
        this.setApiConfig(config.apiConfig),
        this.setDrawerShortcuts(config.drawerShortcuts),
        this.setThemeColor(config.themeColor),
        this.setContextMenuConfig(config.contextMenuConfig),
        this.setMaxConfigPresetsCount(config.maxConfigPresetsCount),
      ])
    } catch (error) {
      console.error('批量保存配置失败:', error)
      throw error
    }
  }
}

export const storage = new StorageManager()
