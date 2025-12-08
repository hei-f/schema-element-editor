import { act, fireEvent, render, screen, waitFor } from '@test/test-utils'
import userEvent from '@testing-library/user-event'
import { FavoriteEditModal } from '../FavoriteEditModal'

/**
 * Mock shadowRootManager
 */
vi.mock('@/shared/utils/shadow-root-manager', () => ({
  shadowRootManager: {
    getContainer: () => document.body,
  },
}))

/**
 * Mock CodeMirrorEditor 组件
 */
vi.mock('@/features/schema-drawer/components/editor/CodeMirrorEditor', () => ({
  CodeMirrorEditor: vi.fn(({ defaultValue, onChange, ref }) => {
    const React = require('react')
    const [value, setValue] = React.useState(defaultValue)

    React.useImperativeHandle(ref, () => ({
      setValue: (newValue: string) => setValue(newValue),
      getValue: () => value,
      focus: vi.fn(),
    }))

    return (
      <textarea
        data-testid="mock-codemirror"
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          onChange?.(e.target.value)
        }}
        placeholder="在此输入 JSON 内容..."
      />
    )
  }),
}))

/**
 * 获取 Modal footer 中的保存按钮
 */
const getSaveButton = (): HTMLButtonElement => {
  const footer = document.querySelector('.see-modal-footer')
  if (footer) {
    const buttons = footer.querySelectorAll('button')
    // 保存按钮通常是最后一个（primary 按钮）
    return buttons[buttons.length - 1] as HTMLButtonElement
  }
  return screen.getByText(/保.*存/).closest('button') as HTMLButtonElement
}

/**
 * 获取 Modal footer 中的取消按钮
 */
const getCancelButton = (): HTMLButtonElement => {
  const footer = document.querySelector('.see-modal-footer')
  if (footer) {
    const buttons = footer.querySelectorAll('button')
    // 取消按钮通常是第一个
    return buttons[0] as HTMLButtonElement
  }
  return screen.getByText(/取.*消/).closest('button') as HTMLButtonElement
}

describe('FavoriteEditModal组件测试', () => {
  const validJson = JSON.stringify({ name: 'test', value: 123 }, null, 2)
  const defaultProps = {
    visible: true,
    favoriteId: 'test-id',
    initialName: '测试收藏',
    initialContent: validJson,
    onSave: vi.fn().mockResolvedValue(undefined),
    onClose: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('基本渲染', () => {
    it('应该在visible为true时渲染Modal', async () => {
      render(<FavoriteEditModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText(/编辑收藏/)).toBeInTheDocument()
      })
    })

    it('应该在visible为false时不渲染Modal内容', () => {
      render(<FavoriteEditModal {...defaultProps} visible={false} />)

      expect(screen.queryByText(/编辑收藏/)).not.toBeInTheDocument()
    })

    it('应该在标题中显示initialName', async () => {
      render(<FavoriteEditModal {...defaultProps} initialName="我的收藏" />)

      await waitFor(() => {
        expect(screen.getByText('编辑收藏 - 我的收藏')).toBeInTheDocument()
      })
    })

    it('应该渲染名称输入框', async () => {
      render(<FavoriteEditModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('收藏名称')).toBeInTheDocument()
      })
    })

    it('应该渲染编辑器', async () => {
      render(<FavoriteEditModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('mock-codemirror')).toBeInTheDocument()
      })
    })

    it('应该渲染保存和取消按钮', async () => {
      render(<FavoriteEditModal {...defaultProps} />)

      await waitFor(() => {
        expect(getSaveButton()).toBeInTheDocument()
        expect(getCancelButton()).toBeInTheDocument()
      })
    })
  })

  describe('初始值', () => {
    it('应该显示initialName', async () => {
      render(<FavoriteEditModal {...defaultProps} />)

      await waitFor(() => {
        const input = screen.getByPlaceholderText('收藏名称') as HTMLInputElement
        expect(input.value).toBe('测试收藏')
      })
    })

    it('应该在编辑器中显示initialContent', async () => {
      render(<FavoriteEditModal {...defaultProps} />)

      await waitFor(() => {
        const editor = screen.getByTestId('mock-codemirror') as HTMLTextAreaElement
        expect(editor.value).toBe(validJson)
      })
    })
  })

  describe('名称验证', () => {
    it('应该在名称为空时显示错误', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<FavoriteEditModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('收藏名称')).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText('收藏名称')
      await user.clear(input)

      await waitFor(() => {
        expect(screen.getByText('名称不能为空')).toBeInTheDocument()
      })
    })

    it('应该在名称超过50字符时显示错误', async () => {
      render(<FavoriteEditModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('收藏名称')).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText('收藏名称')
      const longName = 'a'.repeat(51)
      fireEvent.change(input, { target: { value: longName } })

      await waitFor(() => {
        expect(screen.getByText('名称不能超过50个字符')).toBeInTheDocument()
      })
    })
  })

  describe('JSON验证', () => {
    it('应该在内容为空时显示错误', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<FavoriteEditModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('mock-codemirror')).toBeInTheDocument()
      })

      const editor = screen.getByTestId('mock-codemirror')
      await user.clear(editor)

      await act(async () => {
        vi.advanceTimersByTime(400)
      })

      await waitFor(() => {
        expect(screen.getByText('内容不能为空')).toBeInTheDocument()
      })
    })

    it('应该在JSON格式错误时显示错误', async () => {
      render(<FavoriteEditModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('mock-codemirror')).toBeInTheDocument()
      })

      const editor = screen.getByTestId('mock-codemirror')
      fireEvent.change(editor, { target: { value: 'invalid json' } })

      await act(async () => {
        vi.advanceTimersByTime(400)
      })

      await waitFor(() => {
        expect(screen.getByText(/JSON 格式错误/)).toBeInTheDocument()
      })
    })
  })

  describe('保存功能', () => {
    it('应该在点击保存时调用onSave', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const onSave = vi.fn().mockResolvedValue(undefined)
      render(<FavoriteEditModal {...defaultProps} onSave={onSave} />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('收藏名称')).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText('收藏名称')
      await user.clear(input)
      await user.type(input, '新名称')

      await act(async () => {
        vi.advanceTimersByTime(400)
      })

      const saveButton = getSaveButton()
      await user.click(saveButton)

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith('test-id', '新名称', validJson)
      })
    })

    it('应该在没有更改时禁用保存按钮', async () => {
      render(<FavoriteEditModal {...defaultProps} />)

      await waitFor(() => {
        expect(getSaveButton()).toBeInTheDocument()
      })

      expect(getSaveButton()).toBeDisabled()
    })

    it('应该在有验证错误时禁用保存按钮', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<FavoriteEditModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('收藏名称')).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText('收藏名称')
      await user.clear(input)

      await waitFor(() => {
        expect(screen.getByText('名称不能为空')).toBeInTheDocument()
      })

      expect(getSaveButton()).toBeDisabled()
    })

    it('应该在保存成功后调用onClose', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const onSave = vi.fn().mockResolvedValue(undefined)
      const onClose = vi.fn()
      render(<FavoriteEditModal {...defaultProps} onSave={onSave} onClose={onClose} />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('收藏名称')).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText('收藏名称')
      await user.clear(input)
      await user.type(input, '新名称')

      await act(async () => {
        vi.advanceTimersByTime(400)
      })

      const saveButton = getSaveButton()
      await user.click(saveButton)

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled()
      })
    })
  })

  describe('取消功能', () => {
    it('应该在点击取消且没有更改时直接关闭', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const onClose = vi.fn()
      render(<FavoriteEditModal {...defaultProps} onClose={onClose} />)

      await waitFor(() => {
        expect(getCancelButton()).toBeInTheDocument()
      })

      await user.click(getCancelButton())

      expect(onClose).toHaveBeenCalled()
    })

    it('应该在有未保存更改时显示确认对话框', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const onClose = vi.fn()
      render(<FavoriteEditModal {...defaultProps} onClose={onClose} />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('收藏名称')).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText('收藏名称')
      await user.clear(input)
      await user.type(input, '新名称')

      const cancelBtn = getCancelButton()
      if (cancelBtn) {
        await user.click(cancelBtn)
      }

      // 应该显示确认对话框（antd Modal.confirm）
      await waitFor(() => {
        // 检查确认对话框的存在
        // Modal.confirm 是静态方法，可能使用默认前缀 ant- 或自定义前缀 see-
        const confirmModal =
          document.querySelector('.see-modal-confirm') ||
          document.querySelector('.ant-modal-confirm')
        expect(confirmModal).toBeInTheDocument()
      })
    })
  })

  describe('边界情况', () => {
    it('应该在favoriteId为null时不调用onSave', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const onSave = vi.fn()
      render(<FavoriteEditModal {...defaultProps} favoriteId={null} onSave={onSave} />)

      await waitFor(() => {
        expect(getSaveButton()).toBeInTheDocument()
      })

      await user.click(getSaveButton())

      expect(onSave).not.toHaveBeenCalled()
    })

    it('应该处理onSave抛出的错误', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const onSave = vi.fn().mockRejectedValue(new Error('保存失败'))
      render(<FavoriteEditModal {...defaultProps} onSave={onSave} />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('收藏名称')).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText('收藏名称')
      await user.clear(input)
      await user.type(input, '新名称')

      await act(async () => {
        vi.advanceTimersByTime(400)
      })

      await user.click(getSaveButton())

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('保存收藏失败:', expect.any(Error))
      })

      consoleSpy.mockRestore()
    })
  })

  describe('内容变化检测', () => {
    it('应该在名称变化时启用保存按钮', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<FavoriteEditModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('收藏名称')).toBeInTheDocument()
      })

      expect(getSaveButton()).toBeDisabled()

      const input = screen.getByPlaceholderText('收藏名称')
      await user.clear(input)
      await user.type(input, '新名称')

      await act(async () => {
        vi.advanceTimersByTime(400)
      })

      expect(getSaveButton()).not.toBeDisabled()
    })

    it('应该在内容变化时启用保存按钮', async () => {
      render(<FavoriteEditModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('mock-codemirror')).toBeInTheDocument()
      })

      const editor = screen.getByTestId('mock-codemirror')
      fireEvent.change(editor, { target: { value: '{"new": "content"}' } })

      await act(async () => {
        vi.advanceTimersByTime(400)
      })

      expect(getSaveButton()).not.toBeDisabled()
    })
  })
})
