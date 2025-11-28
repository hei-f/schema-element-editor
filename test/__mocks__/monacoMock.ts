import React from 'react'

// Mock Monaco Editor component
const MonacoEditor = (_props: any) => {
  return React.createElement(
    'div',
    {
      'data-testid': 'monaco-editor',
      className: 'monaco-editor-mock',
      'aria-label': 'Code Editor',
    },
    'Monaco Editor Mock'
  )
}

// ES模块默认导出
export default MonacoEditor

// loader配置
export const loader = {
  init: jest.fn(),
  config: jest.fn(),
}
