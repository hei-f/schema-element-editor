import {
  PREVIEW_CONTAINER_ID,
  previewContainerManager,
} from '@/core/content/core/preview-container'
import { DEFAULT_VALUES } from '@/shared/constants/defaults'
import {
  COMMUNICATION_MODE,
  FULL_SCREEN_MODE,
  type FullScreenMode,
} from '@/shared/constants/ui-modes'
import { FavoritesManager } from '@/features/favorites/components/FavoritesManager'
import { EDITOR_THEME_OPTIONS } from '@/shared/constants/editor-themes'
import type { ElementAttributes, HistoryEntry, SchemaDrawerConfig } from '@/shared/types'
import { ContentType, HistoryEntryType, MessageType } from '@/shared/types'
import { postMessageToPage, sendRequestToHost } from '@/shared/utils/browser/message'
import { storage } from '@/shared/utils/browser/storage'
import { logger } from '@/shared/utils/logger'
import { shadowRootManager } from '@/shared/utils/shadow-root-manager'
import { parseMarkdownString } from '@/shared/utils/schema/transformers'
import { useFullScreenMode } from '../hooks/useFullScreenMode'
import { useResizer } from '../hooks/useResizer'
import { useSchemaRecording } from '../hooks/useSchemaRecording'
import { RecordingPanel } from './RecordingPanel'
import { SchemaDiffView } from './SchemaDiffView'
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
import { Button, Drawer, Dropdown, Space, Tooltip, Upload, message } from 'antd'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useDeferredEffect } from '@/shared/hooks/useDeferredEffect'
import { useContentDetection } from '../hooks/useContentDetection'
import { useDraftManagement } from '../hooks/useDraftManagement'
import { useEditHistory } from '../hooks/useEditHistory'
import { useFavoritesManagement } from '../hooks/useFavoritesManagement'
import { useFileImportExport } from '../hooks/useFileImportExport'
import { useLightNotifications } from '../hooks/useLightNotifications'
import { useSchemaSave } from '../hooks/useSchemaSave'
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
  PreviewEditorContainer,
  PreviewEditorRow,
  PreviewModeContainer,
  PreviewPlaceholder,
  PreviewResizer,
} from '../styles/drawer.styles'
import { EditorContainer } from '../styles/editor.styles'
import { LightSuccessNotification } from '../styles/notifications.styles'
import type { CodeMirrorEditorHandle } from './CodeMirrorEditor'
import { CodeMirrorEditor } from './CodeMirrorEditor'
import { DrawerToolbar } from './DrawerToolbar'
import { HistoryDropdown } from './HistoryDropdown'

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

  // 编辑器主题（支持运行时切换，初始值从 config 获取）
  const [editorTheme, setEditorTheme] = useState(initialEditorTheme)

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
  } = useFullScreenMode()

  const [previewWidth, setPreviewWidth] = useState(previewConfig.previewWidth)

  // 录制模式相关状态
  const [isInRecordingMode, setIsInRecordingMode] = useState(false)

  const paramsKey = attributes.params.join(',')
  const isFirstLoadRef = useRef(true)
  const editorRef = useRef<CodeMirrorEditorHandle>(null) // 编辑器命令式 API
  const previewPlaceholderRef = useRef<HTMLDivElement>(null)

  /** 内容类型检测 */
  const { contentType, canParse, detectContentType, debouncedDetectContent, updateContentType } =
    useContentDetection()

  //TODO-youling:CR check point
  /**
   * 处理schema变化（录制模式下更新编辑器）
   */
  const handleSchemaChangeForRecording = useCallback(
    (content: string) => {
      editorRef.current?.setValue(content)
      setEditorValue(content)
      const result = detectContentType(content)
      updateContentType(result)
    },
    [detectContentType, updateContentType]
  )

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
    onSchemaChange: handleSchemaChangeForRecording,
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
      // 1. 使用命令式 API 更新编辑器
      editorRef.current?.setValue(content)
      setEditorValue(content)
      setIsModified(true)

      // 2. 更新内容类型检测
      const result = detectContentType(content)
      updateContentType(result)

      // 3. 预览会自动更新（因为 editorValue 变化会触发现有的 useEffect）
      // 无需显式调用预览更新，保持解耦

      // 4. 显示轻量提示
      showLightNotification(`已切换到: ${entry.description || '历史版本'}`)
    },
    [detectContentType, updateContentType, showLightNotification]
  )

  /** 导入成功回调 */
  const handleImportSuccess = useCallback(
    (content: string, metadata?: ExportMetadata) => {
      // 1. 使用命令式 API 更新编辑器
      editorRef.current?.setValue(content)
      setEditorValue(content)
      setIsModified(true)

      // 2. 恢复 wasStringData 状态
      if (metadata?.wasStringData !== undefined) {
        setWasStringData(metadata.wasStringData)
      }

      // 3. 触发内容类型检测
      const result = detectContentType(content)
      updateContentType(result)
    },
    [detectContentType, updateContentType]
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
      // 使用命令式 API 更新编辑器
      editorRef.current?.setValue(content)
      setEditorValue(content)
      setIsModified(true)
      const result = detectContentType(content)
      updateContentType(result)
      // 不再立即记录特殊版本，让用户编辑后自然触发 recordChange
    },
    [detectContentType, updateContentType]
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
    /* eslint-disable react-hooks/refs -- isFirstLoadRef 用于跟踪首次加载状态 */
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
  /* eslint-enable react-hooks/refs */

  /** 应用收藏内容的回调 */
  const handleApplyFavoriteContent = useCallback(
    (content: string) => {
      // 使用命令式 API 更新编辑器
      editorRef.current?.setValue(content)
      setEditorValue(content)
      setIsModified(true)
      const result = detectContentType(content)
      updateContentType(result)
      // 不再立即记录特殊版本，让用户编辑后自然触发 recordChange
    },
    [detectContentType, updateContentType]
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
        // 关闭时的清理逻辑
        document.body.style.overflow = ''

        // 重置所有模式状态（直接设置，无需调用 switchFullScreenMode，因为抽屉关闭后预览容器会随之销毁）
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
   * 当schemaData变化时，更新编辑器内容
   */
  useEffect(() => {
    const processSchemaData = () => {
      if (schemaData !== null && schemaData !== undefined && open) {
        try {
          // 录制模式下禁用自动解析，直接显示原始数据
          const shouldAutoParse = isInRecordingMode ? false : autoParseEnabled

          if (shouldAutoParse && schemaTransformer.isStringData(schemaData)) {
            setWasStringData(true)
            const elements = parseMarkdownString(schemaData)

            if (elements.length > 0) {
              const formatted = JSON.stringify(elements, null, 2)
              // 使用命令式 API 更新编辑器
              editorRef.current?.setValue(formatted)
              setEditorValue(formatted)
              setOriginalValue(formatted) // 保存原始值用于 diff
              setIsModified(false)
              const result = detectContentType(formatted)
              updateContentType(result)
            } else {
              message.warning('Markdown解析失败，显示原始字符串')
              setWasStringData(false)
              const formatted = JSON.stringify(schemaData, null, 2)
              // 使用命令式 API 更新编辑器
              editorRef.current?.setValue(formatted)
              setEditorValue(formatted)
              setOriginalValue(formatted) // 保存原始值用于 diff
              setIsModified(false)
              const result = detectContentType(formatted)
              updateContentType(result)
            }
          } else if (isInRecordingMode && typeof schemaData === 'string') {
            // 录制模式下，字符串直接显示，不经过 JSON.stringify
            // 这样换行符 \n 会正确显示为换行，与录制过程中的数据格式一致
            setWasStringData(true)
            editorRef.current?.setValue(schemaData)
            setEditorValue(schemaData)
            setOriginalValue(schemaData) // 保存原始值用于 diff
            setIsModified(false)
            const result = detectContentType(schemaData)
            updateContentType(result)
          } else {
            setWasStringData(false)
            const formatted = JSON.stringify(schemaData, null, 2)
            // 使用命令式 API 更新编辑器
            editorRef.current?.setValue(formatted)
            setEditorValue(formatted)
            setOriginalValue(formatted) // 保存原始值用于 diff
            setIsModified(false)
            const result = detectContentType(formatted)
            updateContentType(result)
          }

          setTimeout(() => {
            isFirstLoadRef.current = false
          }, 100)
        } catch (error) {
          logger.error('处理Schema数据失败:', error)
          setWasStringData(false)
          const formatted = JSON.stringify(schemaData)
          // 使用命令式 API 更新编辑器
          editorRef.current?.setValue(formatted)
          setEditorValue(formatted)
          setOriginalValue(formatted) // 保存原始值用于 diff
          setIsModified(false)
          const result = detectContentType(formatted)
          updateContentType(result)

          setTimeout(() => {
            isFirstLoadRef.current = false
          }, 100)
        }
      }
    }

    processSchemaData()
  }, [schemaData, open, detectContentType, updateContentType, autoParseEnabled, isInRecordingMode])

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
   */
  const handleFormat = () => {
    const result = schemaTransformer.formatJson(editorValue)

    if (result.success && result.data) {
      editorRef.current?.setValue(result.data)
      setEditorValue(result.data)
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
      editorRef.current?.setValue(result.data)
      setEditorValue(result.data)
      setIsModified(true)
      showLightNotification('转义成功')
      const detectResult = detectContentType(result.data)
      updateContentType(detectResult)
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
      editorRef.current?.setValue(result.data)
      setEditorValue(result.data)
      setIsModified(true)
      showLightNotification('去转义成功')
      const detectResult = detectContentType(result.data)
      updateContentType(detectResult)
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
      editorRef.current?.setValue(result.data)
      setEditorValue(result.data)
      setIsModified(true)
      showLightNotification('压缩成功')
      const detectResult = detectContentType(result.data)
      updateContentType(detectResult)
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
      editorRef.current?.setValue(result.data)
      setEditorValue(result.data)
      setIsModified(true)
      const detectResult = detectContentType(result.data)
      updateContentType(detectResult)

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
      // 使用命令式 API 更新编辑器
      editorRef.current?.setValue(result.data)
      setEditorValue(result.data)
      setIsModified(true)
      showLightNotification('转换为AST成功')
      const detectResult = detectContentType(result.data)
      updateContentType(detectResult)
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
      // 使用命令式 API 更新编辑器
      editorRef.current?.setValue(result.data)
      setEditorValue(result.data)
      setIsModified(true)
      showLightNotification('转换为RawString成功')
      const detectResult = detectContentType(result.data)
      updateContentType(detectResult)
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

  /** 是否为 postMessage 通信模式 */
  const isPostMessageMode =
    (apiConfig?.communicationMode ?? DEFAULT_VALUES.apiConfig.communicationMode) ===
    COMMUNICATION_MODE.POST_MESSAGE

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
   * 清理预览容器（纯清理，不改变状态）
   */
  const cleanupPreviewContainer = useCallback(async () => {
    if (isPostMessageMode) {
      const messageType =
        apiConfig?.messageTypes?.cleanupPreview ??
        DEFAULT_VALUES.apiConfig.messageTypes.cleanupPreview
      // 清理请求失败不影响后续逻辑
      await sendRequestToHost(
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
    previewContainerManager.clear()
    logger.log('预览容器已清理')
  }, [apiConfig, isPostMessageMode])

  /**
   * 切换全屏模式
   * 自动处理模式切换时的清理逻辑
   */
  const switchFullScreenMode = useCallback(
    (newMode: FullScreenMode) => {
      setFullScreenMode((prevMode) => {
        // 退出预览模式时清理预览容器
        if (prevMode === FULL_SCREEN_MODE.PREVIEW && newMode !== FULL_SCREEN_MODE.PREVIEW) {
          cleanupPreviewContainer()
        }
        // 未来可扩展：其他模式的清理逻辑
        return newMode
      })
    },
    [cleanupPreviewContainer]
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
   * 处理返回编辑模式（从Diff模式）
   */
  const handleBackToEditor = useCallback(() => {
    switchFullScreenMode(FULL_SCREEN_MODE.NONE)
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
        onClose={onClose}
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
          {/* Diff模式（独立于录制模式） */}
          {isDiffMode ? (
            <SchemaDiffView
              snapshots={
                isInRecordingMode
                  ? snapshots
                  : [
                      { id: 1, content: originalValue, timestamp: 0 },
                      { id: 2, content: editorValue, timestamp: 1 },
                    ]
              }
              onBackToEditor={handleBackToEditor}
            />
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
