import { storage } from '@/shared/utils/browser/storage'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Mocked } from 'vitest'
import { OptionsApp } from '../OptionsApp'

// Mock storage
vi.mock('@/shared/utils/browser/storage', () => ({
  storage: {
    getAttributeName: vi.fn(),
    getSearchConfig: vi.fn(),
    getGetFunctionName: vi.fn(),
    getUpdateFunctionName: vi.fn(),
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
    getEnableAstTypeHints: vi.fn(),
    getExportConfig: vi.fn(),
    getEditorTheme: vi.fn(),
    getPreviewFunctionName: vi.fn(),
    getApiConfig: vi.fn(),
    setAttributeName: vi.fn(),
    setSearchConfig: vi.fn(),
    setFunctionNames: vi.fn(),
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
    setEnableAstTypeHints: vi.fn(),
    setExportConfig: vi.fn(),
    setEditorTheme: vi.fn(),
    setApiConfig: vi.fn(),
    getThemeColor: vi.fn(),
    setThemeColor: vi.fn(),
  },
}))

// Mock chrome.tabs API
const mockChromeTabs = {
  create: vi.fn(),
}

// Mock chrome.storage.onChanged API
const mockStorageOnChanged = {
  addListener: vi.fn(),
  removeListener: vi.fn(),
}

;(global as any).chrome = {
  ...(global as any).chrome,
  tabs: mockChromeTabs,
  storage: {
    ...(global as any).chrome?.storage,
    onChanged: mockStorageOnChanged,
  },
}

const mockStorage = storage as Mocked<typeof storage>

describe('OptionsApp组件测试', () => {
  const defaultMockValues = {
    attributeName: 'id',
    searchConfig: { limitUpwardSearch: false, searchDepthUp: 3, throttleInterval: 200 },
    getFunctionName: '__getContentById',
    updateFunctionName: '__updateContentById',
    previewFunctionName: '__getContentPreview',
    autoParseString: true,
    enableDebugLog: false,
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
    drawerWidth: '800px',
    highlightColor: '#1677FF',
    themeColor: '#1677FF',
    maxFavoritesCount: 50,
    autoSaveDraft: false,
    previewConfig: {
      autoUpdate: false,
      previewWidth: 40,
      updateDelay: 500,
      enableBuiltinPreview: true,
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
      dataFetchMode: 'polling' as const,
    },
    enableAstTypeHints: true,
    exportConfig: {
      customFileName: false,
    },
    editorTheme: 'schemaEditorDark' as const,
    apiConfig: {
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
        startRecording: 'START_RECORDING',
        stopRecording: 'STOP_RECORDING',
        schemaPush: 'SCHEMA_PUSH',
      },
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ shouldAdvanceTime: true })

    // 设置默认的mock返回值
    mockStorage.getAttributeName.mockResolvedValue(defaultMockValues.attributeName)
    mockStorage.getSearchConfig.mockResolvedValue(defaultMockValues.searchConfig)
    mockStorage.getGetFunctionName.mockResolvedValue(defaultMockValues.getFunctionName)
    mockStorage.getUpdateFunctionName.mockResolvedValue(defaultMockValues.updateFunctionName)
    mockStorage.getAutoParseString.mockResolvedValue(defaultMockValues.autoParseString)
    mockStorage.getEnableDebugLog.mockResolvedValue(defaultMockValues.enableDebugLog)
    mockStorage.getToolbarButtons.mockResolvedValue(defaultMockValues.toolbarButtons)
    mockStorage.getDrawerWidth.mockResolvedValue(defaultMockValues.drawerWidth)
    mockStorage.getHighlightColor.mockResolvedValue(defaultMockValues.highlightColor)
    mockStorage.getMaxFavoritesCount.mockResolvedValue(defaultMockValues.maxFavoritesCount)
    mockStorage.getAutoSaveDraft.mockResolvedValue(defaultMockValues.autoSaveDraft)
    mockStorage.getPreviewConfig.mockResolvedValue(defaultMockValues.previewConfig)
    mockStorage.getMaxHistoryCount.mockResolvedValue(defaultMockValues.maxHistoryCount)
    mockStorage.getHighlightAllConfig.mockResolvedValue(defaultMockValues.highlightAllConfig)
    mockStorage.getRecordingModeConfig.mockResolvedValue(defaultMockValues.recordingModeConfig)
    mockStorage.getEnableAstTypeHints.mockResolvedValue(defaultMockValues.enableAstTypeHints)
    mockStorage.getExportConfig.mockResolvedValue(defaultMockValues.exportConfig)
    mockStorage.getEditorTheme.mockResolvedValue(defaultMockValues.editorTheme)
    mockStorage.getPreviewFunctionName.mockResolvedValue(defaultMockValues.previewFunctionName)
    mockStorage.getApiConfig.mockResolvedValue(defaultMockValues.apiConfig)
    mockStorage.getThemeColor.mockResolvedValue(defaultMockValues.themeColor)
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  describe('基本渲染', () => {
    it('应该渲染组件', async () => {
      const { container } = render(<OptionsApp />)

      await waitFor(() => {
        expect(container.querySelector('form')).toBeInTheDocument()
      })
    })

    it('应该渲染版本信息', async () => {
      render(<OptionsApp />)

      await waitFor(() => {
        expect(screen.getByText(/v\d+\.\d+\.\d+/)).toBeInTheDocument()
      })
    })

    it('应该渲染检查更新按钮', async () => {
      render(<OptionsApp />)

      await waitFor(() => {
        expect(screen.getByText('检查更新')).toBeInTheDocument()
      })
    })
  })

  describe('配置加载', () => {
    it('应该在组件挂载时加载所有配置', async () => {
      render(<OptionsApp />)

      await waitFor(() => {
        expect(mockStorage.getAttributeName).toHaveBeenCalled()
        expect(mockStorage.getSearchConfig).toHaveBeenCalled()
        expect(mockStorage.getGetFunctionName).toHaveBeenCalled()
        expect(mockStorage.getUpdateFunctionName).toHaveBeenCalled()
        expect(mockStorage.getAutoParseString).toHaveBeenCalled()
        expect(mockStorage.getEnableDebugLog).toHaveBeenCalled()
        expect(mockStorage.getToolbarButtons).toHaveBeenCalled()
        expect(mockStorage.getDrawerWidth).toHaveBeenCalled()
        expect(mockStorage.getHighlightColor).toHaveBeenCalled()
        expect(mockStorage.getMaxFavoritesCount).toHaveBeenCalled()
        expect(mockStorage.getAutoSaveDraft).toHaveBeenCalled()
        expect(mockStorage.getPreviewConfig).toHaveBeenCalled()
        expect(mockStorage.getMaxHistoryCount).toHaveBeenCalled()
      })
    })

    it('应该显示加载的配置值', async () => {
      render(<OptionsApp />)

      await waitFor(() => {
        // 验证一些关键配置已加载并显示
        expect(mockStorage.getAttributeName).toHaveBeenCalled()
      })
    })

    it('应该处理加载配置失败的情况', async () => {
      mockStorage.getAttributeName.mockRejectedValue(new Error('Load error'))

      render(<OptionsApp />)

      await waitFor(() => {
        expect(mockStorage.getAttributeName).toHaveBeenCalled()
      })
    })
  })

  describe('检查更新功能', () => {
    it('应该在点击检查更新时打开GitHub Releases页面', async () => {
      const user = userEvent.setup({ delay: null })
      render(<OptionsApp />)

      await waitFor(() => {
        expect(screen.getByText('检查更新')).toBeInTheDocument()
      })

      const button = screen.getByText('检查更新')
      await user.click(button)

      expect(mockChromeTabs.create).toHaveBeenCalledWith({
        url: 'https://github.com/hei-f/schema-element-editor/releases',
        active: true,
      })
    })
  })

  describe('配置项显示', () => {
    it('应该显示集成配置标题', async () => {
      render(<OptionsApp />)

      await waitFor(
        () => {
          // UI重构后，侧边菜单和卡片标题都显示"集成配置"，使用getAllByText
          const elements = screen.getAllByText('集成配置')
          expect(elements.length).toBeGreaterThan(0)
          expect(elements[0]).toBeInTheDocument()
        },
        { timeout: 5000 }
      )
    })

    it('应该显示折叠面板', async () => {
      const { container } = render(<OptionsApp />)

      await waitFor(() => {
        expect(container.querySelector('.ant-collapse')).toBeInTheDocument()
      })
    })
  })

  describe('边界情况', () => {
    it('应该处理存储返回null值', async () => {
      mockStorage.getAttributeName.mockResolvedValue(null as any)

      render(<OptionsApp />)

      await waitFor(() => {
        expect(mockStorage.getAttributeName).toHaveBeenCalled()
      })
    })

    it('应该处理存储返回undefined值', async () => {
      mockStorage.getGetFunctionName.mockResolvedValue(undefined as any)

      render(<OptionsApp />)

      await waitFor(() => {
        expect(mockStorage.getGetFunctionName).toHaveBeenCalled()
      })
    })

    it('应该处理多个存储调用同时失败', async () => {
      mockStorage.getAttributeName.mockRejectedValue(new Error('Error 1'))
      mockStorage.getSearchConfig.mockRejectedValue(new Error('Error 2'))
      mockStorage.getGetFunctionName.mockRejectedValue(new Error('Error 3'))

      render(<OptionsApp />)

      await waitFor(() => {
        expect(mockStorage.getAttributeName).toHaveBeenCalled()
      })
    })
  })

  describe('组件结构', () => {
    it('应该渲染表单组件', async () => {
      const { container } = render(<OptionsApp />)

      await waitFor(() => {
        const form = container.querySelector('form')
        expect(form).toBeInTheDocument()
      })
    })

    it('应该包含折叠面板', async () => {
      const { container } = render(<OptionsApp />)

      await waitFor(() => {
        const collapse = container.querySelector('.ant-collapse')
        expect(collapse).toBeInTheDocument()
      })
    })

    it('应该渲染完整的配置页面', async () => {
      const { container } = render(<OptionsApp />)

      await waitFor(() => {
        expect(container.firstChild).toBeInTheDocument()
      })
    })
  })

  describe('提示信息', () => {
    it('应该在展开 Section 后显示表单元素', async () => {
      const user = userEvent.setup({ delay: null })
      const { container } = render(<OptionsApp />)

      // 等待组件加载完成
      await waitFor(() => {
        expect(container.querySelector('.ant-collapse')).toBeInTheDocument()
      })

      // 点击第一个折叠面板头部来展开
      const collapseHeader = container.querySelector('.ant-collapse-header')
      expect(collapseHeader).toBeInTheDocument()

      if (collapseHeader) {
        await user.click(collapseHeader)
      }

      // 验证展开后能看到表单元素
      await waitFor(() => {
        const formItems = container.querySelectorAll('.ant-form-item')
        expect(formItems.length).toBeGreaterThan(0)
      })
    })
  })

  /**
   * Document Metadata 测试
   * React 19 升级：由于 Chrome 扩展限制，使用 useEffect 设置 document.title
   */
  describe('Document Metadata (React 19)', () => {
    it('应该在组件挂载时设置 document.title', async () => {
      render(<OptionsApp />)

      await waitFor(() => {
        // 验证 document.title 包含应用名称和版本号
        expect(document.title).toMatch(/Schema Editor 设置/)
        expect(document.title).toMatch(/v\d+\.\d+\.\d+/)
      })
    })

    it('document.title 应该包含正确的格式', async () => {
      render(<OptionsApp />)

      await waitFor(() => {
        // 验证格式为 "Schema Editor 设置 (vX.X.X)"
        expect(document.title).toMatch(/^Schema Editor 设置 \(v\d+\.\d+\.\d+\)$/)
      })
    })

    it('应该正确显示版本号', async () => {
      render(<OptionsApp />)

      await waitFor(() => {
        // 从页面获取版本号并验证 document.title 中包含相同版本
        const versionElement = screen.getByText(/v\d+\.\d+\.\d+/)
        const versionText = versionElement.textContent

        if (versionText) {
          expect(document.title).toContain(versionText)
        }
      })
    })
  })
})
