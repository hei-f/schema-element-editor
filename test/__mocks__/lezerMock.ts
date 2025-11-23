/**
 * @lezer/highlight 模块的 Mock
 */

const mockExtension = () => ({})

export const HighlightStyle = {
  define: (specs: any) => mockExtension()
}

export const tags = {
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

