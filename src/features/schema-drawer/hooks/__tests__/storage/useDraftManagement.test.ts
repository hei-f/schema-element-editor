import { storage } from '@/shared/utils/browser/storage'
import { shadowRootManager } from '@/shared/utils/shadow-root-manager'
import { act, renderHook, waitFor } from '@testing-library/react'
import { Modal } from 'antd'
import { useDraftManagement } from '../../storage/useDraftManagement'

// Mock dependencies
jest.mock('@/shared/utils/browser/storage')
jest.mock('@/shared/utils/logger', () => ({
  logger: {
    log: jest.fn(),
    error: jest.fn(),
  },
}))
jest.mock('antd', () => ({
  Modal: {
    confirm: jest.fn(),
  },
}))

const mockStorage = storage as jest.Mocked<typeof storage>
const mockModal = Modal as jest.Mocked<typeof Modal>

describe('useDraftManagement Hook 测试', () => {
  const mockOnLoadDraft = jest.fn()
  const mockOnSuccess = jest.fn()
  const mockOnWarning = jest.fn()
  const mockOnError = jest.fn()

  const defaultProps = {
    paramsKey: 'test-params',
    editorValue: 'test content',
    isModified: false,
    autoSaveDraft: false,
    isFirstLoad: false,
    onLoadDraft: mockOnLoadDraft,
    onSuccess: mockOnSuccess,
    onWarning: mockOnWarning,
    onError: mockOnError,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()

    // 初始化 shadowRootManager
    const mockShadowRoot = document.createElement('div') as unknown as ShadowRoot
    shadowRootManager.init(mockShadowRoot)
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    shadowRootManager.reset()
  })

  describe('初始化', () => {
    it('应该初始化为无草稿状态', () => {
      const { result } = renderHook(() => useDraftManagement(defaultProps))

      expect(result.current.hasDraft).toBe(false)
      expect(result.current.showDraftNotification).toBe(false)
      expect(result.current.draftAutoSaveStatus).toBe('idle')
    })
  })

  describe('checkDraft 检查草稿', () => {
    it('存在草稿时应该设置状态', async () => {
      mockStorage.getDraft.mockResolvedValue({
        content: 'draft content',
        timestamp: Date.now(),
      })

      const { result } = renderHook(() => useDraftManagement(defaultProps))

      await act(async () => {
        await result.current.checkDraft()
      })

      expect(result.current.hasDraft).toBe(true)
      expect(result.current.showDraftNotification).toBe(true)
    })

    it('不存在草稿时应该清空状态', async () => {
      mockStorage.getDraft.mockResolvedValue(null)

      const { result } = renderHook(() => useDraftManagement(defaultProps))

      await act(async () => {
        await result.current.checkDraft()
      })

      expect(result.current.hasDraft).toBe(false)
      expect(result.current.showDraftNotification).toBe(false)
    })

    it('检查失败时应该不抛出错误', async () => {
      mockStorage.getDraft.mockRejectedValue(new Error('Storage error'))

      const { result } = renderHook(() => useDraftManagement(defaultProps))

      await act(async () => {
        await expect(result.current.checkDraft()).resolves.not.toThrow()
      })
    })
  })

  describe('handleSaveDraft 保存草稿', () => {
    it('应该保存草稿并显示成功提示', async () => {
      mockStorage.saveDraft.mockResolvedValue(undefined)

      const { result } = renderHook(() => useDraftManagement(defaultProps))

      await act(async () => {
        await result.current.handleSaveDraft()
      })

      expect(mockStorage.saveDraft).toHaveBeenCalledWith('test-params', 'test content')
      expect(result.current.hasDraft).toBe(true)
      expect(result.current.showDraftNotification).toBe(true)
      expect(mockOnSuccess).toHaveBeenCalledWith('草稿已保存')
    })

    it('保存失败时应该显示错误提示', async () => {
      mockStorage.saveDraft.mockRejectedValue(new Error('Save error'))

      const { result } = renderHook(() => useDraftManagement(defaultProps))

      await act(async () => {
        await result.current.handleSaveDraft()
      })

      expect(mockOnError).toHaveBeenCalledWith('保存草稿失败')
    })
  })

  describe('handleLoadDraft 加载草稿', () => {
    it('未修改时应该直接加载草稿', async () => {
      mockStorage.getDraft.mockResolvedValue({
        content: 'draft content',
        timestamp: Date.now(),
      })

      const { result } = renderHook(() => useDraftManagement(defaultProps))

      await act(async () => {
        await result.current.handleLoadDraft()
      })

      expect(mockOnLoadDraft).toHaveBeenCalledWith('draft content')
      expect(mockOnSuccess).toHaveBeenCalledWith('草稿已加载')
      expect(mockModal.confirm).not.toHaveBeenCalled()
    })

    it('已修改时应该显示确认对话框', async () => {
      mockStorage.getDraft.mockResolvedValue({
        content: 'draft content',
        timestamp: Date.now(),
      })
      mockModal.confirm.mockImplementation(({ onOk }) => {
        onOk?.()
        return {} as any
      })

      const { result } = renderHook(() =>
        useDraftManagement({
          ...defaultProps,
          isModified: true,
        })
      )

      await act(async () => {
        await result.current.handleLoadDraft()
      })

      expect(mockModal.confirm).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '确认加载草稿',
          content: '当前内容未保存，是否加载草稿？',
        })
      )
    })

    it('草稿不存在时应该显示警告', async () => {
      mockStorage.getDraft.mockResolvedValue(null)

      const { result } = renderHook(() => useDraftManagement(defaultProps))

      await act(async () => {
        await result.current.handleLoadDraft()
      })

      expect(mockOnWarning).toHaveBeenCalledWith('未找到草稿')
      expect(result.current.hasDraft).toBe(false)
    })

    it('加载失败时应该显示错误提示', async () => {
      mockStorage.getDraft.mockRejectedValue(new Error('Load error'))

      const { result } = renderHook(() => useDraftManagement(defaultProps))

      await act(async () => {
        await result.current.handleLoadDraft()
      })

      expect(mockOnError).toHaveBeenCalledWith('加载草稿失败')
    })
  })

  describe('handleDeleteDraft 删除草稿', () => {
    it('应该显示确认对话框并删除草稿', async () => {
      mockStorage.deleteDraft.mockResolvedValue(undefined)
      mockModal.confirm.mockImplementation(({ onOk }) => {
        onOk?.()
        return {} as any
      })

      const { result } = renderHook(() => useDraftManagement(defaultProps))

      await act(async () => {
        result.current.handleDeleteDraft()
      })

      await waitFor(() => {
        expect(mockModal.confirm).toHaveBeenCalledWith(
          expect.objectContaining({
            title: '确认删除草稿',
            okType: 'danger',
          })
        )
        expect(mockStorage.deleteDraft).toHaveBeenCalledWith('test-params')
        expect(result.current.hasDraft).toBe(false)
        expect(result.current.showDraftNotification).toBe(false)
        expect(mockOnSuccess).toHaveBeenCalledWith('草稿已删除')
      })
    })

    it('删除失败时应该显示错误提示', async () => {
      mockStorage.deleteDraft.mockRejectedValue(new Error('Delete error'))
      mockModal.confirm.mockImplementation(({ onOk }) => {
        onOk?.()
        return {} as any
      })

      const { result } = renderHook(() => useDraftManagement(defaultProps))

      await act(async () => {
        result.current.handleDeleteDraft()
      })

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('删除草稿失败')
      })
    })
  })

  describe('debouncedAutoSaveDraft 自动保存草稿', () => {
    it('启用自动保存时应该防抖保存草稿', async () => {
      mockStorage.saveDraft.mockResolvedValue(undefined)

      const { result } = renderHook(() =>
        useDraftManagement({
          ...defaultProps,
          autoSaveDraft: true,
        })
      )

      act(() => {
        result.current.debouncedAutoSaveDraft('auto save content')
      })

      expect(result.current.draftAutoSaveStatus).toBe('saving')

      await act(async () => {
        jest.advanceTimersByTime(3000)
      })

      await waitFor(() => {
        expect(mockStorage.saveDraft).toHaveBeenCalledWith('test-params', 'auto save content')
        expect(result.current.hasDraft).toBe(true)
        expect(result.current.draftAutoSaveStatus).toBe('success')
      })

      await act(async () => {
        jest.advanceTimersByTime(2000)
      })

      await waitFor(() => {
        expect(result.current.draftAutoSaveStatus).toBe('idle')
      })
    })

    it('未启用自动保存时不应该执行', async () => {
      const { result } = renderHook(() => useDraftManagement(defaultProps))

      act(() => {
        result.current.debouncedAutoSaveDraft('content')
        jest.advanceTimersByTime(3000)
      })

      expect(mockStorage.saveDraft).not.toHaveBeenCalled()
    })

    it('首次加载时不应该自动保存', async () => {
      const { result } = renderHook(() =>
        useDraftManagement({
          ...defaultProps,
          autoSaveDraft: true,
          isFirstLoad: true,
        })
      )

      act(() => {
        result.current.debouncedAutoSaveDraft('content')
        jest.advanceTimersByTime(3000)
      })

      expect(mockStorage.saveDraft).not.toHaveBeenCalled()
    })

    it('应该防抖多次连续调用', async () => {
      mockStorage.saveDraft.mockResolvedValue(undefined)

      const { result } = renderHook(() =>
        useDraftManagement({
          ...defaultProps,
          autoSaveDraft: true,
        })
      )

      act(() => {
        result.current.debouncedAutoSaveDraft('content 1')
        jest.advanceTimersByTime(1000)
        result.current.debouncedAutoSaveDraft('content 2')
        jest.advanceTimersByTime(1000)
        result.current.debouncedAutoSaveDraft('content 3')
      })

      await act(async () => {
        jest.advanceTimersByTime(3000)
      })

      await waitFor(() => {
        expect(mockStorage.saveDraft).toHaveBeenCalledTimes(1)
        expect(mockStorage.saveDraft).toHaveBeenCalledWith('test-params', 'content 3')
      })
    })

    it('保存失败时应该重置状态', async () => {
      mockStorage.saveDraft.mockRejectedValue(new Error('Save error'))

      const { result } = renderHook(() =>
        useDraftManagement({
          ...defaultProps,
          autoSaveDraft: true,
        })
      )

      act(() => {
        result.current.debouncedAutoSaveDraft('content')
      })

      await act(async () => {
        jest.advanceTimersByTime(3000)
      })

      await waitFor(() => {
        expect(result.current.draftAutoSaveStatus).toBe('idle')
      })
    })
  })

  describe('showDraftNotification 自动消失', () => {
    it('显示通知后 3 秒应该自动消失', async () => {
      mockStorage.getDraft.mockResolvedValue({
        content: 'draft content',
        timestamp: Date.now(),
      })

      const { result } = renderHook(() => useDraftManagement(defaultProps))

      await act(async () => {
        await result.current.checkDraft()
      })

      expect(result.current.showDraftNotification).toBe(true)

      await act(async () => {
        jest.advanceTimersByTime(3000)
      })

      await waitFor(() => {
        expect(result.current.showDraftNotification).toBe(false)
      })
    })
  })

  describe('清理定时器', () => {
    it('卸载时应该清理自动保存定时器', () => {
      const { unmount } = renderHook(() =>
        useDraftManagement({
          ...defaultProps,
          autoSaveDraft: true,
        })
      )

      unmount()

      expect(jest.getTimerCount()).toBe(0)
    })
  })

  describe('enabled 功能开关', () => {
    it('enabled=false 时 checkDraft 应该跳过检查', async () => {
      mockStorage.getDraft.mockResolvedValue({
        content: 'draft content',
        timestamp: Date.now(),
      })

      const { result } = renderHook(() =>
        useDraftManagement({
          ...defaultProps,
          enabled: false,
        })
      )

      await act(async () => {
        await result.current.checkDraft()
      })

      expect(mockStorage.getDraft).not.toHaveBeenCalled()
      expect(result.current.hasDraft).toBe(false)
      expect(result.current.showDraftNotification).toBe(false)
    })

    it('enabled=false 时 handleSaveDraft 应该跳过保存', async () => {
      const { result } = renderHook(() =>
        useDraftManagement({
          ...defaultProps,
          enabled: false,
        })
      )

      await act(async () => {
        await result.current.handleSaveDraft()
      })

      expect(mockStorage.saveDraft).not.toHaveBeenCalled()
      expect(mockOnSuccess).not.toHaveBeenCalled()
    })

    it('enabled=false 时 debouncedAutoSaveDraft 应该跳过自动保存', async () => {
      const { result } = renderHook(() =>
        useDraftManagement({
          ...defaultProps,
          autoSaveDraft: true,
          enabled: false,
        })
      )

      act(() => {
        result.current.debouncedAutoSaveDraft('content')
      })

      await act(async () => {
        jest.advanceTimersByTime(3000)
      })

      expect(mockStorage.saveDraft).not.toHaveBeenCalled()
    })

    it('enabled=true 时功能应该正常工作（默认行为）', async () => {
      mockStorage.getDraft.mockResolvedValue({
        content: 'draft content',
        timestamp: Date.now(),
      })

      const { result } = renderHook(() =>
        useDraftManagement({
          ...defaultProps,
          enabled: true,
        })
      )

      await act(async () => {
        await result.current.checkDraft()
      })

      expect(mockStorage.getDraft).toHaveBeenCalled()
      expect(result.current.hasDraft).toBe(true)
    })

    it('不传 enabled 参数时应该默认启用', async () => {
      mockStorage.getDraft.mockResolvedValue({
        content: 'draft content',
        timestamp: Date.now(),
      })

      const { result } = renderHook(() => useDraftManagement(defaultProps))

      await act(async () => {
        await result.current.checkDraft()
      })

      expect(mockStorage.getDraft).toHaveBeenCalled()
      expect(result.current.hasDraft).toBe(true)
    })
  })
})
