import { isValidHexColor, normalizeColorValue } from '../color'

describe('Color工具测试', () => {
  describe('isValidHexColor', () => {
    it('应该验证有效的6位hex颜色', () => {
      expect(isValidHexColor('#FF0000')).toBe(true)
      expect(isValidHexColor('#00FF00')).toBe(true)
      expect(isValidHexColor('#0000FF')).toBe(true)
      expect(isValidHexColor('#123456')).toBe(true)
      expect(isValidHexColor('#ABCDEF')).toBe(true)
      expect(isValidHexColor('#abcdef')).toBe(true)
    })

    it('应该验证有效的3位hex颜色', () => {
      expect(isValidHexColor('#F00')).toBe(true)
      expect(isValidHexColor('#0F0')).toBe(true)
      expect(isValidHexColor('#00F')).toBe(true)
      expect(isValidHexColor('#ABC')).toBe(true)
      expect(isValidHexColor('#abc')).toBe(true)
    })

    it('应该拒绝无效的颜色格式', () => {
      expect(isValidHexColor('')).toBe(false)
      expect(isValidHexColor('FF0000')).toBe(false) // 缺少#
      expect(isValidHexColor('#FF')).toBe(false) // 太短
      expect(isValidHexColor('#FFFF')).toBe(false) // 长度错误
      expect(isValidHexColor('#FFFFF')).toBe(false) // 长度错误
      expect(isValidHexColor('#FFFFFFF')).toBe(false) // 太长
      expect(isValidHexColor('#GGGGGG')).toBe(false) // 无效字符
      expect(isValidHexColor('#XYZ')).toBe(false) // 无效字符
    })

    it('应该处理非字符串输入', () => {
      expect(isValidHexColor(null as any)).toBe(false)
      expect(isValidHexColor(undefined as any)).toBe(false)
      expect(isValidHexColor(123 as any)).toBe(false)
      expect(isValidHexColor({} as any)).toBe(false)
      expect(isValidHexColor([] as any)).toBe(false)
    })

    it('应该拒绝包含空格的颜色', () => {
      expect(isValidHexColor(' #FF0000')).toBe(false)
      expect(isValidHexColor('#FF0000 ')).toBe(false)
      expect(isValidHexColor('# FF0000')).toBe(false)
    })
  })

  describe('normalizeColorValue', () => {
    const defaultColor = '#000000'

    it('应该返回有效的hex颜色', () => {
      expect(normalizeColorValue('#FF0000', defaultColor)).toBe('#FF0000')
      expect(normalizeColorValue('#00FF00', defaultColor)).toBe('#00FF00')
      expect(normalizeColorValue('#0000FF', defaultColor)).toBe('#0000FF')
      expect(normalizeColorValue('#ABC', defaultColor)).toBe('#ABC')
    })

    it('应该在无效输入时返回默认颜色', () => {
      expect(normalizeColorValue('', defaultColor)).toBe(defaultColor)
      expect(normalizeColorValue('FF0000', defaultColor)).toBe(defaultColor)
      expect(normalizeColorValue('#GGGGGG', defaultColor)).toBe(defaultColor)
      expect(normalizeColorValue('#FF', defaultColor)).toBe(defaultColor)
    })

    it('应该处理非字符串输入', () => {
      expect(normalizeColorValue(null, defaultColor)).toBe(defaultColor)
      expect(normalizeColorValue(undefined, defaultColor)).toBe(defaultColor)
      expect(normalizeColorValue(123, defaultColor)).toBe(defaultColor)
      expect(normalizeColorValue({}, defaultColor)).toBe(defaultColor)
      expect(normalizeColorValue([], defaultColor)).toBe(defaultColor)
    })

    it('应该使用不同的默认颜色', () => {
      const customDefault = '#FF0000'
      expect(normalizeColorValue('invalid', customDefault)).toBe(customDefault)
      expect(normalizeColorValue(null, customDefault)).toBe(customDefault)
    })

    it('应该支持大小写混合的hex颜色', () => {
      expect(normalizeColorValue('#AbCdEf', defaultColor)).toBe('#AbCdEf')
      expect(normalizeColorValue('#aBc', defaultColor)).toBe('#aBc')
    })
  })

  describe('边界情况', () => {
    it('应该处理最小和最大有效颜色值', () => {
      expect(isValidHexColor('#000')).toBe(true)
      expect(isValidHexColor('#FFF')).toBe(true)
      expect(isValidHexColor('#000000')).toBe(true)
      expect(isValidHexColor('#FFFFFF')).toBe(true)
      expect(isValidHexColor('#ffffff')).toBe(true)
    })

    it('应该处理混合大小写', () => {
      expect(isValidHexColor('#AaBbCc')).toBe(true)
      expect(isValidHexColor('#Abc')).toBe(true)
    })

    it('normalizeColorValue应该保留原始大小写', () => {
      expect(normalizeColorValue('#AaBbCc', '#000')).toBe('#AaBbCc')
      expect(normalizeColorValue('#Abc', '#000')).toBe('#Abc')
    })
  })
})
