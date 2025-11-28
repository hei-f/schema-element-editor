import { storage } from './browser/storage'

/**
 * 日志工具类
 * 根据配置决定是否输出调试日志
 */
class Logger {
  private enabled: boolean = false
  private initialized: boolean = false

  /**
   * 初始化日志配置
   */
  async init(): Promise<void> {
    if (this.initialized) return

    try {
      this.enabled = await storage.getEnableDebugLog()
      this.initialized = true
    } catch (_error) {
      // 初始化失败时默认不输出日志
      this.enabled = false
      this.initialized = true
    }
  }

  /**
   * 输出普通日志
   */
  log(...args: any[]): void {
    if (this.enabled) {
      console.log(...args)
    }
  }

  /**
   * 输出警告日志
   */
  warn(...args: any[]): void {
    if (this.enabled) {
      console.warn(...args)
    }
  }

  /**
   * 输出信息日志
   */
  info(...args: any[]): void {
    if (this.enabled) {
      console.info(...args)
    }
  }

  /**
   * 错误日志始终输出
   */
  error(...args: any[]): void {
    console.error(...args)
  }
}

export const logger = new Logger()

// 自动初始化
logger.init()
