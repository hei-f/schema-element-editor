import type { Mock } from 'vitest'
import { storage } from '../browser/storage'

describe('Storage工具测试', () => {
  beforeEach(() => {
    // 清除所有mock调用记录
    vi.clearAllMocks()

    // 重置chrome.storage.local.get的mock返回值
    ;(chrome.storage.local.get as Mock).mockImplementation(() => Promise.resolve({}))
  })

  describe('getActiveState', () => {
    it('应该返回默认值false', async () => {
      const result = await storage.getActiveState()
      expect(result).toBe(false)
    })

    it('应该返回存储的值', async () => {
      ;(chrome.storage.local.get as Mock).mockResolvedValue({ isActive: true })

      const result = await storage.getActiveState()
      expect(result).toBe(true)
    })
  })

  describe('setActiveState', () => {
    it('应该保存激活状态', async () => {
      await storage.setActiveState(true)

      expect(chrome.storage.local.set).toHaveBeenCalledWith({ isActive: true })
    })

    it('应该保存非激活状态', async () => {
      await storage.setActiveState(false)

      expect(chrome.storage.local.set).toHaveBeenCalledWith({ isActive: false })
    })
  })

  describe('getDrawerWidth', () => {
    it('应该返回默认宽度800', async () => {
      const result = await storage.getDrawerWidth()
      expect(result).toBe('800px')
    })

    it('应该返回存储的宽度', async () => {
      ;(chrome.storage.local.get as Mock).mockResolvedValue({ drawerWidth: '1200px' })

      const result = await storage.getDrawerWidth()
      expect(result).toBe('1200px')
    })
  })

  describe('setDrawerWidth', () => {
    it('应该保存抽屉宽度', async () => {
      await storage.setDrawerWidth('1000px')

      expect(chrome.storage.local.set).toHaveBeenCalledWith({ drawerWidth: '1000px' })
    })

    it('应该处理最小宽度', async () => {
      await storage.setDrawerWidth('400px')

      expect(chrome.storage.local.set).toHaveBeenCalledWith({ drawerWidth: '400px' })
    })
  })

  describe('getAttributeName', () => {
    it('应该返回默认属性名id', async () => {
      const result = await storage.getAttributeName()
      expect(result).toBe('id')
    })

    it('应该返回存储的属性名', async () => {
      ;(chrome.storage.local.get as Mock).mockResolvedValue({ attributeName: 'custom-attr' })

      const result = await storage.getAttributeName()
      expect(result).toBe('custom-attr')
    })
  })

  describe('setAttributeName', () => {
    it('应该保存属性名', async () => {
      await storage.setAttributeName('my-schema')

      expect(chrome.storage.local.set).toHaveBeenCalledWith({ attributeName: 'my-schema' })
    })

    it('应该保存kebab-case格式的属性名', async () => {
      await storage.setAttributeName('data-params')

      expect(chrome.storage.local.set).toHaveBeenCalledWith({ attributeName: 'data-params' })
    })
  })

  describe('getAllData', () => {
    it('应该返回所有默认值', async () => {
      const result = await storage.getAllData()

      expect(result).toEqual({
        isActive: false,
        drawerWidth: '800px',
        attributeName: 'id',
        searchConfig: {
          limitUpwardSearch: false,
          searchDepthUp: 5,
          throttleInterval: 16,
        },
        getFunctionName: '__getContentById',
        updateFunctionName: '__updateContentById',
        autoParseString: true,
        enableDebugLog: false,
        enableAstTypeHints: true,
        toolbarButtons: {
          astRawStringToggle: true,
          escape: true,
          deserialize: false,
          serialize: false,
          format: true,
          preview: true,
          importExport: true,
          draft: true,
          favorites: true,
          history: true,
        },
        exportConfig: {
          customFileName: false,
        },
        highlightColor: '#1677FF',
        iframeConfig: {
          enabled: false,
          schemaTarget: 'iframe',
        },
        maxFavoritesCount: 50,
        draftRetentionDays: 1,
        autoSaveDraft: false,
        draftAutoSaveDebounce: 3000,
        previewConfig: {
          previewWidth: 40,
          updateDelay: 500,
          autoUpdate: false,
          zIndex: {
            default: 2147483646,
            preview: 999,
          },
        },
        maxHistoryCount: 50,
        highlightAllConfig: {
          enabled: true,
          keyBinding: 'a',
          maxHighlightCount: 500,
        },
        recordingModeConfig: {
          enabled: true,
          keyBinding: 'r',
          highlightColor: '#FF4D4F',
          pollingInterval: 100,
          autoStopTimeout: null,
        },
        editorTheme: 'schemaEditorDark',
        previewFunctionName: '__getContentPreview',
        apiConfig: {
          communicationMode: 'postMessage',
          requestTimeout: 5,
          sourceConfig: {
            contentSource: 'schema-editor-content',
            hostSource: 'schema-editor-host',
          },
          messageTypes: {
            getSchema: 'GET_SCHEMA',
            updateSchema: 'UPDATE_SCHEMA',
            checkPreview: 'CHECK_PREVIEW',
            renderPreview: 'RENDER_PREVIEW',
            cleanupPreview: 'CLEANUP_PREVIEW',
          },
        },
        drawerShortcuts: {
          save: { key: 's', ctrlOrCmd: false, shift: false, alt: true },
          format: { key: 'f', ctrlOrCmd: false, shift: false, alt: true },
          openOrUpdatePreview: { key: 'p', ctrlOrCmd: false, shift: false, alt: true },
          closePreview: { key: 'p', ctrlOrCmd: false, shift: true, alt: true },
        },
        themeColor: '#1677FF',
      })
    })

    it('应该返回所有存储的值', async () => {
      ;(chrome.storage.local.get as Mock).mockResolvedValue({
        isActive: true,
        drawerWidth: '1000px',
        attributeName: 'custom-attr',
        searchConfig: {
          limitUpwardSearch: true,
          searchDepthUp: 5,
          throttleInterval: 8,
        },
        getFunctionName: 'myGetFn',
        updateFunctionName: 'myUpdateFn',
        autoParseString: true,
      })

      const result = await storage.getAllData()

      expect(result).toEqual({
        isActive: true,
        drawerWidth: '1000px',
        attributeName: 'custom-attr',
        searchConfig: {
          limitUpwardSearch: true,
          searchDepthUp: 5,
          throttleInterval: 8,
        },
        getFunctionName: 'myGetFn',
        updateFunctionName: 'myUpdateFn',
        autoParseString: true,
        enableDebugLog: false,
        enableAstTypeHints: true,
        toolbarButtons: {
          astRawStringToggle: true,
          escape: true,
          deserialize: false,
          serialize: false,
          format: true,
          preview: true,
          importExport: true,
          draft: true,
          favorites: true,
          history: true,
        },
        exportConfig: {
          customFileName: false,
        },
        highlightColor: '#1677FF',
        iframeConfig: {
          enabled: false,
          schemaTarget: 'iframe',
        },
        maxFavoritesCount: 50,
        draftRetentionDays: 1,
        autoSaveDraft: false,
        draftAutoSaveDebounce: 3000,
        previewConfig: {
          previewWidth: 40,
          updateDelay: 500,
          autoUpdate: false,
          zIndex: {
            default: 2147483646,
            preview: 999,
          },
        },
        maxHistoryCount: 50,
        highlightAllConfig: {
          enabled: true,
          keyBinding: 'a',
          maxHighlightCount: 500,
        },
        recordingModeConfig: {
          enabled: true,
          keyBinding: 'r',
          highlightColor: '#FF4D4F',
          pollingInterval: 100,
          autoStopTimeout: null,
        },
        editorTheme: 'schemaEditorDark',
        previewFunctionName: '__getContentPreview',
        apiConfig: {
          communicationMode: 'postMessage',
          requestTimeout: 5,
          sourceConfig: {
            contentSource: 'schema-editor-content',
            hostSource: 'schema-editor-host',
          },
          messageTypes: {
            getSchema: 'GET_SCHEMA',
            updateSchema: 'UPDATE_SCHEMA',
            checkPreview: 'CHECK_PREVIEW',
            renderPreview: 'RENDER_PREVIEW',
            cleanupPreview: 'CLEANUP_PREVIEW',
          },
        },
        drawerShortcuts: {
          save: { key: 's', ctrlOrCmd: false, shift: false, alt: true },
          format: { key: 'f', ctrlOrCmd: false, shift: false, alt: true },
          openOrUpdatePreview: { key: 'p', ctrlOrCmd: false, shift: false, alt: true },
          closePreview: { key: 'p', ctrlOrCmd: false, shift: true, alt: true },
        },
        themeColor: '#1677FF',
      })
    })

    it('应该合并默认值和存储值', async () => {
      ;(chrome.storage.local.get as Mock).mockResolvedValue({
        isActive: true,
      })

      const result = await storage.getAllData()

      expect(result).toEqual({
        isActive: true,
        drawerWidth: '800px',
        attributeName: 'id',
        searchConfig: {
          limitUpwardSearch: false,
          searchDepthUp: 5,
          throttleInterval: 16,
        },
        getFunctionName: '__getContentById',
        updateFunctionName: '__updateContentById',
        autoParseString: true,
        enableDebugLog: false,
        enableAstTypeHints: true,
        toolbarButtons: {
          astRawStringToggle: true,
          escape: true,
          deserialize: false,
          serialize: false,
          format: true,
          preview: true,
          importExport: true,
          draft: true,
          favorites: true,
          history: true,
        },
        exportConfig: {
          customFileName: false,
        },
        highlightColor: '#1677FF',
        iframeConfig: {
          enabled: false,
          schemaTarget: 'iframe',
        },
        maxFavoritesCount: 50,
        draftRetentionDays: 1,
        autoSaveDraft: false,
        draftAutoSaveDebounce: 3000,
        previewConfig: {
          previewWidth: 40,
          updateDelay: 500,
          autoUpdate: false,
          zIndex: {
            default: 2147483646,
            preview: 999,
          },
        },
        maxHistoryCount: 50,
        highlightAllConfig: {
          enabled: true,
          keyBinding: 'a',
          maxHighlightCount: 500,
        },
        recordingModeConfig: {
          enabled: true,
          keyBinding: 'r',
          highlightColor: '#FF4D4F',
          pollingInterval: 100,
          autoStopTimeout: null,
        },
        editorTheme: 'schemaEditorDark',
        previewFunctionName: '__getContentPreview',
        apiConfig: {
          communicationMode: 'postMessage',
          requestTimeout: 5,
          sourceConfig: {
            contentSource: 'schema-editor-content',
            hostSource: 'schema-editor-host',
          },
          messageTypes: {
            getSchema: 'GET_SCHEMA',
            updateSchema: 'UPDATE_SCHEMA',
            checkPreview: 'CHECK_PREVIEW',
            renderPreview: 'RENDER_PREVIEW',
            cleanupPreview: 'CLEANUP_PREVIEW',
          },
        },
        drawerShortcuts: {
          save: { key: 's', ctrlOrCmd: false, shift: false, alt: true },
          format: { key: 'f', ctrlOrCmd: false, shift: false, alt: true },
          openOrUpdatePreview: { key: 'p', ctrlOrCmd: false, shift: false, alt: true },
          closePreview: { key: 'p', ctrlOrCmd: false, shift: true, alt: true },
        },
        themeColor: '#1677FF',
      })
    })
  })

  describe('getSearchConfig', () => {
    it('应该返回默认搜索配置', async () => {
      const result = await storage.getSearchConfig()

      expect(result).toEqual({
        limitUpwardSearch: false,
        searchDepthUp: 5,
        throttleInterval: 16,
      })
    })

    it('应该返回存储的搜索配置', async () => {
      ;(chrome.storage.local.get as Mock).mockResolvedValue({
        searchConfig: {
          limitUpwardSearch: true,
          searchDepthUp: 10,
          throttleInterval: 32,
        },
      })

      const result = await storage.getSearchConfig()

      expect(result).toEqual({
        limitUpwardSearch: true,
        searchDepthUp: 10,
        throttleInterval: 32,
      })
    })

    it('应该处理部分存储的配置', async () => {
      ;(chrome.storage.local.get as Mock).mockResolvedValue({
        searchConfig: {
          searchDepthUp: 8,
        },
      })

      const result = await storage.getSearchConfig()

      // 应该返回存储的值，因为我们存储的是整个对象
      expect(result.searchDepthUp).toBe(8)
    })
  })

  describe('setSearchConfig', () => {
    it('应该保存完整的搜索配置', async () => {
      ;(chrome.storage.local.get as Mock).mockResolvedValue({
        searchConfig: {
          limitUpwardSearch: false,
          searchDepthUp: 0,
          throttleInterval: 100,
        },
      })

      await storage.setSearchConfig({
        limitUpwardSearch: true,
        searchDepthUp: 5,
        throttleInterval: 32,
      })

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        searchConfig: {
          limitUpwardSearch: true,
          searchDepthUp: 5,
          throttleInterval: 32,
        },
      })
    })

    it('应该支持部分更新搜索配置', async () => {
      ;(chrome.storage.local.get as Mock).mockResolvedValue({
        searchConfig: {
          limitUpwardSearch: false,
          searchDepthUp: 0,
          throttleInterval: 100,
        },
      })

      await storage.setSearchConfig({
        searchDepthUp: 8,
      })

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        searchConfig: {
          limitUpwardSearch: false,
          searchDepthUp: 8,
          throttleInterval: 100,
        },
      })
    })

    it('应该保存throttleInterval的变更', async () => {
      ;(chrome.storage.local.get as Mock).mockResolvedValue({
        searchConfig: {
          limitUpwardSearch: false,
          searchDepthUp: 5,
          throttleInterval: 100,
        },
      })

      await storage.setSearchConfig({
        throttleInterval: 50,
      })

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        searchConfig: {
          limitUpwardSearch: false,
          searchDepthUp: 5,
          throttleInterval: 50,
        },
      })
    })
  })

  describe('getGetFunctionName', () => {
    it('应该返回默认函数名', async () => {
      const result = await storage.getGetFunctionName()
      expect(result).toBe('__getContentById')
    })

    it('应该返回存储的函数名', async () => {
      ;(chrome.storage.local.get as Mock).mockResolvedValue({
        getFunctionName: 'customGetFunction',
      })

      const result = await storage.getGetFunctionName()
      expect(result).toBe('customGetFunction')
    })
  })

  describe('getUpdateFunctionName', () => {
    it('应该返回默认函数名', async () => {
      const result = await storage.getUpdateFunctionName()
      expect(result).toBe('__updateContentById')
    })

    it('应该返回存储的函数名', async () => {
      ;(chrome.storage.local.get as Mock).mockResolvedValue({
        updateFunctionName: 'customUpdateFunction',
      })

      const result = await storage.getUpdateFunctionName()
      expect(result).toBe('customUpdateFunction')
    })
  })

  describe('setFunctionNames', () => {
    it('应该保存三个函数名', async () => {
      await storage.setFunctionNames('myGetFn', 'myUpdateFn', 'myPreviewFn')

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        getFunctionName: 'myGetFn',
        updateFunctionName: 'myUpdateFn',
        previewFunctionName: 'myPreviewFn',
      })
    })
  })

  describe('getAllData', () => {
    it('应该返回包含函数名的所有数据', async () => {
      ;(chrome.storage.local.get as Mock).mockImplementation((keys) => {
        const mockData: any = {
          isActive: true,
          drawerWidth: '1000px',
          attributeName: 'test-params',
          searchConfig: {
            limitUpwardSearch: false,
            searchDepthUp: 2,
            throttleInterval: 20,
          },
          getFunctionName: 'getMySchema',
          updateFunctionName: 'updateMySchema',
        }

        if (Array.isArray(keys)) {
          return Promise.resolve(
            keys.reduce((acc, key) => {
              acc[key] = mockData[key]
              return acc
            }, {} as any)
          )
        }
        return Promise.resolve({ [keys]: mockData[keys] })
      })

      const result = await storage.getAllData()

      expect(result).toEqual({
        isActive: true,
        drawerWidth: '1000px',
        attributeName: 'test-params',
        searchConfig: {
          limitUpwardSearch: false,
          searchDepthUp: 2,
          throttleInterval: 20,
        },
        getFunctionName: 'getMySchema',
        updateFunctionName: 'updateMySchema',
        autoParseString: true,
        enableDebugLog: false,
        enableAstTypeHints: true,
        toolbarButtons: {
          astRawStringToggle: true,
          escape: true,
          deserialize: false,
          serialize: false,
          format: true,
          preview: true,
          importExport: true,
          draft: true,
          favorites: true,
          history: true,
        },
        exportConfig: {
          customFileName: false,
        },
        highlightColor: '#1677FF',
        iframeConfig: {
          enabled: false,
          schemaTarget: 'iframe',
        },
        maxFavoritesCount: 50,
        draftRetentionDays: 1,
        autoSaveDraft: false,
        draftAutoSaveDebounce: 3000,
        previewConfig: {
          previewWidth: 40,
          updateDelay: 500,
          autoUpdate: false,
          zIndex: {
            default: 2147483646,
            preview: 999,
          },
        },
        maxHistoryCount: 50,
        highlightAllConfig: {
          enabled: true,
          keyBinding: 'a',
          maxHighlightCount: 500,
        },
        recordingModeConfig: {
          enabled: true,
          keyBinding: 'r',
          highlightColor: '#FF4D4F',
          pollingInterval: 100,
          autoStopTimeout: null,
        },
        editorTheme: 'schemaEditorDark',
        previewFunctionName: '__getContentPreview',
        apiConfig: {
          communicationMode: 'postMessage',
          requestTimeout: 5,
          sourceConfig: {
            contentSource: 'schema-editor-content',
            hostSource: 'schema-editor-host',
          },
          messageTypes: {
            getSchema: 'GET_SCHEMA',
            updateSchema: 'UPDATE_SCHEMA',
            checkPreview: 'CHECK_PREVIEW',
            renderPreview: 'RENDER_PREVIEW',
            cleanupPreview: 'CLEANUP_PREVIEW',
          },
        },
        drawerShortcuts: {
          save: { key: 's', ctrlOrCmd: false, shift: false, alt: true },
          format: { key: 'f', ctrlOrCmd: false, shift: false, alt: true },
          openOrUpdatePreview: { key: 'p', ctrlOrCmd: false, shift: false, alt: true },
          closePreview: { key: 'p', ctrlOrCmd: false, shift: true, alt: true },
        },
        themeColor: '#1677FF',
      })
    })
  })

  describe('getAutoParseString', () => {
    it('应该返回默认值true', async () => {
      const result = await storage.getAutoParseString()
      expect(result).toBe(true)
    })

    it('应该返回存储的值', async () => {
      ;(chrome.storage.local.get as Mock).mockResolvedValue({
        autoParseString: false,
      })

      const result = await storage.getAutoParseString()
      expect(result).toBe(false)
    })
  })

  describe('setAutoParseString', () => {
    it('应该保存字符串自动解析配置', async () => {
      await storage.setAutoParseString(false)

      expect(chrome.storage.local.set).toHaveBeenCalledWith({ autoParseString: false })
    })

    it('应该能够开启字符串自动解析', async () => {
      await storage.setAutoParseString(true)

      expect(chrome.storage.local.set).toHaveBeenCalledWith({ autoParseString: true })
    })
  })

  describe('工具栏按钮配置', () => {
    it('应该返回默认的工具栏按钮配置', async () => {
      const result = await storage.getToolbarButtons()

      expect(result).toEqual({
        astRawStringToggle: true,
        escape: true,
        deserialize: false,
        serialize: false,
        format: true,
        preview: true,
        importExport: true,
        draft: true,
        favorites: true,
        history: true,
      })
    })

    it('应该返回存储的工具栏按钮配置', async () => {
      ;(chrome.storage.local.get as Mock).mockResolvedValue({
        toolbarButtons: {
          astRawStringToggle: false,
          deserialize: true,
          serialize: true,
          format: true,
        },
      })

      const result = await storage.getToolbarButtons()

      expect(result.astRawStringToggle).toBe(false)
    })

    it('应该保存工具栏按钮配置', async () => {
      ;(chrome.storage.local.get as Mock).mockResolvedValue({
        toolbarButtons: {
          astRawStringToggle: true,
          escape: true,
          deserialize: true,
          serialize: true,
          format: true,
          preview: true,
          importExport: true,
          draft: true,
          favorites: true,
          history: true,
        },
      })

      await storage.setToolbarButtons({
        astRawStringToggle: false,
      })

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        toolbarButtons: {
          astRawStringToggle: false,
          escape: true,
          deserialize: true,
          serialize: true,
          format: true,
          preview: true,
          importExport: true,
          draft: true,
          favorites: true,
          history: true,
        },
      })
    })
  })

  describe('高亮框颜色', () => {
    it('应该返回默认颜色', async () => {
      const result = await storage.getHighlightColor()
      expect(result).toBe('#1677FF')
    })

    it('应该返回存储的颜色', async () => {
      ;(chrome.storage.local.get as Mock).mockResolvedValue({
        highlightColor: '#FF0000',
      })

      const result = await storage.getHighlightColor()
      expect(result).toBe('#FF0000')
    })

    it('应该保存高亮框颜色', async () => {
      await storage.setHighlightColor('#00FF00')

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        highlightColor: '#00FF00',
      })
    })
  })

  describe('收藏配置', () => {
    it('应该返回默认的最大收藏数量', async () => {
      const result = await storage.getMaxFavoritesCount()
      expect(result).toBe(50)
    })

    it('应该返回存储的最大收藏数量', async () => {
      ;(chrome.storage.local.get as Mock).mockResolvedValue({
        maxFavoritesCount: 100,
      })

      const result = await storage.getMaxFavoritesCount()
      expect(result).toBe(100)
    })

    it('应该保存最大收藏数量', async () => {
      await storage.setMaxFavoritesCount(80)

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        maxFavoritesCount: 80,
      })
    })
  })

  describe('草稿配置', () => {
    it('应该返回默认的草稿保留天数', async () => {
      const result = await storage.getDraftRetentionDays()
      expect(result).toBe(1)
    })

    it('应该返回存储的草稿保留天数', async () => {
      ;(chrome.storage.local.get as Mock).mockResolvedValue({
        draftRetentionDays: 14,
      })

      const result = await storage.getDraftRetentionDays()
      expect(result).toBe(14)
    })

    it('应该保存草稿保留天数', async () => {
      await storage.setDraftRetentionDays(30)

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        draftRetentionDays: 30,
      })
    })

    it('应该返回默认的自动保存草稿配置', async () => {
      const result = await storage.getAutoSaveDraft()
      expect(result).toBe(false)
    })

    it('应该返回存储的自动保存草稿配置', async () => {
      ;(chrome.storage.local.get as Mock).mockResolvedValue({
        autoSaveDraft: false,
      })

      const result = await storage.getAutoSaveDraft()
      expect(result).toBe(false)
    })

    it('应该保存自动保存草稿配置', async () => {
      await storage.setAutoSaveDraft(false)

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        autoSaveDraft: false,
      })
    })

    it('应该返回默认的草稿自动保存防抖时间', async () => {
      const result = await storage.getDraftAutoSaveDebounce()
      expect(result).toBe(3000)
    })

    it('应该返回存储的草稿自动保存防抖时间', async () => {
      ;(chrome.storage.local.get as Mock).mockResolvedValue({
        draftAutoSaveDebounce: 5000,
      })

      const result = await storage.getDraftAutoSaveDebounce()
      expect(result).toBe(5000)
    })

    it('应该保存草稿自动保存防抖时间', async () => {
      await storage.setDraftAutoSaveDebounce(2000)

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        draftAutoSaveDebounce: 2000,
      })
    })
  })

  describe('草稿操作', () => {
    it('应该获取草稿', async () => {
      const mockDraft = {
        content: 'test content',
        timestamp: Date.now(),
      }
      ;(chrome.storage.local.get as Mock).mockResolvedValue({
        'draft:test-key': mockDraft,
      })

      const result = await storage.getDraft('test-key')

      expect(result).toEqual(mockDraft)
    })

    it('草稿不存在时应该返回null', async () => {
      const result = await storage.getDraft('non-existent')

      expect(result).toBeNull()
    })

    it('应该保存草稿', async () => {
      await storage.saveDraft('test-key', 'test content')

      expect(chrome.storage.local.set).toHaveBeenCalled()
    })

    it('应该删除草稿', async () => {
      await storage.deleteDraft('test-key')

      expect(chrome.storage.local.remove).toHaveBeenCalledWith('draft:test-key')
    })
  })

  describe('收藏操作', () => {
    it('应该获取收藏列表', async () => {
      const mockFavorites = [
        {
          id: 'fav_1',
          name: 'Test',
          content: 'content',
          timestamp: Date.now(),
          lastUsedTime: Date.now(),
        },
      ]
      ;(chrome.storage.local.get as Mock).mockResolvedValue({
        favorites: mockFavorites,
      })

      const result = await storage.getFavorites()

      expect(result).toEqual(mockFavorites)
    })

    it('收藏列表不存在时应该返回空数组', async () => {
      const result = await storage.getFavorites()

      expect(result).toEqual([])
    })
  })

  describe('错误处理', () => {
    it('get操作失败时应该返回默认值', async () => {
      ;(chrome.storage.local.get as Mock).mockRejectedValue(new Error('Storage error'))

      const result = await storage.getActiveState()
      expect(result).toBe(false)
    })

    it('getFunctionName失败时应该返回默认值', async () => {
      ;(chrome.storage.local.get as Mock).mockRejectedValue(new Error('Storage error'))

      const result = await storage.getGetFunctionName()
      expect(result).toBe('__getContentById')
    })

    it('set操作失败时不应该抛出错误', async () => {
      ;(chrome.storage.local.set as Mock).mockRejectedValue(new Error('Storage error'))

      // setActiveState内部捕获了错误，不会抛出
      await expect(storage.setActiveState(true)).resolves.not.toThrow()
    })

    it('setFunctionNames失败时不应该抛出错误', async () => {
      ;(chrome.storage.local.set as Mock).mockRejectedValue(new Error('Storage error'))

      await expect(storage.setFunctionNames('fn1', 'fn2', 'fn3')).resolves.not.toThrow()
    })

    it('getToolbarButtons失败时应该返回默认值', async () => {
      ;(chrome.storage.local.get as Mock).mockRejectedValue(new Error('Storage error'))

      const result = await storage.getToolbarButtons()
      expect(result).toEqual({
        astRawStringToggle: true,
        escape: true,
        deserialize: false,
        serialize: false,
        format: true,
        preview: true,
        importExport: true,
        draft: true,
        favorites: true,
        history: true,
      })
    })

    it('getFavorites失败时应该返回空数组', async () => {
      ;(chrome.storage.local.get as Mock).mockRejectedValue(new Error('Storage error'))

      const result = await storage.getFavorites()
      expect(result).toEqual([])
    })

    it('getDraft失败时应该返回null', async () => {
      ;(chrome.storage.local.get as Mock).mockRejectedValue(new Error('Storage error'))

      const result = await storage.getDraft('test-key')
      expect(result).toBeNull()
    })
  })

  describe('未覆盖方法补充测试', () => {
    beforeEach(() => {
      ;(chrome.storage.local.get as Mock).mockResolvedValue({})
      ;(chrome.storage.local.set as Mock).mockResolvedValue(undefined)
    })

    it('toggleActiveState应该切换激活状态', async () => {
      // 初始状态为false
      ;(chrome.storage.local.get as Mock).mockResolvedValueOnce({
        isActive: false,
      })

      const newState = await storage.toggleActiveState()

      expect(newState).toBe(true)
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        isActive: true,
      })
    })

    it('toggleActiveState应该从true切换到false', async () => {
      ;(chrome.storage.local.get as Mock).mockResolvedValueOnce({
        isActive: true,
      })

      const newState = await storage.toggleActiveState()

      expect(newState).toBe(false)
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        isActive: false,
      })
    })

    it('setDrawerWidth应该设置抽屉宽度', async () => {
      await storage.setDrawerWidth('500px')

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        drawerWidth: '500px',
      })
    })

    it('setDrawerWidth应该保存带px后缀的宽度', async () => {
      await storage.setDrawerWidth('600px')

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        drawerWidth: '600px',
      })
    })

    it('setDrawerWidth应该保存百分比宽度', async () => {
      await storage.setDrawerWidth('50%')

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        drawerWidth: '50%',
      })
    })

    it('setSearchConfig应该合并现有配置', async () => {
      const existingConfig = {
        limitUpwardSearch: false,
        searchDepthUp: 3,
        throttleInterval: 200,
      }

      ;(chrome.storage.local.get as Mock).mockResolvedValueOnce({
        searchConfig: existingConfig,
      })

      await storage.setSearchConfig({ searchDepthUp: 10 })

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        searchConfig: {
          ...existingConfig,
          searchDepthUp: 10,
        },
      })
    })

    it('setSearchConfig失败时应该捕获错误', async () => {
      ;(chrome.storage.local.get as Mock).mockResolvedValue({})
      ;(chrome.storage.local.set as Mock).mockRejectedValue(new Error('Set error'))

      await expect(storage.setSearchConfig({ searchDepthUp: 10 })).resolves.not.toThrow()
    })

    it('setAttributeName应该设置属性名', async () => {
      await storage.setAttributeName('custom-attr')

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        attributeName: 'custom-attr',
      })
    })

    it('setFunctionNames应该同时设置三个函数名', async () => {
      await storage.setFunctionNames('getFunc', 'updateFunc', 'previewFunc')

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        getFunctionName: 'getFunc',
        updateFunctionName: 'updateFunc',
        previewFunctionName: 'previewFunc',
      })
    })

    it('getAutoParseString应该返回配置值', async () => {
      ;(chrome.storage.local.get as Mock).mockResolvedValue({
        autoParseString: true,
      })

      const result = await storage.getAutoParseString()
      expect(result).toBe(true)
    })

    it('setAutoParseString应该设置配置', async () => {
      await storage.setAutoParseString(false)

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        autoParseString: false,
      })
    })

    it('getEnableDebugLog应该返回配置值', async () => {
      ;(chrome.storage.local.get as Mock).mockResolvedValue({
        enableDebugLog: true,
      })

      const result = await storage.getEnableDebugLog()
      expect(result).toBe(true)
    })

    it('setEnableDebugLog应该设置配置', async () => {
      await storage.setEnableDebugLog(true)

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        enableDebugLog: true,
      })
    })

    it('getHighlightColor应该返回颜色值', async () => {
      ;(chrome.storage.local.get as Mock).mockResolvedValue({
        highlightColor: '#FF5733',
      })

      const result = await storage.getHighlightColor()
      expect(result).toBe('#FF5733')
    })

    it('getHighlightColor应该使用validator验证颜色值', async () => {
      // 返回无效的空字符串
      ;(chrome.storage.local.get as Mock).mockResolvedValue({
        highlightColor: '',
      })

      const result = await storage.getHighlightColor()
      // 应该返回默认值
      expect(result).toBe('#1677FF')
    })

    it('setHighlightColor应该设置颜色', async () => {
      await storage.setHighlightColor('#00FF00')

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        highlightColor: '#00FF00',
      })
    })

    it('getMaxFavoritesCount应该返回数量', async () => {
      ;(chrome.storage.local.get as Mock).mockResolvedValue({
        maxFavoritesCount: 100,
      })

      const result = await storage.getMaxFavoritesCount()
      expect(result).toBe(100)
    })

    it('setMaxFavoritesCount应该设置数量', async () => {
      await storage.setMaxFavoritesCount(200)

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        maxFavoritesCount: 200,
      })
    })

    it('getDraftRetentionDays应该返回天数', async () => {
      ;(chrome.storage.local.get as Mock).mockResolvedValue({
        draftRetentionDays: 14,
      })

      const result = await storage.getDraftRetentionDays()
      expect(result).toBe(14)
    })

    it('setDraftRetentionDays应该设置天数', async () => {
      await storage.setDraftRetentionDays(30)

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        draftRetentionDays: 30,
      })
    })

    it('getAutoSaveDraft应该返回配置', async () => {
      ;(chrome.storage.local.get as Mock).mockResolvedValue({
        autoSaveDraft: true,
      })

      const result = await storage.getAutoSaveDraft()
      expect(result).toBe(true)
    })

    it('setAutoSaveDraft应该设置配置', async () => {
      await storage.setAutoSaveDraft(false)

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        autoSaveDraft: false,
      })
    })

    it('getMaxHistoryCount应该返回数量', async () => {
      ;(chrome.storage.local.get as Mock).mockResolvedValue({
        maxHistoryCount: 100,
      })

      const result = await storage.getMaxHistoryCount()
      expect(result).toBe(100)
    })

    it('setMaxHistoryCount应该设置数量', async () => {
      await storage.setMaxHistoryCount(150)

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        maxHistoryCount: 150,
      })
    })

    it('deleteDraft应该删除指定草稿', async () => {
      await storage.deleteDraft('test-params')

      expect(chrome.storage.local.remove).toHaveBeenCalledWith('draft:test-params')
    })

    it('deleteDraft失败时应该捕获错误', async () => {
      ;(chrome.storage.local.remove as Mock).mockRejectedValue(new Error('Remove error'))

      await expect(storage.deleteDraft('test-key')).resolves.not.toThrow()
    })
  })

  describe('高亮所有元素配置', () => {
    it('getHighlightAllConfig应该返回默认配置', async () => {
      const result = await storage.getHighlightAllConfig()

      expect(result).toEqual({
        enabled: true,
        keyBinding: 'a',
        maxHighlightCount: 500,
      })
    })

    it('getHighlightAllConfig应该返回存储的配置', async () => {
      ;(chrome.storage.local.get as Mock).mockResolvedValue({
        highlightAllConfig: {
          enabled: false,
          keyBinding: 'h',
          maxHighlightCount: 300,
        },
      })

      const result = await storage.getHighlightAllConfig()
      expect(result).toEqual({
        enabled: false,
        keyBinding: 'h',
        maxHighlightCount: 300,
      })
    })

    it('getHighlightAllConfig应该合并存储的配置', async () => {
      // 存储配置会被直接合并，不再进行验证
      ;(chrome.storage.local.get as Mock).mockResolvedValue({
        highlightAllConfig: {
          enabled: true,
          keyBinding: 'ab',
          maxHighlightCount: 500,
        },
      })

      const result = await storage.getHighlightAllConfig()
      // 应该返回合并后的存储值
      expect(result).toEqual({
        enabled: true,
        keyBinding: 'ab',
        maxHighlightCount: 500,
      })
    })

    it('getHighlightAllConfig应该返回存储的keyBinding值', async () => {
      // 存储配置会被直接合并
      ;(chrome.storage.local.get as Mock).mockResolvedValue({
        highlightAllConfig: {
          enabled: true,
          keyBinding: '@',
          maxHighlightCount: 500,
        },
      })

      const result = await storage.getHighlightAllConfig()
      // 应该返回存储的值
      expect(result).toEqual({
        enabled: true,
        keyBinding: '@',
        maxHighlightCount: 500,
      })
    })

    it('getHighlightAllConfig应该接受大写字母', async () => {
      // 大写字母是有效的
      ;(chrome.storage.local.get as Mock).mockResolvedValue({
        highlightAllConfig: {
          enabled: true,
          keyBinding: 'H',
          maxHighlightCount: 300,
        },
      })

      const result = await storage.getHighlightAllConfig()
      // 应该接受大写字母
      expect(result).toEqual({
        enabled: true,
        keyBinding: 'H',
        maxHighlightCount: 300,
      })
    })

    it('getHighlightAllConfig应该接受数字', async () => {
      // 数字是有效的
      ;(chrome.storage.local.get as Mock).mockResolvedValue({
        highlightAllConfig: {
          enabled: true,
          keyBinding: '1',
          maxHighlightCount: 400,
        },
      })

      const result = await storage.getHighlightAllConfig()
      // 应该接受数字
      expect(result).toEqual({
        enabled: true,
        keyBinding: '1',
        maxHighlightCount: 400,
      })
    })

    it('getHighlightAllConfig应该返回存储的maxHighlightCount值', async () => {
      // 存储配置会被直接合并
      ;(chrome.storage.local.get as Mock).mockResolvedValue({
        highlightAllConfig: {
          enabled: true,
          keyBinding: 'a',
          maxHighlightCount: 50,
        },
      })

      const result = await storage.getHighlightAllConfig()
      // 应该返回存储的值
      expect(result).toEqual({
        enabled: true,
        keyBinding: 'a',
        maxHighlightCount: 50,
      })
    })

    it('getHighlightAllConfig应该返回较大的maxHighlightCount值', async () => {
      // 存储配置会被直接合并
      ;(chrome.storage.local.get as Mock).mockResolvedValue({
        highlightAllConfig: {
          enabled: true,
          keyBinding: 'a',
          maxHighlightCount: 1500,
        },
      })

      const result = await storage.getHighlightAllConfig()
      // 应该返回存储的值
      expect(result).toEqual({
        enabled: true,
        keyBinding: 'a',
        maxHighlightCount: 1500,
      })
    })

    it('setHighlightAllConfig应该设置配置', async () => {
      const config = {
        enabled: false,
        keyBinding: 'h',
        maxHighlightCount: 300,
      }

      await storage.setHighlightAllConfig(config)

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        highlightAllConfig: config,
      })
    })

    it('setHighlightAllConfig应该接受边界值', async () => {
      const config = {
        enabled: true,
        keyBinding: 'z',
        maxHighlightCount: 100, // 最小值
      }

      await storage.setHighlightAllConfig(config)

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        highlightAllConfig: config,
      })
    })

    it('setHighlightAllConfig应该接受最大边界值', async () => {
      const config = {
        enabled: true,
        keyBinding: 'a',
        maxHighlightCount: 1000, // 最大值
      }

      await storage.setHighlightAllConfig(config)

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        highlightAllConfig: config,
      })
    })
  })

  describe('API 配置', () => {
    it('getApiConfig应该返回默认配置', async () => {
      const result = await storage.getApiConfig()

      expect(result).toEqual({
        communicationMode: 'postMessage',
        requestTimeout: 5,
        sourceConfig: {
          contentSource: 'schema-editor-content',
          hostSource: 'schema-editor-host',
        },
        messageTypes: {
          getSchema: 'GET_SCHEMA',
          updateSchema: 'UPDATE_SCHEMA',
          checkPreview: 'CHECK_PREVIEW',
          renderPreview: 'RENDER_PREVIEW',
          cleanupPreview: 'CLEANUP_PREVIEW',
        },
      })
    })

    it('getApiConfig应该返回存储的配置', async () => {
      ;(chrome.storage.local.get as Mock).mockResolvedValue({
        apiConfig: {
          communicationMode: 'windowFunction',
          requestTimeout: 10,
        },
      })

      const result = await storage.getApiConfig()
      expect(result).toEqual({
        communicationMode: 'windowFunction',
        requestTimeout: 10,
        sourceConfig: {
          contentSource: 'schema-editor-content',
          hostSource: 'schema-editor-host',
        },
        messageTypes: {
          getSchema: 'GET_SCHEMA',
          updateSchema: 'UPDATE_SCHEMA',
          checkPreview: 'CHECK_PREVIEW',
          renderPreview: 'RENDER_PREVIEW',
          cleanupPreview: 'CLEANUP_PREVIEW',
        },
      })
    })

    it('getApiConfig应该返回存储的communicationMode值', async () => {
      // 存储配置会被直接合并
      ;(chrome.storage.local.get as Mock).mockResolvedValue({
        apiConfig: {
          communicationMode: 'invalidMode',
          requestTimeout: 5,
        },
      })

      const result = await storage.getApiConfig()
      // 应该返回合并后的存储值
      expect(result).toEqual({
        communicationMode: 'invalidMode',
        requestTimeout: 5,
        sourceConfig: {
          contentSource: 'schema-editor-content',
          hostSource: 'schema-editor-host',
        },
        messageTypes: {
          getSchema: 'GET_SCHEMA',
          updateSchema: 'UPDATE_SCHEMA',
          checkPreview: 'CHECK_PREVIEW',
          renderPreview: 'RENDER_PREVIEW',
          cleanupPreview: 'CLEANUP_PREVIEW',
        },
      })
    })

    it('getApiConfig应该返回存储的requestTimeout值（小值）', async () => {
      ;(chrome.storage.local.get as Mock).mockResolvedValue({
        apiConfig: {
          communicationMode: 'postMessage',
          requestTimeout: 0,
        },
      })

      const result = await storage.getApiConfig()
      // 应该返回存储的值
      expect(result.requestTimeout).toBe(0)
    })

    it('getApiConfig应该返回存储的requestTimeout值（大值）', async () => {
      ;(chrome.storage.local.get as Mock).mockResolvedValue({
        apiConfig: {
          communicationMode: 'postMessage',
          requestTimeout: 60,
        },
      })

      const result = await storage.getApiConfig()
      // 应该返回存储的值
      expect(result.requestTimeout).toBe(60)
    })

    it('getApiConfig应该接受有效的边界值', async () => {
      ;(chrome.storage.local.get as Mock).mockResolvedValue({
        apiConfig: {
          communicationMode: 'postMessage',
          requestTimeout: 1, // 最小值
        },
      })

      const result = await storage.getApiConfig()
      expect(result).toEqual({
        communicationMode: 'postMessage',
        requestTimeout: 1,
        sourceConfig: {
          contentSource: 'schema-editor-content',
          hostSource: 'schema-editor-host',
        },
        messageTypes: {
          getSchema: 'GET_SCHEMA',
          updateSchema: 'UPDATE_SCHEMA',
          checkPreview: 'CHECK_PREVIEW',
          renderPreview: 'RENDER_PREVIEW',
          cleanupPreview: 'CLEANUP_PREVIEW',
        },
      })
    })

    it('getApiConfig应该接受最大超时值', async () => {
      ;(chrome.storage.local.get as Mock).mockResolvedValue({
        apiConfig: {
          communicationMode: 'postMessage',
          requestTimeout: 30, // 最大值
        },
      })

      const result = await storage.getApiConfig()
      expect(result.requestTimeout).toBe(30)
    })

    it('getApiConfig应该接受windowFunction模式', async () => {
      ;(chrome.storage.local.get as Mock).mockResolvedValue({
        apiConfig: {
          communicationMode: 'windowFunction',
          requestTimeout: 5,
        },
      })

      const result = await storage.getApiConfig()
      expect(result.communicationMode).toBe('windowFunction')
    })

    it('setApiConfig应该设置配置', async () => {
      const config = {
        communicationMode: 'windowFunction' as const,
        requestTimeout: 10,
        sourceConfig: {
          contentSource: 'schema-editor-content',
          hostSource: 'schema-editor-host',
        },
        messageTypes: {
          getSchema: 'GET_SCHEMA',
          updateSchema: 'UPDATE_SCHEMA',
          checkPreview: 'CHECK_PREVIEW',
          renderPreview: 'RENDER_PREVIEW',
          cleanupPreview: 'CLEANUP_PREVIEW',
        },
      }

      await storage.setApiConfig(config)

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        apiConfig: config,
      })
    })

    it('setApiConfig应该保存postMessage模式配置', async () => {
      const config = {
        communicationMode: 'postMessage' as const,
        requestTimeout: 15,
        sourceConfig: {
          contentSource: 'schema-editor-content',
          hostSource: 'schema-editor-host',
        },
        messageTypes: {
          getSchema: 'GET_SCHEMA',
          updateSchema: 'UPDATE_SCHEMA',
          checkPreview: 'CHECK_PREVIEW',
          renderPreview: 'RENDER_PREVIEW',
          cleanupPreview: 'CLEANUP_PREVIEW',
        },
      }

      await storage.setApiConfig(config)

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        apiConfig: config,
      })
    })

    it('getApiConfig失败时应该返回默认值', async () => {
      ;(chrome.storage.local.get as Mock).mockRejectedValue(new Error('Storage error'))

      const result = await storage.getApiConfig()
      expect(result).toEqual({
        communicationMode: 'postMessage',
        requestTimeout: 5,
        sourceConfig: {
          contentSource: 'schema-editor-content',
          hostSource: 'schema-editor-host',
        },
        messageTypes: {
          getSchema: 'GET_SCHEMA',
          updateSchema: 'UPDATE_SCHEMA',
          checkPreview: 'CHECK_PREVIEW',
          renderPreview: 'RENDER_PREVIEW',
          cleanupPreview: 'CLEANUP_PREVIEW',
        },
      })
    })

    it('setApiConfig失败时不应该抛出错误', async () => {
      ;(chrome.storage.local.set as Mock).mockRejectedValue(new Error('Storage error'))

      const config = {
        communicationMode: 'postMessage' as const,
        requestTimeout: 5,
        sourceConfig: {
          contentSource: 'schema-editor-content',
          hostSource: 'schema-editor-host',
        },
        messageTypes: {
          getSchema: 'GET_SCHEMA',
          updateSchema: 'UPDATE_SCHEMA',
          checkPreview: 'CHECK_PREVIEW',
          renderPreview: 'RENDER_PREVIEW',
          cleanupPreview: 'CLEANUP_PREVIEW',
        },
      }

      await expect(storage.setApiConfig(config)).resolves.not.toThrow()
    })
  })

  describe('Favorites 收藏相关方法', () => {
    beforeEach(() => {
      // 重置 mock 确保每个测试独立
      ;(chrome.storage.local.get as Mock).mockReset()
      ;(chrome.storage.local.set as Mock).mockReset()
      ;(chrome.storage.local.get as Mock).mockImplementation(() => Promise.resolve({}))
      ;(chrome.storage.local.set as Mock).mockResolvedValue(undefined)
    })

    it('getFavorites 应该返回收藏列表', async () => {
      const mockFavorites = [
        { id: '1', name: 'Fav1', content: '{}', timestamp: Date.now(), lastUsedTime: Date.now() },
      ]
      ;(chrome.storage.local.get as Mock).mockResolvedValue({ favorites: mockFavorites })

      const result = await storage.getFavorites()
      expect(result).toEqual(mockFavorites)
    })

    it('getFavorites 失败时应该返回空数组', async () => {
      ;(chrome.storage.local.get as Mock).mockRejectedValue(new Error('Storage error'))

      const result = await storage.getFavorites()
      expect(result).toEqual([])
    })

    it('addFavorite 应该添加收藏', async () => {
      ;(chrome.storage.local.get as Mock).mockResolvedValue({
        favorites: [],
        maxFavoritesCount: 50,
      })

      await storage.addFavorite('Test', '{"key": "value"}')

      expect(chrome.storage.local.set).toHaveBeenCalled()
    })

    it('addFavorite 失败时应该抛出错误', async () => {
      ;(chrome.storage.local.get as Mock).mockResolvedValue({
        favorites: [],
        maxFavoritesCount: 50,
      })
      ;(chrome.storage.local.set as Mock).mockRejectedValue(new Error('Storage error'))

      await expect(storage.addFavorite('Test', '{}')).rejects.toThrow()
    })

    it('updateFavorite 应该更新收藏', async () => {
      const mockFavorites = [
        {
          id: 'test-id',
          name: 'Old',
          content: '{}',
          timestamp: Date.now(),
          lastUsedTime: Date.now(),
        },
      ]
      ;(chrome.storage.local.get as Mock).mockResolvedValue({ favorites: mockFavorites })

      await storage.updateFavorite('test-id', 'New Name', '{"new": true}')

      expect(chrome.storage.local.set).toHaveBeenCalled()
    })

    it('updateFavorite 收藏不存在时应该抛出错误', async () => {
      ;(chrome.storage.local.get as Mock).mockResolvedValue({ favorites: [] })

      await expect(storage.updateFavorite('non-existent', 'Name', '{}')).rejects.toThrow(
        '收藏不存在'
      )
    })

    it('deleteFavorite 应该删除收藏', async () => {
      const mockFavorites = [
        {
          id: 'test-id',
          name: 'Test',
          content: '{}',
          timestamp: Date.now(),
          lastUsedTime: Date.now(),
        },
      ]
      ;(chrome.storage.local.get as Mock).mockResolvedValue({ favorites: mockFavorites })

      await storage.deleteFavorite('test-id')

      expect(chrome.storage.local.set).toHaveBeenCalled()
    })

    it('deleteFavorite 失败时应该抛出错误', async () => {
      const mockFavorites = [
        {
          id: 'test-id',
          name: 'Test',
          content: '{}',
          timestamp: Date.now(),
          lastUsedTime: Date.now(),
        },
      ]
      ;(chrome.storage.local.get as Mock).mockResolvedValue({ favorites: mockFavorites })
      ;(chrome.storage.local.set as Mock).mockRejectedValue(new Error('Storage error'))

      await expect(storage.deleteFavorite('test-id')).rejects.toThrow()
    })

    it('updateFavoriteUsedTime 应该更新使用时间', async () => {
      const mockFavorites = [
        {
          id: 'test-id',
          name: 'Test',
          content: '{}',
          timestamp: Date.now(),
          lastUsedTime: Date.now() - 10000,
        },
      ]
      ;(chrome.storage.local.get as Mock).mockResolvedValue({ favorites: mockFavorites })

      await storage.updateFavoriteUsedTime('test-id')

      expect(chrome.storage.local.set).toHaveBeenCalled()
    })

    it('updateFavoriteUsedTime 失败时不应该抛出错误', async () => {
      ;(chrome.storage.local.get as Mock).mockRejectedValue(new Error('Storage error'))

      await expect(storage.updateFavoriteUsedTime('test-id')).resolves.not.toThrow()
    })

    it('cleanOldFavorites 应该清理超过最大数量的收藏', async () => {
      const now = Date.now()
      const mockFavorites = Array.from({ length: 10 }, (_, i) => ({
        id: `fav-${i}`,
        name: `Fav ${i}`,
        content: '{}',
        timestamp: now - i * 1000,
        lastUsedTime: now - i * 1000,
      }))
      ;(chrome.storage.local.get as Mock).mockResolvedValue({
        favorites: mockFavorites,
        maxFavoritesCount: 5,
      })

      await storage.cleanOldFavorites()

      expect(chrome.storage.local.set).toHaveBeenCalled()
    })

    it('cleanOldFavorites 失败时不应该抛出错误', async () => {
      ;(chrome.storage.local.get as Mock).mockRejectedValue(new Error('Storage error'))

      await expect(storage.cleanOldFavorites()).resolves.not.toThrow()
    })
  })

  describe('其他未覆盖方法', () => {
    beforeEach(() => {
      // 重置 mock 确保每个测试独立
      ;(chrome.storage.local.get as Mock).mockReset()
      ;(chrome.storage.local.set as Mock).mockReset()
      ;(chrome.storage.local.get as Mock).mockImplementation(() => Promise.resolve({}))
      ;(chrome.storage.local.set as Mock).mockResolvedValue(undefined)
    })

    it('setPreviewConfig 应该保存预览配置', async () => {
      const config = {
        previewWidth: 50,
        updateDelay: 500,
        autoUpdate: true,
        zIndex: {
          default: 2147483646,
          preview: 999,
        },
      }
      await storage.setPreviewConfig(config)

      expect(chrome.storage.local.set).toHaveBeenCalledWith({ previewConfig: config })
    })

    it('setRecordingModeConfig 应该保存录制模式配置', async () => {
      const config = {
        enabled: true,
        keyBinding: 'r',
        highlightColor: '#ff0000',
        pollingInterval: 100,
        autoStopTimeout: null,
      }
      await storage.setRecordingModeConfig(config)

      expect(chrome.storage.local.set).toHaveBeenCalledWith({ recordingModeConfig: config })
    })

    it('setEnableAstTypeHints 应该保存 AST 类型提示设置', async () => {
      await storage.setEnableAstTypeHints(true)

      expect(chrome.storage.local.set).toHaveBeenCalledWith({ enableAstTypeHints: true })
    })

    it('setEditorTheme 应该保存编辑器主题', async () => {
      await storage.setEditorTheme('dark')

      expect(chrome.storage.local.set).toHaveBeenCalledWith({ editorTheme: 'dark' })
    })

    it('setPreviewFunctionName 应该保存预览函数名', async () => {
      await storage.setPreviewFunctionName('customPreview')

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        previewFunctionName: 'customPreview',
      })
    })

    it('getExportConfig 应该返回导出配置', async () => {
      const config = { customFileName: true }
      ;(chrome.storage.local.get as Mock).mockResolvedValue({ exportConfig: config })

      const result = await storage.getExportConfig()
      expect(result).toEqual(config)
    })

    it('getExportConfig 失败时应该返回默认值', async () => {
      ;(chrome.storage.local.get as Mock).mockRejectedValue(new Error('Storage error'))

      const result = await storage.getExportConfig()
      expect(result).toEqual({ customFileName: false })
    })

    it('setExportConfig 应该保存导出配置', async () => {
      ;(chrome.storage.local.get as Mock).mockResolvedValue({
        exportConfig: { customFileName: false },
      })

      await storage.setExportConfig({ customFileName: true })

      expect(chrome.storage.local.set).toHaveBeenCalled()
    })

    it('setExportConfig 失败时应该抛出错误', async () => {
      ;(chrome.storage.local.get as Mock).mockResolvedValue({ exportConfig: {} })
      ;(chrome.storage.local.set as Mock).mockRejectedValue(new Error('Storage error'))

      await expect(storage.setExportConfig({ customFileName: true })).rejects.toThrow()
    })

    it('cleanExpiredDrafts 应该清理过期草稿', async () => {
      const now = Date.now()
      const oldDraft = {
        content: '{}',
        timestamp: now - 100 * 24 * 60 * 60 * 1000, // 100天前
        url: 'https://example.com',
      }
      ;(chrome.storage.local.get as Mock).mockResolvedValue({
        draftRetentionDays: 30,
        'draft:old-param': oldDraft,
      })

      await storage.cleanExpiredDrafts()

      // 验证调用了 storage 操作
      expect(chrome.storage.local.get).toHaveBeenCalled()
    })

    it('cleanExpiredDrafts 失败时不应该抛出错误', async () => {
      ;(chrome.storage.local.get as Mock).mockRejectedValue(new Error('Storage error'))

      await expect(storage.cleanExpiredDrafts()).resolves.not.toThrow()
    })

    it('saveDraft 失败时不应该抛出错误', async () => {
      ;(chrome.storage.local.set as Mock).mockRejectedValue(new Error('Storage error'))

      await expect(storage.saveDraft('test-param', '{}')).resolves.not.toThrow()
    })
  })
})
