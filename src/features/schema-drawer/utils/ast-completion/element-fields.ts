/**
 * Elements 类型字段映射
 * 基于 @ant-design/md-editor 的 Elements 类型定义
 *
 * 用于 AST 类型提示功能
 */

/**
 * 字段定义接口
 */
export interface FieldDefinition {
  /** 字段名称 */
  name: string
  /** 字段类型描述 */
  type: string
  /** 字段说明 */
  description: string
  /** 是否必需 */
  required: boolean
  /** 字段优先级（数字越小优先级越高） */
  priority: number
}

/**
 * 枚举字段定义接口
 */
export interface EnumFieldDefinition extends FieldDefinition {
  /** 枚举值列表 */
  enumValues?: string[]
}

/**
 * 所有 Element 类型的枚举值
 */
export const ELEMENT_TYPES = [
  'code',
  'paragraph',
  'blockquote',
  'list',
  'list-item',
  'head',
  'hr',
  'break',
  'media',
  'chart',
  'attach',
  'link-card',
  'schema',
  'apaasify',
  'footnoteDefinition',
  'card',
  'card-before',
  'card-after',
  'table',
  'table-row',
  'table-cell',
] as const

export type ElementType = (typeof ELEMENT_TYPES)[number]

/**
 * 所有 Element 共有的通用字段
 */
export const COMMON_FIELDS: EnumFieldDefinition[] = [
  // 核心必需字段
  {
    name: 'type',
    type: 'string',
    description: 'Element 类型（必需字段）',
    required: true,
    priority: 1,
    enumValues: [...ELEMENT_TYPES],
  },
  {
    name: 'children',
    type: 'Array<Element | Text>',
    description: '子元素数组',
    required: true,
    priority: 2,
  },

  // 基础属性字段
  {
    name: 'id',
    type: 'string',
    description: '元素唯一标识符',
    required: false,
    priority: 3,
  },
  {
    name: 'class',
    type: 'string',
    description: 'CSS 类名',
    required: false,
    priority: 4,
  },
  {
    name: 'style',
    type: 'Record<string, string>',
    description: '内联样式',
    required: false,
    priority: 5,
  },

  // 布局相关字段
  {
    name: 'align',
    type: 'string',
    description: '对齐方式',
    required: false,
    priority: 6,
    enumValues: ['left', 'center', 'right', 'justify'],
  },
  {
    name: 'indent',
    type: 'number',
    description: '缩进级别',
    required: false,
    priority: 7,
  },
  {
    name: 'h',
    type: 'number',
    description: '高度',
    required: false,
    priority: 8,
  },

  // 内容相关字段
  {
    name: 'value',
    type: 'string',
    description: '元素值/内容',
    required: false,
    priority: 9,
  },
  {
    name: 'text',
    type: 'string',
    description: '文本内容',
    required: false,
    priority: 10,
  },

  // 渲染控制字段
  {
    name: 'render',
    type: 'boolean',
    description: '是否渲染',
    required: false,
    priority: 11,
  },

  // 链接和媒体字段
  {
    name: 'url',
    type: 'string',
    description: '链接地址/资源URL',
    required: false,
    priority: 12,
  },
  {
    name: 'title',
    type: 'string',
    description: '标题',
    required: false,
    priority: 13,
  },
  {
    name: 'alt',
    type: 'string',
    description: '替代文本',
    required: false,
    priority: 14,
  },
  {
    name: 'width',
    type: 'number',
    description: '宽度',
    required: false,
    priority: 15,
  },
  {
    name: 'height',
    type: 'number',
    description: '高度',
    required: false,
    priority: 16,
  },

  // 列表相关字段
  {
    name: 'order',
    type: 'boolean',
    description: '是否为有序列表',
    required: false,
    priority: 17,
  },
  {
    name: 'start',
    type: 'number',
    description: '起始序号',
    required: false,
    priority: 18,
  },
  {
    name: 'checked',
    type: 'boolean',
    description: '任务是否完成',
    required: false,
    priority: 19,
  },
  {
    name: 'task',
    type: 'boolean',
    description: '是否为任务列表',
    required: false,
    priority: 20,
  },

  // 标题相关字段
  {
    name: 'level',
    type: 'number',
    description: '标题级别（1-6）',
    required: false,
    priority: 21,
  },

  // 代码相关字段
  {
    name: 'language',
    type: 'string',
    description: '代码语言',
    required: false,
    priority: 22,
  },
  {
    name: 'frontmatter',
    type: 'boolean',
    description: '是否为 frontmatter',
    required: false,
    priority: 23,
  },
  {
    name: 'katex',
    type: 'boolean',
    description: '是否为 KaTeX 公式',
    required: false,
    priority: 24,
  },
  {
    name: 'isConfig',
    type: 'boolean',
    description: '是否为配置块',
    required: false,
    priority: 25,
  },

  // 表格相关字段
  {
    name: 'colSpan',
    type: 'number',
    description: '列跨度',
    required: false,
    priority: 26,
  },
  {
    name: 'rowSpan',
    type: 'number',
    description: '行跨度',
    required: false,
    priority: 27,
  },

  // 其他特定字段
  {
    name: 'size',
    type: 'string',
    description: '尺寸大小',
    required: false,
    priority: 28,
  },
  {
    name: 'icon',
    type: 'string',
    description: '图标',
    required: false,
    priority: 29,
  },
  {
    name: 'color',
    type: 'string',
    description: '颜色',
    required: false,
    priority: 30,
  },
  {
    name: 'avatar',
    type: 'string',
    description: '头像URL',
    required: false,
    priority: 31,
  },
  {
    name: 'description',
    type: 'string',
    description: '描述信息',
    required: false,
    priority: 32,
  },
  {
    name: 'mentions',
    type: 'Array<{id: string, name: string}>',
    description: '提及的用户列表',
    required: false,
    priority: 33,
  },
  {
    name: 'identifier',
    type: 'string',
    description: '标识符',
    required: false,
    priority: 34,
  },

  // 扩展属性字段（优先级最低）
  {
    name: 'contextProps',
    type: 'Record<string, any>',
    description: '上下文属性（自定义扩展）',
    required: false,
    priority: 98,
  },
  {
    name: 'otherProps',
    type: 'Record<string, any>',
    description: '其他属性（自定义扩展）',
    required: false,
    priority: 99,
  },
]

/**
 * CodeNode 特定字段
 */
const CODE_FIELDS: FieldDefinition[] = [
  {
    name: 'language',
    type: 'string',
    description: '代码语言（如 javascript, python）',
    required: false,
    priority: 3,
  },
  {
    name: 'value',
    type: 'string',
    description: '代码内容',
    required: true,
    priority: 2,
  },
  {
    name: 'render',
    type: 'boolean',
    description: '是否渲染',
    required: false,
    priority: 4,
  },
  {
    name: 'frontmatter',
    type: 'boolean',
    description: '是否为 frontmatter',
    required: false,
    priority: 5,
  },
  {
    name: 'katex',
    type: 'boolean',
    description: '是否为 KaTeX 公式',
    required: false,
    priority: 6,
  },
  {
    name: 'isConfig',
    type: 'boolean',
    description: '是否为配置块',
    required: false,
    priority: 7,
  },
]

/**
 * ParagraphNode 特定字段
 */
const PARAGRAPH_FIELDS: FieldDefinition[] = [
  {
    name: 'align',
    type: '"left" | "center" | "right"',
    description: '文本对齐方式',
    required: false,
    priority: 3,
  },
]

/**
 * HeadNode 特定字段
 */
const HEAD_FIELDS: FieldDefinition[] = [
  {
    name: 'level',
    type: 'number',
    description: '标题级别（1-6）',
    required: true,
    priority: 2,
  },
  {
    name: 'align',
    type: '"left" | "center" | "right"',
    description: '标题对齐方式',
    required: false,
    priority: 3,
  },
]

/**
 * ListNode 特定字段
 */
const LIST_FIELDS: FieldDefinition[] = [
  {
    name: 'order',
    type: 'boolean',
    description: '是否为有序列表',
    required: false,
    priority: 3,
  },
  {
    name: 'start',
    type: 'number',
    description: '起始序号',
    required: false,
    priority: 4,
  },
  {
    name: 'task',
    type: 'boolean',
    description: '是否为任务列表',
    required: false,
    priority: 5,
  },
]

/**
 * ListItemNode 特定字段
 */
const LIST_ITEM_FIELDS: FieldDefinition[] = [
  {
    name: 'checked',
    type: 'boolean',
    description: '任务是否完成',
    required: false,
    priority: 3,
  },
  {
    name: 'mentions',
    type: 'Array<{id: string, name: string}>',
    description: '提及的用户列表',
    required: true,
    priority: 4,
  },
  {
    name: 'id',
    type: 'string',
    description: '列表项唯一标识',
    required: true,
    priority: 2,
  },
]

/**
 * MediaNode 特定字段
 */
const MEDIA_FIELDS: FieldDefinition[] = [
  {
    name: 'url',
    type: 'string',
    description: '媒体资源地址',
    required: false,
    priority: 2,
  },
  {
    name: 'alt',
    type: 'string',
    description: '替代文本',
    required: true,
    priority: 3,
  },
  {
    name: 'downloadUrl',
    type: 'string',
    description: '下载地址',
    required: false,
    priority: 4,
  },
  {
    name: 'height',
    type: 'number',
    description: '高度',
    required: false,
    priority: 5,
  },
  {
    name: 'width',
    type: 'number',
    description: '宽度',
    required: false,
    priority: 6,
  },
  {
    name: 'docId',
    type: 'string',
    description: '文档 ID',
    required: false,
    priority: 7,
  },
  {
    name: 'block',
    type: 'boolean',
    description: '是否为块级元素',
    required: false,
    priority: 8,
  },
  {
    name: 'hash',
    type: 'string',
    description: '资源哈希值',
    required: false,
    priority: 9,
  },
  {
    name: 'align',
    type: '"left" | "right"',
    description: '对齐方式',
    required: false,
    priority: 10,
  },
  {
    name: 'mediaType',
    type: 'string',
    description: '媒体类型（image/video/audio）',
    required: false,
    priority: 11,
  },
  {
    name: 'controls',
    type: 'boolean',
    description: '是否显示控制条（视频/音频）',
    required: false,
    priority: 12,
  },
  {
    name: 'autoplay',
    type: 'boolean',
    description: '是否自动播放',
    required: false,
    priority: 13,
  },
  {
    name: 'loop',
    type: 'boolean',
    description: '是否循环播放',
    required: false,
    priority: 14,
  },
  {
    name: 'muted',
    type: 'boolean',
    description: '是否静音',
    required: false,
    priority: 15,
  },
  {
    name: 'poster',
    type: 'string',
    description: '视频封面图',
    required: false,
    priority: 16,
  },
]

/**
 * LinkCardNode 特定字段
 */
const LINK_CARD_FIELDS: FieldDefinition[] = [
  {
    name: 'url',
    type: 'string',
    description: '链接地址',
    required: false,
    priority: 2,
  },
  {
    name: 'icon',
    type: 'string',
    description: '图标地址',
    required: false,
    priority: 3,
  },
  {
    name: 'description',
    type: 'string',
    description: '链接描述',
    required: false,
    priority: 4,
  },
  {
    name: 'title',
    type: 'string',
    description: '链接标题',
    required: false,
    priority: 5,
  },
  {
    name: 'name',
    type: 'string',
    description: '链接名称',
    required: false,
    priority: 6,
  },
  {
    name: 'alt',
    type: 'string',
    description: '替代文本',
    required: true,
    priority: 7,
  },
]

/**
 * AttachNode 特定字段
 */
const ATTACH_FIELDS: FieldDefinition[] = [
  {
    name: 'name',
    type: 'string',
    description: '附件名称',
    required: true,
    priority: 2,
  },
  {
    name: 'size',
    type: 'number',
    description: '附件大小（字节）',
    required: true,
    priority: 3,
  },
  {
    name: 'url',
    type: 'string',
    description: '附件地址',
    required: true,
    priority: 4,
  },
]

/**
 * SchemaNode 特定字段
 */
const SCHEMA_FIELDS: FieldDefinition[] = [
  {
    name: 'value',
    type: 'Record<string, any> | Array<Record<string, any>>',
    description: 'Schema 数据',
    required: true,
    priority: 2,
  },
  {
    name: 'language',
    type: 'string',
    description: 'Schema 语言',
    required: false,
    priority: 3,
  },
  {
    name: 'render',
    type: 'boolean',
    description: '是否渲染',
    required: false,
    priority: 4,
  },
  {
    name: 'frontmatter',
    type: 'boolean',
    description: '是否为 frontmatter',
    required: false,
    priority: 5,
  },
]

/**
 * ChartNode 特定字段
 */
const CHART_FIELDS: FieldDefinition[] = [
  {
    name: 'config',
    type: 'ChartTypeConfig | ChartTypeConfig[]',
    description: '图表配置',
    required: false,
    priority: 2,
  },
  {
    name: 'columns',
    type: 'Array<{title: string, dataIndex: string, key: string}>',
    description: '列定义',
    required: false,
    priority: 3,
  },
  {
    name: 'dataSource',
    type: 'Array<any>',
    description: '数据源',
    required: false,
    priority: 4,
  },
  {
    name: 'showSource',
    type: 'boolean',
    description: '是否显示数据源',
    required: false,
    priority: 5,
  },
]

/**
 * FootnoteDefinitionNode 特定字段
 */
const FOOTNOTE_FIELDS: FieldDefinition[] = [
  {
    name: 'identifier',
    type: 'string',
    description: '脚注标识符',
    required: true,
    priority: 2,
  },
  {
    name: 'url',
    type: 'string',
    description: '链接地址',
    required: false,
    priority: 3,
  },
  {
    name: 'value',
    type: 'string',
    description: '脚注内容',
    required: false,
    priority: 4,
  },
]

/**
 * Element 类型到字段映射表
 */
export const ELEMENT_FIELDS_MAP: Record<string, FieldDefinition[]> = {
  code: CODE_FIELDS,
  paragraph: PARAGRAPH_FIELDS,
  blockquote: [], // 只有通用字段
  list: LIST_FIELDS,
  'list-item': LIST_ITEM_FIELDS,
  head: HEAD_FIELDS,
  hr: [], // 只有通用字段
  break: [], // 只有通用字段
  media: MEDIA_FIELDS,
  chart: CHART_FIELDS,
  attach: ATTACH_FIELDS,
  'link-card': LINK_CARD_FIELDS,
  schema: SCHEMA_FIELDS,
  apaasify: SCHEMA_FIELDS, // 与 schema 相同
  footnoteDefinition: FOOTNOTE_FIELDS,
  card: [], // 只有通用字段
  'card-before': [], // 只有通用字段
  'card-after': [], // 只有通用字段
  // Table 相关的节点（暂时不提供特定字段）
  table: [],
  'table-row': [],
  'table-cell': [],
}

/**
 * 获取指定 Element 类型的所有字段
 * @param elementType Element 类型
 * @returns 字段定义数组（按优先级排序）
 */
export function getFieldsForElementType(elementType: string): EnumFieldDefinition[] {
  const specificFields = ELEMENT_FIELDS_MAP[elementType] || []
  const allFields = [...COMMON_FIELDS, ...specificFields]

  // 按优先级排序
  return allFields.sort((a, b) => a.priority - b.priority)
}

/**
 * 获取所有通用字段
 * @returns 通用字段数组（按优先级排序）
 */
export function getCommonFields(): EnumFieldDefinition[] {
  return [...COMMON_FIELDS].sort((a, b) => a.priority - b.priority)
}
