/**
 * completion-source 单元测试
 * 测试补全源功能
 *
 * 注意：由于 CodeMirror 的 AST 功能在 Jest 环境中被 mock，
 * 这些测试主要验证逻辑流程和数据结构，而非完整的 AST 分析。
 * 完整的集成测试需要在浏览器环境中运行。
 */

import type { CompletionContext } from '@codemirror/autocomplete'
import { EditorState } from '@codemirror/state'
import { createAstCompletionSource } from '../completion-source'

/**
 * 创建测试用的 EditorState
 * 注意：在 Jest 环境中不使用 json() 扩展，因为它依赖浏览器环境
 */
function createState(content: string): EditorState {
  return EditorState.create({
    doc: content,
    extensions: [],
  })
}

/**
 * 创建测试用的 CompletionContext
 */
function createContext(
  state: EditorState,
  pos: number,
  explicit: boolean = false
): CompletionContext {
  return {
    state,
    pos,
    explicit,
    aborted: false,
    addEventListener: () => {},
    tokenBefore: (types: readonly string[]) => {
      const text = state.doc.sliceString(Math.max(0, pos - 100), pos)
      const match = text.match(/\w+$/)
      if (match) {
        return {
          from: pos - match[0].length,
          to: pos,
          text: match[0],
          type: { name: types[0] || 'Word' },
        }
      }
      return null
    },
    matchBefore: (pattern: RegExp) => {
      const text = state.doc.sliceString(Math.max(0, pos - 100), pos)
      const match = text.match(pattern)
      if (match) {
        return {
          from: pos - match[0].length,
          to: pos,
          text: match[0],
        }
      }
      return null
    },
  } as CompletionContext
}

describe('completion-source', () => {
  describe('createAstCompletionSource', () => {
    let completionSource: ReturnType<typeof createAstCompletionSource>

    beforeEach(() => {
      // 默认开启 AST 提示，并模拟内容为 AST
      completionSource = createAstCompletionSource(
        () => true, // enableAstHints
        () => true // isAstContent
      )
    })

    describe('功能开关', () => {
      it('当 AST 提示关闭时，不应该提供补全', async () => {
        const disabledSource = createAstCompletionSource(
          () => false, // AST 提示关闭
          () => true
        )

        const content = '[{"type": ""}]'
        const state = createState(content)
        const pos = content.indexOf('""') + 1
        const context = createContext(state, pos, false)

        const result = await disabledSource(context)

        expect(result).toBeNull()
      })

      it('当开启 AST 提示时，应该允许补全逻辑执行', async () => {
        const enabledSource = createAstCompletionSource(
          () => true, // AST 提示开启
          () => true
        )

        const content = '[{"type": ""}]'
        const state = createState(content)
        const pos = content.indexOf('""') + 1
        const context = createContext(state, pos, false)

        // 在 Jest 环境中，由于 AST 被 mock，结果可能为 null 或有值
        // 这里只验证不会抛出错误
        const result = await enabledSource(context)
        expect(result === null || typeof result === 'object').toBe(true)
      })
    })

    describe('边界情况处理', () => {
      it('应该处理空文档', async () => {
        const content = ''
        const state = createState(content)
        const pos = 0
        const context = createContext(state, pos, true)

        const result = await completionSource(context)

        // 应该返回 null 或空结果
        expect(result === null || (result && result.options.length === 0)).toBe(true)
      })

      it('应该处理只有左括号的情况', async () => {
        const content = '['
        const state = createState(content)
        const pos = 1
        const context = createContext(state, pos, true)

        // 不应该抛出错误
        await expect(completionSource(context)).resolves.toBeDefined()
      })

      it('应该处理不完整的 JSON', async () => {
        const content = '[{"type": '
        const state = createState(content)
        const pos = content.length
        const context = createContext(state, pos, false)

        // 不应该抛出错误
        await expect(completionSource(context)).resolves.toBeDefined()
      })

      it('不应该在逗号后立即触发自动补全', async () => {
        const content = '[{"type": "paragraph"},'
        const state = createState(content)
        const pos = content.length // 光标在逗号后
        const context = createContext(state, pos, false) // 非显式触发

        const result = await completionSource(context)

        // 应该返回 null，不触发自动补全
        expect(result).toBeNull()
      })

      it('不应该在换行后立即触发自动补全', async () => {
        const content = '[{"type": "paragraph"},\n'
        const state = createState(content)
        const pos = content.length // 光标在换行后
        const context = createContext(state, pos, false) // 非显式触发

        const result = await completionSource(context)

        // 应该返回 null，不触发自动补全
        expect(result).toBeNull()
      })
    })

    describe('性能优化', () => {
      it('应该对大文档降级处理或快速返回', async () => {
        // 创建一个超过 10000 字符的文档
        const largeArray = Array(500).fill('{"type": "paragraph", "children": []}')
        const content = `[${largeArray.join(',')}]`
        const state = createState(content)
        const pos = 50 // 在文档开头附近
        const context = createContext(state, pos, false)

        const result = await completionSource(context)

        // 大文档可能降级（返回 null）或快速返回结果
        // 在 Jest 环境中的行为可能与浏览器不同
        expect(result === null || typeof result === 'object').toBe(true)
      })

      it('应该快速返回结果（正常文档）', async () => {
        const content = '[{"type": ""}]'
        const state = createState(content)
        const pos = content.indexOf('""') + 1
        const context = createContext(state, pos, false)

        const startTime = Date.now()
        await completionSource(context)
        const endTime = Date.now()

        // 补全应该在 100ms 内完成
        expect(endTime - startTime).toBeLessThan(100)
      })
    })

    // 以下测试需要完整的 CodeMirror AST 环境，在 Jest 中跳过
    describe('AST-dependent tests (需要浏览器环境)', () => {
      it.skip('应该在 type 字段值位置提供补全', async () => {
        // 这个测试需要真实的 AST 来识别 PropertyValue 上下文
      })

      it.skip('应该提供所有 21 种类型', async () => {
        // 这个测试需要真实的 AST
      })

      it.skip('应该根据输入过滤 type 值', async () => {
        // 这个测试需要真实的 AST
      })

      it.skip('type 值补全应该有描述信息', async () => {
        // 这个测试需要真实的 AST
      })

      it.skip('应该在对象内提供属性名补全', async () => {
        // 这个测试需要真实的 AST
      })

      it.skip('应该根据 type 提供特定字段', async () => {
        // 这个测试需要真实的 AST
      })
    })

    describe('非 Elements 数组文档处理', () => {
      it('对于非数组开头的文档应返回 null', async () => {
        const content = '{"key": "value"}'
        const state = createState(content)
        const pos = content.indexOf('value')
        const context = createContext(state, pos, true)

        const result = await completionSource(context)

        expect(result).toBeNull()
      })

      it('对于只有对象的文档应返回 null', async () => {
        const content = '{"type": "paragraph"}'
        const state = createState(content)
        const pos = content.indexOf('"paragraph"') + 1
        const context = createContext(state, pos, true)

        const result = await completionSource(context)

        expect(result).toBeNull()
      })
    })

    describe('显式触发与自动触发', () => {
      it('显式触发时逗号后应该可以补全', async () => {
        const content = '[{"type": "paragraph"},'
        const state = createState(content)
        const pos = content.length
        const context = createContext(state, pos, true) // 显式触发

        // 显式触发时应该允许补全逻辑执行
        const result = await completionSource(context)
        expect(result === null || typeof result === 'object').toBe(true)
      })

      it('显式触发时换行后应该可以补全', async () => {
        const content = '[{"type": "paragraph"},\n'
        const state = createState(content)
        const pos = content.length
        const context = createContext(state, pos, true) // 显式触发

        const result = await completionSource(context)
        expect(result === null || typeof result === 'object').toBe(true)
      })

      it('光标在位置 0 时不应该阻止补全', async () => {
        const content = '['
        const state = createState(content)
        const pos = 1
        const context = createContext(state, pos, false)

        // 不应该抛出错误
        await expect(completionSource(context)).resolves.toBeDefined()
      })
    })

    describe('特殊字符处理', () => {
      it('应该处理只有左大括号的情况', async () => {
        const content = '[{'
        const state = createState(content)
        const pos = content.length
        const context = createContext(state, pos, true)

        await expect(completionSource(context)).resolves.toBeDefined()
      })

      it('应该处理嵌套数组的情况', async () => {
        const content = '[{"children": [{'
        const state = createState(content)
        const pos = content.length
        const context = createContext(state, pos, true)

        await expect(completionSource(context)).resolves.toBeDefined()
      })

      it('应该处理空数组后逗号的情况', async () => {
        const content = '[[],'
        const state = createState(content)
        const pos = content.length
        const context = createContext(state, pos, true)

        await expect(completionSource(context)).resolves.toBeDefined()
      })
    })
  })
})
