import { renderHook, act } from '@testing-library/react'
import { message } from 'antd'
import { useFileImportExport } from '../useFileImportExport'
import { logger } from '@/shared/utils/logger'

// Mock dependencies
jest.mock('antd', () => ({
  message: {
    error: jest.fn(),
    success: jest.fn(),
    warning: jest.fn()
  },
  Modal: {
    confirm: jest.fn(),
    destroyAll: jest.fn()
  }
}))

jest.mock('@/shared/utils/logger', () => ({
  logger: {
    log: jest.fn(),
    error: jest.fn()
  }
}))

jest.mock('@/shared/utils/shadow-root-manager', () => ({
  shadowRootManager: {
    getContainer: () => document.body
  }
}))

// Mock chrome.runtime
global.chrome = {
  runtime: {
    getManifest: () => ({ version: '1.0.0' })
  }
} as any

describe('useFileImportExport', () => {
  const mockOnImportSuccess = jest.fn()
  const mockShowLightNotification = jest.fn()
  
  const defaultProps = {
    editorValue: '{"type": "card", "title": "test"}',
    paramsKey: 'param1,param2',
    wasStringData: false,
    canParse: true,
    customFileName: false,
    onImportSuccess: mockOnImportSuccess,
    showLightNotification: mockShowLightNotification
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock URL.createObjectURL and revokeObjectURL
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url')
    global.URL.revokeObjectURL = jest.fn()
  })
  
  afterEach(() => {
    jest.restoreAllMocks()
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
          size: expect.any(Number)
        })
      )
    })

    it('当 JSON 格式错误时应该提示错误', () => {
      const { result } = renderHook(() =>
        useFileImportExport({
          ...defaultProps,
          canParse: false
        })
      )

      act(() => {
        result.current.handleExport()
      })

      expect(message.error).toHaveBeenCalledWith('导出失败：JSON 格式错误')
      expect(mockShowLightNotification).not.toHaveBeenCalled()
    })

    it('应该正确清理 Blob URL', () => {
      jest.useFakeTimers()
      const { result } = renderHook(() => useFileImportExport(defaultProps))

      act(() => {
        result.current.handleExport()
      })

      // 快进 100ms
      jest.advanceTimersByTime(100)

      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
      jest.useRealTimers()
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
              url: 'https://example.com'
            }
          })
        ],
        'test.json',
        { type: 'application/json' }
      )

      // Mock FileReader
      const mockFileReader = {
        readAsText: jest.fn(function (this: any) {
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
                    url: 'https://example.com'
                  }
                })
              }
            })
          }, 0)
        })
      }
      global.FileReader = jest.fn(() => mockFileReader) as any

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
          wasStringData: false
        })
      )
      expect(mockShowLightNotification).toHaveBeenCalledWith(
        expect.stringContaining('✅ 已导入')
      )
    })

    it('应该成功导入普通 JSON 文件', async () => {
      const { result } = renderHook(() => useFileImportExport(defaultProps))

      const mockFileReader = {
        readAsText: jest.fn(function (this: any) {
          setTimeout(() => {
            this.onload({
              target: {
                result: JSON.stringify({ type: 'card', title: 'plain' })
              }
            })
          }, 0)
        })
      }
      global.FileReader = jest.fn(() => mockFileReader) as any

      const mockFile = new File(
        [JSON.stringify({ type: 'card', title: 'plain' })],
        'test.json',
        { type: 'application/json' }
      )

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
        type: 'application/json'
      })

      const returnValue = result.current.handleImport(largeFile)

      expect(returnValue).toBe(false)
      expect(message.error).toHaveBeenCalledWith('文件过大，最大支持 10MB')
      expect(mockOnImportSuccess).not.toHaveBeenCalled()
    })

    it('当 JSON 格式错误时应该提示错误', async () => {
      const { result } = renderHook(() => useFileImportExport(defaultProps))

      const mockFileReader = {
        readAsText: jest.fn(function (this: any) {
          setTimeout(() => {
            this.onload({
              target: { result: 'invalid json' }
            })
          }, 0)
        })
      }
      global.FileReader = jest.fn(() => mockFileReader) as any

      const mockFile = new File(['invalid json'], 'test.json', {
        type: 'application/json'
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

    it('当文件读取失败时应该处理错误', async () => {
      const { result } = renderHook(() => useFileImportExport(defaultProps))

      const mockFileReader = {
        readAsText: jest.fn(function (this: any) {
          setTimeout(() => {
            this.onerror()
          }, 0)
        })
      }
      global.FileReader = jest.fn(() => mockFileReader) as any

      const mockFile = new File(['test'], 'test.json', {
        type: 'application/json'
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
        type: 'application/json'
      })

      const returnValue = result.current.handleImport(mockFile)

      expect(returnValue).toBe(false)
    })
  })
})

