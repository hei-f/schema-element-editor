import { createChromeStorageAdapter } from '../chrome-storage-adapter'
import { storage } from '@/shared/utils/browser/storage'
import { DEFAULT_VALUES } from '@/shared/constants/defaults'
import { SECTION_KEYS } from '../../config/field-config'
import type { Mock } from 'vitest'

/**
 * Mock storage 模块
 */
vi.mock('@/shared/utils/browser/storage', () => ({
  storage: {
    getAttributeName: vi.fn(),
    getSearchConfig: vi.fn(),
    getAutoParseString: vi.fn(),
    getEnableDebugLog: vi.fn(),
    getToolbarButtons: vi.fn(),
    getDrawerWidth: vi.fn(),
    getHighlightColor: vi.fn(),
    getMaxFavoritesCount: vi.fn(),
    getAutoSaveDraft: vi.fn(),
    getPreviewConfig: vi.fn(),
    getMaxHistoryCount: vi.fn(),
    getHighlightAllConfig: vi.fn(),
    getRecordingModeConfig: vi.fn(),
    getIframeConfig: vi.fn(),
    getEnableAstTypeHints: vi.fn(),
    getExportConfig: vi.fn(),
    getEditorTheme: vi.fn(),
    getApiConfig: vi.fn(),
    getDrawerShortcuts: vi.fn(),
    getThemeColor: vi.fn(),
    setAttributeName: vi.fn(),
    setSearchConfig: vi.fn(),
    setAutoParseString: vi.fn(),
    setEnableDebugLog: vi.fn(),
    setToolbarButtons: vi.fn(),
    setDrawerWidth: vi.fn(),
    setHighlightColor: vi.fn(),
    setMaxFavoritesCount: vi.fn(),
    setAutoSaveDraft: vi.fn(),
    setPreviewConfig: vi.fn(),
    setMaxHistoryCount: vi.fn(),
    setHighlightAllConfig: vi.fn(),
    setRecordingModeConfig: vi.fn(),
    setIframeConfig: vi.fn(),
    setEnableAstTypeHints: vi.fn(),
    setExportConfig: vi.fn(),
    setEditorTheme: vi.fn(),
    setApiConfig: vi.fn(),
  },
}))

describe('ChromeStorageAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loadAllSettings', () => {
    it('应该成功加载所有配置项', async () => {
      // Mock 所有 getter 返回默认值
      ;(storage.getAttributeName as Mock).mockResolvedValue(DEFAULT_VALUES.attributeName)
      ;(storage.getSearchConfig as Mock).mockResolvedValue(DEFAULT_VALUES.searchConfig)
      ;(storage.getAutoParseString as Mock).mockResolvedValue(DEFAULT_VALUES.autoParseString)
      ;(storage.getEnableDebugLog as Mock).mockResolvedValue(DEFAULT_VALUES.enableDebugLog)
      ;(storage.getToolbarButtons as Mock).mockResolvedValue(DEFAULT_VALUES.toolbarButtons)
      ;(storage.getDrawerWidth as Mock).mockResolvedValue(DEFAULT_VALUES.drawerWidth)
      ;(storage.getHighlightColor as Mock).mockResolvedValue(DEFAULT_VALUES.highlightColor)
      ;(storage.getMaxFavoritesCount as Mock).mockResolvedValue(DEFAULT_VALUES.maxFavoritesCount)
      ;(storage.getAutoSaveDraft as Mock).mockResolvedValue(DEFAULT_VALUES.autoSaveDraft)
      ;(storage.getPreviewConfig as Mock).mockResolvedValue(DEFAULT_VALUES.previewConfig)
      ;(storage.getMaxHistoryCount as Mock).mockResolvedValue(DEFAULT_VALUES.maxHistoryCount)
      ;(storage.getHighlightAllConfig as Mock).mockResolvedValue(DEFAULT_VALUES.highlightAllConfig)
      ;(storage.getRecordingModeConfig as Mock).mockResolvedValue(
        DEFAULT_VALUES.recordingModeConfig
      )
      ;(storage.getIframeConfig as Mock).mockResolvedValue(DEFAULT_VALUES.iframeConfig)
      ;(storage.getEnableAstTypeHints as Mock).mockResolvedValue(DEFAULT_VALUES.enableAstTypeHints)
      ;(storage.getExportConfig as Mock).mockResolvedValue(DEFAULT_VALUES.exportConfig)
      ;(storage.getEditorTheme as Mock).mockResolvedValue(DEFAULT_VALUES.editorTheme)
      ;(storage.getApiConfig as Mock).mockResolvedValue(DEFAULT_VALUES.apiConfig)
      ;(storage.getDrawerShortcuts as Mock).mockResolvedValue(DEFAULT_VALUES.drawerShortcuts)
      ;(storage.getThemeColor as Mock).mockResolvedValue(DEFAULT_VALUES.themeColor)

      const adapter = createChromeStorageAdapter()
      const result = await adapter.loadAllSettings()

      expect(result.formValues).toEqual({
        attributeName: DEFAULT_VALUES.attributeName,
        drawerWidth: DEFAULT_VALUES.drawerWidth,
        searchConfig: DEFAULT_VALUES.searchConfig,
        autoParseString: DEFAULT_VALUES.autoParseString,
        enableDebugLog: DEFAULT_VALUES.enableDebugLog,
        toolbarButtons: DEFAULT_VALUES.toolbarButtons,
        highlightColor: DEFAULT_VALUES.highlightColor,
        maxFavoritesCount: DEFAULT_VALUES.maxFavoritesCount,
        autoSaveDraft: DEFAULT_VALUES.autoSaveDraft,
        previewConfig: DEFAULT_VALUES.previewConfig,
        maxHistoryCount: DEFAULT_VALUES.maxHistoryCount,
        highlightAllConfig: DEFAULT_VALUES.highlightAllConfig,
        recordingModeConfig: DEFAULT_VALUES.recordingModeConfig,
        iframeConfig: DEFAULT_VALUES.iframeConfig,
        enableAstTypeHints: DEFAULT_VALUES.enableAstTypeHints,
        exportConfig: DEFAULT_VALUES.exportConfig,
        editorTheme: DEFAULT_VALUES.editorTheme,
        apiConfig: DEFAULT_VALUES.apiConfig,
        drawerShortcuts: DEFAULT_VALUES.drawerShortcuts,
        themeColor: DEFAULT_VALUES.themeColor,
      })
    })

    it('应该并行加载所有配置项', async () => {
      const mockValues = {
        attributeName: 'test-attr',
        drawerWidth: { drawerWidth: 600, zIndex: { default: 1000, fullScreen: 2000 } },
        searchConfig: { limitUpwardSearch: true, searchDepthUp: 5, throttleInterval: 100 },
      }

      ;(storage.getAttributeName as Mock).mockResolvedValue(mockValues.attributeName)
      ;(storage.getDrawerWidth as Mock).mockResolvedValue(mockValues.drawerWidth)
      ;(storage.getSearchConfig as Mock).mockResolvedValue(mockValues.searchConfig)
      ;(storage.getAutoParseString as Mock).mockResolvedValue(DEFAULT_VALUES.autoParseString)
      ;(storage.getEnableDebugLog as Mock).mockResolvedValue(DEFAULT_VALUES.enableDebugLog)
      ;(storage.getToolbarButtons as Mock).mockResolvedValue(DEFAULT_VALUES.toolbarButtons)
      ;(storage.getHighlightColor as Mock).mockResolvedValue(DEFAULT_VALUES.highlightColor)
      ;(storage.getMaxFavoritesCount as Mock).mockResolvedValue(DEFAULT_VALUES.maxFavoritesCount)
      ;(storage.getAutoSaveDraft as Mock).mockResolvedValue(DEFAULT_VALUES.autoSaveDraft)
      ;(storage.getPreviewConfig as Mock).mockResolvedValue(DEFAULT_VALUES.previewConfig)
      ;(storage.getMaxHistoryCount as Mock).mockResolvedValue(DEFAULT_VALUES.maxHistoryCount)
      ;(storage.getHighlightAllConfig as Mock).mockResolvedValue(DEFAULT_VALUES.highlightAllConfig)
      ;(storage.getRecordingModeConfig as Mock).mockResolvedValue(
        DEFAULT_VALUES.recordingModeConfig
      )
      ;(storage.getIframeConfig as Mock).mockResolvedValue(DEFAULT_VALUES.iframeConfig)
      ;(storage.getEnableAstTypeHints as Mock).mockResolvedValue(DEFAULT_VALUES.enableAstTypeHints)
      ;(storage.getExportConfig as Mock).mockResolvedValue(DEFAULT_VALUES.exportConfig)
      ;(storage.getEditorTheme as Mock).mockResolvedValue(DEFAULT_VALUES.editorTheme)
      ;(storage.getApiConfig as Mock).mockResolvedValue(DEFAULT_VALUES.apiConfig)
      ;(storage.getDrawerShortcuts as Mock).mockResolvedValue(DEFAULT_VALUES.drawerShortcuts)
      ;(storage.getThemeColor as Mock).mockResolvedValue(DEFAULT_VALUES.themeColor)

      const adapter = createChromeStorageAdapter()
      const result = await adapter.loadAllSettings()

      expect(result.formValues.attributeName).toBe(mockValues.attributeName)
      expect(result.formValues.drawerWidth).toEqual(mockValues.drawerWidth)
      expect(result.formValues.searchConfig).toEqual(mockValues.searchConfig)
    })

    it('应该处理加载失败的情况', async () => {
      ;(storage.getAttributeName as Mock).mockRejectedValue(new Error('Storage error'))

      const adapter = createChromeStorageAdapter()

      await expect(adapter.loadAllSettings()).rejects.toThrow('Storage error')
    })
  })

  describe('saveField', () => {
    it('应该保存单个字段', async () => {
      ;(storage.setAttributeName as Mock).mockResolvedValue(undefined)

      const adapter = createChromeStorageAdapter()
      await adapter.saveField(['attributeName'], { attributeName: 'new-attr' })

      expect(storage.setAttributeName).toHaveBeenCalledWith('new-attr')
    })

    it('应该保存嵌套字段（通过field group）', async () => {
      ;(storage.setSearchConfig as Mock).mockResolvedValue(undefined)

      const newSearchConfig = {
        limitUpwardSearch: true,
        searchDepthUp: 10,
        throttleInterval: 200,
      }

      const adapter = createChromeStorageAdapter()
      // searchConfig是field group，需要传入嵌套路径触发group保存
      await adapter.saveField(['searchConfig', 'limitUpwardSearch'], {
        searchConfig: newSearchConfig,
      })

      expect(storage.setSearchConfig).toHaveBeenCalledWith(newSearchConfig)
    })

    it('应该处理不存在的字段路径', async () => {
      const adapter = createChromeStorageAdapter()

      // 不存在的字段路径不应该抛出错误，也不应该调用任何storage方法
      await adapter.saveField(['nonexistent', 'field'], { someField: 'value' })

      // 验证没有调用任何storage方法
      expect(storage.setAttributeName).not.toHaveBeenCalled()
    })

    it('应该处理保存失败的情况', async () => {
      ;(storage.setAttributeName as Mock).mockRejectedValue(new Error('Save failed'))

      const adapter = createChromeStorageAdapter()

      await expect(adapter.saveField(['attributeName'], { attributeName: 'test' })).rejects.toThrow(
        'Save failed'
      )
    })
  })

  describe('resetSectionToDefault', () => {
    it('应该重置元素检测配置到默认值', async () => {
      ;(storage.setSearchConfig as Mock).mockResolvedValue(undefined)
      ;(storage.setHighlightColor as Mock).mockResolvedValue(undefined)
      ;(storage.setHighlightAllConfig as Mock).mockResolvedValue(undefined)
      ;(storage.setRecordingModeConfig as Mock).mockResolvedValue(undefined)
      ;(storage.setIframeConfig as Mock).mockResolvedValue(undefined)

      const adapter = createChromeStorageAdapter()
      const result = await adapter.resetSectionToDefault(SECTION_KEYS.ELEMENT_DETECTION)

      expect(result.searchConfig).toEqual(DEFAULT_VALUES.searchConfig)
      expect(result.highlightColor).toBe(DEFAULT_VALUES.highlightColor)
      expect(result.highlightAllConfig).toEqual(DEFAULT_VALUES.highlightAllConfig)
      expect(result.recordingModeConfig).toEqual(DEFAULT_VALUES.recordingModeConfig)
      expect(result.iframeConfig).toEqual(DEFAULT_VALUES.iframeConfig)
    })

    it('应该重置编辑器配置到默认值', async () => {
      ;(storage.setEnableAstTypeHints as Mock).mockResolvedValue(undefined)
      ;(storage.setEditorTheme as Mock).mockResolvedValue(undefined)

      const adapter = createChromeStorageAdapter()
      const result = await adapter.resetSectionToDefault(SECTION_KEYS.EDITOR_CONFIG)

      expect(result.enableAstTypeHints).toBe(DEFAULT_VALUES.enableAstTypeHints)
      expect(result.editorTheme).toBe(DEFAULT_VALUES.editorTheme)
    })

    it('应该并行保存重置的配置项', async () => {
      ;(storage.setSearchConfig as Mock).mockResolvedValue(undefined)
      ;(storage.setHighlightColor as Mock).mockResolvedValue(undefined)
      ;(storage.setHighlightAllConfig as Mock).mockResolvedValue(undefined)
      ;(storage.setRecordingModeConfig as Mock).mockResolvedValue(undefined)
      ;(storage.setIframeConfig as Mock).mockResolvedValue(undefined)

      const adapter = createChromeStorageAdapter()
      await adapter.resetSectionToDefault(SECTION_KEYS.ELEMENT_DETECTION)

      expect(storage.setSearchConfig).toHaveBeenCalledWith(DEFAULT_VALUES.searchConfig)
      expect(storage.setHighlightColor).toHaveBeenCalledWith(DEFAULT_VALUES.highlightColor)
      expect(storage.setHighlightAllConfig).toHaveBeenCalledWith(DEFAULT_VALUES.highlightAllConfig)
    })
  })

  describe('resetAllToDefault', () => {
    it('应该重置所有配置到默认值', async () => {
      ;(storage.setAttributeName as Mock).mockResolvedValue(undefined)
      ;(storage.setDrawerWidth as Mock).mockResolvedValue(undefined)
      ;(storage.setSearchConfig as Mock).mockResolvedValue(undefined)
      ;(storage.setAutoParseString as Mock).mockResolvedValue(undefined)
      ;(storage.setEnableDebugLog as Mock).mockResolvedValue(undefined)
      ;(storage.setToolbarButtons as Mock).mockResolvedValue(undefined)
      ;(storage.setHighlightColor as Mock).mockResolvedValue(undefined)
      ;(storage.setMaxFavoritesCount as Mock).mockResolvedValue(undefined)
      ;(storage.setAutoSaveDraft as Mock).mockResolvedValue(undefined)
      ;(storage.setPreviewConfig as Mock).mockResolvedValue(undefined)
      ;(storage.setMaxHistoryCount as Mock).mockResolvedValue(undefined)
      ;(storage.setHighlightAllConfig as Mock).mockResolvedValue(undefined)
      ;(storage.setRecordingModeConfig as Mock).mockResolvedValue(undefined)
      ;(storage.setIframeConfig as Mock).mockResolvedValue(undefined)
      ;(storage.setEnableAstTypeHints as Mock).mockResolvedValue(undefined)
      ;(storage.setExportConfig as Mock).mockResolvedValue(undefined)
      ;(storage.setEditorTheme as Mock).mockResolvedValue(undefined)
      ;(storage.setApiConfig as Mock).mockResolvedValue(undefined)

      const adapter = createChromeStorageAdapter()
      const result = await adapter.resetAllToDefault()

      // 验证返回的默认值
      expect(result.attributeName).toBe(DEFAULT_VALUES.attributeName)
      expect(result.drawerWidth).toEqual(DEFAULT_VALUES.drawerWidth)
      expect(result.searchConfig).toEqual(DEFAULT_VALUES.searchConfig)

      // 验证所有setter被调用
      expect(storage.setAttributeName).toHaveBeenCalledWith(DEFAULT_VALUES.attributeName)
      expect(storage.setDrawerWidth).toHaveBeenCalledWith(DEFAULT_VALUES.drawerWidth)
      expect(storage.setSearchConfig).toHaveBeenCalledWith(DEFAULT_VALUES.searchConfig)
      expect(storage.setToolbarButtons).toHaveBeenCalledWith(DEFAULT_VALUES.toolbarButtons)
    })

    it('应该并行保存所有默认值', async () => {
      const setMethods = [
        storage.setAttributeName,
        storage.setDrawerWidth,
        storage.setSearchConfig,
        storage.setAutoParseString,
        storage.setEnableDebugLog,
        storage.setToolbarButtons,
        storage.setHighlightColor,
        storage.setMaxFavoritesCount,
        storage.setAutoSaveDraft,
        storage.setPreviewConfig,
        storage.setMaxHistoryCount,
        storage.setHighlightAllConfig,
        storage.setRecordingModeConfig,
        storage.setIframeConfig,
        storage.setEnableAstTypeHints,
        storage.setExportConfig,
        storage.setEditorTheme,
        storage.setApiConfig,
      ]

      setMethods.forEach((method) => {
        ;(method as Mock).mockResolvedValue(undefined)
      })

      const adapter = createChromeStorageAdapter()
      await adapter.resetAllToDefault()

      // 所有方法都应该被调用
      setMethods.forEach((method) => {
        expect(method).toHaveBeenCalled()
      })
    })

    it('应该处理重置失败的情况', async () => {
      ;(storage.setAttributeName as Mock).mockRejectedValue(new Error('Reset failed'))

      const adapter = createChromeStorageAdapter()

      await expect(adapter.resetAllToDefault()).rejects.toThrow('Reset failed')
    })
  })

  describe('边界情况', () => {
    it('应该处理部分配置加载失败的情况', async () => {
      ;(storage.getAttributeName as Mock).mockResolvedValue(DEFAULT_VALUES.attributeName)
      ;(storage.getSearchConfig as Mock).mockRejectedValue(new Error('Failed to load'))

      const adapter = createChromeStorageAdapter()

      await expect(adapter.loadAllSettings()).rejects.toThrow()
    })

    it('应该处理空值配置', async () => {
      ;(storage.setAttributeName as Mock).mockResolvedValue(undefined)

      const adapter = createChromeStorageAdapter()
      await adapter.saveField(['attributeName'], { attributeName: '' })

      expect(storage.setAttributeName).toHaveBeenCalledWith('')
    })

    it('应该处理复杂嵌套对象配置（通过field group）', async () => {
      ;(storage.setToolbarButtons as Mock).mockResolvedValue(undefined)

      const complexConfig = {
        toolbarButtons: {
          astRawStringToggle: true,
          escape: false,
          deserialize: true,
          serialize: false,
          format: true,
          preview: true,
          importExport: false,
          draft: true,
          favorites: true,
          history: false,
        },
      }

      const adapter = createChromeStorageAdapter()
      // toolbarButtons是field group，会通过group的save方法保存
      await adapter.saveField(['toolbarButtons', 'astRawStringToggle'], complexConfig)

      expect(storage.setToolbarButtons).toHaveBeenCalledWith(complexConfig.toolbarButtons)
    })
  })
})
