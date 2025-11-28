import { compactJson, parseNestedJson } from '@/shared/utils/schema/serializer'

describe('JSON处理工具测试', () => {
  describe('compactJson 压缩', () => {
    it('应该正确压缩简单对象', () => {
      const input = { key: 'value' }
      const result = compactJson(input)

      expect(result.success).toBe(true)
      expect(JSON.parse(result.data!)).toEqual({ key: 'value' })
    })

    it('应该正确压缩数组', () => {
      const input = [1, 2, 3]
      const result = compactJson(input)

      expect(result.success).toBe(true)
      expect(JSON.parse(result.data!)).toEqual([1, 2, 3])
    })

    it('应该处理null值', () => {
      const input = null
      const result = compactJson(input)

      expect(result.success).toBe(true)
    })
  })

  describe('parseNestedJson 解析', () => {
    it('应该正确解析标准JSON', () => {
      const input = '[{"key":"value"}]'
      const result = parseNestedJson(input)

      expect(result.success).toBe(true)
      expect(JSON.parse(result.data!)).toEqual([{ key: 'value' }])
    })

    it('应该处理单层嵌套字符串', () => {
      const input = '"[{\\"key\\":\\"value\\"}]"'
      const result = parseNestedJson(input)

      expect(result.success).toBe(true)
      // parseCount可能是1或2，取决于修复策略
      expect(result.parseCount).toBeGreaterThanOrEqual(1)
      expect(JSON.parse(result.data!)).toEqual([{ key: 'value' }])
    })

    it('应该处理文本形式的转义符', () => {
      const input = '[{\\"key\\":\\"value\\"}]'
      const result = parseNestedJson(input)

      expect(result.success).toBe(true)
      expect(JSON.parse(result.data!)).toEqual([{ key: 'value' }])
    })

    it('应该处理多层嵌套', () => {
      // 创建2层嵌套，最终结果是对象而不是字符串
      const obj = { key: 'value' }
      const once = JSON.stringify(obj) // "{"key":"value"}"
      const twice = JSON.stringify(once) // "\"{\"key\":\"value\"}\""

      const result = parseNestedJson(twice)

      expect(result.success).toBe(true)
      expect(result.parseCount).toBeGreaterThanOrEqual(2)
      const parsed = JSON.parse(result.data!)
      expect(parsed).toEqual({ key: 'value' })
    })

    it('应该拒绝空输入', () => {
      const result = parseNestedJson('')

      expect(result.success).toBe(false)
      expect(result.error).toBe('输入内容为空')
    })

    it('应该拒绝无效JSON', () => {
      const input = '{invalid json}'
      const result = parseNestedJson(input)

      expect(result.success).toBe(false)
      expect(result.error).toContain('无法解析')
    })

    it('应该检测过度嵌套', () => {
      // 创建12层嵌套，超过10层限制
      let input: any = { key: 'value' }
      for (let i = 0; i < 12; i++) {
        input = JSON.stringify(input)
      }

      const result = parseNestedJson(input)

      // 可能成功也可能失败，取决于递归能否完成
      // 但如果成功，应该有警告
      if (result.success) {
        expect(result.parseCount).toBeGreaterThanOrEqual(10)
        expect(result.error).toContain('最大解析深度')
      } else {
        // 如果失败，也应该有相关错误信息
        expect(result.error).toBeTruthy()
      }
    })
  })

  describe('压缩-解析往返测试', () => {
    it('应该正确处理简单数据的往返操作', () => {
      const originalData = { key: 'value', nested: { prop: 'test' } }

      // 压缩
      const compactResult = compactJson(originalData)
      expect(compactResult.success).toBe(true)

      // 解析
      const parseResult = parseNestedJson(compactResult.data!)
      expect(parseResult.success).toBe(true)

      // 验证往返一致性
      const finalData = JSON.parse(parseResult.data!)
      expect(finalData).toEqual(originalData)
    })

    it('应该正确处理包含嵌套JSON字符串的复杂结构（用户场景）', () => {
      // 模拟用户场景：children[0].text包含JSON字符串
      const complexData = [
        {
          type: 'paragraph',
          children: [{ text: '好的，没问题。请补充以下信息' }],
        },
        {
          type: 'apaasify',
          language: 'apaasify',
          render: false,
          value: [
            {
              componentPath: 'AnalysisCard',
              componentProps: {
                type: 'Space',
                data: {
                  mode: '空间分析',
                  instName: '商业银行',
                },
              },
            },
          ],
          children: [
            {
              text: JSON.stringify(
                [
                  {
                    componentPath: 'AnalysisCard',
                    componentProps: {
                      type: 'Space',
                      data: {
                        mode: '空间分析',
                      },
                    },
                  },
                ],
                null,
                2
              ),
            },
          ],
        },
      ]

      // 压缩
      const compactResult = compactJson(complexData)
      expect(compactResult.success).toBe(true)

      // 解析
      const parseResult = parseNestedJson(compactResult.data!)
      expect(parseResult.success).toBe(true)

      // 验证往返一致性
      const finalData = JSON.parse(parseResult.data!)
      expect(finalData).toEqual(complexData)
    })

    it('应该正确处理数组类型的往返操作', () => {
      const arrayData = [
        { id: 1, name: 'item1' },
        { id: 2, name: 'item2' },
      ]

      // 压缩
      const compactResult = compactJson(arrayData)
      expect(compactResult.success).toBe(true)

      // 解析
      const parseResult = parseNestedJson(compactResult.data!)
      expect(parseResult.success).toBe(true)

      // 验证往返一致性
      const finalData = JSON.parse(parseResult.data!)
      expect(finalData).toEqual(arrayData)
    })
  })
})
