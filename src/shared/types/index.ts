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
  /** Ping 检测 Content Script 是否存活 */
  PING = 'PING',
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
  Other = 'other',
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
  /** 转义/去转义按钮 */
  escape: boolean
  /** 解析按钮（原反序列化） */
  deserialize: boolean
  /** 压缩按钮（原序列化） */
  serialize: boolean
  /** 格式化按钮 */
  format: boolean
  /** 预览按钮 */
  preview: boolean
  /** 导入导出按钮 */
  importExport: boolean
  /** 草稿功能 */
  draft: boolean
  /** 收藏功能 */
  favorites: boolean
  /** 历史记录功能 */
  history: boolean
}

/**
 * z-index 配置接口
 */
export interface ZIndexConfig {
  /** 默认状态 z-index */
  default: number
  /** 预览模式 z-index */
  preview: number
}

/**
 * 预览配置接口
 */
export interface PreviewConfig {
  /** 预览区域宽度（百分比，20-80） */
  previewWidth: number
  /** 更新延迟（毫秒，100-2000） */
  updateDelay: number
  /** 是否自动更新预览 */
  autoUpdate: boolean
  /** z-index 配置 */
  zIndex: ZIndexConfig
  /** 是否启用内置预览器（当宿主未提供预览函数时使用） */
  enableBuiltinPreview: boolean
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
 * 录制模式配置接口
 */
export interface RecordingModeConfig {
  /** 是否启用功能 */
  enabled: boolean
  /** 快捷键字符（单个小写字母，配合 Alt 使用） */
  keyBinding: string
  /** 录制模式下的高亮颜色 */
  highlightColor: string
  /** 轮询间隔（毫秒） */
  pollingInterval: number
  /** 自动停止录制的超时时间（秒），null 表示禁用 */
  autoStopTimeout: number | null
}

/**
 * iframe 内元素的 Schema 数据来源
 * - iframe: 向 iframe 内的 window 发送 postMessage（默认）
 * - topFrame: 向 top frame 的 window 发送 postMessage
 */
export type IframeSchemaTarget = 'iframe' | 'topFrame'

/**
 * iframe 支持配置接口
 */
export interface IframeConfig {
  /** 是否启用 iframe 内元素检测 */
  enabled: boolean
  /** iframe 内元素的 Schema 数据来源 */
  schemaTarget: IframeSchemaTarget
}

/**
 * 通信模式类型
 * - postMessage: 使用 postMessage 直连通信（推荐）
 * - windowFunction: 使用 window 函数调用（已废弃）
 */
export type CommunicationMode = 'postMessage' | 'windowFunction'

/**
 * postMessage 模式的消息标识配置
 */
export interface PostMessageSourceConfig {
  /** 插件端发送消息的 source 标识 */
  contentSource: string
  /** 宿主端响应消息的 source 标识 */
  hostSource: string
}

/**
 * postMessage 模式的消息类型名称配置
 */
export interface PostMessageTypeConfig {
  /** 获取 Schema 的消息类型 */
  getSchema: string
  /** 更新 Schema 的消息类型 */
  updateSchema: string
  /** 检查预览函数是否存在的消息类型 */
  checkPreview: string
  /** 渲染预览的消息类型 */
  renderPreview: string
  /** 清理预览的消息类型 */
  cleanupPreview: string
}

/**
 * API 配置接口
 */
export interface ApiConfig {
  /** 通信模式 */
  communicationMode: CommunicationMode
  /** 请求超时时间（秒，1-30） */
  requestTimeout: number
  /** postMessage 模式的消息标识配置 */
  sourceConfig: PostMessageSourceConfig
  /** postMessage 模式的消息类型名称配置 */
  messageTypes: PostMessageTypeConfig
}

/**
 * Schema快照接口
 */
export interface SchemaSnapshot {
  /** 快照ID（递增序号） */
  id: number
  /** Schema内容（字符串） */
  content: string
  /** 相对于首次轮询的时间（毫秒） */
  timestamp: number
}

/**
 * 导出配置接口
 */
export interface ExportConfig {
  /** 导出时是否自定义文件名 */
  customFileName: boolean
}

/**
 * 单个快捷键定义
 */
export interface ShortcutKey {
  /** 按键（单个字母或特殊键如 Enter, Escape） */
  key: string
  /** 是否需要 Ctrl/Cmd 键 */
  ctrlOrCmd: boolean
  /** 是否需要 Shift 键 */
  shift: boolean
  /** 是否需要 Alt/Option 键 */
  alt: boolean
}

/**
 * 抽屉快捷键配置接口
 */
export interface DrawerShortcutsConfig {
  /** 保存快捷键 */
  save: ShortcutKey
  /** 格式化快捷键 */
  format: ShortcutKey
  /** 打开/更新预览快捷键 */
  openOrUpdatePreview: ShortcutKey
  /** 关闭预览快捷键 */
  closePreview: ShortcutKey
}

/**
 * 编辑器主题类型
 */
export type EditorTheme = 'light' | 'dark' | 'schemaEditorDark'

/**
 * SchemaDrawer 组件配置
 * 所有配置统一放在此对象中，由父组件加载后传入
 */
export interface SchemaDrawerConfig {
  /** API 配置 */
  apiConfig: ApiConfig
  /** 工具栏按钮配置 */
  toolbarButtons: ToolbarButtonsConfig
  /** 自动保存草稿开关 */
  autoSaveDraft: boolean
  /** 预览配置 */
  previewConfig: PreviewConfig
  /** 历史记录上限 */
  maxHistoryCount: number
  /** AST 类型提示开关 */
  enableAstTypeHints: boolean
  /** 导出配置 */
  exportConfig: ExportConfig
  /** 编辑器主题 */
  editorTheme: EditorTheme
  /** 录制模式配置 */
  recordingModeConfig: RecordingModeConfig
  /** 自动解析字符串开关 */
  autoParseString: boolean
  /** 主题色 */
  themeColor: string
}

/**
 * SchemaDrawer 运行时配置
 * 包含 SchemaDrawerConfig 加上快捷键配置
 */
export interface SchemaDrawerRuntimeConfig extends SchemaDrawerConfig {
  /** 抽屉快捷键配置 */
  drawerShortcuts: DrawerShortcutsConfig
}

/**
 * 存储数据接口
 */
export interface StorageData {
  /** 插件是否激活 */
  isActive: boolean
  /** 抽屉宽度（支持px和%单位） */
  drawerWidth: string
  /** 配置的属性名 */
  attributeName: string
  /** 搜索配置 */
  searchConfig: SearchConfig
  /**
   * 获取Schema的函数名
   * @deprecated 请使用 apiConfig.communicationMode = 'customEvent' 模式
   */
  getFunctionName: string
  /**
   * 更新Schema的函数名
   * @deprecated 请使用 apiConfig.communicationMode = 'customEvent' 模式
   */
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
  /** 录制模式配置 */
  recordingModeConfig: RecordingModeConfig
  /** iframe 支持配置 */
  iframeConfig: IframeConfig
  /** 启用 AST 类型提示 */
  enableAstTypeHints: boolean
  /** 导出配置 */
  exportConfig: ExportConfig
  /** 编辑器主题 */
  editorTheme: EditorTheme
  /**
   * 预览函数名
   * @deprecated 请使用 apiConfig.communicationMode = 'customEvent' 模式
   */
  previewFunctionName: string
  /** API 配置 */
  apiConfig: ApiConfig
  /** 抽屉快捷键配置 */
  drawerShortcuts: DrawerShortcutsConfig
  /** 主题色 */
  themeColor: string
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
  Manual = 'manual',
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
 * 配置同步载荷（仅 windowFunction 模式使用）
 */
export interface ConfigSyncPayload {
  /**
   * 获取Schema的函数名
   * @deprecated 仅 windowFunction 模式使用
   */
  getFunctionName: string
  /**
   * 更新Schema的函数名
   * @deprecated 仅 windowFunction 模式使用
   */
  updateFunctionName: string
  /**
   * 预览函数名
   * @deprecated 仅 windowFunction 模式使用
   */
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
 * iframe 元素的位置信息（相对于 top frame 视口）
 */
export interface IframeElementRect {
  left: number
  top: number
  width: number
  height: number
}

/**
 * 跨 frame 消息类型
 */
export enum IframeBridgeMessageType {
  /** iframe 内检测到元素悬停 */
  ELEMENT_HOVER = 'IFRAME_ELEMENT_HOVER',
  /** iframe 内元素点击 */
  ELEMENT_CLICK = 'IFRAME_ELEMENT_CLICK',
  /** 清除 iframe 元素高亮 */
  CLEAR_HIGHLIGHT = 'IFRAME_CLEAR_HIGHLIGHT',
  /** iframe 内高亮所有元素请求 */
  HIGHLIGHT_ALL_REQUEST = 'IFRAME_HIGHLIGHT_ALL_REQUEST',
  /** iframe 内高亮所有元素响应 */
  HIGHLIGHT_ALL_RESPONSE = 'IFRAME_HIGHLIGHT_ALL_RESPONSE',
  /** 跨域 iframe 检测到 */
  CROSS_ORIGIN_DETECTED = 'IFRAME_CROSS_ORIGIN_DETECTED',
  /** 同步 Alt 键状态到 iframe */
  SYNC_ALT_KEY = 'IFRAME_SYNC_ALT_KEY',
}

/**
 * iframe 元素悬停消息载荷
 */
export interface IframeElementHoverPayload {
  /** 元素相对于 top frame 视口的位置 */
  rect: IframeElementRect
  /** 元素属性 */
  attrs: ElementAttributes
  /** 是否为有效元素 */
  isValid: boolean
  /** 鼠标位置（用于定位 tooltip） */
  mousePosition: { x: number; y: number }
  /** 是否处于录制模式 */
  isRecordingMode: boolean
}

/**
 * iframe 元素点击消息载荷
 */
export interface IframeElementClickPayload {
  /** 元素属性 */
  attrs: ElementAttributes
  /** 是否处于录制模式 */
  isRecordingMode: boolean
  /** iframe 的 origin */
  iframeOrigin: string
}

/**
 * iframe 高亮所有元素响应载荷
 */
export interface IframeHighlightAllResponsePayload {
  /** 所有元素的信息 */
  elements: Array<{
    rect: IframeElementRect
    params: string[]
  }>
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
 * Schema 数据类型
 * 支持所有 JSON.parse 可返回的类型
 */
export type SchemaValue = Record<string, unknown> | unknown[] | string | number | boolean | null

/**
 * 获取Schema的函数类型
 * @template T Schema数据类型，支持所有 JSON 类型
 */
export type GetSchemaFunction<T extends SchemaValue = SchemaValue> = (params: string) => T

/**
 * 更新Schema的函数类型
 * @template T Schema数据类型，支持所有 JSON 类型
 */
export type UpdateSchemaFunction<T extends SchemaValue = SchemaValue> = (
  schema: T,
  params: string
) => boolean

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
