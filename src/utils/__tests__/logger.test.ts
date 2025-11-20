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
})

