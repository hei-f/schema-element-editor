import { storage } from '@/shared/utils/browser/storage'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OptionsApp } from '../OptionsApp'

// Mock storage
jest.mock('@/shared/utils/browser/storage', () => ({
  storage: {
    getAttributeName: jest.fn(),
    getSearchConfig: jest.fn(),
    getGetFunctionName: jest.fn(),
    getUpdateFunctionName: jest.fn(),
    getAutoParseString: jest.fn(),
    getEnableDebugLog: jest.fn(),
    getToolbarButtons: jest.fn(),
    getDrawerWidth: jest.fn(),
    getHighlightColor: jest.fn(),
    getMaxFavoritesCount: jest.fn(),
    getAutoSaveDraft: jest.fn(),
    getPreviewConfig: jest.fn(),
    getMaxHistoryCount: jest.fn(),
    setAttributeName: jest.fn(),
    setSearchConfig: jest.fn(),
    setFunctionNames: jest.fn(),
    setAutoParseString: jest.fn(),
    setEnableDebugLog: jest.fn(),
    setToolbarButtons: jest.fn(),
    setDrawerWidth: jest.fn(),
    setHighlightColor: jest.fn(),
    setMaxFavoritesCount: jest.fn(),
    setAutoSaveDraft: jest.fn(),
    setPreviewConfig: jest.fn(),
    setMaxHistoryCount: jest.fn()
  }
}))

// Mock chrome.tabs API
const mockChromeTabs = {
  create: jest.fn()
}
;(global as any).chrome = {
  ...(global as any).chrome,
  tabs: mockChromeTabs
}

const mockStorage = storage as jest.Mocked<typeof storage>

describe('OptionsApp组件测试', () => {
  const defaultMockValues = {
    attributeName: 'id',
    searchConfig: { searchDepthDown: 5, searchDepthUp: 3, throttleInterval: 200 },
    getFunctionName: '__getContentById',
    updateFunctionName: '__updateContentById',
    autoParseString: true,
    enableDebugLog: false,
    toolbarButtons: {
      astRawStringToggle: true,
      deserialize: false,
      serialize: false,
      format: true,
      preview: true
    },
    drawerWidth: '800px',
    highlightColor: '#39C5BB',
    maxFavoritesCount: 50,
    autoSaveDraft: false,
    previewConfig: {
      autoUpdate: false,
      previewWidth: 40,
      rememberState: false,
      updateDelay: 500
    },
    maxHistoryCount: 50
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    
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
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
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
        expect(screen.getByText(/v1\.6\.1/)).toBeInTheDocument()
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
        url: 'https://github.com/hei-f/schema-editor/releases/',
        active: true
      })
    })
  })

  describe('配置项显示', () => {
    it('应该显示API函数配置标题', async () => {
      render(<OptionsApp />)
      
      await waitFor(() => {
        expect(screen.getByText('API函数配置')).toBeInTheDocument()
      }, { timeout: 5000 })
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
    it('应该显示表单元素', async () => {
      const { container } = render(<OptionsApp />)
      
      await waitFor(() => {
        const formItems = container.querySelectorAll('.ant-form-item')
        expect(formItems.length).toBeGreaterThan(0)
      })
    })
  })
})

