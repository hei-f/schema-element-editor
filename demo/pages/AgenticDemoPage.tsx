import React, { useState, useRef, useCallback } from 'react'
import styled from 'styled-components'
import { BubbleList, MarkdownInputField } from '@ant-design/agentic-ui'
import type { MessageBubbleData } from '@ant-design/agentic-ui'
import { useSchemaElementEditor } from '@schema-element-editor/host-sdk'
import { useLatest } from '@/shared/hooks/useLatest'

/** 页面容器 */
const AgenticDemoContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px - 48px);
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
`

/** 对话区域 */
const ChatArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`

/** 输入区域 */
const InputArea = styled.div`
  padding: 16px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
`

/** Mock AI 响应列表（使用 Markdown 格式展示编辑器能力） */
const MOCK_RESPONSES = [
  '你好！我是 **AI 助手**，有什么可以帮助你的吗？\n\n> 提示：点击任意消息气泡可以使用 Schema Element Editor 编辑内容',
  '这是一个很好的问题！让我来为你解答：\n\n1. 首先，分析问题背景\n2. 然后，制定解决方案\n3. 最后，验证结果',
  '我理解你的需求，这里是我的建议：\n\n```javascript\nconst solution = "优雅的代码"\nconsole.log(solution)\n```',
  '感谢你的提问！以下是详细的回复内容：\n\n| 步骤 | 描述 |\n|-----|------|\n| 1 | 准备工作 |\n| 2 | 执行操作 |\n| 3 | 检查结果 |',
  '没问题，我可以帮你处理这个任务。\n\n- [x] 已完成分析\n- [x] 已生成方案\n- [ ] 等待确认',
]

/** 初始欢迎消息 */
const WELCOME_MESSAGE: MessageBubbleData = {
  id: 'welcome',
  role: 'assistant',
  content:
    '👋 欢迎使用 **Agentic UI Demo**！\n\n这是一个展示 Schema Element Editor 插件接入的演示页面：\n\n1. 在下方输入框发送消息\n2. **点击任意消息气泡**，使用插件编辑内容\n3. 编辑后保存，消息内容会实时更新\n\n> 试试发送一条消息吧！',
  createAt: Date.now(),
  updateAt: Date.now(),
  isFinished: true,
}

/** 生成唯一 ID */
const generateId = (): string => `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

/** 创建消息 */
const createMessage = (
  role: 'user' | 'assistant',
  content: string,
  isFinished = true
): MessageBubbleData => {
  const now = Date.now()
  return {
    id: generateId(),
    role,
    content,
    createAt: now,
    updateAt: now,
    isFinished,
  }
}

/** 获取随机 Mock 响应 */
const getRandomResponse = (): string => {
  const index = Math.floor(Math.random() * MOCK_RESPONSES.length)
  return MOCK_RESPONSES[index]
}

interface AgenticDemoPageProps {
  siderCollapsed: boolean
}

export const AgenticDemoPage: React.FC<AgenticDemoPageProps> = () => {
  // 初始包含欢迎消息
  const [chatList, setChatList] = useState<MessageBubbleData[]>([WELCOME_MESSAGE])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const chatAreaRef = useRef<HTMLDivElement>(null)

  // 使用 useLatest 存储 chatList，避免 getSchema 的闭包陷阱
  const chatListRef = useLatest(chatList)

  /** 滚动到底部 */
  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (chatAreaRef.current) {
        chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight
      }
    })
  }, [])

  /**
   * 获取 Schema 数据
   * 根据消息 ID 从 chatList 中查找对应消息的 content
   */
  const handleGetSchema = useCallback(
    (params: string): string => {
      console.log('[SchemaElementEditor] getSchema:', params)
      const message = chatListRef.current.find((msg) => msg.id === params)
      if (message) {
        const content = message.content
        return typeof content === 'string' ? content : String(content ?? '')
      }
      console.warn('[SchemaElementEditor] Message not found:', params)
      return ''
    },
    [chatListRef]
  )

  /**
   * 更新 Schema 数据
   * 根据消息 ID 更新 chatList 中对应消息的 content
   */
  const handleUpdateSchema = useCallback((schema: unknown, params: string): boolean => {
    console.log('[SchemaElementEditor] updateSchema:', { params, schema })
    setChatList((prevList) => {
      const index = prevList.findIndex((msg) => msg.id === params)
      if (index === -1) {
        console.warn('[SchemaElementEditor] Message not found for update:', params)
        return prevList
      }
      const newList = [...prevList]
      newList[index] = {
        ...newList[index],
        content: schema as string,
        updateAt: Date.now(),
      }
      return newList
    })
    return true
  }, [])

  /**
   * 渲染预览
   */
  const handleRenderPreview = useCallback((schema: unknown, containerId: string) => {
    console.log('[SchemaElementEditor] renderPreview:', containerId)
    const container = document.getElementById(containerId)
    if (container) {
      const content = typeof schema === 'string' ? schema : JSON.stringify(schema, null, 2)
      container.innerHTML = `<pre style="padding: 16px; background: #f5f5f5; border-radius: 4px; margin: 0; white-space: pre-wrap; word-break: break-word;">${content}</pre>`
      return () => {
        container.innerHTML = ''
      }
    }
  }, [])

  // 接入 Schema Element Editor 插件
  useSchemaElementEditor({
    getSchema: handleGetSchema,
    updateSchema: handleUpdateSchema,
    renderPreview: handleRenderPreview,
  })

  /** 处理发送消息 */
  const handleSend = useCallback(
    async (value: string): Promise<void> => {
      if (!value.trim()) return

      // 创建并添加用户消息
      const userMessage = createMessage('user', value)
      setChatList((prev) => [...prev, userMessage])
      setInputValue('')
      setIsLoading(true)
      scrollToBottom()

      // 模拟 AI 响应延迟
      await new Promise((resolve) => setTimeout(resolve, 800))

      // 创建并添加 AI 响应消息
      const aiMessage = createMessage('assistant', getRandomResponse())
      setChatList((prev) => [...prev, aiMessage])
      setIsLoading(false)
      scrollToBottom()
    },
    [scrollToBottom]
  )

  return (
    <AgenticDemoContainer>
      <ChatArea ref={chatAreaRef}>
        <BubbleList
          bubbleList={chatList}
          isLoading={isLoading}
          userMeta={{
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
            title: '用户',
          }}
          assistantMeta={{
            avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ai',
            title: 'AI 助手',
          }}
        />
      </ChatArea>
      <InputArea>
        <MarkdownInputField
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSend}
          placeholder="输入消息，按 Enter 发送..."
          disabled={isLoading}
          typing={isLoading}
        />
      </InputArea>
    </AgenticDemoContainer>
  )
}
