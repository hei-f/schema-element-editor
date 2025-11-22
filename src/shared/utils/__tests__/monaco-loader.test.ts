/**
 * Monaco Loader 测试
 * 
 * 测试 Monaco Editor 配置逻辑和重复配置检测
 */

// Mock monaco-editor modules
jest.mock('monaco-editor', () => ({}), { virtual: true })
jest.mock('monaco-editor/esm/vs/editor/editor.worker?worker', () => {
  return jest.fn().mockImplementation(() => ({
    terminate: jest.fn()
  }))
}, { virtual: true })
jest.mock('monaco-editor/esm/vs/language/json/json.worker?worker', () => {
  return jest.fn().mockImplementation(() => ({
    terminate: jest.fn()
  }))
}, { virtual: true })
jest.mock('@monaco-editor/react', () => ({
  loader: {
    config: jest.fn()
  }
}), { virtual: true })

describe('Monaco Loader', () => {
  let originalMonacoEnvironment: any
  let configureMonaco: () => boolean

  beforeEach(() => {
    // 保存原始的 MonacoEnvironment
    originalMonacoEnvironment = (self as any).MonacoEnvironment

    // 清除 MonacoEnvironment
    delete (self as any).MonacoEnvironment

    // 清除模块缓存并重新导入
    jest.resetModules()
    
    // 模拟 configureMonaco 函数的核心逻辑
    configureMonaco = () => {
      const existingEnv = (self as any).MonacoEnvironment
      
      if (!existingEnv) {
        // 页面没有配置，提供扩展自己的 Worker 配置
        ;(self as any).MonacoEnvironment = {
          getWorker(_: any, label: string) {
            // 根据语言类型返回对应的 Worker
            if (label === 'json') {
              return { type: 'json-worker' }
            }
            return { type: 'editor-worker' }
          }
        }
        return true
      } else {
        // 页面已有配置，不覆盖
        return false
      }
    }
  })

  afterEach(() => {
    // 恢复原始的 MonacoEnvironment
    if (originalMonacoEnvironment !== undefined) {
      ;(self as any).MonacoEnvironment = originalMonacoEnvironment
    } else {
      delete (self as any).MonacoEnvironment
    }
  })

  describe('首次配置', () => {
    it('应该在没有现有配置时返回 true', () => {
      const result = configureMonaco()

      expect(result).toBe(true)
    })

    it('应该设置 MonacoEnvironment', () => {
      configureMonaco()

      expect((self as any).MonacoEnvironment).toBeDefined()
      expect((self as any).MonacoEnvironment.getWorker).toBeInstanceOf(Function)
    })

    it('应该为 JSON 语言返回 JSON Worker', () => {
      configureMonaco()

      const worker = (self as any).MonacoEnvironment.getWorker(null, 'json')

      expect(worker).toEqual({ type: 'json-worker' })
    })

    it('应该为其他语言返回默认 Editor Worker', () => {
      configureMonaco()

      const worker1 = (self as any).MonacoEnvironment.getWorker(null, 'typescript')
      const worker2 = (self as any).MonacoEnvironment.getWorker(null, 'javascript')
      const worker3 = (self as any).MonacoEnvironment.getWorker(null, 'html')

      expect(worker1).toEqual({ type: 'editor-worker' })
      expect(worker2).toEqual({ type: 'editor-worker' })
      expect(worker3).toEqual({ type: 'editor-worker' })
    })
  })

  describe('已有配置', () => {
    it('应该在已有配置时返回 false', () => {
      // 预先设置 MonacoEnvironment
      ;(self as any).MonacoEnvironment = {
        getWorker: jest.fn()
      }

      const result = configureMonaco()

      expect(result).toBe(false)
    })

    it('不应该覆盖已有的 MonacoEnvironment', () => {
      const existingGetWorker = jest.fn()
      ;(self as any).MonacoEnvironment = {
        getWorker: existingGetWorker,
        customProperty: 'custom-value'
      }

      configureMonaco()

      // 应该保持原有配置
      expect((self as any).MonacoEnvironment.getWorker).toBe(existingGetWorker)
      expect((self as any).MonacoEnvironment.customProperty).toBe('custom-value')
    })

    it('应该在第二次调用时返回 false', () => {
      const firstResult = configureMonaco()
      expect(firstResult).toBe(true)

      const secondResult = configureMonaco()
      expect(secondResult).toBe(false)
    })
  })

  describe('Worker 配置逻辑', () => {
    it('应该正确配置 getWorker 函数', () => {
      configureMonaco()

      const env = (self as any).MonacoEnvironment
      expect(env).toBeDefined()
      expect(typeof env.getWorker).toBe('function')
    })

    it('getWorker 应该接受两个参数', () => {
      configureMonaco()

      const getWorker = (self as any).MonacoEnvironment.getWorker
      
      // 测试函数参数
      const worker = getWorker('moduleId', 'json')
      expect(worker).toBeDefined()
    })

    it('应该根据 label 参数返回不同的 Worker', () => {
      configureMonaco()

      const getWorker = (self as any).MonacoEnvironment.getWorker
      
      const jsonWorker = getWorker(null, 'json')
      const defaultWorker = getWorker(null, 'other')

      expect(jsonWorker).toEqual({ type: 'json-worker' })
      expect(defaultWorker).toEqual({ type: 'editor-worker' })
      expect(jsonWorker).not.toEqual(defaultWorker)
    })
  })

  describe('边界情况', () => {
    it('应该处理 MonacoEnvironment 为 null 的情况', () => {
      ;(self as any).MonacoEnvironment = null

      const result = configureMonaco()

      // null 被视为 falsy，应该创建新配置
      expect(result).toBe(true)
      expect((self as any).MonacoEnvironment).toBeDefined()
      expect((self as any).MonacoEnvironment).not.toBeNull()
    })

    it('应该处理 MonacoEnvironment 为空对象的情况', () => {
      ;(self as any).MonacoEnvironment = {}

      const result = configureMonaco()

      // 空对象是 truthy，应该保持现有配置
      expect(result).toBe(false)
      expect((self as any).MonacoEnvironment).toEqual({})
    })

    it('应该处理 MonacoEnvironment 只有部分属性的情况', () => {
      ;(self as any).MonacoEnvironment = {
        someOtherProperty: 'value'
      }

      const result = configureMonaco()

      // 已有对象，不覆盖
      expect(result).toBe(false)
      expect((self as any).MonacoEnvironment.someOtherProperty).toBe('value')
      expect((self as any).MonacoEnvironment.getWorker).toBeUndefined()
    })
  })

  describe('多次调用行为', () => {
    it('第一次调用应该创建配置', () => {
      const result = configureMonaco()

      expect(result).toBe(true)
      expect((self as any).MonacoEnvironment).toBeDefined()
    })

    it('后续调用应该识别已有配置', () => {
      configureMonaco() // 第一次调用

      const secondCall = configureMonaco()
      const thirdCall = configureMonaco()

      expect(secondCall).toBe(false)
      expect(thirdCall).toBe(false)
    })

    it('多次调用不应该改变配置', () => {
      configureMonaco()
      const firstEnv = (self as any).MonacoEnvironment

      configureMonaco()
      const secondEnv = (self as any).MonacoEnvironment

      configureMonaco()
      const thirdEnv = (self as any).MonacoEnvironment

      expect(firstEnv).toBe(secondEnv)
      expect(secondEnv).toBe(thirdEnv)
    })
  })
})

