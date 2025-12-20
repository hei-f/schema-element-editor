import type { ConfigPreset } from '@/shared/types'

/**
 * 预设配置管理服务
 * 封装预设配置相关的业务逻辑，包括LRU算法
 */
export class PresetManager {
  /**
   * 获取预设配置列表（按LRU排序）
   */
  async getPresets(storageGetter: () => Promise<ConfigPreset[]>): Promise<ConfigPreset[]> {
    const presets = await storageGetter()
    return this.sortPresets(presets)
  }

  /**
   * 对预设配置列表排序：按LRU排序
   */
  private sortPresets(presets: ConfigPreset[]): ConfigPreset[] {
    return [...presets].sort((a, b) => {
      return (b.lastUsedTime || b.timestamp) - (a.lastUsedTime || a.timestamp)
    })
  }

  /**
   * 添加预设配置
   * @param maxCount 最大预设配置数量
   */
  async addPreset(
    name: string,
    config: any,
    maxCount: number,
    getPresets: () => Promise<ConfigPreset[]>,
    savePresets: (presets: ConfigPreset[]) => Promise<void>
  ): Promise<void> {
    const presets = await getPresets()

    const now = Date.now()
    const newPreset: ConfigPreset = {
      id: `preset_${now}_${Math.random().toString(36).slice(2, 9)}`,
      name,
      config,
      timestamp: now,
      lastUsedTime: now,
    }

    // 添加到列表开头
    presets.unshift(newPreset)

    // 应用LRU清理策略
    const cleanedPresets = this.applyLRUCleanup(presets, maxCount)

    await savePresets(cleanedPresets)
  }

  /**
   * 更新预设配置
   */
  async updatePreset(
    id: string,
    name: string,
    config: any,
    getPresets: () => Promise<ConfigPreset[]>,
    savePresets: (presets: ConfigPreset[]) => Promise<void>
  ): Promise<void> {
    const presets = await getPresets()
    const preset = presets.find((p) => p.id === id)

    if (preset) {
      preset.name = name
      preset.config = config
      preset.lastUsedTime = Date.now()
      await savePresets(presets)
    } else {
      throw new Error('预设配置不存在')
    }
  }

  /**
   * 删除预设配置
   */
  async deletePreset(
    id: string,
    getPresets: () => Promise<ConfigPreset[]>,
    savePresets: (presets: ConfigPreset[]) => Promise<void>
  ): Promise<void> {
    const presets = await getPresets()
    const filtered = presets.filter((p) => p.id !== id)
    await savePresets(filtered)
  }

  /**
   * 更新预设配置的最后使用时间
   */
  async updatePresetUsedTime(
    id: string,
    getPresets: () => Promise<ConfigPreset[]>,
    savePresets: (presets: ConfigPreset[]) => Promise<void>
  ): Promise<void> {
    const presets = await getPresets()
    const preset = presets.find((p) => p.id === id)

    if (preset) {
      preset.lastUsedTime = Date.now()
      await savePresets(presets)
    }
  }

  /**
   * 应用LRU清理策略
   * 如果预设配置数量超过最大值，删除最少使用的预设配置
   */
  private applyLRUCleanup(presets: ConfigPreset[], maxCount: number): ConfigPreset[] {
    if (presets.length <= maxCount) {
      return presets
    }

    // 按最后使用时间排序（降序）
    const sorted = [...presets].sort(
      (a, b) => (b.lastUsedTime || b.timestamp) - (a.lastUsedTime || a.timestamp)
    )

    // 只保留最近使用的maxCount个
    return sorted.slice(0, maxCount)
  }

  /**
   * 手动清理超过最大数量的预设配置
   */
  async cleanOldPresets(
    maxCount: number,
    getPresets: () => Promise<ConfigPreset[]>,
    savePresets: (presets: ConfigPreset[]) => Promise<void>
  ): Promise<number> {
    const presets = await getPresets()

    if (presets.length <= maxCount) {
      return 0
    }

    const cleanedPresets = this.applyLRUCleanup(presets, maxCount)
    await savePresets(cleanedPresets)

    return presets.length - cleanedPresets.length
  }
}

/**
 * 导出单例实例
 */
export const presetManager = new PresetManager()
