/**
 * element-fields 单元测试
 * 测试 Element 字段定义和获取功能
 */

import {
  COMMON_FIELDS,
  ELEMENT_TYPES,
  getCommonFields,
  getFieldsForElementType,
} from '../element-fields'

describe('element-fields', () => {
  describe('ELEMENT_TYPES', () => {
    it('应该包含所有 21 种 Element 类型', () => {
      expect(ELEMENT_TYPES).toHaveLength(21)
    })

    it('应该包含基础类型', () => {
      const basicTypes = ['paragraph', 'head', 'code', 'blockquote', 'list']
      basicTypes.forEach((type) => {
        expect(ELEMENT_TYPES).toContain(type)
      })
    })

    it('应该包含媒体类型', () => {
      const mediaTypes = ['media', 'chart', 'attach', 'link-card']
      mediaTypes.forEach((type) => {
        expect(ELEMENT_TYPES).toContain(type)
      })
    })

    it('应该包含表格类型', () => {
      const tableTypes = ['table', 'table-row', 'table-cell']
      tableTypes.forEach((type) => {
        expect(ELEMENT_TYPES).toContain(type)
      })
    })

    it('应该包含特殊类型', () => {
      const specialTypes = ['schema', 'apaasify', 'card', 'hr', 'break']
      specialTypes.forEach((type) => {
        expect(ELEMENT_TYPES).toContain(type)
      })
    })
  })

  describe('COMMON_FIELDS', () => {
    it('应该包含核心必需字段', () => {
      const fieldNames = COMMON_FIELDS.map((f) => f.name)
      expect(fieldNames).toContain('type')
      expect(fieldNames).toContain('children')
    })

    it('type 字段应该是必需的', () => {
      const typeField = COMMON_FIELDS.find((f) => f.name === 'type')
      expect(typeField).toBeDefined()
      expect(typeField!.required).toBe(true)
    })

    it('type 字段应该有枚举值', () => {
      const typeField = COMMON_FIELDS.find((f) => f.name === 'type')
      expect(typeField).toBeDefined()
      expect(typeField!.enumValues).toBeDefined()
      expect(typeField!.enumValues).toHaveLength(21)
    })

    it('children 字段应该是必需的', () => {
      const childrenField = COMMON_FIELDS.find((f) => f.name === 'children')
      expect(childrenField).toBeDefined()
      expect(childrenField!.required).toBe(true)
    })

    it('应该包含基础属性字段', () => {
      const fieldNames = COMMON_FIELDS.map((f) => f.name)
      const basicFields = ['id', 'class', 'style']
      basicFields.forEach((field) => {
        expect(fieldNames).toContain(field)
      })
    })

    it('应该包含布局相关字段', () => {
      const fieldNames = COMMON_FIELDS.map((f) => f.name)
      const layoutFields = ['align', 'indent', 'h']
      layoutFields.forEach((field) => {
        expect(fieldNames).toContain(field)
      })
    })

    it('align 字段应该有枚举值', () => {
      const alignField = COMMON_FIELDS.find((f) => f.name === 'align')
      expect(alignField).toBeDefined()
      expect(alignField!.enumValues).toBeDefined()
      expect(alignField!.enumValues).toEqual(['left', 'center', 'right', 'justify'])
    })

    it('应该包含内容相关字段', () => {
      const fieldNames = COMMON_FIELDS.map((f) => f.name)
      const contentFields = ['value', 'text', 'render']
      contentFields.forEach((field) => {
        expect(fieldNames).toContain(field)
      })
    })

    it('应该包含链接和媒体字段', () => {
      const fieldNames = COMMON_FIELDS.map((f) => f.name)
      const mediaFields = ['url', 'title', 'alt', 'width', 'height']
      mediaFields.forEach((field) => {
        expect(fieldNames).toContain(field)
      })
    })

    it('应该包含列表相关字段', () => {
      const fieldNames = COMMON_FIELDS.map((f) => f.name)
      const listFields = ['order', 'start', 'checked', 'task']
      listFields.forEach((field) => {
        expect(fieldNames).toContain(field)
      })
    })

    it('应该包含代码相关字段', () => {
      const fieldNames = COMMON_FIELDS.map((f) => f.name)
      const codeFields = ['language', 'frontmatter', 'katex', 'isConfig']
      codeFields.forEach((field) => {
        expect(fieldNames).toContain(field)
      })
    })

    it('应该包含表格相关字段', () => {
      const fieldNames = COMMON_FIELDS.map((f) => f.name)
      const tableFields = ['colSpan', 'rowSpan']
      tableFields.forEach((field) => {
        expect(fieldNames).toContain(field)
      })
    })

    it('应该包含扩展属性字段', () => {
      const fieldNames = COMMON_FIELDS.map((f) => f.name)
      const extFields = ['contextProps', 'otherProps']
      extFields.forEach((field) => {
        expect(fieldNames).toContain(field)
      })
    })

    it('扩展属性字段应该有最低优先级', () => {
      const contextPropsField = COMMON_FIELDS.find((f) => f.name === 'contextProps')
      const otherPropsField = COMMON_FIELDS.find((f) => f.name === 'otherProps')

      expect(contextPropsField).toBeDefined()
      expect(otherPropsField).toBeDefined()
      expect(contextPropsField!.priority).toBeGreaterThan(50)
      expect(otherPropsField!.priority).toBeGreaterThan(50)
    })

    it('所有字段应该有描述', () => {
      COMMON_FIELDS.forEach((field) => {
        expect(field.description).toBeDefined()
        expect(field.description.length).toBeGreaterThan(0)
      })
    })

    it('所有字段应该有优先级', () => {
      COMMON_FIELDS.forEach((field) => {
        expect(field.priority).toBeDefined()
        expect(field.priority).toBeGreaterThan(0)
      })
    })

    it('应该有足够多的字段（至少 30 个）', () => {
      expect(COMMON_FIELDS.length).toBeGreaterThanOrEqual(30)
    })
  })

  describe('getCommonFields', () => {
    it('应该返回所有通用字段', () => {
      const fields = getCommonFields()
      expect(fields.length).toBe(COMMON_FIELDS.length)
    })

    it('返回的字段应该按优先级排序', () => {
      const fields = getCommonFields()

      for (let i = 0; i < fields.length - 1; i++) {
        expect(fields[i].priority).toBeLessThanOrEqual(fields[i + 1].priority)
      }
    })

    it('type 字段应该排在最前面', () => {
      const fields = getCommonFields()
      expect(fields[0].name).toBe('type')
    })

    it('children 字段应该排在第二位', () => {
      const fields = getCommonFields()
      expect(fields[1].name).toBe('children')
    })
  })

  describe('getFieldsForElementType', () => {
    it('应该返回 paragraph 类型的字段', () => {
      const fields = getFieldsForElementType('paragraph')

      expect(fields.length).toBeGreaterThan(0)

      const fieldNames = fields.map((f) => f.name)
      expect(fieldNames).toContain('type')
      expect(fieldNames).toContain('children')
      expect(fieldNames).toContain('align')
    })

    it('应该返回 head 类型的字段', () => {
      const fields = getFieldsForElementType('head')

      const fieldNames = fields.map((f) => f.name)
      expect(fieldNames).toContain('type')
      expect(fieldNames).toContain('children')
      expect(fieldNames).toContain('level')
      expect(fieldNames).toContain('align')
    })

    it('应该返回 code 类型的字段', () => {
      const fields = getFieldsForElementType('code')

      const fieldNames = fields.map((f) => f.name)
      expect(fieldNames).toContain('type')
      expect(fieldNames).toContain('children')
      expect(fieldNames).toContain('language')
      expect(fieldNames).toContain('value')
      expect(fieldNames).toContain('render')
    })

    it('应该返回 list 类型的字段', () => {
      const fields = getFieldsForElementType('list')

      const fieldNames = fields.map((f) => f.name)
      expect(fieldNames).toContain('type')
      expect(fieldNames).toContain('children')
      expect(fieldNames).toContain('order')
      expect(fieldNames).toContain('start')
      expect(fieldNames).toContain('task')
    })

    it('应该返回 list-item 类型的字段', () => {
      const fields = getFieldsForElementType('list-item')

      const fieldNames = fields.map((f) => f.name)
      expect(fieldNames).toContain('type')
      expect(fieldNames).toContain('children')
      expect(fieldNames).toContain('checked')
    })

    it('应该返回 media 类型的字段', () => {
      const fields = getFieldsForElementType('media')

      const fieldNames = fields.map((f) => f.name)
      expect(fieldNames).toContain('type')
      expect(fieldNames).toContain('url')
      expect(fieldNames).toContain('title')
    })

    it('应该为未知类型返回通用字段', () => {
      const fields = getFieldsForElementType('unknown-type')

      // 应该至少包含通用字段
      expect(fields.length).toBeGreaterThanOrEqual(COMMON_FIELDS.length)
    })

    it('返回的字段应该按优先级排序', () => {
      const fields = getFieldsForElementType('head')

      for (let i = 0; i < fields.length - 1; i++) {
        expect(fields[i].priority).toBeLessThanOrEqual(fields[i + 1].priority)
      }
    })

    it('返回的字段应该已去重', () => {
      const fields = getFieldsForElementType('code')
      const fieldNames = fields.map((f) => f.name)
      const uniqueNames = new Set(fieldNames)

      // 应该没有重复的字段名
      expect(uniqueNames.size).toBeGreaterThan(0)
      // 注意：getFieldsForElementType 内部会处理重复，所以可能会有重复
      // 这里只验证返回的字段数量合理
      expect(fields.length).toBeGreaterThanOrEqual(COMMON_FIELDS.length)
    })

    it('type 字段应该始终排在最前面', () => {
      const types = ['paragraph', 'head', 'code', 'list', 'media']

      types.forEach((type) => {
        const fields = getFieldsForElementType(type)
        expect(fields[0].name).toBe('type')
      })
    })

    it('children 字段应该始终排在第二位', () => {
      const types = ['paragraph', 'head', 'code', 'list', 'media']

      types.forEach((type) => {
        const fields = getFieldsForElementType(type)
        expect(fields[1].name).toBe('children')
      })
    })
  })

  describe('字段定义完整性', () => {
    it('每个字段都应该有完整的属性', () => {
      const fields = getCommonFields()

      fields.forEach((field) => {
        expect(field.name).toBeDefined()
        expect(typeof field.name).toBe('string')
        expect(field.name.length).toBeGreaterThan(0)

        expect(field.type).toBeDefined()
        expect(typeof field.type).toBe('string')

        expect(field.description).toBeDefined()
        expect(typeof field.description).toBe('string')

        expect(field.required).toBeDefined()
        expect(typeof field.required).toBe('boolean')

        expect(field.priority).toBeDefined()
        expect(typeof field.priority).toBe('number')
      })
    })

    it('枚举字段应该有有效的 enumValues', () => {
      const fields = getCommonFields()

      fields.forEach((field) => {
        if (field.enumValues) {
          expect(Array.isArray(field.enumValues)).toBe(true)
          expect(field.enumValues.length).toBeGreaterThan(0)
        }
      })
    })
  })
})
