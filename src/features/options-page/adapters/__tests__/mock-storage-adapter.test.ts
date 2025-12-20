import { describe, it, expect, beforeEach } from 'vitest'
import { createMockStorageAdapter } from '../mock-storage-adapter'
import { DEFAULT_VALUES } from '@/shared/constants/defaults'
import { SECTION_KEYS } from '../../config/field-config'
import type { SettingsStorage } from '../../types'

describe('createMockStorageAdapter 测试', () => {
  let adapter: SettingsStorage

  beforeEach(() => {
    adapter = createMockStorageAdapter()
  })

  describe('loadAllSettings', () => {
    it('应该返回完整的设置数据', async () => {
      const result = await adapter.loadAllSettings()

      expect(result).toBeDefined()
      expect(result.formValues).toBeDefined()
    })

    it('应该返回所有默认值', async () => {
      const result = await adapter.loadAllSettings()

      expect(result.formValues.attributeName).toBe(DEFAULT_VALUES.attributeName)
      expect(result.formValues.drawerWidth).toBe(DEFAULT_VALUES.drawerWidth)
      expect(result.formValues.searchConfig).toEqual(DEFAULT_VALUES.searchConfig)
      expect(result.formValues.autoParseString).toBe(DEFAULT_VALUES.autoParseString)
      expect(result.formValues.enableDebugLog).toBe(DEFAULT_VALUES.enableDebugLog)
      expect(result.formValues.toolbarButtons).toEqual(DEFAULT_VALUES.toolbarButtons)
      expect(result.formValues.highlightColor).toBe(DEFAULT_VALUES.highlightColor)
      expect(result.formValues.maxFavoritesCount).toBe(DEFAULT_VALUES.maxFavoritesCount)
      expect(result.formValues.autoSaveDraft).toBe(DEFAULT_VALUES.autoSaveDraft)
      expect(result.formValues.previewConfig).toEqual(DEFAULT_VALUES.previewConfig)
      expect(result.formValues.maxHistoryCount).toBe(DEFAULT_VALUES.maxHistoryCount)
      expect(result.formValues.highlightAllConfig).toEqual(DEFAULT_VALUES.highlightAllConfig)
      expect(result.formValues.recordingModeConfig).toEqual(DEFAULT_VALUES.recordingModeConfig)
      expect(result.formValues.iframeConfig).toEqual(DEFAULT_VALUES.iframeConfig)
      expect(result.formValues.enableAstTypeHints).toBe(DEFAULT_VALUES.enableAstTypeHints)
      expect(result.formValues.exportConfig).toEqual(DEFAULT_VALUES.exportConfig)
      expect(result.formValues.editorTheme).toBe(DEFAULT_VALUES.editorTheme)
      expect(result.formValues.apiConfig).toEqual(DEFAULT_VALUES.apiConfig)
      expect(result.formValues.drawerShortcuts).toEqual(DEFAULT_VALUES.drawerShortcuts)
      expect(result.formValues.themeColor).toBe(DEFAULT_VALUES.themeColor)
    })

    it('应该每次返回相同的默认值', async () => {
      const result1 = await adapter.loadAllSettings()
      const result2 = await adapter.loadAllSettings()

      expect(result1).toEqual(result2)
    })

    it('应该返回深拷贝的对象而不是引用', async () => {
      const result1 = await adapter.loadAllSettings()
      const result2 = await adapter.loadAllSettings()

      // 修改一个不应该影响另一个
      result1.formValues.attributeName = 'modified'

      expect(result2.formValues.attributeName).toBe(DEFAULT_VALUES.attributeName)
    })
  })

  describe('saveField', () => {
    it('应该不抛出错误', async () => {
      await expect(adapter.saveField(['test'], { test: 'value' })).resolves.toBeUndefined()
    })

    it('应该接受任意字段名和值', async () => {
      await adapter.saveField(['attributeName'], { attributeName: 'test-attr' })
      await adapter.saveField(['drawerWidth'], { drawerWidth: 400 })
      await adapter.saveField(['enableDebugLog'], { enableDebugLog: true })
      await adapter.saveField(['searchConfig'], { searchConfig: { maxDepth: 10 } })
    })

    it('应该能连续多次调用', async () => {
      await adapter.saveField(['field1'], { field1: 'value1' })
      await adapter.saveField(['field2'], { field2: 'value2' })
      await adapter.saveField(['field3'], { field3: 'value3' })
      await adapter.saveField(['field4'], { field4: 'value4' })
      await adapter.saveField(['field5'], { field5: 'value5' })
    })

    it('应该接受undefined值', async () => {
      await expect(adapter.saveField(['field'], { field: undefined })).resolves.toBeUndefined()
    })

    it('应该接受null值', async () => {
      await expect(adapter.saveField(['field'], { field: null })).resolves.toBeUndefined()
    })

    it('应该接受空字符串', async () => {
      await expect(adapter.saveField(['field'], { field: '' })).resolves.toBeUndefined()
    })

    it('应该接受数组值', async () => {
      await expect(adapter.saveField(['field'], { field: [1, 2, 3] })).resolves.toBeUndefined()
    })

    it('应该接受对象值', async () => {
      await expect(
        adapter.saveField(['field'], { field: { key: 'value' } })
      ).resolves.toBeUndefined()
    })
  })

  describe('resetSectionToDefault', () => {
    it('应该返回elementDetection section的默认值', async () => {
      const result = await adapter.resetSectionToDefault(SECTION_KEYS.ELEMENT_DETECTION)

      expect(result).toBeDefined()
      expect(result.searchConfig).toEqual(DEFAULT_VALUES.searchConfig)
      expect(result.highlightColor).toBe(DEFAULT_VALUES.highlightColor)
      expect(result.highlightAllConfig).toEqual(DEFAULT_VALUES.highlightAllConfig)
      expect(result.iframeConfig).toEqual(DEFAULT_VALUES.iframeConfig)
    })

    it('应该返回editorConfig section的默认值', async () => {
      const result = await adapter.resetSectionToDefault(SECTION_KEYS.EDITOR_CONFIG)

      expect(result).toBeDefined()
      expect(result.drawerWidth).toBe(DEFAULT_VALUES.drawerWidth)
      expect(result.enableAstTypeHints).toBe(DEFAULT_VALUES.enableAstTypeHints)
      expect(result.editorTheme).toBe(DEFAULT_VALUES.editorTheme)
      expect(result.themeColor).toBe(DEFAULT_VALUES.themeColor)
    })

    it('应该返回featureToggle section的默认值', async () => {
      const result = await adapter.resetSectionToDefault(SECTION_KEYS.FEATURE_TOGGLE)

      expect(result).toBeDefined()
      expect(result.toolbarButtons).toEqual(DEFAULT_VALUES.toolbarButtons)
    })

    it('应该返回dataManagement section的默认值', async () => {
      const result = await adapter.resetSectionToDefault(SECTION_KEYS.DATA_MANAGEMENT)

      expect(result).toBeDefined()
      expect(result.maxFavoritesCount).toBe(DEFAULT_VALUES.maxFavoritesCount)
      expect(result.autoSaveDraft).toBe(DEFAULT_VALUES.autoSaveDraft)
      expect(result.maxHistoryCount).toBe(DEFAULT_VALUES.maxHistoryCount)
      expect(result.exportConfig).toEqual(DEFAULT_VALUES.exportConfig)
    })

    it('应该返回integrationConfig section的默认值', async () => {
      const result = await adapter.resetSectionToDefault(SECTION_KEYS.INTEGRATION_CONFIG)

      expect(result).toBeDefined()
      expect(result.apiConfig).toEqual(DEFAULT_VALUES.apiConfig)
      expect(result.attributeName).toBe(DEFAULT_VALUES.attributeName)
    })

    it('应该返回previewConfig section的默认值', async () => {
      const result = await adapter.resetSectionToDefault(SECTION_KEYS.PREVIEW_CONFIG)

      expect(result).toBeDefined()
      expect(result.previewConfig).toEqual(DEFAULT_VALUES.previewConfig)
    })

    it('应该返回keyboardShortcuts section的默认值', async () => {
      const result = await adapter.resetSectionToDefault(SECTION_KEYS.KEYBOARD_SHORTCUTS)

      expect(result).toBeDefined()
      expect(result.drawerShortcuts).toEqual(DEFAULT_VALUES.drawerShortcuts)
    })

    it('应该返回debug section的默认值', async () => {
      const result = await adapter.resetSectionToDefault(SECTION_KEYS.DEBUG)

      expect(result).toBeDefined()
      expect(result.enableDebugLog).toBe(DEFAULT_VALUES.enableDebugLog)
      expect(result.autoParseString).toBe(DEFAULT_VALUES.autoParseString)
    })

    it('应该使用已知的section键', async () => {
      // 所有section键都应该能正常工作
      const result = await adapter.resetSectionToDefault(SECTION_KEYS.ELEMENT_DETECTION)
      expect(result).toBeDefined()
    })

    it('应该每次返回相同的section默认值', async () => {
      const result1 = await adapter.resetSectionToDefault(SECTION_KEYS.ELEMENT_DETECTION)
      const result2 = await adapter.resetSectionToDefault(SECTION_KEYS.ELEMENT_DETECTION)

      expect(result1).toEqual(result2)
    })
  })

  describe('resetAllToDefault', () => {
    it('应该返回所有默认值', async () => {
      const result = await adapter.resetAllToDefault()

      expect(result).toBeDefined()
      expect(result.attributeName).toBe(DEFAULT_VALUES.attributeName)
      expect(result.drawerWidth).toBe(DEFAULT_VALUES.drawerWidth)
      expect(result.searchConfig).toEqual(DEFAULT_VALUES.searchConfig)
      expect(result.autoParseString).toBe(DEFAULT_VALUES.autoParseString)
      expect(result.enableDebugLog).toBe(DEFAULT_VALUES.enableDebugLog)
      expect(result.toolbarButtons).toEqual(DEFAULT_VALUES.toolbarButtons)
      expect(result.highlightColor).toBe(DEFAULT_VALUES.highlightColor)
      expect(result.maxFavoritesCount).toBe(DEFAULT_VALUES.maxFavoritesCount)
      expect(result.autoSaveDraft).toBe(DEFAULT_VALUES.autoSaveDraft)
      expect(result.previewConfig).toEqual(DEFAULT_VALUES.previewConfig)
      expect(result.maxHistoryCount).toBe(DEFAULT_VALUES.maxHistoryCount)
      expect(result.highlightAllConfig).toEqual(DEFAULT_VALUES.highlightAllConfig)
      expect(result.recordingModeConfig).toEqual(DEFAULT_VALUES.recordingModeConfig)
      expect(result.iframeConfig).toEqual(DEFAULT_VALUES.iframeConfig)
      expect(result.enableAstTypeHints).toBe(DEFAULT_VALUES.enableAstTypeHints)
      expect(result.exportConfig).toEqual(DEFAULT_VALUES.exportConfig)
      expect(result.editorTheme).toBe(DEFAULT_VALUES.editorTheme)
      expect(result.apiConfig).toEqual(DEFAULT_VALUES.apiConfig)
      expect(result.drawerShortcuts).toEqual(DEFAULT_VALUES.drawerShortcuts)
      expect(result.themeColor).toBe(DEFAULT_VALUES.themeColor)
    })

    it('应该每次返回相同的默认值', async () => {
      const result1 = await adapter.resetAllToDefault()
      const result2 = await adapter.resetAllToDefault()

      expect(result1).toEqual(result2)
    })

    it('应该返回与loadAllSettings一致的formValues', async () => {
      const loadResult = await adapter.loadAllSettings()
      const resetResult = await adapter.resetAllToDefault()

      // resetAllToDefault返回的是平铺的对象，loadAllSettings返回的是带formValues的对象
      expect(loadResult.formValues.attributeName).toBe(resetResult.attributeName)
      expect(loadResult.formValues.drawerWidth).toBe(resetResult.drawerWidth)
      expect(loadResult.formValues.enableDebugLog).toBe(resetResult.enableDebugLog)
    })
  })

  describe('适配器完整性', () => {
    it('应该实现SettingsStorage接口的所有方法', () => {
      expect(adapter.loadAllSettings).toBeDefined()
      expect(adapter.saveField).toBeDefined()
      expect(adapter.resetSectionToDefault).toBeDefined()
      expect(adapter.resetAllToDefault).toBeDefined()

      expect(typeof adapter.loadAllSettings).toBe('function')
      expect(typeof adapter.saveField).toBe('function')
      expect(typeof adapter.resetSectionToDefault).toBe('function')
      expect(typeof adapter.resetAllToDefault).toBe('function')
    })

    it('应该可以多次创建适配器实例', () => {
      const adapter1 = createMockStorageAdapter()
      const adapter2 = createMockStorageAdapter()

      expect(adapter1).toBeDefined()
      expect(adapter2).toBeDefined()
      expect(adapter1).not.toBe(adapter2)
    })

    it('应该每个实例独立工作', async () => {
      const adapter1 = createMockStorageAdapter()
      const adapter2 = createMockStorageAdapter()

      const result1 = await adapter1.loadAllSettings()
      const result2 = await adapter2.loadAllSettings()

      expect(result1).toEqual(result2)

      await adapter1.saveField(['test'], { test: 'value1' })
      await adapter2.saveField(['test'], { test: 'value2' })

      // Mock适配器不保持状态，所以两次loadAllSettings应该返回相同的默认值
      const result3 = await adapter1.loadAllSettings()
      const result4 = await adapter2.loadAllSettings()

      expect(result3).toEqual(result4)
    })
  })

  describe('异步行为', () => {
    it('loadAllSettings应该是真正的Promise', () => {
      const result = adapter.loadAllSettings()

      expect(result).toBeInstanceOf(Promise)
    })

    it('saveField应该是真正的Promise', () => {
      const result = adapter.saveField(['test'], { test: 'value' })

      expect(result).toBeInstanceOf(Promise)
    })

    it('resetSectionToDefault应该是真正的Promise', () => {
      const result = adapter.resetSectionToDefault(SECTION_KEYS.ELEMENT_DETECTION)

      expect(result).toBeInstanceOf(Promise)
    })

    it('resetAllToDefault应该是真正的Promise', () => {
      const result = adapter.resetAllToDefault()

      expect(result).toBeInstanceOf(Promise)
    })

    it('应该支持并发调用', async () => {
      const promises = [
        adapter.loadAllSettings(),
        adapter.saveField(['field1'], { field1: 'value1' }),
        adapter.resetSectionToDefault(SECTION_KEYS.ELEMENT_DETECTION),
        adapter.resetAllToDefault(),
        adapter.saveField(['field2'], { field2: 'value2' }),
      ]

      await expect(Promise.all(promises)).resolves.toBeDefined()
    })
  })
})
