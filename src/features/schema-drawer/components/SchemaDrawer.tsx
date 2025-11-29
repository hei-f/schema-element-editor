import {
  PREVIEW_CONTAINER_ID,
  previewContainerManager,
} from '@/core/content/core/preview-container'
import { shadowDomContainerManager } from '@/core/content/core/shadow-dom'
import { DEFAULT_VALUES } from '@/shared/constants/defaults'
import { FULL_SCREEN_MODE, type FullScreenMode } from '@/shared/constants/ui-modes'
import { FavoritesManager } from '@/features/favorites/components/FavoritesManager'
import { EDITOR_THEME_OPTIONS } from '@/shared/constants/editor-themes'
import type { ElementAttributes, HistoryEntry, SchemaDrawerConfig } from '@/shared/types'
import { ContentType, HistoryEntryType, MessageType } from '@/shared/types'
import { postMessageToPage, sendRequestToHost } from '@/shared/utils/browser/message'
import { storage } from '@/shared/utils/browser/storage'
import { logger } from '@/shared/utils/logger'
import { shadowRootManager } from '@/shared/utils/shadow-root-manager'
import { parseMarkdownString } from '@/shared/utils/schema/transformers'
import { useFullScreenMode } from '../hooks/ui/useFullScreenMode'
import { useResizer } from '../hooks/ui/useResizer'
import { useSchemaRecording } from '../hooks/schema/useSchemaRecording'
import { RecordingPanel } from './recording/RecordingPanel'
import { SchemaDiffView, type DiffDisplayMode } from './editor/SchemaDiffView'
import {
  BgColorsOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  StarOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import { App, Button, Drawer, Dropdown, Space, Tooltip, Upload } from 'antd'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ThemeProvider } from 'styled-components'
import { getCommunicationMode } from '@/shared/utils/communication-mode'
import { useDeferredEffect } from '@/shared/hooks/useDeferredEffect'
import { useContentDetection } from '../hooks/schema/useContentDetection'
import { useDraftManagement } from '../hooks/storage/useDraftManagement'
import { useEditHistory } from '../hooks/storage/useEditHistory'
import { useFavoritesManagement } from '../hooks/storage/useFavoritesManagement'
import { useFileImportExport } from '../hooks/storage/useFileImportExport'
import { useLightNotifications } from '../hooks/ui/useLightNotifications'
import { useSchemaSave } from '../hooks/schema/useSchemaSave'
import type { EditorUpdateOptions } from '../types/editor'
import type { ExportMetadata } from '../types/export'
import { schemaTransformer } from '../services/schema-transformer'
import {
  DraftAutoSaveSuccess,
  DraftNotification,
  DragHintText,
  DragOverlay,
  DragWidthIndicator,
  DrawerContentContainer,
  DrawerFooter,
  DrawerTitleActions,
  DrawerTitleContainer,
  DrawerTitleLeft,
  FullScreenModeWrapper,
  PreviewEditorContainer,
  PreviewEditorRow,
  PreviewModeContainer,
  PreviewPlaceholder,
  PreviewResizer,
} from '../styles/layout/drawer.styles'
import { EditorContainer } from '../styles/editor/editor.styles'
import { getEditorThemeVars } from '../styles/editor/editor-theme-vars'
import { LightSuccessNotification } from '../styles/notifications/notifications.styles'
import type { CodeMirrorEditorHandle } from './editor/CodeMirrorEditor'
import { CodeMirrorEditor } from './editor/CodeMirrorEditor'
import { DrawerToolbar } from './toolbar/DrawerToolbar'
import { HistoryDropdown } from './toolbar/HistoryDropdown'
import { getJsonError, repairJson } from '../utils/json-repair'

interface SchemaDrawerProps {
  open: boolean
  schemaData: any
  attributes: ElementAttributes
  onClose: () => void
  onSave: (data: any) => Promise<void>
  /** 是否以录制模式打开 */
  isRecordingMode?: boolean
  /** 抽屉配置 */
  config: SchemaDrawerConfig
  /** 宿主环境是否存在预览函数 */
  hasPreviewFunction: boolean
}

/**
 * Schema编辑器抽屉组件
 */
export const SchemaDrawer: React.FC<SchemaDrawerProps> = ({
  open,
  schemaData,
  attributes,
  onClose,
  onSave,
  isRecordingMode: initialRecordingMode = false,
  config,
  hasPreviewFunction,
}) => {
  // 使用 App.useApp() 获取 message 实例，确保在 Shadow DOM 中正确显示
  const { message } = App.useApp()

  // 从 config 解构配置
  const {
    width,
    apiConfig,
    toolbarButtons,
    autoSaveDraft,
    previewConfig,
    maxHistoryCount,
    enableAstTypeHints,
    exportConfig,
    editorTheme: initialEditorTheme,
    recordingModeConfig: recordingConfig,
    autoParseString: autoParseEnabled,
  } = config

  /** 通信模式 */
  const { isPostMessageMode } = getCommunicationMode(apiConfig)

  // 编辑器主题（支持运行时切换，初始值从 config 获取）
  const [editorTheme, setEditorTheme] = useState(initialEditorTheme)

  // 根据编辑器主题计算 styled-components 主题变量
  const editorThemeVars = useMemo(() => getEditorThemeVars(editorTheme), [editorTheme])

  const [editorValue, setEditorValue] = useState<string>('')
  const [originalValue, setOriginalValue] = useState<string>('') // 原始值，用于 diff 对比
  const [isModified, setIsModified] = useState(false)
  const [wasStringData, setWasStringData] = useState(false)

  // 全屏模式状态管理
  const {
    setMode: setFullScreenMode,
    reset: resetFullScreenMode,
    isPreview: previewEnabled,
    isDiff: isDiffMode,
    isFullScreenTransition,
  } = useFullScreenMode()

  const [previewWidth, setPreviewWidth] = useState(previewConfig.previewWidth)

  // Diff 对比显示模式
  const [diffDisplayMode, setDiffDisplayMode] = useState<DiffDisplayMode>('raw')

  // 录制模式相关状态
  const [isInRecordingMode, setIsInRecordingMode] = useState(false)

  // JSON 修复相关状态
  const [repairOriginalValue, setRepairOriginalValue] = useState<string>('')
  const [pendingRepairedValue, setPendingRepairedValue] = useState<string>('')

  const paramsKey = attributes.params.join(',')
  const isFirstLoadRef = useRef(true)
  const editorRef = useRef<CodeMirrorEditorHandle>(null) // 编辑器命令式 API
  const previewPlaceholderRef = useRef<HTMLDivElement>(null)

  /** 内容类型检测 */
  const { contentType, canParse, detectContentType, debouncedDetectContent, updateContentType } =
    useContentDetection()

  /**
   * 统一的编辑器内容更新方法
   * 同时更新编辑器视图和 React state，确保始终同步
   * 解决双重 setValue 的问题，避免遗漏同步
   */
  const updateEditorContent = useCallback(
    (content: string, options: EditorUpdateOptions = {}) => {
      const {
        markModified = false,
        modifiedValue = true,
        updateOriginal = false,
        detectType = true,
        wasStringData: wasStringDataValue,
      } = options

      // 1. 同步更新编辑器视图和 React state（核心操作）
      editorRef.current?.setValue(content)
      setEditorValue(content)

      // 2. 根据选项执行副作用
      if (markModified) {
        setIsModified(modifiedValue)
      }
      if (updateOriginal) {
        setOriginalValue(content)
      }
      if (wasStringDataValue !== undefined) {
        setWasStringData(wasStringDataValue)
      }
      if (detectType) {
        const result = detectContentType(content)
        updateContentType(result)
      }
    },
    [detectContentType, updateContentType]
  )

  //TODO-youling:CR check point
  /** Schema录制Hook */
  const {
    isRecording,
    snapshots,
    selectedSnapshotId,
    startRecording,
    stopRecording,
    selectSnapshot,
    clearSnapshots,
  } = useSchemaRecording({
    attributes,
    pollingInterval: recordingConfig?.pollingInterval || 100,
    onSchemaChange: updateEditorContent,
    apiConfig,
  })

  /** 轻量提示 */
  const { lightNotifications, showLightNotification } = useLightNotifications()

  /** 保存逻辑 */
  const { isSaving, handleSave } = useSchemaSave({
    editorValue,
    wasStringData,
    paramsKey,
    onSaveSuccess: () => {
      setIsModified(false)
      message.success('保存成功')
      // 记录保存版本
      recordSpecialVersion(HistoryEntryType.Save, '保存版本')
      onClose()
    },
    onSave,
  })

  /** 历史版本加载回调（解耦设计） */
  const handleLoadHistoryVersion = useCallback(
    (content: string, entry: HistoryEntry) => {
      updateEditorContent(content, { markModified: true })
      // 预览会自动更新（因为 editorValue 变化会触发现有的 useEffect）
      showLightNotification(`已切换到: ${entry.description || '历史版本'}`)
    },
    [updateEditorContent, showLightNotification]
  )

  /** 导入成功回调 */
  const handleImportSuccess = useCallback(
    (content: string, metadata?: ExportMetadata) => {
      updateEditorContent(content, {
        markModified: true,
        wasStringData: metadata?.wasStringData,
      })
    },
    [updateEditorContent]
  )

  /** 文件导入导出功能 */
  const { handleExport, handleImport } = useFileImportExport({
    editorValue,
    paramsKey,
    wasStringData,
    canParse,
    customFileName: exportConfig.customFileName,
    onImportSuccess: handleImportSuccess,
    showLightNotification,
  })

  /** 编辑历史管理 */
  const {
    history,
    currentIndex,
    hasHistory,
    recordChange,
    recordSpecialVersion,
    loadHistoryVersion,
    clearHistory,
  } = useEditHistory({
    paramsKey,
    editorValue,
    maxHistoryCount,
    enabled: toolbarButtons.history,
    onLoadVersion: handleLoadHistoryVersion,
  })

  /** 加载草稿内容的回调 */
  const handleLoadDraftContent = useCallback(
    (content: string) => {
      updateEditorContent(content, { markModified: true })
      // 不再立即记录特殊版本，让用户编辑后自然触发 recordChange
    },
    [updateEditorContent]
  )

  /** 草稿管理 */
  const {
    hasDraft,
    showDraftNotification,
    draftAutoSaveStatus,
    checkDraft,
    handleSaveDraft,
    handleLoadDraft,
    handleDeleteDraft,
    debouncedAutoSaveDraft,
  } = useDraftManagement({
    paramsKey,
    editorValue,
    isModified,
    autoSaveDraft,
    isFirstLoad: isFirstLoadRef.current,
    enabled: toolbarButtons.draft,
    onLoadDraft: handleLoadDraftContent,
    onSuccess: (msg) => message.success(msg, 1.5),
    onWarning: (msg) => message.warning(msg),
    onError: (msg) => message.error(msg),
  })

  /** 应用收藏内容的回调 */
  const handleApplyFavoriteContent = useCallback(
    (content: string) => {
      updateEditorContent(content, { markModified: true })
      // 不再立即记录特殊版本，让用户编辑后自然触发 recordChange
    },
    [updateEditorContent]
  )

  /** 收藏管理 */
  const {
    favoritesList,
    favoritesModalVisible,
    addFavoriteModalVisible,
    favoriteNameInput,
    editModalVisible,
    editingFavoriteId,
    editingName,
    editingContent,
    setFavoriteNameInput,
    handleOpenAddFavorite,
    handleAddFavorite,
    handleOpenFavorites,
    handleApplyFavorite,
    handleDeleteFavorite,
    handleEditFavorite,
    handleSaveEdit,
    closeFavoritesModal,
    closeAddFavoriteModal,
    closeEditModal,
  } = useFavoritesManagement({
    editorValue,
    isModified,
    onApplyFavorite: handleApplyFavoriteContent,
    onShowLightNotification: showLightNotification,
    onWarning: (msg) => message.warning(msg),
    onError: (msg) => message.error(msg),
  })

  /**
   * Portal组件的容器获取函数
   */
  const getPortalContainer = shadowRootManager.getContainer

  /**
   * 清理预览容器（纯清理，不改变状态）
   * 先立即清除 DOM（同步），再异步通知宿主
   */
  const cleanupPreviewContainer = useCallback(() => {
    // 立即清除 DOM 容器（同步操作，无延迟）
    previewContainerManager.clear()
    logger.log('预览容器已清理')

    // 异步通知宿主清理其内部状态
    if (isPostMessageMode) {
      const messageType =
        apiConfig?.messageTypes?.cleanupPreview ??
        DEFAULT_VALUES.apiConfig.messageTypes.cleanupPreview
      sendRequestToHost(
        messageType,
        { containerId: PREVIEW_CONTAINER_ID },
        2,
        apiConfig?.sourceConfig
      ).catch((error) => {
        logger.warn('预览容器清理请求失败:', error)
      })
    } else {
      postMessageToPage({
        type: MessageType.CLEAR_PREVIEW,
      })
    }
  }, [apiConfig, isPostMessageMode])

  /**
   * 抽屉打开/关闭回调 - 统一处理生命周期逻辑
   */
  const handleAfterOpenChange = useCallback(
    (isOpen: boolean) => {
      if (isOpen) {
        // 打开时的初始化逻辑
        isFirstLoadRef.current = true
        checkDraft()

        // 禁止背景页面滚动
        document.body.style.overflow = 'hidden'

        // 如果是录制模式打开，设置录制状态并自动开始录制
        if (initialRecordingMode && recordingConfig && schemaData !== null) {
          setIsInRecordingMode(true)
          resetFullScreenMode()

          // 延迟自动开始录制
          setTimeout(() => {
            startRecording()
          }, 200)
        }
      } else {
        // 关闭时的清理逻辑（动画完成后）
        document.body.style.overflow = ''

        // 重置所有模式状态
        setIsInRecordingMode(false)
        resetFullScreenMode()
        stopRecording()
        clearSnapshots()
      }
    },
    [
      checkDraft,
      initialRecordingMode,
      recordingConfig,
      schemaData,
      startRecording,
      stopRecording,
      clearSnapshots,
    ]
  )

  /**
   * 处理抽屉关闭
   * 在动画开始前立即清理预览容器，确保与抽屉关闭同步
   */
  const handleClose = useCallback(() => {
    // 立即清理预览容器（与抽屉关闭同步）
    cleanupPreviewContainer()
    // 调用原始关闭回调
    onClose()
  }, [cleanupPreviewContainer, onClose])

  /**
   * 格式化 Schema 数据，返回用于编辑器显示的内容
   */
  const formatSchemaContent = useCallback(
    (data: unknown): { content: string; wasStringData: boolean } => {
      const shouldAutoParse = !isInRecordingMode && autoParseEnabled

      // 场景1：自动解析 Markdown 字符串
      if (shouldAutoParse && schemaTransformer.isStringData(data)) {
        const elements = parseMarkdownString(data as string)
        if (elements.length > 0) {
          return { content: JSON.stringify(elements, null, 2), wasStringData: true }
        }
        message.warning('Markdown解析失败，显示原始字符串')
        return { content: JSON.stringify(data, null, 2), wasStringData: false }
      }

      // 场景2：录制模式下的字符串直接显示（保留换行符格式）
      if (isInRecordingMode && typeof data === 'string') {
        return { content: data, wasStringData: true }
      }

      // 场景3：默认 JSON 格式化
      return { content: JSON.stringify(data, null, 2), wasStringData: false }
    },
    [isInRecordingMode, autoParseEnabled]
  )

  /**
   * 当schemaData变化时，更新编辑器内容
   */
  useEffect(() => {
    // 卫语句：前置条件不满足直接返回
    if (schemaData === null || schemaData === undefined || !open) {
      return
    }

    const initLoadOptions = {
      markModified: true,
      modifiedValue: false,
      updateOriginal: true,
    } as const

    try {
      const { content, wasStringData } = formatSchemaContent(schemaData)
      updateEditorContent(content, { ...initLoadOptions, wasStringData })
    } catch (error) {
      logger.error('处理Schema数据失败:', error)
      updateEditorContent(JSON.stringify(schemaData), { ...initLoadOptions, wasStringData: false })
    } finally {
      setTimeout(() => {
        isFirstLoadRef.current = false
      }, 100)
    }
  }, [schemaData, open, formatSchemaContent, updateEditorContent])

  /**
   * 处理编辑器内容变化
   */
  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (value !== undefined) {
        setEditorValue(value)
        setIsModified(true)
        debouncedDetectContent(value)
        debouncedAutoSaveDraft(value)
        // 用户手动编辑时记录历史
        recordChange(value)
      }
    },
    [debouncedDetectContent, debouncedAutoSaveDraft, recordChange]
  )

  /**
   * 格式化JSON
   * 仅调整格式，不改变内容语义，不标记为修改
   */
  const handleFormat = () => {
    const result = schemaTransformer.formatJson(editorValue)

    if (result.success && result.data) {
      updateEditorContent(result.data, { detectType: false })
      showLightNotification('格式化成功')
    } else {
      message.error(`格式化失败: ${result.error}`)
    }
  }

  /**
   * 转义JSON
   * 将内容包装成字符串值，添加引号和转义
   */
  const handleEscape = () => {
    const result = schemaTransformer.escapeJson(editorValue)

    if (result.success && result.data) {
      updateEditorContent(result.data, { markModified: true })
      showLightNotification('转义成功')
    } else {
      message.error(result.error || '转义失败')
    }
  }

  /**
   * 去转义JSON
   * 将字符串值还原，移除外层引号和转义
   */
  const handleUnescape = () => {
    const result = schemaTransformer.unescapeJson(editorValue)

    if (result.success && result.data) {
      updateEditorContent(result.data, { markModified: true })
      showLightNotification('去转义成功')
    } else {
      message.error(result.error || '去转义失败')
    }
  }

  /**
   * 压缩JSON
   * 将格式化的 JSON 压缩成一行
   */
  const handleCompact = () => {
    const result = schemaTransformer.compactJson(editorValue)

    if (result.success && result.data) {
      updateEditorContent(result.data, { markModified: true })
      showLightNotification('压缩成功')
    } else {
      message.error(result.error || '压缩失败')
    }
  }

  /**
   * 解析嵌套JSON
   * 处理多层嵌套/转义的 JSON 字符串
   */
  const handleParse = () => {
    const result = schemaTransformer.parseNestedJson(editorValue)

    if (result.success && result.data) {
      updateEditorContent(result.data, { markModified: true })

      if (result.error) {
        message.warning(`${result.error}，已显示当前解析结果`)
      } else if (result.parseCount && result.parseCount > 0) {
        showLightNotification(`解析成功（解析层数: ${result.parseCount}）`)
      } else {
        showLightNotification('解析成功')
      }
    } else {
      message.error(result.error || '解析失败')
    }
  }

  /**
   * 转换为AST
   */
  const handleConvertToAST = () => {
    const result = schemaTransformer.convertToAST(editorValue)

    if (result.success && result.data) {
      updateEditorContent(result.data, { markModified: true })
      showLightNotification('转换为AST成功')
    } else {
      message.error(`转换失败：${result.error}`)
    }
  }

  /**
   * 转换为Markdown
   */
  const handleConvertToMarkdown = () => {
    const result = schemaTransformer.convertToMarkdown(editorValue)

    if (result.success && result.data) {
      updateEditorContent(result.data, { markModified: true })
      showLightNotification('转换为RawString成功')
    } else {
      message.error(`转换失败：${result.error}`)
    }
  }

  /**
   * 处理Segment切换
   */
  const handleSegmentChange = (value: string | number) => {
    if (value === ContentType.Ast) {
      handleConvertToAST()
    } else if (value === ContentType.RawString) {
      handleConvertToMarkdown()
    }
  }

  /**
   * 拖拽结束回调 - 保存配置并重新渲染预览
   */
  const handleResizeEnd = useCallback(
    async (finalWidth: number) => {
      // 保存用户自定义的宽度到配置
      storage.setPreviewConfig({
        ...previewConfig,
        previewWidth: finalWidth,
      })
      setPreviewWidth(finalWidth)

      // 更新预览位置并显示
      if (previewPlaceholderRef.current) {
        const rect = previewPlaceholderRef.current.getBoundingClientRect()
        const position = {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        }

        // 更新容器位置
        previewContainerManager.updatePosition(position)

        // 重新渲染预览内容
        const result = schemaTransformer.prepareSaveData(editorValue || '{}', wasStringData)
        if (result.success) {
          const containerId = PREVIEW_CONTAINER_ID

          if (isPostMessageMode) {
            const messageType =
              apiConfig?.messageTypes?.renderPreview ??
              DEFAULT_VALUES.apiConfig.messageTypes.renderPreview
            await sendRequestToHost(
              messageType,
              { schema: result.data, containerId },
              apiConfig?.requestTimeout ?? 5,
              apiConfig?.sourceConfig
            ).catch((error) => {
              logger.warn('拖拽结束后预览渲染请求失败:', error)
            })
          } else {
            postMessageToPage({
              type: MessageType.RENDER_PREVIEW,
              payload: {
                schema: result.data,
                containerId,
                position,
              },
            })
          }
        }

        // 显示预览容器
        previewContainerManager.show()
      }
    },
    [previewConfig, editorValue, wasStringData, isPostMessageMode, apiConfig]
  )

  /** 拖拽分隔条 Hook */
  const {
    width: resizerWidth,
    isDragging,
    containerRef: previewContainerRef,
    handleResizeStart,
  } = useResizer({
    initialWidth: previewWidth,
    onResizeEnd: handleResizeEnd,
  })

  // 同步 resizer 宽度到组件状态（用于 UI 显示）
  useEffect(() => {
    if (isDragging) {
      setPreviewWidth(resizerWidth)
    }
  }, [resizerWidth, isDragging])

  /**
   * 切换全屏模式
   * 自动处理模式切换时的清理逻辑和 z-index 调整
   */
  const switchFullScreenMode = useCallback(
    (newMode: FullScreenMode) => {
      setFullScreenMode((prevMode) => {
        // 退出预览模式时清理预览容器并恢复 z-index
        if (prevMode === FULL_SCREEN_MODE.PREVIEW && newMode !== FULL_SCREEN_MODE.PREVIEW) {
          cleanupPreviewContainer()
          shadowDomContainerManager.resetZIndex()
        }

        // 进入预览模式时降低 z-index
        if (newMode === FULL_SCREEN_MODE.PREVIEW && prevMode !== FULL_SCREEN_MODE.PREVIEW) {
          shadowDomContainerManager.setZIndex(previewConfig.zIndex.preview)
        }

        return newMode
      })
    },
    [cleanupPreviewContainer, previewConfig.zIndex.preview]
  )

  /**
   * 切换预览状态
   */
  const handleTogglePreview = useCallback(() => {
    if (!hasPreviewFunction) {
      message.warning('页面未提供预览函数')
      return
    }

    if (previewEnabled) {
      switchFullScreenMode(FULL_SCREEN_MODE.NONE)
    } else {
      switchFullScreenMode(FULL_SCREEN_MODE.PREVIEW)
    }
  }, [hasPreviewFunction, previewEnabled, switchFullScreenMode])

  /**
   * 手动渲染预览
   * 预览数据与保存数据使用相同的转换逻辑，确保类型一致
   */
  const handleRenderPreview = useCallback(
    async (isAutoUpdate = false) => {
      if (!previewEnabled || !hasPreviewFunction) {
        return
      }

      try {
        // 使用与保存相同的转换逻辑，确保预览数据和保存数据类型一致
        const result = schemaTransformer.prepareSaveData(editorValue, wasStringData)

        if (!result.success) {
          message.error('数据转换失败：' + result.error)
          return
        }

        // 计算预览区域位置
        const rect = previewPlaceholderRef.current?.getBoundingClientRect()
        if (!rect) {
          message.error('无法获取预览区域位置')
          return
        }

        const position = {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        }

        // 由 Content Script 创建预览容器
        const containerId = previewContainerManager.createContainer(position)

        if (isPostMessageMode) {
          // postMessage 直连模式：发送 schema 和 containerId 给宿主
          try {
            const messageType =
              apiConfig?.messageTypes?.renderPreview ??
              DEFAULT_VALUES.apiConfig.messageTypes.renderPreview
            await sendRequestToHost(
              messageType,
              { schema: result.data, containerId },
              apiConfig?.requestTimeout ?? 5,
              apiConfig?.sourceConfig
            )
            logger.log('预览渲染请求已发送（postMessage 模式）')
          } catch (error: any) {
            message.error('预览渲染失败：' + error.message)
            // 显示错误信息到容器
            const container = document.getElementById(containerId)
            if (container) {
              container.innerHTML = `
              <div style="color: red; padding: 20px;">
                <div style="font-weight: bold; margin-bottom: 8px;">预览渲染错误</div>
                <div style="font-size: 12px;">${error.message || '未知错误'}</div>
              </div>
            `
            }
            return
          }
        } else {
          // windowFunction 模式：通过 injected.js
          postMessageToPage({
            type: MessageType.RENDER_PREVIEW,
            payload: {
              schema: result.data,
              containerId,
              position,
            },
          })
          logger.log('预览渲染请求已发送（windowFunction 模式）')
        }

        // 如果是自动更新，显示轻量提示
        if (isAutoUpdate) {
          showLightNotification('预览已更新')
        }
      } catch (error: any) {
        message.error('JSON 格式错误：' + error.message)
      }
    },
    [
      previewEnabled,
      hasPreviewFunction,
      editorValue,
      wasStringData,
      isPostMessageMode,
      apiConfig,
      showLightNotification,
    ]
  )

  /**
   * 当预览开启时，自动渲染第一次
   * 延迟 300ms 等待 Drawer 宽度动画完成
   */
  useDeferredEffect(() => handleRenderPreview(), [handleRenderPreview], {
    delay: 300,
    enabled: previewEnabled && hasPreviewFunction,
  })

  /**
   * 自动更新预览（当开启自动更新时）
   */
  useDeferredEffect(() => handleRenderPreview(true), [editorValue, handleRenderPreview], {
    delay: previewConfig.updateDelay,
    enabled: previewEnabled && previewConfig.autoUpdate && hasPreviewFunction,
  })

  /**
   * 计算抽屉宽度
   */
  const drawerWidth = previewEnabled || isDiffMode ? '100vw' : isInRecordingMode ? '1000px' : width

  /**
   * 处理停止录制
   */
  const handleStopRecording = useCallback(() => {
    stopRecording()
  }, [stopRecording])

  /**
   * 处理进入Diff模式
   */
  const handleEnterDiffMode = useCallback(() => {
    switchFullScreenMode(FULL_SCREEN_MODE.DIFF)
  }, [switchFullScreenMode])

  /**
   * 获取需要检测/修复的内容
   * 如果当前内容是有效的 JSON 字符串，则返回字符串内部的内容
   */
  const getContentToAnalyze = useCallback(
    (value: string): { content: string; isInnerContent: boolean } => {
      // 先尝试直接解析
      try {
        const parsed = JSON.parse(value)
        // 如果是字符串类型，检查字符串内部的内容
        if (typeof parsed === 'string') {
          return { content: parsed, isInnerContent: true }
        }
        // 其他有效 JSON，返回原内容
        return { content: value, isInnerContent: false }
      } catch {
        // 解析失败，返回原内容
        return { content: value, isInnerContent: false }
      }
    },
    []
  )

  /**
   * 定位 JSON 错误
   * 智能判断：支持检测字符串内部的 JSON 错误
   * 如果是字符串内部的错误，自动去转义后跳转
   * 点击按钮显示错误提示，点击提示可关闭
   */
  const handleLocateError = useCallback(() => {
    const { content, isInnerContent } = getContentToAnalyze(editorValue)
    const errorInfo = getJsonError(content)

    if (errorInfo) {
      // 使用完整消息，包含 codeFrame
      const errorMessage = errorInfo.message || `第 ${errorInfo.line} 行, 第 ${errorInfo.column} 列`

      if (isInnerContent) {
        // 字符串内部的错误，自动去转义后跳转
        const result = schemaTransformer.unescapeJson(editorValue)
        if (result.success && result.data) {
          updateEditorContent(result.data, { markModified: true })
          // 延迟显示错误，等待编辑器内容更新
          setTimeout(() => {
            editorRef.current?.showErrorWidget(errorInfo.line, errorInfo.column, errorMessage)
          }, 50)
        } else {
          // 去转义失败，只提示错误位置
          message.warning(
            `字符串内部的 JSON 有错误（第 ${errorInfo.line} 行, 第 ${errorInfo.column} 列）`
          )
        }
      } else {
        // 直接显示错误提示
        editorRef.current?.showErrorWidget(errorInfo.line, errorInfo.column, errorMessage)
      }
    } else {
      showLightNotification('JSON 格式正确，无语法错误')
    }
  }, [editorValue, getContentToAnalyze, updateEditorContent, message, showLightNotification])

  /**
   * 修复 JSON
   * 智能判断：支持修复字符串内部的 JSON
   * 不立即更新编辑器，进入 diff 模式让用户确认
   */
  const handleRepairJson = useCallback(() => {
    const { content, isInnerContent } = getContentToAnalyze(editorValue)
    const result = repairJson(content)

    if (result.success && result.repaired) {
      // 保存修复前的原始内容
      setRepairOriginalValue(editorValue)

      // 计算修复后的内容
      const repairedContent = isInnerContent ? JSON.stringify(result.repaired) : result.repaired

      // 保存待确认的修复内容（不立即应用）
      setPendingRepairedValue(repairedContent)

      // 进入 diff 模式让用户确认
      switchFullScreenMode(FULL_SCREEN_MODE.DIFF)
      showLightNotification(
        isInnerContent ? '字符串内部的 JSON 已修复，请确认是否应用' : 'JSON 已修复，请确认是否应用'
      )
    } else {
      // 检查是否已经是有效 JSON
      try {
        JSON.parse(content)
        message.success('JSON 格式正确，无需修复')
      } catch {
        message.error(result.error || '无法修复此 JSON，请手动检查')
      }
    }
  }, [editorValue, getContentToAnalyze, switchFullScreenMode, showLightNotification, message])

  /**
   * 应用修复
   */
  const handleApplyRepair = useCallback(() => {
    if (pendingRepairedValue) {
      updateEditorContent(pendingRepairedValue, { markModified: true })
      showLightNotification('已应用修复')
    }
    // 清理状态并退出 diff 模式
    setPendingRepairedValue('')
    setRepairOriginalValue('')
    switchFullScreenMode(FULL_SCREEN_MODE.NONE)
  }, [pendingRepairedValue, updateEditorContent, showLightNotification, switchFullScreenMode])

  /**
   * 取消修复
   */
  const handleCancelRepair = useCallback(() => {
    // 清理状态并退出 diff 模式
    setPendingRepairedValue('')
    setRepairOriginalValue('')
    switchFullScreenMode(FULL_SCREEN_MODE.NONE)
    showLightNotification('已取消修复')
  }, [switchFullScreenMode, showLightNotification])

  /**
   * 处理返回编辑模式（从Diff模式）
   */
  const handleBackToEditor = useCallback(() => {
    switchFullScreenMode(FULL_SCREEN_MODE.NONE)
    // 清除修复对比的原始值
    setRepairOriginalValue('')
  }, [switchFullScreenMode])

  /**
   * 处理选择快照
   */
  const handleSelectSnapshot = useCallback(
    (id: number) => {
      selectSnapshot(id)
    },
    [selectSnapshot]
  )

  /**
   * 处理编辑器挂载
   */
  // const handleEditorDidMount = () => {
  // Monaco Editor 挂载完成
  // }

  return (
    <>
      <Drawer
        title={
          <DrawerTitleContainer>
            <DrawerTitleLeft>
              <span>Schema Editor</span>
              {toolbarButtons.draft && draftAutoSaveStatus === 'success' && (
                <DraftAutoSaveSuccess>✓ 草稿已自动保存</DraftAutoSaveSuccess>
              )}
              {toolbarButtons.draft && showDraftNotification && (
                <DraftNotification>💾 检测到草稿</DraftNotification>
              )}
            </DrawerTitleLeft>
            <DrawerTitleActions>
              <Space size="small">
                {/* 导入导出按钮 */}
                {toolbarButtons.importExport && (
                  <>
                    <Upload
                      accept=".json"
                      showUploadList={false}
                      beforeUpload={handleImport}
                      maxCount={1}
                    >
                      <Tooltip title="导入">
                        <Button icon={<UploadOutlined />} size="small" type="text" />
                      </Tooltip>
                    </Upload>
                    <Tooltip title="导出">
                      <Button
                        icon={<DownloadOutlined />}
                        size="small"
                        type="text"
                        onClick={handleExport}
                        disabled={!canParse}
                      />
                    </Tooltip>
                  </>
                )}

                {/* 历史按钮 */}
                {toolbarButtons.history && (
                  <HistoryDropdown
                    history={history}
                    currentIndex={currentIndex}
                    onLoadVersion={loadHistoryVersion}
                    onClearHistory={clearHistory}
                    disabled={!hasHistory}
                  />
                )}

                {toolbarButtons.preview && (
                  <Tooltip
                    title={
                      !hasPreviewFunction
                        ? '页面未提供预览函数'
                        : previewEnabled
                          ? '关闭预览'
                          : '开启预览'
                    }
                  >
                    <Button
                      size="small"
                      type={previewEnabled ? 'primary' : 'text'}
                      icon={previewEnabled ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                      onClick={handleTogglePreview}
                      disabled={!hasPreviewFunction}
                    />
                  </Tooltip>
                )}

                {toolbarButtons.draft && hasDraft && (
                  <>
                    <Tooltip title="加载草稿">
                      <Button
                        size="small"
                        type="text"
                        icon={<FileTextOutlined />}
                        onClick={handleLoadDraft}
                      />
                    </Tooltip>
                    <Tooltip title="删除草稿">
                      <Button
                        size="small"
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={handleDeleteDraft}
                      />
                    </Tooltip>
                  </>
                )}
                {toolbarButtons.favorites && (
                  <>
                    <Tooltip title="添加收藏">
                      <Button
                        size="small"
                        type="text"
                        icon={<StarOutlined />}
                        onClick={handleOpenAddFavorite}
                      />
                    </Tooltip>
                    <Tooltip title="浏览收藏">
                      <Button
                        size="small"
                        type="text"
                        icon={<FolderOpenOutlined />}
                        onClick={handleOpenFavorites}
                      />
                    </Tooltip>
                  </>
                )}
                <Dropdown
                  menu={{
                    items: EDITOR_THEME_OPTIONS.map((t) => ({
                      key: t.value,
                      label: t.label,
                      onClick: () => {
                        setEditorTheme(t.value)
                        storage.setEditorTheme(t.value)
                      },
                    })),
                    selectedKeys: [editorTheme],
                  }}
                  trigger={['click']}
                  getPopupContainer={(node) => node.parentNode as HTMLElement}
                >
                  <Tooltip title="切换主题">
                    <Button size="small" type="text" icon={<BgColorsOutlined />} />
                  </Tooltip>
                </Dropdown>
              </Space>
            </DrawerTitleActions>
          </DrawerTitleContainer>
        }
        placement="right"
        width={drawerWidth}
        mask={!previewEnabled}
        onClose={handleClose}
        open={open}
        afterOpenChange={handleAfterOpenChange}
        destroyOnClose={false}
        closable={true}
        closeIcon={true}
        push={false}
        getContainer={getPortalContainer}
        styles={{
          body: { padding: 0 },
          header: { position: 'relative' },
        }}
        footer={
          <DrawerFooter>
            <Space>
              {toolbarButtons.draft && (
                <Button onClick={handleSaveDraft} size="small">
                  保存草稿
                </Button>
              )}
              <Button onClick={onClose} size="small">
                关闭
              </Button>
              <Button
                type="primary"
                size="small"
                onClick={async () => {
                  try {
                    await handleSave()
                    // 保存成功后记录特殊版本 - 临时禁用
                    // recordSpecialVersion(HistoryEntryType.Save, '保存版本')
                  } catch (error: any) {
                    message.error(error.message || '保存失败')
                  }
                }}
                loading={isSaving}
                disabled={!isModified}
              >
                {isSaving ? '保存中...' : '保存'}
              </Button>
            </Space>
          </DrawerFooter>
        }
      >
        <DrawerContentContainer>
          <ThemeProvider theme={editorThemeVars}>
            {/* Diff模式（独立于录制模式） */}
            {isDiffMode ? (
              <FullScreenModeWrapper key="diff" $animate={isFullScreenTransition}>
                {/* Diff 模式工具栏：对比模式 Segmented + 对比按钮 */}
                <DrawerToolbar
                  attributes={attributes}
                  contentType={contentType}
                  canParse={canParse}
                  toolbarButtons={toolbarButtons}
                  isDiffMode={true}
                  diffDisplayMode={diffDisplayMode}
                  onDiffDisplayModeChange={setDiffDisplayMode}
                  onFormat={handleFormat}
                  onEscape={handleEscape}
                  onUnescape={handleUnescape}
                  onCompact={handleCompact}
                  onParse={handleParse}
                  onSegmentChange={handleSegmentChange}
                  onExitDiffMode={handleBackToEditor}
                  hasPendingRepair={!!pendingRepairedValue}
                  onApplyRepair={handleApplyRepair}
                  onCancelRepair={handleCancelRepair}
                />
                <SchemaDiffView
                  snapshots={
                    isInRecordingMode
                      ? snapshots
                      : [
                          {
                            id: 1,
                            content: repairOriginalValue || originalValue,
                            timestamp: 0,
                          },
                          {
                            id: 2,
                            // 如果有待确认的修复内容，使用它；否则使用当前编辑器值
                            content: pendingRepairedValue || editorValue,
                            timestamp: 1,
                          },
                        ]
                  }
                  displayMode={diffDisplayMode}
                  theme={editorTheme}
                />
              </FullScreenModeWrapper>
            ) : isInRecordingMode ? (
              // 录制模式：左侧面板 + 右侧编辑器
              <RecordingPanel
                isRecording={isRecording}
                snapshots={snapshots}
                selectedSnapshotId={selectedSnapshotId}
                onStopRecording={handleStopRecording}
                onSelectSnapshot={handleSelectSnapshot}
                onEnterDiffMode={handleEnterDiffMode}
              >
                <DrawerToolbar
                  attributes={attributes}
                  contentType={contentType}
                  canParse={canParse}
                  toolbarButtons={toolbarButtons}
                  previewEnabled={previewEnabled}
                  isRecording={isRecording}
                  onFormat={handleFormat}
                  onEscape={handleEscape}
                  onUnescape={handleUnescape}
                  onCompact={handleCompact}
                  onParse={handleParse}
                  onSegmentChange={handleSegmentChange}
                  onRenderPreview={handleRenderPreview}
                  onLocateError={handleLocateError}
                  onRepairJson={handleRepairJson}
                />
                <EditorContainer>
                  {lightNotifications.map((notification, index) => (
                    <LightSuccessNotification
                      key={notification.id}
                      style={{ top: `${16 + index * 48}px` }}
                    >
                      ✓ {notification.text}
                    </LightSuccessNotification>
                  ))}
                  <CodeMirrorEditor
                    ref={editorRef}
                    height="100%"
                    defaultValue={editorValue}
                    onChange={handleEditorChange}
                    theme={editorTheme}
                    placeholder="在此输入 JSON Schema..."
                    enableAstHints={enableAstTypeHints}
                    isAstContent={() => contentType === ContentType.Ast}
                  />
                </EditorContainer>
              </RecordingPanel>
            ) : previewEnabled ? (
              // 预览模式：工具栏在顶部，预览和编辑器并排
              <FullScreenModeWrapper key="preview" $animate={isFullScreenTransition}>
                <PreviewModeContainer>
                  {/* 工具栏横跨整个宽度 */}
                  <DrawerToolbar
                    attributes={attributes}
                    contentType={contentType}
                    canParse={canParse}
                    toolbarButtons={toolbarButtons}
                    previewEnabled={previewEnabled}
                    showDiffButton={true}
                    onFormat={handleFormat}
                    onEscape={handleEscape}
                    onUnescape={handleUnescape}
                    onCompact={handleCompact}
                    onParse={handleParse}
                    onSegmentChange={handleSegmentChange}
                    onRenderPreview={handleRenderPreview}
                    onEnterDiffMode={handleEnterDiffMode}
                    onLocateError={handleLocateError}
                    onRepairJson={handleRepairJson}
                  />

                  {/* 预览区域和编辑器并排 */}
                  <PreviewEditorRow ref={previewContainerRef}>
                    {/* 左侧预览占位区域 */}
                    <PreviewPlaceholder ref={previewPlaceholderRef} $width={previewWidth} />

                    {/* 拖拽时的蒙层提示 */}
                    {isDragging && (
                      <DragOverlay $width={previewWidth}>
                        <DragWidthIndicator>{Math.round(previewWidth)}%</DragWidthIndicator>
                        <DragHintText>松开鼠标完成调整</DragHintText>
                      </DragOverlay>
                    )}

                    {/* 可拖拽的分隔条 */}
                    <PreviewResizer $isDragging={isDragging} onMouseDown={handleResizeStart} />

                    {/* 右侧编辑器（不包含工具栏） */}
                    <PreviewEditorContainer>
                      {lightNotifications.map((notification, index) => (
                        <LightSuccessNotification
                          key={notification.id}
                          style={{ top: `${16 + index * 48}px` }}
                        >
                          ✓ {notification.text}
                        </LightSuccessNotification>
                      ))}
                      <CodeMirrorEditor
                        ref={editorRef}
                        height="100%"
                        defaultValue={editorValue}
                        onChange={handleEditorChange}
                        theme={editorTheme}
                        placeholder="在此输入 JSON Schema..."
                        enableAstHints={enableAstTypeHints}
                        isAstContent={() => contentType === ContentType.Ast}
                      />
                    </PreviewEditorContainer>
                  </PreviewEditorRow>
                </PreviewModeContainer>
              </FullScreenModeWrapper>
            ) : (
              // 普通编辑模式
              <>
                <DrawerToolbar
                  attributes={attributes}
                  contentType={contentType}
                  canParse={canParse}
                  toolbarButtons={toolbarButtons}
                  previewEnabled={previewEnabled}
                  showDiffButton={true}
                  onFormat={handleFormat}
                  onEscape={handleEscape}
                  onUnescape={handleUnescape}
                  onCompact={handleCompact}
                  onParse={handleParse}
                  onSegmentChange={handleSegmentChange}
                  onRenderPreview={handleRenderPreview}
                  onEnterDiffMode={handleEnterDiffMode}
                  onLocateError={handleLocateError}
                  onRepairJson={handleRepairJson}
                />

                <EditorContainer>
                  {lightNotifications.map((notification, index) => (
                    <LightSuccessNotification
                      key={notification.id}
                      style={{ top: `${16 + index * 48}px` }}
                    >
                      ✓ {notification.text}
                    </LightSuccessNotification>
                  ))}
                  <CodeMirrorEditor
                    ref={editorRef}
                    height="100%"
                    defaultValue={editorValue}
                    onChange={handleEditorChange}
                    theme={editorTheme}
                    placeholder="在此输入 JSON Schema..."
                    enableAstHints={enableAstTypeHints}
                    isAstContent={() => contentType === ContentType.Ast}
                  />
                </EditorContainer>
              </>
            )}
          </ThemeProvider>
        </DrawerContentContainer>
      </Drawer>

      <FavoritesManager
        addFavoriteModalVisible={addFavoriteModalVisible}
        favoriteNameInput={favoriteNameInput}
        favoritesModalVisible={favoritesModalVisible}
        favoritesList={favoritesList}
        editModalVisible={editModalVisible}
        editingFavoriteId={editingFavoriteId}
        editingName={editingName}
        editingContent={editingContent}
        onAddFavoriteInputChange={setFavoriteNameInput}
        onAddFavorite={handleAddFavorite}
        onCloseAddFavoriteModal={closeAddFavoriteModal}
        onCloseFavoritesModal={closeFavoritesModal}
        onEditFavorite={handleEditFavorite}
        onApplyFavorite={handleApplyFavorite}
        onDeleteFavorite={handleDeleteFavorite}
        onSaveEdit={handleSaveEdit}
        onCloseEditModal={closeEditModal}
      />
    </>
  )
}
