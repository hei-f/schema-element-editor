import {
  ApiOutlined,
  BulbOutlined,
  ControlOutlined,
  DatabaseOutlined,
  DesktopOutlined,
  EyeOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons'

/**
 * 菜单项配置接口
 */
export interface MenuItemConfig {
  /** 菜单项唯一标识 */
  key: string
  /** 菜单项标题 */
  label: string
  /** 菜单项图标 */
  icon: React.ComponentType
  /** 对应的 Section ID */
  sectionId: string
  /** 子菜单项（配置项） */
  children?: MenuChildConfig[]
}

/**
 * 子菜单项配置接口
 */
export interface MenuChildConfig {
  /** 子菜单项唯一标识 */
  key: string
  /** 子菜单项标题 */
  label: string
  /** 对应的配置项锚点 ID */
  anchorId: string
}

/**
 * 菜单配置
 * 定义所有 Section 的菜单结构
 */
export const MENU_CONFIG: MenuItemConfig[] = [
  {
    key: 'integration-config',
    label: '集成配置',
    icon: ApiOutlined,
    sectionId: 'section-integration-config',
    children: [
      { key: 'communication-mode', label: '通信模式', anchorId: 'field-communication-mode' },
      { key: 'attribute-name', label: '属性名称', anchorId: 'field-attribute-name' },
      { key: 'request-timeout', label: '请求超时', anchorId: 'field-request-timeout' },
      { key: 'source-config', label: '消息标识', anchorId: 'field-source-config' },
      { key: 'message-types', label: '消息类型', anchorId: 'field-message-types' },
    ],
  },
  {
    key: 'element-detection',
    label: '元素检测与高亮',
    icon: SearchOutlined,
    sectionId: 'section-element-detection',
    children: [
      { key: 'throttle-interval', label: '节流间隔', anchorId: 'field-throttle-interval' },
      { key: 'search-depth', label: '搜索深度', anchorId: 'field-search-depth' },
      { key: 'highlight-color', label: '高亮颜色', anchorId: 'field-highlight-color' },
      { key: 'highlight-all', label: '快捷键高亮', anchorId: 'field-highlight-all' },
      { key: 'recording-mode', label: '录制模式', anchorId: 'field-recording-mode' },
    ],
  },
  {
    key: 'editor-config',
    label: '编辑器配置',
    icon: DesktopOutlined,
    sectionId: 'section-editor-config',
    children: [
      { key: 'drawer-width', label: '抽屉宽度', anchorId: 'field-drawer-width' },
      { key: 'auto-parse', label: '字符串解析', anchorId: 'field-auto-parse' },
      { key: 'ast-hints', label: 'AST提示', anchorId: 'field-ast-hints' },
    ],
  },
  {
    key: 'feature-toggle',
    label: '功能开关',
    icon: ControlOutlined,
    sectionId: 'section-feature-toggle',
    children: [
      { key: 'feature-modules', label: '功能模块', anchorId: 'field-feature-modules' },
      { key: 'toolbar-buttons', label: '工具栏按钮', anchorId: 'field-toolbar-buttons' },
    ],
  },
  {
    key: 'preview-config',
    label: '实时预览',
    icon: EyeOutlined,
    sectionId: 'section-preview-config',
    children: [
      { key: 'auto-update', label: '自动更新', anchorId: 'field-auto-update' },
      { key: 'update-delay', label: '更新防抖', anchorId: 'field-update-delay' },
      { key: 'preview-width', label: '预览宽度', anchorId: 'field-preview-width' },
      { key: 'z-index', label: '层级配置', anchorId: 'field-z-index' },
    ],
  },
  {
    key: 'data-management',
    label: '数据管理',
    icon: DatabaseOutlined,
    sectionId: 'section-data-management',
    children: [
      { key: 'draft-config', label: '草稿配置', anchorId: 'field-draft-config' },
      { key: 'favorites-config', label: '收藏配置', anchorId: 'field-favorites-config' },
      { key: 'history-config', label: '历史记录', anchorId: 'field-history-config' },
      { key: 'export-config', label: '导出配置', anchorId: 'field-export-config' },
    ],
  },
  {
    key: 'debug',
    label: '开发调试',
    icon: BulbOutlined,
    sectionId: 'section-debug',
    children: [{ key: 'debug-log', label: '调试日志', anchorId: 'field-debug-log' }],
  },
  {
    key: 'usage-guide',
    label: '使用指南',
    icon: QuestionCircleOutlined,
    sectionId: 'section-usage-guide',
    children: [
      { key: 'usage-instructions', label: '使用说明', anchorId: 'field-usage-instructions' },
      { key: 'schema-types', label: 'Schema类型', anchorId: 'field-schema-types' },
    ],
  },
]

/** 菜单展开宽度 */
export const MENU_EXPANDED_WIDTH = 240

/** 菜单折叠宽度 */
export const MENU_COLLAPSED_WIDTH = 56

/** 响应式断点 */
export const MENU_BREAKPOINT = 1024
