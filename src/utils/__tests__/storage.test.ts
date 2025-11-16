import { storage } from '../storage';

describe('Storage工具测试', () => {
  beforeEach(() => {
    // 清除所有mock调用记录
    jest.clearAllMocks()
    
    // 重置chrome.storage.local.get的mock返回值
    ;(chrome.storage.local.get as jest.Mock).mockImplementation(() => Promise.resolve({}))
  })

  describe('getActiveState', () => {
    it('应该返回默认值false', async () => {
      const result = await storage.getActiveState()
      expect(result).toBe(false)
    })

    it('应该返回存储的值', async () => {
      ;(chrome.storage.local.get as jest.Mock).mockResolvedValue({ isActive: true })
      
      const result = await storage.getActiveState()
      expect(result).toBe(true)
    })
  })

  describe('setActiveState', () => {
    it('应该保存激活状态', async () => {
      await storage.setActiveState(true)
      
      expect(chrome.storage.local.set).toHaveBeenCalledWith({ isActive: true })
    })

    it('应该保存非激活状态', async () => {
      await storage.setActiveState(false)
      
      expect(chrome.storage.local.set).toHaveBeenCalledWith({ isActive: false })
    })
  })

  describe('getDrawerWidth', () => {
    it('应该返回默认宽度800', async () => {
      const result = await storage.getDrawerWidth()
      expect(result).toBe(800)
    })

    it('应该返回存储的宽度', async () => {
      ;(chrome.storage.local.get as jest.Mock).mockResolvedValue({ drawerWidth: 1200 })
      
      const result = await storage.getDrawerWidth()
      expect(result).toBe(1200)
    })
  })

  describe('setDrawerWidth', () => {
    it('应该保存抽屉宽度', async () => {
      await storage.setDrawerWidth(1000)
      
      expect(chrome.storage.local.set).toHaveBeenCalledWith({ drawerWidth: 1000 })
    })

    it('应该处理最小宽度', async () => {
      await storage.setDrawerWidth(400)
      
      expect(chrome.storage.local.set).toHaveBeenCalledWith({ drawerWidth: 400 })
    })
  })

  describe('getAttributeName', () => {
    it('应该返回默认属性名schema-params', async () => {
      const result = await storage.getAttributeName()
      expect(result).toBe('schema-params')
    })

    it('应该返回存储的属性名', async () => {
      ;(chrome.storage.local.get as jest.Mock).mockResolvedValue({ attributeName: 'custom-attr' })
      
      const result = await storage.getAttributeName()
      expect(result).toBe('custom-attr')
    })
  })

  describe('setAttributeName', () => {
    it('应该保存属性名', async () => {
      await storage.setAttributeName('my-schema')
      
      expect(chrome.storage.local.set).toHaveBeenCalledWith({ attributeName: 'my-schema' })
    })

    it('应该保存kebab-case格式的属性名', async () => {
      await storage.setAttributeName('data-params')
      
      expect(chrome.storage.local.set).toHaveBeenCalledWith({ attributeName: 'data-params' })
    })
  })

  describe('getAllData', () => {
    it('应该返回所有默认值', async () => {
      const result = await storage.getAllData()
      
      expect(result).toEqual({
        isActive: false,
        drawerWidth: 800,
        attributeName: 'schema-params',
        searchConfig: {
          searchDepthDown: 5,
          searchDepthUp: 0,
          throttleInterval: 16
        }
      })
    })

    it('应该返回所有存储的值', async () => {
      ;(chrome.storage.local.get as jest.Mock).mockResolvedValue({
        isActive: true,
        drawerWidth: 1000,
        attributeName: 'custom-attr',
        searchConfig: {
          searchDepthDown: 10,
          searchDepthUp: 5,
          throttleInterval: 8
        }
      })
      
      const result = await storage.getAllData()
      
      expect(result).toEqual({
        isActive: true,
        drawerWidth: 1000,
        attributeName: 'custom-attr',
        searchConfig: {
          searchDepthDown: 10,
          searchDepthUp: 5,
          throttleInterval: 8
        }
      })
    })

    it('应该合并默认值和存储值', async () => {
      ;(chrome.storage.local.get as jest.Mock).mockResolvedValue({
        isActive: true
      })
      
      const result = await storage.getAllData()
      
      expect(result).toEqual({
        isActive: true,
        drawerWidth: 800,
        attributeName: 'schema-params',
        searchConfig: {
          searchDepthDown: 5,
          searchDepthUp: 0,
          throttleInterval: 16
        }
      })
    })
  })

  describe('getSearchConfig', () => {
    it('应该返回默认搜索配置', async () => {
      const result = await storage.getSearchConfig()
      
      expect(result).toEqual({
        searchDepthDown: 5,
        searchDepthUp: 0,
        throttleInterval: 16
      })
    })

    it('应该返回存储的搜索配置', async () => {
      ;(chrome.storage.local.get as jest.Mock).mockResolvedValue({
        searchConfig: {
          searchDepthDown: 10,
          searchDepthUp: 5,
          throttleInterval: 32
        }
      })
      
      const result = await storage.getSearchConfig()
      
      expect(result).toEqual({
        searchDepthDown: 10,
        searchDepthUp: 5,
        throttleInterval: 32
      })
    })

    it('应该处理部分存储的配置', async () => {
      ;(chrome.storage.local.get as jest.Mock).mockResolvedValue({
        searchConfig: {
          searchDepthDown: 8
        }
      })
      
      const result = await storage.getSearchConfig()
      
      // 应该返回存储的值，因为我们存储的是整个对象
      expect(result.searchDepthDown).toBe(8)
    })
  })

  describe('setSearchConfig', () => {
    it('应该保存完整的搜索配置', async () => {
      ;(chrome.storage.local.get as jest.Mock).mockResolvedValue({
        searchConfig: {
          searchDepthDown: 5,
          searchDepthUp: 0,
          throttleInterval: 16
        }
      })

      await storage.setSearchConfig({
        searchDepthDown: 10,
        searchDepthUp: 5,
        throttleInterval: 32
      })
      
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        searchConfig: {
          searchDepthDown: 10,
          searchDepthUp: 5,
          throttleInterval: 32
        }
      })
    })

    it('应该支持部分更新搜索配置', async () => {
      ;(chrome.storage.local.get as jest.Mock).mockResolvedValue({
        searchConfig: {
          searchDepthDown: 5,
          searchDepthUp: 0,
          throttleInterval: 16
        }
      })

      await storage.setSearchConfig({
        searchDepthDown: 8
      })
      
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        searchConfig: {
          searchDepthDown: 8,
          searchDepthUp: 0,
          throttleInterval: 16
        }
      })
    })

    it('应该保存throttleInterval的变更', async () => {
      ;(chrome.storage.local.get as jest.Mock).mockResolvedValue({
        searchConfig: {
          searchDepthDown: 5,
          searchDepthUp: 0,
          throttleInterval: 16
        }
      })

      await storage.setSearchConfig({
        throttleInterval: 50
      })
      
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        searchConfig: {
          searchDepthDown: 5,
          searchDepthUp: 0,
          throttleInterval: 50
        }
      })
    })
  })

  describe('错误处理', () => {
    it('get操作失败时应该返回默认值', async () => {
      ;(chrome.storage.local.get as jest.Mock).mockRejectedValue(new Error('Storage error'))
      
      const result = await storage.getActiveState()
      expect(result).toBe(false)
    })

    it('set操作失败时不应该抛出错误', async () => {
      ;(chrome.storage.local.set as jest.Mock).mockRejectedValue(new Error('Storage error'))
      
      // setActiveState内部捕获了错误，不会抛出
      await expect(storage.setActiveState(true)).resolves.not.toThrow()
    })
  })
})

