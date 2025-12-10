import {
  MENU_CONFIG,
  MENU_EXPANDED_WIDTH,
  MENU_COLLAPSED_WIDTH,
  MENU_BREAKPOINT,
} from '../menu-config'

describe('menu-config', () => {
  describe('MENU_CONFIG 结构验证', () => {
    it('应该包含所有必需的菜单项', () => {
      const expectedKeys = [
        'integration-config',
        'element-detection',
        'editor-config',
        'feature-toggle',
        'preview-config',
        'data-management',
        'keyboard-shortcuts',
        'debug',
        'usage-guide',
      ]

      const actualKeys = MENU_CONFIG.map((item) => item.key)
      expectedKeys.forEach((key) => {
        expect(actualKeys).toContain(key)
      })
    })

    it('每个菜单项应该包含必需的属性', () => {
      MENU_CONFIG.forEach((item) => {
        expect(item).toHaveProperty('key')
        expect(item).toHaveProperty('label')
        expect(item).toHaveProperty('icon')
        expect(item).toHaveProperty('sectionId')
        expect(typeof item.key).toBe('string')
        expect(typeof item.label).toBe('string')
        expect(typeof item.sectionId).toBe('string')
      })
    })

    it('sectionId 应该遵循命名规范', () => {
      MENU_CONFIG.forEach((item) => {
        expect(item.sectionId).toMatch(/^section-/)
      })
    })

    it('子菜单项应该包含必需的属性', () => {
      MENU_CONFIG.forEach((item) => {
        if (item.children) {
          item.children.forEach((child) => {
            expect(child).toHaveProperty('key')
            expect(child).toHaveProperty('label')
            expect(child).toHaveProperty('anchorId')
            expect(typeof child.key).toBe('string')
            expect(typeof child.label).toBe('string')
            expect(child.anchorId).toMatch(/^field-/)
          })
        }
      })
    })
  })

  describe('常量值验证', () => {
    it('MENU_EXPANDED_WIDTH 应该是有效的宽度值', () => {
      expect(typeof MENU_EXPANDED_WIDTH).toBe('number')
      expect(MENU_EXPANDED_WIDTH).toBeGreaterThan(0)
      expect(MENU_EXPANDED_WIDTH).toBe(230)
    })

    it('MENU_COLLAPSED_WIDTH 应该是有效的宽度值', () => {
      expect(typeof MENU_COLLAPSED_WIDTH).toBe('number')
      expect(MENU_COLLAPSED_WIDTH).toBeGreaterThan(0)
      expect(MENU_COLLAPSED_WIDTH).toBe(56)
    })

    it('MENU_BREAKPOINT 应该是有效的断点值', () => {
      expect(typeof MENU_BREAKPOINT).toBe('number')
      expect(MENU_BREAKPOINT).toBeGreaterThan(0)
      expect(MENU_BREAKPOINT).toBe(1024)
    })

    it('展开宽度应该大于折叠宽度', () => {
      expect(MENU_EXPANDED_WIDTH).toBeGreaterThan(MENU_COLLAPSED_WIDTH)
    })
  })

  describe('菜单项完整性', () => {
    it('元素检测菜单应该有完整的子项', () => {
      const elementDetection = MENU_CONFIG.find((item) => item.key === 'element-detection')
      expect(elementDetection).toBeDefined()
      expect(elementDetection?.children?.length).toBeGreaterThanOrEqual(4)
    })

    it('编辑器配置菜单应该有完整的子项', () => {
      const editorConfig = MENU_CONFIG.find((item) => item.key === 'editor-config')
      expect(editorConfig).toBeDefined()
      expect(editorConfig?.children?.length).toBeGreaterThanOrEqual(2)
    })

    it('数据管理菜单应该有完整的子项', () => {
      const dataManagement = MENU_CONFIG.find((item) => item.key === 'data-management')
      expect(dataManagement).toBeDefined()
      expect(dataManagement?.children?.length).toBeGreaterThanOrEqual(3)
    })

    it('快捷键配置菜单应该有完整的子项', () => {
      const keyboardShortcuts = MENU_CONFIG.find((item) => item.key === 'keyboard-shortcuts')
      expect(keyboardShortcuts).toBeDefined()
      expect(keyboardShortcuts?.children?.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('菜单项图标验证', () => {
    it('所有菜单项应该有图标组件', () => {
      MENU_CONFIG.forEach((item) => {
        expect(item.icon).toBeDefined()
        // 图标可能是函数组件或 memo 包装的对象
        expect(['function', 'object']).toContain(typeof item.icon)
      })
    })
  })
})
