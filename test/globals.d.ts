/**
 * 测试环境全局类型声明
 * 为Jest测试环境提供Chrome API的类型支持
 */

declare global {
  /**
   * Chrome扩展API的全局对象
   * 在测试环境中通过test/setup.ts mock实现
   */
  const chrome: typeof chrome
}

export {}
