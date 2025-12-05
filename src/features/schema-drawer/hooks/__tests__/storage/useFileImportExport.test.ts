import { renderHook, act } from '@testing-library/react'
import { message, Modal } from 'antd'
import { useFileImportExport } from '../../storage/useFileImportExport'
import { logger } from '@/shared/utils/logger'

// Mock dependencies
vi.mock('antd', () => ({
  message: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
  },
  Modal: {
    confirm: vi.fn(),
    destroyAll: vi.fn(),
  },
}))

const mockedModalConfirm = vi.mocked(Modal.confirm)
const mockedModalDestroyAll = vi.mocked(Modal.destroyAll)

vi.mock('@/shared/utils/logger', () => ({
  logger: {
    log: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@/shared/utils/shadow-root-manager', () => ({
  shadowRootManager: {
    getContainer: () => document.body,
  },
}))

// Mock chrome.runtime
global.chrome = {
  runtime: {
    getManifest: () => ({ version: '1.0.0' }),
  },
} as any

describe('useFileImportExport', () => {
  const mockOnImportSuccess = vi.fn()
  const mockShowLightNotification = vi.fn()

  const defaultProps = {
    editorValue: '{"type": "card", "title": "test"}',
    paramsKey: 'param1,param2',
    wasStringData: false,
    canParse: true,
    customFileName: false,
    onImportSuccess: mockOnImportSuccess,
    showLightNotification: mockShowLightNotification,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock URL.createObjectURL and revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    global.URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('handleExport', () => {
    it('应该成功导出文件', () => {
      const { result } = renderHook(() => useFileImportExport(defaultProps))

      act(() => {
        result.current.handleExport()
      })

      // 验证提示
      expect(mockShowLightNotification).toHaveBeenCalledWith('✅ 已导出到文件')
      expect(logger.log).toHaveBeenCalledWith(
        'Export successful:',
        expect.objectContaining({
          fileName: expect.stringContaining('content-param1_param2-'),
          size: expect.any(Number),
        })
      )
    })

    it('当 JSON 格式错误时应该提示错误', () => {
      const { result } = renderHook(() =>
        useFileImportExport({
          ...defaultProps,
          canParse: false,
        })
      )

      act(() => {
        result.current.handleExport()
      })

      expect(message.error).toHaveBeenCalledWith('导出失败：JSON 格式错误')
      expect(mockShowLightNotification).not.toHaveBeenCalled()
    })

    it('应该正确清理 Blob URL', () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const { result } = renderHook(() => useFileImportExport(defaultProps))

      act(() => {
        result.current.handleExport()
      })

      // 快进 100ms
      vi.advanceTimersByTime(100)

      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
      vi.useRealTimers()
    })

    it('当 JSON 解析失败时应该提示数据处理错误', () => {
      const { result } = renderHook(() =>
        useFileImportExport({
          ...defaultProps,
          editorValue: 'invalid json content',
        })
      )

      act(() => {
        result.current.handleExport()
      })

      expect(message.error).toHaveBeenCalledWith('导出失败：数据处理错误')
      expect(logger.error).toHaveBeenCalledWith('Export failed:', expect.any(Error))
    })

    it('启用自定义文件名时应该弹出 Modal', () => {
      const { result } = renderHook(() =>
        useFileImportExport({
          ...defaultProps,
          customFileName: true,
        })
      )

      act(() => {
        result.current.handleExport()
      })

      expect(mockedModalConfirm).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '导出文件',
          okText: '导出',
          cancelText: '取消',
        })
      )
    })

    it('自定义文件名时点击确定应该导出文件', () => {
      let onOkCallback: () => void

      mockedModalConfirm.mockImplementation((config: any) => {
        onOkCallback = config.onOk
        return { destroy: vi.fn(), update: vi.fn() }
      })

      const { result } = renderHook(() =>
        useFileImportExport({
          ...defaultProps,
          customFileName: true,
        })
      )

      act(() => {
        result.current.handleExport()
      })

      // 模拟用户点击确定
      act(() => {
        onOkCallback()
      })

      expect(mockShowLightNotification).toHaveBeenCalledWith('✅ 已导出到文件')
    })

    it('自定义文件名为空时 onOk 应该提示警告并返回 reject', async () => {
      let capturedConfig: any

      mockedModalConfirm.mockImplementation((config: any) => {
        capturedConfig = config
        // 模拟触发 input 的 onChange 将值清空
        const inputElement = { target: { value: '' } }
        // 从 content 中获取 input 并触发 onChange
        const inputProps = config.content.props.children[1].props
        inputProps.onChange(inputElement)
        return { destroy: vi.fn(), update: vi.fn() }
      })

      const { result } = renderHook(() =>
        useFileImportExport({
          ...defaultProps,
          customFileName: true,
        })
      )

      act(() => {
        result.current.handleExport()
      })

      // 调用 onOk 时文件名为空
      const onOkResult = capturedConfig.onOk()

      expect(message.warning).toHaveBeenCalledWith('文件名不能为空')
      await expect(onOkResult).rejects.toBeUndefined()
    })

    it('自定义文件名时按 Enter 键应该触发导出', () => {
      let capturedConfig: any

      mockedModalConfirm.mockImplementation((config: any) => {
        capturedConfig = config
        return { destroy: vi.fn(), update: vi.fn() }
      })

      const { result } = renderHook(() =>
        useFileImportExport({
          ...defaultProps,
          customFileName: true,
        })
      )

      act(() => {
        result.current.handleExport()
      })

      // 获取 input 组件的 props
      const inputProps = capturedConfig.content.props.children[1].props

      // 模拟按 Enter 键（使用默认文件名）
      act(() => {
        inputProps.onKeyDown({ key: 'Enter' })
      })

      expect(mockedModalDestroyAll).toHaveBeenCalled()
      expect(mockShowLightNotification).toHaveBeenCalledWith('✅ 已导出到文件')
    })

    it('自定义文件名为空时按 Enter 键应该提示警告', () => {
      let capturedConfig: any

      mockedModalConfirm.mockImplementation((config: any) => {
        capturedConfig = config
        return { destroy: vi.fn(), update: vi.fn() }
      })

      const { result } = renderHook(() =>
        useFileImportExport({
          ...defaultProps,
          customFileName: true,
        })
      )

      act(() => {
        result.current.handleExport()
      })

      // 获取 input 组件的 props
      const inputProps = capturedConfig.content.props.children[1].props

      // 先清空文件名
      inputProps.onChange({ target: { value: '' } })

      // 模拟按 Enter 键
      act(() => {
        inputProps.onKeyDown({ key: 'Enter' })
      })

      expect(message.warning).toHaveBeenCalledWith('文件名不能为空')
      expect(mockedModalDestroyAll).not.toHaveBeenCalled()
    })

    it('自定义文件名时按其他键不应该触发导出', () => {
      let capturedConfig: any

      mockedModalConfirm.mockImplementation((config: any) => {
        capturedConfig = config
        return { destroy: vi.fn(), update: vi.fn() }
      })

      const { result } = renderHook(() =>
        useFileImportExport({
          ...defaultProps,
          customFileName: true,
        })
      )

      act(() => {
        result.current.handleExport()
      })

      const inputProps = capturedConfig.content.props.children[1].props

      // 模拟按其他键
      act(() => {
        inputProps.onKeyDown({ key: 'a' })
      })

      expect(mockedModalDestroyAll).not.toHaveBeenCalled()
    })
  })

  describe('handleImport', () => {
    it('应该成功导入带元数据的文件', async () => {
      const { result } = renderHook(() => useFileImportExport(defaultProps))

      const mockFile = new File(
        [
          JSON.stringify({
            __SCHEMA_EDITOR_EXPORT__: true,
            content: { type: 'card', title: 'imported' },
            metadata: {
              params: 'test',
              exportedAt: '2025-11-24T10:00:00.000Z',
              version: '1.0.0',
              wasStringData: false,
              url: 'https://example.com',
            },
          }),
        ],
        'test.json',
        { type: 'application/json' }
      )

      // Mock FileReader
      const mockFileReader = {
        readAsText: vi.fn(function (this: any) {
          setTimeout(() => {
            this.onload({
              target: {
                result: JSON.stringify({
                  __SCHEMA_EDITOR_EXPORT__: true,
                  content: { type: 'card', title: 'imported' },
                  metadata: {
                    params: 'test',
                    exportedAt: '2025-11-24T10:00:00.000Z',
                    version: '1.0.0',
                    wasStringData: false,
                    url: 'https://example.com',
                  },
                }),
              },
            })
          }, 0)
        }),
      }
      global.FileReader = vi.fn(() => mockFileReader) as any

      act(() => {
        result.current.handleImport(mockFile)
      })

      // 等待异步操作
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
      })

      expect(mockOnImportSuccess).toHaveBeenCalledWith(
        expect.stringContaining('"type": "card"'),
        expect.objectContaining({
          params: 'test',
          wasStringData: false,
        })
      )
      expect(mockShowLightNotification).toHaveBeenCalledWith(expect.stringContaining('✅ 已导入'))
    })

    it('应该成功导入普通 JSON 文件', async () => {
      const { result } = renderHook(() => useFileImportExport(defaultProps))

      const mockFileReader = {
        readAsText: vi.fn(function (this: any) {
          setTimeout(() => {
            this.onload({
              target: {
                result: JSON.stringify({ type: 'card', title: 'plain' }),
              },
            })
          }, 0)
        }),
      }
      global.FileReader = vi.fn(() => mockFileReader) as any

      const mockFile = new File([JSON.stringify({ type: 'card', title: 'plain' })], 'test.json', {
        type: 'application/json',
      })

      act(() => {
        result.current.handleImport(mockFile)
      })

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
      })

      expect(mockOnImportSuccess).toHaveBeenCalledWith(
        expect.stringContaining('"type": "card"'),
        undefined
      )
      expect(mockShowLightNotification).toHaveBeenCalledWith('✅ 已导入 JSON 文件')
    })

    it('当文件过大时应该拒绝导入', () => {
      const { result } = renderHook(() => useFileImportExport(defaultProps))

      // 创建一个超过 10MB 的文件
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.json', {
        type: 'application/json',
      })

      const returnValue = result.current.handleImport(largeFile)

      expect(returnValue).toBe(false)
      expect(message.error).toHaveBeenCalledWith('文件过大，最大支持 10MB')
      expect(mockOnImportSuccess).not.toHaveBeenCalled()
    })

    it('当 JSON 格式错误时应该提示错误', async () => {
      const { result } = renderHook(() => useFileImportExport(defaultProps))

      const mockFileReader = {
        readAsText: vi.fn(function (this: any) {
          setTimeout(() => {
            this.onload({
              target: { result: 'invalid json' },
            })
          }, 0)
        }),
      }
      global.FileReader = vi.fn(() => mockFileReader) as any

      const mockFile = new File(['invalid json'], 'test.json', {
        type: 'application/json',
      })

      act(() => {
        result.current.handleImport(mockFile)
      })

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
      })

      expect(message.error).toHaveBeenCalledWith('导入失败：文件格式错误或非法 JSON')
      expect(logger.error).toHaveBeenCalled()
    })

    it('当导入的文件内容为空时应该提示错误', async () => {
      const { result } = renderHook(() => useFileImportExport(defaultProps))

      const mockFileReader = {
        readAsText: vi.fn(function (this: any) {
          setTimeout(() => {
            this.onload({
              target: {
                result: JSON.stringify({
                  __SCHEMA_EDITOR_EXPORT__: true,
                  content: null,
                  metadata: {
                    params: 'test',
                    exportedAt: '2025-11-24T10:00:00.000Z',
                    version: '1.0.0',
                    wasStringData: false,
                    url: 'https://example.com',
                  },
                }),
              },
            })
          }, 0)
        }),
      }
      global.FileReader = vi.fn(() => mockFileReader) as any

      const mockFile = new File(['test'], 'test.json', {
        type: 'application/json',
      })

      act(() => {
        result.current.handleImport(mockFile)
      })

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
      })

      expect(message.error).toHaveBeenCalledWith('导入失败：文件内容为空')
      expect(mockOnImportSuccess).not.toHaveBeenCalled()
    })

    it('当文件读取失败时应该处理错误', async () => {
      const { result } = renderHook(() => useFileImportExport(defaultProps))

      const mockFileReader = {
        readAsText: vi.fn(function (this: any) {
          setTimeout(() => {
            this.onerror()
          }, 0)
        }),
      }
      global.FileReader = vi.fn(() => mockFileReader) as any

      const mockFile = new File(['test'], 'test.json', {
        type: 'application/json',
      })

      act(() => {
        result.current.handleImport(mockFile)
      })

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
      })

      expect(message.error).toHaveBeenCalledWith('文件读取失败')
      expect(logger.error).toHaveBeenCalledWith('FileReader error')
    })

    it('应该始终返回 false 以阻止默认上传行为', () => {
      const { result } = renderHook(() => useFileImportExport(defaultProps))

      const mockFile = new File(['test'], 'test.json', {
        type: 'application/json',
      })

      const returnValue = result.current.handleImport(mockFile)

      expect(returnValue).toBe(false)
    })
  })
})
