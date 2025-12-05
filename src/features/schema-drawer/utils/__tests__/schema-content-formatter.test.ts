import { describe, expect, it } from 'vitest'
import {
  formatSchemaContent,
  getJsonSyntaxError,
  isContentEqual,
  safeJsonParse,
} from '../schema-content-formatter'

describe('schema-content-formatter', () => {
  describe('formatSchemaContent', () => {
    describe('默认 JSON 格式化', () => {
      it('应该将对象格式化为 JSON 字符串', () => {
        const data = { type: 'paragraph', children: [] }
        const result = formatSchemaContent(data, {
          isRecordingMode: false,
          autoParseEnabled: false,
        })

        expect(result.content).toBe(JSON.stringify(data, null, 2))
        expect(result.wasStringData).toBe(false)
        expect(result.warning).toBeUndefined()
      })

      it('应该将数组格式化为 JSON 字符串', () => {
        const data = [{ type: 'paragraph' }, { type: 'text' }]
        const result = formatSchemaContent(data, {
          isRecordingMode: false,
          autoParseEnabled: false,
        })

        expect(result.content).toBe(JSON.stringify(data, null, 2))
        expect(result.wasStringData).toBe(false)
      })

      it('应该将数字格式化为 JSON 字符串', () => {
        const result = formatSchemaContent(42, {
          isRecordingMode: false,
          autoParseEnabled: false,
        })

        expect(result.content).toBe('42')
        expect(result.wasStringData).toBe(false)
      })

      it('应该将 null 格式化为 JSON 字符串', () => {
        const result = formatSchemaContent(null, {
          isRecordingMode: false,
          autoParseEnabled: false,
        })

        expect(result.content).toBe('null')
        expect(result.wasStringData).toBe(false)
      })

      it('应该将布尔值格式化为 JSON 字符串', () => {
        const result = formatSchemaContent(true, {
          isRecordingMode: false,
          autoParseEnabled: false,
        })

        expect(result.content).toBe('true')
        expect(result.wasStringData).toBe(false)
      })
    })

    describe('录制模式', () => {
      it('应该在录制模式下直接显示字符串', () => {
        const data = 'Hello\nWorld'
        const result = formatSchemaContent(data, {
          isRecordingMode: true,
          autoParseEnabled: false,
        })

        expect(result.content).toBe(data)
        expect(result.wasStringData).toBe(true)
      })

      it('应该在录制模式下保留字符串中的换行符', () => {
        const data = 'Line 1\nLine 2\nLine 3'
        const result = formatSchemaContent(data, {
          isRecordingMode: true,
          autoParseEnabled: true, // 即使启用自动解析，录制模式也应该直接显示
        })

        expect(result.content).toBe(data)
        expect(result.wasStringData).toBe(true)
      })

      it('应该在录制模式下将非字符串数据格式化为 JSON', () => {
        const data = { type: 'paragraph' }
        const result = formatSchemaContent(data, {
          isRecordingMode: true,
          autoParseEnabled: false,
        })

        expect(result.content).toBe(JSON.stringify(data, null, 2))
        expect(result.wasStringData).toBe(false)
      })
    })

    describe('自动解析模式', () => {
      it('不应该在录制模式下触发自动解析', () => {
        const markdownString = '# Title\n\nParagraph text'
        const result = formatSchemaContent(markdownString, {
          isRecordingMode: true,
          autoParseEnabled: true,
        })

        // 录制模式优先，直接显示字符串
        expect(result.content).toBe(markdownString)
        expect(result.wasStringData).toBe(true)
      })

      it('不应该在禁用自动解析时触发解析', () => {
        const markdownString = '# Title'
        const result = formatSchemaContent(markdownString, {
          isRecordingMode: false,
          autoParseEnabled: false,
        })

        // 禁用自动解析，格式化为 JSON 字符串
        expect(result.content).toBe(JSON.stringify(markdownString, null, 2))
        expect(result.wasStringData).toBe(false)
      })

      it('应该在解析失败时返回警告', () => {
        // 空字符串无法解析为有效的 Markdown elements
        const emptyString = ''
        const result = formatSchemaContent(emptyString, {
          isRecordingMode: false,
          autoParseEnabled: true,
        })

        expect(result.warning).toBe('Markdown解析失败，显示原始字符串')
        expect(result.wasStringData).toBe(false)
      })
    })
  })

  describe('getJsonSyntaxError', () => {
    it('应该对有效 JSON 返回 null', () => {
      expect(getJsonSyntaxError('{"a": 1}')).toBeNull()
      expect(getJsonSyntaxError('[1, 2, 3]')).toBeNull()
      expect(getJsonSyntaxError('"string"')).toBeNull()
      expect(getJsonSyntaxError('42')).toBeNull()
      expect(getJsonSyntaxError('null')).toBeNull()
      expect(getJsonSyntaxError('true')).toBeNull()
    })

    it('应该对无效 JSON 返回错误信息', () => {
      const error = getJsonSyntaxError('{invalid}')
      expect(error).not.toBeNull()
      expect(typeof error).toBe('string')
    })

    it('应该对空字符串返回错误信息', () => {
      const error = getJsonSyntaxError('')
      expect(error).not.toBeNull()
    })

    it('应该对不完整的 JSON 返回错误信息', () => {
      const error = getJsonSyntaxError('{"a": ')
      expect(error).not.toBeNull()
    })
  })

  describe('safeJsonParse', () => {
    it('应该成功解析有效 JSON', () => {
      const result = safeJsonParse<{ a: number }>('{"a": 1}')
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual({ a: 1 })
      }
    })

    it('应该成功解析数组', () => {
      const result = safeJsonParse<number[]>('[1, 2, 3]')
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual([1, 2, 3])
      }
    })

    it('应该对无效 JSON 返回错误', () => {
      const result = safeJsonParse('{invalid}')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(typeof result.error).toBe('string')
      }
    })

    it('应该对空字符串返回错误', () => {
      const result = safeJsonParse('')
      expect(result.success).toBe(false)
    })
  })

  describe('isContentEqual', () => {
    it('应该判断相同字符串相等', () => {
      expect(isContentEqual('hello', 'hello')).toBe(true)
      expect(isContentEqual('', '')).toBe(true)
    })

    it('应该判断不同字符串不相等', () => {
      expect(isContentEqual('hello', 'world')).toBe(false)
    })

    it('应该忽略 JSON 格式差异', () => {
      const compact = '{"a":1,"b":2}'
      const formatted = '{\n  "a": 1,\n  "b": 2\n}'
      expect(isContentEqual(compact, formatted)).toBe(true)
    })

    it('应该正确比较不同的 JSON 内容', () => {
      expect(isContentEqual('{"a":1}', '{"a":2}')).toBe(false)
      expect(isContentEqual('{"a":1}', '{"b":1}')).toBe(false)
    })

    it('应该正确比较数组 JSON', () => {
      expect(isContentEqual('[1,2,3]', '[1, 2, 3]')).toBe(true)
      expect(isContentEqual('[1,2,3]', '[1,2,4]')).toBe(false)
    })

    it('应该对非 JSON 字符串进行字符串比较', () => {
      expect(isContentEqual('not json', 'not json')).toBe(true)
      expect(isContentEqual('not json', 'different')).toBe(false)
    })
  })
})
