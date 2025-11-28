/**
 * 导出文件格式类型定义
 */

/** 导出文件的完整结构 */
export interface ExportFileFormat {
  /** 文件格式标记（固定为 true） */
  __SCHEMA_EDITOR_EXPORT__: true

  /** 实际数据内容 */
  content: any

  /** 元数据信息 */
  metadata: ExportMetadata
}

/** 导出元数据 */
export interface ExportMetadata {
  /** 参数键（逗号分隔） */
  params: string

  /** 导出时间（ISO 8601 格式） */
  exportedAt: string

  /** 插件版本号 */
  version: string

  /** 原始数据类型标记 */
  wasStringData: boolean

  /** 来源页面 URL */
  url: string
}

/** 文件检测结果 */
export interface FileDetectionResult {
  /** 是否包含元数据 */
  hasMetadata: boolean

  /** 实际内容数据 */
  content: any

  /** 元数据（如果有） */
  metadata?: ExportMetadata
}
