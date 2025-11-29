import { SchemaDrawer } from '@/features/schema-drawer'
import { DEFAULT_VALUES } from '@/shared/constants/defaults'
import { shadowDomTheme } from '@/shared/constants/theme'
import { getCommunicationMode } from '@/shared/utils/communication-mode'
import type {
  ElementAttributes,
  Message,
  PreviewFunctionResultPayload,
  SchemaDrawerConfig,
  SchemaResponsePayload,
  UpdateResultPayload,
} from '@/shared/types'
import { MessageType } from '@/shared/types'
import { logger } from '@/shared/utils/logger'
import {
  initHostMessageListener,
  listenPageMessages,
  postMessageToPage,
  sendRequestToHost,
} from '@/shared/utils/browser/message'
import { storage } from '@/shared/utils/browser/storage'
import { shadowRootManager } from '@/shared/utils/shadow-root-manager'
import { App as AntdApp, ConfigProvider, message as antdMessage } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import React, { useCallback, useEffect, useRef, useState } from 'react'
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
  const [isRecordingMode, setIsRecordingMode] = useState(false)
  const [hasPreviewFunction, setHasPreviewFunction] = useState(false)

  /** SchemaDrawer 配置 */
  const [drawerConfig, setDrawerConfig] = useState<SchemaDrawerConfig | null>(null)

  const configSyncedRef = useRef(false)

  /**
   * 初始化 shadowRoot 全局管理器（只在挂载时执行一次）
   */
  useEffect(() => {
    shadowRootManager.init(shadowRoot)
  }, [shadowRoot])

  /** 通信模式 */
  const { isPostMessageMode, isWindowFunctionMode } = getCommunicationMode(drawerConfig?.apiConfig)

  /**
   * 同步配置到注入脚本（仅 windowFunction 模式需要）
   */
  const syncConfigToInjected = useCallback(async () => {
    if (configSyncedRef.current) return
    if (!isWindowFunctionMode) return

    const [getFunctionName, updateFunctionName, previewFunctionName] = await Promise.all([
      storage.getGetFunctionName(),
      storage.getUpdateFunctionName(),
      storage.getPreviewFunctionName(),
    ])

    postMessageToPage({
      type: MessageType.CONFIG_SYNC,
      payload: {
        getFunctionName,
        updateFunctionName,
        previewFunctionName,
      },
    })

    configSyncedRef.current = true
  }, [isWindowFunctionMode])

  /**
   * 初始化：加载配置
   */
  useEffect(() => {
    const loadConfig = async () => {
      const [
        width,
        apiConfig,
        toolbarButtons,
        autoSaveDraft,
        previewConfig,
        maxHistoryCount,
        enableAstTypeHints,
        exportConfig,
        editorTheme,
        recordingModeConfig,
        autoParseString,
      ] = await Promise.all([
        storage.getDrawerWidth(),
        storage.getApiConfig(),
        storage.getToolbarButtons(),
        storage.getAutoSaveDraft(),
        storage.getPreviewConfig(),
        storage.getMaxHistoryCount(),
        storage.getEnableAstTypeHints(),
        storage.getExportConfig(),
        storage.getEditorTheme(),
        storage.getRecordingModeConfig(),
        storage.getAutoParseString(),
      ])
      setDrawerConfig({
        width,
        apiConfig,
        toolbarButtons,
        autoSaveDraft,
        previewConfig,
        maxHistoryCount,
        enableAstTypeHints,
        exportConfig,
        editorTheme,
        recordingModeConfig,
        autoParseString,
      })
    }
    loadConfig()
    storage.cleanExpiredDrafts()
  }, [])

  /**
   * 配置加载后，初始化通信
   */
  useEffect(() => {
    if (!drawerConfig) return

    // windowFunction 模式：同步配置到 injected.js
    if (isWindowFunctionMode) {
      syncConfigToInjected()
    }
  }, [drawerConfig, syncConfigToInjected, isWindowFunctionMode])

  /**
   * 初始化宿主消息监听器（postMessage 模式）
   */
  useEffect(() => {
    if (!drawerConfig || !isPostMessageMode) return

    const cleanup = initHostMessageListener(drawerConfig.apiConfig.sourceConfig)
    return cleanup
  }, [drawerConfig, isPostMessageMode])

  /**
   * 处理更新结果（windowFunction 模式）
   */
  const handleUpdateResult = useCallback((payload: UpdateResultPayload) => {
    if (!payload.success) {
      antdMessage.error(payload.error || '更新失败')
    }
  }, [])

  /**
   * 检测预览函数是否存在
   */
  const checkPreviewFunction = useCallback(async () => {
    if (!drawerConfig) return

    const { apiConfig } = drawerConfig

    if (isPostMessageMode) {
      try {
        const messageType =
          apiConfig.messageTypes?.checkPreview ?? DEFAULT_VALUES.apiConfig.messageTypes.checkPreview
        const response = await sendRequestToHost<{ exists: boolean }>(
          messageType,
          {},
          apiConfig.requestTimeout,
          apiConfig.sourceConfig
        )
        setHasPreviewFunction(response.exists === true)
        logger.log('预览函数检测结果:', response.exists)
      } catch {
        setHasPreviewFunction(false)
        logger.log('预览函数检测超时，认为不存在')
      }
    } else {
      const cleanup = listenPageMessages((msg: Message) => {
        if (msg.type === MessageType.PREVIEW_FUNCTION_RESULT) {
          const payload = msg.payload as PreviewFunctionResultPayload
          setHasPreviewFunction(payload.exists)
          logger.log('预览函数检测结果:', payload.exists)
          cleanup()
        }
      })

      postMessageToPage({
        type: MessageType.CHECK_PREVIEW_FUNCTION,
      })
    }
  }, [drawerConfig, isPostMessageMode])

  /**
   * 处理 Schema 响应
   */
  const handleSchemaResponse = useCallback(
    (payload: SchemaResponsePayload) => {
      if (payload.success && payload.data !== undefined) {
        setSchemaData(payload.data)
        setDrawerOpen(true)
        checkPreviewFunction()
      } else {
        antdMessage.error(payload.error || '获取Schema失败')
      }
    },
    [checkPreviewFunction]
  )

  /**
   * 监听来自 injected script 的消息（windowFunction 模式）
   */
  useEffect(() => {
    if (!drawerConfig || !isWindowFunctionMode) return

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
  }, [drawerConfig, isWindowFunctionMode, handleSchemaResponse, handleUpdateResult])

  /**
   * 请求获取 Schema
   */
  const requestSchema = useCallback(
    async (attributes: ElementAttributes) => {
      if (!drawerConfig) return

      const params = attributes.params.join(',')
      const { apiConfig } = drawerConfig

      if (isPostMessageMode) {
        // postMessage 直连模式
        try {
          const messageType =
            apiConfig.messageTypes?.getSchema ?? DEFAULT_VALUES.apiConfig.messageTypes.getSchema
          const response = await sendRequestToHost<SchemaResponsePayload>(
            messageType,
            { params },
            apiConfig.requestTimeout ?? DEFAULT_VALUES.apiConfig.requestTimeout,
            apiConfig.sourceConfig
          )
          handleSchemaResponse({
            success: response.success !== false,
            data: response.data,
            error: response.error,
          })
        } catch (error: any) {
          antdMessage.error(error.message || '获取Schema失败')
        }
      } else {
        // windowFunction 模式：通过 injected.js
        postMessageToPage({
          type: MessageType.GET_SCHEMA,
          payload: { params },
        })
      }
    },
    [drawerConfig, isPostMessageMode, handleSchemaResponse]
  )

  /**
   * 监听来自 monitor 的元素点击事件
   */
  useEffect(() => {
    const handleElementClick = (event: Event) => {
      const customEvent = event as CustomEvent
      const { attributes, isRecordingMode: recordingMode } = customEvent.detail

      setCurrentAttributes(attributes)
      setIsRecordingMode(recordingMode || false)
      requestSchema(attributes)
    }

    window.addEventListener('schema-editor:element-click', handleElementClick)

    return () => {
      window.removeEventListener('schema-editor:element-click', handleElementClick)
    }
  }, [requestSchema])

  /**
   * 处理保存操作
   */
  const handleSave = useCallback(
    async (data: any) => {
      if (!drawerConfig) return

      const params = currentAttributes.params.join(',')
      const { apiConfig } = drawerConfig

      if (isPostMessageMode) {
        // postMessage 直连模式
        const messageType =
          apiConfig.messageTypes?.updateSchema ?? DEFAULT_VALUES.apiConfig.messageTypes.updateSchema
        const response = await sendRequestToHost<UpdateResultPayload>(
          messageType,
          { schema: data, params },
          apiConfig.requestTimeout ?? DEFAULT_VALUES.apiConfig.requestTimeout,
          apiConfig.sourceConfig
        )

        if (response.success === false) {
          throw new Error(response.error || '更新失败')
        }
      } else {
        // windowFunction 模式：通过 injected.js
        return new Promise<void>((resolve, reject) => {
          postMessageToPage({
            type: MessageType.UPDATE_SCHEMA,
            payload: { schema: data, params },
          })

          const timeout = setTimeout(() => {
            reject(new Error('更新超时'))
          }, 10000)

          const cleanup = listenPageMessages((msg: Message) => {
            if (msg.type === MessageType.UPDATE_RESULT) {
              clearTimeout(timeout)
              cleanup()
              const result = msg.payload as UpdateResultPayload
              if (result.success === false) {
                reject(new Error(result.error || '更新失败'))
              } else {
                resolve()
              }
            }
          })
        })
      }
    },
    [currentAttributes, drawerConfig, isPostMessageMode]
  )

  /**
   * 关闭抽屉
   */
  const handleCloseDrawer = () => {
    setDrawerOpen(false)
    setIsRecordingMode(false)
    setHasPreviewFunction(false)

    // 抽屉关闭时，触发清除高亮的事件
    window.dispatchEvent(new CustomEvent('schema-editor:clear-highlight'))
  }

  return (
    <StyleSheetManager target={shadowRoot as unknown as HTMLElement}>
      <ConfigProvider
        locale={zhCN}
        theme={shadowDomTheme}
        getPopupContainer={() => shadowRoot as unknown as HTMLElement}
      >
        <AntdApp>
          {drawerConfig && (
            <SchemaDrawer
              open={drawerOpen}
              schemaData={schemaData}
              attributes={currentAttributes}
              onClose={handleCloseDrawer}
              onSave={handleSave}
              isRecordingMode={isRecordingMode}
              config={drawerConfig}
              hasPreviewFunction={hasPreviewFunction}
            />
          )}
        </AntdApp>
      </ConfigProvider>
    </StyleSheetManager>
  )
}
