import { shadowRootManager } from '../shadow-root-manager'

describe('shadowRootManager', () => {
  let mockShadowRoot: ShadowRoot

  beforeEach(() => {
    // 重置单例状态
    shadowRootManager.reset()
    
    // 创建 mock shadowRoot
    mockShadowRoot = document.createElement('div') as unknown as ShadowRoot
  })

  afterEach(() => {
    shadowRootManager.reset()
  })

  describe('init', () => {
    it('应该成功初始化 shadowRoot', () => {
      expect(() => {
        shadowRootManager.init(mockShadowRoot)
      }).not.toThrow()
    })

    it('应该在重复初始化时显示警告', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()

      shadowRootManager.init(mockShadowRoot)
      shadowRootManager.init(mockShadowRoot)

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'ShadowRoot already initialized, overwriting...'
      )

      consoleWarnSpy.mockRestore()
    })

    it('应该允许覆盖已有的 shadowRoot', () => {
      const firstShadowRoot = document.createElement('div') as unknown as ShadowRoot
      const secondShadowRoot = document.createElement('span') as unknown as ShadowRoot

      shadowRootManager.init(firstShadowRoot)
      shadowRootManager.init(secondShadowRoot)

      expect(shadowRootManager.get()).toBe(secondShadowRoot)
    })
  })

  describe('get', () => {
    it('应该返回已初始化的 shadowRoot', () => {
      shadowRootManager.init(mockShadowRoot)
      
      const result = shadowRootManager.get()
      
      expect(result).toBe(mockShadowRoot)
    })

    it('应该在未初始化时抛出错误', () => {
      expect(() => {
        shadowRootManager.get()
      }).toThrow('ShadowRoot not initialized. Call shadowRootManager.init() first.')
    })

    it('应该在多次调用时返回相同的实例', () => {
      shadowRootManager.init(mockShadowRoot)
      
      const first = shadowRootManager.get()
      const second = shadowRootManager.get()
      
      expect(first).toBe(second)
    })
  })

  describe('getContainer', () => {
    it('应该返回类型转换后的 shadowRoot', () => {
      shadowRootManager.init(mockShadowRoot)
      
      const container = shadowRootManager.getContainer()
      
      // 应该返回 HTMLElement 类型
      expect(container).toBe(mockShadowRoot)
    })

    it('应该在未初始化时抛出错误', () => {
      expect(() => {
        shadowRootManager.getContainer()
      }).toThrow('ShadowRoot not initialized. Call shadowRootManager.init() first.')
    })

    it('应该可以作为 Ant Design getContainer 使用', () => {
      shadowRootManager.init(mockShadowRoot)
      
      // 模拟 Ant Design Modal 的 getContainer 属性
      const modalConfig = {
        title: 'Test',
        getContainer: shadowRootManager.getContainer
      }
      
      expect(typeof modalConfig.getContainer).toBe('function')
      expect(modalConfig.getContainer()).toBe(mockShadowRoot)
    })
  })

  describe('reset', () => {
    it('应该清除已初始化的 shadowRoot', () => {
      shadowRootManager.init(mockShadowRoot)
      shadowRootManager.reset()
      
      expect(() => {
        shadowRootManager.get()
      }).toThrow('ShadowRoot not initialized')
    })

    it('应该允许在重置后重新初始化', () => {
      const firstShadowRoot = document.createElement('div') as unknown as ShadowRoot
      const secondShadowRoot = document.createElement('span') as unknown as ShadowRoot

      shadowRootManager.init(firstShadowRoot)
      shadowRootManager.reset()
      shadowRootManager.init(secondShadowRoot)

      expect(shadowRootManager.get()).toBe(secondShadowRoot)
    })

    it('应该在未初始化时也能安全调用', () => {
      expect(() => {
        shadowRootManager.reset()
      }).not.toThrow()
    })
  })

  describe('使用场景测试', () => {
    it('应该支持在多个组件中使用', () => {
      shadowRootManager.init(mockShadowRoot)

      // 模拟多个组件调用
      const container1 = shadowRootManager.getContainer()
      const container2 = shadowRootManager.getContainer()
      const container3 = shadowRootManager.get()

      expect(container1).toBe(mockShadowRoot)
      expect(container2).toBe(mockShadowRoot)
      expect(container3).toBe(mockShadowRoot)
    })

    it('应该在整个应用生命周期内保持单例', () => {
      shadowRootManager.init(mockShadowRoot)

      // 模拟时间流逝和多次访问
      const results: ShadowRoot[] = []
      for (let i = 0; i < 10; i++) {
        results.push(shadowRootManager.get())
      }

      // 所有结果应该指向同一个实例
      results.forEach(result => {
        expect(result).toBe(mockShadowRoot)
      })
    })
  })

  describe('类型安全测试', () => {
    it('get 应该返回 ShadowRoot 类型', () => {
      shadowRootManager.init(mockShadowRoot)
      
      const result = shadowRootManager.get()
      
      // TypeScript 类型检查会在编译时验证
      // 这里我们验证运行时返回的是正确的对象
      expect(result).toBe(mockShadowRoot)
    })

    it('getContainer 应该返回可以作为 HTMLElement 使用的对象', () => {
      shadowRootManager.init(mockShadowRoot)
      
      const container = shadowRootManager.getContainer()
      
      // 验证返回的对象可以被使用
      expect(container).toBeTruthy()
      expect(typeof container).toBe('object')
    })
  })

  describe('边界情况', () => {
    it('应该处理 null 初始化', () => {
      expect(() => {
        shadowRootManager.init(null as any)
      }).not.toThrow()
      
      expect(shadowRootManager.get()).toBeNull()
    })

    it('应该在快速连续调用时保持稳定', () => {
      shadowRootManager.init(mockShadowRoot)

      // 快速连续调用
      const promises = Array.from({ length: 100 }, () => {
        return Promise.resolve(shadowRootManager.get())
      })

      return Promise.all(promises).then(results => {
        results.forEach(result => {
          expect(result).toBe(mockShadowRoot)
        })
      })
    })
  })
})

