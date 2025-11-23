/**
 * Logger 测试
 * 注意：logger在导入时就会自动初始化，所以这些测试主要验证行为
 */

describe('Logger工具测试', () => {
  let consoleLogSpy: jest.SpyInstance
  let consoleWarnSpy: jest.SpyInstance
  let consoleInfoSpy: jest.SpyInstance
  let consoleErrorSpy: jest.SpyInstance

  beforeAll(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation()
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
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
      const { logger } = require('../logger')
      logger.log('test')
      expect(consoleLogSpy).not.toHaveBeenCalled()
    })

    it('默认状态下warn不应输出', () => {
      const { logger } = require('../logger')
      logger.warn('warning')
      expect(consoleWarnSpy).not.toHaveBeenCalled()
    })

    it('默认状态下info不应输出', () => {
      const { logger } = require('../logger')
      logger.info('info')
      expect(consoleInfoSpy).not.toHaveBeenCalled()
    })

    it('应该支持多个参数', () => {
      const { logger } = require('../logger')
      logger.log('test', 123, { data: 'value' })
      // 由于默认禁用，不应有输出
      expect(consoleLogSpy).not.toHaveBeenCalled()
    })
  })

  describe('error方法', () => {
    it('error应该始终输出（不受启用状态影响）', () => {
      const { logger } = require('../logger')
      logger.error('error message', 'details')
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('error message', 'details')
    })

    it('应该支持多个参数', () => {
      const { logger } = require('../logger')
      const error = new Error('test error')
      
      logger.error('Error occurred:', error, { code: 500 })
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error occurred:',
        error,
        { code: 500 }
      )
    })

    it('应该支持无参数调用', () => {
      const { logger } = require('../logger')
      logger.error()
      expect(consoleErrorSpy).toHaveBeenCalledWith()
    })

    it('应该支持各种类型的参数', () => {
      const { logger } = require('../logger')
      logger.error('Error:', null, undefined, true, false, 0, '', [1, 2], { a: 1 })
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error:', null, undefined, true, false, 0, '', [1, 2], { a: 1 }
      )
    })
  })

  describe('初始化', () => {
    it('init应该是一个异步方法', () => {
      const { logger } = require('../logger')
      const result = logger.init()
      expect(result).toBeInstanceOf(Promise)
    })

    it('init应该可以被调用多次而不报错', async () => {
      const { logger } = require('../logger')
      await expect(logger.init()).resolves.not.toThrow()
      await expect(logger.init()).resolves.not.toThrow()
      await expect(logger.init()).resolves.not.toThrow()
    })
  })

  describe('方法存在性', () => {
    it('应该导出log方法', () => {
      const { logger } = require('../logger')
      expect(typeof logger.log).toBe('function')
    })

    it('应该导出warn方法', () => {
      const { logger } = require('../logger')
      expect(typeof logger.warn).toBe('function')
    })

    it('应该导出info方法', () => {
      const { logger } = require('../logger')
      expect(typeof logger.info).toBe('function')
    })

    it('应该导出error方法', () => {
      const { logger } = require('../logger')
      expect(typeof logger.error).toBe('function')
    })

    it('应该导出init方法', () => {
      const { logger } = require('../logger')
      expect(typeof logger.init).toBe('function')
    })
  })

  describe('边界情况', () => {
    it('log应该处理非常长的参数', () => {
      const { logger } = require('../logger')
      const longString = 'a'.repeat(10000)
      logger.log(longString)
      expect(consoleLogSpy).not.toHaveBeenCalled() // 默认禁用
    })

    it('warn应该处理大量参数', () => {
      const { logger } = require('../logger')
      const args = Array.from({ length: 100 }, (_, i) => `arg${i}`)
      logger.warn(...args)
      expect(consoleWarnSpy).not.toHaveBeenCalled() // 默认禁用
    })

    it('info应该处理特殊字符', () => {
      const { logger } = require('../logger')
      logger.info('特殊字符: \n\r\t\'\"\\', '🎉', '👍')
      expect(consoleInfoSpy).not.toHaveBeenCalled() // 默认禁用
    })

    it('error应该处理非常长的错误信息', () => {
      const { logger } = require('../logger')
      const longError = 'error '.repeat(1000)
      logger.error(longError)
      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    it('所有方法都应该处理undefined和null', () => {
      const { logger } = require('../logger')
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
})



