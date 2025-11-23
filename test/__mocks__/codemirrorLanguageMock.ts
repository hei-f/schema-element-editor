/**
 * @codemirror/language 模块的 Mock
 * 注意：这是一个最小化的 mock 实现，仅用于测试环境
 */

import type { EditorState } from '@codemirror/state'
import type { Tree } from '@lezer/common'

/**
 * Mock syntaxTree 函数
 * 返回一个简单的 Tree mock，其 resolveInner 会返回 isError 节点
 * 这会触发我们的纯文本分析降级逻辑
 */
export function syntaxTree(_state: EditorState): Tree {
  const mockTree = {
    type: {
      name: 'Document',
      id: 0,
      isError: false,
      isSkipped: false,
      isAnonymous: false,
      isTop: true,
      prop: () => undefined,
      is: () => false
    },
    topNode: {
      type: {
        name: 'Document',
        id: 0,
        isError: false,
        isSkipped: false,
        isAnonymous: false,
        isTop: true,
        prop: () => undefined,
        is: () => false
      },
      from: 0,
      to: 0,
      parent: null,
      name: 'Document',
      firstChild: null,
      lastChild: null,
      nextSibling: null,
      prevSibling: null,
      getChild: () => null,
      getChildren: () => [],
      cursor: () => null,
      resolve: function() { return this },
      resolveInner: function() { return this },
      enterUnfinishedNodesBefore: function() { return this },
      toTree: function() { return mockTree as any },
      matchContext: () => false,
      get node() { return this },
      tree: null
    },
    length: 0,
    /**
     * resolveInner - 返回一个 isError 节点，触发纯文本分析降级
     */
    resolveInner: (pos: number, _side?: -1 | 0 | 1) => {
      return {
        type: {
          name: '⚠',
          id: -1,
          isError: true, // 关键：设置为 true 触发降级
          isSkipped: false,
          isAnonymous: false,
          isTop: false,
          prop: () => undefined,
          is: () => false
        },
        from: pos,
        to: pos,
        parent: null,
        name: '⚠',
        firstChild: null,
        lastChild: null,
        nextSibling: null,
        prevSibling: null,
        getChild: () => null,
        getChildren: () => [],
        cursor: () => null,
        resolve: function() { return this },
        resolveInner: function() { return this },
        enterUnfinishedNodesBefore: function() { return this },
        toTree: () => mockTree as any,
        matchContext: () => false,
        get node() { return this },
        tree: null
      } as any
    },
    resolve: function() { return this.topNode },
    iterate: () => {},
    prop: () => undefined,
    propValues: () => [],
    balance: function() { return this as any },
    cursor: () => null
  }
  
  return mockTree as any as Tree
}

/**
 * Mock Language
 */
export const Language = {
  define: () => ({}),
  data: {
    of: () => ({})
  }
}

/**
 * Mock extension
 */
export const language = () => ({})
export const syntaxHighlighting = () => ({})
export const defaultHighlightStyle = {}

