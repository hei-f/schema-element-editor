import * as elementDetector from '@/utils/element-detector'
import { storage } from '@/utils/storage'
import { ElementMonitor } from '../monitor'

// Mock storage和element-detector
jest.mock('@/utils/storage', () => ({
  storage: {
    getSearchConfig: jest.fn()
  }
}))

jest.mock('@/utils/element-detector', () => ({
  findElementWithSchemaParams: jest.fn(),
  getElementAttributes: jest.fn(),
  hasValidAttributes: jest.fn(),
  addHighlight: jest.fn(),
  removeHighlight: jest.fn(),
  addCandidateHighlight: jest.fn(),
  removeCandidateHighlight: jest.fn(),
  getMousePosition: jest.fn(() => ({ x: 100, y: 100 }))
}))

describe('ElementMonitor测试', () => {
  let monitor: ElementMonitor
  const mockGetSearchConfig = storage.getSearchConfig as jest.Mock
  const mockFindElementWithSchemaParams = elementDetector.findElementWithSchemaParams as jest.Mock
  const mockGetElementAttributes = elementDetector.getElementAttributes as jest.Mock
  const mockHasValidAttributes = elementDetector.hasValidAttributes as jest.Mock
  const mockAddHighlight = elementDetector.addHighlight as jest.Mock
  const mockAddCandidateHighlight = elementDetector.addCandidateHighlight as jest.Mock
  const mockRemoveCandidateHighlight = elementDetector.removeCandidateHighlight as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    
    // Mock requestAnimationFrame
    global.requestAnimationFrame = jest.fn((cb) => {
      cb(0)
      return 0
    }) as any
    
    global.cancelAnimationFrame = jest.fn()
    
    // 默认搜索配置
    mockGetSearchConfig.mockResolvedValue({
      searchDepthDown: 5,
      searchDepthUp: 3,
      throttleInterval: 100
    })
    
    // 默认 mock 返回值
    mockFindElementWithSchemaParams.mockResolvedValue({
      target: null,
      candidates: []
    })
    
    mockGetElementAttributes.mockResolvedValue({ params: [] })
    mockHasValidAttributes.mockReturnValue(false)

    monitor = new ElementMonitor()
  })

  afterEach(() => {
    monitor.stop()
    jest.useRealTimers()
  })

  describe('启动和停止', () => {
    it('应该成功启动监听器', async () => {
      await monitor.start()
      
      expect(mockGetSearchConfig).toHaveBeenCalled()
    })

    it('应该成功停止监听器', async () => {
      await monitor.start()
      monitor.stop()
      
      // 监听器已停止，不应该响应事件
    })

    it('重复启动不应该有副作用', async () => {
      await monitor.start()
      await monitor.start()
      
      expect(mockGetSearchConfig).toHaveBeenCalledTimes(1)
    })
  })

  describe('节流机制', () => {
    it('应该在节流间隔内忽略多次鼠标移动', async () => {
      await monitor.start()

      // 模拟Alt键按下
      const keyDownEvent = new KeyboardEvent('keydown', { altKey: true })
      document.dispatchEvent(keyDownEvent)

      // 创建实际的DOM元素作为target
      const target = document.createElement('div')
      document.body.appendChild(target)

      // 快速移动鼠标多次
      const createMouseEvent = (x: number, y: number) => {
        const event = new MouseEvent('mousemove', { clientX: x, clientY: y, altKey: true, bubbles: true })
        Object.defineProperty(event, 'target', { value: target, configurable: true })
        return event
      }

      document.dispatchEvent(createMouseEvent(100, 100))
      document.dispatchEvent(createMouseEvent(101, 101))
      document.dispatchEvent(createMouseEvent(102, 102))

      // RAF应该只被调度一次
      expect(requestAnimationFrame).toHaveBeenCalled()
      
      document.body.removeChild(target)
    })

    it('应该使用requestAnimationFrame执行搜索', async () => {
      await monitor.start()

      const keyDownEvent = new KeyboardEvent('keydown', { altKey: true })
      document.dispatchEvent(keyDownEvent)

      const target = document.createElement('div')
      document.body.appendChild(target)

      const mouseEvent = new MouseEvent('mousemove', { clientX: 100, clientY: 100, altKey: true, bubbles: true })
      Object.defineProperty(mouseEvent, 'target', { value: target, configurable: true })
      document.dispatchEvent(mouseEvent)

      expect(requestAnimationFrame).toHaveBeenCalled()
      
      document.body.removeChild(target)
    })

    it('应该在节流间隔后允许新的搜索', async () => {
      mockGetSearchConfig.mockResolvedValue({
        searchDepthDown: 5,
        searchDepthUp: 3,
        throttleInterval: 50
      })

      await monitor.start()

      const keyDownEvent = new KeyboardEvent('keydown', { altKey: true })
      document.dispatchEvent(keyDownEvent)

      const target = document.createElement('div')
      document.body.appendChild(target)

      const createMouseEvent = (x: number, y: number) => {
        const event = new MouseEvent('mousemove', { clientX: x, clientY: y, altKey: true, bubbles: true })
        Object.defineProperty(event, 'target', { value: target, configurable: true })
        return event
      }

      document.dispatchEvent(createMouseEvent(100, 100))

      // 前进时间超过节流间隔
      jest.advanceTimersByTime(60)

      document.dispatchEvent(createMouseEvent(200, 200))

      // 应该允许第二次搜索
      expect(requestAnimationFrame).toHaveBeenCalledTimes(2)
      
      document.body.removeChild(target)
    })
  })

  describe('智能搜索集成', () => {
    it('应该调用findElementWithSchemaParams进行搜索', async () => {
      const targetElement = document.createElement('div')
      mockFindElementWithSchemaParams.mockResolvedValue({
        target: targetElement,
        candidates: [targetElement]
      })
      mockGetElementAttributes.mockResolvedValue({ params: ['param1'] })
      mockHasValidAttributes.mockReturnValue(true)

      await monitor.start()

      const keyDownEvent = new KeyboardEvent('keydown', { altKey: true })
      document.dispatchEvent(keyDownEvent)

      const mouseEvent = new MouseEvent('mousemove', { clientX: 100, clientY: 100, altKey: true })
      document.dispatchEvent(mouseEvent)

      // 执行RAF回调
      jest.runAllTimers()
      await Promise.resolve()

      expect(mockFindElementWithSchemaParams).toHaveBeenCalledWith(100, 100)
    })

    it('应该在未找到元素时不添加高亮', async () => {
      mockFindElementWithSchemaParams.mockResolvedValue({
        target: null,
        candidates: []
      })

      await monitor.start()

      const keyDownEvent = new KeyboardEvent('keydown', { altKey: true })
      document.dispatchEvent(keyDownEvent)

      const mouseEvent = new MouseEvent('mousemove', { clientX: 100, clientY: 100, altKey: true })
      document.dispatchEvent(mouseEvent)

      jest.runAllTimers()
      await Promise.resolve()

      expect(mockAddHighlight).not.toHaveBeenCalled()
    })
  })

  describe('Alt键控制', () => {
    it('应该在按住Alt键时启用检测', async () => {
      await monitor.start()

      const keyDownEvent = new KeyboardEvent('keydown', { altKey: true })
      document.dispatchEvent(keyDownEvent)

      const mouseEvent = new MouseEvent('mousemove', { clientX: 100, clientY: 100, altKey: true })
      document.dispatchEvent(mouseEvent)

      expect(requestAnimationFrame).toHaveBeenCalled()
    })

    it('应该在释放Alt键时禁用检测', async () => {
      const targetElement = document.createElement('div')
      mockFindElementWithSchemaParams.mockResolvedValue({
        target: targetElement,
        candidates: [targetElement]
      })

      await monitor.start()

      // 按下Alt键
      const keyDownEvent = new KeyboardEvent('keydown', { altKey: true })
      document.dispatchEvent(keyDownEvent)

      // 释放Alt键
      const keyUpEvent = new KeyboardEvent('keyup', { altKey: false })
      document.dispatchEvent(keyUpEvent)

      // 移动鼠标不应该触发搜索
      const mouseEvent = new MouseEvent('mousemove', { clientX: 100, clientY: 100 })
      document.dispatchEvent(mouseEvent)

      expect(requestAnimationFrame).not.toHaveBeenCalled()
    })
  })

  describe('元素点击处理', () => {
    it('应该在未按Alt键时不响应点击', async () => {
      const callback = jest.fn()
      monitor.setOnElementClick(callback)
      
      await monitor.start()

      const clickEvent = new MouseEvent('click', {
        clientX: 100,
        clientY: 100,
        bubbles: true
      })
      document.dispatchEvent(clickEvent)

      expect(callback).not.toHaveBeenCalled()
    })
  })
})

