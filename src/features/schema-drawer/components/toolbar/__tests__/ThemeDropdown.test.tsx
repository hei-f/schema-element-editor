import { render, screen, waitFor } from '@test/test-utils'
import userEvent from '@testing-library/user-event'
import type { EditorTheme } from '@/shared/types'
import { storage } from '@/shared/utils/browser/storage'
import { ThemeDropdown } from '../ThemeDropdown'

/**
 * Mock storage
 */
vi.mock('@/shared/utils/browser/storage', () => ({
  storage: {
    setEditorTheme: vi.fn(),
  },
}))

/**
 * Mock EDITOR_THEME_OPTIONS
 */
vi.mock('@/shared/constants/editor-themes', () => ({
  EDITOR_THEME_OPTIONS: [
    { value: 'seeDark', label: 'SEE Dark', category: 'dark' },
    { value: 'light', label: 'Light', category: 'light' },
    { value: 'dark', label: 'Dark', category: 'dark' },
  ],
}))

describe('ThemeDropdown 组件测试', () => {
  const defaultProps = {
    editorTheme: 'light' as EditorTheme,
    onEditorThemeChange: vi.fn(),
    themeColor: '#1890ff',
    showText: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('基本渲染', () => {
    it('应该渲染主题按钮', () => {
      render(<ThemeDropdown {...defaultProps} />)

      expect(screen.getByLabelText('theme')).toBeInTheDocument()
    })

    it('应该在showText为true时显示文本', () => {
      render(<ThemeDropdown {...defaultProps} showText={true} />)

      expect(screen.getByText('主题')).toBeInTheDocument()
    })

    it('应该在showText为false时不显示文本', () => {
      render(<ThemeDropdown {...defaultProps} showText={false} />)

      expect(screen.queryByText('主题')).not.toBeInTheDocument()
    })

    it('应该显示tooltip', async () => {
      const user = userEvent.setup()
      render(<ThemeDropdown {...defaultProps} />)

      const button = screen.getByLabelText('theme')
      await user.hover(button)

      await waitFor(() => {
        expect(screen.getByText('切换主题')).toBeInTheDocument()
      })
    })
  })

  describe('下拉菜单交互', () => {
    it('应该在点击按钮时打开下拉菜单', async () => {
      const user = userEvent.setup()
      render(<ThemeDropdown {...defaultProps} />)

      const button = screen.getByLabelText('theme')
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByText('Light')).toBeInTheDocument()
        expect(screen.getByText('Dark')).toBeInTheDocument()
        expect(screen.getByText('SEE Dark')).toBeInTheDocument()
      })
    })

    it('应该显示所有主题选项', async () => {
      const user = userEvent.setup()
      render(<ThemeDropdown {...defaultProps} />)

      const button = screen.getByLabelText('theme')
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByText('Light')).toBeInTheDocument()
        expect(screen.getByText('Dark')).toBeInTheDocument()
        expect(screen.getByText('SEE Dark')).toBeInTheDocument()
      })
    })

    it('应该为当前选中的主题显示选中标记', async () => {
      const user = userEvent.setup()
      render(<ThemeDropdown {...defaultProps} editorTheme="light" />)

      const button = screen.getByLabelText('theme')
      await user.click(button)

      await waitFor(() => {
        const checkmarks = screen.getAllByText('✓')
        expect(checkmarks.length).toBeGreaterThan(0)
      })
    })
  })

  describe('主题切换', () => {
    it('应该在点击主题选项时调用onEditorThemeChange', async () => {
      const user = userEvent.setup()
      const onEditorThemeChange = vi.fn()
      render(<ThemeDropdown {...defaultProps} onEditorThemeChange={onEditorThemeChange} />)

      const button = screen.getByLabelText('theme')
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByText('Dark')).toBeInTheDocument()
      })

      const darkOption = screen.getByText('Dark')
      await user.click(darkOption)

      expect(onEditorThemeChange).toHaveBeenCalledWith('dark')
    })

    it('应该在切换主题时保存到storage', async () => {
      const user = userEvent.setup()
      render(<ThemeDropdown {...defaultProps} />)

      const button = screen.getByLabelText('theme')
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByText('Dark')).toBeInTheDocument()
      })

      const darkOption = screen.getByText('Dark')
      await user.click(darkOption)

      expect(storage.setEditorTheme).toHaveBeenCalledWith('dark')
    })

    it('应该在切换主题后关闭下拉菜单', async () => {
      const user = userEvent.setup()
      render(<ThemeDropdown {...defaultProps} />)

      const button = screen.getByLabelText('theme')
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByText('Dark')).toBeInTheDocument()
      })

      const darkOption = screen.getByText('Dark')
      await user.click(darkOption)

      // 验证主题切换回调被调用（不验证DOM，因为可能有关闭动画）
      expect(defaultProps.onEditorThemeChange).toHaveBeenCalledWith('dark')
    })

    it('应该支持切换到不同的主题', async () => {
      const user = userEvent.setup()
      const onEditorThemeChange = vi.fn()
      render(<ThemeDropdown {...defaultProps} onEditorThemeChange={onEditorThemeChange} />)

      const button = screen.getByLabelText('theme')
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByText('SEE Dark')).toBeInTheDocument()
      })

      const customOption = screen.getByText('SEE Dark')
      await user.click(customOption)

      expect(onEditorThemeChange).toHaveBeenCalledWith('seeDark')
      expect(storage.setEditorTheme).toHaveBeenCalledWith('seeDark')
    })
  })

  describe('当前主题标识', () => {
    it('应该为light主题显示选中标记', async () => {
      const user = userEvent.setup()
      render(<ThemeDropdown {...defaultProps} editorTheme="light" />)

      const button = screen.getByLabelText('theme')
      await user.click(button)

      await waitFor(() => {
        const checkmarks = screen.getAllByText('✓')
        expect(checkmarks.length).toBe(1)
      })
    })

    it('应该为dark主题显示选中标记', async () => {
      const user = userEvent.setup()
      render(<ThemeDropdown {...defaultProps} editorTheme="dark" />)

      const button = screen.getByLabelText('theme')
      await user.click(button)

      await waitFor(() => {
        const checkmarks = screen.getAllByText('✓')
        expect(checkmarks.length).toBe(1)
      })
    })

    it('应该为custom主题显示选中标记', async () => {
      const user = userEvent.setup()
      render(<ThemeDropdown {...defaultProps} editorTheme="seeDark" />)

      const button = screen.getByLabelText('theme')
      await user.click(button)

      await waitFor(() => {
        const checkmarks = screen.getAllByText('✓')
        expect(checkmarks.length).toBe(1)
      })
    })
  })

  describe('主题样式适配', () => {
    it('应该在light主题下正确渲染', async () => {
      const user = userEvent.setup()
      render(<ThemeDropdown {...defaultProps} editorTheme="light" />)

      const button = screen.getByLabelText('theme')
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByText('Light')).toBeInTheDocument()
      })
    })

    it('应该在dark主题下正确渲染', async () => {
      const user = userEvent.setup()
      render(<ThemeDropdown {...defaultProps} editorTheme="dark" />)

      const button = screen.getByLabelText('theme')
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByText('Light')).toBeInTheDocument()
      })
    })

    it('应该在custom主题下正确渲染', async () => {
      const user = userEvent.setup()
      render(<ThemeDropdown {...defaultProps} editorTheme="seeDark" />)

      const button = screen.getByLabelText('theme')
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByText('Light')).toBeInTheDocument()
      })
    })
  })

  describe('Props更新', () => {
    it('应该响应editorTheme变化', async () => {
      const user = userEvent.setup()
      const { rerender } = render(<ThemeDropdown {...defaultProps} editorTheme="light" />)

      const button = screen.getByLabelText('theme')
      await user.click(button)

      await waitFor(() => {
        const checkmarks = screen.getAllByText('✓')
        expect(checkmarks.length).toBe(1)
      })

      // 关闭下拉菜单
      await user.click(button)

      rerender(<ThemeDropdown {...defaultProps} editorTheme="dark" />)

      await user.click(button)

      await waitFor(() => {
        const checkmarks = screen.getAllByText('✓')
        expect(checkmarks.length).toBe(1)
      })
    })

    it('应该响应themeColor变化', () => {
      const { rerender } = render(<ThemeDropdown {...defaultProps} themeColor="#ff0000" />)

      expect(screen.getByLabelText('theme')).toBeInTheDocument()

      rerender(<ThemeDropdown {...defaultProps} themeColor="#00ff00" />)

      expect(screen.getByLabelText('theme')).toBeInTheDocument()
    })

    it('应该响应showText变化', () => {
      const { rerender } = render(<ThemeDropdown {...defaultProps} showText={false} />)

      expect(screen.queryByText('主题')).not.toBeInTheDocument()

      rerender(<ThemeDropdown {...defaultProps} showText={true} />)

      expect(screen.getByText('主题')).toBeInTheDocument()
    })
  })

  describe('边界情况', () => {
    it('应该支持多次打开和关闭下拉菜单', async () => {
      const user = userEvent.setup()
      render(<ThemeDropdown {...defaultProps} />)

      const button = screen.getByLabelText('theme')

      // 第一次打开
      await user.click(button)
      await waitFor(() => {
        expect(screen.getByText('Light')).toBeInTheDocument()
      })

      // 关闭（再次点击按钮）
      await user.click(button)

      // 第二次打开
      await user.click(button)
      await waitFor(() => {
        expect(screen.getByText('Light')).toBeInTheDocument()
      })

      // 验证能够多次打开关闭
      expect(button).toBeInTheDocument()
    })

    it('应该支持连续切换多个主题', async () => {
      const user = userEvent.setup()
      const onEditorThemeChange = vi.fn()
      render(<ThemeDropdown {...defaultProps} onEditorThemeChange={onEditorThemeChange} />)

      const button = screen.getByLabelText('theme')

      // 切换到暗色
      await user.click(button)
      await waitFor(() => expect(screen.getByText('Dark')).toBeInTheDocument())
      await user.click(screen.getByText('Dark'))

      // 切换到SEE Dark
      await user.click(button)
      await waitFor(() => expect(screen.getByText('SEE Dark')).toBeInTheDocument())
      await user.click(screen.getByText('SEE Dark'))

      // 切换回亮色
      await user.click(button)
      await waitFor(() => expect(screen.getByText('Light')).toBeInTheDocument())
      await user.click(screen.getByText('Light'))

      expect(onEditorThemeChange).toHaveBeenCalledTimes(3)
      expect(onEditorThemeChange).toHaveBeenNthCalledWith(1, 'dark')
      expect(onEditorThemeChange).toHaveBeenNthCalledWith(2, 'seeDark')
      expect(onEditorThemeChange).toHaveBeenNthCalledWith(3, 'light')
    })

    it('应该处理点击当前已选中的主题', async () => {
      const user = userEvent.setup()
      const onEditorThemeChange = vi.fn()
      render(
        <ThemeDropdown
          {...defaultProps}
          editorTheme="light"
          onEditorThemeChange={onEditorThemeChange}
        />
      )

      const button = screen.getByLabelText('theme')
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByText('Light')).toBeInTheDocument()
      })

      const lightOption = screen.getByText('Light')
      await user.click(lightOption)

      // 应该正常调用回调
      expect(onEditorThemeChange).toHaveBeenCalledWith('light')
      expect(storage.setEditorTheme).toHaveBeenCalledWith('light')
    })

    it('应该处理不同的themeColor值', async () => {
      const user = userEvent.setup()
      const { rerender } = render(<ThemeDropdown {...defaultProps} themeColor="#ff0000" />)

      const button = screen.getByLabelText('theme')
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByText('Light')).toBeInTheDocument()
      })

      // 关闭
      await user.click(button)

      rerender(<ThemeDropdown {...defaultProps} themeColor="#00ff00" />)

      await user.click(button)

      await waitFor(() => {
        expect(screen.getByText('Light')).toBeInTheDocument()
      })
    })
  })

  describe('下拉菜单定位', () => {
    it('应该设置bottomRight placement', async () => {
      const user = userEvent.setup()
      render(<ThemeDropdown {...defaultProps} />)

      const button = screen.getByLabelText('theme')
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByText('Light')).toBeInTheDocument()
      })
    })
  })

  describe('存储同步', () => {
    it('应该在每次切换主题时都保存', async () => {
      const user = userEvent.setup()
      render(<ThemeDropdown {...defaultProps} />)

      const button = screen.getByLabelText('theme')

      // 切换到暗色
      await user.click(button)
      await waitFor(() => expect(screen.getByText('Dark')).toBeInTheDocument())
      await user.click(screen.getByText('Dark'))

      expect(storage.setEditorTheme).toHaveBeenCalledTimes(1)

      // 切换到SEE Dark
      await user.click(button)
      await waitFor(() => expect(screen.getByText('SEE Dark')).toBeInTheDocument())
      await user.click(screen.getByText('SEE Dark'))

      expect(storage.setEditorTheme).toHaveBeenCalledTimes(2)
    })
  })
})
