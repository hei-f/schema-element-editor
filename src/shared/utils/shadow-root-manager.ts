/**
 * ShadowRoot 全局管理器
 * 
 * 提供全局访问 shadowRoot 的单例模式
 * shadowRoot 在应用初始化时设置，整个生命周期内保持不变
 */
class ShadowRootManager {
  private static instance: ShadowRoot | null = null

  /**
   * 初始化 shadowRoot
   * 应该在应用启动时调用一次
   */
  static init(shadowRoot: ShadowRoot): void {
    if (this.instance) {
      console.warn('ShadowRoot already initialized, overwriting...')
    }
    this.instance = shadowRoot
  }

  /**
   * 获取 shadowRoot 实例
   * @throws {Error} 如果 shadowRoot 未初始化
   */
  static get(): ShadowRoot {
    if (!this.instance) {
      throw new Error(
        'ShadowRoot not initialized. Call shadowRootManager.init() first.'
      )
    }
    return this.instance
  }

  /**
   * 获取适用于 Ant Design 组件 getContainer 的函数
   * 用于 Modal, Dropdown, Tooltip 等组件
   */
  static getContainer(): HTMLElement {
    return this.get() as unknown as HTMLElement
  }

  /**
   * 重置实例（主要用于测试）
   */
  static reset(): void {
    this.instance = null
  }
}

export const shadowRootManager = ShadowRootManager

