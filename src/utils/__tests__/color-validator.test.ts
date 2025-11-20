import { isValidHexColor, normalizeColorValue } from '../ui/color'

describe('颜色验证工具测试', () => {
  describe('isValidHexColor', () => {
    it('应该验证有效的6位hex颜色', () => {
      expect(isValidHexColor('#39C5BB')).toBe(true)
      expect(isValidHexColor('#000000')).toBe(true)
      expect(isValidHexColor('#FFFFFF')).toBe(true)
      expect(isValidHexColor('#123abc')).toBe(true)
    })

    it('应该验证有效的3位hex颜色', () => {
      expect(isValidHexColor('#ABC')).toBe(true)
      expect(isValidHexColor('#000')).toBe(true)
      expect(isValidHexColor('#FFF')).toBe(true)
      expect(isValidHexColor('#1a2')).toBe(true)
    })

    it('应该拒绝无效格式', () => {
      expect(isValidHexColor('')).toBe(false)
      expect(isValidHexColor('39C5BB')).toBe(false)
      expect(isValidHexColor('#GGG')).toBe(false)
      expect(isValidHexColor('#12')).toBe(false)
      expect(isValidHexColor('#12345')).toBe(false)
      expect(isValidHexColor('#1234567')).toBe(false)
      expect(isValidHexColor('rgb(255, 255, 255)')).toBe(false)
    })

    it('应该拒绝非字符串类型', () => {
      expect(isValidHexColor(null as any)).toBe(false)
      expect(isValidHexColor(undefined as any)).toBe(false)
      expect(isValidHexColor(123 as any)).toBe(false)
      expect(isValidHexColor({} as any)).toBe(false)
    })
  })

  describe('normalizeColorValue', () => {
    const defaultColor = '#39C5BB'

    it('应该返回有效的颜色值', () => {
      expect(normalizeColorValue('#123456', defaultColor)).toBe('#123456')
      expect(normalizeColorValue('#ABC', defaultColor)).toBe('#ABC')
    })

    it('应该对无效值返回默认颜色', () => {
      expect(normalizeColorValue('', defaultColor)).toBe(defaultColor)
      expect(normalizeColorValue('invalid', defaultColor)).toBe(defaultColor)
      expect(normalizeColorValue('#GGG', defaultColor)).toBe(defaultColor)
      expect(normalizeColorValue(null, defaultColor)).toBe(defaultColor)
      expect(normalizeColorValue(undefined, defaultColor)).toBe(defaultColor)
      expect(normalizeColorValue(123, defaultColor)).toBe(defaultColor)
    })

    it('应该处理大小写', () => {
      expect(normalizeColorValue('#ffffff', defaultColor)).toBe('#ffffff')
      expect(normalizeColorValue('#FFFFFF', defaultColor)).toBe('#FFFFFF')
      expect(normalizeColorValue('#FfFfFf', defaultColor)).toBe('#FfFfFf')
    })
  })
})

