/**
 * Logger 测试
 * 注意：logger在导入时就会自动初始化，所以这些测试主要验证行为
 */

import { logger } from '../logger'
import { storage } from '../browser/storage'
import type { Mock } from 'vitest'

// Mock storage
vi.mock('../browser/storage', () => ({
  storage: {
    getEnableDebugLog: vi.fn(),
  },
}))

describe('Logger工具测试', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeAll(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  beforeEach(() => {
    consoleLogSpy.mockClear()
    consoleWarnSpy.mockClear()
    consoleInfoSpy.mockClear()
    consoleErrorSpy.mockClear()
  })

  afterAll(() => {
    consoleLogSpy.mockRestore()
    consoleWarnSpy.mockRestore()
    consoleInfoSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  describe('基本功能', () => {
    // 由于logger默认是禁用状态，这些测试验证禁用行为
    it('默认状态下log不应输出', () => {
      logger.log('test')
      expect(consoleLogSpy).not.toHaveBeenCalled()
    })

    it('默认状态下warn不应输出', () => {
      logger.warn('warning')
      expect(consoleWarnSpy).not.toHaveBeenCalled()
    })

    it('默认状态下info不应输出', () => {
      logger.info('info')
      expect(consoleInfoSpy).not.toHaveBeenCalled()
    })

    it('应该支持多个参数', () => {
      logger.log('test', 123, { data: 'value' })
      // 由于默认禁用，不应有输出
      expect(consoleLogSpy).not.toHaveBeenCalled()
    })
  })

  describe('error方法', () => {
    it('error应该始终输出（不受启用状态影响）', () => {
      logger.error('error message', 'details')

      expect(consoleErrorSpy).toHaveBeenCalledWith('error message', 'details')
    })

    it('应该支持多个参数', () => {
      const error = new Error('test error')

      logger.error('Error occurred:', error, { code: 500 })

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error occurred:', error, { code: 500 })
    })

    it('应该支持无参数调用', () => {
      logger.error()
      expect(consoleErrorSpy).toHaveBeenCalledWith()
    })

    it('应该支持各种类型的参数', () => {
      logger.error('Error:', null, undefined, true, false, 0, '', [1, 2], { a: 1 })
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error:',
        null,
        undefined,
        true,
        false,
        0,
        '',
        [1, 2],
        { a: 1 }
      )
    })
  })

  describe('初始化', () => {
    it('init应该是一个异步方法', () => {
      const result = logger.init()
      expect(result).toBeInstanceOf(Promise)
    })

    it('init应该可以被调用多次而不报错', async () => {
      ;(storage.getEnableDebugLog as Mock).mockResolvedValue(false)

      await expect(logger.init()).resolves.not.toThrow()
      await expect(logger.init()).resolves.not.toThrow()
      await expect(logger.init()).resolves.not.toThrow()
    })

    it('init成功后应该设置启用状态', async () => {
      // 创建一个新的Logger实例用于测试（通过重新导入）
      vi.resetModules()

      // 重新 mock storage 模块
      vi.doMock('../browser/storage', () => ({
        storage: {
          getEnableDebugLog: vi.fn().mockResolvedValue(true),
        },
      }))

      const { logger: freshLogger } = await import('../logger')
      await freshLogger.init()

      // 清空之前的调用记录
      consoleLogSpy.mockClear()

      // 现在日志应该输出
      freshLogger.log('test enabled')
      expect(consoleLogSpy).toHaveBeenCalledWith('test enabled')
    })

    it('init失败时应该默认禁用日志', async () => {
      vi.resetModules()

      // 重新 mock storage 模块，模拟失败情况
      vi.doMock('../browser/storage', () => ({
        storage: {
          getEnableDebugLog: vi.fn().mockRejectedValue(new Error('Storage error')),
        },
      }))

      const { logger: freshLogger } = await import('../logger')
      await freshLogger.init()

      consoleLogSpy.mockClear()

      // 日志不应该输出
      freshLogger.log('test disabled')
      expect(consoleLogSpy).not.toHaveBeenCalled()
    })
  })

  describe('方法存在性', () => {
    it('应该导出log方法', () => {
      expect(typeof logger.log).toBe('function')
    })

    it('应该导出warn方法', () => {
      expect(typeof logger.warn).toBe('function')
    })

    it('应该导出info方法', () => {
      expect(typeof logger.info).toBe('function')
    })

    it('应该导出error方法', () => {
      expect(typeof logger.error).toBe('function')
    })

    it('应该导出init方法', () => {
      expect(typeof logger.init).toBe('function')
    })
  })

  describe('边界情况', () => {
    it('log应该处理非常长的参数', () => {
      const longString = 'a'.repeat(10000)
      logger.log(longString)
      expect(consoleLogSpy).not.toHaveBeenCalled() // 默认禁用
    })

    it('warn应该处理大量参数', () => {
      const args = Array.from({ length: 100 }, (_, i) => `arg${i}`)
      logger.warn(...args)
      expect(consoleWarnSpy).not.toHaveBeenCalled() // 默认禁用
    })

    it('info应该处理特殊字符', () => {
      logger.info('特殊字符: \n\r\t\'"\\', '🎉', '👍')
      expect(consoleInfoSpy).not.toHaveBeenCalled() // 默认禁用
    })

    it('error应该处理非常长的错误信息', () => {
      const longError = 'error '.repeat(1000)
      logger.error(longError)
      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    it('所有方法都应该处理undefined和null', () => {
      logger.log(null, undefined)
      logger.warn(null, undefined)
      logger.info(null, undefined)
      logger.error(null, undefined)

      // error始终输出
      expect(consoleErrorSpy).toHaveBeenCalledWith(null, undefined)
      // 其他方法默认不输出
      expect(consoleLogSpy).not.toHaveBeenCalled()
      expect(consoleWarnSpy).not.toHaveBeenCalled()
      expect(consoleInfoSpy).not.toHaveBeenCalled()
    })
  })

  describe('启用状态测试', () => {
    it('启用状态下log应该输出', async () => {
      vi.resetModules()

      // 重新 mock storage 模块
      vi.doMock('../browser/storage', () => ({
        storage: {
          getEnableDebugLog: vi.fn().mockResolvedValue(true),
        },
      }))

      const { logger: enabledLogger } = await import('../logger')
      await enabledLogger.init()

      consoleLogSpy.mockClear()
      enabledLogger.log('enabled log')

      expect(consoleLogSpy).toHaveBeenCalledWith('enabled log')
    })

    it('启用状态下warn应该输出', async () => {
      vi.resetModules()

      // 重新 mock storage 模块
      vi.doMock('../browser/storage', () => ({
        storage: {
          getEnableDebugLog: vi.fn().mockResolvedValue(true),
        },
      }))

      const { logger: enabledLogger } = await import('../logger')
      await enabledLogger.init()

      consoleWarnSpy.mockClear()
      enabledLogger.warn('enabled warn')

      expect(consoleWarnSpy).toHaveBeenCalledWith('enabled warn')
    })

    it('启用状态下info应该输出', async () => {
      vi.resetModules()

      // 重新 mock storage 模块
      vi.doMock('../browser/storage', () => ({
        storage: {
          getEnableDebugLog: vi.fn().mockResolvedValue(true),
        },
      }))

      const { logger: enabledLogger } = await import('../logger')
      await enabledLogger.init()

      consoleInfoSpy.mockClear()
      enabledLogger.info('enabled info')

      expect(consoleInfoSpy).toHaveBeenCalledWith('enabled info')
    })
  })
})
