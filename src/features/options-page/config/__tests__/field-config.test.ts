import {
  FIELD_GROUPS,
  FIELD_PATH_STORAGE_MAP,
  findFieldGroup,
  isDebounceField,
} from '../field-config'
import { storage } from '@/shared/utils/browser/storage'

// Mock storage
vi.mock('@/shared/utils/browser/storage', () => ({
  storage: {
    setApiConfig: vi.fn().mockResolvedValue(undefined),
    setSearchConfig: vi.fn().mockResolvedValue(undefined),
    setFunctionNames: vi.fn().mockResolvedValue(undefined),
    setToolbarButtons: vi.fn().mockResolvedValue(undefined),
    setPreviewConfig: vi.fn().mockResolvedValue(undefined),
    setHighlightAllConfig: vi.fn().mockResolvedValue(undefined),
    setRecordingModeConfig: vi.fn().mockResolvedValue(undefined),
    setExportConfig: vi.fn().mockResolvedValue(undefined),
  },
}))

describe('field-config测试', () => {
  describe('FIELD_PATH_STORAGE_MAP', () => {
    it('应该包含attributeName的映射', () => {
      expect(FIELD_PATH_STORAGE_MAP).toHaveProperty('attributeName')
      expect(FIELD_PATH_STORAGE_MAP.attributeName).toBe('setAttributeName')
    })

    it('应该包含drawerWidth的映射', () => {
      expect(FIELD_PATH_STORAGE_MAP).toHaveProperty('drawerWidth')
      expect(FIELD_PATH_STORAGE_MAP.drawerWidth).toBe('setDrawerWidth')
    })

    it('应该包含highlightColor的映射', () => {
      expect(FIELD_PATH_STORAGE_MAP).toHaveProperty('highlightColor')
      expect(FIELD_PATH_STORAGE_MAP.highlightColor).toBe('setHighlightColor')
    })

    it('应该包含autoParseString的映射', () => {
      expect(FIELD_PATH_STORAGE_MAP).toHaveProperty('autoParseString')
      expect(FIELD_PATH_STORAGE_MAP.autoParseString).toBe('setAutoParseString')
    })

    it('应该包含enableDebugLog的映射', () => {
      expect(FIELD_PATH_STORAGE_MAP).toHaveProperty('enableDebugLog')
      expect(FIELD_PATH_STORAGE_MAP.enableDebugLog).toBe('setEnableDebugLog')
    })

    it('应该包含maxFavoritesCount的映射', () => {
      expect(FIELD_PATH_STORAGE_MAP).toHaveProperty('maxFavoritesCount')
      expect(FIELD_PATH_STORAGE_MAP.maxFavoritesCount).toBe('setMaxFavoritesCount')
    })

    it('应该包含autoSaveDraft的映射', () => {
      expect(FIELD_PATH_STORAGE_MAP).toHaveProperty('autoSaveDraft')
      expect(FIELD_PATH_STORAGE_MAP.autoSaveDraft).toBe('setAutoSaveDraft')
    })

    it('应该包含maxHistoryCount的映射', () => {
      expect(FIELD_PATH_STORAGE_MAP).toHaveProperty('maxHistoryCount')
      expect(FIELD_PATH_STORAGE_MAP.maxHistoryCount).toBe('setMaxHistoryCount')
    })
  })

  describe('find Field Group', () => {
    it('应该找到searchConfig字段组', () => {
      const result = findFieldGroup(['searchConfig', 'limitUpwardSearch'])
      expect(result).toBeDefined()
      expect(result?.save).toBeDefined()
    })

    it('应该找到toolbarButtons字段组', () => {
      const result = findFieldGroup(['toolbarButtons', 'format'])
      expect(result).toBeDefined()
      expect(result?.save).toBeDefined()
    })

    it('应该找到previewConfig字段组', () => {
      const result = findFieldGroup(['previewConfig', 'autoUpdate'])
      expect(result).toBeDefined()
      expect(result?.save).toBeDefined()
    })

    it('应该找到functionNames字段组', () => {
      const result = findFieldGroup(['getFunctionName'])
      expect(result).toBeDefined()
      expect(result?.save).toBeDefined()
    })

    it('独立字段attributeName应该返回null', () => {
      const result = findFieldGroup(['attributeName'])
      expect(result).toBeNull()
    })

    it('独立字段autoParseString应该返回null', () => {
      const result = findFieldGroup(['autoParseString'])
      expect(result).toBeNull()
    })

    it('未知字段应该返回null', () => {
      const result = findFieldGroup(['unknownField'])
      expect(result).toBeNull()
    })
  })

  describe('isDebounceField', () => {
    it('drawerWidth应该使用防抖', () => {
      const result = isDebounceField(['drawerWidth'])
      expect(result).toBe(true)
    })

    it('searchConfig.throttleInterval应该使用防抖', () => {
      const result = isDebounceField(['searchConfig', 'throttleInterval'])
      expect(result).toBe(true)
    })

    it('searchConfig.searchDepthUp应该使用防抖', () => {
      const result = isDebounceField(['searchConfig', 'searchDepthUp'])
      expect(result).toBe(true)
    })

    it('attributeName应该使用防抖', () => {
      const result = isDebounceField(['attributeName'])
      expect(result).toBe(true)
    })

    it('autoParseString不应该使用防抖', () => {
      const result = isDebounceField(['autoParseString'])
      expect(result).toBe(false)
    })

    it('enableDebugLog不应该使用防抖', () => {
      const result = isDebounceField(['enableDebugLog'])
      expect(result).toBe(false)
    })

    it('toolbarButtons字段不应该使用防抖', () => {
      const result = isDebounceField(['toolbarButtons', 'format'])
      expect(result).toBe(false)
    })

    it('maxFavoritesCount应该使用防抖', () => {
      const result = isDebounceField(['maxFavoritesCount'])
      expect(result).toBe(true)
    })

    it('maxHistoryCount应该使用防抖', () => {
      const result = isDebounceField(['maxHistoryCount'])
      expect(result).toBe(true)
    })
  })

  describe('FIELD_GROUPS', () => {
    it('应该包含searchConfig组', () => {
      expect(FIELD_GROUPS.searchConfig).toBeDefined()
      expect(FIELD_GROUPS.searchConfig.fieldPaths).toBeDefined()
      expect(FIELD_GROUPS.searchConfig.save).toBeDefined()
    })

    it('应该包含toolbarButtons组', () => {
      expect(FIELD_GROUPS.toolbarButtons).toBeDefined()
      expect(FIELD_GROUPS.toolbarButtons.fieldPaths).toBeDefined()
      expect(FIELD_GROUPS.toolbarButtons.save).toBeDefined()
    })

    it('应该包含previewConfig组', () => {
      expect(FIELD_GROUPS.previewConfig).toBeDefined()
      expect(FIELD_GROUPS.previewConfig.fieldPaths).toBeDefined()
      expect(FIELD_GROUPS.previewConfig.save).toBeDefined()
    })

    it('应该包含functionNames组', () => {
      expect(FIELD_GROUPS.functionNames).toBeDefined()
      expect(FIELD_GROUPS.functionNames.fieldPaths).toBeDefined()
      expect(FIELD_GROUPS.functionNames.save).toBeDefined()
    })

    it('每个组都应该有save方法', () => {
      Object.values(FIELD_GROUPS).forEach((group) => {
        expect(group.save).toBeDefined()
        expect(typeof group.save).toBe('function')
      })
    })
  })

  describe('FIELD_GROUPS save方法', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('apiConfig.save 应该调用 storage.setApiConfig', async () => {
      const mockValues = {
        apiConfig: {
          communicationMode: 'postMessage',
          requestTimeout: 5000,
        },
      }

      await FIELD_GROUPS.apiConfig.save(mockValues)

      expect(storage.setApiConfig).toHaveBeenCalledWith(mockValues.apiConfig)
    })

    it('searchConfig.save 应该调用 storage.setSearchConfig', async () => {
      const mockValues = {
        searchConfig: {
          limitUpwardSearch: true,
          searchDepthUp: 10,
          throttleInterval: 100,
        },
      }

      await FIELD_GROUPS.searchConfig.save(mockValues)

      expect(storage.setSearchConfig).toHaveBeenCalledWith(mockValues.searchConfig)
    })

    it('functionNames.save 应该调用 storage.setFunctionNames', async () => {
      const mockValues = {
        getFunctionName: 'getSchema',
        updateFunctionName: 'updateSchema',
        previewFunctionName: 'previewSchema',
      }

      await FIELD_GROUPS.functionNames.save(mockValues)

      expect(storage.setFunctionNames).toHaveBeenCalledWith(
        mockValues.getFunctionName,
        mockValues.updateFunctionName,
        mockValues.previewFunctionName
      )
    })

    it('toolbarButtons.save 应该调用 storage.setToolbarButtons', async () => {
      const mockValues = {
        toolbarButtons: {
          format: true,
          escape: true,
          preview: false,
        },
      }

      await FIELD_GROUPS.toolbarButtons.save(mockValues)

      expect(storage.setToolbarButtons).toHaveBeenCalledWith(mockValues.toolbarButtons)
    })

    it('previewConfig.save 应该调用 storage.setPreviewConfig', async () => {
      const mockValues = {
        previewConfig: {
          previewWidth: 400,
          updateDelay: 500,
          autoUpdate: true,
        },
      }

      await FIELD_GROUPS.previewConfig.save(mockValues)

      expect(storage.setPreviewConfig).toHaveBeenCalledWith(mockValues.previewConfig)
    })

    it('highlightAllConfig.save 应该调用 storage.setHighlightAllConfig', async () => {
      const mockValues = {
        highlightAllConfig: {
          enabled: true,
          keyBinding: 'Ctrl+Shift+H',
          maxHighlightCount: 100,
        },
      }

      await FIELD_GROUPS.highlightAllConfig.save(mockValues)

      expect(storage.setHighlightAllConfig).toHaveBeenCalledWith(mockValues.highlightAllConfig)
    })

    it('recordingModeConfig.save 应该调用 storage.setRecordingModeConfig', async () => {
      const mockValues = {
        recordingModeConfig: {
          enabled: true,
          keyBinding: 'Ctrl+Shift+R',
          highlightColor: '#ff0000',
          pollingInterval: 1000,
        },
      }

      await FIELD_GROUPS.recordingModeConfig.save(mockValues)

      expect(storage.setRecordingModeConfig).toHaveBeenCalledWith(mockValues.recordingModeConfig)
    })

    it('exportConfig.save 应该调用 storage.setExportConfig', async () => {
      const mockValues = {
        exportConfig: {
          customFileName: 'my-export',
        },
      }

      await FIELD_GROUPS.exportConfig.save(mockValues)

      expect(storage.setExportConfig).toHaveBeenCalledWith(mockValues.exportConfig)
    })
  })
})
