/**
 * Schema Element Editor Host SDK - Coordinator
 * SDK 协调器，负责管理多个 SDK 实例的优先级协商
 */

import { SDK_COORDINATOR_SOURCE, SDK_COORDINATION_MESSAGE_TYPES } from './constants'
import type {
  SdkCoordinatorConfig,
  SdkRegistrationInfo,
  SdkCoordinationMessage,
  MethodLevelConfig,
} from './types'

/**
 * 生成唯一的 SDK ID
 *
 * 优先使用 Web Crypto API 的 randomUUID()（Chrome 92+, Firefox 95+, Safari 15.4+）
 * 如果不支持则降级到时间戳 + 随机数方案
 */
function generateSdkId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // 降级方案：时间戳 + 随机字符串
  return `sdk-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

/**
 * SDK 协调器
 * 负责管理多个 SDK 实例的协调，决定哪个 SDK 响应请求
 */
export class SdkCoordinator {
  private sdkId: string
  private messageSource: string
  private level: number
  private methodLevels: MethodLevelConfig
  private implementedMethods: string[]

  /**
   * SDK 销毁标志
   *
   * 作用：防止在 cleanup() 执行期间，监听器移除前仍然响应请求
   *
   * 场景：cleanup() 中先调用 destroy()（设置 isDestroyed = true），
   * 然后才移除 handleMessage 监听器。在这个微小的时间窗口内，
   * 如果插件请求到达，没有 isDestroyed 检查会导致已销毁的 SDK 仍然响应。
   */
  private isDestroyed = false

  /**
   * 存储比当前 SDK 优先级更高的其他 SDK ID
   * 按方法分类：如果某个方法的集合不为空，说明有更高优先级的 SDK 应该处理该方法
   *
   * 优化：只为当前 SDK 实现了的方法维护优先级集合
   */
  private higherLevelSDKs: Record<string, Set<string>> = {}

  /**
   * 存储与当前 SDK 优先级相同的其他 SDK ID
   * 按方法分类：用于判断是否需要在执行失败时跳过响应
   *
   * 当有同级竞争者时，SDK在执行失败/无数据时会跳过响应，让其他SDK有机会响应
   */
  private sameLevelSDKs: Record<string, Set<string>> = {}

  constructor(config: SdkCoordinatorConfig) {
    // 生成或使用提供的 SDK ID
    this.sdkId = config.sdkId || generateSdkId()
    this.messageSource = config.messageSource
    this.level = config.level ?? 0
    this.methodLevels = config.methodLevels ?? {}
    this.implementedMethods = config.implementedMethods

    // 只为实现了的方法初始化优先级集合
    this.implementedMethods.forEach((method) => {
      this.higherLevelSDKs[method] = new Set()
      this.sameLevelSDKs[method] = new Set()
    })
  }

  /**
   * 初始化协调器
   */
  init(): void {
    // 注册消息监听器
    window.addEventListener('message', this.handleCoordinationMessage)

    // 查询已存在的 SDK
    this.sendQuery()

    // 广播自己的注册信息
    this.sendRegister()
  }

  /**
   * 销毁协调器
   */
  destroy(): void {
    this.isDestroyed = true

    // 广播注销信息
    this.sendUnregister()

    // 移除监听器
    window.removeEventListener('message', this.handleCoordinationMessage)

    // 清理集合
    Object.values(this.higherLevelSDKs).forEach((set) => set.clear())
    Object.values(this.sameLevelSDKs).forEach((set) => set.clear())
  }

  /**
   * 判断是否应该响应某个方法的请求
   * @param method - 方法名
   * @returns 是否应该响应
   */
  shouldRespond(method: string): boolean {
    if (this.isDestroyed) return false

    // 如果当前 SDK 没有实现该方法，不响应
    if (!this.implementedMethods.includes(method)) {
      return false
    }

    // 检查该方法是否有更高优先级的 SDK
    const higherSDKs = this.higherLevelSDKs[method]
    return !higherSDKs || higherSDKs.size === 0
  }

  /**
   * 判断某个方法是否有相同优先级的竞争者
   * @param method - 方法名
   * @returns 是否存在同级竞争者
   */
  hasSameLevelCompetitors(method: string): boolean {
    const sameSDKs = this.sameLevelSDKs[method]
    return sameSDKs ? sameSDKs.size > 0 : false
  }

  /**
   * 获取方法的优先级
   */
  private getMethodLevel(method: string): number {
    // 优先使用方法级别配置，否则使用默认 level
    return this.methodLevels[method as keyof MethodLevelConfig] ?? this.level
  }

  /**
   * 处理 SDK 协调消息
   */
  private handleCoordinationMessage = (event: MessageEvent): void => {
    // 只处理来自当前窗口或父窗口的消息（支持 iframe）
    const isFromSelf = event.source === window
    const isFromParent = window !== window.top && event.source === window.parent
    if (!isFromSelf && !isFromParent) return

    // 只处理 SDK 协调消息
    const data = event.data as SdkCoordinationMessage
    if (!data || data.source !== SDK_COORDINATOR_SOURCE) return

    switch (data.type) {
      case SDK_COORDINATION_MESSAGE_TYPES.query:
        // 收到查询，重新广播自己的注册信息
        this.sendRegister()
        break

      case SDK_COORDINATION_MESSAGE_TYPES.register:
        this.handleSdkRegister(data.payload as SdkRegistrationInfo)
        break

      case SDK_COORDINATION_MESSAGE_TYPES.unregister:
        this.handleSdkUnregister((data.payload as { sdkId: string }).sdkId)
        break
    }
  }

  /**
   * 处理其他 SDK 的注册
   */
  private handleSdkRegister(info: SdkRegistrationInfo): void {
    // 忽略自己的注册消息
    if (info.sdkId === this.sdkId) return

    // 只处理使用相同 messageSource 的 SDK（避免不同 source 的 SDK 互相干扰）
    if (info.messageSource !== this.messageSource) return

    // 只对比当前 SDK 实现了的方法的优先级
    this.implementedMethods.forEach((method) => {
      // 检查对方是否实现了该方法
      if (!info.implementedMethods.includes(method)) {
        // 对方没实现，无需比较优先级
        return
      }

      const myLevel = this.getMethodLevel(method)
      const otherLevel = info.methodLevels[method as keyof MethodLevelConfig] ?? info.level

      if (otherLevel > myLevel) {
        // 对方优先级更高，加入higherLevelSDKs，从sameLevelSDKs移除
        this.higherLevelSDKs[method].add(info.sdkId)
        this.sameLevelSDKs[method].delete(info.sdkId)
      } else if (otherLevel === myLevel) {
        // 对方优先级相同，加入sameLevelSDKs，从higherLevelSDKs移除
        this.sameLevelSDKs[method].add(info.sdkId)
        this.higherLevelSDKs[method].delete(info.sdkId)
      } else {
        // 对方优先级更低，从两个集合中都移除
        this.higherLevelSDKs[method].delete(info.sdkId)
        this.sameLevelSDKs[method].delete(info.sdkId)
      }
    })
  }

  /**
   * 处理其他 SDK 的注销
   */
  private handleSdkUnregister(sdkId: string): void {
    // 从所有集合中移除该 SDK
    Object.values(this.higherLevelSDKs).forEach((set) => {
      set.delete(sdkId)
    })
    Object.values(this.sameLevelSDKs).forEach((set) => {
      set.delete(sdkId)
    })
  }

  /**
   * 发送查询消息
   */
  private sendQuery(): void {
    const message: SdkCoordinationMessage = {
      source: SDK_COORDINATOR_SOURCE,
      type: SDK_COORDINATION_MESSAGE_TYPES.query,
      payload: { sdkId: this.sdkId },
    }

    this.postCoordinationMessage(message)
  }

  /**
   * 发送注册消息
   */
  private sendRegister(): void {
    const message: SdkCoordinationMessage = {
      source: SDK_COORDINATOR_SOURCE,
      type: SDK_COORDINATION_MESSAGE_TYPES.register,
      payload: {
        sdkId: this.sdkId,
        messageSource: this.messageSource,
        level: this.level,
        methodLevels: this.methodLevels,
        implementedMethods: this.implementedMethods,
      },
    }

    this.postCoordinationMessage(message)
  }

  /**
   * 发送注销消息
   */
  private sendUnregister(): void {
    const message: SdkCoordinationMessage = {
      source: SDK_COORDINATOR_SOURCE,
      type: SDK_COORDINATION_MESSAGE_TYPES.unregister,
      payload: { sdkId: this.sdkId },
    }

    this.postCoordinationMessage(message)
  }

  /**
   * 发送协调消息
   */
  private postCoordinationMessage(message: SdkCoordinationMessage): void {
    // 发送给当前窗口（同一页面的其他 SDK）
    window.postMessage(message, '*')

    // 如果在 iframe 中，也发送给 top frame（跨 iframe 的 SDK）
    if (window.top && window.top !== window) {
      window.top.postMessage(message, '*')
    }
  }
}
