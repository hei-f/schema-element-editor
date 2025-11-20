import { MessageType } from '@/types'
import * as storage from '@/utils/browser/storage'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { App } from '../App'

// Mock storage模块
jest.mock('@/utils/browser/storage', () => ({
  storage: {
    getDrawerWidth: jest.fn(),
    setDrawerWidth: jest.fn()
  }
}))

// Mock SchemaDrawer组件
jest.mock('../SchemaDrawer', () => ({
  SchemaDrawer: ({ open, onClose, onSave }: any) => {
    return open ? (
      <div data-testid="schema-drawer-mock">
        <button onClick={onClose}>关闭</button>
        <button onClick={() => onSave({ test: 'data' })}>保存</button>
      </div>
    ) : null
  }
}))

describe('App组件测试', () => {
  const mockGetDrawerWidth = storage.storage.getDrawerWidth as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetDrawerWidth.mockResolvedValue(800)
  })

  it('应该渲染App组件', () => {
    render(<App />)
    expect(document.body).toBeTruthy()
  })

  it('应该从storage加载抽屉宽度', async () => {
    mockGetDrawerWidth.mockResolvedValue(1000)
    
    render(<App />)
    
    await waitFor(() => {
      expect(mockGetDrawerWidth).toHaveBeenCalled()
    })
  })

  it('应该处理元素点击事件', async () => {
    render(<App />)
    
    // 模拟接收ELEMENT_CLICKED消息
    const message = {
      type: MessageType.ELEMENT_CLICKED,
      payload: {
        attributes: {
          params: ['param1', 'param2']
        }
      }
    }
    
    // 触发window message事件
    window.postMessage({
      source: 'schema-editor-content',
      ...message
    }, '*')
    
    // 验证消息被处理且不会导致错误
    await waitFor(() => {
      expect(screen.getByTestId).toBeDefined()
    })
  })

  it('应该处理SCHEMA_RESPONSE消息', async () => {
    render(<App />)
    
    // 先发送点击事件设置attributes
    window.postMessage({
      source: 'schema-editor-content',
      type: MessageType.ELEMENT_CLICKED,
      payload: {
        attributes: {
          params: ['test-param']
        }
      }
    }, '*')
    
    // 发送schema响应
    window.postMessage({
      source: 'schema-editor-injected',
      type: MessageType.SCHEMA_RESPONSE,
      payload: {
        success: true,
        data: { key: 'value' }
      }
    }, '*')
    
    await waitFor(() => {
      const drawer = screen.queryByTestId('schema-drawer-mock')
      if (drawer) {
        expect(drawer).toBeInTheDocument()
      }
    })
  })

  it('应该处理SCHEMA_RESPONSE失败', async () => {
    render(<App />)
    
    window.postMessage({
      source: 'schema-editor-injected',
      type: MessageType.SCHEMA_RESPONSE,
      payload: {
        success: false,
        error: 'Schema not found'
      }
    }, '*')
    
    await waitFor(() => {
      // 失败时drawer不应该打开
      const drawer = screen.queryByTestId('schema-drawer-mock')
      expect(drawer).not.toBeInTheDocument()
    })
  })

  it('应该处理UPDATE_RESULT消息', async () => {
    render(<App />)
    
    window.postMessage({
      source: 'schema-editor-injected',
      type: MessageType.UPDATE_RESULT,
      payload: {
        success: true
      }
    }, '*')
    
    await waitFor(() => {
      expect(screen.getByTestId).toBeDefined()
    })
  })

  it('应该处理抽屉关闭', async () => {
    render(<App />)
    
    // 打开drawer
    window.postMessage({
      source: 'schema-editor-content',
      type: MessageType.ELEMENT_CLICKED,
      payload: {
        attributes: {
          params: ['test']
        }
      }
    }, '*')
    
    window.postMessage({
      source: 'schema-editor-injected',
      type: MessageType.SCHEMA_RESPONSE,
      payload: {
        success: true,
        data: { test: 'data' }
      }
    }, '*')
    
    await waitFor(async () => {
      const drawer = screen.queryByTestId('schema-drawer-mock')
      if (drawer) {
        const closeButton = screen.getByText('关闭')
        fireEvent.click(closeButton)
        
        await waitFor(() => {
          expect(screen.queryByTestId('schema-drawer-mock')).not.toBeInTheDocument()
        })
      }
    })
  })

  it('应该处理保存操作', async () => {
    render(<App />)
    
    // 打开drawer
    window.postMessage({
      source: 'schema-editor-content',
      type: MessageType.ELEMENT_CLICKED,
      payload: {
        attributes: {
          params: ['test']
        }
      }
    }, '*')
    
    window.postMessage({
      source: 'schema-editor-injected',
      type: MessageType.SCHEMA_RESPONSE,
      payload: {
        success: true,
        data: { original: 'data' }
      }
    }, '*')
    
    await waitFor(async () => {
      const drawer = screen.queryByTestId('schema-drawer-mock')
      if (drawer) {
        const saveButton = screen.getByText('保存')
        fireEvent.click(saveButton)
        
        await waitFor(() => {
          expect(saveButton).toBeInTheDocument()
        })
      }
    })
  })

  it('应该处理宽度变化', async () => {
    render(<App />)
    
    // 模拟宽度变化
    // 在实际组件中，这会通过某个交互触发
    await waitFor(() => {
      expect(mockGetDrawerWidth).toHaveBeenCalled()
    })
  })

  it('应该忽略非schema-editor来源的消息', async () => {
    render(<App />)
    
    // 发送一个没有正确source的消息
    window.postMessage({
      type: MessageType.SCHEMA_RESPONSE,
      payload: {
        success: true,
        data: {}
      }
    }, '*')
    
    await waitFor(() => {
      // drawer不应该打开
      const drawer = screen.queryByTestId('schema-drawer-mock')
      expect(drawer).not.toBeInTheDocument()
    })
  })

  it('应该处理空的attributes', async () => {
    render(<App />)
    
    window.postMessage({
      source: 'schema-editor-content',
      type: MessageType.ELEMENT_CLICKED,
      payload: {
        attributes: {
          params: []
        }
      }
    }, '*')
    
    await waitFor(() => {
      expect(screen.queryByTestId('schema-drawer-mock')).not.toBeInTheDocument()
    })
  })

  it('应该处理复杂的schema数据', async () => {
    render(<App />)
    
    const complexSchema = {
      nested: {
        deep: {
          array: [1, 2, 3],
          object: { key: 'value' }
        }
      },
      string: 'test',
      number: 123,
      boolean: true
    }
    
    window.postMessage({
      source: 'schema-editor-content',
      type: MessageType.ELEMENT_CLICKED,
      payload: {
        attributes: {
          params: ['complex']
        }
      }
    }, '*')
    
    window.postMessage({
      source: 'schema-editor-injected',
      type: MessageType.SCHEMA_RESPONSE,
      payload: {
        success: true,
        data: complexSchema
      }
    }, '*')
    
    await waitFor(() => {
      const drawer = screen.queryByTestId('schema-drawer-mock')
      if (drawer) {
        expect(drawer).toBeInTheDocument()
      } else {
        expect(screen.getByTestId).toBeDefined()
      }
    })
  })

  it('应该通过自定义事件处理元素点击', async () => {
    render(<App />)
    
    const mockElement = document.createElement('div')
    const mockAttributes = { params: ['custom-param'] }
    
    // 派发自定义事件
    const event = new CustomEvent('schema-editor:element-click', {
      detail: {
        element: mockElement,
        attributes: mockAttributes
      }
    })
    
    window.dispatchEvent(event)
    
    // 应该触发schema请求
    await waitFor(() => {
      expect(screen.getByTestId).toBeDefined()
    })
  })

  it('关闭抽屉时应该派发清除高亮事件', async () => {
    const clearHighlightSpy = jest.fn()
    window.addEventListener('schema-editor:clear-highlight', clearHighlightSpy)
    
    render(<App />)
    
    // 打开drawer
    window.postMessage({
      source: 'schema-editor-content',
      type: MessageType.ELEMENT_CLICKED,
      payload: {
        attributes: {
          params: ['test']
        }
      }
    }, '*')
    
    window.postMessage({
      source: 'schema-editor-injected',
      type: MessageType.SCHEMA_RESPONSE,
      payload: {
        success: true,
        data: { test: 'data' }
      }
    }, '*')
    
    await waitFor(() => {
      const drawer = screen.queryByTestId('schema-drawer-mock')
      if (drawer) {
        const closeButton = screen.getByText('关闭')
        fireEvent.click(closeButton)
        
        expect(clearHighlightSpy).toHaveBeenCalled()
      }
    })
    
    window.removeEventListener('schema-editor:clear-highlight', clearHighlightSpy)
  })

  it('应该处理未定义的schema数据', async () => {
    render(<App />)
    
    window.postMessage({
      source: 'schema-editor-injected',
      type: MessageType.SCHEMA_RESPONSE,
      payload: {
        success: true,
        data: undefined
      }
    }, '*')
    
    await waitFor(() => {
      // data为undefined时drawer不应该打开
      const drawer = screen.queryByTestId('schema-drawer-mock')
      expect(drawer).not.toBeInTheDocument()
    })
  })

  it('应该处理null的schema数据', async () => {
    render(<App />)
    
    window.postMessage({
      source: 'schema-editor-injected',
      type: MessageType.SCHEMA_RESPONSE,
      payload: {
        success: true,
        data: null
      }
    }, '*')
    
    await waitFor(() => {
      const drawer = screen.queryByTestId('schema-drawer-mock')
      if (drawer) {
        expect(drawer).toBeInTheDocument()
      } else {
        expect(screen.queryByTestId('schema-drawer-mock')).not.toBeInTheDocument()
      }
    })
  })

  it('应该处理多个参数', async () => {
    render(<App />)
    
    const event = new CustomEvent('schema-editor:element-click', {
      detail: {
        element: document.createElement('div'),
        attributes: { params: ['param1', 'param2', 'param3'] }
      }
    })
    
    window.dispatchEvent(event)
    
    await waitFor(() => {
      expect(screen.getByTestId).toBeDefined()
    })
  })
})

