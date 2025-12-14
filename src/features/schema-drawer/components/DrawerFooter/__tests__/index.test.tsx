/**
 * DrawerFooter 组件单元测试
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { DrawerFooter } from '../index'

// Mock styled components
vi.mock('../styles', () => ({
  DrawerFooterContainer: ({ children }: any) => (
    <div data-testid="drawer-footer-container">{children}</div>
  ),
  FooterButton: ({ children, onClick, type, loading, disabled }: any) => (
    <button
      data-testid={`footer-button-${type || 'default'}`}
      onClick={onClick}
      disabled={disabled}
      data-loading={String(loading)}
      data-type={type || 'default'}
    >
      {children}
    </button>
  ),
}))

describe('DrawerFooter', () => {
  const createProps = (overrides?: any) => ({
    toolbarButtons: {
      draft: true,
      showFormatButton: true,
      showEscapeButton: true,
      showUnescapeButton: true,
      showCompactButton: true,
      showParseButton: true,
    },
    onSaveDraft: vi.fn(),
    onClose: vi.fn(),
    onSave: vi.fn().mockResolvedValue(undefined),
    isSaving: false,
    isModified: true,
    onError: vi.fn(),
    ...overrides,
  })

  describe('基本渲染', () => {
    it('应该正确渲染底部容器', () => {
      const props = createProps()
      render(<DrawerFooter {...props} />)

      expect(screen.getByTestId('drawer-footer-container')).toBeInTheDocument()
    })

    it('应该渲染关闭按钮', () => {
      const props = createProps()
      render(<DrawerFooter {...props} />)

      const buttons = screen.getAllByTestId('footer-button-default')
      const closeButton = buttons.find((btn) => btn.textContent === '关闭')
      expect(closeButton).toBeInTheDocument()
      expect(closeButton).toHaveTextContent('关闭')
    })

    it('应该渲染保存按钮', () => {
      const props = createProps()
      render(<DrawerFooter {...props} />)

      const saveButton = screen.getByTestId('footer-button-primary')
      expect(saveButton).toBeInTheDocument()
      expect(saveButton).toHaveTextContent('保存')
    })
  })

  describe('保存草稿按钮', () => {
    it('toolbarButtons.draft 为 true 时应该显示保存草稿按钮', () => {
      const props = createProps({
        toolbarButtons: { draft: true },
      })
      render(<DrawerFooter {...props} />)

      const buttons = screen.getAllByTestId('footer-button-default')
      const draftButton = buttons.find((btn) => btn.textContent === '保存草稿')
      expect(draftButton).toBeInTheDocument()
    })

    it('toolbarButtons.draft 为 false 时不应该显示保存草稿按钮', () => {
      const props = createProps({
        toolbarButtons: { draft: false },
      })
      render(<DrawerFooter {...props} />)

      const buttons = screen.getAllByTestId('footer-button-default')
      const draftButton = buttons.find((btn) => btn.textContent === '保存草稿')
      expect(draftButton).toBeUndefined()
    })

    it('点击保存草稿按钮应该调用 onSaveDraft', () => {
      const onSaveDraft = vi.fn()
      const props = createProps({
        toolbarButtons: { draft: true },
        onSaveDraft,
      })
      render(<DrawerFooter {...props} />)

      const buttons = screen.getAllByTestId('footer-button-default')
      const draftButton = buttons.find((btn) => btn.textContent === '保存草稿')!
      fireEvent.click(draftButton)

      expect(onSaveDraft).toHaveBeenCalledTimes(1)
    })
  })

  describe('关闭按钮', () => {
    it('点击关闭按钮应该调用 onClose', () => {
      const onClose = vi.fn()
      const props = createProps({
        onClose,
      })
      render(<DrawerFooter {...props} />)

      const buttons = screen.getAllByTestId('footer-button-default')
      const closeButton = buttons.find((btn) => btn.textContent === '关闭')!
      fireEvent.click(closeButton)

      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('保存按钮状态', () => {
    it('isModified 为 true 时保存按钮应该启用', () => {
      const props = createProps({
        isModified: true,
        isSaving: false,
      })
      render(<DrawerFooter {...props} />)

      const saveButton = screen.getByTestId('footer-button-primary')
      expect(saveButton).not.toBeDisabled()
    })

    it('isModified 为 false 时保存按钮应该禁用', () => {
      const props = createProps({
        isModified: false,
        isSaving: false,
      })
      render(<DrawerFooter {...props} />)

      const saveButton = screen.getByTestId('footer-button-primary')
      expect(saveButton).toBeDisabled()
    })

    it('isSaving 为 false 时应该显示"保存"', () => {
      const props = createProps({
        isSaving: false,
      })
      render(<DrawerFooter {...props} />)

      const saveButton = screen.getByTestId('footer-button-primary')
      expect(saveButton).toHaveTextContent('保存')
      expect(saveButton).toHaveAttribute('data-loading', 'false')
    })

    it('isSaving 为 true 时应该显示"保存中..."', () => {
      const props = createProps({
        isSaving: true,
      })
      render(<DrawerFooter {...props} />)

      const saveButton = screen.getByTestId('footer-button-primary')
      expect(saveButton).toHaveTextContent('保存中...')
      expect(saveButton).toHaveAttribute('data-loading', 'true')
    })
  })

  describe('保存功能', () => {
    it('点击保存按钮应该调用 onSave', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined)
      const props = createProps({
        onSave,
        isModified: true,
      })
      render(<DrawerFooter {...props} />)

      const saveButton = screen.getByTestId('footer-button-primary')
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledTimes(1)
      })
    })

    it('保存成功时不应该调用 onError', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined)
      const onError = vi.fn()
      const props = createProps({
        onSave,
        onError,
        isModified: true,
      })
      render(<DrawerFooter {...props} />)

      const saveButton = screen.getByTestId('footer-button-primary')
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(onSave).toHaveBeenCalled()
      })

      expect(onError).not.toHaveBeenCalled()
    })

    it('保存失败时应该调用 onError 并传递错误信息', async () => {
      const errorMessage = '网络错误'
      const onSave = vi.fn().mockRejectedValue(new Error(errorMessage))
      const onError = vi.fn()
      const props = createProps({
        onSave,
        onError,
        isModified: true,
      })
      render(<DrawerFooter {...props} />)

      const saveButton = screen.getByTestId('footer-button-primary')
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(errorMessage)
      })
    })

    it('保存失败但错误不是 Error 实例时应该使用默认错误信息', async () => {
      const onSave = vi.fn().mockRejectedValue('字符串错误')
      const onError = vi.fn()
      const props = createProps({
        onSave,
        onError,
        isModified: true,
      })
      render(<DrawerFooter {...props} />)

      const saveButton = screen.getByTestId('footer-button-primary')
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith('保存失败')
      })
    })

    it('isModified 为 false 时点击保存按钮不应该触发保存', () => {
      const onSave = vi.fn()
      const props = createProps({
        onSave,
        isModified: false,
      })
      render(<DrawerFooter {...props} />)

      const saveButton = screen.getByTestId('footer-button-primary')

      // 按钮被禁用，点击不会触发
      expect(saveButton).toBeDisabled()
    })
  })

  describe('按钮布局', () => {
    it('有保存草稿按钮时应该按顺序渲染：保存草稿、关闭、保存', () => {
      const props = createProps({
        toolbarButtons: { draft: true },
      })
      const { container } = render(<DrawerFooter {...props} />)

      const buttons = container.querySelectorAll('button')
      expect(buttons[0]).toHaveTextContent('保存草稿')
      expect(buttons[1]).toHaveTextContent('关闭')
      expect(buttons[2]).toHaveTextContent('保存')
    })

    it('无保存草稿按钮时应该按顺序渲染：关闭、保存', () => {
      const props = createProps({
        toolbarButtons: { draft: false },
      })
      const { container } = render(<DrawerFooter {...props} />)

      const buttons = container.querySelectorAll('button')
      expect(buttons[0]).toHaveTextContent('关闭')
      expect(buttons[1]).toHaveTextContent('保存')
    })
  })

  describe('复杂场景', () => {
    it('保存中时所有交互应该正常工作', () => {
      const onSaveDraft = vi.fn()
      const onClose = vi.fn()
      const props = createProps({
        isSaving: true,
        toolbarButtons: { draft: true },
        onSaveDraft,
        onClose,
      })
      render(<DrawerFooter {...props} />)

      // 保存草稿和关闭按钮应该仍然可用
      const buttons = screen.getAllByTestId('footer-button-default')
      const draftButton = buttons.find((btn) => btn.textContent === '保存草稿')!
      const closeButton = buttons.find((btn) => btn.textContent === '关闭')!

      fireEvent.click(draftButton)
      fireEvent.click(closeButton)

      expect(onSaveDraft).toHaveBeenCalled()
      expect(onClose).toHaveBeenCalled()

      // 保存按钮应该显示保存中
      const saveButton = screen.getByTestId('footer-button-primary')
      expect(saveButton).toHaveTextContent('保存中...')
    })

    it('未修改且未保存时保存按钮应该禁用', () => {
      const props = createProps({
        isModified: false,
        isSaving: false,
      })
      render(<DrawerFooter {...props} />)

      const saveButton = screen.getByTestId('footer-button-primary')
      expect(saveButton).toBeDisabled()
      expect(saveButton).toHaveTextContent('保存')
    })
  })
})
