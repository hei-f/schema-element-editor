/**
 * @lezer/highlight 模块的 Mock
 */

const mockExtension = {}

export const HighlightStyle = {
  define: (_specs: any[]) => mockExtension,
}

// 添加 styleTags 函数
export const styleTags = (_tags: any) => mockExtension

// 创建一个可以作为值或函数调用的 tag
const createTag = (name: string) => {
  const tag = (_inner?: any) => name
  Object.assign(tag, { toString: () => name })
  return tag
}

export const tags = {
  // 基础标签
  special: createTag('special'),
  propertyName: createTag('propertyName'),
  string: createTag('string'),
  number: createTag('number'),
  bool: createTag('bool'),
  null: createTag('null'),
  keyword: createTag('keyword'),
  operator: createTag('operator'),
  comment: createTag('comment'),
  bracket: createTag('bracket'),
  className: createTag('className'),
  typeName: createTag('typeName'),
  function: createTag('function'),
  variableName: createTag('variableName'),
  definition: createTag('definition'),
  lineComment: createTag('lineComment'),
  blockComment: createTag('blockComment'),
  paren: createTag('paren'),
  brace: createTag('brace'),
  squareBracket: createTag('squareBracket'),
  name: createTag('name'),
  color: createTag('color'),
  invalid: createTag('invalid'),
  // 额外的 schema-element-editor-dark-theme 使用的标签
  local: createTag('local'),
  constant: createTag('constant'),
  escape: createTag('escape'),
  punctuation: createTag('punctuation'),
  regexp: createTag('regexp'),
  separator: createTag('separator'),
}
