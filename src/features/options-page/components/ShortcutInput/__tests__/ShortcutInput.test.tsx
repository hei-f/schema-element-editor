import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ShortcutInput } from '../index'

/**
 * Mock keyboard-shortcuts 模块
 */
vi.mock('@/shared/constants/keyboard-shortcuts', () => ({
  formatShortcut: vi.fn((shortcut) => {
    const parts: string[] = []
    if (shortcut.ctrlOrCmd) parts.push('Ctrl')
    if (shortcut.shift) parts.push('Shift')
    if (shortcut.alt) parts.push('Alt')
    parts.push(shortcut.key.toUpperCase())
    return parts.join('+')
  }),
  isBrowserReserved: vi.fn((shortcut) => {
    // 模拟 Ctrl+W 为浏览器保留快捷键
    return shortcut.ctrlOrCmd && shortcut.key.toLowerCase() === 'w'
  }),
  isCodeMirrorConflict: vi.fn((shortcut) => {
    // 模拟 Ctrl+Z 为 CodeMirror 冲突快捷键
    return shortcut.ctrlOrCmd && shortcut.key.toLowerCase() === 'z'
  }),
  shortcutFromEvent: vi.fn((event: KeyboardEvent) => {
    if (!event.key || event.key === 'Escape' || event.key === 'Enter') {
      return null
    }
    return {
      key: event.key,
      ctrlOrCmd: event.metaKey || event.ctrlKey,
      shift: event.shiftKey,
      alt: event.altKey,
    }
  }),
}))

describe('ShortcutInput组件测试', () => {
  const defaultProps = {
    value: { key: 's', ctrlOrCmd: true, shift: false, alt: false },
    onChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('基本渲染', () => {
    it('应该渲染组件', () => {
      const { container } = render(<ShortcutInput {...defaultProps} />)

      expect(container).toBeInTheDocument()
    })

    it('应该显示格式化后的快捷键', () => {
      render(<ShortcutInput {...defaultProps} />)

      expect(screen.getByText('Ctrl+S')).toBeInTheDocument()
    })

    it('应该在没有value时显示占位符', () => {
      render(<ShortcutInput placeholder="点击录入" />)

      expect(screen.getByText('点击录入')).toBeInTheDocument()
    })

    it('应该使用默认占位符', () => {
      render(<ShortcutInput />)

      expect(screen.getByText('点击录入快捷键')).toBeInTheDocument()
    })
  })

  describe('录入状态', () => {
    it('应该在点击后进入录入状态（无初始值时显示提示）', async () => {
      const user = userEvent.setup()
      render(<ShortcutInput />)

      const displayBox = screen.getByText('点击录入快捷键')
      await user.click(displayBox)

      expect(screen.getByText('按下快捷键...')).toBeInTheDocument()
    })

    it('应该在点击后进入录入状态并显示操作按钮', async () => {
      const user = userEvent.setup()
      render(<ShortcutInput {...defaultProps} />)

      const displayBox = screen.getByText('Ctrl+S')
      await user.click(displayBox)

      // 录入状态下应该显示确认和取消按钮
      const buttons = document.querySelectorAll('button')
      expect(buttons.length).toBeGreaterThanOrEqual(2)
    })

    it('应该在录入状态显示确认和取消按钮', async () => {
      const user = userEvent.setup()
      render(<ShortcutInput {...defaultProps} />)

      const displayBox = screen.getByText('Ctrl+S')
      await user.click(displayBox)

      // 检查按钮存在
      const buttons = document.querySelectorAll('button')
      expect(buttons.length).toBeGreaterThanOrEqual(2)
    })

    it('应该在禁用状态下不能进入录入', async () => {
      const user = userEvent.setup()
      render(<ShortcutInput {...defaultProps} disabled />)

      const displayBox = screen.getByText('Ctrl+S')
      await user.click(displayBox)

      // 禁用时不应该显示操作按钮
      const buttons = document.querySelectorAll('button')
      // 禁用时可能只有重置按钮或没有按钮
      expect(buttons.length).toBeLessThan(2)
    })
  })

  describe('键盘事件', () => {
    it('应该按Escape取消录入', async () => {
      const user = userEvent.setup()
      render(<ShortcutInput />)

      const displayBox = screen.getByText('点击录入快捷键')
      await user.click(displayBox)

      expect(screen.getByText('按下快捷键...')).toBeInTheDocument()

      // 模拟按 Escape
      fireEvent.keyDown(document, { key: 'Escape' })

      // 应该回到原来状态（占位符）
      expect(screen.getByText('点击录入快捷键')).toBeInTheDocument()
    })

    it('应该在录入快捷键后按Enter确认', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<ShortcutInput onChange={onChange} />)

      const displayBox = screen.getByText('点击录入快捷键')
      await user.click(displayBox)

      // 先录入一个快捷键
      fireEvent.keyDown(document, { key: 'k', ctrlKey: true })

      // 再按 Enter 确认
      fireEvent.keyDown(document, { key: 'Enter' })

      expect(onChange).toHaveBeenCalledWith({
        key: 'k',
        ctrlOrCmd: true,
        shift: false,
        alt: false,
      })
    })

    it('应该录入新的快捷键组合', async () => {
      const user = userEvent.setup()
      render(<ShortcutInput />)

      const displayBox = screen.getByText('点击录入快捷键')
      await user.click(displayBox)

      // 录入 Ctrl+Shift+P
      fireEvent.keyDown(document, { key: 'p', ctrlKey: true, shiftKey: true })

      // 应该显示新的快捷键
      expect(screen.getByText('Ctrl+Shift+P')).toBeInTheDocument()
    })
  })

  describe('取消录入', () => {
    it('应该通过点击取消按钮取消录入', async () => {
      const user = userEvent.setup()
      render(<ShortcutInput />)

      const displayBox = screen.getByText('点击录入快捷键')
      await user.click(displayBox)

      expect(screen.getByText('按下快捷键...')).toBeInTheDocument()

      // 找到取消按钮并点击（有 close aria-label 的按钮）
      const cancelButton =
        document.querySelector('[aria-label="close"]')?.closest('button') ??
        document.querySelectorAll('button')[1]

      if (cancelButton) {
        await user.click(cancelButton)
      }

      // 应该回到原来状态（占位符）
      expect(screen.getByText('点击录入快捷键')).toBeInTheDocument()
    })
  })

  describe('确认录入', () => {
    it('应该通过点击确认按钮确认录入', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<ShortcutInput onChange={onChange} />)

      const displayBox = screen.getByText('点击录入快捷键')
      await user.click(displayBox)

      // 先录入一个快捷键
      fireEvent.keyDown(document, { key: 'k', ctrlKey: true })

      // 找到确认按钮并点击（有 check aria-label 的按钮）
      const confirmButton =
        document.querySelector('[aria-label="check"]')?.closest('button') ??
        document.querySelectorAll('button')[0]

      if (confirmButton) {
        await user.click(confirmButton)
      }

      expect(onChange).toHaveBeenCalled()
    })

    it('应该在没有录入快捷键时禁用确认按钮', async () => {
      const user = userEvent.setup()
      render(<ShortcutInput />)

      const displayBox = screen.getByText('点击录入快捷键')
      await user.click(displayBox)

      // 确认按钮应该被禁用
      const buttons = document.querySelectorAll('button')
      const confirmButton = buttons[0]
      expect(confirmButton).toBeDisabled()
    })
  })

  describe('重置功能', () => {
    it('应该在有defaultValue时显示重置按钮', () => {
      const defaultValue = { key: 'd', ctrlOrCmd: true, shift: false, alt: false }
      render(
        <ShortcutInput
          value={{ key: 's', ctrlOrCmd: true, shift: false, alt: false }}
          defaultValue={defaultValue}
        />
      )

      // 应该存在重置按钮
      const resetButton =
        document.querySelector('[aria-label="undo"]')?.closest('button') ??
        document.querySelectorAll('button')[0]
      expect(resetButton).toBeInTheDocument()
    })

    it('应该在点击重置按钮时恢复默认值', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      const defaultValue = { key: 'd', ctrlOrCmd: true, shift: false, alt: false }
      render(
        <ShortcutInput
          value={{ key: 's', ctrlOrCmd: true, shift: false, alt: false }}
          defaultValue={defaultValue}
          onChange={onChange}
        />
      )

      const resetButton =
        document.querySelector('[aria-label="undo"]')?.closest('button') ??
        document.querySelectorAll('button')[0]

      if (resetButton) {
        await user.click(resetButton)
      }

      expect(onChange).toHaveBeenCalledWith(defaultValue)
    })

    it('应该在值与默认值相同时禁用重置按钮', () => {
      const sameValue = { key: 's', ctrlOrCmd: true, shift: false, alt: false }
      render(<ShortcutInput value={sameValue} defaultValue={sameValue} />)

      const resetButton =
        document.querySelector('[aria-label="undo"]')?.closest('button') ??
        document.querySelectorAll('button')[0]

      if (resetButton) {
        expect(resetButton).toBeDisabled()
      }
    })
  })

  describe('警告状态', () => {
    it('应该显示CodeMirror冲突警告', () => {
      // Ctrl+Z 在 mock 中被设置为冲突
      render(<ShortcutInput value={{ key: 'z', ctrlOrCmd: true, shift: false, alt: false }} />)

      expect(screen.getByText('可能冲突')).toBeInTheDocument()
    })

    it('应该显示浏览器保留警告', () => {
      // Ctrl+W 在 mock 中被设置为浏览器保留
      render(<ShortcutInput value={{ key: 'w', ctrlOrCmd: true, shift: false, alt: false }} />)

      expect(screen.getByText('不可用')).toBeInTheDocument()
    })

    it('应该在录入浏览器保留快捷键时禁用确认', async () => {
      const user = userEvent.setup()
      render(<ShortcutInput />)

      const displayBox = screen.getByText('点击录入快捷键')
      await user.click(displayBox)

      // 录入浏览器保留的快捷键 Ctrl+W
      fireEvent.keyDown(document, { key: 'w', ctrlKey: true })

      // 确认按钮应该被禁用
      const buttons = document.querySelectorAll('button')
      const confirmButton = buttons[0]
      expect(confirmButton).toBeDisabled()
    })
  })

  describe('边界情况', () => {
    it('应该处理没有onChange的情况', async () => {
      const user = userEvent.setup()
      render(<ShortcutInput value={defaultProps.value} />)

      const displayBox = screen.getByText('Ctrl+S')
      await user.click(displayBox)

      // 录入快捷键
      fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
      fireEvent.keyDown(document, { key: 'Enter' })

      // 不应该抛出错误
      expect(screen.getByText('Ctrl+S')).toBeInTheDocument()
    })

    it('应该处理value为undefined的情况', () => {
      render(<ShortcutInput value={undefined} />)

      expect(screen.getByText('点击录入快捷键')).toBeInTheDocument()
    })

    it('应该处理value.key为空的情况', () => {
      render(<ShortcutInput value={{ key: '', ctrlOrCmd: false, shift: false, alt: false }} />)

      expect(screen.getByText('点击录入快捷键')).toBeInTheDocument()
    })

    it('应该在没有defaultValue时不显示重置按钮', () => {
      render(<ShortcutInput {...defaultProps} />)

      const resetButton = document.querySelector('[aria-label="undo"]')
      expect(resetButton).not.toBeInTheDocument()
    })
  })

  describe('样式状态', () => {
    it('应该在录入状态显示录入样式', async () => {
      const user = userEvent.setup()
      const { container } = render(<ShortcutInput {...defaultProps} />)

      const displayBox = screen.getByText('Ctrl+S')
      await user.click(displayBox)

      // 应该有录入状态的样式
      const styledBox = container.querySelector('div[tabindex="0"]')
      expect(styledBox).toBeInTheDocument()
    })
  })
})
