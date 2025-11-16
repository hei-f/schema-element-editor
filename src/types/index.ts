/**
 * 消息类型枚举
 */
export enum MessageType {
  /** 切换激活状态 */
  TOGGLE_ACTIVE = 'TOGGLE_ACTIVE',
  /** 获取Schema数据 */
  GET_SCHEMA = 'GET_SCHEMA',
  /** 更新Schema数据 */
  UPDATE_SCHEMA = 'UPDATE_SCHEMA',
  /** Schema响应 */
  SCHEMA_RESPONSE = 'SCHEMA_RESPONSE',
  /** 更新结果 */
  UPDATE_RESULT = 'UPDATE_RESULT',
  /** 元素点击事件 */
  ELEMENT_CLICKED = 'ELEMENT_CLICKED',
  /** 激活状态变更 */
  ACTIVE_STATE_CHANGED = 'ACTIVE_STATE_CHANGED'
}

/**
 * 元素属性接口
 * 使用配置的data属性提取参数数组
 */
export interface ElementAttributes {
  params: string[]
}

/**
 * 搜索配置接口
 */
export interface SearchConfig {
  /** 向下搜索深度 */
  searchDepthDown: number
  /** 向上搜索深度 */
  searchDepthUp: number
  /** 节流间隔(ms) */
  throttleInterval: number
}

/**
 * 存储数据接口
 */
export interface StorageData {
  /** 插件是否激活 */
  isActive: boolean
  /** 抽屉宽度 */
  drawerWidth: number
  /** 配置的属性名 */
  attributeName: string
  /** 搜索配置 */
  searchConfig: SearchConfig
  /** 获取Schema的函数名 */
  getFunctionName: string
  /** 更新Schema的函数名 */
  updateFunctionName: string
}

/**
 * 消息接口
 */
export interface Message<T = any> {
  type: MessageType
  payload?: T
}

/**
 * 获取Schema的消息载荷
 */
export interface GetSchemaPayload {
  params: string
}

/**
 * 更新Schema的消息载荷
 */
export interface UpdateSchemaPayload {
  params: string
  schema: any
}

/**
 * Schema响应载荷
 */
export interface SchemaResponsePayload {
  success: boolean
  data?: any
  error?: string
}

/**
 * 更新结果载荷
 */
export interface UpdateResultPayload {
  success: boolean
  message?: string
  error?: string
}

/**
 * 元素位置信息
 */
export interface ElementPosition {
  x: number
  y: number
  width: number
  height: number
}

/**
 * 扩展window对象，添加页面提供的方法
 * 注意：实际函数名可通过配置自定义
 */
declare global {
  interface Window {
    __getSchemaByParams?: (params: string) => any
    __updateSchemaByParams?: (schema: any, params: string) => boolean
    [key: string]: any
  }
}

