/**
 * theme.ts 单元测试
 * 测试 Shadow DOM 主题配置的结构完整性
 */

import { describe, it, expect } from 'vitest'
import { shadowDomTheme } from '../theme'

describe('shadowDomTheme', () => {
  describe('token 配置', () => {
    it('应该包含 token 配置对象', () => {
      expect(shadowDomTheme.token).toBeDefined()
      expect(typeof shadowDomTheme.token).toBe('object')
    })

    describe('颜色系统', () => {
      it('应该包含主色调配置', () => {
        expect(shadowDomTheme.token?.colorPrimary).toBe('#39c5bb')
      })

      it('应该包含状态颜色配置', () => {
        expect(shadowDomTheme.token?.colorSuccess).toBe('#52c41a')
        expect(shadowDomTheme.token?.colorWarning).toBe('#faad14')
        expect(shadowDomTheme.token?.colorError).toBe('#ff4d4f')
        expect(shadowDomTheme.token?.colorInfo).toBe('#39c5bb')
      })

      it('应该包含文本颜色配置', () => {
        expect(shadowDomTheme.token?.colorText).toBe('rgba(0, 0, 0, 0.88)')
        expect(shadowDomTheme.token?.colorTextSecondary).toBe('rgba(0, 0, 0, 0.65)')
        expect(shadowDomTheme.token?.colorTextTertiary).toBe('rgba(0, 0, 0, 0.45)')
        expect(shadowDomTheme.token?.colorTextQuaternary).toBe('rgba(0, 0, 0, 0.25)')
      })

      it('应该包含边框颜色配置', () => {
        expect(shadowDomTheme.token?.colorBorder).toBe('#d9d9d9')
        expect(shadowDomTheme.token?.colorBorderSecondary).toBe('#f0f0f0')
      })

      it('应该包含背景颜色配置', () => {
        expect(shadowDomTheme.token?.colorBgContainer).toBe('#ffffff')
        expect(shadowDomTheme.token?.colorBgElevated).toBe('#ffffff')
        expect(shadowDomTheme.token?.colorBgLayout).toBe('#f5f5f5')
        expect(shadowDomTheme.token?.colorBgSpotlight).toBe('rgba(0, 0, 0, 0.85)')
      })

      it('应该包含链接颜色配置', () => {
        expect(shadowDomTheme.token?.colorLink).toBe('#39c5bb')
        expect(shadowDomTheme.token?.colorLinkHover).toBe('#5fd4cb')
        expect(shadowDomTheme.token?.colorLinkActive).toBe('#2ba89f')
      })
    })

    describe('尺寸系统', () => {
      it('应该包含圆角配置', () => {
        expect(shadowDomTheme.token?.borderRadius).toBe(6)
      })

      it('应该包含字体大小配置', () => {
        expect(shadowDomTheme.token?.fontSize).toBe(14)
        expect(shadowDomTheme.token?.fontSizeSM).toBe(12)
        expect(shadowDomTheme.token?.fontSizeLG).toBe(16)
      })

      it('应该包含字体族配置', () => {
        expect(shadowDomTheme.token?.fontFamily).toContain('BlinkMacSystemFont')
        expect(shadowDomTheme.token?.fontFamily).toContain('Roboto')
      })

      it('应该包含行高配置', () => {
        expect(shadowDomTheme.token?.lineHeight).toBe(1.5715)
        expect(shadowDomTheme.token?.lineHeightLG).toBe(1.5)
        expect(shadowDomTheme.token?.lineHeightSM).toBe(1.66)
      })

      it('应该包含控件高度配置', () => {
        expect(shadowDomTheme.token?.controlHeight).toBe(32)
        expect(shadowDomTheme.token?.controlHeightLG).toBe(40)
        expect(shadowDomTheme.token?.controlHeightSM).toBe(24)
      })
    })

    describe('视觉效果', () => {
      it('应该包含阴影配置', () => {
        expect(shadowDomTheme.token?.boxShadow).toContain('rgba')
        expect(shadowDomTheme.token?.boxShadowSecondary).toContain('rgba')
      })

      it('应该包含动画配置', () => {
        expect(shadowDomTheme.token?.motionUnit).toBe(0.1)
        expect(shadowDomTheme.token?.motionBase).toBe(0)
        expect(shadowDomTheme.token?.motionEaseInOut).toContain('cubic-bezier')
        expect(shadowDomTheme.token?.motionEaseOut).toContain('cubic-bezier')
      })
    })

    describe('层级系统', () => {
      it('应该包含 z-index 配置', () => {
        expect(shadowDomTheme.token?.zIndexBase).toBe(0)
        // zIndexPopupBase 已注释掉，使用 see- 前缀后不再需要
      })
    })
  })

  describe('components 配置', () => {
    it('应该包含 components 配置对象', () => {
      expect(shadowDomTheme.components).toBeDefined()
      expect(typeof shadowDomTheme.components).toBe('object')
    })

    it('应该包含 Drawer 组件配置', () => {
      expect(shadowDomTheme.components?.Drawer).toBeDefined()
    })

    it('应该包含 Button 组件配置', () => {
      expect(shadowDomTheme.components?.Button).toBeDefined()
    })

    it('应该包含 Message 组件配置', () => {
      expect(shadowDomTheme.components?.Message).toBeDefined()
    })

    it('应该包含 Modal 组件配置', () => {
      expect(shadowDomTheme.components?.Modal).toBeDefined()
    })

    it('应该包含 Tooltip 组件配置', () => {
      expect(shadowDomTheme.components?.Tooltip).toBeDefined()
    })
  })

  describe('类型完整性', () => {
    it('主题对象应该是有效的 ThemeConfig 类型', () => {
      // 验证结构是否符合 Ant Design ThemeConfig
      expect(shadowDomTheme).toHaveProperty('token')
      expect(shadowDomTheme).toHaveProperty('components')
    })

    it('所有颜色值应该是有效的颜色格式', () => {
      const colorTokens = [
        shadowDomTheme.token?.colorPrimary,
        shadowDomTheme.token?.colorSuccess,
        shadowDomTheme.token?.colorWarning,
        shadowDomTheme.token?.colorError,
        shadowDomTheme.token?.colorBorder,
        shadowDomTheme.token?.colorBgContainer,
      ]

      colorTokens.forEach((color) => {
        expect(color).toMatch(/^(#[0-9a-fA-F]{6}|rgba?\([\d\s,.]+\))$/)
      })
    })

    it('所有数值配置应该是数字类型', () => {
      const numberTokens = [
        shadowDomTheme.token?.borderRadius,
        shadowDomTheme.token?.fontSize,
        shadowDomTheme.token?.fontSizeSM,
        shadowDomTheme.token?.fontSizeLG,
        shadowDomTheme.token?.lineHeight,
        shadowDomTheme.token?.controlHeight,
        shadowDomTheme.token?.controlHeightLG,
        shadowDomTheme.token?.controlHeightSM,
        shadowDomTheme.token?.zIndexBase,
        // zIndexPopupBase 已注释掉，使用 see- 前缀后不再需要
      ]

      numberTokens.forEach((value) => {
        expect(typeof value).toBe('number')
      })
    })
  })
})
