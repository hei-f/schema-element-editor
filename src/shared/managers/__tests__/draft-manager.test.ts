import type { Draft } from '@/shared/types'
import { DraftManager, draftManager } from '../draft-manager'

// Mock logger
vi.mock('@/shared/utils/logger', () => ({
  logger: {
    log: vi.fn(),
    error: vi.fn(),
  },
}))

describe('DraftManager 测试', () => {
  let manager: DraftManager

  beforeEach(() => {
    manager = new DraftManager()
    vi.clearAllMocks()
  })

  describe('单例', () => {
    it('应该导出单例实例', () => {
      expect(draftManager).toBeInstanceOf(DraftManager)
    })
  })

  describe('getDraft 获取草稿', () => {
    it('应该调用storage获取草稿', async () => {
      const mockDraft: Draft = {
        content: 'test content',
        timestamp: Date.now(),
      }
      const mockGetter = vi.fn().mockResolvedValue(mockDraft)

      const result = await manager.getDraft('test-key', mockGetter)

      expect(mockGetter).toHaveBeenCalledWith('test-key')
      expect(result).toEqual(mockDraft)
    })

    it('草稿不存在时应该返回null', async () => {
      const mockGetter = vi.fn().mockResolvedValue(null)

      const result = await manager.getDraft('non-existent', mockGetter)

      expect(result).toBeNull()
    })
  })

  describe('saveDraft 保存草稿', () => {
    it('应该创建草稿对象并保存', async () => {
      const mockSaver = vi.fn().mockResolvedValue(undefined)
      const beforeSave = Date.now()

      await manager.saveDraft('test-key', 'test content', mockSaver)

      expect(mockSaver).toHaveBeenCalledWith(
        'test-key',
        expect.objectContaining({
          content: 'test content',
          timestamp: expect.any(Number),
        })
      )

      const savedDraft = mockSaver.mock.calls[0][1] as Draft
      expect(savedDraft.timestamp).toBeGreaterThanOrEqual(beforeSave)
    })

    it('应该处理空内容', async () => {
      const mockSaver = vi.fn().mockResolvedValue(undefined)

      await manager.saveDraft('test-key', '', mockSaver)

      expect(mockSaver).toHaveBeenCalledWith(
        'test-key',
        expect.objectContaining({
          content: '',
        })
      )
    })
  })

  describe('deleteDraft 删除草稿', () => {
    it('应该调用storage删除草稿', async () => {
      const mockDeleter = vi.fn().mockResolvedValue(undefined)

      await manager.deleteDraft('test-key', mockDeleter)

      expect(mockDeleter).toHaveBeenCalledWith('test-key')
    })
  })

  describe('isDraftExpired 检查是否过期', () => {
    it('未过期的草稿应该返回false', () => {
      const draft: Draft = {
        content: 'test',
        timestamp: Date.now() - 12 * 60 * 60 * 1000, // 12小时前
      }

      const result = manager.isDraftExpired(draft, 1) // 保留1天

      expect(result).toBe(false)
    })

    it('已过期的草稿应该返回true', () => {
      const draft: Draft = {
        content: 'test',
        timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2天前
      }

      const result = manager.isDraftExpired(draft, 1) // 保留1天

      expect(result).toBe(true)
    })

    it('刚好在过期边界应该返回true', () => {
      const oneDayInMs = 24 * 60 * 60 * 1000
      const draft: Draft = {
        content: 'test',
        timestamp: Date.now() - oneDayInMs - 1000, // 刚过1天
      }

      const result = manager.isDraftExpired(draft, 1)

      expect(result).toBe(true)
    })

    it('应该支持不同的保留天数', () => {
      const draft: Draft = {
        content: 'test',
        timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5天前
      }

      expect(manager.isDraftExpired(draft, 3)).toBe(true)
      expect(manager.isDraftExpired(draft, 7)).toBe(false)
    })
  })

  describe('findExpiredDraftKeys 筛选过期草稿键', () => {
    it('应该找出所有过期的草稿键', () => {
      const now = Date.now()
      const allDrafts = {
        'draft:key1': { content: 'test1', timestamp: now - 2 * 24 * 60 * 60 * 1000 } as Draft, // 2天前
        'draft:key2': { content: 'test2', timestamp: now - 12 * 60 * 60 * 1000 } as Draft, // 12小时前
        'draft:key3': { content: 'test3', timestamp: now - 3 * 24 * 60 * 60 * 1000 } as Draft, // 3天前
        'other:key': { content: 'test4', timestamp: now - 5 * 24 * 60 * 60 * 1000 } as Draft, // 不是draft前缀
      }

      const result = manager.findExpiredDraftKeys(allDrafts, 1, 'draft:')

      expect(result).toHaveLength(2)
      expect(result).toContain('draft:key1')
      expect(result).toContain('draft:key3')
      expect(result).not.toContain('draft:key2') // 未过期
      expect(result).not.toContain('other:key') // 不是draft前缀
    })

    it('没有过期草稿时应该返回空数组', () => {
      const now = Date.now()
      const allDrafts = {
        'draft:key1': { content: 'test1', timestamp: now - 12 * 60 * 60 * 1000 } as Draft,
        'draft:key2': { content: 'test2', timestamp: now - 6 * 60 * 60 * 1000 } as Draft,
      }

      const result = manager.findExpiredDraftKeys(allDrafts, 1, 'draft:')

      expect(result).toEqual([])
    })

    it('空对象应该返回空数组', () => {
      const result = manager.findExpiredDraftKeys({}, 1, 'draft:')

      expect(result).toEqual([])
    })

    it('应该正确匹配前缀', () => {
      const now = Date.now()
      const allDrafts = {
        'draft:key1': { content: 'test1', timestamp: now - 2 * 24 * 60 * 60 * 1000 } as Draft,
        'mydraft:key2': { content: 'test2', timestamp: now - 2 * 24 * 60 * 60 * 1000 } as Draft,
        'other:key3': { content: 'test3', timestamp: now - 2 * 24 * 60 * 60 * 1000 } as Draft,
      }

      const result = manager.findExpiredDraftKeys(allDrafts, 1, 'draft:')

      expect(result).toHaveLength(1)
      expect(result).toContain('draft:key1')
    })
  })

  describe('cleanExpiredDrafts 清理过期草稿', () => {
    it('应该清理过期草稿并返回数量', async () => {
      const now = Date.now()
      const mockAllData = {
        'draft:expired1': { content: 'test1', timestamp: now - 2 * 24 * 60 * 60 * 1000 } as Draft,
        'draft:expired2': { content: 'test2', timestamp: now - 3 * 24 * 60 * 60 * 1000 } as Draft,
        'draft:valid': { content: 'test3', timestamp: now - 12 * 60 * 60 * 1000 } as Draft,
      }
      const mockGetAll = vi.fn().mockResolvedValue(mockAllData)
      const mockRemove = vi.fn().mockResolvedValue(undefined)

      const count = await manager.cleanExpiredDrafts(1, 'draft:', mockGetAll, mockRemove)

      expect(count).toBe(2)
      expect(mockRemove).toHaveBeenCalledWith(['draft:expired1', 'draft:expired2'])
    })

    it('没有过期草稿时不应该调用删除', async () => {
      const now = Date.now()
      const mockAllData = {
        'draft:key': { content: 'test', timestamp: now } as Draft,
      }
      const mockGetAll = vi.fn().mockResolvedValue(mockAllData)
      const mockRemove = vi.fn()

      const count = await manager.cleanExpiredDrafts(1, 'draft:', mockGetAll, mockRemove)

      expect(count).toBe(0)
      expect(mockRemove).not.toHaveBeenCalled()
    })

    it('出错时应该记录错误并返回0', async () => {
      const mockGetAll = vi.fn().mockRejectedValue(new Error('Storage error'))
      const mockRemove = vi.fn()

      const count = await manager.cleanExpiredDrafts(1, 'draft:', mockGetAll, mockRemove)

      expect(count).toBe(0)
      expect(mockRemove).not.toHaveBeenCalled()
    })

    it('删除失败时应该抛出错误', async () => {
      const now = Date.now()
      const mockAllData = {
        'draft:expired': { content: 'test', timestamp: now - 2 * 24 * 60 * 60 * 1000 } as Draft,
      }
      const mockGetAll = vi.fn().mockResolvedValue(mockAllData)
      const mockRemove = vi.fn().mockRejectedValue(new Error('Delete error'))

      const count = await manager.cleanExpiredDrafts(1, 'draft:', mockGetAll, mockRemove)

      expect(count).toBe(0)
    })
  })

  describe('综合场景', () => {
    it('应该完整处理草稿生命周期', async () => {
      const mockGetter = vi.fn()
      const mockSaver = vi.fn().mockResolvedValue(undefined)
      const mockDeleter = vi.fn().mockResolvedValue(undefined)

      // 保存草稿
      await manager.saveDraft('test-key', 'test content', mockSaver)
      expect(mockSaver).toHaveBeenCalled()

      // 模拟获取草稿
      const savedDraft = mockSaver.mock.calls[0][1] as Draft
      mockGetter.mockResolvedValue(savedDraft)

      const retrieved = await manager.getDraft('test-key', mockGetter)
      expect(retrieved).toEqual(savedDraft)

      // 删除草稿
      await manager.deleteDraft('test-key', mockDeleter)
      expect(mockDeleter).toHaveBeenCalledWith('test-key')
    })

    it('应该处理大量草稿的清理', async () => {
      const now = Date.now()
      const mockAllData: Record<string, Draft> = {}

      // 创建100个草稿，一半过期
      for (let i = 0; i < 100; i++) {
        const timestamp =
          i < 50
            ? now - 2 * 24 * 60 * 60 * 1000 // 过期
            : now - 12 * 60 * 60 * 1000 // 未过期
        mockAllData[`draft:key${i}`] = {
          content: `content${i}`,
          timestamp,
        }
      }

      const mockGetAll = vi.fn().mockResolvedValue(mockAllData)
      const mockRemove = vi.fn().mockResolvedValue(undefined)

      const count = await manager.cleanExpiredDrafts(1, 'draft:', mockGetAll, mockRemove)

      expect(count).toBe(50)
      expect(mockRemove).toHaveBeenCalledWith(
        expect.arrayContaining(['draft:key0', 'draft:key1', 'draft:key49'])
      )
    })
  })
})
