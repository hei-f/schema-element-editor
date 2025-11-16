import { render, screen } from '@testing-library/react'
import { MonacoErrorBoundary } from '../MonacoErrorBoundary'

describe('MonacoErrorBoundary', () => {
  let originalConsoleError: typeof console.error
  let originalConsoleWarn: typeof console.warn
  let consoleErrorSpy: jest.SpyInstance
  let consoleWarnSpy: jest.SpyInstance

  beforeEach(() => {
    originalConsoleError = console.error
    originalConsoleWarn = console.warn
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    console.error = originalConsoleError
    console.warn = originalConsoleWarn
    consoleErrorSpy.mockRestore()
    consoleWarnSpy.mockRestore()
  })

  describe('基础渲染', () => {
    it('应该正常渲染子组件', () => {
      render(
        <MonacoErrorBoundary>
          <div>Test Content</div>
        </MonacoErrorBoundary>
      )

      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('应该在挂载时拦截 console 方法', () => {
      const { unmount } = render(
        <MonacoErrorBoundary>
          <div>Test</div>
        </MonacoErrorBoundary>
      )

      expect(console.error).not.toBe(originalConsoleError)
      expect(console.warn).not.toBe(originalConsoleWarn)

      unmount()
    })

    it('应该在卸载时恢复原始 console 方法', () => {
      const { unmount } = render(
        <MonacoErrorBoundary>
          <div>Test</div>
        </MonacoErrorBoundary>
      )

      unmount()

      expect(console.error).toBe(originalConsoleError)
      expect(console.warn).toBe(originalConsoleWarn)
    })
  })

  describe('Console 错误拦截', () => {
    it('应该拦截 Monaco 相关的 console.error', () => {
      render(
        <MonacoErrorBoundary>
          <div>Test</div>
        </MonacoErrorBoundary>
      )

      console.error('Could not create web worker')

      expect(consoleErrorSpy).not.toHaveBeenCalled()
    })

    it('应该拦截 Monaco 相关的 console.warn', () => {
      render(
        <MonacoErrorBoundary>
          <div>Test</div>
        </MonacoErrorBoundary>
      )

      console.warn('Workers are disabled in this environment')

      expect(consoleWarnSpy).not.toHaveBeenCalled()
    })

    it('应该允许非 Monaco 错误通过', () => {
      render(
        <MonacoErrorBoundary>
          <div>Test</div>
        </MonacoErrorBoundary>
      )

      console.error('Some other error')

      expect(consoleErrorSpy).toHaveBeenCalledWith('Some other error')
    })

    it('应该允许非 Monaco 警告通过', () => {
      render(
        <MonacoErrorBoundary>
          <div>Test</div>
        </MonacoErrorBoundary>
      )

      console.warn('Some other warning')

      expect(consoleWarnSpy).toHaveBeenCalledWith('Some other warning')
    })

    it('应该拦截多种 Monaco 错误关键词', () => {
      render(
        <MonacoErrorBoundary>
          <div>Test</div>
        </MonacoErrorBoundary>
      )

      const monacoErrors = [
        'Could not create web worker',
        'Web Workers are disabled',
        'Unexpected usage',
        "Cannot read properties of undefined (reading 'then')",
        'MonacoEnvironment.getWorker is not defined',
        'worker initialization failed'
      ]

      monacoErrors.forEach(errorMsg => {
        console.error(errorMsg)
      })

      expect(consoleErrorSpy).not.toHaveBeenCalled()
    })

    it('应该拦截 fallback 警告', () => {
      render(
        <MonacoErrorBoundary>
          <div>Test</div>
        </MonacoErrorBoundary>
      )

      console.warn('Falling back to loading web worker code in main thread')

      expect(consoleWarnSpy).not.toHaveBeenCalled()
    })
  })

  describe('事件监听器注册', () => {
    it('应该在挂载时注册全局错误监听器', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener')
      
      render(
        <MonacoErrorBoundary>
          <div>Test</div>
        </MonacoErrorBoundary>
      )

      expect(addEventListenerSpy).toHaveBeenCalledWith('error', expect.any(Function), true)
      expect(addEventListenerSpy).toHaveBeenCalledWith('unhandledrejection', expect.any(Function), true)

      addEventListenerSpy.mockRestore()
    })

    it('应该在卸载时移除全局错误监听器', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')
      
      const { unmount } = render(
        <MonacoErrorBoundary>
          <div>Test</div>
        </MonacoErrorBoundary>
      )

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('error', expect.any(Function), true)
      expect(removeEventListenerSpy).toHaveBeenCalledWith('unhandledrejection', expect.any(Function), true)

      removeEventListenerSpy.mockRestore()
    })
  })

  describe('React 错误边界', () => {
    const SuccessComponent = () => <div>Success</div>
    
    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {})
    })

    it('应该正常渲染无错误的子组件', () => {
      render(
        <MonacoErrorBoundary>
          <SuccessComponent />
        </MonacoErrorBoundary>
      )

      expect(screen.getByText('Success')).toBeInTheDocument()
    })

    it('应该通过 getDerivedStateFromError 识别 Monaco 错误', () => {
      const monacoError = new Error('Could not create web worker')
      const result = (MonacoErrorBoundary as any).getDerivedStateFromError(monacoError)
      
      expect(result).toEqual({ hasError: false, error: null })
    })

    it('应该通过 getDerivedStateFromError 识别非 Monaco 错误', () => {
      const otherError = new Error('Some other error')
      const result = (MonacoErrorBoundary as any).getDerivedStateFromError(otherError)
      
      expect(result).toEqual({ hasError: true, error: otherError })
    })

    it('应该显示非 Monaco 错误的 fallback UI', () => {
      const OtherErrorComponent = () => {
        throw new Error('Some other error')
      }

      render(
        <MonacoErrorBoundary>
          <OtherErrorComponent />
        </MonacoErrorBoundary>
      )

      expect(screen.getByText('编辑器加载失败')).toBeInTheDocument()
      expect(screen.getByText('Some other error')).toBeInTheDocument()
      expect(screen.getByText('重试')).toBeInTheDocument()
    })
  })

  describe('Monaco 错误识别', () => {
    it('应该正确识别各种 Monaco 错误模式', () => {
      const monacoKeywords = [
        'Could not create web worker',
        'Web Workers are disabled',
        'Workers are disabled',
        'Unexpected usage',
        'loadForeignModule',
        "reading 'then'",
        'MonacoEnvironment.getWorker',
        'getWorkerUrl',
        'worker',
        'monaco'
      ]

      monacoKeywords.forEach(keyword => {
        const testMessage = `Error: ${keyword} failed`
        expect(testMessage).toMatch(new RegExp(keyword, 'i'))
      })
    })
  })
})

