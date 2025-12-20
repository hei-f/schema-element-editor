import { render } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QuickEditModal } from '../QuickEditModal'
import type { EditorTheme } from '@/shared/types'

// Mock CodeMirrorEditor to avoid CodeMirror multi-instance issues
vi.mock('../../editor/CodeMirrorEditor', async () => {
  const React = await import('react')
  const { vi } = await import('vitest')

  const MockCodeMirrorEditor = React.forwardRef(
    ({ defaultValue, onChange, theme }: any, ref: any) => {
      // Expose mock methods through ref
      React.useImperativeHandle(ref, () => ({
        getValue: () => defaultValue,
        setValue: vi.fn(),
        focus: vi.fn(),
        getSelection: () => ({ from: 0, to: 0 }),
        setSelection: vi.fn(),
        replaceSelection: vi.fn(),
        getCursor: () => 0,
        setCursor: vi.fn(),
        scrollIntoView: vi.fn(),
      }))

      return React.createElement(
        'div',
        { 'data-testid': 'mock-codemirror-editor', 'data-theme': theme },
        React.createElement('textarea', {
          value: defaultValue,
          onChange: (e: any) => onChange?.(e.target.value),
          style: { width: '100%', height: '100%' },
        })
      )
    }
  )

  MockCodeMirrorEditor.displayName = 'MockCodeMirrorEditor'

  return {
    CodeMirrorEditor: MockCodeMirrorEditor,
  }
})

// Mock DrawerToolbar
vi.mock('../../toolbar/DrawerToolbar', async () => {
  const React = await import('react')
  return {
    DrawerToolbar: () => React.createElement('div', { 'data-testid': 'mock-drawer-toolbar' }),
  }
})

// Mock SchemaDiffView
vi.mock('../../editor/SchemaDiffView', async () => {
  const React = await import('react')
  return {
    SchemaDiffView: () => React.createElement('div', { 'data-testid': 'mock-schema-diff-view' }),
  }
})

// Mock dependencies
vi.mock('../../services/schema-transformer', () => ({
  schemaTransformer: {
    formatJson: vi.fn((value: string) => {
      try {
        const parsed = JSON.parse(value)
        return { success: true, data: JSON.stringify(parsed, null, 2) }
      } catch {
        return { success: false, error: '格式化失败' }
      }
    }),
    escapeJson: vi.fn((value: string) => {
      try {
        const parsed = JSON.parse(value)
        return { success: true, data: JSON.stringify(JSON.stringify(parsed)) }
      } catch {
        return { success: false, error: '转义失败' }
      }
    }),
    unescapeJson: vi.fn((value: string) => {
      try {
        const parsed = JSON.parse(value)
        if (typeof parsed === 'string') {
          return { success: true, data: parsed }
        }
        return { success: false, error: '内容不是字符串' }
      } catch {
        return { success: false, error: '去转义失败' }
      }
    }),
    compactJson: vi.fn((value: string) => {
      try {
        const parsed = JSON.parse(value)
        return { success: true, data: JSON.stringify(parsed) }
      } catch {
        return { success: false, error: '压缩失败' }
      }
    }),
    parseNestedJson: vi.fn((value: string) => {
      try {
        const parsed = JSON.parse(value)
        if (typeof parsed === 'string') {
          const innerParsed = JSON.parse(parsed)
          return { success: true, data: JSON.stringify(innerParsed, null, 2), parseCount: 1 }
        }
        return { success: false, error: '没有嵌套JSON' }
      } catch {
        return { success: false, error: '解析失败' }
      }
    }),
  },
}))

describe('QuickEditModal 组件测试', () => {
  const defaultProps = {
    visible: true,
    content: '{"name": "test"}',
    editorTheme: 'light' as EditorTheme,
    themeColor: '#1890ff',
    onSave: vi.fn(),
    onClose: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('基础渲染', () => {
    it('应该成功渲染组件', () => {
      expect(() => {
        render(<QuickEditModal {...defaultProps} />)
      }).not.toThrow()
    })

    it('应该在visible为false时不抛出错误', () => {
      expect(() => {
        render(<QuickEditModal {...defaultProps} visible={false} />)
      }).not.toThrow()
    })
  })

  describe('Props处理', () => {
    it('应该接受所有必需的props', () => {
      expect(() => {
        render(<QuickEditModal {...defaultProps} />)
      }).not.toThrow()
    })

    it('应该接受不同的主题', () => {
      const themes: EditorTheme[] = ['light', 'dark', 'seeDark']

      themes.forEach((theme) => {
        expect(() => {
          render(<QuickEditModal {...defaultProps} editorTheme={theme} />)
        }).not.toThrow()
      })
    })

    it('应该接受不同的内容', () => {
      const contents = ['{"valid": "json"}', 'plain text', '[1, 2, 3]', '""', 'null']

      contents.forEach((content) => {
        expect(() => {
          render(<QuickEditModal {...defaultProps} content={content} />)
        }).not.toThrow()
      })
    })

    it('应该接受不同的主题色', () => {
      const colors = ['#1890ff', '#52c41a', '#ff4d4f', '#722ed1', '#fa8c16']

      colors.forEach((color) => {
        expect(() => {
          render(<QuickEditModal {...defaultProps} themeColor={color} />)
        }).not.toThrow()
      })
    })
  })

  describe('Props变化', () => {
    it('应该响应visible变化', () => {
      const { rerender } = render(<QuickEditModal {...defaultProps} visible={false} />)

      expect(() => {
        rerender(<QuickEditModal {...defaultProps} visible={true} />)
      }).not.toThrow()
    })

    it('应该响应content变化', () => {
      const { rerender } = render(<QuickEditModal {...defaultProps} content="content1" />)

      expect(() => {
        rerender(<QuickEditModal {...defaultProps} content="content2" />)
      }).not.toThrow()
    })

    it('应该响应editorTheme变化', () => {
      const { rerender } = render(<QuickEditModal {...defaultProps} editorTheme="light" />)

      expect(() => {
        rerender(<QuickEditModal {...defaultProps} editorTheme="dark" />)
      }).not.toThrow()
    })
  })

  describe('边界情况', () => {
    it('应该处理空内容', () => {
      expect(() => {
        render(<QuickEditModal {...defaultProps} content="" />)
      }).not.toThrow()
    })

    it('应该处理非常长的内容', () => {
      const longContent = JSON.stringify({ data: 'x'.repeat(10000) })
      expect(() => {
        render(<QuickEditModal {...defaultProps} content={longContent} />)
      }).not.toThrow()
    })

    it('应该处理特殊字符', () => {
      expect(() => {
        render(<QuickEditModal {...defaultProps} content='{"special": "\\n\\t\\r"}' />)
      }).not.toThrow()
    })

    it('应该处理Unicode字符', () => {
      expect(() => {
        render(<QuickEditModal {...defaultProps} content='{"unicode": "你好世界🌏"}' />)
      }).not.toThrow()
    })
  })

  describe('组件生命周期', () => {
    it('应该能够正确卸载', () => {
      const { unmount } = render(<QuickEditModal {...defaultProps} />)

      expect(() => unmount()).not.toThrow()
    })

    it('应该支持多次打开和关闭', () => {
      const { rerender } = render(<QuickEditModal {...defaultProps} visible={false} />)

      for (let i = 0; i < 3; i++) {
        expect(() => {
          rerender(<QuickEditModal {...defaultProps} visible={true} />)
          rerender(<QuickEditModal {...defaultProps} visible={false} />)
        }).not.toThrow()
      }
    })
  })
})
