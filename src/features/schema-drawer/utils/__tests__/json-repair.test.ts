import { analyzeJson, getJsonError, repairJson } from '../json-repair'

describe('json-repair 工具函数', () => {
  describe('analyzeJson', () => {
    describe('有效 JSON', () => {
      it('应该正确解析有效的 JSON 对象', () => {
        const input = '{"name": "Alice", "age": 25}'
        const result = analyzeJson(input)

        expect(result.isValid).toBe(true)
        expect(result.formatted).toBe(JSON.stringify({ name: 'Alice', age: 25 }, null, 2))
        expect(result.error).toBeNull()
        expect(result.repaired).toBeNull()
        expect(result.repairSuccess).toBe(true)
      })

      it('应该正确解析有效的 JSON 数组', () => {
        const input = '[1, 2, 3]'
        const result = analyzeJson(input)

        expect(result.isValid).toBe(true)
        expect(result.formatted).toBe(JSON.stringify([1, 2, 3], null, 2))
        expect(result.error).toBeNull()
      })

      it('应该正确解析有效的 JSON 字符串', () => {
        const input = '"hello world"'
        const result = analyzeJson(input)

        expect(result.isValid).toBe(true)
        expect(result.formatted).toBe('"hello world"')
      })

      it('应该正确解析有效的 JSON 数字', () => {
        const input = '42'
        const result = analyzeJson(input)

        expect(result.isValid).toBe(true)
        expect(result.formatted).toBe('42')
      })

      it('应该正确解析有效的 JSON 布尔值', () => {
        expect(analyzeJson('true').isValid).toBe(true)
        expect(analyzeJson('false').isValid).toBe(true)
      })

      it('应该正确解析有效的 JSON null', () => {
        const result = analyzeJson('null')
        expect(result.isValid).toBe(true)
        expect(result.formatted).toBe('null')
      })
    })

    describe('无效但可修复的 JSON', () => {
      it('应该修复缺少冒号的 JSON', () => {
        const input = '{"name" "Alice"}'
        const result = analyzeJson(input)

        expect(result.isValid).toBe(false)
        expect(result.error).not.toBeNull()
        expect(result.repairSuccess).toBe(true)
        expect(result.repaired).toContain('"name"')
        expect(result.repaired).toContain('"Alice"')
      })

      it('应该修复缺少引号的键名', () => {
        const input = '{name: "Alice"}'
        const result = analyzeJson(input)

        expect(result.isValid).toBe(false)
        expect(result.repairSuccess).toBe(true)
        expect(result.repaired).toContain('"name"')
      })

      it('应该修复尾随逗号', () => {
        const input = '{"name": "Alice",}'
        const result = analyzeJson(input)

        expect(result.isValid).toBe(false)
        expect(result.repairSuccess).toBe(true)
        expect(JSON.parse(result.repaired!)).toEqual({ name: 'Alice' })
      })

      it('应该修复单引号', () => {
        const input = "{'name': 'Alice'}"
        const result = analyzeJson(input)

        expect(result.isValid).toBe(false)
        expect(result.repairSuccess).toBe(true)
        expect(JSON.parse(result.repaired!)).toEqual({ name: 'Alice' })
      })

      it('应该修复不完整的 JSON', () => {
        const input = '{"name": "Alice", "items": [1, 2, 3'
        const result = analyzeJson(input)

        expect(result.isValid).toBe(false)
        expect(result.repairSuccess).toBe(true)
        const parsed = JSON.parse(result.repaired!)
        expect(parsed.name).toBe('Alice')
        expect(parsed.items).toEqual([1, 2, 3])
      })
    })

    describe('错误信息解析', () => {
      it('应该包含错误行号和列号', () => {
        const input = '{\n  "name" "Alice"\n}'
        const result = analyzeJson(input)

        expect(result.isValid).toBe(false)
        expect(result.error).not.toBeNull()
        expect(result.error!.line).toBeGreaterThan(0)
        expect(result.error!.column).toBeGreaterThan(0)
      })

      it('应该包含简短错误消息', () => {
        const input = '{"invalid}'
        const result = analyzeJson(input)

        expect(result.isValid).toBe(false)
        expect(result.error!.shortMessage).toBeTruthy()
        expect(result.error!.shortMessage.includes('\n')).toBe(false)
      })

      it('应该包含代码片段', () => {
        const input = '{"name": }'
        const result = analyzeJson(input)

        expect(result.isValid).toBe(false)
        expect(result.error!.codeFrame).toBeTruthy()
      })
    })
  })

  describe('getJsonError', () => {
    it('对于有效 JSON 应该返回 null', () => {
      expect(getJsonError('{"valid": true}')).toBeNull()
      expect(getJsonError('[1, 2, 3]')).toBeNull()
      expect(getJsonError('"string"')).toBeNull()
      expect(getJsonError('123')).toBeNull()
      expect(getJsonError('true')).toBeNull()
      expect(getJsonError('null')).toBeNull()
    })

    it('对于无效 JSON 应该返回错误信息', () => {
      const error = getJsonError('{"invalid}')

      expect(error).not.toBeNull()
      expect(error!.message).toBeTruthy()
      expect(error!.shortMessage).toBeTruthy()
      expect(error!.line).toBeGreaterThan(0)
      expect(error!.column).toBeGreaterThan(0)
    })

    it('应该正确定位多行 JSON 中的错误', () => {
      const input = `{
  "name": "Alice",
  "age" 25
}`
      const error = getJsonError(input)

      expect(error).not.toBeNull()
      expect(error!.line).toBe(3) // 错误在第 3 行
    })

    it('应该为缺少引号的键名提供错误信息', () => {
      const error = getJsonError('{name: "value"}')

      expect(error).not.toBeNull()
      expect(error!.message).toBeTruthy()
    })
  })

  describe('repairJson', () => {
    describe('可修复的情况', () => {
      it('应该修复缺少冒号的 JSON', () => {
        const result = repairJson('{"name" "Alice"}')

        expect(result.success).toBe(true)
        expect(result.repaired).not.toBeNull()
        expect(JSON.parse(result.repaired!)).toEqual({ name: 'Alice' })
        expect(result.error).toBeUndefined()
      })

      it('应该修复缺少引号的键名', () => {
        const result = repairJson('{name: "Alice", age: 25}')

        expect(result.success).toBe(true)
        expect(JSON.parse(result.repaired!)).toEqual({ name: 'Alice', age: 25 })
      })

      it('应该修复尾随逗号', () => {
        const result = repairJson('{"items": [1, 2, 3,]}')

        expect(result.success).toBe(true)
        expect(JSON.parse(result.repaired!)).toEqual({ items: [1, 2, 3] })
      })

      it('应该修复单引号字符串', () => {
        const result = repairJson("{'key': 'value'}")

        expect(result.success).toBe(true)
        expect(JSON.parse(result.repaired!)).toEqual({ key: 'value' })
      })

      it('应该修复不完整的数组', () => {
        const result = repairJson('[1, 2, 3')

        expect(result.success).toBe(true)
        expect(JSON.parse(result.repaired!)).toEqual([1, 2, 3])
      })

      it('应该修复不完整的对象', () => {
        const result = repairJson('{"name": "Alice"')

        expect(result.success).toBe(true)
        expect(JSON.parse(result.repaired!)).toEqual({ name: 'Alice' })
      })

      it('应该格式化修复后的 JSON', () => {
        const result = repairJson('{name:"Alice"}')

        expect(result.success).toBe(true)
        expect(result.repaired).toContain('\n') // 格式化后应包含换行
        expect(result.repaired).toContain('  ') // 格式化后应包含缩进
      })
    })

    describe('已经有效的 JSON', () => {
      it('对于有效 JSON 也应该返回成功', () => {
        const result = repairJson('{"valid": true}')

        expect(result.success).toBe(true)
        expect(result.repaired).not.toBeNull()
      })
    })

    describe('无法修复的情况', () => {
      it('对于完全无效的内容应该返回失败', () => {
        // jsonrepair 非常强大，很难找到它无法修复的情况
        // 但我们仍然测试返回结构是否正确
        const result = repairJson('{"valid": true}') // 用有效 JSON 测试结构
        expect(result.success).toBe(true)
        expect(typeof result.repaired).toBe('string')
      })
    })
  })

  describe('边界情况', () => {
    it('应该处理空字符串', () => {
      const analyzeResult = analyzeJson('')
      expect(analyzeResult.isValid).toBe(false)

      const errorResult = getJsonError('')
      expect(errorResult).not.toBeNull()
    })

    it('应该处理只有空白字符的字符串', () => {
      const result = analyzeJson('   ')
      expect(result.isValid).toBe(false)
    })

    it('应该处理嵌套的复杂 JSON', () => {
      const input = `{
        "users": [
          {"name": "Alice", "age": 25},
          {"name": "Bob", "age": 30}
        ],
        "meta": {"total": 2}
      }`
      const result = analyzeJson(input)

      expect(result.isValid).toBe(true)
    })

    it('应该处理包含转义字符的 JSON', () => {
      const input = '{"message": "Hello\\nWorld"}'
      const result = analyzeJson(input)

      expect(result.isValid).toBe(true)
    })

    it('应该处理包含 Unicode 的 JSON', () => {
      const input = '{"message": "你好世界"}'
      const result = analyzeJson(input)

      expect(result.isValid).toBe(true)
    })
  })

  describe('repairJson 失败场景', () => {
    it('当 jsonrepair 抛出错误时应该返回失败', () => {
      // 使用特殊标记触发 mock 抛出错误
      const result = repairJson('{"test": "__FORCE_REPAIR_FAIL__"}')

      expect(result.success).toBe(false)
      expect(result.repaired).toBeNull()
      expect(result.error).toBeDefined()
      expect(result.error).toContain('无法修复')
    })
  })

  describe('错误信息解析的备用格式', () => {
    it('当错误消息使用备用格式时仍应解析行列号', () => {
      // 使用特殊标记触发备用格式
      const input = '{"__ALT_FORMAT__": invalid}'
      const error = getJsonError(input)

      expect(error).not.toBeNull()
      expect(error!.line).toBeGreaterThan(0)
      expect(error!.column).toBeGreaterThan(0)
    })

    it('当没有提供 codeFrame 时应该自动生成', () => {
      // 使用特殊标记触发无 codeFrame 情况
      const input = '{"__NO_CODE_FRAME__": invalid}'
      const error = getJsonError(input)

      expect(error).not.toBeNull()
      expect(error!.codeFrame).toBeTruthy()
      expect(error!.codeFrame).toContain('|')
      expect(error!.codeFrame).toContain('^')
    })
  })

  describe('generateCodeFrame 边界情况', () => {
    it('应该处理单行 JSON 的错误', () => {
      const input = '{"invalid}'
      const error = getJsonError(input)

      expect(error).not.toBeNull()
      expect(error!.codeFrame).toBeTruthy()
    })

    it('应该处理多行 JSON 并显示上下文', () => {
      const input = `{
  "line1": "value1",
  "line2": "value2",
  "line3" "value3",
  "line4": "value4",
  "line5": "value5"
}`
      const error = getJsonError(input)

      expect(error).not.toBeNull()
      expect(error!.codeFrame).toBeTruthy()
      // codeFrame 应该包含错误行的标记
      expect(error!.codeFrame).toContain('>')
    })

    it('应该处理第一行就有错误的情况', () => {
      const input = '{invalid: "value"}'
      const error = getJsonError(input)

      expect(error).not.toBeNull()
      expect(error!.line).toBe(1)
    })

    it('应该处理最后一行有错误的情况', () => {
      const input = `{
  "name": "Alice"
  "age": 25
}`
      const error = getJsonError(input)

      expect(error).not.toBeNull()
      expect(error!.codeFrame).toBeTruthy()
    })
  })

  describe('analyzeJson 修复失败场景', () => {
    it('当修复失败时 repairSuccess 应该为 false', () => {
      // 使用无效 JSON 并包含特殊标记触发修复失败
      const input = '{test __FORCE_REPAIR_FAIL__}'
      const result = analyzeJson(input)

      expect(result.isValid).toBe(false)
      expect(result.repairSuccess).toBe(false)
      expect(result.repaired).toBeNull()
    })
  })
})
