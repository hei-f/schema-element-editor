import { describe, it, expect, beforeEach } from 'vitest'
import { presetManager } from '../preset-manager'
import type { ConfigPreset, StorageData } from '@/shared/types'
import { DEFAULT_VALUES } from '@/shared/constants/defaults'

describe('PresetManager', () => {
  let mockPresets: ConfigPreset[]
  let mockConfig: StorageData

  beforeEach(() => {
    mockConfig = { ...DEFAULT_VALUES }
    mockPresets = []
  })

  describe('getPresets', () => {
    it('应该返回预设配置列表', async () => {
      const preset: ConfigPreset = {
        id: 'test-1',
        name: 'Test Preset',
        config: mockConfig,
        timestamp: Date.now(),
        lastUsedTime: Date.now(),
      }
      mockPresets.push(preset)

      const result = await presetManager.getPresets(async () => mockPresets)

      expect(result).toEqual([preset])
    })

    it('应该处理空列表', async () => {
      const result = await presetManager.getPresets(async () => [])

      expect(result).toEqual([])
    })

    it('当前实现：按LRU排序（待优化：应改为按创建时间排序）', async () => {
      // 注意：预设配置列表不应该频繁变动顺序，应该按创建时间固定排序
      const baseTime = Date.now()
      mockPresets.push(
        {
          id: '1',
          name: 'Old',
          config: mockConfig,
          timestamp: baseTime,
          lastUsedTime: baseTime,
        },
        {
          id: '2',
          name: 'New',
          config: mockConfig,
          timestamp: baseTime,
          lastUsedTime: baseTime + 1000,
        }
      )

      const result = await presetManager.getPresets(async () => mockPresets)

      // 当前会按lastUsedTime降序排列
      expect(result[0].id).toBe('2')
      expect(result[1].id).toBe('1')
    })
  })

  describe('addPreset', () => {
    it('应该添加新预设配置', async () => {
      const saveFn = async (presets: ConfigPreset[]) => {
        mockPresets = presets
      }

      await presetManager.addPreset('New Preset', mockConfig, 5, async () => mockPresets, saveFn)

      expect(mockPresets).toHaveLength(1)
      expect(mockPresets[0].name).toBe('New Preset')
      expect(mockPresets[0].config).toEqual(mockConfig)
    })

    it('当前实现：达到上限时会自动删除最少使用的预设（待优化）', async () => {
      // 注意：这个行为在未来版本应该改为提示用户，而不是自动删除
      // 预设配置是用户主动保存的，不应该自动删除

      // 添加5个预设（达到上限）
      const baseTime = Date.now()
      for (let i = 0; i < 5; i++) {
        mockPresets.push({
          id: `preset-${i}`,
          name: `Preset ${i}`,
          config: mockConfig,
          timestamp: baseTime,
          lastUsedTime: baseTime + i * 1000, // preset-4是最近使用的
        })
      }

      const saveFn = async (presets: ConfigPreset[]) => {
        mockPresets = presets
      }

      await presetManager.addPreset('New Preset', mockConfig, 5, async () => mockPresets, saveFn)

      expect(mockPresets).toHaveLength(5)
      // 当前会删除最少使用的（lastUsedTime最小的preset-0）
      expect(mockPresets.find((p) => p.id === 'preset-0')).toBeUndefined()
      expect(mockPresets.find((p) => p.name === 'New Preset')).toBeDefined()
    })
  })

  describe('updatePreset', () => {
    beforeEach(() => {
      mockPresets.push({
        id: 'test-1',
        name: 'Test Preset',
        config: mockConfig,
        timestamp: Date.now(),
        lastUsedTime: Date.now(),
      })
    })

    it('应该更新预设配置', async () => {
      const newConfig = { ...mockConfig, drawerWidth: '1000px' }
      const saveFn = async (presets: ConfigPreset[]) => {
        mockPresets = presets
      }

      await presetManager.updatePreset(
        'test-1',
        'Updated Name',
        newConfig,
        async () => mockPresets,
        saveFn
      )

      expect(mockPresets[0].name).toBe('Updated Name')
      expect(mockPresets[0].config.drawerWidth).toBe('1000px')
    })

    it('应该抛出错误如果预设不存在', async () => {
      await expect(
        presetManager.updatePreset(
          'non-existent',
          'New Name',
          mockConfig,
          async () => mockPresets,
          async () => {}
        )
      ).rejects.toThrow('预设配置不存在')
    })
  })

  describe('deletePreset', () => {
    beforeEach(() => {
      mockPresets.push({
        id: 'test-1',
        name: 'Test Preset',
        config: mockConfig,
        timestamp: Date.now(),
        lastUsedTime: Date.now(),
      })
    })

    it('应该删除预设配置', async () => {
      const saveFn = async (presets: ConfigPreset[]) => {
        mockPresets = presets
      }

      await presetManager.deletePreset('test-1', async () => mockPresets, saveFn)

      expect(mockPresets).toHaveLength(0)
    })

    it('应该静默处理不存在的预设', async () => {
      const initialLength = mockPresets.length

      await presetManager.deletePreset(
        'non-existent',
        async () => mockPresets,
        async (p) => {
          mockPresets = p
        }
      )

      expect(mockPresets).toHaveLength(initialLength)
    })
  })

  describe('updatePresetUsedTime', () => {
    beforeEach(() => {
      mockPresets.push({
        id: 'test-1',
        name: 'Test Preset',
        config: mockConfig,
        timestamp: Date.now(),
        lastUsedTime: Date.now() - 10000,
      })
    })

    it('应该更新最后使用时间', async () => {
      const oldTime = mockPresets[0].lastUsedTime
      const saveFn = async (presets: ConfigPreset[]) => {
        mockPresets = presets
      }

      await presetManager.updatePresetUsedTime('test-1', async () => mockPresets, saveFn)

      expect(mockPresets[0].lastUsedTime).toBeGreaterThan(oldTime)
    })

    it('应该静默处理不存在的预设', async () => {
      const oldTime = mockPresets[0].lastUsedTime

      await presetManager.updatePresetUsedTime(
        'non-existent',
        async () => mockPresets,
        async () => {}
      )

      expect(mockPresets[0].lastUsedTime).toBe(oldTime)
    })
  })

  describe('cleanOldPresets', () => {
    it('应该清理超过上限的预设配置', async () => {
      const baseTime = Date.now()
      // 添加7个预设，上限为5
      for (let i = 0; i < 7; i++) {
        mockPresets.push({
          id: `preset-${i}`,
          name: `Preset ${i}`,
          config: mockConfig,
          timestamp: baseTime,
          lastUsedTime: baseTime + i * 1000, // preset-6是最近使用的
        })
      }

      const saveFn = async (presets: ConfigPreset[]) => {
        mockPresets = presets
      }

      const cleaned = await presetManager.cleanOldPresets(5, async () => mockPresets, saveFn)

      expect(cleaned).toBe(2)
      expect(mockPresets).toHaveLength(5)
      // 应该删除最少使用的两个（preset-0和preset-1）
      expect(mockPresets.find((p) => p.id === 'preset-0')).toBeUndefined()
      expect(mockPresets.find((p) => p.id === 'preset-1')).toBeUndefined()
      // 最近使用的应该保留
      expect(mockPresets.find((p) => p.id === 'preset-6')).toBeDefined()
    })

    it('应该返回0如果未超过上限', async () => {
      mockPresets.push({
        id: 'test-1',
        name: 'Test',
        config: mockConfig,
        timestamp: Date.now(),
        lastUsedTime: Date.now(),
      })

      const cleaned = await presetManager.cleanOldPresets(
        5,
        async () => mockPresets,
        async () => {}
      )

      expect(cleaned).toBe(0)
      expect(mockPresets).toHaveLength(1)
    })
  })
})
