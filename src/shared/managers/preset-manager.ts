import type { ConfigPreset, StorageData } from '@/shared/types'

/** 预设配置管理服务（类不对外导出，只导出实例）*/
class PresetManager {
  /**
   * 获取预设配置列表（按创建时间排序，最新的在前）
   */
  async getPresets(storageGetter: () => Promise<ConfigPreset[]>): Promise<ConfigPreset[]> {
    const presets = await storageGetter()
    return this.sortPresets(presets)
  }

  /**
   * 对预设配置列表排序：按创建时间降序排序（最新的在前）
   */
  private sortPresets(presets: ConfigPreset[]): ConfigPreset[] {
    return [...presets].sort((a, b) => {
      return b.timestamp - a.timestamp
    })
  }

  /**
   * 添加预设配置
   * @param maxCount 最大预设配置数量
   * @throws 如果达到上限则抛出错误
   */
  async addPreset(
    name: string,
    config: StorageData,
    maxCount: number,
    getPresets: () => Promise<ConfigPreset[]>,
    savePresets: (presets: ConfigPreset[]) => Promise<void>
  ): Promise<void> {
    const presets = await getPresets()

    // 检查是否达到上限
    if (presets.length >= maxCount) {
      throw new Error(
        `已达到预设配置数量上限（${presets.length}/${maxCount}），请删除旧预设后再添加`
      )
    }

    const now = Date.now()
    const newPreset: ConfigPreset = {
      id: `preset_${now}_${Math.random().toString(36).slice(2, 9)}`,
      name,
      config,
      timestamp: now,
    }

    // 添加到列表开头
    presets.unshift(newPreset)

    await savePresets(presets)
  }

  /**
   * 更新预设配置
   */
  async updatePreset(
    id: string,
    name: string,
    config: StorageData,
    getPresets: () => Promise<ConfigPreset[]>,
    savePresets: (presets: ConfigPreset[]) => Promise<void>
  ): Promise<void> {
    const presets = await getPresets()
    const preset = presets.find((p) => p.id === id)

    if (preset) {
      preset.name = name
      preset.config = config
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
}

/**
 * 导出单例实例
 */
export const presetManager = new PresetManager()
