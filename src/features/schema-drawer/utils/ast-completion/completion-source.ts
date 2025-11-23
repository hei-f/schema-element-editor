/**
 * CodeMirror AST 补全源
 * 提供 Elements 类型的智能补全
 */

import type { Completion, CompletionContext, CompletionResult } from '@codemirror/autocomplete'
import { analyzeContext, ContextType, isPossiblyElementsArray } from './context-analyzer'
import { ELEMENT_TYPES, getCommonFields, getFieldsForElementType, type EnumFieldDefinition } from './element-fields'

/**
 * 补全选项图标类型
 */
const COMPLETION_ICONS: Record<string, string> = {
  property: 'property',
  value: 'value',
  keyword: 'keyword',
  type: 'type'
}

/**
 * 创建 AST 补全源
 * @param enableAstHints 是否启用 AST 提示（从配置中获取）
 * @param isAstContent 判断当前内容是否为 AST 类型的函数
 * @returns CompletionSource 函数
 */
export function createAstCompletionSource(
  enableAstHints: () => boolean,
  _isAstContent: () => boolean // 保留参数以保持 API 兼容性，但当前未使用
) {
  return async (context: CompletionContext): Promise<CompletionResult | null> => {
    // 检查是否启用补全
    if (!enableAstHints()) {
      return null
    }
    
    // 检查光标前的字符，如果是逗号或换行，不自动触发补全
    // 用户可能想换行而不是触发补全
    const { state, pos, explicit } = context
    if (!explicit && pos > 0) {
      const charBefore = state.doc.sliceString(pos - 1, pos)
      if (charBefore === ',' || charBefore === '\n') {
        return null
      }
    }
    
    // 放宽限制：不强制要求 isAstContent()
    // 只要文档看起来像 Elements 数组就提供补全
    // 这样用户在输入过程中也能获得补全提示
    
    // 快速检查文档是否可能是 Elements 数组
    if (!isPossiblyElementsArray(context.state)) {
      return null
    }
    
    // 分析光标位置的上下文
    const contextResult = analyzeContext(state, pos)
    
    // 如果在嵌套对象中（otherProps, contextProps），不提供补全
    if (contextResult.isInNestedObject) {
      return null
    }
    
    // 根据上下文类型提供不同的补全
    switch (contextResult.type) {
      case ContextType.PropertyName:
        return providePropertyNameCompletions(context, contextResult)
      
      case ContextType.PropertyValue:
        return providePropertyValueCompletions(context, contextResult)
      
      case ContextType.ArrayElement:
        return provideArrayElementCompletions(context, contextResult)
      
      default:
        return null
    }
  }
}

/**
 * 提供属性名补全
 */
function providePropertyNameCompletions(
  context: CompletionContext,
  contextResult: any
): CompletionResult | null {
  // 获取当前输入的内容（用于过滤）
  // 支持在引号内和引号外的匹配
  const word = context.matchBefore(/"[a-zA-Z0-9_-]*|[a-zA-Z0-9_-]+/)
  
  // 确定补全的起始位置
  const from = word ? word.from : context.pos
  
  // 根据是否有 elementType 提供不同的字段
  let fields: EnumFieldDefinition[]
  
  if (contextResult.elementType) {
    // 有明确的 Element 类型，提供该类型的所有字段
    fields = getFieldsForElementType(contextResult.elementType)
  } else if (contextResult.isInElementsArray) {
    // 在 Elements 数组中但还没有 type，优先提示 type 字段
    fields = getCommonFields()
  } else {
    // 通用情况，提供所有通用字段
    fields = getCommonFields()
  }
  
  // 转换为 Completion 对象
  const options: Completion[] = fields.map(field => ({
    label: field.name,
    type: COMPLETION_ICONS.property,
    detail: field.type,
    info: `${field.description}${field.required ? ' (必需)' : ' (可选)'}`,
    boost: calculateBoost(field),
    apply: (view, _completion, from, to) => {
      // 插入属性名和引号、冒号
      view.dispatch({
        changes: { from, to, insert: `"${field.name}": ` },
        selection: { anchor: from + field.name.length + 4 }
      })
    }
  }))
  
  return {
    from,
    options,
    // 更宽松的 validFor，支持引号内的匹配
    validFor: /^"?[a-zA-Z0-9_-]*$/
  }
}

/**
 * 提供属性值补全
 */
function providePropertyValueCompletions(
  context: CompletionContext,
  contextResult: any
): CompletionResult | null {
  const propertyName = contextResult.propertyNameForValue
  
  // 只为特定属性提供值补全
  if (propertyName === 'type') {
    // 提供 Element 类型枚举值
    return provideTypeEnumCompletions(context)
  }
  
  // 其他属性不提供值补全
  return null
}

/**
 * 提供 type 字段的枚举值补全
 */
function provideTypeEnumCompletions(
  context: CompletionContext
): CompletionResult | null {
  const { pos, state } = context
  
  // 获取光标前的文本来判断是否在引号内
  const textBefore = state.doc.sliceString(Math.max(0, pos - 2), pos)
  const inQuote = textBefore.includes('"')
  
  // 如果在引号内，从引号后开始；否则从当前位置开始
  // 检查光标位置前面是否是引号
  let from = pos
  if (inQuote) {
    // 向前找到最近的引号
    for (let i = pos - 1; i >= Math.max(0, pos - 10); i--) {
      const char = state.doc.sliceString(i, i + 1)
      if (char === '"') {
        from = i + 1 // 从引号后面开始
        break
      }
    }
  }
  
  // 创建 type 枚举值的补全选项
  const options: Completion[] = ELEMENT_TYPES.map(type => ({
    label: type,
    type: COMPLETION_ICONS.value,
    detail: 'Element Type',
    info: getTypeDescription(type),
    apply: (view, _completion, from, to) => {
      // 找到引号的位置
      const doc = view.state.doc
      let quoteStart = from
      let quoteEnd = to
      
      // 向前找左引号
      for (let i = from - 1; i >= 0; i--) {
        if (doc.sliceString(i, i + 1) === '"') {
          quoteStart = i + 1
          break
        }
      }
      
      // 向后找右引号
      for (let i = to; i < doc.length; i++) {
        if (doc.sliceString(i, i + 1) === '"') {
          quoteEnd = i
          break
        }
      }
      
      // 替换引号内的内容
      view.dispatch({
        changes: { from: quoteStart, to: quoteEnd, insert: type },
        selection: { anchor: quoteStart + type.length }
      })
    }
  }))
  
  return {
    from,
    options,
    validFor: /^[a-zA-Z0-9_-]*$/
  }
}

/**
 * 提供数组元素补全
 * 当用户在 Elements 数组中创建新元素时
 */
function provideArrayElementCompletions(
  context: CompletionContext,
  contextResult: any
): CompletionResult | null {
  const { pos } = context
  
  // 如果不在 Elements 数组中，不提供补全
  if (!contextResult.isInElementsArray) {
    return null
  }
  
  // 检查是否在对象开始位置
  const word = context.matchBefore(/\{\s*[a-zA-Z0-9_-]*/)
  
  // 确定补全的起始位置
  const from = word ? word.from : pos
  
  // 提供 type 字段作为第一个属性
  const options: Completion[] = [{
    label: '"type": ',
    type: COMPLETION_ICONS.property,
    detail: 'Element Type (required)',
    info: 'Element 类型字段（必需）',
    boost: 99, // 最高优先级
    apply: (view, _completion, from, to) => {
      view.dispatch({
        changes: { from, to, insert: '"type": ""' },
        selection: { anchor: from + 9 } // 光标移到引号内
      })
    }
  }]
  
  return {
    from,
    options,
    // 更宽松的 validFor
    validFor: /^\{\s*[a-zA-Z0-9_-]*$/
  }
}

/**
 * 计算补全选项的 boost 值（优先级）
 * 根据字段的 priority 和 required 属性
 */
function calculateBoost(field: EnumFieldDefinition): number {
  let boost = 100 - field.priority // priority 越小，boost 越高
  
  if (field.required) {
    boost += 50 // 必需字段额外加分
  }
  
  return boost
}

/**
 * 获取 Element 类型的描述
 */
function getTypeDescription(type: string): string {
  const descriptions: Record<string, string> = {
    'code': '代码块元素',
    'paragraph': '段落元素',
    'blockquote': '引用块元素',
    'list': '列表元素',
    'list-item': '列表项元素',
    'head': '标题元素（h1-h6）',
    'hr': '水平分割线',
    'break': '换行符',
    'media': '媒体元素（图片/视频/音频）',
    'chart': '图表元素',
    'attach': '附件元素',
    'link-card': '链接卡片元素',
    'schema': 'Schema 元素',
    'apaasify': 'Apaasify Schema 元素',
    'footnoteDefinition': '脚注定义元素',
    'card': '卡片容器元素',
    'card-before': '卡片前置内容',
    'card-after': '卡片后置内容',
    'table': '表格元素',
    'table-row': '表格行元素',
    'table-cell': '表格单元格元素'
  }
  
  return descriptions[type] || `Element 类型：${type}`
}

