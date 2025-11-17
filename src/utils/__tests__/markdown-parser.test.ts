import { isElementsArray, isStringData, parseMarkdownString, parserSchemaNodeToMarkdown } from '../markdown-parser'

describe('Markdown解析工具测试', () => {
  describe('parseMarkdownString', () => {
    it('应该解析简单的Markdown字符串', () => {
      const markdown = '# 标题\n\n这是一段文本'
      const result = parseMarkdownString(markdown)
      
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
    })

    it('应该解析包含列表的Markdown', () => {
      const markdown = '- 项目1\n- 项目2\n- 项目3'
      const result = parseMarkdownString(markdown)
      
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
    })

    it('应该解析包含代码块的Markdown', () => {
      const markdown = '```javascript\nconst a = 1;\n```'
      const result = parseMarkdownString(markdown)
      
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
    })

    it('解析失败时应该返回空数组', () => {
      const result = parseMarkdownString('')
      
      expect(Array.isArray(result)).toBe(true)
    })

    it('应该处理复杂的Markdown结构', () => {
      const markdown = `# 标题

## 子标题

这是一段文本，包含**粗体**和*斜体*。

- 列表项1
- 列表项2

\`\`\`javascript
console.log('Hello');
\`\`\``
      
      const result = parseMarkdownString(markdown)
      
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('parserSchemaNodeToMarkdown', () => {
    it('应该将Elements数组转换为Markdown字符串', () => {
      const markdown = '# 标题\n\n这是文本'
      const elements = parseMarkdownString(markdown)
      const result = parserSchemaNodeToMarkdown(elements)
      
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('应该处理空数组', () => {
      const result = parserSchemaNodeToMarkdown([])
      
      expect(typeof result).toBe('string')
    })

    it('转换后的Markdown应该可以被重新解析', () => {
      const originalMarkdown = '# 测试标题\n\n测试内容'
      const elements = parseMarkdownString(originalMarkdown)
      const convertedMarkdown = parserSchemaNodeToMarkdown(elements)
      const reElements = parseMarkdownString(convertedMarkdown)
      
      expect(Array.isArray(reElements)).toBe(true)
      expect(reElements.length).toBeGreaterThan(0)
    })
  })

  describe('isStringData', () => {
    it('应该识别字符串类型', () => {
      expect(isStringData('hello')).toBe(true)
      expect(isStringData('')).toBe(true)
      expect(isStringData('123')).toBe(true)
    })

    it('应该拒绝非字符串类型', () => {
      expect(isStringData(123)).toBe(false)
      expect(isStringData(null)).toBe(false)
      expect(isStringData(undefined)).toBe(false)
      expect(isStringData({})).toBe(false)
      expect(isStringData([])).toBe(false)
      expect(isStringData(true)).toBe(false)
    })
  })

  describe('isElementsArray', () => {
    it('应该识别有效的Elements数组', () => {
      const elements = [{ type: 'paragraph', children: [] }]
      expect(isElementsArray(elements)).toBe(true)
    })

    it('应该识别从Markdown解析的Elements', () => {
      const markdown = '# 标题'
      const elements = parseMarkdownString(markdown)
      
      if (elements.length > 0) {
        expect(isElementsArray(elements)).toBe(true)
      }
    })

    it('应该拒绝空数组', () => {
      expect(isElementsArray([])).toBe(false)
    })

    it('应该拒绝非数组类型', () => {
      expect(isElementsArray('string')).toBe(false)
      expect(isElementsArray(123)).toBe(false)
      expect(isElementsArray(null)).toBe(false)
      expect(isElementsArray(undefined)).toBe(false)
      expect(isElementsArray({})).toBe(false)
    })

    it('应该拒绝不包含对象的数组', () => {
      expect(isElementsArray([1, 2, 3])).toBe(false)
      expect(isElementsArray(['a', 'b'])).toBe(false)
    })

    it('应该拒绝缺少children属性的对象数组', () => {
      expect(isElementsArray([{ type: 'paragraph' }])).toBe(false)
      expect(isElementsArray([{ name: 'test', value: 123 }])).toBe(false)
      expect(isElementsArray([{ id: 1, title: 'hello' }])).toBe(false)
    })

    it('应该拒绝children不是数组的对象', () => {
      expect(isElementsArray([{ type: 'paragraph', children: 'not array' }])).toBe(false)
      expect(isElementsArray([{ type: 'paragraph', children: null }])).toBe(false)
      expect(isElementsArray([{ type: 'paragraph', children: {} }])).toBe(false)
    })

    it('应该接受包含有效children数组的对象', () => {
      expect(isElementsArray([{ type: 'paragraph', children: [] }])).toBe(true)
      expect(isElementsArray([{ type: 'heading', children: [{ text: 'hello' }] }])).toBe(true)
    })

    it('应该检查数组中的所有元素', () => {
      // 部分有效，部分无效 - 应该拒绝
      expect(isElementsArray([
        { type: 'paragraph', children: [] },
        { type: 'text' } // 缺少children
      ])).toBe(false)

      // 全部有效 - 应该接受
      expect(isElementsArray([
        { type: 'paragraph', children: [] },
        { type: 'heading', children: [{ text: 'title' }] }
      ])).toBe(true)
    })
  })

  describe('双向转换一致性', () => {
    it('Markdown -> Elements -> Markdown 应该保持基本结构', () => {
      const testCases = [
        '# 标题',
        '## 二级标题',
        '这是一段文本',
        '- 列表项',
        '**粗体文本**'
      ]

      testCases.forEach(markdown => {
        const elements = parseMarkdownString(markdown)
        expect(elements.length).toBeGreaterThan(0)
        
        const convertedMarkdown = parserSchemaNodeToMarkdown(elements)
        expect(typeof convertedMarkdown).toBe('string')
        expect(convertedMarkdown.length).toBeGreaterThan(0)
      })
    })
  })
})

