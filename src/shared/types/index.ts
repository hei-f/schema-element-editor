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
  CONFIG_SYNC = 'CONFIG_SYNC',
  /** 渲染预览 */
  RENDER_PREVIEW = 'RENDER_PREVIEW',
  /** 清除预览 */
  CLEAR_PREVIEW = 'CLEAR_PREVIEW',
  /** 隐藏预览（拖拽时） */
  HIDE_PREVIEW = 'HIDE_PREVIEW',
  /** 显示预览（拖拽结束） */
  SHOW_PREVIEW = 'SHOW_PREVIEW',
  /** 检查预览函数是否存在 */
  CHECK_PREVIEW_FUNCTION = 'CHECK_PREVIEW_FUNCTION',
  /** 预览函数检查结果 */
  PREVIEW_FUNCTION_RESULT = 'PREVIEW_FUNCTION_RESULT',
}

/**
 * 编辑器内容类型枚举
 */
export enum ContentType {
  /** AST结构 (Elements[]) */
  Ast = 'ast',
  /** 原始字符串 */
  RawString = 'rawString',
  /** 其他类型 */
  Other = 'other'
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
  /** 是否限制向上搜索层级（false表示搜索到根元素） */
  limitUpwardSearch: boolean
  /** 向上搜索深度（仅在limitUpwardSearch为true时生效） */
  searchDepthUp: number
  /** 节流间隔(ms) */
  throttleInterval: number
}

/**
 * 工具栏按钮配置接口
 */
export interface ToolbarButtonsConfig {
  /** AST/RawString切换按钮 */
  astRawStringToggle: boolean
  /** 反序列化按钮 */
  deserialize: boolean
  /** 序列化按钮 */
  serialize: boolean
  /** 格式化按钮 */
  format: boolean
  /** 预览按钮 */
  preview: boolean
  /** 导入导出按钮 */
  importExport: boolean
}

/**
 * 预览配置接口
 */
export interface PreviewConfig {
  /** 预览区域宽度（百分比，10-60） */
  previewWidth: number
  /** 更新延迟（毫秒，100-2000） */
  updateDelay: number
  /** 是否自动更新预览 */
  autoUpdate: boolean
}

/**
 * 高亮所有元素配置接口
 */
export interface HighlightAllConfig {
  /** 是否启用功能 */
  enabled: boolean
  /** 快捷键字符（单个小写字母，配合 Alt 使用） */
  keyBinding: string
  /** 最大高亮元素数量 */
  maxHighlightCount: number
}

/**
 * 导出配置接口
 */
export interface ExportConfig {
  /** 导出时是否自定义文件名 */
  customFileName: boolean
}

/**
 * 编辑器主题类型
 */
export type EditorTheme = 'light' | 'dark' | 'schemaEditorDark'

/**
 * 存储数据接口
 */
export interface StorageData {
  /** 插件是否激活 */
  isActive: boolean
  /** 抽屉宽度（支持px和%单位） */
  drawerWidth: string | number
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
  /** 工具栏按钮配置 */
  toolbarButtons: ToolbarButtonsConfig
  /** 高亮框颜色 */
  highlightColor: string
  /** 最大收藏数量 */
  maxFavoritesCount: number
  /** 草稿保留天数 */
  draftRetentionDays: number
  /** 草稿自动保存开关 */
  autoSaveDraft: boolean
  /** 草稿自动保存防抖时间（毫秒） */
  draftAutoSaveDebounce: number
  /** 预览配置 */
  previewConfig: PreviewConfig
  /** 历史记录上限 */
  maxHistoryCount: number
  /** 高亮所有元素配置 */
  highlightAllConfig: HighlightAllConfig
  /** 启用 AST 类型提示 */
  enableAstTypeHints: boolean
  /** 导出配置 */
  exportConfig: ExportConfig
  /** 编辑器主题 */
  editorTheme: EditorTheme
  /** 预览函数名 */
  previewFunctionName: string
}

/**
 * 草稿数据接口
 */
export interface Draft {
  /** 草稿内容 */
  content: string
  /** 保存时间戳 */
  timestamp: number
}

/**
 * 收藏数据接口
 */
export interface Favorite {
  /** 唯一标识符 */
  id: string
  /** 收藏名称 */
  name: string
  /** 收藏内容 */
  content: string
  /** 保存时间戳 */
  timestamp: number
  /** 最后使用时间（用于LRU算法） */
  lastUsedTime: number
}

/**
 * 历史记录条目类型枚举
 */
export enum HistoryEntryType {
  /** 📄 初始加载 */
  Initial = 'initial',
  /** ✏️ 自动记录 */
  AutoSave = 'auto',
  /** 💾 保存版本 */
  Save = 'save',
  /** 📝 加载草稿 */
  Draft = 'draft',
  /** ⭐ 应用收藏 */
  Favorite = 'favorite',
  /** 🔄 手动记录 */
  Manual = 'manual'
}

/**
 * 历史记录条目接口
 */
export interface HistoryEntry {
  /** 唯一ID（时间戳字符串） */
  id: string
  /** 编辑器内容 */
  content: string
  /** 时间戳（毫秒） */
  timestamp: number
  /** 版本类型 */
  type: HistoryEntryType
  /** 自定义描述（可选） */
  description?: string
}

/**
 * sessionStorage 存储的历史数据结构
 */
export interface EditHistoryStorage {
  /** 普通历史列表（受限制） */
  entries: HistoryEntry[]
  /** 特殊版本（不计入限制） */
  specialEntries: HistoryEntry[]
  /** 当前版本索引（在合并列表中） */
  currentIndex: number
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
  /** 预览函数名 */
  previewFunctionName: string
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
 * 预览位置信息
 */
export interface PreviewPosition {
  left: number
  top: number
  width: number
  height: number
}

/**
 * 渲染预览载荷
 */
export interface RenderPreviewPayload {
  /** 预览数据 */
  data: any
  /** 预览位置 */
  position: PreviewPosition
}

/**
 * 预览函数检查结果载荷
 */
export interface PreviewFunctionResultPayload {
  /** 预览函数是否存在 */
  exists: boolean
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
 * 预览函数类型
 * @param data - 预览数据
 * @returns React 节点
 */
export type PreviewFunction = (data: any) => React.ReactNode

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
    /** 预览内容函数 */
    __getContentPreview?: PreviewFunction
    /** 支持自定义函数名的索引签名 */
    [key: string]: GetSchemaFunction | UpdateSchemaFunction | PreviewFunction | any
  }
}

