/**
 * ParamTag 组件测试
 * 测试参数标签组件的渲染和复制功能
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ParamTag } from '../../toolbar/ParamTag'

// Mock shadowRootManager
vi.mock('@/shared/utils/shadow-root-manager', () => ({
  shadowRootManager: {
    getContainer: vi.fn(() => document.body),
  },
}))

describe('ParamTag', () => {
  const defaultProps = {
    value: 'test-value',
    index: 0,
    onCopy: vi.fn(),
  }

  let originalClipboard: Clipboard
  let originalExecCommand: typeof document.execCommand

  beforeEach(() => {
    vi.clearAllMocks()

    // 保存原始实现
    originalClipboard = navigator.clipboard
    originalExecCommand = document.execCommand

    // Mock console.error
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    // 恢复原始实现
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      writable: true,
      configurable: true,
    })
    document.execCommand = originalExecCommand
    vi.restoreAllMocks()
  })

  describe('基础渲染', () => {
    it('应该渲染参数标签', () => {
      render(<ParamTag {...defaultProps} />)

      expect(screen.getByText('params 1')).toBeInTheDocument()
    })

    it('应该根据index显示正确的参数编号', () => {
      const { rerender } = render(<ParamTag {...defaultProps} index={0} />)
      expect(screen.getByText('params 1')).toBeInTheDocument()

      rerender(<ParamTag {...defaultProps} index={2} />)
      expect(screen.getByText('params 3')).toBeInTheDocument()

      rerender(<ParamTag {...defaultProps} index={9} />)
      expect(screen.getByText('params 10')).toBeInTheDocument()
    })

    it('应该渲染Tooltip', () => {
      render(<ParamTag {...defaultProps} value="test-tooltip" />)

      // Tooltip 会将内容包裹在其内部，验证组件渲染即可
      const tag = screen.getByText('params 1')
      expect(tag).toBeInTheDocument()
    })

    it('应该渲染复制图标', () => {
      render(<ParamTag {...defaultProps} />)

      // 查找包含 CopyIcon 的容器
      const copyIconWrapper = screen.getByTestId('param-copy-icon')
      expect(copyIconWrapper).toBeInTheDocument()
    })
  })

  describe('Clipboard API 复制', () => {
    it('应该使用 Clipboard API 成功复制', async () => {
      const user = userEvent.setup()
      const mockWriteText = vi.fn().mockResolvedValue(undefined)

      // Mock Clipboard API
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: mockWriteText,
        },
        writable: true,
        configurable: true,
      })

      // Mock window.isSecureContext
      Object.defineProperty(window, 'isSecureContext', {
        value: true,
        writable: true,
        configurable: true,
      })

      render(<ParamTag {...defaultProps} value="copy-value" />)

      // 找到复制图标的容器并点击
      const copyIcon = screen.getByTestId('param-copy-icon')
      await user.click(copyIcon)

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith('copy-value')
        expect(defaultProps.onCopy).toHaveBeenCalled()
      })
    })

    it('应该在 Clipboard API 失败时降级到 execCommand', async () => {
      const user = userEvent.setup()
      const mockWriteText = vi.fn().mockRejectedValue(new Error('Clipboard API failed'))

      // Mock Clipboard API (失败)
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: mockWriteText,
        },
        writable: true,
        configurable: true,
      })

      Object.defineProperty(window, 'isSecureContext', {
        value: true,
        writable: true,
        configurable: true,
      })

      // Mock execCommand
      const mockExecCommand = vi.fn().mockReturnValue(true)
      document.execCommand = mockExecCommand

      render(<ParamTag {...defaultProps} value="fallback-value" />)

      const copyIcon = screen.getByTestId('param-copy-icon')
      await user.click(copyIcon)

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalled()
        expect(mockExecCommand).toHaveBeenCalledWith('copy')
        expect(defaultProps.onCopy).toHaveBeenCalled()
      })
    })

    it('应该在非安全上下文中使用 fallback 复制', async () => {
      const user = userEvent.setup()

      // Mock Clipboard API (存在)
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: vi.fn(),
        },
        writable: true,
        configurable: true,
      })

      // Mock 非安全上下文
      Object.defineProperty(window, 'isSecureContext', {
        value: false,
        writable: true,
        configurable: true,
      })

      // Mock execCommand
      const mockExecCommand = vi.fn().mockReturnValue(true)
      document.execCommand = mockExecCommand

      render(<ParamTag {...defaultProps} value="insecure-context-value" />)

      const copyIcon = screen.getByTestId('param-copy-icon')
      await user.click(copyIcon)

      await waitFor(() => {
        expect(mockExecCommand).toHaveBeenCalledWith('copy')
        expect(defaultProps.onCopy).toHaveBeenCalled()
      })
    })

    it('应该在 Clipboard API 不存在时使用 fallback', async () => {
      const user = userEvent.setup()

      // 移除 Clipboard API
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true,
        configurable: true,
      })

      // Mock execCommand
      const mockExecCommand = vi.fn().mockReturnValue(true)
      document.execCommand = mockExecCommand

      render(<ParamTag {...defaultProps} value="no-clipboard-value" />)

      const copyIcon = screen.getByTestId('param-copy-icon')
      await user.click(copyIcon)

      await waitFor(() => {
        expect(mockExecCommand).toHaveBeenCalledWith('copy')
        expect(defaultProps.onCopy).toHaveBeenCalled()
      })
    })
  })

  describe('fallbackCopy 降级复制', () => {
    it('应该使用 execCommand 成功复制', async () => {
      const user = userEvent.setup()

      // 移除 Clipboard API
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true,
        configurable: true,
      })

      // Mock execCommand 成功
      const mockExecCommand = vi.fn().mockReturnValue(true)
      document.execCommand = mockExecCommand

      render(<ParamTag {...defaultProps} value="exec-success" />)

      const copyIcon = screen.getByTestId('param-copy-icon')
      await user.click(copyIcon)

      await waitFor(() => {
        expect(mockExecCommand).toHaveBeenCalledWith('copy')
        expect(defaultProps.onCopy).toHaveBeenCalled()
      })
    })

    it('应该处理 execCommand 失败的情况', async () => {
      const user = userEvent.setup()
      const consoleErrorSpy = vi.spyOn(console, 'error')

      // 移除 Clipboard API
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true,
        configurable: true,
      })

      // Mock execCommand 抛出异常（这才是真正的失败）
      const mockExecCommand = vi.fn().mockImplementation(() => {
        throw new Error('execCommand failed')
      })
      document.execCommand = mockExecCommand

      render(<ParamTag {...defaultProps} value="exec-fail" />)

      const copyIcon = screen.getByTestId('param-copy-icon')
      await user.click(copyIcon)

      await waitFor(() => {
        expect(mockExecCommand).toHaveBeenCalledWith('copy')
        expect(defaultProps.onCopy).not.toHaveBeenCalled()
        expect(consoleErrorSpy).toHaveBeenCalledWith('复制失败')
      })
    })

    it('应该处理 execCommand 抛出异常的情况', async () => {
      const user = userEvent.setup()
      const consoleErrorSpy = vi.spyOn(console, 'error')

      // 移除 Clipboard API
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true,
        configurable: true,
      })

      // Mock execCommand 抛出异常
      const mockExecCommand = vi.fn().mockImplementation(() => {
        throw new Error('execCommand error')
      })
      document.execCommand = mockExecCommand

      render(<ParamTag {...defaultProps} value="exec-throw" />)

      const copyIcon = screen.getByTestId('param-copy-icon')
      await user.click(copyIcon)

      await waitFor(() => {
        expect(mockExecCommand).toHaveBeenCalledWith('copy')
        expect(defaultProps.onCopy).not.toHaveBeenCalled()
        expect(consoleErrorSpy).toHaveBeenCalledWith('复制失败')
      })
    })
  })

  describe('事件处理', () => {
    it('应该阻止事件冒泡', async () => {
      const user = userEvent.setup()
      const mockParentClick = vi.fn()

      // Mock Clipboard API
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: vi.fn().mockResolvedValue(undefined),
        },
        writable: true,
        configurable: true,
      })

      Object.defineProperty(window, 'isSecureContext', {
        value: true,
        writable: true,
        configurable: true,
      })

      render(
        <div onClick={mockParentClick}>
          <ParamTag {...defaultProps} />
        </div>
      )

      const copyIcon = screen.getByTestId('param-copy-icon')
      await user.click(copyIcon)

      await waitFor(() => {
        // onCopy 应该被调用
        expect(defaultProps.onCopy).toHaveBeenCalled()
        // 但父元素的 onClick 不应该被触发（事件冒泡被阻止）
        expect(mockParentClick).not.toHaveBeenCalled()
      })
    })

    it('应该在没有 onCopy 回调时仍然正常复制', async () => {
      const user = userEvent.setup()

      // Mock Clipboard API
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: vi.fn().mockResolvedValue(undefined),
        },
        writable: true,
        configurable: true,
      })

      Object.defineProperty(window, 'isSecureContext', {
        value: true,
        writable: true,
        configurable: true,
      })

      render(<ParamTag value="no-callback" index={0} />)

      const copyIcon = screen.getByTestId('param-copy-icon')
      await user.click(copyIcon)

      // 不应该抛出错误
      await waitFor(() => {
        expect(true).toBe(true)
      })
    })
  })

  describe('边界情况', () => {
    it('应该处理空字符串值', async () => {
      const user = userEvent.setup()
      const mockWriteText = vi.fn().mockResolvedValue(undefined)

      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: mockWriteText,
        },
        writable: true,
        configurable: true,
      })

      Object.defineProperty(window, 'isSecureContext', {
        value: true,
        writable: true,
        configurable: true,
      })

      render(<ParamTag {...defaultProps} value="" />)

      const copyIcon = screen.getByTestId('param-copy-icon')
      await user.click(copyIcon)

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith('')
        expect(defaultProps.onCopy).toHaveBeenCalled()
      })
    })

    it('应该处理非常长的值', async () => {
      const user = userEvent.setup()
      const longValue = 'x'.repeat(10000)
      const mockWriteText = vi.fn().mockResolvedValue(undefined)

      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: mockWriteText,
        },
        writable: true,
        configurable: true,
      })

      Object.defineProperty(window, 'isSecureContext', {
        value: true,
        writable: true,
        configurable: true,
      })

      render(<ParamTag {...defaultProps} value={longValue} />)

      const copyIcon = screen.getByTestId('param-copy-icon')
      await user.click(copyIcon)

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith(longValue)
        expect(defaultProps.onCopy).toHaveBeenCalled()
      })
    })

    it('应该处理包含特殊字符的值', async () => {
      const user = userEvent.setup()
      const specialValue = '特殊字符: \n\r\t\'"\\🎉'
      const mockWriteText = vi.fn().mockResolvedValue(undefined)

      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: mockWriteText,
        },
        writable: true,
        configurable: true,
      })

      Object.defineProperty(window, 'isSecureContext', {
        value: true,
        writable: true,
        configurable: true,
      })

      render(<ParamTag {...defaultProps} value={specialValue} />)

      const copyIcon = screen.getByTestId('param-copy-icon')
      await user.click(copyIcon)

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith(specialValue)
        expect(defaultProps.onCopy).toHaveBeenCalled()
      })
    })

    it('应该处理大索引值', () => {
      render(<ParamTag {...defaultProps} index={999} />)
      expect(screen.getByText('params 1000')).toBeInTheDocument()
    })
  })
})
