import { renderHook, act } from '@testing-library/react'
import { Modal } from 'antd'
import { useFileImportExport } from '../../storage/useFileImportExport'

// Mock dependencies
vi.mock('antd', () => ({
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
  const mockOnError = vi.fn()
  const mockOnWarning = vi.fn()

  const defaultProps = {
    editorValue: '{"type": "card", "title": "test"}',
    paramsKey: 'param1,param2',
    wasStringData: false,
    canParse: true,
    customFileName: false,
    onImportSuccess: mockOnImportSuccess,
    showLightNotification: mockShowLightNotification,
    onError: mockOnError,
    onWarning: mockOnWarning,
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

      expect(mockOnError).toHaveBeenCalledWith('导出失败：JSON 格式错误')
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

      expect(mockOnError).toHaveBeenCalledWith('导出失败：数据处理错误')
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

      expect(mockOnWarning).toHaveBeenCalledWith('文件名不能为空')
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

      expect(mockOnWarning).toHaveBeenCalledWith('文件名不能为空')
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
            __SCHEMA_ELEMENT_EDITOR_EXPORT__: true,
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
      class MockFileReader {
        onload: ((event: ProgressEvent<FileReader>) => void) | null = null
        onerror: ((event: ProgressEvent<FileReader>) => void) | null = null
        readAsText() {
          setTimeout(() => {
            this.onload?.({
              target: {
                result: JSON.stringify({
                  __SCHEMA_ELEMENT_EDITOR_EXPORT__: true,
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
            } as unknown as ProgressEvent<FileReader>)
          }, 0)
        }
      }
      global.FileReader = MockFileReader as unknown as typeof FileReader

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

      class MockFileReader {
        onload: ((event: ProgressEvent<FileReader>) => void) | null = null
        onerror: ((event: ProgressEvent<FileReader>) => void) | null = null
        readAsText() {
          setTimeout(() => {
            this.onload?.({
              target: {
                result: JSON.stringify({ type: 'card', title: 'plain' }),
              },
            } as unknown as ProgressEvent<FileReader>)
          }, 0)
        }
      }
      global.FileReader = MockFileReader as unknown as typeof FileReader

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
      expect(mockOnError).toHaveBeenCalledWith('文件过大，最大支持 10MB')
      expect(mockOnImportSuccess).not.toHaveBeenCalled()
    })

    it('当 JSON 格式错误时应该提示错误', async () => {
      const { result } = renderHook(() => useFileImportExport(defaultProps))

      class MockFileReader {
        onload: ((event: ProgressEvent<FileReader>) => void) | null = null
        onerror: ((event: ProgressEvent<FileReader>) => void) | null = null
        readAsText() {
          setTimeout(() => {
            this.onload?.({
              target: { result: 'invalid json' },
            } as unknown as ProgressEvent<FileReader>)
          }, 0)
        }
      }
      global.FileReader = MockFileReader as unknown as typeof FileReader

      const mockFile = new File(['invalid json'], 'test.json', {
        type: 'application/json',
      })

      act(() => {
        result.current.handleImport(mockFile)
      })

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
      })

      expect(mockOnError).toHaveBeenCalledWith('导入失败：文件格式错误或非法 JSON')
    })

    it('当导入的文件内容为空时应该提示错误', async () => {
      const { result } = renderHook(() => useFileImportExport(defaultProps))

      class MockFileReader {
        onload: ((event: ProgressEvent<FileReader>) => void) | null = null
        onerror: ((event: ProgressEvent<FileReader>) => void) | null = null
        readAsText() {
          setTimeout(() => {
            this.onload?.({
              target: {
                result: JSON.stringify({
                  __SCHEMA_ELEMENT_EDITOR_EXPORT__: true,
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
            } as unknown as ProgressEvent<FileReader>)
          }, 0)
        }
      }
      global.FileReader = MockFileReader as unknown as typeof FileReader

      const mockFile = new File(['test'], 'test.json', {
        type: 'application/json',
      })

      act(() => {
        result.current.handleImport(mockFile)
      })

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
      })

      expect(mockOnError).toHaveBeenCalledWith('导入失败：文件内容为空')
      expect(mockOnImportSuccess).not.toHaveBeenCalled()
    })

    it('当文件读取失败时应该处理错误', async () => {
      const { result } = renderHook(() => useFileImportExport(defaultProps))

      class MockFileReader {
        onload: ((event: ProgressEvent<FileReader>) => void) | null = null
        onerror: ((event: ProgressEvent<FileReader>) => void) | null = null
        readAsText() {
          setTimeout(() => {
            this.onerror?.({} as ProgressEvent<FileReader>)
          }, 0)
        }
      }
      global.FileReader = MockFileReader as unknown as typeof FileReader

      const mockFile = new File(['test'], 'test.json', {
        type: 'application/json',
      })

      act(() => {
        result.current.handleImport(mockFile)
      })

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
      })

      expect(mockOnError).toHaveBeenCalledWith('文件读取失败')
    })

    it('应该始终返回 false 以阻止默认上传行为', () => {
      // Mock FileReader for this test
      class MockFileReader {
        onload: ((event: ProgressEvent<FileReader>) => void) | null = null
        onerror: ((event: ProgressEvent<FileReader>) => void) | null = null
        readAsText() {
          // Do nothing, just need to test return value
        }
      }
      global.FileReader = MockFileReader as unknown as typeof FileReader

      const { result } = renderHook(() => useFileImportExport(defaultProps))

      const mockFile = new File(['test'], 'test.json', {
        type: 'application/json',
      })

      const returnValue = result.current.handleImport(mockFile)

      expect(returnValue).toBe(false)
    })
  })
})
