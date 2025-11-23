import { ContentType } from '@/shared/types'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useContentDetection } from '../useContentDetection'

// Mock transformers
jest.mock('@/shared/utils/schema/transformers', () => ({
  isElementsArray: jest.fn(),
  isStringData: jest.fn()
}))

import { isElementsArray, isStringData } from '@/shared/utils/schema/transformers'

const mockIsElementsArray = isElementsArray as jest.MockedFunction<typeof isElementsArray>
const mockIsStringData = isStringData as jest.MockedFunction<typeof isStringData>

describe('useContentDetection Hook 测试', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('初始化', () => {
    it('应该初始化为Other类型且不可解析', () => {
      const { result } = renderHook(() => useContentDetection())

      expect(result.current.contentType).toBe(ContentType.Other)
      expect(result.current.canParse).toBe(false)
    })
  })

  describe('detectContentType 检测内容类型', () => {
    it('空字符串应该返回Other类型', () => {
      const { result } = renderHook(() => useContentDetection())

      const detected = result.current.detectContentType('')

      expect(detected.type).toBe(ContentType.Other)
      expect(detected.canParse).toBe(false)
    })

    it('只有空格应该返回Other类型', () => {
      const { result } = renderHook(() => useContentDetection())

      const detected = result.current.detectContentType('   \n\t  ')

      expect(detected.type).toBe(ContentType.Other)
      expect(detected.canParse).toBe(false)
    })

    it('应该检测AST类型（Elements数组）', () => {
      mockIsElementsArray.mockReturnValue(true)
      mockIsStringData.mockReturnValue(false)

      const { result } = renderHook(() => useContentDetection())
      const jsonValue = JSON.stringify([{ type: 'element', name: 'div' }])

      const detected = result.current.detectContentType(jsonValue)

      expect(detected.type).toBe(ContentType.Ast)
      expect(detected.canParse).toBe(true)
    })

    it('应该检测RawString类型（字符串数据）', () => {
      mockIsElementsArray.mockReturnValue(false)
      mockIsStringData.mockReturnValue(true)

      const { result } = renderHook(() => useContentDetection())
      const jsonValue = JSON.stringify('some string data')

      const detected = result.current.detectContentType(jsonValue)

      expect(detected.type).toBe(ContentType.RawString)
      expect(detected.canParse).toBe(true)
    })

    it('应该检测Other可解析类型（普通JSON对象）', () => {
      mockIsElementsArray.mockReturnValue(false)
      mockIsStringData.mockReturnValue(false)

      const { result } = renderHook(() => useContentDetection())
      const jsonValue = JSON.stringify({ key: 'value' })

      const detected = result.current.detectContentType(jsonValue)

      expect(detected.type).toBe(ContentType.Other)
      expect(detected.canParse).toBe(true)
    })

    it('非法JSON应该返回Other不可解析', () => {
      const { result } = renderHook(() => useContentDetection())

      const detected = result.current.detectContentType('{invalid json')

      expect(detected.type).toBe(ContentType.Other)
      expect(detected.canParse).toBe(false)
    })

    it('应该处理复杂的JSON结构', () => {
      mockIsElementsArray.mockReturnValue(false)
      mockIsStringData.mockReturnValue(false)

      const { result } = renderHook(() => useContentDetection())
      const complexJson = JSON.stringify({
        nested: { deep: { structure: ['with', 'arrays'] } },
        number: 123,
        boolean: true,
        null: null
      })

      const detected = result.current.detectContentType(complexJson)

      expect(detected.type).toBe(ContentType.Other)
      expect(detected.canParse).toBe(true)
    })
  })

  describe('debouncedDetectContent 防抖检测', () => {
    it('应该在300ms后更新状态', async () => {
      mockIsElementsArray.mockReturnValue(true)
      mockIsStringData.mockReturnValue(false)

      const { result } = renderHook(() => useContentDetection())
      const jsonValue = JSON.stringify([{ type: 'element' }])

      act(() => {
        result.current.debouncedDetectContent(jsonValue)
      })

      // 立即检查，状态不应该改变
      expect(result.current.contentType).toBe(ContentType.Other)
      expect(result.current.canParse).toBe(false)

      // 300ms后，状态应该更新
      act(() => {
        jest.advanceTimersByTime(300)
      })

      await waitFor(() => {
        expect(result.current.contentType).toBe(ContentType.Ast)
        expect(result.current.canParse).toBe(true)
      })
    })

    it('应该防抖多次连续调用', async () => {
      mockIsElementsArray.mockReturnValue(false)
      mockIsStringData.mockReturnValue(true)

      const { result } = renderHook(() => useContentDetection())

      act(() => {
        result.current.debouncedDetectContent(JSON.stringify('value1'))
        jest.advanceTimersByTime(100)
        result.current.debouncedDetectContent(JSON.stringify('value2'))
        jest.advanceTimersByTime(100)
        result.current.debouncedDetectContent(JSON.stringify('value3'))
      })

      act(() => {
        jest.advanceTimersByTime(300)
      })

      await waitFor(() => {
        expect(result.current.contentType).toBe(ContentType.RawString)
      })

      // 应该只调用一次检测（最后一次）
      expect(mockIsStringData).toHaveBeenCalledTimes(1)
    })

    it('应该取消之前未完成的检测', async () => {
      mockIsElementsArray.mockReturnValue(true)
      mockIsStringData.mockReturnValue(false)

      const { result } = renderHook(() => useContentDetection())

      act(() => {
        result.current.debouncedDetectContent(JSON.stringify([{ type: 'element' }]))
        jest.advanceTimersByTime(250)
        // 在第一次检测完成前，开始第二次检测
        result.current.debouncedDetectContent('{invalid')
      })

      act(() => {
        jest.advanceTimersByTime(300)
      })

      await waitFor(() => {
        // 应该只执行最后一次检测
        expect(result.current.contentType).toBe(ContentType.Other)
        expect(result.current.canParse).toBe(false)
      })
    })
  })

  describe('updateContentType 手动更新', () => {
    it('应该立即更新内容类型', () => {
      const { result } = renderHook(() => useContentDetection())

      act(() => {
        result.current.updateContentType({
          type: ContentType.Ast,
          canParse: true
        })
      })

      expect(result.current.contentType).toBe(ContentType.Ast)
      expect(result.current.canParse).toBe(true)
    })

    it('应该支持更新为RawString类型', () => {
      const { result } = renderHook(() => useContentDetection())

      act(() => {
        result.current.updateContentType({
          type: ContentType.RawString,
          canParse: true
        })
      })

      expect(result.current.contentType).toBe(ContentType.RawString)
      expect(result.current.canParse).toBe(true)
    })

    it('应该支持更新为不可解析状态', () => {
      const { result } = renderHook(() => useContentDetection())

      // 先设置为可解析
      act(() => {
        result.current.updateContentType({
          type: ContentType.Ast,
          canParse: true
        })
      })

      // 再更新为不可解析
      act(() => {
        result.current.updateContentType({
          type: ContentType.Other,
          canParse: false
        })
      })

      expect(result.current.contentType).toBe(ContentType.Other)
      expect(result.current.canParse).toBe(false)
    })
  })

  describe('综合场景', () => {
    it('手动更新后防抖检测应该能覆盖', async () => {
      mockIsElementsArray.mockReturnValue(false)
      mockIsStringData.mockReturnValue(true)

      const { result } = renderHook(() => useContentDetection())

      // 手动设置为AST
      act(() => {
        result.current.updateContentType({
          type: ContentType.Ast,
          canParse: true
        })
      })

      expect(result.current.contentType).toBe(ContentType.Ast)

      // 启动防抖检测
      act(() => {
        result.current.debouncedDetectContent(JSON.stringify('string data'))
      })

      act(() => {
        jest.advanceTimersByTime(300)
      })

      // 应该被更新为RawString
      await waitFor(() => {
        expect(result.current.contentType).toBe(ContentType.RawString)
      })
    })

    it('应该能在快速输入中正确检测', async () => {
      mockIsElementsArray.mockReturnValue(false)
      mockIsStringData.mockReturnValue(false)

      const { result } = renderHook(() => useContentDetection())

      // 模拟快速输入
      const inputSteps = [
        '{',
        '{"k',
        '{"ke',
        '{"key',
        '{"key"',
        '{"key":',
        '{"key":"v',
        '{"key":"va',
        '{"key":"val',
        '{"key":"valu',
        '{"key":"value',
        '{"key":"value"',
        '{"key":"value"}'
      ]

      inputSteps.forEach((input) => {
        act(() => {
          result.current.debouncedDetectContent(input)
          jest.advanceTimersByTime(50) // 模拟输入间隔
        })
      })

      // 等待最后一次检测完成
      act(() => {
        jest.advanceTimersByTime(300)
      })

      await waitFor(() => {
        expect(result.current.canParse).toBe(true)
        expect(result.current.contentType).toBe(ContentType.Other)
      })
    })
  })

  describe('边界情况', () => {
    it('应该处理null值', () => {
      const { result } = renderHook(() => useContentDetection())

      const detected = result.current.detectContentType('null')

      expect(detected.canParse).toBe(true)
    })

    it('应该处理布尔值', () => {
      const { result } = renderHook(() => useContentDetection())

      const detectedTrue = result.current.detectContentType('true')
      const detectedFalse = result.current.detectContentType('false')

      expect(detectedTrue.canParse).toBe(true)
      expect(detectedFalse.canParse).toBe(true)
    })

    it('应该处理数字', () => {
      const { result } = renderHook(() => useContentDetection())

      const detected = result.current.detectContentType('123.45')

      expect(detected.canParse).toBe(true)
    })

    it('应该处理空数组', () => {
      mockIsElementsArray.mockReturnValue(false)
      mockIsStringData.mockReturnValue(false)

      const { result } = renderHook(() => useContentDetection())

      const detected = result.current.detectContentType('[]')

      expect(detected.canParse).toBe(true)
    })

    it('应该处理空对象', () => {
      mockIsElementsArray.mockReturnValue(false)
      mockIsStringData.mockReturnValue(false)

      const { result } = renderHook(() => useContentDetection())

      const detected = result.current.detectContentType('{}')

      expect(detected.canParse).toBe(true)
    })
  })
})

