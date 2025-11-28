/**
 * AST 上下文分析器
 * 使用 Lezer 语法树分析光标位置的上下文
 */

import { syntaxTree } from '@codemirror/language'
import type { EditorState } from '@codemirror/state'
import type { SyntaxNode } from '@lezer/common'

/**
 * 上下文类型
 */
export enum ContextType {
  /** 对象的属性名位置 */
  PropertyName = 'PropertyName',
  /** 对象的属性值位置 */
  PropertyValue = 'PropertyValue',
  /** 数组元素位置 */
  ArrayElement = 'ArrayElement',
  /** 未知位置 */
  Unknown = 'Unknown',
}

/**
 * 上下文分析结果
 */
export interface ContextAnalysisResult {
  /** 上下文类型 */
  type: ContextType
  /** 当前对象的 type 字段值（如果存在） */
  elementType?: string
  /** 当前正在输入的属性名（如果在属性名位置） */
  currentPropertyName?: string
  /** 当前正在输入的属性值的属性名（如果在属性值位置） */
  propertyNameForValue?: string
  /** 是否在 Elements 数组的顶层元素中 */
  isInElementsArray: boolean
  /** 是否在嵌套对象中（如 otherProps, contextProps） */
  isInNestedObject: boolean
}

/**
 * 分析光标位置的上下文
 * @param state 编辑器状态
 * @param pos 光标位置
 * @returns 上下文分析结果
 */
export function analyzeContext(state: EditorState, pos: number): ContextAnalysisResult {
  const tree = syntaxTree(state)
  const doc = state.doc

  // 默认结果
  const defaultResult: ContextAnalysisResult = {
    type: ContextType.Unknown,
    isInElementsArray: false,
    isInNestedObject: false,
  }

  // 从光标位置向内查找最近的节点
  const node: SyntaxNode | null = tree.resolveInner(pos, -1)

  // 如果无法获得有效节点，或者节点是错误节点，使用纯文本分析
  if (!node || node.type.isError) {
    return analyzeContextByText(state, pos)
  }

  // 向上遍历找到最近的 Object 或 Array 节点
  const result = { ...defaultResult }
  let currentNode: SyntaxNode | null = node
  let foundContext = false
  let objectDepth = 0

  while (currentNode) {
    const nodeType = currentNode.type.name

    // 检查是否在属性名位置
    if (nodeType === 'PropertyName' || nodeType === 'String') {
      const parent = currentNode.parent
      if (parent && parent.type.name === 'Property') {
        // 需要区分：字符串是属性名还是属性值
        // 如果这个 String 在冒号之后，则是属性值
        // 注意：冒号节点的类型名称是 ':' 而不是 'Colon'
        const colonNode = parent.getChild(':')

        if (colonNode && currentNode.from > colonNode.to) {
          // 字符串在冒号之后，是属性值
          result.type = ContextType.PropertyValue

          // 获取属性名
          const propertyNameNode = parent.getChild('PropertyName')
          if (propertyNameNode) {
            const propertyNameText = doc.sliceString(propertyNameNode.from, propertyNameNode.to)
            result.propertyNameForValue = propertyNameText.replace(/^"|"$/g, '')
          }

          foundContext = true
        } else {
          // 字符串在冒号之前或没有冒号，是属性名
          result.type = ContextType.PropertyName

          // 获取当前输入的属性名
          const propertyNameText = doc.sliceString(currentNode.from, currentNode.to)
          result.currentPropertyName = propertyNameText.replace(/^"|"$/g, '')

          foundContext = true
        }
      }
    }

    // 检查是否在属性值位置
    if (nodeType === 'Property' && !foundContext) {
      const colonNode = currentNode.getChild(':')
      if (colonNode && pos > colonNode.to) {
        // 光标在冒号之后，说明在属性值位置
        result.type = ContextType.PropertyValue

        // 获取属性名
        const propertyNameNode = currentNode.getChild('PropertyName')
        if (propertyNameNode) {
          const propertyNameText = doc.sliceString(propertyNameNode.from, propertyNameNode.to)
          result.propertyNameForValue = propertyNameText.replace(/^"|"$/g, '')
        }

        foundContext = true
      }
    }

    // 检查是否在数组元素位置
    // 只有在还没找到更具体的上下文时才设置为 ArrayElement
    if (nodeType === 'Array' && !foundContext) {
      // 检查光标是否真的在数组内部，而不是在数组的父对象中
      // 如果数组后面还有逗号，且光标在逗号后，可能是在父对象中
      const arrayEnd = currentNode.to
      if (pos <= arrayEnd) {
        // 光标在数组范围内
        result.type = ContextType.ArrayElement
        foundContext = true
      }
    }

    // 检查是否在对象中
    if (nodeType === 'Object') {
      objectDepth++

      // 如果光标在对象内部，且还没确定上下文，应该是属性名位置
      if (!foundContext && pos > currentNode.from && pos < currentNode.to) {
        result.type = ContextType.PropertyName
        foundContext = true
      }

      // 尝试获取该对象的 type 字段值
      if (!result.elementType) {
        const typeValue = extractTypeValue(currentNode, doc)
        if (typeValue) {
          result.elementType = typeValue
        }
      }

      // 检查是否在嵌套对象中
      if (objectDepth > 1) {
        // 判断是否在 otherProps、contextProps 等嵌套属性中
        const parentProperty = findParentProperty(currentNode)
        if (parentProperty) {
          const propertyName = extractPropertyName(parentProperty, doc)
          if (propertyName === 'otherProps' || propertyName === 'contextProps') {
            result.isInNestedObject = true
          }
        }
      }
    }

    // 检查是否在 Elements 数组的顶层
    if (nodeType === 'Array' && !result.isInElementsArray) {
      // 检查是否是顶层数组（通过判断父节点是否是根节点）
      const arrayParent = currentNode.parent
      if (!arrayParent || arrayParent.type.name === 'JsonText') {
        result.isInElementsArray = true
      }
    }

    currentNode = currentNode.parent
  }

  if (!foundContext) {
    // 如果没有找到明确的上下文，尝试推断
    result.type = inferContextType(node, doc)
  }

  return result
}

/**
 * 从对象节点中提取 type 字段的值
 * @param objectNode 对象节点
 * @param doc 文档
 * @returns type 字段的值，如果不存在返回 undefined
 */
function extractTypeValue(objectNode: SyntaxNode, doc: any): string | undefined {
  // 遍历对象的所有属性
  const cursor = objectNode.cursor()

  if (!cursor.firstChild()) {
    return undefined
  }

  do {
    if (cursor.type.name === 'Property') {
      const propertyNode = cursor.node
      const propertyNameNode = propertyNode.getChild('PropertyName')

      if (propertyNameNode) {
        const propertyName = doc.sliceString(propertyNameNode.from, propertyNameNode.to)
        if (propertyName === '"type"' || propertyName === 'type') {
          // 找到 type 属性，获取其值
          const valueNode =
            propertyNode.getChild('String') || propertyNode.getChild('PropertyValue')
          if (valueNode) {
            const valueText = doc.sliceString(valueNode.from, valueNode.to)
            return valueText.replace(/^"|"$/g, '')
          }
        }
      }
    }
  } while (cursor.nextSibling())

  return undefined
}

/**
 * 找到节点的父 Property 节点
 * @param node 节点
 * @returns 父 Property 节点，如果不存在返回 null
 */
function findParentProperty(node: SyntaxNode): SyntaxNode | null {
  let current: SyntaxNode | null = node.parent

  while (current) {
    if (current.type.name === 'Property') {
      return current
    }
    current = current.parent
  }

  return null
}

/**
 * 从 Property 节点中提取属性名
 * @param propertyNode Property 节点
 * @param doc 文档
 * @returns 属性名
 */
function extractPropertyName(propertyNode: SyntaxNode, doc: any): string | undefined {
  const propertyNameNode = propertyNode.getChild('PropertyName')
  if (propertyNameNode) {
    const propertyName = doc.sliceString(propertyNameNode.from, propertyNameNode.to)
    return propertyName.replace(/^"|"$/g, '')
  }
  return undefined
}

/**
 * 推断上下文类型（当无法明确判断时）
 * @param node 节点
 * @param doc 文档
 * @returns 推断的上下文类型
 */
function inferContextType(node: SyntaxNode, doc: any): ContextType {
  // 检查光标前的字符
  const pos = node.from
  if (pos === 0) {
    return ContextType.Unknown
  }

  const beforeChar = doc.sliceString(pos - 1, pos)
  const beforeTwoChars = pos >= 2 ? doc.sliceString(pos - 2, pos) : ''

  // 如果前面是引号，可能在属性名或字符串值
  if (beforeChar === '"') {
    // 检查更前面的字符判断是属性名还是属性值
    const beforeThreeChars = pos >= 3 ? doc.sliceString(pos - 3, pos - 1) : ''

    if (beforeThreeChars.includes(':') || beforeTwoChars === ': ') {
      return ContextType.PropertyValue
    } else {
      return ContextType.PropertyName
    }
  }

  // 如果前面是冒号，在属性值位置
  if (beforeChar === ':' || beforeTwoChars === ': ') {
    return ContextType.PropertyValue
  }

  // 如果前面是逗号或左括号，可能在数组元素或新属性
  if (beforeChar === ',' || beforeChar === '{' || beforeChar === '[') {
    return ContextType.PropertyName
  }

  return ContextType.Unknown
}

/**
 * 使用纯文本分析来判断上下文（用于处理不完整或不合法的 JSON）
 * @param state 编辑器状态
 * @param pos 光标位置
 * @returns 上下文分析结果
 */
function analyzeContextByText(state: EditorState, pos: number): ContextAnalysisResult {
  const doc = state.doc
  const content = doc.toString()

  // 获取光标前的内容
  const beforeCursor = content.substring(0, pos).trimEnd()

  // 默认结果
  const result: ContextAnalysisResult = {
    type: ContextType.Unknown,
    isInElementsArray: false,
    isInNestedObject: false,
  }

  // 处理空文档
  if (beforeCursor.length === 0) {
    return result
  }

  // 检查是否在顶层数组中
  const trimmedContent = content.trim()
  if (trimmedContent.startsWith('[')) {
    result.isInElementsArray = true
  }

  // 分析光标前的最后几个字符来判断上下文
  const lastChar = beforeCursor[beforeCursor.length - 1]
  const lastTwoChars = beforeCursor.substring(beforeCursor.length - 2)
  const lastThreeChars = beforeCursor.substring(beforeCursor.length - 3)

  // 情况1：刚输入左大括号或左括号
  if (lastChar === '{' || lastChar === '[') {
    result.type = ContextType.PropertyName
    return result
  }

  // 情况2：刚输入逗号后
  if (lastChar === ',') {
    // 向前找最近的未闭合括号，判断是在对象还是数组中
    let braceCount = 0
    let bracketCount = 0
    for (let i = beforeCursor.length - 2; i >= 0; i--) {
      const char = beforeCursor[i]
      if (char === '}') braceCount++
      if (char === '{') {
        if (braceCount === 0) {
          result.type = ContextType.PropertyName
          return result
        }
        braceCount--
      }
      if (char === ']') bracketCount++
      if (char === '[') {
        if (bracketCount === 0) {
          result.type = ContextType.ArrayElement
          return result
        }
        bracketCount--
      }
    }
    result.type = ContextType.PropertyName
    return result
  }

  // 情况3：刚输入冒号或冒号后有空格
  if (lastChar === ':' || lastTwoChars === ': ' || lastThreeChars === '": ') {
    result.type = ContextType.PropertyValue

    // 尝试提取属性名
    const propertyNameMatch = beforeCursor.match(/"([^"]+)"\s*:\s*$/)
    if (propertyNameMatch) {
      result.propertyNameForValue = propertyNameMatch[1]
    }

    return result
  }

  // 情况4：在引号内（属性名或属性值）
  // 检查是否在引号内输入（包括刚输入左引号的情况）
  const inQuoteMatch = beforeCursor.match(/"([^"]*)$/)
  if (inQuoteMatch) {
    // 在引号内，向前找配对的引号前的字符
    const quoteStartIndex = beforeCursor.lastIndexOf('"', beforeCursor.length - 1)

    if (quoteStartIndex >= 0) {
      const beforeQuote = beforeCursor.substring(0, quoteStartIndex).trimEnd()
      const charBeforeQuote = beforeQuote[beforeQuote.length - 1]

      if (charBeforeQuote === ':' || beforeQuote.endsWith(': ')) {
        // 在属性值的引号内
        result.type = ContextType.PropertyValue

        // 提取属性名（向前找到 "propertyName": 模式）
        const propertyNameMatch = beforeQuote.match(/"([^"]+)"\s*:\s*$/)
        if (propertyNameMatch) {
          result.propertyNameForValue = propertyNameMatch[1]
        }
        return result
      } else {
        // 在属性名的引号内
        result.type = ContextType.PropertyName
        return result
      }
    }
  }

  // 情况5：在单词中间（正在输入）
  if (lastChar.match(/[a-zA-Z0-9_-]/)) {
    // 向前查找上下文
    let i = beforeCursor.length - 1
    while (i >= 0 && beforeCursor[i].match(/[a-zA-Z0-9_-]/)) {
      i--
    }
    const charBeforeWord = beforeCursor[i]

    if (charBeforeWord === '"') {
      // 在引号内的单词
      i--
      while (i >= 0 && beforeCursor[i].match(/\s/)) i--
      const charBeforeQuote = beforeCursor[i]

      if (charBeforeQuote === ':') {
        result.type = ContextType.PropertyValue
      } else {
        result.type = ContextType.PropertyName
      }
    } else if (charBeforeWord === ':') {
      result.type = ContextType.PropertyValue
    } else {
      result.type = ContextType.PropertyName
    }

    return result
  }

  // 默认：属性名
  result.type = ContextType.PropertyName
  return result
}

/**
 * 检查文档是否可能是 Elements 数组
 * 快速检查，避免解析大文档
 * @param state 编辑器状态
 * @returns 是否可能是 Elements 数组
 */
export function isPossiblyElementsArray(state: EditorState): boolean {
  const content = state.doc.toString()
  const trimmed = content.trim()

  // 空文档，允许补全（用户可能刚开始输入）
  if (!trimmed) {
    return true
  }

  // 检查是否以 [ 开头（或者只是输入了 [）
  if (!trimmed.startsWith('[')) {
    return false
  }

  // 放宽限制：只要以 [ 开头就认为可能是 Elements 数组
  // 不再要求必须包含 "type" 字段，因为用户可能正在输入
  return true
}
