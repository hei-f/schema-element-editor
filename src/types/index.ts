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
  ACTIVE_STATE_CHANGED = 'ACTIVE_STATE_CHANGED',
  /** 配置同步 */
  CONFIG_SYNC = 'CONFIG_SYNC'
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
  /** 字符串自动解析为 Markdown Elements */
  autoParseString: boolean
  /** 启用调试日志 */
  enableDebugLog: boolean
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
 * 配置同步载荷
 */
export interface ConfigSyncPayload {
  /** 获取Schema的函数名 */
  getFunctionName: string
  /** 更新Schema的函数名 */
  updateFunctionName: string
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
 * 获取Schema的函数类型
 * @template T Schema数据类型，不能是 null 或 undefined
 */
export type GetSchemaFunction<T = unknown> = (params: string) => NonNullable<T>

/**
 * 更新Schema的函数类型
 * @template T Schema数据类型，不能是 null 或 undefined
 */
export type UpdateSchemaFunction<T = unknown> = (schema: NonNullable<T>, params: string) => boolean

/**
 * 扩展window对象，添加页面提供的方法
 * 注意：实际函数名可通过配置自定义
 */
declare global {
  interface Window {
    /** 默认的获取Schema函数 */
    __getSchemaByParams?: GetSchemaFunction
    /** 默认的更新Schema函数 */
    __updateSchemaByParams?: UpdateSchemaFunction
    /** 支持自定义函数名的索引签名 */
    [key: string]: GetSchemaFunction | UpdateSchemaFunction | any
  }
}

