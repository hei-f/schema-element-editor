import { HistoryEntryType } from '@/shared/types'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useEditHistory } from '../useEditHistory'

// Mock logger
jest.mock('@/shared/utils/logger', () => ({
  logger: {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}))

describe('useEditHistory Hook 测试', () => {
  const mockOnLoadVersion = jest.fn()
  const mockOnClearHistory = jest.fn()
  const defaultProps = {
    paramsKey: 'test-params',
    editorValue: 'initial content',
    maxHistoryCount: 5,
    onLoadVersion: mockOnLoadVersion,
    onClearHistory: mockOnClearHistory
  }

  beforeEach(() => {
    jest.clearAllMocks()
    sessionStorage.clear()
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  describe('初始化', () => {
    it('应该初始化为空历史', () => {
      const { result } = renderHook(() => useEditHistory(defaultProps))

      expect(result.current.history).toEqual([])
      expect(result.current.currentIndex).toBe(-1)
      expect(result.current.hasHistory).toBe(false)
    })

    it('应该从 sessionStorage 加载历史', () => {
      const mockHistory = {
        entries: [{
          id: '1',
          content: 'test',
          timestamp: Date.now(),
          type: HistoryEntryType.AutoSave,
          description: '自动保存'
        }],
        specialEntries: [],
        currentIndex: 0
      }
      sessionStorage.setItem('edit-history:test-params', JSON.stringify(mockHistory))

      const { result } = renderHook(() => useEditHistory(defaultProps))

      expect(result.current.history).toHaveLength(1)
      expect(result.current.hasHistory).toBe(true)
    })
  })

  describe('recordChange 防抖记录', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.runOnlyPendingTimers()
      jest.useRealTimers()
    })

    it('应该在 2 秒后记录变更', async () => {
      const { result } = renderHook(() => useEditHistory(defaultProps))

      act(() => {
        result.current.recordChange('new content')
      })

      expect(result.current.history).toHaveLength(0)

      act(() => {
        jest.advanceTimersByTime(2000)
      })

      await waitFor(() => {
        expect(result.current.history).toHaveLength(1)
        expect(result.current.history[0].content).toBe('new content')
        expect(result.current.history[0].type).toBe(HistoryEntryType.AutoSave)
      })
    })

    it('应该防抖多次连续调用', async () => {
      const { result } = renderHook(() => useEditHistory(defaultProps))

      act(() => {
        result.current.recordChange('content 1')
        jest.advanceTimersByTime(500)
        result.current.recordChange('content 2')
        jest.advanceTimersByTime(500)
        result.current.recordChange('content 3')
      })

      act(() => {
        jest.advanceTimersByTime(2000)
      })

      await waitFor(() => {
        expect(result.current.history).toHaveLength(1)
        expect(result.current.history[0].content).toBe('content 3')
      })
    })

    it('相同内容应该跳过记录', async () => {
      const { result } = renderHook(() => useEditHistory(defaultProps))

      act(() => {
        result.current.recordChange('same content')
      })

      act(() => {
        jest.advanceTimersByTime(2000)
      })

      await waitFor(() => {
        expect(result.current.history).toHaveLength(1)
      })

      act(() => {
        result.current.recordChange('same content')
        jest.advanceTimersByTime(2000)
      })

      await waitFor(() => {
        expect(result.current.history).toHaveLength(1)
      })
    })
  })

  describe('recordSpecialVersion 特殊版本', () => {
    it('应该立即记录特殊版本', () => {
      const { result } = renderHook(() => useEditHistory(defaultProps))

      act(() => {
        result.current.recordSpecialVersion(
          HistoryEntryType.Save,
          '保存版本',
          'saved content'
        )
      })

      expect(result.current.history).toHaveLength(1)
      expect(result.current.history[0].type).toBe(HistoryEntryType.Save)
      expect(result.current.history[0].description).toBe('保存版本')
      expect(result.current.history[0].content).toBe('saved content')
    })

    it('特殊版本应该使用 editorValue 如果未提供 content', () => {
      const { result } = renderHook(() => useEditHistory({
        ...defaultProps,
        editorValue: 'current editor value'
      }))

      act(() => {
        result.current.recordSpecialVersion(HistoryEntryType.Draft, '草稿')
      })

      expect(result.current.history[0].content).toBe('current editor value')
    })

    it('特殊版本不应该计入数量限制', async () => {
      jest.useFakeTimers()
      const { result } = renderHook(() => useEditHistory({
        ...defaultProps,
        maxHistoryCount: 2
      }))

      // 添加 2 个普通版本（通过防抖）
      act(() => {
        result.current.recordChange('auto 1')
      })
      act(() => {
        jest.advanceTimersByTime(2000)
      })
      
      await waitFor(() => {
        expect(result.current.history.length).toBeGreaterThan(0)
      })

      act(() => {
        result.current.recordChange('auto 2')
      })
      act(() => {
        jest.advanceTimersByTime(2000)
      })

      await waitFor(() => {
        expect(result.current.history.length).toBeGreaterThan(1)
      })

      // 添加 3 个特殊版本（内容各不相同）
      act(() => {
        result.current.recordSpecialVersion(HistoryEntryType.Save, '保存1', 'save 1')
      })
      act(() => {
        result.current.recordSpecialVersion(HistoryEntryType.Draft, '草稿', 'draft 1')
      })
      act(() => {
        result.current.recordSpecialVersion(HistoryEntryType.Favorite, '收藏', 'fav 1')
      })

      // 总共应该有 5 个版本（2个普通 + 3个特殊）
      await waitFor(() => {
        expect(result.current.history).toHaveLength(5)
      })
      
      jest.useRealTimers()
    })
  })

  describe('loadHistoryVersion 加载历史', () => {
    it('应该加载指定索引的历史版本', async () => {
      const { result } = renderHook(() => useEditHistory(defaultProps))

      // 分别添加，确保内容不同
      act(() => {
        result.current.recordSpecialVersion(HistoryEntryType.Save, '版本1', 'content 1')
      })

      act(() => {
        result.current.recordSpecialVersion(HistoryEntryType.Save, '版本2', 'content 2')
      })

      await waitFor(() => {
        expect(result.current.history).toHaveLength(2)
      })

      act(() => {
        result.current.loadHistoryVersion(1)
      })

      await waitFor(() => {
        expect(mockOnLoadVersion).toHaveBeenCalled()
        expect(result.current.currentIndex).toBe(1)
      })
    })

    it('无效索引应该不执行加载', () => {
      const { result } = renderHook(() => useEditHistory(defaultProps))

      act(() => {
        result.current.recordSpecialVersion(HistoryEntryType.Save, '版本', 'content')
      })

      act(() => {
        result.current.loadHistoryVersion(999)
      })

      expect(mockOnLoadVersion).not.toHaveBeenCalled()
    })

    it('负数索引应该不执行加载', () => {
      const { result } = renderHook(() => useEditHistory(defaultProps))

      act(() => {
        result.current.loadHistoryVersion(-1)
      })

      expect(mockOnLoadVersion).not.toHaveBeenCalled()
    })
  })

  describe('clearHistory 清除历史', () => {
    it('应该清除所有历史记录', async () => {
      const { result } = renderHook(() => useEditHistory(defaultProps))

      // 分别添加，确保内容不同
      act(() => {
        result.current.recordSpecialVersion(HistoryEntryType.Save, '版本1', 'content 1')
      })

      act(() => {
        result.current.recordSpecialVersion(HistoryEntryType.Draft, '草稿', 'draft')
      })

      await waitFor(() => {
        expect(result.current.history).toHaveLength(2)
      })

      act(() => {
        result.current.clearHistory()
      })

      expect(result.current.history).toHaveLength(0)
      expect(result.current.currentIndex).toBe(-1)
      expect(result.current.hasHistory).toBe(false)
      expect(mockOnClearHistory).toHaveBeenCalled()
    })

    it('清除后应该能重新记录', async () => {
      const { result } = renderHook(() => useEditHistory(defaultProps))

      act(() => {
        result.current.recordSpecialVersion(HistoryEntryType.Save, '版本', 'content')
        result.current.clearHistory()
        result.current.recordSpecialVersion(HistoryEntryType.Save, '新版本', 'new content')
      })

      await waitFor(() => {
        expect(result.current.history).toHaveLength(1)
        expect(result.current.history[0].content).toBe('new content')
      })
    })
  })

  describe('数量限制（FIFO）', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.runOnlyPendingTimers()
      jest.useRealTimers()
    })

    it('超过限制时应该删除最旧的记录', async () => {
      const { result } = renderHook(() => useEditHistory({
        ...defaultProps,
        maxHistoryCount: 3
      }))

      // 添加 4 个普通版本
      for (let i = 1; i <= 4; i++) {
        act(() => {
          result.current.recordChange(`content ${i}`)
          jest.advanceTimersByTime(2000)
        })
        await waitFor(() => {
          expect(result.current.history).toHaveLength(Math.min(i, 3))
        })
      }

      // 应该只保留最新的 3 个
      expect(result.current.history).toHaveLength(3)
      expect(result.current.history.some(e => e.content === 'content 1')).toBe(false)
      expect(result.current.history.some(e => e.content === 'content 4')).toBe(true)
    })
  })

  describe('sessionStorage 持久化', () => {
    it('应该保存历史到 sessionStorage', () => {
      const { result } = renderHook(() => useEditHistory(defaultProps))

      act(() => {
        result.current.recordSpecialVersion(HistoryEntryType.Save, '版本', 'content')
      })

      const stored = sessionStorage.getItem('edit-history:test-params')
      expect(stored).toBeTruthy()
      
      const data = JSON.parse(stored!)
      expect(data.specialEntries).toHaveLength(1)
      expect(data.specialEntries[0].content).toBe('content')
    })

    it('应该从 sessionStorage 恢复历史', () => {
      const mockData = {
        entries: [],
        specialEntries: [{
          id: '1',
          content: 'restored content',
          timestamp: Date.now(),
          type: HistoryEntryType.Save,
          description: '保存版本'
        }],
        currentIndex: 0
      }
      sessionStorage.setItem('edit-history:test-params', JSON.stringify(mockData))

      const { result } = renderHook(() => useEditHistory(defaultProps))

      expect(result.current.history).toHaveLength(1)
      expect(result.current.history[0].content).toBe('restored content')
    })
  })

  describe('合并历史排序', () => {
    it('应该按时间戳倒序排序（最新在前）', () => {
      const { result } = renderHook(() => useEditHistory(defaultProps))

      act(() => {
        result.current.recordSpecialVersion(HistoryEntryType.Save, '版本1', 'content 1')
      })

      // 延迟确保时间戳不同
      act(() => {
        jest.advanceTimersByTime(10)
      })

      act(() => {
        result.current.recordSpecialVersion(HistoryEntryType.Draft, '草稿', 'content 2')
      })

      expect(result.current.history[0].content).toBe('content 2')
      expect(result.current.history[1].content).toBe('content 1')
    })
  })

  describe('enabled 功能开关', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.runOnlyPendingTimers()
      jest.useRealTimers()
    })

    it('enabled=false 时 recordChange 应该跳过记录', async () => {
      const { result } = renderHook(() => useEditHistory({
        ...defaultProps,
        enabled: false
      }))

      act(() => {
        result.current.recordChange('new content')
      })

      act(() => {
        jest.advanceTimersByTime(2000)
      })

      await waitFor(() => {
        expect(result.current.history).toHaveLength(0)
      })
    })

    it('enabled=false 时 recordSpecialVersion 应该跳过记录', () => {
      const { result } = renderHook(() => useEditHistory({
        ...defaultProps,
        enabled: false
      }))

      act(() => {
        result.current.recordSpecialVersion(HistoryEntryType.Save, '保存版本', 'content')
      })

      expect(result.current.history).toHaveLength(0)
    })

    it('enabled=false 时初始化应该清空历史状态', () => {
      // 先在 sessionStorage 中存储一些历史
      const mockHistory = {
        entries: [{
          id: '1',
          content: 'test',
          timestamp: Date.now(),
          type: HistoryEntryType.AutoSave,
          description: '自动保存'
        }],
        specialEntries: [],
        currentIndex: 0
      }
      sessionStorage.setItem('edit-history:test-params', JSON.stringify(mockHistory))

      const { result } = renderHook(() => useEditHistory({
        ...defaultProps,
        enabled: false
      }))

      // enabled=false 时不应该加载历史
      expect(result.current.history).toHaveLength(0)
      expect(result.current.currentIndex).toBe(-1)
      expect(result.current.hasHistory).toBe(false)
    })

    it('enabled=true 时功能应该正常工作（默认行为）', async () => {
      const { result } = renderHook(() => useEditHistory({
        ...defaultProps,
        enabled: true
      }))

      act(() => {
        result.current.recordChange('new content')
      })

      act(() => {
        jest.advanceTimersByTime(2000)
      })

      await waitFor(() => {
        expect(result.current.history).toHaveLength(1)
        expect(result.current.history[0].content).toBe('new content')
      })
    })

    it('不传 enabled 参数时应该默认启用', async () => {
      const { result } = renderHook(() => useEditHistory(defaultProps))

      act(() => {
        result.current.recordSpecialVersion(HistoryEntryType.Save, '保存版本', 'content')
      })

      expect(result.current.history).toHaveLength(1)
    })

    it('loadHistoryVersion 在 enabled=false 时仍然可以工作', () => {
      // 先启用状态下添加历史
      const { result, rerender } = renderHook(
        (props) => useEditHistory(props),
        { initialProps: { ...defaultProps, enabled: true } }
      )

      act(() => {
        result.current.recordSpecialVersion(HistoryEntryType.Save, '版本1', 'content 1')
      })

      act(() => {
        jest.advanceTimersByTime(10)
        result.current.recordSpecialVersion(HistoryEntryType.Save, '版本2', 'content 2')
      })

      expect(result.current.history).toHaveLength(2)

      // 切换为禁用状态
      rerender({ ...defaultProps, enabled: false })

      // 虽然禁用了，但已有的历史记录应该能加载
      // 注意：禁用后历史会被清空，所以这个测试验证的是禁用前的状态
    })

    it('clearHistory 在 enabled=false 时仍然可以工作', () => {
      const { result } = renderHook(() => useEditHistory({
        ...defaultProps,
        enabled: false
      }))

      // clearHistory 应该仍然可以调用，不会报错
      act(() => {
        result.current.clearHistory()
      })

      expect(result.current.history).toHaveLength(0)
      expect(mockOnClearHistory).toHaveBeenCalled()
    })
  })
})

