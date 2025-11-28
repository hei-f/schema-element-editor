/**
 * AST 补全功能导出
 */

export { createAstCompletionSource } from './completion-source'
export { analyzeContext, ContextType, isPossiblyElementsArray } from './context-analyzer'
export type { ContextAnalysisResult } from './context-analyzer'
export {
  ELEMENT_FIELDS_MAP,
  ELEMENT_TYPES,
  getCommonFields,
  getFieldsForElementType,
} from './element-fields'
export type { ElementType, EnumFieldDefinition, FieldDefinition } from './element-fields'
