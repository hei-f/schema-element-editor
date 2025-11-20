import React from 'react'
import { ErrorContainer, RetryButton } from './styles'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Monaco Editor 错误边界
 * 捕获并静默处理 Monaco Editor 的 Worker 相关错误
 */
export class MonacoErrorBoundary extends React.Component<Props, State> {
  private originalConsoleError: typeof console.error
  private originalConsoleWarn: typeof console.warn
  
  // Monaco Worker 相关错误关键词（静态常量，可在静态方法中使用）
  private static readonly monacoErrorKeywords = [
    'Could not create web worker',
    'Web Workers are disabled',
    'Workers are disabled',
    'Unexpected usage',
    'loadForeignModule',
    "reading 'then'",
    'MonacoEnvironment.getWorker',
    'getWorkerUrl',
    'worker',
    'monaco',
    'Could not establish connection. Receiving end does not exist.',
    'Uncaught SyntaxError'
  ]

  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
    
    this.originalConsoleError = console.error
    this.originalConsoleWarn = console.warn
  }
  
  private static isMonacoError(message: string): boolean {
    return MonacoErrorBoundary.monacoErrorKeywords.some(keyword => message.includes(keyword))
  }
  
  private isMonacoErrorInstance(message: string): boolean {
    return MonacoErrorBoundary.isMonacoError(message)
  }

  componentDidMount() {
    // 拦截 console.error 和 console.warn，过滤 Monaco Worker 相关错误
    console.error = (...args: any[]) => {
      const message = args.join(' ')
      
      if (this.isMonacoErrorInstance(message)) {
        // 静默处理，不输出到控制台
        return
      }
      
      // 其他错误正常输出
      this.originalConsoleError.apply(console, args)
    }

    console.warn = (...args: any[]) => {
      const message = args.join(' ')
      
      if (this.isMonacoErrorInstance(message) || message.includes('Falling back to loading web worker code in main thread')) {
        // 静默处理
        return
      }
      
      // 其他警告正常输出
      this.originalConsoleWarn.apply(console, args)
    }

    // 拦截全局错误事件
    window.addEventListener('error', this.handleGlobalError, true)
    
    // 拦截未处理的 Promise rejection
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection, true)
  }

  componentWillUnmount() {
    // 恢复原始的 console 方法
    console.error = this.originalConsoleError
    console.warn = this.originalConsoleWarn
    
    // 移除全局错误监听
    window.removeEventListener('error', this.handleGlobalError, true)
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection, true)
  }

  handleGlobalError = (event: ErrorEvent) => {
    const message = event.message || event.error?.message || ''
    
    if (this.isMonacoErrorInstance(message)) {
      event.preventDefault()
      event.stopPropagation()
      return false
    }
  }

  handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const reason = event.reason
    const message = typeof reason === 'string' ? reason : reason?.message || ''
    
    if (this.isMonacoErrorInstance(message)) {
      event.preventDefault()
      event.stopImmediatePropagation()
      return false
    }
  }

  static getDerivedStateFromError(error: Error): State {
    // 如果是 Monaco 相关错误，静默处理
    if (MonacoErrorBoundary.isMonacoError(error.message)) {
      return { hasError: false, error: null }
    }
    
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Monaco 相关错误不记录
    if (MonacoErrorBoundary.isMonacoError(error.message)) {
      return
    }
    
    // 其他错误记录到控制台
    console.error('Monaco Editor Error Boundary 捕获到错误:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <h3>编辑器加载失败</h3>
          <p>{this.state.error?.message || '未知错误'}</p>
          <RetryButton 
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            重试
          </RetryButton>
        </ErrorContainer>
      )
    }

    return this.props.children
  }
}

