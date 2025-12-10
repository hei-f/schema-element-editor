import { SchemaDrawer } from '@/features/schema-drawer'
import { DEFAULT_VALUES } from '@/shared/constants/defaults'
import { PLUGIN_EVENTS } from '@/shared/constants/events'
import type {
  DrawerShortcutsConfig,
  ElementAttributes,
  IframeConfig,
  IframeElementClickPayload,
  SchemaDrawerConfig,
  SchemaResponsePayload,
  UpdateResultPayload,
} from '@/shared/types'
import { logger } from '@/shared/utils/logger'
import { initHostMessageListener, sendRequestToHost } from '@/shared/utils/browser/message'
import { storage } from '@/shared/utils/browser/storage'
import { shadowRootManager } from '@/shared/utils/shadow-root-manager'
import { generate } from '@ant-design/colors'
import { StyleProvider } from '@ant-design/cssinjs'
import { App as AntdApp, ConfigProvider, message as antdMessage } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { StyleSheetManager } from 'styled-components'
import { IframeHighlightOverlay } from './IframeHighlightOverlay'

interface AppProps {
  shadowRoot: ShadowRoot
}

/**
 * Schema Element Editor主应用
 */
export const App: React.FC<AppProps> = ({ shadowRoot }) => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [schemaData, setSchemaData] = useState<unknown>(undefined)
  const [currentAttributes, setCurrentAttributes] = useState<ElementAttributes>({ params: [] })
  const [isRecordingMode, setIsRecordingMode] = useState(false)
  const [hasPreviewFunction, setHasPreviewFunction] = useState(false)

  /** SchemaDrawer 配置 */
  const [drawerConfig, setDrawerConfig] = useState<SchemaDrawerConfig | null>(null)
  /** 抽屉快捷键配置 */
  const [drawerShortcuts, setDrawerShortcuts] = useState<DrawerShortcutsConfig | null>(null)
  /** iframe 配置 */
  const [iframeConfig, setIframeConfig] = useState<IframeConfig | null>(null)
  /** 当前是否为 iframe 元素（用于决定 postMessage 发送目标） */
  const [isFromIframe, setIsFromIframe] = useState(false)
  /** iframe 元素来源的 origin */
  const iframeOriginRef = useRef<string>('')

  /**
   * 初始化 shadowRoot 全局管理器（只在挂载时执行一次）
   */
  useEffect(() => {
    shadowRootManager.init(shadowRoot)
  }, [shadowRoot])

  /**
   * 初始化：加载配置
   */
  useEffect(() => {
    const loadConfig = async () => {
      const [
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
        shortcuts,
        iframeConfigData,
        themeColor,
      ] = await Promise.all([
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
        storage.getDrawerShortcuts(),
        storage.getIframeConfig(),
        storage.getThemeColor(),
      ])
      setDrawerConfig({
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
        themeColor,
      })
      setDrawerShortcuts(shortcuts)
      setIframeConfig(iframeConfigData)
    }
    loadConfig()
    storage.cleanExpiredDrafts()
  }, [])

  /**
   * 初始化宿主消息监听器
   */
  useEffect(() => {
    if (!drawerConfig) return

    const cleanup = initHostMessageListener(drawerConfig.apiConfig.sourceConfig)
    return cleanup
  }, [drawerConfig])

  /**
   * 检测预览函数是否存在
   */
  const checkPreviewFunction = useCallback(async () => {
    if (!drawerConfig) return

    const { apiConfig } = drawerConfig

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
  }, [drawerConfig])

  /**
   * 处理 Schema 响应
   */
  const handleSchemaResponse = useCallback(
    (payload: SchemaResponsePayload) => {
      if (payload.success && payload.data !== undefined) {
        setSchemaData(payload.data)
        setDrawerOpen(true)
        // 抽屉打开时暂停元素监听
        window.dispatchEvent(new CustomEvent(PLUGIN_EVENTS.PAUSE_MONITOR))
        checkPreviewFunction()
      } else {
        antdMessage.error(payload.error || '获取Schema失败')
      }
    },
    [checkPreviewFunction]
  )

  /**
   * 抽屉打开时立即隐藏滚动条，避免打开动画时画面抖动
   * 使用 useLayoutEffect 确保在 DOM 更新后同步执行
   * 注意：滚动条恢复在 SchemaDrawer 的 afterOpenChange 中处理（动画完成后）
   */
  useLayoutEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden'
    }
  }, [drawerOpen])

  /**
   * 向 iframe 发送 postMessage 请求
   */
  const sendRequestToIframe = useCallback(
    <T,>(iframeOrigin: string, type: string, payload: any, timeoutSeconds: number): Promise<T> => {
      return new Promise((resolve, reject) => {
        const requestId = `iframe-req-${Date.now()}-${Math.random().toString(36).slice(2)}`
        const timeoutMs = timeoutSeconds * 1000

        const timeoutId = setTimeout(() => {
          window.removeEventListener('message', listener)
          reject(new Error(`iframe 请求超时（${timeoutSeconds}秒）`))
        }, timeoutMs)

        const listener = (event: MessageEvent) => {
          // 验证来源
          if (event.origin !== iframeOrigin) return
          if (!event.data || event.data.requestId !== requestId) return

          clearTimeout(timeoutId)
          window.removeEventListener('message', listener)
          resolve(event.data as T)
        }

        window.addEventListener('message', listener)

        // 向所有同源 iframe 发送请求
        const iframes = document.querySelectorAll('iframe')
        const sourceConfig = drawerConfig?.apiConfig.sourceConfig
        iframes.forEach((iframe) => {
          try {
            iframe.contentWindow?.postMessage(
              {
                source: sourceConfig?.contentSource ?? 'schema-element-editor-content',
                type,
                payload,
                requestId,
              },
              iframeOrigin
            )
          } catch {
            // 跨域 iframe 会抛出异常，忽略
          }
        })
      })
    },
    [drawerConfig]
  )

  /**
   * 请求获取 Schema
   * @param attributes 元素属性
   * @param fromIframe 是否来自 iframe
   * @param iframeOrigin iframe 的 origin（仅当 fromIframe 为 true 时有效）
   */
  const requestSchema = useCallback(
    async (attributes: ElementAttributes, fromIframe: boolean = false, iframeOrigin?: string) => {
      if (!drawerConfig) return

      const params = attributes.params.join(',')
      const { apiConfig } = drawerConfig

      try {
        const messageType =
          apiConfig.messageTypes?.getSchema ?? DEFAULT_VALUES.apiConfig.messageTypes.getSchema

        // 判断请求发送目标
        const shouldSendToIframe =
          fromIframe && iframeConfig?.schemaTarget === 'iframe' && iframeOrigin

        if (shouldSendToIframe) {
          // 向 iframe 发送请求
          const response = await sendRequestToIframe<SchemaResponsePayload>(
            iframeOrigin,
            messageType,
            { params },
            apiConfig.requestTimeout ?? DEFAULT_VALUES.apiConfig.requestTimeout
          )
          handleSchemaResponse({
            success: response.success !== false,
            data: response.data,
            error: response.error,
          })
        } else {
          // 向 top frame 发送请求
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
        }
      } catch (error: any) {
        antdMessage.error(error.message || '获取Schema失败')
      }
    },
    [drawerConfig, iframeConfig, handleSchemaResponse, sendRequestToIframe]
  )

  /**
   * 监听来自 monitor 的元素点击事件（主页面元素）
   */
  useEffect(() => {
    const handleElementClick = (event: Event) => {
      const customEvent = event as CustomEvent
      const { attributes, isRecordingMode: recordingMode } = customEvent.detail

      setCurrentAttributes(attributes)
      setIsRecordingMode(recordingMode || false)
      setIsFromIframe(false)
      iframeOriginRef.current = ''
      requestSchema(attributes, false)
    }

    window.addEventListener(PLUGIN_EVENTS.ELEMENT_CLICK, handleElementClick)

    return () => {
      window.removeEventListener(PLUGIN_EVENTS.ELEMENT_CLICK, handleElementClick)
    }
  }, [requestSchema])

  /**
   * 监听来自 iframe 的元素点击事件
   */
  useEffect(() => {
    const handleIframeElementClick = (event: Event) => {
      const customEvent = event as CustomEvent<IframeElementClickPayload>
      const { attrs, isRecordingMode: recordingMode, iframeOrigin } = customEvent.detail

      setCurrentAttributes(attrs)
      setIsRecordingMode(recordingMode || false)
      setIsFromIframe(true)
      iframeOriginRef.current = iframeOrigin
      requestSchema(attrs, true, iframeOrigin)
    }

    window.addEventListener(PLUGIN_EVENTS.IFRAME_ELEMENT_CLICK, handleIframeElementClick)

    return () => {
      window.removeEventListener(PLUGIN_EVENTS.IFRAME_ELEMENT_CLICK, handleIframeElementClick)
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

      const messageType =
        apiConfig.messageTypes?.updateSchema ?? DEFAULT_VALUES.apiConfig.messageTypes.updateSchema

      // 判断请求发送目标
      const shouldSendToIframe =
        isFromIframe && iframeConfig?.schemaTarget === 'iframe' && iframeOriginRef.current

      if (shouldSendToIframe) {
        // 向 iframe 发送请求
        const response = await sendRequestToIframe<UpdateResultPayload>(
          iframeOriginRef.current,
          messageType,
          { schema: data, params },
          apiConfig.requestTimeout ?? DEFAULT_VALUES.apiConfig.requestTimeout
        )

        if (response.success === false) {
          throw new Error(response.error || '更新失败')
        }
      } else {
        // 向 top frame 发送请求
        const response = await sendRequestToHost<UpdateResultPayload>(
          messageType,
          { schema: data, params },
          apiConfig.requestTimeout ?? DEFAULT_VALUES.apiConfig.requestTimeout,
          apiConfig.sourceConfig
        )

        if (response.success === false) {
          throw new Error(response.error || '更新失败')
        }
      }
    },
    [currentAttributes, drawerConfig, isFromIframe, iframeConfig, sendRequestToIframe]
  )

  /**
   * 关闭抽屉
   */
  const handleCloseDrawer = () => {
    setDrawerOpen(false)
    setIsRecordingMode(false)
    setHasPreviewFunction(false)

    // 抽屉关闭时，恢复元素监听
    window.dispatchEvent(new CustomEvent(PLUGIN_EVENTS.RESUME_MONITOR))
    // 注意：滚动条恢复在 SchemaDrawer 的 afterOpenChange 中处理，确保动画完成后再恢复
  }

  /** 动态主题配置：合并基础主题和用户配置的主题色 */
  const dynamicTheme = useMemo(() => {
    const themeColor = drawerConfig?.themeColor || DEFAULT_VALUES.themeColor
    const colors = generate(themeColor)
    const primaryColor = colors[5]
    const hoverColor = colors[4]
    const activeColor = colors[6]

    // 计算颜色亮度，决定 primary 按钮的文字颜色
    const getLuminance = (hex: string) => {
      const rgb = parseInt(hex.slice(1), 16)
      const r = (rgb >> 16) & 0xff
      const g = (rgb >> 8) & 0xff
      const b = rgb & 0xff
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255
    }
    const primaryTextColor = getLuminance(primaryColor) > 0.5 ? '#000000' : '#ffffff'

    return {
      token: {
        colorPrimary: primaryColor,
        colorPrimaryHover: hoverColor,
        colorPrimaryActive: activeColor,
        colorInfo: primaryColor,
        colorLink: primaryColor,
        colorLinkHover: hoverColor,
        colorLinkActive: activeColor,
        colorTextLightSolid: primaryTextColor,
      },
    }
  }, [drawerConfig?.themeColor])

  /**
   * 获取弹层容器
   * 使用触发元素的父节点，确保弹层正确定位
   */
  const getPopupContainer = useCallback(
    (triggerNode?: HTMLElement) => {
      // 优先使用触发元素的父节点
      if (triggerNode?.parentNode instanceof HTMLElement) {
        return triggerNode.parentNode
      }
      // fallback 到 shadowRoot
      return shadowRoot as unknown as HTMLElement
    },
    [shadowRoot]
  )

  return (
    <StyleSheetManager target={shadowRoot as unknown as HTMLElement}>
      <StyleProvider container={shadowRoot as unknown as HTMLElement} layer>
        <ConfigProvider
          locale={zhCN}
          theme={dynamicTheme}
          getPopupContainer={getPopupContainer}
          csp={{ nonce: 'YourNonceCode' }}
          prefixCls="see"
        >
          <AntdApp>
            {/* iframe 元素高亮覆盖层 */}
            {iframeConfig?.enabled && (
              <IframeHighlightOverlay
                recordingModeColor={drawerConfig?.recordingModeConfig?.highlightColor}
              />
            )}

            {drawerConfig && drawerShortcuts && (
              <SchemaDrawer
                open={drawerOpen}
                schemaData={schemaData}
                attributes={currentAttributes}
                onClose={handleCloseDrawer}
                onSave={handleSave}
                isRecordingMode={isRecordingMode}
                config={drawerConfig}
                hasPreviewFunction={hasPreviewFunction}
                shortcuts={drawerShortcuts}
              />
            )}
          </AntdApp>
        </ConfigProvider>
      </StyleProvider>
    </StyleSheetManager>
  )
}
