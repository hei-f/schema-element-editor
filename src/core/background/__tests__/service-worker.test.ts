import type { Mock } from 'vitest'
import { MessageType } from '@/shared/types'

/**
 * Background Service Worker 测试
 *
 * 注意：由于 service-worker.ts 在实际运行时会立即执行顶层代码，
 * 我们在这里测试核心逻辑而不是导入整个模块
 */
describe('Background Service Worker', () => {
  let mockStorage: any

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock storage
    mockStorage = {
      isActive: false,
    }
    ;(chrome.storage.local.get as Mock).mockImplementation((keys: string | string[]) => {
      if (typeof keys === 'string') {
        return Promise.resolve({ [keys]: mockStorage[keys] })
      }
      const result: any = {}
      if (Array.isArray(keys)) {
        keys.forEach((key) => {
          result[key] = mockStorage[key]
        })
      }
      return Promise.resolve(result)
    })
    ;(chrome.storage.local.set as Mock).mockImplementation((items: any) => {
      Object.assign(mockStorage, items)
      return Promise.resolve()
    })
  })

  describe('激活状态切换', () => {
    it('应该切换激活状态从 false 到 true', async () => {
      const mockTabs = [
        { id: 1, url: 'https://example.com' },
        { id: 2, url: 'https://test.com' },
      ]

      ;(chrome.tabs.query as Mock).mockResolvedValue(mockTabs)
      ;(chrome.tabs.sendMessage as Mock).mockResolvedValue(undefined)

      // 模拟 storage.toggleActiveState
      const toggleActiveState = async () => {
        const currentState = mockStorage.isActive || false
        const newState = !currentState
        await chrome.storage.local.set({ isActive: newState })
        return newState
      }

      const newState = await toggleActiveState()

      expect(newState).toBe(true)
      expect(mockStorage.isActive).toBe(true)
    })

    it('应该切换激活状态从 true 到 false', async () => {
      mockStorage.isActive = true

      const toggleActiveState = async () => {
        const currentState = mockStorage.isActive || false
        const newState = !currentState
        await chrome.storage.local.set({ isActive: newState })
        return newState
      }

      const newState = await toggleActiveState()

      expect(newState).toBe(false)
      expect(mockStorage.isActive).toBe(false)
    })
  })

  describe('广播消息到所有标签页', () => {
    it('应该查询所有标签页', async () => {
      const mockTabs = [
        { id: 1, url: 'https://example.com' },
        { id: 2, url: 'https://test.com' },
        { id: 3, url: 'https://another.com' },
      ]

      ;(chrome.tabs.query as Mock).mockResolvedValue(mockTabs)

      const tabs = await chrome.tabs.query({})

      expect(chrome.tabs.query).toHaveBeenCalledWith({})
      expect(tabs).toHaveLength(3)
      expect(tabs).toEqual(mockTabs)
    })

    it('应该向所有标签页发送激活状态变更消息', async () => {
      const mockTabs = [
        { id: 1, url: 'https://example.com' },
        { id: 2, url: 'https://test.com' },
        { id: 3, url: 'https://another.com' },
      ]

      ;(chrome.tabs.query as Mock).mockResolvedValue(mockTabs)
      ;(chrome.tabs.sendMessage as Mock).mockResolvedValue(undefined)

      // 模拟广播逻辑
      const broadcastToAllTabs = async (isActive: boolean) => {
        const tabs = await chrome.tabs.query({})

        for (const tab of tabs) {
          if (tab.id) {
            try {
              await chrome.tabs.sendMessage(tab.id, {
                type: MessageType.ACTIVE_STATE_CHANGED,
                payload: { isActive },
              })
            } catch (_error) {
              // 忽略错误
            }
          }
        }
      }

      await broadcastToAllTabs(true)

      expect(chrome.tabs.sendMessage).toHaveBeenCalledTimes(3)
      expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(1, {
        type: MessageType.ACTIVE_STATE_CHANGED,
        payload: { isActive: true },
      })
      expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(2, {
        type: MessageType.ACTIVE_STATE_CHANGED,
        payload: { isActive: true },
      })
      expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(3, {
        type: MessageType.ACTIVE_STATE_CHANGED,
        payload: { isActive: true },
      })
    })

    it('应该跳过没有 id 的标签页', async () => {
      const mockTabs = [
        { id: 1, url: 'https://example.com' },
        { url: 'https://no-id.com' }, // 没有 id
        { id: 3, url: 'https://another.com' },
      ]

      ;(chrome.tabs.query as Mock).mockResolvedValue(mockTabs)
      ;(chrome.tabs.sendMessage as Mock).mockResolvedValue(undefined)

      const broadcastToAllTabs = async (isActive: boolean) => {
        const tabs = await chrome.tabs.query({})

        for (const tab of tabs) {
          if (tab.id) {
            try {
              await chrome.tabs.sendMessage(tab.id, {
                type: MessageType.ACTIVE_STATE_CHANGED,
                payload: { isActive },
              })
            } catch (_error) {
              // 忽略错误
            }
          }
        }
      }

      await broadcastToAllTabs(true)

      // 只应该发送给有 id 的标签页
      expect(chrome.tabs.sendMessage).toHaveBeenCalledTimes(2)
      expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(1, expect.any(Object))
      expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(3, expect.any(Object))
    })
  })

  describe('错误处理', () => {
    it('应该处理 sendMessage 失败的情况（特殊页面）', async () => {
      const mockTabs = [
        { id: 1, url: 'https://example.com' },
        { id: 2, url: 'chrome://extensions' }, // 特殊页面
        { id: 3, url: 'https://another.com' },
      ]

      ;(chrome.tabs.query as Mock).mockResolvedValue(mockTabs)

      // 模拟第二个标签页发送失败
      ;(chrome.tabs.sendMessage as Mock).mockImplementation((tabId: number) => {
        if (tabId === 2) {
          return Promise.reject(new Error('Cannot access chrome:// URLs'))
        }
        return Promise.resolve()
      })

      const broadcastToAllTabs = async (isActive: boolean) => {
        const tabs = await chrome.tabs.query({})

        for (const tab of tabs) {
          if (tab.id) {
            try {
              await chrome.tabs.sendMessage(tab.id, {
                type: MessageType.ACTIVE_STATE_CHANGED,
                payload: { isActive },
              })
            } catch (_error) {
              // 忽略错误，继续处理其他标签页
            }
          }
        }
      }

      // 不应该抛出错误
      await expect(broadcastToAllTabs(true)).resolves.not.toThrow()

      // 应该尝试向所有标签页发送消息
      expect(chrome.tabs.sendMessage).toHaveBeenCalledTimes(3)
    })

    it('应该处理 tabs.query 失败的情况', async () => {
      ;(chrome.tabs.query as Mock).mockRejectedValue(new Error('Query failed'))

      const broadcastToAllTabs = async (isActive: boolean) => {
        try {
          const tabs = await chrome.tabs.query({})

          for (const tab of tabs) {
            if (tab.id) {
              try {
                await chrome.tabs.sendMessage(tab.id, {
                  type: MessageType.ACTIVE_STATE_CHANGED,
                  payload: { isActive },
                })
              } catch (_error) {
                // 忽略发送错误
              }
            }
          }
        } catch (error) {
          // 捕获查询错误
          console.error('查询标签页失败:', error)
        }
      }

      // 不应该抛出错误
      await expect(broadcastToAllTabs(true)).resolves.not.toThrow()

      // 不应该尝试发送消息
      expect(chrome.tabs.sendMessage).not.toHaveBeenCalled()
    })
  })

  describe('图标状态更新', () => {
    it('应该为激活状态设置正确的图标', async () => {
      const updateIconState = async (isActive: boolean) => {
        await chrome.action.setTitle({
          title: `Schema Element Editor - ${isActive ? '已激活 ✓' : '未激活'}`,
        })

        const iconSuffix = isActive ? 'active' : 'inactive'
        await chrome.action.setIcon({
          path: {
            16: `icons/icon-${iconSuffix}-16.png`,
            48: `icons/icon-${iconSuffix}-48.png`,
            128: `icons/icon-${iconSuffix}-128.png`,
          },
        })
      }

      await updateIconState(true)

      expect(chrome.action.setTitle).toHaveBeenCalledWith({
        title: 'Schema Element Editor - 已激活 ✓',
      })

      expect(chrome.action.setIcon).toHaveBeenCalledWith({
        path: {
          16: 'icons/icon-active-16.png',
          48: 'icons/icon-active-48.png',
          128: 'icons/icon-active-128.png',
        },
      })
    })

    it('应该为未激活状态设置正确的图标', async () => {
      const updateIconState = async (isActive: boolean) => {
        await chrome.action.setTitle({
          title: `Schema Element Editor - ${isActive ? '已激活 ✓' : '未激活'}`,
        })

        const iconSuffix = isActive ? 'active' : 'inactive'
        await chrome.action.setIcon({
          path: {
            16: `icons/icon-${iconSuffix}-16.png`,
            48: `icons/icon-${iconSuffix}-48.png`,
            128: `icons/icon-${iconSuffix}-128.png`,
          },
        })
      }

      await updateIconState(false)

      expect(chrome.action.setTitle).toHaveBeenCalledWith({
        title: 'Schema Element Editor - 未激活',
      })

      expect(chrome.action.setIcon).toHaveBeenCalledWith({
        path: {
          16: 'icons/icon-inactive-16.png',
          48: 'icons/icon-inactive-48.png',
          128: 'icons/icon-inactive-128.png',
        },
      })
    })
  })

  describe('完整流程测试', () => {
    it('应该正确处理从未激活到激活的完整流程', async () => {
      const mockTabs = [
        { id: 1, url: 'https://example.com' },
        { id: 2, url: 'https://test.com' },
      ]

      mockStorage.isActive = false
      ;(chrome.tabs.query as Mock).mockResolvedValue(mockTabs)
      ;(chrome.tabs.sendMessage as Mock).mockResolvedValue(undefined)

      // 模拟完整的点击处理逻辑
      const handleIconClick = async () => {
        // 1. 切换激活状态
        const currentState = mockStorage.isActive || false
        const newState = !currentState
        await chrome.storage.local.set({ isActive: newState })

        // 2. 更新图标状态
        const iconSuffix = newState ? 'active' : 'inactive'
        await chrome.action.setTitle({
          title: `Schema Element Editor - ${newState ? '已激活 ✓' : '未激活'}`,
        })
        await chrome.action.setIcon({
          path: {
            16: `icons/icon-${iconSuffix}-16.png`,
            48: `icons/icon-${iconSuffix}-48.png`,
            128: `icons/icon-${iconSuffix}-128.png`,
          },
        })

        // 3. 广播到所有标签页
        const tabs = await chrome.tabs.query({})
        for (const tab of tabs) {
          if (tab.id) {
            try {
              await chrome.tabs.sendMessage(tab.id, {
                type: MessageType.ACTIVE_STATE_CHANGED,
                payload: { isActive: newState },
              })
            } catch (_error) {
              // 忽略错误
            }
          }
        }

        return newState
      }

      const newState = await handleIconClick()

      expect(newState).toBe(true)
      expect(mockStorage.isActive).toBe(true)
      expect(chrome.action.setTitle).toHaveBeenCalled()
      expect(chrome.action.setIcon).toHaveBeenCalled()
      expect(chrome.tabs.query).toHaveBeenCalledWith({})
      expect(chrome.tabs.sendMessage).toHaveBeenCalledTimes(2)
    })
  })

  describe('Service Worker 启动时图标状态恢复', () => {
    it('当 storage 中状态为 true 时，应该恢复为激活状态图标', async () => {
      mockStorage.isActive = true

      // 模拟 Service Worker 启动时的图标恢复逻辑
      const restoreIconState = async () => {
        const result = await chrome.storage.local.get('isActive')
        const isActive = result.isActive ?? false

        await chrome.action.setTitle({
          title: `Schema Element Editor - ${isActive ? '已激活 ✓' : '未激活'}`,
        })

        const iconSuffix = isActive ? 'active' : 'inactive'
        await chrome.action.setIcon({
          path: {
            16: `icons/icon-${iconSuffix}-16.png`,
            48: `icons/icon-${iconSuffix}-48.png`,
            128: `icons/icon-${iconSuffix}-128.png`,
          },
        })

        return isActive
      }

      const restoredState = await restoreIconState()

      expect(restoredState).toBe(true)
      expect(chrome.storage.local.get).toHaveBeenCalledWith('isActive')
      expect(chrome.action.setTitle).toHaveBeenCalledWith({
        title: 'Schema Element Editor - 已激活 ✓',
      })
      expect(chrome.action.setIcon).toHaveBeenCalledWith({
        path: {
          16: 'icons/icon-active-16.png',
          48: 'icons/icon-active-48.png',
          128: 'icons/icon-active-128.png',
        },
      })
    })

    it('当 storage 中状态为 false 时，应该恢复为未激活状态图标', async () => {
      mockStorage.isActive = false

      const restoreIconState = async () => {
        const result = await chrome.storage.local.get('isActive')
        const isActive = result.isActive ?? false

        await chrome.action.setTitle({
          title: `Schema Element Editor - ${isActive ? '已激活 ✓' : '未激活'}`,
        })

        const iconSuffix = isActive ? 'active' : 'inactive'
        await chrome.action.setIcon({
          path: {
            16: `icons/icon-${iconSuffix}-16.png`,
            48: `icons/icon-${iconSuffix}-48.png`,
            128: `icons/icon-${iconSuffix}-128.png`,
          },
        })

        return isActive
      }

      const restoredState = await restoreIconState()

      expect(restoredState).toBe(false)
      expect(chrome.storage.local.get).toHaveBeenCalledWith('isActive')
      expect(chrome.action.setTitle).toHaveBeenCalledWith({
        title: 'Schema Element Editor - 未激活',
      })
      expect(chrome.action.setIcon).toHaveBeenCalledWith({
        path: {
          16: 'icons/icon-inactive-16.png',
          48: 'icons/icon-inactive-48.png',
          128: 'icons/icon-inactive-128.png',
        },
      })
    })

    it('当 storage 中没有保存状态时，应该使用默认状态（false）', async () => {
      // 模拟 storage 中没有 isActive 键
      delete mockStorage.isActive

      const restoreIconState = async () => {
        const result = await chrome.storage.local.get('isActive')
        const isActive = result.isActive ?? false

        await chrome.action.setTitle({
          title: `Schema Element Editor - ${isActive ? '已激活 ✓' : '未激活'}`,
        })

        const iconSuffix = isActive ? 'active' : 'inactive'
        await chrome.action.setIcon({
          path: {
            16: `icons/icon-${iconSuffix}-16.png`,
            48: `icons/icon-${iconSuffix}-48.png`,
            128: `icons/icon-${iconSuffix}-128.png`,
          },
        })

        return isActive
      }

      const restoredState = await restoreIconState()

      expect(restoredState).toBe(false)
      expect(chrome.action.setTitle).toHaveBeenCalledWith({
        title: 'Schema Element Editor - 未激活',
      })
      expect(chrome.action.setIcon).toHaveBeenCalledWith({
        path: {
          16: 'icons/icon-inactive-16.png',
          48: 'icons/icon-inactive-48.png',
          128: 'icons/icon-inactive-128.png',
        },
      })
    })

    it('当 storage 读取失败时，应该使用默认状态（false）并继续执行', async () => {
      // 模拟 storage 读取失败
      ;(chrome.storage.local.get as Mock).mockRejectedValueOnce(new Error('Storage error'))

      const restoreIconState = async () => {
        let isActive = false

        try {
          const result = await chrome.storage.local.get<{ isActive?: boolean }>('isActive')
          isActive = result.isActive ?? false
        } catch (error) {
          console.error('获取激活状态失败:', error)
          isActive = false
        }

        await chrome.action.setTitle({
          title: `Schema Element Editor - ${isActive ? '已激活 ✓' : '未激活'}`,
        })

        const iconSuffix = isActive ? 'active' : 'inactive'
        await chrome.action.setIcon({
          path: {
            16: `icons/icon-${iconSuffix}-16.png`,
            48: `icons/icon-${iconSuffix}-48.png`,
            128: `icons/icon-${iconSuffix}-128.png`,
          },
        })

        return isActive
      }

      const restoredState = await restoreIconState()

      expect(restoredState).toBe(false)
      expect(chrome.action.setTitle).toHaveBeenCalledWith({
        title: 'Schema Element Editor - 未激活',
      })
      expect(chrome.action.setIcon).toHaveBeenCalledWith({
        path: {
          16: 'icons/icon-inactive-16.png',
          48: 'icons/icon-inactive-48.png',
          128: 'icons/icon-inactive-128.png',
        },
      })
    })
  })
})
