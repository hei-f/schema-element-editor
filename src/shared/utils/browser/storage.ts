import { DEFAULT_VALUES, STORAGE_KEYS } from '@/shared/constants/defaults'
import { draftManager } from '@/shared/managers/draft-manager'
import { favoritesManager } from '@/shared/managers/favorites-manager'
import type {
  ApiConfig,
  Draft,
  DrawerShortcutsConfig,
  EditorTheme,
  ExportConfig,
  Favorite,
  HighlightAllConfig,
  IframeConfig,
  PreviewConfig,
  RecordingModeConfig,
  SearchConfig,
  StorageData,
  ToolbarButtonsConfig,
} from '@/shared/types'
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
      const result = await chrome.storage.local.get(this.STORAGE_KEYS.SEARCH_CONFIG)
      const storedConfig = result[this.STORAGE_KEYS.SEARCH_CONFIG]
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
   * 设置函数名（核心 API + 扩展 API）
   */
  async setFunctionNames(
    getFunctionName: string,
    updateFunctionName: string,
    previewFunctionName: string
  ): Promise<void> {
    try {
      await chrome.storage.local.set({
        [this.STORAGE_KEYS.GET_FUNCTION_NAME]: getFunctionName,
        [this.STORAGE_KEYS.UPDATE_FUNCTION_NAME]: updateFunctionName,
        [this.STORAGE_KEYS.PREVIEW_FUNCTION_NAME]: previewFunctionName,
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
   * 合并存储值和默认值，确保新增字段也能获取到默认值
   */
  async getToolbarButtons(): Promise<ToolbarButtonsConfig> {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEYS.TOOLBAR_BUTTONS)
      const storedConfig = result[this.STORAGE_KEYS.TOOLBAR_BUTTONS]
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
      getFunctionName,
      updateFunctionName,
      autoParseString,
      enableDebugLog,
      toolbarButtons,
      highlightColor,
      maxFavoritesCount,
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
      previewFunctionName,
      apiConfig,
      drawerShortcuts,
    ] = await Promise.all([
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
      this.getRecordingModeConfig(),
      this.getIframeConfig(),
      this.getEnableAstTypeHints(),
      this.getEditorTheme(),
      this.getPreviewFunctionName(),
      this.getApiConfig(),
      this.getDrawerShortcuts(),
    ])
    const exportConfig = await this.getExportConfig()
    return {
      isActive,
      drawerWidth,
      attributeName,
      searchConfig,
      getFunctionName,
      updateFunctionName,
      autoParseString,
      enableDebugLog,
      toolbarButtons,
      highlightColor,
      maxFavoritesCount,
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
      previewFunctionName,
      apiConfig,
      drawerShortcuts,
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
      const result = await chrome.storage.local.get(this.STORAGE_KEYS.PREVIEW_CONFIG)
      const storedConfig = result[this.STORAGE_KEYS.PREVIEW_CONFIG]
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
      [this.STORAGE_KEYS.FAVORITES]: favorites,
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
   * 合并存储值和默认值，确保新增字段也能获取到默认值
   */
  async getHighlightAllConfig(): Promise<HighlightAllConfig> {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEYS.HIGHLIGHT_ALL_CONFIG)
      const storedConfig = result[this.STORAGE_KEYS.HIGHLIGHT_ALL_CONFIG]
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
      const result = await chrome.storage.local.get(this.STORAGE_KEYS.RECORDING_MODE_CONFIG)
      const storedConfig = result[this.STORAGE_KEYS.RECORDING_MODE_CONFIG]
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
      const result = await chrome.storage.local.get(this.STORAGE_KEYS.IFRAME_CONFIG)
      const storedConfig = result[this.STORAGE_KEYS.IFRAME_CONFIG]
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
      const result = await chrome.storage.local.get(this.STORAGE_KEYS.EXPORT_CONFIG)
      const storedConfig = result[this.STORAGE_KEYS.EXPORT_CONFIG]
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
   * 获取预览函数名
   */
  async getPreviewFunctionName(): Promise<string> {
    return this.getSimple<string>('previewFunctionName')
  }

  /**
   * 设置预览函数名
   */
  async setPreviewFunctionName(name: string): Promise<void> {
    return this.setSimple('previewFunctionName', name)
  }

  /**
   * 获取 API 配置
   * 合并存储值和默认值，确保新增字段也能获取到默认值
   */
  async getApiConfig(): Promise<ApiConfig> {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEYS.API_CONFIG)
      const storedConfig = result[this.STORAGE_KEYS.API_CONFIG]
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
      const result = await chrome.storage.local.get(this.STORAGE_KEYS.DRAWER_SHORTCUTS)
      const storedConfig = result[this.STORAGE_KEYS.DRAWER_SHORTCUTS]
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
}

export const storage = new StorageManager()
