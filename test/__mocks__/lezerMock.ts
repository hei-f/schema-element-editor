/**
 * @lezer/highlight 模块的 Mock
 */

const mockExtension = () => ({})

export const HighlightStyle = {
  define: (_specs: any) => mockExtension()
}

// 添加 styleTags 函数
export const styleTags = (_tags: any) => mockExtension()

export const tags = {
  special: (_tag: any) => 'special',
  propertyName: 'propertyName',
  string: 'string',
  number: 'number',
  bool: 'bool',
  null: 'null',
  keyword: 'keyword',
  operator: 'operator',
  comment: 'comment',
  bracket: 'bracket',
  className: 'className',
  typeName: 'typeName',
  function: 'function',
  variableName: 'variableName'
}

