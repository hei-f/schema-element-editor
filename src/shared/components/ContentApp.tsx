import { SchemaDrawer } from '@/features/schema-drawer'
import type { ElementAttributes, Message, SchemaResponsePayload, UpdateResultPayload } from '@/shared/types'
import { MessageType } from '@/shared/types'
import { listenPageMessages, postMessageToPage } from '@/shared/utils/browser/message'
import { storage } from '@/shared/utils/browser/storage'
import { ConfigProvider, message as antdMessage } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import React, { useEffect, useState } from 'react'
import { StyleSheetManager } from 'styled-components'

interface AppProps {
  shadowRoot: ShadowRoot
}

/**
 * Schema Editor主应用
 */
export const App: React.FC<AppProps> = ({ shadowRoot }) => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [schemaData, setSchemaData] = useState<any>(null)
  const [currentAttributes, setCurrentAttributes] = useState<ElementAttributes>({ params: [] })
  const [drawerWidth, setDrawerWidth] = useState<string | number>('800px')

  /**
   * 初始化：加载抽屉宽度配置并清理过期草稿
   */
  useEffect(() => {
    storage.getDrawerWidth().then((width) => {
      setDrawerWidth(width)
    })
    storage.cleanExpiredDrafts()
  }, [])

  /**
   * 监听来自injected script的消息
   */
  useEffect(() => {
    const cleanup = listenPageMessages((msg: Message) => {
      switch (msg.type) {
        case MessageType.SCHEMA_RESPONSE:
          handleSchemaResponse(msg.payload as SchemaResponsePayload)
          break

        case MessageType.UPDATE_RESULT:
          handleUpdateResult(msg.payload as UpdateResultPayload)
          break

        default:
          break
      }
    })

    return cleanup
  }, [])

  /**
   * 监听来自monitor的元素点击事件
   */
  useEffect(() => {
    const handleElementClick = (event: CustomEvent) => {
      const { attributes } = event.detail

      setCurrentAttributes(attributes)
      requestSchema(attributes)
    }

    window.addEventListener('schema-editor:element-click', handleElementClick as EventListener)

    return () => {
      window.removeEventListener('schema-editor:element-click', handleElementClick as EventListener)
    }
  }, [])

  /**
   * 请求获取Schema
   */
  const requestSchema = (attributes: ElementAttributes) => {
    const params = attributes.params.join(',')
    const payload = { params }
    
    postMessageToPage({
      type: MessageType.GET_SCHEMA,
      payload: payload
    })
  }

  /**
   * 处理Schema响应
   */
  const handleSchemaResponse = (payload: SchemaResponsePayload) => {
    if (payload.success && payload.data !== undefined) {
      setSchemaData(payload.data)
      setDrawerOpen(true)
    } else {
      antdMessage.error(payload.error || '获取Schema失败')
    }
  }

  /**
   * 处理保存操作
   */
  const handleSave = async (data: any) => {
    return new Promise<void>((resolve, reject) => {
      // 发送更新请求
      postMessageToPage({
        type: MessageType.UPDATE_SCHEMA,
        payload: {
          schema: data,
          params: currentAttributes.params.join(',')
        }
      })

      // 等待更新结果（通过临时监听器）
      const timeout = setTimeout(() => {
        reject(new Error('更新超时'))
      }, 10000)

      const cleanup = listenPageMessages((msg: Message) => {
        if (msg.type === MessageType.UPDATE_RESULT) {
          clearTimeout(timeout)
          cleanup()
          resolve()
        }
      })
    })
  }

  /**
   * 处理更新结果
   */
  const handleUpdateResult = (payload: UpdateResultPayload) => {
    // 只处理失败情况，成功提示由 SchemaDrawer 显示
    if (!payload.success) {
      antdMessage.error(payload.error || '更新失败')
    }
  }

  /**
   * 关闭抽屉
   */
  const handleCloseDrawer = () => {
    setDrawerOpen(false)
    
    // 抽屉关闭时，触发清除高亮的事件
    window.dispatchEvent(new CustomEvent('schema-editor:clear-highlight'))
  }

  return (
    <StyleSheetManager target={shadowRoot as unknown as HTMLElement}>
      <ConfigProvider
        locale={zhCN}
        getPopupContainer={() => shadowRoot as unknown as HTMLElement}
      >
        <SchemaDrawer
          open={drawerOpen}
          schemaData={schemaData}
          attributes={currentAttributes}
          onClose={handleCloseDrawer}
          onSave={handleSave}
          width={drawerWidth}
          shadowRoot={shadowRoot}
        />
      </ConfigProvider>
    </StyleSheetManager>
  )
}

