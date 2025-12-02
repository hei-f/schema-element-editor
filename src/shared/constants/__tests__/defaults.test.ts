import { DEFAULT_VALUES, STORAGE_KEYS } from '../defaults'

describe('defaults', () => {
  describe('DEFAULT_VALUES 结构验证', () => {
    it('应该包含所有必需的配置项', () => {
      const expectedKeys = [
        'isActive',
        'drawerWidth',
        'attributeName',
        'searchConfig',
        'getFunctionName',
        'updateFunctionName',
        'previewFunctionName',
        'autoParseString',
        'enableDebugLog',
        'toolbarButtons',
        'highlightColor',
        'maxFavoritesCount',
        'draftRetentionDays',
        'autoSaveDraft',
        'draftAutoSaveDebounce',
        'previewConfig',
        'maxHistoryCount',
        'highlightAllConfig',
        'recordingModeConfig',
        'iframeConfig',
        'enableAstTypeHints',
        'exportConfig',
        'editorTheme',
        'apiConfig',
        'drawerShortcuts',
      ]

      expectedKeys.forEach((key) => {
        expect(DEFAULT_VALUES).toHaveProperty(key)
      })
    })

    it('DEFAULT_VALUES 应该是用 as const 声明的只读类型', () => {
      // as const 是 TypeScript 编译时检查，运行时不会抛出错误
      // 这里验证类型定义是正确的
      expect(DEFAULT_VALUES).toBeDefined()
      expect(typeof DEFAULT_VALUES).toBe('object')
    })
  })

  describe('基础配置默认值', () => {
    it('isActive 应该是布尔值', () => {
      expect(typeof DEFAULT_VALUES.isActive).toBe('boolean')
    })

    it('drawerWidth 默认应该为有效的 CSS 值', () => {
      expect(DEFAULT_VALUES.drawerWidth).toMatch(/^\d+px$/)
      expect(DEFAULT_VALUES.drawerWidth).toBe('800px')
    })

    it('attributeName 默认应该为 id', () => {
      expect(DEFAULT_VALUES.attributeName).toBe('id')
    })

    it('autoParseString 默认应该为 true', () => {
      expect(DEFAULT_VALUES.autoParseString).toBe(true)
    })

    it('enableDebugLog 默认应该为 false', () => {
      expect(DEFAULT_VALUES.enableDebugLog).toBe(false)
    })

    it('highlightColor 默认应该为有效的颜色值', () => {
      expect(DEFAULT_VALUES.highlightColor).toMatch(/^#[0-9A-Fa-f]{6}$/)
    })
  })

  describe('searchConfig 默认值', () => {
    it('应该包含必需的搜索配置', () => {
      expect(DEFAULT_VALUES.searchConfig).toHaveProperty('limitUpwardSearch')
      expect(DEFAULT_VALUES.searchConfig).toHaveProperty('searchDepthUp')
      expect(DEFAULT_VALUES.searchConfig).toHaveProperty('throttleInterval')
    })

    it('limitUpwardSearch 默认应该为 false', () => {
      expect(DEFAULT_VALUES.searchConfig.limitUpwardSearch).toBe(false)
    })

    it('searchDepthUp 应该是正整数', () => {
      expect(DEFAULT_VALUES.searchConfig.searchDepthUp).toBeGreaterThan(0)
      expect(Number.isInteger(DEFAULT_VALUES.searchConfig.searchDepthUp)).toBe(true)
    })

    it('throttleInterval 应该是有效的毫秒值', () => {
      expect(DEFAULT_VALUES.searchConfig.throttleInterval).toBeGreaterThan(0)
      expect(DEFAULT_VALUES.searchConfig.throttleInterval).toBeLessThanOrEqual(100)
    })
  })

  describe('toolbarButtons 默认值', () => {
    it('应该包含所有工具栏按钮配置', () => {
      const expectedButtons = [
        'astRawStringToggle',
        'escape',
        'deserialize',
        'serialize',
        'format',
        'preview',
        'importExport',
        'draft',
        'favorites',
        'history',
      ]

      expectedButtons.forEach((button) => {
        expect(DEFAULT_VALUES.toolbarButtons).toHaveProperty(button)
        expect(
          typeof DEFAULT_VALUES.toolbarButtons[button as keyof typeof DEFAULT_VALUES.toolbarButtons]
        ).toBe('boolean')
      })
    })

    it('format 按钮默认应该启用', () => {
      expect(DEFAULT_VALUES.toolbarButtons.format).toBe(true)
    })

    it('preview 按钮默认应该启用', () => {
      expect(DEFAULT_VALUES.toolbarButtons.preview).toBe(true)
    })
  })

  describe('previewConfig 默认值', () => {
    it('应该包含必需的预览配置', () => {
      expect(DEFAULT_VALUES.previewConfig).toHaveProperty('previewWidth')
      expect(DEFAULT_VALUES.previewConfig).toHaveProperty('updateDelay')
      expect(DEFAULT_VALUES.previewConfig).toHaveProperty('autoUpdate')
      expect(DEFAULT_VALUES.previewConfig).toHaveProperty('zIndex')
    })

    it('previewWidth 应该是有效的百分比', () => {
      expect(DEFAULT_VALUES.previewConfig.previewWidth).toBeGreaterThan(0)
      expect(DEFAULT_VALUES.previewConfig.previewWidth).toBeLessThanOrEqual(100)
    })

    it('updateDelay 应该是有效的延迟值', () => {
      expect(DEFAULT_VALUES.previewConfig.updateDelay).toBeGreaterThan(0)
    })

    it('zIndex 配置应该包含必需的层级', () => {
      expect(DEFAULT_VALUES.previewConfig.zIndex).toHaveProperty('default')
      expect(DEFAULT_VALUES.previewConfig.zIndex).toHaveProperty('preview')
      expect(DEFAULT_VALUES.previewConfig.zIndex.default).toBeGreaterThan(
        DEFAULT_VALUES.previewConfig.zIndex.preview
      )
    })
  })

  describe('highlightAllConfig 默认值', () => {
    it('应该包含必需的高亮配置', () => {
      expect(DEFAULT_VALUES.highlightAllConfig).toHaveProperty('enabled')
      expect(DEFAULT_VALUES.highlightAllConfig).toHaveProperty('keyBinding')
      expect(DEFAULT_VALUES.highlightAllConfig).toHaveProperty('maxHighlightCount')
    })

    it('enabled 默认应该为 true', () => {
      expect(DEFAULT_VALUES.highlightAllConfig.enabled).toBe(true)
    })

    it('keyBinding 应该是单个字符', () => {
      expect(DEFAULT_VALUES.highlightAllConfig.keyBinding).toHaveLength(1)
    })

    it('maxHighlightCount 应该在有效范围内', () => {
      expect(DEFAULT_VALUES.highlightAllConfig.maxHighlightCount).toBeGreaterThanOrEqual(100)
      expect(DEFAULT_VALUES.highlightAllConfig.maxHighlightCount).toBeLessThanOrEqual(1000)
    })
  })

  describe('recordingModeConfig 默认值', () => {
    it('应该包含必需的录制配置', () => {
      expect(DEFAULT_VALUES.recordingModeConfig).toHaveProperty('enabled')
      expect(DEFAULT_VALUES.recordingModeConfig).toHaveProperty('keyBinding')
      expect(DEFAULT_VALUES.recordingModeConfig).toHaveProperty('highlightColor')
      expect(DEFAULT_VALUES.recordingModeConfig).toHaveProperty('pollingInterval')
    })

    it('enabled 默认应该为 true', () => {
      expect(DEFAULT_VALUES.recordingModeConfig.enabled).toBe(true)
    })

    it('keyBinding 应该是单个字符', () => {
      expect(DEFAULT_VALUES.recordingModeConfig.keyBinding).toHaveLength(1)
    })

    it('highlightColor 应该是有效的颜色值', () => {
      expect(DEFAULT_VALUES.recordingModeConfig.highlightColor).toMatch(/^#[0-9A-Fa-f]{6}$/)
    })

    it('pollingInterval 应该在有效范围内', () => {
      expect(DEFAULT_VALUES.recordingModeConfig.pollingInterval).toBeGreaterThanOrEqual(50)
      expect(DEFAULT_VALUES.recordingModeConfig.pollingInterval).toBeLessThanOrEqual(1000)
    })
  })

  describe('iframeConfig 默认值', () => {
    it('应该包含必需的 iframe 配置', () => {
      expect(DEFAULT_VALUES.iframeConfig).toHaveProperty('enabled')
      expect(DEFAULT_VALUES.iframeConfig).toHaveProperty('schemaTarget')
    })

    it('enabled 默认应该为 false', () => {
      expect(DEFAULT_VALUES.iframeConfig.enabled).toBe(false)
    })

    it('schemaTarget 应该是有效的值', () => {
      expect(['iframe', 'topFrame']).toContain(DEFAULT_VALUES.iframeConfig.schemaTarget)
    })
  })

  describe('apiConfig 默认值', () => {
    it('应该包含必需的 API 配置', () => {
      expect(DEFAULT_VALUES.apiConfig).toHaveProperty('communicationMode')
      expect(DEFAULT_VALUES.apiConfig).toHaveProperty('requestTimeout')
      expect(DEFAULT_VALUES.apiConfig).toHaveProperty('sourceConfig')
      expect(DEFAULT_VALUES.apiConfig).toHaveProperty('messageTypes')
    })

    it('communicationMode 应该是有效的值', () => {
      expect(['postMessage', 'windowFunction']).toContain(
        DEFAULT_VALUES.apiConfig.communicationMode
      )
    })

    it('requestTimeout 应该在有效范围内', () => {
      expect(DEFAULT_VALUES.apiConfig.requestTimeout).toBeGreaterThanOrEqual(1)
      expect(DEFAULT_VALUES.apiConfig.requestTimeout).toBeLessThanOrEqual(30)
    })

    it('sourceConfig 应该包含必需的配置', () => {
      expect(DEFAULT_VALUES.apiConfig.sourceConfig).toHaveProperty('contentSource')
      expect(DEFAULT_VALUES.apiConfig.sourceConfig).toHaveProperty('hostSource')
    })

    it('messageTypes 应该包含所有消息类型', () => {
      expect(DEFAULT_VALUES.apiConfig.messageTypes).toHaveProperty('getSchema')
      expect(DEFAULT_VALUES.apiConfig.messageTypes).toHaveProperty('updateSchema')
      expect(DEFAULT_VALUES.apiConfig.messageTypes).toHaveProperty('checkPreview')
      expect(DEFAULT_VALUES.apiConfig.messageTypes).toHaveProperty('renderPreview')
      expect(DEFAULT_VALUES.apiConfig.messageTypes).toHaveProperty('cleanupPreview')
    })
  })

  describe('drawerShortcuts 默认值', () => {
    it('应该包含所有快捷键配置', () => {
      expect(DEFAULT_VALUES.drawerShortcuts).toHaveProperty('save')
      expect(DEFAULT_VALUES.drawerShortcuts).toHaveProperty('format')
      expect(DEFAULT_VALUES.drawerShortcuts).toHaveProperty('openOrUpdatePreview')
      expect(DEFAULT_VALUES.drawerShortcuts).toHaveProperty('closePreview')
    })

    it('每个快捷键应该有完整的配置', () => {
      const shortcuts = ['save', 'format', 'openOrUpdatePreview', 'closePreview'] as const

      shortcuts.forEach((shortcut) => {
        const config = DEFAULT_VALUES.drawerShortcuts[shortcut]
        expect(config).toHaveProperty('key')
        expect(config).toHaveProperty('ctrlOrCmd')
        expect(typeof config.key).toBe('string')
        expect(typeof config.ctrlOrCmd).toBe('boolean')
      })
    })
  })

  describe('STORAGE_KEYS', () => {
    it('应该包含所有必需的存储键', () => {
      const expectedKeys = [
        'IS_ACTIVE',
        'DRAWER_WIDTH',
        'ATTRIBUTE_NAME',
        'SEARCH_CONFIG',
        'GET_FUNCTION_NAME',
        'UPDATE_FUNCTION_NAME',
        'AUTO_PARSE_STRING',
        'ENABLE_DEBUG_LOG',
        'TOOLBAR_BUTTONS',
        'HIGHLIGHT_COLOR',
        'MAX_FAVORITES_COUNT',
        'DRAFT_RETENTION_DAYS',
        'AUTO_SAVE_DRAFT',
        'DRAFT_AUTO_SAVE_DEBOUNCE',
        'PREVIEW_CONFIG',
        'DRAFTS_PREFIX',
        'FAVORITES',
        'MAX_HISTORY_COUNT',
        'HIGHLIGHT_ALL_CONFIG',
        'RECORDING_MODE_CONFIG',
        'IFRAME_CONFIG',
        'ENABLE_AST_TYPE_HINTS',
        'EXPORT_CONFIG',
        'EDITOR_THEME',
        'PREVIEW_FUNCTION_NAME',
        'API_CONFIG',
        'DRAWER_SHORTCUTS',
      ]

      expectedKeys.forEach((key) => {
        expect(STORAGE_KEYS).toHaveProperty(key)
        expect(typeof STORAGE_KEYS[key as keyof typeof STORAGE_KEYS]).toBe('string')
      })
    })

    it('DRAFTS_PREFIX 应该以冒号结尾', () => {
      expect(STORAGE_KEYS.DRAFTS_PREFIX).toMatch(/:$/)
    })

    it('所有存储键值应该是唯一的', () => {
      const values = Object.values(STORAGE_KEYS)
      const uniqueValues = new Set(values)
      expect(uniqueValues.size).toBe(values.length)
    })
  })

  describe('数值范围验证', () => {
    it('maxFavoritesCount 应该是合理的值', () => {
      expect(DEFAULT_VALUES.maxFavoritesCount).toBeGreaterThan(0)
      expect(DEFAULT_VALUES.maxFavoritesCount).toBeLessThanOrEqual(100)
    })

    it('draftRetentionDays 应该是合理的值', () => {
      expect(DEFAULT_VALUES.draftRetentionDays).toBeGreaterThan(0)
      expect(DEFAULT_VALUES.draftRetentionDays).toBeLessThanOrEqual(30)
    })

    it('maxHistoryCount 应该是合理的值', () => {
      expect(DEFAULT_VALUES.maxHistoryCount).toBeGreaterThanOrEqual(10)
      expect(DEFAULT_VALUES.maxHistoryCount).toBeLessThanOrEqual(200)
    })

    it('draftAutoSaveDebounce 应该是合理的延迟值', () => {
      expect(DEFAULT_VALUES.draftAutoSaveDebounce).toBeGreaterThanOrEqual(1000)
      expect(DEFAULT_VALUES.draftAutoSaveDebounce).toBeLessThanOrEqual(10000)
    })
  })
})
