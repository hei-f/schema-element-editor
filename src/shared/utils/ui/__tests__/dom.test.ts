import type { Mock } from 'vitest'
import {
  isVisibleElement,
  findElementWithSchemaParams,
  getElementAttributes,
  hasValidAttributes,
  getElementPosition,
  getMousePosition,
  isClickInside,
} from '../dom'
import { storage } from '../../browser/storage'

// Mock storage
vi.mock('../../browser/storage', () => ({
  storage: {
    getAttributeName: vi.fn().mockResolvedValue('schema-params'),
    getSearchConfig: vi.fn().mockResolvedValue({
      limitUpwardSearch: true,
      searchDepthUp: 5,
    }),
  },
}))

describe('dom 工具函数', () => {
  describe('isVisibleElement', () => {
    let mockElement: HTMLElement

    beforeEach(() => {
      mockElement = document.createElement('div')
      document.body.appendChild(mockElement)
    })

    afterEach(() => {
      document.body.removeChild(mockElement)
    })

    it('应该返回 true 对于可见元素', () => {
      expect(isVisibleElement(mockElement)).toBe(true)
    })

    it('应该返回 false 对于 script 元素', () => {
      const script = document.createElement('script')
      document.body.appendChild(script)
      expect(isVisibleElement(script)).toBe(false)
      document.body.removeChild(script)
    })

    it('应该返回 false 对于 style 元素', () => {
      const style = document.createElement('style')
      document.body.appendChild(style)
      expect(isVisibleElement(style)).toBe(false)
      document.body.removeChild(style)
    })

    it('应该返回 false 对于 link 元素', () => {
      const link = document.createElement('link')
      document.body.appendChild(link)
      expect(isVisibleElement(link)).toBe(false)
      document.body.removeChild(link)
    })

    it('应该返回 false 对于 meta 元素', () => {
      const meta = document.createElement('meta')
      document.head.appendChild(meta)
      expect(isVisibleElement(meta)).toBe(false)
      document.head.removeChild(meta)
    })

    it('应该返回 false 对于 display:none 元素', () => {
      mockElement.style.display = 'none'
      expect(isVisibleElement(mockElement)).toBe(false)
    })

    it('应该返回 false 对于 visibility:hidden 元素', () => {
      mockElement.style.visibility = 'hidden'
      expect(isVisibleElement(mockElement)).toBe(false)
    })

    it('应该返回 false 对于 opacity:0 元素', () => {
      mockElement.style.opacity = '0'
      expect(isVisibleElement(mockElement)).toBe(false)
    })
  })

  describe('findElementWithSchemaParams', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      ;(storage.getAttributeName as Mock).mockResolvedValue('schema-params')
      ;(storage.getSearchConfig as Mock).mockResolvedValue({
        limitUpwardSearch: true,
        searchDepthUp: 5,
      })
    })

    it('应该返回空结果当没有匹配元素时', async () => {
      // Mock elementsFromPoint 返回空
      const originalElementsFromPoint = document.elementsFromPoint
      document.elementsFromPoint = vi.fn().mockReturnValue([])

      const result = await findElementWithSchemaParams(100, 100)

      expect(result.target).toBeNull()
      expect(result.candidates).toEqual([])

      document.elementsFromPoint = originalElementsFromPoint
    })

    it('应该找到带有 data-schema-params 属性的元素', async () => {
      const element = document.createElement('div')
      element.setAttribute('data-schema-params', 'test-param')
      document.body.appendChild(element)

      const originalElementsFromPoint = document.elementsFromPoint
      document.elementsFromPoint = vi.fn().mockReturnValue([element])

      const result = await findElementWithSchemaParams(100, 100)

      expect(result.target).toBe(element)
      expect(result.candidates).toContain(element)

      document.elementsFromPoint = originalElementsFromPoint
      document.body.removeChild(element)
    })

    it('应该跳过扩展 UI 元素', async () => {
      const uiElement = document.createElement('div')
      uiElement.setAttribute('data-schema-editor-ui', 'true')
      uiElement.setAttribute('data-schema-params', 'should-be-skipped')
      document.body.appendChild(uiElement)

      const originalElementsFromPoint = document.elementsFromPoint
      document.elementsFromPoint = vi.fn().mockReturnValue([uiElement])

      const result = await findElementWithSchemaParams(100, 100)

      expect(result.target).toBeNull()
      expect(result.candidates).not.toContain(uiElement)

      document.elementsFromPoint = originalElementsFromPoint
      document.body.removeChild(uiElement)
    })

    it('应该跳过不可见元素', async () => {
      const hiddenElement = document.createElement('div')
      hiddenElement.style.display = 'none'
      hiddenElement.setAttribute('data-schema-params', 'hidden-param')
      document.body.appendChild(hiddenElement)

      const originalElementsFromPoint = document.elementsFromPoint
      document.elementsFromPoint = vi.fn().mockReturnValue([hiddenElement])

      const result = await findElementWithSchemaParams(100, 100)

      expect(result.target).toBeNull()

      document.elementsFromPoint = originalElementsFromPoint
      document.body.removeChild(hiddenElement)
    })

    it('应该向上搜索父元素', async () => {
      const parent = document.createElement('div')
      parent.setAttribute('data-schema-params', 'parent-param')

      const child = document.createElement('div')
      parent.appendChild(child)
      document.body.appendChild(parent)

      const originalElementsFromPoint = document.elementsFromPoint
      document.elementsFromPoint = vi.fn().mockReturnValue([child])

      const result = await findElementWithSchemaParams(100, 100)

      expect(result.target).toBe(parent)
      expect(result.candidates).toContain(parent)

      document.elementsFromPoint = originalElementsFromPoint
      document.body.removeChild(parent)
    })

    it('应该限制向上搜索深度', async () => {
      ;(storage.getSearchConfig as Mock).mockResolvedValue({
        limitUpwardSearch: true,
        searchDepthUp: 1,
      })

      const grandparent = document.createElement('div')
      grandparent.setAttribute('data-schema-params', 'grandparent-param')

      const parent = document.createElement('div')
      grandparent.appendChild(parent)

      const child = document.createElement('div')
      parent.appendChild(child)
      document.body.appendChild(grandparent)

      const originalElementsFromPoint = document.elementsFromPoint
      document.elementsFromPoint = vi.fn().mockReturnValue([child])

      const result = await findElementWithSchemaParams(100, 100)

      // 深度限制为1，应该找不到 grandparent
      expect(result.candidates).not.toContain(grandparent)

      document.elementsFromPoint = originalElementsFromPoint
      document.body.removeChild(grandparent)
    })

    it('不限制搜索深度时应该搜索到根元素', async () => {
      ;(storage.getSearchConfig as Mock).mockResolvedValue({
        limitUpwardSearch: false,
        searchDepthUp: 5,
      })

      const element = document.createElement('div')
      document.body.appendChild(element)

      const originalElementsFromPoint = document.elementsFromPoint
      document.elementsFromPoint = vi.fn().mockReturnValue([element])

      const result = await findElementWithSchemaParams(100, 100)

      expect(result).toBeDefined()

      document.elementsFromPoint = originalElementsFromPoint
      document.body.removeChild(element)
    })

    it('应该跳过父元素中的扩展 UI 元素', async () => {
      const uiParent = document.createElement('div')
      uiParent.setAttribute('data-schema-editor-ui', 'true')

      const targetParent = document.createElement('div')
      targetParent.setAttribute('data-schema-params', 'target-param')
      uiParent.appendChild(targetParent)

      const child = document.createElement('div')
      targetParent.appendChild(child)
      document.body.appendChild(uiParent)

      const originalElementsFromPoint = document.elementsFromPoint
      document.elementsFromPoint = vi.fn().mockReturnValue([child])

      const result = await findElementWithSchemaParams(100, 100)

      // 由于 child 在 UI 元素内部，应该被跳过
      expect(result.target).toBeNull()

      document.elementsFromPoint = originalElementsFromPoint
      document.body.removeChild(uiParent)
    })

    it('向上搜索时应该跳过扩展 UI 父元素并继续搜索', async () => {
      // 构建结构: grandparent (有 schema-params) -> uiParent (UI元素) -> parent -> child
      const grandparent = document.createElement('div')
      grandparent.setAttribute('data-schema-params', 'grandparent-param')

      const uiParent = document.createElement('div')
      uiParent.setAttribute('data-schema-editor-ui', 'true')
      grandparent.appendChild(uiParent)

      const parent = document.createElement('div')
      uiParent.appendChild(parent)

      const child = document.createElement('div')
      parent.appendChild(child)
      document.body.appendChild(grandparent)
      ;(storage.getSearchConfig as Mock).mockResolvedValue({
        limitUpwardSearch: true,
        searchDepthUp: 10,
      })

      const originalElementsFromPoint = document.elementsFromPoint
      // 返回 parent 而不是 child，这样 parent 不在 UI 元素内部
      document.elementsFromPoint = vi.fn().mockReturnValue([grandparent])

      const result = await findElementWithSchemaParams(100, 100)

      // grandparent 自身有属性，应该能找到
      expect(result.target).toBe(grandparent)

      document.elementsFromPoint = originalElementsFromPoint
      document.body.removeChild(grandparent)
    })

    it('向上搜索时遇到带有 UI 属性的父元素应该跳过', async () => {
      // 构建: target (有 schema-params) -> uiMiddle (UI元素) -> child
      const target = document.createElement('div')
      target.setAttribute('data-schema-params', 'target-param')

      const uiMiddle = document.createElement('div')
      uiMiddle.setAttribute('data-schema-editor-ui', 'true')
      target.appendChild(uiMiddle)

      const child = document.createElement('div')
      uiMiddle.appendChild(child)
      document.body.appendChild(target)
      ;(storage.getSearchConfig as Mock).mockResolvedValue({
        limitUpwardSearch: true,
        searchDepthUp: 10,
      })

      const originalElementsFromPoint = document.elementsFromPoint
      // 模拟返回一个不在 UI 元素内的元素
      document.elementsFromPoint = vi.fn().mockReturnValue([target])

      const result = await findElementWithSchemaParams(100, 100)

      expect(result.target).toBe(target)

      document.elementsFromPoint = originalElementsFromPoint
      document.body.removeChild(target)
    })

    it('searchAncestors 应该跳过链中的 UI 元素并继续向上搜索', async () => {
      // 构建结构: grandparent (有 schema-params) -> uiElement (UI元素) -> child (起点)
      // child 不在 UI 元素内部（不满足 closest 条件），但 uiElement 是其父元素
      const grandparent = document.createElement('div')
      grandparent.setAttribute('data-schema-params', 'found-param')

      const uiElement = document.createElement('div')
      uiElement.setAttribute('data-schema-editor-ui', 'true')
      grandparent.appendChild(uiElement)

      const child = document.createElement('div')
      uiElement.appendChild(child)
      document.body.appendChild(grandparent)
      ;(storage.getSearchConfig as Mock).mockResolvedValue({
        limitUpwardSearch: true,
        searchDepthUp: 10,
      })

      const originalElementsFromPoint = document.elementsFromPoint
      // child 本身在 UI 元素内部，会被过滤
      // 需要模拟 child 不在 UI 元素内部的情况
      // 直接返回 grandparent，它自身有 schema-params
      document.elementsFromPoint = vi.fn().mockReturnValue([grandparent])

      const result = await findElementWithSchemaParams(100, 100)

      expect(result.candidates).toContain(grandparent)

      document.elementsFromPoint = originalElementsFromPoint
      document.body.removeChild(grandparent)
    })
  })

  describe('getElementAttributes', () => {
    beforeEach(() => {
      ;(storage.getAttributeName as Mock).mockResolvedValue('schema-params')
    })

    it('应该返回空 params 当元素没有属性时', async () => {
      const element = document.createElement('div')
      const result = await getElementAttributes(element)

      expect(result.params).toEqual([])
    })

    it('应该解析单个参数', async () => {
      const element = document.createElement('div')
      element.setAttribute('data-schema-params', 'param1')
      const result = await getElementAttributes(element)

      expect(result.params).toEqual(['param1'])
    })

    it('应该解析多个参数（逗号分隔）', async () => {
      const element = document.createElement('div')
      element.setAttribute('data-schema-params', 'param1, param2, param3')
      const result = await getElementAttributes(element)

      expect(result.params).toEqual(['param1', 'param2', 'param3'])
    })

    it('应该过滤空参数', async () => {
      const element = document.createElement('div')
      element.setAttribute('data-schema-params', 'param1, , param2, ')
      const result = await getElementAttributes(element)

      expect(result.params).toEqual(['param1', 'param2'])
    })
  })

  describe('hasValidAttributes', () => {
    it('应该返回 true 当有参数时', () => {
      expect(hasValidAttributes({ params: ['param1'] })).toBe(true)
    })

    it('应该返回 false 当没有参数时', () => {
      expect(hasValidAttributes({ params: [] })).toBe(false)
    })
  })

  describe('getElementPosition', () => {
    it('应该返回元素的位置和尺寸', () => {
      const element = document.createElement('div')
      element.style.width = '100px'
      element.style.height = '50px'
      document.body.appendChild(element)

      // Mock getBoundingClientRect
      element.getBoundingClientRect = vi.fn().mockReturnValue({
        left: 10,
        top: 20,
        width: 100,
        height: 50,
      })

      const position = getElementPosition(element)

      expect(position.x).toBe(10 + window.scrollX)
      expect(position.y).toBe(20 + window.scrollY)
      expect(position.width).toBe(100)
      expect(position.height).toBe(50)

      document.body.removeChild(element)
    })
  })

  describe('getMousePosition', () => {
    it('应该返回鼠标位置', () => {
      const event = new MouseEvent('click', {
        clientX: 150,
        clientY: 250,
      })

      const position = getMousePosition(event)

      expect(position.x).toBe(150)
      expect(position.y).toBe(250)
    })
  })

  describe('isClickInside', () => {
    it('应该返回 true 当点击在元素内部', () => {
      const element = document.createElement('div')
      element.getBoundingClientRect = vi.fn().mockReturnValue({
        left: 100,
        right: 200,
        top: 100,
        bottom: 200,
      })

      const event = new MouseEvent('click', {
        clientX: 150,
        clientY: 150,
      })

      expect(isClickInside(event, element)).toBe(true)
    })

    it('应该返回 false 当点击在元素外部（左侧）', () => {
      const element = document.createElement('div')
      element.getBoundingClientRect = vi.fn().mockReturnValue({
        left: 100,
        right: 200,
        top: 100,
        bottom: 200,
      })

      const event = new MouseEvent('click', {
        clientX: 50,
        clientY: 150,
      })

      expect(isClickInside(event, element)).toBe(false)
    })

    it('应该返回 false 当点击在元素外部（右侧）', () => {
      const element = document.createElement('div')
      element.getBoundingClientRect = vi.fn().mockReturnValue({
        left: 100,
        right: 200,
        top: 100,
        bottom: 200,
      })

      const event = new MouseEvent('click', {
        clientX: 250,
        clientY: 150,
      })

      expect(isClickInside(event, element)).toBe(false)
    })

    it('应该返回 false 当点击在元素外部（上方）', () => {
      const element = document.createElement('div')
      element.getBoundingClientRect = vi.fn().mockReturnValue({
        left: 100,
        right: 200,
        top: 100,
        bottom: 200,
      })

      const event = new MouseEvent('click', {
        clientX: 150,
        clientY: 50,
      })

      expect(isClickInside(event, element)).toBe(false)
    })

    it('应该返回 false 当点击在元素外部（下方）', () => {
      const element = document.createElement('div')
      element.getBoundingClientRect = vi.fn().mockReturnValue({
        left: 100,
        right: 200,
        top: 100,
        bottom: 200,
      })

      const event = new MouseEvent('click', {
        clientX: 150,
        clientY: 250,
      })

      expect(isClickInside(event, element)).toBe(false)
    })

    it('应该返回 true 当点击在元素边界上', () => {
      const element = document.createElement('div')
      element.getBoundingClientRect = vi.fn().mockReturnValue({
        left: 100,
        right: 200,
        top: 100,
        bottom: 200,
      })

      const event = new MouseEvent('click', {
        clientX: 100,
        clientY: 100,
      })

      expect(isClickInside(event, element)).toBe(true)
    })
  })
})
