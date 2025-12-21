import {
  ApiOutlined,
  BulbOutlined,
  ControlOutlined,
  DatabaseOutlined,
  DesktopOutlined,
  EyeOutlined,
  KeyOutlined,
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
interface MenuChildConfig {
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
      { key: 'attribute-name', label: '元素标记配置', anchorId: 'field-attribute-name' },
      { key: 'request-timeout', label: 'postMessage 配置', anchorId: 'field-request-timeout' },
      { key: 'source-config', label: '消息标识配置', anchorId: 'field-source-config' },
      { key: 'message-types', label: '消息类型配置', anchorId: 'field-message-types' },
    ],
  },
  {
    key: 'element-detection',
    label: '元素检测与高亮',
    icon: SearchOutlined,
    sectionId: 'section-element-detection',
    children: [
      { key: 'basic-mode', label: '基础模式', anchorId: 'field-basic-mode' },
      { key: 'search-mode', label: '搜索模式', anchorId: 'field-search-mode' },
      { key: 'recording-mode', label: '录制模式', anchorId: 'field-recording-mode' },
      { key: 'iframe-config', label: 'iframe 支持', anchorId: 'field-iframe-config' },
    ],
  },
  {
    key: 'editor-config',
    label: '编辑器配置',
    icon: DesktopOutlined,
    sectionId: 'section-editor-config',
    children: [
      { key: 'editor-features', label: '编辑器功能', anchorId: 'field-editor-features' },
      { key: 'appearance', label: '外观设置', anchorId: 'field-appearance' },
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
      { key: 'preview-behavior', label: '预览行为', anchorId: 'field-preview-behavior' },
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
    key: 'keyboard-shortcuts',
    label: '快捷键配置',
    icon: KeyOutlined,
    sectionId: 'section-keyboard-shortcuts',
    children: [
      { key: 'editor-shortcuts', label: '编辑器快捷键', anchorId: 'field-editor-shortcuts' },
    ],
  },
  {
    key: 'debug',
    label: '开发调试',
    icon: BulbOutlined,
    sectionId: 'section-debug',
    children: [{ key: 'log-settings', label: '日志设置', anchorId: 'field-log-settings' }],
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
export const MENU_EXPANDED_WIDTH = 230

/** 菜单折叠宽度 */
export const MENU_COLLAPSED_WIDTH = 56

/** 响应式断点 */
export const MENU_BREAKPOINT = 1024
