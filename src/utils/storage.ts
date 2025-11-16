import type { SearchConfig, StorageData } from '@/types'

/**
 * 存储管理器类
 * 封装Chrome Storage API，提供类型安全的存储操作
 */
class StorageManager {
  private readonly STORAGE_KEYS = {
    IS_ACTIVE: 'isActive',
    DRAWER_WIDTH: 'drawerWidth',
    ATTRIBUTE_NAME: 'attributeName',
    SEARCH_CONFIG: 'searchConfig'
  }

  private readonly DEFAULT_VALUES: StorageData = {
    isActive: false,
    drawerWidth: 800,
    attributeName: 'schema-params',
  searchConfig: {
    searchDepthDown: 5,
    searchDepthUp: 0,
    throttleInterval: 16
  }
  }

  /**
   * 获取激活状态
   */
  async getActiveState(): Promise<boolean> {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEYS.IS_ACTIVE)
      return result[this.STORAGE_KEYS.IS_ACTIVE] ?? this.DEFAULT_VALUES.isActive
    } catch (error) {
      console.error('获取激活状态失败:', error)
      return this.DEFAULT_VALUES.isActive
    }
  }

  /**
   * 设置激活状态
   */
  async setActiveState(isActive: boolean): Promise<void> {
    try {
      await chrome.storage.local.set({
        [this.STORAGE_KEYS.IS_ACTIVE]: isActive
      })
    } catch (error) {
      console.error('设置激活状态失败:', error)
    }
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
  async getDrawerWidth(): Promise<number> {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEYS.DRAWER_WIDTH)
      return result[this.STORAGE_KEYS.DRAWER_WIDTH] ?? this.DEFAULT_VALUES.drawerWidth
    } catch (error) {
      console.error('获取抽屉宽度失败:', error)
      return this.DEFAULT_VALUES.drawerWidth
    }
  }

  /**
   * 设置抽屉宽度
   */
  async setDrawerWidth(width: number): Promise<void> {
    try {
      await chrome.storage.local.set({
        [this.STORAGE_KEYS.DRAWER_WIDTH]: width
      })
    } catch (error) {
      console.error('设置抽屉宽度失败:', error)
    }
  }

  /**
   * 获取属性名配置
   */
  async getAttributeName(): Promise<string> {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEYS.ATTRIBUTE_NAME)
      return result[this.STORAGE_KEYS.ATTRIBUTE_NAME] ?? this.DEFAULT_VALUES.attributeName
    } catch (error) {
      console.error('获取属性名配置失败:', error)
      return this.DEFAULT_VALUES.attributeName
    }
  }

  /**
   * 设置属性名配置
   */
  async setAttributeName(name: string): Promise<void> {
    try {
      await chrome.storage.local.set({
        [this.STORAGE_KEYS.ATTRIBUTE_NAME]: name
      })
    } catch (error) {
      console.error('设置属性名配置失败:', error)
    }
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
   * 获取所有存储数据
   */
  async getAllData(): Promise<StorageData> {
    const [isActive, drawerWidth, attributeName, searchConfig] = await Promise.all([
      this.getActiveState(),
      this.getDrawerWidth(),
      this.getAttributeName(),
      this.getSearchConfig()
    ])
    return { isActive, drawerWidth, attributeName, searchConfig }
  }
}

export const storage = new StorageManager()

