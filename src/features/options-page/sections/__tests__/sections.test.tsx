import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { DataManagementSection } from '../DataManagementSection'
import { DebugSection } from '../DebugSection'
import { EditorConfigSection } from '../EditorConfigSection'
import { ElementDetectionSection } from '../ElementDetectionSection'
import { FeatureToggleSection } from '../FeatureToggleSection'
import { IntegrationConfigSection } from '../IntegrationConfigSection'
import { PreviewConfigSection } from '../PreviewConfigSection'
import { UsageGuideSection } from '../UsageGuideSection'
import { KeyboardShortcutsSection } from '../KeyboardShortcutsSection'

// Mock ProForm components
vi.mock('@ant-design/agentic-ui', () => ({
  ProForm: {
    Group: ({ children }: any) => <div>{children}</div>,
  },
  ProFormText: ({ children: _children, ...props }: any) => <input {...props} />,
  ProFormDigit: ({ children: _children, ...props }: any) => <input type="number" {...props} />,
  ProFormSwitch: ({ children: _children, ...props }: any) => <input type="checkbox" {...props} />,
  ProFormSelect: ({ children, ...props }: any) => <select {...props}>{children}</select>,
}))

describe('Section组件基础测试', () => {
  const mockThemeColor = '#1890ff'

  describe('DataManagementSection', () => {
    it('应该成功渲染', () => {
      expect(() => {
        render(<DataManagementSection themeColor={mockThemeColor} />)
      }).not.toThrow()
    })

    it('应该接受themeColor prop', () => {
      const { container } = render(<DataManagementSection themeColor="#52c41a" />)
      expect(container).toBeDefined()
    })
  })

  describe('DebugSection', () => {
    it('应该成功渲染', () => {
      expect(() => {
        render(<DebugSection themeColor={mockThemeColor} />)
      }).not.toThrow()
    })

    it('应该接受themeColor prop', () => {
      const { container } = render(<DebugSection themeColor="#52c41a" />)
      expect(container).toBeDefined()
    })
  })

  describe('EditorConfigSection', () => {
    it('应该成功渲染', () => {
      expect(() => {
        render(<EditorConfigSection themeColor={mockThemeColor} />)
      }).not.toThrow()
    })

    it('应该接受themeColor prop', () => {
      const { container } = render(<EditorConfigSection themeColor="#52c41a" />)
      expect(container).toBeDefined()
    })

    it('应该响应themeColor变化', () => {
      const { rerender } = render(<EditorConfigSection themeColor="#1890ff" />)

      expect(() => {
        rerender(<EditorConfigSection themeColor="#52c41a" />)
      }).not.toThrow()
    })
  })

  describe('ElementDetectionSection', () => {
    it('应该成功渲染', () => {
      expect(() => {
        render(<ElementDetectionSection themeColor={mockThemeColor} />)
      }).not.toThrow()
    })

    it('应该接受themeColor prop', () => {
      const { container } = render(<ElementDetectionSection themeColor="#52c41a" />)
      expect(container).toBeDefined()
    })

    it('应该响应themeColor变化', () => {
      const { rerender } = render(<ElementDetectionSection themeColor="#1890ff" />)

      expect(() => {
        rerender(<ElementDetectionSection themeColor="#52c41a" />)
      }).not.toThrow()
    })
  })

  describe('FeatureToggleSection', () => {
    it('应该成功渲染', () => {
      expect(() => {
        render(<FeatureToggleSection themeColor={mockThemeColor} />)
      }).not.toThrow()
    })

    it('应该接受themeColor prop', () => {
      const { container } = render(<FeatureToggleSection themeColor="#52c41a" />)
      expect(container).toBeDefined()
    })
  })

  describe('IntegrationConfigSection', () => {
    it('应该成功渲染', () => {
      expect(() => {
        render(<IntegrationConfigSection themeColor={mockThemeColor} />)
      }).not.toThrow()
    })

    it('应该接受themeColor prop', () => {
      const { container } = render(<IntegrationConfigSection themeColor="#52c41a" />)
      expect(container).toBeDefined()
    })

    it('应该响应themeColor变化', () => {
      const { rerender } = render(<IntegrationConfigSection themeColor="#1890ff" />)

      expect(() => {
        rerender(<IntegrationConfigSection themeColor="#52c41a" />)
      }).not.toThrow()
    })
  })

  describe('PreviewConfigSection', () => {
    it('应该成功渲染', () => {
      expect(() => {
        render(<PreviewConfigSection themeColor={mockThemeColor} />)
      }).not.toThrow()
    })

    it('应该接受themeColor prop', () => {
      const { container } = render(<PreviewConfigSection themeColor="#52c41a" />)
      expect(container).toBeDefined()
    })
  })

  describe('UsageGuideSection', () => {
    it('应该成功渲染', () => {
      expect(() => {
        render(<UsageGuideSection themeColor={mockThemeColor} />)
      }).not.toThrow()
    })

    it('应该接受themeColor prop', () => {
      const { container } = render(<UsageGuideSection themeColor="#52c41a" />)
      expect(container).toBeDefined()
    })

    it('应该响应themeColor变化', () => {
      const { rerender } = render(<UsageGuideSection themeColor="#1890ff" />)

      expect(() => {
        rerender(<UsageGuideSection themeColor="#52c41a" />)
      }).not.toThrow()
    })
  })

  describe('KeyboardShortcutsSection', () => {
    it('应该成功渲染', () => {
      expect(() => {
        render(<KeyboardShortcutsSection themeColor={mockThemeColor} />)
      }).not.toThrow()
    })

    it('应该接受themeColor prop', () => {
      const { container } = render(<KeyboardShortcutsSection themeColor="#52c41a" />)
      expect(container).toBeDefined()
    })

    it('应该响应themeColor变化', () => {
      const { rerender } = render(<KeyboardShortcutsSection themeColor="#1890ff" />)

      expect(() => {
        rerender(<KeyboardShortcutsSection themeColor="#52c41a" />)
      }).not.toThrow()
    })
  })

  describe('所有Section组件通用测试', () => {
    const sections = [
      { name: 'DataManagementSection', component: DataManagementSection },
      { name: 'DebugSection', component: DebugSection },
      { name: 'EditorConfigSection', component: EditorConfigSection },
      { name: 'ElementDetectionSection', component: ElementDetectionSection },
      { name: 'FeatureToggleSection', component: FeatureToggleSection },
      { name: 'IntegrationConfigSection', component: IntegrationConfigSection },
      { name: 'PreviewConfigSection', component: PreviewConfigSection },
      { name: 'UsageGuideSection', component: UsageGuideSection },
      { name: 'KeyboardShortcutsSection', component: KeyboardShortcutsSection },
    ]

    it('所有Section都应该能够卸载', () => {
      sections.forEach(({ component: Component }) => {
        const { unmount } = render(<Component themeColor={mockThemeColor} />)
        expect(() => unmount()).not.toThrow()
      })
    })

    it('所有Section都应该接受不同的themeColor', () => {
      const colors = ['#1890ff', '#52c41a', '#ff4d4f', '#722ed1', '#fa8c16']

      sections.forEach(({ component: Component }) => {
        colors.forEach((color) => {
          expect(() => {
            render(<Component themeColor={color} />)
          }).not.toThrow()
        })
      })
    })

    it('所有Section都应该能够多次渲染', () => {
      sections.forEach(({ component: Component }) => {
        for (let i = 0; i < 3; i++) {
          expect(() => {
            const { unmount } = render(<Component themeColor={mockThemeColor} />)
            unmount()
          }).not.toThrow()
        }
      })
    })
  })

  describe('边界情况', () => {
    it('应该处理空字符串themeColor', () => {
      expect(() => {
        render(<DataManagementSection themeColor="" />)
      }).not.toThrow()
    })

    it('应该处理无效的themeColor', () => {
      expect(() => {
        render(<DataManagementSection themeColor="invalid-color" />)
      }).not.toThrow()
    })

    it('应该处理非标准格式的themeColor', () => {
      expect(() => {
        render(<DataManagementSection themeColor="#abc" />)
      }).not.toThrow()
    })
  })
})
