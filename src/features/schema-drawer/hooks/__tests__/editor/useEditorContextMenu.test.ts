import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useEditorContextMenu } from '../../editor/useEditorContextMenu'
import { ContextMenuAction } from '../../../components/context-menu/types'
import type { CodeMirrorEditorHandle } from '../../../components/editor/CodeMirrorEditor'

describe('useEditorContextMenu', () => {
  const mockEditorRef = {
    current: {
      replaceRange: vi.fn(),
      showErrorWidget: vi.fn(),
      hideErrorWidget: vi.fn(),
      getValue: vi.fn(),
      setValue: vi.fn(),
      focus: vi.fn(),
      goToPosition: vi.fn(),
    } as unknown as CodeMirrorEditorHandle,
  }

  const mockEditorView = {
    state: {
      selection: {
        main: {
          from: 0,
          to: 10,
        },
      },
      sliceDoc: vi.fn((_from: number, _to: number) => 'test content'),
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('初始化', () => {
    it('应该返回正确的初始状态', () => {
      const { result } = renderHook(() =>
        useEditorContextMenu({
          editorRef: mockEditorRef,
          enabled: true,
        })
      )

      expect(result.current.menuVisible).toBe(false)
      expect(result.current.modalVisible).toBe(false)
      expect(result.current.selectionRange).toBeNull()
      expect(result.current.menuPosition).toEqual({ x: 0, y: 0 })
      expect(result.current.modalContent).toBe('')
    })
  })

  describe('handleContextMenu', () => {
    it('应该在enabled为true时处理右键菜单事件', () => {
      const { result } = renderHook(() =>
        useEditorContextMenu({
          editorRef: mockEditorRef,
          enabled: true,
        })
      )

      const mockEvent = {
        preventDefault: vi.fn(),
        clientX: 100,
        clientY: 200,
      } as unknown as MouseEvent

      act(() => {
        result.current.handleContextMenu(mockEvent, mockEditorView as any)
      })

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(result.current.menuVisible).toBe(true)
      expect(result.current.menuPosition).toEqual({ x: 100, y: 200 })
      expect(result.current.selectionRange).toEqual({
        from: 0,
        to: 10,
        text: 'test content',
      })
    })

    it('应该在enabled为false时不处理右键菜单事件', () => {
      const { result } = renderHook(() =>
        useEditorContextMenu({
          editorRef: mockEditorRef,
          enabled: false,
        })
      )

      const mockEvent = {
        preventDefault: vi.fn(),
        clientX: 100,
        clientY: 200,
      } as unknown as MouseEvent

      act(() => {
        result.current.handleContextMenu(mockEvent, mockEditorView as any)
      })

      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
      expect(result.current.menuVisible).toBe(false)
    })
  })

  describe('handleMenuSelect', () => {
    it('应该打开编辑弹窗并设置内容', () => {
      const { result } = renderHook(() =>
        useEditorContextMenu({
          editorRef: mockEditorRef,
          enabled: true,
        })
      )

      // 先触发右键菜单以设置选区
      const mockEvent = {
        preventDefault: vi.fn(),
        clientX: 100,
        clientY: 200,
      } as unknown as MouseEvent

      act(() => {
        result.current.handleContextMenu(mockEvent, mockEditorView as any)
      })

      // 然后选择菜单项
      act(() => {
        result.current.handleMenuSelect(ContextMenuAction.QUICK_EDIT)
      })

      expect(result.current.modalVisible).toBe(true)
      expect(result.current.modalContent).toBe('test content')
      expect(result.current.menuVisible).toBe(false)
    })

    it('应该在没有选中内容时不打开弹窗', () => {
      const { result } = renderHook(() =>
        useEditorContextMenu({
          editorRef: mockEditorRef,
          enabled: true,
        })
      )

      act(() => {
        result.current.handleMenuSelect(ContextMenuAction.QUICK_EDIT)
      })

      expect(result.current.modalVisible).toBe(false)
    })
  })

  describe('handleModalSave', () => {
    it('应该替换选中内容并关闭弹窗', () => {
      const { result } = renderHook(() =>
        useEditorContextMenu({
          editorRef: mockEditorRef,
          enabled: true,
        })
      )

      // 先触发右键菜单
      const mockEvent = {
        preventDefault: vi.fn(),
        clientX: 100,
        clientY: 200,
      } as unknown as MouseEvent

      act(() => {
        result.current.handleContextMenu(mockEvent, mockEditorView as any)
      })

      // 打开弹窗
      act(() => {
        result.current.handleMenuSelect(ContextMenuAction.QUICK_EDIT)
      })

      // 保存新内容
      act(() => {
        result.current.handleModalSave('new content')
      })

      expect(mockEditorRef.current?.replaceRange).toHaveBeenCalledWith(0, 10, 'new content')
      expect(result.current.modalVisible).toBe(false)
      expect(result.current.modalContent).toBe('')
      expect(result.current.selectionRange).toBeNull()
    })

    it('应该在没有选区时只关闭弹窗', () => {
      const { result } = renderHook(() =>
        useEditorContextMenu({
          editorRef: mockEditorRef,
          enabled: true,
        })
      )

      act(() => {
        result.current.handleModalSave('new content')
      })

      expect(mockEditorRef.current?.replaceRange).not.toHaveBeenCalled()
      expect(result.current.modalVisible).toBe(false)
    })

    it('应该在editorRef不存在时只关闭弹窗', () => {
      const refWithEditor = { ...mockEditorRef }
      const { result } = renderHook(() =>
        useEditorContextMenu({
          editorRef: refWithEditor,
          enabled: true,
        })
      )

      // 先打开菜单和弹窗
      const mockEvent = {
        preventDefault: vi.fn(),
        clientX: 100,
        clientY: 200,
      } as unknown as MouseEvent

      act(() => {
        result.current.handleContextMenu(mockEvent, mockEditorView as any)
      })

      act(() => {
        result.current.handleMenuSelect(ContextMenuAction.QUICK_EDIT)
      })

      // 现在将ref设为null并调用save
      ;(refWithEditor as any).current = null

      act(() => {
        result.current.handleModalSave('new content')
      })

      expect(result.current.modalVisible).toBe(false)
    })
  })

  describe('closeMenu', () => {
    it('应该关闭菜单', () => {
      const { result } = renderHook(() =>
        useEditorContextMenu({
          editorRef: mockEditorRef,
          enabled: true,
        })
      )

      // 先打开菜单
      const mockEvent = {
        preventDefault: vi.fn(),
        clientX: 100,
        clientY: 200,
      } as unknown as MouseEvent

      act(() => {
        result.current.handleContextMenu(mockEvent, mockEditorView as any)
      })

      expect(result.current.menuVisible).toBe(true)

      // 关闭菜单
      act(() => {
        result.current.closeMenu()
      })

      expect(result.current.menuVisible).toBe(false)
    })
  })

  describe('closeModal', () => {
    it('应该关闭弹窗并清空内容', () => {
      const { result } = renderHook(() =>
        useEditorContextMenu({
          editorRef: mockEditorRef,
          enabled: true,
        })
      )

      // 先打开弹窗
      const mockEvent = {
        preventDefault: vi.fn(),
        clientX: 100,
        clientY: 200,
      } as unknown as MouseEvent

      act(() => {
        result.current.handleContextMenu(mockEvent, mockEditorView as any)
      })

      act(() => {
        result.current.handleMenuSelect(ContextMenuAction.QUICK_EDIT)
      })

      expect(result.current.modalVisible).toBe(true)
      expect(result.current.modalContent).toBe('test content')

      // 关闭弹窗
      act(() => {
        result.current.closeModal()
      })

      expect(result.current.modalVisible).toBe(false)
      expect(result.current.modalContent).toBe('')
    })
  })
})
