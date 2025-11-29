/**
 * 编辑器相关类型定义
 */

/** 编辑器内容更新选项 */
export interface EditorUpdateOptions {
  /** 是否标记修改状态 */
  markModified?: boolean
  /** 修改状态的值（默认 true，仅在 markModified=true 时生效） */
  modifiedValue?: boolean
  /** 是否更新原始值（用于 diff 对比） */
  updateOriginal?: boolean
  /** 是否检测内容类型（默认 true） */
  detectType?: boolean
  /** wasStringData 的值（undefined 表示不改变） */
  wasStringData?: boolean
}
