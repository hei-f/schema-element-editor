/**
 * Monaco Loader 实际功能测试
 */

import { configureMonaco } from '../browser/monaco'

// Mock @monaco-editor/react
jest.mock('@monaco-editor/react', () => ({
  loader: {
    config: jest.fn()
  }
}))

// Mock monaco-editor
jest.mock('monaco-editor', () => ({
  languages: {
    json: {
      jsonDefaults: {
        setDiagnosticsOptions: jest.fn()
      }
    }
  }
}))

describe('Monaco配置测试', () => {
  let originalMonacoEnvironment: any

  beforeEach(() => {
    // 保存原始环境
    originalMonacoEnvironment = (self as any).MonacoEnvironment
    
    // 清除MonacoEnvironment
    delete (self as any).MonacoEnvironment
    
    jest.clearAllMocks()
  })

  afterEach(() => {
    // 恢复原始环境
    if (originalMonacoEnvironment !== undefined) {
      ;(self as any).MonacoEnvironment = originalMonacoEnvironment
    } else {
      delete (self as any).MonacoEnvironment
    }
  })

  it('首次配置应该返回true', () => {
    const result = configureMonaco()
    
    expect(result).toBe(true)
    expect((self as any).MonacoEnvironment).toBeDefined()
  })

  it('应该配置getWorker函数', () => {
    configureMonaco()
    
    const env = (self as any).MonacoEnvironment
    expect(env.getWorker).toBeDefined()
    expect(typeof env.getWorker).toBe('function')
  })

  it('已有配置时应该返回false', () => {
    // 预先设置环境
    ;(self as any).MonacoEnvironment = {
      getWorker: jest.fn()
    }
    
    const result = configureMonaco()
    
    expect(result).toBe(false)
  })

  it('不应该覆盖已有的配置', () => {
    const existingWorker = jest.fn()
    ;(self as any).MonacoEnvironment = {
      getWorker: existingWorker
    }
    
    configureMonaco()
    
    expect((self as any).MonacoEnvironment.getWorker).toBe(existingWorker)
  })

  it('getWorker应该返回函数', () => {
    configureMonaco()
    
    const getWorker = (self as any).MonacoEnvironment.getWorker
    
    expect(typeof getWorker).toBe('function')
  })

  it('应该配置loader', () => {
    const { loader } = require('@monaco-editor/react')
    
    configureMonaco()
    
    expect(loader.config).toHaveBeenCalled()
  })
})

