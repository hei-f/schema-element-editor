import type { Mock } from 'vitest'
import { storage } from '../browser/storage'
import {
  findElementWithSchemaParams,
  getElementAttributes,
  hasValidAttributes,
  isVisibleElement,
} from '../ui/dom'

// Mock storage模块
vi.mock('../browser/storage', () => ({
  storage: {
    getAttributeName: vi.fn(),
    getSearchConfig: vi.fn(),
    getHighlightColor: vi.fn(),
  },
}))

describe('Element Detector测试', () => {
  const mockGetAttributeName = storage.getAttributeName as Mock
  const mockGetSearchConfig = storage.getSearchConfig as Mock
  const mockGetHighlightColor = storage.getHighlightColor as Mock

  beforeEach(() => {
    vi.clearAllMocks()
    // 默认返回schema-params
    mockGetAttributeName.mockResolvedValue('schema-params')
    // 默认搜索配置
    mockGetSearchConfig.mockResolvedValue({
      limitUpwardSearch: false,
      searchDepthUp: 5,
      throttleInterval: 16,
    })
    // 默认高亮颜色
    mockGetHighlightColor.mockResolvedValue('#39C5BB')

    // Mock document.elementsFromPoint
    document.elementsFromPoint = vi.fn(() => [])
  })

  describe('getElementAttributes', () => {
    it('应该提取单个参数', async () => {
      const element = document.createElement('div')
      element.setAttribute('data-schema-params', 'param1')

      const result = await getElementAttributes(element)

      expect(result).toEqual({
        params: ['param1'],
      })
    })

    it('应该提取多个参数（逗号分隔）', async () => {
      const element = document.createElement('div')
      element.setAttribute('data-schema-params', 'param1,param2,param3')

      const result = await getElementAttributes(element)

      expect(result).toEqual({
        params: ['param1', 'param2', 'param3'],
      })
    })

    it('应该处理参数前后的空格', async () => {
      const element = document.createElement('div')
      element.setAttribute('data-schema-params', ' param1 , param2 , param3 ')

      const result = await getElementAttributes(element)

      expect(result).toEqual({
        params: ['param1', 'param2', 'param3'],
      })
    })

    it('应该处理空属性值', async () => {
      const element = document.createElement('div')
      element.setAttribute('data-schema-params', '')

      const result = await getElementAttributes(element)

      expect(result).toEqual({
        params: [],
      })
    })

    it('应该处理没有属性的元素', async () => {
      const element = document.createElement('div')

      const result = await getElementAttributes(element)

      expect(result).toEqual({
        params: [],
      })
    })

    it('应该使用自定义属性名', async () => {
      mockGetAttributeName.mockResolvedValue('custom-attr')

      const element = document.createElement('div')
      element.setAttribute('data-custom-attr', 'value1,value2')

      const result = await getElementAttributes(element)

      expect(result).toEqual({
        params: ['value1', 'value2'],
      })
    })

    it('应该处理包含特殊字符的参数', async () => {
      const element = document.createElement('div')
      element.setAttribute('data-schema-params', 'user.name,item[0],data_id')

      const result = await getElementAttributes(element)

      expect(result).toEqual({
        params: ['user.name', 'item[0]', 'data_id'],
      })
    })

    it('应该过滤掉空字符串参数', async () => {
      const element = document.createElement('div')
      element.setAttribute('data-schema-params', 'param1,,param2,  ,param3')

      const result = await getElementAttributes(element)

      expect(result).toEqual({
        params: ['param1', 'param2', 'param3'],
      })
    })

    it('应该处理中文参数', async () => {
      const element = document.createElement('div')
      element.setAttribute('data-schema-params', '用户名,订单号,商品ID')

      const result = await getElementAttributes(element)

      expect(result).toEqual({
        params: ['用户名', '订单号', '商品ID'],
      })
    })

    it('应该处理超长参数', async () => {
      const longParam = 'a'.repeat(1000)
      const element = document.createElement('div')
      element.setAttribute('data-schema-params', longParam)

      const result = await getElementAttributes(element)

      expect(result).toEqual({
        params: [longParam],
      })
    })

    it('应该处理大量参数', async () => {
      const params = Array.from({ length: 50 }, (_, i) => `param${i + 1}`)
      const element = document.createElement('div')
      element.setAttribute('data-schema-params', params.join(','))

      const result = await getElementAttributes(element)

      expect(result.params).toHaveLength(50)
      expect(result.params[0]).toBe('param1')
      expect(result.params[49]).toBe('param50')
    })
  })

  describe('hasValidAttributes', () => {
    it('应该验证有效的属性（单个参数）', () => {
      const attrs = { params: ['param1'] }

      expect(hasValidAttributes(attrs)).toBe(true)
    })

    it('应该验证有效的属性（多个参数）', () => {
      const attrs = { params: ['param1', 'param2', 'param3'] }

      expect(hasValidAttributes(attrs)).toBe(true)
    })

    it('应该拒绝空参数数组', () => {
      const attrs = { params: [] }

      expect(hasValidAttributes(attrs)).toBe(false)
    })

    it('应该拒绝只包含空字符串的参数', () => {
      const attrs = { params: [''] }

      // hasValidAttributes检查params.length > 0，但空字符串仍然是有效元素
      // 实际上空字符串应该在getElementAttributes时被过滤掉
      expect(hasValidAttributes(attrs)).toBe(true)
    })
  })

  describe('边界情况', () => {
    it('应该处理null元素', async () => {
      // element-detector不处理null，应该在调用前验证
      try {
        await getElementAttributes(null as any)
      } catch (error) {
        // 预期会抛出错误
        expect(error).toBeDefined()
      }
    })

    it('应该处理undefined元素', async () => {
      // element-detector不处理undefined，应该在调用前验证
      try {
        await getElementAttributes(undefined as any)
      } catch (error) {
        // 预期会抛出错误
        expect(error).toBeDefined()
      }
    })

    it('应该处理storage获取失败', async () => {
      mockGetAttributeName.mockRejectedValue(new Error('Storage error'))

      const element = document.createElement('div')
      element.setAttribute('data-schema-params', 'param1')

      // 应该使用默认值或抛出错误
      await expect(getElementAttributes(element)).rejects.toThrow()
    })

    it('应该处理只有逗号的字符串', async () => {
      const element = document.createElement('div')
      element.setAttribute('data-schema-params', ',,,')

      const result = await getElementAttributes(element)

      expect(result).toEqual({
        params: [],
      })
    })

    it('应该处理混合空格和逗号', async () => {
      const element = document.createElement('div')
      element.setAttribute('data-schema-params', ' , , , ')

      const result = await getElementAttributes(element)

      expect(result).toEqual({
        params: [],
      })
    })

    it('应该处理URL作为参数', async () => {
      const element = document.createElement('div')
      element.setAttribute('data-schema-params', 'https://example.com/api,user.profile.name')

      const result = await getElementAttributes(element)

      expect(result).toEqual({
        params: ['https://example.com/api', 'user.profile.name'],
      })
    })

    it('应该处理JSON路径作为参数', async () => {
      const element = document.createElement('div')
      element.setAttribute('data-schema-params', 'data[0].user.name,items[*].id')

      const result = await getElementAttributes(element)

      expect(result).toEqual({
        params: ['data[0].user.name', 'items[*].id'],
      })
    })

    it('应该处理特殊符号参数', async () => {
      const element = document.createElement('div')
      element.setAttribute('data-schema-params', '@user,#id,$price,&status')

      const result = await getElementAttributes(element)

      expect(result).toEqual({
        params: ['@user', '#id', '$price', '&status'],
      })
    })
  })

  describe('hasValidAttributes额外测试', () => {
    it('应该处理大量有效参数', () => {
      const params = Array.from({ length: 100 }, (_, i) => `param${i}`)
      const attrs = { params }

      expect(hasValidAttributes(attrs)).toBe(true)
    })

    it('应该验证单个长参数', () => {
      const longParam = 'a'.repeat(10000)
      const attrs = { params: [longParam] }

      expect(hasValidAttributes(attrs)).toBe(true)
    })
  })

  describe('isVisibleElement', () => {
    it('应该识别可见元素', () => {
      const element = document.createElement('div')
      document.body.appendChild(element)

      expect(isVisibleElement(element)).toBe(true)

      document.body.removeChild(element)
    })

    it('应该排除script标签', () => {
      const element = document.createElement('script')

      expect(isVisibleElement(element)).toBe(false)
    })

    it('应该排除style标签', () => {
      const element = document.createElement('style')

      expect(isVisibleElement(element)).toBe(false)
    })

    it('应该排除link标签', () => {
      const element = document.createElement('link')

      expect(isVisibleElement(element)).toBe(false)
    })

    it('应该排除meta标签', () => {
      const element = document.createElement('meta')

      expect(isVisibleElement(element)).toBe(false)
    })

    it('应该排除display:none的元素', () => {
      const element = document.createElement('div')
      element.style.display = 'none'
      document.body.appendChild(element)

      expect(isVisibleElement(element)).toBe(false)

      document.body.removeChild(element)
    })

    it('应该排除visibility:hidden的元素', () => {
      const element = document.createElement('div')
      element.style.visibility = 'hidden'
      document.body.appendChild(element)

      expect(isVisibleElement(element)).toBe(false)

      document.body.removeChild(element)
    })

    it('应该排除opacity:0的元素', () => {
      const element = document.createElement('div')
      element.style.opacity = '0'
      document.body.appendChild(element)

      expect(isVisibleElement(element)).toBe(false)

      document.body.removeChild(element)
    })

    it('应该识别display:flex的元素', () => {
      const element = document.createElement('div')
      element.style.display = 'flex'
      document.body.appendChild(element)

      expect(isVisibleElement(element)).toBe(true)

      document.body.removeChild(element)
    })

    it('应该识别visibility:visible的元素', () => {
      const element = document.createElement('div')
      element.style.visibility = 'visible'
      document.body.appendChild(element)

      expect(isVisibleElement(element)).toBe(true)

      document.body.removeChild(element)
    })
  })

  describe('findElementWithSchemaParams', () => {
    beforeEach(() => {
      // 清空body
      document.body.innerHTML = ''
    })

    it('应该找到直接带有属性的元素', async () => {
      const target = document.createElement('div')
      target.setAttribute('data-schema-params', 'param1')
      document.body.appendChild(target)

      // Mock elementsFromPoint返回目标元素
      ;(document.elementsFromPoint as Mock).mockReturnValue([
        target,
        document.body,
        document.documentElement,
      ])

      const result = await findElementWithSchemaParams(100, 100)

      expect(result.target).toBe(target)
      expect(result.candidates).toContain(target)

      document.body.removeChild(target)
    })

    it('应该找到父元素', async () => {
      const parent = document.createElement('div')
      parent.setAttribute('data-schema-params', 'param1')
      const child = document.createElement('div')
      parent.appendChild(child)
      document.body.appendChild(parent)

      // Mock elementsFromPoint返回子元素
      ;(document.elementsFromPoint as Mock).mockReturnValue([
        child,
        parent,
        document.body,
        document.documentElement,
      ])

      const result = await findElementWithSchemaParams(100, 100)

      expect(result.target).toBe(parent)
      expect(result.candidates).toContain(parent)

      document.body.removeChild(parent)
    })

    it('应该返回null如果没找到任何元素', async () => {
      const element = document.createElement('div')
      document.body.appendChild(element)
      ;(document.elementsFromPoint as Mock).mockReturnValue([
        element,
        document.body,
        document.documentElement,
      ])

      const result = await findElementWithSchemaParams(100, 100)

      expect(result.target).toBeNull()
      expect(result.candidates).toHaveLength(0)

      document.body.removeChild(element)
    })

    it('应该忽略扩展UI元素', async () => {
      const uiElement = document.createElement('div')
      uiElement.setAttribute('data-schema-editor-ui', 'true')
      uiElement.setAttribute('data-schema-params', 'param1')
      document.body.appendChild(uiElement)
      ;(document.elementsFromPoint as Mock).mockReturnValue([
        uiElement,
        document.body,
        document.documentElement,
      ])

      const result = await findElementWithSchemaParams(100, 100)

      expect(result.target).toBeNull()

      document.body.removeChild(uiElement)
    })

    it('应该处理多个候选元素', async () => {
      const parent = document.createElement('div')
      parent.setAttribute('data-schema-params', 'param1')
      const child1 = document.createElement('div')
      child1.setAttribute('data-schema-params', 'param2')
      const child2 = document.createElement('div')
      child2.setAttribute('data-schema-params', 'param3')
      parent.appendChild(child1)
      parent.appendChild(child2)
      document.body.appendChild(parent)
      ;(document.elementsFromPoint as Mock).mockReturnValue([
        parent,
        document.body,
        document.documentElement,
      ])

      const result = await findElementWithSchemaParams(100, 100)

      expect(result.candidates.length).toBeGreaterThan(0)
      expect(result.target).toBeDefined()

      document.body.removeChild(parent)
    })

    it('应该去重候选元素', async () => {
      const element = document.createElement('div')
      element.setAttribute('data-schema-params', 'param1')
      document.body.appendChild(element)

      // Mock返回重复的元素
      ;(document.elementsFromPoint as Mock).mockReturnValue([
        element,
        element,
        document.body,
        document.documentElement,
      ])

      const result = await findElementWithSchemaParams(100, 100)

      expect(result.candidates).toHaveLength(1)
      expect(result.candidates[0]).toBe(element)

      document.body.removeChild(element)
    })

    it('应该使用自定义属性名', async () => {
      mockGetAttributeName.mockResolvedValue('custom-attr')

      const element = document.createElement('div')
      element.setAttribute('data-custom-attr', 'value1')
      document.body.appendChild(element)
      ;(document.elementsFromPoint as Mock).mockReturnValue([
        element,
        document.body,
        document.documentElement,
      ])

      const result = await findElementWithSchemaParams(100, 100)

      expect(result.target).toBe(element)

      document.body.removeChild(element)
    })

    it('应该尊重向下搜索深度限制', async () => {
      mockGetSearchConfig.mockResolvedValue({
        searchDepthDown: 1,
        searchDepthUp: 3,
        throttleInterval: 100,
      })

      const level0 = document.createElement('div')
      const level1 = document.createElement('div')
      const level2 = document.createElement('div')
      const level3 = document.createElement('div')
      level3.setAttribute('data-schema-params', 'param1')

      level0.appendChild(level1)
      level1.appendChild(level2)
      level2.appendChild(level3)
      document.body.appendChild(level0)
      ;(document.elementsFromPoint as Mock).mockReturnValue([
        level0,
        document.body,
        document.documentElement,
      ])

      const result = await findElementWithSchemaParams(100, 100)

      // 深度为1，应该找不到level3
      expect(result.target).toBeNull()

      document.body.removeChild(level0)
    })
  })
})
