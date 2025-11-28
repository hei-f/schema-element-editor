import {
  getChangedFieldPath,
  getValueByPath,
  pathEqual,
  pathToString,
  setValueByPath,
} from '../form-path'

describe('form-path 工具函数测试', () => {
  describe('pathToString 路径转字符串', () => {
    it('应该将路径数组转换为点分隔字符串', () => {
      expect(pathToString(['searchConfig', 'searchDepthDown'])).toBe('searchConfig.searchDepthDown')
    })

    it('应该处理单个元素', () => {
      expect(pathToString(['single'])).toBe('single')
    })

    it('应该处理空数组', () => {
      expect(pathToString([])).toBe('')
    })

    it('应该处理多层嵌套', () => {
      expect(pathToString(['a', 'b', 'c', 'd', 'e'])).toBe('a.b.c.d.e')
    })

    it('应该保留特殊字符', () => {
      expect(pathToString(['key-with-dash', 'key_with_underscore'])).toBe(
        'key-with-dash.key_with_underscore'
      )
    })
  })

  describe('pathEqual 路径相等比较', () => {
    it('相同路径应该返回true', () => {
      expect(pathEqual(['a', 'b'], ['a', 'b'])).toBe(true)
    })

    it('不同路径应该返回false', () => {
      expect(pathEqual(['a', 'b'], ['a', 'c'])).toBe(false)
    })

    it('不同长度应该返回false', () => {
      expect(pathEqual(['a', 'b'], ['a', 'b', 'c'])).toBe(false)
    })

    it('空数组应该相等', () => {
      expect(pathEqual([], [])).toBe(true)
    })

    it('应该区分大小写', () => {
      expect(pathEqual(['A', 'B'], ['a', 'b'])).toBe(false)
    })

    it('顺序不同应该返回false', () => {
      expect(pathEqual(['a', 'b'], ['b', 'a'])).toBe(false)
    })
  })

  describe('getChangedFieldPath 获取变更字段路径', () => {
    it('应该从嵌套对象中提取完整路径', () => {
      const changedValues = {
        searchConfig: {
          searchDepthDown: 5,
        },
      }
      expect(getChangedFieldPath(changedValues)).toEqual(['searchConfig', 'searchDepthDown'])
    })

    it('应该处理单层对象', () => {
      const changedValues = { isActive: true }
      expect(getChangedFieldPath(changedValues)).toEqual(['isActive'])
    })

    it('应该处理深度嵌套', () => {
      const changedValues = {
        level1: {
          level2: {
            level3: {
              level4: 'value',
            },
          },
        },
      }
      expect(getChangedFieldPath(changedValues)).toEqual(['level1', 'level2', 'level3', 'level4'])
    })

    it('空对象应该返回前缀', () => {
      expect(getChangedFieldPath({})).toEqual([])
    })

    it('应该处理数组值（作为终点）', () => {
      const changedValues = {
        config: {
          items: [1, 2, 3],
        },
      }
      expect(getChangedFieldPath(changedValues)).toEqual(['config', 'items'])
    })

    it('应该处理null值', () => {
      const changedValues = {
        config: {
          value: null,
        },
      }
      expect(getChangedFieldPath(changedValues)).toEqual(['config', 'value'])
    })

    it('应该处理布尔值', () => {
      const changedValues = {
        settings: {
          enabled: true,
        },
      }
      expect(getChangedFieldPath(changedValues)).toEqual(['settings', 'enabled'])
    })

    it('应该处理数字值', () => {
      const changedValues = {
        config: {
          count: 0,
        },
      }
      expect(getChangedFieldPath(changedValues)).toEqual(['config', 'count'])
    })

    it('应该处理字符串值', () => {
      const changedValues = {
        user: {
          name: 'test',
        },
      }
      expect(getChangedFieldPath(changedValues)).toEqual(['user', 'name'])
    })

    it('应该处理空对象值（作为终点）', () => {
      const changedValues = {
        config: {
          data: {},
        },
      }
      expect(getChangedFieldPath(changedValues)).toEqual(['config', 'data'])
    })
  })

  describe('getValueByPath 根据路径获取值', () => {
    it('应该获取嵌套值', () => {
      const obj = { a: { b: { c: 123 } } }
      expect(getValueByPath(obj, ['a', 'b', 'c'])).toBe(123)
    })

    it('应该获取顶层值', () => {
      const obj = { key: 'value' }
      expect(getValueByPath(obj, ['key'])).toBe('value')
    })

    it('路径不存在应该返回undefined', () => {
      const obj = { a: { b: 1 } }
      expect(getValueByPath(obj, ['a', 'c'])).toBeUndefined()
    })

    it('中间路径是null应该返回undefined', () => {
      const obj = { a: null }
      expect(getValueByPath(obj, ['a', 'b'])).toBeUndefined()
    })

    it('中间路径是undefined应该返回undefined', () => {
      const obj = { a: undefined }
      expect(getValueByPath(obj, ['a', 'b'])).toBeUndefined()
    })

    it('空路径应该返回undefined', () => {
      const obj = { key: 'value' }
      expect(getValueByPath(obj, [])).toBeUndefined()
    })

    it('空对象应该返回undefined', () => {
      expect(getValueByPath(null, ['key'])).toBeUndefined()
      expect(getValueByPath(undefined, ['key'])).toBeUndefined()
    })

    it('应该获取数组元素', () => {
      const obj = { items: ['a', 'b', 'c'] }
      expect(getValueByPath(obj, ['items', '0'])).toBe('a')
      expect(getValueByPath(obj, ['items', '1'])).toBe('b')
    })

    it('应该获取null值', () => {
      const obj = { value: null }
      expect(getValueByPath(obj, ['value'])).toBeNull()
    })

    it('应该获取false值', () => {
      const obj = { flag: false }
      expect(getValueByPath(obj, ['flag'])).toBe(false)
    })

    it('应该获取0值', () => {
      const obj = { count: 0 }
      expect(getValueByPath(obj, ['count'])).toBe(0)
    })
  })

  describe('setValueByPath 根据路径设置值', () => {
    it('应该设置嵌套值', () => {
      const obj: any = {}
      setValueByPath(obj, ['a', 'b', 'c'], 123)
      expect(obj).toEqual({ a: { b: { c: 123 } } })
    })

    it('应该设置顶层值', () => {
      const obj: any = {}
      setValueByPath(obj, ['key'], 'value')
      expect(obj).toEqual({ key: 'value' })
    })

    it('应该覆盖现有值', () => {
      const obj: any = { a: { b: 'old' } }
      setValueByPath(obj, ['a', 'b'], 'new')
      expect(obj).toEqual({ a: { b: 'new' } })
    })

    it('应该创建缺失的中间对象', () => {
      const obj: any = { a: {} }
      setValueByPath(obj, ['a', 'b', 'c'], 'value')
      expect(obj).toEqual({ a: { b: { c: 'value' } } })
    })

    it('应该覆盖非对象的中间值', () => {
      const obj: any = { a: 'string' }
      setValueByPath(obj, ['a', 'b'], 'value')
      expect(obj).toEqual({ a: { b: 'value' } })
    })

    it('空路径不应该修改对象', () => {
      const obj: any = { existing: 'value' }
      setValueByPath(obj, [], 'new')
      expect(obj).toEqual({ existing: 'value' })
    })

    it('null对象不应该报错', () => {
      expect(() => setValueByPath(null, ['key'], 'value')).not.toThrow()
      expect(() => setValueByPath(undefined, ['key'], 'value')).not.toThrow()
    })

    it('应该设置null值', () => {
      const obj: any = {}
      setValueByPath(obj, ['key'], null)
      expect(obj).toEqual({ key: null })
    })

    it('应该设置undefined值', () => {
      const obj: any = {}
      setValueByPath(obj, ['key'], undefined)
      expect(obj).toEqual({ key: undefined })
    })

    it('应该设置数组值', () => {
      const obj: any = {}
      setValueByPath(obj, ['items'], [1, 2, 3])
      expect(obj).toEqual({ items: [1, 2, 3] })
    })

    it('应该设置对象值', () => {
      const obj: any = {}
      const value = { nested: 'value' }
      setValueByPath(obj, ['data'], value)
      expect(obj).toEqual({ data: value })
    })

    it('应该设置深层嵌套值', () => {
      const obj: any = {}
      setValueByPath(obj, ['a', 'b', 'c', 'd', 'e'], 'deep')
      expect(obj).toEqual({ a: { b: { c: { d: { e: 'deep' } } } } })
    })
  })

  describe('综合场景', () => {
    it('应该支持完整的路径操作流程', () => {
      // 创建对象并设置值
      const obj: any = {}
      const path = ['searchConfig', 'searchDepthDown']
      setValueByPath(obj, path, 10)

      // 验证路径字符串
      expect(pathToString(path)).toBe('searchConfig.searchDepthDown')

      // 获取值
      expect(getValueByPath(obj, path)).toBe(10)

      // 路径比较
      expect(pathEqual(path, ['searchConfig', 'searchDepthDown'])).toBe(true)
      expect(pathEqual(path, ['other', 'path'])).toBe(false)
    })

    it('应该处理表单变更检测', () => {
      const changedValues = {
        searchConfig: {
          searchDepthDown: 10,
        },
      }

      const path = getChangedFieldPath(changedValues)
      expect(path).toEqual(['searchConfig', 'searchDepthDown'])
      expect(pathToString(path)).toBe('searchConfig.searchDepthDown')
    })

    it('应该处理复杂嵌套对象的值操作', () => {
      const obj: any = {
        user: {
          profile: {
            settings: {
              theme: 'dark',
            },
          },
        },
      }

      // 获取深层值
      expect(getValueByPath(obj, ['user', 'profile', 'settings', 'theme'])).toBe('dark')

      // 修改深层值
      setValueByPath(obj, ['user', 'profile', 'settings', 'theme'], 'light')
      expect(getValueByPath(obj, ['user', 'profile', 'settings', 'theme'])).toBe('light')

      // 添加新的深层值
      setValueByPath(obj, ['user', 'profile', 'settings', 'language'], 'zh-CN')
      expect(obj.user.profile.settings.language).toBe('zh-CN')
    })
  })
})
