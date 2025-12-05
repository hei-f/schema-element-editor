import { renderHook, act } from '@testing-library/react'
import { useDiffSync } from '../../diff/useDiffSync'

describe('useDiffSync', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('初始化', () => {
    it('应该使用初始内容初始化', () => {
      const { result } = renderHook(() =>
        useDiffSync({
          initialLeft: 'left content',
          initialRight: 'right content',
        })
      )

      expect(result.current.leftContent).toBe('left content')
      expect(result.current.rightContent).toBe('right content')
    })

    it('应该计算初始 diff 结果', () => {
      const { result } = renderHook(() =>
        useDiffSync({
          initialLeft: 'line1\nline2',
          initialRight: 'line1\nline3',
        })
      )

      expect(result.current.diffResult).not.toBeNull()
      expect(result.current.diffRows.length).toBeGreaterThan(0)
    })

    it('应该初始化 isComputing 为 false', () => {
      const { result } = renderHook(() =>
        useDiffSync({
          initialLeft: '',
          initialRight: '',
        })
      )

      expect(result.current.isComputing).toBe(false)
    })
  })

  describe('内容更新', () => {
    it('应该能更新左侧内容', () => {
      const { result } = renderHook(() =>
        useDiffSync({
          initialLeft: 'initial',
          initialRight: 'initial',
        })
      )

      act(() => {
        result.current.setLeftContent('updated left')
      })

      expect(result.current.leftContent).toBe('updated left')
    })

    it('应该能更新右侧内容', () => {
      const { result } = renderHook(() =>
        useDiffSync({
          initialLeft: 'initial',
          initialRight: 'initial',
        })
      )

      act(() => {
        result.current.setRightContent('updated right')
      })

      expect(result.current.rightContent).toBe('updated right')
    })

    it('内容更新后应该重新计算 diff', async () => {
      const { result } = renderHook(() =>
        useDiffSync({
          initialLeft: 'line1',
          initialRight: 'line1',
          debounceMs: 100,
        })
      )

      const initialDiff = result.current.diffResult

      act(() => {
        result.current.setLeftContent('line1\nline2')
      })

      // 快进防抖时间
      await act(async () => {
        vi.advanceTimersByTime(100)
      })

      // diff 结果应该更新
      expect(result.current.diffResult).not.toBe(initialDiff)
    })
  })

  describe('防抖机制', () => {
    it('应该使用默认的 300ms 防抖', async () => {
      const { result } = renderHook(() =>
        useDiffSync({
          initialLeft: 'initial',
          initialRight: 'initial',
        })
      )

      act(() => {
        result.current.setLeftContent('change 1')
      })

      // 在防抖时间内再次更新
      act(() => {
        vi.advanceTimersByTime(100)
        result.current.setLeftContent('change 2')
      })

      // 快进剩余时间
      await act(async () => {
        vi.advanceTimersByTime(300)
      })

      // 最终内容应该是最后一次更新
      expect(result.current.leftContent).toBe('change 2')
    })

    it('应该使用自定义的防抖时间', async () => {
      const { result } = renderHook(() =>
        useDiffSync({
          initialLeft: 'initial',
          initialRight: 'initial',
          debounceMs: 500,
        })
      )

      act(() => {
        result.current.setLeftContent('updated')
      })

      // 300ms 后 diff 还未计算完成
      await act(async () => {
        vi.advanceTimersByTime(300)
      })

      expect(result.current.isComputing).toBe(true)

      // 再等 200ms
      await act(async () => {
        vi.advanceTimersByTime(200)
      })

      expect(result.current.isComputing).toBe(false)
    })
  })

  describe('占位行计算', () => {
    it('应该计算左侧占位行', () => {
      const { result } = renderHook(() =>
        useDiffSync({
          initialLeft: 'line1\nline2',
          initialRight: 'line1\nnew line\nline2',
        })
      )

      // 右侧新增的行会导致左侧有占位行
      expect(result.current.leftPlaceholders).toBeDefined()
      expect(Array.isArray(result.current.leftPlaceholders)).toBe(true)
    })

    it('应该计算右侧占位行', () => {
      const { result } = renderHook(() =>
        useDiffSync({
          initialLeft: 'line1\nremoved\nline2',
          initialRight: 'line1\nline2',
        })
      )

      // 左侧删除的行会导致右侧有占位行
      expect(result.current.rightPlaceholders).toBeDefined()
      expect(Array.isArray(result.current.rightPlaceholders)).toBe(true)
    })

    it('相同内容应该没有占位行', () => {
      const { result } = renderHook(() =>
        useDiffSync({
          initialLeft: 'same\ncontent',
          initialRight: 'same\ncontent',
        })
      )

      expect(result.current.leftPlaceholders).toEqual([])
      expect(result.current.rightPlaceholders).toEqual([])
    })
  })

  describe('滚动处理', () => {
    it('左侧滚动处理应该返回对应的滚动位置', () => {
      const { result } = renderHook(() =>
        useDiffSync({
          initialLeft: 'line1\nline2',
          initialRight: 'line1\nline2',
        })
      )

      const scrollTop = result.current.handleLeftScroll(100)
      expect(typeof scrollTop).toBe('number')
    })

    it('右侧滚动处理应该返回对应的滚动位置', () => {
      const { result } = renderHook(() =>
        useDiffSync({
          initialLeft: 'line1\nline2',
          initialRight: 'line1\nline2',
        })
      )

      const scrollTop = result.current.handleRightScroll(100)
      expect(typeof scrollTop).toBe('number')
    })

    it('无 diffResult 时滚动处理应该返回原始位置', async () => {
      const { result } = renderHook(() =>
        useDiffSync({
          initialLeft: '',
          initialRight: '',
        })
      )

      // 立即更新内容触发 diff 重新计算
      act(() => {
        result.current.setLeftContent('new content')
      })

      // 在 diff 计算中时（isComputing 可能为 true）
      // 滚动处理仍应返回有效值
      const leftScroll = result.current.handleLeftScroll(50)
      const rightScroll = result.current.handleRightScroll(50)

      expect(leftScroll).toBe(50)
      expect(rightScroll).toBe(50)
    })
  })

  describe('diffRows', () => {
    it('相同内容应该产生 unchanged 行', () => {
      const { result } = renderHook(() =>
        useDiffSync({
          initialLeft: 'line1\nline2',
          initialRight: 'line1\nline2',
        })
      )

      expect(result.current.diffRows.length).toBe(2)
      result.current.diffRows.forEach((row) => {
        expect(row.left.type).toBe('unchanged')
        expect(row.right.type).toBe('unchanged')
      })
    })

    it('新增内容应该产生 added 行和 placeholder', () => {
      const { result } = renderHook(() =>
        useDiffSync({
          initialLeft: 'line1',
          initialRight: 'line1\nline2',
        })
      )

      const addedRow = result.current.diffRows.find((row) => row.right.type === 'added')
      expect(addedRow).toBeDefined()
      expect(addedRow?.left.type).toBe('placeholder')
    })

    it('删除内容应该产生 removed 行和 placeholder', () => {
      const { result } = renderHook(() =>
        useDiffSync({
          initialLeft: 'line1\nline2',
          initialRight: 'line1',
        })
      )

      const removedRow = result.current.diffRows.find((row) => row.left.type === 'removed')
      expect(removedRow).toBeDefined()
      expect(removedRow?.right.type).toBe('placeholder')
    })

    it('修改内容应该产生 modified 行', () => {
      const { result } = renderHook(() =>
        useDiffSync({
          initialLeft: 'hello world',
          initialRight: 'hello there',
        })
      )

      const modifiedRow = result.current.diffRows.find((row) => row.left.type === 'modified')
      expect(modifiedRow).toBeDefined()
    })
  })

  describe('isComputing 状态', () => {
    it('内容更新后应该进入计算状态', async () => {
      const { result } = renderHook(() =>
        useDiffSync({
          initialLeft: 'initial',
          initialRight: 'initial',
          debounceMs: 200,
        })
      )

      act(() => {
        result.current.setLeftContent('updated')
      })

      // 等待 setIsComputing(true) 的 setTimeout(0) 执行
      await act(async () => {
        vi.advanceTimersByTime(1)
      })

      expect(result.current.isComputing).toBe(true)

      // 等待防抖完成
      await act(async () => {
        vi.advanceTimersByTime(200)
      })

      expect(result.current.isComputing).toBe(false)
    })
  })

  describe('边界情况', () => {
    it('应该处理空内容', () => {
      const { result } = renderHook(() =>
        useDiffSync({
          initialLeft: '',
          initialRight: '',
        })
      )

      expect(result.current.diffRows).toEqual([])
      expect(result.current.leftPlaceholders).toEqual([])
      expect(result.current.rightPlaceholders).toEqual([])
    })

    it('应该处理只有空行的内容', () => {
      const { result } = renderHook(() =>
        useDiffSync({
          initialLeft: '\n\n',
          initialRight: '\n\n',
        })
      )

      expect(result.current.diffRows.length).toBeGreaterThan(0)
    })

    it('应该处理包含特殊字符的内容', () => {
      const { result } = renderHook(() =>
        useDiffSync({
          initialLeft: '{"key": "value"}',
          initialRight: '{"key": "updated"}',
        })
      )

      expect(result.current.diffRows.length).toBeGreaterThan(0)
    })
  })

  describe('清理逻辑', () => {
    it('组件卸载时应该清理 timer', () => {
      const { unmount } = renderHook(() =>
        useDiffSync({
          initialLeft: 'initial',
          initialRight: 'initial',
        })
      )

      // 这里主要验证不会抛出错误
      expect(() => {
        unmount()
        vi.advanceTimersByTime(1000)
      }).not.toThrow()
    })
  })
})
