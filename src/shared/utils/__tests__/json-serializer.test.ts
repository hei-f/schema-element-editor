import {
  compactJson,
  parseNestedJson,
  escapeJson,
  unescapeJson,
  tryFixJsonString,
  addQuotesAndUnescape,
  escapeAndRemoveQuotes,
  compactEscapeAndRemoveQuotes,
} from '@/shared/utils/schema/serializer'

describe('JSON处理工具测试', () => {
  describe('escapeJson 转义', () => {
    it('应该正确转义简单JSON对象', () => {
      const input = '{"key":"value"}'
      const result = escapeJson(input)

      expect(result.success).toBe(true)
      expect(result.data).toBe('"{\\"key\\":\\"value\\"}"')
    })

    it('应该正确转义带换行的JSON', () => {
      const input = '{\n  "key": "value"\n}'
      const result = escapeJson(input)

      expect(result.success).toBe(true)
      expect(result.data).toContain('\\n')
    })

    it('应该正确处理包含特殊字符的内容', () => {
      const input = '{"text":"hello\\nworld"}'
      const result = escapeJson(input)

      expect(result.success).toBe(true)
      // 解析回来应该得到原始内容
      expect(JSON.parse(result.data!)).toBe(input)
    })

    it('应该拒绝空输入', () => {
      const result = escapeJson('')

      expect(result.success).toBe(false)
      expect(result.error).toBe('输入内容为空')
    })

    it('应该拒绝只有空白字符的输入', () => {
      const result = escapeJson('   ')

      expect(result.success).toBe(false)
      expect(result.error).toBe('输入内容为空')
    })

    it('应该正确处理普通文本', () => {
      const input = 'hello world'
      const result = escapeJson(input)

      expect(result.success).toBe(true)
      expect(result.data).toBe('"hello world"')
    })
  })

  describe('unescapeJson 去转义', () => {
    it('应该正确去转义JSON字符串', () => {
      const input = '"{\\"key\\":\\"value\\"}"'
      const result = unescapeJson(input)

      expect(result.success).toBe(true)
      expect(JSON.parse(result.data!)).toEqual({ key: 'value' })
    })

    it('应该拒绝空输入', () => {
      const result = unescapeJson('')

      expect(result.success).toBe(false)
      expect(result.error).toBe('输入内容为空')
    })

    it('应该拒绝不以引号开头的输入', () => {
      const result = unescapeJson('{"key":"value"}')

      expect(result.success).toBe(false)
      expect(result.error).toContain('需要以引号开头和结尾')
    })

    it('应该拒绝不以引号结尾的输入', () => {
      const result = unescapeJson('"hello')

      expect(result.success).toBe(false)
      expect(result.error).toContain('需要以引号开头和结尾')
    })

    it('应该处理解析结果不是字符串的情况', () => {
      // 这种情况理论上不可能发生，因为以引号包裹的有效JSON只能解析为字符串
      // 但为了代码覆盖，我们测试边界情况
      const result = unescapeJson('"123"')

      // 数字字符串解析后是字符串 "123"，不是数字
      expect(result.success).toBe(true)
    })

    it('应该处理非有效JSON的字符串内容', () => {
      const result = unescapeJson('"hello world"')

      expect(result.success).toBe(true)
      expect(result.data).toBe('hello world')
    })

    it('应该格式化有效的JSON内容', () => {
      const input = '"{\\"key\\":\\"value\\"}"'
      const result = unescapeJson(input)

      expect(result.success).toBe(true)
      // 应该是格式化的JSON
      expect(result.data).toContain('\n')
    })

    it('应该处理无效的转义格式', () => {
      const result = unescapeJson('"invalid\\x"')

      expect(result.success).toBe(false)
      expect(result.error).toContain('去转义失败')
    })

    it('应该处理解析结果为非字符串类型的边界情况', () => {
      // 创建一个以引号开头结尾但解析后不是字符串的情况
      // 这种情况理论上不可能通过正常的JSON格式发生
      // 因为JSON规范中，以双引号包裹的内容只能是字符串
      // 这里我们测试正常的字符串情况确保代码逻辑正确
      const result = unescapeJson('"test"')
      expect(result.success).toBe(true)
      expect(result.data).toBe('test')
    })
  })

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

    it('应该处理循环引用导致的错误', () => {
      const obj: Record<string, any> = { key: 'value' }
      obj.self = obj // 创建循环引用

      const result = compactJson(obj)

      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    })

    it('应该正确压缩字符串', () => {
      const input = 'hello world'
      const result = compactJson(input)

      expect(result.success).toBe(true)
      expect(result.data).toBe('"hello world"')
    })

    it('应该正确压缩布尔值', () => {
      expect(compactJson(true).data).toBe('true')
      expect(compactJson(false).data).toBe('false')
    })

    it('应该正确压缩数字', () => {
      expect(compactJson(42).data).toBe('42')
      expect(compactJson(3.14).data).toBe('3.14')
    })
  })

  describe('tryFixJsonString 修复', () => {
    it('应该直接返回有效的JSON', () => {
      const input = '{"key":"value"}'
      const result = tryFixJsonString(input)

      expect(result).toBe(input)
    })

    it('应该修复被引号包裹的JSON', () => {
      const input = '"{\\"key\\":\\"value\\"}"'
      const result = tryFixJsonString(input)

      // 修复后应该是有效的JSON
      expect(() => JSON.parse(result)).not.toThrow()
    })

    it('应该修复文本形式的转义符', () => {
      const input = '[{\\"key\\":\\"value\\"}]'
      const result = tryFixJsonString(input)

      expect(() => JSON.parse(result)).not.toThrow()
    })

    it('应该处理无法修复的输入并返回原始值', () => {
      const input = '{invalid json}'
      const result = tryFixJsonString(input)

      expect(result).toBe(input)
    })

    it('应该处理带空白字符的输入', () => {
      const input = '  {"key":"value"}  '
      const result = tryFixJsonString(input)

      expect(result).toBe('{"key":"value"}')
    })

    it('应该处理被引号包裹但内部仍是无效JSON的情况', () => {
      // 策略2：移除引号后仍然不是有效JSON
      const input = '"invalid json content"'
      const result = tryFixJsonString(input)

      // 尝试策略2失败后，应该返回原始trimmed值
      expect(result).toBeTruthy()
    })

    it('应该处理包含反斜杠但不是转义JSON的情况', () => {
      // 策略3：包含反斜杠但不以引号开头，但去转义后仍不是有效JSON
      const input = 'some\\text\\here'
      const result = tryFixJsonString(input)

      // 所有策略失败后返回原始trimmed值
      expect(result).toBe('some\\text\\here')
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
      let input = JSON.stringify({ key: 'value' })
      for (let i = 0; i < 11; i++) {
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

  describe('addQuotesAndUnescape 加引号+去转义', () => {
    it('应该正确处理裸露的转义JSON', () => {
      const input = '{\\"user\\":\\"Alice\\"}'
      const result = addQuotesAndUnescape(input)

      expect(result.success).toBe(true)
      expect(JSON.parse(result.data!)).toEqual({ user: 'Alice' })
    })

    it('应该处理包含嵌套对象的裸露转义JSON', () => {
      const input = '{\\"user\\":\\"Alice\\",\\"profile\\":{\\"age\\":25}}'
      const result = addQuotesAndUnescape(input)

      expect(result.success).toBe(true)
      expect(JSON.parse(result.data!)).toEqual({
        user: 'Alice',
        profile: { age: 25 },
      })
    })

    it('应该处理包含数组的裸露转义JSON', () => {
      const input = '{\\"items\\":[1,2,3]}'
      const result = addQuotesAndUnescape(input)

      expect(result.success).toBe(true)
      expect(JSON.parse(result.data!)).toEqual({ items: [1, 2, 3] })
    })

    it('应该拒绝空输入', () => {
      const result = addQuotesAndUnescape('')

      expect(result.success).toBe(false)
      expect(result.error).toBe('输入内容为空')
    })

    it('应该拒绝只有空白字符的输入', () => {
      const result = addQuotesAndUnescape('   ')

      expect(result.success).toBe(false)
      expect(result.error).toBe('输入内容为空')
    })

    it('应该处理普通文本', () => {
      const input = 'hello world'
      const result = addQuotesAndUnescape(input)

      // 普通文本添加引号后再去转义，结果还是原文本
      expect(result.success).toBe(true)
      expect(result.data).toBe('hello world')
    })
  })

  describe('escapeAndRemoveQuotes 转义+去引号', () => {
    it('应该正确处理标准JSON对象', () => {
      const input = '{"user":"Alice"}'
      const result = escapeAndRemoveQuotes(input)

      expect(result.success).toBe(true)
      expect(result.data).toBe('{\\"user\\":\\"Alice\\"}')
    })

    it('应该处理包含嵌套对象的JSON', () => {
      const input = '{"user":"Alice","profile":{"age":25}}'
      const result = escapeAndRemoveQuotes(input)

      expect(result.success).toBe(true)
      expect(result.data).toBe('{\\"user\\":\\"Alice\\",\\"profile\\":{\\"age\\":25}}')
    })

    it('应该处理包含数组的JSON', () => {
      const input = '{"items":[1,2,3]}'
      const result = escapeAndRemoveQuotes(input)

      expect(result.success).toBe(true)
      expect(result.data).toBe('{\\"items\\":[1,2,3]}')
    })

    it('应该处理格式化的JSON', () => {
      const input = '{\n  "user": "Alice"\n}'
      const result = escapeAndRemoveQuotes(input)

      expect(result.success).toBe(true)
      expect(result.data).toContain('\\n')
    })

    it('应该拒绝空输入', () => {
      const result = escapeAndRemoveQuotes('')

      expect(result.success).toBe(false)
      expect(result.error).toBe('输入内容为空')
    })

    it('应该拒绝只有空白字符的输入', () => {
      const result = escapeAndRemoveQuotes('   ')

      expect(result.success).toBe(false)
      expect(result.error).toBe('输入内容为空')
    })

    it('应该处理普通文本', () => {
      const input = 'hello world'
      const result = escapeAndRemoveQuotes(input)

      expect(result.success).toBe(true)
      expect(result.data).toBe('hello world')
    })
  })

  describe('组合操作往返测试', () => {
    it('应该支持裸露转义JSON的往返转换', () => {
      const original = '{\\"user\\":\\"Alice\\",\\"age\\":25}'

      // 展开编辑：加引号+去转义
      const expandResult = addQuotesAndUnescape(original)
      expect(expandResult.success).toBe(true)

      // 修改内容（模拟用户编辑）
      const edited = JSON.parse(expandResult.data!)
      edited.age = 26
      const editedJson = JSON.stringify(edited)

      // 收起保存：转义+去引号
      const collapseResult = escapeAndRemoveQuotes(editedJson)
      expect(collapseResult.success).toBe(true)

      // 验证结果格式正确
      expect(collapseResult.data).toBe('{\\"user\\":\\"Alice\\",\\"age\\":26}')
    })

    it('应该支持标准JSON的转换流程', () => {
      const original = '{"user":"Bob"}'

      // 转义+去引号
      const collapseResult = escapeAndRemoveQuotes(original)
      expect(collapseResult.success).toBe(true)
      expect(collapseResult.data).toBe('{\\"user\\":\\"Bob\\"}')

      // 加引号+去转义（还原）
      const expandResult = addQuotesAndUnescape(collapseResult.data!)
      expect(expandResult.success).toBe(true)
      expect(JSON.parse(expandResult.data!)).toEqual({ user: 'Bob' })
    })
  })

  describe('compactEscapeAndRemoveQuotes 压缩+转义+去引号', () => {
    it('应该正确处理格式化的JSON', () => {
      const input = '{\n  "user": "Alice",\n  "age": 25\n}'
      const result = compactEscapeAndRemoveQuotes(input)

      expect(result.success).toBe(true)
      expect(result.data).toBe('{\\"user\\":\\"Alice\\",\\"age\\":25}')
    })

    it('应该处理已经压缩的JSON', () => {
      const input = '{"user":"Alice","age":25}'
      const result = compactEscapeAndRemoveQuotes(input)

      expect(result.success).toBe(true)
      expect(result.data).toBe('{\\"user\\":\\"Alice\\",\\"age\\":25}')
    })

    it('应该处理包含嵌套对象的JSON', () => {
      const input = '{"user":"Alice","profile":{"age":25,"city":"NYC"}}'
      const result = compactEscapeAndRemoveQuotes(input)

      expect(result.success).toBe(true)
      expect(result.data).toBe(
        '{\\"user\\":\\"Alice\\",\\"profile\\":{\\"age\\":25,\\"city\\":\\"NYC\\"}}'
      )
    })

    it('应该处理包含数组的JSON', () => {
      const input = '{"items":[1,2,3],"total":3}'
      const result = compactEscapeAndRemoveQuotes(input)

      expect(result.success).toBe(true)
      expect(result.data).toBe('{\\"items\\":[1,2,3],\\"total\\":3}')
    })

    it('应该拒绝空输入', () => {
      const result = compactEscapeAndRemoveQuotes('')

      expect(result.success).toBe(false)
      expect(result.error).toBe('输入内容为空')
    })

    it('应该拒绝只有空白字符的输入', () => {
      const result = compactEscapeAndRemoveQuotes('   ')

      expect(result.success).toBe(false)
      expect(result.error).toBe('输入内容为空')
    })

    it('应该处理复杂嵌套结构', () => {
      const input = `{
  "users": [
    { "name": "Alice", "age": 25 },
    { "name": "Bob", "age": 30 }
  ],
  "meta": { "total": 2 }
}`
      const result = compactEscapeAndRemoveQuotes(input)

      expect(result.success).toBe(true)
      // 验证结果是紧凑格式的裸露转义JSON
      expect(result.data).not.toContain('\n')
      expect(result.data).toContain('\\"users\\"')
      expect(result.data).toContain('\\"meta\\"')
    })

    it('应该支持完整的工作流：格式化→压缩→转义→去引号', () => {
      // 用户从日志中选中格式化的JSON
      const formatted = '{\n  "user": "Alice",\n  "action": "login"\n}'

      // 使用组合键转换为裸露转义格式
      const result = compactEscapeAndRemoveQuotes(formatted)
      expect(result.success).toBe(true)

      // 验证结果是紧凑的裸露转义格式
      const expected = '{\\"user\\":\\"Alice\\",\\"action\\":\\"login\\"}'
      expect(result.data).toBe(expected)

      // 验证可以通过加引号+去转义还原
      const restoreResult = addQuotesAndUnescape(result.data!)
      expect(restoreResult.success).toBe(true)
      expect(JSON.parse(restoreResult.data!)).toEqual({
        user: 'Alice',
        action: 'login',
      })
    })
  })
})
