import { EDITOR_THEMES } from '@/shared/constants/editor-themes'
import { getEditorThemeVars, isEditorThemeDark } from '../editor-theme-vars'

describe('editor-theme-vars', () => {
  describe('getEditorThemeVars', () => {
    it('light 主题应该返回浅色样式变量', () => {
      const vars = getEditorThemeVars(EDITOR_THEMES.LIGHT)

      expect(vars.isDark).toBe(false)
      expect(vars.textPrimary).toBe('#212529')
    })

    it('dark 主题应该返回深色样式变量', () => {
      const vars = getEditorThemeVars(EDITOR_THEMES.DARK)

      expect(vars.isDark).toBe(true)
      expect(vars.textPrimary).toBe('#e8e8e8')
    })

    it('schemaEditorDark 主题应该返回深色样式变量', () => {
      const vars = getEditorThemeVars(EDITOR_THEMES.SCHEMA_EDITOR_DARK)

      expect(vars.isDark).toBe(true)
      expect(vars.textPrimary).toBe('#e8e8e8')
    })

    it('未知主题应该默认返回深色样式变量', () => {
      const vars = getEditorThemeVars('unknown-theme' as any)

      expect(vars.isDark).toBe(true)
    })

    it('深色主题应该包含正确的 diff 样式', () => {
      const vars = getEditorThemeVars(EDITOR_THEMES.DARK)

      expect(vars.diffAddedBackground).toContain('rgba')
      expect(vars.diffRemovedBackground).toContain('rgba')
      expect(vars.diffModifiedBackground).toContain('rgba')
    })

    it('浅色主题应该包含正确的 diff 样式', () => {
      const vars = getEditorThemeVars(EDITOR_THEMES.LIGHT)

      expect(vars.diffAddedBackground).toContain('rgba')
      expect(vars.diffRemovedBackground).toContain('rgba')
      expect(vars.diffModifiedBackground).toContain('rgba')
    })
  })

  describe('isEditorThemeDark', () => {
    it('light 主题应该返回 false', () => {
      expect(isEditorThemeDark(EDITOR_THEMES.LIGHT)).toBe(false)
    })

    it('dark 主题应该返回 true', () => {
      expect(isEditorThemeDark(EDITOR_THEMES.DARK)).toBe(true)
    })

    it('schemaEditorDark 主题应该返回 true', () => {
      expect(isEditorThemeDark(EDITOR_THEMES.SCHEMA_EDITOR_DARK)).toBe(true)
    })
  })
})
